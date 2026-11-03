const vertexSource = `
attribute vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;
const fragmentSource = `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_intensity;
float ring(vec2 p, float radius, float width){ return 1.0-smoothstep(width,width+0.008,abs(length(p)-radius)); }
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-0.5*u_resolution)/min(u_resolution.x,u_resolution.y);
  vec2 mouse=(u_pointer-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
  float t=u_time*0.12;
  float d=length(p-mouse*0.72);
  float glow=exp(-d*4.2)*0.34;
  float wave=sin(atan(p.y,p.x)*3.0+length(p)*10.0-t*2.0);
  float field=exp(-abs(length(p)-(.28+.035*wave))*18.0);
  float rings=ring(p,0.25+0.018*sin(t*2.0),0.003)+ring(p,0.39+0.025*cos(t),0.002);
  float grid=1.0-smoothstep(0.0,0.012,abs(fract((p.x+p.y*0.16)*15.0)-0.5));
  float vignette=smoothstep(1.0,0.12,length(p));
  vec3 base=vec3(0.055,0.052,0.048);
  vec3 orange=vec3(0.94,0.30,0.075);
  vec3 warm=vec3(0.65,0.36,0.19);
  vec3 color=base;
  color+=orange*(field*0.12+rings*0.055+glow)*u_intensity;
  color+=warm*grid*0.012;
  color*=vignette;
  gl_FragColor=vec4(color,1.0);
}
`;

function compileShader(gl,type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const error=gl.getShaderInfoLog(shader)||"Shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(error);
  }
  return shader;
}

export function initSkolWebGLScene(root=document){
  const host=root.querySelector(".hero-visual");
  if(!host||host.dataset.webglReady==="true")return;
  host.dataset.webglReady="true";
  const canvas=document.createElement("canvas");
  canvas.className="skol-webgl-scene";
  canvas.setAttribute("aria-hidden","true");
  host.prepend(canvas);
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse=window.matchMedia("(pointer: coarse)").matches;
  let gl=null,program=null,buffer=null,frame=0,visible=true,disposed=false,start=performance.now();
  let pointer={x:.5,y:.5},target={x:.5,y:.5},width=0,height=0,dpr=1;
  const fallback=()=>{canvas.classList.add("is-fallback");if(gl){gl.getExtension("WEBGL_lose_context")?.loseContext();gl=null;}};
  try{
    gl=canvas.getContext("webgl",{alpha:false,antialias:false,powerPreference:"low-power"});
    if(!gl){fallback();return;}
    const vertex=compileShader(gl,gl.VERTEX_SHADER,vertexSource);
    const fragment=compileShader(gl,gl.FRAGMENT_SHADER,fragmentSource);
    program=gl.createProgram();
    gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||"Program link failed");
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    gl.useProgram(program);
    const position=gl.getAttribLocation(program,"position");
    gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const uniforms={
      resolution:gl.getUniformLocation(program,"u_resolution"),
      pointer:gl.getUniformLocation(program,"u_pointer"),
      time:gl.getUniformLocation(program,"u_time"),
      intensity:gl.getUniformLocation(program,"u_intensity")
    };
    const resize=()=>{
      const rect=host.getBoundingClientRect();
      width=Math.max(1,rect.width);height=Math.max(1,rect.height);
      dpr=Math.min(window.devicePixelRatio||1,1.5);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      canvas.style.width=width+"px";canvas.style.height=height+"px";
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
      draw(performance.now());
    };
    const draw=(now)=>{
      if(disposed||!gl)return;
      pointer.x+=(target.x-pointer.x)*.08;pointer.y+=(target.y-pointer.y)*.08;
      gl.uniform2f(uniforms.pointer,pointer.x,pointer.y);
      gl.uniform1f(uniforms.time,reduced?0:(now-start)/1000);
      gl.uniform1f(uniforms.intensity,coarse?.65:1.0);
      gl.drawArrays(gl.TRIANGLES,0,6);
    };
    const tick=(now)=>{if(disposed||!visible||!gl)return;draw(now);if(!reduced)frame=requestAnimationFrame(tick)};
    const startLoop=()=>{if(disposed||!visible||frame||!gl)return;if(reduced)draw(performance.now());else frame=requestAnimationFrame(tick)};
    const stopLoop=()=>{if(frame)cancelAnimationFrame(frame);frame=0};
    const onPointer=(event)=>{
      const rect=host.getBoundingClientRect();
      target.x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
      target.y=1-Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
    };
    const onLeave=()=>{target={x:.5,y:.5}};
    host.addEventListener("pointermove",onPointer,{passive:true});
    host.addEventListener("pointerleave",onLeave,{passive:true});
    const observer=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting);
      if(visible)startLoop();else stopLoop();
    },{threshold:.02});
    observer.observe(host);
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
    canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();disposed=true;stopLoop();fallback();},{once:true});
    window.addEventListener("pagehide",()=>{disposed=true;stopLoop();observer.disconnect();resizeObserver.disconnect();host.removeEventListener("pointermove",onPointer);host.removeEventListener("pointerleave",onLeave);},{once:true});
    resize();startLoop();
  }catch(error){console.warn("SKOL WebGL scene fallback:",error);fallback();}
}
