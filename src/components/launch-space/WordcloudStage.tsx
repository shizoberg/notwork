import {useEffect,useMemo,useState} from 'react';
import type {WordcloudResults,WordcloudWord} from '@/lib/event-wordcloud';
import '@/launch-space.css';
const samples=[['cesaret','deneyim','sabır','yeniden','öğrenmek','güven','denemek','azim','fırsat','değişim','paylaşmak','dayanışma'],['ilham','bağlantı','enerji','dostluk','merak','umut','birlikte','üretmek','heyecan','fikir','gülümseme','yaratıcılık'],['tanışmak','işbirliği','ekip','network','üretim','tasarım','teknoloji','girişim','gelecek','iletişim','topluluk','yolculuk']];
function layout(words:WordcloudWord[]){
 const ordered=[...words].sort((a,b)=>b.count-a.count||a.text.localeCompare(b.text)).slice(0,65);const max=ordered[0]?.count||1;
 const placed:{text:string;count:number;x:number;y:number;width:number;height:number;size:number}[]=[];
 for(const word of ordered){let size=26+75*Math.sqrt(word.count/max);size=Math.min(size,800/Math.max(1,word.text.length*.66));let found=false;
 for(let scale=1;scale>=.5&&!found;scale-=.15){const font=size*scale,width=word.text.length*font*.68+18,height=font*1.2;
 for(let i=0;i<2400;i++){const angle=i*.25,radius=3.5*Math.sqrt(i),x=600+Math.cos(angle)*radius*3,y=310+Math.sin(angle)*radius*1.7;
 if(x-width/2<20||x+width/2>1180||y-height/2<10||y+height/2>610)continue;
 if(placed.some(p=>Math.abs(p.x-x)<(p.width+width)/2+6&&Math.abs(p.y-y)<(p.height+height)/2+6))continue;
 placed.push({...word,x,y,width,height,size:font});found=true;break;}}
 }
 return placed;
}
export function ExperienceWordcloudStage(){
 const [data,setData]=useState<WordcloudResults>();const [selected,setSelected]=useState('');const [demo,setDemo]=useState(false);const [tick,setTick]=useState(0);const [error,setError]=useState('');
 useEffect(()=>{setDemo(new URLSearchParams(location.search).get('demo')==='1');let active=true,pending=false;const load=async()=>{if(pending)return;pending=true;try{const r=await fetch('/api/event-products/wordcloud?event=22-kasim-2026&action=results',{cache:'no-store'});if(!r.ok)throw Error();const next=await r.json();if(active){setData(next);setError('');}}catch{if(active)setError('Bağlantı yenileniyor · son cevaplar korunuyor');}finally{pending=false;}};void load();const id=setInterval(load,3000);return()=>{active=false;clearInterval(id);};},[]);
 useEffect(()=>{if(!demo)return;const id=setInterval(()=>setTick(t=>t+1),1600);return()=>clearInterval(id);},[demo]);
 const questions=data?.questions||[];const q=questions.find(q=>q.id===selected)||questions[0];const index=Math.max(0,questions.findIndex(x=>x.id===q?.id));
 const words=useMemo(()=>demo?samples[index%samples.length].map((text,i)=>({text,count:Math.max(1,24-i*2)+Math.floor(tick/(i%4+1)),variants:[]})):data?.results[q?.id||'']||[],[demo,tick,index,data,q?.id]);
 const placed=useMemo(()=>layout(words),[words]);const total=words.reduce((n,w)=>n+w.count,0);
 return <main className="ntw-cloud-stage"><header><img src="/brand/notwork-logo.png" alt="notwork"/><div><span className="ntw-cloud-dot"/>{demo?'DEMO · örnek veriler':'CANLI · 3 saniyede güncellenir'}</div><button onClick={()=>{setDemo(!demo);setTick(0);history.replaceState(null,'',demo?'/notwork-sahne':'/notwork-sahne?demo=1');}}>{demo?'Canlıya dön':'Demoyu göster'}</button></header><nav aria-label="Sorular">{questions.map((question,i)=><button key={question.id} aria-pressed={q?.id===question.id} onClick={()=>setSelected(question.id)}><small>0{i+1}</small>{question.title}<span>{demo?'demo':(data?.results[question.id]||[]).reduce((n,w)=>n+w.count,0)} cevap</span></button>)}</nav><h1>{q?.title||'Topluluğun sesi burada.'}</h1><section aria-label="Canlı kelime bulutu" className="ntw-cloud-canvas">{placed.length?<svg viewBox="0 0 1200 620" role="img" aria-label={`${total} cevap, en sık: ${words.slice().sort((a,b)=>b.count-a.count).slice(0,5).map(w=>w.text).join(', ')}`}>{placed.map((w,i)=><text key={w.text} x={w.x} y={w.y} textAnchor="middle" dominantBaseline="central" fontWeight={i<4?750:500} fontSize={w.size} fill={['#eafaff','#8ed9f1','#c2a9f6','#70bcd4','#b5e8ce'][i%5]}><title>{w.text}: {w.count} cevap</title>{w.text}</text>)}</svg>:<div className="ntw-cloud-empty"><span>✦</span><p>İlk kelime senden gelsin.</p><small>Cevaplar geldikçe bu alan birlikte büyüyecek.</small></div>}</section><footer><strong>{total} cevap</strong><span>{demo?'Örnek kelimeler · gerçek veriye yazılmaz':error||'En çok paylaşılan kelimeler daha büyük görünür.'}</span><span>notwork community</span></footer></main>;
}
