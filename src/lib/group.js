const { numberOf } = require('./message');

/**
 * Loads group metadata and works out whether the sender and the bot are admins.
 * Returns null if the metadata can't be fetched.
 */
async function getGroupContext(sock, jid, senderNumber) {
  let meta;
  try {
    meta = await sock.groupMetadata(jid);
  } catch {
    return null;
  }

  const botNumber = numberOf(sock.user?.id || '');
  const admins = new Set();
  for (const p of meta.participants) {
    if (p.admin) admins.add(numberOf(p.phoneNumber || p.id));
  }

  return {
    meta,
    isAdmin: admins.has(senderNumber),
    botIsAdmin: admins.has(botNumber),
  };
}

module.exports = { getGroupContext };
