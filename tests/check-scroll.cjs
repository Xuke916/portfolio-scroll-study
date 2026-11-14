const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function boot(width, height, reduce = false, initialHash = '') {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://portfolio.test/' + initialHash, pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  let y = 0, clock = 0, id = 0, queue = new Map();
  Object.defineProperty(w, 'innerWidth', { value: width, writable: true });
  Object.defineProperty(w, 'innerHeight', { value: height, writable: true });
  Object.defineProperty(w, 'scrollY', { get: () => y });
  Object.defineProperty(d.documentElement, 'scrollHeight', { get: () => d.body.classList.contains('detail-mode') ? Number(d.querySelector('.detail-route')?.dataset.scrollHeight || height) : height * 8.2 });
  Object.defineProperty(w.HTMLElement.prototype, 'offsetHeight', { get() { const c=this.classList;return this.id==='viewport-metric'?height:c.contains('scroll-space') ? height * 8.2 : c.contains('hero-portrait') ? height * (width<=600?.9:1.08) : c.contains('project-detail-hero')?height*1.4:c.contains('project-detail-overview')?height*.8:c.contains('project-detail-gallery')?height*1.6:c.contains('project-pagination')?height*.6:c.contains('portrait-footer')?height*1.05:100; } });
  w.matchMedia = q => ({ matches: q.includes('reduced-motion') ? reduce : true, addEventListener() {} });
  w.requestAnimationFrame = cb => { queue.set(++id, cb); return id; };
  w.cancelAnimationFrame = n => queue.delete(n);
  w.scrollTo = (x, top) => { y = typeof x === 'object' ? x.top : top; w.dispatchEvent(new w.Event('scroll')); };
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.eval(fs.readFileSync(path.join(root, 'content.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(root, 'app.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(root, 'pages.js'), 'utf8'));
  function flush() { for (let i = 0; queue.size && i < 1500; i++) { const jobs = [...queue.values()]; queue.clear(); clock += 16.667; jobs.forEach(cb => cb(clock)); } assert.equal(queue.size, 0, 'animation converges'); }
  function scroll(t) { w.scrollTo(0, t * height / 1.5); flush(); }
  function advance(dt=16.667){const jobs=[...queue.values()];queue.clear();clock+=dt;jobs.forEach(cb=>cb(clock));}
  return { w, d, scroll, flush, advance };
}
for (const [width, height, reduce] of [[1600, 900, false], [390, 844, false], [1600, 900, true]]) {
  const { w, d, scroll, flush, advance } = boot(width, height, reduce);
  const q = s => d.querySelector(s);
  assert.equal(d.querySelectorAll('.gallery-card').length, 8);
  assert.equal(q('.hero-scene').inert, false);
  const opening = q('.hero-portrait').style.transform;
  scroll(1.5);
  assert.notEqual(q('.hero-portrait').style.transform, opening, 'scroll changes hero scale');
  assert.ok(+q('.floating-shell').style.opacity > .5, 'floating placeholders enter');
  scroll(3.35);
  assert.equal(q('.hero-scene').style.filter,'grayscale(1)','the finished thumbnail is fully gray');
  assert.equal(q('.message-scene').inert, false);
  assert.equal(q('.message-signature path').style.strokeDashoffset, '0', 'signature finishes drawing in thumbnail scene');
  assert.ok(parseFloat(q('.hero-scene').style.clipPath.slice(6)) > 20, 'hero is cropped into a central thumbnail');
  const messageFrame=q('.hero-scene').style.clipPath;
  assert.match(q('.message-marquee.serif').textContent,/GREAT OF ALL TIME/);
  assert.deepEqual([...d.querySelectorAll('.square-arrow')].map(el=>el.textContent),['←','→']);
  if(!reduce){
    const grayPortrait=q('.hero-portrait').style.transform,graySignature=q('.message-signature').style.transform,grayContours=q('.hero-contours').style.transform;
    for(const [x,y] of [[0,0],[width,height],[0,height],[width,0]]){
      d.dispatchEvent(new w.MouseEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));flush();
      assert.equal(q('.hero-portrait').style.transform,grayPortrait,'the gray portrait stays fixed across pointer extremes');
      assert.equal(q('.message-signature').style.transform,graySignature,'signature stays registered to the gray card');
      assert.equal(q('.hero-contours').style.transform,grayContours,'contours inside the gray card remain still');
    }
    d.dispatchEvent(new w.MouseEvent('pointerleave'));flush();
  }
  assert.equal(d.documentElement.style.getPropertyValue('--header-color'), '#f3f3eb');
  scroll(5.4);
  assert.equal(q('.gallery-scene').style.transform, 'scale(1) rotate(0deg)');
  assert.equal(q('.gallery-scene').inert, false);
  assert.equal(d.documentElement.style.getPropertyValue('--header-color'), '#f3f3eb');
  assert.equal(q('.hero-scene').inert, true);
  assert.equal(q('.chapter-navigation .active').getAttribute('href'), '#gallery');
  const first = q('.gallery-card').style.transform;
  scroll(7.2);
  assert.notEqual(q('.gallery-card').style.transform, first, 'gallery moves with scroll');
  const a = parseFloat(q('.gallery-card').style.transform.split(',')[1]);
  const b = parseFloat(d.querySelectorAll('.gallery-card')[1].style.transform.split(',')[1]);
  assert.notEqual(a, b, 'gallery layers travel at different speeds');
  scroll(5.4);
  assert.equal(q('.gallery-card').style.transform, first, 'reverse scroll restores exact frame');
  q('.image-slot').click();
  assert.equal(q('dialog').open, false, 'gallery image navigates without opening a dialog');
  assert.equal(w.location.hash, '#explore');
  if(!reduce){
    const before=w.scrollY;advance();advance(450);
    assert.ok(w.scrollY>before&&w.scrollY<10*height/1.5,'gallery click has a continuous transition');
    assert.ok(+q('.split-scene').style.opacity>0&&+q('.split-scene').style.opacity<1,'white crossfade has an intermediate frame');
  }
  flush();
  assert.equal(w.scrollY,10*height/1.5,'gallery click arrives at the dual entry section');
  assert.equal(q('.split-scene').inert,false);
  assert.equal(d.activeElement,q('.split-option'),'keyboard focus follows the destination');
  assert.ok([...d.querySelectorAll('.image-slot')].every(a=>a.tagName==='A'&&a.getAttribute('href')==='#explore'),'all gallery frames link to the same destination');
  assert.equal(d.body.style.overflow, '');
  scroll(5.4);
  q('.menu-toggle').click(); flush();
  assert.equal(q('.menu-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(q('.site-menu').inert, false);
  assert.equal(q('.stage').inert, true);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); flush();
  assert.equal(q('.menu-toggle').getAttribute('aria-expanded'), 'false');
  assert.equal(q('.stage').inert, false);
  q('.chapter-navigation a[href="#explore"]').click(); flush();
  assert.equal(w.scrollY, 10 * height / 1.5, 'chapter navigation reaches intended position');
  scroll(9.1);
  const fade=q('.split-scene').style.opacity;
  assert.ok(+fade>0&&+fade<1,'the entire white scene fades in progressively');
  scroll(9.6);assert.ok(+q('.split-scene').style.opacity>+fade,'forward scroll increases the white layer opacity');scroll(9.1);
  assert.equal(q('.split-scene').style.opacity,fade,'white transition reverses exactly');
  scroll(10.8);
  assert.equal(q('.split-scene').style.opacity, '1');
  assert.equal(q('.split-scene').inert, false);
  assert.equal(q('.gallery-scene').inert, true);
  assert.ok(Math.abs(parseFloat(q('.scroll-progress>span').style.transform.slice(7)) - 1) < 1e-9, 'progress reaches the end');
  q('.split-option').click();flush();assert.equal(d.body.dataset.page,'work');assert.equal(q('dialog').open,false);w.PortfolioPages.home('explore');flush();assert.equal(d.body.classList.contains('detail-mode'),false);
  scroll(0);
  assert.equal(q('.hero-scene').style.filter,'grayscale(0)','reverse scrolling restores the color portrait');
  assert.equal(q('.hero-portrait').style.transform, opening, 'full backwards scroll restores opening');
  if(!reduce){
   d.dispatchEvent(new w.MouseEvent('pointermove',{clientX:width*.9,clientY:height*.2,bubbles:true}));flush();
   assert.notEqual(q('.hero-portrait').style.transform,opening,'mouse movement tilts and moves the hero');
   assert.equal(w.scrollY,0,'mouse movement does not advance scroll');
   d.dispatchEvent(new w.MouseEvent('pointerleave'));flush();
   assert.equal(q('.hero-portrait').style.transform,opening,'pointer exit restores resting position');
   const wheel=new w.WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true});w.dispatchEvent(wheel);
   assert.equal(w.scrollY,0,'wheel target does not jump ahead of the visible frame');
   advance();
   assert.ok(w.scrollY>0&&w.scrollY<162,'first frame begins easing immediately');
   const rendered=parseFloat(q('.scroll-progress>span').style.transform.slice(7));
   assert.ok(Math.abs(rendered-w.scrollY/(height*7.2))<1e-9,'native position and rendered progress agree');
   flush();
   assert.ok(w.scrollY>150,'wheel input advances the timeline');
   assert.equal(wheel.defaultPrevented,true,'wheel handled by smooth scrolling');
   scroll(0);
  }
  scroll(3.35);assert.equal(q('.hero-scene').style.clipPath,messageFrame,'thumbnail restores on reverse scroll');scroll(0);
  assert.equal(q('.hero-scene').inert, false);
  assert.equal(q('.gallery-scene').style.visibility, 'hidden');
  console.log(`PASS ${width}×${height}, reduced-motion=${reduce}: gallery-to-entries transition and focus, reversible timeline, wheel input, menu, professional entry and return`);
  w.close();
}
{
 const {w,d,scroll,flush,advance}=boot(1600,900);
 const wheel=(deltaY,extra={})=>{const event=new w.WheelEvent('wheel',{deltaY,bubbles:true,cancelable:true,...extra});w.dispatchEvent(event);return event;};
 scroll(5.4);
 wheel(120);wheel(120);advance();
 const forward=w.scrollY;
 wheel(-120);advance();
 assert.ok(w.scrollY<forward,'reverse wheel changes direction on the next frame');flush();
 const start=w.scrollY;wheel(2.5);flush();
 assert.equal(w.scrollY,start+2.5,'fine trackpad input retains pixel precision');
 const zoomStart=w.scrollY;
 assert.equal(wheel(120,{ctrlKey:true}).defaultPrevented,false,'browser zoom gestures stay native');flush();
 assert.equal(w.scrollY,zoomStart);
 assert.equal(wheel(30,{deltaX:120}).defaultPrevented,false,'horizontal gestures stay native');
 scroll(0);wheel(1200);flush();
 assert.equal(w.scrollY,1620,'fast wheel impulses are not discarded by a one-screen cap');
 for(const link of d.querySelectorAll('.image-slot')){
   scroll(5.4);link.click();flush();
   assert.equal(w.scrollY,6000,'each of the eight gallery frames reaches the dual entry section');
   assert.equal(d.querySelector('dialog').open,false);
 }
 scroll(5.4);d.querySelector('.image-slot').focus();d.querySelector('.image-slot').click();advance();advance(100);
 wheel(-120);advance();flush();
 assert.notEqual(d.activeElement,d.querySelector('.split-option'),'interrupting gallery navigation does not steal focus');
 d.querySelector('.chapter-navigation a[href="#explore"]').click();advance();advance(80);
 const duringNavigation=w.scrollY;wheel(-120);advance();
 assert.ok(w.scrollY<duringNavigation,'wheel input immediately interrupts a chapter jump');flush();
 assert.ok(w.scrollY<6000,'interrupted navigation does not resume');
 w.close();
 console.log('PASS immediate reversal, trackpad precision, zoom/horizontal gestures, fast impulses, navigation interruption');
}
const frameSamples=[];
for(const [width,height] of [[1600,900],[1200,1173],[390,844]]){
 const {w,d,scroll,flush}=boot(width,height);
 const portrait=d.querySelector('.hero-portrait'),hero=d.querySelector('.hero-scene');
 const samples=[];
 function assertCovered(){
   const clip=parseFloat(hero.style.clipPath.slice(6));
   const shift=Number(portrait.style.transform.match(/,([-+\d.e]+)px,0\)/)[1]);
   const base=height+shift,frameBottom=height*(1-clip/100);
   assert.ok(base>=frameBottom+1.9,`portrait bottom must cover frame at ${width}×${height}`);
   return portrait.style.transform;
 }
 for(let i=0;i<=60;i++){scroll(i*.07);samples.push(assertCovered());}
 for(let i=60;i>=0;i--){scroll(i*.07);assert.equal(assertCovered(),samples[i],'reverse scroll restores the same bottom alignment');}
 for(const t of [.7,1.5,2,2.6,3.35]){
   scroll(t);
   for(const [x,y] of [[0,0],[width,0],[0,height],[width,height]]){
     d.dispatchEvent(new w.MouseEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));flush();assertCovered();
   }
 }
 w.close();console.log(`PASS ${width}×${height}: continuous portrait/frame bottom coverage, reverse scroll, pointer extremes`);
}
for(const [width,height,reduce] of [[1600,900,false],[390,844,false],[1600,900,true]]){
 const {w,d,scroll,flush,advance}=boot(width,height,reduce);
 scroll(10.8);d.querySelector('.split-option').click();
 if(!reduce){assert.equal(d.querySelector('.route-transition').hidden,false,'blue transition begins before the page changes');advance();advance(200);assert.equal(d.body.classList.contains('is-routing'),true);}
 flush();
 assert.equal(d.body.dataset.page,'work');assert.equal(w.location.hash,'#work');
 assert.equal(d.querySelector('.detail-hero-title').textContent,'专业作品');
 assert.equal(d.querySelector('.detail-collage'),null,'the removed professional visuals section leaves no markup or spacer');
 assert.deepEqual([...d.querySelectorAll('.project-panel h3')].map(el=>el.textContent),['项目01','项目02','项目03','other work']);
 assert.ok([...d.querySelectorAll('.project-panel')].every(el=>el.querySelectorAll('.detail-image').length===1&&el.querySelectorAll('.project-art').length===1),'each professional project contains exactly one cover');
 assert.equal(d.querySelector('.detail-story'),null,'professional creative statement has no markup or scroll spacer');
 assert.equal(d.querySelectorAll('.detail-section-nav button').length,2,'section navigation follows the removed chapters');
 assert.equal(d.querySelector('.detail-section-nav [data-section="projects"] span').textContent,'02');
 assert.equal(d.querySelector('.detail-scroll').dataset.section,'projects','hero scroll skips the removed statement');
 assert.equal(d.querySelector('.route-transition').hidden,true);assert.equal(w.scrollY,0);
 const projectSection=d.querySelector('[data-detail-section="projects"]');
 const before=[...d.querySelectorAll('[data-detail-section]')];
 const start=before.slice(0,before.indexOf(projectSection)).reduce((sum,e)=>sum+parseFloat(e.style.height),0);
 w.scrollTo(0,start+80);flush();const first=d.querySelector('.project-track').style.transform;
 w.scrollTo(0,start+260);flush();const second=d.querySelector('.project-track').style.transform;
 assert.notEqual(first,second,'vertical scroll moves the personal project track horizontally');
 assert.ok(parseFloat(second.slice(12))<parseFloat(first.slice(12)),'scrolling down moves the project track left');
 w.scrollTo(0,start+80);flush();assert.equal(d.querySelector('.project-track').style.transform,first,'reverse scroll restores horizontal project position');
 d.querySelector('[data-project-position="2"]').click();flush();
 assert.equal(d.querySelector('.project-current').textContent,'03');
 d.querySelector('[data-project-position="3"]').click();flush();
 assert.equal(d.querySelector('.project-current').textContent,'04','the fourth cover is reachable');
 assert.equal(d.querySelector('.detail-section-nav button.active').dataset.section,'projects');
 const endX=d.querySelector('.project-track').style.transform,endY=w.scrollY;
 w.scrollTo(0,endY+height*.4);flush();
 assert.ok(Math.abs(parseFloat(d.querySelector('.project-track').style.transform.slice(12))-parseFloat(endX.slice(12)))<1e-6,'after the last panel the track stops while the page keeps scrolling');
 assert.ok(w.scrollY>endY);
 d.querySelector('.project-art-main').click();flush();assert.equal(d.querySelector('dialog').open,false);assert.equal(d.body.dataset.page,'project');assert.equal(w.location.hash,'#work/project-01');
 d.querySelector('[data-back-projects]').click();flush();assert.equal(d.body.dataset.page,'work');
 d.querySelector('.footer-pages [data-open-page="life"]').click();flush();
 assert.equal(d.body.dataset.page,'life');assert.equal(d.querySelector('.detail-hero-title').textContent,'日常生活');
 assert.equal(d.body.classList.contains('detail-light'),true,'daily life uses its light theme');
 assert.equal(d.querySelectorAll('[data-horizontal-id="projects"] .project-panel').length,15,'daily life omits the removed hero photographs');
 assert.equal(d.querySelectorAll('[data-horizontal-id="projects"] .life-group-nav button').length,5,'life photographs have five remaining category shortcuts');
 assert.equal(d.querySelectorAll('[data-horizontal-id="team"] .project-panel').length,17,'team has its own photo collection');
 assert.equal(d.querySelectorAll('.detail-collage-card').length,0,'the selected daily-record collage is removed');
 d.querySelector('.detail-back').click();flush();
 assert.equal(d.body.classList.contains('detail-mode'),false);assert.equal(w.location.hash,'#explore');
 assert.equal(d.querySelector('.split-scene').inert,false);assert.equal(d.body.style.overflow,'');
 w.close();console.log(`PASS ${width}×${height}, reduced-motion=${reduce}: both detail routes, blue transition, horizontal wheel browsing, reversal, continuation, project preview, return`);
}
{
 const {w,d,flush}=boot(1600,900,false,'#work');
 assert.equal(d.body.dataset.page,'work','direct work links open the correct page');
 const historyLength=w.history.length;w.history.replaceState({},'','#explore');w.dispatchEvent(new w.PopStateEvent('popstate'));flush();
 assert.equal(d.body.classList.contains('detail-mode'),false,'browser history returns to the home page');
 assert.equal(w.history.length,historyLength,'history navigation does not push another entry');w.close();
 console.log('PASS direct route loading and browser history');
}
for(const [width,height,reduce] of [[1600,900,false],[390,844,false],[390,844,true]]){
 const {w,d,flush,advance}=boot(width,height,reduce,'#work');
 const projects=w.PORTFOLIO_CONTENT.pages.work.projects;
 for(let i=0;i<projects.length;i++){
   const link=d.querySelectorAll('.project-art-main')[i];
   assert.equal(link.tagName,'A');assert.equal(link.getAttribute('href'),'#work/'+projects[i].slug);
   link.click();flush();
   assert.equal(d.body.dataset.page,'project');assert.equal(d.body.dataset.project,projects[i].slug);
   assert.equal(d.querySelector('.project-detail-title').textContent,projects[i].title);
   assert.equal(w.location.hash,'#work/'+projects[i].slug);assert.equal(d.querySelector('dialog').open,false);
   assert.equal(d.querySelectorAll('.project-detail [data-detail-section]').length,5,'project is a full cover/overview/gallery/navigation/footer page');
   assert.equal(d.querySelectorAll('.project-detail-gallery figure').length,2);
   w.scrollTo(0,height);flush();assert.equal(w.scrollY,height,'project content scrolls vertically');
   if(!reduce){w.dispatchEvent(new w.WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));advance();flush();assert.ok(w.scrollY>height,'wheel scroll remains active on a project page');}
   const next=d.querySelector('.project-pagination a:last-child');next.click();flush();
   assert.equal(d.body.dataset.project,projects[(i+1)%projects.length].slug);
   d.querySelector('.project-pagination a:first-child').click();flush();assert.equal(d.body.dataset.project,projects[i].slug);
   d.querySelector('[data-back-projects]').click();flush();
   assert.equal(d.body.dataset.page,'work');assert.equal(d.querySelector('.project-current').textContent,String(i+1).padStart(2,'0'),'return to the matching cover');
 }
 const originalY=w.scrollY;d.querySelectorAll('.project-art-main')[3].click();flush();
 w.history.replaceState({},'','#work');w.dispatchEvent(new w.PopStateEvent('popstate'));flush();assert.equal(w.scrollY,originalY,'browser back restores collection scroll');
 for(const family of ['work','life']){
   w.PortfolioPages.open(family);flush();
   assert.equal(d.querySelectorAll('.portrait-footer').length,1);
   assert.equal(d.querySelectorAll('.footer-pages a').length,3);assert.ok(d.querySelector('.footer-portrait svg'),'photo has a replacement slot');
   assert.equal(d.body.classList.contains('detail-light'),family==='life');
   d.querySelector('[data-footer-home]').click();assert.equal(w.location.hash,'#intro');assert.equal(w.scrollY,0);flush();
 }
 w.close();console.log(`PASS ${width}×${height}, reduced-motion=${reduce}: four independent projects, direct links, project navigation, return position, shared footer, light life theme`);
}
for(const slug of ['project-01','project-02','project-03','other-work']){
 const {w,d,flush}=boot(1600,900,false,'#work/'+slug);
 assert.equal(d.body.dataset.project,slug,'project links load directly');
 d.querySelector('[data-back-projects]').click();flush();assert.equal(d.body.dataset.page,'work');w.close();
}
for(const [width,height,reduce] of [[1600,900,false],[390,844,false],[390,844,true]]){
 const {w,d,flush,scroll}=boot(width,height,reduce,'#work');
 const nav=d.querySelector('.menu-content nav');
 assert.deepEqual([...nav.querySelectorAll('a')].map(a=>a.textContent.replace(/[\d↗\s]/g,'')),['HOME','专业作品','日常生活']);
 const openMenu=()=>{d.querySelector('.menu-toggle').click();flush();};
 const closed=()=>assert.equal(d.querySelector('.menu-toggle').getAttribute('aria-expanded'),'false');
 openMenu();nav.querySelector('[data-menu-home]').click();
 assert.equal(d.body.classList.contains('detail-mode'),false,'HOME immediately leaves the interior');
 assert.equal(w.scrollY,0,'HOME goes straight to the opening, not the entry section');
 assert.equal(w.location.hash,'#intro');closed();flush();
 scroll(5.4);openMenu();nav.querySelector('[data-menu-home]').click();
 assert.equal(w.scrollY,0,'HOME immediately returns from a scrolled home chapter');closed();flush();
 openMenu();nav.querySelector('[data-open-page="work"]').click();flush();
 assert.equal(d.body.dataset.page,'work');closed();
 w.scrollTo(0,500);flush();openMenu();nav.querySelector('[data-open-page="work"]').click();closed();flush();
 assert.equal(w.scrollY,0,'selecting the current page closes the menu and returns to its beginning');
 openMenu();nav.querySelector('[data-open-page="life"]').click();flush();
 assert.equal(d.body.dataset.page,'life');closed();
 openMenu();nav.querySelector('[data-menu-home]').click();
 assert.equal(w.scrollY,0);assert.equal(w.location.hash,'#intro');closed();flush();
 w.close();console.log(`PASS ${width}×${height}, reduced-motion=${reduce}: three menu entries, direct HOME, both interior links, current-page menu closing`);
}
for(const fps of [60,120]){
 const {w,advance}=boot(1600,900);
 w.dispatchEvent(new w.WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));
 let elapsed=0,t95=null;
 for(let i=0;i<fps*.3;i++){advance(1000/fps);elapsed+=1000/fps;if(t95===null&&w.scrollY>=162*.95)t95=elapsed;}
 assert.ok(t95<=225,'wheel reaches 95% of its movement within 225ms');
 frameSamples.push(w.scrollY);
 console.log(`PASS ${fps}Hz: 95% response in ${Math.round(t95)}ms`);w.close();
}
assert.ok(Math.abs(frameSamples[0]-frameSamples[1])<.5,'high-refresh and standard displays follow the same motion curve');
for (const file of ['styles.css', 'content.js', 'app.js', 'pages.js', 'pages.css']) assert.ok(fs.statSync(path.join(root, file)).size > 0);
assert.ok(!/https?:\/\//.test(fs.readFileSync(path.join(root, 'app.js'), 'utf8')), 'no remote runtime dependency');
console.log('PASS local assets and self-contained runtime');
