<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { gameState } from '$lib/stores/gameState';
	import { onDestroy, onMount } from 'svelte';
	import { walletStore } from '@portal-payments/wallet-adapter-core';
	import { workSpace } from '@portal-payments/wallet-adapter-anchor';
	import { type PublicKey } from '@solana/web3.js';
	import * as borsh from '@coral-xyz/borsh';
	import { toast } from 'svelte-sonner';

	let gameId: string;
	let gamePda: PublicKey | undefined;
	let players: PublicKey[] = [];

	// Use a single subscription to handle all state updates
	const unsubscribe = gameState.subscribe(
		({ gameId: newGameId, players: newPlayers, gamePda: newGamePda, state: newState }) => {
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

	onMount(async () => {
		await $workSpace.program?.account.game.fetch($gameState.gamePda!).then((res: any) => {
			gameState.update((val) => ({
				...val,
				state: res.state,
				players: res.players,
				gameBoard: res.board,
				turn: res.turn
			}));
		});
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="flex flex-col">
	<h1>Waiting for other players to join</h1>
	<p>Share the game id with your friend to join the game.</p>
	<p>Game Id: {gameId}</p>
	{#each players as player}
		{#if player.toBase58() !== '11111111111111111111111111111111'}
			<p class="text-md">{player.toBase58()}</p>
		{/if}
	{/each}
	{#if $gameState.isHost}
		<Button disabled={players.length < 2} on:click={startGame}>Start Game</Button>
	{/if}
</div>
