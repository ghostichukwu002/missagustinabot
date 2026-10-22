const path = require('path');
const s = require('../Config'); // global.settings is filled in Config.js

// Maps Config.js settings to the names the rest of the bot uses.
const config = {
  botName: s.BOT_NAME,
  version: s.VERSION,
  ownerNumber: s.OWNER_NUMBER,
  prefixes: s.PREFIX,
  mode: s.WORK_MODE, // 'public' | 'self'
  timezone: s.TIME_ZONE,
  cooldownMs: s.COMMAND_COOLDOWN_TIME_IN_MS,
  pairingNumber: s.PAIRING_NUMBER,
  sessionDir: path.resolve(s.SESSION_DIR),
  logLevel: s.LOG_LEVEL,
  commandsDir: path.join(__dirname, 'commands'),
};

module.exports = config;
