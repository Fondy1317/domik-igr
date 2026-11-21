'use strict';
const app=document.querySelector('#app');
const games={
  puzzle:['Пазлы','#eb8d26','#b97838'],paint:['Раскраска','#e7668b','#bb6381'],
  bugs:['Жучки','#52a45c','#568d50'],sort:['Сортер','#9269d2','#7b65a3'],balloons:['Шарики','#338ec9','#477da1']
};
const icons={
  gallery:'<rect x="3" y="4" width="18" height="16" rx="4"/><circle cx="9" cy="9" r="1.5"/><path d="m4 18 5-5 3 3 4-6 5 7"/>',
  options:'<path d="M4 7h6m5 0h5M4 17h10m5 0h1"/><circle cx="12" cy="7" r="2.5"/><circle cx="16" cy="17" r="2.5"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  check:'<path d="m5 12 4 4 10-10"/>',
  sound:'<path d="M3 9h4l5-5v16l-5-5H3z"/><path d="M16 8q4 4 0 8m2-11q7 7 0 14"/>',
  muted:'<path d="M3 9h4l5-5v16l-5-5H3z"/><path d="m16 9 5 6m0-6-5 6"/>',
  home:'<path d="M2 11 12 3l10 8M5 10v11h5v-7h4v7h5V10"/>',
  brush:'<path d="m9 15 9-12q2-2 4 0t0 3l-12 9"/><path d="M10 16q0 6-8 5 2-2 2-4 0-5 6-1Z"/>',
  fill:'<path d="m4 13 8-9 8 8-9 8-7-7Zm2-1h13M8 2l6 7M21 16q-5 7 0 6 4-1 0-6Z"/>',
  erase:'<path d="m3 14 11-11q1-1 2 0l5 5q1 1 0 2L10 21H8l-5-5q-1-1 0-2ZM8 9l8 7M10 21h12"/>',
  undo:'<path d="M9 5 3 11l6 5M4 11h10q8 0 7 9"/>'
};
function icon(k){return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">'+icons[k]+'</svg>'}
function read(key,def){try{return JSON.parse(localStorage.getItem('domik1-'+key))??def}catch{return def}}
function save(key,val){try{localStorage.setItem('domik1-'+key,JSON.stringify(val));return true}catch{return false}}
function shuffle(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
let sound=read('sound',true),toneContext,cleanup=()=>{},voice=new Audio();
const audioURL=i=>window.packedAudio?.[i]||'audio/'+i+'.mp3';
const soundButton=document.querySelector('#sound');
function showSound(){for(const button of document.querySelectorAll('[data-sound]')){button.innerHTML=icon(sound?'sound':'muted');button.setAttribute('aria-pressed',sound);button.setAttribute('aria-label',sound?'Выключить звук':'Включить звук')}}
function stopVoice(){voice.pause();window.speechSynthesis?.cancel()}
function beep(freq=540){if(!sound)return;try{toneContext??=new (window.AudioContext||window.webkitAudioContext)();if(toneContext.state==='suspended')toneContext.resume().catch(()=>{});const o=toneContext.createOscillator(),g=toneContext.createGain(),t=toneContext.currentTime;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*1.35,t+.1);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g);g.connect(toneContext.destination);o.start(t);o.stop(t+.15)}catch{}}
function toggleSound(){sound=!sound;save('sound',sound);showSound();if(sound)beep();else stopVoice()}soundButton.onclick=toggleSound;showSound();

const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const validIndex=(n,length)=>Number.isInteger(n)&&n>=0&&n<length?n:0;
const panel=document.querySelector('#options');
const setupButton=()=>document.querySelector('#setup');

function chooseOptions({title,index,mode,labels,onApply}){
  let nextIndex=index, nextMode=mode;
  panel.innerHTML='<form method="dialog"><div class="sheet-title"><h2 id="sheet-title"></h2><button class="round" value="cancel" aria-label="Закрыть">'+icon('close')+'</button></div><div class="sheet-body"></div><button type="submit" class="primary" value="apply">Играть</button></form>';
  panel.querySelector('h2').textContent=title;
  const body=panel.querySelector('.sheet-body');
  function choices(items,selected,change,library){
    const row=document.createElement('div');
    row.className=library?'album':'tabs';
    items.forEach((label,i)=>{
      const b=document.createElement('button');b.type='button';b.className=library?'choice':'tab';b.setAttribute('aria-pressed',selected===i);
      if(library)b.innerHTML=picture(i);
      const span=document.createElement('span');span.textContent=label;b.append(span);
      b.onclick=()=>{change(i);for(const item of row.children)item.setAttribute('aria-pressed',item===b)};
      row.append(b);
    });
    body.append(row);
  }
  if(index!==undefined)choices(books.map(b=>b.name),index,i=>nextIndex=i,true);
  if(labels)choices(labels,mode,i=>nextMode=i,false);
  panel.querySelector('form').onsubmit=e=>{e.preventDefault();panel.close();if(e.submitter?.value==='apply')onApply({index:nextIndex,mode:nextMode})};
  panel.showModal();
}
panel.onclick=e=>{if(e.target===panel)panel.close()};
function setupPicker(label,glyph,action){
  const b=setupButton();b.hidden=false;b.innerHTML=icon(glyph)+'<span>'+label+'</span>';b.onclick=action;
}
function enter(id){location.hash=id}
document.querySelector('#home').onclick=()=>enter('');
function render(){
  cleanup();cleanup=()=>{};stopVoice();
  if(panel.open)panel.close();
  document.querySelectorAll('.moving-copy,.flight').forEach(el=>el.remove());
  window.scrollTo(0,0);
  const hash=location.hash.slice(1),id=Object.hasOwn(games,hash)?hash:'menu';
  document.body.dataset.scene=id;
  if(id==='menu'){
    app.innerHTML='<section class="cards" aria-label="Выбери игру">'+Object.entries(games).map(([key,[name,band,deep]])=>`<button class="game-card" data-game="${key}" style="--band:${band};--deep:${deep}" aria-label="${name}"><img draggable="false" class="art" alt="" src="art/${key}.svg"><span class="card-foot">${name}<i class="play"><svg viewBox="0 0 20 20"><path d="M5 3q0-2 2-1l11 7q2 1 0 2L7 18q-2 1-2-1Z" fill="currentColor"/></svg></i></span></button>`).join('')+'</section>';
    app.querySelectorAll('[data-game]').forEach(button=>{
      let press=null,ignoreClick=false;
      button.onpointerdown=e=>{
        if(!e.isPrimary)return;
        press={x:e.clientX,y:e.clientY,time:performance.now()};ignoreClick=false;
      };
      button.onpointermove=e=>{
        if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>12)ignoreClick=true;
      };
      button.onpointerup=()=>{if(press&&performance.now()-press.time>550)ignoreClick=true;press=null};
      button.onpointercancel=()=>{press=null;ignoreClick=true};
      button.onclick=e=>{if(e.detail===0||!ignoreClick)enter(button.dataset.game)};
    });return;
  }
  app.innerHTML=`<div class="scene scene-${id}"><h1 class="sr">${games[id][0]}</h1><section class="studio" aria-label="${games[id][0]}"></section><nav class="dock" aria-label="Управление игрой"><button class="dock-btn exit" aria-label="Все игры">${icon('home')}<span>Домой</span></button><button id="setup" class="dock-btn" hidden></button><button data-sound class="dock-btn round"></button></nav></div>`;
  app.querySelector('.exit').onclick=()=>enter('');
  app.querySelector('[data-sound]').onclick=toggleSound;showSound();
  const box=app.querySelector('.studio');
  if(id==='paint')paintGame(box);
  else if(id==='puzzle')puzzleGame(box);
  else if(id==='sort')sortGame(box);
  else movingGame(box,id);
}
document.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>{if(e.target.closest('main,button,dialog'))e.preventDefault()});
window.addEventListener('hashchange',render);
