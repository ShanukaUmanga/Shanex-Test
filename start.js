const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const pairRouter = require('./pair');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

const PORT = process.env.PORT || 8000;

// Static Web Files
app.use(express.static(path.join(__dirname, 'public')));

// Pairing Code Route
app.use('/pair', pairRouter);

// Start Web Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(
        `[⚡] SHANEX-MD Web Server running on port ${PORT}`
    );
});

// Load Plugins Dynamically
const plugins = [];
const pluginFolder = path.join(__dirname, 'plugins');
if (fs.existsSync(pluginFolder)) {
    fs.readdirSync(pluginFolder).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const plugin = require(path.join(pluginFolder, file));
                plugins.push({ name: file, plugin });
                console.log(chalk.green(`[✔] Loaded Plugin: ${file}`));
            } catch (e) {
                console.log(chalk.red(`[!] Error loading plugin ${file}:`, e));
            }
        }
    });
}

// WhatsApp Bot Connection
let reconnecting = false;

async function startShanex() {
    try {
        const { state, saveCreds } =
            await useMultiFileAuthState('./session');

        const { version } =
            await fetchLatestBaileysVersion();

        console.log(
            chalk.yellow('[⚡] Starting SHANEX-MD Cyber Bot...')
        );

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            auth: state,
            printQRInTerminal: true
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('[⚡] Scan QR to connect WhatsApp:');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'open') {
                console.log(
                    chalk.green(
                        '[✔] SHANEX-MD Successfully Connected & Online!'
                    )
                );
            }

            if (connection === 'close') {
                const reason =
                    new Boom(lastDisconnect?.error)
                        .output?.statusCode;

                console.log(
                    chalk.red('[!] WhatsApp connection closed.')
                );

                if (reason === DisconnectReason.loggedOut) {
                    console.log(
                        chalk.red(
                            '[!] Device logged out. Reconnect WhatsApp.'
                        )
                    );
                    return;
                }

                if (!reconnecting) {
                    reconnecting = true;

                    setTimeout(async () => {
                        reconnecting = false;
                        await startShanex();
                    }, 3000);
                }
            }
        });

        // Message & Plugin Command Handling
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages?.[0];

                if (!mek || !mek.message) return;
                if (mek.key.fromMe) return;

                const messageType =
                    Object.keys(mek.message)[0];

                const body =
                    messageType === 'conversation'
                        ? mek.message.conversation
                        : messageType === 'extendedTextMessage'
                            ? mek.message.extendedTextMessage.text
                            : '';

                const from = mek.key.remoteJid;
                const m = { chat: from, ...mek };

                if (!from || !body) return;

                const textLower = body.trim().toLowerCase();

                // Built-in Ping Command
                if (textLower === '.ping' || textLower === 'ping') {
                    await sock.sendMessage(
                        from,
                        {
                            text: 'Pong! 🚀 SHANEX-MD is active and working!'
                        },
                        { quoted: mek }
                    );
                }

                // Execute Plugins Automatically
                for (const { plugin } of plugins) {
                    if (typeof plugin === 'function') {
                        // Function-based plugins (e.g., alive.js)
                        await plugin(sock, mek, m, { from, reply: (t) => sock.sendMessage(from, { text: t }, { quoted: mek }) });
                    } else if (typeof plugin === 'object' && typeof plugin.run === 'function') {
                        // Object-based plugins with names/aliases (e.g., menu.js)
                        const cmdName = textLower.startsWith('.') ? textLower.slice(1) : textLower;
                        if (plugin.name === cmdName || (plugin.alias && plugin.alias.includes(cmdName))) {
                            await plugin.run(sock, mek, m, { from, reply: (t) => sock.sendMessage(from, { text: t }, { quoted: mek }) });
                        }
                    }
                }

            } catch (err) {
                console.error(
                    '[SHANEX-MD] Message handler error:',
                    err
                );
            }
        });

    } catch (err) {
        console.error(
            '[SHANEX-MD] Startup error:',
            err
        );
    }
}

startShanex();
