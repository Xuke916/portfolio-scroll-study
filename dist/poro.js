(() => {
 'use strict';
 const base='assets/poro/';
 const sizes={1:[1280,735],2:[1280,960],3:[1086,1448],5:[480,270],7:[1280,235],8:[1280,671],9:[1280,576],10:[1280,578],11:[1280,299],12:[640,640],13:[1280,575],14:[960,728],15:[1000,500],16:[1000,1000],17:[736,414],18:[480,283],19:[480,219],20:[480,219],21:[480,219],22:[480,219],23:[480,219],24:[480,248],25:[480,219],26:[480,219],27:[480,219]};
 const chapters=[['projectHero','项目概览'],['poroCharacter','认识魄罗'],['poroReference','玩法的由来'],['poroGrapple','钩锁与反弹'],['poroFall','坠落与提示'],['poroLevel','关卡安排'],['poroTeam','团队协作']];
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const source=n=>base+(n>=18?`image${n}.gif`:n===12?'image12.png':`image${n}_light.jpg`);
 function photo(n,alt,caption,cls=''){
  const [width,height]=sizes[n];
  return `<figure class="poro-photo ${cls}"><button class="poro-image" data-poro-image="${source(n)}" data-caption="${esc(caption.replace(/<[^>]*>/g,''))}" aria-label="放大查看：${esc(alt)}"><img src="${source(n)}" alt="${esc(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"><span class="poro-enlarge" aria-hidden="true">↗</span></button><figcaption>${caption}</figcaption></figure>`;
 }
 function motion(n,title,caption){
  const [width,height]=sizes[n],poster=base+`still-${n}.png`;
  return `<figure class="poro-photo poro-motion" data-motion-figure><div class="poro-motion-frame"><img src="${poster}" data-still="${poster}" data-motion-src="${source(n)}" alt="${esc(title)}" width="${width}" height="${height}" loading="lazy" decoding="async"></div><div class="poro-motion-control"><span class="mono">GAMEPLAY / ${String(n-17).padStart(2,'0')}</span><button type="button" data-poro-motion data-title="${esc(title)}" aria-label="播放演示：${esc(title)}" aria-pressed="false">播放演示 <span aria-hidden="true">▶</span></button></div><figcaption><strong>${title}</strong>${caption?`<span>${caption}</span>`:''}</figcaption></figure>`;
 }
 const section=(id,no,en,title,lead,body)=>`<section class="poro-section" data-detail-section="${id}"><header class="poro-section-head"><span class="mono poro-eyebrow">${no} / ${en}</span><h2>${title}</h2><p>${lead}</p></header>${body}</section>`;
 const more=(label,body)=>`<details class="poro-more"><summary>${label}<span aria-hidden="true">＋</span></summary>${body}</details>`;
 function render({pagination}){
  return `<button class="poro-toc-toggle" type="button" aria-label="打开项目目录" aria-controls="detail-section-navigation" aria-expanded="false">目录</button><nav class="poro-toc" id="detail-section-navigation" aria-label="魄罗大冒险项目章节"><span class="mono poro-toc-title">PORO'S ADVENTURE</span>${chapters.map(([id,label],i)=>`<button data-section="${id}"${i===0?' class="active" aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</nav>
   <article class="detail-route project-detail poro-case" data-route="work/project-01">
    <section class="poro-section poro-hero" data-detail-section="projectHero">
     <span class="mono poro-eyebrow">PERSONAL PROJECT / 01 · GAME DESIGN & ART</span>
     <div class="poro-hero-heading"><div><h1 class="project-detail-title" tabindex="-1">魄罗大冒险</h1><p class="poro-english">PORO'S ADVENTURE</p></div><p class="poro-hero-summary">把魄罗柔软、活泼的身体，<br>变成玩家手中的移动体验。</p></div>
     <p class="poro-intro">以《英雄联盟》中的小生物魄罗为灵感的 2D 像素平台动作游戏。我希望玩家通过移动和身体变化，亲手感受到这个角色的魅力。</p>
     <div class="poro-outcome"><span>《英雄联盟》IP 游戏创意大赛 · 最佳 IP 奖</span><p>2025 年正式上线《英雄联盟手游》，成为冬日活动玩法。</p></div>
     <dl class="poro-facts"><div><dt>制作时间 / 团队</dt><dd>2024.10 — 2025.01<br>5 人团队</dd></div><div><dt>我的工作</dt><dd>项目负责人、玩法策划<br>角色与场景美术、角色动画</dd></div><div><dt>工具 / 版本</dt><dd>Unity · Aseprite<br>安卓比赛原型 → 手游限时内容</dd></div></dl>
     <figure class="poro-photo poro-cover"><button class="poro-image" data-poro-image="${base}launch-cn.jpg" data-caption="上线活动页面 · 《英雄联盟手游》冬日活动" aria-label="放大查看魄罗大冒险上线活动页面"><img src="${base}launch-cn.jpg" alt="魄罗大冒险在英雄联盟手游中的冬日活动入口，蓝色雪山背景与魄罗主视觉" width="2336" height="1080" fetchpriority="high" decoding="async"><span class="poro-enlarge" aria-hidden="true">↗</span></button><figcaption>上线活动页面 · 《英雄联盟手游》冬日活动</figcaption></figure>
     <div class="poro-reading-links"><button data-section="poroGrapple">看钩锁与反弹 <span>↓</span></button><button data-section="poroFall">看试玩后的修改 <span>↓</span></button></div>
     <div class="poro-awards">${photo(2,'比赛颁奖合影的 AI 英文翻译展示版','比赛颁奖合影 · AI 英文翻译展示版')}${photo(3,'最佳 IP 奖证书的 AI 英文翻译展示版','最佳 IP 奖证书 · AI 英文翻译展示版')}</div>
     ${more('上线页面的英文翻译展示版',photo(1,'上线活动页面的 AI 英文翻译展示版','AI 英文翻译展示版，用于辅助阅读；原始上线页面见上方封面。'))}
    </section>
    ${section('poroCharacter','02','MEET THE PORO','先从它的身体出发','白色绒毛、圆圆的身体、小角与吐舌表情，让魄罗显得柔软、亲近，也让人想小心照顾它。',`
     <div class="poro-character-gallery">${photo(14,'白色魄罗的圆润身体、小角和吐舌表情','角色形象参考')}${photo(15,'雪地中的魄罗','冰雪环境中的魄罗')}${photo(16,'魄罗的绒毛与吐舌表情','圆润轮廓与表情')}</div>
     <div class="poro-prose"><h3>让角色的特点出现在反复发生的动作里</h3><p>我选择跳跃、起跳和落地来做身体变形，再用钩锁的碰撞反弹表现弹性。本作另设高处坠落会摔死的规则，让快速移动也带着需要小心的风险。</p></div>
     <div class="poro-character-movement">${motion(18,'待机与走路','观察魄罗身体的摆动和移动节奏。')}<dl class="poro-design-links"><div><dt>柔软与活泼</dt><dd>起跳时伸展，落地时压缩，让玩家反复看见身体变化。</dd></div><div><dt>Q 弹</dt><dd>用钩锁蓄力与碰撞反弹，让弹性成为可以亲手触发的动作。</dd></div><div><dt>需要小心对待</dt><dd>用下落距离限制与可见的安全边界，引导玩家留意落差。</dd></div></dl></div>
    `)}
    ${section('poroReference','03','FROM REFERENCE TO PLAY','工具怎样改变一条路线','《Animal Well》给我们的参考，是让工具与环境产生联系。工具的用途会影响玩家怎样穿过空间，也会改变他们对路线的理解。',`
     <div class="poro-pair">${photo(17,'Animal Well 的平台、落差与环境布置参考','《Animal Well》平台空间参考')}${photo(5,'Animal Well 的环境与平台场景','环境布置参考 · <a href="https://www.animalwell.net/" target="_blank" rel="noopener noreferrer">Shared Memory 官方网站 ↗</a>')}</div>
     <div class="poro-prose"><h3>继续深化钩锁，让它接上魄罗的弹性</h3><p>钩锁先把魄罗带向目标位置，强化后再接上蓄力、碰撞与反弹。我关注的是移动怎样发生变化，以及这种变化能否让玩家感受到魄罗的弹性。</p></div>
     <ol class="poro-milestones" aria-label="移动能力的学习顺序"><li><span class="mono">01</span><h3>跳跃与下落</h3><p>先认识移动方式与落差。</p></li><li><span class="mono">02</span><h3>基础钩锁</h3><p>尝试瞄准、出钩与位移。</p></li><li><span class="mono">03</span><h3>蓄力与反弹</h3><p>在熟悉的移动上加入新判断。</p></li></ol>
    `)}
    ${section('poroGrapple','04','GRAPPLE & BOUNCE','把 Q 弹变成一种操作','强化钩锁把蓄力、移动、碰撞和弹开接在一起，让魄罗的身体特点成为穿越地形时会用到的能力。',`
     ${motion(19,'强化钩锁：蓄力、出钩与反弹','获得强化钩锁后的移动过程。')}
     ${photo(7,'强化钩锁从蓄力、向前移动、碰撞地形到弹开的四步示意','强化钩锁动作逻辑 · 蓄力 → 出钩 → 碰撞 → 反弹','poro-diagram')}
     <div class="poro-prose"><h3>升级加入对速度和去向的判断</h3><p>基础钩锁先让玩家熟悉瞄准和出钩。强化后，玩家还要预想碰撞会把魄罗带向哪里，弹开后能落到哪一处。升级沿用熟悉的操作，再加入对速度和去向的判断。</p><h3>动作与玩法一起制作</h3><p>我也负责角色动画，用 Aseprite 制作起跳时的伸展和落地时的压缩。我希望可见的身体变化能与弹性移动呼应，让角色的样子和玩家手中的操作连在一起。</p></div>
     ${more('更多钩锁动作演示',`<div class="poro-motion-grid">${motion(20,'基础钩锁 · 位移','观察出钩后的位移。')}${motion(21,'基础钩锁 · 另一段地形','在另一段地形中使用钩锁。')}${motion(22,'强化钩锁 · 速度与去向','观察蓄力与碰撞后的去向。')}</div>`)}
    `)}
    ${section('poroFall','05','RISK & FEEDBACK','保留风险，也给出理解风险的线索','本作设定从超过约 3 格的高度落下会摔死。我希望玩家来到平台边缘时，先判断下方落差，再决定怎样下去。',`
     <div class="poro-revision"><div><span class="mono">最初的想法</span><h3>通过尝试，逐渐理解坠落规则</h3><p>最初，我们希望玩家通过跳跃、摔落死亡，逐渐理解“高处跳下会摔死”。</p></div><div><span class="mono">试玩中遇到的问题</span><h3>玩家没把死亡与下落距离联系起来</h3><p>室友和朋友试玩后，我发现失败没有告诉他们原因，下一次也就不知道该怎样调整。</p></div></div>
     ${photo(8,'加入安全下落红线后的游戏画面，标注角色位置、红线与平台高度的看图顺序','加入红线后的画面 · 数字用于说明看图顺序')}
     <div class="poro-risk-note"><span class="poro-red-line" aria-hidden="true"></span><div><h3>把安全边界直接画进场景</h3><p>团队讨论后，我们在魄罗下方加入一条随角色移动的水平红线。玩家可把下方平台与它对照，在出发前判断风险。这个提示也容易实现，能较快补上缺少的线索。</p><p>红线说明落差，具体走哪条路仍由玩家决定。</p></div></div>
     <div class="poro-pair">${motion(23,'摔落与死亡','下落失败后的反馈。')}${motion(24,'点亮篝火','关卡中的复活点。')}</div>
    `)}
    ${section('poroLevel','06','LEVEL PROGRESSION','让新能力接上旧经验','先尝试怎样移动，再把新的判断放进路线。关卡围绕基础钩锁、强化后的反弹，以及失败后的重试展开。',`
     <div class="poro-prose"><span class="mono poro-small-label">01 / 第一次拿到钩锁</span><h3>先试着用起来，失败后就近重试</h3><p>钩锁抓住钩点后，会把魄罗带向目标位置。第一次拿到它时，玩家需要尝试怎样瞄准、会被带到哪里。附近的篝火点亮后，摔死的魄罗会回到这里，不必从远处重新赶来。</p></div>
     ${photo(9,'首次获得钩锁的场景，附近设有篝火复活点','首次获得钩锁 · 附近的篝火支持失败后就近重试')}
     <div class="poro-prose"><span class="mono poro-small-label">02 / 获得强化钩锁后</span><h3>再把反弹用进路线</h3><p>强化后，练习的重点转向速度与方向。我希望玩家先理解碰撞会怎样改变去向，再带着这份经验应对危险地形。</p></div>
     ${photo(10,'后续关卡的路线包含平台、尖刺与危险地形','后续关卡 · 平台、尖刺和危险地形进入同一段路线')}
     ${more('关卡机关演示',`<div class="poro-motion-grid">${motion(25,'跳板场景','观察移动与落点变化。')}${motion(26,'开关与冰块 · 场景一','触发开关后，观察冰块的变化。')}${motion(27,'开关与冰块 · 场景二','另一处机关组合。')}</div>`)}
    `)}
    ${section('poroTeam','07','WORKING TOGETHER','在策划与美术之间，把工作接起来','5 人团队在 2024 年 10 月至 2025 年 1 月期间主要在线下开发。我担任负责人，同时负责玩法策划、角色与场景美术及角色动画。',`
     <p class="poro-team-note">其余成员分别承担 UI 与主视觉、辅助美术及特效、程序与关卡、音效与配乐。</p>
     <div class="poro-prose"><h3>先协调关卡与美术的制作顺序</h3><p>当时大家对关卡各有想法：有人希望由美术主导，有人希望先完成关卡白盒。我给出的安排是，关卡先用简单形状搭出可游玩的空间；美术同步制作概念图，之后再把两边合到一起调整。</p></div>
     ${photo(11,'关卡白盒与美术概念并行推进，再共同调整的流程示意','关卡白盒 + 美术概念并行 → 合到一起调整','poro-diagram')}
     <div class="poro-prose"><h3>用模块图块衔接美术和关卡</h3><p>我把地形做成可拼接的模块，交给负责关卡的队友组合场景和调整路线。这样，美术制作有具体的交接内容，关卡也能用这些模块搭建空间。</p></div>
     <div class="poro-tile-pair">${photo(12,'我制作的可拼接冰块地形图块','我制作的冰块地形图块','poro-tiles')}${photo(13,'冰块图块进入关卡后的游戏画面','图块进入关卡后的画面')}</div>
     <div class="poro-prose poro-team-reflection"><h3>把试玩问题带回团队处理</h3><p>我也负责拆分阶段任务、确认分工并跟进进度。室友和朋友试玩时不理解摔落死亡，我把问题带回团队讨论，大家一致决定加入红线提示。兼顾策划和美术，让我需要同时考虑规则是否说得清、画面怎样把它呈现出来。</p></div>
    `)}
    ${pagination}<footer class="poro-footer" data-detail-section="footer"><span>XU KE / 魄罗大冒险</span><nav aria-label="页尾导航"><a href="#intro" data-footer-home>HOME</a><a href="#work" data-open-page="work">专业作品</a><a href="#life" data-open-page="life">日常生活</a></nav></footer>
   </article>`;
 }
 function mount(root){
  const toc=root.querySelector('.poro-toc'),toggle=root.querySelector('.poro-toc-toggle');
  const compact=matchMedia('(max-width:1100px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const setNav=open=>{const expanded=compact.matches&&open;toc.classList.toggle('is-open',expanded);toc.inert=compact.matches&&!expanded;toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',expanded?'关闭项目目录':'打开项目目录');};
  const onToggle=()=>setNav(toggle.getAttribute('aria-expanded')!=='true');
  const onNavClick=e=>{if(e.target.closest('[data-section]')&&compact.matches)setNav(false);};
  const onEscape=e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setNav(false);toggle.focus();}};
  const onMode=()=>setNav(false);
  let menuPaused=false;
  const motions=[...root.querySelectorAll('[data-motion-figure]')].map(figure=>({figure,img:figure.querySelector('img'),button:figure.querySelector('[data-poro-motion]'),requested:false,visible:true}));
  const sync=item=>{const playing=item.requested&&item.visible&&!document.hidden&&!menuPaused;const src=playing?item.img.dataset.motionSrc:item.img.dataset.still;if(item.img.getAttribute('src')!==src)item.img.setAttribute('src',src);item.button.setAttribute('aria-pressed',String(item.requested));item.button.setAttribute('aria-label',(item.requested?'暂停演示：':'播放演示：')+item.button.dataset.title);item.button.innerHTML=(item.requested?'暂停演示':'播放演示')+` <span aria-hidden="true">${item.requested?'Ⅱ':'▶'}</span>`;};
  const onMotion=e=>{const button=e.target.closest('[data-poro-motion]');if(!button)return;const item=motions.find(entry=>entry.button===button);item.requested=!item.requested;sync(item);};
  const syncAll=()=>motions.forEach(sync);
  const onReduced=()=>{if(reduced.matches)motions.forEach(item=>item.requested=false);syncAll();};
  const onMenu=e=>{menuPaused=!!e.detail.open;if(menuPaused)setNav(false);syncAll();};
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{for(const entry of entries){const item=motions.find(item=>item.figure===entry.target);item.visible=entry.isIntersecting;sync(item);}});
  motions.forEach(item=>observer?.observe(item.figure));
  toggle.addEventListener('click',onToggle);toc.addEventListener('click',onNavClick);root.addEventListener('click',onMotion);document.addEventListener('keydown',onEscape);document.addEventListener('portfolio:menu',onMenu);document.addEventListener('visibilitychange',syncAll);compact.addEventListener('change',onMode);reduced.addEventListener('change',onReduced);setNav(false);
  return ()=>{observer?.disconnect();motions.forEach(item=>{item.requested=false;sync(item);});toggle.removeEventListener('click',onToggle);toc.removeEventListener('click',onNavClick);root.removeEventListener('click',onMotion);document.removeEventListener('keydown',onEscape);document.removeEventListener('portfolio:menu',onMenu);document.removeEventListener('visibilitychange',syncAll);compact.removeEventListener('change',onMode);reduced.removeEventListener('change',onReduced);};
 }
 function openImage(path,caption){
  window.PortfolioHome.preview(path,caption);
  const dialog=document.querySelector('.image-dialog'),holder=dialog.querySelector('.dialog-image');
  dialog.classList.add('poro-lightbox');
  const zoom=document.createElement('button');zoom.className='poro-zoom';zoom.textContent='放大细节 ＋';zoom.setAttribute('aria-pressed','false');
  zoom.addEventListener('click',()=>{const on=holder.classList.toggle('poro-zoomed');holder.scrollLeft=holder.scrollTop=0;zoom.textContent=on?'适应窗口 −':'放大细节 ＋';zoom.setAttribute('aria-pressed',String(on));});
  dialog.querySelector('.dialog-footer').append(zoom);
  dialog.addEventListener('close',()=>{dialog.classList.remove('poro-lightbox');holder.classList.remove('poro-zoomed');zoom.remove();},{once:true});
 }
 window.PoroCaseStudy={render,mount,openImage,tocSelector:'.poro-toc',headerColor:'#edf8ff'};
})();
