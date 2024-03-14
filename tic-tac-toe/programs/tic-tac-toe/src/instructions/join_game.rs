use crate::state::game::*;
use anchor_lang::prelude::*;

pub fn join_game(ctx: Context<JoinGame>, player_two: Pubkey) -> Result<()> {
    ctx.accounts.game.join_game(player_two)?;
    Ok(())
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
}
