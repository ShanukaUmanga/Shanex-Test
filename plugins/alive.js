const express = require('express');
const app = express();
const path = require('path');
const pairRouter = require('./pair');
const PORT = process.env.PORT || 8000;

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

// Static files (Web Page)
app.use(express.static(path.join(__dirname, 'public')));

// Pairing Code Route
app.use('/pair', pairRouter);

app.listen(PORT, () => {
    console.log(`[⚡] SHANEX-MD Web Server running on port ${PORT}`);
});

// WhatsApp Bot Connection Logic
async function startShanex() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    console.log(chalk.yellow('[⚡] Starting SHANEX-MD Cyber Bot...'));

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('[⚡] Scan this QR Code to connect WhatsApp:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(chalk.red('[!] Connection Closed, Reconnecting...'));

            if (reason !== DisconnectReason.loggedOut) {
                startShanex();
            } else {
                console.log(chalk.red('[!] Device Logged Out. Please scan QR again.'));
            }
        } else if (connection === 'open') {
            console.log(chalk.green('[✔] SHANEX-MD Successfully Connected & Online! 🚀'));
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Message & Command Handling Logic
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            
            const messageType = Object.keys(mek.message)[0];
            const body = (messageType === 'conversation') ? mek.message.conversation :
                         (messageType === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
            
            const from = mek.key.remoteJid;
            
            // ටෙස්ට් කිරීම සඳහා මූලික කමාන්ඩ් එකක් (උදා: .ping යැවූ විට පිළිතුරු දීම)
            if (body === '.ping' || body === 'ping') {
                await sock.sendMessage(from, { text: 'Pong! 🚀 SHANEX-MD is active and working!' }, { quoted: mek });
            }
            
        } catch (err) {
            console.log(err);
        }
    });
}

startShanex();
