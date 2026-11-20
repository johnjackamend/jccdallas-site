/* J Dallas site notices. Add/edit entries in NOTICES; the bars render on any page that loads this script.
   fields: id (unique; dismissal key), label (pill), tone (purple|blue|pink), text (bar copy), more (modal HTML),
           until (last day shown, YYYY-MM-DD), pages (array of path prefixes; "/" = homepage only) */
(function(){
  var NOTICES=[
    {id:"outdoor-pool-2026-11-30",label:"Aquatics",tone:"blue",until:"2026-11-30",pages:["/","/aquatics"],
     title:"Outdoor Pool Closure",
     text:"The outdoor pool will be closed on Monday, November 30, for facility enhancements.",
     more:"<p>The outdoor pool will be closed on <strong>Monday, November 30</strong>, for facility enhancements.</p><p>Thank you for your patience as we work to improve your experience at The J!</p><p>Questions? Visit the <a href='/aquatics/hours'>Aquatics hours page</a> or ask at the front desk, <a href='tel:2147392737'>(214) 739-2737</a>.</p>"},
    {id:"toll-tag-reader-2026-11",label:"Members",tone:"purple",until:"",pages:["/"],
     title:"J Notice: Main Gate Toll Tag Reader",
     text:"The J is replacing the toll tag reader at the main gate. Please display your J Parking Sticker or be ready to present a valid photo ID.",
     more:"<p>The J is replacing our existing toll tag reader at the main gate.</p><p>During this transition time, J Members and guests will need to display their <strong>J Parking Sticker</strong> or be ready to present a valid, government issued, photo ID.</p><p>Announcements on the new system are forthcoming.</p>"}
  ];
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function onPage(n){
    var p=location.pathname.replace(/\/index\.html$/,"/");
    return n.pages.some(function(x){ return x==="/" ? p==="/" : (p===x||p===x+"/"||p.indexOf(x+"/")===0); });
  }
  var today=new Date().toISOString().slice(0,10);
  var live=NOTICES.filter(function(n){
    if(!onPage(n)) return false;
    if(n.until && today>n.until) return false;
    try{ if(sessionStorage.getItem("jdNotice-"+n.id)==="1") return false; }catch(e){}
    return true;
  });
  if(!live.length) return;
  var st=document.createElement("style"); st.textContent=".jd-notice{color:#fff;font-size:14.5px;line-height:1.4;background:var(--purple)}\n.jd-notice.tone-blue{background:#0b5fa5}\n.jd-notice.tone-pink{background:var(--pink)}\n.jd-notice+.jd-notice{box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}\n.jd-notice .wrap{display:flex;align-items:center;gap:12px;min-height:46px;padding-top:7px;padding-bottom:7px}\n.jd-notice .pill,.jd-nmodal .pill{flex:none;display:inline-block;background:#fff;border-radius:999px;font:700 11px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;padding:6px 10px}\n.jd-notice .pill{color:var(--purple)}.jd-notice.tone-blue .pill{color:#0b5fa5}.jd-notice.tone-pink .pill{color:var(--pink)}\n.jd-notice p{flex:1;margin:0}\n.jd-notice .more{flex:none;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.55);color:#fff;border-radius:999px;font:700 12px/1 var(--body);letter-spacing:.06em;text-transform:uppercase;padding:8px 14px;white-space:nowrap;cursor:pointer}\n.jd-notice .more:hover{background:#fff;color:var(--purple)}.jd-notice.tone-blue .more:hover{color:#0b5fa5}.jd-notice.tone-pink .more:hover{color:var(--pink)}\n.jd-notice .close{flex:none;background:none;border:0;color:inherit;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;border-radius:50%;opacity:.8}\n.jd-notice .close:hover{opacity:1;background:rgba(255,255,255,.18)}\n.jd-notice .close svg{width:16px;height:16px}\n@media (max-width:720px){.jd-notice .wrap{flex-wrap:wrap;row-gap:6px}.jd-notice p{flex:1 1 calc(100% - 60px);order:3}.jd-notice .more{order:4}.jd-notice .close{margin-left:auto}}\n.jd-nmodal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(20,0,46,.7)}\n.jd-nmodal.open{display:flex}\n.jd-nmodal .box{position:relative;background:#fff;color:var(--ink);border-radius:var(--r-card,18px);padding:34px 30px 30px;width:min(560px,100%);box-shadow:0 30px 80px rgba(0,0,0,.4)}\n.jd-nmodal .pill{color:var(--purple);background:var(--purple-tint);margin-bottom:12px}.jd-nmodal.tone-blue .pill{color:#0b5fa5;background:#e4f0fa}.jd-nmodal.tone-pink .pill{color:var(--pink);background:#fde7f0}\n.jd-nmodal h2{margin:0 0 14px;font-size:26px}\n.jd-nmodal .body p{margin:0 0 12px;font-size:16px;line-height:1.5}\n.jd-nmodal .body a{color:var(--purple);font-weight:600}\n.jd-nmodal .x{position:absolute;top:10px;right:14px;background:none;border:0;font:700 26px/1 var(--body);color:#777;cursor:pointer}"; document.head.appendChild(st);
  var main=document.getElementById("main")||document.querySelector("main"); if(!main) return;
  var X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var wrap=document.createElement("div"); wrap.className="jd-notices";
  wrap.innerHTML=live.map(function(n){
    return '<div class="jd-notice tone-'+n.tone+'" role="status" data-id="'+n.id+'"><div class="wrap">'+
      '<span class="pill">'+esc(n.label)+'</span><p>'+esc(n.text)+'</p>'+
      (n.more?'<button type="button" class="more" aria-haspopup="dialog">Read More</button>':'')+
      '<button type="button" class="close" aria-label="Dismiss notice">'+X+'</button></div></div>';
  }).join("");
  main.parentNode.insertBefore(wrap,main);
  var modal=document.createElement("div"); modal.className="jd-nmodal"; modal.hidden=true;
  modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true");
  modal.innerHTML='<div class="box"><button type="button" class="x" aria-label="Close">&times;</button><span class="pill"></span><h2></h2><div class="body"></div></div>';
  document.body.appendChild(modal);
  var last, bx=modal.querySelector(".x");
  function close(){ modal.classList.remove("open"); modal.hidden=true; document.body.style.overflow=""; if(last&&last.focus) last.focus(); }
  function open(n){ last=document.activeElement; modal.className="jd-nmodal tone-"+n.tone+" open"; modal.hidden=false;
    modal.querySelector(".pill").textContent=n.label; modal.querySelector("h2").textContent=n.title||n.label; modal.querySelector(".body").innerHTML=n.more;
    document.body.style.overflow="hidden"; bx.focus(); }
  bx.addEventListener("click",close);
  modal.addEventListener("click",function(e){ if(e.target===modal) close(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&modal.classList.contains("open")) close(); });
  wrap.addEventListener("click",function(e){
    var bar=e.target.closest(".jd-notice"); if(!bar) return;
    var n=live.filter(function(q){return q.id===bar.getAttribute("data-id");})[0];
    if(e.target.closest(".more")) open(n);
    else if(e.target.closest(".close")){ bar.remove(); try{sessionStorage.setItem("jdNotice-"+n.id,"1");}catch(e2){} if(!wrap.children.length) wrap.remove(); }
  });
})();
