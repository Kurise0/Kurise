/* Three 100vw project slides. All wheel routing goes through router.js so a
   wheel movement always does exactly one thing: a slide, or a main chapter. */
(function(){'use strict';
window.KuriseProjects={init};
function init(){
 const stage=document.getElementById('projectsHorizontal');
 const track=document.getElementById('projectsTrack');
 const panels=Array.from(track.querySelectorAll('.cinema-panel'));
 const prev=document.getElementById('projectsPrev');
 const next=document.getElementById('projectsNext');
 const dots=Array.from(document.querySelectorAll('.project-dots [data-panel]'));
 const counter=document.getElementById('projectsCounter');
 const bar=document.getElementById('projectsProgress');
 const reduce=new URLSearchParams(location.search).get('motion')==='reduce';
 let selected=0,position=0,velocity=0,lastTime=performance.now();
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function select(value,instant=false){
  const n=clamp(value,0,panels.length-1);
  if(selected===n&&!instant)return false;
  const previous=selected;
  selected=n;
  if(instant){position=n;velocity=0;}
  counter.innerHTML=String(n+1).padStart(2,'0')+' <i>/</i> '+String(panels.length).padStart(2,'0');
  dots.forEach((d,i)=>{const yes=i===n;d.classList.toggle('is-active',yes);d.setAttribute('aria-current',String(yes));});
  panels.forEach((panel,i)=>{
   const active=i===n;panel.classList.toggle('is-current',active);
   panel.setAttribute('aria-hidden',String(!active));
   if('inert' in panel)panel.inert=!active;
  });
  prev.disabled=n===0;next.disabled=n===panels.length-1;
  bar.style.width=(panels.length>1?100*n/(panels.length-1):100).toFixed(2)+'%';
  if(!instant&&previous!==n)window.KuriseSlideReveal?.start(document.getElementById('cinemaWindow'),panels[previous],panels[n],n>previous);
  return true;
 }
 window.KuriseProjects={init,step:direction=>select(selected+Math.sign(direction)),canStep:direction=>direction>0?selected<panels.length-1:selected>0,select:n=>select(n,true),count:()=>panels.length,current:()=>selected};
 prev.addEventListener('click',()=>select(selected-1));
 next.addEventListener('click',()=>select(selected+1));
 dots.forEach(dot=>dot.addEventListener('click',()=>select(Number(dot.dataset.panel))));
 stage.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
   e.preventDefault();e.stopPropagation();select(selected+(e.key==='ArrowRight'?1:-1));
  }
 });
 let start=null;
 stage.addEventListener('touchstart',e=>{if(e.touches.length===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 stage.addEventListener('touchend',e=>{
  if(!start||!e.changedTouches.length)return;
  const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.15)select(selected-Math.sign(dx));
  start=null;
 },{passive:true});
 select(0,true);

}
})();
