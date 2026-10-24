const $ = selector => document.querySelector(selector);
const assetBase = new URL('./assets/', document.currentScript.src).href;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroVideo = $('#hero-video');
if (heroVideo) {
  heroVideo.muted = true;
  let openingSeen = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { heroVideo.pause(); return; }
      if (!openingSeen) {
        openingSeen = true;
        if (!reduced.matches) heroVideo.play().catch(() => {});
      }
    }, {threshold: .15}).observe(heroVideo);
  } else if (!reduced.matches) heroVideo.play().catch(() => {});
  reduced.addEventListener('change', event => { if (event.matches) heroVideo.pause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) heroVideo.pause(); });
}

if ('IntersectionObserver' in window) {
  document.body.classList.add('js-ready');
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); }
  }), {threshold: .05});
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
}
const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
let scrollQueued = false;
const updateProgress = () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  $('.reading-progress i').style.transform = 'scaleX(' + (total > 0 ? Math.min(1,Math.max(0,scrollY/total)) : 0) + ')';
  let current=chapterLinks[0];
  chapterLinks.forEach(link=>{const target=document.querySelector(link.hash);if(target&&target.getBoundingClientRect().top<=140)current=link;});
  chapterLinks.forEach(link=>{const active=link===current;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  scrollQueued = false;
};
addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); } }, {passive:true});
addEventListener('resize', updateProgress);
updateProgress();

const menu = $('#menu-dialog');
const media = $('#media-dialog');
let returnFocus = null;
function openDialog(dialog, trigger) { returnFocus = trigger; dialog.showModal(); document.body.classList.add('dialog-open'); }
$('#menu-open').addEventListener('click', e => openDialog(menu, e.currentTarget));
menu.querySelector('.menu-close').addEventListener('click', () => menu.close());
menu.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => menu.close()));
media.querySelector('.media-close').addEventListener('click', () => media.close());
[menu,media].forEach(dialog => {
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (dialog === media) { const v=media.querySelector('video'); if(v)v.pause(); $('#media-content').replaceChildren(); }
    returnFocus?.focus({preventScroll:true});
  });
});
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  const img = new Image();
  img.src = assetBase + button.dataset.zoom;
  img.alt = button.dataset.caption || 'Original project evidence';
  $('#media-content').replaceChildren(img);
  $('#media-title').textContent = 'A closer look';
  $('#media-caption').textContent = button.dataset.caption || '';
  openDialog(media, button);
}));

function initialiseTabs(selector, onSelect) {
  const tabs = [...document.querySelectorAll(selector)];
  const select = tab => {
    tabs.forEach(t => { const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1; });
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel?.setAttribute('aria-labelledby', tab.id);
    onSelect(tab);
  };
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%tabs.length;
      if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index-1+tabs.length)%tabs.length;
      if(e.key==='Home')next=0;
      if(e.key==='End')next=tabs.length-1;
      if(next!==undefined){e.preventDefault();tabs[next].focus();select(tabs[next]);}
    });
  });
}
const zones = {
  driving:{number:'01',title:'A clear centre of gravity.',text:'Speed takes the central position and the greatest visual weight. Supporting information stays grouped around it, preserving a recognisable structure.'},
  navigation:{number:'02',title:'Direction, without the search.',text:'The complete route and its supporting information sit together on the left. The position gives navigation a consistent visual home.'},
  status:{number:'03',title:'Condition, at a glance.',text:'Transmission, fuel, temperature and tyre information share the right-hand zone, keeping the condition of the vehicle together.'},
  alerts:{number:'04',title:'A dedicated warning area.',text:'The upper warning area separates active signals from the main information groups. The documented iteration added a door-open indication.'}
};
initialiseTabs('.anatomy-tabs [role=tab]', tab => {
  const key = tab.dataset.zone, data = zones[key];
  $('#anatomy-number').textContent=data.number;
  $('#anatomy-title').textContent=data.title;
  $('#anatomy-text').textContent=data.text;
  document.querySelectorAll('[data-region]').forEach(path=>path.classList.toggle('active',path.dataset.region===key));
});

const films = {
  startup:{index:'01',title:'A composed beginning.',description:'The start-up sequence brings the dashboard into view, ending with the speed display at rest.',note:'Edited to remove the parked needle sweep.',label:'Start-up prototype recording'},
  highway:{index:'02',title:'A consistent point of reference.',description:'The highway recording shows the central driving information alongside the supporting navigation and vehicle-status areas.',note:'',label:'Long highway prototype recording'},
  navigation:{index:'03',title:'A route with its own space.',description:'The navigation sequence keeps the route and journey details together, alongside the primary driving information.',note:'',label:'Navigation prototype recording'},
  'low-visibility':{index:'04',title:'Attention when conditions change.',description:'The low-visibility recording presents light-related signals within the dashboard’s established information structure.',note:'',label:'Low-visibility prototype recording'}
};
const scenarioVideo = $('#scenario-video');
let loadedFilm = 'startup';
initialiseTabs('.film-tabs [role=tab]', tab => {
  const key=tab.dataset.filmKey,data=films[key];
  if (key!==loadedFilm) {
    const resume=!scenarioVideo.paused;
    scenarioVideo.pause();
    scenarioVideo.poster=assetBase+'scenarios/'+key+'-poster.webp';
    scenarioVideo.src=assetBase+'scenarios/'+key+'.mp4';
    scenarioVideo.setAttribute('aria-label',data.label);
    scenarioVideo.load();
    if(resume)scenarioVideo.play().catch(()=>{});
    loadedFilm=key;
    if(!reduced.matches)$('#film-panel').animate([{opacity:.55},{opacity:1}],{duration:350,easing:'ease-out'});
  }
  $('#film-index').textContent='Sequence '+data.index;
  $('#film-title').textContent=data.title;
  $('#film-description').textContent=data.description;
  $('#film-edit-note').textContent=data.note;
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)scenarioVideo.pause();});

const eras = [
 {period:'Before the automobile',title:'A shield before a screen.',description:'The historical review traces the dashboard to the protective board of a horse-drawn carriage, before it became a surface for driving information.',file:'carriage.webp',width:451,height:246,figure:1},
 {period:'1950s–1980s',title:'The instrument panel.',description:'The research drawing groups speed, engine and fuel information with physical controls, establishing the familiar core of the dashboard.',file:'instrument-panel.webp',width:451,height:339,figure:2},
 {period:'1980s–early 2000s',title:'More signals. More to interpret.',description:'The historical survey follows the growth of warning symbols and indicators around the primary gauges.',file:'dashboard.webp',width:451,height:339,figure:3},
 {period:'2000s–mid-2010s',title:'The electronic cluster.',description:'The review examines the move towards electronic instrument clusters and the increasing role of digital information.',file:'electronic-cluster.webp',width:451,height:339,figure:4},
 {period:'This project',title:'A framework for clarity.',description:'The historical review and preliminary research informed paper prototypes that separate navigation, critical driving information and vehicle status.',file:'paper-prototype-layout.webp',width:3797,height:2689,figure:8}
];
let selectedEra=0;
function selectEra(value) {
  const index=Math.max(0,Math.min(eras.length-1,Number(value))),data=eras[index];
  $('#era-range').value=index;
  $('#era-range').setAttribute('aria-valuetext',data.period);
  $('#era-range').style.setProperty('--era-progress',(index/4*100)+'%');
  document.querySelectorAll('[data-era]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.era)===index)));
  $('#era-period').textContent=data.period;
  $('#era-title').textContent=data.title;
  $('#era-description').textContent=data.description;
  $('#era-count').textContent=String(index+1).padStart(2,'0')+' / 05';
  $('#era-source').textContent=(index===4?'Original paper prototype':'Historical research drawing')+' / Figure '+data.figure;
  $('#era-zoom').dataset.zoom='history/'+data.file;
  $('#era-zoom').dataset.caption=(index===4?'Complete original paper prototype':'Historical research drawing')+', Figure '+data.figure+' in the project report. '+data.period+'.';
  if(index!==selectedEra) {
    const img=$('#era-image');
    img.src=assetBase+'history/'+data.file;
    img.width=data.width;img.height=data.height;img.alt=data.title+' '+data.description;
    if(index===4)img.setAttribute('data-large','');else img.removeAttribute('data-large');
    if(!reduced.matches)img.animate([{opacity:.15,transform:'translateX(10px)'},{opacity:1,transform:'translateX(0)'}],{duration:380,easing:'ease-out'});
    selectedEra=index;
  }
}
$('#era-range').addEventListener('input',e=>selectEra(e.currentTarget.value));
document.querySelectorAll('[data-era]').forEach(button=>button.addEventListener('click',()=>selectEra(button.dataset.era)));
let gestureStart=null;
$('.era-art').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')gestureStart={x:e.clientX,y:e.clientY};});
$('.era-art').addEventListener('pointerup',e=>{
 if(!gestureStart)return;
 const dx=e.clientX-gestureStart.x,dy=e.clientY-gestureStart.y;gestureStart=null;
 if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)selectEra(selectedEra+(dx<0?1:-1));
});
$('.era-art').addEventListener('pointercancel',()=>{gestureStart=null;});

const refinements = {
 navigation:{observation:'Participant feedback identified difficulty reading the route and distinguishing traffic information.',title:'Give the route more presence.',response:'The navigation path was broadened while retaining its established left-hand position.'},
 status:{observation:'Feedback called for clearer fuel and temperature visualisation, including reference markings.',title:'Make condition easier to interpret.',response:'Mid-level indications were added for fuel and engine temperature. Tyre-pressure monitoring information was also introduced.'},
 trip:{observation:'Trip information needed to coexist with the vehicle’s total distance reading.',title:'Keep the essential reference.',response:'The odometer became the default. Trip information would appear when in use, preserving the distinction between total and journey distance.'}
};
initialiseTabs('.refinement-tabs [role=tab]',tab=>{
 const data=refinements[tab.dataset.refinement];
 $('#refinement-observation').textContent=data.observation;
 $('#refinement-title').textContent=data.title;
 $('#refinement-response').textContent=data.response;
});
const range=$('#comparison-range');
function setComparison(value) {
 $('#comparison').style.setProperty('--split',value+'%');
 range.value=value;range.setAttribute('aria-valuetext',value+' percent refined direction');
 document.querySelectorAll('[data-compare]').forEach(button=>{const active=Number(button.dataset.compare)===Number(value);button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
}
range.addEventListener('input',()=>setComparison(range.value));
document.querySelectorAll('[data-compare]').forEach(button=>button.addEventListener('click',()=>setComparison(button.dataset.compare)));


const evolutionStates = {
  'pre-drive': {
    index:'01', context:'Before the drive', title:'Make readiness visible.', file:'latest-pre-drive.webp',
    label:'Enlarge the complete pre-drive screen', caption:'Latest pre-drive dashboard — readiness warnings and stationary vehicle status.',
    notes:[['Readiness signals','Brake and seat-belt warnings occupy the upper signal area.'],['Condition in context','Door and tyre-pressure labels sit beside the vehicle diagram.'],['A clear stationary state','Zero speed, neutral and engine-off status describe the parked vehicle.']]
  },
  driving: {
    index:'02', context:'During the drive', title:'Bring driving information forward.', file:'latest-driving.webp',
    label:'Enlarge the complete driving screen', caption:'Latest driving dashboard — speed, route guidance and active driving signals.',
    notes:[['Speed and gear together','40 mph, third gear and an upshift indication share the central dial.'],['Route context in place','Turn distance, journey distance, ETA and delay remain grouped on the left.'],['Active driving signals','The left indicator, high beam and cruise-control status are illuminated.']]
  }
};
initialiseTabs('.evolution-tabs [role=tab]', tab => {
  const state=tab.dataset.evolution, data=evolutionStates[state];
  document.querySelectorAll('[data-evolution-frame]').forEach(frame => {
    const active=frame.dataset.evolutionFrame===state;
    frame.classList.toggle('active',active);
    frame.setAttribute('aria-hidden',String(!active));
  });
  $('#evolution-state').textContent='State '+data.index+' / '+data.context;
  $('#evolution-title').textContent=data.title;
  const zoom=$('#evolution-zoom');
  zoom.dataset.zoom=data.file;zoom.dataset.caption=data.caption;zoom.setAttribute('aria-label',data.label);
  data.notes.forEach(([title,text],i)=>{
    $('#evolution-note-title-'+(i+1)).textContent=title;
    $('#evolution-note-text-'+(i+1)).textContent=text;
  });
});
