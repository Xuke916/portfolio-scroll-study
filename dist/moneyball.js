(() => {
 'use strict';
 const asset=n=>n===14?'assets/moneyball/defense-flow-v3.webp':`assets/moneyball/image${n}.${[5,7,10,13,15,16].includes(n)?'webp':'jpeg'}`;
 const sizes={1:[1702,1276],2:[1702,1276],3:[1280,1707],4:[1280,1707],5:[3750,1850],6:[1280,1707],7:[3750,1975],8:[1280,1707],9:[960,1280],10:[3750,1850],11:[1280,1707],12:[960,1280],13:[3750,2225],14:[3750,1850],15:[3750,1975],16:[1461,1076],17:[1280,1707],18:[960,1280],19:[1280,1707],20:[1280,1707]};
 sizes[14]=[1536,1024];
 const chapters=[['projectHero','项目概览'],['moneyOrigin','桌面与组件'],['moneyRules','一球到一场'],['moneyPrediction','投打预测'],['moneyDefense','守备与阵容'],['moneySimplification','规则迭代'],['moneyMaterial','实体制作'],['moneyTesting','试玩与收获']];
 function photo(n,alt,caption,cls=''){
  const [w,h]=sizes[n];
  const variants=[480,960].filter(width=>width<w).map(width=>`assets/moneyball/image${n}-${width}.webp ${width}w`);
  return `<figure class="mb-photo ${cls}"><button class="mb-image-button" data-money-image="${asset(n)}" data-caption="${caption}" aria-label="放大查看：${alt}"><img src="${asset(n)}" srcset="${[...variants,`${asset(n)} ${w}w`].join(', ')}" sizes="(max-width:600px) 86vw, (max-width:1100px) 88vw, 1040px" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async"><span class="mb-enlarge" aria-hidden="true">↗</span></button><figcaption>${caption}</figcaption></figure>`;
 }
 const pair=(a,b,altA,altB,captionA,captionB)=>`<div class="mb-pair">${photo(a,altA,captionA)}${photo(b,altB,captionB)}</div>`;
 const note=(label,text)=>`<aside class="mb-note"><span class="mono">${label}</span><p>${text}</p></aside>`;
 const section=(id,no,en,title,lead,body)=>`<section class="mb-section" data-detail-section="${id}"><header class="mb-section-head"><span class="mb-chapter mono">${no} / ${en}</span><h2>${title}</h2><p class="mb-lead">${lead}</p></header>${body}</section>`;
 const table=(headers,rows)=>`<div class="mb-table-wrap"><table><thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((x,i)=>i?`<td>${x}</td>`:`<th scope="row">${x}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 function playtestGallery(){
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const items=window.PORTFOLIO_CONTENT?.pages.work.projects[2].playtestPhotos||[
   {image:'',title:'试玩全景',caption:'双人对局与桌面布局'},
   {image:'',title:'投打操作',caption:'标记、预测与揭牌的过程'},
   {image:'',title:'守备与跑垒',caption:'掷骰判定与跑者推进'},
   {image:'',title:'测试交流',caption:'规则确认与玩家反馈'}
  ];
  return `<div class="mb-playtest-gallery" aria-label="试玩照片">${items.map((item,i)=>`<figure class="mb-playtest-photo" data-playtest-slot="${i}">${item.image?`<button class="mb-image-button" data-money-image="${esc(item.image)}" data-caption="${esc(item.title+' · '+item.caption)}" aria-label="放大查看：${esc(item.title)}"><img src="${esc(item.image)}" alt="${esc(item.title)}" width="1600" height="1067" loading="lazy" decoding="async"><span class="mb-enlarge" aria-hidden="true">↗</span></button>`:`<div class="mb-playtest-empty" role="img" aria-label="${esc(item.title)}照片预留位置"><span class="mono">PHOTO / ${String(i+1).padStart(2,'0')}</span><span class="mb-slot-cross" aria-hidden="true"></span><span>照片待补充</span></div>`}<figcaption><strong>${esc(item.title)}</strong><span>${esc(item.caption)}</span></figcaption></figure>`).join('')}</div>`;
 }
 function demo(){
  return `<div class="mb-demo" aria-label="投打预测机制演示"><div class="mb-demo-top"><span class="mono">INTERACTIVE / 固定示例</span><h3>同一个标记，你会怎样回应？</h3><p>为了说明机制，你可以预设球路；实际比赛中，投手会暗选球种。</p></div><div class="mb-demo-body"><div class="mb-demo-grid" aria-label="投打格子示意"></div><div class="mb-demo-controls"><fieldset><legend>球路示例</legend><label><input type="radio" name="mb-pitch" value="straight" checked>位置不变（快速球）</label><label><input type="radio" name="mb-pitch" value="drop">向下移动一格（曲球）</label></fieldset><fieldset><legend>打击覆盖</legend><label><input type="radio" name="mb-cover" value="3" checked>三格 · 覆盖更多位置</label><label><input type="radio" name="mb-cover" value="1">一格 · 冒险争取得分</label></fieldset><div class="mb-demo-status" aria-live="polite" aria-atomic="true"></div></div></div><div class="mb-demo-steps" aria-label="演示步骤"><button data-mb-step="0" aria-pressed="true"><span>01</span>展示标记</button><button data-mb-step="1" aria-pressed="false"><span>02</span>打者回应</button><button data-mb-step="2" aria-pressed="false"><span>03</span>揭晓结果</button></div><div class="mb-demo-legend"><span><i class="mb-key-zone"></i>中央九格好球区</span><span><i class="mb-key-cover"></i>打击覆盖</span><span><i class="mb-key-ball"></i>最终落点</span></div></div>`;
 }
 function render({pagination}){
  const extra=(label,body)=>`<div class="mb-process-details"><h3>${label.replace(/^(查看|展开|复查)/,'')}</h3>${body}</div>`;
  const step=(n,title,body)=>`<li><span class="mb-step-number">${n}</span><div><h3>${title}</h3>${body}</div></li>`;
  const zone=`<svg viewBox="0 0 270 270" role="img" aria-label="中央九格为好球区，外侧十二格为坏球区">${Array.from({length:25},(_,i)=>{const x=i%5,y=Math.floor(i/5);return (x===0||x===4)&&(y===0||y===4)?'':`<rect x="${25+x*44}" y="${25+y*44}" width="44" height="44" fill="${x>0&&x<4&&y>0&&y<4?'#e3f1ff':'#f6f8fa'}" stroke="#b6c5d5"/>`;}).join('')}<rect x="69" y="69" width="132" height="132" fill="none" stroke="#1e90ff" stroke-width="3"/></svg>`;
  return `<button class="mb-toc-toggle" aria-label="打开项目目录" aria-controls="detail-section-navigation" aria-expanded="false">目录</button><nav class="mb-toc" id="detail-section-navigation" aria-label="Money Ball 项目章节"><span class="mono mb-toc-title">MONEY BALL</span>${chapters.map(([id,label],i)=>`<button data-section="${id}"${i===0?' class="active" aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</nav><article class="detail-route project-detail moneyball-case" data-route="work/project-03">
   <section class="mb-hero mb-section" data-detail-section="projectHero">
    <span class="mb-chapter mono">PERSONAL PROJECT 03 / 2025</span><h1 class="project-detail-title" tabindex="-1">Money <em>Ball</em></h1><p class="mb-hero-summary">把棒球里的投打判断，做成两个人的桌面对抗。</p>
    <p class="mb-intro">我喜欢棒球里上一球失误后，下一球还能重新判断的过程。Money Ball 把投球、挥棒和守备拆成桌面步骤：玩家看见投手的标记，猜测尚未公开的球种，再决定要不要挥棒。球员卡采用我的校队队友形象；我在这个项目中投入最多的是机制设计与卡牌构筑。</p>
    <dl class="mb-facts"><div><dt>类型 / 人数</dt><dd>棒球策略桌游 / 2 人</dd></div><div><dt>当前时长</dt><dd>约 25–30 分钟</dd></div><div><dt>开发时间</dt><dd>2025.02 — 06</dd></div><div><dt>个人工作</dt><dd>机制、卡牌、规则、美术与印刷<br>Photoshop / Word</dd></div></dl>
    <div class="mb-hero-cover">${photo(2,'Money Ball 开箱总览，包含图板、卡牌、筹码和可擦写笔','实体原型 · 图板记录比赛，卡牌决定选择，可擦写笔用于标记投打位置')}</div>
    <div class="mb-reading-links"><button data-section="moneyOrigin">桌游物件</button><button data-section="moneyRules">投打规则</button></div>
   </section>
   ${section('moneyOrigin','02','ON THE TABLE','游戏发生在这张桌面上','一人进攻、一人防守。图板记录全队的局面，格子卡处理当前这一球。',`
    ${photo(16,'游玩图板，展示守备位置、垒包、好坏球和出局数以及事件卡区','原型图板 · 先安排守备位置，再在比赛中移动跑者、记录球数','mb-board')}
    <ol class="mb-board-guide"><li><strong>守备位置</strong><p>白色圆点对应九个位置。球员卡放到相应位置后，该球员的守备力与技能会参与之后的判定。</p></li><li><strong>跑者与比分</strong><p>菱形是垒包。安打让跑者推进；经过一垒、二垒、三垒回到本垒，每名跑者得 1 分。</p></li><li><strong>当前状态</strong><p>左下记录好球、坏球和出局数；右侧放公开事件卡。达到第三好球、第四坏球或第三出局时，触发相应结算。</p></li></ol>
    <div class="mb-prose"><h3>这一球，另用格子卡来判断</h3><p>投手在格子卡上标记起始位置，打者在自己的格子卡上画出挥棒范围。双方揭牌后，比较<strong>最终落点</strong>与<strong>打击覆盖</strong>，再把上垒、出局等结果记回图板。</p></div>
    <div class="mb-zone-primer"><div class="mb-zone-grid">${zone}</div><div><h3>先认识好球区与坏球区</h3><p>中央 3 × 3 的九格是<strong>好球区</strong>，外侧十二格是<strong>坏球区</strong>。这里先表示位置；这一球记好球还是坏球，还要等打者决定是否挥棒、揭牌得到最终落点后才知道。</p><p class="mb-small">下文用蓝框标出中央九格。实体原型的边框颜色不同，判定区域相同。</p></div></div>
    ${extra('查看格子卡实拍与图板缩写',photo(6,'使用可擦写笔标记投打格子卡','投打格子卡实拍 · 每球结算后擦除标记，再继续使用')+`<dl class="mb-glossary"><div><dt>P / C</dt><dd>投手 / 捕手</dd></div><div><dt>1B / 2B / 3B / SS</dt><dd>一垒手 / 二垒手 / 三垒手 / 游击手</dd></div><div><dt>LF / CF / RF</dt><dd>左 / 中 / 右外野手</dd></div><div><dt>STRIKES / BALLS / OUTS</dt><dd>好球 / 坏球 / 出局数</dd></div></dl>`)}
   `)}
   ${section('moneyRules','03','HOW TO PLAY','从一球，走到一场比赛','故事从 Game 7 第七局、0 : 0 开始。双方各带一支球队，打完最后三局后，得分更高的一方获胜。',`
    <p class="mb-prose">开局先排好九名首发、一名替补，确定棒次与守备位置。下面按玩家实际操作的先后顺序，说明一次投打怎样进行。</p>
    <ol class="mb-rule-flow">
     ${step('01','打席开始：公开临时条件','<p>每个打席抽两张事件卡，选一张公开。辅助卡也在画格子前公开，用后移出。双方先知道当前条件，再进入投打。</p><p class="mb-small">一个打席，指同一名打者连续面对投球，直到出局或上垒的这一段。</p>')}
     ${step('02','防守方：暗选球种，亮出起始标记','<p>投手扣住球种卡，在格子卡上画出并展示起始标记。打者此时看得到位置线索，还不知道球种。</p>')}
     ${step('03','进攻方：决定是否挥棒、覆盖哪里','<p>打者可以打击、触击或选球。“选球”就是不挥棒；普通挥棒最多画三个相连格子。覆盖的位置，是对最终落点的预测。</p>')}
     ${step('04','双方揭牌：先算落点，再判断结果',`<p>按球种与技能确定最终落点，随后判断打击有没有碰到来球。<strong>好坏球也是在这一步产生的。</strong></p><ul class="mb-result-list"><li><b>挥棒且击中</b><span>普通击中 → 守备判定；一格命中 → 直接全垒打，该打者得 1 分。</span></li><li><b>挥棒但没击中</b><span>无论落点在框内还是框外，都记 1 次好球。</span></li><li><b>不挥棒</b><span>最终落点在好球区内 → 记好球；在好球区外 → 记坏球。</span></li></ul>`)}
     ${step('05','把结果记回图板，再决定下一步','<p>击中后的守备结果决定出局或安打；安打按对应规则推进跑者。没有结束打席时，擦掉本球标记，重复第 02–04 步继续投球。</p>')}
    </ol>
    <div class="mb-game-loop"><h3>什么时候换打者、换边、结束比赛？</h3><ol><li><strong>3 好球 → 三振出局；4 坏球 → 保送上一垒。</strong><p>击球被成功守备也会出局。当前打者结束打席，按棒次换下一名打者，好坏球重新累计。</p></li><li><strong>3 名打者出局 → 交换攻守。</strong><p>双方各进攻一次，才算完成一局。图板上的垒包用于追踪进攻方跑者的推进。</p></li><li><strong>最后三局结束 → 比较得分。</strong><p>普通安打靠队友接续推进得分；一格命中的全垒打，让该打者直接得分。</p></li></ol></div>
   `)}
   ${section('moneyPrediction','04','PITCHING & BATTING','投打规则下，不同玩家的选择','起始标记公开，球种仍隐藏。同一条线索可以有不同答案，打者需要先决定，再接受揭牌结果。',`
    ${demo()}
    <div class="mb-prose"><h3>标记提供线索，球种保留变化</h3><p>如果投手直接公开最终落点，打者只要照着画格子。因此，这套规则先公开起始标记，最后再揭球种：同一个标记，可以留在原位，也可能因球种移动。</p><p>前几球也会影响判断。同样的标记上次用了变化球，这次会不会重复？投手同样可以利用打者已经形成的预期。</p></div>
    ${extra('展开投打顺序与球路图解',photo(5,'展示标记、打者回应、揭晓球种的三阶段流程图','图解 A · 展示标记 → 打者回应 → 揭牌结算','mb-diagram')+photo(7,'相同起始标记在位置不变和下移球路中的落点差异','图解 B · 球种决定最终落点，实际变化按球种与技能结算','mb-diagram'))}
    ${pair(8,9,'球种卡正面及变化效果','球种卡背面的棒球符号','球种卡正面 · 阅读变化效果','球种卡背面 · 扣住时保留隐藏信息')}
    <div class="mb-subsection"><h3>画三格还是一格，收益也不同</h3><div class="mb-risk"><div><strong>三格</strong><p>覆盖更多可能落点，争取先击中。</p><p>命中后仍要经过守备判定，相关球员全部失败才形成安打。</p></div><div><strong>一格</strong><p>只赌一个位置，要求更精确的预测。</p><p>一旦命中，直接全垒打，该打者得 1 分，不经过普通守备判定。</p></div></div>
    ${extra('查看覆盖范围图解与击球卡原型',photo(10,'三格与一格打击覆盖的风险收益对比','图解 C · 覆盖范围与命中收益','mb-diagram')+pair(11,12,'击球卡正面，包含旧版四格文字','击球卡背面的球棒符号','击球卡正面 · 打击、触击与选球','击球卡背面 · 球棒符号区分用途'))}
    </div>
    <div class="mb-subsection"><h3>球数会改变同一个选择的代价</h3><div class="mb-scenario"><h4>例如：两好球，三坏球</h4><p>再一次好球就三振，再一次坏球就保送。投手展示好球区下沿的标记：球可能留在框内，也可能移到框外。</p><p><strong>不挥棒</strong>：框外球带来保送，框内球却让打者三振。<br><strong>挥棒</strong>：猜中落点有机会击出；猜错即使落在框外，也会因挥空而三振。</p></div><p class="mb-prose">我希望前几球留下的经验能进入下一次判断。球数改变了失败的代价，同一个标记就不再只有一种应对。</p>${extra('复查好坏球的判定图',photo(13,'挥空记好球，不挥棒按最终落点判定好坏球','图解 D · 好坏球在揭牌得到最终落点后结算','mb-diagram'))}</div>
   `)}
   ${section('moneyDefense','05','DEFENSE & LINEUP','击中后，场上球员的守备判定','球员卡提供不同的位置、守备力和技能。把谁放在哪里，会改变普通击球之后能否安全上垒。',`
    <div class="mb-prose"><p>一格命中直接全垒打。其余普通击中，需要先按击球方向和击球卡规则，找到相应守备球员；每名相关球员掷六面骰，<strong>骰子点数 ≤ 当前守备力，就守备成功</strong>。</p></div>
    <ol class="mb-defense-flow"><li>确定方向与相关球员</li><li>读取球员卡上的守备力与技能</li><li>掷骰，比较当前守备力</li></ol><div class="mb-outcomes"><div><b>至少一人守备成功</b><p>击球员出局</p></div><div><b>全部守备失败</b><p>形成安打，安全上垒</p></div></div>
    <div class="mb-roster-example"><span class="mb-chapter mono">判定示例 / 数值仅用于说明，非具体卡牌数据</span><h3>同样掷出 3，换一个球员，结果就不同</h3><div class="mb-example-lines"><p><strong>当前守备力 2</strong><span>3 ＞ 2 → 该球员守备失败</span></p><p><strong>当前守备力 4</strong><span>3 ≤ 4 → 该球员守备成功</span></p></div><p>若这一方向只有一名相关守备球员，前一种情况形成安打，后一种情况让打者出局。若有多人参与，则必须所有相关球员都失败，才形成安打。</p></div>
    ${pair(3,4,'以校队队友为原型，具有不同位置与能力的球员卡','球衣与队徽主题的球员卡背面','球员卡正面 · 人物、位置、能力与技能','球员卡背面 · 球衣与球队标志')}
    <div class="mb-prose"><h3>阵容调整因此有了实际用途</h3><p>玩家不仅要判断这一球能否击中，也要留意它会打向哪里、那里由谁守备。防守方在每个攻守回合开始时，可以调整位置或换上一名替补；替补接替原来的棒次。调整后，该方向参与判定的球员和能力也会变化。</p><p>球员卡来自我的校队，但我希望他们在游戏里也有不同作用。守备力与技能让“选谁上场”产生规则上的后果，而不只是在图板上换一张照片。</p></div>
    ${extra('查看守备分支与跑垒得分图解',photo(14,'普通击中后，依据相关球员守备力决定出局或安打','图解 E · 普通击中后的守备分支；一格命中不走这一流程','mb-diagram')+photo(15,'一垒打时打者与垒上队友的推进路径','图解 F · 一垒打：打者上一垒，队友各推进一垒；回本垒得分','mb-diagram'))}
   `)}
   ${section('moneySimplification','06','RULE ITERATION','为什么只有最后三局','每球都要画格子、出牌、揭牌和结算。早期九局版约一个半小时，操作重复让整场比赛太长。',`
    <div class="mb-time-change"><div><span class="mono">早期 / 九局</span><strong>约 90<small>分钟</small></strong></div><span aria-hidden="true">→</span><div><span class="mono">当前 / 最后三局</span><strong>25–30<small>分钟</small></strong></div></div>
    <div class="mb-prose"><p>我把故事放到 Game 7 第七局，让玩家直接进入决胜阶段。逐球试探仍然保留，减少的是整场重复操作的次数。代价是长线轮换空间变小，所以当前保留一名替补。</p><p>另一项取舍是没有加入左投对左打的额外克制加成。左右手仍是角色特点，玩家不必先记住这类关系，才能参与标记、球种与覆盖范围的判断。</p></div>
   `)}
   ${section('moneyMaterial','07','PHYSICAL PROTOTYPE','卡牌UI','我独立完成机制、卡牌内容、规则、美术与印刷。制作实体时，先区分卡片用途，再组织正面的具体效果。',`
    <ul class="mb-component-list"><li><strong>棒球符号 → 球种卡</strong><span>暗选球路，揭牌时确定变化。</span></li><li><strong>球棒符号 → 击球卡</strong><span>选择打击、触击或选球。</span></li><li><strong>黄底感叹号 → 事件卡</strong><span>打席开始时公开的临时条件。</span></li></ul>
    ${pair(17,18,'事件卡正面的名称、示意图与规则文字','黄底感叹号主题的事件卡背面','事件卡正面 · 临时效果','事件卡背面 · 先辨认类型')}
    <div class="mb-prose"><p>卡背负责让玩家在整理、取牌时分清用途；正面再解释效果。事件卡先公开，双方才知道这一打席有什么变化，然后进入投打选择。</p><h3>让校队经历落在具体人物上</h3><p>球员卡保留队友的照片、姓名、位置与能力；经理卡以球队经理为原型，延续球队标志。它们让这套原型与我的棒球经历保持联系。</p></div>
    ${extra('查看经理卡与封面盒',pair(19,20,'以球队经理为原型的经理卡正面','球队标志主题的经理卡背面','经理卡正面 · 真实人物形象','经理卡背面 · 延续球队标志')+photo(1,'Money Ball 手工封面盒','封面盒实拍 · 手工制作的实体原型'))}
   `)}
   ${section('moneyTesting','08','PLAYTEST & REFLECTION','测试','四轮当面双人测试，参与者分别有不同的棒球知识和桌游经验。',`
    ${table(['轮次','参与者','了解棒球','玩过桌游'],[['01','两名队友','是','是'],['02','两名队友','是','否'],['03','两名同学','否','是'],['04','两名同学','否','否']])}
    <p class="mb-playtest-intro">真实试玩照片尚未提供，以下四处为照片预留位置。</p>${playtestGallery()}
    <div class="mb-test-findings"><div><h3>测试观察：根据前几球判断投球习惯</h3><p>试玩时，玩家会带着前几个打席的印象，判断对方的投球习惯。</p></div><div><h3>测试时长：打席时间随对局变化</h3><p>测试中，一场约 25–30 分钟，一般打席约一分钟；连续擦棒时，打席时间会更长。</p></div></div>
    <div class="mb-prose"><h3>我从这个项目学到的事</h3><p>把棒球做成桌游，需要决定哪些动作值得拆开、哪些细节应该缩短。我现在会沿着玩家的操作检查规则：先知道什么，再决定什么，最后怎样影响球场局面。</p><p>玩家会猜对手习惯，是值得继续观察的现象；它是否稳定、有趣，还需要更具体的试玩记录。脚本模拟可以辅助检查数值，面对面观察则帮助我了解玩家怎样使用规则。</p></div>
   `)}
   ${pagination}<footer class="mb-simple-footer" data-detail-section="footer"><span>XU KE / Money Ball</span><nav aria-label="页尾导航"><a href="#intro" data-footer-home>HOME</a><a href="#work" data-open-page="work">专业作品</a><a href="#life" data-open-page="life">日常生活</a></nav></footer></article>`;
 }
 function mount(root){
  const toc=root.querySelector('.mb-toc'),toggle=root.querySelector('.mb-toc-toggle');
  const compact=matchMedia('(max-width:1100px)');
  const setNav=open=>{const expanded=compact.matches&&open;toc.classList.toggle('is-open',expanded);toc.inert=compact.matches&&!expanded;toggle.setAttribute('aria-expanded',String(expanded));toggle.setAttribute('aria-label',expanded?'关闭项目目录':'打开项目目录');};
  const onToggle=()=>setNav(toggle.getAttribute('aria-expanded')!=='true');
  const onNavClick=e=>{if(e.target.closest('[data-section]')&&compact.matches)setNav(false);};
  const onEscape=e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setNav(false);toggle.focus();}};
  const onMode=()=>setNav(false),onMenu=e=>{if(e.detail.open)setNav(false);};
  toggle.addEventListener('click',onToggle);toc.addEventListener('click',onNavClick);document.addEventListener('keydown',onEscape);document.addEventListener('portfolio:menu',onMenu);compact.addEventListener('change',onMode);setNav(false);
  const demo=root.querySelector('.mb-demo');if(!demo)return;
  let step=0;
  function update(){
   const pitch=demo.querySelector('[name="mb-pitch"]:checked').value,cover=Number(demo.querySelector('[name="mb-cover"]:checked').value),drop=pitch==='drop',y=drop?3:2;
   const coverage=step>=1?(cover===3?[[2,1],[2,2],[2,3]]:[[2,2]]):[];
   let cells='';for(let row=0;row<5;row++)for(let col=0;col<5;col++){
    if((row===0||row===4)&&(col===0||col===4))continue;
    const selected=coverage.some(([x,y])=>x===col&&y===row);
    cells+=`<rect x="${25+col*44}" y="${25+row*44}" width="44" height="44" fill="${selected?'#1e90ff55':'#f5f8fc'}" stroke="#aabdd0"/>`;
   }
   const ball=step===2?`<circle cx="135" cy="${47+y*44}" r="9" fill="#1e90ff"/>`:`<circle cx="135" cy="135" r="9" fill="#1e90ff"/>`;
   demo.querySelector('.mb-demo-grid').innerHTML=`<svg viewBox="0 0 270 270" role="img" aria-label="${step===0?'起始标记位于中央':step===1?`中央${cover}格打击覆盖`:`球最终${drop?'下移一格':'留在原位'}`}" xmlns="http://www.w3.org/2000/svg">${cells}<rect x="69" y="69" width="132" height="132" fill="none" stroke="#1e90ff" stroke-width="2"/>${step===2&&drop?'<circle cx="135" cy="135" r="9" fill="none" stroke="#1e90ff88"/><path d="M135 147v20m-4-4 4 5 4-5" fill="none" stroke="#1e90ff"/>':''}${ball}</svg>`;
   demo.querySelectorAll('[data-mb-step]').forEach((el,i)=>{el.setAttribute('aria-pressed',String(i===step));el.classList.toggle('active',i===step);});
   const status=step===0?['起始标记已公开','投手已暗选球种；现在只能根据标记和前几球的经验预测。']:step===1?['打者画出覆盖范围',cover===3?'覆盖中央三个相连格子，争取碰到更多可能落点。':'只覆盖中央一格，争取一格命中的全垒打收益。']:cover===1&&drop?['挥空，记一次好球','最终落点向下移动一格，没有进入打击覆盖。']:cover===1?['一格命中，全垒打','该打者直接得一分，不经过普通守备判定。']:['普通击中，继续守备判定','最终落点进入三格覆盖；相关球员全部守备失败，才形成安打。'];
   demo.querySelector('.mb-demo-status').innerHTML=`<strong>${status[0]}</strong><p>${status[1]}</p>`;
  }
  demo.addEventListener('click',e=>{const b=e.target.closest('[data-mb-step]');if(b){step=Number(b.dataset.mbStep);update();}});
  demo.addEventListener('change',()=>{step=0;update();});update();
  return ()=>{document.removeEventListener('keydown',onEscape);document.removeEventListener('portfolio:menu',onMenu);compact.removeEventListener('change',onMode);};
 }
 function openImage(path,caption){
  window.PortfolioHome.preview(path,caption);
  const dialog=document.querySelector('.image-dialog'),holder=dialog.querySelector('.dialog-image');
  dialog.classList.add('moneyball-lightbox');
  const zoom=document.createElement('button');zoom.className='mb-zoom';zoom.textContent='放大细节 ＋';zoom.setAttribute('aria-pressed','false');
  zoom.addEventListener('click',()=>{const on=holder.classList.toggle('mb-zoomed');holder.scrollLeft=holder.scrollTop=0;zoom.textContent=on?'适应窗口 −':'放大细节 ＋';zoom.setAttribute('aria-pressed',String(on));});
  dialog.querySelector('.dialog-footer').append(zoom);
  dialog.addEventListener('close',()=>{dialog.classList.remove('moneyball-lightbox');holder.classList.remove('mb-zoomed');zoom.remove();},{once:true});
 }
 window.MoneyBallCaseStudy={render,mount,openImage};
})();
