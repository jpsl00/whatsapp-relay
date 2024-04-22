import {Client, LocalAuth} from "whatsapp-web.js";
import {toString as qrToString} from "qrcode";

const isDebug = process.env.NODE_ENV === 'development';

export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: process.env.CHROME_BIN,
    args: [
      "--no-sandbox",
      "--disable-extensions",
      '--no-first-run',
      '--disable-gpu',
    ],
    ...(isDebug ? {
      devtools: true,
      headless: false,
    } : {}),
  }
});

client.on('qr', (qr) => {
  // Generate and scan this code with your phone
  console.log('Please scan the QR code to log in.');
  qrToString(qr, {type: 'terminal'}, (_, qr) => {
    console.log(qr);
  });
});

client.on('authenticated', (_session) => {
  console.log('User authenticated.');
});