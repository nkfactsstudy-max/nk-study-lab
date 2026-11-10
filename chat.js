/* NK Study Lab AI — chat widget. Stays hidden until AI_URL is filled in. */
(function(){
  var AI_URL = "https://nk-study-ai.nkfactsstudy.workers.dev";            // <- paste the Cloudflare Worker URL here when ready
  var DAILY_LIMIT = 25;       // questions per browser per day
  if(!AI_URL || window.__nkChat) return;
  window.__nkChat = true;

  var css = ''
  + '#nkAiBtn{position:fixed;right:16px;bottom:16px;z-index:9998;width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;font-size:26px;color:#fff;background:linear-gradient(145deg,#15803D,#14532D);box-shadow:0 5px 0 #0B3A1F,0 10px 16px rgba(0,0,0,.35);}'
  + '#nkAiBtn:active{transform:translateY(4px);box-shadow:0 1px 0 #0B3A1F;}'
  + '#nkAiPanel{position:fixed;right:12px;bottom:84px;z-index:9999;width:min(380px,calc(100vw - 24px));height:min(520px,calc(100vh - 110px));display:none;flex-direction:column;border-radius:16px;overflow:hidden;background:var(--bg,#fff);color:var(--text,#1A1F2B);border:1px solid var(--border,#E5E8EE);box-shadow:0 12px 40px rgba(0,0,0,.35);font-family:Inter,system-ui,sans-serif;}'
  + '#nkAiPanel.open{display:flex;}'
  + '.nkai-h{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(145deg,#15803D,#14532D);color:#fff;font-weight:800;font-size:14px;}'
  + '.nkai-h button{background:none;border:0;color:#fff;font-size:20px;cursor:pointer;}'
  + '.nkai-m{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;}'
  + '.nkai-b{max-width:88%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word;}'
  + '.nkai-u{align-self:flex-end;background:#15803D;color:#fff;border-bottom-right-radius:4px;}'
  + '.nkai-a{align-self:flex-start;background:var(--surface,#F7F8FA);border:1px solid var(--border,#E5E8EE);border-bottom-left-radius:4px;}'
  + '.nkai-a a{color:#0D9488;font-weight:700;text-decoration:underline;}'
  + '.nkai-n{font-size:11px;color:var(--text-dim,#6B7280);padding:0 12px 6px;}'
  + '.nkai-f{display:flex;gap:8px;padding:10px;border-top:1px solid var(--border,#E5E8EE);}'
  + '.nkai-f input{flex:1;min-width:0;padding:10px 12px;border-radius:10px;border:1px solid var(--border,#E5E8EE);background:var(--surface,#F7F8FA);color:var(--text,#1A1F2B);font-size:14px;font-family:inherit;}'
  + '.nkai-f button{padding:0 14px;border:0;border-radius:10px;background:#15803D;color:#fff;font-weight:700;cursor:pointer;}'
  + '.nkai-f button:disabled{opacity:.5;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'nkAiBtn'; btn.type = 'button'; btn.textContent = '🤖';
  btn.setAttribute('aria-label','पढ़ाई का साथी (AI) खोलो'); btn.title = 'पढ़ाई का साथी (AI)';
  var panel = document.createElement('div'); panel.id = 'nkAiPanel';
  panel.innerHTML = '<div class="nkai-h"><span>🤖 NK Study Lab AI</span><button type="button" aria-label="बंद करो">✕</button></div>'
    + '<div class="nkai-m" id="nkAiMsgs"></div>'
    + '<div class="nkai-n">AI कभी-कभी गलती कर सकता है। ज़रूरी बात किताब से मिला लो।</div>'
    + '<form class="nkai-f"><input type="text" maxlength="600" placeholder="अपना सवाल लिखो..." aria-label="सवाल"><button type="submit">भेजो</button></form>';
  document.body.appendChild(btn); document.body.appendChild(panel);

  var msgs = panel.querySelector('#nkAiMsgs');
  var form = panel.querySelector('form'), input = form.querySelector('input'), send = form.querySelector('button');
  var history = [];

  function addMsg(text, who){
    var d = document.createElement('div'); d.className = 'nkai-b ' + (who === 'u' ? 'nkai-u' : 'nkai-a');
    if(who === 'a'){
      // safe rendering: plain text, plus [[file.html|Title]] links to our own pages only
      var re = /\[\[([A-Za-z0-9 _.\-]+\.html)\|([^\]]{1,80})\]\]/g, last = 0, m;
      while((m = re.exec(text))){
        d.appendChild(document.createTextNode(text.slice(last, m.index)));
        var a = document.createElement('a'); a.href = encodeURI(m[1]); a.textContent = m[2]; d.appendChild(a);
        last = re.lastIndex;
      }
      d.appendChild(document.createTextNode(text.slice(last)));
    } else d.textContent = text;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
  }
  function used(){
    try{ var o = JSON.parse(localStorage.getItem('nkAiCount')||'{}'); var t = new Date().toDateString();
      return o.d === t ? o.n : 0; }catch(e){ return 0; }
  }
  function bump(){
    try{ localStorage.setItem('nkAiCount', JSON.stringify({d:new Date().toDateString(), n:used()+1})); }catch(e){}
  }

  addMsg('नमस्ते! मैं तुम्हारा पढ़ाई का साथी हूँ। English, Grammar, Math, Computer या Coding, कुछ भी पूछो। 😊', 'a');

  btn.addEventListener('click', function(){ panel.classList.toggle('open'); if(panel.classList.contains('open')) input.focus(); });
  panel.querySelector('.nkai-h button').addEventListener('click', function(){ panel.classList.remove('open'); });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var q = input.value.trim(); if(!q) return;
    if(used() >= DAILY_LIMIT){ addMsg('आज के सवालों की सीमा पूरी हो गई। कल फिर पूछना! 🙏', 'a'); return; }
    input.value = ''; addMsg(q, 'u'); history.push({role:'user', text:q}); bump();
    send.disabled = true; var wait = addMsg('सोच रहा हूँ...', 'a');
    fetch(AI_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({messages: history.slice(-8)})})
      .then(function(r){ return r.json().catch(function(){ return {}; }); })
      .then(function(j){
        var rep = j.reply || 'अभी जवाब नहीं मिल पाया। थोड़ी देर बाद फिर कोशिश करो।';
        msgs.removeChild(wait); addMsg(rep, 'a');
        if(j.reply && !j.error) history.push({role:'model', text:rep}); else history.pop();
      })
      .catch(function(){
        msgs.removeChild(wait); history.pop();
        addMsg('इंटरनेट जाँचकर दोबारा कोशिश करो।', 'a');
      })
      .then(function(){ send.disabled = false; });
  });
})();
