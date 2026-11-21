const paintColors=[['Красный','#f05458'],['Оранжевый','#ff9a36'],['Жёлтый','#ffda37'],['Зелёный','#68bc5f'],['Голубой','#4bbedd'],['Синий','#5183d6'],['Фиолетовый','#9a6bd3'],['Розовый','#ef83aa']];
function paintGame(box){
  let index=validIndex(read('paint-index',0),books.length),mode='brush',color=paintColors[0][1];
  function draw(){
    const actions=read('art-'+index,[]);let active=null,pointer=null;
    box.innerHTML='';
    setupPicker('Рисунок','gallery',()=>chooseOptions({title:'Альбом',index,onApply:({index:newIndex})=>{if(newIndex!==index){finish();index=newIndex;save('paint-index',index);draw()}}}));
    box.insertAdjacentHTML('beforeend','<div class="paperstage"><div class="paperpad"><div class="binding" aria-hidden="true"></div><div class="drawing"><div class="sheet"></div><canvas width="720" height="720" aria-label="Поле для рисования"></canvas></div></div></div><div class="paintkit"><div class="tools"></div><div class="palette" aria-label="Цвета"></div></div><p class="hint paint-hint"></p>');
    const sheet=box.querySelector('.sheet'),canvas=box.querySelector('canvas'),ctx=canvas.getContext('2d');
    function trace(a){ctx.globalCompositeOperation=a.mode==='erase'?'destination-out':'source-over';ctx.strokeStyle=ctx.fillStyle=a.color;ctx.lineWidth=a.mode==='erase'?45:22;ctx.lineJoin=ctx.lineCap='round';const points=a.points;ctx.beginPath();ctx.arc(points[0][0],points[0][1],ctx.lineWidth/2,0,Math.PI*2);ctx.fill();if(points.length===1)return;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.stroke()}
    const toolNames={brush:'Кисть',fill:'Заливка',erase:'Ластик',undo:'Отменить'};
    for(const k of Object.keys(toolNames)){const b=document.createElement('button');b.className='tool';b.dataset.tool=k;b.innerHTML=icon(k);b.setAttribute('aria-label',toolNames[k]);b.title=toolNames[k];b.onclick=()=>{if(k==='undo'){actions.pop();replay();persist()}else mode=k;sync()};box.querySelector('.tools').append(b)}
    for(const [label,c] of paintColors){const b=document.createElement('button');b.className='swatch';b.style.setProperty('--color',c);b.dataset.color=c;b.setAttribute('aria-label',label);b.innerHTML='<i><em></em></i>';b.onclick=()=>{color=c;if(mode==='erase')mode='brush';sync()};box.querySelector('.palette').append(b)}
    function sync(){box.querySelectorAll('[data-tool]').forEach(b=>{if(b.dataset.tool==='undo')b.disabled=!actions.length;else b.setAttribute('aria-pressed',b.dataset.tool===mode)});box.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.color===color));box.querySelector('.paint-hint').textContent=mode==='fill'?'Коснись области, чтобы её закрасить':mode==='erase'?'Проведи ластиком по своему штриху':'Выбери цвет и рисуй пальцем'}
    function persist(){if(!save('art-'+index,actions)){box.querySelector('.paint-hint').classList.add('visible');box.querySelector('.paint-hint').textContent='Память заполнена. Рисунок останется до выхода.'}}
    function replay(){ctx.clearRect(0,0,720,720);const fills={};for(const a of actions){if(a.mode==='fill')fills[a.area]=a.color;else trace(a)}sheet.innerHTML=picture(index,'page',fills)}
    function point(e){const r=canvas.getBoundingClientRect();return [Math.round((e.clientX-r.left)/r.width*720),Math.round((e.clientY-r.top)/r.height*720)]}
    canvas.onpointerdown=e=>{if(pointer!==null||e.button!==0)return;e.preventDefault();if(mode==='fill'){canvas.style.pointerEvents='none';const area=document.elementFromPoint(e.clientX,e.clientY)?.dataset.area;canvas.style.pointerEvents='';if(area!==undefined){actions.push({mode,color,area});replay();sync();persist()}return}pointer=e.pointerId;canvas.setPointerCapture(pointer);active={mode,color,points:[point(e)]};trace(active)};
    canvas.onpointermove=e=>{if(!active||pointer!==e.pointerId)return;const a=active.points.at(-1),b=point(e);if(Math.hypot(a[0]-b[0],a[1]-b[1])<2)return;active.points.push(b);trace({...active,points:[a,b]})};
    function finish(){if(active){actions.push(active);active=null;pointer=null;sync();persist()}}
    canvas.onpointerup=canvas.onpointercancel=e=>{if(e.pointerId===pointer)finish()};cleanup=finish;
    sync();replay();
  }draw();
}
