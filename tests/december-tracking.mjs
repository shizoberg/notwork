import assert from 'node:assert/strict';
import {functionSandbox} from './helpers/function-sandbox.mjs';
const s=await functionSandbox();try{const analytics=await s.load('_analytics-store');
const base={timestamp:'2026-11-25T12:00:00Z',type:'ticket_click',sessionId:'test',label:'',target:'',value:0,referrer:'',source:'',campaign:'',device:'mobile'};
const events=[{path:'/19-aralik',target:'https://www.biletimgo.com/etkinlik/notwork-fast-hizli-networking-etkinligi-32802'},{path:'/19-aralik',target:'https://www.biletimgo.com/etkinlik/notwork-fast-hizli-networking-eventi-32802'},{path:'/10-aralik',label:'10 Aralık bilet',target:'https://www.biletimgo.com/etkinlik/notwork-fast-hizli-networking-eventi-32802'},{path:'/22-kasim'}].map((e,i)=>({...base,...e,id:String(i)}));
const report=analytics.summarizeEvents('2026-11-25',events);assert.equal(report.ticketClicksByEvent.december19,2);assert.equal(report.ticketClicksByEvent.december10,1);assert.equal(report.ticketClicksByEvent.november22,1);assert.equal(report.counts.ticket_click,4);console.log('PASS: December 19 clicks isolated, legacy URLs supported, December 10 and November data preserved');}finally{await s.cleanup();}
