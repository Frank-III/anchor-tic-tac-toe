use crate::state::game::*;
use anchor_lang::{prelude::*, solana_program::instruction};

pub fn new_game(ctx: Context<NewGame>, game_id: String) -> Result<()> {
    ctx.accounts.game.new_game(ctx.accounts.player_one.key())?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct NewGame<'info> {
    #[account(init, payer = player_one, seeds = [b"game", game_id.as_bytes()], bump, space = Game::MAXIMUM_SIZE + 8)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_one: Signer<'info>,
    pub system_program: Program<'info, System>,
}
