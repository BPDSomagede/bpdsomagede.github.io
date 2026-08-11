(()=>{
'use strict';

const API=window.BPD_CMS_API || 'https://bpd-somagede-cms.bpddesasomagede.workers.dev';
const MAX_MEDIA=6;
const MAX_VIDEO=60*1024*1024;
const MAX_AUDIO=30*1024*1024;
const VIDEO_EXT=new Set(['mp4','webm','mov','m4v','ogv','mpg','mpeg','3gp']);
const AUDIO_EXT=new Set(['mp3','m4a','aac','wav','ogg','oga','flac']);

let pending=[];
let activeId=null;
let existing=[];
let lastAuth='';
const objectUrls=new Set();

const esc=(s='')=>String(s).replace(/[&<>"']/g,m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[m]);

function extOf(name=''){
  const p=String(name).toLowerCase().split('.');
  return p.length>1?p.pop():'';
}
function kindOf(file){
  const t=String(file?.type||'').toLowerCase();
  const e=extOf(file?.name||'');
  if(t.startsWith('video/')||VIDEO_EXT.has(e))return 'video';
  if(t.startsWith('audio/')||AUDIO_EXT.has(e))return 'audio';
  return '';
}
function sizeLabel(bytes=0){
  const n=Number(bytes)||0;
  if(n>=1024*1024)return `${(n/1024/1024).toFixed(n>=10*1024*1024?0:1)} MB`;
  if(n>=1024)return `${Math.round(n/1024)} KB`;
  return `${n} B`;
}
function token(){
  return sessionStorage.getItem('bpd-editor-token')||'';
}
function authHeaders(extra={}){
  const h=new Headers(extra);
  const v=lastAuth || (token()?`Bearer ${token()}`:'');
  if(v)h.set('Authorization',v);
  return h;
}
function setStatus(text,type=''){
  const el=document.getElementById('bpdMediaStatus');
  if(!el)return;
  el.textContent=text||'';
  el.dataset.type=type;
}
function clearObjectUrls(){
  objectUrls.forEach(u=>URL.revokeObjectURL(u));
  objectUrls.clear();
}
function clearPending(){
  clearObjectUrls();
  pending=[];
  renderPending();
}
function totalMedia(){return existing.length+pending.length;}

function ensureUI(){
  if(document.getElementById('bpdMediaAddon'))return;
  const save=document.getElementById('saveBtn');
  if(!save)return;
  const actionRow=save.closest('p')||save.parentElement;

  const style=document.createElement('style');
  style.id='bpdMediaAddonStyle';
  style.textContent=`
    #bpdMediaAddon{margin:22px 0 20px;padding:18px;border:1px solid #d7e9e2;border-radius:18px;background:#fbfffd}
    #bpdMediaAddon .bpd-media-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
    #bpdMediaAddon h3{margin:0;color:#083128;font-size:17px}
    #bpdMediaAddon .bpd-media-counter{font-size:12px;font-weight:900;color:#0b6b51;background:#e7f7f0;border-radius:999px;padding:5px 9px;white-space:nowrap}
    #bpdMediaAddon .bpd-media-help{margin:0 0 12px;color:#60736d;font-size:12px;line-height:1.55}
    #bpdMediaDrop{display:grid;place-items:center;text-align:center;min-height:100px;border:2px dashed #9dcdbb;border-radius:15px;background:#f1fbf7;cursor:pointer;padding:14px;transition:.18s ease}
    #bpdMediaDrop:hover,#bpdMediaDrop.drag{border-color:#07845f;background:#e7f8f0}
    #bpdMediaDrop.full{opacity:.55;cursor:not-allowed}
    #bpdMediaDrop strong{display:block;color:#0a5d47;margin-bottom:4px}
    #bpdMediaDrop span{font-size:12px;color:#60736d}
    .bpd-media-list{display:grid;gap:10px;margin-top:12px}
    .bpd-media-item{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px;border:1px solid #deebe6;border-radius:14px;background:#fff}
    .bpd-media-preview{width:72px;height:54px;border-radius:10px;background:#0d2923;display:grid;place-items:center;overflow:hidden;color:#fff;font-weight:900;font-size:11px}
    .bpd-media-preview video{width:100%;height:100%;object-fit:cover}
    .bpd-media-preview.audio{background:#e9f5ff;color:#14557a;font-size:22px}
    .bpd-media-name{min-width:0}.bpd-media-name strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#163c32;font-size:13px}.bpd-media-name small{display:block;color:#71827d;margin-top:3px}
    .bpd-media-remove{border:0;border-radius:10px;padding:8px 10px;background:#fff0f2;color:#b7273c;font-weight:900;cursor:pointer}
    #bpdMediaStatus{min-height:18px;margin-top:8px;font-size:12px;font-weight:800;color:#506b63}
    #bpdMediaStatus[data-type="ok"]{color:#087052}#bpdMediaStatus[data-type="error"]{color:#c1283c}#bpdMediaStatus[data-type="busy"]{color:#6f4b00}
    @media(max-width:620px){.bpd-media-item{grid-template-columns:58px minmax(0,1fr) auto}.bpd-media-preview{width:58px;height:48px}}
  `;
  document.head.appendChild(style);

  const box=document.createElement('section');
  box.id='bpdMediaAddon';
  box.innerHTML=`
    <div class="bpd-media-head">
      <div><h3>🎬 Video & Audio Berita</h3></div>
      <span class="bpd-media-counter" id="bpdMediaCounter">0 / ${MAX_MEDIA}</span>
    </div>
    <p class="bpd-media-help">Video: MP4, WebM, MOV, M4V, OGV, MPG/MPEG, 3GP (maks. 60 MB/file). Audio: MP3, M4A, AAC, WAV, OGG, FLAC (maks. 30 MB/file). Maksimal ${MAX_MEDIA} media per berita.</p>
    <div id="bpdMediaDrop" role="button" tabindex="0" aria-label="Unggah video atau audio">
      <input id="bpdMediaFiles" type="file" accept="video/*,audio/*,.mp4,.webm,.mov,.m4v,.ogv,.mpg,.mpeg,.3gp,.mp3,.m4a,.aac,.wav,.ogg,.oga,.flac" multiple hidden>
      <div><strong>＋ Tambah Video / MP3 / Audio</strong><span>Klik atau seret file dari komputer ke area ini</span></div>
    </div>
    <div class="bpd-media-list" id="bpdMediaExisting"></div>
    <div class="bpd-media-list" id="bpdMediaPending"></div>
    <div id="bpdMediaStatus" aria-live="polite"></div>
  `;
  actionRow.parentNode.insertBefore(box,actionRow);

  const input=document.getElementById('bpdMediaFiles');
  const drop=document.getElementById('bpdMediaDrop');
  drop.addEventListener('click',()=>{if(totalMedia()<MAX_MEDIA)input.click()});
  drop.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&totalMedia()<MAX_MEDIA){e.preventDefault();input.click()}});
  input.addEventListener('change',()=>{addFiles([...input.files]);input.value=''});
  ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('drag')}));
  ['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('drag')}));
  drop.addEventListener('drop',e=>addFiles([...e.dataTransfer.files]));

  document.getElementById('cancelBtn')?.addEventListener('click',()=>{
    activeId=null; existing=[]; clearPending(); renderExisting(); setStatus('');
  });

  renderPending();
  renderExisting();
}

function validateFile(file){
  const kind=kindOf(file);
  if(!kind)return `${file.name}: format tidak didukung.`;
  if(kind==='video'&&file.size>MAX_VIDEO)return `${file.name}: video melebihi 60 MB.`;
  if(kind==='audio'&&file.size>MAX_AUDIO)return `${file.name}: audio melebihi 30 MB.`;
  return '';
}
function addFiles(files){
  ensureUI();
  let errors=[];
  for(const file of files){
    if(totalMedia()>=MAX_MEDIA){errors.push(`Batas maksimal ${MAX_MEDIA} media sudah tercapai.`);break;}
    const err=validateFile(file); if(err){errors.push(err);continue;}
    const dup=pending.some(x=>x.file.name===file.name&&x.file.size===file.size&&x.file.lastModified===file.lastModified);
    if(dup)continue;
    const kind=kindOf(file);
    const url=URL.createObjectURL(file); objectUrls.add(url);
    pending.push({file,kind,url});
  }
  renderPending();
  setStatus(errors.join(' '),errors.length?'error':'');
}
function renderPending(){
  const list=document.getElementById('bpdMediaPending');
  const count=document.getElementById('bpdMediaCounter');
  const drop=document.getElementById('bpdMediaDrop');
  if(count)count.textContent=`${totalMedia()} / ${MAX_MEDIA}`;
  if(drop)drop.classList.toggle('full',totalMedia()>=MAX_MEDIA);
  if(!list)return;
  list.innerHTML=pending.map((x,i)=>`
    <div class="bpd-media-item">
      <div class="bpd-media-preview ${x.kind==='audio'?'audio':''}">${x.kind==='video'?`<video src="${esc(x.url)}" muted preload="metadata"></video>`:'🎵'}</div>
      <div class="bpd-media-name"><strong>${esc(x.file.name)}</strong><small>${x.kind==='video'?'Video':'Audio'} · ${sizeLabel(x.file.size)} · akan diunggah saat berita disimpan</small></div>
      <button type="button" class="bpd-media-remove" data-remove-pending="${i}">Hapus</button>
    </div>`).join('');
  list.querySelectorAll('[data-remove-pending]').forEach(btn=>btn.onclick=()=>{
    const i=Number(btn.dataset.removePending); const x=pending[i];
    if(x?.url){URL.revokeObjectURL(x.url);objectUrls.delete(x.url)}
    pending.splice(i,1);renderPending();
  });
}
function renderExisting(){
  const list=document.getElementById('bpdMediaExisting');
  const count=document.getElementById('bpdMediaCounter');
  if(count)count.textContent=`${totalMedia()} / ${MAX_MEDIA}`;
  if(!list)return;
  if(!existing.length){list.innerHTML='';return;}
  list.innerHTML=existing.map(x=>`
    <div class="bpd-media-item">
      <div class="bpd-media-preview ${x.media_type==='audio'?'audio':''}">${x.media_type==='video'?`<video src="${esc(x.url)}" muted preload="metadata"></video>`:'🎵'}</div>
      <div class="bpd-media-name"><strong>${esc(x.original_name||('Media '+x.id))}</strong><small>Tersimpan · ${x.media_type==='video'?'Video':'Audio'}${x.bytes?` · ${sizeLabel(x.bytes)}`:''}</small></div>
      <button type="button" class="bpd-media-remove" data-delete-media="${x.id}">Hapus</button>
    </div>`).join('');
  list.querySelectorAll('[data-delete-media]').forEach(btn=>btn.onclick=()=>deleteExisting(Number(btn.dataset.deleteMedia)));
}
async function deleteExisting(mediaId){
  if(!activeId||!mediaId)return;
  if(!confirm('Hapus video/audio ini dari berita?'))return;
  setStatus('Menghapus media…','busy');
  try{
    const r=await originalFetch(`${API}/api/admin/activities/${activeId}/media/${mediaId}`,{method:'DELETE',headers:authHeaders()});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.ok)throw new Error(d.error||'Gagal menghapus media.');
    existing=[...(d.item?.media||[])];
    renderExisting();renderPending();setStatus('Media berhasil dihapus.','ok');
  }catch(err){setStatus(err.message||'Gagal menghapus media.','error')}
}

async function uploadPending(id,files,headers){
  if(!id||!files.length)return null;
  setStatus(`Mengunggah ${files.length} video/audio…`,'busy');
  const fd=new FormData(); files.forEach(x=>fd.append('media',x.file,x.file.name));
  const h=new Headers(headers||{}); h.delete('content-type');
  if(!h.get('Authorization')){
    const a=lastAuth||(token()?`Bearer ${token()}`:''); if(a)h.set('Authorization',a);
  }
  const r=await originalFetch(`${API}/api/admin/activities/${id}/media`,{method:'POST',headers:h,body:fd});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.ok)throw new Error(d.error||'Upload video/audio gagal.');
  return d.item||null;
}

const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init={}){
  const url=typeof input==='string'?input:(input?.url||'');
  const method=String(init?.method||(input?.method)||'GET').toUpperCase();
  const headers=new Headers(init?.headers||(input?.headers)||{});
  if(headers.get('Authorization'))lastAuth=headers.get('Authorization');

  // Detail berita admin: ambil media lama untuk ditampilkan di editor.
  const detail=url.match(/\/api\/admin\/activities\/(\d+)$/);
  if(detail&&method==='GET'){
    const r=await originalFetch(input,init);
    try{
      const d=await r.clone().json();
      if(r.ok&&d.ok&&d.item){
        activeId=Number(d.item.id||detail[1]);
        existing=[...(d.item.media||[])];
        setTimeout(()=>{ensureUI();renderExisting();renderPending();},0);
      }
    }catch{}
    return r;
  }

  // Simpan berita baru / perubahan. Media diunggah sesudah data utama berhasil tersimpan.
  const create=/\/api\/admin\/activities$/.test(url)&&method==='POST';
  const update=detail&&method==='PUT';
  if(create||update){
    const snapshot=pending.slice();
    const r=await originalFetch(input,init);
    if(!r.ok||!snapshot.length)return r;
    try{
      const d=await r.clone().json();
      const id=Number(d?.item?.id||(update?detail[1]:0));
      if(d?.ok&&id){
        const item=await uploadPending(id,snapshot,headers);
        existing=[...(item?.media||[])];
        clearPending();
        setStatus('Berita dan video/audio berhasil tersimpan.','ok');
        setTimeout(()=>{
          const cancel=document.getElementById('cancelBtn');
          if(cancel?.hidden){activeId=null;existing=[];renderExisting();setStatus('')}
        },600);
      }
    }catch(err){
      setStatus(`Berita tersimpan, tetapi media belum terunggah: ${err.message||err}`,'error');
    }
    return r;
  }

  return originalFetch(input,init);
};

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUI,{once:true});
else ensureUI();
})();
