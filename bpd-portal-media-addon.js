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
  const st=document.createElement('style');st.id='bpdPortalMediaStyle';st.textContent=`
    .bpd-article-media{margin:22px 0 26px}.bpd-article-media-title{font-size:14px;font-weight:900;color:#173f35;margin:0 0 10px}
    .bpd-article-media-list{display:grid;gap:14px}.bpd-video-card,.bpd-audio-card{margin:0;border:1px solid #dce9e4;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 8px 24px rgba(13,60,48,.06)}
    .bpd-video-card video{display:block;width:100%;max-height:72vh;background:#08130f;object-fit:contain}.bpd-video-card figcaption{padding:10px 13px;color:#536a63;font-size:12px;font-weight:800;overflow-wrap:anywhere}
    .bpd-audio-card{padding:13px}.bpd-audio-card figcaption{margin-bottom:9px;color:#264c41;font-size:13px;font-weight:900;overflow-wrap:anywhere}.bpd-audio-card audio{display:block;width:100%;height:42px}
    @media(max-width:640px){.bpd-video-card video{max-height:58vh}.bpd-article-media{margin:18px 0 22px}}
  `;document.head.appendChild(st);
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
    const old=article.querySelector('[data-bpd-article-media]');
    old?.remove();
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
