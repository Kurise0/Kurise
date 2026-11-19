/* Visible glyph-by-glyph entrance; keeps original nested markup + i18n hooks. */
(()=>{'use strict';
 function split(el){if(!el)return el;
  if(el.querySelector('.kinetic-glyph'))return el;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);
  let glyph=0;
  textNodes.forEach(node=>{
   const source=node.textContent||'';if(!source.trim())return;
   const frag=document.createDocumentFragment();
   Array.from(source).forEach(char=>{
    if(/\s/.test(char)){frag.append(document.createTextNode(char));return;}
    const span=document.createElement('span');span.className='kinetic-glyph';span.textContent=char;
    span.style.setProperty('--glyph-index',Math.min(glyph,14));glyph++;frag.append(span);
   });
   node.parentNode.replaceChild(frag,node);
  });
  el.classList.add('kinetic-text');return el;
 }
 window.KuriseTypography={split};
})();
