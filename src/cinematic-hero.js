const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
export function initCinematicHero(){
  const hero=document.querySelector(".cinematic-hero");
  if(!hero)return;
  const reduced=reduceMotion.matches;
  hero.classList.add("hero-ready");
  if(reduced){hero.classList.add("motion-reduced");return;}
  const wordmark=hero.querySelector("[data-cinematic-wordmark]");
  const glow=hero.querySelector(".blueprint-cursor-glow");
  const magnetic=[...hero.querySelectorAll(".magnetic-control")];
  const diagram=[...hero.querySelectorAll(".diagram-module")];
  let frame=0,px=0,py=0,scrollFrame=0;
  const pointerMove=event=>{
    if(event.pointerType==="touch")return;
    const rect=hero.getBoundingClientRect();
    px=(event.clientX-rect.left)/Math.max(1,rect.width)-.5;
    py=(event.clientY-rect.top)/Math.max(1,rect.height)-.5;
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      hero.style.setProperty("--pointer-x-px",(px*7).toFixed(2)+"px");
      hero.style.setProperty("--pointer-y-px",(py*5).toFixed(2)+"px");
      hero.style.setProperty("--pointer-x-pct",(px*8).toFixed(2)+"%");
      hero.style.setProperty("--pointer-y-pct",(py*8).toFixed(2)+"%");
      hero.style.setProperty("--pointer-x-angle",(px*1.4).toFixed(2)+"deg");
      hero.style.setProperty("--pointer-y-angle",(py*-1).toFixed(2)+"deg");
      hero.style.setProperty("--pointer-x-glow",(px*90).toFixed(1)+"px");
      hero.style.setProperty("--pointer-y-glow",(py*90).toFixed(1)+"px");
      if(glow){const r=hero.getBoundingClientRect();glow.setAttribute("cx",String((px+.5)*r.width*1440/Math.max(1,r.width)));glow.setAttribute("cy",String((py+.5)*r.height*900/Math.max(1,r.height)));}
      frame=0;
    });
  };
  const pointerLeave=()=>{
    if(frame)cancelAnimationFrame(frame);frame=0;
    ["--pointer-x-px","--pointer-y-px","--pointer-x-angle","--pointer-y-angle","--pointer-x-glow","--pointer-y-glow"].forEach(name=>hero.style.setProperty(name,"0px"));
    ["--pointer-x-pct","--pointer-y-pct"].forEach(name=>hero.style.setProperty(name,"0%"));
    if(glow){glow.setAttribute("cx","720");glow.setAttribute("cy","450");}
    magnetic.forEach(el=>{el.style.setProperty("--mag-x","0px");el.style.setProperty("--mag-y","0px");});
  };
  hero.addEventListener("pointermove",pointerMove,{passive:true});
  hero.addEventListener("pointerleave",pointerLeave,{passive:true});
  magnetic.forEach(el=>el.addEventListener("pointermove",event=>{
    if(event.pointerType==="touch")return;
    const r=el.getBoundingClientRect(),dx=event.clientX-r.left-r.width/2,dy=event.clientY-r.top-r.height/2;
    el.style.setProperty("--mag-x",(dx*.09).toFixed(1)+"px");
    el.style.setProperty("--mag-y",(dy*.12).toFixed(1)+"px");
  },{passive:true}));
  magnetic.forEach(el=>el.addEventListener("pointerleave",()=>{
    el.style.setProperty("--mag-x","0px");el.style.setProperty("--mag-y","0px");
  }));
  wordmark?.querySelectorAll(".wordmark-letter").forEach(letter=>{
    letter.addEventListener("pointerenter",()=>letter.classList.add("letter-active"));
    letter.addEventListener("pointerleave",()=>letter.classList.remove("letter-active"));
  });
  diagram.forEach((node,index)=>node.addEventListener("focus",()=>node.style.setProperty("--module-order",String(index))));
  const onScroll=()=>{
    if(scrollFrame)return;
    scrollFrame=requestAnimationFrame(()=>{
      const rect=hero.getBoundingClientRect(),range=Math.max(1,hero.offsetHeight-window.innerHeight);
      const progress=Math.min(1,Math.max(0,-rect.top/range));
      hero.style.setProperty("--hero-scroll",progress.toFixed(3));
      hero.style.setProperty("--hero-scroll-y",(-progress*28).toFixed(1)+"px");
      scrollFrame=0;
    });
  };
  window.addEventListener("scroll",onScroll,{passive:true});onScroll();
  reduceMotion.addEventListener?.("change",event=>{if(event.matches){pointerLeave();hero.classList.add("motion-reduced");}});
  hero._cinematicCleanup=()=>{
    if(frame)cancelAnimationFrame(frame);
    if(scrollFrame)cancelAnimationFrame(scrollFrame);
    window.removeEventListener("scroll",onScroll);
    hero.removeEventListener("pointermove",pointerMove);
    hero.removeEventListener("pointerleave",pointerLeave);
  };
}
