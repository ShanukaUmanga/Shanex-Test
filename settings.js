const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
    SESSION_ID: process.env.SESSION_ID || "",
    PORT: process.env.PORT || "8000",
    SESSION_NAME: process.env.SESSION_NAME || "shanex",
    POSTGRESQL_URL: process.env.POSTGRESQL_URL || '',
};
