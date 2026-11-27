/* GTeste VI — script principal (statique, sans serveur)
   Barre de progression, menu mobile, animations d'apparition, effets visuels, FAQ.
   Le testeur de config est dans la page (index.html) + assets/hardware.js. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lite = matchMedia('(max-width: 760px), (pointer: coarse)').matches;

const navWrap = $('#navWrap'), progress = $('#progress');
function onScroll(){
  const y = scrollY;
  navWrap.classList.toggle('scrolled', y > 20);
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
}
addEventListener('scroll', onScroll, {passive:true}); onScroll();

$('#burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold:.12, rootMargin:'0px 0px -40px 0px'});
$$('.reveal').forEach(el => io.observe(el));

const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
  const tick = t => { const p = Math.min(1,(t-t0)/dur); el.textContent = Math.round(end*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick); cio.unobserve(el);
}), {threshold:.6});
$$('[data-count]').forEach(el => cio.observe(el));

if (!reduced && matchMedia('(hover:hover)').matches){
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.28}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
}
// accessibilité du menu mobile
(() => {
  const b = $('#burger'); if (!b) return;
  const sync = () => b.setAttribute('aria-expanded', document.body.classList.contains('menu-open'));
  b.addEventListener('click', () => setTimeout(sync));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => setTimeout(sync)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')){ document.body.classList.remove('menu-open'); sync(); } });
  addEventListener('resize', () => { if (innerWidth > 920){ document.body.classList.remove('menu-open'); sync(); } });
})();

(() => { try {
  const host = $('#beams');
  const n = lite ? 4 : 9;
  for (let k = 0; k < n; k++){
    const b = document.createElement('i'); b.className = 'beam';
    b.style.left = (8 + k * (84 / n) + Math.random()*4) + '%';
    b.style.animationDelay = (-Math.random()*7) + 's';
    b.style.animationDuration = (5 + Math.random()*5) + 's';
    host.appendChild(b);
  }
} catch(e) { console.warn("skip", e.message); } })();

(() => { try {
  const g = $('#cursorGlow'); if (!matchMedia('(hover:hover)').matches) return;
  let x = innerWidth / 2, y = innerHeight / 3, tx = x, ty = y, raf = 0;
  const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; g.style.transform = `translate(${x}px,${y}px)`;
    raf = (Math.abs(tx - x) + Math.abs(ty - y) > .5) ? requestAnimationFrame(loop) : 0; };
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; document.body.classList.add('has-cursor'); if (!raf) raf = requestAnimationFrame(loop); }, {passive:true});
  document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
} catch(e) { console.warn("skip", e.message); } })();

(() => { try {
  const c = $('#embers'), ctx = c.getContext('2d'); let W = 0, H, pts = [], last = 0;
  const dpr = lite ? 1 : Math.min(devicePixelRatio || 1, 2);
  const make = (y) => ({x:Math.random()*W, y: y ?? Math.random()*H, r:Math.random()*1.3+.4, vy:Math.random()*.45+.12, vx:(Math.random()-.5)*.25, a:Math.random()*Math.PI*2, hue:Math.random()<.5 ? '255,90,160' : '255,170,90'});
  function size(){
    if (lite && innerWidth === W) return;
    W = innerWidth; H = innerHeight; c.width = W*dpr; c.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    pts = Array.from({length: Math.round(W*H/(lite ? 60000 : 26000))}, () => make());
  }
  function draw(t){
    if (!reduced) requestAnimationFrame(draw);
    if (document.hidden || (lite && t - last < 32)) return;
    last = t;
    const k = lite ? 2 : 1;
    ctx.clearRect(0,0,W,H);
    if (!lite) ctx.shadowBlur = 6;
    for (const p of pts){
      p.y -= p.vy*k; p.x += (p.vx + Math.sin(p.a)*.15)*k; p.a += .02*k;
      if (p.y < -10) Object.assign(p, make(H + 10));
      const o = (Math.sin(p.a*1.5)*.35+.55) * Math.min(1, p.y / (H*.25));
      ctx.fillStyle = `rgba(${p.hue},${o})`; if (!lite) ctx.shadowColor = `rgba(${p.hue},.8)`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
  }
  size(); draw(0); addEventListener('resize', size);
} catch(e) { console.warn("skip", e.message); } })();

(() => { try {
  const app = $('#app'); if (reduced || lite) return;
  let raf = 0;
  const upd = () => {
    raf = 0;
    const r = app.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .9)));
    app.style.transform = `perspective(1400px) rotateX(${(1-p)*14}deg) scale(${.94 + p*.06})`;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, {passive:true}); upd();
} catch(e) { console.warn("skip", e.message); } })();

(() => { try {
  const FR = [
    ['GTA VI sort-il sur PC ?', 'GTA VI est annoncé sur <b>PS5 et Xbox Series X|S</b>. À ce jour, Rockstar n\'a annoncé ni version PC ni configuration PC officielle. GTeste VI utilise donc des <b>estimations</b>.'],
    ['D\'où viennent les specs affichées ?', 'Ce sont des estimations basées sur le matériel des consoles, sur les exigences de jeux open-world récents comparables et sur les analyses de la communauté. Elles seront remplacées dès que Rockstar publiera les specs officielles.'],
    ['Mon résultat est-il fiable ?', 'Il est <b>indicatif</b>. Les performances réelles dépendront de l\'optimisation du jeu, des pilotes, de la résolution et des réglages choisis. Un verdict « Recommandé » ne garantit rien tant que les specs officielles ne sont pas connues.'],
    ['Quelle config pour jouer en 60 FPS ?', 'Vise le niveau <b>Recommandé</b> : un processeur type Ryzen 5 7600 / Core i5-12600K, une carte type RTX 3060 Ti–3070 ou RX 6700 XT, 16 à 32 Go de RAM et un SSD NVMe.'],
    ['Un SSD est-il obligatoire ?', 'Très probablement. Un monde ouvert de cette taille charge énormément de données en continu : un disque dur classique est déconseillé. Prévois aussi environ <b>150 Go</b> libres (estimation).'],
    ['Mes données sont-elles envoyées quelque part ?', 'Non. Le verdict est calculé directement dans ton navigateur, rien n\'est envoyé ni enregistré.'],
    ['Je ne trouve pas mon composant, que faire ?', 'Choisis le modèle le plus proche dans la même gamme, ou « Autre / plus ancien » s\'il date de plus de 6 ou 7 ans.']
  ];
  const FAQ = FR;
  const list = $('#faqList');
  list.innerHTML = FAQ.map(([q, a], k) => `<div class="qa reveal${k < 4 ? ' d' + k : ''}">
      <button type="button" aria-expanded="false" aria-controls="qa${k}" id="qb${k}">${q}<i aria-hidden="true"></i></button>
      <div class="qa-a" id="qa${k}" role="region" aria-labelledby="qb${k}"><div><p>${a}</p></div></div></div>`).join('');
  $$('.reveal', list).forEach(el => io.observe(el));
  list.addEventListener('click', e => {
    const b = e.target.closest('.qa > button'); if (!b) return;
    const qa = b.parentElement, open = !qa.classList.contains('open');
    $$('.qa.open', list).forEach(x => { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); });
    qa.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
  });
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({'@context':'https://schema.org', '@type':'FAQPage', mainEntity: FAQ.map(([q, a]) => ({'@type':'Question', name:q, acceptedAnswer:{'@type':'Answer', text:a.replace(/<[^>]+>/g, '')}}))});
  document.head.appendChild(ld);
} catch(e) { console.warn("skip", e.message); } })();


(() => { try {
  const hide = new Set();
  const upd = () => document.body.classList.toggle('mcta-on', hide.size === 0);
  const io2 = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? hide.add(e.target) : hide.delete(e.target)); upd(); });
  ['#heroCta'].forEach(s => io2.observe($(s)));
} catch(e) { console.warn("skip", e.message); } })();
