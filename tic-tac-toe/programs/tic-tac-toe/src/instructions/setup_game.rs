use crate::state::game::*;
use anchor_lang::prelude::*;

pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
    ctx.accounts.game.start()
}

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player_one: Signer<'info>,
}
