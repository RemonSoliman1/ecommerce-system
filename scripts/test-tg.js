const { sendTelegramMediaGroup } = require('./lib/telegram.js');
// Wait, lib/telegram.js is ES modules. I can just test the raw fetch.

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function test() {
    const mediaArray = [
        {
            type: 'photo',
            media: 'https://cigar-lounge-one.vercel.app/api/og/collage?ids=134,136,137',
            caption: 'Test caption',
            parse_mode: 'HTML'
        },
        {
            type: 'photo',
            media: 'https://cigar-lounge-one.vercel.app/uploads/cohiba-shorts.jpg',
            parse_mode: 'HTML'
        }
    ];

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_GROUP_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
    
    console.log("Token:", token ? 'exists' : 'missing', "ChatId:", chatId);

    const url = `https://api.telegram.org/bot${token}/sendMediaGroup`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                media: mediaArray,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Telegram API Error:", errorData);
        } else {
            console.log("Success");
        }
    } catch (e) {
        console.error(e);
    }
}
test();
