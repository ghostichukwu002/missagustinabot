# RETRO 🤖

A modular, command-driven WhatsApp bot built on [Baileys](https://github.com/WhiskeySockets/Baileys).
Commands live in one folder, one file per feature, so adding a new one is a single file.

> **Read this first.** RETRO is an unofficial WhatsApp client, and WhatsApp's Terms of Service do not
> allow automation like this. Accounts used with unofficial clients can be restricted or banned. Use a
> spare number, keep the bot out of spammy behaviour, and never use it to message people who have not
> agreed to hear from you. RETRO is not affiliated with WhatsApp or Meta.

## Features

| Category | Commands |
| --- | --- |
| General | `menu`, `ping`, `info`, `joke`, `owner` |
| Tools | `time`, `calc`, `echo` |
| Group (admins) | `tagall`, `groupinfo`, `link`, `kick` |
| Media | `sticker` (image to sticker, works with captions or replies) |
| Owner | `mode public\|self`, `shutdown` |

Also included: prefix support, per-user cooldowns, owner bypass, self mode, admin and bot-admin
checks for group commands, pairing-code or QR login, and automatic reconnects.

## Setup

Requires **Node.js 18+**.

```bash
git clone <your-repo-url> retro-bot
cd retro-bot
npm install
cp .env.example .env     # then edit OWNER_NUMBER and the rest
npm start
```

1. Set `OWNER_NUMBER` in `.env` (digits only, with country code).
2. Log in one of two ways:
   - **QR code (default):** scan the code printed in the terminal from WhatsApp > Linked devices.
   - **Pairing code:** set `PAIRING_NUMBER` to the bot's number. The terminal prints an 8-character code
     to enter under WhatsApp > Linked devices > Link with phone number.
3. Once `✅ RETRO is online` appears, send `.menu` from the owner's account.

The session is saved to `SESSION_DIR` (default `./session`). Anyone with that folder can control the
account, so keep it private and out of version control.

To keep it running on a server, use pm2:

```bash
npm i -g pm2
pm2 start index.js --name retro
pm2 save
```

## Configuration

All settings come from `.env`. See `.env.example` for descriptions.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BOT_NAME` | `RETRO` | Name shown in menus and the linked-device label |
| `OWNER_NUMBER` | *(required)* | Owner's number, digits only |
| `PREFIX` | `.,/,!` | Command prefixes, comma separated |
| `MODE` | `public` | `public` or `self` (owner-only). Change live with `.mode` |
| `TIMEZONE` | `UTC` | Used by `.time`, e.g. `Africa/Lagos` |
| `COOLDOWN_MS` | `2000` | Delay between commands per user (owner is exempt) |
| `PAIRING_NUMBER` | *(empty)* | If set, login uses a pairing code instead of QR |
| `SESSION_DIR` | `./session` | Where login credentials are stored |
| `LOG_LEVEL` | `silent` | Baileys log level, e.g. `warn` while debugging |

## Project layout

```
index.js                 Connection, login, reconnects, message events
src/
  config.js              Reads and validates settings from .env
  handler.js             Prefix matching, permission checks, cooldowns, dispatch
  lib/
    loader.js            Loads every file in src/commands
    message.js           Helpers for text, quotes, mentions, wrapped messages
    group.js             Group metadata and admin checks
    cooldown.js          Per-user rate limiting
  commands/
    general.js           menu, ping, info, time, calc, echo, joke, owner
    group.js             tagall, groupinfo, link, kick
    media.js             sticker
    owner.js             mode, shutdown
```

## Adding a command

Create a file in `src/commands/`. Each exported command needs a `name` and a `run(ctx)` function.
Optional fields are `aliases`, `category`, `description`, `ownerOnly`, `groupOnly`, `adminOnly` and
`botAdmin`.

```js
// src/commands/fun.js
module.exports = {
  name: 'flip',
  category: 'General',
  description: 'Flip a coin',
  async run(ctx) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    return ctx.reply(`🪙 ${result}`);
  },
};
```

The `ctx` object gives you:

- `ctx.sock`: the raw Baileys socket, for anything not wrapped already
- `ctx.msg`: the incoming message
- `ctx.jid`: the chat ID
- `ctx.args` and `ctx.text`: arguments after the command name
- `ctx.sender`: the sender's number
- `ctx.isGroup`, `ctx.isOwner`
- `ctx.group`: `{ meta, isAdmin, botIsAdmin }`, set when `adminOnly` or `botAdmin` is used
- `ctx.reply(text | content)`: replies quoting the original message

Restart the bot after adding a file.

## Security notes

- Keep `.env` and `session/` private. They are in `.gitignore` by default.
- RETRO deliberately has no `eval`-style command. `calc` only accepts digits and arithmetic operators.
- Keep `MODE=public` only if you are comfortable with strangers using the bot. `self` is safer for a
  personal account.
- Dependencies from npm come from third parties. Run `npm audit` and review them before using in production.

## Credits

Built on [Baileys](https://github.com/WhiskeySockets/Baileys) by the WhiskeySockets team. RETRO is
written from scratch. It is not a fork of any other bot.

## License

MIT
