/* Shared reader: small content transitions, with ordinary URL and history semantics. */
(()=>{'use strict';
const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
let motion=null,epoch=0,selected=null;
const content=()=>document.getElementById('main-content')||document.querySelector('main');
function clear(){epoch++;motion?.cancel();motion=null;selected?.removeAttribute('data-nav-selected');selected=null;delete root.dataset.navTransition;}
function reveal(){const el=content();if(!el)return;motion?.cancel();root.dataset.navTransition='revealing';motion=el.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)'});motion.finished.then(clear,()=>{});}
document.addEventListener('click',async e=>{
 const a=e.target instanceof Element?e.target.closest('a[data-nav-tone]'):null;
 if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.hasAttribute('download')||(a.target&&a.target!=='_self')||reduce.matches)return;
 const dest=new URL(a.href,location.href),here=new URL(location.href);
 if(!['http:','https:','file:'].includes(dest.protocol)||dest.origin!==here.origin||dest.href===here.href)return;
 e.preventDefault();e.stopImmediatePropagation();clear();const ticket=epoch;
 selected=a;a.setAttribute('data-nav-selected','');
 const local=dest.pathname===here.pathname&&dest.search===here.search,el=content();
 root.dataset.navTransition=local?'switching':'departing';
 if(el){motion=el.animate([{opacity:1,transform:'translateY(0)'},{opacity:local?0:.45,transform:local?'translateY(-8px)':'none'}],{duration:local?150:190,easing:'ease-in',fill:'forwards'});try{await motion.finished;}catch(e){return;}}
 if(ticket!==epoch)return;
 if(local){location.hash=dest.hash;requestAnimationFrame(()=>requestAnimationFrame(reveal));}
 else{dest.searchParams.set('taan-enter',a.dataset.navTone==='yellow'?'home':'reader');if(a.dataset.navTone!=='yellow')dest.searchParams.set('reader-theme',root.dataset.readerTheme==='light'?'light':'dark');location.assign(dest.href);setTimeout(clear,6000);}
},{capture:true});
addEventListener('hashchange',()=>{if(root.dataset.navTransition==='switching'||reduce.matches||!document.getElementById('main-content'))return;requestAnimationFrame(reveal);});
addEventListener('keydown',e=>{if(e.key==='Escape')clear();});addEventListener('beforeprint',clear);addEventListener('pagehide',clear);addEventListener('pageshow',e=>{if(e.persisted)clear();});reduce.addEventListener('change',()=>{if(reduce.matches)clear();});
})();
