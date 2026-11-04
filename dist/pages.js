(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mix = (a, b, p) => a + (b - a) * p;
  const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = $('#detail-pages'), home = $('#experience');
  const overlay = $('.route-transition'), cutout = $('.route-cutout'), echo = $('.route-mark-echo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = $('.scroll-progress>span'), dialog = $('.image-dialog');
  let route = 'home', busy = false, frame = 0, transitionFrame = 0, lastTime = 0;
  let position = 0, target = 0, written = 0, jump = null, menuPaused = false;
  let mouseX = 0, mouseY = 0, aimX = 0, aimY = 0;
  let ui = null, metrics = null, data = null, savedHome = null, queuedPop = null;

  function media(path, label, extra = '') {
    return `<span class="detail-image ${extra}"><span class="detail-media-grid"></span><span class="detail-media-cross"></span><span class="detail-media-label mono">${esc(label)}</span>${path ? `<img src="${esc(path)}" alt="${esc(label)}" loading="lazy" decoding="async">` : ''}</span>`;
  }
  function sculpture() {
    return `<svg viewBox="0 0 620 720" role="img" aria-label="主视觉图片占位"><defs><radialGradient id="object-blue" cx=".32" cy=".18" r=".87"><stop stop-color="#366ba6"/><stop offset=".42" stop-color="#183858"/><stop offset=".8" stop-color="#0c1929"/><stop offset="1" stop-color="#060b12"/></radialGradient><linearGradient id="object-edge" x1="0" x2="1"><stop stop-color="#1e90ff"/><stop offset="1" stop-color="#1e90ff" stop-opacity="0"/></linearGradient></defs><path d="M55 430C28 220 110 65 286 53c173-13 273 120 264 295l-5 233-150 87-222-34-102-95Z" fill="url(#object-blue)" stroke="#6287af" stroke-opacity=".3"/><path d="M76 360c83-44 194-66 315-39l139 65-9 86-146-40-286 7Z" fill="#080f1b" stroke="#2579cf" stroke-opacity=".7"/><path d="M57 428c137 25 300-25 492 103M81 538c103 6 205 5 312 129M134 109c-55 167-6 367 103 537M240 58c-83 215-12 418 70 595M377 67c-45 130 12 316 126 547M477 155c-43 133-15 297 61 389M74 268c100-57 276-66 445 26M66 206c108-74 250-92 415 19M69 493c97 33 308 14 475 97" fill="none" stroke="#6b9bd1" stroke-width="1" opacity=".28"/><path d="M61 431c-29-208 52-359 225-372" fill="none" stroke="url(#object-edge)" stroke-width="3"/><path d="m174 526 164 7 56 44-169-18Z" fill="#102b4b" stroke="#3e6c9c"/><circle cx="408" cy="490" r="19" fill="#05090f" stroke="#34597e"/><circle cx="408" cy="490" r="9" fill="none" stroke="#71a9dc"/><path d="m114 587 88 24m12 4 88 24m13 4 38 11" stroke="#1e90ff" stroke-width="3" opacity=".55"/><text x="280" y="258" text-anchor="middle" fill="#7197be" font-family="monospace" font-size="12" letter-spacing="3">IMAGE / 01</text><path d="M280 160v30m-15-15h30" stroke="#8fb9e3" opacity=".6"/></svg>`;
  }
  function build(name) {
    data = window.PORTFOLIO_CONTENT.pages[name];
    const projects = data.projects;
    root.innerHTML = `
      <button class="detail-back mono" data-return>↖ 返回入口</button>
      <nav class="detail-section-nav" id="detail-section-navigation" aria-label="内页章节"><button data-section="hero" aria-label="开场" class="active"><i></i><span>01</span></button><button data-section="story" aria-label="创作介绍"><i></i><span>02</span></button><button data-section="collage" aria-label="${esc(data.galleryTitle)}"><i></i><span>03</span></button><button data-section="projects" aria-label="${esc(data.projectsTitle)}"><i></i><span>04</span></button></nav>
      <article class="detail-route" data-route="${name}">
        <section class="detail-section detail-hero" data-detail-section="hero">
          <div class="detail-sticky detail-hero-view">
            <span class="detail-top-label mono">${esc(data.english)} / 2026</span>
            <h1 class="detail-hero-title" tabindex="-1"><em>${esc(data.title[0])}</em><strong>${esc(data.title[1])}</strong></h1>
            <svg class="detail-hero-scribble" viewBox="0 0 900 600" aria-hidden="true"><path d="M80 510C-70 580 250 190 415 150S840 15 725 210L462 513 535 282 330 558 649 30"/></svg>
            <div class="detail-object">${data.heroImage ? media(data.heroImage, 'IMAGE / 01', 'detail-object-image') : sculpture()}<span class="mono detail-object-note">${esc(data.mark)} / VISUAL PLACEHOLDER</span></div>
            <div class="detail-hero-copy"><div class="detail-meta mono"><span>PORTFOLIO / 2026</span><span>${esc(data.english)}</span><span>IMAGE / 01</span></div><span class="detail-copy-kicker mono">ABOUT / TEXT PLACEHOLDER</span><div class="detail-copy-lines" aria-label="简介文字占位"><i></i><i></i><i></i><i></i></div><svg class="detail-small-signature" viewBox="0 0 100 38" aria-hidden="true"><path d="m3 28 50-21-29 26L68 6 46 30l42-16-21 21M8 27l83-4"/></svg><div class="detail-facts"><div><span class="mono">PROJECT / 01</span><b>—</b><span class="mono">CONTENT PLACEHOLDER</span></div><div><span class="mono">PROJECT / 02</span><b>—</b><span class="mono">CONTENT PLACEHOLDER</span></div><div><span class="mono">PROJECT / 03</span><b>—</b><span class="mono">CONTENT PLACEHOLDER</span></div></div></div>
            <button class="detail-scroll mono" data-section="story">SCROLL TO EXPLORE <span>↓</span></button>
          </div>
        </section>
        <section class="detail-section detail-story" data-detail-section="story"><div class="detail-sticky">
          <span class="detail-section-kicker mono">02 / ${name === 'work' ? 'CREATIVE STATEMENT' : 'LIFE IN MOTION'}</span>
          <div class="detail-story-type" aria-label="标题内容占位">${data.statement.map((line, i) => `<span class="story-line story-line-${i}">${esc(line)}</span>`).join('')}</div>
          <div class="detail-statement-media">${media(data.statementImage, 'IMAGE / 02')}<span class="mono">TEXT / IMAGE PLACEHOLDER</span></div>
          <span class="detail-story-bottom mono">SCROLL TO REVEAL ↓</span>
        </div></section>
        <section class="detail-section detail-collage" data-detail-section="collage"><div class="detail-sticky">
          <span class="detail-section-kicker mono">03 / SELECTED VISUALS</span><h2 class="detail-collage-heading"><em>${esc(data.galleryTitle.slice(0, 2))}</em><strong>${esc(data.galleryTitle.slice(2))}</strong></h2>
          ${[0, 1, 2, 3].map((i) => `<figure class="detail-collage-card collage-${i}">${media(projects[i % projects.length].detailImage || projects[i % projects.length].image, 'IMAGE / '+String(i+3).padStart(2,'0'))}<figcaption class="mono">VISUAL / ${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('')}
          <button class="detail-collage-next mono" data-section="projects">${esc(data.projectsTitle)} ↘</button>
        </div></section>
        <section class="detail-section detail-horizontal" data-detail-section="projects"><div class="detail-sticky project-viewport" tabindex="0" aria-label="${esc(data.projectsTitle)}，向下滚动以横向浏览">
          <header class="projects-heading"><span class="mono">04 / ${name === 'work' ? 'PERSONAL PROJECTS' : 'EVERYDAY MOMENTS'}</span><h2>${esc(data.projectsTitle)}</h2></header>
          <span class="projects-wheel-hint mono">向下滚动 · 横向浏览 <i>→</i></span>
          <div class="project-track">${projects.map((project,i)=>`<section class="project-panel" aria-label="${esc(project.title)}"><div class="project-panel-title"><span class="mono">${String(i+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}</span><h3>${esc(project.title)}</h3><span class="mono">${esc(project.category)}</span></div><button class="project-art project-art-main" data-project-index="${i}" aria-label="查看${esc(project.title)}">${media(project.image,'IMAGE / '+String(i*3+7).padStart(2,'0'))}<span class="project-open">↗</span></button><button class="project-art project-art-top" data-project-index="${i}" aria-label="查看${esc(project.title)}细节">${media(project.detailImage,'DETAIL / '+String(i+1).padStart(2,'0'))}</button><div class="project-art project-art-small" aria-hidden="true">${media('', 'VISUAL / '+String(i+1).padStart(2,'0'))}</div><span class="project-panel-foot mono">${esc(project.category)}</span></section>`).join('')}</div>
          <div class="projects-controls"><span class="mono"><b class="project-current">01</b> / ${String(projects.length).padStart(2,'0')}</span><div class="project-dots">${projects.map((p,i)=>`<button data-project-position="${i}" aria-label="前往${esc(p.title)}" class="${i===0?'active':''}"></button>`).join('')}</div><span class="projects-mini-progress"><i></i></span></div>
        </div></section>
        <footer class="detail-footer" data-detail-section="footer"><span class="mono">CONTINUE EXPLORING</span><a class="detail-other-route" href="#${name==='work'?'life':'work'}" data-open-page="${name==='work'?'life':'work'}"><em>${name==='work'?'日常':'专业'}</em><strong>${name==='work'?'生活':'作品'}</strong><span>↗</span></a><button class="detail-footer-home mono" data-return>↖ 返回专业作品 / 日常生活入口</button><span class="detail-footer-copy mono">PORTFOLIO / CONTENT PLACEHOLDERS / 2026</span></footer>
      </article>`;
    $$('img', root).forEach(img => img.addEventListener('error',()=>img.remove()));
    ui = {
      article: $('.detail-route',root), heroTitle: $('.detail-hero-title',root), object: $('.detail-object',root),
      scribble: $('.detail-hero-scribble',root), heroCopy: $('.detail-hero-copy',root),
      storyLines: $$('.story-line',root), statement: $('.detail-statement-media',root),
      collageCards: $$('.detail-collage-card',root), collageTitle: $('.detail-collage-heading',root),
      sections: $$('[data-detail-section]',root), track: $('.project-track',root),
      panels: $$('.project-panel',root), projectCurrent: $('.project-current',root),
      projectDots: $$('.project-dots button',root), miniProgress: $('.projects-mini-progress i',root),
      sectionButtons: $$('.detail-section-nav button',root), viewport: $('.project-viewport',root)
    };
    measure();
  }
  function measure() {
    if(!ui)return;
    const h=innerHeight,w=innerWidth,mobile=w<=600;
    const panelWidth=w*(mobile?1:.85),travel=Math.max(0,panelWidth*ui.panels.length-w);
    const spans={hero:h*1.45,story:h*1.85,collage:h*1.4,projects:h+travel/1.35,footer:h*.8};
    let offset=0;metrics={h,w,mobile,panelWidth,travel,sections:{}};
    for(const el of ui.sections){const name=el.dataset.detailSection;metrics.sections[name]={start:offset,length:spans[name]};el.style.height=spans[name]+'px';offset+=spans[name];}
    metrics.max=Math.max(0,offset-h);
    root.style.setProperty('--project-panel-width',panelWidth+'px');
    ui.article.dataset.scrollHeight=String(offset);
  }
  function render(y){
    if(!metrics||route==='home')return;
    const {h,w,sections:s}=metrics;
    const hp=clamp(y/Math.max(1,s.hero.length-h));
    ui.heroTitle.style.transform=`translate3d(${-mouseX*9}px,${-hp*70-mouseY*6}px,0)`;
    ui.object.style.transform=`perspective(1300px) translate3d(${mouseX*18}px,${hp*15-mouseY*8}px,0) rotateY(${mouseX*9+hp*18}deg) rotateZ(${-4-hp*5}deg) scale(${mix(1,.9,hp)})`;
    ui.scribble.style.transform=`translate3d(${-mouseX*15}px,${-hp*35}px,0) rotate(${mouseX*3}deg)`;
    ui.heroCopy.style.transform=`translate3d(0,${-hp*35}px,0)`;
    const sp=clamp((y-s.story.start)/Math.max(1,s.story.length-h));
    ui.storyLines.forEach((line,i)=>{line.style.transform=`translate3d(${(i%2?1:-1)*sp*w*.2+mouseX*(i+1)*4}px,${-sp*h*.13}px,0)`;line.style.opacity=1-smooth((sp-.45)/.55)*.85;});
    ui.statement.style.transform=`translate3d(calc(-50% + ${mouseX*12}px),calc(-50% + ${mouseY*8}px),0) rotate(${mix(-8,0,sp)}deg) scale(${mix(.58,2.6,smooth(sp))})`;
    const cp=clamp((y-s.collage.start)/Math.max(1,s.collage.length-h));
    ui.collageCards.forEach((card,i)=>card.style.transform=`translate3d(${-mouseX*(i+1)*4}px,${-cp*h*(.12+i*.07)-mouseY*6}px,0)`);
    ui.collageTitle.style.transform=`translateY(${-cp*h*.07}px)`;
    const x=clamp((y-s.projects.start)*1.35,0,metrics.travel);
    ui.track.style.transform=`translate3d(${-x}px,0,0)`;
    const index=clamp(Math.round(x/metrics.panelWidth),0,ui.panels.length-1);
    ui.projectCurrent.textContent=String(index+1).padStart(2,'0');
    ui.projectDots.forEach((b,i)=>{b.classList.toggle('active',i===index);if(i===index)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});
    ui.miniProgress.style.transform=`scaleX(${metrics.travel?x/metrics.travel:1})`;
    const active=y<s.story.start-h*.2?0:y<s.collage.start-h*.2?1:y<s.projects.start-h*.2?2:3;
    ui.sectionButtons.forEach((button,i)=>{button.classList.toggle('active',i===active);if(i===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    progress.style.transform=`scaleX(${clamp(y/Math.max(1,metrics.max))})`;
    document.documentElement.style.setProperty('--header-color','#f3f3eb');
  }
  function write(y){written=y;window.scrollTo({top:y,behavior:'instant'});}
  function stop(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;jump=null;target=position;}
  function request(){if(route!=='home'&&!busy&&!menuPaused&&!frame)frame=requestAnimationFrame(tick);}
  function tick(time){
    frame=0;if(route==='home'||busy||menuPaused)return;
    const dt=lastTime?Math.min(64,time-lastTime):16.67;lastTime=time;
    if(jump){if(jump.started===null)jump.started=time;const p=clamp((time-jump.started)/jump.duration);position=mix(jump.from,jump.to,1-Math.pow(1-p,3));if(p===1){position=target;jump=null;}}
    else {position=mix(position,target,reduced.matches?1:1-Math.exp(-dt/70));if(Math.abs(position-target)<.35)position=target;}
    mouseX=mix(mouseX,aimX,1-Math.exp(-dt/90));mouseY=mix(mouseY,aimY,1-Math.exp(-dt/90));
    if(Math.abs(mouseX-aimX)<.0001)mouseX=aimX;if(Math.abs(mouseY-aimY)<.0001)mouseY=aimY;
    if(position!==written)write(position);render(position);
    if(jump||position!==target||mouseX!==aimX||mouseY!==aimY)request();else lastTime=0;
  }
  function scrollToPosition(value){
    target=clamp(value,0,metrics.max);
    if(reduced.matches){jump=null;position=target;write(position);render(position);}
    else jump={from:position,to:target,started:null,duration:clamp(Math.abs(target-position)/innerHeight*110,380,800)};
    request();
  }
  function applyRoute(to,{chapter='explore',restore=false}={}){
    stop();route=to;mouseX=mouseY=aimX=aimY=0;
    if(to==='home'){
      $('.skip-link').href='#chapter-navigation';
      root.hidden=true;root.inert=true;document.body.classList.remove('detail-mode');delete document.body.dataset.page;
      home.inert=false;window.PortfolioHome.resume(chapter,restore&&savedHome?.hash===('#'+chapter)?savedHome.scroll:undefined);
      document.title='Portfolio / Scroll Study';
    }else{
      window.PortfolioHome.pause();document.body.classList.add('detail-mode');document.body.dataset.page=to;
      home.inert=true;root.hidden=false;build(to);root.inert=busy;
      position=target=0;written=0;write(0);render(0);
      $('.skip-link').href='#detail-section-navigation';$('.live-status').textContent=data.title.join('');
      document.title=data.title.join('')+' / Portfolio';
    }
  }
  function transitionTo(to,{chapter='explore',push=true,restore=false,immediate=false}={}){
    if(busy)return;
    window.PortfolioHome.closeMenu();
    if(route==='home')savedHome={...window.PortfolioHome.pause(),hash:location.hash||'#intro'};
    stop();busy=true;document.body.classList.add('is-routing');home.inert=true;root.inert=true;$('.site-header').inert=true;document.body.style.overflow='hidden';
    if(push)history.pushState({page:to},'',to==='home'?'#'+chapter:'#'+to);
    const caption=to==='home'?'PORTFOLIO / HOME':window.PORTFOLIO_CONTENT.pages[to].english;
    $('.route-transition-caption').textContent=caption;
    if(immediate||reduced.matches){
      applyRoute(to,{chapter,restore});finish(chapter);return;
    }
    overlay.hidden=false;let started=null,switched=false;
    function animate(time){
      if(started===null)started=time;
      const p=clamp((time-started)/1350);
      const cover=smooth(p/.24),reveal=smooth((p-.48)/.52);
      overlay.style.transform=`translate3d(0,${(1-cover)*100}%,0)`;
      overlay.style.opacity=1-smooth((p-.92)/.08);
      const scale=mix(2.8,95,Math.pow(reveal,2.5));
      cutout.setAttribute('transform',`translate(800 450) scale(${scale}) translate(${-mix(50,32,reveal)} -50)`);
      echo.style.opacity=1-smooth((p-.42)/.2);
      $('.route-transition-caption').style.opacity=1-reveal;
      if(!switched&&p>=.3){switched=true;applyRoute(to,{chapter,restore});}
      if(p<1)transitionFrame=requestAnimationFrame(animate);else finish(chapter);
    }
    transitionFrame=requestAnimationFrame(animate);
  }
  function finish(chapter='explore'){
    transitionFrame=0;busy=false;overlay.hidden=true;document.body.classList.remove('is-routing');
    document.body.style.overflow='';root.inert=route==='home';home.inert=route!=='home';$('.site-header').inert=false;
    if(route!=='home'){ui.heroTitle.focus({preventScroll:true});render(position);request();}
    else (chapter==='explore'?$('.split-option'):$('.wordmark'))?.focus({preventScroll:true});
    if(queuedPop){const next=queuedPop;queuedPop=null;transitionTo(next.to,{...next,push:false});}
  }
  window.PortfolioPages={
    open(name){if(name!=='work'&&name!=='life')return;if(route===name&&!busy){scrollToPosition(0);return;}transitionTo(name);},
    home(chapter='explore'){transitionTo('home',{chapter});}
  };
  const menuNav=$('.menu-content nav');
  for(const [name,label,num] of [['work','专业作品','05'],['life','日常生活','06']]){
    const a=document.createElement('a');a.href='#'+name;a.dataset.openPage=name;
    a.innerHTML=`<span>${num}</span>${label}<i>↗</i>`;menuNav.append(a);
  }
  document.addEventListener('click',e=>{
    const open=e.target.closest?.('[data-open-page]');
    if(open){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();window.PortfolioPages.open(open.dataset.openPage);return;}
    if(e.target.closest?.('[data-return]')){e.preventDefault();window.PortfolioPages.home();return;}
    const section=e.target.closest?.('[data-section]');if(section&&route!=='home'&&!busy){scrollToPosition(metrics.sections[section.dataset.section].start);return;}
    const dot=e.target.closest?.('[data-project-position]');if(dot&&route!=='home'&&!busy){scrollToPosition(metrics.sections.projects.start+Math.min(Number(dot.dataset.projectPosition)*metrics.panelWidth,metrics.travel)/1.35);return;}
    const project=e.target.closest?.('[data-project-index]');
    if(project&&route!=='home'&&!busy){stop();const item=data.projects[Number(project.dataset.projectIndex)];window.PortfolioHome.preview(item.image,item.title+' / 内容待补充');}
  });
  addEventListener('wheel',e=>{
    if(route==='home'||busy||menuPaused||dialog.open||e.ctrlKey||reduced.matches||!e.cancelable)return;
    const horizontal=position>=metrics.sections.projects.start&&position<=metrics.sections.projects.start+metrics.sections.projects.length-innerHeight;
    if(!horizontal&&Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    const input=horizontal&&Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
    if(!input)return;e.preventDefault();
    const delta=input*(e.deltaMode===1?18:e.deltaMode===2?innerHeight:1);
    if(jump||delta*(target-position)<0)target=position;jump=null;
    const coarse=e.deltaMode!==0||(Math.abs(input)>=50&&Number.isInteger(input)&&e.deltaX===0);
    target=clamp(target+clamp(delta,-innerHeight*2.5,innerHeight*2.5)*(coarse?1.35:1),0,metrics.max);request();
  },{passive:false});
  addEventListener('scroll',()=>{
    if(route==='home'||busy||Math.abs(scrollY-written)<1)return;
    jump=null;position=target=written=clamp(scrollY,0,metrics.max);request();
  },{passive:true});
  addEventListener('resize',()=>{if(route==='home')return;const ratio=metrics.max?position/metrics.max:0;measure();position=target=ratio*metrics.max;jump=null;write(position);render(position);});
  addEventListener('touchstart',()=>{if(route!=='home'){jump=null;target=position;}},{passive:true});
  document.addEventListener('pointermove',e=>{if(route==='home'||busy||menuPaused||reduced.matches||e.pointerType==='touch')return;aimX=clamp(e.clientX/innerWidth*2-1,-1,1);aimY=clamp(e.clientY/innerHeight*2-1,-1,1);request();},{passive:true});
  document.addEventListener('pointerleave',()=>{aimX=aimY=0;request();});
  document.addEventListener('portfolio:menu',e=>{menuPaused=e.detail.open;if(menuPaused)stop();else request();});
  document.addEventListener('keydown',e=>{
    if(route==='home'||busy||menuPaused||dialog.open||!metrics)return;
    const inProjects=position>=metrics.sections.projects.start-innerHeight*.05&&position<=metrics.sections.projects.start+metrics.sections.projects.length-innerHeight*.5;
    if(inProjects&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();scrollToPosition(target+(e.key==='ArrowRight'?1:-1)*metrics.panelWidth/1.35);}
  });
  function readLocation(){const hash=location.hash.slice(1);return hash==='work'||hash==='life'?{to:hash}:{to:'home',chapter:['intro','message','gallery','explore'].includes(hash)?hash:'intro',restore:true};}
  addEventListener('popstate',()=>{const next=readLocation();if(busy)queuedPop=next;else transitionTo(next.to,{...next,push:false});});
  const initial=readLocation();if(initial.to!=='home'){window.PortfolioHome.pause();applyRoute(initial.to);root.inert=false;}
})();
