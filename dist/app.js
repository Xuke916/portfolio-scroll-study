(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };
  const range = (v, a, b) => clamp((v - a) / (b - a));
  const content = window.PORTFOLIO_CONTENT;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const stage = $('.stage'), hero = $('.hero-scene'), portrait = $('.hero-portrait');
  const gallery = $('.gallery-scene'), split = $('.split-scene');
  const world = $('.gallery-world'), intro = $('.gallery-intro'), quote = $('.gallery-quote');
  const header = $('.site-header'), progress = $('.scroll-progress>span');
  const menu = $('.site-menu'), toggle = $('.menu-toggle');
  const cursor = $('.custom-cursor'), dialog = $('.image-dialog');
  let unit = innerHeight, current = scrollY, target = scrollY, frame = 0, lastTime = 0;
  let menuOpen = false, activeChapter = -1, cursorActive = false;

  // Each section's distance is expressed in viewport heights, not wheel events.
  // Native scrolling also supports trackpads, touch, keyboard, and scrollbars.
  const CHAPTERS = { intro: 0, gallery: 3, explore: 7.1 };
  const layout = [
    { x:31,y:17,w:14,r:.8,speed:.72,c:'#929a83',mx:16 },
    { x:38,y:65,w:15,r:1,speed:1.02,c:'#66715b',mx:27 },
    { x:61,y:44,w:32,r:.91,speed:.83,c:'#9a9f8c',mx:60 },
    { x:6,y:112,w:22,r:1.2,speed:1.04,c:'#656f58',mx:-10 },
    { x:45,y:160,w:21,r:.78,speed:.88,c:'#a4aa96',mx:44 },
    { x:76,y:230,w:18,r:1.1,speed:.95,c:'#707d60',mx:80 },
    { x:19,y:285,w:26,r:1.2,speed:.96,c:'#8c967b',mx:4 },
    { x:60,y:330,w:24,r:.8,speed:1.01,c:'#a1a791',mx:55 }
  ];

  function addImage(parent, path, alt) {
    if (!path) return;
    const img = document.createElement('img'); img.src = path; img.alt = alt;
    img.addEventListener('error', () => { img.remove(); });
    parent.append(img);
  }
  function fillUserImage(container, path) {
    if (!path) return;
    const img = $('.user-image', container); img.src = path;
    img.addEventListener('load', () => { img.hidden = false; $('svg', container).style.visibility = 'hidden'; });
  }
  $('.wordmark>span').textContent = content.name[0];
  $('.wordmark>strong').textContent = content.name[1];
  fillUserImage(portrait, content.heroImage);
  if (content.heroImage) $('.portrait-label').hidden = true;
  layout.forEach((l, i) => {
    const data = content.gallery[i] || { image: '', caption: `IMAGE / ${i + 2}` };
    const figure = document.createElement('figure'); figure.className = 'gallery-card';
    figure.style.cssText = `--x:${l.x}%;--mobile-x:${l.mx}%;--y:${l.y}%;--w:${l.w}%;--ratio:${l.r};--slot-color:${l.c}`;
    const caption = document.createElement('figcaption'); caption.textContent = data.caption;
    const button = document.createElement('button'); button.className = 'image-slot';
    button.setAttribute('aria-label', `查看${data.caption}占位预览`);
    button.innerHTML = `<span class="slot-grid"></span><span class="slot-cross"></span><span class="slot-corner">↗</span><span class="slot-number">${String(i + 2).padStart(2, '0')} / IMAGE PLACEHOLDER</span>`;
    addImage(button, data.image, data.caption);
    button.addEventListener('click', () => openPreview(data.image, data.caption));
    figure.append(caption, button); world.append(figure);
  });
  const cards = $$('.gallery-card');
  $$('.split-option').forEach((button, i) => {
    const entry = content.entries[i];
    $('.split-heading em', button).textContent = entry.title[0];
    $('.split-heading strong', button).textContent = entry.title[1];
    if (entry.description) { const desc = $('.description-skeleton', button); desc.className = 'entry-description'; desc.textContent = entry.description; }
    fillUserImage($$( '.split-portrait')[i], entry.image);
    button.addEventListener('click', () => openPreview(entry.image, entry.title.join(' ') + ' / CONTENT PLACEHOLDER'));
  });

  // Original, code-drawn contour field; no external imagery or runtime libraries.
  const contours = `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>
    <path d="M-100 83C110 215 255 25 371-74M-108 158C147 302 316 99 443-78M-85 223C204 381 354 132 526-81M1180-80C969 119 1062 212 1208 232s96 155 227 176 122-96 229-96M1284-64c-192 189-137 221 12 255s76 143 219 152 128-59 214-37"/>
    <path d="M673-50c-119 186-124 329 37 401s218-12 177-134S1037 41 1041-47M609-73C476 134 449 314 638 398s267 30 251 181-283 70-312 229 155 170 135 292M518-81C393 106 329 314 534 449s267 46 223 173-252 83-282 245 117 176 115 237"/>
    <path d="M-50 398c244-5 306 91 254 184S-43 683 49 796s296 63 379 171M-56 454c197-2 251 76 198 140S-89 723-8 839s223 74 305 185M-100 323c170-10 406 39 399 203S58 666 166 777s290 85 353 267"/>
    <path d="M1710 567c-251-46-332 75-307 195s-114 217-231 234M1706 485c-307-36-427 110-398 240s-104 186-197 213-204 77-230 139M1747 388c-317-19-554 142-525 298s-158 109-251 204-76 141-60 210M1623-40c-102 174-235 146-253 326s-156 174-198 135-140-65-150 32 169 146 130 261-147 62-177 147"/>
    <path d="M-5 975c187-130 336-73 483-15s257 64 364 34M27-40c55 127 171 192 165 325s62 161 115 150M1463 1105c-38-183 202-241 176-416M784 5c-114 176-92 226-12 246s65-94 143-145"/>
  </g></svg>`;
  $$('.contours').forEach(el => el.innerHTML = contours);

  function openPreview(path, caption) {
    cursorActive = false; cursor.classList.remove('visible');
    const holder = $('.dialog-image'); holder.innerHTML = '<span class="slot-cross"></span>';
    addImage(holder, path, caption); $('.dialog-label').textContent = caption;
    dialog.showModal(); document.body.style.overflow = 'hidden';
  }
  function closePreview() { dialog.close(); }
  $('.dialog-close').addEventListener('click', closePreview);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closePreview(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = menuOpen ? 'hidden' : ''; });

  function setMenu(open) {
    menuOpen = open; document.body.classList.toggle('menu-open', open);
    menu.inert = !open; $('.stage').inert = open; $('.chapter-navigation').inert = open;
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { cursor.classList.remove('visible'); $('a', menu).focus({preventScroll:true}); }
    else toggle.focus({preventScroll:true});
    requestTick();
  }
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) setMenu(false);
    if (menuOpen && e.key === 'Tab') {
      const controls = [toggle, ...$$('a', menu)], first = controls[0], last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  function go(chapter) {
    if (!(chapter in CHAPTERS)) return;
    if (menuOpen) setMenu(false);
    window.scrollTo({ top: CHAPTERS[chapter] * unit, behavior: reduced.matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', '#' + chapter);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (id in CHAPTERS) { e.preventDefault(); go(id); }
  }));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));

  // One reversible timeline; no discrete wheel locks or scroll traps.
  function render(y) {
    const t = y / unit, mobile = innerWidth <= 600;
    const heroP = smooth(range(t, 0, 2.4));
    portrait.style.transform = `translate3d(-50%,${mix(1, 10, heroP)}%,0) scale(${mix(1.18, .82, heroP)})`;
    $('.orbit-one').style.transform = `translate(-50%,-50%) rotate(${mix(-18, 28, heroP)}deg) scale(${mix(1, 1.35, heroP)})`;
    $('.orbit-two').style.transform = `translate(-50%,-50%) rotate(${mix(35, -24, heroP)}deg)`;
    const shells = smooth(range(t, .65, 1.85));
    $$('.floating-shell').forEach((s, i) => {
      s.style.opacity = shells * .85;
      s.style.transform = `translate3d(${mix(i ? 95 : -85, i ? -35 : 55, shells)}%,${mix(20,-12,shells)}%,0) rotate(${mix(i ? 45 : -40, i ? -12 : 20,shells)}deg)`;
    });
    $('.hero-bottom-copy').style.opacity = smooth(range(t,.8,1.7)) * (1-range(t,2,2.6));
    $('.hero-contours').style.transform = `translate3d(0,${-t * 1.8}%,0) rotate(${t*.5}deg)`;
    const galleryEnter = smooth(range(t, 2, 2.85));
    gallery.style.transform = `translate3d(0,${(1-galleryEnter)*100}%,0)`;
    const gp = Math.max(0,t-3.65);
    const introOut = smooth(range(t,2.9,3.65));
    intro.style.opacity = 1-introOut;
    intro.style.transform = `translate3d(0,${-introOut*100}px,0)`;
    const cardsIn = smooth(range(t,2.85,3.6));
    cards.forEach((card,i) => {
      card.style.transform = `translate3d(0,${((1-cardsIn)*.55-gp*layout[i].speed)*unit}px,0)`;
      card.style.opacity = cardsIn;
    });
    quote.style.opacity = smooth(range(t,3.25,3.65));
    quote.style.transform = `translate3d(0,${-gp*.68*unit}px,0)`;
    $('.gallery-contours').style.transform = `translate3d(0,${-gp*2.8}%,0)`;
    $('#moment-counter').textContent = String(clamp(Math.floor(gp*2.3)+1,1,8)).padStart(2,'0');
    const splitEnter = smooth(range(t,6.1,7.15));
    split.style.transform = `translate3d(0,${(1-splitEnter)*100}%,0)`;
    const endP = smooth(range(t,6.5,7.6));
    const dist = mobile ? 18 : 12;
    $('.split-portrait-left').style.transform = `translate3d(${mix(-dist,0,endP)}%,0,0) scaleX(-1)`;
    $('.split-portrait-right').style.transform = `translate3d(${mix(dist,0,endP)}%,0,0)`;
    $('.split-options').style.opacity = smooth(range(t,6.65,7.15));
    $('.split-options').style.transform = `translate(-50%,${mix(-25,-48,endP)}%)`;
    $('.split-contours').style.transform = `rotate(${mix(-3,0,endP)}deg) scale(${mix(1.1,1,endP)})`;
    const isDark = menuOpen || galleryEnter>.94 && splitEnter<.94;
    document.documentElement.style.setProperty('--header-color',isDark?'#f3f3eb':'#292d23');
    header.querySelector('.center-mark').style.opacity = 1-range(t,1.9,2.6);
    const chapter = t<2.5?0:t<6.65?1:2;
    if (chapter!==activeChapter) {
      activeChapter=chapter;
      $$('.chapter-navigation a').forEach((a,i)=>{a.classList.toggle('active',i===chapter);if(i===chapter)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
      hero.inert=chapter!==0;gallery.inert=chapter!==1;split.inert=chapter!==2;
      hero.setAttribute('aria-hidden',String(chapter!==0));gallery.setAttribute('aria-hidden',String(chapter!==1));split.setAttribute('aria-hidden',String(chapter!==2));
      $('.live-status').textContent=['01 / 开场','02 / 图片叙事','03 / 双栏入口'][chapter];
    }
    const max = document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${clamp(y/max)})`;
    // Covered scenes stop rendering while retaining their current timeline state.
    hero.style.visibility=t>2.9?'hidden':'visible';
    gallery.style.visibility=t>7.2||t<1.99?'hidden':'visible';
    split.style.visibility=t<6.09?'hidden':'visible';
  }
  function tick(time) {
    frame=0;
    const dt=lastTime?Math.min(50,time-lastTime):16.67;lastTime=time;
    const factor=reduced.matches?1:1-Math.exp(-dt/76);
    current=mix(current,target,factor);
    if(Math.abs(target-current)<.1)current=target;
    render(current);
    if(current!==target)frame=requestAnimationFrame(tick);else lastTime=0;
  }
  function requestTick(){if(!frame)frame=requestAnimationFrame(tick);}
  addEventListener('scroll',()=>{target=scrollY;requestTick();},{passive:true});
  addEventListener('resize',()=>{unit=$('.scroll-space').offsetHeight/8.8;target=scrollY;current=target;requestTick();},{passive:true});
  reduced.addEventListener('change',requestTick);
  document.addEventListener('pointermove',e=>{
    if(!finePointer.matches)return;
    cursor.style.translate=`${e.clientX-34.5}px ${e.clientY-34.5}px`;
    cursor.style.transform='none';
    const hover=!!e.target.closest('.image-slot')&&!menuOpen&&!dialog.open;
    if(hover!==cursorActive){cursorActive=hover;cursor.classList.toggle('visible',hover);}
  },{passive:true});
  document.addEventListener('pointerleave',()=>{cursorActive=false;cursor.classList.remove('visible');});
  unit=$('.scroll-space').offsetHeight/8.8;
  const initial=location.hash.slice(1);
  if(initial in CHAPTERS)window.scrollTo(0,CHAPTERS[initial]*unit);
  current=target=scrollY;render(current);
  document.documentElement.classList.add('ready');
})();
