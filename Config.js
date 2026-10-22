require('dotenv').config();

// RETRO settings. Every value comes from environment variables (or .env).
// Nothing secret is written in this file, so it is safe to commit.

const env = process.env;

const splitList = (value, fallback) =>
    value ? value.split(',').map((item) => item.trim()).filter(Boolean) : fallback;

const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

global.settings = {
    BOT_NAME: env.BOT_NAME || 'RETRO',
    VERSION: '1.0.0',

    // Owner's WhatsApp number, digits only, with country code. Required.
    OWNER_NUMBER: digitsOnly(env.OWNER_NUMBER),
    OWNER_NAME: env.OWNER_NAME || 'Owner',

    // Command prefixes, comma separated in .env, e.g. PREFIX=.,/,!
    PREFIX: splitList(env.PREFIX, ['.', '/', '!']),

    // public = everyone can use commands, self = only the owner
    WORK_MODE: (env.MODE || 'public').toLowerCase(),

    TIME_ZONE: env.TIMEZONE || 'UTC',

    // Per-user delay between commands (the owner is exempt)
    COMMAND_COOLDOWN_TIME_IN_MS: Number(env.COOLDOWN_MS || 2000),

    // Optional: pair with an 8-character code instead of a QR scan
    PAIRING_NUMBER: digitsOnly(env.PAIRING_NUMBER),

    // Where the WhatsApp login session is stored. Keep it private.
    SESSION_DIR: env.SESSION_DIR || './session',

    // Baileys log level: silent, error, warn, info, debug
    LOG_LEVEL: env.LOG_LEVEL || 'silent',
};

if (!global.settings.OWNER_NUMBER) {
    throw new Error('OWNER_NUMBER is missing. Set it in your .env file.');
}

module.exports = global.settings;
