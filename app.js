'use strict';
const app=document.querySelector('#app');
const games={
  puzzle:['Пазлы','#eb8d26','#b97838'],paint:['Раскраска','#e7668b','#bb6381'],
  bugs:['Жучки','#52a45c','#568d50'],sort:['Сортер','#9269d2','#7b65a3'],balloons:['Шарики','#338ec9','#477da1']
};
const icons={
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
function tabs(labels,current,onSelect,cls='tab'){
  const row=document.createElement('div');row.className='tabs';
  labels.forEach((label,i)=>{const b=document.createElement('button');b.className=cls;b.textContent=label;b.setAttribute('aria-pressed',i===current);b.onclick=()=>onSelect(i);row.append(b)});return row;
}
function library(current,select){
  const row=document.createElement('div');row.className='library';
  books.forEach((b,i)=>{const el=document.createElement('button');el.className='choice';el.innerHTML=picture(i);el.setAttribute('aria-label',b.name);el.title=b.name;el.setAttribute('aria-pressed',current===i);el.onclick=()=>select(i);row.append(el)});return row;
}
let sound=read('sound',true),toneContext,cleanup=()=>{},voice=new Audio();
const audioURL=i=>window.packedAudio?.[i]||'audio/'+i+'.mp3';
const soundButton=document.querySelector('#sound');
function showSound(){soundButton.innerHTML=icon(sound?'sound':'muted')+'<span>Звук</span>';soundButton.setAttribute('aria-pressed',sound);soundButton.setAttribute('aria-label',sound?'Выключить звук':'Включить звук')}
function stopVoice(){voice.pause();window.speechSynthesis?.cancel()}
function beep(freq=540){if(!sound)return;try{toneContext??=new (window.AudioContext||window.webkitAudioContext)();if(toneContext.state==='suspended')toneContext.resume().catch(()=>{});const o=toneContext.createOscillator(),g=toneContext.createGain(),t=toneContext.currentTime;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*1.35,t+.1);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g);g.connect(toneContext.destination);o.start(t);o.stop(t+.15)}catch{}}
soundButton.onclick=()=>{sound=!sound;save('sound',sound);showSound();if(sound)beep();else stopVoice()};showSound();
const spark='<svg class="sparkle" viewBox="0 0 30 40" aria-hidden="true"><path d="m15 3 3 9 8 4-8 4-3 10-4-10-8-4 8-4Z" fill="#ffe36a" stroke="#e6ac3f" stroke-width="1.5"/><circle cx="25" cy="34" r="3" fill="#fffdf4"/></svg>';
function enter(id){if(location.hash!==(id?'#'+id:'')){location.hash=id;return}render()}
document.querySelector('#home').onclick=()=>enter('');
function render(){
  cleanup();cleanup=()=>{};stopVoice();document.querySelector('.moving-copy')?.remove();window.scrollTo(0,0);
  const id=location.hash.slice(1);
  if(!Object.hasOwn(games,id)){
    app.innerHTML='<section class="intro"><h1>'+spark+'Во что поиграем?'+spark.replace('class="sparkle"','class="sparkle end"')+'</h1><p>Выбери игру и нажми на картинку</p></section><section class="cards" aria-label="Игры">'+Object.entries(games).map(([key,[name,band,deep]])=>`<button class="game-card" data-game="${key}" style="--band:${band};--deep:${deep}" aria-label="${name}"><img class="art" alt="" src="art/${key}.svg"><span class="card-foot">${name}<i class="play"><svg viewBox="0 0 20 20"><path d="M5 3q0-2 2-1l11 7q2 1 0 2L7 18q-2 1-2-1Z" fill="currentColor"/></svg></i></span></button>`).join('')+'</section>';
    app.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>enter(b.dataset.game));return;
  }
  app.innerHTML='<div class="game-head"><h1>'+games[id][0]+'</h1><button class="icon-btn">'+icon('home')+'Все игры</button></div><section class="studio"></section>';
  app.querySelector('.icon-btn').onclick=()=>enter('');
  const studio=app.querySelector('.studio');
  if(id==='paint')paintGame(studio);else if(id==='puzzle')puzzleGame(studio);else if(id==='sort')sortGame(studio);else movingGame(studio,id);
}
window.addEventListener('hashchange',render);
function connectPieces(container,attempt){
  let picked=null;
  function pick(el){picked?.classList.remove('picked');picked=el;el.classList.add('picked')}
  function match(target){if(!picked||!target)return;if(attempt(picked,target)){picked.remove();picked=null;beep()}else{target.classList.remove('wiggle');void target.offsetWidth;target.classList.add('wiggle')}}
  container.querySelectorAll('[data-target]').forEach(el=>el.onclick=()=>match(el));
  container.querySelectorAll('[data-piece]').forEach(el=>{
    let start=null,ghost=null,dragged=false;
    el.onclick=()=>{if(!dragged)pick(el);dragged=false};
    el.onpointerdown=e=>{if(!e.isPrimary||e.button!==0)return;pick(el);dragged=false;start=[e.clientX,e.clientY];el.setPointerCapture(e.pointerId)};
    el.onpointermove=e=>{if(!start||!e.isPrimary)return;if(!ghost&&Math.hypot(e.clientX-start[0],e.clientY-start[1])<5)return;
      if(!ghost){dragged=true;ghost=el.cloneNode(true);ghost.classList.add('moving-copy');ghost.setAttribute('aria-hidden','true');ghost.tabIndex=-1;ghost.style.width=el.offsetWidth+'px';ghost.style.height=el.offsetHeight+'px';document.body.append(ghost)}
      ghost.style.left=e.clientX-ghost.offsetWidth/2+'px';ghost.style.top=e.clientY-ghost.offsetHeight/2+'px';
    };
    el.onpointerup=e=>{if(!e.isPrimary||!start)return;start=null;if(!ghost)return;ghost.remove();ghost=null;const t=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-target]');if(t&&container.contains(t))match(t)};
    el.onpointercancel=()=>{start=null;ghost?.remove();ghost=null};
  })
}
function puzzleGame(box){
  let index=0,level=0;
  function draw(){
    box.innerHTML='';box.append(library(index,i=>{index=i;draw()}),tabs(['4 детали','6 деталей','9 деталей'],level,i=>{level=i;draw()}));
    box.insertAdjacentHTML('beforeend','<p class="hint">Перетащи кусочек на его место</p><div class="board"></div><div class="tray"></div><p class="status" role="status"></p>');
    const cols=level===0?2:3,rows=level===2?3:2,count=rows*cols,board=box.querySelector('.board'),tray=box.querySelector('.tray');
    board.style.gridTemplateColumns='repeat('+cols+',1fr)';board.style.gridTemplateRows='repeat('+rows+',1fr)';
    function tile(i,slot){const b=document.createElement('button');b.className=slot?'slot':'piece';b.dataset[slot?'target':'piece']=i;b.setAttribute('aria-label',(slot?'Место ':'Кусочек ')+(i+1));b.style.backgroundImage='url("'+pictureURL(index)+'")';b.style.backgroundSize=cols*100+'% '+rows*100+'%';b.style.backgroundPosition=(i%cols)*100/(cols-1)+'% '+Math.floor(i/cols)*100/(rows-1)+'%';b.style.setProperty('--ratio',rows+'/'+cols);return b}
    const ids=Array.from({length:count},(_,i)=>i);
    ids.forEach(i=>board.append(tile(i,true)));shuffle(ids).forEach(i=>tray.append(tile(i,false)));
    let placed=0;connectPieces(box,(p,t)=>{if(p.dataset.piece!==t.dataset.target)return false;t.classList.add('done');t.disabled=true;t.style.opacity='1';if(++placed===count){tray.remove();box.querySelector('.status').textContent='Картинка собрана!';const b=document.createElement('button');b.className='again';b.textContent='Следующая картинка';b.onclick=()=>{index=(index+1)%books.length;draw()};box.append(b)}return true})
  }draw();
}
const paintColors=[['Красный','#f05458'],['Оранжевый','#ff9a36'],['Жёлтый','#ffda37'],['Зелёный','#68bc5f'],['Голубой','#4bbedd'],['Синий','#5183d6'],['Фиолетовый','#9a6bd3'],['Розовый','#ef83aa']];
function paintGame(box){
  let index=0,mode='brush',color=paintColors[0][1];
  function draw(){
    const actions=read('art-'+index,[]);let active=null,pointer=null;
    box.innerHTML='';box.append(library(index,i=>{index=i;draw()}));
    box.insertAdjacentHTML('beforeend','<div class="drawing"><div class="sheet"></div><canvas width="720" height="720" aria-label="Поле для рисования"></canvas></div><div class="tools"></div><div class="palette" aria-label="Цвета"></div><p class="hint paint-hint"></p>');
    const sheet=box.querySelector('.sheet'),canvas=box.querySelector('canvas'),ctx=canvas.getContext('2d');
    function trace(a){ctx.globalCompositeOperation=a.mode==='erase'?'destination-out':'source-over';ctx.strokeStyle=ctx.fillStyle=a.color;ctx.lineWidth=a.mode==='erase'?45:22;ctx.lineJoin=ctx.lineCap='round';const points=a.points;ctx.beginPath();ctx.arc(points[0][0],points[0][1],ctx.lineWidth/2,0,Math.PI*2);ctx.fill();if(points.length===1)return;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.stroke()}
    const toolNames={brush:'Кисть',fill:'Заливка',erase:'Ластик',undo:'Отменить'};
    for(const k of Object.keys(toolNames)){const b=document.createElement('button');b.className='tool';b.dataset.tool=k;b.innerHTML=icon(k);b.setAttribute('aria-label',toolNames[k]);b.title=toolNames[k];b.onclick=()=>{if(k==='undo'){actions.pop();replay();persist()}else mode=k;sync()};box.querySelector('.tools').append(b)}
    for(const [label,c] of paintColors){const b=document.createElement('button');b.className='swatch';b.style.setProperty('--color',c);b.dataset.color=c;b.setAttribute('aria-label',label);b.innerHTML='<i></i>';b.onclick=()=>{color=c;if(mode==='erase')mode='brush';sync()};box.querySelector('.palette').append(b)}
    function sync(){box.querySelectorAll('[data-tool]').forEach(b=>{if(b.dataset.tool==='undo')b.disabled=!actions.length;else b.setAttribute('aria-pressed',b.dataset.tool===mode)});box.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.color===color));box.querySelector('.paint-hint').textContent=mode==='fill'?'Коснись области, чтобы её закрасить':mode==='erase'?'Проведи ластиком по своему штриху':'Выбери цвет и рисуй пальцем'}
    function persist(){if(!save('art-'+index,actions))box.querySelector('.paint-hint').textContent='Память заполнена. Рисунок останется до выхода.'}
    function replay(){ctx.clearRect(0,0,720,720);const fills={};for(const a of actions){if(a.mode==='fill')fills[a.area]=a.color;else trace(a)}sheet.innerHTML=picture(index,'page',fills)}
    function point(e){const r=canvas.getBoundingClientRect();return [Math.round((e.clientX-r.left)/r.width*720),Math.round((e.clientY-r.top)/r.height*720)]}
    canvas.onpointerdown=e=>{if(pointer!==null||e.button!==0)return;e.preventDefault();if(mode==='fill'){canvas.style.pointerEvents='none';const area=document.elementFromPoint(e.clientX,e.clientY)?.dataset.area;canvas.style.pointerEvents='';if(area!==undefined){actions.push({mode,color,area});replay();sync();persist()}return}pointer=e.pointerId;canvas.setPointerCapture(pointer);active={mode,color,points:[point(e)]};trace(active)};
    canvas.onpointermove=e=>{if(!active||pointer!==e.pointerId)return;const a=active.points.at(-1),b=point(e);if(Math.hypot(a[0]-b[0],a[1]-b[1])<2)return;active.points.push(b);trace({...active,points:[a,b]})};
    function finish(){if(active){actions.push(active);active=null;pointer=null;sync();persist()}}
    canvas.onpointerup=canvas.onpointercancel=e=>{if(e.pointerId===pointer)finish()};cleanup=finish;
    sync();replay();
  }draw();
}
