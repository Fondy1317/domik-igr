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
const sortModes=['Цвет','Размер','Форма','Узоры','Количество','Группы'];
const sortPrompts=['Разложи по цветам','Найди такой же размер','Найди такую же форму','Подбери такой же узор','Сколько на карточке?','Что к чему относится?'];
const assortment=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]];
const smallerSets=[[0,1,2],[3,4,5],[0,2,4],[1,3,5],[0,3,5],[1,2,4]];
const roundsPerSet=6, piecesPerRound=6;
const sortSaveKey='sort-collections-v1';
function newCollection(){
  return {round:0,variant:Math.floor(Math.random()*30),order:shuffle([0,1,2,3,4,5]),placed:[]};
}
function usableCollection(s){
  const validId=n=>Number.isInteger(n)&&n>=0&&n<piecesPerRound;
  return s&&Number.isInteger(s.round)&&s.round>=0&&s.round<roundsPerSet&&Number.isInteger(s.variant)&&s.variant>=0&&
    Array.isArray(s.order)&&s.order.length===6&&new Set(s.order).size===6&&s.order.every(validId)&&
    Array.isArray(s.placed)&&s.placed.every(validId)&&new Set(s.placed).size===s.placed.length;
}
// One board has three destinations and two distinct pieces for each destination.
function buildSortBoard(mode,s){
  const {round,variant}=s;
  const targets=[],pieces=[];
  const palette=i=>sortPalette[i%sortPalette.length][1];
  const objects=sortFamilies.flatMap(group=>group.members);
  const ordinal=round+variant;
  function addGroup(name,art,makePiece){
    const group=targets.length;
    targets.push({name,art,group});
    for(let pair=0;pair<2;pair++)pieces.push({...makePiece(pair),group});
  }
  for(let i=0;i<3;i++){
    const key=assortment[round][i],small=smallerSets[round][i];
    if(mode===0){
      const [name,color]=sortPalette[key];
      addGroup(name,toyBasket(color),pair=>{
        const [shape,label]=objects[(ordinal*4+i*2+pair)%objects.length];
        return {name:label+' · '+name,art:sortToy(shape,color)};
      });
    }else if(mode===1){
      const name=['Маленький','Средний','Большой'][i],size=[.45,.73,1.04][i];
      const shape=['apple','shirt','car','mitten','pear','hat'][ordinal%6];
      addGroup(name,sortToy(shape,'#bc9978',size,true),pair=>({name,art:sortToy(shape,palette(ordinal+pair),size)}));
    }else if(mode===2){
      const [shape,name]=sortShapes[key];
      addGroup(name,sortToy(shape,'#ab97c0',1,true),pair=>({name,art:sortToy(shape,palette(ordinal+2*i+pair))}));
    }else if(mode===3){
      const name=patterns[small][0];
      addGroup(name,fabric(small,'#74888f','patch'),pair=>({name,art:fabric(small,palette(ordinal+pair*3+i),pair?'mitten':'shirt')}));
    }else if(mode===4){
      const n=small+1,name=String(n);
      const tile='<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="9" y="8" width="82" height="84" rx="20" fill="#fff0bd" stroke="#c39862" stroke-width="3"/><text x="50" y="73" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="950" font-size="67" fill="#4a506e">'+n+'</text></svg>';
      addGroup(name,tile,pair=>({name:'Карточка · '+n,art:countCard(n,['circle','star','heart'][(ordinal+pair)%3],palette(ordinal+i+pair))}));
    }else{
      const family=sortFamilies[i];
      const example=family.members[ordinal%family.members.length];
      addGroup(family.name,sortToy(example[0],example[2]),pair=>{
        const [shape,name,color]=family.members[(ordinal+pair+1)%family.members.length];
        return {name,art:sortToy(shape,color)};
      });
    }
  }
  if(round>0)targets.push(...targets.splice(0,round%3));
  return {targets,pieces};
}
function sortGame(box){
  const saved=read(sortSaveKey,null);
  const sets=sortModes.map((_,i)=>usableCollection(saved?.sets?.[i])?saved.sets[i]:newCollection());
  let mode=validIndex(saved?.mode,sortModes.length),timer=0;
  function persist(){save(sortSaveKey,{mode,sets})}
  function nextBoard(state){
    state.round++;state.order=shuffle([0,1,2,3,4,5]);state.placed=[];persist();draw();
  }
  function draw(){
    clearTimeout(timer);
    const state=sets[mode],lastRound=state.round===roundsPerSet-1;
    if(state.placed.length===piecesPerRound&&!lastRound){nextBoard(state);return}
    setupPicker(sortModes[mode],'options',()=>chooseOptions({title:'Как сортировать?',labels:sortModes,mode,onApply:opt=>{
      if(mode!==opt.mode){mode=opt.mode;persist();draw()}
    }}));
    const {targets,pieces}=buildSortBoard(mode,state);
    box.innerHTML='<div class="sort-header"><span class="sort-instruction"></span><span class="sort-progress" role="status"></span></div><div class="sort-layout" data-mode="'+mode+'"><div class="bins"></div><div class="tray sort-tray"></div></div>';
    box.querySelector('.sort-instruction').textContent=sortPrompts[mode];
    const progress=box.querySelector('.sort-progress'),bins=box.querySelector('.bins'),tray=box.querySelector('.tray');
    function updateProgress(){progress.textContent=(state.round*piecesPerRound+state.placed.length)+' / '+(roundsPerSet*piecesPerRound);progress.setAttribute('aria-label','Разложено '+progress.textContent)}
    function arrived(pieceArt,t){
      const toy=document.createElement('i');toy.className='collected';toy.append(freshCopy(pieceArt));t.querySelector('.bin-loot').append(toy);return toy;
    }
    for(const {name,art,group} of targets){
      const t=document.createElement('button');t.className='bin';t.dataset.target=group;t.setAttribute('aria-label','Место — '+name);
      t.innerHTML='<span class="bin-top">'+art+'</span><span class="bin-loot"></span><span class="bin-name">'+name+'</span>';bins.append(t);
    }
    for(const id of state.order){
      const piece=pieces[id],el=document.createElement('button');el.className='sort-item';el.dataset.item=id;el.dataset.piece=piece.group;el.setAttribute('aria-label',piece.name);el.innerHTML=piece.art;tray.append(el);
      if(state.placed.includes(id)){
        arrived(el.firstElementChild,bins.querySelector('[data-target="'+piece.group+'"]'));el.disabled=true;el.style.visibility='hidden';el.removeAttribute('data-piece');
      }
    }
    updateProgress();
    function finish(){
      if(lastRound){
        tray.hidden=true;
        complete(box,'Все 36 на месте!','Ещё набор',()=>{sets[mode]=newCollection();persist();draw()});
      }else{
        progress.textContent='Готово!';
        timer=setTimeout(()=>nextBoard(state),750);
      }
    }
    if(state.placed.length===piecesPerRound){finish();return}
    connectPieces(box,(p,t)=>{
      const toy=arrived(p.firstElementChild,t);
      state.placed.push(Number(p.dataset.item));persist();updateProgress();
      t.querySelector('.bin-top').animate([{transform:'scale(1)'},{offset:.5,transform:'translateY(4px) scale(1.05,.94)'},{transform:'scale(1)'}],{duration:reduceMotion()?0:300,delay:190});
      if(state.placed.length===piecesPerRound)finish();
      return toy;
    });
  }
  draw();cleanup=()=>clearTimeout(timer);
}
