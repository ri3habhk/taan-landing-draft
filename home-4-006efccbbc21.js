/* Continuous camera tour; v11 materials sampled from the user's Taan flow PDF. */
(()=>{
'use strict';
const canvas=document.getElementById('guitar-canvas'),fallback=document.querySelector('.fallback-guitar');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
const v3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
let renderer,scene,camera,guitar,available=false,ready=false,w=innerWidth,h=innerHeight,mobile=w<=800||h<480;
let totalTextures=0,loadedTextures=0;
let focus,projected,holeShade,interiorBackdrop,releaseFrame=null;
try{
 if(!window.THREE)throw Error('WebGL unavailable');focus=v3();projected=v3();
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 renderer.setClearColor(0,0);
 camera=new THREE.PerspectiveCamera(34,w/h,.009,70);scene=new THREE.Scene();guitar=new THREE.Group();scene.add(guitar);
 const ambient=new THREE.HemisphereLight(0xfff1d5,0x24160d,1.05);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xffecd1,1.8);key.position.set(-3.5,4,6);scene.add(key);
 const fill=new THREE.DirectionalLight(0xe4e0c7,.7);fill.position.set(4,1,3);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xffcf8b,1.25);rim.position.set(-2,-1,-4);scene.add(rim);
 const holeLight=new THREE.PointLight(0xffe5bd,.52,3,1);holeLight.position.set(0,.1,.16);guitar.add(holeLight);
 const innerLight=new THREE.PointLight(0xffd8a4,.10,2,1);innerLight.position.set(.3,-.7,-.20);guitar.add(innerLight);
 const materialSources=[];
 const tex=(name,data=false)=>{totalTextures++;materialSources.push(name);const t=new THREE.TextureLoader().load(TAAN_ART[name],()=>{loadedTextures++;if(loadedTextures===totalTextures){ready=true;dispatchEvent(new Event('taan-art-ready'));}});t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());return t;};
 const finish=(name,options={})=>new THREE.MeshPhysicalMaterial({map:tex(name),bumpMap:tex(name+'-bump',true),bumpScale:.0007,roughness:.83,metalness:0,clearcoat:.04,clearcoatRoughness:.8,...options});
 const topMat=finish('pdf-top-v11',{roughness:.88,clearcoat:.025});
 const sideMat=finish('pdf-side-v11',{roughness:.78,side:THREE.DoubleSide});
 const headMat=finish('pdf-head-v11',{roughness:.81});
 // Smooth PDF wood samples live on the moving geometry; no flat image overlay.
 const insideMat=new THREE.MeshStandardMaterial({map:tex('pdf-soft-floor-v13'),roughness:.9,metalness:0,side:THREE.DoubleSide});
 const innerWallMat=new THREE.MeshStandardMaterial({map:tex('pdf-soft-wall-v13'),roughness:.92,metalness:0,side:THREE.DoubleSide});
 insideMat.map.wrapS=insideMat.map.wrapT=THREE.MirroredRepeatWrapping;
 innerWallMat.map.wrapS=innerWallMat.map.wrapT=THREE.MirroredRepeatWrapping;
 const ebony=finish('pdf-darkwood-v11',{roughness:.87,clearcoat:.02});
 const black=ebony;
 const gold=new THREE.MeshStandardMaterial({color:0xc4a369,metalness:.75,roughness:.34});
 const chrome=new THREE.MeshStandardMaterial({color:0xd1b979,metalness:.84,roughness:.32});
 const ivory=new THREE.MeshStandardMaterial({color:0xe8cb8c,roughness:.68});
 const darkTrim=new THREE.MeshStandardMaterial({color:0x2b1b10,roughness:.5});
 const stringMats=[0,1,2,3,4,5].map(i=>new THREE.MeshStandardMaterial({color:i<3?0xd7b27b:0xd5cfb9,metalness:.84,roughness:.29}));
 const shape=new THREE.Shape();
 shape.moveTo(-.12,.645);shape.bezierCurveTo(-.50,.68,-.665,.48,-.615,.23);shape.bezierCurveTo(-.58,.04,-.58,-.10,-.64,-.30);shape.bezierCurveTo(-.715,-.56,-.90,-.76,-.84,-1.04);shape.bezierCurveTo(-.79,-1.40,-.53,-1.485,-.22,-1.485);shape.bezierCurveTo(-.08,-1.49,.22,-1.49,.34,-1.47);shape.bezierCurveTo(.71,-1.44,.875,-1.27,.85,-.98);shape.bezierCurveTo(.84,-.74,.69,-.50,.625,-.30);shape.bezierCurveTo(.56,-.10,.57,.04,.61,.24);shape.bezierCurveTo(.66,.49,.49,.67,.12,.645);shape.closePath();
 const hole=new THREE.Path();hole.absarc(0,0,.244,0,Math.PI*2,true);shape.holes.push(hole);
 const contour=shape.getPoints(128);
 function uvGeometry(geo,bounds){const p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-bounds[0])/(bounds[1]-bounds[0]),(p.getY(i)-bounds[2])/(bounds[3]-bounds[2]));uv.needsUpdate=true;return geo;}
 function face(s,z,mat,bounds=[-.87,.87,-1.49,.68],flip=false){const geo=uvGeometry(new THREE.ShapeGeometry(s,96),bounds);const mesh=new THREE.Mesh(geo,mat);mesh.position.z=z;if(flip)mesh.rotation.y=Math.PI;guitar.add(mesh);return mesh;}
 face(shape,.012,topMat);
 // Thin soundboard underside and closed back make the interior a real space.
 face(shape,-.016,insideMat);
 const backShape=shape.clone();backShape.holes=[];face(backShape,-.415,insideMat);face(backShape,-.432,sideMat);
 function sideWall(points,z0,z1,mat){const pos=[],uv=[],indices=[];let len=0;for(let i=0;i<points.length;i++){if(i)len+=points[i].distanceTo(points[i-1]);const p=points[i];pos.push(p.x,p.y,z0,p.x,p.y,z1);uv.push(len/1.74,0,len/1.74,(z1-z0)/2.17);if(i<points.length-1){let k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);guitar.add(m);return m;}
 sideWall(contour,-.432,.012,sideMat);
 // Interior walls use the darker grain from PDF page 6, separate from the floor.
 sideWall(contour.map(p=>p.clone().multiplyScalar(.993)),-.413,-.018,innerWallMat);
 const holePoints=Array.from({length:129},(_,i)=>new THREE.Vector2(Math.cos(i/128*Math.PI*2)*.244,Math.sin(i/128*Math.PI*2)*.244));sideWall(holePoints,-.022,.012,insideMat);
 function tube(points,r,mat,closed=false){const curve=new THREE.CatmullRomCurve3(points,closed,'centripetal');const m=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(32,points.length),r,6,closed),mat);guitar.add(m);return m;}
 tube(contour.map(p=>v3(p.x,p.y,.01)),.007,ivory,true);tube(contour.map(p=>v3(p.x,p.y,-.429)),.006,ivory,true);
 tube(contour.map(p=>v3(p.x*.992,p.y*.992,.014)),.003,darkTrim,true);
 function box(sx,sy,sz,x,y,z,mat,rz=0){
  const geo=new THREE.BoxGeometry(sx,sy,sz);
  // Keep the sampled grain at the same scale on the panels, braces and kerf blocks.
  // Default box UVs stretched an entire wood image across every tiny block.
  if(mat===insideMat||mat===innerWallMat){
   const pos=geo.attributes.position,norm=geo.attributes.normal,uv=geo.attributes.uv,c=Math.cos(rz),s=Math.sin(rz);
   for(let i=0;i<pos.count;i++){
    const px=pos.getX(i)*c-pos.getY(i)*s+x,py=pos.getX(i)*s+pos.getY(i)*c+y,pz=pos.getZ(i)+z;
    const nx=norm.getX(i)*c-norm.getY(i)*s,ny=norm.getX(i)*s+norm.getY(i)*c,nz=norm.getZ(i);
    if(Math.abs(nz)>.5)uv.setXY(i,(px+.87)/1.74,(py+1.49)/2.17);
    else if(Math.abs(nx)>Math.abs(ny))uv.setXY(i,(pz+.432)/1.74,(py+1.49)/2.17);
    else uv.setXY(i,(px+.87)/1.74,(pz+.432)/2.17);
   }
  }
  const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.z=rz;guitar.add(m);return m;
 }
 function rod(a,b,r,mat,segments=12){const dir=b.clone().sub(a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,dir.length(),segments),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(v3(0,1,0),dir.normalize());guitar.add(m);return m;}
 function shapePoints(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
 function carved(s,z,depth,mat,bevel=.006,bounds=[-.2,.2,0,3]){const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1,curveSegments:32});uvGeometry(g,bounds);const m=new THREE.Mesh(g,mat);m.position.z=z;guitar.add(m);return m;}
 // Shaped neck, heel, ebony fretboard, and frets modeled individually.
 const neckShape=shapePoints([[-.087,1.94],[.087,1.94],[.125,.30],[-.125,.30]]);carved(neckShape,-.095,.102,sideMat,.025,[-.13,.13,.3,1.94]);
 const fretY=i=>1.93-2.60*(1-Math.pow(2,-i/12));
 const boardEnd=fretY(20)-.028,boardWidth=y=>mix(.088,.123,(1.94-y)/(1.94-boardEnd));
 const fretboard=shapePoints([[-.088,1.94],[.088,1.94],[.123,boardEnd],[-.123,boardEnd]]);carved(fretboard,.02,.025,ebony,.003,[-.13,.13,boardEnd,1.94]);
 box(.21,.12,.36,0,.55,-.20,insideMat);
 const headShape=shapePoints([[-.085,1.94],[-.13,2.08],[-.178,2.42],[-.17,2.565],[-.06,2.58],[.065,2.575],[.17,2.565],[.179,2.42],[.13,2.08],[.085,1.94]]);carved(headShape,-.064,.085,headMat,.01,[-.18,.18,1.94,2.58]);
 for(let i=1;i<=20;i++){const y=fretY(i);const half=boardWidth(y)-.003;rod(v3(-half,y,.053),v3(half,y,.053),.0025,chrome);if([3,5,7,9,12,15,17,19].includes(i)){const previous=fretY(i-1);for(const x of i===12?[-.037,.037]:[0]){const dot=new THREE.Mesh(new THREE.CircleGeometry(.0085,20),ivory);dot.position.set(x,(previous+y)/2,.049);guitar.add(dot);}}}
 box(.188,.018,.030,0,1.942,.054,ivory);
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const y=2.40-i*.15,x=side*(.11-i*.008);
  rod(v3(x,y,-.024),v3(side*.218,y,-.024),.012,gold);
  const knob=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),gold);knob.scale.set(.029,.039,.018);knob.position.set(side*.221,y,-.025);guitar.add(knob);
  rod(v3(x,y,.024),v3(x,y,.062),.016,chrome);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.024,.003,8,24),gold);ring.position.set(x,y,.034);guitar.add(ring);
  for(let turn=0;turn<3;turn++){const winding=new THREE.Mesh(new THREE.TorusGeometry(.017,.0012,6,24),gold);winding.position.set(x,y,.043+turn*.004);guitar.add(winding);}
 }
 // Inlaid rosette, polished pickguard and carved rosewood bridge.
 for(const [r,t,mat] of [[.251,.004,ivory],[.261,.003,darkTrim],[.272,.006,ivory],[.284,.004,darkTrim],[.294,.0025,ivory]]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,160),mat);ring.position.z=.016;guitar.add(ring);}
 const pick=new THREE.Shape();pick.moveTo(.238,.23);pick.bezierCurveTo(.40,.22,.45,.08,.48,-.13);pick.bezierCurveTo(.53,-.36,.57,-.47,.40,-.50);pick.bezierCurveTo(.25,-.53,.14,-.50,.155,-.36);pick.bezierCurveTo(.18,-.20,.32,-.11,.295,.055);pick.bezierCurveTo(.29,.15,.23,.20,.238,.23);carved(pick,.016,.003,black,.002,[-.87,.87,-1.49,.68]);
 const bridge=shapePoints([[-.345,-.58],[.345,-.58],[.34,-.71],[.18,-.73],[.105,-.76],[-.12,-.76],[-.2,-.73],[-.345,-.715]]);carved(bridge,.019,.040,ebony,.006,[-.35,.35,-.77,-.57]);
 box(.335,.015,.022,0,-.628,.066,ivory,.025);
 for(let i=0;i<6;i++){
  const xb=(i-2.5)*.051,xt=(i-2.5)*.034;
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.011,16,12),ivory);pin.scale.z=.6;pin.position.set(xb,-.69,.069);guitar.add(pin);
  const dot=new THREE.Mesh(new THREE.CircleGeometry(.0032,12),black);dot.position.set(xb,-.69,.076);guitar.add(dot);
  const r=i<3?.0016+(2-i)*.00032:.0010+(5-i)*.00017;
  rod(v3(xb,-.68,.080),v3(xt,1.945,.074),r,stringMats[i],8);
  const side=i<3?-1:1,row=i<3?i:5-i;rod(v3(xt,1.945,.074),v3(side*(.11-row*.008),2.40-row*.15,.063),r,stringMats[i],8);
 }
 // Internal lining, kerf blocks and cross-braces remain visible during the interior stop.
 const innerContour=contour.filter((_,i)=>i%4===0);
 innerContour.forEach(p=>{box(.016,.036,.038,p.x*.965,p.y*.965,-.036,insideMat);box(.016,.036,.038,p.x*.965,p.y*.965,-.39,insideMat);});
 for(const y of [-1.13,-.82,.40]){const width=y<-.8?1.2:y<-.3?1.05:.92;box(width,.024,.034,0,y,-.398,insideMat);}
 box(.046,1.7,.032,0,-.45,-.396,insideMat);
 box(1.11,.027,.018,0,-.54,-.035,insideMat,.34);box(1.11,.027,.018,0,-.54,-.035,insideMat,-.34);
 const endpin=new THREE.Mesh(new THREE.SphereGeometry(.022,16,12),gold);endpin.position.set(0,-1.496,-.21);guitar.add(endpin);
 // Batch the static parts by material: detailed geometry without hundreds of draw calls.
 const batches=new Map();guitar.updateMatrixWorld(true);
 const sourceMeshes=guitar.children.filter(n=>n.isMesh);
 for(const mesh of sourceMeshes){let geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(mesh.matrix);if(!batches.has(mesh.material))batches.set(mesh.material,[]);batches.get(mesh.material).push(geo);guitar.remove(mesh);mesh.geometry.dispose();}
 for(const [material,geometries] of batches){const count=geometries.reduce((n,g)=>n+g.attributes.position.count,0);const merged=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const size=name==='uv'?2:3,data=new Float32Array(count*size);let offset=0;for(const g of geometries){const a=g.attributes[name];if(a)data.set(a.array,offset);offset+=g.attributes.position.count*size;}merged.setAttribute(name,new THREE.BufferAttribute(data,size));}merged.computeBoundingSphere();guitar.add(new THREE.Mesh(merged,material));geometries.forEach(g=>g.dispose());}
 holeShade=new THREE.Mesh(new THREE.CircleGeometry(.243,128),new THREE.MeshBasicMaterial({color:0x130c08,transparent:true,depthWrite:false}));holeShade.position.z=-.025;guitar.add(holeShade);
 // A shaded view through the sound hole gives the interior its natural depth.
 interiorBackdrop=new THREE.Mesh(new THREE.CircleGeometry(4,96),new THREE.MeshBasicMaterial({color:0x11100e,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
 interiorBackdrop.position.z=.18;interiorBackdrop.visible=false;guitar.add(interiorBackdrop);
 available=true;
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();available=false;document.documentElement.classList.add('no-webgl');});
 canvas.addEventListener('webglcontextrestored',()=>{available=true;document.documentElement.classList.remove('no-webgl');dispatchEvent(new Event('taan-art-ready'));});
}catch(error){document.documentElement.classList.add('no-webgl');console.warn('Using guitar artwork fallback:',error.message);}
// Camera positions are interpolated along a continuously differentiable path.
const keys=[
 {p:.225,c:[0,.55,8.5],t:[0,.55,0],o:[0,-.27],r:[0,0,-.64],s:.20,f:34},
 {p:.30,c:[1.1,2.75,3.55],t:[0,1.95,0],o:[-.20,-.02],r:[0,0,-.06],s:1,f:34},
 {p:.395,c:[.55,2.60,3.45],t:[0,1.91,0],o:[-.20,-.02],r:[0,0,-.025],s:1,f:34},
 {p:.455,c:[-1.3,1.05,3.55],t:[0,.37,0],o:[.20,.01],r:[0,0,-.04],s:1,f:34},
 {p:.545,c:[-.55,.72,3.55],t:[0,.28,0],o:[.20,.01],r:[0,0,-.015],s:1,f:34},
 {p:.592,c:[-.06,.06,1.4],t:[0,0,-.15],o:[.10,0],r:[0,0,0],s:1,f:42},
 {p:.620,c:[0,-.03,-.075],t:[0,.4,-.24],o:[0,0],r:[0,0,0],s:1,f:66},
 {p:.658,c:[0,-.53,-.34],t:[0,.1,-.16],o:[0,-.02],r:[0,0,0],s:1,f:68},
 {p:.742,c:[.035,-.50,-.34],t:[-.015,.1,-.16],o:[0,-.02],r:[0,0,0],s:1,f:68},
 {p:.778,c:[0,-.03,-.075],t:[0,.4,-.24],o:[0,0],r:[0,0,0],s:1,f:66},
 {p:.812,c:[0,-.12,1.65],t:[0,-.3,0],o:[-.10,0],r:[0,0,0],s:1,f:42},
 {p:.853,c:[.95,-1.40,3.55],t:[0,-.64,0],o:[-.20,0],r:[0,0,-.04],s:1,f:34},
 {p:.94,c:[.50,-1.12,3.5],t:[0,-.63,0],o:[-.20,0],r:[0,0,-.025],s:1,f:34},
 {p:1,c:[1.1,.9,8],t:[0,.45,0],o:[-.10,0],r:[0,0,-.16],s:1,f:34}
];
const sample=(a,b,t)=>a+(b-a)*smooth(t);
function getState(p){
 if(p<=.225){const settle=smooth((p-.10)/.08);const vh=Math.max(h,w*9/16),vw=vh*16/9;const handX=((w-vw)*(mobile?.44:.5)+vw*.438)/w-.5;const handY=((h-vh)/2+vh*.838)/h-.5;
 // Match the player's screen position, then release with the same initial velocity.
 const release=clamp((p-.04)/.075),t=release,t2=t*t,t3=t2*t;
 const start=handY-smooth(.04/.125),velocity=-30*Math.pow(.32,2)*Math.pow(1-.32,2)/.125;
 // The camera first carries the guitar upward, then it drifts down into the
 // introduction. Quintic envelopes join the original camera tour at rest.
 const carried=p<.04?handY-smooth(p/.125):(2*t3-3*t2+1)*start+(t3-2*t2+t)*velocity*.075+(-2*t3+3*t2)*(-.40);
 const y=p<=.115?carried:mix(-.40,-.27,smooth((p-.115)/.08));
 const air=smooth((p-.045)/.045)*(1-smooth((p-.185)/.04));
 const phase=clamp((p-.045)/.18)*Math.PI*2;
 const drift=Math.sin(phase)*.022*air;
 return{c:[0,.55,8.5],t:[0,.55,0],o:[mix(handX,0,smooth((p-.045)/.085))+drift,y],r:[.025*Math.sin(phase)*air,.10*Math.sin(phase+.35)*air,mix(-.79,-.64,settle)+.10*Math.sin(phase-.25)*air],s:mix(.064,.20,smooth((p-.06)/.10)),f:34};}
 let idx=1;while(idx<keys.length-1&&p>keys[idx].p)idx++;
 const a=keys[idx-1],b=keys[idx],t=clamp((p-a.p)/(b.p-a.p));const state={};
 for(const prop of ['c','t','o','r'])state[prop]=a[prop].map((n,i)=>sample(n,b[prop][i],t));state.s=sample(a.s,b.s,t);state.f=sample(a.f,b.f,t);
 if(mobile&&!(p>.595&&p<.82)){state.o=h<480?[.24,.02]:[0,.24];state.c[2]*=h<480?1.35:1.85;state.c[0]*=.8;state.c[1]=mix(state.c[1],state.t[1],.2);if(p<.30){const blend=smooth((p-.225)/.075);state.o=[h<480?blend*.24:0,mix(-.27,h<480?.02:.24,blend)];state.c[2]/=mix(h<480?1.35:1.85,1,blend);}}
 return state;
}
function render(p,reduced=false){
 releaseFrame=null;
 if(!available){const name=p<.26?'guitar':p<.43?'headstock':p<.61?'strings':p<.81?'inside':'bridge';if(fallback.dataset.part!==name){fallback.src=TAAN_ART[name];fallback.dataset.part=name;}return null;}
 const sampleP=reduced?(p<.125?0:p<.26?.19:p<.435?.34:p<.60?.50:p<.81?.70:.89):p;
 let stableP=sampleP;
 if(!reduced){for(const [a,b,c] of [[.312,.39,.35],[.478,.548,.51],[.674,.748,.70],[.867,.94,.90]]){if(sampleP>a&&sampleP<b){const k=smooth(Math.min((sampleP-a)/.015,(b-sampleP)/.015));stableP=mix(sampleP,c,k);}}}
 const st=getState(stableP);guitar.scale.setScalar(st.s);guitar.position.set(0,.55*(1-st.s),0);guitar.rotation.set(...st.r);
 const inside=smooth((sampleP-.592)/.048)*(1-smooth((sampleP-.755)/.050));
 camera.up.set(0,1-inside,inside).normalize();camera.position.set(...st.c);focus.set(...st.t);camera.lookAt(focus);camera.fov=st.f;
 holeShade.material.opacity=1-smooth((sampleP-.575)/.027)*(1-smooth((sampleP-.800)/.035));holeShade.visible=holeShade.material.opacity>.001;
 camera.zoom=1;
 camera.setViewOffset(w,h,-st.o[0]*w,-st.o[1]*h,w,h);camera.updateProjectionMatrix();
 // In portrait layouts, keep the longer direction/edit copy above the instrument.
 // Reframe the complete model; the geometry, orbit and interior camera stay intact.
 const readingFit=w<=800&&h>=480?(smooth((sampleP-.40)/.045)*(1-smooth((sampleP-.56)/.06))+smooth((sampleP-.80)/.055)*(1-smooth((sampleP-.97)/.03))):0;
 if(readingFit>0){
  const copy=document.querySelector(sampleP<.7?'[data-scene="2"]':'[data-scene="4"]'),description=copy.querySelector('.description');
  const readingBottom=copy.offsetTop+description.offsetTop+description.offsetHeight+20,frameBottom=h-42;
  guitar.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  const bounds=new THREE.Box3(),min=[Infinity,Infinity],max=[-Infinity,-Infinity];
  guitar.traverse(mesh=>{if(mesh.isMesh&&mesh!==interiorBackdrop){if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));}});
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   const v=new THREE.Vector3(x,y,z).project(camera),px=(v.x+1)*w/2,py=(1-v.y)*h/2;min[0]=Math.min(min[0],px);min[1]=Math.min(min[1],py);max[0]=Math.max(max[0],px);max[1]=Math.max(max[1],py);
  }
  const fit=Math.min(1,(frameBottom-readingBottom)/(max[1]-min[1]),w*.86/(max[0]-min[0]));
  const zoom=mix(1,Math.max(.12,fit),readingFit),cx=(min[0]+max[0])/2,cy=(min[1]+max[1])/2;
  const centerX=w/2+(cx-w/2-st.o[0]*w)*zoom+st.o[0]*w,centerY=h/2+(cy-h/2-st.o[1]*h)*zoom+st.o[1]*h;
  const shiftX=(w/2-centerX)*readingFit,shiftY=((readingBottom+frameBottom)/2-centerY)*readingFit;
  camera.zoom=zoom;camera.setViewOffset(w,h,-st.o[0]*w-shiftX,-st.o[1]*h-shiftY,w,h);camera.updateProjectionMatrix();
 }

 interiorBackdrop.material.opacity=smooth((sampleP-.627)/.027)*(1-smooth((sampleP-.755)/.030));
 interiorBackdrop.visible=interiorBackdrop.material.opacity>.001;
 renderer.render(scene,camera);
 if(p<.225&&!reduced){
  const projectRelease=(x,y)=>{projected.set(x,y,.04);guitar.localToWorld(projected);projected.project(camera);return{x:(projected.x*.5+.5)*w,y:(-.5*projected.y+.5)*h};};
  const center=projectRelease(0,.55),top=projectRelease(0,2.47),bottom=projectRelease(0,-1.49);
  releaseFrame={...center,length:Math.hypot(top.x-bottom.x,top.y-bottom.y),top:Math.min(top.y,bottom.y),tilt:st.r[2],progress:p};
 }
 const stop=p<.435?1:p<.60?2:p<.81?3:4;
 projected.set(...(stop===1?[.20,2.16,.04]:stop===2?[.12,.235,.06]:stop===3?[0,0,0]:[.32,-.63,.075]));guitar.localToWorld(projected);projected.project(camera);
 return{x:(projected.x*.5+.5)*w,y:(-.5*projected.y+.5)*h,release:releaseFrame};
}
function resize(width,height){w=width;h=height;mobile=w<=800||h<480;if(available){const dpr=Math.min(devicePixelRatio,2,3840/w,Math.sqrt(8294400/(w*h)));renderer.setPixelRatio(Math.max(1,dpr));renderer.setSize(w,h,false);camera.aspect=w/h;}}
window.TaanGuitar={render,resize,get available(){return available;},get ready(){return ready;},get details(){return{textureSource:'Taan flow.pdf, pages 4–7',textureSize:1024,liveInterior:true,cameraPosition:camera?.position.toArray(),cameraTarget:focus?.toArray(),drawCalls:renderer?.info.render.calls,triangles:renderer?.info.render.triangles,width:canvas.width,height:canvas.height,release:releaseFrame};}};resize(w,h);
})();
