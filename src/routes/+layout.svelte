<script lang="ts">
	import { onMount } from 'svelte';
	import { clusterApiUrl } from '@solana/web3.js';
	import { WalletProvider } from '@aztemi/svelte-on-solana-wallet-adapter-ui';
	import { AnchorConnectionProvider } from '@aztemi/svelte-on-solana-wallet-adapter-anchor';
	import idl from '../../tic-tac-toe/target/idl/tic_tac_toe.json';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet');

	let wallets;

	onMount(async () => {
		const { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } = await import(
			'@solana/wallet-adapter-wallets'
		);

		const walletsMap = [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
			new TorusWalletAdapter()
		];

		wallets = walletsMap;
	});
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider {network} {idl} />
<div>
	<slot />
</div>
