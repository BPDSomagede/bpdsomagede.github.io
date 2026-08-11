const CACHE='bpd-somagede-ultra-20260806';
const FILES=["index.html", "profil.html", "berita.html", "kegiatan.html", "pembangunan.html", "dokumen.html", "galeri.html", "aspirasi.html", "kontak.html", "sejarah.html", "statistik.html", "anggaran.html", "kepala-desa.html", "regulasi.html", "literasi.html", "404.html"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('404.html'))))});
