// index.js
require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
// แก้ไขสำหรับ @line/bot-sdk เวอร์ชั่น 11 ขึ้นไป
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // ป้องกัน Error จากการกดปุ่ม Verify ใน LINE Developers (LINE จะส่ง Token ปลอมมาทดสอบ)
  if (event.replyToken === '00000000000000000000000000000000' || event.replyToken === 'ffffffffffffffffffffffffffffffff') {
    return Promise.resolve(null);
  }

  // create an echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

// 🔥 เพิ่มหน้าเว็บตรวจสอบสถานะ (แก้ ngrok error)
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// 🔴 Global Error Handler (ดักจับ Error กรณีใส่ Token ผิด หรือ Signature ไม่ผ่าน)
app.use((err, req, res, next) => {
  if (err instanceof line.SignatureValidationFailed) {
    console.error('❌ [Error] ตรวจสอบ Signature ไม่ผ่าน! คุณอาจจะใส่ channelSecret ผิด หรือยังไม่ได้ใส่');
    res.status(401).send(err.signature);
    return;
  } else if (err instanceof line.JSONParseError) {
    res.status(400).send(err.raw);
    return;
  }
  next(err);
});

// listen on port
const port = process.env.PORT || 3009;
app.listen(port, () => {
  console.log(`listening on ${port}`);
  if (!config.channelAccessToken || !config.channelSecret || config.channelAccessToken === 'ใส่ของคุณ') {
    console.log('\n⚠️ [คำเตือน] คุณยังไม่ได้ตั้งค่า CHANNEL_ACCESS_TOKEN หรือ CHANNEL_SECRET ในไฟล์ .env');
    console.log('⚠️ กรุณานำ Token จากเว็บ LINE Developers มาใส่ให้ถูกต้องด้วยครับ\n');
  }
});