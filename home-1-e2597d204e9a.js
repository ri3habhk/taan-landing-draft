/* A single, aspect-correct waveform travels from the gold loader into the header. */
(()=>{'use strict';
const root=document.documentElement,url=new URL(location.href),arrival=url.searchParams.get('taan-enter');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),started=performance.now(),RATIO=860/633;
let seen=false;try{seen=sessionStorage.getItem('taan-entry-v95')==='seen';sessionStorage.setItem('taan-entry-v95','seen');}catch(e){}
if(arrival){url.searchParams.delete('taan-enter');try{history.replaceState(history.state,'',url.href);}catch(e){}}
root.style.backgroundColor='#f5c435';
if(seen||arrival||reduce.matches)return;
const layer=document.createElement('div');layer.id='taan-loading';layer.setAttribute('role','status');layer.setAttribute('aria-label','Loading Taan');layer.dataset.phase='waiting';
layer.innerHTML='<div class="load-backdrop"></div><div class="load-flight" aria-hidden="true"><div class="load-mark"><i class="load-shine"></i></div></div><span class="load-label">Finding your rhythm</span>';
root.append(layer);root.classList.add('loading-logo-handoff');root.dataset.loading='true';
const flight=layer.querySelector('.load-flight'),backdrop=layer.querySelector('.load-backdrop'),label=layer.querySelector('.load-label');
let target=null,body=null,wasInert=false,done=false,flying=false,token=0,flyAnimation=null,observer=null,deadline=0,lastDestination=null;
const timers=new Set(),animations=new Set();
function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);return id;}
function animate(el,frames,options){const a=el.animate(frames,options);animations.add(a);a.finished.catch(()=>{});return a;}
function finish(){
 if(done)return;done=true;token++;timers.forEach(clearTimeout);timers.clear();observer?.disconnect();
 animations.forEach(a=>a.cancel());animations.clear();
 root.classList.remove('loading-logo-handoff');delete root.dataset.loading;root.dataset.loadingComplete='true';
 if(body)body.inert=wasInert;layer.remove();
 removeEventListener('resize',retarget);removeEventListener('keydown',escape);removeEventListener('pagehide',finish);removeEventListener('beforeprint',finish);document.removeEventListener('visibilitychange',hidden);reduce.removeEventListener('change',motionChanged);
}
function destination(){
 if(!target||!target.isConnected)return null;const r=target.getBoundingClientRect();if(r.width<1||r.height<1)return null;
 // Fit the original PNG inside the header mask's box, without distorting its proportions.
 const width=Math.min(r.width,r.height*RATIO),height=width/RATIO;
 return {x:r.left+(r.width-width)/2,y:r.top+(r.height-height)/2,width,height};
}
function move(duration){
 const to=destination();if(!to){finish();return;}
 const from=flight.getBoundingClientRect(),ticket=++token;flyAnimation?.cancel();
 Object.assign(flight.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,maxWidth:'none',transform:'none'});
 const dx=to.x-from.left,dy=to.y-from.top,scale=to.width/from.width;
 lastDestination=to;
 flyAnimation=animate(flight,[{transform:'translate3d(0,0,0) scale(1)'},{transform:`translate3d(${dx}px,${dy}px,0) scale(${scale})`}],{duration,easing:'cubic-bezier(.65,0,.18,1)',fill:'forwards'});
 flyAnimation.finished.then(()=>{if(!done&&ticket===token)finish();},()=>{});
}
function retarget(){
 if(!flying||done)return;const next=destination();if(!next){finish();return;}
 if(lastDestination&&['x','y','width','height'].every(k=>Math.abs(next[k]-lastDestination[k])<.5))return;
 const remaining=Math.max(240,deadline-performance.now());deadline=performance.now()+remaining;move(remaining);
}
function begin(){
 if(done)return;if(reduce.matches||document.hidden){finish();return;}
 target=document.querySelector('.site-header .brand-wave-shape');if(!destination()){finish();return;}
 layer.style.setProperty('--loading-ink',getComputedStyle(target).backgroundColor);
 flying=true;layer.dataset.phase='flying';deadline=performance.now()+1250;
 animate(label,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:230,easing:'ease-out',fill:'forwards'});
 animate(backdrop,[{opacity:1},{opacity:0}],{duration:860,delay:140,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
 move(1250);
 if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(retarget);observer.observe(target);}
}
function ready(){
 if(done)return;body=document.body;if(body){wasInert=body.inert;body.inert=true;}
 // Let layout and the embedded font settle, without waiting for the entire 4K video to decode.
 Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(resolve=>later(resolve,500))]).then(()=>{
  if(done)return;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!done)later(begin,Math.max(0,900-(performance.now()-started)));}));
 });
}
function hidden(){if(document.hidden)finish();}function motionChanged(){if(reduce.matches)finish();}function escape(e){if(e.key==='Escape')finish();}
addEventListener('resize',retarget,{passive:true});addEventListener('keydown',escape);addEventListener('pagehide',finish);addEventListener('beforeprint',finish);document.addEventListener('visibilitychange',hidden);reduce.addEventListener('change',motionChanged);
later(finish,6500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
