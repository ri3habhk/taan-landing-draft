/* One second of reading time at each director point, never a page-wide scroll lock. */
(()=>{'use strict';
const root=document.documentElement,section=document.querySelector('.director-section');
let points=[],start=0,end=0,hold=null,releaseTimer=0,failsafe=0,touchY=null,served=new Set();
const disabled=()=>document.hidden||root.matches('.reduced-motion,.printing,.dialog-open,.motion-paused');
const editable=e=>e.target instanceof Element&&!!e.target.closest('input,textarea,select,[contenteditable="true"],dialog');
function release(){clearTimeout(releaseTimer);clearTimeout(failsafe);hold=null;delete section.dataset.directorHold;}
function measure(list){release();start=section.getBoundingClientRect().top+scrollY;end=start+section.offsetHeight;points=list;}
function begin(index,dir){hold={index,dir,y:points[index],phase:'settling'};served.add(index+':'+dir);section.dataset.directorHold='settling-'+(index+1);scrollTo({top:hold.y,behavior:'instant'});failsafe=setTimeout(release,2800);}
function gate(delta,event){
 if(disabled()||editable(event)||event.ctrlKey||event.metaKey||!delta)return false;
 if(hold){event.preventDefault();return true;}
 if(scrollY+innerHeight<start||scrollY>end){served.clear();return false;}
 const dir=Math.sign(delta),to=scrollY+delta;
 const hits=points.map((y,i)=>({y,i})).filter(p=>!served.has(p.i+':'+dir)&&(dir>0?p.y>scrollY+.5&&p.y<=to:p.y<scrollY-.5&&p.y>=to)).sort((a,b)=>dir*(a.y-b.y));
 if(!hits.length)return false;
 event.preventDefault();begin(hits[0].i,dir);return true;
}
addEventListener('wheel',e=>gate(e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),e),{passive:false});
addEventListener('touchstart',e=>{touchY=e.touches.length===1?e.touches[0].clientY:null;},{passive:true});
addEventListener('touchmove',e=>{if(touchY===null||e.touches.length!==1)return;const y=e.touches[0].clientY,d=touchY-y;touchY=y;gate(d,e);},{passive:false});
addEventListener('touchend',()=>{touchY=null;},{passive:true});
addEventListener('keydown',e=>{
 if(e.key==='Escape'||e.key==='Home'||e.key==='End'){release();return;}
 if(editable(e)||e.altKey||e.metaKey||e.ctrlKey||e.target instanceof Element&&e.target.closest('button,a'))return;
 const d=e.key==='ArrowDown'?45:e.key==='ArrowUp'?-45:e.key==='PageDown'?innerHeight*.9:e.key==='PageUp'?-innerHeight*.9:e.key===' '?innerHeight*.9*(e.shiftKey?-1:1):0;
 if(d)gate(d,e);
});
addEventListener('click',e=>{if(e.target instanceof Element&&e.target.closest('a,button'))release();},{capture:true});
addEventListener('scroll',()=>{if(hold&&Math.abs(scrollY-hold.y)>3)release();if(scrollY+innerHeight<start||scrollY>end)served.clear();},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
function update({velocity,reveal,paused,reduced,visible}){
 if(disabled()||paused||reduced||!visible){if(hold)release();return;}
 if(!hold||hold.phase!=='settling')return;
 if(Math.abs(velocity)<.01&&reveal>.99){hold.phase='reading';section.dataset.directorHold='reading-'+(hold.index+1);clearTimeout(failsafe);releaseTimer=setTimeout(release,1000);}
}
window.TaanDirectorStops={measure,update,release};
})();
