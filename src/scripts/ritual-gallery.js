export const ritualScenes = [
  { src: 'https://res.cloudinary.com/pdjoc1ti/image/upload/v1793472487/preparar.webp', alt: 'Cuenco celadón, matcha y utensilios sobre lino, listos para preparar el ritual', title: 'Todo empieza con una pausa.', copy: 'Prepara tu cuenco favorito, el matcha y el batidor de bambú. Deja espacio para este pequeño momento.' },
  { src: 'https://res.cloudinary.com/pdjoc1ti/image/upload/v1793472486/batir.webp', alt: 'Manos batiendo el matcha con un batidor de bambú en el cuenco', title: 'Encuentra tu propio ritmo.', copy: 'Añade el agua y bate con movimientos suaves y ligeros. Observa cómo el verde se transforma en una delicada espuma.' },
  { src: 'https://res.cloudinary.com/pdjoc1ti/image/upload/v1793472486/disfrutar.webp', alt: 'Cuenco de matcha terminado con espuma, listo para disfrutar', title: 'Este momento es tuyo.', copy: 'Acerca el cuenco, respira su aroma y disfruta del primer sorbo. Solo, con leche o con tu bebida vegetal favorita.' },
];
const content = document.querySelector('.ritual-content');
const image = document.querySelector('.ritual-photo img');
const panel = content.querySelector('#step-panel');
const tabs = [...content.querySelectorAll('[role="tab"]')];
const playback = content.querySelector('.ritual-playback');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const cache = new Map();
let active = 0, request = 0, timer, progress;
let visible = false, hovered = false, paused = false, changing = false;
let animations = [];

function load(scene) {
  if (!cache.has(scene.src)) {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => reject(new Error('Image timeout')), 12000);
      const finish = (error) => { clearTimeout(timeout); error ? reject(error) : resolve(); };
      img.onload = () => img.decode().then(() => finish(), finish);
      img.onerror = () => finish(new Error('Image unavailable'));
      img.src = scene.src;
    }).catch(error => { cache.delete(scene.src); throw error; });
    cache.set(scene.src, promise);
  }
  return cache.get(scene.src);
}
function cancelAnimations() {
  animations.forEach(animation => animation.cancel());
  animations = [];
}
function stopClock() {
  clearTimeout(timer);
  progress?.cancel();
  progress = undefined;
}
function eligible() {
  return visible && !document.hidden && !hovered && !paused && !reduced.matches;
}
function schedule() {
  stopClock();
  playback.hidden = reduced.matches;
  playback.textContent = paused ? 'Reanudar recorrido' : 'Pausar recorrido';
  if (!eligible() || changing) return;
  progress = tabs[active].animate(
    { backgroundSize: ['0% 2px', '100% 2px'] },
    { duration: 7000, easing: 'linear', fill: 'forwards' }
  );
  timer = setTimeout(() => selectStep((active + 1) % tabs.length), 7000);
}
function pause() {
  paused = true;
  // Invalidate any automatic transition still waiting for its image.
  request++;
  changing = false;
  cancelAnimations();
  schedule();
}
async function selectStep(index) {
  const token = ++request;
  stopClock();
  cancelAnimations();
  changing = true;
  try {
    await load(ritualScenes[index]);
    if (token !== request) return;
    if (!reduced.matches) {
      animations = [image, panel].map(element => element.animate(
        { opacity: [1, 0] }, { duration: 180, fill: 'forwards' }
      ));
      await Promise.all(animations.map(animation => animation.finished));
    }
    if (token !== request) return;
    const scene = ritualScenes[index];
    image.src = scene.src;
    image.alt = scene.alt;
    panel.querySelector('h3').textContent = scene.title;
    panel.querySelector('p').textContent = scene.copy;
    panel.setAttribute('aria-labelledby', tabs[index].id);
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    active = index;
    cancelAnimations();
    if (!reduced.matches) {
      animations = [image, panel].map(element => element.animate(
        { opacity: [0, 1] }, { duration: 270 }
      ));
      await Promise.all(animations.map(animation => animation.finished));
    }
  } catch {
    // Preserve the last complete scene; failed loads are evicted for retry.
  } finally {
    if (token === request) {
      cancelAnimations();
      changing = false;
      schedule();
    }
  }
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => { pause(); selectStep(i); });
  tab.addEventListener('keydown', event => {
    const next = { ArrowRight: (i + 1) % 3, ArrowLeft: (i + 2) % 3, Home: 0, End: 2 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    pause();
    selectStep(next);
  });
});
content.addEventListener('focusin', event => { if (event.target !== playback) pause(); });
playback.addEventListener('click', () => { if (paused) { paused = false; schedule(); } else pause(); });
function suspend() {
  request++;
  changing = false;
  cancelAnimations();
  schedule();
}
content.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; suspend(); } });
content.addEventListener('pointerleave', () => { hovered = false; schedule(); });
document.addEventListener('visibilitychange', suspend);
reduced.addEventListener('change', suspend);
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting && entry.intersectionRatio >= .5;
  suspend();
}, { threshold: [0, .5] }).observe(content);
const preload = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) {
    ritualScenes.forEach(scene => load(scene).catch(() => {}));
    preload.disconnect();
  }
}, { rootMargin: '400px' });
preload.observe(content);
schedule();
