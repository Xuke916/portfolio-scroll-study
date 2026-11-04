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
  const fallback = portrait.querySelector('.hero-image');
  fallback.alt = '戴深蓝棒球帽的背影，流动切片中显现蓝色头盔';

  let renderer, images, frame = 0, previous = 0, elapsed = 0;
  let wanted = !document.body.classList.contains('detail-mode');
  let ready = false, failed = false, lastPointer = -10000, pointerMix = 0;
  let pointerX = .52, pointerY = .5, targetX = .52, targetY = .5;
  let targetEnergy = 0, energy = 0, lastEventTime = 0;
  let centerX = .52, centerY = .5, angle = Math.PI / 2;
  let dataTime = 0;

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
    float wave(float x) {
      return .015 * sin(x * 8. + uTime * .85)
           + .008 * sin(x * 19. - uTime * .53);
    }
    void main() {
      vec2 uv = vec2(vUv.x, 1. - vUv.y);
      vec2 normal = vec2(cos(uAngle), sin(uAngle));
      vec2 tangent = vec2(-normal.y, normal.x);
      vec2 point = (uv - uCenter) * vec2(aspect, 1.);
      float along = dot(point, tangent);
      float distance = dot(point, normal) + wave(along);
      float width = .064 + .014 * sin(uTime * .62) + uEnergy * .014;
      float slice = (1. - smoothstep(width - .002, width + .005, abs(distance))) * uReveal;
      float edge = 1. - smoothstep(.002, .024, abs(abs(distance) - width));
      vec2 bend = normal / vec2(aspect, 1.) * edge
                * (.0025 + .004 * uEnergy) * sin(along * 14. + uTime);
      vec4 person = sampleClean(uPerson, uv - bend * .35);
      vec4 helmet = sampleClean(uHelmet, uv + bend);
      vec3 color = mix(person.rgb * person.a, helmet.rgb * helmet.a, slice);
      float alpha = mix(person.a, helmet.a, slice);

      // Thin, translucent extensions pass behind the opaque silhouette. Their
      // independent curvature gives the slice the glassy, interleaved edge seen
      // in the reference, instead of dissolving the complete second photograph.
      float ribbonDistance = distance + .032 * sin(along * 6. - uTime * .46);
      float ribbon = (1. - smoothstep(.024, .039, abs(ribbonDistance - width * .58)))
                   * (1. - smoothstep(.42, .72, abs(along)));
      float second = (1. - smoothstep(.009, .019, abs(ribbonDistance + width * 1.04)))
                   * (1. - smoothstep(.3, .6, abs(along)));
      float headGate = smoothstep(.16, .24, uv.y) * (1. - smoothstep(.76, .87, uv.y));
      vec2 stretched = uCenter + (uv - uCenter) * vec2(.78, .91)
                     + tangent * .025 * sin(uTime * .4);
      vec4 glass = sampleClean(uHelmet, stretched);
      float ghostAlpha = (ribbon * .15 + second * .08) * headGate * uReveal;
      ghostAlpha *= .28 + glass.a * .72;
      vec3 glassColor = mix(vec3(.63, .72, .84), glass.rgb, .22);
      color += glassColor * ghostAlpha * (1. - alpha);
      alpha += ghostAlpha * (1. - alpha);
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
        const tangent = [-normal[1], normal[0]];
        const width = .064 + .014 * Math.sin(s.time * .62) + s.energy * .014;
        ctx.save(); ctx.beginPath();
        [-1, 1].forEach((side, sideIndex) => {
          for (let i = 0; i <= 80; i++) {
            const a = (sideIndex ? 1 - i / 80 : i / 80) * 2 - 1;
            const wave = .015 * Math.sin(a * 8 + s.time * .85) + .008 * Math.sin(a * 19 - s.time * .53);
            const d = side * width - wave;
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

  function resize() {
    const surface = renderer?.surface || canvas;
    const w = portrait.clientWidth, h = portrait.clientHeight;
    if (!w || !h) return;
    const scale = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt((mobile.matches ? 950000 : 1650000) / (w * h)));
    surface.width = Math.round(w * scale); surface.height = Math.round(h * scale);
    if (ready && !running()) draw(performance.now(), 0);
  }
  function running() { return ready && wanted && !failed && !document.hidden && !reduced.matches; }
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
  function draw(now, dt) {
    const follow = 1 - Math.exp(-dt / 105);
    pointerX = mix(pointerX, targetX, follow); pointerY = mix(pointerY, targetY, follow);
    energy = mix(energy, targetEnergy, 1 - Math.exp(-dt / 160));
    targetEnergy *= Math.exp(-dt / 220);
    const interactive = now - lastPointer < 360;
    pointerMix = mix(pointerMix, interactive ? 1 : 0, 1 - Math.exp(-dt / (interactive ? 140 : 1250)));
    const idleX = .52 + Math.sin(elapsed * .38) * .065;
    const idleY = .49 + Math.sin(elapsed * .48) * .15;
    centerX = mix(idleX, pointerX, pointerMix);
    centerY = mix(idleY, pointerY, pointerMix);
    const idleAngle = Math.PI / 2 + Math.sin(elapsed * .3) * 1.52;
    const pointerAngle = Math.PI / 2 + (pointerX - .5) * 3.7 + (pointerY - .52) * .7;
    angle = mix(idleAngle, pointerAngle, pointerMix);
    const reveal = reduced.matches ? 0 : clamp(elapsed / 1.1);
    renderer.draw({x:centerX, y:centerY, angle, time:elapsed, energy:energy * pointerMix, reveal});
    if (now - dataTime > 240 || reduced.matches) {
      const mode = reduced.matches ? 'static' : interactive || pointerMix > .12 ? 'pointer' : 'idle';
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
    lastEventTime = now; lastPointer = now;
  }, {passive:true});
  document.addEventListener('pointerleave', () => { lastPointer = -10000; });
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
  window.HeroFluid = {setActive};

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
    portrait.classList.add('fluid-ready');
    new ResizeObserver(resize).observe(portrait);
    wanted = wanted && !document.body.classList.contains('detail-mode')
      && document.querySelector('.hero-scene').style.visibility !== 'hidden';
    schedule();
  }).catch(() => { canvas.remove(); });
})();
