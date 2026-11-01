// plugins/alive.js
module.exports = async (sock, mek, m, { from, reply }) => {
    try {
        const body = m.body || '';
        if (body.toLowerCase() === '.alive' || body.toLowerCase() === 'alive') {
            await sock.sendMessage(from, { 
                text: '✨ *SHANEX-MD is Alive and Running perfectly!* 🚀\n\n> *Cyber Bot by Shanuka Umanga*' 
            }, { quoted: mek });
        }
    } catch (e) {
        console.log("Alive plugin error:", e);
    }
};
