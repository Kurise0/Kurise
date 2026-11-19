/* KURISE / v5: default full-motion reveal + synchronized kinetic typography.
 * Incoming DOM chapter is clipped from the bottom (forward) or top (back).
 * Its translucent boundary line exposes REAL content, never a solid curtain. */
(function(){'use strict';
const PAGES=['index','about','competition','project','contact'];
const ALIASES={home:'index',competitions:'competition',projects:'project',research:'about'};
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const pages=PAGES.map(name=>document.getElementById(name));
const manualReduced=new URLSearchParams(location.search).get('motion')==='reduce';
// Full reveal is the default even on systems with OS reduced-motion enabled.
// Visitors can explicitly opt out with ?motion=reduce.
const useReducedMotion=()=>manualReduced;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const DURATION=930;
let index=0,transition=null,lockUntil=0,wheelSum=0,wheelLast=0,aboutMode='profile';
let edge;
let heroIntroTimer=0;
function showHeroIntro(){
  const hero=$('#index');if(!hero)return;
  hero.classList.add('hero-intro-ready');
  hero.classList.remove('hero-intro-pending');
}
function beginHeroIntro(){
  const hero=$('#index');if(!hero)return;
  clearTimeout(heroIntroTimer);
  hero.classList.remove('hero-intro-ready');
  hero.classList.add('hero-intro-pending');
  // The intro can begin while the hero is *incoming* during the 930ms
  // chapter reveal. The earlier check for `transition` exited at 340ms,
  // leaving the hero copy hidden forever after returning from another page.
  heroIntroTimer=setTimeout(()=>{
    if(transition ? transition.to!==0 : index!==0)return;
    showHeroIntro();
  },340);
}
function cancelHeroIntro(){
 clearTimeout(heroIntroTimer);
 const hero=$('#index');if(hero){hero.classList.remove('hero-intro-pending');hero.classList.add('hero-intro-ready');}
}

const KINETIC_SELECTORS=['.hero-title-fill','.hero-title-outline','#aboutProfile .about-mast h2 span','#research .research-mast h2 span','.section-intro .display-big span','.cinema-panel.is-current .panel-copy h3','.archive-card.is-current h3','#contact .contact-main h2 span'];
function prepareKinetic(page){
 const els=[...page.querySelectorAll(KINETIC_SELECTORS.join(','))];
 els.forEach(el=>{
  window.KuriseTypography?.split(el);
  el.classList.add('kinetic-word');
  el.classList.remove('kinetic-started','kinetic-popped');
 });
 return els;
}
function playKinetic(state,progress){
 const seam=(state.forward?1-progress:progress)*innerHeight;
 state.kinetic.forEach(el=>{
  if(el.classList.contains('kinetic-started'))return;
  const rect=el.getBoundingClientRect();if(!rect.height)return;
  const threshold=state.forward?rect.bottom+innerHeight*.12:rect.top-innerHeight*.08;
  if(state.forward?seam<=threshold:seam>=threshold)el.classList.add('kinetic-started');
 });
}

function normalize(raw){
 let name=decodeURIComponent(String(raw||'').replace(/^#/,''));
 if(Object.prototype.hasOwnProperty.call(ALIASES,name))name=ALIASES[name];
 return PAGES.includes(name)?name:'index';
}
function revealVisible(page){
 if(!page)return;
 requestAnimationFrame(()=>{
  page.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
  const orbit=page.querySelector('.research-orbit');if(orbit)orbit.classList.add('is-drawn');
 });
}
function setAboutMode(mode){
 aboutMode=mode==='research'?'research':'profile';
 const page=$('#about');page.classList.toggle('show-research',aboutMode==='research');
 const profile=$('#aboutProfile'),research=$('#research');
 profile.setAttribute('aria-hidden',String(aboutMode==='research'));
 research.setAttribute('aria-hidden',String(aboutMode!=='research'));
 if('inert' in profile)profile.inert=aboutMode==='research';
 if('inert' in research)research.inert=aboutMode!=='research';
 $$('.about-mode').forEach(button=>{
  const active=button.dataset.aboutTab===aboutMode;
  button.classList.toggle('is-active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 if(aboutMode==='research')revealVisible(research);
 if(!transition&&index===1){window.KuriseCopyReveal?.preparePage(page);window.KuriseCopyReveal?.playPage(page,80);}
}
function closeMobile(){
 document.body.classList.remove('menu-open');
 $('#mobileToggle').setAttribute('aria-expanded','false');
 $('#mobilePanel').setAttribute('aria-hidden','true');
}
function syncMainNav(name){
 $$('#mainNavigation [data-go],#mobilePanel [data-go]').forEach(el=>{
  const active=el.dataset.go===name;
  el.classList.toggle('is-active',active);
  if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
 });
}
function updateUI(){
 pages.forEach((page,i)=>{
  const active=i===index;
  page.classList.toggle('is-current',active);
  page.classList.remove('is-revealing');
  page.style.clipPath='';
  page.setAttribute('aria-hidden',String(!active));
  if('inert' in page)page.inert=!active;
 });
 const pageName=PAGES[index];
 syncMainNav(pageName);
 const cue=$('#globalScrollCue');
 if(cue){
   const next=(index+1)%PAGES.length;
   cue.dataset.go=PAGES[next];
   cue.classList.toggle('cue-restart',index===PAGES.length-1);
   cue.setAttribute('aria-label',index===PAGES.length-1?'返回首页':'下一章节：'+PAGES[next]);
   const cueText=$('#globalCueText');
   if(cueText)cueText.textContent=index===PAGES.length-1?'RESTART / 00':'NEXT / '+String(next).padStart(2,'0');
 }
 $$('.rail-point').forEach(el=>{
  const active=el.dataset.section===PAGES[index];
  el.classList.toggle('is-active',active);
  active?el.setAttribute('aria-current','page'):el.removeAttribute('aria-current');
 });
 const fill=$('#railFill');if(fill)fill.style.height=`${(index+1)*100/PAGES.length}%`;
 const progress=$('#globalProgress');if(progress)progress.style.width=`${(index/(PAGES.length-1))*100}%`;
 closeMobile();
 document.title=`KURISE / ${PAGES[index].toUpperCase()} — Research in Motion`;
 revealVisible(pages[index]);
}
function drawFrame(state,progress){
 const p=clamp(progress,0,1);
 const hidden=(1-p)*100;
 // Keep outgoing screen intact. The incoming screen is revealed pixel-by-pixel.
 state.incoming.style.clipPath=state.forward
   ?`inset(${hidden.toFixed(4)}% 0 0 0)`
   :`inset(0 0 ${hidden.toFixed(4)}% 0)`;
 edge.style.top=`${(state.forward?hidden:100-hidden).toFixed(4)}%`;
 state.progress=p;
 if(state.kinetic)playKinetic(state,p);
}
function completeTransition(state){
 if(!state||transition!==state)return;
 if(state.raf)cancelAnimationFrame(state.raf);
 drawFrame(state,1);
 state.kinetic.forEach(el=>{el.classList.add('kinetic-started','kinetic-popped');});
 index=state.to;
 transition=null;
 document.body.classList.remove('chapter-transitioning');
 edge.classList.remove('is-active');edge.style.top='';
 updateUI();
 window.KuriseCopyReveal?.finishPage(pages[index]);
 // Safety net for throttled/suspended timers (background tabs and mobile).
 // Do not replay the sequence: the normal 340ms timer already started it.
 if(index===0)showHeroIntro();else cancelHeroIntro();
 window.KuriseFlowPoints?.onPageEnter(PAGES[index]);
}
function setPage(raw,source='link'){
 const next=PAGES.indexOf(normalize(raw));
 if(raw==='research'||raw==='#research')setAboutMode('research');
 // Hashchange/popstate may notify the same navigation twice. Never cancel
 // an in-progress reveal just because a second event names its target.
 if(transition&&transition.to===next)return;
 if(transition)completeTransition(transition);
 const before=index;
 if(next===1&&raw!=='research'&&raw!=='#research')setAboutMode('profile');
 if(next===before){updateUI();return;}
 // IMPORTANT: Do not mutate competition/project slide selections here.
 // They start at 0 on initial load, and only user gallery actions can change
 // them. Leaving and returning restores precisely what the user selected.
 const incoming=pages[next];
 if(next!==0)window.KuriseCopyReveal?.preparePage(incoming);
 if(next===0){
   beginHeroIntro();
   window.KuriseWorldline?.assemble();
 } else if(before===0)cancelHeroIntro();
 const state={from:before,to:next,incoming,forward:next>before,raf:0,progress:0,kinetic:[]};
 wheelSum=0;
 if(useReducedMotion()){index=next;updateUI();window.KuriseCopyReveal?.finishPage(pages[index]);window.KuriseFlowPoints?.onPageStart(PAGES[index]);lockUntil=performance.now()+180;return;}
 // Two real pages remain painted simultaneously, with incoming on top.
 // The outgoing .is-current is deliberately retained until animation ends.
 transition=state;
 syncMainNav(PAGES[next]);
 state.kinetic=prepareKinetic(incoming);
 incoming.classList.add('is-revealing');
 window.KuriseFlowPoints?.onPageStart(PAGES[next]);
 incoming.setAttribute('aria-hidden','true');
 if('inert' in incoming)incoming.inert=true;
 document.body.classList.add('chapter-transitioning');
 revealVisible(incoming);
 if(next!==0)window.KuriseCopyReveal?.playPage(incoming,state.forward?530:150);
 drawFrame(state,0);
 edge.classList.add('is-active');
 closeMobile();
 const start=performance.now();
 const tick=now=>{
  if(transition!==state)return;
  const t=clamp((now-start)/DURATION,0,1);
  // Strongly legible travel, still with smooth acceleration/deceleration.
  const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  drawFrame(state,eased);
  if(t<1)state.raf=requestAnimationFrame(tick);
  else completeTransition(state);
 };
 state.raf=requestAnimationFrame(tick);
 lockUntil=start+DURATION+170;
}
function navigate(raw,options={}){
 const name=normalize(raw),hash='#'+name;
 if(raw==='research')setAboutMode('research');
 if(options.replace)history.replaceState(null,'',hash);
 else if(location.hash!==hash)history.pushState(null,'',hash);
 setPage(raw,options.source||'link');
}
function step(direction,insideGallery=false){
 const d=Math.sign(direction);if(!d||transition)return false;
 if(insideGallery&&index===2&&window.KuriseCompetition?.canStep(d)){
  return window.KuriseCompetition.step(d);
 }
 if(insideGallery&&index===3&&window.KuriseProjects?.canStep(d)){
  return window.KuriseProjects.step(d);
 }
 const next=clamp(index+d,0,PAGES.length-1);
 if(next===index)return false;
 navigate(PAGES[next],{source:'wheel'});
 return true;
}
function scrollChildIfPossible(node,delta){
 if(!node)return false;
 // A grid can have scrollHeight > clientHeight yet have non-scrollable overflow.
 // Only consume wheel events when a real scrolling container actually moves.
 if(!['auto','scroll'].includes(getComputedStyle(node).overflowY))return false;
 const max=node.scrollHeight-node.clientHeight;
 if(max<4)return false;
 const current=node.scrollTop;
 if(!((delta>0&&current<max-2)||(delta<0&&current>2)))return false;
 node.scrollTop=clamp(current+delta,0,max);
 return Math.abs(node.scrollTop-current)>.5;
}
function wheelArea(target){
 if(!(target instanceof Element))return null;
 // Pointer *inside* the actual carousel stage: scroll its slides.
 // Header, left navigation, filters, buttons and surrounding text:
 // switch the main chapter directly.
 if(index===2&&target.closest('#archiveViewport'))return 'competition';
 if(index===3&&target.closest('#projectsHorizontal'))return 'project';
 return null;
}
function onWheel(e){
 if(e.ctrlKey||e.metaKey||document.body.classList.contains('menu-open'))return;
 const factor=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;
 const raw=Math.abs(e.deltaY)>=Math.abs(e.deltaX)*.82?e.deltaY:e.deltaX;
 const delta=raw*factor;if(Math.abs(delta)<.3)return;
 e.preventDefault();
 if(transition||performance.now()<lockUntil)return;
 const area=wheelArea(e.target);
 // Allow the card's long *text* to scroll before changing slides.
 if(area==='competition'&&scrollChildIfPossible(e.target.closest('.archive-card-body'),delta)){
  wheelSum=0;return;
 }
 if(area==='project'&&scrollChildIfPossible(e.target.closest('.cinema-panel.is-current .panel-copy'),delta)){wheelSum=0;return;}
 if(index===1){
  const inner=aboutMode==='research'?$('#research>.container'):$('#aboutProfile');
  if(inner?.contains(e.target)&&scrollChildIfPossible(inner,delta)){wheelSum=0;return;}
 }
 if(index===4){const inner=$('#contact>.container');
  if(inner?.contains(e.target)&&scrollChildIfPossible(inner,delta)){wheelSum=0;return;}
 }
 const now=performance.now();
 if(now-wheelLast>250)wheelSum=0;
 wheelLast=now;wheelSum+=delta;
 if(Math.abs(wheelSum)<65)return;
 const direction=Math.sign(wheelSum);wheelSum=0;
 const moved=step(direction,!!area);
 if(moved&&!transition)lockUntil=now+(useReducedMotion()?220:420);
}
function setupNavigation(){
 $('#mobileToggle').addEventListener('click',()=>{
  const open=!document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open',open);
  $('#mobileToggle').setAttribute('aria-expanded',String(open));
  $('#mobilePanel').setAttribute('aria-hidden',String(!open));
 });
 document.addEventListener('click',e=>{
  const tab=e.target.closest('[data-about-tab]');if(tab){setAboutMode(tab.dataset.aboutTab);return;}
  const link=e.target.closest('[data-go]');if(!link)return;
  if(link.tagName==='A')e.preventDefault();
  closeMobile();navigate(link.dataset.go);
 });
 window.addEventListener('hashchange',()=>setPage(location.hash));
 window.addEventListener('popstate',()=>setPage(location.hash));
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeMobile();return;}
  if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  if(e.target.closest('#archiveViewport,#projectsHorizontal')&&['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key))return;
  const gallery=!!wheelArea(e.target);
  if(['ArrowDown','PageDown','ArrowRight'].includes(e.key)){e.preventDefault();step(1,gallery);}
  else if(['ArrowUp','PageUp','ArrowLeft'].includes(e.key)){e.preventDefault();step(-1,gallery);}
  else if(e.key==='Home'){e.preventDefault();navigate('index');}
  else if(e.key==='End'){e.preventDefault();navigate('contact');}
 });
 window.addEventListener('wheel',onWheel,{passive:false});
}
function setupTouch(){
 let start=null;
 const view=$('#spaViewport');
 view.addEventListener('touchstart',e=>{
  if(e.touches.length!==1)return;
  const scrollZone=e.target.closest('#aboutProfile,#research>.container,.archive-card-body,#contact>.container,.cinema-panel .panel-copy');
  start={x:e.touches[0].clientX,y:e.touches[0].clientY,
   area:wheelArea(e.target),readArea:!!e.target.closest('.archive-card-body'),
   scrollZone,scrollTop:scrollZone?.scrollTop||0};
 },{passive:true});
 view.addEventListener('touchend',e=>{
  if(!start||!e.changedTouches.length)return;
  const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;
  if(start.scrollZone && Math.abs(dy)>Math.abs(dx)){
   const zone=start.scrollZone;
   const max=zone.scrollHeight-zone.clientHeight;
   if(Math.abs(zone.scrollTop-start.scrollTop)>3 ||
      (max>4 && (dy<0 && zone.scrollTop<max-2 || dy>0 && zone.scrollTop>2))){start=null;return;}
  }
  if(Math.abs(dy)>75&&Math.abs(dy)>Math.abs(dx)*1.25&&!start.readArea){
   // Vertical mobile swipes navigate chapters, even over Project artwork.
   if(performance.now()>lockUntil)step(-Math.sign(dy),start.area==='competition');
  }else if(!start.area&&Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.4){
   if(performance.now()>lockUntil)step(-Math.sign(dx),false);
  }
  start=null;
 },{passive:true});
}
function init(){
 const arrivedFromLoader=new URLSearchParams(location.search).has('entered');
 if(manualReduced)document.body.classList.add('motion-reduced');
 window.KuriseContent.init();window.KuriseProjects.init();window.KuriseFlowPoints?.init();
 edge=document.createElement('div');edge.id='revealEdge';edge.setAttribute('aria-hidden','true');
 $('#spaViewport').append(edge);
 setupNavigation();setupTouch();
 const initial=decodeURIComponent(location.hash.slice(1)||'index');index=PAGES.indexOf(normalize(initial));
 setAboutMode(initial==='research'?'research':'profile');
 const cleanPath=location.pathname+(manualReduced?'?motion=reduce':'')+'#'+PAGES[index];
 if(location.pathname+location.search+location.hash!==cleanPath)history.replaceState(null,'',cleanPath);
 updateUI();
 if(index!==0){window.KuriseCopyReveal?.preparePage(pages[index]);window.KuriseCopyReveal?.playPage(pages[index],110);}
 prepareKinetic(pages[0]);
 if(index===0)beginHeroIntro();else cancelHeroIntro();
 window.KuriseFlowPoints?.onPageEnter(PAGES[index]);
 const replay=$('#replayBoot');
 if(replay){let number='';try{number=sessionStorage.getItem('kurise-last-worldline')||'';}catch(e){}
  replay.textContent=`↻ [ ${number||'--.------'} % ]`;
  const indicator=$('#heroWorldline');if(indicator)indicator.textContent=(number||'--.------')+'%';
 }
 // Initial video-first introduction is controlled by beginHeroIntro().
}
window.KuriseRouter={step,current:()=>PAGES[transition?transition.to:index],navigate,isTransitioning:()=>!!transition,
 transitionInfo:()=>transition?{from:PAGES[transition.from],to:PAGES[transition.to],progress:transition.progress}:null};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
