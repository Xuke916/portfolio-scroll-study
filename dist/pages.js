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
  const savedPositions = new Map();
  let touchGesture = null, suppressCoverClickUntil = 0;
  let projectObserver = null, caseCleanup = null;

  function projectRoute(project) { return 'work/' + project.slug; }
  function projectInfo(key) {
    const projects = window.PORTFOLIO_CONTENT.pages.work.projects;
    const index = projects.findIndex(project => projectRoute(project) === key);
    return index < 0 ? null : {project:projects[index], index};
  }
  function routeCaption(key) {
    if (key === 'home') return 'PORTFOLIO / HOME';
    return projectInfo(key)?.project.title || window.PORTFOLIO_CONTENT.pages[key]?.english || '';
  }

  function footer() {
    const config = window.PORTFOLIO_CONTENT.footer;
    const socials = (config.socials || []).filter(item => /^https?:\/\//.test(item.url || ''));
    return `<footer class="portrait-footer" data-detail-section="footer" aria-label="网站页尾">
      <svg class="footer-shape" aria-hidden="true"><defs><clipPath id="portrait-footer-shape" clipPathUnits="objectBoundingBox"><path d="M.025 .045H.375C.414 .045 .407 0 .454 0H.546C.593 0 .586 .045 .625 .045H.975Q1 .045 1 .072V.935Q1 .965 .975 .965H.9C.875 .965 .885 1 .855 1H.145C.115 1 .125 .965 .1 .965H.025Q0 .965 0 .935V.072Q0 .045 .025 .045Z"/></clipPath></defs></svg>
      <div class="footer-card">
        <div class="footer-contours" aria-hidden="true"><svg viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice"><path d="M-100 100C120 260 320-80 510 75S580 390 770 290 1000-50 1500 200M-100 170C170 370 340 0 490 145S590 480 810 350 1060 90 1500 270M-100 300C210 450 300 120 460 210S640 580 900 440 1100 200 1500 350M-100 560C100 360 400 670 540 540S580 100 820 650 1080 500 1500 570M-100 650C160 470 360 800 570 630S650 250 860 740 1100 570 1500 650M-100 740C150 580 380 900 600 720S700 370 900 830 1180 650 1500 760"/></svg></div>
        <svg class="footer-signature" viewBox="0 0 100 38" aria-hidden="true"><path d="m3 28 50-21-29 26L68 6 46 30l42-16-21 21M8 27l83-4"/></svg>
        <h2 class="footer-headline">${config.headline.map(line=>`<span><strong>${esc(line[0])}</strong> <em>${esc(line[1])}</em></span>`).join('')}</h2>
        <nav class="footer-pages" aria-label="页尾导航"><span class="mono">PAGES</span><a href="#intro" data-footer-home>HOME</a><a href="#work" data-open-page="work">专业作品</a><a href="#life" data-open-page="life">日常生活</a></nav>
        <figure class="footer-portrait">${config.portrait ? `<img src="${esc(config.portrait)}" alt="个人照片" loading="lazy">` : `<svg viewBox="0 0 700 900" preserveAspectRatio="xMidYMax meet" role="img" aria-label="个人照片占位"><use href="#portrait-placeholder"/></svg><figcaption class="mono">YOUR PHOTO</figcaption>`}</figure>
        <aside class="footer-socials"><span class="mono">FOLLOW ON</span>${socials.length?socials.map(item=>`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)} ↗</a>`).join(''):'<div class="footer-social-placeholder" aria-label="社交链接占位"><i></i><i></i><i></i></div>'}</aside>
        <span class="footer-brand mono">${esc(window.PORTFOLIO_CONTENT.name.join(' '))} / PORTFOLIO</span>
      </div>
      <span class="footer-legal mono">© 2026 ${esc(window.PORTFOLIO_CONTENT.name.join(' '))}</span>
    </footer>`;
  }

  function buildProject(info) {
    const {project,index} = info, projects = window.PORTFOLIO_CONTENT.pages.work.projects;
    data = window.PORTFOLIO_CONTENT.pages.work;
    const caseStudy=project.slug==='project-01'?window.PoroCaseStudy:project.slug==='project-02'?window.RewinderCaseStudy:project.slug==='project-03'?window.MoneyBallCaseStudy:null;
    if(caseStudy){
      const previous=projects[(index+projects.length-1)%projects.length],next=projects[(index+1)%projects.length];
      const pagination=`<section class="project-pagination" data-detail-section="projectNavigation"><a href="#${projectRoute(previous)}" data-project-route="${projectRoute(previous)}"><span class="mono">← 上一个项目</span><strong>${esc(previous.title)}</strong></a><button data-back-projects class="mono">返回个人项目 ↗</button><a href="#${projectRoute(next)}" data-project-route="${projectRoute(next)}"><span class="mono">下一个项目 →</span><strong>${esc(next.title)}</strong></a></section>`;
      root.innerHTML='<button class="detail-back mono" data-back-projects>↖ 返回个人项目</button>'+caseStudy.render({footer:footer(),pagination});
      const toc=$(caseStudy.tocSelector||'.mb-toc',root);
      ui={kind:'project',caseStudy:true,headerColor:caseStudy.headerColor||'#0a2447',article:$('.detail-route',root),heroTitle:$('.project-detail-title',root),projectCover:$('.project-detail-cover',root),sections:$$('[data-detail-section]',root),sectionButtons:$$('[data-section]',toc),toc,footerPhoto:$('.footer-portrait',root)};
      caseCleanup=caseStudy.mount(root);measure();
      if(typeof ResizeObserver!=='undefined'){
        projectObserver=new ResizeObserver(()=>{if(route===projectRoute(project)){measure();if(jump?.section){target=jump.to=metrics.sections[jump.section].anchor;}render(position);}});
        projectObserver.observe(ui.article);
      }
      return;
    }
    const gallery = project.gallery || [{image:'',caption:''},{image:'',caption:''}];
    root.innerHTML = `<button class="detail-back mono" data-back-projects>↖ 返回个人项目</button>
      <nav class="detail-section-nav" id="detail-section-navigation" aria-label="项目章节">${[['projectHero','项目封面'],['projectOverview','项目介绍'],['projectGallery','项目展示'],['footer','页尾']].map(([id,label],i)=>`<button data-section="${id}" aria-label="${label}" class="${i===0?'active':''}"><i></i><span>${String(i+1).padStart(2,'0')}</span></button>`).join('')}</nav>
      <article class="detail-route project-detail" data-route="${esc(projectRoute(project))}">
        <section class="project-detail-hero" data-detail-section="projectHero"><span class="mono project-detail-eyebrow">PERSONAL PROJECT / ${String(index+1).padStart(2,'0')}</span><h1 class="project-detail-title" tabindex="-1">${esc(project.title)}</h1><div class="project-detail-meta"><div><span class="mono">YEAR</span>${project.year?`<span>${esc(project.year)}</span>`:'<i></i>'}</div><div><span class="mono">ROLE</span>${project.role?`<span>${esc(project.role)}</span>`:'<i></i>'}</div><span class="mono">SCROLL TO EXPLORE ↓</span></div><div class="project-detail-cover">${media(project.image,'COVER / '+String(index+1).padStart(2,'0'))}</div></section>
        <section class="project-detail-overview" data-detail-section="projectOverview"><div><span class="mono">01 / OVERVIEW</span><h2>项目介绍</h2></div>${project.overview?`<p>${esc(project.overview)}</p>`:'<div class="project-text-placeholder" aria-label="项目介绍文字占位"><i></i><i></i><i></i><i></i><i></i></div>'}</section>
        <section class="project-detail-gallery" data-detail-section="projectGallery"><header><span class="mono">02 / SELECTED DETAILS</span><h2>项目展示</h2></header>${gallery.map((item,i)=>`<figure>${media(item.image,'PROJECT IMAGE / '+String(i+1).padStart(2,'0'))}<figcaption class="mono">${esc(item.caption || 'CAPTION / TEXT PLACEHOLDER')}</figcaption></figure>`).join('')}</section>
        <section class="project-pagination" data-detail-section="projectNavigation"><a href="#${projectRoute(projects[(index+projects.length-1)%projects.length])}" data-project-route="${projectRoute(projects[(index+projects.length-1)%projects.length])}"><span class="mono">← 上一个项目</span><strong>${esc(projects[(index+projects.length-1)%projects.length].title)}</strong></a><button data-back-projects class="mono">返回个人项目 ↗</button><a href="#${projectRoute(projects[(index+1)%projects.length])}" data-project-route="${projectRoute(projects[(index+1)%projects.length])}"><span class="mono">下一个项目 →</span><strong>${esc(projects[(index+1)%projects.length].title)}</strong></a></section>
        ${footer()}
      </article>`;
    $$('img',root).forEach(img=>img.addEventListener('error',()=>img.remove()));
    ui = {kind:'project',article:$('.detail-route',root),heroTitle:$('.project-detail-title',root),projectCover:$('.project-detail-cover',root),sections:$$('[data-detail-section]',root),sectionButtons:$$('.detail-section-nav button',root),footerPhoto:$('.footer-portrait',root)};
    measure();
  }

  function media(path, label, extra = '') {
    return `<span class="detail-image ${extra}"><span class="detail-media-grid"></span><span class="detail-media-cross"></span><span class="detail-media-label mono">${esc(label)}</span>${path ? `<img src="${esc(path)}" alt="${esc(label)}" loading="lazy" decoding="async">` : ''}</span>`;
  }
  function coverLink(project,index,coverOnly,kind,collection='projects') {
    const start=kind==='work'?`<a href="#${esc(projectRoute(project))}"`:'<button';
    return `${start} class="project-art project-art-main" data-project-index="${index}" data-project-collection="${collection}" aria-label="查看${esc(project.title)}">${media(project.image,coverOnly?'COVER / '+String(index+1).padStart(2,'0'):'IMAGE / '+String(index*3+7).padStart(2,'0'))}<span class="project-open">↗</span>${kind==='work'?'</a>':'</button>'}`;
  }
  function sculpture() {
    return `<svg viewBox="0 0 620 720" role="img" aria-label="主视觉图片占位"><defs><radialGradient id="object-blue" cx=".32" cy=".18" r=".87"><stop stop-color="#366ba6"/><stop offset=".42" stop-color="#183858"/><stop offset=".8" stop-color="#0c1929"/><stop offset="1" stop-color="#060b12"/></radialGradient><linearGradient id="object-edge" x1="0" x2="1"><stop stop-color="#1e90ff"/><stop offset="1" stop-color="#1e90ff" stop-opacity="0"/></linearGradient></defs><path d="M55 430C28 220 110 65 286 53c173-13 273 120 264 295l-5 233-150 87-222-34-102-95Z" fill="url(#object-blue)" stroke="#6287af" stroke-opacity=".3"/><path d="M76 360c83-44 194-66 315-39l139 65-9 86-146-40-286 7Z" fill="#080f1b" stroke="#2579cf" stroke-opacity=".7"/><path d="M57 428c137 25 300-25 492 103M81 538c103 6 205 5 312 129M134 109c-55 167-6 367 103 537M240 58c-83 215-12 418 70 595M377 67c-45 130 12 316 126 547M477 155c-43 133-15 297 61 389M74 268c100-57 276-66 445 26M66 206c108-74 250-92 415 19M69 493c97 33 308 14 475 97" fill="none" stroke="#6b9bd1" stroke-width="1" opacity=".28"/><path d="M61 431c-29-208 52-359 225-372" fill="none" stroke="url(#object-edge)" stroke-width="3"/><path d="m174 526 164 7 56 44-169-18Z" fill="#102b4b" stroke="#3e6c9c"/><circle cx="408" cy="490" r="19" fill="#05090f" stroke="#34597e"/><circle cx="408" cy="490" r="9" fill="none" stroke="#71a9dc"/><path d="m114 587 88 24m12 4 88 24m13 4 38 11" stroke="#1e90ff" stroke-width="3" opacity=".55"/><text x="280" y="258" text-anchor="middle" fill="#7197be" font-family="monospace" font-size="12" letter-spacing="3">IMAGE / 01</text><path d="M280 160v30m-15-15h30" stroke="#8fb9e3" opacity=".6"/></svg>`;
  }
  function lifeEditorial(profile){
    return `<div class="life-editorial-meta"><span>${esc(profile.name)}</span><span class="mono">GAME DESIGN / BASEBALL</span></div><figure class="life-editorial-photo"><button type="button" data-life-photo="${esc(profile.heroPhoto)}" data-caption="${esc(profile.heroPhotoCaption)}" aria-label="放大个人介绍照片"><img src="${esc(profile.heroPhoto)}" srcset="${esc(profile.heroPhotoSmall)} 640w, ${esc(profile.heroPhoto)} ${profile.heroPhotoWidth}w" sizes="(max-width:600px) 84vw, 43vw" alt="${esc(profile.heroPhotoAlt)}" width="${profile.heroPhotoWidth}" height="${profile.heroPhotoHeight}" fetchpriority="high" decoding="async"></button><figcaption>${esc(profile.heroPhotoCaption)}</figcaption></figure><p class="life-editorial-note">球场之外，也记录宠物、收藏、速写与模型。<span class="mono">XU KE / EVERYDAY LIFE</span></p>`;
  }
  function lifePhotoSection(collection,number){
    const isTeam=collection.id==='team',heading=isTeam?['我与','我的球队']:['生活','片段'];
    // Each chapter is a continuous composition; paired smaller photos share a column.
    const desktop=[[.07,.40,.22,.44],[.42,.14,.335,.60],[.84,.28,.19,.34],[.84,.67,.19,.21],[1.11,.14,.335,.62],[1.53,.30,.19,.33],[1.53,.67,.19,.21],[1.80,.14,.335,.62]];
    const mobile=[[.08,.44,.62,.41],[.77,.24,.70,.52],[1.54,.44,.54,.37],[1.54,.18,.54,.22],[2.16,.24,.70,.52],[2.93,.44,.54,.37],[2.93,.18,.54,.22],[3.55,.24,.70,.52]];
    let width=0,mobileWidth=0;
    const groups=collection.items.map((group,index)=>{
      const start=width,mobileStart=mobileWidth;
      const photos=group.photos.map((photo,i)=>{
        const d=group.photos.length===1?[.42,.14,.335,.60]:desktop[i],m=group.photos.length===1?[.08,.34,.70,.52]:mobile[i];
        return {...photo,localIndex:i+1,total:group.photos.length,d:[start+d[0],...d.slice(1)],m:[mobileStart+m[0],...m.slice(1)]};
      });
      width+=Math.max(1.03,...photos.map(p=>p.d[0]-start+p.d[2]+.10));
      mobileWidth+=Math.max(1.03,...photos.map(p=>p.m[0]-mobileStart+p.m[2]+.10));
      return {...group,index,start,mobileStart,photos};
    });
    const anchors=groups.map(g=>g.start.toFixed(3)).join(','),mobileAnchors=groups.map(g=>g.mobileStart.toFixed(3)).join(',');
    const panels=groups.flatMap(group=>group.photos.map(photo=>`<section class="project-panel life-photo-panel${photo.d[1]>.6?' life-photo-lower':photo.d[3]<.4?' life-photo-paired':''}" style="--photo-x:${photo.d[0]};--photo-y:${photo.d[1]};--photo-width:${photo.d[2]};--photo-height:${photo.d[3]};--mobile-x:${photo.m[0]};--mobile-y:${photo.m[1]};--mobile-width:${photo.m[2]};--mobile-height:${photo.m[3]};--photo-ratio:${photo.width/photo.height}" aria-label="${esc(photo.alt)}"><span class="life-photo-caption mono">${esc(group.title)} · ${String(photo.localIndex).padStart(2,'0')} / ${String(photo.total).padStart(2,'0')}</span><button class="life-photo-button" data-life-photo="${esc(photo.image)}" data-caption="${esc(photo.alt)}" aria-label="放大查看：${esc(photo.alt)}"><span class="life-photo-frame"><img src="${esc(photo.thumbnail)}" srcset="${esc(photo.thumbnail)} ${photo.smallWidth}w, ${esc(photo.image)} ${photo.width}w" sizes="(max-width:600px) ${Math.round(photo.m[2]*100)}vw, ${Math.round(photo.d[2]*100)}vw" width="${photo.width}" height="${photo.height}" alt="${esc(photo.alt)}" loading="lazy" decoding="async"><span aria-hidden="true">↗</span></span></button></section>`));
    return `<section class="detail-section detail-horizontal life-moments${isTeam?' life-team':''}" data-detail-section="${collection.id}" data-horizontal-id="${collection.id}" data-editorial-width="${width}" data-editorial-mobile-width="${mobileWidth}" data-editorial-anchors="${anchors}" data-editorial-mobile-anchors="${mobileAnchors}"><div class="detail-sticky project-viewport" tabindex="0" aria-label="${esc(collection.title)}，向下滚动以横向浏览"><span class="projects-wheel-hint mono"><span class="projects-pointer-hint">向下滚动 · 横向浏览</span><span class="projects-touch-hint">上滑浏览 · 也可左右轻扫</span> <i>→</i></span><div class="project-track" style="--life-track-width:${width};--life-mobile-track-width:${mobileWidth}"><header class="projects-heading"><span class="mono">${String(number).padStart(2,'0')} / ${esc(collection.english)}</span><h2><strong>${esc(heading[0])}</strong><em>${esc(heading[1])}</em></h2></header>${groups.map(group=>`<header class="life-photo-group${group.index===0?' life-photo-group-first':''}" style="--group-x:${group.start};--mobile-group-x:${group.mobileStart}"><span class="mono">${String(group.index+1).padStart(2,'0')} / ${String(groups.length).padStart(2,'0')}</span><h3>${esc(group.title)}</h3><p class="mono">${esc(group.category)}</p></header>`).join('')}${panels.join('')}</div><div class="projects-controls life-photo-controls"><span class="mono"><b class="project-current">01</b> / ${String(groups.length).padStart(2,'0')}</span><div class="project-dots life-group-nav" aria-label="${esc(collection.title)}照片分类">${groups.map((group,i)=>`<button data-project-position="${i}" data-project-collection="${collection.id}" aria-label="前往${esc(group.title)}" class="${i===0?'active':''}">${esc(group.title)}</button>`).join('')}</div><span class="projects-mini-progress"><i></i></span></div></div></section>`;
  }
  function horizontalSection({id,title,english,items:projects},number,coverOnly,name) {
    if(name==='life'&&projects.length&&projects.every(project=>Array.isArray(project.photos)))return lifePhotoSection({id,title,english,items:projects},number);
    return `<section class="detail-section detail-horizontal" data-detail-section="${id}" data-horizontal-id="${id}"><div class="detail-sticky project-viewport" tabindex="0" aria-label="${esc(title)}，向下滚动以横向浏览">
          <header class="projects-heading"><span class="mono">${String(number).padStart(2,'0')} / ${esc(english)}</span><h2>${esc(title)}</h2></header>
          <span class="projects-wheel-hint mono"><span class="projects-pointer-hint">向下滚动 · 横向浏览</span><span class="projects-touch-hint">上滑浏览 · 也可左右轻扫</span> <i>→</i></span>
          <div class="project-track">${projects.map((project,i)=>`<section class="project-panel" aria-label="${esc(project.title)}"><div class="project-panel-title"><span class="mono">${String(i+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}</span><h3>${esc(project.title)}</h3>${coverOnly?'':`<span class="mono">${esc(project.category)}</span>`}</div>${coverLink(project,i,coverOnly,name,id)}${coverOnly?'':`<button class="project-art project-art-top" data-project-index="${i}" data-project-collection="${id}" aria-label="查看${esc(project.title)}细节">${media(project.detailImage,'DETAIL / '+String(i+1).padStart(2,'0'))}</button><div class="project-art project-art-small" aria-hidden="true">${media('', 'VISUAL / '+String(i+1).padStart(2,'0'))}</div><span class="project-panel-foot mono">${esc(project.category)}</span>`}</section>`).join('')}</div>
          <div class="projects-controls"><span class="mono"><b class="project-current">01</b> / ${String(projects.length).padStart(2,'0')}</span><div class="project-dots">${projects.map((p,i)=>`<button data-project-position="${i}" data-project-collection="${id}" aria-label="前往${esc(p.title)}" class="${i===0?'active':''}"></button>`).join('')}</div><span class="projects-mini-progress"><i></i></span></div>
        </div></section>`;
  }
  function build(name) {
    data = window.PORTFOLIO_CONTENT.pages[name];
    const projects = data.projects;
    const profile = name === 'life' ? data.profile : null;
    const resume=name==='work'&&window.WorkProfile;
    const hasStatement = data.showStatement !== false, hasCollage = data.showGallery !== false, coverOnly = data.projectLayout === 'covers';
    const collections=[...(name==='life'&&data.team?[{id:'team',...data.team}]:[]),{id:'projects',title:data.projectsTitle,english:name==='work'?'PERSONAL PROJECTS':'EVERYDAY MOMENTS',items:projects}];
    const sections = [
      ['hero', '开场'], ...(hasStatement ? [['story', '创作介绍']] : []),
      ...(hasCollage ? [['collage', data.galleryTitle]] : []),
      ...collections.map(collection=>[collection.id,collection.title])
    ];
    root.innerHTML = `
      <button class="detail-back mono" data-return>↖ 返回入口</button>
      <nav class="detail-section-nav" id="detail-section-navigation" aria-label="内页章节">${sections.map(([id,label],i)=>`<button data-section="${id}" aria-label="${esc(label)}" class="${i===0?'active':''}"><i></i><span>${String(i+1).padStart(2,'0')}</span></button>`).join('')}</nav>
      <article class="detail-route${profile?' has-life-profile':''}${resume?' work-profile':''}" data-route="${name}" data-project-layout="${coverOnly?'covers':'collage'}">
        <section class="detail-section detail-hero" data-detail-section="hero">
          <div class="detail-sticky detail-hero-view${profile?' life-editorial':''}">
            ${resume?window.WorkProfile.render():`<span class="detail-top-label mono">${esc(data.english)} / 2026</span>
            <h1 class="detail-hero-title" tabindex="-1"><em>${esc(data.title[0])}</em><strong>${esc(data.title[1])}</strong></h1>
            <svg class="detail-hero-scribble" viewBox="0 0 900 600" aria-hidden="true"><path d="M80 510C-70 580 250 190 415 150S840 15 725 210L462 513 535 282 330 558 649 30"/></svg>
            <div class="detail-object">${data.heroImage ? media(data.heroImage, 'IMAGE / 01', 'detail-object-image') : sculpture()}<span class="mono detail-object-note">${esc(data.mark)} / VISUAL PLACEHOLDER</span></div>
            <div class="detail-hero-copy">${profile?`<span class="detail-copy-kicker mono">ABOUT / ${esc(profile.name)}</span><p class="life-hero-intro">${esc(profile.intro)}</p><div class="detail-facts">${profile.facts.map(fact=>`<div><span class="mono">${esc(fact.label)}</span><b>${esc(fact.value)}</b><span class="mono">${esc(fact.detail)}</span></div>`).join('')}</div>`:`<div class="detail-meta mono"><span>PORTFOLIO / 2026</span><span>${esc(data.english)}</span><span>IMAGE / 01</span></div><span class="detail-copy-kicker mono">ABOUT / TEXT PLACEHOLDER</span><div class="detail-copy-lines" aria-label="简介文字占位"><i></i><i></i><i></i><i></i></div><svg class="detail-small-signature" viewBox="0 0 100 38" aria-hidden="true"><path d="m3 28 50-21-29 26L68 6 46 30l42-16-21 21M8 27l83-4"/></svg><div class="detail-facts"><div><span class="mono">PROJECT / 01</span><b>—</b><span class="mono">CONTENT PLACEHOLDER</span></div><div><span class="mono">PROJECT / 02</span><b>—</b><span class="mono">CONTENT PLACEHOLDER</span></div><div><span class="mono">PROJECT / 03</span><b>—</b><span class="mono">CONTENT PLACEHOLDER</span></div></div>`}</div>
            <button class="detail-scroll mono" data-section="${sections[1][0]}">SCROLL TO EXPLORE <span>↓</span></button>
            ${profile?lifeEditorial(profile):''}`}
          </div>
        </section>

        ${hasStatement ? `<section class="detail-section detail-story" data-detail-section="story"><div class="detail-sticky">
          <span class="detail-section-kicker mono">${String(sections.findIndex(([id])=>id==='story')+1).padStart(2,'0')} / ${name === 'work' ? 'CREATIVE STATEMENT' : 'LIFE IN MOTION'}</span>
          <div class="detail-story-type" aria-label="标题内容占位">${data.statement.map((line, i) => `<span class="story-line story-line-${i}">${esc(line)}</span>`).join('')}</div>
          <div class="detail-statement-media">${media(data.statementImage, 'IMAGE / 02')}<span class="mono">TEXT / IMAGE PLACEHOLDER</span></div>
          <span class="detail-story-bottom mono">SCROLL TO REVEAL ↓</span>
        </div></section>` : ''}
        ${hasCollage ? `<section class="detail-section detail-collage" data-detail-section="collage"><div class="detail-sticky">
          <span class="detail-section-kicker mono">${String(sections.findIndex(([id])=>id==='collage')+1).padStart(2,'0')} / SELECTED VISUALS</span><h2 class="detail-collage-heading"><em>${esc(data.galleryTitle.slice(0, 2))}</em><strong>${esc(data.galleryTitle.slice(2))}</strong></h2>
          ${[0, 1, 2, 3].map((i) => `<figure class="detail-collage-card collage-${i}">${media(projects[i % projects.length].detailImage || projects[i % projects.length].image, 'IMAGE / '+String(i+3).padStart(2,'0'))}<figcaption class="mono">VISUAL / ${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('')}
          <button class="detail-collage-next mono" data-section="projects">${esc(data.projectsTitle)} ↘</button>
        </div></section>` : ''}
        ${collections.map(collection=>horizontalSection(collection,sections.findIndex(([id])=>id===collection.id)+1,coverOnly,name)).join('')}
        ${footer()}
      </article>`;
    $$('img', root).forEach(img => img.addEventListener('error',()=>img.remove()));
    ui = {
      kind:'collection',article: $('.detail-route',root), heroTitle: $('.detail-hero-title',root), object: $('.detail-object',root),
      resume:!!resume,editorial:!!profile,heroView:$('.detail-hero-view',root),heroPhoto:$('.life-editorial-photo',root),
      scribble: $('.detail-hero-scribble',root), heroCopy: $('.detail-hero-copy',root),
      storyLines: $$('.story-line',root), statement: $('.detail-statement-media',root),
      collageCards: $$('.detail-collage-card',root), collageTitle: $('.detail-collage-heading',root),
      sections: $$('[data-detail-section]',root), track: $('.project-track',root),
      panels: $$('.project-panel',root), projectCurrent: $('.project-current',root),
      projectDots: $$('.project-dots button',root), miniProgress: $('.projects-mini-progress i',root),
      sectionButtons: $$('.detail-section-nav button',root), viewport: $('.project-viewport',root),footerPhoto:$('.footer-portrait',root)
    };
    ui.collections=collections.map(collection=>{const el=$(`[data-horizontal-id="${collection.id}"]`,root);return {...collection,el,track:$('.project-track',el),panels:$$('.project-panel',el),current:$('.project-current',el),dots:$$('.project-dots button',el),progress:$('.projects-mini-progress i',el),viewport:$('.project-viewport',el)};});
    // Keep the primary collection references for project routes and existing consumers.
    const primary=ui.collections.find(collection=>collection.id==='projects');Object.assign(ui,{track:primary.track,panels:primary.panels,projectCurrent:primary.current,projectDots:primary.dots,miniProgress:primary.progress,viewport:primary.viewport});
    measure();
    if((profile||resume)&&typeof ResizeObserver!=='undefined'){
      projectObserver=new ResizeObserver(()=>{if(route===name){
        // Keep the old viewport metrics until resize has restored the photo anchor.
        if(metrics&&(metrics.w!==innerWidth||metrics.h!==window.PortfolioViewport()))return;
        measure();if(jump?.section)target=jump.to=metrics.sections[jump.section].start;render(position);
      }});
      projectObserver.observe(ui.heroView);
    }
  }
  function measure() {
    if(!ui)return;
    const h=window.PortfolioViewport(),w=innerWidth,mobile=w<=600;
    if(ui.kind==='project'){
      let offset=0;metrics={h,w,mobile,travel:0,sections:{}};
      if(ui.caseStudy){
        for(const el of ui.sections){const start=el.getBoundingClientRect().top+scrollY;metrics.sections[el.dataset.detailSection]={start,length:el.offsetHeight||h,anchor:Math.max(0,start+(parseFloat(getComputedStyle(el).paddingTop)||0)-(w<=600?140:150))};}
        metrics.max=Math.max(0,root.scrollHeight-h);ui.article.dataset.scrollHeight=String(root.scrollHeight);return;
      }
      for(const el of ui.sections){const length=el.offsetHeight||h;metrics.sections[el.dataset.detailSection]={start:offset,length};offset+=length;}
      metrics.max=Math.max(0,offset-h);ui.article.dataset.scrollHeight=String(offset);return;
    }
    const panelWidth=w*(mobile?1:.85),collections=Object.fromEntries(ui.collections.map(collection=>{
      const attributes=collection.el.dataset,units=Number(mobile?attributes.editorialMobileWidth:attributes.editorialWidth);
      if(units){const travel=Math.max(0,units*w-w),anchors=(mobile?attributes.editorialMobileAnchors:attributes.editorialAnchors).split(',').map(x=>Math.min(Number(x)*w,travel));return [collection.id,{panelWidth:w,travel,anchors}];}
      return [collection.id,{panelWidth,travel:Math.max(0,panelWidth*collection.panels.length-w)}];
    })),travel=collections.projects.travel;
    const spans={hero:h*1.45,story:h*1.85,collage:h*1.4,projects:h+travel/1.35,footer:h*1.05};
    let offset=0;metrics={h,w,mobile,panelWidth,travel,collections,sections:{}};
    for(const el of ui.sections){
      const name=el.dataset.detailSection;
      const length=collections[name]?h+collections[name].travel/1.35:name==='hero'?Math.max(spans.hero,ui.heroView.offsetHeight):name==='profile'?el.offsetHeight:name==='footer'?Math.max(spans[name],parseFloat(getComputedStyle(el).minHeight)||0):spans[name];
      metrics.sections[name]={start:offset,length};if(name!=='profile')el.style.height=length+'px';offset+=length;
    }
    metrics.max=Math.max(0,offset-h);
    root.style.setProperty('--project-panel-width',panelWidth+'px');
    ui.article.dataset.scrollHeight=String(offset);
  }
  function render(y){
    if(!metrics||route==='home')return;
    const {h,w,sections:s}=metrics;
    document.documentElement.style.setProperty('--header-color',menuPaused?'#f3f3eb':ui.caseStudy?ui.headerColor:route==='life'?'#0a2447':'#f3f3eb');
    if(ui.footerPhoto&&!ui.caseStudy)ui.footerPhoto.style.transform=`translate3d(${mouseX*8}px,${mouseY*5}px,0)`;
    if(ui.kind==='project'){
      if(!ui.caseStudy)ui.projectCover.style.transform=`translate3d(0,${clamp(y/h)*22}px,0)`;
      ui.sectionButtons.forEach((button,i)=>{const section=s[button.dataset.section],next=ui.sectionButtons[i+1];const active=ui.caseStudy?(y>=section.anchor-2||i===0)&&(!next||y<s[next.dataset.section].anchor-2):y>=section.start-h*.2&&y<section.start+section.length-h*.2;if(button.classList.contains('active')!==active){button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');}if(active&&ui.caseStudy&&ui.activeToc!==button.dataset.section){ui.activeToc=button.dataset.section;ui.toc.scrollTop=Math.max(0,button.offsetTop-ui.toc.clientHeight/2+button.offsetHeight/2);}});
      progress.style.transform=`scaleX(${clamp(y/Math.max(1,metrics.max))})`;return;
    }
    const hp=clamp(y/Math.max(1,s.hero.length-h));
    if(ui.resume){
      // The resume is a normal reading layout, with no pointer or scroll transforms.
    }else if(ui.editorial){
      ui.heroTitle.style.transform=`translate3d(0,${-hp*28}px,0)`;
      ui.heroCopy.style.transform=`translate3d(0,${-hp*12}px,0)`;
      ui.heroPhoto.style.transform=`translate3d(0,${hp*12}px,0)`;
    }else{
    ui.heroTitle.style.transform=`translate3d(${-mouseX*9}px,${-hp*70-mouseY*6}px,0)`;
    ui.object.style.transform=`perspective(1300px) translate3d(${mouseX*18}px,${hp*15-mouseY*8}px,0) rotateY(${mouseX*9+hp*18}deg) rotateZ(${-4-hp*5}deg) scale(${mix(1,.9,hp)})`;
    ui.scribble.style.transform=`translate3d(${-mouseX*15}px,${-hp*35}px,0) rotate(${mouseX*3}deg)`;
    ui.heroCopy.style.transform=`translate3d(0,${-hp*35}px,0)`;
    }
    if(s.story){
      const sp=clamp((y-s.story.start)/Math.max(1,s.story.length-h));
      ui.storyLines.forEach((line,i)=>{line.style.transform=`translate3d(${(i%2?1:-1)*sp*w*.2+mouseX*(i+1)*4}px,${-sp*h*.13}px,0)`;line.style.opacity=1-smooth((sp-.45)/.55)*.85;});
      ui.statement.style.transform=`translate3d(calc(-50% + ${mouseX*12}px),calc(-50% + ${mouseY*8}px),0) rotate(${mix(-8,0,sp)}deg) scale(${mix(.58,2.6,smooth(sp))})`;
    }
    if(s.collage){
      const cp=clamp((y-s.collage.start)/Math.max(1,s.collage.length-h));
      ui.collageCards.forEach((card,i)=>card.style.transform=`translate3d(${-mouseX*(i+1)*4}px,${-cp*h*(.12+i*.07)-mouseY*6}px,0)`);
      ui.collageTitle.style.transform=`translateY(${-cp*h*.07}px)`;
    }
    for(const collection of ui.collections){
      const {travel,panelWidth,anchors}=metrics.collections[collection.id],x=clamp((y-s[collection.id].start)*1.35,0,travel);
      if(collection.x!==x){collection.x=x;collection.track.style.transform=`translate3d(${-x}px,0,0)`;collection.progress.style.transform=`scaleX(${travel?x/travel:1})`;}
      const index=anchors?Math.max(0,anchors.findLastIndex(anchor=>x>=anchor-2)):clamp(Math.round(x/panelWidth),0,collection.panels.length-1);
      if(collection.index!==index){collection.index=index;collection.current.textContent=String(index+1).padStart(2,'0');collection.dots.forEach((b,i)=>{const start=Number(b.dataset.projectPosition),next=collection.dots[i+1],active=index>=start&&(!next||index<Number(next.dataset.projectPosition));b.classList.toggle('active',active);if(active){b.setAttribute('aria-current','true');const nav=b.parentElement;if(nav.classList.contains('life-group-nav')&&collection.activeGroup!==i){collection.activeGroup=i;nav.scrollLeft=Math.max(0,b.offsetLeft-(nav.clientWidth-b.offsetWidth)/2);}}else b.removeAttribute('aria-current');});}
    }
    let active=0;
    ui.sectionButtons.forEach((button,i)=>{if(y>=s[button.dataset.section].start-h*.2)active=i;});
    ui.sectionButtons.forEach((button,i)=>{button.classList.toggle('active',i===active);if(i===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    progress.style.transform=`scaleX(${clamp(y/Math.max(1,metrics.max))})`;
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
  function horizontalAt(y){
    if(!metrics?.collections)return null;
    return Object.keys(metrics.collections).find(id=>{const section=metrics.sections[id];return y>=section.start-1&&y<=section.start+section.length-metrics.h+1;})||null;
  }
  function applyRoute(to,{chapter='explore',restore=false,projectIndex}={}){
    projectObserver?.disconnect();projectObserver=null;
    caseCleanup?.();caseCleanup=null;
    stop();route=to;mouseX=mouseY=aimX=aimY=0;
    if(to==='home'){
      $('.skip-link').href='#chapter-navigation';
      root.hidden=true;root.inert=true;document.body.classList.remove('detail-mode','detail-light');delete document.body.dataset.page;delete document.body.dataset.project;
      home.inert=false;window.PortfolioHome.resume(chapter,restore&&savedHome?.hash===('#'+chapter)?savedHome.scroll:undefined);
      document.title=window.PORTFOLIO_CONTENT.name.join(' ')+' / Portfolio';
    }else{
      const info=projectInfo(to);
      window.PortfolioHome.pause();document.body.classList.add('detail-mode');document.body.classList.toggle('detail-light',to==='life');document.body.dataset.page=info?'project':to;
      if(info)document.body.dataset.project=info.project.slug;else delete document.body.dataset.project;
      home.inert=true;root.hidden=false;if(info)buildProject(info);else build(to);root.inert=busy;
      let destination=restore?(savedPositions.get(to)||0):0;
      if(to==='work'&&Number.isInteger(projectIndex))destination=metrics.sections.projects.start+Math.min(projectIndex*metrics.panelWidth,metrics.travel)/1.35;
      position=target=clamp(destination,0,metrics.max);written=position;write(position);render(position);
      const title=info?(info.project.caseTitle||info.project.title):data.title.join('');
      $('.skip-link').href='#detail-section-navigation';$('.live-status').textContent=title;
      document.title=title+' / Portfolio';
    }
  }
  function transitionTo(to,{chapter='explore',push=true,restore=false,immediate=false,projectIndex}={}){
    if(busy)return;
    if(to!=='home'&&to!=='work'&&to!=='life'&&!projectInfo(to))return;
    window.PortfolioHome.closeMenu();
    if(route==='home')savedHome={...window.PortfolioHome.pause(),hash:location.hash||'#intro'};
    else savedPositions.set(route,position);
    stop();busy=true;document.body.classList.add('is-routing');home.inert=true;root.inert=true;$('.site-header').inert=true;document.body.style.overflow='hidden';
    if(push)history.pushState({page:to},'',to==='home'?'#'+chapter:'#'+to);
    const caption=routeCaption(to);
    $('.route-transition-caption').textContent=caption;
    if(immediate||reduced.matches||to==='work/project-03'||route==='work/project-03'){
      applyRoute(to,{chapter,restore,projectIndex});finish(chapter);return;
    }
    overlay.hidden=false;let started=null,switched=false;
    function animate(time){
      if(started===null)started=time;
      const p=clamp((time-started)/1350);
      const cover=smooth(p/.24),reveal=smooth((p-.48)/.52);
      overlay.style.transform=`translate3d(0,${(1-cover)*100}%,0)`;
      overlay.style.opacity=1-smooth((p-.92)/.08);
      const scale=mix(2.8,200,Math.pow(reveal,2.5));
      cutout.setAttribute('transform',`translate(800 450) scale(${scale}) translate(-50 -50)`);
      echo.style.opacity=1-smooth((p-.42)/.2);
      $('.route-transition-caption').style.opacity=1-reveal;
      if(!switched&&p>=.3){switched=true;applyRoute(to,{chapter,restore,projectIndex});}
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
    open(name){if(name!=='work'&&name!=='life')return;window.PortfolioHome.closeMenu();if(route===name&&!busy){scrollToPosition(0);return;}transitionTo(name);},
    home(chapter='explore',{immediate=false}={}){transitionTo('home',{chapter,immediate});}
  };
  document.addEventListener('click',e=>{
    if(performance.now()<suppressCoverClickUntil&&e.target.closest?.('.project-art,.life-photo-button')){e.preventDefault();return;}
    const language=e.target.closest?.('[data-resume-language]');if(language&&route==='work'&&!busy){window.WorkProfile.apply(root,language.dataset.resumeLanguage);measure();render(position);return;}
    const lifePhoto=e.target.closest?.('[data-life-photo]');if(lifePhoto&&route==='life'&&!busy){stop();window.PortfolioHome.preview(lifePhoto.dataset.lifePhoto,lifePhoto.dataset.caption);return;}
    const rewinderImage=e.target.closest?.('[data-rewinder-image]');
    if(rewinderImage&&route==='work/project-02'&&!busy){stop();window.RewinderCaseStudy.openImage(rewinderImage.dataset.rewinderImage,rewinderImage.dataset.caption);return;}
    const poroImage=e.target.closest?.('[data-poro-image]');
    if(poroImage&&route==='work/project-01'&&!busy){stop();window.PoroCaseStudy.openImage(poroImage.dataset.poroImage,poroImage.dataset.caption);return;}
    const moneyImage=e.target.closest?.('[data-money-image]');
    if(moneyImage&&ui?.caseStudy&&!busy){stop();window.MoneyBallCaseStudy.openImage(moneyImage.dataset.moneyImage,moneyImage.dataset.caption);return;}
    if(e.target.closest?.('[data-footer-home]')){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();window.PortfolioPages.home('intro',{immediate:true});return;}
    const projectPage=e.target.closest?.('[data-project-route]');
    if(projectPage){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();transitionTo(projectPage.dataset.projectRoute);return;}
    if(e.target.closest?.('[data-back-projects]')){e.preventDefault();const info=projectInfo(route);transitionTo('work',{projectIndex:info?.index||0});return;}
    const open=e.target.closest?.('[data-open-page]');
    if(open){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();window.PortfolioPages.open(open.dataset.openPage);return;}
    if(e.target.closest?.('[data-return]')){e.preventDefault();window.PortfolioPages.home();return;}
    const section=e.target.closest?.('[data-section]');if(section&&route!=='home'&&!busy){if(ui.caseStudy||data.profile||ui.resume)measure();const destination=metrics.sections[section.dataset.section];scrollToPosition(ui.caseStudy?destination.anchor:destination.start);if(jump)jump.section=section.dataset.section;return;}
    const dot=e.target.closest?.('[data-project-position]');if(dot&&route!=='home'&&!busy){const id=dot.dataset.projectCollection||'projects',collection=metrics.collections[id],index=Number(dot.dataset.projectPosition);scrollToPosition(metrics.sections[id].start+(collection.anchors?.[index]??Math.min(index*collection.panelWidth,collection.travel))/1.35);return;}
    const project=e.target.closest?.('[data-project-index]');
    if(project&&route!=='home'&&!busy){if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();const collection=ui.collections.find(collection=>collection.id===(project.dataset.projectCollection||'projects')),item=collection.items[Number(project.dataset.projectIndex)];if(route==='work')transitionTo(projectRoute(item));else{stop();window.PortfolioHome.preview(item.image,item.title+' / 内容待补充');}}
  });
  addEventListener('wheel',e=>{
    if(route==='home'||busy||menuPaused||dialog.open||e.ctrlKey||reduced.matches||!e.cancelable)return;
    if(e.target.closest?.('.life-group-nav')&&Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    const horizontal=horizontalAt(position);
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
  addEventListener('resize',()=>{
    if(route==='home'||!metrics)return;
    const old=metrics, entries=Object.entries(old.sections);
    const [name,section]=entries.find(([,s])=>position>=s.start&&position<s.start+s.length)||(position<entries[0][1].start?entries[0]:entries.at(-1));
    const projectOffset=old.collections?.[name]&&position<=section.start+section.length-old.h+1?(position-section.start)*1.35/old.collections[name].panelWidth:null;
    const oldCollection=old.collections?.[name],oldX=(position-section.start)*1.35,chapter=oldCollection?.anchors&&projectOffset!==null?Math.max(0,oldCollection.anchors.findLastIndex(anchor=>oldX>=anchor-2)):null;
    const chapterProgress=chapter!==null?clamp((oldX-oldCollection.anchors[chapter])/Math.max(1,(oldCollection.anchors[chapter+1]??oldCollection.travel)-oldCollection.anchors[chapter])):0;
    const local=(position-section.start)/section.length;
    measure();
    if(old.w===metrics.w&&old.h===metrics.h)return;
    // Preserve the current project instead of jumping to a different chapter.
    const next=metrics.sections[name];
    const collection=metrics.collections?.[name];
    const editorialX=chapter!==null?mix(collection.anchors[chapter],collection.anchors[chapter+1]??collection.travel,chapterProgress):null;
    position=target=clamp(editorialX!==null?next.start+editorialX/1.35:projectOffset!==null?next.start+Math.min(projectOffset*collection.panelWidth,collection.travel)/1.35:next.start+local*next.length,0,metrics.max);
    jump=null;touchGesture=null;write(position);render(position);
  });
  addEventListener('touchstart',e=>{
    touchGesture=null;
    if(route==='home'||busy||menuPaused||dialog.open||e.touches.length!==1)return;
    if(e.target.closest?.('.life-group-nav'))return;
    jump=null;target=position;
    const id=e.target.closest?.('[data-horizontal-id]')?.dataset.horizontalId;
    if(!id||!e.target.closest?.('.project-viewport')||horizontalAt(position)!==id)return;
    const p=e.touches[0];
    touchGesture={collection:id,x:p.clientX,y:p.clientY,scroll:position,lastX:p.clientX,lastTime:performance.now(),velocity:0,horizontal:false};
  },{passive:true});
  addEventListener('touchmove',e=>{
    if(!touchGesture)return;
    if(e.touches.length!==1){touchGesture=null;return;}
    const p=e.touches[0],g=touchGesture,dx=p.clientX-g.x,dy=p.clientY-g.y;
    if(!g.horizontal){
      if(Math.max(Math.abs(dx),Math.abs(dy))<10)return;
      if(Math.abs(dx)<=Math.abs(dy)*1.15){touchGesture=null;return;}
      g.horizontal=true;
    }
    if(!e.cancelable){touchGesture=null;return;}
    e.preventDefault();
    const now=performance.now(),dt=now-g.lastTime;
    if(dt>0)g.velocity=mix(g.velocity,(p.clientX-g.lastX)/dt,.65);
    g.lastX=p.clientX;g.lastTime=now;
    const projects=metrics.sections[g.collection],collection=metrics.collections[g.collection];
    target=clamp(g.scroll-dx/1.35,projects.start,projects.start+collection.travel/1.35);
    suppressCoverClickUntil=now+350;request();
  },{passive:false});
  addEventListener('touchend',()=>{
    if(touchGesture?.horizontal){
      const g=touchGesture,projects=metrics.sections[g.collection],collection=metrics.collections[g.collection];
      const momentum=performance.now()-g.lastTime<100?clamp(-g.velocity*120,-metrics.w*.5,metrics.w*.5)/1.35:0;
      target=clamp(target+momentum,projects.start,projects.start+collection.travel/1.35);
      suppressCoverClickUntil=performance.now()+350;request();
    }
    touchGesture=null;
  },{passive:true});
  addEventListener('touchcancel',()=>{touchGesture=null;},{passive:true});
  document.addEventListener('pointermove',e=>{if(route==='home'||ui?.caseStudy||busy||menuPaused||reduced.matches||e.pointerType==='touch')return;aimX=clamp(e.clientX/innerWidth*2-1,-1,1);aimY=clamp(e.clientY/innerHeight*2-1,-1,1);request();},{passive:true});
  document.addEventListener('pointerleave',()=>{aimX=aimY=0;request();});
  document.addEventListener('portfolio:menu',e=>{menuPaused=e.detail.open;if(menuPaused){stop();if(route!=='home')document.documentElement.style.setProperty('--header-color','#f3f3eb');}else request();});
  document.addEventListener('keydown',e=>{
    if(route==='home'||busy||menuPaused||dialog.open||!metrics)return;
    const id=horizontalAt(position);
    if(id&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();const collection=metrics.collections[id],start=metrics.sections[id].start,direction=e.key==='ArrowRight'?1:-1;
      const x=(target-start)*1.35,next=collection.anchors?(direction>0?collection.anchors.find(anchor=>anchor>x+2)??collection.travel:collection.anchors.findLast(anchor=>anchor<x-2)??0):null;
      scrollToPosition(clamp(next===null?target+direction*collection.panelWidth/1.35:start+next/1.35,start,start+collection.travel/1.35));}
  });
  function readLocation(){const hash=location.hash.slice(1);return hash==='work'||hash==='life'||projectInfo(hash)?{to:hash,restore:true}:{to:'home',chapter:['intro','message','gallery','explore'].includes(hash)?hash:'intro',restore:true};}
  addEventListener('popstate',()=>{const next=readLocation();if(busy)queuedPop=next;else transitionTo(next.to,{...next,push:false});});
  const initial=readLocation();if(initial.to!=='home'){window.PortfolioHome.pause();applyRoute(initial.to);root.inert=false;}
})();
