/* A single brand color, with stronger depth between profile steps. */
personalNodeStyle.color='#8dbed3';
const beforeNoPaletteWelcome=welcome;welcome=function(){return beforeNoPaletteWelcome().replace('Fotoğrafın ve renginle sana ait olsun.','Fotoğraflarınla sana ait olsun.').replace(/<div class="node-personal-palette">[\s\S]*?<\/div><\/div>/,'')};
let previousSetupTransition='';
const beforeStepTransitionRender=render;render=function(keep=false){const key=experience.onboarding===1?String(setupFlow.step):'';beforeStepTransitionRender(keep);if(key&&key!==previousSetupTransition){const page=content.querySelector('.setup-page');if(page){page.classList.add('setup-step-arrival');const wave=document.createElement('span');wave.className='setup-transition-wave';wave.setAttribute('aria-hidden','true');page.querySelector('.personal-node-portal')?.append(wave);wave.addEventListener('animationend',()=>wave.remove(),{once:true});setTimeout(()=>wave.remove(),1000)}}previousSetupTransition=key};
render();
