let copyNumber=0;
function freshCopy(el){
  const clone=el.cloneNode(true),prefix='copy'+(++copyNumber)+'-';
  const ids=new Map(Array.from(clone.querySelectorAll('[id]'),node=>[node.id,prefix+node.id]));
  for(const node of clone.querySelectorAll('*')){
    if(ids.has(node.id))node.id=ids.get(node.id);
    for(const a of Array.from(node.attributes)){
      if(a.value.includes('url(#'))node.setAttribute(a.name,a.value.replace(/url\(#([^)]+)\)/g,(orig,id)=>ids.has(id)?'url(#'+ids.get(id)+')':orig));
    }
  }
  return clone;
}
// Первое касание выбирает предмет. Его можно перенести или положить вторым касанием.
function connectPieces(box,place){
  let picked,drag;
  const pieces=box.querySelectorAll('[data-piece]');
  function select(el){picked?.classList.remove('picked');picked=el;el.classList.add('picked')}
  function copy(el,rect,kind){
    const ghost=freshCopy(el);ghost.removeAttribute('id');ghost.removeAttribute('data-piece');ghost.classList.remove('picked','lifted');ghost.classList.add(kind);
    ghost.tabIndex=-1;ghost.setAttribute('aria-hidden','true');
    Object.assign(ghost.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    document.body.append(ghost);return ghost;
  }
  function apply(target,from){
    if(!picked||!target||target.disabled)return false;
    if(picked.dataset.piece!==target.dataset.target){
      target.animate([{transform:'translateX(-3px)'},{transform:'translateX(4px)'},{transform:'none'}],{duration:reduceMotion()?0:180});return false;
    }
    const item=picked;picked=null;
    const start=from||item.getBoundingClientRect();
    const ghost=copy(item,start,'flight'),landing=place(item,target)||target;
    const dest=landing.getBoundingClientRect();
    item.style.visibility='hidden';item.disabled=true;item.removeAttribute('data-piece');item.classList.remove('picked');
    const dx=dest.left+dest.width/2-start.left-start.width/2,dy=dest.top+dest.height/2-start.top-start.height/2;
    const scale=Math.min(2.4,Math.max(.28,dest.width/start.width));
    const anim=ghost.animate([{transform:'translate(0,0) scale(1)'},{offset:.58,transform:'translate('+dx*.64+'px,'+(dy*.64-Math.min(38,start.height*.35))+'px) rotate(-6deg) scale(.97)'},{transform:'translate('+dx+'px,'+dy+'px) scale('+scale+')'}],{duration:reduceMotion()?0:320,easing:'cubic-bezier(.25,.8,.4,1)',fill:'forwards'});
    anim.onfinish=()=>ghost.remove();beep(480);return true;
  }
  box.querySelectorAll('[data-target]').forEach(t=>t.onclick=()=>apply(t));
  pieces.forEach(el=>{
    el.onclick=()=>{if(!el.disabled)select(el)};
    el.onpointerdown=e=>{
      if(drag||!e.isPrimary||e.button!==0||el.disabled)return;
      select(el);el.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,el};
    };
    el.onpointermove=e=>{
      if(!drag||e.pointerId!==drag.id||drag.el!==el)return;
      if(!drag.ghost){
        if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;
        drag.ghost=copy(el,el.getBoundingClientRect(),'moving-copy');el.classList.add('lifted');
      }
      const ghost=drag.ghost;
      ghost.style.left=e.clientX-ghost.offsetWidth/2+'px';ghost.style.top=e.clientY-ghost.offsetHeight/2+'px';
      const hover=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-target]');
      if(hover!==drag.hover){drag.hover?.classList.remove('over');hover?.classList.add('over');drag.hover=hover}
    };
    function release(e){
      if(!drag||drag.id!==e.pointerId||drag.el!==el)return;
      if(drag.ghost){
        const g=drag.ghost,start=g.getBoundingClientRect();
        if(e.type==='pointerup')apply(document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-target]'),start);
        g.remove();el.classList.remove('lifted');drag.hover?.classList.remove('over');
      }
      drag=null;
    }
    el.onpointerup=el.onpointercancel=release;
  });
}
function complete(box,label,button,again){
  const note=document.createElement('div');note.className='completed';note.setAttribute('role','status');
  note.innerHTML='<span>'+label+'</span><button class="again">'+icon('reset')+button+'</button>';
  note.querySelector('button').onclick=again;box.append(note);
}
function jigsawPath(col,row,cols,rows){
  const w=240/cols,h=240/rows,x=w*col,y=h*row,bulge=Math.min(w,h)*.18;
  let d='M'+x+' '+y;
  function edge(x0,y0,dx,dy,sign){
    const len=Math.hypot(dx,dy);
    const point=(t,n=0)=>[x0+dx*t-dy/len*n*sign*bulge,y0+dy*t+dx/len*n*sign*bulge].map(v=>v.toFixed(2)).join(' ');
    if(sign)d+='L'+point(.38)+'C'+point(.48,0)+' '+point(.29,1)+' '+point(.5,1)+'S'+point(.52,0)+' '+point(.62)+'L'+point(1);
    else d+='L'+point(1);
  }
  const dir=(a,b)=>(a+b)%2?1:-1;
  edge(x,y,w,0,row?-dir(row-1,col):0);edge(x+w,y,0,h,col<cols-1?dir(col,row):0);
  edge(x+w,y+h,-w,0,row<rows-1?dir(row,col):0);edge(x,y+h,0,-h,col?-dir(col-1,row):0);return d+'Z';
}
function puzzleGame(box){
  let index=0,mode=0,uid=0;
  function draw(){
    setupPicker('Пазл','gallery',()=>chooseOptions({title:'Выбери пазл',index,mode,labels:['4 детали','6 деталей','9 деталей'],onApply:opt=>{if(index!==opt.index||mode!==opt.mode){index=opt.index;mode=opt.mode;draw()}}}));
    box.innerHTML='<div class="puzzle-layout"><div class="board"></div><div class="tray puzzle-tray"></div></div>';
    const cols=mode===0?2:3,rows=mode===2?3:2,n=cols*rows,w=240/cols,h=240/rows;
    const board=box.querySelector('.board'),tray=box.querySelector('.tray');
    board.style.gridTemplateColumns='repeat('+cols+',1fr)';board.style.gridTemplateRows='repeat('+rows+',1fr)';
    tray.style.setProperty('--columns',n===4?4:n===6?3:5);
    const ids=Array.from({length:n},(_,i)=>i);
    function tile(i,slot){
      const el=document.createElement('button'),col=i%cols,row=Math.floor(i/cols),id='pclip'+(++uid);
      const d=jigsawPath(col,row,cols,rows),pad=slot?0:Math.min(w,h)*.20;
      const view=[col*w-pad,row*h-pad,w+2*pad,h+2*pad].join(' ');
      el.className=slot?'slot':'piece';el.dataset[slot?'target':'piece']=i;el.setAttribute('aria-label',(slot?'Место ':'Кусочек ')+(i+1));
      el.innerHTML=`<svg viewBox="${view}" overflow="visible" aria-hidden="true"><defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})" class="tile-image">${picture(index).replace('<svg ','<svg x="0" y="0" width="240" height="240" ')}</g><path class="cut" d="${d}" fill="none" vector-effect="non-scaling-stroke"/></svg>`;
      return el;
    }
    ids.forEach(i=>board.append(tile(i,true)));shuffle(ids).forEach(i=>tray.append(tile(i,false)));
    let placed=0;
    connectPieces(box,(p,t)=>{
      t.disabled=true;t.classList.add('done');
      if(++placed===n){board.classList.add('assembled');tray.hidden=true;complete(box,'Картинка собрана!','Ещё пазл',()=>{index=(index+1)%books.length;draw()})}
      return t;
    });
  }draw();
}
const sorterColors=['#ed6364','#67b876','#f4bb31'];
function sortGame(box){
  let mode=0;
  function draw(){
    setupPicker(['Цвет','Размер','Форма'][mode],'options',()=>chooseOptions({title:'Как сортировать?',labels:['Цвет','Размер','Форма'],mode,onApply:opt=>{if(mode!==opt.mode){mode=opt.mode;draw()}}}));
    const names=[['Красный','Зелёный','Жёлтый'],['Маленький','Средний','Большой'],['Круг','Звезда','Квадрат']][mode];
    const shapes=['circle','star','square'],sizes=[.47,.76,1.05],fruit=shuffle(['apple','pear','car'])[0];
    box.innerHTML='<div class="sort-layout" data-mode="'+mode+'"><div class="bins"></div><div class="tray sort-tray"></div></div>';
    names.forEach((name,i)=>{
      const t=document.createElement('button');t.className='bin';t.dataset.target=i;t.setAttribute('aria-label','Место — '+name);
      t.innerHTML='<span class="bin-top">'+(mode===0?toyBasket(sorterColors[i]):toyObject(mode===1?fruit:shapes[i],mode===1?'#bc9978':'#a48ebd',mode===1?sizes[i]:1,true))+'</span><span class="bin-loot"></span><span class="bin-name">'+name+'</span>';
      box.querySelector('.bins').append(t);
    });
    const order=shuffle([0,1,2,0,1,2]),fruits=shuffle(['apple','pear','car']);
    order.forEach((i,j)=>{
      const b=document.createElement('button');b.className='sort-item';b.dataset.piece=i;b.setAttribute('aria-label','Предмет — '+names[i]);
      b.innerHTML=mode===0?toyObject(fruits[j%3],sorterColors[i]):mode===1?toyObject(fruit,'#e99d50',sizes[i]):toyObject(shapes[i],sorterColors[j%3]);
      box.querySelector('.tray').append(b);
    });
    let left=order.length;
    connectPieces(box,(p,t)=>{
      const toy=document.createElement('i');toy.className='collected';toy.append(freshCopy(p.firstElementChild));t.querySelector('.bin-loot').append(toy);
      t.querySelector('.bin-top').animate([{transform:'scale(1)'},{offset:.5,transform:'translateY(4px) scale(1.05,.94)'},{transform:'scale(1)'}],{duration:reduceMotion()?0:300,delay:190});
      if(--left===0)complete(box,'Всё по местам!','Ещё раз',draw);
      return toy;
    });
  }draw();
}
