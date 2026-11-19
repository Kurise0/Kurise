/* v14 — page/slide text fades, deliberately separate from existing headline glyphs.
 * No bouncy keyframes. Every pending reveal has a terminal state. */
(()=>{'use strict';
const timers=new WeakMap();
const reduced=()=>new URLSearchParams(location.search).get('motion')==='reduce';
const $all=(root,selector)=>Array.from(root.querySelectorAll(selector));
const pageTargets={
 about:'#aboutProfile .about-copy .lead,#aboutProfile .about-copy .copy-secondary,#aboutProfile .about-signature,#research .research-copy .lead,#research .research-copy .about-signature',
 competition:'.section-intro .section-tag,.section-intro .display-big,.intro-aside p',
 project:'.section-cap',
 contact:'.contact-main>p,.contact-main .email-large,.contact-grid .social-tile'
};
const slideSelector={
 competition:'.archive-meta,.archive-card .desc,.archive-sole',
 project:'.panel-kicker,.panel-copy>p,.panel-line,.panel-buildtag,.panel-action'
};
function clearTimer(el){const t=timers.get(el);if(t){clearTimeout(t);timers.delete(el)}}
function mark(root,selectors,cls){
 const nodes=$all(root,selectors);
 nodes.forEach((el,i)=>{
  el.classList.add(cls);
  el.style.setProperty('--copy-delay',(Math.min(i,5)*76)+'ms');
 });
 return nodes;
}
function preparePage(page){
 if(!page||reduced())return;
 clearTimer(page);
 mark(page,pageTargets[page.id]||'.section-cap','chapter-copy');
 page.classList.remove('copy-playing');
 page.classList.add('copy-ready');
 // Required layout read lets a previous visit replay, without flashing a
 // completed frame in between. Never touch the home hero entrance logic.
 void page.offsetHeight;
 const active=page.querySelector(page.id==='competition'?'.archive-card.is-current':page.id==='project'?'.cinema-panel.is-current':'.impossible');
 if(active)prepareSlide(active,page.id);
}
function playPage(page,delay=0){
 if(!page)return;
 clearTimer(page);
 if(reduced()){finishPage(page);return;}
 timers.set(page,setTimeout(()=>{page.classList.add('copy-playing');timers.delete(page)},delay));
 const active=page.querySelector(page.id==='competition'?'.archive-card.is-current':page.id==='project'?'.cinema-panel.is-current':'.impossible');
 if(active)playSlide(active,delay+110);
}
function finishPage(page){
 if(!page)return;clearTimer(page);page.classList.add('copy-playing');
 const active=page.querySelector(page.id==='competition'?'.archive-card.is-current':page.id==='project'?'.cinema-panel.is-current':'.impossible');
 if(active)finishSlide(active);
}
function prepareSlide(slide,type){
 if(!slide||reduced())return;
 clearTimer(slide);
 const targetType=type||(slide.classList.contains('archive-card')?'competition':'project');
 mark(slide,slideSelector[targetType]||'.panel-copy>p','slide-copy-target');
 slide.classList.remove('slide-copy-playing');
 slide.classList.add('slide-copy-ready');
 void slide.offsetHeight;
}
function playSlide(slide,delay=0){
 if(!slide)return;clearTimer(slide);
 if(reduced()){finishSlide(slide);return}
 timers.set(slide,setTimeout(()=>{slide.classList.add('slide-copy-playing');timers.delete(slide)},delay));
}
function finishSlide(slide){
 if(!slide)return;clearTimer(slide);slide.classList.add('slide-copy-playing');
}
window.KuriseCopyReveal={preparePage,playPage,finishPage,prepareSlide,playSlide,finishSlide};
})();
