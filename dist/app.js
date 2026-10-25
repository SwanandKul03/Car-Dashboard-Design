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

function updatePrototypeTransition() {
  const track = $('#prototype-scroll');
  const pin = $('#prototype-pin');
  if (!track || !pin) return;
  const top = parseFloat(getComputedStyle(pin).top) || 0;
  const travel = Math.max(1, track.offsetHeight - pin.offsetHeight);
  const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (top - track.getBoundingClientRect().top) / travel));
  track.style.setProperty('--prototype-progress', progress.toFixed(4));
  const highFidelity = progress >= .5;
  $('#prototype-state').textContent = highFidelity ? 'High-fidelity prototype' : 'Paper prototype';
  $('.prototype-low').setAttribute('aria-hidden', String(highFidelity));
  $('.prototype-high').setAttribute('aria-hidden', String(!highFidelity));
}

function drawAnatomyConnector() {
  const layout = $('#anatomy-layout');
  const image = $('#anatomy-image');
  const tab = $('.anatomy-tabs [aria-selected=true]');
  if (!layout || !image || !tab || !image.complete) return;
  const shell = layout.getBoundingClientRect();
  const picture = image.getBoundingClientRect();
  const label = tab.getBoundingClientRect();
  const key = tab.dataset.zone;
  const onLeft = label.right <= picture.left;
  const anchors = {driving:[1192,225],navigation:onLeft?[191,650]:[724,421],status:[1693,207],alerts:[1175,82]};
  const [x,y] = anchors[key];
  const targetX = picture.left-shell.left+picture.width*x/2400;
  const targetY = picture.top-shell.top+picture.height*y/1490;
  let path;
  if (onLeft) {
    const startX = label.right-shell.left+8;
    const startY = label.top-shell.top+label.height/2;
    const bendX = picture.left-shell.left-(picture.left-label.right)/2;
    if (key === 'navigation') {
      path = `M${startX} ${startY} H${bendX} V${targetY} H${targetX}`;
    } else {
      const upperY = picture.top-shell.top-14;
      path = `M${startX} ${startY} H${bendX} V${upperY} H${targetX} V${targetY}`;
    }
  } else {
    const startX = label.right-shell.left+6;
    const startY = label.top-shell.top+label.height/2;
    const bendX = shell.width+8;
    const bendY = picture.top-shell.top-14;
    path = `M${startX} ${startY} H${bendX} V${bendY} H${targetX} V${targetY}`;
  }
  $('#anatomy-connector').setAttribute('viewBox', `0 0 ${shell.width} ${shell.height}`);
  $('#anatomy-leader').setAttribute('d', path);
}

const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
const processScroll = $('.process-scroll');
let activeChapter = null;
let scrollQueued = false;
const updateProgress = () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  $('.reading-progress i').style.transform = 'scaleX(' + (total > 0 ? Math.min(1,Math.max(0,scrollY/total)) : 0) + ')';
  let current=chapterLinks[0];
  chapterLinks.forEach(link=>{const target=document.querySelector(link.hash);if(target&&target.getBoundingClientRect().top<=140)current=link;});
  chapterLinks.forEach(link=>{const active=link===current;link.classList.toggle('active',active);link.classList.toggle('completed',chapterLinks.indexOf(link)<chapterLinks.indexOf(current));if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  if (current !== activeChapter) {
    const linkBox=current.getBoundingClientRect(), railBox=processScroll.getBoundingClientRect();
    const left=processScroll.scrollLeft+linkBox.left-railBox.left-(processScroll.clientWidth-linkBox.width)/2;
    processScroll.scrollTo({left:Math.max(0,left),behavior:reduced.matches?'instant':'smooth'});
    activeChapter=current;
  }
  updatePrototypeTransition();
  scrollQueued = false;
};
addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); } }, {passive:true});
addEventListener('resize', updateProgress);
updateProgress();

const media = $('#media-dialog');
let returnFocus = null;
function openDialog(dialog, trigger) { returnFocus = trigger; dialog.showModal(); document.body.classList.add('dialog-open'); }
media.querySelector('.media-close').addEventListener('click', () => media.close());
[media].forEach(dialog => {
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
document.querySelectorAll('[data-evidence]').forEach(button => button.addEventListener('click', () => {
  const feedback = button.dataset.evidence === 'feedback';
  const files = feedback
    ? ['source-evidence-feedback-59.webp','source-evidence-feedback-60.webp','source-evidence-feedback-61.webp','source-evidence-feedback-62.webp']
    : ['source-evidence-sus.webp'];
  const documentView = document.createElement('div');
  documentView.className = feedback ? 'evidence-document' : 'evidence-image';
  files.forEach((file,index) => {
    const img = new Image();
    img.src = assetBase + file;
    img.alt = feedback
      ? (index === 0 ? 'Original participant-feedback table from the scenario evaluation.' : 'Continuation of the original participant-feedback record.')
      : 'Original SUS responses and reported mean from the project report.';
    documentView.append(img);
  });
  $('#media-content').replaceChildren(documentView);
  media.classList.toggle('document-evidence',feedback);
  $('#media-title').textContent = feedback ? 'Participant feedback' : 'Original SUS results';
  $('#media-caption').textContent = feedback
    ? 'Complete participant-feedback table from the original scenario evaluation.'
    : 'Recorded SUS responses for the original prototype.';
  openDialog(media,button);
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
  driving:{title:'Speed and primary driving information.',text:'Speed occupies the centre of the display and uses the largest numerical readout. Gear and supporting driving information are grouped around the speedometer.'},
  navigation:{title:'Navigation and journey details.',text:'Navigation and journey details occupy the left-hand area of the display.'},
  status:{title:'Vehicle condition and status.',text:'Transmission, fuel, temperature and tyre information are grouped in the right-hand area.'},
  alerts:{title:'Warning and indicator area.',text:'Warnings and indicators occupy the upper area. The documented revision added a door-open indicator.'}
};
initialiseTabs('.anatomy-tabs [role=tab]', tab => {
  const key = tab.dataset.zone, data = zones[key];
  $('#anatomy-title').textContent=data.title;
  $('#anatomy-text').textContent=data.text;
  document.querySelectorAll('[data-region]').forEach(path=>path.classList.toggle('active',path.dataset.region===key));
  requestAnimationFrame(drawAnatomyConnector);
});

const films = {
  startup:{title:'Start-up sequence.',description:'The start-up recording shows the instrument display becoming active, with the speed readout at zero.',label:'Start-up prototype recording'},
  highway:{title:'Highway driving.',description:'The highway recording shows speed, navigation and vehicle-status information during the scenario.',label:'Long highway prototype recording'},
  navigation:{title:'Navigation guidance.',description:'The navigation recording shows route guidance and journey details alongside the driving information.',label:'Navigation prototype recording'},
  'low-visibility':{title:'Low-visibility conditions.',description:'The low-visibility recording shows light-related signals within the dashboard layout.',label:'Low-visibility prototype recording'}
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
  $('#film-title').textContent=data.title;
  $('#film-description').textContent=data.description;
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)scenarioVideo.pause();});

const eras = [
 {period:'Before the automobile',title:'Protective carriage dashboard.',description:'The historical review begins with the protective dashboard of a horse-drawn carriage, shown in the original research drawing.',file:'carriage.webp',width:451,height:246,figure:1},
 {period:'1950s–1980s',title:'The instrument panel.',description:'The research drawing shows speed, engine and fuel information alongside physical controls.',file:'instrument-panel.webp',width:451,height:339,figure:2},
 {period:'1980s–early 2000s',title:'Warning symbols and indicators.',description:'The historical review documents the addition of warning symbols and indicators around the primary gauges.',file:'dashboard.webp',width:451,height:339,figure:3},
 {period:'2000s–mid-2010s',title:'The electronic cluster.',description:'The review examines electronic instrument clusters and the addition of digital information.',file:'electronic-cluster.webp',width:451,height:339,figure:4},
 {period:'This project',title:'Paper prototype.',description:'Historical and preliminary research informed paper prototypes with separate areas for navigation, driving information and vehicle status.',file:'paper-prototype-layout.webp',width:3797,height:2689,figure:8}
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

const range=$('#comparison-range');
function setComparison(value) {
 $('#comparison').style.setProperty('--split',value+'%');
 range.value=value;range.setAttribute('aria-valuetext',value+' percent refined direction');
}
range.addEventListener('input',()=>setComparison(range.value));

$('#anatomy-image').addEventListener('load', drawAnatomyConnector);
if ('ResizeObserver' in window) new ResizeObserver(drawAnatomyConnector).observe($('#anatomy-layout'));
addEventListener('resize', drawAnatomyConnector);
reduced.addEventListener('change', updateProgress);
document.fonts.ready.then(() => { updateProgress(); drawAnatomyConnector(); });
requestAnimationFrame(drawAnatomyConnector);
