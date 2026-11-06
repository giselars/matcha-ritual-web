import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const media=gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)',()=>{
  gsap.timeline({defaults:{ease:'power2.out'}})
    .from('.title-word',{y:32,opacity:0,duration:.65,stagger:.09})
    .from('.hero .intro,.hero .button',{y:24,opacity:0,duration:.4,stagger:.08},'-.15');
  gsap.utils.toArray('.essence h2,.ritual-content,.section-heading,.product,.pause h2,.faq h2').forEach(element=>{
    gsap.from(element,{y:window.innerWidth<700?24:40,opacity:0,duration:.7,scrollTrigger:{trigger:element,start:'top 92%',once:true}});
  });
});
// Native details remain functional when scripting is unavailable.
document.querySelectorAll('.faq-list details').forEach(details=>{
  const summary=details.querySelector('summary');
  const content=details.querySelector('p');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  let contentAnimation;
  let desired=details.open;

  const settle=()=>{
    // Apply the native state before removing the final animation frame.
    details.open=desired;
    animation?.cancel();
    contentAnimation?.cancel();
    animation=null;
    contentAnimation=null;
    delete details.dataset.expanded;
  };

  summary.addEventListener('click',event=>{
    if(reducedMotion.matches){
      settle();
      return; // Preserve native keyboard and pointer activation.
    }
    event.preventDefault();
    desired=!desired;
    const start=details.getBoundingClientRect().height;
    const opacity=details.open?getComputedStyle(content).opacity:'0';
    animation?.cancel();
    contentAnimation?.cancel();
    details.open=true;
    details.dataset.expanded=String(desired);

    const style=getComputedStyle(details);
    const closedHeight=summary.getBoundingClientRect().height+
      parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+
      parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
    const end=desired?details.getBoundingClientRect().height:closedHeight;
    const options={duration:300,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both'};
    contentAnimation=content.animate({opacity:[opacity,desired?1:0]},options);
    animation=details.animate({height:[`${start}px`,`${end}px`]},options);
    animation.onfinish=settle;
  });
  details.addEventListener('toggle',()=>{if(!animation)desired=details.open;});
  reducedMotion.addEventListener('change',event=>{if(event.matches)settle();});
  let width=details.getBoundingClientRect().width;
  new ResizeObserver(([entry])=>{
    const nextWidth=entry.borderBoxSize?.[0]?.inlineSize??details.getBoundingClientRect().width;
    if(Math.abs(nextWidth-width)>.5&&animation)settle();
    width=nextWidth;
  }).observe(details);
});
media.add('(prefers-reduced-motion: no-preference)',()=>{
 gsap.from('.botanical',{opacity:0,duration:1,stagger:.1,scrollTrigger:{trigger:'.pause',start:'top 85%',once:true}});
});
media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)',()=>{
 gsap.to('.botanical',{y:-24,ease:'none',scrollTrigger:{trigger:'.pause',start:'top bottom',end:'bottom top',scrub:true}});
});
