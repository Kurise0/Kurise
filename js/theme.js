/* One coherent site mode across every chapter; preference survives refresh. */
(()=>{'use strict';
const button=document.getElementById('themeToggle');if(!button)return;
function set(mode){const light=mode==='light';document.documentElement.dataset.theme=light?'light':'dark';
 button.setAttribute('aria-pressed',String(light));button.setAttribute('aria-label',light?'切换到黑夜模式':'切换到白天模式');
 document.getElementById('themeSymbol').textContent=light?'☾':'☀';
 button.querySelector('.theme-text').textContent=light?'NIGHT':'DAY';
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=light?'#eeeae0':'#111615';
 try{localStorage.setItem('kurise-theme',light?'light':'dark')}catch(e){}
}
set(document.documentElement.dataset.theme==='light'?'light':'dark');
button.addEventListener('click',()=>set(document.documentElement.dataset.theme==='light'?'dark':'light'));
window.KuriseTheme={set,current:()=>document.documentElement.dataset.theme};
})();
