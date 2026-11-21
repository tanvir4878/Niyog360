(()=>{const t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=t})();
const CATS=[['govt','সরকারি চাকরি','🏛️'],['bank','ব্যাংক চাকরি','🏦'],['ngo','এনজিও চাকরি','🤝'],['private','প্রাইভেট চাকরি','🏢'],['teaching','শিক্ষক নিয়োগ','🎓'],['defence','সেনা/পুলিশ/আনসার','🛡️'],['it','আইটি ও সফটওয়্যার','💻'],['health','স্বাস্থ্য ও মেডিকেল','🩺'],['overseas','বিদেশি চাকরি','✈️']];
const $=s=>document.querySelector(s);
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bnDate=d=>d?new Date(d+'T00:00:00').toLocaleDateString('bn-BD',{day:'numeric',month:'long',year:'numeric'}):'—';
const catOf=k=>CATS.find(c=>c[0]===k)||['','অন্যান্য','💼'];
function left(d){if(!d)return{txt:'নির্ধারিত নেই',cls:'',days:null};const n=Math.ceil((new Date(d+'T23:59:59')-Date.now())/864e5);if(n<0)return{txt:'মেয়াদ শেষ',cls:'exp',days:n};if(n===0)return{txt:'আজই শেষ দিন',cls:'hot',days:0};return{txt:'আর '+bn(n)+' দিন বাকি',cls:n<=3?'hot':n<=7?'warn':'ok',days:n}}
const isNew=s=>s&&Date.now()-new Date(s.replace(' ','T')+'Z')<3*864e5;
async function api(u,o){const r=await fetch(u,o);const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'ত্রুটি হয়েছে');return j}
const Saved={get(){try{return JSON.parse(localStorage.getItem('saved')||'[]')}catch{return[]}},has(id){return this.get().includes(+id)},toggle(id){id=+id;let a=this.get();a=a.includes(id)?a.filter(x=>x!==id):[...a,id];localStorage.setItem('saved',JSON.stringify(a));return a.includes(id)}};
addEventListener('DOMContentLoaded',()=>{const b=$('#theme');if(b){const set=()=>b.textContent=document.documentElement.dataset.theme==='dark'?'☀️':'🌙';set();b.onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;localStorage.setItem('theme',t);set()}}});

const en=s=>String(s).replace(/[০-৯]/g,d=>'০১২৩৪৫৬৭৮৯'.indexOf(d));
function ageParse(t){const n=(en(t||'').match(/\d+/g)||[]).map(Number).filter(x=>x>=10&&x<=70);return n.length?{min:n.length>1?Math.min(...n):0,max:Math.max(...n)}:null}
function calcAge(dob,ref){let y=ref.getFullYear()-dob.getFullYear(),m=ref.getMonth()-dob.getMonth(),d=ref.getDate()-dob.getDate();if(d<0){m--;d+=new Date(ref.getFullYear(),ref.getMonth(),0).getDate()}if(m<0){y--;m+=12}return{y,m,d}}
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function ageHTML(dobV,refV,lim){if(!dobV||!refV)return'';const dob=new Date(dobV+'T00:00:00'),ref=new Date(refV+'T00:00:00');if(dob>ref)return'<p class="err">জন্ম তারিখ গণনার তারিখের পরে হতে পারে না।</p>';
const a=calcAge(dob,ref);let nb=new Date(ref.getFullYear(),dob.getMonth(),dob.getDate());if(nb<=ref)nb=new Date(ref.getFullYear()+1,dob.getMonth(),dob.getDate());const nd=Math.ceil((nb-ref)/864e5);
let h=`<div class="ageres"><b>${bn(a.y)}</b> বছর <b>${bn(a.m)}</b> মাস <b>${bn(a.d)}</b> দিন<small>পরবর্তী জন্মদিনের আর ${bn(nd)} দিন বাকি</small></div>`;
if(lim){const ok=(a.y<lim.max||(a.y===lim.max&&!a.m&&!a.d))&&a.y>=lim.min;h+=`<p class="${ok?'okb':'nob'}">${ok?'✅ বয়সের দিক থেকে আপনি আবেদনের যোগ্য মনে হচ্ছে':'❌ বয়সসীমা ('+bn(lim.min?lim.min+'–'+lim.max:lim.max)+' বছর) অনুযায়ী আপনি যোগ্য নন'}</p><small class="org">মূল সার্কুলারের নিয়ম যাচাই করুন — কিছু নিয়োগে নির্দিষ্ট তারিখে বয়স গণনা হয়।</small>`}
return h}
