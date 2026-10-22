const { getContentType } = require('@whiskeysockets/baileys');

const WRAPPERS = ['ephemeralMessage', 'viewOnceMessage', 'viewOnceMessageV2', 'documentWithCaptionMessage'];

/** Strips WhatsApp wrapper layers so we can read the real message body. */
function unwrap(message) {
  let m = message;
  while (m) {
    const type = getContentType(m);
    if (type && WRAPPERS.includes(type) && m[type]?.message) {
      m = m[type].message;
    } else {
      break;
    }
  }
  return m || null;
}

/** Returns the main content type of a message, or null. */
function typeOf(message) {
  const m = unwrap(message);
  return m ? getContentType(m) : null;
}

/** Plain text of a message, including captions. */
function getText(msg) {
  const m = unwrap(msg.message);
  if (!m) return '';
  const type = getContentType(m);
  if (type === 'conversation') return m.conversation || '';
  if (type === 'extendedTextMessage') return m.extendedTextMessage?.text || '';
  if (['imageMessage', 'videoMessage', 'documentMessage'].includes(type)) {
    return m[type]?.caption || '';
  }
  return '';
}

/** Bare phone-number part of a JID, e.g. "2348012345678@s.whatsapp.net" -> "2348012345678". */
function numberOf(jid = '') {
  return jid.split('@')[0].split(':')[0];
}

/** The sender's number (works for both DMs and groups). */
function senderOf(msg) {
  return numberOf(msg.key.participant || msg.key.remoteJid || '');
}

/** The context info block of the message (mentions, quotes), if any. */
function contextOf(msg) {
  const m = unwrap(msg.message);
  const type = m ? getContentType(m) : null;
  return (type && m[type]?.contextInfo) || {};
}

/** JIDs mentioned with @ in the message. */
function mentionedJids(msg) {
  return contextOf(msg).mentionedJid || [];
}

/** The quoted (replied-to) message, if any. */
function quotedInfo(msg) {
  const ci = contextOf(msg);
  if (!ci.quotedMessage) return null;
  return {
    message: ci.quotedMessage,
    participant: ci.participant,
    stanzaId: ci.stanzaId,
  };
}

module.exports = {
  unwrap,
  typeOf,
  getText,
  numberOf,
  senderOf,
  mentionedJids,
  quotedInfo,
};
