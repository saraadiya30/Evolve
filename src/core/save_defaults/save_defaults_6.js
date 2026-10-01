// Bagian 6/8 dari penyesuaian save lama ke struktur terbaru (dulu satu blok panjang di vars.js).
// Dijalankan berurutan oleh vars.js saat load; urutan pemanggilan harus dipertahankan.

// Dependensi dari core/vars.js dikirim sebagai parameter (bukan di-import) supaya modul ini tidak bergantung balik ke vars.js.
export function applySaveDefaults6({ global }){
    if (!global['galaxy']){
        global['galaxy'] = {};
    }

    if (!global['eden']){
        global['eden'] = {};
    }

    if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Bolognium']){
        global.interstellar.mass_ejector['Bolognium'] = 0;
    }
    if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Vitreloy']){
        global.interstellar.mass_ejector['Vitreloy'] = 0;
    }
    if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Orichalcum']){
        global.interstellar.mass_ejector['Orichalcum'] = 0;
    }
    if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Nanoweave']){
        global.interstellar.mass_ejector['Nanoweave'] = 0;
    }
    if (global.interstellar['mass_ejector'] && !global.interstellar.mass_ejector['Scarletite']){
        global.interstellar.mass_ejector['Scarletite'] = 0;
    }

    if (!global.hasOwnProperty('pillars')){
        global['pillars'] = {};
    }

    if (!global.settings.space['alpha']){
        global.settings.space['alpha'] = false;
        global.settings.space['proxima'] = false;
        global.settings.space['nebula'] = false;
        global.settings.space['neutron'] = false;
        global.settings.space['blackhole'] = false;
    }

    if (!global.settings['showAchieve']){
        global.settings['showAchieve'] = false;
    }
    if (!global.settings['locale']){
        global.settings['locale'] = 'en-US';
    }
    if (typeof global.settings.pause === 'undefined'){
        global.settings['pause'] = false;
    }
    if (typeof global.settings.mKeys === 'undefined'){
        global.settings['mKeys'] = true;
    }
    if (typeof global.settings.keyMap === 'undefined'){
        global.settings['keyMap'] = {
            x10: 'Control', //17
            x25: 'Shift', //16
            x100: 'Alt', //18
            q: 'q', //81
        };
    }
    if (typeof global.settings.keyMap.showCiv === 'undefined'){
        global.settings.keyMap['showCiv'] = '1'; // 49
        global.settings.keyMap['showCivic'] = '2'; // 50
        global.settings.keyMap['showResearch'] = '3'; // 51
        global.settings.keyMap['showResources'] = '4'; // 52
        global.settings.keyMap['showGenetics'] = '5'; // 53
        global.settings.keyMap['showMisc'] = '6'; // 54
        global.settings.keyMap['showAchieve'] = '7'; // 55
        global.settings.keyMap['settings'] = '8'; // 56
    }
    // Migration for saves made before the Misc tab existed: showAchieve/settings shift down to make room for it,
    // same as the fresh-save defaults above.
    if (typeof global.settings.keyMap.showMisc === 'undefined'){
        global.settings.keyMap['showMisc'] = '6';
        global.settings.keyMap['showAchieve'] = '7';
        global.settings.keyMap['settings'] = '8';
    }
    delete global.settings.keyMap['d'];
    if (typeof global.settings.qAny === 'undefined'){
        global.settings['qAny'] = false;
    }
    if (typeof global.settings.sPackOn === 'undefined'){
        global.settings['sPackOn'] = true;
    }
    if (typeof global.settings.qAny_res === 'undefined'){
        global.settings['qAny_res'] = false;
    }
    if (typeof global.settings.sPackMsg === 'undefined'){
        global.settings['sPackMsg'] = false;
    }
    if (typeof global.settings.expose === 'undefined'){
        global.settings['expose'] = false;
    }
    if (typeof global.settings.alwaysPower === 'undefined'){
        global.settings['alwaysPower'] = false;
    }
    if (typeof global.settings.tabLoad === 'undefined'){
        global.settings['tabLoad'] = false;
    }
    if (typeof global.settings.boring === 'undefined'){
        global.settings['boring'] = false;
    }
    if (!global.settings.hasOwnProperty('mtorder')){
        global.settings['mtorder'] = [];
    }
    if (!global.settings.hasOwnProperty('resBar')){
        global.settings['resBar'] = {};
    }
}
