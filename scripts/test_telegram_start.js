const payload = {
    update_id: 10000,
    message: {
        message_id: 1,
        from: { id: 1111111, is_bot: false, first_name: "TestUser", username: "testuser" },
        chat: { id: 1111111, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/start"
    }
};

fetch('https://cigar-lounge-one.vercel.app/api/telegram/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(res => res.text())
.then(text => console.log('Response:', text))
.catch(err => console.error(err));
