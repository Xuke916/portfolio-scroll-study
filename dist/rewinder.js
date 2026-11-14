(() => {
 'use strict';
 const base='assets/rewinder/';
 const sizes={1:[2200,1035],2:[1920,1080],3:[1920,1080],4:[1800,570],5:[1800,570],6:[1800,790],7:[2200,936],8:[2200,1290],9:[2200,547],10:[1044,1059],11:[1546,1080],12:[2200,1537],13:[2200,1238],14:[2200,924],15:[2200,936],16:[2200,936]};
 const chapters=[['projectHero','关于项目'],['rwCore','回溯的三个尺度'],['rwCombat','回溯与战斗'],['rwStory','改写过去的代价'],['rwVisual','视觉表达'],['rwProduction','分阶段制作']];
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const source=n=>base+`image-${String(n).padStart(2,'0')}.webp`;
 function photo(n,alt,caption,cls='',priority=false){
  const [width,height]=sizes[n],small=source(n).replace('.webp','-640.webp');
  return `<figure class="rw-photo ${cls}" data-rw-visual="${n}"><button class="rw-image" data-rewinder-image="${source(n)}" data-caption="${esc(caption)}" aria-label="放大查看：${esc(alt)}"><img src="${small}" srcset="${small} 640w, ${source(n)} ${width}w" sizes="${cls==='rw-brand'?'(max-width:700px) 65vw, 300px':'(max-width:600px) 86vw, (max-width:1100px) 84vw, 1040px'}" width="${width}" height="${height}" alt="${esc(alt)}" ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async"><span class="rw-enlarge" aria-hidden="true">↗</span></button><figcaption>${esc(caption)}</figcaption></figure>`;
 }
 const section=(id,no,english,title,intro,body)=>`<section class="rw-section" data-detail-section="${id}"><header class="rw-section-head"><span class="rw-eyebrow mono">${no} / ${english}</span><h2>${title}</h2><p>${intro}</p></header>${body}</section>`;
 const step=(no,kicker,title,text)=>`<li><span class="rw-step-number mono">${no} / ${kicker}</span><h4>${title}</h4><p>${text}</p></li>`;
 function diagram(n,label,steps,note,extra=''){
  return `<figure class="rw-diagram" data-rw-visual="${n}"><div class="rw-diagram-heading"><span class="mono">${esc(label)} / 机制示意</span><button data-rewinder-image="${source(n)}" data-caption="${esc(note)}" aria-label="查看原始${esc(label)}">原图 ↗</button></div><ol class="rw-flow" aria-label="${esc(label)}的步骤">${steps}</ol>${extra}<figcaption>${esc(note)}</figcaption></figure>`;
 }
 function render({pagination}){
  return `<button class="rw-toc-toggle" type="button" aria-label="打开项目目录" aria-controls="detail-section-navigation" aria-expanded="false">目录</button><nav class="rw-toc" id="detail-section-navigation" aria-label="Rewinder 项目章节"><span class="mono rw-toc-title">REWINDER / PROJECT 02</span>${chapters.map(([id,label],i)=>`<button data-section="${id}"${i===0?' class="active" aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</nav>
  <article class="detail-route project-detail rw-case" data-route="work/project-02">
   <section class="rw-section rw-hero" data-detail-section="projectHero">
    <span class="rw-eyebrow mono">PERSONAL PROJECT / 02 · COMBAT DESIGN & CONCEPT ART</span>
    <div class="rw-hero-heading"><div><h1 class="project-detail-title" tabindex="-1">Rewinder</h1><p class="rw-hero-line">用回溯扭转眼前的交锋，<br>也面对改写过去留下的后果。</p></div>${photo(12,'Rewinder 项目标识','Rewinder · 项目标识','rw-brand',true)}</div>
    <p class="rw-intro">第三人称近战动作游戏。玩家靠闪避与追击应对敌人，用时间能力扭转交锋；主角则为了救回爱人，逐步改变了熟悉的未来。</p>
    <dl class="rw-facts"><div><dt>我的职责</dt><dd>战斗策划 · 概念美术</dd></div><div><dt>引擎与团队</dt><dd>Unreal Engine 5.6<br>工作室 10 人，另有外部制作团队</dd></div><div><dt>项目状态</dt><dd>已获得投资，持续制作中<br>原创角色、场景与动画正在迭代</dd></div></dl>
    <p class="rw-project-state">早期 Demo 主要展示战斗。下文区分机制图解、原创概念与制作过程画面。</p>
    <div class="rw-reading-links"><button data-section="rwCombat">回溯怎样进入战斗 <span>↓</span></button><button data-section="rwVisual">角色与场景概念 <span>↓</span></button></div>
   </section>
   ${section('rwCore','02','ONE IDEA · THREE SCALES','以时间回溯为核心','主角借助时间装置回到过去，试图救回已经失去的爱人。我想把改变时间的能力，放进玩家反复经历的战斗，也放进主角改变未来的故事。',`
    <div class="rw-prose"><p>回溯带来重新行动的机会，也会留下后果。从一次还手，到整场战斗，再到一条时间线，玩家需要权衡的东西逐渐改变。</p></div>
    <ol class="rw-scales"><li><span class="mono">01 / 一次交锋</span><h3>夺回反击机会</h3><p>用时间技能，把被围攻的压力转成反击。</p></li><li><span class="mono">02 / 一场战斗</span><h3>重来伴随代价</h3><p>失败后回溯恢复状态，部分敌人也随之强化。</p></li><li><span class="mono">03 / 整条时间线</span><h3>选择接受的未来</h3><p>救回爱人，却改变了熟悉的人与关系；最终决定是否接受这个未来。</p></li></ol>
    ${photo(11,'关卡路线草图，展示战斗节点与 Boss 区域的空间关系','关卡路线草图｜先看战斗节点与 Boss 区域的空间关系，再理解下文的交锋与重试。','rw-map')}
   `)}
   ${section('rwCombat','03','REWIND IN COMBAT','时间回溯与战斗系统','先看一次交锋，再看整场战斗。回溯既能让玩家夺回眼前的主动，也会改变下一次尝试的条件。',`
    <div class="rw-prose"><h3>把被围攻的压力变成反击</h3><p>几个敌人同时逼近。躲开眼前一击，侧面仍有威胁。我希望时间技能给玩家一个明确的还手机会。</p></div>
    ${diagram(4,'图解 A',step('01','玩家面对什么','多个敌人围攻','闪避躲开一击，其他敌人仍在逼近。')+step('02','技能改变什么','动作倒放 + 群体攻击','范围内敌人动作倒放，技能伤害同步发生。')+step('03','玩家得到什么','从躲闪转为进攻','一次控制多个目标，夺回进攻机会。'),'倒放与伤害属于同一次技能，不表示额外的自由普攻时段。此处为机制示意，不是实机帧序列。')}
    <div class="rw-prose rw-design-reason"><h4>为什么这样设计</h4><p>敌人的动作被拉回，伤害却同时落在他们身上。倒放和攻击在同一次技能里，让玩家看见时间能力如何扭转交锋。</p></div>
    <div class="rw-prose rw-subsection"><h3>让每一次重来都留下痕迹</h3><p>一次技能可以扭转交锋。如果整场战斗输了，玩家也可以回溯恢复状态，再试一次。但重来的机会，会让接下来的遭遇发生变化。</p></div>
    ${diagram(5,'图解 B',step('01','战斗失败','回溯恢复状态','玩家获得再次尝试的机会。')+step('02','代价保留下来','部分敌人数值强化','玩家记得上次的出招，但对手变得更强。')+step('03','再次交锋','带着经验调整应对','重新判断出手与防守，而非照搬上一轮操作。'),'规则图解展示复活代价的设计关系，不代表敌人强化的实测数据。')}
    <div class="rw-prose rw-design-reason"><h4>为什么这样设计</h4><p>把失败的经验和重来的代价放在一起，促使玩家重新观察、调整打法，而不是机械地重复上一轮。</p></div>
   `)}
   ${section('rwStory','04','THE COST OF CHANGING THE PAST','改写过去的代价','战斗里的重来，要面对更强的敌人。把这个问题放进主角的人生，回到过去获得想要的结果，又会让他失去什么？',`
    <div class="rw-prose"><p>主角穿越过去的三个章节救回爱人。回到未来时，参与研发时间装置的老先生变成老太太，后来一些熟悉的人甚至从未存在。</p></div>
    ${diagram(6,'图解 C',step('01','过去的三个章节','救回爱人','完成行动并取得线索；回到未来时，熟悉的人却发生变化。')+step('02','改变后的未来','关系也被改写','参与研发装置的人变了，一些熟悉的 NPC 不再存在。'),'前三章的穿越推动剧情；结尾才由玩家决定留下怎样的未来。',`<div class="rw-branch-label"><span>最后的选择</span></div><div class="rw-endings"><section><span class="rw-step-number mono">结尾选择 A</span><h4>接受新的时间线</h4><p>留下爱人归来的结果，接受熟悉世界的变化。</p></section><section><span class="rw-step-number mono">结尾选择 B</span><h4>回去阻止自己</h4><p>阻止当初的干预，放弃已经争取到的结果。</p></section></div>`)}
    <div class="rw-prose"><h3>先建立关系，才看得见失去</h3><p>玩家先认识这些人、知道他们为什么重要，才会在关系消失时感到这次挽回付出了什么。救回爱人不再是故事的终点。</p><p>走完过去的三个章节后，玩家才面对最后的选择：接受爱人归来、熟悉世界被改写的未来，或回去阻止当初的自己，放弃已经争取到的结果。</p><h4>我想留下的感受</h4><p>回溯确实能帮主角挽回失去的人，但玩家也要看见，这份挽回改变了谁的生活。最后的选择，才会有值得犹豫的分量。</p></div>
   `)}
   ${section('rwVisual','05','MAKING REWIND VISIBLE','时间回溯的视觉化表达','战斗反馈让玩家看见时间能力的作用，面具把角色带进这个世界，人物和场景则承载未来改变的感受。',`
    <div class="rw-prose"><span class="rw-eyebrow mono">01 / 整体风格</span><h3>未来复古主义</h3><p>我把中式纹样、陈列器物和暖色灯光这些带着旧时代记忆的元素，放进几何体块、玻璃与发光屏幕组成的空间里。</p><p>我想让玩家一眼看见过去与未来叠在一起。技术改变了生活，熟悉的文化痕迹仍然留在这个世界里。</p></div>
    ${photo(1,'群战概念图，红黑色调中的角色被多个敌人包围','视觉方向｜群战概念图，展示红黑色调与被包围的局面；不是游戏截图。')}
    ${photo(13,'红色悬挂构件、几何雕塑与通透玻璃构成的展陈空间','场景概念 2｜红色悬挂构件、几何雕塑与通透玻璃，共同构成未来感的展陈空间。')}
    <div class="rw-prose rw-design-reason"><h4>让倒放与伤害发生在同一次技能里</h4><p>图解 A 中，范围内敌人的动作倒放，技能伤害同步发生。我希望玩家看见自己如何借时间能力扭转交锋；视觉表现要和这次攻击的作用对应。</p></div>
    <div class="rw-prose rw-subsection"><span class="rw-eyebrow mono">02 / 人物设定</span><h3>把世界背景落实到造型</h3><p>未来囚犯被送回过去，面具与抹去身份有关。我把这些背景带进造型，再通过体型、服装和机械义肢拉开敌人的视觉差异。</p></div>
    ${photo(8,'精英打手的多种服装、面具与机械义肢概念方案，包含参考拼贴','过程图 1｜精英打手概念探索：多种服装、面具与机械义肢方案；图中包含参考拼贴。')}
    <div class="rw-production-arrow mono">概念中的轮廓与细节 <span aria-hidden="true">↓</span> 模型中的延续</div>
    ${photo(9,'精英敌人的模型与多角度展示','过程图 2｜对应精英敌人的模型展示；可对照体型、服装和机械义肢的延续。')}
    <div class="rw-paired-prose"><section><h4>概念阶段</h4><p>把世界观落实到面具、义肢和服装这些可见元素上。</p></section><section><h4>制作阶段</h4><p>把概念中的轮廓与细节转成模型，继续与动画及战斗表现衔接。</p></section></div>
    <div class="rw-character-pair">${photo(10,'普通打手的面具、红衣、体型及纹样探索，含草图与参考拼贴','打手概念探索｜面具、红衣、体型及纹样变化，含草图与参考拼贴。')}<div class="rw-prose"><h3>人物与场景的视觉延续</h3><p>从普通打手到精英打手，面具和红色服装让他们属于同一个世界；体型、服装和机械义肢的差异，再把不同敌人的形象区分开。</p><h4>我的工作</h4><p>把战斗意图与视觉表达放在一起：既说明技能做什么，也考虑角色和反馈怎样帮助玩家理解。</p></div></div>
    <div class="rw-prose rw-subsection"><span class="rw-eyebrow mono">03 / 场景设定</span><h3>先让空间被记住</h3></div>
    ${photo(7,'红黑配色与中式纹样构成的个人收藏馆场景','场景概念｜个人收藏馆的红黑配色与中式纹样；尚不是两条时间线的完成对照。')}
    <div class="rw-prose"><p>让人物和空间先被记住，再用前后差异表现世界改变。概念图承担视觉方向，具体剧情由章节事件承载。</p><h3>个人收藏馆</h3><p>下面几张概念图展示的是同一座个人收藏馆。器物陈列、竹影屏幕和展示墙延续同一套视觉方向。</p></div>
    ${photo(14,'个人收藏馆的中式陈设、竹影屏幕与反射材质','场景概念 1｜个人收藏馆的中式陈设与竹影屏幕，结合反射材质营造未来复古的氛围。')}
    ${photo(15,'收藏品、中式纹样与重复几何灯箱构成的收藏馆','场景概念 3｜陈列的收藏品与中式纹样保留文化记忆，重复的几何灯箱统一空间节奏。')}
    ${photo(16,'收藏馆中红色纹样、暖光与错落的几何展示墙','场景概念 4｜红色纹样与暖光延续整体风格，错落的几何体块重新组织展示墙。')}
   `)}
   ${section('rwProduction','06','BUILDING IN STAGES','把战斗和美术分阶段落地','为了赶上大三毕业展，早期版本使用了部分购买的美术资产。我们先把动作与战斗系统做出来，同时推进我参与设计的角色和场景。',`
    ${photo(2,'早期 Demo 中的多人近战，角色与场景包含素材资产','过程画面｜10 月 7 日视频约 00:30，早期 Demo 的多人近战；角色与场景包含素材资产。')}
    ${photo(3,'UE 测试场景中的角色与敌人','过程画面｜同一视频约 00:50，UE 测试场景中的角色与敌人；用于说明开发过程。')}
    <div class="rw-prose"><h3>先检查战斗，再逐步接入原创资产</h3><p>现阶段的展示由可玩的战斗 Demo、原创概念图和模型组成。先在较素的场景里检查战斗与技能反馈，再逐步接入原创资产。</p></div>
   `)}
   ${pagination}<footer class="rw-footer" data-detail-section="footer"><span>XU KE / REWINDER</span><nav aria-label="页尾导航"><a href="#intro" data-footer-home>HOME</a><a href="#work" data-open-page="work">专业作品</a><a href="#life" data-open-page="life">日常生活</a></nav></footer>
  </article>`;
 }
 function mount(root){
  const toc=root.querySelector('.rw-toc'),toggle=root.querySelector('.rw-toc-toggle'),compact=matchMedia('(max-width:1100px)');
  const setNav=open=>{const expanded=compact.matches&&open;toc.classList.toggle('is-open',expanded);toc.inert=compact.matches&&!expanded;toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',expanded?'关闭项目目录':'打开项目目录');};
  const onToggle=()=>setNav(toggle.getAttribute('aria-expanded')!=='true');
  const onNav=e=>{if(e.target.closest('[data-section]')&&compact.matches)setNav(false);};
  const onEscape=e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setNav(false);toggle.focus();}};
  const onMode=()=>setNav(false),onMenu=e=>{if(e.detail.open)setNav(false);};
  toggle.addEventListener('click',onToggle);toc.addEventListener('click',onNav);document.addEventListener('keydown',onEscape);document.addEventListener('portfolio:menu',onMenu);compact.addEventListener('change',onMode);setNav(false);
  return ()=>{toggle.removeEventListener('click',onToggle);toc.removeEventListener('click',onNav);document.removeEventListener('keydown',onEscape);document.removeEventListener('portfolio:menu',onMenu);compact.removeEventListener('change',onMode);};
 }
 function openImage(path,caption){
  window.PortfolioHome.preview(path,caption);
  const dialog=document.querySelector('.image-dialog'),holder=dialog.querySelector('.dialog-image');
  dialog.classList.add('rw-lightbox');
  const zoom=document.createElement('button');zoom.className='rw-zoom';zoom.textContent='放大细节 ＋';zoom.setAttribute('aria-pressed','false');
  zoom.addEventListener('click',()=>{const on=holder.classList.toggle('rw-zoomed');holder.scrollLeft=holder.scrollTop=0;zoom.textContent=on?'适应窗口 −':'放大细节 ＋';zoom.setAttribute('aria-pressed',String(on));});
  dialog.querySelector('.dialog-footer').append(zoom);
  dialog.addEventListener('close',()=>{dialog.classList.remove('rw-lightbox');holder.classList.remove('rw-zoomed');zoom.remove();},{once:true});
 }
 window.RewinderCaseStudy={render,mount,openImage,tocSelector:'.rw-toc',headerColor:'#f2ece7'};
})();
