type Profile={id:string;intro:string;jobTitle?:string;offers:string[];offersDetail:string;needs:string;isSelf?:boolean;sent?:boolean;received?:boolean};
const stop=new Set(['için','olan','olarak','insan','insanlar','istiyorum','bir','ve','ile','the','and','this','that','yeni','konusunda']);
const tokens=(s:string)=>new Set((s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/\p{M}/gu,'').replace(/ı/g,'i').match(/[\p{L}]{3,}/gu)||[]).filter(w=>!stop.has(w)));
const overlap=(a:Set<string>,b:Set<string>)=>[...a].filter(w=>b.has(w)).length/Math.sqrt(Math.max(1,a.size*b.size));
export function rankNetworkRoute<T extends Profile>(people:T[],limit=5){
 const self=people.find(p=>p.isSelf);if(!self)return [];
 const needs=tokens(self.needs),offers=tokens(`${self.offers.join(' ')} ${self.offersDetail} ${self.jobTitle||''}`),intro=tokens(self.intro);
 const candidates=people.filter(p=>!p.isSelf&&!p.sent).map(p=>({person:p,score:6*overlap(needs,tokens(`${p.offers.join(' ')} ${p.offersDetail} ${p.jobTitle||''}`))+4*overlap(offers,tokens(p.needs))+overlap(intro,tokens(p.intro))+(p.received?.25:0)}));
 const result:T[]=[];
 while(candidates.length&&result.length<limit){candidates.sort((a,b)=>{const adjusted=(x:typeof a)=>x.score-.08*result.filter(p=>p.offers[0]===x.person.offers[0]).length;return adjusted(b)-adjusted(a)||a.person.id.localeCompare(b.person.id);});result.push(candidates.shift()!.person);}
 return result;
}
