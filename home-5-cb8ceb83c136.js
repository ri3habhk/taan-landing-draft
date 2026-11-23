/* V50: document-led inputs, semantic timing, selective edits, stems and licensed music. */
(()=>{
'use strict';
const C={yellow:'#e9bc29',lime:'#a7b62c',green:'#536e27',forest:'#183d32',teal:'#29676a',cream:'#fff0c5',ink:'#1e271f',rust:'#c95727',ochre:'#a48626'};
const PI=Math.PI,TAU=PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const nodes=[...document.querySelectorAll('[data-point-art]')],panels=new Map(),patterns=new Map();
let raf=0,last=0,currentGuitar=0,stopped=false,preferReduced=false;
function rect(c,x,y,w,h,color,r=0){c.fillStyle=color;c.beginPath();if(r)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.fill();}
function line(c,x,y,x2,y2,color,w=2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=color;c.fill();}
function ellipse(c,x,y,rx,ry,color,a=0){c.beginPath();c.ellipse(x,y,rx,ry,a,0,TAU);c.fillStyle=color;c.fill();}
function path(c,d,fill,stroke=null,w=1){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke(p);}return p;}
function label(c,x,y,text,size=14,color=C.cream,align='left',weight=700){c.fillStyle=color;c.textAlign=align;c.font=`${size>=22?700:400} ${size}px Manrope, sans-serif`;c.fillText(text,x,y);}
function pattern(c,base,ink,gap=5){const key=[base,ink,gap].join(':');if(!patterns.has(key)){const a=document.createElement('canvas');a.width=a.height=gap*4;const p=a.getContext('2d');rect(p,0,0,a.width,a.height,base);for(let y=0;y<a.height;y+=gap)for(let x=0;x<a.width;x+=gap)circle(p,x+(y/gap%2?gap/2:0),y,gap*.17,ink);patterns.set(key,a);}return c.createPattern(patterns.get(key),'repeat');}
function grain(c,w,h,base,ink){rect(c,0,0,w,h,base);c.fillStyle=ink;for(let n=0;n<1000;n++){const x=(n*163.379+17)%w,y=(n*n*11.123+43)%h;c.fillRect(x,y,n%6===0?1.2:.6,.6);}}
function hatch(c,d,base,ink,gap=5){const p=path(c,d,base);c.save();c.clip(p);c.fillStyle=pattern(c,base,ink,gap);c.fillRect(-1500,-1000,3000,2200);c.restore();}
function note(c,x,y,s=1,color=C.cream,flag=true){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,7,4.6,color,-.35);line(c,6,-2,6,-32,color,2.8);if(flag)path(c,'M6-32C7-22 23-22 13-9C16-18 8-17 6-20Z',color);c.restore();}
function star(c,x,y,r,color){c.save();c.translate(x,y);c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*PI/4-PI/2,rr=i%2?r*.25:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}
function waveform(c,x,y,w,h,t,color,seed=0,bar=5){c.fillStyle=color;for(let i=0;i<w/bar;i++){const u=i*bar/w,a=(.23+.77*Math.abs(Math.sin(i*.64+seed)*Math.sin(i*.13-t*.5+seed)))*(.65+.35*Math.sin(u*PI));const hh=8+a*h;c.fillRect(x+i*bar,y-hh/2,bar*.56,hh);}}
function arrow(c,x,y,w,color=C.cream){line(c,x,y,x+w,y,color,3);path(c,`M${x+w-8} ${y-7}L${x+w} ${y}L${x+w-8} ${y+7}`,null,color,3);}
function cloud(c,x,y,s,base=C.cream,ink=C.teal){c.save();c.translate(x,y);c.scale(s,s);const d='M-66 21C-85 1-62-24-42-20C-45-46-7-53 5-29C23-57 54-36 53-19C82-23 89 12 66 23Z';hatch(c,d,base,ink,4);path(c,'M-54 7Q-63-11-39-8Q-38-34-10-25Q5-10 14-22Q34-34 43-8Q67-6 61 10',null,ink,1.4);c.restore();}
function hill(c,x,y,w,h,base,ink){const d=`M${x} ${y+h}Q${x+w*.22} ${y-h*.38} ${x+w*.53} ${y+h*.38}T${x+w} ${y+h*.24}V${y+h*2}H${x}Z`;hatch(c,d,base,ink,5);}
// Long-limbed cut-paper silhouette, with a continuous walking gait and guitar.
function walker(c,x,y,s,t,color=C.ink,guitar=true){c.save();c.translate(x,y);c.scale(s,s);const gait=Math.sin(t*TAU*.8),counter=Math.sin(t*TAU*.8+PI);c.translate(0,-2*Math.cos(t*TAU*1.6));
 const limb=(hip,knee,ankle,width)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(...hip);c.quadraticCurveTo(...knee,...ankle);c.stroke();};
 limb([-5,-65],[-5+gait*20,-34],[gait*29,0],12);limb([6,-65],[9+counter*17,-31],[counter*30,0],12);
 ellipse(c,gait*29+5,2,12,4,color);ellipse(c,counter*30+5,2,12,4,color);
 path(c,'M-12-124Q-18-115-16-93L-12-61Q0-56 16-63L14-93L20-115Q10-124 2-126Z',color);
 path(c,'M-5-135L-5-122Q2-116 7-124L8-138Z',color);path(c,'M-8-143Q-12-164 5-166Q18-165 17-151L23-145L17-141Q15-129 6-132L-4-135Z',color);
 limb([-12,-113],[-23,-92],[-4,-86],7);limb([14,-112],[27,-97],[47,-112],7);
 if(guitar){c.save();c.translate(3,-85);c.rotate(.30);hatch(c,'M-9-18C-27-26-36-9-25 1C-39 15-26 35-9 29C8 35 20 15 7 2C18-10 9-26-9-18Z',C.yellow,C.ochre,3);circle(c,-8,0,7,C.forest);path(c,'M-8-4L47-42L52-36L-4 3Z',C.ochre);path(c,'M44-43L55-52L62-45L51-34Z',C.yellow);for(let i=0;i<3;i++)line(c,-12+i*2,15,55+i*.8,-46,C.ink,.7);c.restore();}
 c.restore();}
function filmStill(c,x,y,w,h,t,variant=0){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();rect(c,x,y,w,h,C.yellow);circle(c,x+w*.77,y+h*.24,h*.12,C.cream);cloud(c,x+w*.2,y+h*.3,w/300,C.cream,C.teal);hill(c,x-w*.15,y+h*.52,w*1.4,h*.30,C.teal,C.forest);hill(c,x-w*.22,y+h*.69,w*1.5,h*.23,C.lime,C.green);walker(c,x+w*(.42+.045*Math.sin(t*.9+variant)),y+h*.94,h/193,t+variant*.5,C.ink,true);c.restore();}
function film(c,x,y,w,h,t,variant=0){rect(c,x,y,w,h,C.ink,6);filmStill(c,x+10,y+18,w-20,h-36,t,variant);for(let dx=12;dx<w-10;dx+=23){rect(c,x+dx,y+6,11,6,C.cream,1);rect(c,x+dx,y+h-12,11,6,C.cream,1);}}
function ribbon(c,x,y,w,h,t,color=C.cream,ink=C.forest){rect(c,x,y,w,h,color,3);for(let i=0;i<5;i++)line(c,x+12,y+10+i*8,x+w-12,y+10+i*8,ink,.7);for(let i=0;i<Math.floor(w/40);i++)note(c,x+27+i*38,y+27+Math.sin(i*1.3+t*.7)*7,.55,ink,i%3!==0);}
function ticks(c,x,y,w,color){for(let i=0;i<=w;i+=10)line(c,x+i,y,x+i,y+(i%50===0?10:4),color,1);}
function reel(c,x,y,r,t){circle(c,x,y,r,C.cream);c.save();c.translate(x,y);c.rotate(t);circle(c,0,0,r-7,C.forest);for(let i=0;i<6;i++){const a=i*TAU/6;ellipse(c,Math.cos(a)*r*.61,Math.sin(a)*r*.61,r*.21,r*.11,C.yellow,a);}circle(c,0,0,r*.18,C.yellow);circle(c,0,0,r*.05,C.forest);c.restore();}
function registration(c,w,h,color){for(const [x,y,sx,sy] of [[20,20,1,1],[w-20,20,-1,1],[20,h-20,1,-1],[w-20,h-20,-1,-1]]){line(c,x,y,x+11*sx,y,color,1);line(c,x,y,x,y+11*sy,color,1);}}
function titlePair(c,h,left,right,dark=false){const ink=dark?C.forest:C.cream;label(c,38,36,left,13,ink);label(c,762,36,right,11,ink,'right');ticks(c,38,h-28,724,ink);}

// Each illustration keeps the original paper palette, engraving and grain.
// Its labels are stationary; motion demonstrates one concrete product action.
function g1(c,t){
 grain(c,800,470,C.forest,'#204638');titlePair(c,470,'EDIT THE PHRASE. KEEP THE PERFORMANCE.','GRANULAR CONTROL');
 const phase=(t%10)/10,edit=smooth((phase-.22)/.28),x=151,w=605,start=355,end=516;
 label(c,40,80,'“Make only this melody phrase brighter.”',26,C.cream);
 for(let i=0;i<=6;i++){const xx=x+i*w/6;label(c,xx,119,(i*4)+'s',16,C.cream,'center');}
 ['MELODY','BASS','DRUMS'].forEach((name,i)=>{let y=174+i*82;label(c,30,y+6,name,18,C.cream);rect(c,x,y-28,w,56,i===0?C.cream:C.teal,3);
 if(i===0){rect(c,start,y-28,end-start,56,C.yellow,3);for(let j=0;j<19;j++){const nx=x+17+j*31,selected=nx>start&&nx<end;note(c,nx,y+Math.sin(j*1.8)*(selected?12-edit*7:12)-(selected?edit*10:0),.42,C.forest,false);}c.save();c.setLineDash([5,4]);c.strokeStyle=C.yellow;c.lineWidth=2;c.strokeRect(start-5,y-36,end-start+10,72);c.restore();}
 else waveform(c,x+10,y,w-20,24,0,i===1?C.cream:C.lime,i*2,6);});
 const play=x+phase*w;line(c,play,137,play,375,C.rust,3);circle(c,play,132,5,C.rust);
 label(c,400,406,edit<.95?'Only the selected phrase is changing.':'Melody updated. Bass and drums untouched.',22,C.cream,'center');label(c,400,437,'SAME TRACK · CONTINUOUS PLAYBACK · NO REGENERATION',16,C.lime,'center');
}
function g2(c,t){
 grain(c,800,470,C.forest,'#204638');titlePair(c,470,'VIDEO. SCRIPT. REFERENCE AUDIO.','01 / INPUTS');
 film(c,45,82,270,163,t);label(c,47,273,'VIDEO',23,C.cream);
 c.save();c.translate(56,299);c.rotate(-.035);rect(c,0,0,131,96,C.yellow,3);label(c,13,25,'A quiet street.',14,C.forest);label(c,13,47,'A sudden turn.',14,C.forest);label(c,13,69,'A bright ending.',14,C.forest);c.restore();
 rect(c,220,297,121,102,C.teal,4);waveform(c,230,347,102,46,t*.3,C.cream,2,5);label(c,49,427,'SCRIPT',21,C.cream);label(c,218,427,'AUDIO',21,C.cream);
 path(c,'M325 167C367 167 341 244 391 244M197 341C355 341 322 244 391 244M351 346C386 346 367 244 391 244',null,C.lime,2.5);
 circle(c,405,244,27,C.cream);line(c,394,244,416,244,C.forest,3);line(c,405,233,405,255,C.forest,3);arrow(c,438,244,37,C.yellow);
 rect(c,495,83,257,277,C.lime,18);rect(c,508,96,231,251,C.ink,12);
 c.save();c.beginPath();c.arc(624,224,94,0,TAU);c.clip();filmStill(c,514,127,223,197,t);c.restore();circle(c,624,224,10,C.yellow);
 const scan=525+(1-Math.cos(t*TAU/10))*98;line(c,scan,114,scan,331,C.cream,2);
 ribbon(c,458,366,298,44,t,C.cream,C.forest);label(c,750,427,'YOUR TRACK',23,C.cream,'right');
}
function g3(c,t){
 grain(c,800,470,C.cream,'#d9c797');titlePair(c,470,'CAPABILITIES BUILT INTO THE ARCHITECTURE.','02 / CONTROL',true);
 label(c,38,78,'HUM · NOTES · MIDI · IMAGE · VIDEO · SCRIPT',19,C.forest);arrow(c,665,72,45,C.forest);label(c,750,78,'PLAN',18,C.forest,'right');
 rect(c,36,103,728,128,C.forest,4);label(c,56,133,'“Drop the beat at 0:12.”',23,C.cream);const scan=58+(t%8)/8*680;waveform(c,58,179,680,46,0,C.lime,2,5);line(c,466,145,466,219,C.yellow,3);label(c,466,218,'0:12',16,C.yellow,'center');line(c,scan,149,scan,200,C.cream,2);if(scan>=466){rect(c,548,112,198,31,C.yellow,3);label(c,647,134,'BEAT DROPS · 0:12',16,C.forest,'center');}
 ['MELODY','BASS','DRUMS'].forEach((name,i)=>{const y=275+i*48;label(c,38,y+5,name,16,C.forest);rect(c,135,y-18,475,36,i===0?C.yellow:'#dfdbbd',2);waveform(c,145,y,455,17,i===0?t:0,C.forest,i+2,6);line(c,145+(t%8)/8*455,y-18,145+(t%8)/8*455,y+18,C.rust,2);label(c,630,y+5,i===0?'EDIT THIS PART':'KEEPS PLAYING',14,C.forest);});label(c,400,430,'Change one layer. Keep the music playing.',21,C.forest,'center');
}
function g4(c,t){
 grain(c,800,470,C.forest,'#295040');
 const phase=preferReduced||matchMedia('(prefers-reduced-motion: reduce)').matches?12:t%15,writing=smooth((phase-4)/5),playing=phase>=9;
 titlePair(c,470,'YOUR DIRECTION. YOUR MUSIC.','HOW YOU USE TAAN');
 // One brief remains visible as its timing becomes a score, then playback.
 const brief='7/8 piano. Bass at 0:06. Half-time drums at 0:12.';
 label(c,38,78,'YOU',14,C.lime);
 label(c,38,111,phase<2?brief.slice(0,Math.floor(phase/2*brief.length)):brief,24,C.cream);
 if(phase<2)line(c,38+c.measureText(brief.slice(0,Math.floor(phase/2*brief.length))).width+5,89,38+c.measureText(brief.slice(0,Math.floor(phase/2*brief.length))).width+5,114,C.yellow,2);
 const x=153,w=603,drop=x+w*.4;
 ['PLAN','WRITE','PLAY'].forEach((word,i)=>{const xx=38+i*265,active=i===(phase<4?0:phase<9?1:2);label(c,xx,155,word,18,active?C.yellow:C.cream);line(c,xx,165,xx+194,165,active?C.yellow:C.teal,active?3:1);});
 for(let i=0;i<=5;i++)label(c,x+i*w/5,197,'0:'+String(i*6).padStart(2,'0'),14,C.cream,'center');
 const plan=smooth((phase-2)/2);c.globalAlpha=.3+.7*plan;
 line(c,x,218,drop,218,C.lime,4);line(c,drop,218,x+w,218,C.yellow,4);
 label(c,x+12,241,'7/8 · BASS AT 0:06',14,C.lime);label(c,drop+12,241,'HALF-TIME DRUMS · 0:12',14,C.yellow);c.globalAlpha=1;
 ['PIANO','BASS','DRUMS'].forEach((name,i)=>{
  const y=277+i*44;label(c,38,y+6,name,17,C.cream);line(c,x,y+16,x+w,y+16,C.teal,1);
  const start=i===2?drop:i===1?x+w*.2:x,count=i===2?12:20;
  for(let j=0;j<count;j++){
   const nx=start+12+j*(x+w-start-25)/count,visible=clamp(writing*1.4-i*.15-j*.018);
   c.globalAlpha=visible;
   if(i===0)note(c,nx,y+Math.sin(j*1.3)*6,.36,C.cream,false);
   else rect(c,nx,y-(i===2?5:3),i===2?7:18,i===2?10:6,i===2?C.yellow:C.lime,2);
  }c.globalAlpha=1;
 });
 line(c,drop,207,drop,384,C.yellow,1);
 if(playing){const play=x+clamp((phase-9)/5)*w;line(c,play,252,play,384,C.cream,2);circle(c,play,251,4,C.cream);}
 const caption=phase<4?'Give Taan a brief and exact timing.':phase<9?'Taan turns your direction into an arranged score.':phase<11?'Play your track. Bass joins at 0:06.':'0:12 — half-time drums enter on cue.';
 label(c,400,419,caption,20,C.cream,'center');
}

function portraitBase(c,left,right){grain(c,800,760,C.cream,'#d7c89f');label(c,42,42,left,22,C.forest);label(c,758,42,right,20,C.forest,'right');}
function portraitD1(c,t){portraitBase(c,'MADE FOR YOUR FILM.','01 / ORIGINAL');
 c.save();c.translate(400,277);c.rotate(t*.1);circle(c,0,0,171,C.forest);for(let i=0;i<23;i++){c.beginPath();c.arc(0,0,47+i*4.7,0,TAU);c.strokeStyle=i%3?C.lime:C.yellow;c.lineWidth=2;c.stroke();}circle(c,0,0,46,C.yellow);circle(c,0,0,8,C.forest);c.restore();
 for(let i=0;i<3;i++){const a=t*.3+i*TAU/3;note(c,400+Math.cos(a)*207,277+Math.sin(a)*185,.9,C.forest);}
 rect(c,80,503,640,178,C.yellow,9);label(c,400,561,'100% original music',44,C.forest,'center');label(c,400,610,'Perpetual rights.',31,C.forest,'center');label(c,400,650,'Full commercial use.',31,C.forest,'center');}
function portraitD2(c,t){portraitBase(c,'YOUR MIX. YOUR INSTRUMENTS.','02 / STEMS');const names=['VIOLIN','PIANO','DRUMS'],colors=[C.yellow,'#f3e2b8',C.lime];for(let i=0;i<3;i++){const y=123+i*160,p=smooth((t-.15-i*.18)/1.8);rect(c,45,y,319,121,C.forest,8);label(c,65,y+37,names[i],29,C.cream);waveform(c,64,y+83,278,34,0,colors[i],i+1,6);arrow(c,381,y+61,40,C.forest);circle(c,381+40*p,y+61,5,C.rust);rect(c,443+(1-p)*12,y,310,121,colors[i],8);label(c,599+(1-p)*12,y+71,names[i].toLowerCase()+'.wav',34,C.forest,'center');}rect(c,184,655,190,50,C.forest,25);label(c,279,689,'MP3',30,C.cream,'center');rect(c,425,655,190,50,C.forest,25);label(c,520,689,'WAV',30,C.cream,'center');}
function portraitD3(c,t){portraitBase(c,'MADE WITH ARTISTS.','03 / LICENSED');rect(c,69,105,338,322,C.yellow,8);label(c,238,159,'Artist agreement',30,C.forest,'center');ribbon(c,90,190,292,65,0,C.cream,C.forest);for(let i=0;i<3;i++)line(c,98,287+i*18,364-i*19,287+i*18,C.forest,2);const p=smooth((t-.2)/1.9);c.save();c.beginPath();c.rect(90,341,230*p,64);c.clip();path(c,'M100 380C123 330 121 409 147 367S182 406 205 368S250 389 288 368',null,C.forest,4);c.restore();circle(c,585,267,118,C.forest);label(c,585,260,'100%',66,C.cream,'center');label(c,585,302,'LICENSED',25,C.cream,'center');line(c,403,453,403,499,C.forest,3);path(c,'M392 489L403 502L414 489',null,C.forest,3);rect(c,97,531,606,163,C.forest,10);label(c,400,579,'YOUR ORIGINAL TRACK',30,C.cream,'center');waveform(c,134,639,532,49,t*.15,C.lime,3,7);}

function d1(c,t){
 if(innerWidth<=800&&innerHeight>480)return portraitD1(c,t);
 grain(c,800,390,C.yellow,C.ochre);titlePair(c,390,'MADE FOR YOUR FILM.','01 / ORIGINAL MUSIC',true);
 c.save();c.translate(242,197);c.rotate(t*.11);circle(c,0,0,124,C.forest);
 for(let i=0;i<22;i++){const r=25+i*4.1;c.beginPath();for(let n=0;n<=170;n++){const a=n/170*TAU,rr=r+(5+3*Math.sin(i*.6))*Math.sin(a*3+i*.10)+Math.sin(a*7+i*.2)*2;const x=Math.cos(a)*rr,y=Math.sin(a)*rr*.91;n?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=i%3===0?C.yellow:C.lime;c.lineWidth=1.35;c.stroke();}
 circle(c,0,0,28,C.cream);circle(c,0,0,5,C.forest);c.restore();
 const lift=3*(1-Math.cos(t*TAU/9));c.save();c.translate(425,81-lift);c.rotate(-.035);rect(c,0,0,325,226,C.forest,3);rect(c,10,10,305,206,C.cream,2);
 label(c,27,61,'100% ORIGINAL',29,C.forest);label(c,27,102,'MUSIC',39,C.forest);line(c,25,120,298,120,C.forest,2);label(c,27,160,'Perpetual rights to',23,C.forest);label(c,27,192,'full commercial use',23,C.forest);c.restore();
 for(let i=0;i<3;i++){const a=t*.5+i*TAU/3;note(c,242+Math.cos(a)*139,197+Math.sin(a)*128,.68,C.forest,i%2===0);}
 label(c,56,346,'AN ORIGINAL.',19,C.forest);label(c,744,346,'ALL YOURS.',19,C.forest,'right');
}
function d2(c,t){
 if(innerWidth<=800&&innerHeight>480)return portraitD2(c,t);
 grain(c,800,390,C.forest,'#204638');titlePair(c,390,'FULL MIX + INDIVIDUAL INSTRUMENTS.','02 / EXPORT');
 const names=['VIOLIN','PIANO','DRUMS'],colors=[C.yellow,C.cream,C.lime];
 for(let i=0;i<3;i++){
  const yy=91+i*77;rect(c,42,yy,310,61,C.teal,3);label(c,56,yy+23,names[i],18,C.cream);waveform(c,160,yy+33,175,30,0,colors[i],1.1+i,5);
  const p=smooth((t-.2-i*.2)/1.7);path(c,`M362 ${yy+32}C413 ${yy+32} 414 ${yy+32} 453 ${yy+32}`,null,colors[i],2);circle(c,363+90*p,yy+32,4,colors[i]);
  c.save();c.translate(481+(1-p)*18,yy-3);rect(c,4,5,276,68,C.ink,2);rect(c,0,0,276,68,colors[i],2);path(c,'M253 0V22H276',C.ochre);label(c,18,40,names[i].toLowerCase()+'.wav',26,C.forest);c.restore();
 }
 rect(c,43,337,91,29,C.yellow,3);label(c,88,359,'MP3',21,C.forest,'center');rect(c,147,337,91,29,C.cream,3);label(c,192,359,'WAV',21,C.forest,'center');
 label(c,748,357,'Download the mix or each stem.',23,C.cream,'right');
}
function d3(c,t){
 if(innerWidth<=800&&innerHeight>480)return portraitD3(c,t);
 grain(c,800,390,C.yellow,C.ochre);titlePair(c,390,'TRAINED ON 100% LICENSED MUSIC.','03 / WITH ARTISTS',true);
 c.save();c.translate(59,89);c.rotate(.035);rect(c,9,-12,234,221,C.ochre,3);rect(c,0,0,234,220,C.cream,3);label(c,18,30,'ARTIST AGREEMENT',19,C.forest);line(c,17,43,215,43,C.forest,1);ribbon(c,18,60,198,49,0,C.cream,C.forest);for(let i=0;i<3;i++)line(c,18,125+i*10,196-i%2*35,125+i*10,C.green,1.2);
 const p=smooth((t-.3)/1.9);c.save();c.beginPath();c.rect(15,156,202*p,55);c.clip();path(c,'M23 183C33 144 34 197 48 166S63 203 77 175S104 180 113 172',null,C.forest,2.5);c.restore();label(c,139,185,'LICENSED',16,C.forest);c.restore();
 arrow(c,305,198,33,C.forest);circle(c,429,191,79,C.forest);for(let i=0;i<5;i++){c.beginPath();c.arc(429,191,68-i*3,0,TAU);c.strokeStyle=i%2?C.lime:C.green;c.lineWidth=1;c.stroke();}
 label(c,429,188,'100%',46,C.cream,'center');label(c,429,218,'LICENSED',18,C.cream,'center');label(c,429,289,'Training music',22,C.forest,'center');arrow(c,518,198,32,C.forest);
 rect(c,582,86,168,221,C.forest,3);rect(c,590,94,152,205,C.cream,2);label(c,666,131,'YOUR TRACK',19,C.forest,'center');waveform(c,607,192,119,55,t*.15,C.forest,3.6,5);circle(c,666,259,21,C.forest);path(c,'M655 258L664 267L679 250',null,C.cream,3);
 label(c,47,347,'WORKING WITH ARTISTS',20,C.forest);label(c,750,347,'ORIGINAL MUSIC',20,C.forest,'right');
}

const scenes={g1,g2,g3,g4,d1,d2,d3};
function create(node){const id=node.dataset.pointArt,h=id[0]==='g'?470:(innerWidth<=800&&innerHeight>480?760:390),sourceScale=id[0]==='d'?2.25:1.5,buffer=document.createElement('canvas');buffer.width=800*sourceScale;buffer.height=Math.round(h*sourceScale);const source=buffer.getContext('2d',{alpha:false}),ctx=node.getContext('2d',{alpha:false});const record={id,node,h,buffer,source,sourceScale,ctx,time:0,active:false,paused:false,reduced:false,draws:0,w:0,scale:1};panels.set(id,record);resize(record);draw(record,3.4);}
function resize(r){const h=r.id[0]==='g'?470:(innerWidth<=800&&innerHeight>480?760:390),w=Math.max(1,r.node.clientWidth||800),dpr=Math.min(devicePixelRatio||1,2),px=Math.round(w*dpr);if(r.w===px&&r.h===h)return;r.h=h;r.buffer.height=Math.round(h*r.sourceScale);r.w=px;r.node.width=px;r.node.height=Math.round(px*h/800);r.scale=px/800;}
function draw(r,t){const {source:s,ctx:c,buffer:b,h}=r;s.setTransform(r.sourceScale,0,0,r.sourceScale,0,0);s.globalAlpha=1;scenes[r.id](s,t);c.setTransform(r.scale,0,0,r.scale,0,0);c.globalAlpha=1;
 const bg=['g1','g4','d2'].includes(r.id)?C.forest:r.id==='g3'?C.teal:C.yellow;rect(c,0,0,800,h,bg);
 // Keep labels and texture steady while individual scene elements animate.
 c.drawImage(b,0,0,b.width,b.height,0,0,800,h);
 registration(c,800,h,bg===C.yellow?C.forest:C.cream);r.draws++;r.node.taanFrame=r.draws;if(r.id[0]==='d'&&r.draws%12===0)r.node.dataset.animationTime=t.toFixed(3);r.node.classList.add('point-ready');
}
function canPlay(r){return !r.manual&&r.active&&r.inView&&!r.paused&&!r.reduced&&!document.hidden&&!document.documentElement.matches('.dialog-open,.printing');}
function debug(){for(const r of panels.values())if(r.id[0]==='d'){const state=String(canPlay(r));if(r.node.dataset.playing!==state)r.node.dataset.playing=state;}window.__taanPointArt={palette:C,opaque:true,panels:[...panels.values()].map(r=>({id:r.id,time:r.time,active:r.active,playing:canPlay(r),draws:r.draws,width:r.node.width,height:r.node.height}))};}
function tick(now){raf=0;const dt=last?Math.min(now-last,50)/1000:0;last=now;let running=false;for(const r of panels.values())if(canPlay(r)){r.time+=dt;draw(r,r.time);running=true;}debug();window.TaanDirectorTheatre?.invalidate();if(running)raf=requestAnimationFrame(tick);else last=0;}
function request(){if(!raf&&[...panels.values()].some(canPlay))raf=requestAnimationFrame(tick);}
function set(id,active,paused,reduced,reset=false){const r=panels.get(id);if(!r)return;const changed=r.active!==active||r.paused!==paused||r.reduced!==reduced;r.active=active;r.paused=paused;r.reduced=reduced;if(reset){r.time=0;r.manual=false;}if(changed||reset){resize(r);draw(r,reduced?3.4:r.time);}request();debug();}
function update(step,pause,reduced){const changed=currentGuitar!==step;currentGuitar=step;stopped=pause;preferReduced=reduced;for(let i=1;i<=4;i++)set('g'+i,step===i,pause,reduced,changed&&step===i);}
nodes.forEach(create);
const viewObserver=new IntersectionObserver(entries=>{for(const e of entries){const r=panels.get(e.target.dataset.pointArt);if(r.inView!==e.isIntersecting){r.inView=e.isIntersecting;if(r.inView){resize(r);if(r.active)r.time=0;draw(r,r.reduced?3.4:r.time);}}}request();debug();},{threshold:0});
nodes.forEach(n=>viewObserver.observe(n));
document.querySelectorAll('[data-illustration]').forEach((panel,index)=>panel.querySelector('.figma-replay')?.addEventListener('click',()=>{const r=panels.get('g'+(index+1));r.time=0;draw(r,preferReduced?3.4:0);request();}));
window.TaanIllustrations={update,suspend(){cancelAnimationFrame(raf);raf=0;last=0;debug();}};
document.fonts.ready.then(()=>{for(const r of panels.values()){resize(r);draw(r,r.time||3.4);}});
window.TaanPointArt={seek(id,t){const r=panels.get(id);if(r){r.manual=true;r.time=t;resize(r);draw(r,t);}},director(index,active,paused,reduced,reset=false){set('d'+(index+1),active,paused,reduced,reset);},still(id,t=3.4){const r=panels.get(id);if(r){resize(r);draw(r,t);}},snapshot(){return [...panels.values()].map(r=>({id:r.id,alpha:r.ctx.getImageData(0,0,1,1).data[3],width:r.node.width,height:r.node.height}));}};
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{for(const r of panels.values()){resize(r);draw(r,r.reduced?3.4:r.time);}debug();},140);});
new MutationObserver(()=>{request();debug();}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else request();debug();});debug();
})();
