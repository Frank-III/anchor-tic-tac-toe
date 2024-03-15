<script lang="ts">
	import { walletStore } from '@portal-payments/wallet-adapter-core';
	import { workSpace } from '@portal-payments/wallet-adapter-anchor';
	import { gameState } from '$lib/stores/gameState';
	import { generateRandomString } from '$lib/utils.js';
	import { PublicKey } from '@solana/web3.js';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import JoinDialog from './JoinDialog.svelte';

	function newGame() {
		const gameId = generateRandomString(8);
		if (!$workSpace.program) return console.error('Program not found');
		if (!$walletStore.publicKey) return console.error('Wallet not found');
		const [gamePda, gameBump] = PublicKey.findProgramAddressSync(
			[Buffer.from('game'), Buffer.from(gameId)],
			$workSpace.program?.programId
		);
		$workSpace.program?.methods
			.newGame(gameId)
			.accounts({
				game: gamePda,
				playerOne: $walletStore.publicKey!
			})
			.rpc()
			.then((res) => {
				console.log('res: ', res);
				gameState.update((val) => ({
					...val,
					// players: [...val.players, $walletStore.publicKey!],
					gameId: gameId,
					isHost: true
				}));
				toast.success('Game created successfully with gameId: ' + gameId);
			})
			.catch((err) => {
				toast.error(err);
			});
	}

	function joinGame(gameId: string) {
		if (!$workSpace.program) return console.error('Program not found');
		if (!$walletStore.publicKey) return console.error('Wallet not found');
		const [gamePda, gameBump] = PublicKey.findProgramAddressSync(
			[Buffer.from('game'), Buffer.from(gameId)],
			$workSpace.program?.programId
		);
		$workSpace.program?.methods
			.joinGame($walletStore.publicKey)
			.accounts({
				game: gamePda
			})
			.rpc()
			.then((res) => {
				gameState.update((val) => ({ ...val, gameId: gameId, gamePda: gamePda }));
				toast.success('Join Game successfully with gameId: ' + gameId);
				console.log('res: ', res);
			})
			.catch((err) => {
				toast.error(err);
			});
	}
</script>

<div class="flex flex-row gap-5">
	<Button on:click={newGame}>New Game</Button>
	<JoinDialog joinRoom={joinGame} />
</div>
