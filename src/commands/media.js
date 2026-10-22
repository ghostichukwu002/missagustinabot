const { getContentType, downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const { unwrap, quotedInfo } = require('../lib/message');

/** Finds an image either in the current message or in the message being replied to. */
function findImage(msg, jid) {
  const own = unwrap(msg.message);
  if (own && getContentType(own) === 'imageMessage') {
    return { key: msg.key, message: own };
  }

  const quoted = quotedInfo(msg);
  const quotedBody = quoted && unwrap(quoted.message);
  if (quotedBody && getContentType(quotedBody) === 'imageMessage') {
    return {
      key: { remoteJid: jid, id: quoted.stanzaId, participant: quoted.participant, fromMe: false },
      message: quotedBody,
    };
  }
  return null;
}

const sticker = {
  name: 'sticker',
  aliases: ['s'],
  category: 'Media',
  description: 'Make a sticker from an image (send or reply to an image)',
  async run(ctx) {
    const target = findImage(ctx.msg, ctx.jid);
    if (!target) {
      return ctx.reply('Send an image with the caption `.sticker`, or reply to an image with `.sticker`.');
    }

    const buffer = await downloadMediaMessage(target, 'buffer', {}, {
      logger: ctx.logger,
      reuploadRequest: ctx.sock.updateMediaMessage,
    });

    const webp = await sharp(buffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp()
      .toBuffer();

    return ctx.sock.sendMessage(ctx.jid, { sticker: webp }, { quoted: ctx.msg });
  },
};

module.exports = [sticker];
