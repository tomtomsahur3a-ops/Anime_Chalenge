(function () {
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; }
  }
  var installEvt = null;
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  }

  // ===== بانر التثبيت =====
  var css = document.createElement('style');
  css.textContent =
    '#install-banner{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:22px;background:rgba(24,24,27,.96);border:1px solid rgba(234,179,8,.45);box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 24px rgba(234,179,8,.15);backdrop-filter:blur(14px);max-width:640px;margin:0 auto;transform:translateY(160%);opacity:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .4s}' +
    '#install-banner.show{transform:translateY(0);opacity:1}' +
    '#install-banner img{width:48px;height:48px;border-radius:12px;border:1px solid #eab308;flex-shrink:0}' +
    '#install-banner .ib-t{flex:1;min-width:0;line-height:1.5}' +
    '#install-banner b{display:block;color:#f8fafc;font-size:.98rem;font-family:"Readex Pro","Cairo",sans-serif}' +
    '#install-banner span{display:block;color:#a1a1aa;font-size:.8rem}' +
    '#install-banner .ib-go{background:linear-gradient(135deg,#fef08a 0%,#eab308 50%,#ca8a04 100%);color:#09090b;border:none;border-radius:100px;padding:10px 18px;font-weight:800;font-size:.9rem;cursor:pointer;font-family:"Cairo",sans-serif;white-space:nowrap}' +
    '#install-banner .ib-x{background:none;border:none;color:#a1a1aa;font-size:1.1rem;cursor:pointer;padding:6px}';
  document.head.appendChild(css);

  var banner = null;
  function hideBanner(remember) {
    if (!banner) return;
    banner.classList.remove('show');
    var b = banner; banner = null;
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 600);
    if (remember) store('sawn_inst_dis', String(Date.now()));
  }
  function showBanner() {
    if (banner || isStandalone()) return;
    var t = parseInt(store('sawn_inst_dis'), 10);
    if (t && Date.now() - t < 3 * 864e5) return;
    var ios = isIOS() && !installEvt;
    if (!installEvt && !ios) return;
    banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML =
      '<img src="icon-192.png" alt="">' +
      '<div class="ib-t"><b>ثبّت تطبيق صَون</b><span>' +
      (ios ? 'اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»' : 'أسرع وأخف، ويعمل بدون إنترنت') +
      '</span></div>' +
      (ios ? '' : '<button class="ib-go">تثبيت</button>') +
      '<button class="ib-x" aria-label="إغلاق">✕</button>';
    document.body.appendChild(banner);
    var go = banner.querySelector('.ib-go');
    if (go) go.onclick = function () {
      if (!installEvt) return;
      installEvt.prompt();
      installEvt.userChoice.then(function (c) { installEvt = null; hideBanner(c.outcome !== 'accepted'); renderStreak(); });
    };
    banner.querySelector('.ib-x').onclick = function () { hideBanner(true); };
    setTimeout(function () { if (banner) banner.classList.add('show'); }, 50);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); installEvt = e; renderStreak(); setTimeout(showBanner, 1200);
  });
  window.addEventListener('appinstalled', function () { installEvt = null; hideBanner(false); renderStreak(); });

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
    if (installEvt && !isStandalone()) {
      box.appendChild(btn('📲 ثبّت صَون كتطبيق', function () { showBannerForce(); }));
    }
  }
  function showBannerForce() {
    store('sawn_inst_dis', null);
    if (installEvt) { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; renderStreak(); }); }
  }

  var home = document.getElementById('main-menu');
  if (home) home.insertBefore(box, home.firstChild);
  renderStreak();

  if (isIOS()) setTimeout(showBanner, 1500);

  // عمل التطبيق بدون إنترنت
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
