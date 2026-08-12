(()=>{
'use strict';

const API='https://bpd-somagede-cms.bpddesasomagede.workers.dev';

const HOME_SEO={
  title:'BPD Somagede | Badan Permusyawaratan Desa Somagede',
  description:'Portal BPD Somagede, Kecamatan Somagede, Kabupaten Banyumas: informasi BPD, pemerintahan desa, regulasi, pembangunan, anggaran, dokumen publik, aspirasi masyarakat, administrasi desa, dan berita kegiatan.',
  canonical:'https://bpdsomagede.github.io/'
};

function upsertMeta(selector,attrs){
  let el=document.head.querySelector(selector);
  if(!el){
    el=document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
  return el;
}

function setCanonical(url){
  let el=document.head.querySelector('link[rel="canonical"]');
  if(!el){
    el=document.createElement('link');
    el.rel='canonical';
    document.head.appendChild(el);
  }
  el.href=url;
}

function removeArticleSchema(){
  document.getElementById('bpd-article-schema')?.remove();
}

function applyHomeSEO(){
  document.title=HOME_SEO.title;
  upsertMeta('meta[name="description"]',{name:'description',content:HOME_SEO.description});
  upsertMeta('meta[property="og:title"]',{property:'og:title',content:HOME_SEO.title});
  upsertMeta('meta[property="og:description"]',{property:'og:description',content:HOME_SEO.description});
  upsertMeta('meta[property="og:url"]',{property:'og:url',content:HOME_SEO.canonical});
  setCanonical(HOME_SEO.canonical);
  removeArticleSchema();
}

function applyArticleSEO(item){
  if(!item)return;
  const title=`${item.title||'Berita'} | BPD Somagede`;
  const desc=String(item.excerpt||item.content||'')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0,170);
  const canonical=articleUrl(item).replace(/#.*$/,'');
  const pics=images(item).map(x=>x.url).filter(Boolean);

  document.title=title;
  upsertMeta('meta[name="description"]',{name:'description',content:desc});
  upsertMeta('meta[property="og:type"]',{property:'og:type',content:'article'});
  upsertMeta('meta[property="og:title"]',{property:'og:title',content:title});
  upsertMeta('meta[property="og:description"]',{property:'og:description',content:desc});
  upsertMeta('meta[property="og:url"]',{property:'og:url',content:canonical});
  if(pics[0]){
    upsertMeta('meta[property="og:image"]',{property:'og:image',content:pics[0]});
  }
  setCanonical(canonical);

  removeArticleSchema();
  const schema=document.createElement('script');
  schema.id='bpd-article-schema';
  schema.type='application/ld+json';
  schema.textContent=JSON.stringify({
    '@context':'https://schema.org',
    '@type':'NewsArticle',
    headline:item.title||'Berita BPD Somagede',
    description:desc,
    datePublished:item.activity_date||undefined,
    dateModified:item.updated_at||item.activity_date||undefined,
    image:pics.length?pics:undefined,
    mainEntityOfPage:canonical,
    inLanguage:'id-ID',
    publisher:{
      '@type':'GovernmentOrganization',
      name:'BPD Somagede',
      alternateName:'Badan Permusyawaratan Desa Somagede',
      url:'https://bpdsomagede.github.io/',
      logo:{
        '@type':'ImageObject',
        url:'https://bpdsomagede.github.io/bpd-favicon.png'
      }
    }
  });
  document.head.appendChild(schema);
}

const mount=document.getElementById('bpdPortalBerita');
if(!mount) return;

/* =========================================================
   PENYEMPURNAAN BERANDA 11 AGUSTUS 2026
   - Judul Berita Terbaru dan isi Arsip menggunakan bobot normal
   - Header utama lebih ringkas dan proporsional
   ========================================================= */
function applyPortalPresentationFixes(){
  if(!document.getElementById('bpd-home-refine-20260812')){
    const style=document.createElement('style');
    style.id='bpd-home-refine-20260812';
    style.textContent=`
      #bpdPortalBerita .portal-news-item strong,
      #bpdPortalBerita .portal-news-item small,
      #bpdPortalBerita .archive-item-title,
      #bpdPortalBerita .archive-item-date{font-weight:400!important}

      .hero{padding-top:20px!important}
      .hero .hero-shell{
        min-height:310px!important;
        border-radius:28px!important
      }
      .hero .hero-copy{
        position:relative!important;
        z-index:2!important;
        max-width:860px!important;
        padding:38px 44px 40px!important
      }

      .hero h1.bpd-hero-title-refined{
        position:relative!important;
        width:max-content!important;
        max-width:100%!important;
        margin:8px 0 18px!important;
        padding:3px 0 5px 24px!important;
        font-family:Merriweather,Georgia,'Times New Roman',serif!important;
        line-height:1!important
      }
      .hero h1.bpd-hero-title-refined::before{
        content:"";
        position:absolute;
        left:0;top:4px;bottom:5px;
        width:4px;border-radius:999px;
        background:linear-gradient(to bottom,#e6bd57 0 34%,#fff 34% 58%,#73c69d 58% 100%);
        box-shadow:0 0 16px rgba(230,189,87,.18)
      }
      .hero h1.bpd-hero-title-refined .bpd-hero-line{
        display:block!important;
        width:max-content!important;
        max-width:100%!important;
        background:none!important;
        -webkit-text-fill-color:currentColor!important
      }
      .hero h1.bpd-hero-title-refined .bpd-hero-line-one{
        color:#fff!important;
        font-family:Merriweather,Georgia,'Times New Roman',serif!important;
        font-size:clamp(48px,5.1vw,70px)!important;
        line-height:.98!important;
        font-weight:900!important;
        font-style:normal!important;
        letter-spacing:-.045em!important;
        white-space:nowrap!important;
        text-shadow:0 3px 18px rgba(0,0,0,.40)!important
      }
      .hero h1.bpd-hero-title-refined .bpd-hero-line-two{
        position:relative!important;
        margin:8px 0!important;
        padding:0 54px 3px 2px!important;
        color:#f1c965!important;
        font-family:Merriweather,Georgia,'Times New Roman',serif!important;
        font-size:clamp(29px,3vw,41px)!important;
        line-height:1!important;
        font-weight:900!important;
        font-style:italic!important;
        letter-spacing:.005em!important;
        white-space:nowrap!important;
        text-shadow:0 3px 16px rgba(0,0,0,.34)!important
      }
      .hero h1.bpd-hero-title-refined .bpd-hero-line-two::after{
        content:"";
        position:absolute;
        left:calc(100% - 38px);
        top:54%;
        width:74px;height:2px;
        border-radius:999px;
        background:linear-gradient(90deg,#f1c965,rgba(241,201,101,0))
      }
      .hero h1.bpd-hero-title-refined .bpd-hero-line-two strong,
      .hero h1.bpd-hero-title-refined .bpd-hero-line-two em{
        color:inherit!important;
        font:inherit!important;
        letter-spacing:inherit!important
      }
      .hero h1.bpd-hero-title-refined .bpd-hero-line-three{
        color:#d8f5e6!important;
        font-family:Inter,Arial,Helvetica,sans-serif!important;
        font-size:clamp(36px,3.85vw,53px)!important;
        line-height:1!important;
        font-weight:850!important;
        font-style:normal!important;
        letter-spacing:-.035em!important;
        white-space:nowrap!important;
        text-shadow:0 3px 18px rgba(0,0,0,.36)!important
      }
      .hero h1.bpd-hero-title-refined .bpd-hero-line-three::after{
        content:"";
        display:block;
        width:104px;height:4px;
        margin-top:10px;
        border-radius:999px;
        background:#73c69d;
        box-shadow:42px 0 0 -1px #e6bd57
      }
      .hero .hero-copy>p{
        max-width:670px!important;
        margin-top:13px!important;
        line-height:1.45!important
      }

      @media(max-width:760px){
        .hero{padding-top:14px!important}
        .hero .hero-shell{min-height:272px!important;border-radius:22px!important}
        .hero .hero-copy{max-width:100%!important;padding:27px 22px 30px!important}
        .hero h1.bpd-hero-title-refined{padding-left:16px!important;margin:5px 0 14px!important}
        .hero h1.bpd-hero-title-refined::before{width:3px}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-one{font-size:clamp(32px,8.2vw,44px)!important}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-two{font-size:clamp(23px,5.8vw,31px)!important;padding-right:35px!important}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-two::after{left:calc(100% - 25px);width:48px}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-three{font-size:clamp(26px,6.4vw,35px)!important}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-three::after{width:72px;height:3px;margin-top:8px;box-shadow:30px 0 0 -1px #e6bd57}
      }
      @media(max-width:390px){
        .hero .hero-shell{min-height:258px!important}
        .hero .hero-copy{padding:23px 17px 26px!important}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-one{font-size:29px!important}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-two{font-size:22px!important}
        .hero h1.bpd-hero-title-refined .bpd-hero-line-three{font-size:24px!important}
      }
    `;
    document.head.appendChild(style);
  }

  const heroTitle=document.querySelector('.hero h1');
  if(heroTitle){
    heroTitle.classList.add('bpd-hero-title-refined');
    heroTitle.innerHTML=`
      <span class="bpd-hero-line bpd-hero-line-one">Bersama Masyarakat</span>
      <span class="bpd-hero-line bpd-hero-line-two"><strong><em>Mengawal</em></strong></span>
      <span class="bpd-hero-line bpd-hero-line-three">Pembangunan Desa</span>`;
    heroTitle.dataset.bpdRefined='20260812';
  }
}
applyPortalPresentationFixes();

const INITIAL_SLUG=new URL(location.href).searchParams.get('berita');
if(INITIAL_SLUG){
  requestAnimationFrame(()=>{
    mount.scrollIntoView({behavior:'auto',block:'start'});
  });
}

const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[m]);

const dateID=(v)=>{
  if(!v)return '';
  try{
    return new Date(v+'T00:00:00').toLocaleDateString('id-ID',{
      day:'2-digit',month:'long',year:'numeric'
    });
  }catch{return v}
};

const dateTimeID=(v)=>{
  if(!v)return '';
  try{
    return new Date(v).toLocaleString('id-ID',{
      day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'
    });
  }catch{return v}
};

const para=(s='')=>{
  const safe=esc(String(s||'').trim());
  if(!safe)return '';
  return safe
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`)
    .join('');
};

const clientId=(()=>{
  let id=localStorage.getItem('bpd-social-client-id');
  if(!id){
    id=(crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem('bpd-social-client-id',id);
  }
  return id;
})();

const nowLocal=new Date();
const jakartaParts=Object.fromEntries(
  new Intl.DateTimeFormat('en-US',{
    timeZone:'Asia/Jakarta',
    year:'numeric',
    month:'2-digit'
  }).formatToParts(nowLocal)
   .filter(x=>x.type!=='literal')
   .map(x=>[x.type,x.value])
);
const CURRENT_YEAR=jakartaParts.year;
const CURRENT_MONTH=jakartaParts.month;
const CURRENT_YM=`${CURRENT_YEAR}-${CURRENT_MONTH}`;
const MONTH_NAME=new Intl.DateTimeFormat('id-ID',{
  timeZone:'Asia/Jakarta',
  month:'long',
  year:'numeric'
}).format(nowLocal);

function isCurrentMonth(item){
  return String(item?.activity_date||'').slice(0,7)===CURRENT_YM;
}

/* Urutan selalu berdasarkan tanggal kegiatan terbaru ke terlama. */
function activityTimestamp(item){
  const raw=String(item?.activity_date||'').trim();
  if(!raw)return 0;
  const normalized=/^\d{4}-\d{2}-\d{2}$/.test(raw)
    ?`${raw}T00:00:00+07:00`
    :raw;
  const time=Date.parse(normalized);
  return Number.isFinite(time)?time:0;
}

function newestActivityFirst(items){
  return (Array.isArray(items)?items:[])
    .slice()
    .sort((a,b)=>{
      const byDate=activityTimestamp(b)-activityTimestamp(a);
      if(byDate)return byDate;
      return Number(b?.id||0)-Number(a?.id||0);
    });
}

let ALL_PUBLIC=[];
let LATEST=[];
let YEARS=[];
let CURRENT=null;
let ACTIVE_ID=null;
const detailCache=new Map();
const archiveCache=new Map();
const openYears=new Set();

function articleUrl(item){
  const u=new URL(location.href);
  u.search='';
  u.pathname=u.pathname.replace(/index\.html$/,'');
  u.searchParams.set('berita',item.slug);
  u.hash='bpdPortalBerita';
  return u.toString();
}

function shareUrl(item){
  return `${API}/berita/${encodeURIComponent(item.slug)}`;
}

function updateBrowserUrl(item){
  const u=new URL(location.href);
  u.searchParams.set('berita',item.slug);
  u.hash='bpdPortalBerita';
  history.replaceState({berita:item.slug},'',u);
}

function images(item){
  const arr=Array.isArray(item?.images)
    ?item.images.filter(x=>x&&x.url)
    :[];
  const cover=String(item?.cover_url||'').trim();
  if(!cover)return arr;
  const selected=arr.find(x=>String(x?.url||'').trim()===cover);
  const rest=arr.filter(x=>String(x?.url||'').trim()!==cover);
  return [selected||{url:cover,original_name:'Sampul'},...rest];
}

function sideImage(item){
  const cover=String(item?.cover_url||'').trim();
  const src=cover||images(item)[0]?.url||'';
  return src
    ?`<img src="${esc(src)}" alt="${esc(item.title||'Berita Desa Somagede')}" loading="lazy" decoding="async">`
    :`<span style="width:100%;height:100%;display:grid;place-items:center;color:#fff;font-size:9px;font-weight:900">BPD</span>`;
}

async function getDetail(id){
  const key=String(id);
  if(detailCache.has(key))return detailCache.get(key);
  const r=await fetch(`${API}/api/activities/${encodeURIComponent(key)}`,{cache:'no-store'});
  const d=await r.json();
  if(!r.ok||!d.ok||!d.item)throw new Error(d.error||'Gagal memuat berita');
  detailCache.set(key,d.item);
  return d.item;
}

async function getDetailBySlug(slug){
  const r=await fetch(`${API}/api/activities/slug/${encodeURIComponent(slug)}`,{cache:'no-store'});
  const d=await r.json();
  if(!r.ok||!d.ok||!d.item)throw new Error(d.error||'Berita tidak ditemukan');
  detailCache.set(String(d.item.id),d.item);
  return d.item;
}

function galleryHTML(item){
  const pics=images(item);
  if(!pics.length)return '';
  return `
    <div class="portal-insta-gallery" data-insta-gallery data-count="${pics.length}" data-index="0">
      <div class="portal-insta-viewport">
        <div class="portal-insta-track" data-insta-track>
          ${pics.map((img,i)=>`
            <figure class="portal-insta-slide" aria-hidden="${i===0?'false':'true'}">
              <span class="portal-insta-bg" aria-hidden="true"><img src="${esc(img.url)}" alt="" loading="${i<2?'eager':'lazy'}" decoding="async"></span>
              <img class="portal-insta-image" src="${esc(img.url)}" alt="${esc(item.title||'Berita Desa Somagede')} — foto ${i+1}" loading="${i<2?'eager':'lazy'}" decoding="async" ${i===0?'fetchpriority="high"':''}>
            </figure>`).join('')}
        </div>
      </div>
      ${pics.length>1?`
        <button type="button" class="portal-insta-nav prev" data-insta-prev aria-label="Foto sebelumnya">‹</button>
        <button type="button" class="portal-insta-nav next" data-insta-next aria-label="Foto berikutnya">›</button>
        <div class="portal-insta-count" data-insta-count>1 / ${pics.length}</div>
        <div class="portal-insta-dots">${pics.map((_,i)=>`<button type="button" class="portal-insta-dot ${i===0?'active':''}" data-insta-dot="${i}" aria-label="Foto ${i+1}"></button>`).join('')}</div>`:''}
    </div>`;
}

function setInstaGallery(gallery,index,{instant=false}={}){
  if(!gallery)return;
  const total=Math.max(1,Number(gallery.dataset.count||1));
  index=Number(index)||0;
  if(index<0)index=total-1;
  if(index>=total)index=0;
  gallery.dataset.index=String(index);
  const track=gallery.querySelector('[data-insta-track]');
  if(track){
    track.style.transition=instant?'none':'';
    track.style.transform=`translate3d(${-100*index}%,0,0)`;
    if(instant)requestAnimationFrame(()=>track.style.transition='');
  }
  gallery.querySelectorAll('.portal-insta-slide').forEach((slide,i)=>slide.setAttribute('aria-hidden',i===index?'false':'true'));
  gallery.querySelectorAll('[data-insta-dot]').forEach((dot,i)=>dot.classList.toggle('active',i===index));
  const count=gallery.querySelector('[data-insta-count]');
  if(count)count.textContent=`${index+1} / ${total}`;
}

function initInstaGalleries(root=document){
  root.querySelectorAll('[data-insta-gallery]').forEach(g=>setInstaGallery(g,0,{instant:true}));
}

function preloadArticleImages(item){
  const pics=images(item);
  const task=()=>pics.slice(0,10).forEach(pic=>{
    const im=new Image();
    im.decoding='async';
    im.src=pic.url;
  });
  if('requestIdleCallback' in window)requestIdleCallback(task,{timeout:900});
  else setTimeout(task,40);
}

let SWIPE_GALLERY=null;
let SWIPE_X=0;

function articleHTML(item){
  const url=shareUrl(item);
  return `
    <div class="portal-article-inline">
      <div class="portal-article-kicker">
        ${item.activity_date?`<span>${dateID(item.activity_date)}</span>`:''}
        ${item.category?`<span>•</span><span>${esc(item.category)}</span>`:''}
        ${item.location?`<span>•</span><span>📍 ${esc(item.location)}</span>`:''}
      </div>
      <h2>${esc(item.title||'Berita Desa Somagede')}</h2>
      ${item.excerpt?`<p class="portal-article-lead">${esc(item.excerpt)}</p>`:''}
      ${galleryHTML(item)}
      <div class="portal-article-content">${para(item.content||item.excerpt||'')}</div>
      <div class="article-social">
        <button type="button" class="social-btn" data-like><span data-like-icon>♡</span><span>Suka</span><span class="count" data-like-count>${Number(item.like_count||0)}</span></button>
        <button type="button" class="social-btn" data-go-comments>💬 Komentar <span class="count" data-comment-count>${Number(item.comment_count||0)}</span></button>
        <button type="button" class="social-btn" data-share-toggle>↗ Bagikan</button>
      </div>
      <div class="share-panel" data-share-panel hidden>
        <button class="share-option" type="button" data-share="native">📱 Bagikan</button>
        <button class="share-option" type="button" data-share="whatsapp">WhatsApp</button>
        <button class="share-option" type="button" data-share="facebook">Facebook</button>
        <button class="share-option" type="button" data-share="telegram">Telegram</button>
        <button class="share-option" type="button" data-share="copy">Salin Link</button>
      </div>
      <div class="share-url" data-share-url hidden>${esc(url)}</div>
      <section class="comment-section" id="komentar-berita">
        <div class="comment-head"><h3>Komentar Masyarakat</h3><small data-comment-heading>Memuat komentar…</small></div>
        <div class="comment-list" data-comment-list><div class="comment-empty">Memuat komentar…</div></div>
        <div class="comment-form-wrap">
          <h4>Tulis Komentar</h4>
          <p class="privacy-note">Nama akan ditampilkan bersama komentar. Alamat email wajib diisi untuk identifikasi/moderasi dan tidak ditampilkan kepada publik. Komentar baru tampil setelah disetujui pengelola.</p>
          <form class="comment-form" data-comment-form>
            <div class="comment-field"><label>Nama *</label><input name="name" maxlength="80" required autocomplete="name"></div>
            <div class="comment-field"><label>Email *</label><input name="email" type="email" maxlength="180" required autocomplete="email"></div>
            <div class="comment-field full"><label>Komentar *</label><textarea name="comment" maxlength="2000" required placeholder="Tulis komentar dengan bahasa yang santun…"></textarea></div>
            <div class="honeypot" aria-hidden="true"><label>Website</label><input name="website" tabindex="-1" autocomplete="off"></div>
            <div class="comment-submit-row"><button type="submit" class="btn green">Kirim Komentar</button><span class="comment-message" data-comment-message></span></div>
          </form>
        </div>
      </section>
    </div>`;
}

function latestHTML(){
  return `
    <div class="portal-side-section">
      <div class="portal-side-heading"><span>Berita Terbaru</span><small>${esc(MONTH_NAME)} · ${LATEST.length} berita</small></div>
      <div class="portal-news-list">
        ${LATEST.length?LATEST.map(x=>`
          <a href="${esc(articleUrl(x))}" class="portal-news-item ${String(x.id)===String(ACTIVE_ID)?'active':''}" data-news-select="${x.id}">
            <span class="portal-news-thumb">${sideImage(x)}</span>
            <span><strong>${esc(x.title)}</strong><small>▣ ${dateID(x.activity_date)} · ♥ ${Number(x.like_count||0)} · 💬 ${Number(x.comment_count||0)}</small></span>
          </a>`).join(''):`<div class="archive-loading">Belum ada berita pada ${esc(MONTH_NAME)}.</div>`}
      </div>
    </div>`;
}

function archiveHTML(){
  return `
    <div class="portal-side-section">
      <div class="portal-side-heading"><span>Arsip Berita</span><small>per tahun</small></div>
      <div class="archive-years">
        ${YEARS.map(y=>{
          const year=String(y.year);
          const opened=openYears.has(year);
          const items=archiveCache.get(year);
          return `
            <div class="archive-year">
              <button type="button" class="archive-year-btn" data-year="${esc(year)}">
                <span>${opened?'▾':'▸'} ${esc(year)}</span>
                <span>${archiveCache.has(year)?archiveCache.get(year).length:Number(y.total||0)} arsip</span>
              </button>
              ${opened?`<div class="archive-year-items">${items?items.length?items.map(x=>`
                <a href="${esc(articleUrl(x))}" class="archive-item ${String(x.id)===String(ACTIVE_ID)?'active':''}" data-news-select="${x.id}">
                  <span class="archive-item-date">${dateID(x.activity_date)}</span>
                  <span class="archive-item-title">${esc(x.title)}</span>
                </a>`).join(''):'<div class="archive-loading">Tidak ada berita.</div>':''}</div>`:''}
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function sideHTML(){return `${latestHTML()}${archiveHTML()}`;}

function buildShell(){
  mount.innerHTML=`
    <div class="portal-news-layout">
      <article class="portal-news-main" id="portalArticle" aria-live="polite"></article>
      <aside class="portal-news-side"><div id="portalSide">${sideHTML()}</div></aside>
    </div>`;
  if(!document.getElementById('portalToast')){
    const t=document.createElement('div');
    t.className='portal-toast';
    t.id='portalToast';
    document.body.appendChild(t);
  }
}

function refreshSide(){const root=document.getElementById('portalSide');if(root)root.innerHTML=sideHTML();}
function toast(message){const t=document.getElementById('portalToast');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(toast._timer);toast._timer=setTimeout(()=>t.classList.remove('show'),2200);}

function renderComments(items){
  const list=document.querySelector('[data-comment-list]');
  const heading=document.querySelector('[data-comment-heading]');
  const countEls=document.querySelectorAll('[data-comment-count]');
  if(heading)heading.textContent=`${items.length} komentar disetujui`;
  countEls.forEach(el=>el.textContent=String(items.length));
  if(!list)return;
  list.innerHTML=items.length?items.map(c=>`
    <article class="comment-card"><div class="comment-card-top"><strong>${esc(c.name)}</strong><time>${dateTimeID(c.created_at)}</time></div><p>${esc(c.comment)}</p></article>`).join(''):'<div class="comment-empty">Belum ada komentar yang ditampilkan. Jadilah yang pertama mengirim komentar.</div>';
}

async function loadSocial(id){
  try{
    const r=await fetch(`${API}/api/activities/${encodeURIComponent(id)}/social?client_id=${encodeURIComponent(clientId)}`,{cache:'no-store'});
    const d=await r.json();
    if(!r.ok||!d.ok)throw new Error(d.error||'Gagal memuat interaksi');
    const likeBtn=document.querySelector('[data-like]');
    const likeCount=document.querySelector('[data-like-count]');
    const likeIcon=document.querySelector('[data-like-icon]');
    if(likeBtn){likeBtn.dataset.liked=d.liked?'1':'0';likeBtn.classList.toggle('liked',Boolean(d.liked));}
    if(likeCount)likeCount.textContent=String(d.likes||0);
    if(likeIcon)likeIcon.textContent=d.liked?'♥':'♡';
    renderComments(d.comments||[]);
  }catch(err){
    console.error(err);
    const list=document.querySelector('[data-comment-list]');
    if(list)list.innerHTML='<div class="comment-empty">Komentar belum dapat dimuat.</div>';
  }
}

function prefetchDetails(items,limit=12){
  const task=async()=>{
    for(const x of (items||[]).slice(0,limit)){
      if(!x?.id || detailCache.has(String(x.id)))continue;
      try{const item=await getDetail(x.id);preloadArticleImages(item);}catch{}
    }
  };
  if('requestIdleCallback' in window)requestIdleCallback(()=>task(),{timeout:1200});
  else setTimeout(task,80);
}

function clearArticleForSwitch(){
  const root=document.getElementById('portalArticle');
  if(!root)return;
  const h=Math.max(260,root.offsetHeight||0);
  root.style.minHeight=`${h}px`;
  root.classList.add('is-switching');
  root.replaceChildren();
}

function renderArticle(item){
  const root=document.getElementById('portalArticle');
  if(!root)return;
  root.innerHTML=articleHTML(item);
  initInstaGalleries(root);
  preloadArticleImages(item);
  root.classList.remove('is-switching');
  requestAnimationFrame(()=>root.style.minHeight='');
}

async function selectNews(id,{scroll=false,updateUrl=true}={}){
  try{
    const key=String(id);
    const cached=detailCache.get(key);
    if(scroll)document.getElementById('portalArticle')?.scrollIntoView({behavior:'auto',block:'start'});
    if(cached){
      CURRENT=cached;ACTIVE_ID=String(cached.id);renderArticle(cached);refreshSide();loadSocial(cached.id);if(updateUrl)updateBrowserUrl(cached);return;
    }
    clearArticleForSwitch();
    const item=await getDetail(id);
    CURRENT=item;ACTIVE_ID=String(item.id);renderArticle(item);refreshSide();loadSocial(item.id);if(updateUrl)updateBrowserUrl(item);
  }catch(err){
    console.error(err);
    const root=document.getElementById('portalArticle');
    if(root){root.classList.remove('is-switching');root.style.minHeight='';root.innerHTML=`<div class="portal-news-empty"><b>Berita belum dapat dimuat.</b><br>Periksa koneksi internet lalu coba lagi.</div>`;}
  }
}

async function selectNewsBySlug(slug){
  try{
    const item=await getDetailBySlug(slug);
    CURRENT=item;ACTIVE_ID=String(item.id);renderArticle(item);refreshSide();loadSocial(item.id);updateBrowserUrl(item);applyArticleSEO(item);
    requestAnimationFrame(()=>document.getElementById('portalArticle')?.scrollIntoView({behavior:'auto',block:'start'}));
  }catch(err){console.error(err);if(LATEST[0])await selectNews(LATEST[0].id,{updateUrl:false});}
}

async function toggleYear(year){
  year=String(year);
  if(openYears.has(year)){openYears.delete(year);refreshSide();return;}
  if(!archiveCache.has(year)){
    try{
      const r=await fetch(`${API}/api/archive/${encodeURIComponent(year)}`,{cache:'no-store'});
      const d=await r.json();
      if(!r.ok||!d.ok)throw new Error(d.error||'Gagal memuat arsip');
      const sortedItems=newestActivityFirst(d.items||[]);
      archiveCache.set(year,sortedItems);
      prefetchDetails(sortedItems,8);
    }catch(err){console.error(err);archiveCache.set(year,[]);}
  }
  openYears.add(year);refreshSide();
}

async function toggleLike(){
  if(!CURRENT)return;
  const btn=document.querySelector('[data-like]');
  const liked=btn?.dataset.liked==='1';
  try{
    const url=`${API}/api/activities/${CURRENT.id}/like`;
    const r=await fetch(liked?`${url}?client_id=${encodeURIComponent(clientId)}`:url,liked?{method:'DELETE'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:clientId})});
    const d=await r.json();
    if(!r.ok||!d.ok)throw new Error(d.error||'Gagal menyimpan reaksi');
    const likeCount=document.querySelector('[data-like-count]');
    const likeIcon=document.querySelector('[data-like-icon]');
    if(btn){btn.dataset.liked=d.liked?'1':'0';btn.classList.toggle('liked',Boolean(d.liked));}
    if(likeCount)likeCount.textContent=String(d.likes||0);
    if(likeIcon)likeIcon.textContent=d.liked?'♥':'♡';
    CURRENT.like_count=Number(d.likes||0);
    const latest=LATEST.find(x=>String(x.id)===String(CURRENT.id));if(latest)latest.like_count=CURRENT.like_count;
    const pub=ALL_PUBLIC.find(x=>String(x.id)===String(CURRENT.id));if(pub)pub.like_count=CURRENT.like_count;
    toast(d.liked?'Terima kasih atas reaksinya.':'Reaksi dibatalkan.');refreshSide();
  }catch(err){toast(err.message||'Reaksi belum dapat disimpan.');}
}

async function submitComment(form){
  if(!CURRENT)return;
  const message=form.querySelector('[data-comment-message]');
  const fd=new FormData(form);
  const payload={name:String(fd.get('name')||'').trim(),email:String(fd.get('email')||'').trim(),comment:String(fd.get('comment')||'').trim(),website:String(fd.get('website')||'').trim(),client_id:clientId};
  if(message){message.className='comment-message';message.textContent='Mengirim komentar…';}
  try{
    const r=await fetch(`${API}/api/activities/${CURRENT.id}/comments`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d=await r.json();
    if(!r.ok||!d.ok)throw new Error(d.error||'Komentar gagal dikirim');
    form.querySelector('[name="comment"]').value='';
    if(message){message.className='comment-message ok';message.textContent=d.message||'Komentar dikirim dan menunggu moderasi.';}
  }catch(err){if(message){message.className='comment-message error';message.textContent=err.message||'Komentar belum dapat dikirim.';}}
}

async function doShare(type){
  if(!CURRENT)return;
  const url=shareUrl(CURRENT);
  const title=CURRENT.title||'Berita BPD Desa Somagede';
  const text=`${title} — BPD Desa Somagede`;
  try{
    if(type==='native' && navigator.share){await navigator.share({title,text,url});return;}
    if(type==='whatsapp'){window.open(`https://wa.me/?text=${encodeURIComponent(text+'\n'+url)}`,'_blank','noopener');return;}
    if(type==='facebook'){window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank','noopener');return;}
    if(type==='telegram'){window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,'_blank','noopener');return;}
    await navigator.clipboard.writeText(url);toast('Link berita berhasil disalin.');
  }catch(err){try{await navigator.clipboard.writeText(url);toast('Link berita berhasil disalin.');}catch{toast('Bagikan link belum tersedia pada browser ini.');}}
}

mount.addEventListener('click',e=>{
  const prev=e.target.closest('[data-insta-prev]');if(prev){e.preventDefault();const g=prev.closest('[data-insta-gallery]');if(g)setInstaGallery(g,Number(g.dataset.index||0)-1);return;}
  const next=e.target.closest('[data-insta-next]');if(next){e.preventDefault();const g=next.closest('[data-insta-gallery]');if(g)setInstaGallery(g,Number(g.dataset.index||0)+1);return;}
  const dot=e.target.closest('[data-insta-dot]');if(dot){e.preventDefault();const g=dot.closest('[data-insta-gallery]');if(g)setInstaGallery(g,Number(dot.dataset.instaDot||0));return;}
  const news=e.target.closest('[data-news-select]');if(news){e.preventDefault();selectNews(news.dataset.newsSelect,{scroll:true,updateUrl:true});return;}
  const year=e.target.closest('[data-year]');if(year){e.preventDefault();toggleYear(year.dataset.year);return;}
  if(e.target.closest('[data-like]')){e.preventDefault();toggleLike();return;}
  if(e.target.closest('[data-go-comments]')){e.preventDefault();document.getElementById('komentar-berita')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  if(e.target.closest('[data-share-toggle]')){e.preventDefault();const panel=document.querySelector('[data-share-panel]');const url=document.querySelector('[data-share-url]');if(panel){panel.hidden=!panel.hidden;if(url)url.hidden=panel.hidden;}return;}
  const share=e.target.closest('[data-share]');if(share){e.preventDefault();doShare(share.dataset.share);}
});

mount.addEventListener('pointerdown',e=>{const g=e.target.closest('[data-insta-gallery]');if(!g)return;SWIPE_GALLERY=g;SWIPE_X=e.clientX;},{passive:true});
mount.addEventListener('pointerup',e=>{if(!SWIPE_GALLERY)return;const dx=e.clientX-SWIPE_X;const g=SWIPE_GALLERY;SWIPE_GALLERY=null;if(Math.abs(dx)<42)return;setInstaGallery(g,Number(g.dataset.index||0)+(dx<0?1:-1));},{passive:true});
mount.addEventListener('pointercancel',()=>{SWIPE_GALLERY=null},{passive:true});
mount.addEventListener('submit',e=>{const form=e.target.closest('[data-comment-form]');if(!form)return;e.preventDefault();submitComment(form);});

async function load(){
  buildShell();
  try{
    const [latestRes,yearRes]=await Promise.all([
      fetch(`${API}/api/activities?limit=100`,{cache:'no-store'}),
      fetch(`${API}/api/archive`,{cache:'no-store'})
    ]);
    const latestData=await latestRes.json();
    const yearData=await yearRes.json();
    if(!latestRes.ok||!latestData.ok)throw new Error(latestData.error||'Gagal memuat berita');

    ALL_PUBLIC=newestActivityFirst(latestData.items||[]);
    LATEST=ALL_PUBLIC.filter(isCurrentMonth);
    prefetchDetails(LATEST.length?LATEST:ALL_PUBLIC,12);

    const apiYears=yearRes.ok&&yearData.ok?(yearData.years||[]):[];
    const totals=new Map(apiYears.map(y=>[String(y.year),Number(y.total||0)]));
    YEARS=[];
    for(let y=Number(CURRENT_YEAR);y>=2020;y--)YEARS.push({year:String(y),total:totals.get(String(y))||0});
    apiYears.forEach(y=>{const year=String(y.year);if(!YEARS.some(x=>String(x.year)===year))YEARS.push({year,total:Number(y.total||0)});});
    YEARS.sort((a,b)=>Number(b.year)-Number(a.year));

    if(YEARS[0]?.year){
      openYears.add(String(YEARS[0].year));
      fetch(`${API}/api/archive/${encodeURIComponent(YEARS[0].year)}`,{cache:'no-store'})
        .then(r=>r.json())
        .then(d=>{
          if(d.ok){
            const sortedItems=newestActivityFirst(d.items||[]);
            archiveCache.set(String(YEARS[0].year),sortedItems);
            prefetchDetails(sortedItems,8);
            refreshSide();
          }
        }).catch(()=>{});
    }

    const slug=new URL(location.href).searchParams.get('berita');
    if(slug){await selectNewsBySlug(slug);return;}
    if(LATEST[0])await selectNews(LATEST[0].id,{updateUrl:false});
    else if(ALL_PUBLIC[0])await selectNews(ALL_PUBLIC[0].id,{updateUrl:false});
    else document.getElementById('portalArticle').innerHTML='<div class="portal-news-empty">Belum ada berita yang dipublikasikan.</div>';
  }catch(err){
    console.error(err);
    mount.innerHTML=`<div class="portal-news-empty"><b>Portal berita belum dapat dimuat.</b><br>Periksa koneksi internet lalu muat ulang halaman.</div>`;
  }
}

load();
})();
