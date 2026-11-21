const objectPaths={
  square:'M24 24H76V76H24Z',circle:'M78 50a28 28 0 1 1-56 0 28 28 0 1 1 56 0Z',
  star:'M50 15 60 37 84 40 66 57 71 82 50 70 29 82 34 57 16 40 40 37Z',
  apple:'M50 34Q24 15 17 42Q10 69 36 83Q43 87 50 82Q60 87 66 82Q91 64 83 42Q76 17 50 34Z',
  pear:'M48 24Q61 17 66 37Q67 46 76 56Q95 84 56 86Q15 89 22 64Q25 54 35 43Q41 35 41 30Q43 25 48 24Z',
  car:'M17 55 25 53 37 34H61Q67 34 76 50L83 54Q87 56 86 65L85 71H16Q11 60 17 55Z'
};
const sorterColors=['#ed616c','#6cb76b','#f4b92e'];
function objectSvg(shape,color,scale=1,hole=false){
  const extra=hole?'':shape==='apple'||shape==='pear'?'<path d="M49 32q0-13 6-20" fill="none" stroke="#80634a" stroke-width="4"/><path d="M52 23q5-16 20-11-3 12-20 11Z" fill="#4c9b5a"/>':shape==='car'?'<path d="m34 49 8-11h16q5 1 10 11Z" fill="#bceafb"/><g fill="#46536c"><circle cx="29" cy="71" r="9"/><circle cx="72" cy="71" r="9"/></g>':'';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(50 50) scale(${scale}) translate(-50 -50)"><path d="${objectPaths[shape]}" fill="${color}" stroke="${hole?'#8b8574':'#53505e'}" stroke-opacity=".65" stroke-width="3.5" stroke-linejoin="round"/>${extra}</g></svg>`;
}
function basket(color){return `<svg viewBox="0 0 100 80" aria-hidden="true"><path d="M9 25 18 68q1 5 7 5h50q6 0 7-5l9-43Z" fill="${color}" stroke="#5a6065" stroke-width="2.5"/><path d="M6 23Q6 18 11 18h78q6 0 6 5v9H6Z" fill="${color}" stroke="#5a6065" stroke-width="2.5"/><path d="M17 22h66M23 40l3 15" stroke="white" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/></svg>`}
function sortGame(box){
  let mode=0;
  function draw(){
    box.innerHTML='';box.append(tabs(['Цвет','Размер','Форма'],mode,i=>{mode=i;draw()}));
    const names=[['Красный','Зелёный','Жёлтый'],['Маленький','Средний','Большой'],['Круг','Звезда','Квадрат']][mode];
    const shapes=['circle','star','square'],sizes=[.45,.72,1.08],roundObject=shuffle(['apple','pear','car'])[0];
    box.insertAdjacentHTML('beforeend','<p class="hint">'+['Разложи игрушки по цветам','Подбери игрушку такого же размера','Найди для фигурки своё окошко'][mode]+'</p><div class="sort-area"><div class="bins"></div><div class="tray"></div><p class="status" role="status"></p></div>');
    names.forEach((name,i)=>{const b=document.createElement('button');b.className='bin';b.dataset.target=i;b.setAttribute('aria-label','Место — '+name);const sizeGuide=objectSvg(roundObject,'#d2d4c7',sizes[i],true);b.innerHTML=(mode===0?basket(sorterColors[i]):mode===1?sizeGuide:objectSvg(shapes[i],'#c7bcda',1,true))+'<span>'+name+'</span>';box.querySelector('.bins').append(b)});
    const order=shuffle([0,1,2,0,1,2]),fruits=shuffle(['apple','car','pear']);
    order.forEach((i,j)=>{const b=document.createElement('button');b.className='sort-item';b.dataset.piece=i;b.setAttribute('aria-label','Предмет — '+names[i]);b.innerHTML=mode===0?objectSvg(fruits[j%3],sorterColors[i]):mode===1?objectSvg(roundObject,'#e99955',sizes[i]):objectSvg(shapes[i],sorterColors[j%3]);box.querySelector('.tray').append(b)});
    let n=order.length;connectPieces(box,(p,t)=>{if(p.dataset.piece!==t.dataset.target)return false;if(--n===0){box.querySelector('.status').innerHTML='Все на своих местах!<button class="again">Ещё раз</button>';box.querySelector('.again').onclick=draw}return true})
  }draw()
}
const letters=[...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789'];
const letterNames='а|бэ|вэ|гэ|дэ|е|ё|жэ|зэ|и|и краткое|ка|эль|эм|эн|о|пэ|эр|эс|тэ|у|эф|ха|цэ|че|ша|ща|твёрдый знак|ы|мягкий знак|э|ю|я|ноль|один|два|три|четыре|пять|шесть|семь|восемь|девять'.split('|');
let speechSerial=0;
function speak(i){
  if(!sound)return;
  const serial=++speechSerial;stopVoice();voice.src=audioURL(i);
  voice.play().catch(err=>{if(err.name==='AbortError'||serial!==speechSerial||!sound||location.hash!=='#balloons')return;if(window.speechSynthesis){const msg=new SpeechSynthesisUtterance(letterNames[i]);msg.lang='ru-RU';speechSynthesis.speak(msg)}})
}
const toyColors=['#ec5e67','#a86fdb','#f7aa3e','#37b2be','#579dea','#ec78a6'];
function bugSprite(color){return `<svg viewBox="0 0 80 84" aria-hidden="true"><g stroke="#374457" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="m22 38-11-5-3-7m12 22L8 49l-4-4m19 11-9 9-6-1m51-26 11-6 3-7m-13 22 12 2 4-4m-18 11 9 9 6-1M32 17 25 8m22 10 9-11"/></g><ellipse cx="40" cy="29" rx="17" ry="18" fill="#354353"/><ellipse cx="40" cy="50" rx="25" ry="27" fill="${color}" stroke="#56515b" stroke-width="2.5"/><path d="M40 26v49" stroke="#514359" stroke-width="2"/><g fill="#3b4050"><circle cx="28" cy="39" r="4.7"/><circle cx="52" cy="39" r="4.7"/><circle cx="26" cy="57" r="5"/><circle cx="54" cy="57" r="5"/></g><g fill="white" stroke="#374457" stroke-width="1.6"><circle cx="32" cy="21" r="8"/><circle cx="48" cy="21" r="8"/></g><g fill="#354353"><circle cx="33" cy="19" r="3.7"/><circle cx="47" cy="19" r="3.7"/></g><path d="M20 48q1-12 9-16" fill="none" stroke="white" opacity=".55" stroke-width="3" stroke-linecap="round"/></svg>`}
function balloonSprite(color,label){return `<svg viewBox="0 0 80 110" aria-hidden="true"><path d="M39 80q-7 11 1 17t-2 12" fill="none" stroke="#678eae" stroke-width="2"/><path d="M39 77q-28-4-30-40Q9 7 38 6q31-1 33 28Q72 65 43 77l3 6H36Z" fill="${color}" stroke="#546077" stroke-opacity=".7" stroke-width="2"/><path d="M18 33q2-13 14-17" fill="none" stroke="#fff" opacity=".66" stroke-width="5" stroke-linecap="round"/><text x="40" y="56" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="1000" font-size="36" fill="#fff" stroke="#445478" stroke-width="1.6" paint-order="stroke">${label}</text></svg>`}
function movingGame(box,id){
  const balloon=id==='balloons';let mode=0,raf=0,alive=true,items=[],last=0,bag=[],nextNumber=false;
  function nextSymbol(){
    let pool=mode===1?1:mode===2?2:(nextNumber?2:1);nextNumber=!nextNumber;
    if(!bag[pool]?.length)bag[pool]=shuffle(pool===1?Array.from({length:33},(_,i)=>i):Array.from({length:10},(_,i)=>i+33));
    return bag[pool].pop()
  }
  function start(){
    cancelAnimationFrame(raf);items=[];bag=[];box.innerHTML='';
    if(balloon)box.append(tabs(['Все','Буквы','Цифры'],mode,i=>{mode=i;start()}));
    box.insertAdjacentHTML('beforeend','<p class="hint">'+(balloon?'Лопни шарик и послушай':'Лови жучков пальчиком')+'</p><div class="playfield field-'+id+'">'+(balloon?'<div class="cloud cloud-a"></div><div class="cloud cloud-b"></div>':'')+'</div>');
    const field=box.querySelector('.playfield'),slow=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count=field.clientWidth<480?5:7;
    function spawn(slot,initial){
      const b=document.createElement('button'),symbol=balloon?nextSymbol():0,c=toyColors[Math.floor(Math.random()*toyColors.length)];
      b.className=balloon?'actor balloon':'actor';b.setAttribute('aria-label',balloon?letters[symbol]:'Жучок');b.innerHTML=balloon?balloonSprite(c,letters[symbol]):bugSprite(c);field.append(b);
      const col=slot%3,row=Math.floor(slot/3),rx=.08+col*.42+Math.random()*.06,ry=(row+.25+Math.random()*.35)/Math.ceil(count/3);
      const actor={b,symbol,x:rx*Math.max(1,field.clientWidth-b.offsetWidth),y:ry*Math.max(1,field.clientHeight-b.offsetHeight),angle:Math.random()*Math.PI*2,speed:12+Math.random()*14,phase:Math.random()*6,age:0,slot};
      items.push(actor);
      if(balloon&&!initial&&!slow)actor.y=field.clientHeight-actor.b.offsetHeight;
      position(actor);
      b.onclick=()=>{if(!items.includes(actor))return;balloon?speak(symbol):beep(280+Math.random()*130);const mark=document.createElement('span');mark.className='popmark';mark.setAttribute('aria-hidden','true');mark.textContent=balloon?letters[symbol]:'✦';mark.style.left=actor.x+b.offsetWidth/2+'px';mark.style.top=actor.y+b.offsetHeight/2+'px';field.append(mark);setTimeout(()=>mark.remove(),480);b.remove();items=items.filter(x=>x!==actor);spawn(slot,false)}
    }
    function position(a){a.b.style.transform='translate3d('+a.x+'px,'+a.y+'px,0)'+(balloon?' rotate('+Math.sin(a.age+a.phase)*5+'deg)':' rotate('+(90+a.angle*180/Math.PI)+'deg)')}
    function tick(now){
      if(!alive)return;const dt=Math.min(.06,(now-last)/1000);last=now;
      for(const a of items){
        if(a.b===document.activeElement&&a.b.matches(':focus-visible'))continue;
        a.age+=dt;const maxX=Math.max(0,field.clientWidth-a.b.offsetWidth),maxY=Math.max(0,field.clientHeight-a.b.offsetHeight);
        if(balloon){a.y-=dt*a.speed*.77;a.x+=Math.sin(a.age*.9+a.phase)*dt*7;if(a.y< -a.b.offsetHeight){a.y=field.clientHeight;a.x=Math.random()*maxX}a.x=Math.min(maxX,Math.max(0,a.x))}
        else{a.angle+=Math.sin(a.age*.8+a.phase)*dt*.6;a.x+=Math.cos(a.angle)*dt*a.speed;a.y+=Math.sin(a.angle)*dt*a.speed;if(a.x<0||a.x>maxX){a.angle=Math.PI-a.angle;a.x=Math.max(0,Math.min(maxX,a.x))}if(a.y<0||a.y>maxY){a.angle=-a.angle;a.y=Math.max(0,Math.min(maxY,a.y))}}
        position(a);
      }raf=requestAnimationFrame(tick)
    }
    for(let i=0;i<count;i++)spawn(i,true);if(!slow){last=performance.now();raf=requestAnimationFrame(tick)}
  }start();cleanup=()=>{alive=false;cancelAnimationFrame(raf);speechSerial++}
}
render();
