/* V86: instruments first, then the title card; the score closes into book No. 01 and
   books No. 02 and No. 03 fly in from the right. One shared backdrop, no screen strip. */
(()=>{
'use strict';
const root=document.documentElement,section=document.querySelector('.director-section'),stage=section.querySelector('.director-stage');
const world=stage.querySelector('.quartet-world'),layout=world.querySelector('.orchestra-layout');
const introCopy=stage.querySelector('.quartet-intro-copy'),introFooter=stage.querySelector('.quartet-intro-footer');
const scenes=[...section.querySelectorAll('.director-scene')],copies=scenes.map(s=>s.querySelector('.director-copy'));
const books=scenes.map(s=>s.querySelector('.director-book'));
const cover1=books[0].querySelector('.book-cover'),endpaper=books[0].querySelector('.endpaper');
const sheet=books[0].querySelector('.score-sheet'),opening=sheet.querySelector('.sheet-opening-score');
const pricing=document.querySelector('.pricing-section'),footer=document.querySelector('.finale');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const span=(u,a,b)=>ease((u-a)/(b-a));
/* Timeline in viewport heights of scroll inside the section (u). */
const TL={enter:[-.45,.6],perform:[.45,.75],titleIn:[.55,.85],titleOut:[1.55,1.8],score:[1.45,2.3],open:[2.05,2.35],close:[2.35,2.9],copy1:[2.8,3.05],book2:[3.5,4.2],book3:[4.8,5.5]};
const PACE=6.1/3.8;
const STOPS=[2.98,4.28,5.58],FOLLOW=3.05;
let top=0,range=1,vh=innerHeight,width=0,height=0,current=0,target=0,raf=0,last=0,paused=false,reduced=false,motionReady=false;
let baseScale=1,artOffsetX=0,artOffsetY=0,offsetX=0,offsetY=0,geo={w:600,h:400,cy:400,spread:.8,copyTop:105};
const playing=[false,false,false];
// Whole glyphs and phrases ink in together while the score is on the stand.
const notationTracks=[];
[...sheet.querySelectorAll('.sheet-note'),...sheet.querySelectorAll('.sheet-phrase')].forEach(node=>{
 const wrapper=document.createElementNS('http://www.w3.org/2000/svg','g');node.before(wrapper);wrapper.append(node);
 const a=wrapper.animate([{opacity:.14},{opacity:1}],{duration:1450,delay:Number(node.dataset.inkDelay||0),iterations:1,fill:'both',easing:'cubic-bezier(.33,0,.2,1)'});
 a.pause();a.currentTime=0;notationTracks.push(a);
});
let inkRunning=null,inkState="";
function setNotation(run){
 const state=[run,paused,reduced,document.hidden].join();if(state===inkState)return;inkState=state;inkRunning=run;
 for(const a of notationTracks){const end=a.effect.getComputedTiming().endTime;
  if(reduced){a.pause();a.currentTime=end;}else if(a.currentTime>=end)continue;else if(run&&!paused&&!document.hidden)a.play();else a.pause();}
}
function measure(){
 vh=stage.clientHeight||innerHeight;width=stage.clientWidth;height=vh;
 top=section.getBoundingClientRect().top+scrollY;range=Math.max(1,section.offsetHeight-stage.offsetHeight);
 const mobile=width<=800,portrait=innerWidth<=800&&innerHeight>480;
 window.TaanOrchestra?.resize(world.clientWidth,world.clientHeight);
 const artRect=layout.getBoundingClientRect(),worldRect=world.getBoundingClientRect();
 baseScale=Math.min(artRect.width/1440,artRect.height/900);
 artOffsetX=artRect.left-worldRect.left+(artRect.width-1440*baseScale)/2;
 artOffsetY=artRect.top-worldRect.top+(artRect.height-900*baseScale)/2;
 offsetX=world.offsetLeft+artOffsetX;offsetY=world.offsetTop+artOffsetY;
 const fallback=world.querySelector('.orchestra-fallback');
 Object.assign(fallback.style,{left:`${artOffsetX}px`,top:`${artOffsetY}px`,width:`${1440*baseScale}px`,height:`${900*baseScale}px`});
 const aspect=portrait?1.095:510/760;
 const copyTop=height<480?78:mobile?96:100;
 const availTop=copyTop+(height<480?58:mobile?92:78),availBottom=height-(mobile?26:34),avail=Math.max(120,availBottom-availTop);
 const w=Math.min(width*(portrait?.86:mobile?.6:.62),avail/aspect,980),h=w*aspect;
 geo={w,h,cy:availTop+avail/2,spread:Math.min(1,width*.86/(2*w)),copyTop,portrait};
 stage.style.setProperty('--book-w',`${w}px`);stage.style.setProperty('--book-h',`${h}px`);
 stage.style.setProperty('--director-copy-top',`${copyTop}px`);
 window.TaanDirectorStops?.measure(STOPS.map(x=>top+x*vh/PACE));
 onScroll(true);
}
function place(book,cx,cy,k,extra=''){book.style.transform=`translate3d(${(cx-geo.w/2).toFixed(2)}px,${(cy-geo.h/2).toFixed(2)}px,0) scale(${k.toFixed(4)})${extra}`;}
function onScreen(cx,cy,k,leftExtra=0){
 const st=stage.getBoundingClientRect().top,hw=geo.w*k/2,hh=geo.h*k/2;
 return cx+hw>0&&cx-hw-leftExtra<innerWidth&&st+cy+hh>0&&st+cy-hh<innerHeight;
}
function draw(){
 const u=current;
 const visible=scrollY+innerHeight>top&&scrollY<top+section.offsetHeight-10;
 const still=reduced;
 const entrance=still?1:clamp((u-TL.enter[0])/(TL.enter[1]-TL.enter[0])),performance=still?0:span(u,...TL.perform);
 const sp=clamp((u-TL.score[0])/(TL.score[1]-TL.score[0])),sheetReveal=ease(sp/.1),approach=ease((sp-.08)/.92);
 const mobile=width<=800,dolly=clamp((u-2.9)/3.2);
 const assembled=mix(1,mobile?1.08:1.10,ease(entrance));
 const s=mix(assembled,mobile?1.24:1.50,approach)+(mobile?.04:.06)*dolly;
 const tx=720*(1-s),ty=450*(1-s)+(mobile?45:15)*(1-approach)-(mobile?18:46)*approach;
 window.TaanOrchestra?.update({entrance,performance,sheetReveal,approach,s:still?1:s,tx:still?0:tx,ty:still?0:ty,baseScale,offsetX:artOffsetX,offsetY:artOffsetY,visible,paused,reduced});
 const featureFade=span(u,2.1,2.6);
 world.style.setProperty('--orchestra-reading-alpha',1-.86*featureFade);
 world.style.setProperty('--orchestra-fallback-opacity',still?1:ease(entrance));
 world.style.setProperty('--orchestra-fallback-scale',still?1:s);
 world.style.setProperty('--orchestra-fallback-y',`${still?0:(ty-450*(1-s))*baseScale}px`);
 world.style.opacity=still?1:1-.12*ease((sp-.56)/.44);world.style.visibility='visible';world.style.overflow=still?'hidden':'visible';
 // The title waits for the ensemble, then sits on its own solid card.
 const title=still?1:(u>=TL.titleIn[0]&&u<TL.titleOut[1]?1:0);
 introCopy.style.opacity=title;introCopy.style.transform=`translate3d(0,${(1-span(u,...TL.titleIn))*16-span(u,...TL.titleOut)*12}px,0)`;
 introFooter.style.opacity=title;introFooter.inert=still||title<.1;
 if(still){books.forEach(b=>{b.style.transform='';b.style.opacity='';b.style.visibility='';});cover1.style.transform='';endpaper.style.opacity='';copies.forEach(c=>c.style.opacity=1);
  scenes.forEach(sc=>{sc.setAttribute('aria-hidden','false');sc.inert=false;});setNotation(false);playback([visible,visible,visible]);return;}
 const W=geo.w;
 // Book No. 01: the score leaves the stand, opens beside its cover, then closes.
 const standX=(720*s+tx)*baseScale+offsetX,standY=(550*s+ty)*baseScale+offsetY;
 const k0=190*s*baseScale/W;
 const open=span(u,...TL.open),close=span(u,...TL.close),t2=span(u,...TL.book2),t3=span(u,...TL.book3);
 let k=mix(mix(k0,geo.spread,approach),1,close);
 let cx=mix(standX,width/2,approach)+W*k*.5*open*(1-close),cy=mix(standY,geo.cy,approach);
 cover1.style.transform=`translateZ(1px) rotateY(${(-180*(1-close)).toFixed(2)}deg)`;
 endpaper.style.opacity=open;books[0].style.setProperty('--edge',Math.max(open,close));books[0].style.setProperty('--binding-open',open*(1-close));
 sheet.style.opacity=1;opening.style.opacity=.68;
 const exit=t=>({dx:-(width/2+W*.8)*t,k:1-.14*t,r:-6*t});
 const e1=exit(t2);
 place(books[0],cx+e1.dx,cy,k*e1.k,` rotate(${e1.r}deg)`);
 const o1=ease((sp-.05)/.2);books[0].style.opacity=o1;books[0].style.visibility=o1>0&&t2<1?'visible':'hidden';
 const vis=[o1>0&&t2<1&&visible&&onScreen(cx+e1.dx,cy,k*e1.k,W*k*(1-close))];
 // Books No. 02 and No. 03 arrive from the right; the previous book leaves to the left.
 [[books[1],t2,t3],[books[2],t3,0]].forEach(([b,tin,tout],n)=>{
  const ex=exit(tout),bx=mix(width+W*.75,width/2,tin)+ex.dx,by=geo.cy-Math.sin(Math.PI*tin)*geo.h*.08;
  const rot=7*(1-tin)+ex.r,tilt=-22*(1-tin);
  place(b,bx,by,(.92+.08*tin)*ex.k,` perspective(1800px) rotateY(${tilt.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg)`);
  const on=tin>0&&tout<1;b.style.opacity=1;b.style.visibility=on?'visible':'hidden';
  vis.push(on&&visible&&onScreen(bx,by,ex.k));
 });
 // Titles hand over one at a time: never two readable titles together.
 const journey=t2+t3,copy1=span(u,...TL.copy1);
 copies.forEach((c,i)=>{const f=clamp(1-Math.abs(i-journey));c.style.opacity=ease((f-.5)/.5)*(i===0?copy1:1);});
 const idx=journey<.5?0:journey<1.5?1:2;
 scenes.forEach((sc,i)=>{const on=i===idx&&u>2.7;sc.classList.toggle('is-active',i===idx);sc.setAttribute('aria-hidden',String(!on));sc.inert=!on;});
 setNotation(visible&&sp>.02&&close<1);
 playback(vis);
 const pTop=pricing.getBoundingClientRect().top+scrollY,fTop=footer.getBoundingClientRect().top+scrollY;
 root.classList.toggle('on-pricing-section',scrollY+70>pTop&&scrollY+70<fTop);root.classList.toggle('on-final-section',scrollY+90>fTop);
 window.TaanDirectorStops?.update({position:journey,velocity:target-current,reveal:close,index:idx,paused,reduced,visible});
 stage.dataset.bookPhase=u<.55?'orchestra':u<1.8?'heading':u<2.9?'closing-score':'covers';
 window.__taanDirector={u,entrance,title,approach,open,close,journey,playing:playing.slice(),visible};
}
// Every book animates whenever any part of it is on screen; it never pauses for the next point.
function playback(vis){vis.forEach((v,i)=>{const rect=books[i].getBoundingClientRect(),sr=stage.getBoundingClientRect();const on=!!v&&rect.right>0&&rect.left<innerWidth&&rect.bottom>Math.max(0,sr.top)&&rect.top<Math.min(innerHeight,sr.bottom)&&!paused&&!reduced;books[i].dataset.onScreen=String(on);if(on!==playing[i]||reduced){window.TaanPointArt?.director(i,reduced?true:on,paused,reduced,on&&!playing[i]);playing[i]=on;}});}
function tick(t){
 raf=0;const dt=Math.min(48,t-(last||t-16));last=t;
 current=reduced||paused?target:current+(target-current)*(1-Math.exp(-dt/130));
 if(Math.abs(target-current)<.0004)current=target;
 draw();if(current!==target&&!document.hidden)raf=requestAnimationFrame(tick);else last=0;
}
function onScroll(force){target=clamp((scrollY-top)/vh*PACE,-1.5,range/vh*PACE+.5);if(force===true&&!raf){draw();}if(!raf)raf=requestAnimationFrame(tick);}
section.querySelector('[data-director-enter]').addEventListener('click',()=>{measure();window.TaanDirectorStops?.release();scrollTo({top:top+FOLLOW*vh/PACE,behavior:reduced||paused?'instant':'smooth'});});
function syncMotion(){const p=root.matches('.motion-paused,.dialog-open,.printing'),r=root.classList.contains('reduced-motion');if(motionReady&&p===paused&&r===reduced)return;paused=p;reduced=r;motionReady=true;playing.fill(null);measure();}
new MutationObserver(syncMotion).observe(root,{attributes:true,attributeFilter:['class']});
addEventListener('scroll',()=>onScroll(),{passive:true});let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(measure,120);});
document.addEventListener('visibilitychange',()=>{playing.fill(null);setNotation(inkRunning);if(!document.hidden)onScroll(true);});
addEventListener('load',measure,{once:true});document.fonts?.ready.then(measure);syncMotion();
window.TaanQuartet={measure};
})();
