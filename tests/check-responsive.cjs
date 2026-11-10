const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../dist');
function boot(width,height,hash=''){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'outside-only',url:'https://portfolio.test/'+hash,pretendToBeVisual:true});
 const w=dom.window,d=w.document;let viewHeight=height,y=0,clock=0,id=0,frames=new Map();
 Object.defineProperties(w,{innerWidth:{value:width,writable:true},innerHeight:{value:height,writable:true},scrollY:{get:()=>y}});
 Object.defineProperty(d.documentElement,'scrollHeight',{get:()=>d.body.classList.contains('detail-mode')?Number(d.querySelector('.detail-route')?.dataset.scrollHeight||viewHeight):viewHeight*8.2});
 Object.defineProperty(w.HTMLElement.prototype,'offsetHeight',{get(){const c=this.classList;return this.id==='viewport-metric'?viewHeight:c.contains('scroll-space')?viewHeight*8.2:c.contains('hero-portrait')?Math.min(viewHeight*1.28,w.innerWidth*2.4)*.75:c.contains('portrait-footer')?viewHeight*1.05:c.contains('project-detail-hero')?viewHeight*1.4:c.contains('project-detail-overview')?viewHeight*.8:c.contains('project-detail-gallery')?viewHeight*1.6:c.contains('project-pagination')?viewHeight*.6:100;}});
 w.matchMedia=q=>({matches:q.includes('reduced-motion')?false:q.includes('fine')?false:q.includes('600')?width<=600:true,addEventListener(){}});
 w.performance.now=()=>clock;
 w.requestAnimationFrame=cb=>(frames.set(++id,cb),id);w.cancelAnimationFrame=i=>frames.delete(i);
 w.scrollTo=(x,top)=>{y=typeof x==='object'?x.top:top;w.dispatchEvent(new w.Event('scroll'));};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 for(const file of ['content.js','app.js','pages.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 function advance(dt=16.667){clock+=dt;const jobs=[...frames.values()];frames.clear();jobs.forEach(cb=>cb(clock));}
 function flush(){for(let i=0;frames.size&&i<1200;i++)advance();assert.equal(frames.size,0);}
 function resize(width,height,stableHeight=height){w.innerWidth=width;w.innerHeight=height;viewHeight=stableHeight;w.dispatchEvent(new w.Event('resize'));flush();}
 function touch(type,points,target=d.querySelector('.project-art-main')){const e=new w.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:points.map(([clientX,clientY])=>({clientX,clientY}))});target.dispatchEvent(e);return e.defaultPrevented;}
 return{w,d,flush,advance,resize,touch};
}
for(const [width,height] of [[320,568],[360,800],[375,667],[390,844],[430,932],[600,900],[768,1024],[820,1180],[1024,768],[844,390],[932,430],[1280,720],[1440,900],[1920,1080],[2560,1440]]){
 const t=boot(width,height,'#work'),{w,d,flush}=t;const q=s=>d.querySelector(s);
 q('.detail-section-nav [data-section="projects"]').click();flush();
 const start=w.scrollY;
 assert.ok(start>height,'project section has a useful scroll span');
 q('[data-project-position="3"]').click();flush();
 assert.equal(q('.project-current').textContent,'04','last project reachable');
 assert.ok(!q('.project-track').style.transform.includes('NaN'));
 q('[data-project-position="0"]').click();flush();
 const x0=q('.project-track').style.transform;
 w.scrollTo({top:start+100});flush();assert.notEqual(q('.project-track').style.transform,x0,'native vertical scrolling drives the track');
 q('[data-project-position="2"]').click();flush();
 const atThird=w.scrollY;
 t.resize(width,height-60,height);assert.equal(w.scrollY,atThird,'browser toolbar does not change section position');
 const rotatedWidth=width<=600?844:390,rotatedHeight=width<=600?390:844;
 t.resize(rotatedWidth,rotatedHeight);assert.equal(q('.project-current').textContent,'03','rotation preserves the current project');
 q('[data-project-position="3"]').click();flush();assert.equal(q('.project-current').textContent,'04');
 q('.footer-pages [data-open-page="life"]').click();flush();assert.ok(d.body.classList.contains('detail-light'));
 q('.detail-section-nav [data-section="projects"]').click();flush();q('[data-project-position="2"]').click();flush();assert.equal(q('.project-current').textContent,'03');
 q('.footer-pages [data-footer-home]').click();flush();assert.equal(w.scrollY,0);assert.equal(w.location.hash,'#intro');
 w.scrollTo({top:3.35*rotatedHeight/1.5});flush();const before=q('.hero-scene').style.clipPath;
 t.resize(width,height);assert.equal(q('.hero-scene').style.filter,'grayscale(1)');assert.ok(!q('.hero-portrait').style.transform.includes('NaN'));
 assert.ok(before.includes('inset('));
 console.log(`PASS ${width}x${height}: all covers, vertical browsing, stable toolbar height, rotation anchor, light life route, home and gray thumbnail`);w.close();
}
{
 const t=boot(390,844,'#work'),{w,d,flush,touch,advance}=t,q=s=>d.querySelector(s);
 q('.detail-section-nav [data-section="projects"]').click();flush();const start=w.scrollY;
 touch('touchstart',[[330,450]]);advance(20);assert.equal(touch('touchmove',[[150,452]]),true,'horizontal intent is handled');
 advance(150);touch('touchend',[]);q('.project-art-main').click();assert.equal(w.location.hash,'#work','swipe does not open the cover');flush();
 assert.ok(w.scrollY>start,'leftward swipe moves forward');assert.notEqual(q('.project-track').style.transform,'translate3d(0px,0,0)');
 touch('touchstart',[[80,450]]);advance(20);assert.ok(touch('touchmove',[[330,452]]));advance(150);touch('touchend',[]);flush();assert.equal(w.scrollY,start,'reverse swipe restores first cover');
 touch('touchstart',[[150,450]]);advance(20);assert.equal(touch('touchmove',[[153,330]]),false,'vertical intent stays native');touch('touchend',[]);
 touch('touchstart',[[150,450],[200,450]]);assert.equal(touch('touchmove',[[120,430],[240,430]]),false,'pinch is never intercepted');touch('touchcancel',[]);
 advance(400);touch('touchstart',[[150,450]]);touch('touchend',[]);q('.project-art-main').click();flush();assert.equal(w.location.hash,'#work/project-01','ordinary tap opens its independent page');
 q('.project-detail-overview');t.resize(844,390);assert.ok(!q('.project-detail-cover').style.transform.includes('NaN'));
 console.log('PASS touch direction lock, reverse swipe, click suppression, native vertical input, pinch, cover tap and project resize');w.close();
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.includes('viewport-fit=cover')&&!html.includes('user-scalable=no'));assert.ok(html.includes('responsive.css'));
console.log('PASS safe-area viewport and browser zoom remain enabled');
