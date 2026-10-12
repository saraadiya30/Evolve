import { loc } from '../../core/locale.js';

// Navigasi bawah untuk layar sempit (CSS menyembunyikannya di desktop).
// Tiga tujuan sesuai pola bottom tab bar (3-5 item): Game, Resources, Log.
const ICONS = {
    game: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
    res: `<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>`,
    log: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`
};

function navItem(view, label, active){
    return `<button type="button" class="mobItem${active ? ' is-active' : ''}" data-view="${view}" aria-pressed="${active}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[view]}</svg>
        <span>${label}</span>
    </button>`;
}

export function initMobileNav(){
    $('body').attr('data-mview','game');
    $('body').append(`<nav id="mobileNav" class="mobileNav promoBar" aria-label="${loc('mobile_nav_label')}">
        ${navItem('game', loc('mobile_nav_game'), true)}
        ${navItem('res', loc('tab_resources'), false)}
        ${navItem('log', loc('message_log'), false)}
    </nav>`);

    // Posisi scroll diingat per tampilan, jadi kembali ke daftar resource tidak mulai dari atas.
    const scrollPos = { game: 0, res: 0, log: 0 };
    $('#mobileNav').on('click','.mobItem',function(){
        const next = $(this).data('view');
        const prev = $('body').attr('data-mview');
        if (next === prev){
            window.scrollTo(0,0);
            return;
        }
        scrollPos[prev] = window.scrollY;
        $('body').attr('data-mview',next);
        $('#mobileNav .mobItem').removeClass('is-active').attr('aria-pressed','false');
        $(this).addClass('is-active').attr('aria-pressed','true');
        window.scrollTo(0,scrollPos[next]);
    });

    // Tab utama bisa digeser; tab yang aktif selalu digulir ke tengah supaya kelihatan.
    const centerActiveTab = function(){
        const nav = document.querySelector('#mainTabs > nav.tabs');
        const active = nav && nav.querySelector('li.is-active');
        if (nav && active){
            nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
        }
    };
    $(document).on('click','#mainTabs > nav.tabs li',function(){
        setTimeout(centerActiveTab,60);
    });
    const waitTabs = setInterval(function(){
        if (document.querySelector('#mainTabs > nav.tabs li.is-active')){
            clearInterval(waitTabs);
            centerActiveTab();
        }
    },300);

    // Tinggi top bar berubah-ubah (bisa 1-2 baris); tab utama menempel tepat di bawahnya.
    const topBar = document.getElementById('topBar');
    if (topBar && 'ResizeObserver' in window){
        new ResizeObserver(function(){
            document.documentElement.style.setProperty('--topbar-h',`${topBar.offsetHeight}px`);
        }).observe(topBar);
    }
}
