
(() => {
  const nav = document.querySelector('.navlinks');
  const menu = document.querySelector('.menu-toggle');
  if(menu && nav){
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';}));
  }
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.navlinks a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
    if(href === current || (current === '' && href === 'index.html')) a.classList.add('active');
  });
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent = new Date().getFullYear());
  document.querySelectorAll('[data-today]').forEach(el=>{
    el.textContent = new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
  });
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  const toastEl = document.querySelector('.toast');
  function toast(msg){ if(!toastEl) return; toastEl.textContent=msg; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'),2400); }
  window.siteToast = toast;

  const form = document.querySelector('#aspirasiForm');
  const preview = document.querySelector('#aspirasiPreview');
  if(form && preview){
    const makeText = () => {
      const d = new FormData(form);
      const now = new Date();
      const tanggal = new Intl.DateTimeFormat('id-ID',{dateStyle:'long'}).format(now);
      return `ASPIRASI WARGA DESA SOMAGEDE\n\nTanggal: ${tanggal}\nNama: ${d.get('nama') || '-'}\nAlamat/RT/RW: ${d.get('alamat') || '-'}\nKontak: ${d.get('kontak') || '-'}\nKategori: ${d.get('kategori') || '-'}\n\nIsi Aspirasi:\n${d.get('pesan') || '-'}\n\nHarapan/Usulan Penyelesaian:\n${d.get('harapan') || '-'}\n\nPernyataan: Data disampaikan secara benar dan dapat digunakan untuk tindak lanjut aspirasi.`;
    };
    const update = () => preview.textContent = makeText();
    form.addEventListener('input', update); update();
    form.addEventListener('submit', e => {
      e.preventDefault();
      if(!form.reportValidity()) return;
      const text = makeText();
      const subject = encodeURIComponent('Aspirasi Warga untuk BPD Desa Somagede');
      const body = encodeURIComponent(text);
      location.href = `mailto:desasomagede2003@gmail.com?subject=${subject}&body=${body}`;
      toast('Aplikasi email sedang dibuka.');
    });
    document.querySelector('#copyAspirasi')?.addEventListener('click', async()=>{
      try{await navigator.clipboard.writeText(makeText()); toast('Aspirasi berhasil disalin.');}
      catch(e){toast('Salin manual dari kotak pratinjau.');}
    });
    document.querySelector('#downloadAspirasi')?.addEventListener('click',()=>{
      const blob = new Blob([makeText()],{type:'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob); const a=document.createElement('a');
      const name=(new FormData(form).get('nama')||'warga').toString().trim().replace(/[^a-z0-9]+/gi,'-').toLowerCase();
      a.href=url; a.download=`aspirasi-${name}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast('Berkas aspirasi diunduh.');
    });
    document.querySelector('#printAspirasi')?.addEventListener('click',()=>window.print());
    form.addEventListener('reset',()=>setTimeout(update));
  }

  document.querySelectorAll('[data-download-template]').forEach(btn=>btn.addEventListener('click',()=>{
    const text='FORM ASPIRASI WARGA DESA SOMAGEDE\n\nNama:\nAlamat/RT/RW:\nKontak:\nKategori:\n\nIsi Aspirasi:\n\nHarapan/Usulan Penyelesaian:\n\nTanggal:\nTanda tangan:';
    const blob=new Blob([text],{type:'text/plain;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download='form-aspirasi-warga-somagede.txt';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast('Template berhasil diunduh.');
  }));
})();
