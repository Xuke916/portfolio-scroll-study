const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../dist');
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://portfolio.test/portfolio-scroll-study/#life',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;let y=0,clock=0,id=0,frames=new Map();
Object.defineProperties(w,{innerWidth:{value:390},innerHeight:{value:844},scrollY:{get:()=>y}});
Object.defineProperty(d.documentElement,'scrollHeight',{get:()=>Number(d.querySelector('.detail-route')?.dataset.scrollHeight||844)});
Object.defineProperty(w.HTMLElement.prototype,'offsetHeight',{get(){return this.id==='viewport-metric'?844:this.classList.contains('portrait-footer')?900:100;}});
w.matchMedia=q=>({matches:!q.includes('reduced-motion')&&!q.includes('fine'),addEventListener(){}});
w.performance.now=()=>clock;w.requestAnimationFrame=cb=>(frames.set(++id,cb),id);w.cancelAnimationFrame=i=>frames.delete(i);
w.scrollTo=(x,top)=>{y=typeof x==='object'?x.top:top;w.dispatchEvent(new w.Event('scroll'));};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
for(const file of ['content.js','app.js','pages.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
function flush(){for(let i=0;frames.size&&i<1200;i++){clock+=16.667;const jobs=[...frames.values()];frames.clear();jobs.forEach(cb=>cb(clock));}assert.equal(frames.size,0);}
const groups=w.PORTFOLIO_CONTENT.pages.life.projects;
const gallery=d.querySelector('[data-horizontal-id="projects"]'),team=d.querySelector('[data-horizontal-id="team"]');
assert.deepEqual(Array.from(groups,g=>[g.title,g.photos.length]),[['我的宠物',3],['我的收藏',6],['滑雪',3],['动捕中',2],['我的纹身',1]]);
assert.ok(!JSON.stringify(w.PORTFOLIO_CONTENT).includes('assets/team/pitching-02.webp'));
assert.ok(!JSON.stringify(w.PORTFOLIO_CONTENT).includes('assets/life/collection-01.webp'));
assert.ok(!JSON.stringify(groups).includes('sketch-clay'));
const photos=groups.flatMap(g=>Array.from(g.photos)),buttons=[...gallery.querySelectorAll('.life-photo-button')];
assert.equal(photos.length,15);assert.equal(new Set(photos.map(p=>p.image )).size,15);assert.equal(buttons.length,15);
assert.ok(!gallery.textContent.includes('我与超级英雄'));assert.ok(!photos.some(photo=>photo.image.includes('heroes-')));
assert.deepEqual([...gallery.querySelectorAll('.life-group-nav button')].map(b=>Number(b.dataset.projectPosition)),[0,1,2,3,4]);

for(const key of ['editorialAnchors','editorialMobileAnchors']){const anchors=gallery.dataset[key].split(',').map(Number);assert.equal(anchors.length,5);assert.equal(anchors[0],0);assert.ok(anchors.every((x,i)=>i===0||x>anchors[i-1]));}
assert.equal(gallery.querySelectorAll('.life-photo-group').length,5);assert.equal(new Set([...gallery.querySelectorAll('.life-photo-panel')].map(p=>p.style.getPropertyValue('--photo-height'))).size>2,true,'the photo composition mixes large and small images');
assert.equal(d.querySelector('.life-editorial h1').textContent,'日常生活');assert.equal(d.querySelector('.life-editorial-photo img').getAttribute('fetchpriority'),'high');
assert.equal(d.querySelector('.life-editorial-photo img').getAttribute('src'),'assets/life/xu-ke-portrait.webp');assert.equal(d.querySelector('.life-editorial-photo img').width,1344);assert.equal(d.querySelector('.life-editorial-photo img').height,2400);
assert.match(d.querySelector('.life-hero-intro').textContent,/中国传媒大学/);
assert.equal(team.querySelectorAll('.project-panel').length,17,'the separate team collection remains before life photos');
const teamGroups=w.PORTFOLIO_CONTENT.pages.life.team.items;
assert.deepEqual(Array.from(teamGroups,g=>[g.title,g.photos.length]),[['球队合影',2],['球员照',2],['投球与训练',3],['球场日常',4],['挥棒瞬间',2],['在新加坡打球',2],['为球队画的宣传画',2]]);
const teamPhotos=teamGroups.flatMap(g=>Array.from(g.photos)),teamButtons=[...team.querySelectorAll('.life-photo-button')];
assert.equal(new Set(teamPhotos.map(p=>p.image)).size,17);
assert.ok(teamPhotos.slice(13,15).every(p=>p.alt.includes('新加坡')));
assert.ok(teamPhotos.slice(15).every(p=>p.alt.includes('我为球队画的宣传画')));
assert.ok(team.querySelector('.projects-heading').textContent.includes('我与我的球队'));
for(const [i,photo] of [...photos,...teamPhotos].entries()){
 const buttonsForCheck=[...buttons,...teamButtons];
 const img=buttonsForCheck[i].querySelector('img');assert.equal(img.getAttribute('loading'),'lazy');assert.equal(img.alt,photo.alt);assert.ok(img.width>0&&img.height>0);
 assert.equal(buttonsForCheck[i].dataset.lifePhoto,photo.image);assert.ok(img.srcset.includes(photo.thumbnail)&&img.srcset.includes(photo.image));
 for(const asset of [photo.image,photo.thumbnail])assert.ok(fs.statSync(path.join(root,asset)).size>0);
 const bytes=fs.readFileSync(path.join(root,photo.image));assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.equal(bytes.includes(Buffer.from('EXIF')),false,'source photo metadata is excluded');
}
d.querySelector('[data-section="team"]').click();flush();
for(const button of team.querySelectorAll('.life-group-nav button')){button.click();flush();assert.equal(button.getAttribute('aria-current'),'true');assert.equal(Number(team.querySelector('.project-current').textContent),Number(button.dataset.projectPosition)+1);assert.equal(gallery.querySelector('.project-current').textContent,'01');}
teamButtons.at(-1).click();assert.ok(d.querySelector('dialog').open);assert.equal(d.querySelector('.dialog-image img').getAttribute('src'),teamPhotos.at(-1).image);assert.match(d.querySelector('.dialog-label').textContent,/宣传画/);d.querySelector('.dialog-close').click();
d.querySelector('[data-section="projects"]').click();flush();
for(const button of gallery.querySelectorAll('.life-group-nav button')){
 button.click();flush();assert.equal(button.getAttribute('aria-current'),'true');assert.equal(Number(gallery.querySelector('.project-current').textContent),Number(button.dataset.projectPosition)+1);
}
buttons.at(-1).click();assert.ok(d.querySelector('dialog').open);assert.equal(d.querySelector('.dialog-image img').getAttribute('src'),photos.at(-1).image);assert.equal(d.querySelector('.dialog-label').textContent,'我的纹身 · 01');
d.querySelector('.dialog-close').click();assert.equal(d.querySelector('dialog').open,false);assert.equal(w.location.hash,'#life');
const nav=gallery.querySelector('.life-group-nav'),start=y;
function touch(type,points){const event=new w.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:points.map(([clientX,clientY])=>({clientX,clientY}))});nav.dispatchEvent(event);return event.defaultPrevented;}
touch('touchstart',[[300,780]]);assert.equal(touch('touchmove',[[100,780]]),false,'category bar keeps its native horizontal scroll');touch('touchend',[]);flush();assert.equal(y,start,'scrolling categories does not move the photographs');
dom.window.close();console.log('PASS 17 team photos with Singapore and original team art, independent team categories and full-size preview, supplied portrait, compact compositions with mobile category anchors, retained 15-photo/5-category mapping, removed hero photos, responsive WebP sources, metadata removal, category jumps, scoped touch input and correct high-resolution photo preview');
