(() => {
  'use strict';
  const content = window.PORTFOLIO_CONTENT;
  const portrait = document.querySelector('.hero-portrait');
  if (!portrait || !content?.heroImage || !content.heroHelmetImage) return;
  const scene = portrait.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  const canvas = document.createElement('canvas');
  const air = document.createElement('canvas');
  canvas.className = 'hero-fluid-canvas'; air.className = 'hero-fluid-air';
  [canvas, air].forEach(el => el.setAttribute('aria-hidden', 'true'));
  portrait.append(canvas); scene.insertBefore(air, portrait);
  portrait.querySelector('.hero-image').alt = '深蓝棒球帽背影，鼠标划过时流动显现蓝色头盔';
  portrait.querySelector('.hero-image').draggable = false;

  let images, renderer, airRenderer, ready = false, failed = false;
  let wanted = !document.body.classList.contains('detail-mode');
  let frame = 0, previous = 0, lastInput = -Infinity, lastPoint = null, draws = 0;
  let thumbnail = clamp(Number(scene.style.getPropertyValue('--thumb-progress')) || 0);
  let pending = [], field, width = 1, height = 1;
  const IDLE_GAP = 2000, SWEEP_DURATION = 2600, HANDOFF_DURATION = 220;
  let idleTimer = 0, cycle = null, cycles = 0, driver = 'none', currentFade = 0;
  let handoff = null, pointerBlend = 1;

  // Both the helmet reveal and blank-space shapes sample one screen-space
  // velocity field. The idle pass feeds a curved stroke into that same solver;
  // real pointer input can take over without switching to a separate effect.
  class FlowField {
    constructor(w, h) {
      this.w = w; this.h = h; this.n = w * h;
      for (const key of ['x', 'y', 'nextX', 'nextY', 'div', 'pressure', 'nextPressure'])
        this[key] = new Float32Array(this.n);
      this.pixels = new Uint8Array(this.n * 4);
      this.clear();
    }
    clear() {
      for (const key of ['x', 'y', 'nextX', 'nextY', 'div', 'pressure', 'nextPressure']) this[key].fill(0);
      this.pack();
    }
    sample(a, x, y) {
      x = clamp(x, .5, this.w - 1.5); y = clamp(y, .5, this.h - 1.5);
      const ix = x | 0, iy = y | 0, fx = x - ix, fy = y - iy, i = ix + iy * this.w;
      return (a[i] * (1 - fx) + a[i + 1] * fx) * (1 - fy)
        + (a[i + this.w] * (1 - fx) + a[i + this.w + 1] * fx) * fy;
    }
    inject(stroke) {
      const {w, h, x, y} = this;
      const radius = Math.min(18, Math.max(10, Math.min(w, h) * .22)) * (stroke.radiusScale ?? 1);
      const dx = (stroke.x - stroke.px) * w, dy = (stroke.y - stroke.py) * h;
      const count = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (radius * .32)));
      const forceX = clamp((stroke.x - stroke.px) * 50 / count, -2.5, 2.5) * (stroke.strength ?? 1);
      const forceY = clamp((stroke.y - stroke.py) * 50 / count, -2.5, 2.5) * (stroke.strength ?? 1);
      for (let step = 1; step <= count; step++) {
        const cx = stroke.px * w + dx * step / count;
        const cy = stroke.py * h + dy * step / count;
        const x0 = Math.max(1, Math.floor(cx - radius)), x1 = Math.min(w - 2, Math.ceil(cx + radius));
        const y0 = Math.max(1, Math.floor(cy - radius)), y1 = Math.min(h - 2, Math.ceil(cy + radius));
        for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
          const distance = Math.hypot(i - cx, j - cy) / radius;
          if (distance >= 1) continue;
          const weight = (1 - distance) ** 2, k = i + j * w;
          x[k] += forceX * weight; y[k] += forceY * weight;
        }
      }
    }
    step(ms, strokes) {
      const {w, h, x, y, nextX, nextY, div} = this;
      const dt = Math.max(w, h) * .014 * ms / 16.667;
      const damping = Math.pow(.96, ms / 16.667);
      // Back-and-forth error compensation preserves the thin folded edges that
      // ordinary advection would blur away after a few frames.
      for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
        const k = i + j * w;
        const bx = i - x[k] * dt, by = j - y[k] * dt;
        const fx = bx + this.sample(x, bx, by) * dt;
        const fy = by + this.sample(y, bx, by) * dt;
        const cx = i - (fx - i) * .5, cy = j - (fy - j) * .5;
        const sx = cx - this.sample(x, cx, cy) * dt;
        const sy = cy - this.sample(y, cx, cy) * dt;
        nextX[k] = this.sample(x, sx, sy) * damping;
        nextY[k] = this.sample(y, sx, sy) * damping;
      }
      x.set(nextX); y.set(nextY);
      strokes.forEach(stroke => this.inject(stroke));
      for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
        const k = i + j * w;
        div[k] = .5 * (x[k + 1] - x[k - 1] + y[k + w] - y[k - w]);
      }
      this.pressure.fill(0); this.nextPressure.fill(0);
      for (let iteration = 0; iteration < 4; iteration++) {
        const p = this.pressure, q = this.nextPressure;
        for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
          const k = i + j * w;
          q[k] = (p[k - 1] + p[k + 1] + p[k - w] + p[k + w] - div[k]) * .25;
        }
        this.pressure = q; this.nextPressure = p;
      }
      const p = this.pressure;
      for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
        const k = i + j * w;
        x[k] = clamp(x[k] - .5 * (p[k + 1] - p[k - 1]), -5, 5);
        y[k] = clamp(y[k] - .5 * (p[k + w] - p[k - w]), -5, 5);
      }
      this.pack();
    }
    pack() {
      let peak = 0;
      for (let i = 0; i < this.n; i++) {
        const speed = Math.hypot(this.x[i], this.y[i]) * .5, k = i * 4;
        this.pixels[k] = clamp(128 + this.x[i] * 24, 0, 255);
        this.pixels[k + 1] = clamp(128 + this.y[i] * 24, 0, 255);
        this.pixels[k + 2] = clamp(speed) * 255; this.pixels[k + 3] = 255;
        peak = Math.max(peak, speed);
      }
      this.peak = peak;
    }
  }

  const vertex = `attribute vec2 aPosition; varying vec2 vUv;
    void main(){ vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition, 0., 1.); }`;
  const fieldShader = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uField;
    uniform float uFade;
    uniform vec4 uRect;
    float fluid(vec2 uv){ return smoothstep(.099, .103, texture2D(uField, uv).b) * uFade; }
  `;
  const portraitShader = fieldShader + `
    uniform sampler2D uPerson;
    uniform sampler2D uHelmet;
    uniform float uShell;
    vec4 clean(sampler2D tex, vec2 uv){
      vec4 c = texture2D(tex, clamp(uv, .001, .999));
      c.a *= smoothstep(.008, .025, c.a); return c;
    }
    float mesh(vec2 p){
      vec2 f = fract(p * vec2(54., 42.));
      float d = min(min(min(f.x, 1.-f.x), min(f.y, 1.-f.y)), abs(f.x-f.y)*.707);
      return 1. - smoothstep(.008, .035, d);
    }
    void main(){
      vec2 uv = vec2(vUv.x, 1. - vUv.y);
      vec2 screen = uRect.xy + uv * uRect.zw;
      vec4 flow = texture2D(uField, screen);
      float mask = fluid(screen);
      vec2 velocity = (flow.rg * 255. - 128.) / 24.;
      vec2 refraction = velocity * .002 * mask;
      vec4 person = clean(uPerson, uv);
      vec4 helmet = clean(uHelmet, uv - refraction);
      vec3 rgb = mix(person.rgb * person.a, helmet.rgb * helmet.a, mask);
      float alpha = mix(person.a, helmet.a, mask);
      vec2 shellUv = vec2(.49,.51) + (uv-vec2(.49,.51)) / vec2(1.045,1.035);
      float shell = clean(uHelmet, shellUv).a;
      float edge = abs(shell-clean(uHelmet,shellUv+vec2(.002,0.)).a)
                 + abs(shell-clean(uHelmet,shellUv+vec2(0.,.002)).a);
      float wire = (mesh(shellUv)*shell*.025 + min(1.,edge)*.10)
                 * (1.-smoothstep(.73,.83,uv.y)) * (1.-mask) * uShell;
      rgb = vec3(.55,.59,.62)*wire + rgb*(1.-wire);
      alpha = wire + alpha*(1.-wire);
      gl_FragColor = vec4(rgb/max(alpha,.0001),alpha);
    }
  `;
  const airShader = fieldShader + `
    void main(){
      vec2 uv = vec2(vUv.x,1.-vUv.y);
      float mask = fluid(uv);
      gl_FragColor = vec4(.46,.51,.56,mask*.135);
    }
  `;

  function webGL(surface, source, photo) {
    const gl = surface.getContext('webgl', {alpha:true, antialias:false, depth:false,
      stencil:false, premultipliedAlpha:false, powerPreference:'low-power'});
    if (!gl) return null;
    try {
      const program = gl.createProgram();
      for (const [type, text] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, source]]) {
        const shader = gl.createShader(type);
        const precision = type === gl.FRAGMENT_SHADER && !gl.getShaderPrecisionFormat(type,gl.HIGH_FLOAT)?.precision;
        gl.shaderSource(shader, precision ? text.replace('precision highp','precision mediump') : text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
        gl.attachShader(program,shader); gl.deleteShader(shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program,'aPosition');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      function texture(unit, name, image) {
        const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,tex);
        for (const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);
        for (const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        if (image) gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        gl.uniform1i(gl.getUniformLocation(program,name),unit); return tex;
      }
      if (photo) images.forEach((img,i) => texture(i,i?'uHelmet':'uPerson',img));
      const flow = texture(2,'uField');
      let flowWidth=0,flowHeight=0;
      const uniforms = Object.fromEntries(['Rect','Fade','Shell'].map(n => [n,gl.getUniformLocation(program,'u'+n)]));
      surface.dataset.renderer = 'webgl';
      return {surface, draw(state){
        gl.viewport(0,0,surface.width,surface.height);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D,flow);
        if (flowWidth!==field.w || flowHeight!==field.h) {
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,field.w,field.h,0,gl.RGBA,gl.UNSIGNED_BYTE,field.pixels);
          flowWidth=field.w;flowHeight=field.h;
        } else gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,field.w,field.h,gl.RGBA,gl.UNSIGNED_BYTE,field.pixels);
        gl.uniform4f(uniforms.Rect,...state.rect);
        gl.uniform1f(uniforms.Fade,state.fade); gl.uniform1f(uniforms.Shell,1-thumbnail);
        gl.drawArrays(gl.TRIANGLES,0,6);
      }};
    } catch (error) { console.warn('Fluid compositor fallback:',error.message); return null; }
  }

  function canvas2D(original, photo) {
    let surface = original, ctx = surface.getContext('2d');
    if (!ctx) {
      surface = document.createElement('canvas'); surface.className = original.className;
      surface.setAttribute('aria-hidden','true'); original.replaceWith(surface); ctx = surface.getContext('2d');
    }
    if (!ctx) return null;
    const mask = document.createElement('canvas'), maskCtx = mask.getContext('2d');
    const layer = document.createElement('canvas'), layerCtx = layer.getContext('2d');
    surface.dataset.renderer = 'canvas';
    return {surface, draw(state){
      const w = surface.width, h = surface.height;
      mask.width = field.w; mask.height = field.h;
      const pixels = maskCtx.createImageData(field.w,field.h);
      for (let i = 0; i < field.n; i++) {
        const k = i*4;
        pixels.data[k]=117; pixels.data[k+1]=130; pixels.data[k+2]=143;
        pixels.data[k+3]=smooth((field.pixels[k+2]/255-.099)/.004)*state.fade*255;
      }
      maskCtx.putImageData(pixels,0,0); ctx.clearRect(0,0,w,h);
      if (!photo) {ctx.globalAlpha=.135;ctx.drawImage(mask,0,0,w,h);ctx.globalAlpha=1;return;}
      ctx.drawImage(images[0],0,0,w,h);
      if (!state.fade) return;
      const [x,y,rw,rh] = state.rect, args=[mask,-x/rw*w,-y/rh*h,w/rw,h/rh];
      ctx.globalCompositeOperation='destination-out';ctx.drawImage(...args);ctx.globalCompositeOperation='source-over';
      layer.width=w;layer.height=h;layerCtx.drawImage(images[1],0,0,w,h);
      layerCtx.globalCompositeOperation='destination-in';layerCtx.drawImage(...args);
      layerCtx.globalCompositeOperation='source-over';ctx.drawImage(layer,0,0);
    }};
  }

  function interactive() {return ready && wanted && !failed && !document.hidden && !reduced.matches && thumbnail < .995;}
  function mode(value) {(renderer?.surface || canvas).dataset.mode = value;}
  function cancelIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer=0;cycle=null;
  }
  function armIdle() {
    if (!interactive() || thumbnail>=.02 || idleTimer || frame || cycle) return;
    renderer.surface.dataset.idleGap=String(IDLE_GAP);
    idleTimer=setTimeout(() => {
      idleTimer=0;
      if (!interactive() || thumbnail>=.02) return;
      const count=Math.random()<.5?1:2;
      cycle={start:performance.now(),lanes:Array.from({length:count},(_,i)=>({
        y:count===1?.48+Math.random()*.08:.39+i*.26+(Math.random()-.5)*.025,
        bend:.028+Math.random()*.022,warp:(Math.random()-.5)*.035,
        phase:(Math.random()-.5)*.12,radiusScale:count===1?.92:.55,point:null
      }))};driver='ambient';previous=0;handoff=null;pointerBlend=1;
      field.clear();pending=[];lastPoint=null;
      renderer.surface.dataset.cycle=String(++cycles);
      renderer.surface.dataset.ribbons=String(count);
      frame=requestAnimationFrame(tick);
    },IDLE_GAP);
  }
  function idlePoint(progress,lane) {
    // Each pass has one or two separated, gently curved sources. Their paths are
    // chosen once per pass and share the pointer's continuously advected field.
    progress=clamp(progress+lane.phase*Math.sin(progress*Math.PI));
    const angle=progress*Math.PI*2;
    const x=.5-.36*Math.cos(angle),y=lane.y+lane.bend*Math.sin(angle)+lane.warp*Math.sin(angle*2);
    const p=portrait.getBoundingClientRect(),s=scene.getBoundingClientRect();
    return {x:(p.left-s.left+x*p.width)/s.width,y:(p.top-s.top+y*p.height)/s.height};
  }
  function idleStrokes(now,strength=1) {
    if (!cycle) return null;
    const progress=clamp((now-cycle.start)/SWEEP_DURATION);
    const strokes=[];
    for (const lane of cycle.lanes) {
      const point=idlePoint(progress,lane);
      if (lane.point && strength>0) strokes.push({px:lane.point.x,py:lane.point.y,...point,radiusScale:lane.radiusScale,strength});
      lane.point=point;
    }
    renderer.surface.dataset.sweep=progress<.5?'right':'left';
    if (progress>=1) cycle=null;
    return {strokes,progress};
  }
  function takePointer(now) {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer=0;
    if (driver==='ambient') {
      // Retain the solver, its momentum, the current opacity and its scheduled
      // frame. Only the two sources' forces change over this short overlap.
      handoff={start:now,fade:currentFade};pointerBlend=0;
    }
    driver='pointer';
  }
  function draw(fade = 0) {
    if (!ready) return;
    currentFade=fade;
    const p = portrait.getBoundingClientRect(), s = scene.getBoundingClientRect();
    const state = {fade:fade * (1-thumbnail)**2,
      rect:[(p.left-s.left)/s.width,(p.top-s.top)/s.height,p.width/s.width,p.height/s.height]};
    renderer.draw(state); airRenderer?.draw(state);
    const surface = renderer.surface;
    surface.dataset.frames=String(++draws);surface.dataset.strength=field.peak.toFixed(3);
    surface.dataset.fade=state.fade.toFixed(3);
    surface.dataset.pointer=lastPoint ? `${lastPoint.x.toFixed(3)},${lastPoint.y.toFixed(3)}` : '';
    surface.dataset.driver=driver;
    surface.dataset.blend=pointerBlend.toFixed(3);
  }
  function stop(reason) {
    cancelIdle();driver='none';handoff=null;pointerBlend=1;
    cancelAnimationFrame(frame);frame=0;previous=0;pending=[];lastPoint=null;lastInput=-Infinity;
    if (field) field.clear();
    if (ready) draw();
    mode(reason);
  }
  function tick(now) {
    frame=0;
    if (!interactive()) return;
    const dt=previous ? clamp(now-previous,4,33.334) : 16.667;previous=now;
    pointerBlend=handoff?smooth((now-handoff.start)/HANDOFF_DURATION):1;
    const ambient=idleStrokes(now,handoff?1-pointerBlend:1);
    if (handoff) {
      const strokes=pending.splice(0).map(stroke=>({...stroke,strength:.3+.7*pointerBlend}));
      field.step(dt,[...(ambient?.strokes||[]),...strokes]);lastInput=now;
      draw(handoff.fade+(1-handoff.fade)*pointerBlend);mode('handoff');
      if (pointerBlend>=1) {handoff=null;cycle=null;mode('pointer');}
      frame=requestAnimationFrame(tick);return;
    }
    if (ambient) {
      field.step(dt,ambient.strokes);lastInput=now;
      draw(smooth(ambient.progress/.08));mode('ambient');
      frame=requestAnimationFrame(tick);return;
    }
    const age=now-lastInput;
    if (age>=620) {stop('idle');armIdle();return;}
    // Keep momentum evolving through the tail instead of freezing the field and
    // abruptly unfreezing it when a new pointer event arrives.
    field.step(dt,pending.splice(0));
    const fade=1-smooth((age-100)/500);
    draw(fade);mode(driver==='ambient'?'ambient-settling':age<100?'pointer':'settling');
    frame=requestAnimationFrame(tick);
  }
  function setActive(active) {
    if (wanted===!!active) return;
    wanted=!!active;
    stop(!wanted?'paused':reduced.matches?'static':thumbnail>=.995?'thumbnail':'idle');
    armIdle();
  }
  function setThumbnail(progress) {
    const next=clamp(progress);
    if (Math.abs(next-thumbnail)<.0001) return;
    thumbnail=next;air.style.opacity=String(1-thumbnail);
    if (!ready) return;
    if (next>=.02) {
      cancelIdle();
      if (driver==='ambient' && frame) stop('idle');
    }
    if (next>=.995) {if (frame || (renderer.surface).dataset.mode!=='thumbnail') stop('thumbnail');}
    else {
      draw(currentFade);
      if (!frame) mode(!wanted?'paused':reduced.matches?'static':'idle');
      armIdle();
    }
  }
  function resize() {
    width=scene.clientWidth||innerWidth;height=scene.clientHeight||innerHeight;
    const long=Math.min(mobile.matches?132:192,Math.max(96,Math.round(Math.max(width,height)*.1)));
    field=new FlowField(Math.max(24,Math.round(long*width/Math.max(width,height))),Math.max(24,Math.round(long*height/Math.max(width,height))));
    if (!ready) return;
    const surface=renderer.surface,w=portrait.clientWidth,h=portrait.clientHeight;
    const scale=Math.min(devicePixelRatio||1,1.5,Math.sqrt((mobile.matches?950000:1650000)/(w*h)));
    surface.width=Math.round(w*scale);surface.height=Math.round(h*scale);
    if (airRenderer) {
      const scale=Math.min(devicePixelRatio||1,1.25,Math.sqrt(1000000/(width*height)));
      airRenderer.surface.width=Math.round(width*scale);airRenderer.surface.height=Math.round(height*scale);
    }
    stop(!wanted?'paused':reduced.matches?'static':thumbnail>=.995?'thumbnail':'idle');
    armIdle();
  }
  document.addEventListener('pointermove',event => {
    if (!interactive() || event.pointerType==='touch') {lastPoint=null;return;}
    const events=event.getCoalescedEvents?.();
    for (const point of events?.length?events:[event]) {
      const s=scene.getBoundingClientRect();
      const x=clamp((point.clientX-s.left)/s.width),y=clamp((point.clientY-s.top)/s.height);
      const now=performance.now();
      const mx=Number(point.movementX)||0,my=Number(point.movementY)||0;
      if (!lastPoint && Math.hypot(mx,my)>.2 && Math.hypot(mx,my)<Math.max(width,height)*.2)
        lastPoint={x:clamp(x-mx/s.width),y:clamp(y-my/s.height),time:now};
      if (lastPoint) {
        const distance=Math.hypot((x-lastPoint.x)*width,(y-lastPoint.y)*height);
        if (distance<.2) continue;
        // Discard re-entry jumps, not continuous strokes across the blank space.
        if (now-lastPoint.time<150 && distance<Math.max(width,height)*.65) {
          takePointer(now);
          pending.push({px:lastPoint.x,py:lastPoint.y,x,y});lastInput=now;
          (renderer.surface).dataset.input=`${x.toFixed(3)},${y.toFixed(3)}`;
        }
      }
      lastPoint={x,y,time:now};
    }
    if (pending.length && !frame) {previous=0;frame=requestAnimationFrame(tick);}
  },{passive:true});
  document.addEventListener('pointerleave',() => {lastPoint=null;});
  document.addEventListener('visibilitychange',() => {
    stop(document.hidden||!wanted?'paused':reduced.matches?'static':'idle');armIdle();
  });
  window.addEventListener('resize',resize,{passive:true});
  reduced.addEventListener('change',() => {
    stop(reduced.matches?'static':!wanted?'paused':'idle');armIdle();
  });
  canvas.addEventListener('webglcontextlost',event => {
    event.preventDefault();failed=true;stop('paused');portrait.classList.remove('fluid-ready');
    canvas.style.visibility='hidden';
  });
  canvas.addEventListener('webglcontextrestored',() => {
    failed=false;renderer=webGL(canvas,portraitShader,true);
    if (renderer) {canvas.style.visibility='';portrait.classList.add('fluid-ready');resize();}
  });
  window.HeroFluid={setActive,setThumbnail};
  function loadImage(path) {
    return new Promise((resolve,reject) => {
      const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=path;
    });
  }
  Promise.all([loadImage(content.heroImage),loadImage(content.heroHelmetImage)]).then(loaded => {
    images=loaded;renderer=webGL(canvas,portraitShader,true)||canvas2D(canvas,true);
    airRenderer=webGL(air,airShader,false)||canvas2D(air,false);
    if (!renderer) {canvas.remove();air.remove();return;}
    wanted=wanted&&!document.body.classList.contains('detail-mode')&&scene.style.visibility!=='hidden';
    ready=true;resize();portrait.classList.add('fluid-ready');
    new ResizeObserver(resize).observe(portrait);
  }).catch(() => {canvas.remove();air.remove();});
})();
