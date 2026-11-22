/* Scroll-only breeze: no timer, idle animation loop, or scroll interception. */
(()=>{
 'use strict';
 const svg=document.querySelector('.guitar-breeze');
 const trails=[...svg.querySelectorAll('.breeze-streaks path')];
 const curls=[...svg.querySelectorAll('.breeze-curls path')];
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 const n=x=>x.toFixed(2);
 function update(p,frame,still){
  const strength=ease((p-.072)/.040)*(1-ease((p-.185)/.040));
  if(!frame||still||strength<.001){svg.style.opacity='0';return;}
  svg.style.opacity=n(strength*.72);
  const u=clamp((p-.072)/.153),s=Math.max(50,Math.min(165,frame.length));
  // Every line follows the projected geometry, including responsive framing.
  trails.forEach((line,i)=>{
   const pulse=(u*1.4+i*.21)%1;
   const x=frame.x+(i-2)*s*.20;
   const y=frame.top-s*(.18+.42*pulse);
   const length=s*(.40+(i%3)*.15);
   const bend=Math.sin(u*Math.PI*2+i*.6)*s*.055;
   line.setAttribute('d',`M${n(x+bend)} ${n(y-length)} Q${n(x-bend)} ${n(y-length*.48)} ${n(x)} ${n(y)}`);
   line.style.opacity=n(.90*Math.pow(Math.sin(pulse*Math.PI),2));
  });
  curls.forEach((line,i)=>{
   const slip=Math.sin(u*Math.PI*2+i)*s*.07;
   const x=frame.x+(i?.48:-.86)*s+slip,y=frame.y+(i?-.30:.06)*s;
   line.setAttribute('d',`M${n(x)} ${n(y)} C${n(x+s*.15)} ${n(y+s*.08)} ${n(x+s*.22)} ${n(y-s*.12)} ${n(x+s*.42)} ${n(y-s*.08)}`);
   line.style.opacity=n(.45+.25*Math.sin(u*Math.PI+i*.5));
  });
 }
 window.TaanBreeze={update};
})();
