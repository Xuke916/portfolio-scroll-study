(() => {
 'use strict';
 const asset=n=>`assets/moneyball/image${n}.${[5,7,10,13,14,15,16].includes(n)?'png':'jpeg'}`;
 const sizes={1:[1702,1276],2:[1702,1276],3:[1280,1707],4:[1280,1707],5:[3750,1850],6:[1280,1707],7:[3750,1975],8:[1280,1707],9:[960,1280],10:[3750,1850],11:[1280,1707],12:[960,1280],13:[3750,2225],14:[3750,1850],15:[3750,1975],16:[1461,1076],17:[1280,1707],18:[960,1280],19:[1280,1707],20:[1280,1707]};
 const chapters=[['projectHero','项目概览'],['moneyOrigin','棒球经历'],['moneyRules','规则总览'],['moneyPrediction','投打预测'],['moneySimplification','规则简化'],['moneyDefense','守备与阵容'],['moneyMaterial','实体制作'],['moneyTesting','试玩与收获']];
 function photo(n,alt,caption,cls=''){
  const [w,h]=sizes[n];
  return `<figure class="mb-photo ${cls}"><button class="mb-image-button" data-money-image="${asset(n)}" data-caption="${caption}" aria-label="放大查看：${alt}"><img src="${asset(n)}" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async"><span class="mb-enlarge" aria-hidden="true">↗</span></button><figcaption>${caption}</figcaption></figure>`;
 }
 const pair=(a,b,altA,altB,captionA,captionB)=>`<div class="mb-pair">${photo(a,altA,captionA)}${photo(b,altB,captionB)}</div>`;
 const note=(label,text)=>`<aside class="mb-note"><span class="mono">${label}</span><p>${text}</p></aside>`;
 const section=(id,no,en,title,lead,body)=>`<section class="mb-section" data-detail-section="${id}"><header class="mb-section-head"><span class="mb-chapter mono">${no} / ${en}</span><h2>${title}</h2><p class="mb-lead">${lead}</p></header>${body}</section>`;
 const table=(headers,rows)=>`<div class="mb-table-wrap"><table><thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((x,i)=>i?`<td>${x}</td>`:`<th scope="row">${x}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 function demo(){
  return `<div class="mb-demo" aria-label="投打预测机制演示"><div class="mb-demo-top"><span class="mono">INTERACTIVE / 固定示例</span><h3>同一个标记，你会怎样回应？</h3><p>为了说明机制，你可以预设球路；实际比赛中，投手会暗选球种。</p></div><div class="mb-demo-body"><div class="mb-demo-grid" aria-label="投打格子示意"></div><div class="mb-demo-controls"><fieldset><legend>球路示例</legend><label><input type="radio" name="mb-pitch" value="straight" checked>位置不变</label><label><input type="radio" name="mb-pitch" value="drop">向下移动一格</label></fieldset><fieldset><legend>打击覆盖</legend><label><input type="radio" name="mb-cover" value="3" checked>三格 · 覆盖更多位置</label><label><input type="radio" name="mb-cover" value="1">一格 · 冒险争取得分</label></fieldset><div class="mb-demo-status" aria-live="polite" aria-atomic="true"></div></div></div><div class="mb-demo-steps" aria-label="演示步骤"><button data-mb-step="0" aria-pressed="true"><span>01</span>展示标记</button><button data-mb-step="1" aria-pressed="false"><span>02</span>打者回应</button><button data-mb-step="2" aria-pressed="false"><span>03</span>揭晓结果</button></div><div class="mb-demo-legend"><span><i class="mb-key-zone"></i>中央九格好球区</span><span><i class="mb-key-cover"></i>打击覆盖</span><span><i class="mb-key-ball"></i>最终落点</span></div></div>`;
 }
 function render({footer,pagination}){
  return `<nav class="mb-toc" id="detail-section-navigation" aria-label="Money Ball 项目章节"><span class="mono mb-toc-title">IN THIS PROJECT</span>${chapters.map(([id,label],i)=>`<button data-section="${id}"${i===0?' class="active" aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('')}</nav><article class="detail-route project-detail moneyball-case" data-route="work/project-03">
   <section class="mb-hero mb-section" data-detail-section="projectHero"><span class="mb-chapter mono">PERSONAL PROJECT / 03 · GAME DESIGN</span><div class="mb-hero-title"><h1 class="project-detail-title" tabindex="-1">Money<br><em>Ball</em><span class="mb-baseball" aria-hidden="true">↗</span></h1><div><span class="mb-tag">双人棒球策略桌游</span><p class="mb-hero-summary">把球场上一瞬间的判断，<br>变成桌面上可以思考的选择。</p></div></div><p class="mb-intro">我把投球、判断与挥棒拆成几个桌面步骤，让玩家有时间观察线索、揣摩对手，再为自己的选择承担风险。从高速球场到回合制桌面，保留每一球里的试探与调整。项目中投入最多的是机制设计与卡牌构筑。</p><dl class="mb-facts"><div><dt>开发时间</dt><dd>2025.02 — 06</dd></div><div><dt>人数与时长</dt><dd>2 人 / 25–30 分钟</dd></div><div><dt>个人工作</dt><dd>机制 · 卡牌 · 规则 · 美术 · 印刷</dd></div><div><dt>工具</dt><dd>Photoshop / Word</dd></div></dl><div class="project-detail-cover mb-hero-cover">${photo(2,'Money Ball 开箱总览，包含图板、卡牌、筹码和可擦写笔','实体原型 · 图板、卡牌与可擦写标记工具')}</div><div class="mb-overview-bottom"><span>从创作缘起到试玩反馈，按八个章节展开。</span><button class="mb-text-link" data-section="moneyOrigin">开始阅读 ↓</button></div></section>
   ${section('moneyOrigin','02','ORIGIN','从我的棒球经历出发','上一球的结果已经发生，下一球的选择仍然可以调整。',`
    <div class="mb-two-col"><div class="mb-prose"><p>我喜欢棒球中失败后仍要继续判断的时刻：上一球没打中，下一球却还能从刚才的经验里重新考虑。我想把这种不断调整的体验带到桌面，让玩家利用线索预测对手，也承担判断的风险。</p><p>卡牌人物来自我的校队。球员是队友，经理卡以球队经理为原型；位置、热区与技能，让他们的差异真正进入比赛。</p></div><div class="mb-principles"><div><b>01</b><p>提供能利用的线索，保留尚未公开的选择。</p></div><div><b>02</b><p>让覆盖范围表达玩家愿意承担的风险。</p></div><div><b>03</b><p>通过规则取舍，让不懂棒球的人也能参与判断。</p></div></div></div>
    ${pair(3,4,'以校队队友为原型的球员卡正面','球衣与队徽主题的球员卡背面','球员卡正面 · 队员、位置与能力','球员卡背面 · 球衣与球队标志')}`)}
   ${section('moneyRules','03','GAME AT A GLANCE','先看懂一场比赛','两位玩家担任总教练，带领各自组建的球队，轮流进攻与防守。',`
    <div class="mb-match"><span class="mono">WORLD SERIES · GAME 7</span><div><strong>0<span>:</span>0</strong><p>从第七局开始<br>最后三局，得分更高的一方获胜。</p></div></div>
    <ol class="mb-rule-flow">${[['排兵布阵','九名首发、一名替补。固定棒次轮流打击，防守方安排守备位置。'],['公开临时条件','每个打席抽两张事件卡、选一张公开；辅助卡在画格子前公开。'],['投手给出线索','暗选球种卡，标记一个起始位置，再亮出标记。'],['打者作出回应','选择打击、触击或选球；挥棒时画出覆盖范围。'],['揭牌检验预测','按球种与技能计算最终落点，与打击覆盖范围对照。'],['守备与跑垒','普通击中后判定守备；安打推进跑者，回本垒得分。']].map(([a,b],i)=>`<li><span class="mono">${String(i+1).padStart(2,'0')}</span><h3>${a}</h3><p>${b}</p></li>`).join('')}</ol>
    <div class="mb-counts"><div><strong>3<small>好球</small></strong><p>该打者三振出局</p></div><div><strong>4<small>坏球</small></strong><p>该打者保送上一垒</p></div><div><strong>3<small>出局</small></strong><p>双方交换攻守</p></div></div>
    <div class="mb-prose"><p>同一名打者可能连续面对多球，这一段叫作一个<strong>打席</strong>。换到下一名打者，好坏球重新累计。双方各进攻一次，才是一局。</p><p>跑者依靠队友后续的安打继续推进，绕过一、二、三垒回到本垒得一分。<strong>一格打击命中</strong>则直接全垒打，该打者得一分。</p></div>`)}
   ${section('moneyPrediction','04','DESIGN CASE 01','让投打预测有依据','公开起始标记，隐藏球种。玩家先作决定，再用结果检验判断。',`
    ${demo()}
    ${photo(5,'投手展示标记、打者回应、揭晓球种的三阶段流程图','图解 A · 先看到部分信息 → 作出选择 → 揭晓并结算','mb-diagram')}
    <div class="mb-explainer"><div class="mb-prose"><span class="mb-subtitle mono">PARTIAL INFORMATION</span><h3>相同的标记，仍然有不同答案</h3><p>投手先暗选球种、亮出起始标记；打者看到线索后，决定是否挥棒以及覆盖哪里。未公开的球种让最终落点仍可能变化。</p><p>前几球也会进入判断：上一次同样的标记用了变化球，这次会不会重复？投手也可以利用对手已经形成的预期。</p>${note('设计意图','公开信息提供推测的依据，隐藏信息保留博弈的空间。揭晓结果又为下一球留下线索。')}</div>${photo(6,'使用可擦写笔标记投打格子卡','投打卡实拍 · 结算后擦除，再进入下一球')}</div>
    ${photo(7,'相同起始标记在位置不变和下移球路中的落点差异','图解 B · 球种改变最终落点；具体移动按球种与技能结算','mb-diagram')}
    ${pair(8,9,'球种卡正面及变化效果','棒球符号的球种卡背面','球种卡正面 · 变化效果','球种卡背面 · 扣住时保留隐藏信息')}
    <div class="mb-subsection"><h3>覆盖大小，怎样体现风险？</h3><p class="mb-prose">普通挥棒最多画三个相连格子。覆盖更大，更容易碰到来球；只画一格，则用更高的预测难度换取直接得分的机会。</p><div class="mb-risk"><div><span class="mono">WIDER COVERAGE</span><strong>三格</strong><p>命中机会更多</p><div>命中 → 守备判定 → 守备失败才上垒</div></div><div><span class="mono">PRECISE PREDICTION</span><strong>一格</strong><p>要求更精确的判断</p><div>命中 → 全垒打 → 该打者得 1 分</div></div></div>${photo(10,'三格与一格打击覆盖的风险收益对比','图解 C · 用覆盖范围表达对预测的信心','mb-diagram')}
    ${pair(11,12,'击球卡正面，包含旧版四格文字','球棒符号的击球卡背面','击球卡正面 · 打击、触击与选球','击球卡背面 · 球棒符号区分用途')}
    ${note('版本说明','以上实拍保留原貌，卡面仍有旧版“四格”文字。当前规则为最多三个相连格子，实体卡面仍待更新。')}</div>
    <div class="mb-subsection"><h3>好坏球，让选择逐渐紧张</h3><p class="mb-prose">中央红框内的 3 × 3 格为好球区，外侧十二格为坏球区。“选球”就是不挥棒。判定同时看最终落点和是否挥棒。</p>${table(['打者选择','最终落点','判定'],[['挥棒但没有击中','框内或框外','记一次好球'],['不挥棒','好球区内','记一次好球'],['不挥棒','好球区外','记一次坏球']])}${photo(13,'挥棒和选球时的好坏球判定流程','图解 D · 挥空无论框内框外，都记好球','mb-diagram')}<div class="mb-scenario"><span class="mono">SITUATION / 2 STRIKES · 3 BALLS</span><h4>两好球，三坏球。</h4><p>再一次好球就三振，再一次坏球就保送。投手展示好球区下沿的标记：直球可能留在框内，变化球却可能移到框外。</p><p><strong>不挥棒</strong>，可能等来保送，也可能被直球三振；<strong>挥棒</strong>，还必须覆盖正确的位置。</p></div>${note('设计意图','前几球既暴露习惯，也改变当前选择的代价。同一个标记，在不同球数下会带来不同判断。')}</div>`)}
   ${section('moneySimplification','05','DESIGN CASE 02','让注意力留在对抗上','缩短比赛，减少额外记忆，让新玩家先参与这一球的选择。',`
    <div class="mb-time-change"><div><span class="mono">EARLY VERSION</span><strong>90<small>分钟左右</small></strong><p>九局比赛</p></div><span aria-hidden="true">→</span><div><span class="mono">CURRENT VERSION</span><strong>25–30<small>分钟</small></strong><p>Game 7 最后三局</p></div></div>
    <div class="mb-prose"><p>早期九局版一场约一个半小时。每球都要画格子、出牌和结算，我把比赛缩成最后三局，希望玩家更容易持续留意对手，同时保留逐球试探和调整的机会。</p></div>
    ${table(['设计取舍','保留了什么','接受了什么'],[['九局改为最后三局','逐球预测、试探与调整','长线轮换空间缩小，保留一名替补'],['不加入左右手克制加成','左右手作为角色特点','减少开始对抗前需要记忆的额外关系']])}
    ${note('设计意图','把情境放在 Game 7 第七局，为较短的比赛提供自然的决胜压力。三局是否足够玩家发现彼此的习惯，仍需要继续检查。')}
    <div class="mb-pending"><span class="mono">PROCESS MATERIAL / 待补充</span><p>九局版与三局版的规则版本、卡牌草稿及修改记录，将用于进一步说明每次取舍的依据。</p></div>`)}
   ${section('moneyDefense','06','DEFENSE & LINEUP','击中之后，比赛还在继续','投打决定能否击中；守备与跑垒，把这一球接回整支球队。',`
    <div class="mb-prose"><p>除一格命中的全垒打外，普通击球还要经过相关球员的守备判定。阵容的能力与位置，因此能继续影响一球的结果。</p></div>
    <ol class="mb-defense-flow"><li>普通击球命中</li><li>按击球方向确定相关球员</li><li>掷六面骰，点数 ≤ 当前守备力则成功</li></ol><div class="mb-outcomes"><div><b>至少一人守备成功</b><p>击球员出局</p></div><div><b>全部守备失败</b><p>形成安打，安全上垒</p></div></div>
    ${photo(14,'普通击中后，依据相关球员守备力决定出局或安打','图解 E · 一格命中直接全垒打，不经过普通守备判定','mb-diagram')}
    ${photo(15,'一垒打时打者与垒上队友的推进路径','图解 F · 一垒打示例：打者上一垒，垒上队友各前进一垒；回本垒得分','mb-diagram')}
    <div class="mb-subsection"><h3>阵容怎样进入场上的判断？</h3><p class="mb-prose">九名首发按固定棒次打击。防守方在每个攻守回合开始时，可以调整位置或换上一名替补；替补接替原来的棒次。玩家不仅要想能不能击中，也要想打向哪里、那里由谁守备。</p>${photo(16,'Money Ball 游玩图板，标有九个守备位置、垒包、球数和事件卡区','游玩图板 · 守备位置、跑者路径与比赛状态在同一画面对应','mb-board')}
    ${table(['图板标记','含义'],[['P / C','投手 / 捕手'],['1B / 2B / 3B / SS','一垒手 / 二垒手 / 三垒手 / 游击手'],['LF / CF / RF','左外野手 / 中外野手 / 右外野手'],['STRIKES / BALLS / OUTS','好球 / 坏球 / 出局数；达到第三好球、第四坏球、第三出局时触发结算或换边'],['EVENT CARD','公开事件卡的放置区']])}</div>`)}
   ${section('moneyMaterial','07','PHYSICAL PROTOTYPE','让实体卡片帮助玩家进入比赛','我独立完成机制、卡牌内容、规则、美术与印刷，最关注玩家拿起卡片时需要先看懂什么。',`
    <div class="mb-material-symbols"><div><span aria-hidden="true">◉</span><h3>棒球符号</h3><p>球种卡 · 决定球路变化</p></div><div><span aria-hidden="true">╱</span><h3>球棒符号</h3><p>击球卡 · 选择回应方式</p></div><div><span aria-hidden="true">!</span><h3>黄底感叹号</h3><p>事件卡 · 说明临时条件</p></div></div>
    <div class="mb-prose"><h3>先辨认用途，再阅读具体效果</h3><p>卡背的符号帮助玩家在整理、取牌时先分清类型，再翻到正面理解具体作用。正反面承担不同的信息任务。</p></div>
    ${pair(17,18,'事件卡正面的名称、示意图与规则文字','黄底感叹号主题的事件卡背面','事件卡正面 · 临时效果','事件卡背面 · 醒目的类型识别')}
    ${note('信息顺序','事件卡在每个打席开始时抽二选一并公开；辅助卡也在画格子前公开，用后移出。双方先了解临时条件，再进入标记与回应，事件才成为能够考虑的信息。')}
    <div class="mb-subsection"><h3>让校队里的具体人物进入游戏</h3><p class="mb-prose">球员卡保留队友的照片、姓名、位置与能力，背面延续球衣和队徽；经理卡也以自己的球队经理为原型，让球员之外的成员进入这套角色呈现。</p>${pair(19,20,'以球队经理为原型的经理卡正面','延续球队标志的经理卡背面','经理卡正面 · 真实人物形象','经理卡背面 · 球队视觉的延续')}</div>
    <details class="mb-process-details"><summary>实体原型与后续过程材料 <span>＋</span></summary>${photo(1,'Money Ball 手工封面盒','封面盒实拍 · 项目实体原型')}<p>后续补齐卡牌草稿、Photoshop 文件与打样对照，以及对应版本的规则和试玩记录，让过程材料紧跟它所解释的设计选择。</p></details>`)}
   ${section('moneyTesting','08','PLAYTEST & REFLECTION','试玩，让规则回到玩家手上','四轮当面双人测试，分别观察棒球知识和桌游经验不同的玩家。',`
    ${table(['轮次','参与者','了解棒球','玩过桌游'],[['01','两名队友','是','是'],['02','两名队友','是','否'],['03','两名同学','否','是'],['04','两名同学','否','否']])}
    <div class="mb-pending mb-playtest-pending"><span class="mono">PLAYTEST PHOTOS / 待补充</span><p>真实试玩照片尚未提供，此处保留展示位置。</p></div>
    <div class="mb-test-findings"><div><span class="mono">OBSERVATION 01</span><h3>前几球，会进入后面的判断</h3><p>试玩时，玩家会根据前几个打席的印象判断投球习惯。这让我看到分阶段公开信息的价值：揭晓不只结束一球，也给下一次选择留下依据。</p><p class="mb-caveat">这还不能说明每位玩家都学会了有效预测。下一轮，我会请玩家在揭牌前说出理由，记录他们实际使用了哪些线索。</p></div><div><span class="mono">OBSERVATION 02</span><h3>总时长之外，还要看等待发生在哪里</h3><p>当前一场约 25–30 分钟，一般打席约一分钟；连续擦棒时会更长。整场变短，不代表每个环节都已经流畅。</p><p class="mb-caveat">下一轮单独记录较长打席，区分有趣的试探、规则确认与重复结算，不把它们算作同一种等待。</p></div></div>
    <div class="mb-reflection"><span class="mono">WHAT I LEARNED</span><h3>用玩家知道什么、必须决定什么，来检查规则。</h3><p>我逐渐学会判断哪些棒球环节值得拆开，哪些细节可以缩短。起始标记、隐藏球种和打击覆盖，让瞬间完成的判断变成可以参与的选择；守备与跑垒，再把这一球接回整支球队。</p><p>玩家会猜对手的习惯，是值得保留的现象；它是否稳定发生、是否足够有趣，还需要更具体的记录。脚本模拟可以辅助检查数值，面对面的观察则帮助我看见玩家怎样理解和使用规则。</p></div>
    <div class="mb-next"><h3>下一步</h3><ul><li>更新旧版四格卡面，与当前三格规则统一。</li><li>检查三局是否足够玩家发现并利用彼此的习惯。</li><li>补充真实试玩照片、完整开箱与讲解视频、定稿规则书及版本记录。</li></ul><span class="mb-source-note">内容与实拍图片整理自《Money Ball 项目页大纲与流程图解》。图解为机制说明，待补充材料尚未作为成果展示。</span></div>`)}
   ${pagination}${footer}</article>`;
 }
 function mount(root){
  const demo=root.querySelector('.mb-demo');if(!demo)return;
  let step=0;
  function update(){
   const pitch=demo.querySelector('[name="mb-pitch"]:checked').value,cover=Number(demo.querySelector('[name="mb-cover"]:checked').value),drop=pitch==='drop',y=drop?3:2;
   const coverage=step>=1?(cover===3?[[2,1],[2,2],[2,3]]:[[2,2]]):[];
   let cells='';for(let row=0;row<5;row++)for(let col=0;col<5;col++){
    if((row===0||row===4)&&(col===0||col===4))continue;
    const selected=coverage.some(([x,y])=>x===col&&y===row);
    cells+=`<rect x="${25+col*44}" y="${25+row*44}" width="44" height="44" fill="${selected?'#1e90ff55':'#ffffff04'}" stroke="#839bb044"/>`;
   }
   const ball=step===2?`<circle cx="135" cy="${47+y*44}" r="9" fill="#78c3ff"/>`:`<circle cx="135" cy="135" r="9" fill="#78c3ff"/>`;
   demo.querySelector('.mb-demo-grid').innerHTML=`<svg viewBox="0 0 270 270" role="img" aria-label="${step===0?'起始标记位于中央':step===1?`中央${cover}格打击覆盖`:`球最终${drop?'下移一格':'留在原位'}`}" xmlns="http://www.w3.org/2000/svg">${cells}<rect x="69" y="69" width="132" height="132" fill="none" stroke="#1e90ff" stroke-width="2"/>${step===2&&drop?'<circle cx="135" cy="135" r="9" fill="none" stroke="#78c3ff88"/><path d="M135 147v20m-4-4 4 5 4-5" fill="none" stroke="#78c3ff"/>':''}${ball}</svg>`;
   demo.querySelectorAll('[data-mb-step]').forEach((el,i)=>{el.setAttribute('aria-pressed',String(i===step));el.classList.toggle('active',i===step);});
   const status=step===0?['起始标记已公开','投手已暗选球种；现在只能根据标记和前几球的经验预测。']:step===1?['打者画出覆盖范围',cover===3?'覆盖中央三个相连格子，争取碰到更多可能落点。':'只覆盖中央一格，争取一格命中的全垒打收益。']:cover===1&&drop?['挥空，记一次好球','最终落点向下移动一格，没有进入打击覆盖。']:cover===1?['一格命中，全垒打','该打者直接得一分，不经过普通守备判定。']:['普通击中，继续守备判定','最终落点进入三格覆盖；相关球员全部守备失败，才形成安打。'];
   demo.querySelector('.mb-demo-status').innerHTML=`<strong>${status[0]}</strong><p>${status[1]}</p>`;
  }
  demo.addEventListener('click',e=>{const b=e.target.closest('[data-mb-step]');if(b){step=Number(b.dataset.mbStep);update();}});
  demo.addEventListener('change',()=>{step=0;update();});update();
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
