/* KURISE / v5 gallery transition — two REAL DOM panels, no opaque overlay.
   Forward: next slide revealed right -> left. Backward: left -> right.
   A thin transparent seam follows the clipping boundary; words pop as it passes.
*/
(function(){'use strict';
const running=new WeakMap();
const reduced=()=>new URLSearchParams(location.search).get('motion')==='reduce';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const EASE=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function clear(stage){
 const state=running.get(stage);
 if(state){cancelAnimationFrame(state.raf);running.delete(stage);}
 stage.querySelectorAll('.slide-outgoing,.slide-incoming').forEach(el=>{
  el.classList.remove('slide-outgoing','slide-incoming');el.style.clipPath='';
  window.KuriseCopyReveal?.finishSlide(el);
  el.querySelectorAll('.slide-kinetic').forEach(word=>{
   word.classList.add('slide-kinetic-in');
  });
 });
 stage.querySelector('.slide-reveal-seam')?.remove();
}
function start(stage,oldSlide,newSlide,forward){
 clear(stage);
 if(!oldSlide||!newSlide||oldSlide===newSlide)return;
 if(reduced()){window.KuriseCopyReveal?.finishSlide(newSlide);return;}
 window.KuriseCopyReveal?.prepareSlide(newSlide);
 const duration=690;
 window.KuriseFlowPoints?.transition(oldSlide,newSlide);
 oldSlide.classList.add('slide-outgoing');
 newSlide.classList.add('slide-incoming');
 const seam=document.createElement('div');seam.className='slide-reveal-seam';
 seam.setAttribute('aria-hidden','true');stage.appendChild(seam);
 const title=newSlide.querySelector('.archive-card-body h3,.panel-copy h3');
 if(title){window.KuriseTypography?.split(title);title.classList.add('slide-kinetic');title.classList.remove('slide-kinetic-in');}
 const state={raf:0};running.set(stage,state);
 let copyActivated=false;
 function draw(p){
  const hidden=(1-p)*100;
  newSlide.style.clipPath=forward?`inset(0 0 0 ${hidden.toFixed(4)}%)`:`inset(0 ${hidden.toFixed(4)}% 0 0)`;
  const x=forward?hidden:(100-hidden);
  seam.style.left=x.toFixed(4)+'%';
  if(title && !title.classList.contains('slide-kinetic-in')){
   const s=stage.getBoundingClientRect(),r=title.getBoundingClientRect();
   const crossing=forward?(x*s.width/100 <= r.right-s.left):(x*s.width/100 >= r.left-s.left);
   if(crossing)title.classList.add('slide-kinetic-in');
  }
 }
 draw(0);
 const started=performance.now();
 function frame(now){
  if(running.get(stage)!==state)return;
  const t=clamp((now-started)/duration,0,1);
  if(t>=.43&&!copyActivated){copyActivated=true;window.KuriseCopyReveal?.playSlide(newSlide);}
  draw(EASE(t));
  if(t<1)state.raf=requestAnimationFrame(frame);
  else{clear(stage);window.KuriseCopyReveal?.finishSlide(newSlide);if(title)title.classList.add('slide-kinetic-in');}
 }
 state.raf=requestAnimationFrame(frame);
}
window.KuriseSlideReveal={start,clear,isRunning:stage=>running.has(stage)};
})();
