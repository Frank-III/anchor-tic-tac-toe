<script lang="ts">
	import '../app.pcss';
	import { onMount } from 'svelte';
	import { clusterApiUrl } from '@solana/web3.js';
	import { WalletProvider } from '@portal-payments/wallet-adapter-ui';
	import { AnchorConnectionProvider } from '@portal-payments/wallet-adapter-anchor';
	import idl from '$lib/tic_tac_toe.json';
	import { Toaster } from '$lib/components/ui/sonner';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet');

	let wallets: any[];

	onMount(async () => {
		const { PhantomWalletAdapter, SolflareWalletAdapter } = await import(
			'@solana/wallet-adapter-wallets'
		);

		const walletsMap = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

		wallets = walletsMap;
	});
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect></WalletProvider>
<AnchorConnectionProvider {network} {idl}></AnchorConnectionProvider>
<div>
	<slot />
</div>

<Toaster />
