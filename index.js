const fs = require('fs');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const config = require('./src/config');
const { onMessage } = require('./src/handler');

const logger = pino({ level: config.logLevel });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let reconnecting = false;

async function start() {
  fs.mkdirSync(config.sessionDir, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: [config.botName, 'Chrome', config.version],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  // Pairing code login (optional, instead of QR)
  if (!state.creds.registered && config.pairingNumber) {
    await sleep(3000);
    const code = await sock.requestPairingCode(config.pairingNumber);
    console.log(`🔑 Pairing code for ${config.botName}: ${code}`);
    console.log('WhatsApp > Linked devices > Link with phone number, then enter this code.');
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !config.pairingNumber) {
      console.log('Scan this QR code with WhatsApp > Linked devices:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      reconnecting = false;
      console.log(`✅ ${config.botName} is online as ${sock.user?.id?.split(':')[0]}`);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('Logged out from WhatsApp. Delete the session folder and pair again.');
        process.exit(1);
      }
      if (reconnecting) return;
      reconnecting = true;
      console.log(`Connection closed (code ${statusCode}). Reconnecting in 5s...`);
      setTimeout(() => start().catch(fatal), 5000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try {
        await onMessage(sock, msg);
      } catch (err) {
        logger.error({ err }, 'failed to handle message');
      }
    }
  });
}

function fatal(err) {
  console.error('Fatal error:', err);
  process.exit(1);
}

console.log(`Starting ${config.botName} v${config.version}...`);
start().catch(fatal);

process.on('SIGINT', () => {
  console.log(`\n${config.botName} stopped.`);
  process.exit(0);
});
