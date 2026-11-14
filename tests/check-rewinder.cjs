const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../dist');
const dom=new JSDOM('<div id="root"></div><dialog class="image-dialog"><div class="dialog-image"></div><div class="dialog-footer"><span class="dialog-label"></span></div></dialog>',{url:'https://portfolio.test/portfolio-scroll-study/#work/project-02',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document,el=d.querySelector('#root'),modes=new Map();
w.matchMedia=query=>{if(!modes.has(query))modes.set(query,{matches:false,listeners:new Set(),addEventListener(type,fn){this.listeners.add(fn);},removeEventListener(type,fn){this.listeners.delete(fn);}});return modes.get(query);};
w.PortfolioHome={preview(src,caption){d.querySelector('.dialog-image').innerHTML=`<img src="${src}">`;d.querySelector('.dialog-label').textContent=caption;d.querySelector('dialog').open=true;}};
w.eval(fs.readFileSync(path.join(root,'rewinder.js'),'utf8'));
el.innerHTML=w.RewinderCaseStudy.render({pagination:'<section class="project-pagination" data-detail-section="projectNavigation"></section>'});
const chapterIds=['projectHero','rwCore','rwCombat','rwStory','rwVisual','rwProduction'];
assert.deepEqual([...el.querySelectorAll('.rw-section')].map(x=>x.dataset.detailSection),chapterIds);
assert.deepEqual([...el.querySelectorAll('.rw-toc [data-section]')].map(x=>x.dataset.section),chapterIds);
assert.equal(el.querySelector('h1').textContent,'Rewinder');
assert.match(el.querySelector('.rw-facts').textContent,/战斗策划 · 概念美术/);
assert.match(el.querySelector('.rw-facts').textContent,/Unreal Engine 5.6/);
assert.match(el.querySelector('.rw-facts').textContent,/工作室 10 人/);
assert.match(el.querySelector('.rw-facts').textContent,/已获得投资/);
assert.deepEqual([...el.querySelectorAll('[data-rw-visual]')].map(x=>Number(x.dataset.rwVisual)).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i+1),'all sixteen supplied visuals have an inline representation');
assert.equal(el.querySelectorAll('.rw-photo img').length,13);
assert.equal(el.querySelectorAll('.rw-diagram').length,3);
assert.equal(el.querySelectorAll('details,canvas,video').length,0,'static source material is directly readable without unnecessary animation or expansion');
assert.deepEqual([...el.querySelectorAll('.rw-diagram .rw-flow')].map(flow=>flow.children.length),[3,3,2]);
assert.equal(el.querySelectorAll('.rw-endings>section').length,2);
assert.match(el.querySelector('[data-rw-visual="4"]').textContent,/同步发生/);
assert.match(el.querySelector('[data-rw-visual="4"]').textContent,/不表示额外的自由普攻/);
assert.match(el.querySelector('[data-rw-visual="5"]').textContent,/部分敌人数值强化/);
assert.match(el.querySelector('[data-rw-visual="5"]').textContent,/不代表敌人强化的实测数据/);
assert.match(el.querySelector('[data-rw-visual="1"] figcaption').textContent,/不是游戏截图/);
assert.match(el.querySelector('[data-rw-visual="8"] figcaption').textContent,/参考拼贴/);
assert.match(el.querySelector('[data-rw-visual="7"] figcaption').textContent,/尚不是两条时间线的完成对照/);
assert.match(el.querySelector('[data-rw-visual="2"] figcaption').textContent,/00:30.*包含素材资产/);
assert.match(el.querySelector('[data-rw-visual="3"] figcaption').textContent,/00:50.*开发过程/);
for(const img of el.querySelectorAll('img')){
 assert.ok(img.alt&&img.width>0&&img.height>0);assert.ok(img.srcset.includes('-640.webp'));
 assert.ok(img.closest('.rw-brand')?img.getAttribute('fetchpriority')==='high':img.getAttribute('loading')==='lazy');
 for(const candidate of img.srcset.split(','))assert.ok(fs.statSync(path.join(root,candidate.trim().split(/\s+/)[0])).size>0);
}
const assetButtons=[...el.querySelectorAll('[data-rewinder-image]')];
assert.equal(assetButtons.length,16);
for(const button of assetButtons){const file=path.join(root,button.dataset.rewinderImage);assert.ok(fs.statSync(file).size>0);assert.equal(fs.readFileSync(file).includes(Buffer.from('EXIF')),false);}
assert.ok(fs.readdirSync(path.join(root,'assets/rewinder')).reduce((bytes,name)=>bytes+fs.statSync(path.join(root,'assets/rewinder',name)).size,0)<3.5*1024*1024,'full-resolution and mobile images stay within the case study image budget');
const cleanup=w.RewinderCaseStudy.mount(el),compact=modes.get('(max-width:1100px)'),toggle=el.querySelector('.rw-toc-toggle'),toc=el.querySelector('.rw-toc');
compact.matches=true;compact.listeners.forEach(fn=>fn());assert.equal(toc.inert,true);
toggle.click();assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(toc.inert,false);
toc.querySelector('button').click();assert.equal(toggle.getAttribute('aria-expanded'),'false');
toggle.click();d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(toggle.getAttribute('aria-expanded'),'false');
toggle.click();d.dispatchEvent(new w.CustomEvent('portfolio:menu',{detail:{open:true}}));assert.equal(toggle.getAttribute('aria-expanded'),'false');
compact.matches=false;compact.listeners.forEach(fn=>fn());assert.equal(toc.inert,false,'desktop directory remains keyboard-accessible');
for(let i=0;i<2;i++){
 w.RewinderCaseStudy.openImage('assets/rewinder/image-08.webp','精英打手概念探索');
 assert.equal(d.querySelector('.dialog-image img').getAttribute('src'),'assets/rewinder/image-08.webp');assert.ok(d.querySelector('dialog').classList.contains('rw-lightbox'));
 const zoom=d.querySelector('.rw-zoom');zoom.click();assert.equal(zoom.getAttribute('aria-pressed'),'true');assert.ok(d.querySelector('.dialog-image').classList.contains('rw-zoomed'));
 zoom.click();assert.equal(zoom.getAttribute('aria-pressed'),'false');
 d.querySelector('dialog').dispatchEvent(new w.Event('close'));assert.equal(d.querySelectorAll('.rw-zoom').length,0);assert.equal(d.querySelector('dialog').classList.contains('rw-lightbox'),false);
}
cleanup();assert.equal(compact.listeners.size,0);toggle.click();assert.equal(toggle.getAttribute('aria-expanded'),'false');
w.close();
console.log('PASS Rewinder: six ordered chapters, all sixteen document visuals, readable native flows and two endings, accurate concept/demo labels, responsive images, compact directory, repeatable zoom and listener cleanup');

for(const [width,height,reduce] of [[1280,800,false],[390,844,false],[320,568,true]]){
 const page=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://portfolio.test/portfolio-scroll-study/#work/project-02',runScripts:'outside-only',pretendToBeVisual:true});
 const v=page.window,p=v.document;let y=0,clock=0,serial=0;const frames=new Map();
 Object.defineProperties(v,{innerWidth:{value:width},innerHeight:{value:height},scrollY:{get:()=>y}});
 Object.defineProperty(v.HTMLElement.prototype,'offsetHeight',{get(){return this.id==='viewport-metric'?height:500;}});
 v.matchMedia=q=>({matches:q.includes('reduced-motion')?reduce:q.includes('1100')?width<=1100:false,addEventListener(){},removeEventListener(){}});
 v.performance.now=()=>clock;v.requestAnimationFrame=cb=>(frames.set(++serial,cb),serial);v.cancelAnimationFrame=id=>frames.delete(id);
 v.scrollTo=(x,top)=>{y=typeof x==='object'?x.top:top;v.dispatchEvent(new v.Event('scroll'));};
 v.HTMLDialogElement.prototype.showModal=function(){this.open=true;};v.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new v.Event('close'));};
 for(const file of ['content.js','app.js','rewinder.js','pages.js'])v.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const flush=()=>{for(let i=0;frames.size&&i<1200;i++){const jobs=[...frames.values()];frames.clear();clock+=16.667;jobs.forEach(cb=>cb(clock));}assert.equal(frames.size,0);};
 assert.ok(p.querySelector('.rw-case'));assert.equal(v.document.title,'Rewinder / Portfolio');assert.equal(p.body.dataset.project,'project-02');
 assert.equal(p.documentElement.style.getPropertyValue('--header-color'),'#f2ece7');
 assert.equal(p.querySelectorAll('#detail-section-navigation').length,1);
 assert.equal(p.querySelector('.project-pagination a').getAttribute('href'),'#work/project-01');assert.equal(p.querySelectorAll('.project-pagination a')[1].getAttribute('href'),'#work/project-03');
 if(width<=1100)p.querySelector('.rw-toc-toggle').click();
 p.querySelector('.rw-toc [data-section="rwCombat"]').click();flush();assert.equal(p.querySelector('.rw-toc-toggle').getAttribute('aria-expanded'),'false');
 p.querySelector('.rw-image').click();assert.ok(p.querySelector('dialog').open);p.querySelector('.dialog-close').click();assert.equal(p.querySelector('.rw-zoom'),null);
 p.querySelector('[data-back-projects]').click();flush();assert.equal(v.location.hash,'#work');assert.equal(p.querySelector('.project-current').textContent,'02');
 assert.equal(p.querySelector('[data-project-index="1"] img').getAttribute('src'),'assets/rewinder/image-01.webp');
 p.querySelector('[data-project-index="1"]').click();flush();assert.equal(v.location.hash,'#work/project-02');assert.ok(p.querySelector('.rw-case'));
 p.querySelector('.rw-footer [data-footer-home]').click();flush();assert.equal(v.location.hash,'#intro');assert.equal(p.body.classList.contains('detail-mode'),false);assert.equal(p.querySelector('#detail-pages').hidden,true);assert.equal(p.querySelector('#detail-pages').inert,true);
 page.window.close();console.log(`PASS Rewinder ${width}x${height}, reduced-motion=${reduce}: direct link, chapter navigation, image preview, project02 cover, return position and HOME cleanup`);
}
