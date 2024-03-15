import * as anchor from '@coral-xyz/anchor';
import { AnchorError, Program } from '@coral-xyz/anchor';
import { TicTacToe } from '../target/types/tic_tac_toe';
import { PublicKey } from '@solana/web3.js';"@solana/web3.js";
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function play(program: Program<TicTacToe>, game, player, tile, expectedTurn, expectedGameState, expectedBoard) {
  await program.methods
    .play(tile)
    .accounts({
      player: player.publicKey,
      game
    })
    .signers(player instanceof (anchor.Wallet as any) ? [] : [player])
    .rpc();

  const gameState = await program.account.game.fetch(game);
  expect(gameState.turn).to.equal(expectedTurn);
  expect(gameState.state).to.eql(expectedGameState);
  expect(gameState.board)
    .to
    .eql(expectedBoard);
}

describe('tic-tac-toe', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TicTacToe as Program<TicTacToe>;
  const programProvider = program.provider as anchor.AnchorProvider;
  const playerTwo = anchor.web3.Keypair.generate();

  it("new game!", async () => {
    const game_id = generateRandomString(8);
    const [gamePda, gameBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), Buffer.from(game_id)],
        program.programId
      );
    console.log(gamePda)
    const playerOne = programProvider.wallet;
    await program.methods.newGame(game_id).accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).signers([]).rpc();

    let gameState = await program.account.game.fetch(gamePda);
    console.log("gameState", gameState);
  })

  it('join game!', async() => {
    const game_id = generateRandomString(8);
    const [gamePda, gameBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), Buffer.from(game_id)],
        program.programId
      );
    const playerOne = programProvider.wallet;
    // new game 
    await program.methods.newGame(game_id).accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).signers([]).rpc();
    // join game
    await program.methods
      .joinGame(playerTwo.publicKey)
      .accounts({
        game: gamePda,
      })
      .rpc();

    let gameState = await program.account.game.fetch(gamePda);

    expect(gameState.players)
      .to
      .eql([playerOne.publicKey, playerTwo.publicKey]);
  });

  it('start game!', async () => {
    const game_id = generateRandomString(8);
    const [gamePda, gameBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), Buffer.from(game_id)],
        program.programId
      );
    const playerOne = programProvider.wallet;
    // new game 
    await program.methods.newGame(game_id).accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).signers([]).rpc();
    // join game
    await program.methods
      .joinGame(playerTwo.publicKey)
      .accounts({
        game: gamePda,
      })
      .rpc();

    await program.methods.startGame().accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).rpc();

    let gameState = await program.account.game.fetch(gamePda);

    expect(gameState.turn).to.equal(1);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board)
      .to
      .eql([[null,null,null],[null,null,null],[null,null,null]]);
  })

  it('player one wins!', async () => {

    const game_id = generateRandomString(8);
    const [gamePda, gameBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), Buffer.from(game_id)],
        program.programId
      );
    const playerOne = programProvider.wallet;
    await program.methods.newGame(game_id).accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).signers([]).rpc();
    // join game
    await program.methods
      .joinGame(playerTwo.publicKey)
      .accounts({
        game: gamePda,
      })
      .rpc();

    await program.methods.startGame().accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).rpc();

    let gameState = await program.account.game.fetch(gamePda);
    expect(gameState.turn).to.equal(1);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board)
      .to
      .eql([[null,null,null],[null,null,null],[null,null,null]]);

    await play(
      program,
      gamePda,
      playerOne,
      {row: 0, column: 0},
      2,
      { active: {}, },
      [
        [{x:{}},null,null],
        [null,null,null],
        [null,null,null]
      ]
    );


    try {
      await play(
        program,
        gamePda,
        playerOne, // same player in subsequent turns
        // change sth about the tx because
        // duplicate tx that come in too fast
        // after each other may get dropped
        {row: 1, column: 0},
        2,
        { active: {}, },
        [
          [{x:{}},null,null],
          [null,null,null],
          [null,null,null]
        ]
      );
      chai.assert(false, "should've failed but didn't ");
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.code).to.equal("NotPlayersTurn");
      expect(err.error.errorCode.number).to.equal(6003);
      expect(err.program.equals(program.programId)).is.true;
      // expect(err.error.comparedValues).to.deep.equal([playerTwo.publicKey, playerOne.publicKey]);
    }

    await play(
      program,
      gamePda,
      playerTwo,
      {row: 1, column: 0},
      3,
      { active: {}, },
      [
        [{x:{}},null,null],
        [{o:{}},null,null],
        [null,null,null]
      ]
    );

    await play(
      program,
      gamePda,
      playerOne,
      {row: 0, column: 1},
      4,
      { active: {}, },
      [
        [{x:{}},{x: {}},null],
        [{o:{}},null,null],
        [null,null,null]
      ]
    );

    try {
      await play(
        program,
        gamePda,
        playerTwo,
        {row: 5, column: 1}, // out of bounds row
        4,
        { active: {}, },
        [
          [{x:{}},{x: {}},null],
          [{o:{}},null,null],
          [null,null,null]
        ]
      );
      chai.assert(false, "should've failed but didn't ");
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.number).to.equal(6000);
      expect(err.error.errorCode.code).to.equal("TileOutOfBounds");
    }

    await play(
      program,
      gamePda,
      playerTwo,
      {row: 1, column: 1},
      5,
      { active: {}, },
      [
        [{x:{}},{x: {}},null],
        [{o:{}},{o:{}},null],
        [null,null,null]
      ]
    );

    try {
      await play(
        program,
        gamePda,
        playerOne,
        {row: 0, column: 0},
        5,
        { active: {}, },
        [
          [{x:{}},{x: {}},null],
          [{o:{}},{o:{}},null],
          [null,null,null]
        ]
      );
      chai.assert(false, "should've failed but didn't ");
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.number).to.equal(6001);
    }

    await play(
      program,
      gamePda,
      playerOne,
      {row: 0, column: 2},
      5,
      { won: { winner: playerOne.publicKey }, },
      [
        [{x:{}},{x: {}},{x: {}}],
        [{o:{}},{o:{}},null],
        [null,null,null]
      ]
    );

    try {
      await play(
        program,
        gamePda,
        playerOne,
        {row: 0, column: 2},
        5,
        { won: { winner: playerOne.publicKey }, },
        [
          [{x:{}},{x: {}},{x: {}}],
          [{o:{}},{o:{}},null],
          [null,null,null]
        ]
      );
      chai.assert(false, "should've failed but didn't ");
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.number).to.equal(6002);
    }
  })

  it('tie', async () => {
    const game_id = generateRandomString(8);
    const [gamePda, gameBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), Buffer.from(game_id)],
        program.programId
      );
    const playerOne = programProvider.wallet;
    await program.methods.newGame(game_id).accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).signers([]).rpc();
    // join game
    await program.methods
      .joinGame(playerTwo.publicKey)
      .accounts({
        game: gamePda,
      })
      .rpc();

    await program.methods.startGame().accounts({
      game: gamePda,
      playerOne: playerOne.publicKey,
    }).rpc();
    let gameState = await program.account.game.fetch(gamePda);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players)
      .to
      .eql([playerOne.publicKey, playerTwo.publicKey]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board)
      .to
      .eql([[null,null,null],[null,null,null],[null,null,null]]);

    await play(
      program,
      gamePda,
      playerOne,
      {row: 0, column: 0},
      2,
      { active: {}, },
      [
        [{x:{}},null,null],
        [null,null,null],
        [null,null,null]
      ]
    );

    await play(
      program,
      gamePda,
      playerTwo,
      {row: 1, column: 1},
      3,
      { active: {}, },
      [
        [{x:{}},null,null],
        [null,{o:{}},null],
        [null,null,null]
      ]
    );

    await play(
      program,
      gamePda,
      playerOne,
      {row: 2, column: 0},
      4,
      { active: {}, },
      [
        [{x:{}},null,null],
        [null,{o:{}},null],
        [{x:{}},null,null]
      ]
    );

    await play(
      program,
      gamePda,
      playerTwo,
      {row: 1, column: 0},
      5,
      { active: {}, },
      [
        [{x:{}},null,null],
        [{o:{}},{o:{}},null],
        [{x:{}},null,null]
      ]
    );

    await play(
      program,
      gamePda,
      playerOne,
      {row: 1, column: 2},
      6,
      { active: {}, },
      [
        [{x:{}},null,null],
        [{o:{}},{o:{}},{x:{}}],
        [{x:{}},null,null]
      ]
    );

    await play(
      program,
      gamePda,
      playerTwo,
      {row: 0, column: 1},
      7,
      { active: {}, },
      [
        [{x:{}},{o:{}},null],
        [{o:{}},{o:{}},{x:{}}],
        [{x:{}},null,null]
      ]
    );

    await play(
      program,
      gamePda,
      playerOne,
      {row: 2, column: 1},
      8,
      { active: {}, },
      [
        [{x:{}},{o:{}},null],
        [{o:{}},{o:{}},{x:{}}],
        [{x:{}},{x:{}},null]
      ]
    );

    await play(
      program,
      gamePda,
      playerTwo,
      {row: 2, column: 2},
      9,
      { active: {}, },
      [
        [{x:{}},{o:{}},null],
        [{o:{}},{o:{}},{x:{}}],
        [{x:{}},{x:{}},{o:{}}]
      ]
    );


    await play(
      program,
      gamePda,
      playerOne,
      {row: 0, column: 2},
      9,
      { tie: {}, },
      [
        [{x:{}},{o:{}},{x:{}}],
        [{o:{}},{o:{}},{x:{}}],
        [{x:{}},{x:{}},{o:{}}]
      ]
    );
  })
});
