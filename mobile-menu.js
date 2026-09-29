/* Мобильное меню «Резонанс»: бургер слева, меню выезжает слева направо
   с летящими полыми звёздочками. Ссылки берутся из обычного меню страницы. */
/* Плавный уход со страницы при переходе по ссылке (только мобильная версия) */
(function () {
    var mqm = window.matchMedia('(max-width: 768px)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var DELAY = 450; /* = transition в mobile.css */
    var d = document.documentElement;
    var VT = 'CSSViewTransitionRule' in window;

    document.addEventListener('click', function (e) {
        if (!mqm.matches || reduce.matches) return;
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
        var url;
        try { url = new URL(a.href, location.href); } catch (err) { return; }
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search) {
            /* та же страница: якорь скроллится как обычно, без якоря — просто закрываем меню */
            if (!url.hash && a.closest('.mm')) e.preventDefault();
            return;
        }
        var inMenu = !!a.closest('.mm');
        if (VT && !inMenu) return; /* обычная ссылка: плавный переход сделает браузер */
        e.preventDefault();
        if (inMenu) {
            /* меню остаётся открытым, пока новая страница грузится в фоне;
               затем страница подменяется под меню, и меню уезжает влево */
            e.stopPropagation();
            if (window.__mmGo) window.__mmGo(url.href);
            else location.href = url.href;
            return;
        }
        /* запасной вариант для браузеров без View Transitions */
        e.stopPropagation();
        d.classList.add('page-leaving');
        setTimeout(function () { location.href = url.href; }, DELAY);
    }, true);

    /* возврат кнопкой «назад» из кэша браузера */
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) d.classList.remove('page-leaving');
    });
})();

(function () {
    var nav = document.querySelector('.header__nav');
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-links-link'));
    if (!links.length) return;

    var d = document.documentElement;
    var logo = nav.querySelector('img');
    var ICON = '<svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true"><g stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M2 3h24M2 10h16M2 17h22"/></g></svg>';
    var STAR = '<svg viewBox="0 0 100 100"><polygon fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" points="50,4 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38"/></svg>';

    /* Кнопка-бургер (слева от логотипа) */
    var burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'mm-burger';
    burger.setAttribute('aria-label', 'Открыть меню');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'mm');
    burger.innerHTML = ICON;
    nav.insertBefore(burger, nav.firstChild);

    /* Само меню */
    var mm = document.createElement('div');
    mm.className = 'mm';
    mm.id = 'mm';
    mm.setAttribute('aria-hidden', 'true');

    var top = document.createElement('div');
    top.className = 'mm__top';
    var img = document.createElement('img');
    img.className = 'mm__logo';
    img.alt = 'Резонанс';
    if (logo) img.src = logo.getAttribute('src');
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mm-burger mm__close';
    closeBtn.setAttribute('aria-label', 'Закрыть меню');
    closeBtn.innerHTML = ICON;
    top.appendChild(img);
    top.appendChild(closeBtn);

    var ul = document.createElement('ul');
    ul.className = 'mm__list';
    /* Определяем текущую страницу */
    function norm(path) {
        path = path.replace(/index\.html?$/i, '').replace(/\/+$/, '');
        return path || '/';
    }
    var here = norm(location.pathname);
    var curPath = location.pathname + location.search;
    var spaUsed = false;
    function isCurrent(a) {
        var href = a.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#') return false;
        try {
            var u = new URL(href, location.href);
            if (u.hash) return false; /* ссылки-якоря («О проекте») не подсвечиваем */
            return norm(u.pathname) === here;
        }
        catch (e) { return false; }
    }

    var mmLinks = [];
    links.forEach(function (a, i) {
        var li = document.createElement('li');
        li.style.setProperty('--i', i);
        var l = document.createElement('a');
        l.className = 'mm__link';
        l.href = a.getAttribute('href');
        l.textContent = a.textContent.trim();
        mmLinks.push({ a: a, l: l });
        if (isCurrent(a)) {
            l.classList.add('is-current');
            l.setAttribute('aria-current', 'page');
        }
        li.appendChild(l);
        ul.appendChild(li);
    });
    mm.appendChild(top);
    mm.appendChild(ul);
    document.body.appendChild(mm);

    /* Летящие звёздочки */
    [
        { s: 52, c: '#ff7a2f', y0: '8vh',  y1: '58vh', d: '0s',   spin: '720deg' },
        { s: 40, c: '#ffa45e', y0: '22vh', y1: '70vh', d: '.06s', spin: '-540deg' },
        { s: 34, c: '#ffd08f', y0: '4vh',  y1: '44vh', d: '.12s', spin: '480deg' },
        { s: 46, c: '#ff7a2f', y0: '40vh', y1: '86vh', d: '.10s', spin: '-680deg' },
        { s: 30, c: '#e0341f', y0: '30vh', y1: '62vh', d: '.18s', spin: '600deg' },
        { s: 38, c: '#ffa45e', y0: '62vh', y1: '92vh', d: '.14s', spin: '-420deg' }
    ].forEach(function (o) {
        var st = document.createElement('div');
        st.className = 'mm-star';
        st.setAttribute('aria-hidden', 'true');
        st.style.cssText = '--s:' + o.s + 'px;--c:' + o.c + ';--y0:' + o.y0 + ';--y1:' + o.y1 + ';--d:' + o.d + ';--spin:' + o.spin;
        st.innerHTML = '<div class="mm-star__y">' + STAR + '</div>';
        document.body.appendChild(st);
    });

    /* ---------- Мягкий переход: страница грузится, пока меню закрыто/закрывается ---------- */
    function updateCurrent() {
        here = norm(location.pathname);
        mmLinks.forEach(function (o) {
            var c = isCurrent(o.a);
            o.l.classList.toggle('is-current', c);
            if (c) o.l.setAttribute('aria-current', 'page'); else o.l.removeAttribute('aria-current');
        });
    }

    function syncStyles(doc, base) {
        var cur = Array.prototype.slice.call(document.querySelectorAll('link[rel~="stylesheet"]'));
        var want = Array.prototype.slice.call(doc.querySelectorAll('link[rel~="stylesheet"]'));
        var have = {}, wanted = {}, waits = [];
        cur.forEach(function (l) { have[l.href] = l; });
        var anchor = null;
        cur.forEach(function (l) { if (!anchor && /mobile\.css/.test(l.href)) anchor = l; });
        want.forEach(function (w) {
            var abs = new URL(w.getAttribute('href'), base).href;
            wanted[abs] = true;
            if (have[abs]) return;
            var n = document.createElement('link');
            n.rel = 'stylesheet';
            n.href = abs;
            waits.push(new Promise(function (res) { n.onload = n.onerror = res; }));
            if (anchor) anchor.parentNode.insertBefore(n, anchor); else document.head.appendChild(n);
        });
        return {
            ready: Promise.all(waits),
            cleanup: function () { cur.forEach(function (l) { if (!wanted[l.href]) l.parentNode && l.parentNode.removeChild(l); }); }
        };
    }

    function swapPage(doc, url) {
        var styles = syncStyles(doc, url);
        return styles.ready.then(function () {
            history.pushState({ mm: 1 }, '', url);
            spaUsed = true;
            curPath = location.pathname + location.search;
            document.title = doc.title || document.title;
            document.body.className = doc.body.className;

            var frag = document.createDocumentFragment();
            Array.prototype.slice.call(doc.body.childNodes).forEach(function (n) {
                frag.appendChild(document.importNode(n, true));
            });
            Array.prototype.slice.call(frag.querySelectorAll('script')).forEach(function (sc) { sc.parentNode.removeChild(sc); });

            Array.prototype.slice.call(document.body.childNodes).forEach(function (n) {
                if (n === mm || (n.classList && n.classList.contains('mm-star'))) return;
                n.parentNode.removeChild(n);
            });
            document.body.insertBefore(frag, mm);
            styles.cleanup();

            /* бургер — в новую шапку */
            nav = document.querySelector('.header__nav');
            if (nav) nav.insertBefore(burger, nav.firstChild);

            /* скрипты новой страницы (кроме самого меню) */
            Array.prototype.slice.call(doc.body.querySelectorAll('script')).forEach(function (old) {
                if (old.src && /mobile-menu\.js/.test(old.src)) return;
                var sc = document.createElement('script');
                Array.prototype.slice.call(old.attributes).forEach(function (at) { sc.setAttribute(at.name, at.value); });
                sc.async = false;
                if (!old.src) sc.textContent = old.textContent;
                document.body.appendChild(sc);
            });

            var target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
            window.scrollTo(0, target ? target.getBoundingClientRect().top + window.pageYOffset : 0);
            initReviews();
            updateCurrent();
        });
    }

    window.__mmGo = function (href) {
        var url = new URL(href, location.href);
        var fallback = function () { location.href = url.href; };
        var hard = setTimeout(fallback, 3000); /* слишком долго — обычный переход */
        var minWait = new Promise(function (res) { setTimeout(res, 140); }); /* успеть показать нажатие */

        fetch(url.href, { credentials: 'same-origin' })
            .then(function (r) {
                var ct = r.headers.get('content-type') || '';
                if (!r.ok || ct.indexOf('text/html') === -1) throw new Error('not html');
                return r.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                return minWait.then(function () { return swapPage(doc, url); });
            })
            .then(function () {
                clearTimeout(hard);
                /* страница уже готова под меню — теперь меню уезжает влево */
                requestAnimationFrame(function () { setOpen(false); });
            })
            .catch(function () { clearTimeout(hard); fallback(); });
    };

    window.addEventListener('popstate', function () {
        if (spaUsed && (location.pathname + location.search) !== curPath) location.reload();
    });

    /* ---------- Страница «Отзывы»: карусель со стрелками и точками ---------- */
    var rvState = null;
    function initReviews() {
        var grid = document.querySelector('.rv-grid');
        rvState = null;
        if (!grid) return;
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.rv-card'));
        if (!cards.length) return;

        var nav = document.createElement('div');
        nav.className = 'rv-nav';
        var CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
        var CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
        var prev = document.createElement('button');
        prev.type = 'button'; prev.className = 'rv-arrow'; prev.setAttribute('aria-label', 'Предыдущий отзыв'); prev.innerHTML = CHEV_L;
        var next = document.createElement('button');
        next.type = 'button'; next.className = 'rv-arrow'; next.setAttribute('aria-label', 'Следующий отзыв'); next.innerHTML = CHEV_R;
        var dotsBox = document.createElement('div');
        dotsBox.className = 'rv-dots';
        var dots = cards.map(function (c, i) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'rv-dot'; b.setAttribute('aria-label', 'Отзыв ' + (i + 1));
            b.addEventListener('click', function () { go(i); });
            dotsBox.appendChild(b);
            return b;
        });
        nav.appendChild(prev); nav.appendChild(dotsBox); nav.appendChild(next);
        grid.parentNode.insertBefore(nav, grid.nextSibling);
        grid.classList.add('rv-js');

        var idx = -1, ticking = false;
        function go(i) {
            i = Math.max(0, Math.min(cards.length - 1, i));
            var c = cards[i];
            grid.scrollTo({ left: c.offsetLeft - (grid.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
        }
        function update() {
            var mid = grid.scrollLeft + grid.clientWidth / 2, best = 0, bd = 1e9;
            cards.forEach(function (c, i) {
                var dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
                if (dist < bd) { bd = dist; best = i; }
            });
            if (best === idx) return;
            idx = best;
            cards.forEach(function (c, i) { c.classList.toggle('is-active', i === best); });
            dots.forEach(function (b, i) { b.classList.toggle('is-active', i === best); });
            prev.disabled = best === 0;
            next.disabled = best === cards.length - 1;
        }
        prev.addEventListener('click', function () { go(idx - 1); });
        next.addEventListener('click', function () { go(idx + 1); });
        grid.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () { ticking = false; update(); });
        }, { passive: true });

        rvState = { update: function () { idx = -1; update(); } };
        update();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (rvState) rvState.update(); });
        window.addEventListener('load', function () { if (rvState) rvState.update(); });
    }
    window.addEventListener('resize', function () { if (rvState) rvState.update(); });

    function setOpen(open) {
        d.classList.toggle('mm-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        mm.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (open) closeBtn.focus({ preventScroll: true });
    }

    burger.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); burger.focus({ preventScroll: true }); });
    mm.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('.mm__link')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && d.classList.contains('mm-open')) setOpen(false);
    });
    var mq = window.matchMedia('(min-width: 769px)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);

    /* чтобы :active работал на iOS */
    document.addEventListener('touchstart', function () {}, { passive: true });

    initReviews();

    d.classList.add('mm-ready');
})();