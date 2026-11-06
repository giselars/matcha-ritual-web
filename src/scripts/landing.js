import './ritual-gallery.js';
// Replace typographic UI glyphs with the local Lucide icon set.
const iconNames={'↗':'arrow-up-right','↓':'arrow-down','↑':'arrow-up','+':'plus','×':'x'};
document.querySelectorAll('.button span,.nav-cta span,.text-link span,.round-link,.product-title button,summary span,.close,.back-top').forEach(element=>{
  const glyph=Object.keys(iconNames).find(symbol=>element.textContent.includes(symbol));
  if(!glyph)return;
  const label=element.textContent.replace(glyph,'').trim();
  const icon=document.createElement('i');
  icon.className=`icon icon-${iconNames[glyph]}`;
  icon.setAttribute('aria-hidden','true');
  element.replaceChildren(...(label?[document.createTextNode(label+' ')]:[]),icon);
});
const products={matcha:['Matcha ceremonial','Un verde que invita a detenerse. Nuestra propuesta de matcha se presenta en un envase de acabado mate, pensado para acompañar los pequeños rituales de cada día.'],ritual:['El ritual completo','Un cuenco de cerámica de formas orgánicas, un batidor de bambú y matcha. Una selección de texturas y objetos que celebra la belleza de preparar algo con tus propias manos.']};
const dialog=document.querySelector('#product-dialog');dialog.setAttribute('aria-labelledby','dialog-title');document.querySelectorAll('[data-product]').forEach(button=>button.addEventListener('click',()=>{const item=products[button.dataset.product];document.querySelector('#dialog-title').textContent=item[0];document.querySelector('#dialog-copy').textContent=item[1];dialog.showModal()}));document.querySelectorAll('.close,.close-bottom').forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});

const heroVideo=document.querySelector('#hero-video');
const videoToggle=document.querySelector('.video-toggle');
let manuallyPaused=false;
let videoVisible=true;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function updateVideoToggle(){const label=heroVideo.paused?'Reproducir vídeo':'Pausar vídeo';videoToggle.textContent=label;videoToggle.setAttribute('aria-label',label)}
function playHeroVideo(){heroVideo.play().catch(updateVideoToggle)}
heroVideo.addEventListener('play',updateVideoToggle);
heroVideo.addEventListener('pause',updateVideoToggle);
videoToggle.addEventListener('click',()=>{if(heroVideo.paused){manuallyPaused=false;playHeroVideo()}else{manuallyPaused=true;heroVideo.pause()}});
reducedMotion.addEventListener('change',event=>{if(event.matches){heroVideo.pause();}else if(!manuallyPaused && videoVisible)playHeroVideo()});
if(!reducedMotion.matches)playHeroVideo();

const videoObserver=new IntersectionObserver(([entry])=>{videoVisible=entry.isIntersecting;if(!videoVisible)heroVideo.pause();else if(!manuallyPaused&&!reducedMotion.matches)playHeroVideo()},{threshold:.1});
videoObserver.observe(heroVideo);
