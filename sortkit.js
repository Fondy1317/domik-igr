'use strict';

// Each cutout fills the same 100-unit toy tile, so silhouettes and size cues agree.
const cutouts = {
  triangle:['Треугольник','M46 18q4-7 8 0l33 57q3 6-4 6H17q-7 0-4-6Z'],
  heart:['Сердце','M50 84C39 76 12 59 12 38 12 17 38 12 50 31 64 11 89 18 89 39 89 56 67 76 50 84Z'],
  moon:['Месяц','M65 13C35 25 35 68 77 71 58 96 19 82 16 51 15 26 37 8 65 13Z'],
  diamond:['Ромб','M47 10q3-4 6 0l35 39q1 2-1 5L53 90q-3 4-6 0L13 54q-2-3 0-6Z'],
  flower:['Цветок','M50 27C67 0 85 17 73 37 99 37 97 61 75 61 91 83 66 96 53 75 41 100 17 84 27 64 2 66 2 39 27 38 13 15 37 4 50 27Z','<circle cx="51" cy="51" r="10" fill="#fff0a4"/>'],
  oval:['Овал','M89 50a39 25 0 1 1-78 0 39 25 0 1 1 78 0Z'],
  banana:['Банан','M21 23C20 57 50 74 77 48L84 33 89 37C90 61 73 84 48 84 24 84 10 62 13 36l2-14Z','<path d="M22 49q17 38 52 14" fill="none" stroke="#aa713a" stroke-width="2.4"/><path d="m15 24 6 1-1-7-5 1Z" fill="#665443"/>'],
  orange:['Апельсин','M85 55a35 34 0 1 1-70 0 35 34 0 1 1 70 0Z','<path d="M49 24q4-18 22-16-3 14-22 16Z" fill="#649e53"/><path d="m26 53 3-10" stroke="#fff4be" stroke-width="4" stroke-linecap="round"/><g fill="#b87c3e"><circle cx="68" cy="65" r="1.5"/><circle cx="63" cy="70" r="1.5"/></g>'],
  plum:['Слива','M82 50C85 73 67 89 46 88 23 87 12 68 17 48 20 27 39 22 52 29 62 18 78 28 82 50Z','<path d="M52 30q-2-14 9-21" fill="none" stroke="#826047" stroke-width="4"/><path d="M51 26q-19-2-21-14 17-4 21 14Z" fill="#6da45d"/><path d="M57 34q12 19 3 39" fill="none" stroke="#fff" opacity=".4" stroke-width="3"/>'],
  boat:['Парусник','M10 63h80L75 82H27Z','<path d="M51 61V13" stroke="#895e46" stroke-width="4"/><path d="M47 17 17 58h30Z" fill="#fff1bc" stroke="#b5845d" stroke-width="2"/><path d="m55 25 25 32H55Z" fill="#86d9e7" stroke="#518f9f" stroke-width="2"/>'],
  bus:['Автобус','M12 28q0-9 10-9h56q10 0 10 10v40q0 7-8 7H19q-8 0-8-8Z','<g fill="#c4eeef" stroke="#56697c" stroke-width="2"><rect x="18" y="28" width="16" height="19" rx="3"/><rect x="38" y="28" width="16" height="19" rx="3"/><rect x="59" y="28" width="23" height="19" rx="3"/></g><g fill="#455369" stroke="#ece6d7" stroke-width="3"><circle cx="28" cy="74" r="9"/><circle cx="72" cy="74" r="9"/></g>'],
  plane:['Самолёт','M13 53q-4-3 1-6l26-3 11-27 10-1-5 27 27-3q9-1 10 5-1 6-9 8l-27 4 10 25-10 2-19-25-16 1-8 7-6-1 5-13Z','<path d="m70 44 8-1q5 0 5 3l-12 2Z" fill="#c5f0ef"/>'],
  train:['Паровоз','M14 67V30h36v25h11V35h12v21h9q6 0 7 10l4 7H13Z','<path d="M12 28h39m8 6h16" stroke="#8c5941" stroke-width="6"/><path d="M21 37h19v15H21Z" fill="#c6edf4"/><g fill="#526379" stroke="#faf2d1" stroke-width="3"><circle cx="28" cy="75" r="10"/><circle cx="56" cy="75" r="10"/><circle cx="78" cy="76" r="8"/></g>'],
  shirt:['Футболка','M34 17q15 12 31 0l23 15-11 18-11-6v39H34V44l-11 6-11-18Z','<path d="M37 20q13 19 26 0M36 74h28" fill="none" stroke="#fff8df" stroke-width="3"/>'],
  mitten:['Варежка','M34 84 24 72q-7-10-10-24-2-9 6-11 7 0 15 13l-2-23q-1-18 15-19 16-1 21 16l8 28q5 16-6 25l-9 8Z','<path d="m33 77 34-9 5 13-34 10Z" fill="#fff0c9" stroke="#9c7866" stroke-width="2"/>'],
  sock:['Носок','M47 13h28v40q0 12-13 19L35 86Q22 92 16 80q-6-11 5-18l24-13Z','<path d="M46 19h28m-29 7h28" stroke="#fff1cb" stroke-width="3"/>'],
  hat:['Шапка','M17 67q1-48 34-49 30 2 33 49Z','<circle cx="52" cy="17" r="9" fill="#fff1c5" stroke="#ad8764" stroke-width="2"/><rect x="12" y="61" width="76" height="19" rx="7" fill="#fff1d4" stroke="#a68167" stroke-width="2"/><path d="M30 59q0-21 11-30m16 0q12 11 13 30" fill="none" stroke="#fff" opacity=".45" stroke-width="3"/>'],
  boot:['Сапог','M28 17h35v40q22-1 26 10l1 12q-2 5-8 5H26q-7 0-7-7l3-16 5-8Z','<path d="M25 22h40m-44 56h66" stroke="#5c5160" stroke-width="5"/><path d="M33 30v19" stroke="#fff" opacity=".7" stroke-width="4"/>']
};

function sortToy(key,color,size=1,hole=false){
  if(!cutouts[key])return toyObject(key,color,size,hole);
  const [,path,detail='']=cutouts[key],p=toyPalette(color);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><defs>${toyPaint(p)}</defs>
    <g transform="translate(50 50) scale(${size}) translate(-50 -50)" stroke-linejoin="round"><path d="${path}" fill="${p.edge}" transform="translate(0 2)"/><path d="${path}" fill="url(#${p.id}${hole?'edge':'glaze'})" stroke="${p.edge}" stroke-width="2.5"/>${hole?'':detail}</g></svg>`;
}

const sortPalette=[
  ['Красный','#ef6264'],['Жёлтый','#efbf32'],['Зелёный','#5ca86b'],
  ['Синий','#537dd3'],['Оранжевый','#f68a35'],['Фиолетовый','#a16ac8'],
  ['Розовый','#f18fb6'],['Бирюзовый','#3faeaf'],['Коричневый','#996a4b']
];
const sortFamilies=[
  {name:'Фрукты',members:[['apple','Яблоко','#ed6663'],['pear','Груша','#9ac44e'],['banana','Банан','#f6cf49'],['orange','Апельсин','#f29a37'],['plum','Слива','#9776bc']]},
  {name:'Транспорт',members:[['car','Машина','#639bd3'],['boat','Парусник','#db7261'],['bus','Автобус','#eab948'],['plane','Самолёт','#83b5da'],['train','Паровоз','#68ad90']]},
  {name:'Одежда',members:[['shirt','Футболка','#66b8bc'],['sock','Носок','#e58892'],['mitten','Варежка','#c580bd'],['hat','Шапка','#789ed6'],['boot','Сапог','#e9a443']]}
];
const sortShapes=[['circle','Круг'],['star','Звезда'],['square','Квадрат'],...['triangle','heart','moon','diamond','flower','oval'].map(k=>[k,cutouts[k][0]])];
const patterns=[
  ['Полоски','<path d="M0 3h16" stroke="white" stroke-width="4"/>'],
  ['Горошек','<circle cx="8" cy="8" r="3.3" fill="white"/>'],
  ['Клетка','<path d="M0 2h16M2 0v16" stroke="white" stroke-width="2.6"/>'],
  ['Волны','<path d="M-1 8q4-6 8 0t10 0" stroke="white" stroke-width="2.8" fill="none"/>'],
  ['Сердечки','<path d="M8 13Q0 8 3 4q3-3 5 1 4-5 6-1 2 4-6 9Z" fill="white"/>'],
  ['Крестики','<path d="m4 4 8 8m0-8-8 8" stroke="white" stroke-width="2.8" stroke-linecap="round"/>']
];
function fabric(index,color,shape){
  const p=toyPalette(color),id=p.id+'fabric';
  const outline=shape==='patch'?'M23 11h54q10 0 10 10v57q0 10-10 10H23q-10 0-10-10V21q0-10 10-10Z':shape==='mitten'?cutouts.mitten[1]:cutouts.shirt[1];
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${p.base}"/>${patterns[index][1]}</pattern></defs><path d="${outline}" fill="${p.edge}" transform="translate(0 3)"/><path d="${outline}" fill="url(#${id})" stroke="${p.edge}" stroke-width="3" stroke-linejoin="round"/></svg>`;
}
const countSpots=[[[50,50]],[[29,50],[71,50]],[[50,30],[28,69],[72,69]],[[28,29],[72,29],[28,71],[72,71]],[[24,25],[75,25],[50,50],[24,76],[75,76]],[[24,29],[50,29],[76,29],[24,71],[50,71],[76,71]]];
function countCard(n,shape,color){
  const spots=countSpots[n-1],size=n<3?45:n<5?38:28;
  const mark=shape==='circle'?'<circle cx="50" cy="50" r="41"/>':shape==='heart'?'<path d="'+cutouts.heart[1]+'"/>':'<path d="'+toySilhouettes.star+'"/>';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="5" y="5" width="90" height="90" rx="19" fill="#fff6dd" stroke="#b8956c" stroke-width="3"/>${spots.map(([x,y])=>`<svg x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" viewBox="0 0 100 100" fill="${color}" stroke="#554e65" stroke-width="3">${mark}</svg>`).join('')}</svg>`;
}
