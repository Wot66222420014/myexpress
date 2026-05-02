const line = require('@line/bot-sdk');
console.log("SignatureValidationFailed exists:", !!line.SignatureValidationFailed);
console.log("MessagingApiClient exists:", !!line.messagingApi.MessagingApiClient);
