<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { gameState } from '$lib/stores/gameState';
	import { onDestroy } from 'svelte';
	import { walletStore } from '@portal-payments/wallet-adapter-core';
	import { workSpace } from '@portal-payments/wallet-adapter-anchor';
	import { PublicKey } from '@solana/web3.js';
	import * as borsh from '@coral-xyz/borsh';
	import { toast } from 'svelte-sonner';

	let gameId: string;
	let gamePda: PublicKey | undefined;
	let players: PublicKey[] = [];

	// Use a single subscription to handle all state updates
	const unsubscribe = gameState.subscribe(
		({ gameId: newGameId, players: newPlayers, gamePda: newGamePda }) => {
			gameId = newGameId;
			gamePda = newGamePda;
			players = newPlayers;
		}
	);

	async function startGame() {
		if (!$workSpace.program) return console.error('Program not found');
		if (!$walletStore.publicKey) return console.error('Wallet not found');
		await $workSpace.program?.methods
			.startGame()
			.accounts({
				game: gamePda,
				playerOne: players[0]
			})
			.rpc()
			.then((res) => {
				console.log('res: ', res);
				toast.success('Game started successfully');
			})
			.catch((err) => {
				toast.error(err);
			});
	}

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="flex flex-col">
	<h1>Waiting for other players to join</h1>
	<p>Share the game id with your friend to join the game.</p>
	<p>Game Id: {gameId}</p>
	{#each players as player}
		<p class="text-md">{player.toBase58()}</p>
	{/each}
	<Button disabled={players.length < 2}>Start Game</Button>
</div>
