const REDUCED="(prefers-reduced-motion: reduce)";
const QUERIES=["Управление строительными проектами","Расчёт смет и стоимости работ","Контроль объектов и бригад","Финансы и прибыль по проектам","Поиск новых заказов и клиентов","Вся работа в одной системе"];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function initHeroFilm(root=document){
 const host=root.querySelector("[data-hero-film]");
 if(!host||host.dataset.ready==="true")return;
 host.dataset.ready="true";
 const canvas=host.querySelector("[data-hero-film-canvas]");
 const video=host.querySelector("[data-hero-film-video]");
 const input=host.querySelector("[data-hero-search]");
 const ctx=canvas?.getContext("2d",{alpha:false,desynchronized:true});
 if(!canvas||!ctx)return;
 const reduced=window.matchMedia(REDUCED);
 const coarse=window.matchMedia("(pointer:coarse)");
 const state={w:1,h:1,dpr:1,time:0,frame:0,last:0,visible:true,disposed:false,mx:.5,my:.48,tx:.5,ty:.48,scroll:0,query:0,typing:false};
 let resizeObserver=null,observer=null,typingTimer=0;
 const resize=()=>{
  const r=host.getBoundingClientRect();state.w=Math.max(1,r.width);state.h=Math.max(1,r.height);
  state.dpr=Math.min(window.devicePixelRatio||1,coarse.matches?1:1.25);
  canvas.width=Math.round(state.w*state.dpr);canvas.height=Math.round(state.h*state.dpr);
  canvas.style.width=state.w+"px";canvas.style.height=state.h+"px";
  ctx.setTransform(state.dpr,0,0,state.dpr,0,0);draw(0);
 };
 const draw=(delta)=>{
  const w=state.w,h=state.h,t=state.time;
  ctx.clearRect(0,0,w,h);
  const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#101711");bg.addColorStop(.5,"#0b100d");bg.addColorStop(1,"#080c09");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  const gx=w*(.67+(state.mx-.5)*.08+Math.sin(t*.00016)*.025),gy=h*(.47+(state.my-.5)*.06);
  const glow=ctx.createRadialGradient(gx,gy,0,gx,gy,Math.max(w,h)*.7);glow.addColorStop(0,"rgba(173,224,91,.19)");glow.addColorStop(.35,"rgba(119,163,73,.07)");glow.addColorStop(1,"rgba(119,163,73,0)");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  const spacing=coarse.matches?48:42;ctx.lineWidth=1;
  for(let x=0;x<w;x+=spacing){const fade=1-Math.abs(x-w*.65)/(w*.8);ctx.strokeStyle="rgba(183,224,132,"+(Math.max(0,fade)*.085)+")";ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=spacing){const fade=1-Math.abs(y-h*.5)/(h*.9);ctx.strokeStyle="rgba(183,224,132,"+(Math.max(0,fade)*.07)+")";ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  const cx=w*.68,cy=h*.49;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-.28+Math.sin(t*.0002)*.04);
  [Math.min(w,h)*.24,Math.min(w,h)*.34,Math.min(w,h)*.44].forEach((r,i)=>{ctx.beginPath();ctx.ellipse(0,0,r*1.2,r*.46,0,0,Math.PI*2);ctx.strokeStyle="rgba(185,237,100,"+(.19-i*.045)+")";ctx.lineWidth=1;ctx.stroke()});
  ctx.restore();
  const floor=h*.72;ctx.strokeStyle="rgba(183,224,132,.12)";
  for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(w*.67+i*16,floor);ctx.lineTo(w*.67+i*85,h);ctx.stroke()}
  for(let i=1;i<8;i++){const y=floor+Math.pow(i/8,1.7)*h*.28;ctx.beginPath();ctx.moveTo(w*.15,y);ctx.lineTo(w,y);ctx.stroke()}
  // Floating dust and luminous particles.
  for(let i=0;i<44;i++){const p=i*17.31;const x=(p*31+w*.5+Math.sin(t*.00022+i)*26)%w;const y=(p*19+h*.3+Math.cos(t*.00019+i*2)*22)%h;ctx.fillStyle="rgba(199,239,133,"+(i%4===0?.55:.2)+")";ctx.beginPath();ctx.arc(x,y,i%5===0?1.6:.8,0,Math.PI*2);ctx.fill()}
  // Wireframe prism at the heart of the film.
  const size=Math.min(w,h)*.105,ang=t*.00022;const points=[];
  for(const z of [-1,1])for(const [x,y] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const X=x*size,Z=z*size;points.push([cx+(X*Math.cos(ang)-Z*Math.sin(ang)*.6),cy+y*size*.7+X*Math.sin(ang)*.32+Z*Math.cos(ang)*.2])}
  ctx.strokeStyle="rgba(203,244,143,.48)";ctx.lineWidth=1.3;
  [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(...points[a]);ctx.lineTo(...points[b]);ctx.stroke()});
  // Light sweep gives the footage a continuous cinematic movement.
  const sweep=((t*.035)%(w+260))-130;const beam=ctx.createLinearGradient(sweep,0,sweep+150,h);beam.addColorStop(0,"rgba(185,237,100,0)");beam.addColorStop(.5,"rgba(185,237,100,.035)");beam.addColorStop(1,"rgba(185,237,100,0)");ctx.fillStyle=beam;ctx.fillRect(0,0,w,h);
 };
 const tick=(now)=>{
  if(state.disposed||!state.visible){state.frame=0;return}
  const delta=state.last?Math.min(40,now-state.last):16;state.last=now;state.time=now;
  state.mx+=(state.tx-state.mx)*.045;state.my+=(state.ty-state.my)*.045;draw(delta);
  if(!reduced.matches||Math.abs(state.tx-state.mx)>.002||Math.abs(state.ty-state.my)>.002)state.frame=requestAnimationFrame(tick);else state.frame=0;
 };
 const schedule=()=>{if(!state.frame&&!state.disposed&&state.visible)state.frame=requestAnimationFrame(tick)};
 const onPointer=e=>{if(coarse.matches)return;const r=host.getBoundingClientRect();state.tx=clamp((e.clientX-r.left)/r.width,0,1);state.ty=clamp((e.clientY-r.top)/r.height,0,1);schedule();const orbit=host.querySelector(".hero-film-orbit");if(orbit){orbit.style.setProperty("--film-x",((.5-state.ty)*5).toFixed(2)+"deg");orbit.style.setProperty("--film-y",((state.tx-.5)*7).toFixed(2)+"deg")}};
 const onLeave=()=>{state.tx=.5;state.ty=.48;const orbit=host.querySelector(".hero-film-orbit");orbit?.style.setProperty("--film-x","0deg");orbit?.style.setProperty("--film-y","0deg");schedule()};
 const rotateQuery=()=>{if(state.typing||document.activeElement===input)return;state.query=(state.query+1)%QUERIES.length;if(input&&!input.value)input.placeholder=QUERIES[state.query]};
 const onFocus=()=>{state.typing=true;window.clearInterval(typingTimer)};
 const onBlur=()=>{state.typing=false;typingTimer=window.setInterval(rotateQuery,2700)};
 input?.addEventListener("focus",onFocus);input?.addEventListener("blur",onBlur);
 input?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const value=input.value.trim();if(value){const target=document.querySelector("#crm-experience")||document.querySelector("#products");target?.scrollIntoView({behavior:reduced.matches?"auto":"smooth",block:"start"})}}});
 host.querySelectorAll("[data-hero-query]").forEach(button=>button.addEventListener("click",()=>{if(input){input.value=button.dataset.heroQuery||"";input.focus();input.dispatchEvent(new Event("input",{bubbles:true}))}}));
 host.addEventListener("pointermove",onPointer,{passive:true});host.addEventListener("pointerleave",onLeave,{passive:true});
 const onVisibility=entries=>{state.visible=entries.some(e=>e.isIntersecting);if(state.visible)schedule();else if(state.frame){cancelAnimationFrame(state.frame);state.frame=0}};
 if("IntersectionObserver"in window){observer=new IntersectionObserver(onVisibility,{threshold:.01});observer.observe(host)}
 if("ResizeObserver"in window){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host)}else window.addEventListener("resize",resize,{passive:true});
 const start=()=>{if(canvas.captureStream&&video){try{const stream=canvas.captureStream(24);video.srcObject=stream;video.play().catch(()=>{video.style.display="none";canvas.style.opacity="1"})}catch{video.style.display="none"}}else if(video)video.style.display="none"};
 resize();start();schedule();typingTimer=window.setInterval(rotateQuery,2700);
 const cleanup=()=>{state.disposed=true;window.clearInterval(typingTimer);if(state.frame)cancelAnimationFrame(state.frame);observer?.disconnect();resizeObserver?.disconnect();window.removeEventListener("resize",resize);host.removeEventListener("pointermove",onPointer);host.removeEventListener("pointerleave",onLeave);input?.removeEventListener("focus",onFocus);input?.removeEventListener("blur",onBlur);video?.srcObject?.getTracks?.().forEach(track=>track.stop())};
 window.addEventListener("pagehide",cleanup,{once:true});
 reduced.addEventListener?.("change",()=>{if(!reduced.matches)schedule()});
}
