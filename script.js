'use strict';
(() => {
  document.body.classList.add('page-enter');
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      document.body.classList.remove('page-enter');
      requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('page-enter')));
    }
  });
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const dialog = document.querySelector('#menu-dialog');
  const title = document.querySelector('#dialog-title');
  const content = document.querySelector('#dialog-content');
  const closeMenu = () => { navigation.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); };
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; navigation.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 860) closeMenu(); });
  document.querySelector('#year').textContent = new Date().getFullYear();
  const showDialog = (heading, html) => { title.textContent = heading; content.innerHTML = html; if (!dialog.open) dialog.showModal(); document.body.classList.add('modal-open'); };
  const closeDialog = () => dialog.close();
  dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  const contactMessages = {
    reserva: 'Olá! Gostaria de consultar a disponibilidade para reservar uma mesa.',
    pedido: 'Olá! Gostaria de fazer um pedido e consultar o cardápio.',
    horarios: 'Olá! Quais são os horários de funcionamento?',
    cardapio: 'Olá! Gostaria de consultar o cardápio.',
    whatsapp: 'Olá, Madrid Lisboa!',
    rodizio: 'Olá! Gostaria de saber os dias, horários e valores do rodízio.',
    happy: 'Olá! Gostaria de consultar as opções e os horários do happy hour.'
  };
  function contactHref(type) {
    if (type === 'instagram') return window.RESTAURANT_CONFIG?.instagram || 'https://www.instagram.com/madrid.lisboa/';
    const phone = (window.RESTAURANT_CONFIG?.whatsapp || '5521972851399').replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(contactMessages[type] || contactMessages.whatsapp)}`;
  }
  document.querySelectorAll('a[data-contact]').forEach(link => { link.href = contactHref(link.dataset.contact); });
  const menus = {
    almoco: { title: 'Seu momento de almoço.', intro: 'Uma pausa para comer bem e aproveitar a companhia.', items: [['Buffet variado', 'Pratos quentes, saladas e acompanhamentos.'], ['Sabores da casa', 'Consulte as opções preparadas para o dia.']] },
    rodizio: { title: 'Sempre cabe mais uma fatia.', intro: 'Reúna a turma e venha compartilhar o seu momento.', items: [['Pizzas salgadas', 'Dos sabores clássicos às combinações da casa.'], ['Uma noite à mesa', 'Consulte os dias, horários e sabores do rodízio.']] },
    happy: { title: 'Um brinde ao encontro.', intro: 'A combinação perfeita é uma boa conversa à mesa.', items: [['Chope e bebidas', 'Consulte os rótulos e as opções disponíveis.'], ['Para compartilhar', 'Petiscos para acompanhar o seu encontro.']] }
  };
  function openMenu(category) { const data = menus[category]; if (!data) return; showDialog(data.title, `<p>${data.intro}</p><ul class="menu-list">${data.items.map(([name, description]) => `<li><strong>${name}</strong><span>${description}</span></li>`).join('')}</ul><p class="dialog-notice">Cardápio ilustrativo. Sabores, preços e disponibilidade serão atualizados com as informações do restaurante.</p><a class="button button-gold" href="${contactHref('cardapio')}" target="_blank" rel="noopener noreferrer">Consultar cardápio</a>`); }
  document.querySelectorAll('[data-menu]').forEach(button => button.addEventListener('click', () => openMenu(button.dataset.menu)));
  document.querySelectorAll('[data-category]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); closeMenu(); openMenu(link.dataset.category); }));
  const dishes = document.querySelector('#pratos');
  if (dishes) {
    const photos = [
      { src: 'assets/prato-parmegiana.webp', alt: 'Frango à parmegiana servido com molho e queijo', caption: 'Frango à parmegiana' },
      { src: 'assets/prato-churrasco.webp', alt: 'Churrasco misto servido com acompanhamentos', caption: 'Churrasco misto' },
      { src: 'assets/prato-moqueca.webp', alt: 'Moqueca servida em panela de barro com acompanhamentos', caption: 'Moqueca' },
      { src: 'assets/prato-buffet-saladas.webp', alt: 'Balcão de buffet com saladas variadas', caption: 'Buffet de saladas' },
      { src: 'assets/prato-feijoada.webp', alt: 'Feijoada servida em panela com arroz e acompanhamentos', caption: 'Feijoada' }
    ];
    const slides = [...dishes.querySelectorAll('.dishes-slide')];
    const dots = [...dishes.querySelectorAll('.dishes-dot')];
    const caption = dishes.querySelector('[data-dishes-caption]');
    let current = 0, request = 0, timer = 0, inView = false;
    photos.slice(1).forEach(photo => { const preload = new Image(); preload.src = photo.src; });
    const syncTimer = () => {
      window.clearInterval(timer);
      if (inView && !document.hidden) timer = window.setInterval(() => showPhoto((current + 1) % photos.length), 7000);
    };
    const showPhoto = async index => {
      if (index === current) { syncTimer(); return; }
      const token = ++request, photo = photos[index], oldSlide = slides.find(slide => slide.classList.contains('is-active'));
      const nextSlide = slides.find(slide => slide !== oldSlide);
      if (nextSlide.getAttribute('src') !== photo.src) nextSlide.src = photo.src;
      nextSlide.alt = photo.alt;
      nextSlide.removeAttribute('aria-hidden');
      try { if (nextSlide.decode) await nextSlide.decode(); } catch {}
      if (token !== request) return;
      nextSlide.classList.add('is-active');
      oldSlide.classList.remove('is-active');
      oldSlide.alt = '';
      oldSlide.setAttribute('aria-hidden', 'true');
      current = index;
      caption.textContent = photo.caption;
      dots.forEach((dot, dotIndex) => { const active = dotIndex === current; dot.classList.toggle('is-active', active); dot.setAttribute('aria-pressed', String(active)); });
      syncTimer();
    };
    dots.forEach((dot, index) => dot.addEventListener('click', () => showPhoto(index)));
    document.addEventListener('visibilitychange', syncTimer);
    if ('IntersectionObserver' in window) {
      const dishesObserver = new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        syncTimer();
      }, { threshold: 0.15 });
      dishesObserver.observe(dishes);
    } else { inView = true; syncTimer(); }
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => { for (const entry of entries) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } } }, { threshold: 0.1 });
    reveals.forEach(element => observer.observe(element));
    document.body.classList.add('motion-ready');
  }
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (!entry.isIntersecting) return; const current = entry.target.id; document.querySelectorAll('.nav-link').forEach(link => { const active = link.getAttribute('href') === '#' + current && !link.dataset.category; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }); }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main > section').forEach(section => sectionObserver.observe(section));
  }
})();
