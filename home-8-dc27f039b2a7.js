(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],root=document.documentElement;
for(const name of ['paper','charcoal','landscape','cloud-bank-v9'])if(TAAN_ART[name])root.style.setProperty('--'+name,`url("${TAAN_ART[name]}")`);
const experience=$('.experience'),stage=$('.stage'),hero=$('.hero-layer'),video=$('#hero-video'),guitar=$('.guitar-scene'),interior=$('.interior-scene'),chapterNav=$('.chapter-nav'),header=$('.site-header');
const media=matchMedia('(prefers-reduced-motion: reduce)');let reduced=media.matches,paused=false,mobile=innerWidth<=800;
let viewHeight=innerHeight,scrollRange=1,experienceTop=0,target=0,current=0,raf=0,lastTime=0,lastRendered=-1,forced=true,activeStep=0;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
const ramp=(p,a,b)=>ease((p-a)/(b-a)),fade=(p,a,b,c,d)=>ramp(p,a,b)*(1-ramp(p,c,d));
const scenes=[{el:$('[data-scene=intro]'),range:[.10,.15,.225,.268]},{el:$('[data-scene="1"]'),range:[.27,.294,.405,.433]},{el:$('[data-scene="2"]'),range:[.434,.46,.561,.595]},{el:$('[data-scene="3"]'),range:[.620,.650,.752,.785]},{el:$('[data-scene="4"]'),range:[.803,.84,.966,1]}];
scenes.forEach(s=>{s.clear=0;s.demo=s.el.querySelector('.product-demo');});
const chapters=$$('.chapter-nav a'),bars=chapters.map(a=>a.querySelector('.chapter-track i'));
const ranges=[[.27,.433],[.434,.586],[.637,.768],[.814,.980]];
// Native scrolling stays uninterrupted through every guitar chapter.
// Only the rendered camera is eased; wheel, touch and keyboard input remain native.

function measure(){mobile=innerWidth<=800;viewHeight=stage.clientHeight;experienceTop=experience.getBoundingClientRect().top+scrollY;scrollRange=experience.offsetHeight-viewHeight;
 $$('.scroll-anchor').forEach(a=>a.style.top=Number(a.dataset.progress)*scrollRange+'px');
 const copy=$('.hero-copy'),cta=$('.hero-actions'),prompt=$('.hero-prompt');
 copy.style.top=(viewHeight<480?82:Math.max(mobile?86:110,viewHeight*(mobile?.12:.13)))+'px';
 if(!mobile){
  // Figma desktop: copy y=130, actions y=334, prompt y=402.
  cta.style.top=(copy.offsetTop+204)+'px';
  prompt.style.top=(copy.offsetTop+272)+'px';
 }else{
  cta.style.top=(copy.offsetTop+copy.offsetHeight+(viewHeight<700?14:20))+'px';
  prompt.style.top=(copy.offsetTop+copy.offsetHeight+(viewHeight<700?14:20)+cta.offsetHeight+(viewHeight<700?16:24))+'px';
 }
 cta.style.minWidth='';cta.style.minHeight='';
 const intro=$('[data-scene=intro]');intro.style.top=(viewHeight/2-intro.offsetHeight/2)+'px';

 scenes.forEach(s=>{s.clear=s.el.offsetTop+s.el.offsetHeight+14;if(s.demo){const x=s.el.offsetLeft+s.demo.offsetLeft,w=s.demo.offsetWidth;s.entrySide=x+w/2<innerWidth/2?-1:1;s.entryTravel=55;s.demo.dataset.entrySide=s.entrySide<0?'left':'right';}});TaanGuitar.resize(innerWidth,viewHeight);forced=true;onScroll();}
function onScroll(){target=clamp((scrollY-experienceTop)/scrollRange);if(!raf)raf=requestAnimationFrame(tick);}
function tick(now){raf=0;const dt=Math.min(48,now-(lastTime||now-16));lastTime=now;
 current=reduced||paused?target:mix(current,target,1-Math.exp(-dt/170));if(Math.abs(current-target)<.000008)current=target;
 if(Math.abs(lastRendered-current)>.000003||forced){draw(current,now);lastRendered=current;forced=false;}
 if(current!==target&&!document.hidden)raf=requestAnimationFrame(tick);else lastTime=0;
}
function draw(p,now){
 if(reduced){hero.style.transform='none';hero.style.opacity=1;hero.style.visibility='visible';hero.inert=false;video.pause();guitar.style.opacity=0;interior.style.opacity=0;TaanBreeze.update(0,null,true);stage.classList.remove('inside-guitar');root.classList.remove('hero-offscreen');scenes.forEach(s=>{s.el.style.opacity=1;s.el.style.transform='none';s.el.setAttribute('aria-hidden','false');s.el.inert=false;if(s.demo)s.demo.style.transform='none';});for(let n=1;n<=4;n++)TaanPointArt.still('g'+n,3.4);return;}

 // The camera descends with the player. The model stays near his hands and settles above the next heading.
 const inside=p>.615&&p<.805;stage.classList.toggle('inside-guitar',inside);

 const exit=ramp(p,0,.125);hero.style.transform=reduced?'none':`translate3d(0,${-exit*viewHeight}px,0)`;
 hero.style.opacity=reduced?1-ramp(p,.03,.1):1-ramp(p,.038,.086);
 hero.style.visibility=p<.13?'visible':'hidden';hero.inert=p>.10;root.classList.toggle('hero-offscreen',p>=.13);
 if(p<.105&&!paused&&!reduced&&!document.hidden&&!document.querySelector('dialog[open]')){if(video.paused)video.play().catch(()=>{});}else if(!video.paused)video.pause();
 const visible=ramp(p,.012,.040);guitar.style.opacity=visible;
 const point=visible>.001?TaanGuitar.render(p,reduced||paused):null;
 TaanBreeze.update(p,point?.release,reduced||paused);
 let newActive=0,illustrationStep=0,clear=0,pointOpacity=0;
 scenes.forEach((s,i)=>{const opacity=fade(p,...s.range);s.el.style.opacity=opacity;s.el.style.transform=`translate3d(0,${reduced||paused?0:(1-opacity)*15}px,0)`;
 const active=opacity>.5;if(s.el.getAttribute('aria-hidden')!==String(!active)){s.el.setAttribute('aria-hidden',String(!active));s.el.inert=!active;}
 if(i&&active)newActive=i;
 // Start on the chapter boundary, while its text and illustration fade in.
 // Visibility/accessibility remains tied to the readable text, not this trigger.
 if(i&&p>=s.range[0]&&p<s.range[3])illustrationStep=i;
 if(mobile&&opacity>.03)clear=Math.max(clear,s.clear);
 if(i&&i!==3)pointOpacity=Math.max(pointOpacity,opacity);
 if(s.demo){const entering=ramp(p,s.range[0],s.range[1]),leaving=ramp(p,s.range[2],s.range[3]);s.demo.style.transform=reduced||paused?'none':`translate3d(${s.entrySide*s.entryTravel*(1-entering-leaving)}px,0,0)`;}
 });
 activeStep=newActive;
 TaanIllustrations.update(illustrationStep,paused,reduced);
 guitar.style.maskImage='none';
 // Interior lighting overlay only: the moving WebGL guitar remains visible.
 interior.style.opacity=fade(p,.62,.654,.752,.792);

 chapters.forEach((a,i)=>{const value=clamp((p-ranges[i][0])/(ranges[i][1]-ranges[i][0]));bars[i].style.transform=`scaleX(${value})`;if(activeStep===i+1)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 header.style.setProperty('--header-bg',1-ramp(p,.012,.085));header.style.setProperty('--header-ink',inside?'#f7eee6':p>.06?'#292a1c':'var(--hero-ink,#292118)');
 window.__taanProgress=p;window.__taanActiveStep=activeStep;window.__taanIllustrationStep=illustrationStep;
}
function navigateTo(hash){const el=document.getElementById(hash.slice(1));if(!el)return;const p=el.dataset.progress;const stillTarget=reduced&&p?document.querySelector(hash==='#how-taan-works'?'[data-scene=intro]':'[data-scene=\"'+hash.slice(-1)+'\"]'):null;const top=stillTarget?stillTarget.getBoundingClientRect().top+scrollY-85:p?experienceTop+Number(p)*scrollRange:el.getBoundingClientRect().top+scrollY;scrollTo({top,behavior:reduced||paused?'instant':'smooth'});history.replaceState(null,'',hash);closeMenu();}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{if(document.getElementById(a.hash.slice(1))){e.preventDefault();navigateTo(a.hash);}}));
const menu=$('.site-menu'),menuToggle=$('.menu-toggle');
function closeMenu(restoreFocus=false){menu.classList.remove('open');menu.inert=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation');if(restoreFocus)menuToggle.focus({preventScroll:true});}
menuToggle.addEventListener('click',()=>{const open=!menu.classList.contains('open');menu.classList.toggle('open',open);menu.inert=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!menuToggle.contains(e.target))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){e.preventDefault();closeMenu(true);}});
const sound=$('.sound-toggle');sound.hidden=true;
sound.addEventListener('click',()=>{video.muted=!video.muted;sound.setAttribute('aria-pressed',String(!video.muted));sound.setAttribute('aria-label',video.muted?'Turn video sound on':'Turn video sound off');sound.querySelector('span').textContent=video.muted?'Sound on':'Sound off';if(!paused&&!reduced)video.play().catch(()=>{});});
function setMotion(){root.classList.toggle('reduced-motion',reduced);root.classList.toggle('motion-paused',paused);if(paused||reduced)video.pause();else if(current<.14)video.play().catch(()=>{});forced=true;onScroll();}
media.addEventListener('change',e=>{reduced=e.matches;setMotion();measure();document.fonts.ready.then(measure);});
document.addEventListener('visibilitychange',()=>{
 root.classList.toggle('page-hidden',document.hidden);if(document.hidden){video.pause();TaanIllustrations.suspend();}
 else{forced=true;onScroll();}
});
const dialog=$('.score-dialog'),form=$('#score-form'),formView=$('.form-view'),successView=$('.success-view');let previousFocus,briefData=null,scrollLock=0;
function openBrief(trigger,brief){previousFocus=trigger||document.activeElement;if(typeof brief==='string'){$('#score-brief').value=brief;$('#score-brief').setCustomValidity('');formView.hidden=false;successView.hidden=true;}closeMenu();scrollLock=scrollY;dialog.showModal();root.classList.add('dialog-open');video.pause();document.body.style.overflow='hidden';}
$$('[data-start]').forEach(button=>button.addEventListener('click',()=>openBrief(button)));
window.addEventListener('taan-open-brief',e=>openBrief(e.detail?.trigger,e.detail?.brief));
function closeDialog(){dialog.close();}
$('.dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeDialog();}});
dialog.addEventListener('close',()=>{root.classList.remove('dialog-open');forced=true;onScroll();document.body.style.overflow='';previousFocus?.focus({preventScroll:true});});
$('#video-file').addEventListener('change',e=>{const file=e.target.files[0];$('#file-label').textContent=file?file.name:'Add your video or reference audio';$('.file-detail').textContent=file?`${(file.size/1024/1024).toFixed(1)} MB · stays on your device`:'Choose a file · optional';});
$$('[data-mood]').forEach(button=>button.addEventListener('click',()=>{const field=$('#score-brief');field.value=field.value.trim()?field.value.trim()+'. '+button.dataset.mood+'.':button.dataset.mood+'.';field.setCustomValidity('');field.focus();}));
$('#score-brief').addEventListener('input',e=>e.target.setCustomValidity(''));
form.addEventListener('submit',e=>{e.preventDefault();const brief=$('#score-brief').value.trim();if(!brief){$('#score-brief').setCustomValidity('Describe the feeling you want for your score.');$('#score-brief').reportValidity();return;}const file=$('#video-file').files[0];briefData={project:'My Taan score',brief,reference:file?{name:file.name,type:file.type,size:file.size}:null};$('#brief-summary').textContent=brief;formView.hidden=true;successView.hidden=false;dialog.scrollTop=0;successView.focus();});
$('.edit-brief').addEventListener('click',()=>{successView.hidden=true;formView.hidden=false;$('#score-brief').focus();});
$('#download-brief').addEventListener('click',()=>{if(!briefData)return;const text=`MY TAAN SCORE\n\nTHE FEELING\n${briefData.brief}\n\nREFERENCE\n${briefData.reference?briefData.reference.name:'No reference selected'}\n\nPrepared with the Taan landing page preview.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='my-taan-score-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
window.addEventListener('scroll',onScroll,{passive:true});let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,100);},{passive:true});
window.addEventListener('taan-art-ready',()=>{forced=true;onScroll();});
video.addEventListener('play',()=>{if(paused||reduced||document.hidden||root.matches('.dialog-open,.printing')||current>.105)video.pause();});
video.addEventListener('loadedmetadata',()=>{forced=true;onScroll();});
video.addEventListener('error',()=>{video.poster='./729beb45d7817ca8.jpg';sound.disabled=true;});
addEventListener('beforeprint',()=>{root.classList.add('printing');video.pause();});addEventListener('afterprint',()=>{root.classList.remove('printing');forced=true;onScroll();});
setMotion();measure();document.fonts.ready.then(measure);
if(location.hash&&location.hash!=='#home')requestAnimationFrame(()=>navigateTo(location.hash));
})();
