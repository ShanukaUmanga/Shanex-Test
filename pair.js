const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrw5Oku1UvRGCl');
const { Boom } = require('@hapi/boom');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    let type = req.query.type; // pairing or qr

    if (!num && type !== 'qr_session') {
        return res.sendFile(__dirname + '/public/index.html');
    }

    const id = 'session_' + Math.random().toString(36).substring(2, 8);
    const sessionDir = `./temp_${id}`;

    async function startPair() {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }),
                browser: Browsers.macOS('Safari')
            });

            // Handle QR Code generation
            sock.ev.on('connection.update', async (update) => {
                const { connection, qr } = update;
                if (qr && type === 'qr' && !res.headersSent) {
                    try {
                        let qrImageUrl = await qrcode.toDataURL(qr);
                        return res.json({ type: 'qr', qr: qrImageUrl });
                    } catch (e) {
                        console.error(e);
                    }
                }
            });

            sock.ev.on('creds.update', saveCreds);

            // Handle Pairing Code generation
            if (type === 'pairing') {
                if (!sock.authState.creds.registered) {
                    await delay(2000);
                    num = num.replace(/[^0-9]/g, '');
                    let code = await sock.requestPairingCode(num);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    if (!res.headersSent) {
                        return res.json({ type: 'pairing', code: code });
                    }
                }
            }

            sock.ev.on('connection.update', async (s) => {
                const { connection } = s;
                if (connection === 'open') {
                    await delay(5000);
                    let credsFile = fs.readFileSync(`${sessionDir}/creds.json`);
                    let txt = Buffer.from(credsFile).toString('base64');
                    
                    try {
                        let upload = await pastebin.createPaste({
                            text: txt,
                            title: 'SHANEX-MD-SESSION',
                            format: 'json',
                            visibility: 1
                        });
                        let sessionId = upload.split('/')[3];
                        await sock.sendMessage(sock.user.id, { text: `SHANEX-MD SESSION ID: ${sessionId}` });
                    } catch (e) {
                        console.error(e);
                    }
                    await delay(10000);
                    removeFile(sessionDir);
                    process.exit(0);
                }
            });

        } catch (err) {
            console.error(err);
            removeFile(sessionDir);
            if (!res.headersSent) {
                return res.json({ error: 'Service Unavailable' });
            }
        }
    }

    await startPair();
});

module.exports = router;
