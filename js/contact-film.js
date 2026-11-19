/* Contact: load its film only when needed. Pause immediately outside this chapter. */
(()=>{'use strict';
 const section=document.getElementById('contact');
 const video=document.getElementById('contactFilm');
 if(!section||!video)return;
 const source=video.querySelector('source[data-src]');
 let loaded=false;
 function sync(){
  const active=!document.hidden&&(section.classList.contains('is-current')||section.classList.contains('is-revealing'));
  if(active){
   if(!loaded){loaded=true;if(source){source.src=source.dataset.src;video.load();}}
   if(video.paused)video.play().catch(()=>{});
  }else if(!video.paused) video.pause();
 }
 video.muted=true;
 new MutationObserver(sync).observe(section,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',sync,{passive:true});
 sync();
})();
