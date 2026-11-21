const letters=[...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789'];
const letterNames='а|бэ|вэ|гэ|дэ|е|ё|жэ|зэ|и|и краткое|ка|эль|эм|эн|о|пэ|эр|эс|тэ|у|эф|ха|цэ|че|ша|ща|твёрдый знак|ы|мягкий знак|э|ю|я|ноль|один|два|три|четыре|пять|шесть|семь|восемь|девять'.split('|');
let speechSerial=0;
function speak(i){
  if(!sound)return;
  const serial=++speechSerial;stopVoice();voice.src=audioURL(i);
  voice.play().catch(err=>{if(err.name==='AbortError'||serial!==speechSerial||!sound||location.hash!=='#balloons')return;if(window.speechSynthesis){const msg=new SpeechSynthesisUtterance(letterNames[i]);msg.lang='ru-RU';speechSynthesis.speak(msg)}})
}
const toyColors=['#ec5e67','#a86fdb','#f7aa3e','#37b2be','#579dea','#ec78a6'];

function burst(field,x,y,color,label){
  const node=document.createElement('div');
  node.className='burst';node.style.left=x+'px';node.style.top=y+'px';node.setAttribute('aria-hidden','true');
  const ring=document.createElement('i');ring.className='burst-ring';node.append(ring);
  for(let i=0;i<7;i++){
    const petal=document.createElement('i'),a=Math.PI*2*(i+Math.random()*.3)/7;
    petal.style.setProperty('--dx',Math.cos(a)*(27+Math.random()*19)+'px');
    petal.style.setProperty('--dy',Math.sin(a)*(27+Math.random()*19)+'px');
    petal.style.setProperty('--turn',Math.round(a*75)+'deg');
    petal.style.background=i%3===0?'#fff2ac':i%3===1?color:'#fffef4';node.append(petal);
  }
  if(label){const text=document.createElement('b');text.textContent=label;node.append(text)}
  field.append(node);setTimeout(()=>node.remove(),540);
}
function movingGame(box,id){
  const balloons=id==='balloons',slow=reduceMotion();
  let mode=0,frame,resize,disposeRound=()=>{};
  function round(){
    disposeRound();
    if(balloons)setupPicker(['Все шарики','Буквы','Цифры'][mode],'options',()=>chooseOptions({title:'Что на шариках?',labels:['Все','Буквы','Цифры'],mode,onApply:opt=>{if(mode!==opt.mode){mode=opt.mode;stopVoice();round()}}}));
    box.innerHTML='<div class="playfield field-'+id+'"></div>';
    const field=box.firstElementChild,actors=[],bags=[[],[]],pending=new Set();
    let width=field.clientWidth,height=field.clientHeight,variant=0,number=false,prev=performance.now(),running=true;
    resize=new ResizeObserver(()=>{width=field.clientWidth;height=field.clientHeight;
      for(const a of actors){a.x=Math.max(0,Math.min(width-a.w,a.x));a.y=Math.max(-a.h,Math.min(height-a.h,a.y));position(a)}
    });resize.observe(field);
    function symbol(){
      const numeric=mode===2||(mode===0&&number);number=!number;
      const k=+numeric;if(!bags[k].length)bags[k]=shuffle(Array.from({length:numeric?10:33},(_,i)=>i+(numeric?33:0)));
      return bags[k].pop();
    }
    function spot(w,h,last,entry){
      const maxX=Math.max(0,width-w),maxY=Math.max(0,height-h);
      let best,score=-1;
      for(let i=0;i<28;i++){
        const x=Math.random()*maxX,y=entry?maxY:Math.random()*maxY;
        const nearest=actors.reduce((min,a)=>Math.min(min,Math.hypot(x-a.x,y-a.y)),Math.max(width,height));
        const away=last?Math.hypot(x-last.x,y-last.y):Infinity;
        if(nearest>Math.min(w*1.6,width*.29)&&away>Math.min(Math.max(width,height)*.34,260))return {x,y};
        const rank=Math.min(nearest,away*.67)+Math.random()*8;
        if(rank>score){best={x,y};score=rank}
      }
      return best;
    }
    function position(a){
      const angle=balloons?Math.sin(a.age*1.45+a.phase)*5:90+a.angle*180/Math.PI;
      a.el.style.transform='translate3d('+a.x.toFixed(2)+'px,'+a.y.toFixed(2)+'px,0) rotate('+angle.toFixed(2)+'deg)';
    }
    function spawn(last){
      if(!running)return;
      const el=document.createElement('button'),color=toyColors[Math.floor(Math.random()*toyColors.length)],type=variant++%3;
      const n=balloons?symbol():null;
      el.className='actor '+(balloons?'balloon':'bug');el.setAttribute('aria-label',balloons?letters[n]:'Жучок');
      el.innerHTML='<span class="hatch">'+(balloons?toyBalloon(color,letters[n],type):toyBug(color,type))+'</span>';
      field.append(el);
      const w=el.offsetWidth,h=el.offsetHeight,pos=spot(w,h,last,balloons&&last&&!slow);
      const actor={el,w,h,...pos,speed:12+Math.random()*14,age:0,phase:Math.random()*6,angle:Math.random()*Math.PI*2};
      actors.push(actor);position(actor);
      function hit(){
        const i=actors.indexOf(actor);if(i===-1||panel.open)return;
        balloons?speak(n):beep(300+Math.random()*130);actors.splice(i,1);
        burst(field,actor.x+w*.5,actor.y+h*(balloons?.4:.5),color,balloons?letters[n]:'');
        const shell=el.firstElementChild;el.disabled=true;el.classList.add('caught');
        shell.animate(balloons?[{transform:'scale(1)'},{offset:.45,transform:'scale(1.1,.94)'},{transform:'scale(.48)',opacity:0}]:[{transform:'scale(1)'},{offset:.38,transform:'scale(1.13,.82)'},{transform:'scale(.65)',opacity:0}],{duration:slow?0:160,fill:'forwards'});
        const timer=setTimeout(()=>{pending.delete(timer);el.remove();spawn(actor)},slow?10:180);pending.add(timer);
      }
      el.onpointerdown=e=>{if(e.button===0&&e.isPrimary){e.preventDefault();hit()}};
      el.onclick=hit;
    }
    function tick(now){
      if(!running)return;
      const dt=Math.min(.045,(now-prev)/1000);prev=now;
      if(!panel.open&&!document.hidden)for(const a of actors){
        if(a.el===document.activeElement&&a.el.matches(':focus-visible'))continue;
        a.age+=dt;const maxX=Math.max(0,width-a.w),maxY=Math.max(0,height-a.h);
        if(balloons){
          a.y-=a.speed*.99*dt; // примерно на 29% быстрее первой версии
          a.x=Math.max(0,Math.min(maxX,a.x+Math.sin(a.phase+a.age*.95)*dt*10));
          if(a.y< -a.h){const p=spot(a.w,a.h,null,true);a.x=p.x;a.y=height}
        }else{
          a.angle+=Math.sin(a.age*.82+a.phase)*dt*.64;
          a.x+=Math.cos(a.angle)*dt*a.speed;a.y+=Math.sin(a.angle)*dt*a.speed;
          if(a.x<0||a.x>maxX){a.angle=Math.PI-a.angle;a.x=Math.min(maxX,Math.max(0,a.x))}
          if(a.y<0||a.y>maxY){a.angle=-a.angle;a.y=Math.min(maxY,Math.max(0,a.y))}
        }
        position(a)
      }
      frame=requestAnimationFrame(tick);
    }
    const total=width<600?5:8;
    for(let i=0;i<total;i++)spawn(null);
    if(!slow)frame=requestAnimationFrame(tick);
    disposeRound=()=>{running=false;resize.disconnect();cancelAnimationFrame(frame);pending.forEach(clearTimeout);pending.clear()};
  }
  round();cleanup=()=>{disposeRound();speechSerial++};
}
render();
