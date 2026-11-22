/* One world and one scroll coordinate, shared by the guitar and orchestra. */
(()=>{'use strict';
const root=document.documentElement,world=document.querySelector('.journey-world'),clouds=[...world.querySelectorAll('.cloud-drift')],experience=document.querySelector('.experience'),stage=document.querySelector('.stage'),ending=document.querySelector('main');
let top=0,range=1,end=0,y=scrollY,target=y,raf=0,last=0;
const stopped=()=>document.hidden||root.matches('.motion-paused,.dialog-open,.printing,.reduced-motion');
function measure(){top=experience.getBoundingClientRect().top+scrollY;range=Math.max(1,experience.offsetHeight-stage.clientHeight);end=ending.getBoundingClientRect().bottom+scrollY;request();}
function draw(){const p=Math.max(0,(y-top)/range);clouds.forEach((c,i)=>c.style.transform=`translate3d(${-p*innerWidth*(i?.95:.40)}px,0,0)`);world.style.visibility=scrollY<end+innerHeight?'visible':'hidden';world.dataset.worldProgress=p.toFixed(5);}
function tick(t){raf=0;const dt=Math.min(48,t-(last||t-16));last=t;y+= (target-y)*(1-Math.exp(-dt/170));if(Math.abs(target-y)<.1)y=target;draw();if(y!==target&&!stopped()&&scrollY<end+innerHeight)raf=requestAnimationFrame(tick);else last=0;}
function request(){target=scrollY;if(stopped()){cancelAnimationFrame(raf);raf=0;last=0;draw();return;}if(!raf)raf=requestAnimationFrame(tick);}
addEventListener('scroll',request,{passive:true});addEventListener('resize',measure);addEventListener('load',measure,{once:true});document.addEventListener('visibilitychange',request);new MutationObserver(request).observe(root,{attributes:true,attributeFilter:['class']});measure();
})();
