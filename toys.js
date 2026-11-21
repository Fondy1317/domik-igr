'use strict';

// All paint servers are local to a single toy, including copies temporarily on screen.
let toyDrawingNumber = 0;

function toyPalette(base) {
  const hex = /^#[0-9a-f]{6}$/i.test(base) ? base : '#f4a947';
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  function blend(target, amount) {
    const parts = rgb.map((value, i) => Math.round(value * (1 - amount) + target[i] * amount));
    return '#' + parts.map(x => x.toString(16).padStart(2, '0')).join('');
  }
  return {
    id: 'toy' + (++toyDrawingNumber),
    base: hex,
    pale: blend([255, 255, 239], .65),
    light: blend([255, 247, 226], .38),
    shade: blend([58, 34, 61], .28),
    edge: blend([54, 33, 58], .53)
  };
}

function toyPaint(p) {
  return `<radialGradient id="${p.id}glaze" cx=".32" cy=".20" r=".91">
    <stop stop-color="${p.light}"/><stop offset=".38" stop-color="${p.base}"/>
    <stop offset=".8" stop-color="${p.base}"/><stop offset="1" stop-color="${p.shade}"/>
  </radialGradient><linearGradient id="${p.id}edge" x2=".18" y2="1">
    <stop stop-color="${p.light}"/><stop offset=".48" stop-color="${p.base}"/><stop offset="1" stop-color="${p.shade}"/>
  </linearGradient>`;
}

const toyMovement = `@media (prefers-reduced-motion:no-preference) {
  @keyframes toyWalk {from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
  @keyframes toyHoverWing {from{transform:scaleX(.84) rotate(-3deg)}to{transform:scaleX(1.05) rotate(3deg)}}
  @keyframes toyRibbon {from{transform:skewX(-7deg)}to{transform:skewX(7deg)}}
  .toy-leg-left,.toy-leg-right,.toy-wing,.toy-ribbon{transform-box:fill-box}
  .toy-leg-left{transform-origin:right center;animation:toyWalk .23s ease-in-out infinite alternate}
  .toy-leg-right{transform-origin:left center;animation:toyWalk .23s ease-in-out -.23s infinite alternate}
  .toy-wing{transform-origin:center 75%;animation:toyHoverWing .18s ease-in-out infinite alternate}
  .toy-ribbon{transform-origin:center top;animation:toyRibbon 1.35s ease-in-out infinite alternate}
}`;

function toyBug(color, variant = 0) {
  const species = Math.abs(Math.trunc(variant)) % 3;
  const bee = species === 2;
  const beetle = species === 1;
  const p = toyPalette(bee ? '#ffca40' : color);
  const id = p.id;
  const body = bee ? 'M50 34C65 33 75 44 74 59Q73 84 50 97Q27 84 26 59C25 45 34 34 50 34Z'
    : beetle ? 'M50 35C67 34 78 45 76 65Q75 90 55 99Q50 102 45 99Q25 90 24 65C22 46 34 34 50 35Z'
    : 'M50 33C70 32 84 49 83 68C82 88 67 101 50 101C30 101 17 87 17 68C16 50 30 34 50 33Z';
  const legs = `<g fill="none" stroke="#514352" stroke-width="3.8">
    <g class="toy-leg-left"><path d="m31 48-13-7-4-9m12 28-13 1-7-5m23 18-12 7-1 8"/></g>
    <g class="toy-leg-right"><path d="m69 48 13-7 4-9M74 60l13 1 7-5M71 74l12 7 1 8"/></g></g>`;
  const wings = bee ? `<g class="toy-wing" fill="url(#${id}wing)" stroke="#67a6b0" stroke-width="1.8">
    <path d="M42 53C29 28 9 24 9 38Q9 54 41 62Z"/><path d="M38 59Q17 48 13 63Q13 76 39 65Z"/>
    <path d="M58 53C71 28 91 24 91 38Q91 54 59 62Z"/><path d="M62 59Q83 48 87 63Q87 76 61 65Z"/>
    <path d="M15 36q15 3 25 18m44-18Q69 39 60 54" fill="none" stroke="white" stroke-width="2.7"/>
    </g>` : '';
  let pattern;
  if (bee) {
    pattern = `<g clip-path="url(#${id}shell)" fill="#68503d"><path d="M23 42q27 17 54 0v10q-28 16-54 0Z"/>
      <path d="M23 62q27 18 54 0v10q-28 15-54 0Z"/><path d="M29 82q21 12 43 0l-9 15H38Z"/></g>`;
  } else if (beetle) {
    pattern = `<g clip-path="url(#${id}shell)" fill="none" stroke-width="4.8">
      <path d="M33 35Q17 74 43 99M40 37Q28 67 46 99M67 35Q83 74 57 99M60 37Q72 67 54 99" stroke="${p.pale}"/>
      <path d="M50 39v59" stroke="${p.edge}" stroke-width="2.7"/></g>
      <path d="M28 44q4-14 22-14t22 14q-23 10-44 0Z" fill="url(#${id}head)" stroke="#3e4756" stroke-width="2"/>`;
  } else {
    pattern = `<path d="M50 36q-3 32 0 62" stroke="${p.edge}" stroke-width="2.8" fill="none"/>
      <g fill="#3f3949"><ellipse cx="36" cy="48" rx="5.2" ry="4.7" transform="rotate(-28 36 48)"/>
      <ellipse cx="26" cy="65" rx="4.1" ry="5.2"/><ellipse cx="39" cy="79" rx="5.8" ry="6.3"/>
      <ellipse cx="63" cy="48" rx="5.2" ry="4.7" transform="rotate(28 63 48)"/>
      <ellipse cx="74" cy="65" rx="4.1" ry="5.2"/><ellipse cx="61" cy="79" rx="5.8" ry="6.3"/></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110" fill="none" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">
    <defs>${toyPaint(p)}<clipPath id="${id}shell"><path d="${body}"/></clipPath>
    <linearGradient id="${id}head" x2=".28" y2="1"><stop stop-color="#687588"/><stop offset="1" stop-color="#343143"/></linearGradient>
    <linearGradient id="${id}wing" x2=".3" y2="1"><stop stop-color="#fff"/><stop offset=".62" stop-color="#d4fbfb"/><stop offset="1" stop-color="#9fdde5"/></linearGradient>
    </defs><style>${toyMovement}</style>
    ${legs}${wings}
    <g stroke="#484050" stroke-width="3"><path d="M41 23q-3-12-11-15m29 15q3-12 11-15"/>
    <g fill="#544d60" stroke-width="1"><circle cx="29" cy="8" r="3"/><circle cx="71" cy="8" r="3"/></g></g>
    <path d="${body}" fill="url(#${id}glaze)" stroke="${p.edge}" stroke-width="2.6"/>${pattern}
    <path d="${bee?'M32 55q0-6 5-10':beetle?'M29 59q1-7 4-11':'M23 63q1-11 7-17'}" stroke="white" opacity=".83" stroke-width="4.3"/>
    <path d="M31 31q0-15 19-16t19 16q-1 13-19 14-17-1-19-14Z" fill="url(#${id}head)" stroke="#3d3544" stroke-width="2"/>
    <g fill="#fffdf5" stroke="#474051" stroke-width="1.3"><ellipse cx="41" cy="25" rx="8.2" ry="9.2"/><ellipse cx="59" cy="25" rx="8.2" ry="9.2"/></g>
    <g fill="#302f40"><ellipse cx="42.2" cy="24.4" rx="4.5" ry="5.6"/><ellipse cx="57.8" cy="24.4" rx="4.5" ry="5.6"/></g>
    <g fill="white"><circle cx="40.7" cy="22.6" r="1.6"/><circle cx="56.3" cy="22.6" r="1.6"/></g>
    <path d="M46.2 36q3.8 3 7.6 0" stroke="#ffeacb" stroke-width="1.7"/>
  </svg>`;
}

function toyBalloon(color, label, variant = 0) {
  const p = toyPalette(color);
  const type = Math.abs(Math.trunc(variant)) % 3;
  const bodies = [
    'M49 87C39 83 13 67 12 40C11 20 26 6 49 6C73 6 88 21 87 41C86 64 67 82 53 87Z',
    'M48 87C32 82 17 62 16 37C15 17 31 3 50 3C70 3 86 17 85 38C84 61 70 81 53 87Z',
    'M48 87Q35 82 18 61C4 45 12 19 31 12Q50 4 69 12C88 19 96 45 82 61Q66 81 53 87Z'
  ];
  const display = String(label).replace(/[^А-ЯЁ0-9]/g, '').slice(0,1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 124" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <defs>${toyPaint(p)}</defs><style>${toyMovement}</style>
    <g class="toy-ribbon"><path d="M50 89c9 11-12 13-6 22q2 4 11 6l-3 4" stroke="${p.edge}" stroke-width="3"/>
    <path d="M50 90c8 10-12 13-6 21q2 4 11 6" stroke="${p.pale}" stroke-width="1.25"/></g>
    <path d="M50 83q-1 6-6 10 5 3 13 0-4-4-5-10Z" fill="url(#${p.id}edge)" stroke="${p.edge}" stroke-width="1.5"/>
    <path d="${bodies[type]}" fill="url(#${p.id}glaze)" stroke="${p.edge}" stroke-width="2"/>
    <path d="M22 34q1-9 10-16" stroke="#fff" opacity=".72" stroke-width="5"/>
    <ellipse cx="37.2" cy="15" rx="3.5" ry="1.9" fill="#fff" opacity=".8" transform="rotate(-19 37.2 15)"/>
    <path d="M72 67q-6 9-14 13" stroke="${p.pale}" stroke-opacity=".57" stroke-width="2"/>
    <text x="50" y="61" text-anchor="middle" font-family="Nunito,Arial,sans-serif" font-weight="900" font-size="43" paint-order="stroke" stroke="${p.edge}" stroke-width="2.9" fill="#fffff8">${display}</text>
    <path d="M47.5 87q2.6 1.4 5.8-.1" stroke="${p.edge}" stroke-width="2.5"/>
  </svg>`;
}

const toySilhouettes = {
  circle: 'M80 50a30 30 0 1 1-60 0 30 30 0 1 1 60 0Z',
  square: 'M27 21h46q6 0 6 6v46q0 6-6 6H27q-6 0-6-6V27q0-6 6-6Z',
  star: 'M48 16q2-4 4 0l8.5 19 20.8 2.4q4 .4 1 3.7L67 56l4.3 20.6q.7 4.1-3 2l-18.4-10-18.4 10q-3.5 2.2-3-2L33 56 17.5 41q-3-3 1-3.5L39.5 35Z',
  apple: 'M49 33C33 22 17 30 16 48C14 63 23 82 36 85Q43 87 50 82Q57 87 65 84C79 78 89 52 81 38Q73 21 54 32Q51 34 49 33Z',
  pear: 'M43 26C48 19 61 22 64 31Q65 42 73 51C93 71 79 88 55 89C25 91 9 73 27 54Q38 43 39 35Q40 29 43 26Z',
  car: 'M15 52q3-4 10-4l11-14q3-5 11-5h15q6 0 10 6l9 12q10 1 11 10l-1 11q-1 5-7 5H17q-7 0-7-7l1-9q0-3 4-5Z'
};

function toyObject(shape, color, scale = 1, hole = false) {
  const p = toyPalette(color);
  const base = toySilhouettes[shape] || toySilhouettes.circle;
  const size = Number.isFinite(scale) ? Math.max(.1, Math.min(1.25, scale)) : 1;
  let details = '';
  if (shape === 'apple' || shape === 'pear') {
    const kernel = shape === 'apple' ? 50 : 52;
    details = `<g transform="translate(${kernel - 50} ${shape === 'pear' ? -7 : 0})">
      <path d="M49 34q0-9 5-17" stroke="#7d503b" stroke-width="4.5"/>
      <path d="M51 26Q53 11 73 13Q66 29 51 26Z" fill="#69b66a" stroke="#468955" stroke-width="1.7"/>
      <path d="m54 24 13-8" stroke="#a4d686" stroke-width="1.4"/></g>
      <path d="${shape === 'apple' ? 'M25 50q0-9 7-13' : 'M29 65q1-6 6-11'}" stroke="#fffdf2" opacity=".81" stroke-width="4.8"/>
      <g fill="${p.shade}" opacity=".65"><circle cx="67" cy="66" r="1.3"/><circle cx="72" cy="61" r="1"/><circle cx="67" cy="60" r=".8"/></g>`;
  } else if (shape === 'car') {
    const wheel = x => `<g transform="translate(${x} 71)"><circle r="10.4" fill="#484956" stroke="#383748" stroke-width="1.7"/><circle r="5.5" fill="#b8c5c6"/><circle r="2" fill="#6d7180"/></g>`;
    details = `<path d="M33 47l7.8-10.1q2-3 5.8-3H50v13.3Zm20.7.2V34h7.5q3 0 6 4l6 9.1Z" fill="#bcf4fc" stroke="${p.edge}" stroke-width="1.5"/>
      <path d="m44 37-6 7m24-7 5 7" stroke="white" opacity=".8" stroke-width="2"/>
      <path d="M15 62q33 3 72-2" stroke="${p.shade}" opacity=".8" stroke-width="2"/>
      <path d="M55 52h4" stroke="${p.edge}" stroke-width="2.5"/>
      <path d="M86 50q4 1 4 6l-6 1q-2 0-2-2v-3q0-2 4-2Z" fill="#ffedab"/>
      ${wheel(29)}${wheel(73)}`;
  } else {
    const gloss = {circle:'M28 43q3-11 15-15',square:'M27 42V29q0-2 3-2h22',star:'m27 42 15-2 7-15'};
    details = `<path d="${gloss[shape] || gloss.circle}" stroke="#fffdf7" opacity=".8" stroke-width="3.7"/>
      <path d="${base}" fill="none" stroke="white" opacity=".15" stroke-width="2" transform="translate(4.5 4.5) scale(.91)"/>`;
  }
  const silhouette = shape === 'car' ? 'M15 52q3-4 10-4l11-14q3-5 11-5h15q6 0 10 6l9 12q10 1 11 10l-1 11q-1 5-7 5h-1q-2 9-10 9t-10-9H39q-2 9-10 9t-10-9h-2q-7 0-7-7l1-9q0-3 4-5Z'
    : shape === 'apple' || shape === 'pear' ? base + (shape==='apple'?' M48 33q-1-11 6-17l2 1-3 8q5-14 20-12-7 16-21 13l-1 7Z':' M50 25q-1-11 6-17l2 1-3 8q5-14 20-12-7 16-21 13l-1 7Z') : base;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <defs>${toyPaint(p)}<linearGradient id="${p.id}inset" x2=".1" y2="1"><stop stop-color="${p.edge}"/><stop offset="1" stop-color="${p.light}"/></linearGradient></defs>
    <g transform="translate(50 50) scale(${size}) translate(-50 -50)">
    ${hole ? `<path d="${silhouette}" transform="translate(0 2.5)" fill="#fff5ce"/><path d="${silhouette}" fill="url(#${p.id}inset)" stroke="${p.edge}" stroke-width="2.2"/>`
      : `<path d="${base}" transform="translate(0 2.4)" fill="${p.edge}" stroke="${p.edge}" stroke-width="2"/>
      <path d="${base}" fill="url(#${p.id}glaze)" stroke="${p.edge}" stroke-width="2.2"/>${details}`}</g>
  </svg>`;
}

function toyBasket(color) {
  const p = toyPalette(color);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 82" aria-hidden="true" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <defs>${toyPaint(p)}</defs>
    <ellipse cx="55" cy="75" rx="39" ry="4.6" fill="#694932" opacity=".15"/>
    <path d="M10 26Q12 18 23 16Q55 10 87 16Q99 18 101 26L92 65Q91 70 84 72Q55 78 26 72Q19 70 18 64Z" fill="url(#${p.id}edge)" stroke="${p.edge}" stroke-width="2.5"/>
    <path d="M10 26Q12 18 24 16Q55 12 86 16Q99 18 100 25L97 33Q54 43 12 33Z" fill="${p.light}" stroke="${p.edge}" stroke-width="2"/>
    <path d="M16 25Q20 19 31 18Q57 15 84 19Q92 20 95 24Q56 33 16 25Z" fill="${p.edge}"/>
    <path d="M19 24Q56 19 89 24Q63 29 19 24Z" fill="${p.shade}"/>
    <path d="M16 30q39 8 78-1" stroke="${p.pale}" stroke-width="2.2"/>
    <g stroke="${p.edge}" opacity=".39" stroke-width="3.5"><path d="m29 43 3 17m11-15 1 18m13-18v18m14-19-1.7 18m15-20-3 17"/></g>
    <path d="m23 40 1.5 6M29 68q23 5 48 1" stroke="${p.pale}" stroke-width="2.4" opacity=".9"/>
  </svg>`;
}
