
/* KURISE V10 / WORLD LINE ACQUISITION
 * Uses the supplied intro's full-number scrambling and CRT -> zoom/flash rhythm.
 * Preserves the requested random [-1,7) six-decimal value, never a fixed target.
 * Minimum 300ms, then wait for the actual homepage critical resources.
 */
(()=>{'use strict';
 const OPT={MIN_MS:300,CHANGE_MS:32,LOCK_PAUSE_MS:120,ZOOM_MS:660,MAX_WAIT_MS:9000};
 const CRITICAL=[
  './index.html',
  './css/original.css?v=11','./css/spa.css?v=11','./css/v5.css?v=11','./css/v6.css?v=11',
  './css/v7.css?v=11','./css/v8.css?v=11','./css/v9.css?v=11','./css/v11.css?v=11',
  './js/typography.js?v=11','./js/slide-reveal.js?v=11','./js/content.js?v=11',
  './js/projects.js?v=11','./js/flow-points.js?v=11','./js/router.js?v=11',
  './js/worldline.js?v=11','./js/theme.js?v=11','./js/contact-film.js?v=11'
 ];
 const $=id=>document.getElementById(id),scene=$('scene'),digits=$('digits'),signal=$('signalStatus'),
  elapsed=$('elapsedStatus'),resources=$('resourceStatus'),line=$('progressFill'),
  state=$('systemStatus'),worldline=$('worldlineStatus'),skip=$('skip');
 const params=new URLSearchParams(location.search);
 const requested=params.get('dest')||'index';
 const dest=/^(index|about|competition|project|contact|research)$/.test(requested)?requested:'index';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const born=performance.now();
 let total=0,settled=0,failures=0,phase='scanning',previous='',final='',navigated=false;
 let scrambleTicker,progressTicker;
 let firstVideo=null;
 function randomUnit(){
  const c=(typeof crypto!=='undefined'?crypto:null);
  if(c&&typeof c.getRandomValues==='function'){
   const buf=new Uint32Array(1);c.getRandomValues(buf);return buf[0]/4294967296;
  }
  return Math.random();
 }
 function fresh(){
  let output;
  do{output=((Math.floor(randomUnit()*8000000)-1000000)/1000000).toFixed(6)}while(output===previous);
  previous=output;
  return output;
 }
 // Immediately begin changing the *entire* number; no positional locks.
 function scramble(){if(phase==='scanning')digits.textContent=fresh()}
 scramble();scrambleTicker=setInterval(scramble,OPT.CHANGE_MS);
 function track(promise){
  total++;
  Promise.resolve(promise).then(()=>{settled++},()=>{settled++;failures++});
 }
 function cached(url){
  return fetch(url,{cache:'force-cache'}).then(async r=>{
   if(!r.ok)throw Error(r.status+' '+url);
   await r.arrayBuffer();
  });
 }
 // Chromium/Firefox prohibit fetch(file://); do not hold the loader on a false failure.
 if(/^https?:$/.test(location.protocol))CRITICAL.forEach(f=>track(cached(f)));
 track(new Promise((resolve,reject)=>{
  const image=new Image();let ended=false;
  const deadline=setTimeout(()=>finish(false),4500);
  function finish(ok){if(ended)return;ended=true;clearTimeout(deadline);ok?resolve():reject(Error('poster unavailable'))}
  image.onload=()=>finish(true);image.onerror=()=>finish(false);
  image.src='./assets/worldline-poster.jpg?v=11';
  if(image.complete&&image.naturalWidth)finish(true);
 }));
 track(new Promise((resolve,reject)=>{
  const film=document.createElement('video');firstVideo=film;
  film.preload='auto';film.muted=true;film.playsInline=true;
  let ended=false;
  const deadline=setTimeout(()=>finish(false),6000);
  function finish(ok){if(ended)return;ended=true;clearTimeout(deadline);
   film.removeAttribute('src');try{film.load()}catch(e){};firstVideo=null;
   ok?resolve():reject(Error('video first frame unavailable'));
  }
  film.addEventListener('loadeddata',()=>finish(true),{once:true});
  film.addEventListener('error',()=>finish(false),{once:true});
  film.src='./assets/worldline-background.mp4?v=11';
  try{film.load()}catch(e){finish(false)}
 }));
 function formatTime(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
 function paintProgress(){
  if(phase!=='scanning')return;
  const elapsedMs=performance.now()-born,minFraction=Math.min(1,elapsedMs/OPT.MIN_MS);
  const ratio=total?settled/total:1;
  const pct=Math.min(99,Math.round((ratio*.92+minFraction*.08)*100));
  elapsed.textContent='ACQUISITION / '+formatTime(elapsedMs);
  line.style.width=pct+'%';
  resources.textContent='HOMEPAGE / '+settled+' OF '+total+' READY'+(failures?' · '+failures+' FAILED':'');
  state.textContent=settled>=total?'SIGNAL ACQUIRED':'INITIALIZING MAIN PAGE';
  signal.textContent='WORLD LINE / '+String(pct).padStart(2,'0')+'% LOADED';
  if(elapsedMs>=OPT.MIN_MS&&(settled>=total||elapsedMs>=OPT.MAX_WAIT_MS))lock();
 }
 function stop(){clearInterval(scrambleTicker);clearInterval(progressTicker)}
 function fieldName(n){
  if(n<0)return 'OMEGA / Ω';
  if(n<1)return 'ALPHA / α';
  if(n<2)return 'BETA / β';
  if(n<3)return 'GAMMA / γ';
  if(n<4)return 'DELTA / δ';
  if(n<5)return 'EPSILON / ε';
  return 'UNREGISTERED';
 }
 function lock(){
  if(phase!=='scanning')return;
  phase='locked';stop();
  final=fresh();digits.textContent=final;
  scene.classList.add('is-locked');
  state.textContent='WORLD LINE CONFIRMED';
  signal.textContent='DIVERGENCE CONFIRMED / '+final+'%';
  resources.textContent=failures?'NETWORK DEGRADED / CONTINUE':'HOMEPAGE / PREPARED';
  worldline.textContent='WORLD LINE / '+fieldName(Number(final))+' / '+final+'%';
  line.style.width='100%';skip.disabled=true;
  setTimeout(()=>{
   scene.classList.add('is-exiting');
   setTimeout(navigate,reduce?230:OPT.ZOOM_MS);
  },OPT.LOCK_PAUSE_MS);
 }
 function navigate(){
  if(navigated)return;navigated=true;
  try{sessionStorage.setItem('kurise-intro-seen-v5','1');
      sessionStorage.setItem('kurise-last-worldline',final);
      sessionStorage.setItem('kurise-last-worldline-field',fieldName(Number(final)))}catch(e){}
  location.replace('./index.html?entered=1#'+encodeURIComponent(dest));
 }
 // Manual skip skips the waiting phase, but keeps the full random lock and exit.
 function skipIntro(){
  const remain=OPT.MIN_MS-(performance.now()-born);
  if(remain>0)setTimeout(lock,remain);else lock();
 }
 skip.addEventListener('click',skipIntro);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')skipIntro()});
 progressTicker=setInterval(paintProgress,24);paintProgress();
 // Expose progress for optional future asset dependencies without artificial delays.
 window.KuriseLoader={
  waitUntil:track,forceEnter:skipIntro,
  get progress(){return{settled,total,failures,elapsed:performance.now()-born,locked:phase!=='scanning'}}
 };
})();
