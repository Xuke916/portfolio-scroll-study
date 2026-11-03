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
  const message = $('.message-scene'), gallery = $('.gallery-scene'), split = $('.split-scene');
  const world = $('.gallery-world'), quote = $('.gallery-quote');
  const signature = $('.message-signature'), signaturePath = $('path', signature);
  const ring = $('.transition-ring');
  const header = $('.site-header'), progress = $('.scroll-progress>span');
  const menu = $('.site-menu'), toggle = $('.menu-toggle');
  const cursor = $('.custom-cursor'), dialog = $('.image-dialog');
  let unit = innerHeight, current = scrollY, target = scrollY, frame = 0, lastTime = 0;
  let menuOpen = false, activeChapter = -1, cursorActive = false;
  let mouseX = 0, mouseY = 0, aimX = 0, aimY = 0;
  const TOTAL_HEIGHT = 8.2;
  const TIMELINE_SCALE = 1.5;
  const SCROLL_DAMPING_MS = 70;
  const POINTER_DAMPING_MS = 90;
  let lastWrittenScroll = scrollY, navigation = null;

  // Each section's distance is expressed in viewport heights, not wheel events.
  // Native scrolling also supports trackpads, touch, keyboard, and scrollbars.
  const CHAPTERS = { intro: 0, message: 3.35, gallery: 5.3, explore: 10 };
  const layout = [
    { x:31,y:17,w:14,r:.8,speed:.72,c:'#476b99',mx:16 },
    { x:38,y:65,w:15,r:1,speed:1.02,c:'#214d83',mx:27 },
    { x:61,y:44,w:32,r:.91,speed:.83,c:'#587ca9',mx:60 },
    { x:6,y:112,w:22,r:1.2,speed:1.04,c:'#1b477f',mx:-10 },
    { x:45,y:160,w:21,r:.78,speed:.88,c:'#6c8bb3',mx:44 },
    { x:76,y:230,w:18,r:1.1,speed:.95,c:'#2c5b91',mx:80 },
    { x:19,y:285,w:26,r:1.2,speed:.96,c:'#406ca1',mx:4 },
    { x:60,y:330,w:24,r:.8,speed:1.01,c:'#6384ad',mx:55 }
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
  $$('.message-marquee>span').forEach((el, i) => {
    const line = content.message?.lines[i] || 'TEXT PLACEHOLDER';
    el.textContent = Array(6).fill(line).join(' / ') + ' / ';
  });
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
  // Keep stable element references out of the animation loop.
  const ui = {
    heroLight: $('.hero-light'), orbits: [$('.orbit-one'), $('.orbit-two')],
    shells: $$('.floating-shell'), heroCopy: $('.hero-bottom-copy'),
    heroMeta: ['.hero-coordinate','.corner-card','.scroll-prompt','.portrait-label'].map(s => $(s)),
    heroContours: $('.hero-contours'), messageContours: $('.message-contours'),
    marquees: $$('.message-marquee'), marqueeGroup: $('.message-marquees'),
    messageEyebrow: $('.message-eyebrow'), messageFooter: $('.message-footer'),
    galleryContours: $('.gallery-contours'), counter: $('#moment-counter'),
    splitPortraits: $$('.split-portrait'), splitOptions: $('.split-options'),
    splitContours: $('.split-contours'), centerMark: $('.center-mark', header),
    chapterLinks: $$('.chapter-navigation a'), liveStatus: $('.live-status')
  };
  $$('.split-option').forEach((button, i) => {
    const entry = content.entries[i];
    $('.split-heading em', button).textContent = entry.title[0];
    $('.split-heading strong', button).textContent = entry.title[1];
    const hasChinese = /\p{Script=Han}/u.test(entry.title.join(''));
    $('.split-heading', button).classList.toggle('is-cjk', hasChinese);
    if (entry.eyebrow) $('.option-index', button).textContent = entry.eyebrow;
    const entryName = entry.title.join(hasChinese ? '' : ' ');
    button.setAttribute('aria-label', `查看${entryName}`);
    if (entry.description) { const desc = $('.description-skeleton', button); desc.className = 'entry-description'; desc.textContent = entry.description; }
    fillUserImage($$( '.split-portrait')[i], entry.image);
    button.addEventListener('click', () => openPreview(entry.image, entryName + ' / 内容待补充'));
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
    navigation = null; target = current;
    aimX = aimY = 0; requestTick();
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
    navigation = null; target = current;
    aimX = aimY = 0;
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
    target = CHAPTERS[chapter] * unit / TIMELINE_SCALE;
    if (reduced.matches) { current = target; navigation = null; writeScroll(current); }
    else navigation = { from: current, to: target, started: null, duration: clamp(Math.abs(target-current)/unit*95, 320, 720) };
    requestTick();
    history.replaceState(null, '', '#' + chapter);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (id in CHAPTERS) { e.preventDefault(); go(id); }
  }));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));

  // Scroll and pointer movement share one reversible, frame-rate-independent timeline.
  function render(y) {
    const t = y / unit * TIMELINE_SCALE, mobile = innerWidth <= 600;
    const px = reduced.matches ? 0 : mouseX, py = reduced.matches ? 0 : mouseY;
    const heroP = smooth(range(t, 0, 1.7));
    const thumb = smooth(range(t, 1.7, 3.05));
    const messageOut = smooth(range(t, 4.25, 5.1));
    const galleryEnter=smooth(range(t,4.3,5.2));
    const splitEnter=smooth(range(t,8.35,9.9));
    if(t<5.3){
    const heroScale = mix(mix(1.18, .95, heroP), mobile ? .55 : .64, thumb);
    const heroY = mix(mix(1, -4, heroP), mobile ? -9 : -13, thumb);
    portrait.style.transform = `translate3d(calc(-50% + ${px*26}px),calc(${heroY}% + ${py*15}px),0) perspective(1300px) rotateX(${-py*5}deg) rotateY(${px*10}deg) scale(${heroScale})`;
    const cardHeight = mobile ? unit*.38 : Math.min(unit*.46,innerWidth*.36/1.63);
    const insetY = (1-cardHeight/unit)*50*thumb;
    const insetX = (mobile ? 7 : 32)*thumb;
    hero.style.clipPath = `inset(${insetY}% ${insetX}%)`;
    hero.style.opacity = 1-messageOut;
    hero.style.setProperty('--thumb-tone',thumb*.88);
    hero.style.transform = `translate3d(0,${-messageOut*unit*.2}px,0) scale(${mix(1,.88,messageOut)})`;
    ui.heroLight.style.opacity = 1-thumb*.5;
    ui.heroLight.style.setProperty('--light-x',`${50+px*35}%`);
    ui.heroLight.style.setProperty('--light-y',`${40+py*30}%`);
    ui.orbits[0].style.transform = `translate(-50%,-50%) rotate(${mix(-18,28,heroP)+px*14}deg) scale(${mix(1,1.35,heroP)})`;
    ui.orbits[1].style.transform = `translate(-50%,-50%) rotate(${mix(35,-24,heroP)-px*18}deg)`;
    const shells = smooth(range(t,.6,1.5))*(1-thumb);
    ui.shells.forEach((s,i)=>{
      s.style.opacity=shells*.8;
      s.style.transform=`translate3d(calc(${mix(i?95:-85,i?-35:55,heroP)}% + ${px*(i?-35:25)}px),${mix(20,-12,heroP)+py*6}%,0) rotate(${mix(i?45:-40,i?-12:20,heroP)+px*8}deg)`;
    });
    ui.heroCopy.style.opacity = 0;
    ui.heroMeta.forEach(el=>el.style.opacity=1-thumb);
    ui.heroContours.style.transform=`translate3d(${-px*24}px,${-t*1.8-py*1.5}%,0) rotate(${t*.5}deg)`;
    message.style.opacity=smooth(range(t,1.65,2.3));
    message.style.visibility=t>5.3?'hidden':'visible';
    ui.messageContours.style.transform=`translate3d(${-px*18}px,${py*-12}px,0) rotate(${(t-3)*.8}deg)`;
    const messageText=smooth(range(t,2.1,2.9))*(1-messageOut);
    ui.marqueeGroup.style.opacity=messageText;
    ui.marquees.forEach((row,i)=>{
      const direction=i?1:-1;
      row.style.transform=`translate3d(calc(${i?-35:-15}% + ${direction*((t-3.35)*170+px*55)}px),${py*(i?10:-8)}px,0)`;
    });
    ui.messageEyebrow.style.opacity=smooth(range(t,2.35,2.9))*(1-messageOut);
    ui.messageFooter.style.opacity=messageText;
    const draw=smooth(range(t,2.5,3.35));
    signature.style.opacity=draw*(1-messageOut);
    signaturePath.style.strokeDashoffset=1-draw;
    signature.style.transform=`translate3d(calc(-50% + ${-px*22}px),calc(-50% + ${-py*14}px),0) rotate(${px*3}deg) scale(${mix(.92,1,draw)})`;

    }
    if(t>4.2&&t<10.1){
    gallery.style.opacity=galleryEnter;
    gallery.style.transform=`scale(${mix(1.13,1,galleryEnter)-splitEnter*.12}) rotate(${-splitEnter*2}deg)`;
    const gp=Math.max(0,t-5.25);
    cards.forEach((card,i)=>{
      card.style.transform=`translate3d(${-px*(9+i*3)}px,${((1-galleryEnter)*.65-gp*layout[i].speed)*unit-py*(7+i*2)}px,0)`;
      card.style.opacity=galleryEnter;
    });
    quote.style.opacity=galleryEnter*(1-splitEnter);
    quote.style.transform=`translate3d(${px*15}px,${-gp*.68*unit-py*11}px,0)`;
    ui.galleryContours.style.transform=`translate3d(${-px*16}px,${-gp*2.8-py}%,0)`;
    ui.counter.textContent=String(clamp(Math.floor(gp*2.3)+1,1,8)).padStart(2,'0');

    }
    if(t>8.25){
    // A growing aperture reveals the white scene while the dark scene recedes.
    split.style.transform='none';
    split.style.clipPath=`ellipse(${splitEnter*92}% ${splitEnter*140}% at 50% 50%)`;
    ring.style.transform=`translate(-50%,-50%) scale(${splitEnter})`;
    ring.style.opacity=reduced.matches?0:Math.sin(splitEnter*Math.PI)*.7;
    const endP=smooth(range(t,8.75,10.3));
    const dist=mobile?28:32;
    ui.splitPortraits[0].style.transform=`translate3d(${mix(-dist,0,endP)-px*2}%,${py*-1}%,0) scaleX(-1)`;
    ui.splitPortraits[1].style.transform=`translate3d(${mix(dist,0,endP)+px*2}%,${py}%,0)`;
    ui.splitOptions.style.opacity=smooth(range(t,8.55,9.4));
    ui.splitOptions.style.transform=`translate(calc(-50% + ${px*6}px),${mix(-25,-48,endP)}%)`;
    ui.splitContours.style.transform=`translate3d(${-px*14}px,${py*-10}px,0) rotate(${mix(-6,0,endP)}deg) scale(${mix(1.15,1,endP)})`;
    }
    const isDark=menuOpen||thumb>.12&&splitEnter<.7;
    document.documentElement.style.setProperty('--header-color',isDark?'#f3f3eb':'#0a2447');
    ui.centerMark.style.opacity=1-smooth(range(t,1.4,2.2));
    const chapter=t<2.2?0:t<4.65?1:t<9.25?2:3;
    if(chapter!==activeChapter){
      activeChapter=chapter;
      ui.chapterLinks.forEach((a,i)=>{a.classList.toggle('active',i===chapter);if(i===chapter)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
      [hero,message,gallery,split].forEach((scene,i)=>{scene.inert=chapter!==i;scene.setAttribute('aria-hidden',String(chapter!==i));});
      ui.liveStatus.textContent=['01 / 开场','02 / 缩小画面','03 / 图片叙事','04 / 双栏入口'][chapter];
    }
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${clamp(y/max)})`;
    hero.style.visibility=t>5.2?'hidden':'visible';
    message.style.visibility=t>5.3?'hidden':'visible';
    signature.style.visibility=t>5.2?'hidden':'visible';
    ring.style.visibility=t<8.3||t>9.95?'hidden':'visible';
    gallery.style.visibility=t>10||t<4.29?'hidden':'visible';
    split.style.visibility=t<8.34?'hidden':'visible';
  }
  function writeScroll(value){
    lastWrittenScroll=value;
    window.scrollTo({top:value,behavior:'instant'});
  }
  function tick(time){
    frame=0;
    const dt=lastTime?Math.min(64,time-lastTime):16.67;lastTime=time;
    if(navigation){
      if(navigation.started===null)navigation.started=time;
      const p=clamp((time-navigation.started)/navigation.duration);
      current=mix(navigation.from,navigation.to,1-Math.pow(1-p,3));
      if(p===1){current=target;navigation=null;}
    }else{
      const factor=reduced.matches?1:1-Math.exp(-dt/SCROLL_DAMPING_MS);
      current=mix(current,target,factor);
      if(Math.abs(target-current)<.35)current=target;
    }
    const pointerFactor=reduced.matches?1:1-Math.exp(-dt/POINTER_DAMPING_MS);
    mouseX=mix(mouseX,aimX,pointerFactor);mouseY=mix(mouseY,aimY,pointerFactor);
    if(Math.abs(mouseX-aimX)<.0001)mouseX=aimX;
    if(Math.abs(mouseY-aimY)<.0001)mouseY=aimY;
    // The native scroll position and visible frame move together, with no second trailing filter.
    if(current!==lastWrittenScroll)writeScroll(current);
    render(current);
    if(navigation||current!==target||mouseX!==aimX||mouseY!==aimY)frame=requestAnimationFrame(tick);else lastTime=0;
  }
  function requestTick(){if(!frame)frame=requestAnimationFrame(tick);}
  addEventListener('scroll',()=>{
    const actual=scrollY;
    if(Math.abs(actual-lastWrittenScroll)<1)return;
    navigation=null;current=target=lastWrittenScroll=actual;requestTick();
  },{passive:true});
  addEventListener('resize',()=>{unit=$('.scroll-space').offsetHeight/TOTAL_HEIGHT;navigation=null;target=current=lastWrittenScroll=scrollY;requestTick();},{passive:true});
  addEventListener('touchstart',()=>{navigation=null;target=current;},{passive:true});
  reduced.addEventListener('change',()=>{if(reduced.matches){navigation=null;aimX=aimY=0;}requestTick();});
  document.addEventListener('pointermove',e=>{
    if(!finePointer.matches||e.pointerType==='touch')return;
    if(!menuOpen&&!dialog.open&&!reduced.matches){aimX=clamp(e.clientX/innerWidth*2-1,-1,1);aimY=clamp(e.clientY/innerHeight*2-1,-1,1);requestTick();}
    const slot=e.target.closest?.('.image-slot');
    if(slot&&!reduced.matches){const rect=slot.getBoundingClientRect();const rx=(e.clientY-rect.top)/rect.height-.5,ry=(e.clientX-rect.left)/rect.width-.5;slot.style.transform=`perspective(700px) rotateX(${-rx*7}deg) rotateY(${ry*7}deg)`;}
    cursor.style.translate=`${e.clientX-34.5}px ${e.clientY-34.5}px`;
    cursor.style.transform='none';
    const hover=!!e.target.closest?.('.image-slot')&&!menuOpen&&!dialog.open;
    if(hover!==cursorActive){cursorActive=hover;cursor.classList.toggle('visible',hover);}
  },{passive:true});
  document.addEventListener('pointerleave',()=>{aimX=aimY=0;cursorActive=false;cursor.classList.remove('visible');requestTick();});
  $$('.image-slot').forEach(slot=>slot.addEventListener('pointerleave',()=>{slot.style.transform='';}));
  addEventListener('wheel',e=>{
    if(menuOpen||dialog.open||e.ctrlKey||reduced.matches||!e.cancelable||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    const delta=e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?unit:1);
    if(!delta)return;
    e.preventDefault();
    if(navigation||delta*(target-current)<0)target=current;
    navigation=null;
    // Coarse mouse wheels need more travel; trackpads keep their native precision and momentum.
    const coarse=e.deltaMode!==0||(Math.abs(e.deltaY)>=50&&Number.isInteger(e.deltaY)&&e.deltaX===0);
    const gain=coarse?1.35:1;
    const max=document.documentElement.scrollHeight-innerHeight;
    target=clamp(target+clamp(delta,-unit*2.5,unit*2.5)*gain,0,max);
    requestTick();
  },{passive:false});
  unit=$('.scroll-space').offsetHeight/TOTAL_HEIGHT;
  const initial=location.hash.slice(1);
  if(initial in CHAPTERS)writeScroll(CHAPTERS[initial]*unit/TIMELINE_SCALE);
  current=target=scrollY;render(current);
  document.documentElement.classList.add('ready');
})();
