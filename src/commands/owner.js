const mode = {
  name: 'mode',
  category: 'Owner',
  description: 'Set mode to public or self',
  ownerOnly: true,
  async run(ctx) {
    const next = ctx.args[0]?.toLowerCase();
    if (!['public', 'self'].includes(next)) {
      return ctx.reply(`Current mode: *${ctx.config.mode}*\nUsage: .mode public | self`);
    }
    ctx.config.mode = next;
    return ctx.reply(`✅ Mode set to *${next}*`);
  },
};

const shutdown = {
  name: 'shutdown',
  category: 'Owner',
  description: 'Stop the bot process (pm2/Docker will restart it if configured)',
  ownerOnly: true,
  async run(ctx) {
    await ctx.reply('👋 Shutting down...');
    setTimeout(() => process.exit(0), 500);
  },
};

module.exports = [mode, shutdown];
