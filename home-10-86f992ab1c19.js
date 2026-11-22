/* V31: spaced orchestral sections; the guitar’s PDF wood, matte finish and lighting. */
(()=>{
'use strict';
const canvas=document.querySelector('#orchestra-canvas'),world=canvas.closest('.quartet-world');
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let renderer,scene,camera,projection,logical,available=false,ready=false,raf=0,last=0,time=0,renderCount=0;
let width=1,height=1,view={entrance:0,performance:0,sheetReveal:0,s:1,tx:0,ty:0,baseScale:1,offsetX:0,offsetY:0,visible:false,paused:false,reduced:false};
const records=[],batches=[],textureNames=[],scoreMaterials=[];
const smooth=v=>{v=clamp(v,0,1);return v*v*v*(v*(v*6-15)+10);};
let loaded=0,total=0;
try{
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.setClearColor(0,0);
 scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-720,720,450,-450,.1,10000);camera.position.set(0,0,4000);
 projection=new THREE.Group();scene.add(projection);logical=new THREE.Group();
 scene.add(new THREE.HemisphereLight(0xfff1d5,0x24160d,1.05));
 const key=new THREE.DirectionalLight(0xffecd1,1.8);key.position.set(-700,800,1200);scene.add(key);
 const fill=new THREE.DirectionalLight(0xe4e0c7,.7);fill.position.set(800,200,600);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xffcf8b,1.25);rim.position.set(-400,-200,-800);scene.add(rim);
 const cache={};
 function texture(name,data=false){
  if(cache[name])return cache[name];total++;textureNames.push(name);
  const t=new THREE.TextureLoader().load(TAAN_ART[name],()=>{loaded++;if(loaded===total){ready=true;world.classList.add('orchestra-ready');requestDraw();}},undefined,()=>{world.classList.add('orchestra-unavailable');});
  t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());cache[name]=t;return t;
 }
 function finish(name,options={}){return new THREE.MeshPhysicalMaterial({map:texture(name),bumpMap:texture(name+'-bump',true),bumpScale:.0007,roughness:.83,metalness:0,clearcoat:.04,clearcoatRoughness:.8,...options});}
 const spruce=finish('pdf-top-v11',{roughness:.88,clearcoat:.025});
 const ribs=finish('pdf-side-v11',{roughness:.78,side:THREE.DoubleSide});
 const head=finish('pdf-head-v11',{roughness:.81});
 const ebony=finish('pdf-darkwood-v11',{roughness:.87,clearcoat:.02});
 const warmBrass=finish('pdf-top-v11',{roughness:.88,clearcoat:.025,metalness:.08,side:THREE.DoubleSide});
 const gold=new THREE.MeshStandardMaterial({color:0xc4a369,metalness:.75,roughness:.34});
 const metal=new THREE.MeshStandardMaterial({color:0xd1b979,metalness:.84,roughness:.32});
 const ivory=new THREE.MeshStandardMaterial({color:0xe8cb8c,roughness:.68});
 const dark=new THREE.MeshStandardMaterial({color:0x291b11,roughness:.85});
 const hair=new THREE.MeshStandardMaterial({color:0xe1d1b1,roughness:.8});
 const paper=new THREE.MeshStandardMaterial({color:0xf6e5b7,roughness:1,side:THREE.DoubleSide});
 function mesh(g,geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
 // Grain has a consistent physical scale: narrow parts sample a strip of wood,
 // rather than squeezing an entire soundboard photograph into every tiny face.
 function woodUV(geo){
  const p=geo.attributes.position,n=geo.attributes.normal,a=geo.attributes.uv;
  geo.computeBoundingBox();const b=geo.boundingBox,cy=(b.min.y+b.max.y)/2,cx=(b.min.x+b.max.x)/2;
  for(let i=0;i<p.count;i++){
   const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
   const u=nx>nz?(p.getZ(i)/.6+.5):((p.getX(i)-cx)+.5);
   const v=ny>Math.max(nx,nz)?(p.getZ(i)/1.74+.5):((p.getY(i)-cy)/1.74+.5);
   a.setXY(i,u,v);
  }return geo;
 }
 function box(g,x,y,z,sx,sy,sz,mat){const geo=new THREE.BoxGeometry(sx,sy,sz);return mesh(g,mat.map?woodUV(geo):geo,mat,x,y,z);}
 function ball(g,x,y,z,sx,sy,sz,mat){const m=mesh(g,new THREE.SphereGeometry(1,16,10),mat,x,y,z);m.scale.set(sx,sy,sz);return m;}
 function rod(g,a,b,r,mat,segments=10,r2=r){const d=b.clone().sub(a),m=mesh(g,new THREE.CylinderGeometry(r2,r,d.length(),segments),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;}
 function tube(g,pts,r,mat,closed=false){const c=new THREE.CatmullRomCurve3(pts,closed,'centripetal');return mesh(g,new THREE.TubeGeometry(c,Math.min(192,Math.max(24,pts.length*2)),r,6,closed),mat);}
 function ring(g,x,y,z,r,t,mat){return mesh(g,new THREE.TorusGeometry(r,t,7,40),mat,x,y,z);}
 function polygon(pts){const s=new THREE.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
 function uv(g,b){const p=g.attributes.position,a=g.attributes.uv;for(let i=0;i<p.count;i++)a.setXY(i,(p.getX(i)-b[0])/(b[1]-b[0]),(p.getY(i)-b[2])/(b[3]-b[2]));return g;}
 function carved(g,s,z,depth,front=spruce,side=ribs,bevel=.012){
  const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,steps:1,curveSegments:16});
  woodUV(geo);return mesh(g,geo,[front,side],0,0,z);
 }
 function mover(parent,role,slot=0){const g=new THREE.Group();g.userData={role,slot};parent.add(g);return g;}
 function subdivide(geo,iterations){
  let vertices=Array.from(geo.attributes.position.array),indices=Array.from(geo.index.array);
  for(let step=0;step<iterations;step++){
   const mid=new Map(),next=[];
   const at=(a,b)=>{const k=Math.min(a,b)+':'+Math.max(a,b);if(mid.has(k))return mid.get(k);const n=vertices.length/3;vertices.push((vertices[a*3]+vertices[b*3])/2,(vertices[a*3+1]+vertices[b*3+1])/2,0);mid.set(k,n);return n;};
   for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2],ab=at(a,b),bc=at(b,c),ca=at(c,a);next.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}indices=next;
  }
  geo.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(vertices.length/3*2),2));g.setIndex(indices);return g;
 }
 function violin(kind='violin'){
  const g=new THREE.Group(),s=new THREE.Shape();
  s.moveTo(0,.72);s.bezierCurveTo(.21,.74,.41,.62,.40,.39);s.bezierCurveTo(.39,.26,.29,.18,.27,.14);s.lineTo(.36,.11);s.bezierCurveTo(.20,.06,.19,-.20,.32,-.28);s.lineTo(.42,-.28);s.bezierCurveTo(.35,-.37,.54,-.45,.49,-.72);s.bezierCurveTo(.46,-.96,.20,-1.02,0,-1.0);s.bezierCurveTo(-.20,-1.02,-.46,-.96,-.49,-.72);s.bezierCurveTo(-.54,-.45,-.35,-.37,-.42,-.28);s.lineTo(-.32,-.28);s.bezierCurveTo(-.19,-.20,-.20,.06,-.36,.11);s.lineTo(-.27,.14);s.bezierCurveTo(-.29,.18,-.39,.26,-.40,.39);s.bezierCurveTo(-.41,.62,-.21,.74,0,.72);s.closePath();
  const outline=s.getSpacedPoints(140);
  // Actual apertures, arched soundboard, maple ribs and narrow inlaid edgework.
  for(const sign of [-1,1]){
   const h=new THREE.Path();h.moveTo(sign*.22,.23);h.bezierCurveTo(sign*.38,.29,sign*.27,.10,sign*.25,.02);h.bezierCurveTo(sign*.20,-.15,sign*.15,-.28,sign*.28,-.35);h.bezierCurveTo(sign*.11,-.34,sign*.18,-.12,sign*.20,.02);h.bezierCurveTo(sign*.27,.20,sign*.31,.23,sign*.22,.23);const visited=new Set();for(const curve of h.curves)for(const key of ['v0','v1','v2','v3']){const pt=curve[key];if(pt&&!visited.has(pt)){visited.add(pt);pt.x=pt.x*.44+sign*.04;pt.y=pt.y*.78-.06;}}s.holes.push(h);
  }
  const back=s.clone();back.holes=[];carved(g,back,-.18,.19,ribs,ribs,.012);
  const geo=uv(subdivide(new THREE.ShapeGeometry(s,20),2),[-.5,.5,-1,.74]);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.058+.065*Math.max(0,1-x*x*4)*Math.max(0,1-Math.pow((y+.13)/1.0,2)));}geo.computeVertexNormals();mesh(g,geo,spruce);
  for(const [f,r,mat] of [[1,.008,ivory],[.972,.004,dark]])tube(g,outline.map(v=>V(v.x*f,v.y*f,.055)),r,mat,true);
  const neck=kind==='bass'?.98:kind==='cello'?1.05:1.20;
  carved(g,polygon([[-.067,.49],[.067,.49],[.058,.72+neck],[-.058,.72+neck]]),-.04,.12,head,ribs,.01);
  carved(g,polygon([[-.095,.08],[.095,.08],[.054,.75+neck],[-.054,.75+neck]]),.13,.035,ebony,ebony,.006);
  const pegTop=.9+neck;carved(g,polygon([[-.075,.68+neck],[.075,.68+neck],[.10,pegTop+.13],[-.10,pegTop+.13]]),.025,.10,head,ribs,.006);
  const spiral=[];for(let i=0;i<55;i++){const t=i/54*Math.PI*4.8,r=.103*(1-i/65);spiral.push(V(Math.cos(t)*r,pegTop+.17+Math.sin(t)*r,.11));}tube(g,spiral,.022,head);
  for(let i=0;i<4;i++){const sign=i%2?1:-1,y=.8+neck+i*.072;rod(g,V(0,y,.075),V(sign*.16,y,.075),.012,ebony);ball(g,sign*.177,y,.075,.045,.026,.022,ebony);}
  carved(g,polygon([[-.1,-.42],[.1,-.42],[.07,-.84],[-.07,-.84]]),.10,.045,ebony,ebony,.008);
  const bridge=polygon([[-.17,-.33],[.17,-.33],[.145,-.19],[.07,-.17],[0,-.19],[-.07,-.17],[-.145,-.19]]);
  const bh=new THREE.Path();bh.absellipse(0,-.295,.062,.045,0,Math.PI*2,true);bridge.holes.push(bh);carved(g,bridge,.14,.026,ivory,ivory,.003);
  const strings=mover(g,'strings');for(let i=0;i<4;i++){const x=(i-1.5)*.025;rod(strings,V(x,-.79,.20),V(x,.79+neck,.195),.0024,i===0?metal:gold,5);}
  ball(g,0,-1.03,-.05,.035,.035,.035,ebony);
  if(kind!=='violin')rod(g,V(0,-1.02,-.05),V(0,-1.42,-.05),.012,metal);
  else{const chin=ball(g,-.24,-.76,.13,.22,.115,.047,ebony);chin.rotation.z=-.18;}
  const bow=mover(g,'bow');bow.position.set(0,-.10,.26);bow.rotation.z=-.10;
  tube(bow,[V(-.78,0,0),V(-.25,.042,0),V(.35,.045,0),V(.85,.018,0)],.012,ribs);
  rod(bow,V(-.75,-.034,0),V(.82,-.028,0),.007,hair,6);box(bow,-.72,-.012,0,.14,.062,.047,ebony);box(bow,-.64,-.04,0,.05,.014,.055,metal);rod(bow,V(-.79,0,0),V(-.9,0,0),.012,metal);
  return g;
 }
 function wind(type){
  const g=new THREE.Group(),flute=type==='flute',len=flute?2.8:2.65,body=flute?spruce:ebony,r=flute?.073:.08;
  rod(g,V(0,-len/2,0),V(0,len/2,0),r,body,20,flute?r:.06);
  for(let i=0;i<5;i++){const ring1=ring(g,0,-1.08+i*.48,0,r+.006,.009,flute?gold:ivory);ring1.rotation.x=Math.PI/2;}
  rod(g,V(.082,-.9,.047),V(.082,1.03,.047),.012,gold);
  for(let i=0;i<9;i++){
   const k=mover(g,'key',i);k.position.set(0,-.87+i*.205,.063);
   rod(k,V(.085,0,0),V(0,0,.038),.008,metal);const disk=mesh(k,new THREE.CylinderGeometry(.047,.047,.012,14),gold,0,0,.036);disk.rotation.x=Math.PI/2;
   rod(g,V(-.032,k.position.y,0),V(-.096,k.position.y+.07,.065),.008,gold);
  }
  if(!flute){
   const pts=[new THREE.Vector2(.077,0),new THREE.Vector2(.09,-.15),new THREE.Vector2(.145,-.32),new THREE.Vector2(.24,-.39)];mesh(g,new THREE.LatheGeometry(pts,28),head,0,-len/2+.04,0);
   const rr=ring(g,0,-len/2-.35,0,.24,.015,ivory);rr.rotation.x=Math.PI/2;
   const mouth=box(g,0,len/2+.13,0,.11,.30,.11,ebony);mouth.rotation.x=-.22;box(g,0,len/2+.12,.069,.072,.20,.012,ivory);
  }else{
   ball(g,0,1.09,.079,.13,.083,.024,gold);ball(g,0,1.09,.105,.044,.029,.003,dark);
   const cap=mesh(g,new THREE.CylinderGeometry(r,r,.023,18),ivory,0,len/2+.008,0);
   g.rotation.z=-Math.PI/2;
  }
  return g;
 }
 function horn(){
  const g=new THREE.Group();
  for(const [r,z] of [[.45,0],[.33,.085],[.25,.12]]){
   const pts=[];for(let i=0;i<65;i++){const a=i/64*Math.PI*1.84;pts.push(V(Math.cos(a)*r,Math.sin(a)*r,z));}tube(g,pts,.032,warmBrass);
  }
  tube(g,[V(.42,-.14,0),V(.61,.05,0),V(.48,.25,.07),V(.16,.38,.14),V(-.28,.53,.06),V(-.51,.64,.03)],.025,warmBrass);
  ball(g,-.53,.65,.03,.046,.023,.033,gold);
  const bell=new THREE.Group();bell.position.set(.15,.29,-.045);bell.quaternion.setFromUnitVectors(V(0,1,0),V(.56,.7,.44).normalize());g.add(bell);
  const pts=[[.038,0],[.048,.10],[.075,.22],[.12,.37],[.21,.52],[.35,.63],[.43,.66]].map(([r,y])=>new THREE.Vector2(r,y));
  mesh(bell,new THREE.LatheGeometry(pts,40),warmBrass);const rim=ring(bell,0,.66,0,.43,.014,gold);rim.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++){
   const x=-.12+i*.11;rod(g,V(x,-.12,.18),V(x,.20,.18),.043,warmBrass,14);
   const valve=mover(g,'valve',i);valve.position.set(x,.23,.18);rod(valve,V(0,-.08,0),V(0,.05,0),.012,metal);ball(valve,0,.052,0,.048,.014,.035,ivory);
  }
  return g;
 }
 function electric(){
  const g=new THREE.Group(),s=new THREE.Shape();s.moveTo(-.11,.54);s.bezierCurveTo(-.25,.42,-.21,.85,-.39,.91);s.bezierCurveTo(-.43,.68,-.30,.33,-.45,.20);s.bezierCurveTo(-.73,-.18,-.6,-.83,-.31,-.92);s.bezierCurveTo(-.04,-1.02,.45,-.96,.57,-.66);s.bezierCurveTo(.74,-.28,.42,.05,.29,.26);s.bezierCurveTo(.20,.42,.4,.69,.30,.73);s.bezierCurveTo(.08,.72,.24,.48,.11,.54);s.closePath();carved(g,s,-.16,.26,spruce,ribs,.035);
  carved(g,polygon([[-.082,.22],[.082,.22],[.059,1.82],[-.059,1.82]]),.12,.04,ebony,head,.009);
  carved(g,polygon([[-.06,1.79],[.06,1.79],[.28,2.12],[.30,2.36],[-.045,2.19]]),.08,.085,head,ribs,.012);
  for(let i=0;i<22;i++){const y=1.8-2.30*(1-Math.pow(2,-i/12));rod(g,V(-.08,y,.169),V(.08,y,.169),.0025,metal,5);if([3,5,7,9,12,15,17].includes(i))ball(g,0,y-.025,.174,.007,.007,.002,ivory);}
  for(const y of [-.17,.08]){box(g,0,y,.15,.36,.10,.03,ebony);for(let i=0;i<6;i++)ball(g,(i-2.5)*.047,y,.175,.009,.009,.004,metal);}
  box(g,0,-.51,.152,.36,.14,.045,metal);for(let i=0;i<6;i++){box(g,(i-2.5)*.048,-.48,.18,.032,.07,.022,gold);rod(g,V(.025+i*.029,1.98+i*.047,.10),V(.12+i*.029,1.98+i*.047,.10),.012,metal);ball(g,.14+i*.029,1.98+i*.047,.10,.030,.019,.022,ivory);}
  const strings=mover(g,'strings');for(let i=0;i<6;i++)rod(strings,V((i-2.5)*.047,-.54,.201),V((i-2.5)*.021,1.84,.19),.0018,metal,5);
  for(const [x,y] of [[.32,-.37],[.37,-.61]]){const k=mesh(g,new THREE.CylinderGeometry(.043,.044,.039,20),gold,x,y,.17);k.rotation.x=Math.PI/2;}
  rod(g,V(.17,-.5,.18),V(.44,-.3,.22),.009,metal);return g;
 }
 function keyboard(){
  const g=new THREE.Group();const s=new THREE.Shape();s.moveTo(-.87,-.79);s.lineTo(.89,-.79);s.lineTo(.89,.09);s.bezierCurveTo(.87,.77,.17,1.29,-.5,1.98);s.lineTo(-.87,1.98);s.closePath();
  carved(g,s,-.22,.27,spruce,ribs,.018);
  const edge=s.getPoints(55);tube(g,edge.map(p=>V(p.x,p.y,.061)),.019,head,true);
  for(let i=0;i<24;i++)rod(g,V(-.74+i*.063,-.25,.081),V(-.74+i*.030,1.76-i*.052,.081),.0018,gold,5);
  rod(g,V(-.73,.75,.085),V(.49,.11,.085),.021,head);
  box(g,0,-.63,.12,1.78,.41,.12,ebony);
  for(let i=0;i<28;i++){
   const k=mover(g,'piano-key',i);k.position.set(-.81+i*.060,-.64,.197);box(k,0,0,0,.057,.37,.045,ivory);
   if(![2,6].includes(i%7)){box(g,-.79+i*.06,-.56,.235,.033,.21,.047,ebony);}
  }
  const lid=new THREE.Group();lid.position.set(-.87,0,.13);lid.rotation.y=-1.04;g.add(lid);
  const lidShape=s.clone();const lidFace=carved(lid,lidShape,0,.03,head,ribs,.007);lidFace.position.x=.87;
  rod(g,V(.48,.06,.08),V(-.1,.10,.91),.018,head);
  // Instrument case floats by itself: no stool, performer or floor plane.
  return g;
 }
 // V26: distinct silhouettes, with the same mapped paper-grain finish as the guitar.
 function harp(){
  const g=new THREE.Group();
  const body=polygon([[-.73,-1.06],[-.48,-1.03],[.61,.96],[.43,1.06]]);
  carved(g,body,-.12,.24,spruce,ribs,.025);
  rod(g,V(-.68,-1.04,0),V(-.72,1.47,0),.055,head,18,.075);
  for(const y of [-.98,1.31,1.42]){const rr=ring(g,-.72,y,0,.082,.012,gold);rr.rotation.x=Math.PI/2;}
  const neck=[V(-.72,1.43,0),V(-.43,1.39,0),V(-.13,1.18,0),V(.13,1.25,0),V(.51,1.03,0)];tube(g,neck,.07,head);
  box(g,-.55,-1.12,0,.58,.15,.38,head);
  const strings=mover(g,'harp-strings');
  for(let i=0;i<23;i++){
   const t=i/22,x=-.61+t*1.09,yTop=1.35-.30*t-.13*Math.sin(t*Math.PI*1.5),yBottom=-1.0+t*1.88;
   rod(strings,V(x,yBottom,.035),V(x,yTop,.035),.0022,i%7===0?head:i%7===3?ebony:gold,5);
   ball(g,x,yTop,.04,.013,.014,.025,gold);
  }
  return g;
 }
 function bassoon(){
  const g=new THREE.Group();
  rod(g,V(-.07,-1.12,0),V(-.07,1.31,0),.085,head,18,.06);
  rod(g,V(.08,-1.12,0),V(.08,.53,0),.061,ribs,18,.045);
  tube(g,[V(-.07,-1.1,0),V(-.07,-1.24,0),V(.085,-1.24,0),V(.085,-1.09,0)],.075,head);
  const rim=ring(g,-.07,1.31,0,.069,.012,ivory);rim.rotation.x=Math.PI/2;
  tube(g,[V(.08,.52,0),V(.13,.85,.04),V(.35,.90,.05),V(.36,1.13,.045)],.015,metal);rod(g,V(.36,1.13,.045),V(.35,1.23,.045),.017,ivory);
  for(let i=0;i<11;i++){
   const y=-.89+i*.17,k=mover(g,'key',i);k.position.set(-.055,y,.075);
   const disk=mesh(k,new THREE.CylinderGeometry(.036,.036,.012,12),metal,0,0,.026);disk.rotation.x=Math.PI/2;
   rod(k,V(0,0,.026),V(.14,.08,.026),.008,metal);
  }
  for(const y of [-1.03,-.45,.48]){const rr=ring(g,-.07,y,0,.086,.01,metal);rr.rotation.x=Math.PI/2;}
  return g;
 }
 function brass(type){
  const g=new THREE.Group(),trombone=type==='trombone';
  // Open brass bell, rolled lip and tapered lead pipe.
  const bell=new THREE.Group();bell.position.set(.28,.22,0);bell.rotation.z=-Math.PI/2;g.add(bell);
  const pts=[[.033,0],[.036,.23],[.052,.48],[.09,.68],[.16,.84],[.27,.93]].map(([r,y])=>new THREE.Vector2(r,y));
  mesh(bell,new THREE.LatheGeometry(pts,32),warmBrass);const lip=ring(bell,0,.93,0,.27,.012,gold);lip.rotation.x=Math.PI/2;
  tube(g,[V(.28,.22,0),V(-.47,.22,0),V(-.61,.12,0),V(-.54,-.12,0),V(-.35,-.17,0)],.028,warmBrass);
  if(trombone){
   rod(g,V(-.43,.11,.07),V(.42,.11,.07),.022,metal);rod(g,V(-.43,-.16,.07),V(.42,-.16,.07),.022,metal);
   const slide=mover(g,'slide');tube(slide,[V(-.05,.11,.07),V(1.25,.11,.07),V(1.41,-.02,.07),V(1.25,-.16,.07),V(-.05,-.16,.07)],.029,warmBrass);
   rod(slide,V(.84,.11,.07),V(.84,-.16,.07),.014,gold);rod(g,V(-.33,.1,.07),V(-.33,-.17,.07),.022,gold);
   rod(g,V(-.48,.12,.07),V(-.87,.12,.07),.02,metal);ball(g,-.89,.12,.07,.03,.06,.05,metal);
  }else{
   tube(g,[V(-.35,-.17,0),V(.51,-.17,0),V(.58,-.07,0),V(.48,.025,0),V(-.39,.025,0),V(-.77,.04,.04)],.032,warmBrass);
   ball(g,-.80,.04,.04,.034,.055,.05,metal);
   for(let i=0;i<3;i++){
    const x=-.17+i*.18;rod(g,V(x,-.24,.08),V(x,.21,.08),.051,warmBrass,16);
    const valve=mover(g,'valve',i);valve.position.set(x,.25,.08);rod(valve,V(0,-.06,0),V(0,.05,0),.015,metal);ball(valve,0,.061,0,.057,.015,.049,ivory);
   }
  }
  g.rotation.z=trombone?-.19:.08;return g;
 }
 function timpani(){
  const g=new THREE.Group();
  const pts=[[.04,-.53],[.26,-.49],[.47,-.34],[.62,-.10],[.64,.14]].map(([r,y])=>new THREE.Vector2(r,y));
  mesh(g,new THREE.LatheGeometry(pts,32),warmBrass);
  const rim=ring(g,0,.16,0,.65,.025,gold);rim.rotation.x=Math.PI/2;
  mesh(g,new THREE.CylinderGeometry(.63,.63,.026,36),paper,0,.15,0);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;rod(g,V(Math.cos(a)*.66,-.02,Math.sin(a)*.66),V(Math.cos(a)*.66,.21,Math.sin(a)*.66),.018,metal);}
  for(const sign of [-1,1]){
   const m=mover(g,'mallet',sign<0?0:1);m.position.set(sign*.35,.60,.27);m.rotation.z=sign*.34;
   rod(m,V(0,0,0),V(0,-.53,0),.018,head);ball(m,0,-.55,0,.066,.063,.066,ivory);
  }
  g.rotation.x=.48;return g;
 }
 function cymbals(){
  const g=new THREE.Group();
  for(const sign of [-1,1]){
   const c=mover(g,'cymbal',sign<0?0:1);c.position.set(sign*.24,0,0);c.rotation.set(.70,sign*.35,sign*.10);
   const pts=[[0,.055],[.10,.055],[.15,.015],[.20,-.025],[.55,-.048],[.59,-.051]].map(([r,y])=>new THREE.Vector2(r,y));
   mesh(c,new THREE.LatheGeometry(pts,36),warmBrass);const rr=ring(c,0,-.048,0,.58,.006,gold);rr.rotation.x=Math.PI/2;ball(c,0,.073,0,.07,.018,.07,ebony);
   for(const r of [.25,.36,.47]){const rr=ring(c,0,-.034,0,r,.0025,gold);rr.rotation.x=Math.PI/2;}
  }
  return g;
 }
 function marimba(){
  const g=new THREE.Group();
  for(let i=0;i<15;i++){
   const x=-1.04+i*.15,len=.88-i*.026;
   const key=mover(g,'bar',i);key.position.set(x,0,.10);box(key,0,0,0,.135,len,.065,i%2?head:spruce);
   const pipe=mesh(g,new THREE.CylinderGeometry(.044,.044,len*.65,10),warmBrass,x,-.15,-.18);pipe.rotation.x=.30;
   if(![2,6].includes(i%7))box(g,x+.07,.48,.12,.115,.43,.065,head);
  }
  rod(g,V(-1.16,-.32,0),V(1.18,-.32,0),.035,ribs);rod(g,V(-1.16,.35,0),V(1.18,.35,0),.035,ribs);
  for(const sign of [-1,1]){const m=mover(g,'mallet',sign<0?0:1);m.position.set(sign*.34,.64,.38);m.rotation.z=sign*.32;rod(m,V(0,0,0),V(0,-.55,0),.014,head);ball(m,0,-.57,0,.055,.055,.055,ivory);}
  g.rotation.x=-.28;return g;
 }

 function floatingScore(){
  const g=new THREE.Group();
  const c=document.createElement('canvas');c.width=760;c.height=510;const ctx=c.getContext('2d');ctx.fillStyle='#f0dfb3';ctx.fillRect(0,0,760,510);ctx.strokeStyle='#556041';ctx.lineWidth=1.2;
  for(let row=0;row<4;row++){for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(30,55+row*105+i*9);ctx.lineTo(730,55+row*105+i*9);ctx.stroke();}for(let i=0;i<16;i++){const x=52+i*42,y=72+row*105+Math.sin(i*1.7+row)*15;ctx.beginPath();ctx.ellipse(x,y,5.8,3.8,-.4,0,Math.PI*2);ctx.fillStyle='#556041';ctx.fill();ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x+5,y-26);ctx.stroke();}}
  ctx.strokeStyle='#c5b382';ctx.beginPath();ctx.moveTo(380,12);ctx.lineTo(380,495);ctx.stroke();
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshStandardMaterial({map:tex,roughness:1,transparent:true,depthWrite:false});scoreMaterials.push(mat);mesh(g,new THREE.PlaneGeometry(1.79,1.20),mat,0,0,-.035);
  return g;
 }
 // Bake all unmoving model parts by material; instances share those buffers.
 function bake(group){
  const assembly=new THREE.Group();assembly.add(group);group=assembly;
  group.updateMatrixWorld(true);const byMaterial=new Map(),remove=[];
  group.traverse(m=>{
   if(!m.isMesh)return;let p=m,moving=false;while(p&&p!==group){if(p.userData.role){moving=true;break;}p=p.parent;}if(moving)return;
   const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrixWorld);
   const parts=Array.isArray(m.material)?geo.groups.map(x=>({mat:m.material[x.materialIndex],start:x.start,count:x.count})):[{mat:m.material,start:0,count:geo.attributes.position.count}];
   for(const {mat,start,count} of parts){if(!byMaterial.has(mat))byMaterial.set(mat,[]);const data={};for(const name of ['position','normal','uv']){const a=geo.attributes[name];data[name]=a.array.slice(start*a.itemSize,(start+count)*a.itemSize);}byMaterial.get(mat).push(data);}remove.push(m);geo.dispose();
  });
  remove.forEach(m=>m.removeFromParent());
  for(const [mat,list] of byMaterial){const geo=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const size=name==='uv'?2:3;const a=new Float32Array(list.reduce((sum,d)=>sum+d[name].length,0));let off=0;for(const d of list){a.set(d[name],off);off+=d[name].length;}geo.setAttribute(name,new THREE.BufferAttribute(a,size));}geo.computeBoundingSphere();mesh(group,geo,mat);}
  const wrap=new THREE.Group();wrap.add(group);const bounds=new THREE.Box3().setFromObject(wrap),center=bounds.getCenter(V());group.position.sub(center);return {root:wrap,height:bounds.max.y-bounds.min.y,width:bounds.max.x-bounds.min.x};
 }
 const templates={violin:bake(violin()),viola:null,cello:bake(violin('cello')),bass:bake(violin('bass')),flute:bake(wind('flute')),clarinet:bake(wind('clarinet')),horn:bake(horn()),electric:bake(electric()),keyboard:bake(keyboard()),harp:bake(harp()),bassoon:bake(bassoon()),trumpet:bake(brass('trumpet')),trombone:bake(brass('trombone')),timpani:bake(timpani()),cymbals:bake(cymbals()),marimba:bake(marimba())};templates.viola=templates.violin;
 // An audience-facing orchestral plan: percussion at the rear, brass and winds
 // in paired rows, violins left, violas inward, cellos right and basses behind.
 // Each instrument retains a clear silhouette and a shared family orientation.
 const seating=[["marimba",515,187,150,"percussion"],["timpani",695,166,104,"percussion"],["timpani",885,185,104,"percussion"],["cymbals",1020,204,84,"percussion"],["horn",345,334,114,"brass"],["trumpet",515,305,130,"brass"],["trumpet",690,290,130,"brass"],["trombone",890,305,150,"brass"],["horn",1065,340,114,"brass"],["horn",1180,405,108,"brass"],["flute",512,414,136,"woodwinds"],["flute",685,409,136,"woodwinds"],["clarinet",835,436,124,"woodwinds"],["clarinet",915,436,124,"woodwinds"],["bassoon",1020,493,152,"woodwinds"],["bassoon",1090,518,152,"woodwinds"],["violin",244,555,146,"first-violins"],["violin",319,690,146,"first-violins"],["violin",435,782,146,"first-violins"],["violin",355,491,136,"second-violins"],["violin",437,613,136,"second-violins"],["viola",563,638,149,"violas"],["viola",590,800,149,"violas"],["viola",760,815,149,"violas"],["cello",928,802,190,"cellos"],["cello",1073,715,190,"cellos"],["cello",1180,613,190,"cellos"],["bass",1204,235,211,"double-basses"],["bass",1325,408,211,"double-basses"],["harp",161,351,250,"harp"],["keyboard",1316,660,210,"keyboard"],["electric",95,615,158,"electric"]];
 seating.forEach(([type,x,y,size,family],i)=>{
  const template=templates[type],g=template.root.clone(true);
  const horizontal=['flute','trumpet','trombone','marimba','cymbals'].includes(type);
  const scale=size/(horizontal?template.width:template.height);
  g.scale.setScalar(scale);g.position.set(x-720,450-y,-(790-y)*.11);
  const tilt=type==='violin'||type==='viola'?(x<720?-.10:.10):type==='flute'?0:type==='keyboard'?.06:type==='electric'?.12:type==='bassoon'||type==='clarinet'?.04:0;
  g.rotation.set(type==='keyboard'?-.78:-.12,type==='keyboard'?-.32:(x<720?1:-1)*.20,tilt);logical.add(g);
  const moving=[];g.traverse(n=>{if(n.userData.role)moving.push({node:n,role:n.userData.role,slot:n.userData.slot||0,p:n.position.clone(),r:n.rotation.clone()});});
  const bounds=new THREE.Box3().setFromObject(g),span=bounds.getSize(V());
  records.push({g,type,family,size,span:span.clone(),base:g.position.clone(),rotation:g.rotation.clone(),moving,entryRadius:Math.max(span.x,span.z)/2+24});
 });
 // Exactly half the ensemble enters from each edge, with the back row leading.
 const ordered=[...records].sort((a,b)=>a.base.x-b.base.x);
 ordered.forEach((rec,i)=>rec.entrySide=i<ordered.length/2?-1:1);
 for(const side of [-1,1])ordered.filter(r=>r.entrySide===side).sort((a,b)=>b.base.y-a.base.y).forEach((rec,i)=>rec.entryDelay=i/15*.12);
 // The shared score starts as a floating sheet, with no stand, conductor or people.
 const openingPaper=floatingScore();openingPaper.position.set(0,450-550,70);openingPaper.scale.setScalar(103);logical.add(openingPaper);
 const byGeometry=new Map();logical.updateMatrixWorld(true);
 logical.traverse(n=>{if(!n.isMesh)return;const id=n.geometry.uuid+':'+n.material.uuid;if(!byGeometry.has(id))byGeometry.set(id,{geometry:n.geometry,material:n.material,nodes:[]});byGeometry.get(id).nodes.push(n);});
 for(const data of byGeometry.values()){const mesh=new THREE.InstancedMesh(data.geometry,data.material,data.nodes.length);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;projection.add(mesh);batches.push({mesh,nodes:data.nodes});}
 available=true;
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();available=false;world.classList.add('orchestra-unavailable');cancelAnimationFrame(raf);raf=0;});
 canvas.addEventListener('webglcontextrestored',()=>{available=true;world.classList.remove('orchestra-unavailable');requestDraw();});
}catch(e){world.classList.add('orchestra-unavailable');console.warn('Orchestra artwork fallback:',e.message);}
function playing(){return available&&ready&&view.visible&&view.performance>0&&!view.paused&&!view.reduced&&!document.hidden;}
function pose(t){
 const energy=view.reduced?0:view.performance,phrase=t*Math.PI/2,beat=t*Math.PI*2; // 60 BPM, one shared four-beat phrase.
 const scale=Math.max(.001,view.baseScale*view.s),center=view.offsetX+view.baseScale*(view.tx+720*view.s);
 const mobileFactor=width<=800&&!view.reduced?.86:1;
 const leftTravel=center/scale+Math.max(...records.filter(r=>r.entrySide<0).map(r=>r.base.x*mobileFactor+r.entryRadius))+60;
 const rightTravel=(width-center)/scale-Math.min(...records.filter(r=>r.entrySide>0).map(r=>r.base.x*mobileFactor-r.entryRadius))+60;
 records.forEach(rec=>{
  rec.g.position.copy(rec.base);rec.g.rotation.copy(rec.rotation);
  if(width<=800&&!view.reduced){
   rec.g.position.x*=.86;
   rec.g.position.y*=1.15;
  }
  const entry=view.reduced?1:smooth((view.entrance-rec.entryDelay)/(1-rec.entryDelay));
  // Translate each half as a formation; gentle row staggering avoids a rigid wipe.
  rec.g.position.x+=rec.entrySide*(rec.entrySide<0?leftTravel:rightTravel)*(1-entry);
  rec.g.position.y+=Math.sin(Math.PI*entry)*22;
  rec.g.rotation.y+=rec.entrySide*.20*(1-entry);rec.g.rotation.z+=rec.entrySide*.075*(1-entry);
  rec.g.position.y+=Math.sin(phrase)*3.5*energy;rec.g.rotation.z+=Math.sin(phrase)*.016*energy;
  rec.moving.forEach(({node,role,slot,p,r})=>{
   node.position.copy(p);node.rotation.copy(r);
   if(role==='bow'){node.position.x+=Math.sin(beat/2)*.24*energy;node.rotation.z+=Math.sin(phrase)*.022*energy;}
   if(role==='strings'||role==='harp-strings')node.position.x+=Math.sin(beat*7)*.0017*energy;
   if(role==='slide')node.position.x+=.13*(1-Math.cos(beat/2))*energy;
   if(role==='mallet'){node.rotation.x+=.30*Math.sin(beat+slot*Math.PI)*energy;node.position.y+=.035*Math.cos(beat+slot*Math.PI)*energy;}
   if(role==='cymbal'){node.position.x+=(slot===0?1:-1)*.028*(1-Math.cos(phrase))*energy;node.rotation.z+=.018*Math.sin(beat)*energy;}
   if(role==='bar')node.position.z+=.0015*Math.sin(beat*5-slot*.3)*energy;
   const press=Math.pow(Math.max(0,Math.sin(beat-slot%3*Math.PI*.5)),3)*energy;
   if(role==='key'){node.rotation.y-=press*.15;node.position.z-=press*.008;}
   if(role==='valve')node.position.y-=press*.035;
   if(role==='piano-key'){node.rotation.x-=press*.065;node.position.z-=press*.019;}
  });
 });
 logical.updateMatrixWorld(true);
 for(const {mesh,nodes} of batches){nodes.forEach((n,i)=>mesh.setMatrixAt(i,n.matrixWorld));mesh.instanceMatrix.needsUpdate=true;}
}
function paint(force=false){
 if(!available||(!view.visible&&!force))return;
 pose(view.reduced?0:time);
 const fade=clamp(((view.approach||0)-.18)/.32,0,1);scoreMaterials.forEach(m=>m.opacity=view.reduced?0:view.sheetReveal*(1-fade*fade*(3-2*fade)));
 projection.scale.setScalar(view.baseScale*view.s);
 projection.position.set(view.offsetX+view.baseScale*(view.tx+720*view.s)-width/2,height/2-(view.offsetY+view.baseScale*(view.ty+450*view.s)),0);
 renderer.render(scene,camera);renderCount++;
 window.__taanOrchestra={entrance:view.entrance,performance:view.performance,fromLeft:records.filter(r=>r.entrySide<0).length,fromRight:records.filter(r=>r.entrySide>0).length,sheetReveal:view.sheetReveal,instruments:records.length,people:0,transparent:true,ready,playing:playing(),time,renderCount,beatBpm:60,textureSources:[...new Set(textureNames)],materialMatch:'guitar-pdf-matte-and-lighting',seating:records.map(r=>({type:r.type,family:r.family,x:r.base.x+720,y:450-r.base.y,size:r.size,width:r.span.x,height:r.span.y,side:r.entrySide})),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,width:canvas.width,height:canvas.height,types:records.reduce((a,r)=>(a[r.type]=(a[r.type]||0)+1,a),{})};
}
function tick(now){raf=0;if(playing()){time+=last?Math.min(now-last,50)/1000:0;last=now;}else last=0;paint();if(playing())raf=requestAnimationFrame(tick);}
function requestDraw(){if(!available||!view.visible)return;if(!raf)raf=requestAnimationFrame(tick);}
function resize(w,h){width=w;height=h;if(!available)return;renderer.setPixelRatio(Math.min(devicePixelRatio,w<=800?1.6:1.5,3840/w));renderer.setSize(w,h,false);camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();requestDraw();}
function update(next){
 view={...view,...next};if(view.performance<=0)time=0;if(!playing())last=0;
 if(!view.visible){cancelAnimationFrame(raf);raf=0;if(window.__taanOrchestra)window.__taanOrchestra.playing=false;return;}
 requestDraw();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else requestDraw();});
window.TaanOrchestra={resize,update,get available(){return available;},capture(){paint(true);return canvas.toDataURL('image/png');},get textures(){return textureNames;}};
})();
