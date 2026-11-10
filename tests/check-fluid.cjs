const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const source = fs.readFileSync(path.join(__dirname, '../dist/fluid-hero.js'), 'utf8');

async function boot({reduce=false, detail=false, fail=false, pauseDuringLoad=false, width=1280, height=720, random}={}) {
  const dom = new JSDOM(`<body class="${detail?'detail-mode':''}"><section class="hero-scene"><div class="hero-portrait"><img class="hero-image"></div></section></body>`, {runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document;
  let clock=0,serial=0,hidden=false,queue=new Map(),timers=new Map(),draws=0;
  const reduced={matches:reduce,change:null,addEventListener(_,fn){this.change=fn;}};
  Object.defineProperty(w.performance,'now',{value:()=>clock});
  Object.defineProperty(d,'hidden',{get:()=>hidden});
  Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get:()=>width});
  Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get:()=>height});
  w.HTMLElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width,height});
  w.matchMedia=q=>q.includes('reduced-motion')?reduced:{matches:width<=600};
  w.requestAnimationFrame=cb=>{queue.set(++serial,cb);return serial;};
  w.cancelAnimationFrame=id=>queue.delete(id);
  w.setTimeout=(cb,delay)=>{const id=++serial;timers.set(id,{cb,at:clock+delay});return id;};
  w.clearTimeout=id=>timers.delete(id);
  w.ResizeObserver=class{observe(){}};
  const contexts=new Map();
  w.HTMLCanvasElement.prototype.getContext=function(kind){
    if(kind!=='2d')return null;
    if(!contexts.has(this))contexts.set(this,new Proxy({drawImage(){draws++;},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(p){this.lastPixels=p.data.slice();}}, {get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)}));
    return contexts.get(this);
  };
  w.Image=class{set src(v){queueMicrotask(()=>fail?this.onerror(new Error('missing image')):this.onload());}};
  w.PORTFOLIO_CONTENT={heroImage:'person.png',heroHelmetImage:'helmet.png'};
  if(random!==undefined)w.Math.random=()=>random;
  w.eval(source.replace('field=new FlowField(', 'field=window.__fieldForTest=new FlowField('));if(pauseDuringLoad)w.HeroFluid.setActive(false);
  await new Promise(resolve=>setImmediate(resolve));
  function step(n=1){for(let i=0;i<n;i++){clock+=16.667;for(const [id,t] of [...timers])if(t.at<=clock){timers.delete(id);t.cb();}const jobs=[...queue.values()];queue.clear();jobs.forEach(cb=>cb(clock));}}
  function move(x,y,type='mouse'){const e=new w.Event('pointermove');Object.assign(e,{clientX:x,clientY:y,pointerType:type});d.dispatchEvent(e);}
  return {w,d,step,move,queue,timers,reduced,contexts,get field(){return w.__fieldForTest;},get draws(){return draws;},setHidden(v){hidden=v;d.dispatchEvent(new w.Event('visibilitychange'));}};
}
(async()=>{
  for(const [width,height] of [[1280,720],[1200,1173],[390,844]]){
    const a=await boot({width,height}),c=a.d.querySelector('.hero-fluid-canvas');
    assert.equal(c.dataset.renderer,'canvas');
    const initial=a.draws;a.step(119);
    assert.equal(a.draws,initial,'the two-second pause has no animation frames');assert.equal(a.queue.size,0);
    assert.equal(a.timers.size,1);a.step(3);assert.equal(c.dataset.mode,'ambient');
    assert.equal(c.dataset.cycle,'1');assert.equal(c.dataset.sweep,'right');
    a.step(35);assert.ok(+c.dataset.strength>.12,'automatic stroke uses the real fluid field');
    a.step(60);assert.equal(c.dataset.sweep,'left','the automatic pass returns left');
    for(let i=0;i<220&&c.dataset.mode!=='idle';i++)a.step();
    assert.equal(c.dataset.mode,'idle');assert.equal(a.queue.size,0);
    const resting=a.draws,cycle=c.dataset.cycle;
    a.step(119);assert.equal(a.draws,resting,'there are no idle frames throughout the two-second gap');
    a.step(3);assert.equal(c.dataset.mode,'ambient');assert.notEqual(c.dataset.cycle,cycle,'automatic pass repeats after its pause');
    a.move(width*.2,height*.4);a.step();
    for(let i=1;i<=16;i++){a.move(width*(.2+i*.025),height*(.4+Math.sin(i*.17)*.1));a.step();}
    assert.equal(c.dataset.mode,'pointer');assert.ok(+c.dataset.strength>.12,'pointer strokes generate a visible velocity field');
    assert.equal(c.dataset.driver,'pointer','moving the mouse interrupts the autonomous pass');assert.equal(a.timers.size,0);
    assert.ok(+c.dataset.fade>.99);
    const moving=a.draws;a.step(12);assert.equal(c.dataset.mode,'settling');assert.ok(+c.dataset.fade<1);
    a.step(40);assert.equal(c.dataset.mode,'idle');assert.equal(+c.dataset.fade,0);assert.equal(a.queue.size,0);
    const stopped=a.draws;assert.ok(stopped>moving);a.step(100);assert.equal(a.draws,stopped,'pointer trail clears before automatic motion restarts');
    a.move(width*.5,height*.5);a.move(width*.55,height*.5);a.step(4);assert.equal(c.dataset.mode,'pointer');
    a.move(width*.55,height*.5);a.step(45);assert.equal(a.queue.size,0,'identical coordinates do not replenish fluid');
    a.w.HeroFluid.setActive(false);assert.equal(c.dataset.mode,'paused');const paused=a.draws;
    a.move(10,20);a.move(50,20);a.step(30);assert.equal(a.draws,paused);
    a.w.HeroFluid.setActive(true);assert.equal(c.dataset.mode,'idle');assert.equal(a.queue.size,0,'returning to intro waits before its next pass');assert.equal(a.timers.size,1);
    a.move(50,20);a.move(120,60);a.step(3);assert.equal(c.dataset.mode,'pointer','blank-space input also drives the shared field');
    a.setHidden(true);assert.equal(a.queue.size,0);assert.equal(a.timers.size,0);const hidden=a.draws;a.step(30);assert.equal(a.draws,hidden);
    a.setHidden(false);assert.equal(a.queue.size,0,'tab visibility resumes with a two-second pause');assert.equal(a.timers.size,1);
    a.w.HeroFluid.setThumbnail(1);assert.equal(c.dataset.mode,'thumbnail');assert.equal(a.queue.size,0);assert.equal(a.timers.size,0);assert.equal(+c.dataset.fade,0);
    a.w.HeroFluid.setThumbnail(0);assert.equal(c.dataset.mode,'idle');assert.equal(a.queue.size,0);
    a.move(100,100,'touch');a.move(150,150,'touch');assert.equal(a.queue.size,0,'touch scrolling is not captured');
    a.move(100,100);a.move(150,150);a.step();a.reduced.matches=true;a.reduced.change();
    assert.equal(c.dataset.mode,'static');assert.equal(a.queue.size,0);assert.equal(a.timers.size,0);assert.equal(+c.dataset.fade,0);
    a.w.close();console.log(`PASS ${width}×${height}: left/right idle sweep, two-second gap/repeat, pointer takeover, trail clear, route/visibility/thumbnail/reduced motion`);
  }
  for(const options of [{reduce:true},{detail:true},{pauseDuringLoad:true}]){
    const b=await boot(options);assert.equal(b.queue.size,0);assert.equal(b.timers.size,0);b.w.close();
  }
  for(const random of [.25,.75]){
    const a=await boot({random}),c=a.d.querySelector('.hero-fluid-canvas');
    a.step(155);
    assert.equal(c.dataset.ribbons,random<.5?'1':'2','each cycle chooses one or two independently driven ribbons');
    assert.equal(c.dataset.origins,random<.5?'left':'left,right');
    assert.ok(+c.dataset.progress>.23&&+c.dataset.progress<.27,'the pass is slightly faster, with a 2.3-second round trip');
    if(random>.5){
      const f=a.field,split=Math.floor(f.h*.53)*f.w;
      const upper=[...f.x.slice(0,split)].reduce((sum,v)=>sum+v,0);
      const lower=[...f.x.slice(split)].reduce((sum,v)=>sum+v,0);
      assert.ok(upper>0&&lower<0,'the upper ribbon flows from left and the lower ribbon flows from right');
    }
    const oldField=a.field,x=oldField.x.slice(),y=oldField.y.slice(),scheduled=[...a.queue.keys()];
    const opacity=+c.dataset.fade;
    a.move(640,360);a.move(644,361);
    assert.equal(a.field,oldField,'takeover retains the same velocity field');
    assert.deepEqual(a.field.x,x,'pointer entry does not clear or reset velocity');assert.deepEqual(a.field.y,y);
    assert.deepEqual([...a.queue.keys()],scheduled,'takeover keeps the already scheduled animation frame');
    a.step();assert.equal(c.dataset.mode,'handoff');assert.ok(+c.dataset.blend>0&&+c.dataset.blend<.1);
    assert.ok(Math.abs(+c.dataset.fade-opacity)<.025,'takeover has no opacity flash');
    assert.ok(+c.dataset.strength>.05,'existing flow survives the source overlap');
    a.step(14);assert.equal(c.dataset.mode,'pointer');assert.equal(c.dataset.blend,'1.000');
    a.step(12);const tail=a.field.x.slice();a.step(4);
    assert.notDeepEqual(a.field.x,tail,'the tail continues advecting instead of freezing mid-flight');
    a.step(30);assert.equal(c.dataset.mode,'idle');assert.equal(a.queue.size,0);
    a.w.Math.random=()=>random<.5?.75:.25;
    a.step(125);assert.equal(c.dataset.ribbons,random<.5?'2':'1','the next pass makes a fresh count selection');
    a.w.close();
  }
  {
    const a=await boot({random:.25}),c=a.d.querySelector('.hero-fluid-canvas');a.step(121);
    const fade=+c.dataset.fade;a.move(600,350);a.move(604,351);a.step();
    assert.ok(Math.abs(+c.dataset.fade-fade)<.025,'takeover during the initial reveal preserves opacity continuously');
    a.w.HeroFluid.setActive(false);assert.equal(a.queue.size,0);assert.equal(a.timers.size,0);a.w.close();
  }
  console.log('PASS single/double random passes, fresh per-cycle count, preserved field/momentum/frame, 220ms force overlap, continuous opacity and tail');
  const b=await boot({fail:true});assert.equal(b.d.querySelector('canvas'),null);b.w.close();
  // Test the numerical field itself: direction, spatial locality, curved input,
  // bounded advection, aspect ratios and a second stroke in previously blank space.
  const sourceWithField=source.replace('window.HeroFluid={setActive,setThumbnail};','window.FlowFieldForTest=FlowField;window.HeroFluid={setActive,setThumbnail};');
  const dom=new JSDOM('<div class="hero-portrait"><img class="hero-image"></div>',{runScripts:'outside-only'});
  const w=dom.window;w.PORTFOLIO_CONTENT={heroImage:'x',heroHelmetImage:'y'};w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.eval(sourceWithField);const f=new w.FlowFieldForTest(128,72);
  {
    const round=new w.FlowFieldForTest(128,72),wake=new w.FlowFieldForTest(128,72),reverse=new w.FlowFieldForTest(128,72);
    const stroke={px:.49,py:.5,x:.51,y:.5,radiusScale:.55};
    round.inject(stroke);wake.inject({...stroke,tailLength:2.65});
    reverse.inject({...stroke,px:.53,x:.51,tailLength:2.65});
    function columnWidth(field,column){let count=0;for(let row=0;row<field.h;row++)if(Math.abs(field.x[column+row*field.w])>.001)count++;return count;}
    assert.equal(columnWidth(round,45),0,'the original pointer brush remains compact');
    assert.ok(columnWidth(wake,45)>0,'the automatic wake extends well behind the original brush');
    assert.ok(columnWidth(wake,45)<columnWidth(wake,54),'the long wake narrows to a sharp trailing end');
    assert.ok(columnWidth(reverse,85)>0&&columnWidth(reverse,45)===0,'the long tip reverses sides with its direction');
  }
  f.step(16.667,[{px:.3,py:.4,x:.4,y:.4}]);
  assert.ok(f.x[51+28*128]>0,'rightward stroke adds rightward velocity');
  assert.equal(f.pixels[(110+60*128)*4+2],0,'untouched blank space does not animate');
  const first=f.pixels.slice();
  for(let i=0;i<12;i++)f.step(16.667,[{px:.4+i*.012,py:.4+i*.012,x:.412+i*.012,y:.412+i*.012}]);
  assert.notDeepEqual(f.pixels,first,'curved input changes the field instead of translating one fixed mask');
  for(let i=0;i<120;i++)f.step(16.667,[]);
  assert.ok([...f.x,...f.y].every(v=>Number.isFinite(v)&&Math.abs(v)<=5),'advection is stable');
  f.clear();assert.equal(f.peak,0);w.close();
  console.log('PASS longer pointed automatic wake, mirrored directions, faster pass, unchanged pointer brush, advection stability, Canvas fallback and loading');
})().catch(e=>{console.error(e);process.exitCode=1;});
