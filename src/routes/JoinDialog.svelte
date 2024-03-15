<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	let gameId: string = '';
	export let joinRoom: (gameId: string) => void;
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Join Game</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Enter Game Id</Dialog.Title>
			<Dialog.Description>Enter Game Id shared by your friend to join the game.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Input id="name" class="col-span-3" bind:value={gameId} />
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" disabled={gameId === ''} on:click={() => joinRoom(gameId)}
				>Save changes</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
