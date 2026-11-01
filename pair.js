const { default: makeWASocket, useMultiFileAuthState, delay, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const pinoLogger = pino({ level: 'silent' });

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    if (!num) {
        return res.json({ error: "Please provide a valid WhatsApp number!" });
    }

    async function ShanexPairCode() {
        const { state, saveCreds } = await useMultiFileAuthState(`./session`);
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pinoLogger),
                },
                printQRInTerminal: false,
                logger: pinoLogger,
                browser: ["Chrome", "Desktop", "10.0"]
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                let code = await sock.requestPairingCode(num);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                if (connection === 'open') {
                    await delay(5000);
                    let credsFile = `./session/creds.json`;
                    // Here you can handle session upload or sending session ID to user
                    console.log("Connected successfully!");
                    await delay(1000);
                    process.exit(0);
                } else if (connection === 'close') {
                    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed, reconnecting...");
                        ShanexPairCode();
                    } else if (reason === DisconnectReason.loggedOut) {
                        removeFile('./session');
                    }
                }
            });

            sock.ev.on('creds.update', saveCreds);

        } catch (err) {
            console.log("Service error:", err);
            removeFile('./session');
            if (!res.headersSent) {
                res.json({ error: "Service Unavailable" });
            }
        }
    }
    return await ShanexPairCode();
});

module.exports = router;
