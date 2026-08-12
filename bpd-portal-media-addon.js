(()=>{
'use strict';
const API='https://bpd-somagede-cms.bpddesasomagede.workers.dev';
let lastSlug='';
let renderSeq=0;

const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[m]);

function mediaSlug(article){
  const explicit=new URL(location.href).searchParams.get('berita');
  if(explicit)return explicit;
  const share=article?.querySelector('[data-share-url]')?.textContent||'';
  const m=share.match(/\/berita\/([^?#/]+)/);
  return m?decodeURIComponent(m[1]):'';
}

function mediaHTML(item){
  const media=Array.isArray(item?.media)?item.media.filter(x=>x&&x.url):[];
  if(!media.length)return '';
  return `<section class="bpd-article-media" data-bpd-article-media>
    <div class="bpd-article-media-title">Video & Audio</div>
    <div class="bpd-article-media-list">
      ${media.map((m,i)=>{
        const name=esc(m.original_name||`${m.media_type==='audio'?'Audio':'Video'} ${i+1}`);
        if(m.media_type==='audio')return `<figure class="bpd-audio-card"><figcaption>🎵 ${name}</figcaption><audio controls preload="metadata" src="${esc(m.url)}">Browser tidak mendukung pemutar audio.</audio></figure>`;
        return `<figure class="bpd-video-card"><video controls playsinline preload="metadata" src="${esc(m.url)}">Browser tidak mendukung pemutar video.</video><figcaption>${name}</figcaption></figure>`;
      }).join('')}
    </div>
  </section>`;
}

function ensureStyle(){
  if(document.getElementById('bpdPortalMediaStyle'))return;
  const st=document.createElement('style');
  st.id='bpdPortalMediaStyle';
  st.textContent=`
    .bpd-article-media{margin:22px 0 26px}.bpd-article-media-title{font-size:14px;font-weight:900;color:#173f35;margin:0 0 10px}
    .bpd-article-media-list{display:grid;gap:14px}.bpd-video-card,.bpd-audio-card{margin:0;border:1px solid #dce9e4;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(13,60,48,.06)}
    .bpd-video-card video{display:block;width:100%;max-height:72vh;background:#08130f;object-fit:contain}.bpd-video-card figcaption{padding:10px 13px;color:#536a63;font-size:12px;font-weight:800;overflow-wrap:anywhere}
    .bpd-audio-card{padding:13px}.bpd-audio-card figcaption{margin-bottom:9px;color:#264c41;font-size:13px;font-weight:900;overflow-wrap:anywhere}.bpd-audio-card audio{display:block;width:100%;height:42px}
    @media(max-width:640px){.bpd-video-card video{max-height:58vh}.bpd-article-media{margin:18px 0 22px}}
  `;
  document.head.appendChild(st);
}

async function renderMedia(){
  ensureStyle();
  const article=document.querySelector('#bpdPortalBerita .portal-article-inline');
  if(!article)return;
  const slug=mediaSlug(article);
  if(!slug)return;
  const seq=++renderSeq;
  try{
    const r=await fetch(`${API}/api/activities/slug/${encodeURIComponent(slug)}`,{cache:'default'});
    const d=await r.json();
    if(seq!==renderSeq||!r.ok||!d.ok||!d.item)return;
    article.querySelector('[data-bpd-article-media]')?.remove();
    const html=mediaHTML(d.item); if(!html)return;
    const holder=document.createElement('div');holder.innerHTML=html;
    const block=holder.firstElementChild;
    const gallery=article.querySelector('.portal-insta-gallery');
    const lead=article.querySelector('.portal-article-lead');
    if(gallery)gallery.insertAdjacentElement('afterend',block);
    else if(lead)lead.insertAdjacentElement('afterend',block);
    else article.querySelector('h2')?.insertAdjacentElement('afterend',block);
    lastSlug=slug;
  }catch{}
}

let timer=0;
const schedule=()=>{clearTimeout(timer);timer=setTimeout(renderMedia,40)};
const root=document.getElementById('bpdPortalBerita');
if(root){
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  schedule();
}
window.addEventListener('popstate',schedule);
})();

/* HERO PREMIUM — civic editorial visual */
(()=>{
'use strict';
if(document.getElementById('bpdHeroPremium20260812'))return;
const s=document.createElement('style');
s.id='bpdHeroPremium20260812';
s.textContent=`
.bpd-hero-content-refined{width:min(94vw,980px)!important;max-width:980px!important}

.bpd-hero-title-refined{
  --gold:#ffd15a;--mint:#78efba;
  position:relative!important;isolation:isolate!important;
  width:max-content!important;max-width:100%!important;
  margin:8px 0 18px!important;padding:22px 34px 25px 30px!important;
  border:1px solid rgba(255,255,255,.15)!important;
  border-left:6px solid var(--gold)!important;border-radius:0 24px 24px 0!important;
  background:linear-gradient(100deg,rgba(1,28,22,.92),rgba(3,54,41,.76) 58%,rgba(3,54,41,.22))!important;
  box-shadow:0 24px 62px rgba(0,0,0,.30),inset 0 1px rgba(255,255,255,.11)!important;
  -webkit-backdrop-filter:blur(5px) saturate(120%);backdrop-filter:blur(5px) saturate(120%);
}
.bpd-hero-title-refined::before{
  content:"";position:absolute;left:-6px;top:18px;width:6px;height:45%;
  background:#fff;border-radius:0 8px 8px 0;box-shadow:0 0 24px rgba(255,209,90,.65)
}
.bpd-hero-title-refined::after{
  content:"";position:absolute;left:30px;bottom:10px;width:78px;height:3px;border-radius:99px;
  background:linear-gradient(90deg,var(--gold),var(--mint));box-shadow:0 0 18px rgba(120,239,186,.35)
}
.bpd-hero-title-refined .bpd-hero-line{
  position:relative!important;width:max-content!important;max-width:100%!important;
  background:none!important;-webkit-text-fill-color:currentColor!important;filter:none!important
}

/* Baris 1: monumental, putih hangat, serif */
.bpd-hero-title-refined .bpd-hero-line-one{
  font-family:Georgia,'Times New Roman',serif!important;
  font-size:clamp(66px,6.15vw,94px)!important;line-height:.88!important;
  font-weight:900!important;font-style:normal!important;letter-spacing:-.052em!important;
  color:#fffdf5!important;white-space:nowrap!important;
  text-shadow:0 3px 0 rgba(0,0,0,.18),0 8px 26px rgba(0,0,0,.42)!important
}

/* Baris 2: ribbon emas kecil */
.bpd-hero-title-refined .bpd-hero-line-two{
  display:inline-flex!important;align-items:center!important;gap:8px!important;
  margin:16px 0 11px!important;padding:7px 16px 7px 14px!important;
  border:1px solid rgba(255,255,255,.42)!important;border-left:0!important;border-radius:999px!important;
  background:linear-gradient(135deg,#ffe17e,#f2b51e)!important;
  box-shadow:0 8px 24px rgba(242,181,30,.25),inset 0 1px rgba(255,255,255,.58)!important;
  font-family:Arial,Helvetica,sans-serif!important;font-size:clamp(15px,1.25vw,19px)!important;
  line-height:1!important;font-weight:950!important;font-style:italic!important;
  letter-spacing:.20em!important;text-transform:uppercase!important;color:#123a2f!important;text-shadow:none!important
}
.bpd-hero-title-refined .bpd-hero-line-two::before{
  content:"";width:8px;height:8px;flex:0 0 8px;border-radius:50%;
  background:#0b4938;box-shadow:0 0 0 3px rgba(11,73,56,.14)
}
.bpd-hero-title-refined .bpd-hero-line-two strong,
.bpd-hero-title-refined .bpd-hero-line-two em{
  color:inherit!important;font:inherit!important;letter-spacing:inherit!important;text-shadow:none!important
}

/* Baris 3: modern, mint kuat */
.bpd-hero-title-refined .bpd-hero-line-three{
  font-family:Arial,Helvetica,sans-serif!important;
  font-size:clamp(38px,3.55vw,54px)!important;line-height:.94!important;
  font-weight:900!important;font-style:normal!important;letter-spacing:-.025em!important;
  color:var(--mint)!important;white-space:nowrap!important;padding:0 0 12px!important;
  text-shadow:0 2px 0 rgba(0,0,0,.16),0 6px 22px rgba(0,0,0,.36)!important
}
.bpd-hero-title-refined .bpd-hero-line-three::after{
  content:""!important;left:0!important;bottom:0!important;width:60%!important;height:5px!important;
  border-radius:99px!important;background:linear-gradient(90deg,var(--mint) 0 72%,var(--gold) 72%)!important;
  box-shadow:0 2px 12px rgba(0,0,0,.24)!important
}

@media(max-width:900px){
  .bpd-hero-title-refined{padding:19px 26px 22px 24px!important}
  .bpd-hero-title-refined .bpd-hero-line-one{font-size:clamp(50px,7vw,68px)!important}
  .bpd-hero-title-refined .bpd-hero-line-three{font-size:clamp(32px,4.4vw,44px)!important}
}
@media(max-width:680px){
  .bpd-hero-content-refined{width:100%!important;max-width:100%!important}
  .bpd-hero-title-refined{
    width:100%!important;margin:4px 0 14px!important;padding:16px 15px 18px 16px!important;
    border-left-width:4px!important;border-radius:0 18px 18px 0!important;
    background:linear-gradient(100deg,rgba(1,28,22,.94),rgba(3,54,41,.72))!important
  }
  .bpd-hero-title-refined::before{left:-4px;width:4px;top:14px}
  .bpd-hero-title-refined::after{left:16px;bottom:8px;width:54px;height:2px}
  .bpd-hero-title-refined .bpd-hero-line-one{
    font-size:clamp(31px,8.4vw,42px)!important;line-height:.94!important;letter-spacing:-.042em!important
  }
  .bpd-hero-title-refined .bpd-hero-line-two{
    margin:10px 0 8px!important;padding:6px 11px 6px 10px!important;
    font-size:clamp(11px,3vw,13px)!important;letter-spacing:.16em!important
  }
  .bpd-hero-title-refined .bpd-hero-line-two::before{width:6px;height:6px;flex-basis:6px}
  .bpd-hero-title-refined .bpd-hero-line-three{
    font-size:clamp(24px,6.1vw,32px)!important;line-height:.98!important;padding-bottom:9px!important
  }
}
@media(max-width:390px){
  .bpd-hero-title-refined .bpd-hero-line-one{font-size:30px!important}
  .bpd-hero-title-refined .bpd-hero-line-three{font-size:23px!important}
}
`;
document.head.appendChild(s);
})();
