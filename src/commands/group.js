const { mentionedJids, quotedInfo, numberOf, senderOf } = require('../lib/message');
const { getGroupContext } = require('../lib/group');

const tagall = {
  name: 'tagall',
  aliases: ['everyone'],
  category: 'Group',
  description: 'Mention every member (admins only)',
  groupOnly: true,
  adminOnly: true,
  async run(ctx) {
    const members = ctx.group.meta.participants.map((p) => p.id);
    const lines = members.map((id, i) => `${i + 1}. @${numberOf(id)}`);
    const header = ctx.text || 'Attention everyone!';
    return ctx.sock.sendMessage(
      ctx.jid,
      { text: `📢 ${header}\n\n${lines.join('\n')}`, mentions: members },
      { quoted: ctx.msg },
    );
  },
};

const groupinfo = {
  name: 'groupinfo',
  aliases: ['ginfo'],
  category: 'Group',
  description: 'Show group name, size and admin count',
  groupOnly: true,
  async run(ctx) {
    const group = ctx.group || (await getGroupContext(ctx.sock, ctx.jid, senderOf(ctx.msg)));
    if (!group) return ctx.reply('I could not read this group’s details.');
    const { meta } = group;
    const admins = meta.participants.filter((p) => p.admin).length;
    const created = meta.creation ? new Date(meta.creation * 1000).toDateString() : 'unknown';
    return ctx.reply(
      [
        `👥 *${meta.subject}*`,
        `Members: ${meta.participants.length}`,
        `Admins: ${admins}`,
        `Created: ${created}`,
        meta.desc ? `\n${meta.desc}` : '',
      ].join('\n'),
    );
  },
};

const link = {
  name: 'link',
  category: 'Group',
  description: 'Get the group invite link (admins only)',
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run(ctx) {
    const code = await ctx.sock.groupInviteCode(ctx.jid);
    return ctx.reply(`🔗 https://chat.whatsapp.com/${code}`);
  },
};

const kick = {
  name: 'kick',
  aliases: ['remove'],
  category: 'Group',
  description: 'Remove a member: reply to them or @mention them (admins only)',
  groupOnly: true,
  adminOnly: true,
  botAdmin: true,
  async run(ctx) {
    const target = mentionedJids(ctx.msg)[0] || quotedInfo(ctx.msg)?.participant;
    if (!target) return ctx.reply('Mention someone or reply to their message to kick them.');

    const targetNumber = numberOf(target);
    if (targetNumber === ctx.config.ownerNumber || numberOf(ctx.sock.user?.id) === targetNumber) {
      return ctx.reply('I can’t remove the owner or myself.');
    }

    await ctx.sock.groupParticipantsUpdate(ctx.jid, [target], 'remove');
    return ctx.sock.sendMessage(
      ctx.jid,
      { text: `✅ Removed @${targetNumber}`, mentions: [target] },
      { quoted: ctx.msg },
    );
  },
};

module.exports = [tagall, groupinfo, link, kick];
