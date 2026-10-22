const pino = require('pino');
const config = require('./config');
const { loadCommands } = require('./lib/loader');
const cooldown = require('./lib/cooldown');
const { getText, senderOf } = require('./lib/message');
const { getGroupContext } = require('./lib/group');

const commands = loadCommands(config.commandsDir);
const logger = pino({ level: config.logLevel });

const findPrefix = (text) => config.prefixes.find((p) => text.startsWith(p)) || null;

/** Builds the context object every command receives. */
function buildContext(sock, msg, extra) {
  const jid = msg.key.remoteJid;
  return {
    sock,
    msg,
    jid,
    logger,
    commands,
    config,
    ...extra,
    reply: (content) =>
      sock.sendMessage(jid, typeof content === 'string' ? { text: content } : content, { quoted: msg }),
  };
}

async function onMessage(sock, msg) {
  if (!msg.message) return;
  const jid = msg.key.remoteJid;
  if (!jid || jid === 'status@broadcast') return;

  const isGroup = jid.endsWith('@g.us');
  const sender = senderOf(msg);
  const isOwner = msg.key.fromMe || sender === config.ownerNumber;

  // Self mode: only the owner (and the bot's own account) get responses
  if (config.mode === 'self' && !isOwner) return;

  const text = getText(msg).trim();
  const prefix = findPrefix(text);
  if (!prefix) return;

  const [rawName = '', ...args] = text.slice(prefix.length).trim().split(/\s+/);
  const command = commands.get(rawName.toLowerCase());
  if (!command) return;

  const ctxBase = { isGroup, isOwner, sender, args, text: args.join(' ') };
  const ctx = buildContext(sock, msg, ctxBase);

  if (command.ownerOnly && !isOwner) {
    return ctx.reply('🔒 This command is for the bot owner only.');
  }
  if (command.groupOnly && !isGroup) {
    return ctx.reply('This command only works inside groups.');
  }

  if (command.adminOnly || command.botAdmin) {
    if (!isGroup) return ctx.reply('This command only works inside groups.');
    const group = await getGroupContext(sock, jid, sender);
    if (!group) return ctx.reply('I could not read this group’s details. Try again shortly.');
    if (command.adminOnly && !group.isAdmin && !isOwner) {
      return ctx.reply('🔒 Only group admins can use this command.');
    }
    if (command.botAdmin && !group.botIsAdmin) {
      return ctx.reply('I need to be a group admin to do that.');
    }
    ctx.group = group;
  }

  if (!isOwner) {
    const wait = cooldown.check(`${sender}:${jid}`, config.cooldownMs);
    if (wait) return ctx.reply(`⏳ Slow down. Try again in ${wait}s.`);
  }

  try {
    await command.run(ctx);
  } catch (err) {
    logger.error({ err, command: command.name }, 'command failed');
    await ctx.reply('⚠️ Something went wrong while running that command.');
  }
}

module.exports = { onMessage };
