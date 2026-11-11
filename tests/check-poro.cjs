(async()=>{
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../dist');
const markup='<!doctype html><div id="root"></div><dialog class="image-dialog"><div class="dialog-image"></div><div class="dialog-footer"><span class="dialog-label"></span></div></dialog>';
const dom=new JSDOM(markup,{url:'https://portfolio.test/portfolio-scroll-study/#work/project-01',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document,el=d.querySelector('#root');
const modes=new Map();
w.matchMedia=query=>{if(!modes.has(query))modes.set(query,{matches:false,listeners:new Set(),addEventListener(t,fn){this.listeners.add(fn);},removeEventListener(t,fn){this.listeners.delete(fn);}});return modes.get(query);};
let observer,disconnected=false;
w.IntersectionObserver=class{constructor(cb){this.cb=cb;observer=this;}observe(){}disconnect(){disconnected=true;}};
w.PortfolioHome={preview(src,caption){d.querySelector('.dialog-image').innerHTML=`<img src="${src}">`;d.querySelector('.dialog-label').textContent=caption;d.querySelector('dialog').open=true;}};
w.eval(fs.readFileSync(path.join(root,'poro.js'),'utf8'));
el.innerHTML=w.PoroCaseStudy.render({pagination:'<section class="project-pagination" data-detail-section="projectNavigation"></section>'});
assert.equal(el.querySelectorAll('.poro-section').length,7);
assert.deepEqual([...el.querySelectorAll('.poro-toc [data-section]')].map(x=>x.dataset.section),[...el.querySelectorAll('.poro-section')].map(x=>x.dataset.detailSection));
assert.match(el.querySelector('h1').textContent,/魄罗大冒险/);
assert.match(el.querySelector('.poro-facts').textContent,/2024.10 — 2025.01/);
assert.match(el.querySelector('.poro-facts').textContent,/5 人团队/);
assert.match(el.querySelector('.poro-outcome').textContent,/最佳 IP 奖/);
assert.equal(el.querySelectorAll('.poro-photo').length,26,'all 25 document visuals plus supplied cover are included');
assert.equal(el.querySelectorAll('.poro-motion').length,10);
assert.equal(el.querySelectorAll('details').length,0,'all project media is inline, including previously collapsed demos');
for(const img of el.querySelectorAll('img')){
 assert.ok(img.alt&&img.width>0&&img.height>0);
 assert.ok(fs.statSync(path.join(root,img.getAttribute('src'))).size>0);

}
assert.equal(el.querySelectorAll('.poro-awards figcaption').length,2);
assert.ok([...el.querySelectorAll('.poro-awards figcaption')].every(x=>x.textContent.includes('AI 英文翻译展示版')));
assert.equal(el.querySelector('.poro-pair a').href,'https://www.animalwell.net/');
assert.ok(!el.textContent.includes('第一名'),'only the award stated in the new outline is claimed');
for(const video of el.querySelectorAll('video')){
 assert.equal(video.getAttribute('preload'),'none');assert.ok(video.hasAttribute('muted')&&video.hasAttribute('loop')&&video.hasAttribute('playsinline'));
 assert.equal(video.hasAttribute('src'),false,'offscreen media is not fetched');
 const bytes=fs.readFileSync(path.join(root,video.dataset.motionSrc));assert.equal(bytes.subarray(4,8).toString(),'ftyp');
 assert.ok(fs.statSync(path.join(root,video.poster.replace('https://portfolio.test/portfolio-scroll-study/',''))).size>0);
}
let hidden=false;Object.defineProperty(d,'hidden',{get:()=>hidden});
Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return this._paused!==false;}});
w.HTMLMediaElement.prototype.play=function(){this._paused=false;this._plays=(this._plays||0)+1;return Promise.resolve();};
w.HTMLMediaElement.prototype.pause=function(){this._paused=true;};w.HTMLMediaElement.prototype.load=function(){};
const cleanup=w.PoroCaseStudy.mount(el),figure=el.querySelector('.poro-motion'),video=figure.querySelector('video'),button=figure.querySelector('button');
const visible=value=>observer.cb([{target:figure,isIntersecting:value,intersectionRatio:value?1:0}]);
assert.equal(video.hasAttribute('src'),false);visible(true);await new Promise(resolve=>setImmediate(resolve));
assert.equal(video.paused,false,'entering the viewport automatically plays without a click');
assert.equal(video.getAttribute('src'),video.dataset.motionSrc);assert.equal(button.getAttribute('aria-pressed'),'true');
visible(false);assert.equal(video.paused,true);visible(true);await new Promise(resolve=>setImmediate(resolve));assert.equal(video.paused,false);
button.click();assert.equal(video.paused,true);visible(false);visible(true);assert.equal(video.paused,true,'user pause survives leaving and re-entering');
button.click();await new Promise(resolve=>setImmediate(resolve));assert.equal(video.paused,false);
d.dispatchEvent(new w.CustomEvent('portfolio:menu',{detail:{open:true}}));assert.equal(video.paused,true);
d.dispatchEvent(new w.CustomEvent('portfolio:menu',{detail:{open:false}}));await new Promise(resolve=>setImmediate(resolve));assert.equal(video.paused,false);
hidden=true;d.dispatchEvent(new w.Event('visibilitychange'));assert.equal(video.paused,true);
hidden=false;d.dispatchEvent(new w.Event('visibilitychange'));await new Promise(resolve=>setImmediate(resolve));assert.equal(video.paused,false);
const reduced=modes.get('(prefers-reduced-motion: reduce)');reduced.matches=true;reduced.listeners.forEach(fn=>fn());assert.equal(video.paused,true);assert.equal(button.getAttribute('aria-pressed'),'false');
reduced.matches=false;reduced.listeners.forEach(fn=>fn());await new Promise(resolve=>setImmediate(resolve));assert.equal(video.paused,false);
visible(false);let resolvePlay;video.play=function(){return new Promise(resolve=>resolvePlay=()=>{this._paused=false;resolve();});};
visible(true);visible(false);resolvePlay();await new Promise(resolve=>setImmediate(resolve));assert.equal(video.paused,true,'late autoplay cannot resume an offscreen video');
video.play=()=>Promise.reject(new Error('Autoplay blocked'));visible(true);await new Promise(resolve=>setImmediate(resolve));assert.match(button.textContent,/播放演示/,'browser autoplay restrictions leave a usable fallback');
video.play=w.HTMLMediaElement.prototype.play;button.click();await new Promise(resolve=>setImmediate(resolve));assert.equal(video.paused,false,'fallback can retry playback');
const compact=modes.get('(max-width:1100px)'),toggle=el.querySelector('.poro-toc-toggle'),toc=el.querySelector('.poro-toc');compact.matches=true;compact.listeners.forEach(fn=>fn());assert.equal(toc.inert,true);
toggle.click();assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(toc.inert,false);
toc.querySelector('button').click();assert.equal(toggle.getAttribute('aria-expanded'),'false');
toggle.click();d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(toggle.getAttribute('aria-expanded'),'false');
w.PoroCaseStudy.openImage('assets/poro/image8_light.jpg','安全下落边界');
assert.ok(d.querySelector('dialog').classList.contains('poro-lightbox'));const zoom=d.querySelector('.poro-zoom');zoom.click();assert.equal(zoom.getAttribute('aria-pressed'),'true');assert.ok(d.querySelector('.dialog-image').classList.contains('poro-zoomed'));
d.querySelector('dialog').dispatchEvent(new w.Event('close'));assert.equal(d.querySelectorAll('.poro-zoom').length,0);
cleanup();assert.ok(disconnected);for(const mode of modes.values())assert.equal(mode.listeners.size,0);assert.equal(video.hasAttribute('src'),false);assert.equal(video.paused,true);button.click();assert.equal(video.hasAttribute('src'),false,'unmounted controls release listeners and media buffers');
dom.window.close();
console.log('PASS Poro: seven ordered chapters, all 26 visuals, efficient MP4/posters, authentic award labels, in-view autoplay and manual pause, offscreen/menu/reduced-motion pause, responsive directory, image zoom and cleanup');

// Exercise the real route with the new renderer, including return to the first cover.
const page=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://portfolio.test/portfolio-scroll-study/#work/project-01',runScripts:'outside-only',pretendToBeVisual:true});
const v=page.window,p=v.document;v.HTMLMediaElement.prototype.pause=function(){};v.HTMLMediaElement.prototype.load=function(){};let y=0,clock=0,serial=0;const frames=new Map();
Object.defineProperties(v,{innerWidth:{value:1280},innerHeight:{value:800},scrollY:{get:()=>y}});
Object.defineProperty(v.HTMLElement.prototype,'offsetHeight',{get(){return this.id==='viewport-metric'?800:500;}});
v.matchMedia=q=>({matches:q.includes('reduced-motion'),addEventListener(){},removeEventListener(){}});
v.requestAnimationFrame=cb=>(frames.set(++serial,cb),serial);v.cancelAnimationFrame=id=>frames.delete(id);
v.scrollTo=(x,top)=>{y=typeof x==='object'?x.top:top;v.dispatchEvent(new v.Event('scroll'));};
v.HTMLDialogElement.prototype.showModal=function(){this.open=true;};v.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new v.Event('close'));};
for(const file of ['content.js','app.js','moneyball.js','poro.js','pages.js'])v.eval(fs.readFileSync(path.join(root,file),'utf8'));
const flush=()=>{for(let i=0;frames.size&&i<1000;i++){const jobs=[...frames.values()];frames.clear();clock+=16.667;jobs.forEach(cb=>cb(clock));}assert.equal(frames.size,0);};
assert.ok(p.querySelector('.poro-case'));assert.equal(p.body.dataset.project,'project-01');assert.equal(p.documentElement.style.getPropertyValue('--header-color'),'#edf8ff');
p.querySelector('[data-back-projects]').click();flush();assert.equal(v.location.hash,'#work');assert.equal(p.querySelector('.project-current').textContent,'01');
p.querySelector('[data-project-index="0"]').click();flush();assert.ok(p.querySelector('.poro-case'));assert.equal(v.location.hash,'#work/project-01');
assert.equal(p.querySelectorAll('#detail-section-navigation').length,1);assert.equal(p.querySelectorAll('[data-motion-figure]').length,10);
p.querySelector('.poro-footer [data-footer-home]').click();flush();assert.equal(v.location.hash,'#intro');assert.equal(p.body.classList.contains('detail-mode'),false);
page.window.close();console.log('PASS Poro direct hash route, cover entry, correct winter header, return to original cover, single directory and HOME cleanup');

})().catch(error=>{console.error(error);process.exitCode=1;});
