<script lang="ts">
	import { gameState } from '$lib/stores/gameState';
	import { onDestroy } from 'svelte';

	let gameBoard: Array<Array<{ x: {} } | { o: {} } | null>>;
	let myTurn: boolean;

	const subscribe = gameState.subscribe((val) => {
		gameBoard = val.gameBoard;
		myTurn = val.turn % 2 === 1 && val.isHost;
	});

	function play({ row, col }: { row: number; col: number }) {}

	onDestroy(() => {
		subscribe();
	});
</script>

<div>
	{#each gameBoard as row, i}
		<div class="flex">
			{#each row as cell, j}
				<button
					class="flex h-16 w-16 items-center justify-center border-2 border-black"
					type="button"
					disabled={cell !== null || !myTurn}
					on:click={() => play({ row: i, col: j })}
				>
					{#if cell === null}
						<div class="h-8 w-8"></div>
					{:else if cell.x}
						<div class="h-8 w-8 rounded-full bg-black">X</div>
					{:else}
						<div class="h-8 w-8 rounded-full bg-white">O</div>
					{/if}
				</button>
			{/each}
		</div>
	{/each}
</div>
