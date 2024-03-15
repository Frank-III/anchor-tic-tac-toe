use anchor_lang::prelude::*;
use instructions::*;
use state::game::Tile;

pub mod errors;
pub mod instructions;
pub mod state;

// this key needs to be changed to whatever public key is returned by "anchor keys list"
declare_id!("5sW8nwciGgc2iG8YxXKGSUsU5fxekGRYoL6br1dFX6nf");

#[program]
pub mod tic_tac_toe {
    use super::*;

    pub fn new_game(ctx: Context<NewGame>, game_id: String) -> Result<()> {
        instructions::new_game::new_game(ctx, game_id)
    }

    pub fn join_game(ctx: Context<JoinGame>, player_two: Pubkey) -> Result<()> {
        instructions::join_game::join_game(ctx, player_two)
    }

    pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
        instructions::setup_game::start_game(ctx)
    }

    pub fn play(ctx: Context<Play>, tile: Tile) -> Result<()> {
        instructions::play::play(ctx, tile)
    }

    pub fn close_game(ctx: Context<CloseGame>) -> Result<()> {
        instructions::close_game::close_game(ctx)
    }
}
