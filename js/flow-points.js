/* KURISE / FORMATION ENGINE v9
   Both galleries are made of persistent Canvas point-clouds. Every slide owns
   its own canvas, so the transparent left/right wipe never exposes a raw SVG.
   Competition geometry comes from each existing SVG; project geometry from
   four custom vector diagrams. No runtime dependencies or remote assets.
*/
(()=>{'use strict';
const fields=new Map();
const W=600,H=340,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const reduced=()=>new URLSearchParams(location.search).get('motion')==='reduce';
function seed(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(x){return ()=>{x+=0x6d2b79f5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}}
function guide(c,id){
 c.clearRect(0,0,W,H);c.lineCap='round';c.lineJoin='round';c.strokeStyle='#ffffff';c.fillStyle='#ffffff';
 const line=(arr,width=3)=>{c.lineWidth=width;c.beginPath();arr.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()};
 const dot=(x,y,r=5)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()};
 const ring=(x,y,rx,ry,weight=2)=>{c.lineWidth=weight;c.beginPath();c.ellipse(x,y,rx,ry,0,0,2*Math.PI);c.stroke()};
 // Three diagram-like silhouettes, each morphing from individual points.
 if(id==='project-0'){
  for(let i=0;i<4;i++)ring(300,166,49+i*35,42+i*30,i===0?4:2);
  line([[72,170],[528,170]],1.7);line([[300,18],[300,315]],1.7);
  for(let i=0;i<24;i++){let a=i*Math.PI/12;dot(300+193*Math.cos(a),166+133*Math.sin(a),2.3)}
  c.font='bold 104px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('K',300,174);
 }else if(id==='project-1'){
  c.lineWidth=3;c.strokeRect(60,33,480,271);c.lineWidth=2;c.strokeRect(60,33,480,36);
  for(let i=0;i<3;i++)dot(81+i*18,51,4);
  for(let i=0;i<3;i++){
   const y=88+i*68;c.lineWidth=2;c.strokeRect(87,y,426,55);
   line([[110,y+19],[235,y+19]],3);line([[110,y+35],[188,y+35]],2);
   for(let j=0;j<7;j++)dot(276+j*25,y+27,3);
   c.lineWidth=3;c.strokeRect(466,y+19,28,21);
  }
  line([[83,280],[514,280]],2);
 }else if(id==='project-2'){
  c.lineWidth=4;c.beginPath();for(let i=0;i<=350;i++){
    let t=i/350*Math.PI*2,den=1+Math.cos(t)*Math.cos(t);
    const x=300+255*Math.sin(t)/den,y=170+210*Math.sin(t)*Math.cos(t)/den;
    i?c.lineTo(x,y):c.moveTo(x,y);
  }c.stroke();ring(300,170,45,45,2);
  for(let i=0;i<14;i++){let a=i/14*Math.PI*2;dot(300+230*Math.cos(a),170+120*Math.sin(a),2)}
  line([[425,75],[495,74],[495,133]],4);line([[495,74],[410,155]],4);
 }
}
function samplePixels(c,id){
 const pix=c.getImageData(0,0,W,H).data,arr=[],rand=rng(seed(id));
 for(let y=5;y<H-5;y+=3)for(let x=5;x<W-5;x+=3){
  const k=(y*W+x)*4;
  if(pix[k+3]>95 && pix[k]+pix[k+1]+pix[k+2]>75 && rand()>.14){
   arr.push([x+(rand()-.5)*2.1,y+(rand()-.5)*2.1]);
  }
 }
 for(let i=arr.length-1;i>0;i--){let j=Math.floor(rand()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}
 const cap=innerWidth<580?380:innerWidth<990?560:930;
 if(arr.length<100){for(let i=0;i<500;i++){let t=i*2.399;arr.push([W/2+150*Math.cos(t)*(i/500),H/2+125*Math.sin(t)*(i/500)])}}
 return arr.slice(0,cap);
}
class Cloud{
 constructor(host,id,slide,type){
  this.host=host;this.id=id;this.slide=slide;this.type=type;
  this.rand=rng(seed(id)+17);this.pts=[];this.positions=[];
  this.w=0;this.h=0;this.last=0;this.burstUntil=0;this.outgoing=false;this.morphStart=performance.now();
  this.canvas=document.createElement('canvas');this.canvas.className='formation-canvas';
  this.canvas.setAttribute('aria-hidden','true');this.ctx=this.canvas.getContext('2d',{alpha:true});
  if(!this.ctx)return;
  // Attach the canvas BEFORE hiding the original artwork. There is no empty frame.
  host.classList.add('formation-host');host.append(this.canvas);
  this.resize();this.fromProjectOrFallback();
  host.classList.add('formation-ready');
  if(type==='competition')this.loadSVG();
  host.addEventListener('pointermove',e=>{let r=host.getBoundingClientRect();this.pointer={x:e.clientX-r.left,y:e.clientY-r.top}} ,{passive:true});
  host.addEventListener('pointerleave',()=>{this.pointer=null},{passive:true});
 }
 resize(){
  const r=this.host.getBoundingClientRect();
  let ww=r.width||this.w||400,hh=r.height||this.h||220;
  if(Math.abs(ww-this.w)<1&&Math.abs(hh-this.h)<1)return;
  const ow=this.w||ww,oh=this.h||hh;this.w=ww;this.h=hh;
  const dpr=Math.min(devicePixelRatio||1,2);
  this.canvas.width=Math.round(ww*dpr);this.canvas.height=Math.round(hh*dpr);
  this.canvas.style.width=ww+'px';this.canvas.style.height=hh+'px';this.ctx.setTransform(dpr,0,0,dpr,0,0);
  for(const p of this.pts){p.x*=ww/ow;p.y*=hh/oh;p.tx*=ww/ow;p.ty*=hh/oh}
 }
 fromProjectOrFallback(){
  const off=document.createElement('canvas');off.width=W;off.height=H;
  const c=off.getContext('2d',{willReadFrequently:true});if(!c)return;
  guide(c,this.type==='project'?this.id:'project-0');
  this.setShape(samplePixels(c,this.id+'-bootstrap'),false);
 }
 loadSVG(){
  const svg=this.host.querySelector('svg');if(!svg)return;
  let xml=new XMLSerializer().serializeToString(svg);
  if(!xml.includes('xmlns='))xml=xml.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
  const url=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml;charset=utf-8'}));
  const im=new Image(),c=document.createElement('canvas');c.width=W;c.height=H;
  im.onload=()=>{
   URL.revokeObjectURL(url);if(!this.host.isConnected)return;
   const cc=c.getContext('2d',{willReadFrequently:true});
   try{
    cc.clearRect(0,0,W,H);
    // The source shapes are authored in a 540×275 viewBox; use meet scaling.
    const scale=Math.min(W/540,H/275),dx=(W-540*scale)/2,dy=(H-275*scale)/2;
    cc.drawImage(im,dx,dy,540*scale,275*scale);
    this.setShape(samplePixels(cc,this.id),false);
   }catch(e){/* Preserve drawn fallback, never reveal a missing source. */}
  };
  im.onerror=()=>URL.revokeObjectURL(url);im.src=url;
 }
 setShape(targets,scatter){
  const old=this.pts,r=this.rand;
  this.positions=targets;
  const next=[];
  const scale=Math.min(this.w/W*.96,this.h/H*.94),ox=(this.w-W*scale)/2,oy=(this.h-H*scale)/2;
  for(let i=0;i<targets.length;i++){
   const [x,y]=targets[i],tx=ox+x*scale,ty=oy+y*scale;
   const before=old.length?old[(i*47)%old.length]:null;
   const angle=r()*Math.PI*2;
   next.push({x:before?before.x:tx+(r()-.5)*this.w*.24,
      y:before?before.y:ty+(r()-.5)*this.h*.26,
      tx,ty,vx:(r()-.5)*5,vy:(r()-.5)*5,
      radius:.65+r()*.85,phase:r()*6.283,twinkle:r()});
  }
  this.pts=next;
  this.morphStart=performance.now();
  if(scatter)this.assemble();
 }
 burst(isOutgoing){
  this.outgoing=isOutgoing;
  this.burstUntil=performance.now()+(isOutgoing?600:840);
  this.morphStart=performance.now();
  const r=this.rand;
  for(const p of this.pts){
    if(!isOutgoing){p.x=p.tx+(r()-.5)*this.w*.72;p.y=p.ty+(r()-.5)*this.h*.66;}
    p.vx+=(r()-.5)*(isOutgoing?14:12);
    p.vy+=(r()-.5)*(isOutgoing?14:12);
  }
  if(reduced()&&!isOutgoing){for(const p of this.pts){p.x=p.tx;p.y=p.ty;p.vx=p.vy=0}}
 }
 assemble(){this.burst(false)}
 active(){
  const p=this.slide.closest('.spa-page');
  return p&&(p.classList.contains('is-current')||p.classList.contains('is-revealing'))&&
   (this.slide.classList.contains('is-current')||this.slide.classList.contains('slide-incoming')||this.slide.classList.contains('slide-outgoing'));
 }
 frame(now){
  if(!this.active()||document.hidden)return;
  if(now-this.last<(innerWidth<580?28:16))return;this.last=now;
  this.resize();const ctx=this.ctx,w=this.w,h=this.h;
  ctx.clearRect(0,0,w,h);
  const light=document.documentElement.dataset.theme==='light';
  const base=light?[27,83,83]:[158,225,214];
  const glow=light?[181,75,48]:[253,125,88];
  const age=now-this.morphStart,shattering=this.outgoing&&now<this.burstUntil;
  const settling=age<1250;
  const pointer=this.pointer,reach=Math.min(125,w*.24),t=now*.001;
  for(const p of this.pts){
   const dx=pointer?p.x-pointer.x:0,dy=pointer?p.y-pointer.y:0;
   const d=pointer?Math.hypot(dx,dy)||1:1;
   const hit=pointer?Math.max(0,1-d/reach):0;
   if(shattering){p.vx+=(p.x-w/2)*.0007;p.vy+=(p.y-h/2)*.0007;
     p.vx*=.94;p.vy*=.94;
   }else{
     p.vx+=(p.tx-p.x)*(settling?.034:.052)+dx/d*hit*hit*2.5;
     p.vy+=(p.ty-p.y)*(settling?.034:.052)+dy/d*hit*hit*2.5;
     p.vx*=settling?.84:.78;p.vy*=settling?.84:.78;
   }
   p.x+=p.vx;p.y+=p.vy;
   const speed=Math.hypot(p.vx,p.vy),hi=hit>.22||speed>3.2;
   const rgb=hi?glow:base;
   const opacity=clamp((shattering?.55:.68)+Math.sin(t*2+p.phase)*.13+hit*.19,.22,1);
   if(settling&&speed>1.9){
     ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*1.8,p.y-p.vy*1.8);
     ctx.lineWidth=.65;ctx.strokeStyle=`rgba(${glow.join(',')},${clamp(speed/35,.04,.23)})`;ctx.stroke();
   }
   ctx.beginPath();ctx.arc(p.x,p.y,p.radius+hit*.8,0,Math.PI*2);
   ctx.fillStyle=`rgba(${rgb.join(',')},${opacity})`;ctx.fill();
  }
 }
 destroy(){this.canvas.remove();this.host.classList.remove('formation-host','formation-ready');}
}
let started=false,raf=0;
function reconcile(){
 for(const [host,f] of fields)if(!host.isConnected){f.destroy();fields.delete(host)}
 const all=[...document.querySelectorAll('#archiveTrack .archive-card'),...document.querySelectorAll('#projectsTrack .cinema-panel')];
 for(const slide of all){
  const type=slide.classList.contains('archive-card')?'competition':'project';
  const host=slide.querySelector(type==='competition'?'.archive-card-visual':'.panel-art');
  if(!host||fields.has(host))continue;
  const idx=type==='project'?[...slide.parentElement.children].indexOf(slide):0;
  const id=type==='competition'?'competition-'+slide.dataset.id:'project-'+idx;
  fields.set(host,new Cloud(host,id,slide,type));
 }
}
function onReveal(outgoing,incoming){
 reconcile();
 const oldHost=outgoing?.querySelector('.archive-card-visual,.panel-art');
 const newHost=incoming?.querySelector('.archive-card-visual,.panel-art');
 if(oldHost)fields.get(oldHost)?.burst(true);
 if(newHost)fields.get(newHost)?.assemble();
}
function frame(now){raf=requestAnimationFrame(frame);for(const f of fields.values())f.frame(now)}
function init(){if(started)return;started=true;reconcile();
 addEventListener('resize',()=>{for(const f of fields.values())f.resize()},{passive:true});
 raf=requestAnimationFrame(frame);
}
window.KuriseFlowPoints={init,attachToCurrent:reconcile,reconcile,transition:onReveal,
 debug:()=>({clouds:fields.size,competition:[...fields.values()].filter(x=>x.type==='competition').length,projects:[...fields.values()].filter(x=>x.type==='project').length,visible:[...fields.values()].filter(x=>x.active()).map(x=>x.id)})};
})();
