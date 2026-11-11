// إرسال رسالة صَون عبر OneSignal (يعمل كل ساعة من GitHub Actions)
const fs = require('fs');

const APP_ID = process.env.ONESIGNAL_APP_ID;
const KEY = process.env.ONESIGNAL_REST_API_KEY;
const FORCE = process.env.FORCE === '1';   // تشغيل يدوي تجريبي: يرسل للجميع فوراً

if (!APP_ID || !KEY) { console.error('ناقص: ONESIGNAL_APP_ID أو ONESIGNAL_REST_API_KEY في Secrets'); process.exit(1); }

const messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
const now = process.env.TEST_NOW ? new Date(process.env.TEST_NOW) : new Date();
const slot = Math.floor(now.getTime() / 3600000);
const msg = messages[slot % messages.length];          // تدوير الرسائل بالترتيب
const text = msg.t || msg.text;
const body = msg.s ? text + '\n(' + msg.s + ')' : text;
const kind = msg.k;                                    // dua | god | future

const FREQ = { '60': 1, '120': 2, '240': 4 };          // التكرار بالساعات
const QUIET_START = 23, QUIET_END = 5;                 // ساعات الهدوء (بتوقيت المستخدم)
const utcH = now.getUTCHours();
const localHour = tz => (((utcH + tz) % 24) + 24) % 24;
const inQuiet = h => h >= QUIET_START || h < QUIET_END;
const T = (k, v) => ({ field: 'tag', key: k, relation: '=', value: String(v) });

function branches(list) {
  const out = [];
  list.forEach((b, i) => { if (i > 0) out.push({ operator: 'OR' }); out.push(...b); });
  return out;
}

async function send(target, label) {
  const payload = Object.assign({
    app_id: APP_ID,
    target_channel: 'push',
    headings: { en: 'صَون', ar: 'صَون' },
    contents: { en: body, ar: body },
    url: 'https://tomtomsahur3a-ops.github.io/Anime_Chalenge/app.html',
    web_push_topic: 'sown',
    ttl: 3600
  }, target);
  for (const scheme of ['Key', 'Basic']) {
    const res = await fetch('https://api.onesignal.com/notifications?c=push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': scheme + ' ' + KEY },
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    if (res.status === 401 || res.status === 403) continue;   // جرّب نوع التوثيق الآخر
    console.log(label, res.status, txt.slice(0, 400));
    return;
  }
  console.error(label, 'فشل التوثيق: تأكد من REST API Key');
  process.exitCode = 1;
}

(async () => {
  console.log('UTC hour:', utcH, '| kind:', kind, '| message id:', msg.id);
  if (FORCE) { await send({ filters: [{ field: 'tag', key: 'freq', relation: 'exists' }] }, 'test'); return; }

  const tzs = []; for (let t = -12; t <= 14; t++) tzs.push(t);
  const jobs = [];

  for (const [f, h] of Object.entries(FREQ)) {
    if (utcH % h !== 0) continue;
    const list = [[T('freq', f), T(kind, 1), T('qh', 0)]];
    for (const t of tzs) if (!inQuiet(localHour(t))) list.push([T('freq', f), T(kind, 1), T('qh', 1), T('tz', t)]);
    jobs.push({ filters: branches(list), label: 'every ' + h + 'h' });
  }

  const daily = [];
  for (const t of tzs) if (localHour(t) === 9) daily.push([T('freq', 1440), T(kind, 1), T('tz', t)]);
  if (daily.length) jobs.push({ filters: branches(daily), label: 'daily 9am' });

  for (const j of jobs) await send({ filters: j.filters }, j.label);
  if (!jobs.length) console.log('لا توجد مجموعات لهذه الساعة');
})();
