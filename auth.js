/* ============================================================================
 * auth.js — Reusable client-side password gate (single password, no username)
 * ----------------------------------------------------------------------------
 * HOW TO REUSE IN ANOTHER PROJECT:
 *   1. Copy this file into the project root.
 *   2. Add  <script src="auth.js"></script>  as the LAST line in <head>.
 *   3. Edit CFG below: set `password`, `title`, `sessionKey` (unique per app),
 *      and `logo` (path to an image, or null to show a lock icon).
 *
 * BEHAVIOUR:
 *   - Shows a full-screen password screen over the page until unlocked.
 *   - On the correct password, the flag is stored in sessionStorage, so the
 *     user stays in for the whole browser session (survives reloads/navigation)
 *     and is only asked again in a brand-new browser session.
 *   - Password-only: no username field.
 *
 * NOTE: This is front-end gating only. The password lives in this file, so it
 * deters public access but is not cryptographically secure.
 * ==========================================================================*/
(function () {
  var CFG = {
    password:  'OneStrea@m123',
    sessionKey:'lcm_gate_auth_v1',       // unique per app (bump to force re-login)
    title:     'Lifecycle Management',
    subtitle:  'This prototype is password-protected.',
    logo:      'logo.png',               // path to a logo image, or null
    brand:     '#0A5DFF'
  };

  // Already unlocked this browser session -> let the page render normally.
  try { if (sessionStorage.getItem(CFG.sessionKey) === '1') return; } catch (e) {}

  // Hide page content immediately (before <body> paints) to avoid any flash.
  var hideStyle = document.createElement('style');
  hideStyle.textContent = 'body{visibility:hidden!important}#gate,#gate *{visibility:visible!important}';
  (document.head || document.documentElement).appendChild(hideStyle);

  var LOCK = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>';

  function build() {
    var css = document.createElement('style');
    css.textContent = [
      '#gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;',
      'background:radial-gradient(1200px 600px at 50% -10%,#eef2fb 0%,#f4f5f8 55%,#eef0f4 100%);',
      "font-family:'OneStream Sans',Arial,Helvetica,sans-serif;padding:20px;box-sizing:border-box;}",
      '#gate *{box-sizing:border-box;}',
      '#gate .card{width:360px;max-width:100%;background:#fff;border:1px solid #E6E6E6;border-radius:12px;box-shadow:0 18px 50px rgba(20,30,60,.14);padding:32px 28px 28px;text-align:center;}',
      '#gate .badge{width:60px;height:60px;border-radius:50%;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;background:' + CFG.brand + ';overflow:hidden;}',
      '#gate .badge img{width:100%;height:100%;object-fit:cover;display:block;}',
      '#gate h1{font-size:20px;font-weight:700;color:#141414;margin:0 0 6px;}',
      '#gate p{font-size:14px;color:#6E6E6E;margin:0 0 20px;line-height:19px;}',
      '#gate .err{color:#890C1D;background:#F9E8EB;border-radius:6px;font-size:13px;padding:8px 10px;margin:0 0 12px;text-align:left;display:none;}',
      '#gate input{width:100%;height:40px;border:1px solid #BDBDBD;border-radius:4px;padding:0 12px;font-size:14px;font-family:inherit;color:#141414;outline:none;margin-bottom:12px;}',
      '#gate input:focus{border-color:' + CFG.brand + ';box-shadow:0 0 0 3px rgba(10,93,255,.14);}',
      '#gate button{width:100%;height:40px;border:0;border-radius:4px;background:' + CFG.brand + ';color:#fff;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;}',
      '#gate button:hover{background:#0847c9;}',
      '#gate.shake .card{animation:gate-shake .4s;}',
      '@keyframes gate-shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-7px)}40%,60%{transform:translateX(7px)}}'
    ].join('');
    document.head.appendChild(css);

    var badge = CFG.logo
      ? '<div class="badge"><img src="' + CFG.logo + '" alt="" onerror="this.parentNode.innerHTML=\'' + LOCK.replace(/'/g, "\\'") + '\'"></div>'
      : '<div class="badge">' + LOCK + '</div>';

    var gate = document.createElement('div');
    gate.id = 'gate';
    gate.innerHTML =
      '<div class="card">' + badge +
        '<h1>' + CFG.title + '</h1>' +
        '<p>' + CFG.subtitle + '</p>' +
        '<div class="err" id="gate-err">Incorrect password. Please try again.</div>' +
        '<input id="gate-input" type="password" placeholder="Enter password" autocomplete="current-password" aria-label="Password" />' +
        '<button id="gate-submit" type="button">Unlock</button>' +
      '</div>';
    document.body.appendChild(gate);

    var input = document.getElementById('gate-input');
    var err = document.getElementById('gate-err');
    input.focus();

    function submit() {
      if (input.value === CFG.password) {
        try { sessionStorage.setItem(CFG.sessionKey, '1'); } catch (e) {}
        gate.remove();
        hideStyle.remove();
        css.remove();
      } else {
        err.style.display = 'block';
        gate.classList.remove('shake'); void gate.offsetWidth; gate.classList.add('shake');
        input.value = ''; input.focus();
      }
    }
    document.getElementById('gate-submit').addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
