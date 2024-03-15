<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { walletStore } from '@portal-payments/wallet-adapter-core';
	import { workSpace } from '@portal-payments/wallet-adapter-anchor';
	import type { PublicKey } from '@solana/web3.js';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';

	let gameBoard: Array<Array<{ x: {} } | { o: {} } | null>>;
	let gamePda: PublicKey;
	let turn: number;
	let myTurn: boolean;
	let state: { active: {} } | { won: { winner: PublicKey } } | { tie: {} } | undefined;
	let checked: { row: number; column: number } | undefined = undefined;

	const unsubscribe = gameState.subscribe((val) => {
		gameBoard = val.gameBoard;
		gamePda = val.gamePda!;
		turn = val.turn;
		state = val.state;
		myTurn = (val.turn % 2 === 1) == val.isHost;
	});

	function play(tile: { row: number; column: number }) {
		$workSpace.program?.methods
			.play(tile)
			.accounts({
				player: $walletStore.publicKey!,
				game: gamePda
			})
			.rpc()
			.then((res) => {
				toast.success('played successfully');
			})
			.catch((err) => {
				toast.error(err);
			});
	}

	onDestroy(() => {
		unsubscribe();
	});

	$: if (state) {
		if ('won' in state) {
			toast.success('Player ' + state.won.winner.toBase58() + ' won');
		} else if ('tie' in state) {
			toast.success('Game is a tie');
		}
	}
</script>

<div class="flex flex-col items-center justify-center gap-5">
	<h1 class="text-2xl">Tic Tac Toe</h1>
	<h2>Turn: {turn}</h2>
	{#each gameBoard as row, i}
		<div class="flex gap-5">
			{#each row as cell, j}
				<button
					class="flex h-16 w-16 items-center justify-center bg-white hover:border hover:border-yellow-300"
					type="button"
					disabled={cell !== null || !myTurn}
					on:click={() => {
						if (checked && checked.row === i && checked.column === j) {
							checked = undefined;
						} else {
							checked = { row: i, column: j };
						}
					}}
				>
					{#if cell === null}
						<div class="h-8 w-8">
							{#if checked && checked.row === i && checked.column === j}
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
									><path
										fill="currentColor"
										d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
									/></svg
								>
							{/if}
						</div>
					{:else if 'x' in cell}
						<div class="h-8 w-8 rounded-full bg-white text-lg font-bold">X</div>
					{:else}
						<div class="h-8 w-8 rounded-full bg-white text-lg font-bold">O</div>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
	<Button
		type="button"
		disabled={!checked}
		on:click={() => {
			play(checked);
		}}>Submit</Button
	>
</div>
