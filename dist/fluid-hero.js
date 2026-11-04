(() => {
  'use strict';
  const content = window.PORTFOLIO_CONTENT;
  const portrait = document.querySelector('.hero-portrait');
  if (!portrait || !content?.heroImage || !content.heroHelmetImage) return;

  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-fluid-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  portrait.append(canvas);
  const air = document.createElement('canvas');
  air.className = 'hero-fluid-air';
  air.setAttribute('aria-hidden', 'true');
  portrait.parentElement.insertBefore(air, portrait);
  const airContext = air.getContext('2d');
  const fallback = portrait.querySelector('.hero-image');
  fallback.alt = '戴深蓝棒球帽的背影，流动切片中显现蓝色头盔';

  let renderer, images, frame = 0, previous = 0, elapsed = 0;
  let wanted = !document.body.classList.contains('detail-mode');
  let ready = false, failed = false, lastPointer = -10000, pointerMix = 0;
  let pointerX = .52, pointerY = .5, targetX = .52, targetY = .5;
  let targetEnergy = 0, energy = 0, lastEventTime = 0;
  let centerX = .52, centerY = .5, angle = Math.PI / 2;
  let dataTime = 0, thumbnail = clamp(parseFloat(portrait.parentElement.style.getPropertyValue('--thumb-progress')) || 0);
  air.style.opacity = String(1 - thumbnail);
  let airX = .5, airY = .45, airTargetX = .5, airTargetY = .45;

  // The two PNGs share one coordinate system. Only the curved reveal is displaced,
  // so the shoulders and hair stay registered while the helmet crosses the portrait.
  const vertex = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * .5 + .5;
      gl_Position = vec4(aPosition, 0., 1.);
    }
  `;
  const fragment = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uPerson;
    uniform sampler2D uHelmet;
    uniform vec2 uCenter;
    uniform float uAngle;
    uniform float uTime;
    uniform float uEnergy;
    uniform float uReveal;
    const float aspect = 1.33333333;

    vec4 sampleClean(sampler2D tex, vec2 uv) {
      vec4 c = texture2D(tex, clamp(uv, .001, .999));
      c.a *= smoothstep(.008, .025, c.a);
      return c;
    }
    float flowShape(vec2 p, float span, float height, float phase) {
      // A bent, asymmetrical lens with a rounded belly and a pointed tail.
      // Domain warping folds its edge rather than cutting a straight strip.
      float u = p.x / span;
      float curl = .038 * sin(u * 2.6 + phase)
                 + .014 * sin(u * 5.4 - phase * .7);
      float belly = sqrt(max(.0, 1. - u * u));
      float taper = .87 - .63 * u;
      float ripple = 1. + .1 * sin(u * 5. + phase * .6);
      float halfHeight = height * belly * taper * ripple;
      return max(abs(p.y - curl) - halfHeight, (abs(u) - 1.) * span);
    }
    float meshLine(vec2 p) {
      vec2 cell = fract(p * vec2(54., 42.));
      float border = min(min(cell.x, 1. - cell.x), min(cell.y, 1. - cell.y));
      float diagonal = abs(cell.x - cell.y) * .707;
      return 1. - smoothstep(.008, .035, min(border, diagonal));
    }
    void main() {
      vec2 uv = vec2(vUv.x, 1. - vUv.y);
      vec2 normal = vec2(cos(uAngle), sin(uAngle));
      vec2 tangent = vec2(normal.y, -normal.x);
      vec2 point = (uv - uCenter) * vec2(aspect, 1.);
      float along = dot(point, tangent);
      float across = dot(point, normal);
      vec2 flow = vec2(along, across);
      flow.x += .012 * sin(across * 18. + uTime * .47);
      flow.y += .008 * sin(along * 21. - uTime * .63);
      float span = .345 + .035 * sin(uTime * .34);
      float height = .091 + .025 * sin(uTime * .51) + uEnergy * .022;
      float distance = flowShape(flow, span, height, uTime * .46);
      float slice = (1. - smoothstep(-.0015, .0025, distance)) * uReveal;
      float edge = 1. - smoothstep(.001, .015, abs(distance));
      vec2 bend = normal / vec2(aspect, 1.) * edge
                * (.0035 + .008 * uEnergy) * sin(along * 14. + uTime) * uReveal;
      vec4 person = sampleClean(uPerson, uv - bend * .35);
      vec4 helmet = sampleClean(uHelmet, uv + bend);
      vec3 color = mix(person.rgb * person.a, helmet.rgb * helmet.a, slice);
      float alpha = mix(person.a, helmet.a, slice);

      float ribbon = 1. - smoothstep(-.002, .003,
        flowShape(flow + vec2(.07, -.04), span * 1.45, height * .91, uTime * .46 + .3));
      float second = 1. - smoothstep(-.002, .003,
        flowShape(vec2(-flow.x - .1, flow.y + .055), span * 1.2, height * .42, -uTime * .31));
      float headGate = smoothstep(.15, .23, uv.y) * (1. - smoothstep(.74, .85, uv.y));
      vec2 stretched = uCenter + (uv - uCenter) * vec2(.83, .94);
      vec4 glass = sampleClean(uHelmet, stretched);
      float ghostAlpha = (ribbon * .16 + second * .09) * headGate * uReveal;
      vec3 glassColor = mix(vec3(.61, .64, .63), glass.rgb, .07);
      color += glassColor * ghostAlpha * (1. - alpha);
      alpha += ghostAlpha * (1. - alpha);

      // A fine transparent helmet shell remains visible around and over the
      // photograph, like the reference's softly drawn triangular surface.
      vec2 shellUv = vec2(.49, .51) + (uv - vec2(.49, .51)) / vec2(1.045, 1.035);
      float shell = sampleClean(uHelmet, shellUv).a;
      float shellRight = sampleClean(uHelmet, shellUv + vec2(.002, 0.)).a;
      float shellTop = sampleClean(uHelmet, shellUv + vec2(0., .002)).a;
      float outline = min(1., abs(shell - shellRight) + abs(shell - shellTop));
      float shellGate = (1. - smoothstep(.73, .83, uv.y)) * (1. - slice) * uReveal;
      float wire = (meshLine(shellUv + vec2(.006 * sin(uv.y * 10.), 0.)) * shell * .035 + outline * .13) * shellGate;
      vec3 wireColor = vec3(.55, .59, .58);
      color = wireColor * wire + color * (1. - wire);
      alpha = wire + alpha * (1. - wire);
      gl_FragColor = vec4(color / max(alpha, .0001), alpha);
    }
  `;

  function createWebGL() {
    const gl = canvas.getContext('webgl', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: false, powerPreference: 'low-power'
    });
    if (!gl) return null;
    const resources = [];
    function shader(type, source) {
      const s = gl.createShader(type);
      if (type === gl.FRAGMENT_SHADER && !gl.getShaderPrecisionFormat(type, gl.HIGH_FLOAT)?.precision)
        source = source.replace('precision highp', 'precision mediump');
      gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error(info);
      }
      resources.push(s); return s;
    }
    try {
      const program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      resources.forEach(s => gl.deleteShader(s));
      const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      images.forEach((img, i) => {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(gl.getUniformLocation(program, i ? 'uHelmet' : 'uPerson'), i);
      });
      const uniforms = Object.fromEntries(['Center','Angle','Time','Energy','Reveal'].map(name => [name, gl.getUniformLocation(program, `u${name}`)]));
      canvas.dataset.renderer = 'webgl';
      return {
        draw(state) {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.uniform2f(uniforms.Center, state.x, state.y);
          gl.uniform1f(uniforms.Angle, state.angle);
          gl.uniform1f(uniforms.Time, state.time);
          gl.uniform1f(uniforms.Energy, state.energy);
          gl.uniform1f(uniforms.Reveal, state.reveal);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      };
    } catch (error) {
      console.warn('Portrait WebGL unavailable; using canvas reveal.', error.message);
      return null;
    }
  }

  function createCanvasRenderer() {
    // A canvas that has acquired a WebGL context cannot acquire a 2D context.
    // Replace it only if shader setup failed on an otherwise WebGL-capable device.
    let surface = canvas;
    let ctx = surface.getContext('2d');
    if (!ctx) {
      surface = document.createElement('canvas');
      surface.className = canvas.className;
      surface.setAttribute('aria-hidden', 'true');
      canvas.replaceWith(surface);
      ctx = surface.getContext('2d');
    }
    if (!ctx) return null;
    surface.dataset.renderer = 'canvas';
    return {
      surface,
      draw(s) {
        const w = surface.width, h = surface.height;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(images[0], 0, 0, w, h);
        if (!s.reveal) return;
        const normal = [Math.cos(s.angle), Math.sin(s.angle)];
        const tangent = [normal[1], -normal[0]];
        const span = .345 + .035 * Math.sin(s.time * .34);
        const height = .091 + .025 * Math.sin(s.time * .51) + s.energy * .022;
        ctx.save(); ctx.beginPath();
        [-1, 1].forEach((side, sideIndex) => {
          for (let i = 0; i <= 80; i++) {
            const u = (sideIndex ? 1 - i / 80 : i / 80) * 2 - 1;
            const a = u * span;
            const curl = .038 * Math.sin(u * 2.6 + s.time * .46) + .014 * Math.sin(u * 5.4 - s.time * .322);
            const extent = height * Math.sqrt(Math.max(0, 1 - u * u)) * (.87 - .63 * u) * (1 + .1 * Math.sin(u * 5 + s.time * .276));
            const d = curl + side * extent;
            const x = (s.x + (tangent[0] * a + normal[0] * d) / (4 / 3)) * w;
            const y = (s.y + tangent[1] * a + normal[1] * d) * h;
            if (!sideIndex && !i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
        });
        ctx.closePath(); ctx.clip(); ctx.globalAlpha = s.reveal;
        ctx.clearRect(0, 0, w, h); ctx.drawImage(images[1], 0, 0, w, h); ctx.restore();
      }
    };
  }

  function drawAir(time, dt, reveal) {
    if (!airContext) return;
    const ctx = airContext, w = air.width, h = air.height;
    ctx.clearRect(0, 0, w, h);
    if (!reveal || thumbnail > .995) return;
    const follow = 1 - Math.exp(-dt / 260);
    airX = mix(airX, airTargetX, follow); airY = mix(airY, airTargetY, follow);
    const driftX = (airX - .5) * pointerMix, driftY = (airY - .45) * pointerMix;
    function leaf(x, y, length, height, rotation, opacity, phase) {
      ctx.save(); ctx.translate(x * w, y * h); ctx.rotate(rotation);
      const l = length * w, b = height * h;
      const bend = Math.sin(phase) * .22;
      ctx.beginPath(); ctx.moveTo(-l * .57, b * .1);
      ctx.bezierCurveTo(-l * .77, -b * .47, -l * .42, -b * .83, -l * .07, -b * .44);
      ctx.bezierCurveTo(l * .24, -b * (.1 + bend), l * .5, -b * .27, l * .64, -b * .14);
      ctx.bezierCurveTo(l * .31, b * .13, l * .05, b * (.27 + bend), -l * .24, b * .54);
      ctx.bezierCurveTo(-l * .46, b * .75, -l * .61, b * .43, -l * .57, b * .1);
      ctx.closePath(); ctx.globalAlpha = opacity * reveal;
      ctx.fillStyle = '#737c73'; ctx.fill();
      ctx.globalAlpha = opacity * .36 * reveal; ctx.strokeStyle = '#84918a'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.moveTo(-l * .57, b * .1);
      ctx.bezierCurveTo(-l * .3, b * .2, l * .27, -b * .02, l * .64, -b * .14); ctx.stroke();
      ctx.restore();
    }
    const t = time;
    leaf(.26 + Math.sin(t * .19) * .065 + driftX * .22,
      .45 + Math.cos(t * .27) * .12 + driftY * .2,
      .44, .13, -.27 + Math.sin(t * .23) * .48 + driftX * .5, .12, t * .4);
    leaf(.87 + Math.cos(t * .22) * .045 + driftX * .16,
      .39 + Math.sin(t * .24) * .18 + driftY * .18,
      .22, .075, .4 + Math.cos(t * .31) * .8, .105, t * .33 + 2);
    leaf(.56 + Math.sin(t * .2) * .19 + driftX * .16,
      .17 + Math.sin(t * .3 + 2) * .05 + driftY * .1,
      .24, .065, Math.sin(t * .21) * .5, .09, t * .28);
    leaf(.9 + Math.sin(t * .29) * .035, .23 + Math.cos(t * .33) * .12,
      .018, .022, t * .18, .15, t * .3);
  }

  function resize() {
    const surface = renderer?.surface || canvas;
    const w = portrait.clientWidth, h = portrait.clientHeight;
    if (!w || !h) return;
    const scale = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt((mobile.matches ? 950000 : 1650000) / (w * h)));
    surface.width = Math.round(w * scale); surface.height = Math.round(h * scale);
    const airScale = Math.min(devicePixelRatio || 1, 1.25, Math.sqrt(1000000 / (innerWidth * innerHeight)));
    air.width = Math.round(innerWidth * airScale); air.height = Math.round(innerHeight * airScale);
    if (ready && !running()) draw(performance.now(), 0);
  }
  function running() { return ready && wanted && thumbnail < .999 && !failed && !document.hidden && !reduced.matches; }
  function schedule() {
    if (!running() || frame) return;
    previous = 0; frame = requestAnimationFrame(tick);
  }
  function setActive(active) {
    wanted = !!active;
    if (!wanted) {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      lastPointer = -10000; pointerMix = 0;
      canvas.dataset.mode = 'paused';
    } else schedule();
  }
  function setThumbnail(progress) {
    const next = clamp(progress);
    if (Math.abs(next - thumbnail) < .0001) return;
    thumbnail = next;
    air.style.opacity = String(1 - thumbnail);
    if (!ready) return;
    draw(performance.now(), 0);
    if (thumbnail > .998) {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      canvas.dataset.mode = 'thumbnail';
    } else schedule();
  }
  function draw(now, dt) {
    const follow = 1 - Math.exp(-dt / 105);
    pointerX = mix(pointerX, targetX, follow); pointerY = mix(pointerY, targetY, follow);
    energy = mix(energy, targetEnergy, 1 - Math.exp(-dt / 160));
    targetEnergy *= Math.exp(-dt / 220);
    const interactive = now - lastPointer < 360;
    pointerMix = mix(pointerMix, interactive ? 1 : 0, 1 - Math.exp(-dt / (interactive ? 140 : 1250)));
    const idleX = .5 + Math.sin(elapsed * .32) * .065;
    const idleY = .49 + Math.sin(elapsed * .39) * .11;
    centerX = mix(idleX, pointerX, pointerMix);
    centerY = mix(idleY, pointerY, pointerMix);
    const idleAngle = Math.PI / 2 + Math.sin(elapsed * .3) * 1.52;
    const pointerAngle = Math.PI / 2 + (pointerX - .5) * 3.7 + (pointerY - .52) * .7;
    angle = mix(idleAngle, pointerAngle, pointerMix);
    const reveal = reduced.matches ? 0 : clamp(elapsed / 1.1) * (1 - thumbnail);
    renderer.draw({x:centerX, y:centerY, angle, time:elapsed, energy:energy * pointerMix, reveal});
    drawAir(elapsed, dt, reveal);
    if (now - dataTime > 240 || reduced.matches) {
      const mode = reduced.matches ? 'static' : thumbnail > .998 ? 'thumbnail' : interactive || pointerMix > .12 ? 'pointer' : 'idle';
      canvas.dataset.mode = mode;
      canvas.dataset.center = `${centerX.toFixed(3)},${centerY.toFixed(3)}`;
      canvas.dataset.phase = elapsed.toFixed(2);
      dataTime = now;
    }
  }
  function tick(now) {
    frame = 0;
    if (!running()) return;
    const dt = previous ? Math.min(now - previous, 40) : 16.667;
    previous = now; elapsed += dt / 1000;
    draw(now, dt); frame = requestAnimationFrame(tick);
  }

  document.addEventListener('pointermove', event => {
    if (!running() || event.pointerType === 'touch') return;
    const rect = portrait.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, .2, .8);
    const y = clamp((event.clientY - rect.top) / rect.height, .27, .77);
    const now = performance.now();
    const speed = Math.hypot(x - targetX, y - targetY) / Math.max((now - lastEventTime) / 1000, .016);
    targetEnergy = clamp(speed * .6); targetX = x; targetY = y;
    airTargetX = event.clientX / innerWidth; airTargetY = event.clientY / innerHeight;
    lastEventTime = now; lastPointer = now;
  }, {passive:true});
  document.addEventListener('pointerleave', () => { lastPointer = -10000; });
  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    else schedule();
  });
  reduced.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    if (ready) { draw(performance.now(), 0); schedule(); }
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); failed = true; cancelAnimationFrame(frame); frame = 0;
    portrait.classList.remove('fluid-ready'); canvas.style.visibility = 'hidden';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    failed = false; renderer = createWebGL();
    if (renderer) {
      canvas.style.visibility = ''; portrait.classList.add('fluid-ready');
      resize(); draw(performance.now(), 0); schedule();
    }
  });
  window.HeroFluid = {setActive, setThumbnail};

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img); img.onerror = reject; img.src = path;
    });
  }
  Promise.all([loadImage(content.heroImage), loadImage(content.heroHelmetImage)]).then(loaded => {
    images = loaded;
    renderer = createWebGL() || createCanvasRenderer();
    if (!renderer) { canvas.remove(); return; }
    ready = true; resize(); draw(performance.now(), 0);
    canvas.dataset.mode = !wanted ? 'paused' : thumbnail > .998 ? 'thumbnail' : reduced.matches ? 'static' : 'idle';
    portrait.classList.add('fluid-ready');
    new ResizeObserver(resize).observe(portrait);
    wanted = wanted && !document.body.classList.contains('detail-mode')
      && document.querySelector('.hero-scene').style.visibility !== 'hidden';
    schedule();
  }).catch(() => { canvas.remove(); air.remove(); });
})();
