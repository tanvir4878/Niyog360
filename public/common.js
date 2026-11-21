(()=>{const t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=t})();
const CATS=[['govt','সরকারি চাকরি','🏛️'],['bank','ব্যাংক চাকরি','🏦'],['ngo','এনজিও চাকরি','🤝'],['private','প্রাইভেট চাকরি','🏢'],['teaching','শিক্ষক নিয়োগ','🎓'],['defence','সেনা/পুলিশ/আনসার','🛡️'],['it','আইটি ও সফটওয়্যার','💻'],['health','স্বাস্থ্য ও মেডিকেল','🩺'],['overseas','বিদেশি চাকরি','✈️']];
const $=s=>document.querySelector(s);
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bnDate=d=>d?new Date(d+'T00:00:00').toLocaleDateString('bn-BD',{day:'numeric',month:'long',year:'numeric'}):'—';
const catOf=k=>CATS.find(c=>c[0]===k)||['','অন্যান্য','💼'];
function left(d){if(!d)return{txt:'নির্ধারিত নেই',cls:'',days:null};const n=Math.ceil((new Date(d+'T23:59:59')-Date.now())/864e5);if(n<0)return{txt:'মেয়াদ শেষ',cls:'exp',days:n};if(n===0)return{txt:'আজই শেষ দিন',cls:'hot',days:0};return{txt:'আর '+bn(n)+' দিন বাকি',cls:n<=3?'hot':'',days:n}}
const isNew=s=>s&&Date.now()-new Date(s.replace(' ','T')+'Z')<3*864e5;
async function api(u,o){const r=await fetch(u,o);const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'ত্রুটি হয়েছে');return j}
const Saved={get(){try{return JSON.parse(localStorage.getItem('saved')||'[]')}catch{return[]}},has(id){return this.get().includes(+id)},toggle(id){id=+id;let a=this.get();a=a.includes(id)?a.filter(x=>x!==id):[...a,id];localStorage.setItem('saved',JSON.stringify(a));return a.includes(id)}};
addEventListener('DOMContentLoaded',()=>{const b=$('#theme');if(b){const set=()=>b.textContent=document.documentElement.dataset.theme==='dark'?'☀️':'🌙';set();b.onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;localStorage.setItem('theme',t);set()}}});
