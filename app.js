(function () {
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; }
  }

  // ===== عداد أيام التعافي (يُحفظ في جوال المستخدم فقط) =====
  var box = document.createElement('div');
  box.className = 'truth-card';
  box.id = 'streak-card';
  box.style.textAlign = 'center';

  function days() {
    var s = parseInt(store('sawn_streak_start'), 10);
    return s ? Math.max(0, Math.floor((Date.now() - s) / 864e5)) : null;
  }

  function btn(label, fn) {
    var b = document.createElement('button');
    b.className = 'back-btn';
    b.style.margin = '8px 4px 0';
    b.textContent = label;
    b.onclick = fn;
    return b;
  }

  function renderStreak() {
    box.innerHTML = '';
    var d = days();
    var h = document.createElement('h3');
    h.textContent = '🔥 عدّاد أيام الصيانة';
    box.appendChild(h);
    if (d === null) {
      var p = document.createElement('p');
      p.textContent = 'ابدأ اليوم عدّاداً يخصّك وحدك. بياناتك تبقى في جوالك ولا تُرسل لأحد.';
      box.appendChild(p);
      box.appendChild(btn('ابدأ العدّ الآن', function () { store('sawn_streak_start', String(Date.now())); renderStreak(); }));
    } else {
      var n = document.createElement('div');
      n.style.cssText = 'font-size:3rem;font-weight:900;color:#eab308;line-height:1.2';
      n.textContent = d;
      box.appendChild(n);
      var t = document.createElement('p');
      t.textContent = d === 0 ? 'بدايتك اليوم، وأول خطوة هي الأصعب. ثبّتك الله.' : 'يوم من الصيانة بحمد الله. واصل، وأنت أقوى مما تظن.';
      box.appendChild(t);
      box.appendChild(btn('بدأت من جديد', function () {
        if (confirm('هل تريد بدء عدّاد جديد؟ والله يقبل التوبة ويحب العبد الذي يعود إليه.')) {
          store('sawn_streak_start', String(Date.now())); renderStreak();
        }
      }));
    }
    if (installEvt || isIOS()) box.appendChild(installBtn());
  }

  // ===== تثبيت التطبيق =====
  var installEvt = null;
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone; }
  function installBtn() {
    return btn('📲 ثبّت صَون كتطبيق', function () {
      if (installEvt) { installEvt.prompt(); installEvt = null; renderStreak(); }
      else alert('في آيفون: اضغط زر المشاركة ثم "إضافة إلى الشاشة الرئيسية".');
    });
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; renderStreak(); });
  window.addEventListener('appinstalled', function () { installEvt = null; renderStreak(); });

  // إدراج البطاقة في الرئيسية
  var anchor = document.querySelector('#main-menu .truth-card');
  if (anchor) anchor.parentNode.insertBefore(box, anchor.nextSibling);
  renderStreak();

  // إصلاح نجمتين ** الظاهرتين في قسم القرآن
  var q = document.querySelector('#quran-effect-section p');
  if (q) q.innerHTML = q.innerHTML.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // عمل التطبيق بدون إنترنت
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
