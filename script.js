(() => {
    const root = document.documentElement;
    root.classList.add('js');

    // ---- Theme toggle (system default, remembers explicit choice) ----
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = () =>
        root.getAttribute('data-theme') || (prefersDark.matches ? 'dark' : 'light');

    toggle?.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { }
    });

    // ---- Nav: border on scroll, mobile menu, active section ----
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const menuBtn = document.getElementById('menu-btn');
    const links = document.getElementById('nav-links');
    const closeMenu = () => {
        links.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn?.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    const navMap = new Map(
        [...links.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a])
    );
    if ('IntersectionObserver' in window) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navMap.forEach(a => a.classList.remove('active'));
                    navMap.get(entry.target.id)?.classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        navMap.forEach((_, id) => {
            const el = document.getElementById(id);
            if (el) spy.observe(el);
        });
    }

    // ---- Reveal on scroll ----
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        reveals.forEach((el, i) => {
            // light stagger for elements in the same group
            el.style.transitionDelay = `${Math.min((i % 4) * 60, 180)}ms`;
            io.observe(el);
        });
    } else {
        reveals.forEach(el => el.classList.add('in'));
    }

    // ---- Cursor-follow glow on project cards ----
    document.querySelectorAll('.project').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });

    // ---- Copy email ----
    const copyBtn = document.getElementById('copy-email');
    copyBtn?.addEventListener('click', async () => {
        const email = copyBtn.dataset.email;
        try {
            await navigator.clipboard.writeText(email);
            copyBtn.textContent = 'Copied ✓';
        } catch (e) {
            copyBtn.textContent = email;
        }
        setTimeout(() => (copyBtn.textContent = 'Copy email'), 2000);
    });

    // ---- Footer year ----
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
})();
