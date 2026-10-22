const path = require('path');
require('dotenv').config();

const parseList = (value, fallback) =>
  value ? value.split(',').map((s) => s.trim()).filter(Boolean) : fallback;

const config = {
  botName: process.env.BOT_NAME || 'RETRO',
  version: '1.0.0',
  ownerNumber: (process.env.OWNER_NUMBER || '').replace(/\D/g, ''),
  prefixes: parseList(process.env.PREFIX, ['.', '/', '!']),
  mode: (process.env.MODE || 'public').toLowerCase(), // 'public' | 'self'
  timezone: process.env.TIMEZONE || 'UTC',
  cooldownMs: Number(process.env.COOLDOWN_MS || 2000),
  pairingNumber: (process.env.PAIRING_NUMBER || '').replace(/\D/g, ''),
  sessionDir: path.resolve(process.env.SESSION_DIR || './session'),
  logLevel: process.env.LOG_LEVEL || 'silent',
  commandsDir: path.join(__dirname, 'commands'),
};

if (!config.ownerNumber) {
  throw new Error('OWNER_NUMBER is missing. Set it in your .env file.');
}

module.exports = config;
