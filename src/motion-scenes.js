const NS="http://www.w3.org/2000/svg";

function svgElement(name,attributes={}){
  const node=document.createElementNS(NS,name);
  Object.entries(attributes).forEach(([key,value])=>node.setAttribute(key,String(value)));
  return node;
}

function addBlueprint(host){
  if(host.querySelector(".skol-blueprint"))return;
  const svg=svgElement("svg",{
    class:"skol-blueprint",
    viewBox:"0 0 760 560",
    preserveAspectRatio:"xMidYMid meet",
    "aria-hidden":"true",
    focusable:"false"
  });
  const defs=svgElement("defs");
  const gradient=svgElement("linearGradient",{id:"skol-blueprint-fade",x1:"0",x2:"1",y1:"0",y2:"1"});
  gradient.append(svgElement("stop",{offset:"0","stop-color":"#ef6a21","stop-opacity":".85"}));
  gradient.append(svgElement("stop",{offset:"1","stop-color":"#ef6a21","stop-opacity":".08"}));
  defs.append(gradient);
  svg.append(defs);
  const drawing=svgElement("g",{class:"skol-blueprint-lines",fill:"none","stroke-linecap":"round","stroke-linejoin":"round"});
  const paths=[
    "M82 112H222V72H430V112H620",
    "M82 128H198V88H414V128H620",
    "M105 420H250V460H540V420H656",
    "M122 405V170H170V145H560V170H615V405",
    "M202 170V235H560V170",
    "M202 235V360H560V235",
    "M202 360H560",
    "M250 235V360M310 235V360M370 235V360M430 235V360M490 235V360",
    "M82 112V420M656 112V420",
    "M82 96V82M656 96V82M74 96H90M648 96H664",
    "M222 72V42M430 72V42M214 42H438",
    "M105 420V486M656 420V486M105 478H656",
    "M170 145L145 120M560 145L585 120"
  ];
  paths.forEach((d,index)=>drawing.append(svgElement("path",{d,class:"skol-blueprint-path",style:"--draw-index:"+index})));
  const marks=svgElement("g",{class:"skol-blueprint-marks",fill:"none"});
  [[82,112],[620,112],[105,420],[656,420],[222,72],[430,72],[202,235],[560,360]].forEach(([cx,cy])=>{
    marks.append(svgElement("circle",{cx,cy,r:4}));
    marks.append(svgElement("path",{d:"M"+(cx-9)+" "+cy+"h18M"+cx+" "+(cy-9)+"v18"}));
  });
  svg.append(drawing,marks);
  const label=svgElement("g",{class:"skol-blueprint-labels",fill:"currentColor"});
  const texts=[
    ["SKOL / SYSTEM PLAN",84,55],
    ["AXIS 01",84,100],
    ["STRUCTURE / 001",575,448],
    ["7600",360,31],
    ["5600",380,500]
  ];
  texts.forEach(([value,x,y])=>{
    const t=svgElement("text",{x,y});
    t.textContent=value;
    label.append(t);
  });
  svg.append(label);
  host.append(svg);
}

function addWorkflowDrawing(board){
  if(board.querySelector(".skol-workflow-drawing"))return;
  const svg=svgElement("svg",{
    class:"skol-workflow-drawing",
    viewBox:"0 0 640 420",
    preserveAspectRatio:"none",
    "aria-hidden":"true",
    focusable:"false"
  });
  const group=svgElement("g",{fill:"none","stroke-linecap":"round","stroke-linejoin":"round"});
  group.append(
    svgElement("path",{class:"workflow-path",d:"M320 0V54H70V105M320 54H570V105M70 105V315H320V365M570 105V315H320"}),
    svgElement("path",{class:"workflow-path workflow-path-secondary",d:"M70 315H320V365H570V315"}),
    svgElement("circle",{class:"workflow-node-ring",cx:70,cy:105,r:12}),
    svgElement("circle",{class:"workflow-node-ring",cx:570,cy:105,r:12}),
    svgElement("circle",{class:"workflow-node-ring",cx:320,cy:365,r:12})
  );
  svg.append(group);
  board.prepend(svg);
}

export function initMotionScenes(root=document){
  const hero=root.querySelector(".hero-visual");
  if(hero)addBlueprint(hero);
  root.querySelectorAll(".home-story-board").forEach(addWorkflowDrawing);

  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduced)return;

  const boards=[...root.querySelectorAll(".home-story-board")];
  if(!boards.length||!("IntersectionObserver"in window))return;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("workflow-in-view");
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.22});
  boards.forEach(board=>observer.observe(board));
}
