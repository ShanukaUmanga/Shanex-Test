const config = require('../settings');

module.exports = async (context, m, { conn, text, mek }) => {
    try {
        const prefix = /^[./!#%^&,]/gi.test(m.body) ? m.body.match(/^[./!#%^&,]/gi)[0] : '.';
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

        if (['settings', 'setting', 'panel', 'botset'].includes(cmd)) {
            
            let settingsText = `
🎀 ≡ **SHANEX-MD BOT SETTINGS PANEL** ≡

🍀 | **BOT NAME:** ${config.BOT_NAME || 'SHANEX-MD'}
🍀 | **BOT LOGO:** ${config.BOT_LOGO || 'default.png'}
🍀 | **WORK TYPE:** ${config.WORK_TYPE || 'private'}
🍀 | **AI CHAT:** ${config.AI_CHAT || 'off'}
🍀 | **AI MODE:** ${config.AI_MODE || 'public'}
🍀 | **ANTI DELETE/EDIT:** ${config.ANTI_DELETE || 'off'}
🍀 | **AUTO STATUS:** ${config.AUTO_STATUS || 'off'}
🍀 | **AUTO REACT:** ${config.AUTO_REACT || 'off'}
🍀 | **PRESENCE:** ${config.PRESENCE || 'unavailable'}
🍀 | **BUTTON STYLE:** ${config.BUTTON_STYLE || 'numbers'}
🍀 | **LANGUAGE:** ${config.LANGUAGE || 'off'}
🍀 | **FONT STYLE:** ${config.FONT_STYLE || 'default'}

╭─── 🎯 **SELECT OPTION** 🌸 ───
│
│ » 🛠️ **MAIN SETTINGS** 👈
│ **1** | Public Mode
│ **2** | Private Mode
│ **3** | Inbox Only
│ **4** | Groups Only
│
│ » 🤖 **AI & TOOLS** 👈
│ **5** | Enable AI Chat
│ **6** | Disable AI Chat
│ **7** | Anti-Delete: OFF
│ **8** | Anti-Delete: Inbox Only
│ **9** | Anti-Delete: Groups Only
│ **10** | Anti-Delete: Both (Inbox+Group)
│
│ » 🤖 **AI CHAT MODES** 👈
│ **11** | AI: Inbox Public (Everyone)
│ **12** | AI: Inbox Self (Owner Only)
│ **13** | AI: Inbox Private (Others Only)
│ **14** | AI: Groups Only (Everyone)
│ **15** | AI: All (Inbox + Group + Bot)
│ **16** | AI: All Public (No Bot Reply)
│
│ » 🌐 **LANGUAGE TRANSLATE** 👈
│ **17** | Translation: OFF
│ **18** | English (English)
│ **19** | Sinhala (සිංහල)
│ **20** | Tamil (தமிழ்)
│ **21** | Hindi (हिंदी)
│ **22** | Telugu (తెలుగు)
│ **23** | Malayalam (മലയാളം)
│ **24** | Kannada (ಕನ್ನಡ)
│ **25** | Indonesian (Bahasa)
│ **26** | Arabic (العربية)
│ **27** | Spanish (Español)
│ **28** | French (Français)
│ **29** | German (Deutsch)
│ **30** | Russian (Русский)
│ **31** | Japanese (日本語)
│
│ » ✍️ **FONT STYLING** 👈
│ **32** | Font: Default
│ **33** | Font: Monospace (𝚝𝚎𝚡𝚝)
│ **34** | Font: Serif Bold (𝐭𝐞𝐱𝐭)
│ **35** | Font: Sans Bold (𝘁𝗲𝯩𝘁)
│ **36** | Font: Italic (textit)
│ **37** | Font: Bold Italic (𝙩𝙚𝙭𝙩)
│ **38** | Font: Cursive (𝓉ℯ𝓍𝓉)
│ **39** | Font: Double Struck (𝕥𝕖𝕩𝕥)
│ **40** | Font: Gothic (𝔤𝔬𝔱𝔥𝔦𝔠)
│ **41** | Font: Medieval (𝔪𝔢𝔡𝔦𝔢𝔳𝔞𝔩)
│ **42** | Font: Wide Text (ｔｅｘｔ)
│ **43** | Font: Circled Bubble (ⓣⓔⓧⓣ)
│ **44** | Font: Small Caps (ꜱᴍᴀʟʟ)
│ **45** | Font: Superscript (ᵗᵉˣᵗ)
│ **46** | Font: Subscript (ₜₑₓₜ)
│ **47** | Font: Parenthesis ((c)(a)(r))
│ **48** | Font: Squared (🄱🄾🅃)
│ **49** | Font: Regional (🇫🇮❓)
│ **50** | Font: Runes (ᚱᚾᛏᛗᚴ)
│ **51** | Font: Stars (s t a r s)
│ **52** | Font: Flip (µıd)
│ **53** | Font: Mirror (miяяoя)
│ **54** | Font: Vaporwave (v a p o r)
│ **55** | Font: Tiny (ᵀᴵᴺ)
│ **56** | Font: Neon (ńéóń)
│ **57** | Font: Striped (𝔸𝔹ℂ)
│ **58** | Font: Underlined (<u>ABC</u>)
│ **59** | Font: Strike Through (̶A̶B̶C̶)
│
│ » 🌟 **BOT PRESENCE** 👈
│ **60** | Always Online
│ **61** | Always Offline
│ **62** | Auto Typing
│ **63** | Auto Recording
│
│ » 👁️ **AUTO FUNCTIONS** 👈
│ **64** | Auto Status View ON
│ **65** | Auto Status View OFF
│ **66** | Auto Status React ON
│ **67** | Auto Status React OFF
│
│ » 🔘 **BUTTON STYLE** 👈
│ **68** | Enable Interactive Buttons
│ **69** | Disable Interactive Buttons (Numbers)
╰───────────────────────────

© **SHANEX-MD Cyber Bot v2.0.0**
*WaBot by Shanuka Umanga* ⚡

🌐 **Web:** https://shanexbot.onrender.com
`;

            let buttonMessage = {
                image: { url: 'https://i.ibb.co/30Z3s45/cyber-banner.jpg' }, // ඔබේ Banner Image URL එක
                caption: settingsText,
                footer: '© SHANEX-MD SYSTEM'
            };

            await conn.sendMessage(m.from, buttonMessage, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        m.reply(`❌ Error: ${e}`);
    }
};
