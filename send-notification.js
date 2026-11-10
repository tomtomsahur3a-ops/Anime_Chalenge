// إرسال رسالة صَون عبر OneSignal (يعمل كل ساعة من GitHub Actions)
const fs = require('fs');

const APP_ID = process.env.ONESIGNAL_APP_ID;
const KEY = process.env.ONESIGNAL_REST_API_KEY;
const FORCE = process.env.FORCE === '1';   // تشغيل يدوي تجريبي: يرسل للجميع فوراً

if (!APP_ID || !KEY) { console.error('ناقص: ONESIGNAL_APP_ID أو ONESIGNAL_REST_API_KEY في Secrets'); process.exit(1); }

const messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
const now = process.env.TEST_NOW ? new Date(process.env.TEST_NOW) : new Date();
