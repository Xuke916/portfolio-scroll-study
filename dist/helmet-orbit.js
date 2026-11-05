(() => {
  'use strict';
  const TAU=Math.PI*2;
  const normalize=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const subtract=(a,b)=>a.map((v,i)=>v-b[i]);

  function patch(name,nu,nv,position,normal,kind=0) {
    const vertices=[],triangles=[],wire=[],edges=new Set();
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const u=i/nu,v=j/nv,p=position(u,v);
      const n=normal ? normalize(normal(u,v,p)) : normalize(cross(
        subtract(position(u,v+.0001),position(u,v-.0001)),
        subtract(position(u+.0001,v),position(u-.0001,v))));
      vertices.push(...p,...n,u,v);
    }
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      const a=i+j*(nu+1),b=a+1,c=a+nu+1,d=c+1;
      triangles.push(a,c,b,b,c,d);
      for(const [x,y]of[[a,b],[a,c],[b,c],[b,d],[c,d]]){
        const key=Math.min(x,y)+':'+Math.max(x,y);
        if(!edges.has(key)){edges.add(key);wire.push(x,y);}
      }
    }
    return {name,kind,vertices:new Float32Array(vertices),triangles:new Uint16Array(triangles),wire:new Uint16Array(wire)};
  }
  function crown(u,v){
    const phi=u*TAU,maxTheta=1.74-.15*Math.cos(phi)+.43*Math.sin(phi)**2,theta=v*maxTheta;
    return [.84*Math.sin(theta)*Math.sin(phi),.05+Math.cos(theta),Math.sin(theta)*Math.cos(phi)];
  }
  function buildGeometry(){
    const parts=[patch('crown',64,28,crown,(_u,_v,p)=>[p[0]/(.84*.84),p[1]-.05,p[2]])];
    const brim=(u,v,lower=0)=>{
      const x=u*2-1;
      return [.88*x*(1-.18*v),.02-.10*v-.07*v*v+.045*x*x-lower,(.64+.86*v)*Math.sqrt(1-.65*x*x)];
    };
    parts.push(patch('visor',32,10,(u,v)=>brim(u,v),null,1));
    parts.push(patch('visor underside',32,5,(u,v)=>brim(u,v,.035),()=>[0,-1,0],2));
    for(const side of[-1,1]){
      parts.push(patch('cheek extension '+side,22,7,(u,v)=>{
        const t=u,span=(v-.5)*(.30-.10*t);
        return [side*(.79-.20*t),-.35-.45*t+span,.26+.76*t+span*.22];
      },()=>[side,.12,.24],4));
    }
    parts.push(patch('clear jaw shield',28,8,(u,v)=>{
      const x=(u*2-1)*.61;
      return [x,-.80-.30*v+.06*(x/.61)**2,1.03+.22*(1-(x/.61)**2)];
    },(u)=>[(u*2-1)*.2,.08,1],4));
    parts.push(patch('lower shell rim',64,5,(u,v)=>{
      const p=crown(u,1),a=v*TAU,r=.025;
      return [p[0]+Math.sin(u*TAU)*r*Math.cos(a),p[1]+r*Math.sin(a),p[2]+Math.cos(u*TAU)*r*Math.cos(a)];
    },(u,v)=>[Math.sin(u*TAU)*Math.cos(v*TAU),Math.sin(v*TAU),Math.cos(u*TAU)*Math.cos(v*TAU)],2));
    return parts;
  }

  function makeDecals(){
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
    const c=canvas.getContext('2d');
    function badge(u){
      const x=u*2048,y=590,r=121;
      c.strokeStyle='#fff';c.lineWidth=9;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();
      c.lineWidth=3;c.beginPath();c.arc(x,y,r-15,0,TAU);c.stroke();
      c.fillStyle='#fff';c.textAlign='center';c.font='bold 25px Arial';
      function arcText(text,top){
        const span=top?2.18:1.76;
        for(let i=0;i<text.length;i++){
          const a=top?-Math.PI/2-span/2+span*i/(text.length-1):Math.PI/2+span/2-span*i/(text.length-1);
          c.save();c.translate(x+101*Math.cos(a),y+101*Math.sin(a));c.rotate(a+(top?Math.PI/2:-Math.PI/2));c.fillText(text[i],0,8);c.restore();
        }
      }
      arcText('LOS ANGELES',true);arcText('DODGERS',false);
      c.font='bold 130px Arial';c.fillText('L',x-16,y+44);c.fillText('A',x+23,y+25);
    }
    badge(.25);badge(.75);
    c.textAlign='center';c.fillStyle='#f7f8ff';
    c.font='italic bold 68px Arial';c.fillText('Rawlings',.135*2048,815);c.fillText('Rawlings',.865*2048,815);
    c.font='bold 148px Arial';c.lineWidth=13;c.strokeStyle='#f5f6ff';
    c.strokeText('23',.475*2048,746);c.fillStyle='#061c40';c.fillText('23',.475*2048,746);
    c.fillStyle='#fafbff';c.fillRect(.47*2048-43,778,86,42);
    c.fillStyle='#11345f';c.fillRect(.47*2048-40,781,38,36);
    c.fillStyle='#cf3439';c.fillRect(.47*2048+2,781,38,36);
    return canvas;
  }
  const vertex=`
    attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUv;
    uniform float uYaw;uniform float uPitch;
    varying vec3 vNormal;varying vec3 vCamera;varying vec2 vUv;
    varying vec2 vPortrait;varying vec2 vSource;varying float vPhotoFacing;
    vec3 yaw(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
    vec3 pitch(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
    vec2 project(vec3 p){float perspective=1.+p.z*.065;return vec2(.487,.53)+p.xy*vec2(.205,-.245)*perspective;}
    void main(){
      vec3 camera=pitch(yaw(aPosition,uYaw),uPitch);
      vCamera=camera;vNormal=pitch(yaw(aNormal,uYaw),uPitch);vUv=aUv;
      vPortrait=project(camera);vSource=project(pitch(yaw(aPosition,-1.95),.055));
      vPhotoFacing=dot(normalize(aNormal),normalize(vec3(.929,.04,-.37)));
      gl_Position=vec4(vPortrait.x*2.-1.,1.-vPortrait.y*2.,-camera.z*.22,1.);
    }
  `;
  const fragment=`
    precision highp float;
    uniform sampler2D uPerson;uniform sampler2D uSource;uniform sampler2D uDecals;
    uniform float uKind;uniform float uWire;
    varying vec3 vNormal;varying vec3 vCamera;varying vec2 vUv;
    varying vec2 vPortrait;varying vec2 vSource;varying float vPhotoFacing;
    float slot(vec2 p,vec2 center){vec2 q=abs(p-center)-vec2(.012,.052);return length(max(q,0.))+min(max(q.x,q.y),0.)-.008;}
    void main(){
      float person=texture2D(uPerson,vPortrait).a;
      // The real photo silhouette occludes the far half of the orbit. The near
      // half passes over it, so the visor can genuinely travel around the head.
      if(vCamera.z<-.04&&person>.025)discard;
      if(uKind<.5){
        vec2 earA=(vUv-vec2(.25,.86))/vec2(.036,.068);
        vec2 earB=(vUv-vec2(.75,.86))/vec2(.036,.068);
        if(min(length(earA),length(earB))<1.)discard;
      }
      if(uWire>.5){gl_FragColor=vec4(.40,.47,.52,person>.025?.022:.042);return;}
      vec3 normal=normalize(vNormal);if(!gl_FrontFacing)normal=-normal;
      vec3 blue=vec3(.115,.30,.60);
      vec4 reference=texture2D(uSource,clamp(vSource,.001,.999));
      float photo=smoothstep(.15,.5,vPhotoFacing)*reference.a
        *step(reference.r*.87,reference.b)*step(vSource.y,.74)*step(.25,vSource.y);
      if(uKind>1.5&&uKind<2.5)blue*=.44;
      float vents=1.;
      if(uKind<.5){
        float d=min(min(slot(vUv,vec2(.07,.30)),slot(vUv,vec2(.93,.30))),
          min(min(slot(vUv,vec2(.20,.24)),slot(vUv,vec2(.80,.24))),min(slot(vUv,vec2(.43,.20)),slot(vUv,vec2(.57,.20)))));
        vents=smoothstep(-.002,.004,d);
        blue=mix(vec3(.003,.013,.035),blue,vents);
        blue+=vec3(.02,.045,.09)*(1.-smoothstep(.002,.009,abs(d)));
        vec4 decal=texture2D(uDecals,vUv);blue=mix(blue,decal.rgb,decal.a*(1.-smoothstep(0.,.15,photo)));
      }
      vec3 light=normalize(vec3(-.55,.85,1.));vec3 fill=normalize(vec3(.8,.35,.3));
      float diffuse=.42+.58*max(dot(normal,light),0.)+.19*max(dot(normal,fill),0.);
      float specular=pow(max(dot(reflect(-light,normal),vec3(0.,0.,1.)),0.),42.)*.72;
      float broad=pow(max(dot(normal,normalize(vec3(.2,.9,.8))),0.),9.)*.10;
      float rim=pow(1.-abs(normal.z),3.);
      vec3 color=blue*diffuse+vec3(.76,.86,1.)*(specular*vents+broad)+vec3(.025,.08,.16)*rim;
      if(uKind<.5)color=mix(color,reference.rgb*(.72+.28*diffuse)+vec3(specular*.18),photo*.96);
      float alpha=1.;
      if(uKind>3.5){color=mix(vec3(.40,.55,.65),color,.25);alpha=.24+rim*.24;}
      gl_FragColor=vec4(color,alpha);
    }
  `;

  function createRenderer(gl){
    const program=gl.createProgram();
    for(const[type,source]of[[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);gl.deleteShader(shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    const locations=Object.fromEntries(['Yaw','Pitch','Kind','Wire','Person','Source','Decals'].map(n=>[n,gl.getUniformLocation(program,'u'+n)]));
    const attrs=['aPosition','aNormal','aUv'].map(n=>gl.getAttribLocation(program,n));
    const parts=buildGeometry().map(part=>{
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,part.vertices,gl.STATIC_DRAW);
      const triangle=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangle);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,part.triangles,gl.STATIC_DRAW);
      const wire=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,wire);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,part.wire,gl.STATIC_DRAW);
      return {...part,buffer,triangle,wire};
    }).sort((a,b)=>(a.kind===4)-(b.kind===4));
    function texture(){
      const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
      for(const p of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);
      for(const p of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
      return t;
    }
    gl.activeTexture(gl.TEXTURE5);const decals=texture();
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,makeDecals());
    function target(){return {texture:texture(),framebuffer:gl.createFramebuffer(),depth:gl.createRenderbuffer()};}
    const color=target(),wire=target();let width=0,height=0;
    function resize(w,h){
      if(w===width&&h===height)return;width=w;height=h;
      for(const t of[color,wire]){
        gl.bindTexture(gl.TEXTURE_2D,t.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
        gl.bindFramebuffer(gl.FRAMEBUFFER,t.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t.texture,0);
        gl.bindRenderbuffer(gl.RENDERBUFFER,t.depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,t.depth);
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Helmet render target unavailable');
      }
    }
    function drawParts(isWire){
      gl.uniform1f(locations.Wire,isWire?1:0);
      for(const part of parts){
        if(isWire&&part.kind===4)continue;
        gl.bindBuffer(gl.ARRAY_BUFFER,part.buffer);
        attrs.forEach((loc,i)=>{gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,i===2?2:3,gl.FLOAT,false,32,i===0?0:i===1?12:24);});
        gl.uniform1f(locations.Kind,part.kind);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,isWire?part.wire:part.triangle);
        gl.depthMask(part.kind!==4);
        gl.drawElements(isWire?gl.LINES:gl.TRIANGLES,isWire?part.wire.length:part.triangles.length,gl.UNSIGNED_SHORT,0);
      }
    }
    return {color:color.texture,wire:wire.texture,
      render(w,h,phase){
        gl.activeTexture(gl.TEXTURE5);resize(w,h);gl.bindTexture(gl.TEXTURE_2D,decals);
        gl.useProgram(program);gl.uniform1i(locations.Person,0);gl.uniform1i(locations.Source,1);gl.uniform1i(locations.Decals,5);
        gl.uniform1f(locations.Yaw,-1.95+phase);gl.uniform1f(locations.Pitch,.055+Math.sin(phase*.7)*.11);
        gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
        gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);
        for(const[t,isWire]of[[color,false],[wire,true]]){
          gl.bindFramebuffer(gl.FRAMEBUFFER,t.framebuffer);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);drawParts(isWire);
        }
        attrs.forEach(loc=>gl.disableVertexAttribArray(loc));
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.depthMask(true);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
      }
    };
  }
  window.HelmetOrbit={buildGeometry,createRenderer};
})();
