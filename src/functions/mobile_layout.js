// Penentu layout mobile. Tidak mengimpor apa pun supaya aman dipakai dari modul mana saja.
// Kondisinya harus sama dengan @mobile-query di src/mobile.less:
// ponsel potret (lebar <= 768px) atau ponsel landscape (layar pendek + pointer sentuh).
export const MOBILE_QUERY = '(max-width: 768px), (max-height: 500px) and (pointer: coarse)';

export function isMobileLayout(){
    // Lingkungan tanpa matchMedia (mis. jsdom pada test) dianggap desktop.
    return typeof window.matchMedia === 'function' && window.matchMedia(MOBILE_QUERY).matches;
}
