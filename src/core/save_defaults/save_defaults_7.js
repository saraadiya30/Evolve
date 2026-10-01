// Bagian 7/8 dari penyesuaian save lama ke struktur terbaru (dulu satu blok panjang di vars.js).
// Dijalankan berurutan oleh vars.js saat load; urutan pemanggilan harus dipertahankan.

// Dependensi dari core/vars.js dikirim sebagai parameter (bukan di-import) supaya modul ini tidak bergantung balik ke vars.js.
export function applySaveDefaults7({ global }){
    if (!global.race['seeded']){
        global.race['seeded'] = false;
    }
    if (!global.race['deterioration']){
        global.race['deterioration'] = 0;
    }
    if (!global.race['gene_fortify']){
        global.race['gene_fortify'] = 0;
    }

    if (!global.race['old_gods']){
        global.race['old_gods'] = 'none';
    }
    if (!global.race['universe']){
        global.race['universe'] = 'standard';
    }

    if (!global.genes['minor']){
        global.genes['minor'] = {};
    }
    if (!global.race['minor']){
        global.race['minor'] = {};
    }

    if (!global.hasOwnProperty('govern')){
        global['govern'] = {
            governor: {},
            candidate: [],
            policy: {}
        };
    }

    if (!global.settings.hasOwnProperty('showMil')){
        global.settings['showMil'] = true;
    }
    if (!global.settings.hasOwnProperty('showPowerGrid')){
        global.settings['showPowerGrid'] = global.hasOwnProperty('tech') && global.tech.hasOwnProperty('high_tech') && global.tech.high_tech >= 2 ? true : false;
    }

    if (!global.settings['affix'] || global.settings['affix'] === 'si'){
        // Notasi SI (K M G T P ...) sudah dihapus; save lama otomatis pindah ke single letter
        global.settings['affix'] = 'sln';
    }

    if (!global['special']){
        global['special'] = {};
    }
    if (!global.special['gift']){
        global.special['gift'] = {};
    }
    if (!global.special.hasOwnProperty('egg')){
        global.special['egg'] = {};
    }

    if (!global.special.hasOwnProperty('trick')){
        global.special['trick'] = {
            trick1: false,
            trick2: false,
            trick3: false,
            trick4: false,
            trick5: false,
            trick6: false,
            trick7: false,
            trick8: false,
            trick9: false,
            trick10: false,
            trick11: false,
            trick12: false
        };
    }

    if (!global.civic['govern']){
        global.civic['govern'] = {
            type: 'oligarchy',
            rev: 2000,
            fr: 0,
        };
    }
    global.civic.govern.fr = 0;

    if (!global.hasOwnProperty('custom')){
        global['custom'] = {};
    }
    if (global.custom.hasOwnProperty('planet') && global.custom.planet.hasOwnProperty('biome')){
        delete global.custom.planet;
    }

    if (global.city.hasOwnProperty('smelter') && !global.city.smelter.hasOwnProperty('cap')){
        global.city.smelter['cap'] = 0;
    }

    if (!global.civic['homeless']){
        global.civic.homeless = 0;
    }

    if (!global.civic['foreign']){
        global.civic['foreign'] = {
            gov0: {
                unrest: 0,
                hstl: 100,
                mil: 100,
                eco: 75,
                spy: 0,
                esp: 0,
                trn: 0,
                sab: 0,
                act: 'none',
                occ: false,
                anx: false,
                buy: false
            },
            gov1: {
                unrest: 0,
                hstl: 0,
                mil: 150,
                eco: 100,
                spy: 0,
                esp: 0,
                trn: 0,
                sab: 0,
                act: 'none',
                occ: false,
                anx: false,
                buy: false
            },
            gov2: {
                unrest: 0,
                hstl: 50,
                mil: 250,
                eco: 150,
                spy: 0,
                esp: 0,
                trn: 0,
                sab: 0,
                act: 'none',
                occ: false,
                anx: false,
                buy: false
            }
        };
    }

    if (typeof global.civic.foreign.gov0['trn'] === "undefined"){
        global.civic.foreign.gov0['trn'] = 0;
        global.civic.foreign.gov1['trn'] = 0;
        global.civic.foreign.gov2['trn'] = 0;
        global.civic.foreign.gov0['sab'] = 0;
        global.civic.foreign.gov1['sab'] = 0;
        global.civic.foreign.gov2['sab'] = 0;
        global.civic.foreign.gov0['act'] = 'none';
        global.civic.foreign.gov1['act'] = 'none';
        global.civic.foreign.gov2['act'] = 'none';
    }

    if (typeof global.civic.foreign.gov0['name'] !== "undefined" && global.civic.foreign.gov0.name.s1 === 'evo_organism_title'){
        global.civic.foreign.gov0.name.s1 = 'Northern';
    }
    if (typeof global.civic.foreign.gov1['name'] !== "undefined" && global.civic.foreign.gov1.name.s1 === 'evo_organism_title'){
        global.civic.foreign.gov1.name.s1 = 'Southern';
    }
    if (typeof global.civic.foreign.gov2['name'] !== "undefined" && global.civic.foreign.gov2.name.s1 === 'evo_organism_title'){
        global.civic.foreign.gov2.name.s1 = 'Divine';
    }

    {
        if (global.hasOwnProperty('special') && global.special.hasOwnProperty('gift')){
            const sdate = new Date(global.stats.start);
            const cdate = new Date();
            Object.keys(global.special.gift).forEach(function(gy){
                let year = Number(gy.substring(1,5));
                if ((year < sdate.getFullYear()) || (cdate.getFullYear() < year) || (cdate.getFullYear() === year && cdate.getMonth() !== 11)){
                    delete global.special.gift[gy];
                }
            });
        }
    }

    if (!global.settings['queuestyle']){
        global.settings['queuestyle'] = 'standardqueuestyle';
    }

    if (!global.settings['q_resize']){
        global.settings.q_resize = 'auto';
    }

    $('html').addClass(global.settings.theme);
    $('html').addClass(global.settings.queuestyle);

    if (!global.settings['at']){
        global.settings['at'] = 0;
    }

    if (!global.city['morale']){
        global.city['morale'] = {
            current: 0,
            cap: 0,
            potential: 0,
            unemployed: 0,
            stress: 0,
            entertain: 0,
            leadership: 0,
            season: 0,
            weather: 0,
            warmonger: 0,
            rev: 0
        };
    }

    if (!global.city['sun']){
        global.city['sun'] = 0;
    }
    if (!global.city['cold']){
        global.city['cold'] = 0;
    }
    if (!global.city['hot']){
        global.city['hot'] = 0;
    }

    [
        'unemployed','leadership','warmonger','rev','tax','shrine','blood_thirst',
        'broadcast','vr','zoo','bliss_den','restaurant','cap','potential'
    ].forEach(function(k){
        if (!global.city.morale.hasOwnProperty(k)){
            global.city.morale[k] = 0;
        }
    });

    if (!global.city['calendar']){
        global.city['calendar'] = {
            day: 0,
            year: 0,
            season: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: 365
        };
    }

    if (!global.city.calendar['season']){
        global.city.calendar['season'] = 0;
    }

    if (!global.city.calendar['moon']){
        global.city.calendar['moon'] = 0;
    }

    if (!global.city.calendar['wind']){
        global.city.calendar['wind'] = 0;
    }

    if (!global.city['powered']){
        global.city['powered'] = false;
        global.city['power'] = 0;
    }

    if (!global.city['biome']){
        global.city['biome'] = 'grassland';
    }

    if (!global.city['geology']){
        global.city['geology'] = {};
    }
}
