import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.LAUNCH_TEST_URL || 'http://127.0.0.1:5211', email='qa-votes-'+Date.now()+'@example.org';
const b=await chromium.launch({channel:'chrome'});
try {
 const p=await b.newPage({viewport:{width:390,height:844}});
 await p.addInitScript(()=>localStorage.setItem('notwork-cookie-consent-v1',JSON.stringify({status:'necessary'})));
 await p.goto(base+'/launch-space');
 await p.getByLabel('Adın ve soyadın').fill('Test Katılımcı');
 await p.getByLabel('E-posta',{exact:true}).fill(email);
 await p.getByRole('button',{name:'Devam et'}).click();
 for(const answer of ['Yazılım geliştiriyorum','Tasarım desteği sunuyorum','Tasarımcılarla tanışmak istiyorum']){
  await p.locator('textarea').fill(answer);
  await p.getByRole('button',{name:'Devam et'}).click();
 }
 await p.getByRole('checkbox').first().check();
 await p.getByRole('button',{name:'Etkinliğe kayıt ol'}).click();
 const nav=p.getByRole('navigation',{name:'Etkinlik uygulamaları'});
 await nav.waitFor();
 const id=await p.locator('.ls-person .ls-code').first().textContent();
 await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('notwork_event_network_token:')).forEach(k=>localStorage.removeItem(k)));
 await p.reload();
 await p.getByRole('button',{name:'Kaydım var',exact:true}).click();
 await p.getByLabel('E-posta',{exact:true}).fill(email);
 await p.getByRole('button',{name:'Oturumu aç'}).click();
 await nav.waitFor();
 assert.equal(await p.locator('.ls-person .ls-code').first().textContent(),id);
 await nav.getByRole('button',{name:'Nodes Match'}).click();
 await p.locator('.ls-match-heading,.ls-center').first().waitFor();
 await nav.getByRole('button',{name:'Nodes Votes'}).click();
 await p.getByRole('button',{name:'Anladım'}).click();
 await p.locator('.ls-options button').first().click();
 await p.getByRole('button',{name:'Oyumu gönder'}).click();
 const results=p.locator('.ls-vote-results');
 await results.waitFor();
 assert.equal(await results.locator('.ls-result-bar').count(),5);
 assert.equal(await p.locator('.ls-enter > .ls-eyebrow').count(),0);
 const total=await results.locator('.ls-caption').first().innerText();
 const first=await results.locator('.ls-result-bar').first().innerText();
 await p.getByRole('button',{name:'Oyumu değiştir'}).click();
 await p.locator('.ls-options button').nth(1).click();
 await p.getByRole('button',{name:'Oyumu gönder'}).click();
 await results.waitFor();
 assert.equal(await results.locator('.ls-caption').first().innerText(),total);
 assert.notEqual(await results.locator('.ls-result-bar').first().innerText(),first);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 
 for(const width of [320,390,768,1440]) {
  await p.setViewportSize({width,height:900});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const bar of await results.locator('.ls-result-bar').all()) {
   const label=await bar.locator('.ls-result-name').boundingBox();
   const value=await bar.locator('.ls-result-value').boundingBox();
   assert.ok(label.x+label.width<=value.x);
   const percent=Number(await bar.getAttribute('aria-valuenow'));
   const style=await bar.locator('.ls-result-fill').getAttribute('style');
   assert.ok(style.includes(String(percent)));
  }
 }
 console.log('PASS mobile registration, cleared local session + same-browser recovery, Match tab, all five vote results and vote change with stable total.');
}finally{await b.close()}
