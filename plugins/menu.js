const os = require('os');

module.exports = {
    name: 'menu',
    alias: ['help', 'panel'],
    description: 'Display bot command categories and status',
    
    run: async (sock, mek, m, { reply }) => {
        // Calculate Uptime & RAM usage
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        // Cyber Menu Layout matching your reference
        let menuText = `
👋 *HI PRO BOT 🔥*

┌  「 *BOT'S MENU* 」
│ 🤖 *Bot : SHANEX-MD*
│ 👤 *User : PRO BOT 🔥*
│ 💻 *Owner : Shanuka Umanga*
│ ⏱️ *Uptime : ${hours}h ${minutes}m ${seconds}s*
│ 📂 *Ram : ${ram}MB*
│ ✒️ *Prefix : .*
└─────────────────────

✨ *Select a Command List:* ✨

👉 *SELECT OPTIONS* 🌸

» 📁 *Categories* 👇
1 │ 🛠️ Settings
2 │ ⬇️ Download Commands
3 │ 🎬 Movie Commands
4 │ 🔍 Search Commands
5 │ 📰 News Commands
6 │ 🤖 AI Commands
7 │ 👥 Group Commands
8 │ 👑 Owner Commands
9 │ 🧩 Other Commands
10 │ 📊 Ping
└─────────────────────

© *SHANEX-MD Cyber Bot v1.0.0*
_Crafted by Shanuka Umanga_ 🛡️
        `.trim();

        // Send Image with Menu Caption
        await sock.sendMessage(m.chat, {
            image: { url: 'https://raw.githubusercontent.com/shanexstudio/SHANEX-MD/07dd6099e75ba96f31c8b43a21ead2fb7c30a192/Shanex%20Studio%20Cyber-Gold%20Banner.png' },
            caption: menuText
        }, { quoted: mek });
    }
};
