import { writable } from "svelte/store";
import { PublicKey } from '@solana/web3.js';


export const gameState = writable<{
  gameId: string;
  gamePda?: PublicKey;
  players: PublicKey[];
  started: boolean;
  turn: number;
  isHost: boolean;
  gameBoard: Array<Array<{x: {}} | {o: {}} | null>>;
}>({
  gameId: "",
  players: [],
  started: false,
  turn: 0,
  gameBoard: [],
  isHost: false
});

