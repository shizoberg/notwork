import assert from 'node:assert/strict';
import {functionSandbox} from './helpers/function-sandbox.mjs';
process.env.NTW_AI_ENABLED='false';
const s=await functionSandbox({adminPassword:'test-only'});
try{
 const registry=await s.load('_event-registry-store');const event=await registry.getEvent('22-kasim-2026');assert.ok(event);assert.ok(event.products.wordcloud.enabled);
 const network=(await s.load('event-network')).default;const word=(await s.load('event-wordcloud')).default;const wa=(await s.load('event-wordcloud-admin')).default;
 async function call(fn,input){const r=await fn(new Request('http://127.0.0.1/api/test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({eventSlug:event.slug,...input})}),{});const text=await r.text();assert.ok(r.ok,text);return JSON.parse(text);}
 const people=[];for(let i=0;i<200;i++)people.push(await call(network,{action:'launchGuest',firstName:`Test ${i}`,email:`qa${i}@example.org`,jobTitle:'Engineer',intro:'Building useful things',offers:['teknoloji'],offersDetail:'Product development',needs:'New connections',eventConsent:true}));
 let results;for(let i=0;i<5;i++)results=await Promise.all(people.map(p=>call(network,{action:'match',accessToken:p.accessToken})));
 assert.equal(new Set(results.filter(r=>r.group).map(r=>r.group.id)).size,66);assert.equal(results.filter(r=>!r.group).length,2);
 const state=await call(wa,{action:'list',password:'test-only'});assert.ok(state.questions.length);
 const q=state.questions[0];const votes=await Promise.all(people.map(()=>call(word,{action:'submit',answers:[{questionId:q.id,answer:'bağlantı'}]})));assert.equal(votes.length,200);
 const response=await word(new Request(`http://127.0.0.1/api/test?event=${event.slug}&action=results`),{});const tally=await response.json();assert.equal(tally.totalVisibleAnswers,200);
 const other=await registry.getEvent('14-kasim-2026');assert.equal(other,null);
 console.log('PASS Notwork: 200 registrations, 66 private groups, 2 waiting, 200 Wordcloud responses, event isolation');
}finally{await s.cleanup();}
