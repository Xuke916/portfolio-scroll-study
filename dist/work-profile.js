(() => {
 'use strict';
 let language='zh';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const english={
  background:[
   {date:'Sep 2023 — Sep 2027 (expected)',title:'Communication University of China',text:'B.A. candidate in Animation, specializing in Game Art.'},
   {date:'Jun 2025 — Present',title:'Absolutely Games · Producer',text:'Secured investment for Rewinder, the studio’s original action game, and oversee its production.'},
   {date:'Dec 2025 — Apr 2026',title:'NetEase ThunderFire · Zhurong Studio',text:'Combat designer responsible for a two-branch finishing ability for the Hongmao Lantu Qixia Zhuan crossover, from mechanics and balancing to implementation and presentation. Collaborated with artists and programmers to ship the feature, and refined combat feedback for knockback and seasonal accessories.'},
   {date:'On the field',title:'Vice-Captain · University Baseball Team',text:'Capital Baseball Tournament: runner-up in 2024; third place in 2025 and 2026.'}
  ],
  recognition:'Best Game Jam nominations at indiePlay (2025, 2026); Outstanding Work Award at TapTap Spotlight (2025); POP MART Corporate Special Award at the National College Student Advertising Art Competition (2025).',
  skills:['Combat mechanics','Ability design','Game balancing','Environment concept design']
 };
 function body(){
  const en=language==='en',p=window.PORTFOLIO_CONTENT.pages.life.profile,c=en?english:p;
  const entries=items=>items.map(x=>`<li><span class="wp-date">${esc(x.date)}</span><h3>${x.route?`<a href="#${esc(x.route)}" data-project-route="${esc(x.route)}">${esc(x.title)} <span aria-hidden="true">↗</span></a>`:esc(x.title)}</h3><p>${esc(x.text)}</p></li>`).join('');
  return `<div class="wp-heading"><div><span class="wp-kicker">XU KE / PORTFOLIO</span><h1 class="detail-hero-title" tabindex="-1">${en?'Professional work':'专业作品'}</h1><p>${en?'Game production, combat design and concept art.':'游戏制作、战斗设计与概念美术。'}</p></div><div class="wp-language" role="group" aria-label="${en?'Résumé language':'简历语言'}"><button type="button" data-resume-language="zh" aria-pressed="${!en}" lang="zh-CN">中文</button><button type="button" data-resume-language="en" aria-pressed="${en}" lang="en">EN</button></div></div>
  <div class="wp-columns"><section class="wp-experience"><h2>${en?'Education & experience':'学习与经历'}</h2><ol>${entries(c.background)}</ol></section><section class="wp-awards"><h2>${en?'Awards & recognition':'获奖经历'}</h2><ol>${c.recognition.split(en?';':'；').map(x=>`<li><p>${esc(x.trim())}</p></li>`).join('')}</ol></section></div>
  <div class="wp-notes"><section><h2>${en?'Design & tools':'设计与工具'}</h2><p>${c.skills.map(esc).join(' · ')}</p><ul>${p.tools.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section></div><button class="wp-projects-link" data-section="projects">${en?'Explore the projects':'浏览个人项目'} <span aria-hidden="true">↓</span></button>`;
 }
 function render(){return `<div class="wp-layout"><aside class="wp-identity"><img src="assets/work/xu-ke-avatar.webp" width="640" height="640" alt="XU KE 的头像：红底像素绵羊" fetchpriority="high" decoding="async"><p>XU KE</p><span>GAME DESIGN<br>CONCEPT ART</span></aside><div class="wp-content" lang="${language==='en'?'en':'zh-CN'}">${body()}</div></div>`;}
 function apply(root,lang){if(!['zh','en'].includes(lang))return;language=lang;const content=root.querySelector('.wp-content');content.lang=lang==='en'?'en':'zh-CN';content.innerHTML=body();content.querySelector(`[data-resume-language="${lang}"]`).focus({preventScroll:true});}
 window.WorkProfile={render,apply};
})();
