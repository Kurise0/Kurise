/* Original content and styles are retained from the November 18 Kurise homepage.
 * Global API is used instead of ES imports so the site also works from file://. */
(function(){ 'use strict';
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
const reduced = new URLSearchParams(location.search).get('motion') === 'reduce';
let lang = 'zh';
let medalFilter = 'all';
let currentSlide = 0;
let isWiping = false;

const text = {
 zh: {
  headerMeta:'独立研究 / 机器学习系统',navHome:'首页',navAbout:'关于',navCompetition:'竞赛',navResearch:'研究',navProjects:'项目',navContact:'联系',
  heroStatus:'欢迎交流与合作',heroEyebrow:'机器学习 · 智能系统 · 工程探索',heroDesc:'围绕机器学习与智能系统，不断提出问题、进行实验，并让想法在真实世界中运行。',explore:'探索实验档案',scrollPrompt:'向下滚动，查看下一章节',
  aboutCap:'关于 · 操作员档案',aboutTag:'一份关于探索的说明',aboutTitle1:'好奇心，',aboutTitle2:'驱动实验。',aboutLead:'你好，我是 <strong>Kurise</strong>。我喜欢把复杂的问题拆解成可验证的假设，从数据和模型出发，再走向能够真正运行的系统。',aboutSecondary:'机器学习、计算机视觉、自然语言处理、生物声学与智能体，是我不断探索的领域。Kaggle 是我的开放实验室，工程实践则是检验想法的另一条路径。',aboutIdentity:'机器学习探索者',goldMedal:'金牌',silverMedal:'银牌',bronzeMedal:'铜牌',highestRank:'历史最高全球排名',aboutFootnote:'这里只记录公开竞赛成果、研究兴趣与项目探索。',
  competitionCap:'竞赛档案',competitionTitle1:'真实问题。',competitionTitle2:'不止分数。',competitionIntro:'我通过竞赛来验证假设、学习新技术，并让想法在真实世界中运行。',allFilter:'全部',goldFilter:'金牌',silverFilter:'银牌',bronzeFilter:'铜牌',viewKaggle:'查看 Kaggle 主页',
  researchCap:'研究兴趣',researchTitle1:'持续提出',researchTitle2:'更好的问题。',researchIntro:'我更在意一个方法为什么有效、它在复杂条件下是否稳健，以及能不能以更低成本真正落地。',researchItem1:'低照度视觉与图像增强',researchDesc1:'探索弱光环境下的视觉信息恢复，在图像质量、模型效率和实际部署之间寻找平衡。',researchItem2:'轻量化学习与高效推理',researchDesc2:'关注知识蒸馏、模型压缩与推理优化，让模型不仅能够被训练，也能够在现实硬件限制下运行。',researchItem3:'多模态理解与自主智能体',researchDesc3:'研究语言、视觉、声音与行动之间的联系，从信息理解走向工具使用和自动化工作流。',
  panelTitleA:'构想',panelTitleB:'→ 系统。',panelIntro:'我通过构建系统来验证假设，并让想法在真实世界中运行。',panelGithub:'访问 GitHub ↗',panelDeployed:'已部署 · 产品工程',panelFutureA:'下一次',panelFutureB:'实验。',panelFutureText:'探索不会在这里结束。新的问题、新的模型和新的系统，始终处于迭代之中。',panelConnect:'开始交流 ↗',
  projectsCap:'独立项目',projectsTitle1:'从想法，',projectsTitle2:'到可运行。',projectsIntro:'除了竞赛，我也喜欢构建完整的交互和服务，让技术变成可以被使用的系统。',projectLabel2:'全栈产品工程',projectText2:'一个实际部署的点餐服务项目，涉及用户交互、业务流程、订单库存与后端系统的完整协作。',
  contactCap:'连接与交流',contactOpen:'欢迎讨论有意思的问题',contactTitle1:'下一次',contactTitle2:'思想碰撞。',contactIntro:'欢迎聊聊机器学习、竞赛、研究想法，或者正在构建的有趣项目。',sendEmail:'发起一场对话',footerCaption:'好奇心永不离线。 · Everything is the choice of Steins;Gate.',
  taskLabel:'赛题 / 核心挑战',rank:'排名',teams:'支队伍',openChallenge:'前往官方 Kaggle 竞赛页',noResult:'暂无记录'
 },
 en: {
  headerMeta:'INDEPENDENT RESEARCH / ML SYSTEMS',navHome:'HOME',navAbout:'ABOUT',navCompetition:'ARCHIVE',navResearch:'LAB',navProjects:'SYSTEMS',navContact:'CONNECT',
  heroStatus:'OPEN TO IDEAS & COLLABORATION',heroEyebrow:'MACHINE LEARNING · SYSTEMS · EXPERIMENTS',heroDesc:'Turning questions into hypotheses, hypotheses into experiments, and experiments into systems that actually work.',explore:'EXPLORE THE ARCHIVE',scrollPrompt:'SCROLL TO THE NEXT CHAPTER',
  aboutCap:'ABOUT / OPERATOR PROFILE',aboutTag:'A NOTE ON EXPLORATION',aboutTitle1:'CURIOSITY.',aboutTitle2:'EXPERIMENTS.',aboutLead:'Hello, I’m <strong>Kurise</strong>. I enjoy breaking complicated problems into testable hypotheses—starting with data and models, and ending with systems that work beyond a notebook.',aboutSecondary:'I explore machine learning, computer vision, natural language processing, bioacoustics, and intelligent agents. Kaggle is my open laboratory; building software is another way to test ideas.',aboutIdentity:'Independent ML Builder',goldMedal:'Gold medals',silverMedal:'Silver medals',bronzeMedal:'Bronze medals',highestRank:'Peak global rank',aboutFootnote:'A public record of selected challenges, research interests, and projects.',
  competitionCap:'COMPETITION ARCHIVE',competitionTitle1:'REAL PROBLEMS.',competitionTitle2:'BEYOND SCORES.',competitionIntro:'I use competitions to test hypotheses, learn unfamiliar techniques, and turn ideas into working solutions.',allFilter:'ALL',goldFilter:'GOLD',silverFilter:'SILVER',bronzeFilter:'BRONZE',viewKaggle:'ALL RESULTS ON KAGGLE',
  researchCap:'RESEARCH DIRECTIONS',researchTitle1:'ASKING',researchTitle2:'BETTER QUESTIONS.',researchIntro:'I care about why a method works, whether it holds up in messy settings, and whether it can be made efficient enough for real hardware.',researchItem1:'Low-Light Vision & Enhancement',researchDesc1:'Exploring how to recover useful visual information in low light while balancing perceptual quality, model efficiency, and deployment.',researchItem2:'Efficient Learning & Inference',researchDesc2:'Interested in distillation, compression, and inference optimization—making models useful under practical resource constraints.',researchItem3:'Multimodal Understanding & Agents',researchDesc3:'Connecting language, vision, sound, and actions—from understanding signals to using tools in automated workflows.',
  panelTitleA:'IDEAS',panelTitleB:'→ SYSTEMS.',panelIntro:'Building systems is how I test ideas beyond the notebook, and learn what actually works.',panelGithub:'VIEW GITHUB ↗',panelDeployed:'DEPLOYED / PRODUCT ENGINEERING',panelFutureA:'THE NEXT',panelFutureB:'EXPERIMENT.',panelFutureText:'The experiments do not end here. New problems, new models, and new systems are always in progress.',panelConnect:'GET IN TOUCH ↗',
  projectsCap:'INDEPENDENT PROJECTS',projectsTitle1:'FROM IDEAS',projectsTitle2:'TO SYSTEMS.',projectsIntro:'Beyond competitions, I like creating real, usable tools and services that turn machine learning and software ideas into working products.',projectLabel2:'FULL-STACK ENGINEERING',projectText2:'A deployed ordering service bringing together a user interface, business logic, order and inventory flows, and backend infrastructure.',
  contactCap:'CONNECT',contactOpen:'OPEN TO INTERESTING CONVERSATIONS',contactTitle1:'THE NEXT',contactTitle2:'COLLISION.',contactIntro:'Let’s talk about machine learning, competitions, experimental ideas, or something interesting you’re building.',sendEmail:'START A CONVERSATION',footerCaption:'CURIOSITY STAYS ONLINE. · Everything is the choice of Steins;Gate.',
  taskLabel:'THE CHALLENGE',rank:'RANK',teams:'TEAMS',openChallenge:'OPEN OFFICIAL KAGGLE OVERVIEW',noResult:'NO RECORDS'
 }
};

// Descriptions are based on official Kaggle Overview pages, not private training methods.
const competitions = [
 {id:'imc',n:'01',title:'Image Matching Challenge 2025',short:'IMC / 3D VISION',category:'COMPUTER VISION',medal:'gold',year:'2025',rank:7,total:943,graphic:'matching',url:'https://www.kaggle.com/competitions/image-matching-challenge-2025/overview',zh:'从混杂的照片集合中判断哪些图像属于同一场景、哪些需要剔除，并恢复相机之间的几何关系，帮助重建可靠的三维场景。',en:'From a messy image collection, identify photos of the same scene, reject distractors, and recover camera geometry for reliable 3D reconstruction.'},
 {id:'jigsaw',n:'02',title:'Jigsaw · Agile Community Rules',short:'JIGSAW / NLP',category:'LANGUAGE & SAFETY',medal:'silver',year:'2025',rank:49,total:2445,graphic:'moderation',url:'https://www.kaggle.com/competitions/jigsaw-agile-community-rules/overview',zh:'面对不同社区各自制定的规则，判断一条评论是否违反给定规则，让自动化内容审核更贴近具体语境。',en:'Given a community’s own rules, determine whether a comment violates a specific rule—making automated moderation sensitive to context.'},
 {id:'birdclef',n:'03',title:'BirdCLEF+ 2026',short:'BIRDCLEF / AUDIO',category:'BIOACOUSTICS',medal:'silver',year:'2026',rank:161,total:4094,graphic:'sound',url:'https://www.kaggle.com/competitions/birdclef-2026/overview',zh:'从巴西潘塔纳尔湿地的野外录音中识别发声物种，包括鸟类、两栖类、哺乳类、爬行类和昆虫，为生物多样性监测提供帮助。',en:'Identify calling wildlife species—including birds, amphibians, mammals, reptiles, and insects—from Pantanal soundscape recordings to aid biodiversity monitoring.'},
 {id:'cmi',n:'04',title:'CMI · Detect Behavior with Sensor Data',short:'CMI / SENSORS',category:'MULTIMODAL TIME SERIES',medal:'silver',year:'2025',rank:100,total:2657,graphic:'sensor',url:'https://www.kaggle.com/competitions/cmi-detect-behavior-with-sensor-data/overview',zh:'结合腕戴设备的运动、温度与距离传感器数据，区分拔头发等身体聚焦重复行为与日常手势。',en:'Use wrist-worn motion, temperature, and proximity sensors to distinguish body-focused repetitive behaviors from ordinary gestures.'},
 {id:'rsna',n:'05',title:'RSNA · Intracranial Aneurysm Detection',short:'RSNA / MEDICAL IMAGING',category:'MEDICAL AI',medal:'silver',year:'2025',rank:37,total:1147,graphic:'medical',url:'https://www.kaggle.com/competitions/rsna-intracranial-aneurysm-detection/overview',zh:'在 CTA、MRA 与 MRI 等医学影像中检测并定位颅内动脉瘤，帮助推进更可靠的医学影像辅助筛查。',en:'Detect and precisely locate intracranial aneurysms across CTA, MRA, and MRI scans to support more reliable image-based screening.'},
 {id:'arc',n:'06',title:'ARC Prize 2025',short:'ARC / ABSTRACT REASONING',category:'ABSTRACT REASONING',medal:'bronze',year:'2025',rank:82,total:1455,graphic:'abstract',url:'https://www.kaggle.com/competitions/arc-prize-2025/overview',zh:'从少量彩色网格示例中推断隐藏的抽象规则，再把规则应用到未见过的网格任务，衡量 AI 面对新问题时的推理泛化能力。',en:'Infer abstract transformation rules from a few colored-grid examples and apply them to unseen tasks—a test of generalization to novel problems.'},
 {id:'map',n:'07',title:'MAP · Math Misunderstandings',short:'MAP / EDUCATION',category:'NATURAL LANGUAGE',medal:'bronze',year:'2025',rank:95,total:1857,graphic:'math',url:'https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings/overview',zh:'根据学生对数学题的文字解释，预测其背后可能存在的概念性误解，为诊断式教学和有针对性的反馈提供线索。',en:'Predict likely mathematical misconceptions from students’ written explanations, supporting diagnostic education and more targeted feedback.'},
 {id:'orbit',n:'08',title:'Orbit Wars',short:'ORBIT / AGENTS',category:'STRATEGIC AGENTS',medal:'bronze',year:'2026',rank:371,total:4729,graphic:'orbit',url:'https://www.kaggle.com/competitions/orbit-wars/overview',zh:'为动态行星与舰队构成的策略游戏构建自主智能体，在有限回合内制定扩张、防御与对抗决策，并与其他智能体对战。',en:'Build autonomous agents for a strategy game with orbiting planets and moving fleets; compete through expansion, defense, and tactical decisions.'}
];
const esc = (v) => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const graphicSVG = (type) => {
 const head='<svg viewBox="0 0 540 275" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">';
 const tail='</svg>';
 const c='#ff6945',w='#c7d9cc',dim='#728c7b';
 const line=(x1,y1,x2,y2,col=dim)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${col}" stroke-width="1.5"/>`;
 const circle=(x,y,r,stroke=c,fill='none')=>`<circle cx="${x}" cy="${y}" r="${r}" stroke="${stroke}" fill="${fill}" stroke-width="2"/>`;
 if(type==='matching'){
  const pts=[[60,66],[136,120],[94,197],[226,50],[276,124],[210,224],[350,64],[424,115],[376,225],[476,198]];
  let s=pts.map(([x,y],i)=>pts.slice(i+1).map(([xx,yy],j)=> ((i+j)%3===0?line(x,y,xx,yy,dim):'')).join('')).join('');
  s+=pts.map(([x,y],i)=>circle(x,y,i%3===0?7:4,i%3===0?c:w,i%3===0?c:'none')).join('');
  s+='<path d="M220 100L306 100L306 187L220 187Z" stroke="'+c+'" stroke-width="2" stroke-dasharray="6 5"/><text x="32" y="245" fill="'+w+'" font-size="13" font-family="monospace">SCENE ASSOCIATION / SfM</text>';
  return head+s+tail;
 }
 if(type==='moderation'){
  return head+`<path d="M78 59H462V214H78Z" stroke="${dim}" stroke-width="2"/><path d="M106 92H342M106 121H403M106 150H290" stroke="${w}" stroke-opacity=".8" stroke-width="8"/><path d="M346 150h83v30h-83z" fill="${c}"/><text x="353" y="170" fill="#131818" font-size="15" font-family="monospace" font-weight="bold">RULE</text><path d="M50 43h43M50 43v43M491 232h-43M491 232v-43" stroke="${c}" stroke-width="3"/>`+tail;
 }
 if(type==='sound'){
  let paths='';for(let k=0;k<3;k++){let s='';for(let x=24;x<=518;x+=4){let y=138+Math.sin(x*.033+k)*Math.sin(x*.007)* (44+k*12)+Math.cos(x*.103+k)*11;s+=(x===24?'M':'L')+x+' '+y.toFixed(1)+' ';}paths+=`<path d="${s}" stroke="${k===1?c:k===0?w:dim}" stroke-width="${k===1?3:1.5}" stroke-opacity="${k===1?1:.65}"/>`;}
  return head+paths+`<path d="M270 38v205" stroke="${w}" stroke-dasharray="4 7"/><circle cx="270" cy="138" r="8" fill="${c}"/>`+tail;
 }
 if(type==='sensor'){
  let s='';for(let k=0;k<3;k++){let p='';for(let x=20;x<520;x+=9){const y=74+k*67+Math.sin(x*.033+k*2)*19+Math.cos(x*.086+k)*9;p+=(x===20?'M':'L')+x+' '+y.toFixed(1)+' ';}s+=`<path d="${p}" stroke="${[c,w,dim][k]}" stroke-width="2.5"/>`;}
  return head+s+`<path d="M110 34v210M273 34v210M436 34v210" stroke="${dim}" stroke-dasharray="2 10"/><rect x="259" y="30" width="27" height="215" stroke="${c}" stroke-opacity=".5"/>`+tail;
 }
 if(type==='medical'){
  return head+`<circle cx="270" cy="135" r="112" stroke="${dim}"/><circle cx="270" cy="135" r="83" stroke="${dim}" stroke-dasharray="3 8"/><path d="M250 238C260 185 239 143 259 112C278 89 317 85 320 47M260 138C205 122 171 85 178 39M262 157C328 172 351 192 368 244M261 155C211 181 207 204 194 228M262 139C319 132 374 112 408 83" stroke="${w}" stroke-width="12" stroke-linecap="round" opacity=".75"/><circle cx="321" cy="88" r="20" fill="${c}" fill-opacity=".3" stroke="${c}" stroke-width="3"/><path d="M321 49v78M283 88h78" stroke="${c}" stroke-width="2"/>`+tail;
 }
 if(type==='abstract'){
  let s='';const colors=[c,w,dim,'#a7a0aa'];for(let row=0;row<5;row++)for(let col=0;col<7;col++){const active=(row*7+col*3)%6<2; s+=`<rect x="${67+col*58}" y="${16+row*49}" width="44" height="36" ${active?`fill="${colors[(col+row)%4]}"`:`stroke="${dim}" stroke-opacity=".7"`} />`;}
  return head+s+`<path d="M236 123l18 16-18 16" stroke="${c}" stroke-width="6"/>`+tail;
 }
 if(type==='math'){
  return head+`<text x="50" y="180" fill="${w}" font-size="140" font-family="Georgia,serif">∑</text><path d="M192 90h276M192 137h220M192 182h256" stroke="${dim}" stroke-width="5"/><path d="M395 75l22 22-22 22" stroke="${c}" stroke-width="6"/><circle cx="456" cy="181" r="25" stroke="${c}" stroke-width="4"/><path d="M456 168v17M456 193v2" stroke="${c}" stroke-width="4"/>`+tail;
 }
 if(type==='orbit'){
  return head+circle(270,137,105,dim)+circle(270,137,66,w)+circle(270,137,25,c,c)+circle(270,32,10,c,c)+circle(335,137,11,w,w)+circle(200,212,8,c,c)+`<path d="M270 137L270 32M270 137L335 137M270 137L200 212" stroke="${w}" stroke-dasharray="6 6"/><path d="M422 55l45 35-44 12M64 214l39-37 42 42" stroke="${c}" stroke-width="4"/><path d="M270 1v22M270 242v25M130 137h27M380 137h27" stroke="${dim}"/>`+tail;
 }
 return head+tail;
};

// Each competition is a genuine 100vw screen. A spring, rather than scrollLeft,
// interpolates between slides; the router delegates wheel steps to this API.
const gallery={selected:0,position:0,velocity:0,lastTime:performance.now(),dragOffset:0,dragging:false,previousX:0};
function competitionItems(){return competitions.filter(c=>medalFilter==='all'||c.medal===medalFilter);}
function galleryUpdate(){
 const items=competitionItems(),max=Math.max(0,items.length-1);
 gallery.selected=Math.min(gallery.selected,max);
 const prev=$('#archivePrev'),next=$('#archiveNext');
 $('#archiveCount').textContent=`${String(gallery.selected+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
 $('#archiveProgress').style.width=(items.length<=1?100:(gallery.selected/(items.length-1))*100)+'%';
 prev.disabled=gallery.selected===0;next.disabled=gallery.selected===max;
 $$('#archiveTrack .archive-card').forEach((card,i)=>{
  const active=i===gallery.selected;
  card.classList.toggle('is-current',active);
  card.setAttribute('aria-hidden',String(!active));
  if('inert' in card)card.inert=!active;
 });
 window.KuriseFlowPoints?.attachToCurrent();
}
function competitionChoose(n,instant=false){
 const max=competitionItems().length-1;
 const next=Math.max(0,Math.min(max,n));
 if(gallery.selected===next&&!instant)return false;
 const previous=gallery.selected;
 const cards=[...document.querySelectorAll('#archiveTrack .archive-card')];
 gallery.selected=next;
 if(instant){gallery.position=next;gallery.velocity=0;}
 galleryUpdate();
 if(!instant&&previous!==next)window.KuriseSlideReveal?.start(document.getElementById('archiveViewport'),cards[previous],cards[next],next>previous);
 return true;
}
function renderCompetitions(preserveCurrent=false) {
 const items=competitionItems();
 const container=$('#archiveTrack');
 window.KuriseSlideReveal?.clear(document.getElementById('archiveViewport'));
 const currentId=preserveCurrent?container.querySelector('.archive-card.is-current')?.dataset.id:null;
 const selectedIndex=currentId?items.findIndex(item=>item.id===currentId):-1;
 container.innerHTML=items.map(c=>`<article class="archive-card" data-id="${c.id}" data-graphic="${c.graphic}">
   <div class="archive-card-top"><span class="archive-card-index">FIELD / ${c.n}</span><span>${c.short} • ${c.year}</span></div>
   <div class="archive-card-visual">${graphicSVG(c.graphic)}</div>
   <div class="archive-card-body"><div class="archive-meta"><i></i><span>${esc(c.category)}</span> / ${text[lang].taskLabel}</div><h3>${esc(c.title).replace(/(20\d{2})$/,'<span class="archive-title-year">$1</span>')}</h3>
   <p class="desc">${esc(c[lang])}</p><div class="archive-sole"><div class="rank-box"><strong>${String(c.rank).padStart(2,'0')}</strong><span><small>${text[lang].rank}</small>/ ${c.total.toLocaleString('en-US')} ${text[lang].teams}</span></div>
   <div class="medal-label ${c.medal}">✦ ${c.medal.toUpperCase()}</div><a class="kaggle-open magnetic" target="_blank" rel="noopener noreferrer" aria-label="${text[lang].openChallenge}: ${esc(c.title)}" title="${text[lang].openChallenge}" href="${c.url}">↗</a></div></div></article>`).join('');
 gallery.selected=Math.max(0,selectedIndex);
 gallery.position=gallery.selected;gallery.velocity=0;gallery.dragOffset=0;
 galleryUpdate();
 container.style.transform='none';
}
function setupGallery(){
 const viewport=$('#archiveViewport');
 const track=$('#archiveTrack');
 $('#archivePrev').addEventListener('click',()=>competitionChoose(gallery.selected-1));
 $('#archiveNext').addEventListener('click',()=>competitionChoose(gallery.selected+1));
 $$('#competitionFilters button').forEach(button=>button.addEventListener('click',()=>{
  medalFilter=button.dataset.filter;
  $$('#competitionFilters button').forEach(other=>{
   const yes=other===button;other.classList.toggle('is-active',yes);
   other.setAttribute('aria-pressed',String(yes));
  });
  renderCompetitions();
 }));
 viewport.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowDown'){
   event.preventDefault();event.stopPropagation();competitionChoose(gallery.selected+1);
  }else if(event.key==='ArrowLeft'||event.key==='ArrowUp'){
   event.preventDefault();event.stopPropagation();competitionChoose(gallery.selected-1);
  }
 });
 // Drag the current full-screen panel. Avoid turning links into drag handles.
 let pointer=null,suppressClick=false;
 viewport.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  if(e.target.closest('a,button'))return;
  pointer={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
  gallery.dragging=true;gallery.dragOffset=0;
 },{passive:true});
 viewport.addEventListener('pointermove',e=>{
  if(!pointer||pointer.id!==e.pointerId)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
  if(Math.abs(dx)<7&&!pointer.moved)return;
  if(Math.abs(dx)<Math.abs(dy)*1.1&&!pointer.moved)return;
  pointer.moved=true;gallery.dragOffset=dx;
 },{passive:true});
 function release(e){
  if(!pointer||pointer.id!==e.pointerId)return;
  if(pointer.moved){
   if(Math.abs(gallery.dragOffset)>55)competitionChoose(gallery.selected-Math.sign(gallery.dragOffset));
   suppressClick=true;setTimeout(()=>suppressClick=false,100);
  }
  pointer=null;gallery.dragging=false;gallery.dragOffset=0;
 }
 viewport.addEventListener('pointerup',release);
 viewport.addEventListener('pointercancel',release);
 viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
 viewport.addEventListener('dragstart',e=>e.preventDefault());
 // Horizontal reveal animation is owned by KuriseSlideReveal; no track scroll.

}
window.KuriseCompetition={
 step(direction){return competitionChoose(gallery.selected+Math.sign(direction));},
 canStep(direction){return direction>0?gallery.selected<competitionItems().length-1:gallery.selected>0;},
 select(index){return competitionChoose(index,true);},
 count(){return competitionItems().length;},
 current(){return gallery.selected;}
};

function setLanguage(next){lang=next;document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 $('#langCurrent').textContent=lang.toUpperCase();$('#langNext').textContent=lang==='zh'?'EN':'ZH';
 $$('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(text[lang][key]===undefined)return;if(key==='aboutLead')el.innerHTML=text[lang][key];else el.textContent=text[lang][key];});
 // Language changes preserve the exact current competition instead of jumping to 01.
 renderCompetitions(true);
 try{localStorage.setItem('kurise-site-lang',lang);}catch(error){}
}
function setupAccordions(){$$('#researchList .research-row').forEach(row=>row.querySelector('button').addEventListener('click',()=>{
 const already=row.classList.contains('is-open');
 $$('#researchList .research-row').forEach(other=>{other.classList.remove('is-open');other.querySelector('button').setAttribute('aria-expanded','false');});
 if(!already){row.classList.add('is-open');row.querySelector('button').setAttribute('aria-expanded','true');}
}));}


function setupCursor(){
 if(reduced||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 const el=$('.cursor-craft');
 let x=-100,y=-100,targetX=-100,targetY=-100,active=false;
 const update=()=>{x+=(targetX-x)*.17;y+=(targetY-y)*.17;el.style.transform=`translate3d(${x}px,${y}px,0)`;requestAnimationFrame(update);};
 requestAnimationFrame(update);
 document.addEventListener('pointermove',e=>{targetX=e.clientX;targetY=e.clientY;if(!active){active=true;el.classList.add('is-visible');}}, {passive:true});
 document.addEventListener('pointerdown',()=>el.classList.add('is-pressed'));
 document.addEventListener('pointerup',()=>el.classList.remove('is-pressed'));
 document.addEventListener('mouseout',e=>{if(!e.relatedTarget)el.classList.remove('is-visible');});
 // Event delegation keeps dynamically filtered cards magnetic as well.
 document.addEventListener('pointerover',e=>{if(e.target.closest('a,button'))el.classList.add('is-hover');});
 document.addEventListener('pointerout',e=>{if(e.target.closest('a,button'))el.classList.remove('is-hover');});
 document.addEventListener('pointermove',e=>{
  const link=e.target.closest('.magnetic');if(!link||link.closest('.archive-viewport'))return;
  const r=link.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const strength=link.classList.contains('hero-action')?.095:.12;
  link.style.transform=`translate3d(${(e.clientX-cx)*strength}px,${(e.clientY-cy)*strength}px,0)`;
 },{passive:true});
 document.addEventListener('pointerout',e=>{const link=e.target.closest('.magnetic');if(link && !link.contains(e.relatedTarget))link.style.transform='';});
 // Very small eased parallax instead of hijacking the native page scroll.
 const visual=$('#heroVisual');let px=0,py=0,tx=0,ty=0;
 window.addEventListener('pointermove',e=>{if(location.hash!=="#index")return;tx=(e.clientX/window.innerWidth-.5)*30;ty=(e.clientY/window.innerHeight-.5)*30;},{passive:true});
 const animate=()=>{px+=(tx-px)*.045;py+=(ty-py)*.045;if(visual)visual.style.translate=`${px}px ${py}px`;requestAnimationFrame(animate);};requestAnimationFrame(animate);
}

function init(){
 try { const saved=localStorage.getItem('kurise-site-lang'); if(saved==='en'||saved==='zh') lang=saved; } catch(e){}
 setLanguage(lang);
 $('#langToggle').addEventListener('click',()=>setLanguage(lang==='zh'?'en':'zh'));
 setupGallery(); setupAccordions(); setupCursor();
}
window.KuriseContent={init};
})();
