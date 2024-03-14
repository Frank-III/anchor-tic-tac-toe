use crate::state::game::*;
use anchor_lang::prelude::*;

pub fn new_game(ctx: Context<NewGame>) -> Result<()> {
    ctx.accounts.game.new_game(ctx.accounts.player_one.key())?;
    Ok(())
}

#[derive(Accounts)]
pub struct NewGame<'info> {
    #[account(init, payer = player_one, space = Game::MAXIMUM_SIZE + 8)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_one: Signer<'info>,
    pub system_program: Program<'info, System>,
}
