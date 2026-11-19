/* KURISE WORLDLINE FIELD / deterministic geometry from the final loading number.
   A random loading value changes the radial harmonics, noise and orbit density.
   Direct interpolation forms the orbit without overshoot. No external dependencies. */
(()=>{'use strict';
const canvas=document.getElementById('worldlineCanvas');
const visual=document.getElementById('heroVisual');
const video=document.getElementById('heroFilm');
if(!canvas||!visual)return;
const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
let value='0.000000';try{value=sessionStorage.getItem('kurise-last-worldline')||value}catch(e){}
const numeric=Number(value);let seed=0;
for(const c of value)seed=(Math.imul(seed,33)+c.charCodeAt(0))>>>0;
function rand(){seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}
const P=Array.from({length:4},(_,i)=>({
 radius:[.22,.38,.55,.73][i],frequency:2+Math.floor(rand()*6),
 phase:rand()*Math.PI*2,offset:rand()*.17-.085,amplitude:.026+rand()*.05,
 color:rand()>.46?0:1
}));
let w=0,h=0,dpr=1,points=[],mouse={x:-1000,y:-1000,active:false};
let last=0,formationStarted=performance.now(),initialised=false;
const reduce=()=>new URLSearchParams(location.search).get('motion')==='reduce';
function scatter(){
 for(const p of points){p.sx=w*(.05+.9*rand());p.sy=h*(.05+.9*rand());}
}
function assemble(){formationStarted=performance.now();scatter();paint(formationStarted,true);}
function resize(){
 const r=visual.getBoundingClientRect();if(r.width<1||r.height<1)return;
 const oldPoints=points,oldW=w||r.width,oldH=h||r.height;
 w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
 points=[];
 const unit=Math.min(w,h)*.48,cx=w*.49,cy=h*.47;
 P.forEach((orb,oi)=>{
  const count=Math.max(46,Math.floor((oi+2)*56*(innerWidth<600?.58:1)));
  for(let i=0;i<count;i++){
   const theta=i/count*Math.PI*2;
   const shape=orb.radius +orb.offset+orb.amplitude*Math.sin(theta*orb.frequency+orb.phase)+(.018+oi*.004)*Math.sin(3*theta+numeric*1.6);
   const rr=unit*shape*1.23;
   const x=cx+rr*Math.cos(theta)*1.04;
   const y=cy+rr*Math.sin(theta)*.88;
   points.push({baseX:x,baseY:y,sx:x,sy:y,orbit:oi,pulse:rand()*Math.PI*2,blink:rand()});
  }
 });
 for(let i=0;i<110;i++){
  const a=rand()*Math.PI*2;const rr=unit*(.12+rand()*.86);
  const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr*.88;
  points.push({baseX:x,baseY:y,sx:x,sy:y,orbit:4,pulse:rand()*6,blink:rand()});
 }
 // Preserve scattered origins during dynamic mobile browser-bar resizes.
 if(!initialised){initialised=true;scatter();}
 else if(oldPoints.length){for(let i=0;i<points.length;i++){
   const from=oldPoints[i%oldPoints.length];points[i].sx=from.sx*w/oldW;points[i].sy=from.sy*h/oldH;
 }}
}
function move(e){const r=visual.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.active=mouse.x>=0&&mouse.x<w&&mouse.y>=0&&mouse.y<h}
addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',()=>mouse.active=false);
const observer=new ResizeObserver(resize);observer.observe(visual);
function render(now){requestAnimationFrame(render);
 const home=document.getElementById('index');const visible=home.classList.contains('is-current')||home.classList.contains('is-revealing');
 if(video){if(visible&&!document.hidden&&video.paused)video.play().catch(()=>{});else if((!visible||document.hidden)&&!video.paused)video.pause()}
 if(!visible||document.hidden)return;
 paint(now);
}
function paint(now,force=false){
 if(!force&&now-last<25)return;last=now;
 ctx.clearRect(0,0,w,h);
 const dark=document.documentElement.dataset.theme!=='light';
 const primary=dark?[105,221,224]:[35,102,125],secondary=dark?[255,153,116]:[210,87,60];
 const radius=Math.min(w,h)*.18;
 const elapsed=Math.max(0,now-formationStarted);
 const t=Math.max(0,Math.min(1,(elapsed-80)/1450));
 const formation=reduce()?1:t*t*(3-2*t);
 for(let i=0;i<points.length;i++){
  const p=points[i];
  const drift=(1-formation)*Math.min(3,w*.005);
  const x=p.sx+(p.baseX-p.sx)*formation+Math.cos(now*.0014+p.pulse)*drift;
  const y=p.sy+(p.baseY-p.sy)*formation+Math.sin(now*.0012+p.pulse)*drift;
  const pointerDist=Math.hypot(x-mouse.x,y-mouse.y)||1;
  const pointerHit=mouse.active&&formation>.9?Math.max(0,1-pointerDist/radius):0;
  const drawX=x+(x-mouse.x)/pointerDist*pointerHit*pointerHit*12;
  const drawY=y+(y-mouse.y)/pointerDist*pointerHit*pointerHit*12;
  const rgb=p.orbit%2===0?primary:secondary;
  const pulse=.64+.36*Math.sin(now*.0008+p.pulse);
  const alpha=Math.max(.05,Math.min(.93,((p.orbit===4?.24:.43)+pulse*.22+pointerHit*.35)*(reduce()?1:Math.min(1,.27+t*1.65))));
  ctx.fillStyle=`rgba(${rgb.join(',')},${alpha})`;
  ctx.beginPath();ctx.arc(drawX,drawY,(p.orbit===4?.7:1.35)+pointerHit*1.9,0,Math.PI*2);ctx.fill();
 }
 // understated orbital vectors link the model to its source number
 const cx=w*.49,cy=h*.47;
 ctx.lineWidth=.7;ctx.globalAlpha=reduce()?1:Math.min(1,.15+t*1.1);ctx.strokeStyle=dark?'rgba(107,221,229,.15)':'rgba(35,88,104,.18)';
 ctx.beginPath();ctx.moveTo(cx-w*.31,cy);ctx.lineTo(cx+w*.31,cy);ctx.moveTo(cx,cy-h*.36);ctx.lineTo(cx,cy+h*.36);ctx.stroke();
 ctx.fillStyle=dark?'rgba(255,165,113,.83)':'rgba(182,70,39,.78)';ctx.fillRect(cx-2,cy-2,4,4);ctx.globalAlpha=1;
}
resize();requestAnimationFrame(render);
let field='UNREGISTERED';try{field=sessionStorage.getItem('kurise-last-worldline-field')||field}catch(e){}
const status=document.getElementById('worldlineSignal');if(status)status.textContent=`${field} · SEED ${value} · ${points.length} PTS`;
window.KuriseWorldline={value,seed,count:()=>points.length,assemble};
})();
