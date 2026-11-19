const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/loader-script.js','utf8');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function test(label,protocol,delay=45,opts={}){
 const start=performance.now(), values=[],nav=[],states=new Set(),nodes={};
 let lockAt=0;
 for(const id of ['scene','digits','signalStatus','elapsedStatus','resourceStatus','progressFill','systemStatus','worldlineStatus','skip']){
  nodes[id]={style:{},value:'',disabled:false,classList:{add(cls){states.add(cls);if(cls==='is-locked')lockAt=performance.now()-start}},addEventListener(){},set textContent(v){this.value=v;if(id==='digits')values.push({ms:performance.now()-start,value:v})},get textContent(){return this.value}};
 }
 const doc={getElementById:id=>nodes[id],addEventListener(){},createElement:tag=>{
  const events={};return {addEventListener:(name,fn)=>events[name]=fn,removeAttribute(){},load(){setTimeout(()=>events.loadeddata?.(),60)}};
 }};
 class ImageMock {set src(url){setTimeout(()=>this.onload?.(),45)}get complete(){return false}}
 const stored={};
 const ctx={window:{},document:doc,Image:ImageMock,URLSearchParams,performance,Math,Date,Promise,setTimeout,clearTimeout,setInterval,clearInterval,
  location:{search:'?dest=index',protocol,replace:url=>nav.push(url)},matchMedia:()=>({matches:!!opts.reduce}),
  sessionStorage:{setItem(k,v){stored[k]=v}},
  fetch:async url=>{await sleep(url.includes('router.js')?delay:40);if(opts.fail&&url.includes('router.js'))throw Error('failed');return {ok:true,arrayBuffer:async()=>new ArrayBuffer(12)}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 await sleep(245);assert(!states.has('is-locked'),'premature lock before 300ms');
 await sleep(175);if(delay>420&&protocol==='http:')assert(!states.has('is-locked'),'locked before delayed dependency');
 await sleep(Math.max(0,delay-360)+330);
 assert(states.has('is-locked'),'must eventually lock');
 assert(lockAt>=295,`too early: ${lockAt}`);
 assert(values.length>=8,'expected visible scrambling');
 assert(new Set(values.map(v=>v.value)).size>=8);
 const final=nodes.digits.value;
 assert.match(final,/^-?\d\.\d{6}$/);
 assert(Number(final)>=-1&&Number(final)<7);
 await sleep(opts.reduce?480:960);
 assert(nav[0]?.includes('index.html?entered=1#index'),'did not redirect');
 assert.equal(stored['kurise-last-worldline'],final);
 assert(stored['kurise-last-worldline-field']);
 console.log(JSON.stringify({label,lockMs:Math.round(lockAt),uniqueValues:new Set(values.map(v=>v.value)).size,final,category:stored['kurise-last-worldline-field']}));
}
(async()=>{
 await test('fast-cache','http:',45);
 await test('slow-router','http:',720);
 await test('file-protocol','file:',45);
 await test('reduced-motion','http:',50,{reduce:true});
 await test('resource-rejection','http:',50,{fail:true});
})().catch(e=>{console.error(e);process.exitCode=1});
