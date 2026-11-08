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
