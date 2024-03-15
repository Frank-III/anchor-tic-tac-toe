<script lang="ts">
	import { WalletButton } from '@portal-payments/wallet-adapter-ui';
	import { walletStore } from '@portal-payments/wallet-adapter-core';
	import { workSpace } from '@portal-payments/wallet-adapter-anchor';
	import { fly } from 'svelte/transition';
	import { gameState } from '$lib/stores/gameState';
	import { toast } from 'svelte-sonner';
	import NotBegin from './NotBegin.svelte';
	import Waiting from './Waiting.svelte';
	import { PublicKey } from '@solana/web3.js';
	import { onDestroy } from 'svelte';
	import GameBoard from './GameBoard.svelte';
	import { Button } from '$lib/components/ui/button';

	// let value;
	let gameId: string;
	let gamePda: PublicKey | undefined;
	let gameSub: number;
	let state: { active: {} } | { won: { winner: PublicKey } } | { tie: {} } | undefined;
	let isHost: boolean;

	$: if (gameId && $walletStore.publicKey && $workSpace.program) {
		const [gamePda] = PublicKey.findProgramAddressSync(
			[Buffer.from('game'), Buffer.from(gameId)],
			$workSpace.program?.programId
		);
		gameState.update((val) => ({ ...val, gamePda: gamePda }));
	}

	$: if (gameId && gamePda && $walletStore.publicKey && $workSpace.program) {
		gameSub = $workSpace.connection.onAccountChange(gamePda, async (updateInfo, context) => {
			await $workSpace.program?.account.game.fetch(gamePda!).then((res: any) => {
				console.log(res);
				gameState.update((val) => ({
					...val,
					state: res.state,
					players: res.players,
					gameBoard: res.board,
					turn: res.turn
				}));
			});
		});
	}

	function closeGame() {
		$workSpace.program?.methods
			.closeGame()
			.accounts({
				game: gamePda,
				playerOne: $walletStore.publicKey!
			})
			.rpc()
			.then((res) => {
				toast.success('Game closed successfully');
			})
			.catch((err) => {
				toast.error(err);
			});

		gameState.update((val) => ({
			...val,
			gameId: '',
			gamePda: undefined,
			players: [],
			gameBoard: [],
			turn: 0,
			state: undefined
		}));
	}

	const unsubscribe = gameState.subscribe((val) => {
		gameId = val.gameId;
		gamePda = val.gamePda;
		state = val.state;
		isHost = val.isHost;
	});

	onDestroy(() => {
		unsubscribe();
		if (gameSub) {
			$workSpace.connection.removeAccountChangeListener(gameSub);
		}
	});
</script>

<div class="wrapper-app h-[100vh] w-full">
	<div class="title absolute top-0 flex h-[60px] flex-row items-center justify-center">
		<h1>Solana Tic Tac Toe</h1>
	</div>

	<div class="absolute right-3 top-3 flex flex-row gap-5">
		{#if isHost && state && ('won' in state || 'tie' in state)}
			<Button on:click={() => {}}>Home</Button>
		{/if}
		<WalletButton />
	</div>

	{#if $walletStore?.connected}
		<div class="wrapper-content flex h-full w-full flex-col items-center justify-center">
			<p class="warning">You are connected to DevNet!</p>
			{#if !$gameState.gameId}
				<NotBegin />
			{:else if $gameState.gameId && $gameState.turn === 0}
				<Waiting />
			{:else}
				<GameBoard />
			{/if}
		</div>
	{:else}
		<p class="warning">You are not connected...</p>
	{/if}
</div>

<style>
</style>
