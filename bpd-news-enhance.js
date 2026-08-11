(()=>{
'use strict';

const API='https://bpd-somagede-cms.bpddesasomagede.workers.dev';
const detailCache=new Map();

const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[m]);

const clip=(s='',n=180)=>{
  s=String(s||'').replace(/\s+/g,' ').trim();
  return s.length>n?s.slice(0,n).trim()+'…':s;
};

async function detail(id){
  id=String(id||'');
  if(!id) throw new Error('ID berita tidak ditemukan');
  if(detailCache.has(id)) return detailCache.get(id);

  const r=await fetch(`${API}/api/activities/${encodeURIComponent(id)}?_=${Date.now()}`,{
    cache:'no-store'
  });
  const d=await r.json();
  if(!r.ok||!d.ok||!d.item) throw new Error(d.error||'Gagal memuat berita');
  detailCache.set(id,d.item);
  return d.item;
}

/* ================= BERANDA ================= */
function initHome(){
  const root=document.getElementById('homeFeed');
  if(!root) return;

  const gallery=document.createElement('dialog');
  gallery.className='bpd-news-gallery';
  gallery.innerHTML=`
    <div class="bpd-gallery-head">
      <strong data-g-title>Galeri Berita</strong>
      <button type="button" class="bpd-gallery-close" data-g-close aria-label="Tutup">✕</button>
    </div>
    <div class="bpd-gallery-stage" data-g-stage>
      <button type="button" class="bpd-gallery-nav bpd-gallery-prev" data-g-prev aria-label="Foto sebelumnya">‹</button>
      <img data-g-image alt="">
      <button type="button" class="bpd-gallery-nav bpd-gallery-next" data-g-next aria-label="Foto berikutnya">›</button>
      <div class="bpd-gallery-count" data-g-count></div>
    </div>
    <div class="bpd-gallery-foot">
      <div class="bpd-gallery-caption" data-g-caption></div>
      <div class="bpd-gallery-thumbs" data-g-thumbs></div>
    </div>`;
  document.body.appendChild(gallery);

  const gTitle=gallery.querySelector('[data-g-title]');
  const gImage=gallery.querySelector('[data-g-image]');
  const gCount=gallery.querySelector('[data-g-count]');
  const gCaption=gallery.querySelector('[data-g-caption]');
  const gThumbs=gallery.querySelector('[data-g-thumbs]');
  const gPrev=gallery.querySelector('[data-g-prev]');
  const gNext=gallery.querySelector('[data-g-next]');
  const gClose=gallery.querySelector('[data-g-close]');
  const gStage=gallery.querySelector('[data-g-stage]');

  let gItem=null,gIndex=0,touchX=0;

  const images=item=>{
    const arr=Array.isArray(item?.images)?item.images.filter(x=>x&&x.url):[];
    return arr.length?arr:(item?.cover_url?[{url:item.cover_url,original_name:'Foto sampul'}]:[]);
  };

  function show(i){
    const imgs=images(gItem);
    if(!imgs.length) return;
    gIndex=(i+imgs.length)%imgs.length;
    const cur=imgs[gIndex];
    gImage.src=cur.url;
    gImage.alt=`${gItem?.title||'Foto berita'} — foto ${gIndex+1}`;
    gTitle.textContent=gItem?.title||'Galeri Berita';
    gCount.textContent=`${gIndex+1} / ${imgs.length}`;
    gCaption.textContent=[
      gItem?.activity_date||'',
      gItem?.location?`📍 ${gItem.location}`:'',
      cur.original_name||''
    ].filter(Boolean).join(' · ');
    gPrev.disabled=imgs.length<=1;
    gNext.disabled=imgs.length<=1;
    gThumbs.innerHTML=imgs.map((x,n)=>`
      <button type="button" class="bpd-gallery-thumb ${n===gIndex?'active':''}" data-g-thumb="${n}" aria-label="Foto ${n+1}">
        <img src="${esc(x.url)}" alt="Thumbnail foto ${n+1}">
      </button>`).join('');
    gThumbs.querySelector('.active')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  }

  async function openGallery(id){
    try{
      gItem=await detail(id);
      if(!images(gItem).length) return;
      gIndex=0;
      show(0);
      if(!gallery.open) gallery.showModal();
    }catch(e){ console.error(e); }
  }

  gPrev.onclick=()=>show(gIndex-1);
  gNext.onclick=()=>show(gIndex+1);
  gClose.onclick=()=>gallery.close();
  gThumbs.onclick=e=>{
    const b=e.target.closest('[data-g-thumb]');
    if(b) show(Number(b.dataset.gThumb));
  };
  gallery.addEventListener('click',e=>{if(e.target===gallery)gallery.close()});
  document.addEventListener('keydown',e=>{
    if(!gallery.open)return;
    if(e.key==='ArrowLeft')show(gIndex-1);
    if(e.key==='ArrowRight')show(gIndex+1);
  });
  gStage.addEventListener('touchstart',e=>{touchX=e.changedTouches?.[0]?.clientX||0},{passive:true});
  gStage.addEventListener('touchend',e=>{
    const dx=(e.changedTouches?.[0]?.clientX||0)-touchX;
    if(Math.abs(dx)>45)show(gIndex+(dx<0?1:-1));
  },{passive:true});

  async function enhanceArticle(article){
    if(!article||article.dataset.bpdEnhanced==='1') return;
    const readBtn=article.querySelector('[data-inline-detail]');
    const id=readBtn?.dataset.inlineDetail;
    if(!id) return;

    article.dataset.bpdEnhanced='1';

    const photo=article.querySelector('.feed-feature-media,.feed-card-media');
    if(photo){
      photo.classList.add('bpd-gallery-trigger');
      if(!photo.querySelector('.bpd-gallery-badge')){
        const badge=document.createElement('span');
        badge.className='bpd-gallery-badge';
        badge.textContent='📷 Galeri Foto';
        photo.appendChild(badge);
      }
      photo.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        openGallery(id);
      });
    }

    try{
      const item=await detail(id);
      const text=item.excerpt||item.content||'';
      if(text){
        const p=article.querySelector('.feed-feature-copy>p,.feed-card-body>p');
        if(p){
          p.textContent=clip(text,article.classList.contains('feed-feature')?300:170);
          p.classList.add('bpd-auto-text');
        }
      }
    }catch(e){ console.error(e); }
  }

  function enhanceAll(){
    root.querySelectorAll('.feed-feature,.feed-card').forEach(enhanceArticle);
  }

  new MutationObserver(enhanceAll).observe(root,{childList:true,subtree:true});
  enhanceAll();
}

/* ================= EDITOR ================= */
function initEditor(){
  const form=document.getElementById('form');
  const content=document.getElementById('content');
  const excerpt=document.getElementById('excerpt');
  const message=document.getElementById('message');
  if(!form||!content||!excerpt) return;

  content.required=true;
  content.placeholder='Tulis isi berita/kegiatan lengkap di sini. Narasi ini otomatis tampil di beranda.';

  const field=content.closest('.field');
  if(field && !field.querySelector('.bpd-editor-help')){
    const help=document.createElement('small');
    help.className='muted bpd-editor-help';
    help.textContent='Narasi Lengkap wajib diisi. Ringkasan boleh kosong; sistem akan membuatnya otomatis dari narasi.';
    field.appendChild(help);
  }

  form.addEventListener('submit',e=>{
    const full=content.value.trim();
    if(!full){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(message) message.textContent='Narasi Lengkap wajib diisi agar berita tidak hanya tampil sebagai foto.';
      content.focus();
      return;
    }
    if(!excerpt.value.trim()){
      excerpt.value=full.replace(/\s+/g,' ').slice(0,500);
    }
  },true);
}

document.readyState==='loading'
  ?document.addEventListener('DOMContentLoaded',()=>{initHome();initEditor()})
  :(initHome(),initEditor());

})();
