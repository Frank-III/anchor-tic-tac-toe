use crate::state::game::*;
use anchor_lang::prelude::*;

pub fn close_game(ctx: Context<CloseGame>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct CloseGame<'info> {
    #[account(mut, close = player_one)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_one: Signer<'info>,
    pub system_program: Program<'info, System>,
}
