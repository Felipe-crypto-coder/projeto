/* script.js — Comportamentos globais do site Vida Verde
   - menu mobile
   - tema (localStorage)
   - contadores animados
   - carrossel de depoimentos
   - modal de doação e validações
   - exportar eventos (.ics)
   - formulários (newsletter, contato, doação)
*/

(function(){
  // helpers
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const toNumber = s => Number(String(s).replace(/[^0-9,\.]/g,'').replace(',','.')) || 0;
  const fmtBR = n => n.toLocaleString('pt-BR');

  // --- Menu mobile toggle (um toggle para as páginas) ---
  const menuButtons = $$('.menu-btn');
  menuButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('id');
      // determine mobile menu matching
      const mobile = btn.closest('.site-header').querySelector('.mobile-menu');
      const open = mobile.getAttribute('aria-hidden') === 'false';
      mobile.setAttribute('aria-hidden', String(open ? 'true' : 'false'));
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  // --- Theme toggle (persistente) ---
  const themeToggle = $('#themeToggle');
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('vv-theme') || 'dark';
  if(storedTheme === 'light') root.setAttribute('data-theme','light');

  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if(isLight) { root.removeAttribute('data-theme'); localStorage.setItem('vv-theme','dark'); themeToggle.setAttribute('aria-pressed','false'); }
      else { root.setAttribute('data-theme','light'); localStorage.setItem('vv-theme','light'); themeToggle.setAttribute('aria-pressed','true'); }
    });
  }

  // --- Sticky header effect on scroll ---
  const header = document.getElementById('siteHeader') || document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if(!header) return;
    if(window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  // --- Counters (appear once) ---
  const counterEls = $$('[data-counter]');
  const revealCounter = (el, target) => {
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now-start)/dur, 1);
      el.textContent = fmtBR(Math.floor(target * p));
      if(p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if(counterEls.length){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const t = Number(el.getAttribute('data-counter') || el.textContent) || 0;
          revealCounter(el, t);
          obs.unobserve(el);
        }
      })
    }, { threshold: .4 });
    counterEls.forEach(el => obs.observe(el));
  }

  // --- Carousel (testimonials) ---
  const carousel = document.getElementById('testiCarousel');
  if(carousel){
    const slides = Array.from(carousel.querySelectorAll('.slide'));
    const prev = document.getElementById('prevTesti');
    const next = document.getElementById('nextTesti');
    let idx = 0;
    const show = (i) => {
      slides.forEach((s,si) => s.classList.toggle('active', si === i));
    };
    const nextSlide = () => { idx = (idx + 1) % slides.length; show(idx); };
    const prevSlide = () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); };
    let timer = setInterval(nextSlide, 5500);
    if(next) next.addEventListener('click', () => { nextSlide(); resetTimer(); });
    if(prev) prev.addEventListener('click', () => { prevSlide(); resetTimer(); });
    const resetTimer = () => { clearInterval(timer); timer = setInterval(nextSlide, 5500); };
    show(idx);
  }

  // --- Modal Doação ---
  const donateModal = document.getElementById('donateModal');
  const openDonateBtns = $$('.open-donate');
  const openDonateHero = $('#openDonateHero');
  const openDonateHero2 = $('#openDonateHero2');
  const openDonateFromHero = $('#openDonateHero'); // hero open
  const closeDonate = $('#closeDonate');
  const modalCancel = $('#modalCancel');

  const openModal = () => {
    if(!donateModal) return;
    donateModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    if(!donateModal) return;
    donateModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  };

  openDonateBtns.forEach(b => b.addEventListener('click', openModal));
  if(openDonateFromHero) openDonateFromHero.addEventListener('click', openModal);
  if(closeDonate) closeDonate.addEventListener('click', closeModal);
  if(modalCancel) modalCancel.addEventListener('click', closeModal);
  if(donateModal) donateModal.addEventListener('click', (e) => { if(e.target === donateModal) closeModal(); });

  // modal form
  const modalForm = $('#modalDonateForm');
  if(modalForm){
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#mName').value.trim();
      const email = $('#mEmail').value.trim();
      const amount = $('#mAmount').value.trim();
      const feedback = $('#modalFeedback');
      if(!name || !/.+@.+\..+/.test(email) || !amount){ feedback.textContent = 'Preencha nome, e-mail válido e valor.'; return; }
      feedback.textContent = 'Processando pagamento (simulado)…';
      setTimeout(() => {
        feedback.textContent = 'Doação confirmada — obrigado! Enviamos o recibo para ' + email;
        modalForm.reset();
        setTimeout(()=>closeModal(), 1000);
      }, 900);
    });
  }

  // --- Donate form (section) ---
  const donateForm = $('#donateForm');
  if(donateForm){
    donateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#donorName').value.trim();
      const email = $('#donorEmail').value.trim();
      const amount = $('#donorAmount').value.trim();
      const feedback = $('#donateFeedback');
      if(!name || !/.+@.+\..+/.test(email)){ feedback.textContent = 'Preencha nome e e-mail válidos.'; return; }
      const num = toNumber(amount);
      if(num < 5){ feedback.textContent = 'Informe um valor mínimo de R$5,00.'; return; }
      feedback.textContent = 'Obrigado! Processando (simulado)…';
      setTimeout(()=>{ feedback.textContent = 'Doação registrada. Obrigado pelo apoio!'; donateForm.reset(); }, 900);
    });
  }

  // --- Newsletter form ---
  const newsletter = $('#newsletterForm');
  if(newsletter){
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const em = $('#newsletterEmail').value.trim();
      if(!/.+@.+\..+/.test(em)) return alert('Informe um e-mail válido.');
      localStorage.setItem('vv-news', em);
      alert('Inscrição confirmada — obrigado! (simulado)');
      newsletter.reset();
    });
  }

  // --- Event ICS export (single and all) ---
  const addIcsBtns = $$('.add-ics');
  function toICS(events){
    const pad = n => String(n).padStart(2,'0');
    const toUTC = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    const now = new Date();
    const parts = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//VidaVerde//PT-BR'];
    events.forEach((ev, idx) => {
      const dt = new Date(ev.dt);
      parts.push('BEGIN:VEVENT');
      parts.push(`UID:${Date.now()}-${idx}@vidaverde`);
      parts.push(`DTSTAMP:${toUTC(now)}`);
      parts.push(`DTSTART:${toUTC(dt)}`);
      parts.push(`SUMMARY:${ev.title}`);
      if(ev.loc) parts.push(`LOCATION:${ev.loc}`);
      parts.push('END:VEVENT');
    });
    parts.push('END:VCALENDAR');
    return parts.join('\r\n');
  }
  addIcsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title') || btn.textContent;
      const dt = btn.getAttribute('data-dt') || new Date().toISOString();
      const blob = new Blob([toICS([{ title, dt }])], { type:'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'evento.ics'; a.click(); URL.revokeObjectURL(url);
    });
  });

  // Export all events link
  const downloadAll = $('#downloadAllEvents');
  if(downloadAll){
    downloadAll.addEventListener('click', () => {
      const events = $$('.add-ics').map((b) => ({ title: b.getAttribute('data-title'), dt: b.getAttribute('data-dt'), loc: '' }));
      const blob = new Blob([toICS(events)], { type:'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'eventos-vida-verde.ics'; a.click(); URL.revokeObjectURL(url);
    });
  }

  // --- Simple favorites (local) for program "Salvar" buttons ---
  const favBtns = $$('[data-fav]');
  favBtns.forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-fav');
      const favs = JSON.parse(localStorage.getItem('vv-favs') || '[]');
      const exists = favs.includes(id);
      if(exists){
        const idx = favs.indexOf(id); favs.splice(idx,1); b.classList.remove('active'); b.textContent = 'Salvar';
      } else { favs.push(id); b.classList.add('active'); b.textContent = 'Salvo'; }
      localStorage.setItem('vv-favs', JSON.stringify(favs));
    })
  });

  // --- Simple program search/filter (on programas page) ---
  const filterSelect = $('#filterCat');
  const searchProgram = $('#searchProgram');
  if(filterSelect || searchProgram){
    const filterGrid = $('#programGrid');
    const applyFilter = () => {
      const cat = filterSelect ? filterSelect.value : 'all';
      const q = searchProgram ? searchProgram.value.trim().toLowerCase() : '';
      const cards = filterGrid ? Array.from(filterGrid.children) : [];
      cards.forEach(c => {
        const matchesCat = (cat === 'all') || c.dataset.cat === cat;
        const txt = c.textContent.toLowerCase();
        const matchesQ = q === '' || txt.includes(q);
        c.style.display = (matchesCat && matchesQ) ? '' : 'none';
      });
    };
    if(filterSelect) filterSelect.addEventListener('change', applyFilter);
    if(searchProgram) searchProgram.addEventListener('input', applyFilter);
  }

  // --- Blog search UI (if present) ---
  const blogSearch = $('#blogSearch');
  if(blogSearch){
    blogSearch.addEventListener('input', (e) => {
      // handled in page script
    });
  }

  // --- Contact form ---
  const contactForm = $('#contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#cName').value.trim();
      const email = $('#cEmail').value.trim();
      const message = $('#cMessage').value.trim();
      const fb = $('#contactFeedback');
      if(!name || !email || !message || !/.+@.+\..+/.test(email)){ fb.textContent = 'Preencha todos os campos corretamente.'; return; }
      fb.textContent = 'Mensagem enviada — obrigado! (simulado)';
      contactForm.reset();
    });
  }

  // --- Footer years dynamic ---
  const y = new Date().getFullYear();
  const ftEls = ['ftYear','yearSobre','yearPrograms','yearBlog','yearContact'];
  ftEls.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.textContent = y;
  });

  // accessibility: close modal on ESC
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(donateModal && donateModal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  // Small enhancement: prefer-reduced-motion
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches){
    // disable interval carousels
    // (we could remove setInterval if present; here it's handled per-carousel)
  }

})();
