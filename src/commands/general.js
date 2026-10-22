const JOKES = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'There are 10 kinds of people: those who understand binary and those who don’t.',
  'I would tell you a UDP joke, but you might not get it.',
  'Why did the developer go broke? Because he used up all his cache.',
];

const CATEGORY_ORDER = ['General', 'Tools', 'Group', 'Media', 'Owner'];

const menu = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'General',
  description: 'Show all commands',
  async run(ctx) {
    const groups = {};
    for (const cmd of new Set(ctx.commands.values())) {
      const category = cmd.category || 'Other';
      (groups[category] ||= []).push(cmd);
    }

    const prefix = ctx.config.prefixes[0];
    const lines = [
      `╭─〔 *${ctx.config.botName}* v${ctx.config.version} 〕`,
      `│ Prefix: ${ctx.config.prefixes.join('  ')}`,
      `│ Mode: ${ctx.config.mode}`,
      '╰──────────────',
    ];

    const categories = [
      ...CATEGORY_ORDER.filter((c) => groups[c]),
      ...Object.keys(groups).filter((c) => !CATEGORY_ORDER.includes(c)),
    ];

    for (const category of categories) {
      lines.push('', `*${category}*`);
      for (const cmd of groups[category].sort((a, b) => a.name.localeCompare(b.name))) {
        lines.push(`• ${prefix}${cmd.name} — ${cmd.description || ''}`.trimEnd());
      }
    }

    return ctx.reply(lines.join('\n'));
  },
};

const ping = {
  name: 'ping',
  category: 'General',
  description: 'Check how fast RETRO responds',
  async run(ctx) {
    const sentAt = Number(ctx.msg.messageTimestamp) * 1000;
    const latency = Math.max(0, Date.now() - sentAt);
    return ctx.reply(`🏓 Pong! Response time ≈ ${latency} ms`);
  },
};

const info = {
  name: 'info',
  aliases: ['about', 'botinfo'],
  category: 'General',
  description: 'Show bot details and uptime',
  async run(ctx) {
    const uptime = Math.floor(process.uptime());
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = uptime % 60;
    return ctx.reply(
      [
        `🤖 *${ctx.config.botName}* v${ctx.config.version}`,
        `Mode: ${ctx.config.mode}`,
        `Uptime: ${h}h ${m}m ${s}s`,
        `Node.js: ${process.version}`,
        `Platform: ${process.platform}`,
      ].join('\n'),
    );
  },
};

const time = {
  name: 'time',
  category: 'Tools',
  description: 'Current date and time in the bot timezone',
  async run(ctx) {
    const now = new Date().toLocaleString('en-GB', {
      timeZone: ctx.config.timezone,
      dateStyle: 'full',
      timeStyle: 'medium',
    });
    return ctx.reply(`🕒 ${now}\n(${ctx.config.timezone})`);
  },
};

const calc = {
  name: 'calc',
  aliases: ['calculate', 'math'],
  category: 'Tools',
  description: 'Evaluate a math expression, e.g. .calc (12+8)*3',
  async run(ctx) {
    const expr = ctx.text.trim();
    if (!expr) return ctx.reply('Usage: .calc 12+8*3');
    if (expr.length > 100 || !/^[0-9+\-*/().%\s]+$/.test(expr)) {
      return ctx.reply('Only numbers and the operators + - * / % ( ) are allowed.');
    }
    let result;
    try {
      // Safe: the regex above allows digits and operators only, no identifiers.
      result = Function(`"use strict"; return (${expr});`)();
    } catch {
      return ctx.reply('That expression is not valid.');
    }
    if (typeof result !== 'number' || !Number.isFinite(result)) {
      return ctx.reply('That expression is not valid.');
    }
    return ctx.reply(`🧮 ${expr} = *${result}*`);
  },
};

const echo = {
  name: 'echo',
  aliases: ['say'],
  category: 'Tools',
  description: 'Repeat your text back',
  async run(ctx) {
    if (!ctx.text) return ctx.reply('Usage: .echo your text');
    return ctx.reply(ctx.text.slice(0, 1000));
  },
};

const joke = {
  name: 'joke',
  category: 'General',
  description: 'Get a random joke',
  async run(ctx) {
    return ctx.reply(JOKES[Math.floor(Math.random() * JOKES.length)]);
  },
};

const owner = {
  name: 'owner',
  category: 'General',
  description: 'Contact the bot owner',
  async run(ctx) {
    return ctx.reply(`👑 Owner: https://wa.me/${ctx.config.ownerNumber}`);
  },
};

module.exports = [menu, ping, info, time, calc, echo, joke, owner];
