const fs = require('fs');
const https = require('https');

// 1. قراءة ملف الآيات والأدعية من المشروع
const rawData = fs.readFileSync('messages.json', 'utf8');
const messages = JSON.parse(rawData);

// 2. اختيار آية أو دعاء عشوائياً من القائمة
const randomMessage = messages[Math.floor(Math.random() * messages.length)];

// 3. إعداد بيانات الطلب الموجه لـ OneSignal API
const data = JSON.stringify({
  app_id: process.env.ONESIGNAL_APP_ID,
  included_segments: ["Total Subscriptions"], // إرسال لكل المشتركين
  headings: { "ar": randomMessage.title || "✦ تذكرة من منصة صَون" },
  contents: { "ar": randomMessage.text }
});

const options = {
  hostname: 'onesignal.com',
  path: '/api/v1/notifications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
  }
};

// 4. تنفيذ طلب الإرسال
const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => { responseBody += chunk; });
  res.on('end', () => {
    console.log("Notification sent successfully:", responseBody);
  });
});

req.on('error', (e) => {
  console.error("Error sending notification:", e);
});

req.write(data);
req.end();
