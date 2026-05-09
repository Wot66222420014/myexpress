//Lastest version of line bot sdk: https://www.npmjs.com/package/@line/bot-sdk
require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// create LINE SDK config from env variables
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// create LINE SDK client
const client = line.LineBotClient.fromChannelAccessToken({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

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

  // create an echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

// เพิ่ม GET Method
app.get('/', (req, res) => {
  res.send('hello world, Aekkapot Phusri-ngoun');
});


// listen on port
const port = process.env.PORT || 3009;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
