import { global, save, webWorker } from './vars.js';
import { loc } from './locale.js';
import { vBind, flib, gameLoop, popover } from './functions.js';
import { races } from './races.js';
import { loadTab_s1, loadTab_s2, loadTab_s3 } from './sec_loadTab_1.js';
import { index_s1, index_s2 } from './sec_index_1.js';

export function mainVue(){
    vBind({
        el: '#mainColumn div:first-child',
        data: {
            s: global.settings
        },
        methods: {
            swapTab(tab){
                if (!global.settings.tabLoad){
                    loadTab(tab);
                }
                return tab;
            },
            showMiscTab(){
                return global.race.species !== 'protoplasm';
            },
            saveImport(){
                if ($('#importExport').val().length > 0){
                    importGame($('#importExport').val());
                }
            },
            saveExport(){
                $('#importExport').val(window.exportGame());
                $('#importExport').select();
                document.execCommand('copy');
            },
            saveExportFile(){
                const downloadToFile = (content, filename, contentType) => {
                    const a = document.createElement('a');
                    const file = new Blob([content], {type: contentType});
                    a.href= URL.createObjectURL(file);
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(a.href);
                };
                const date = new Date();
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toFixed(0).padStart(2, '0');
                const day = date.getDate().toFixed(0).padStart(2, '0');
                const hour = date.getHours().toFixed(0).padStart(2, '0');
                const minute = date.getMinutes().toFixed(0).padStart(2, '0');
                downloadToFile(window.exportGame(), `evolve-${year}-${month}-${day}-${hour}-${minute}.txt`, 'text/plain');
            },
            importStringFile(){ 
                let file = document.getElementById("stringPackFile").files[0];
                if (file) {
                    let reader = new FileReader();
                    let fileName = document.getElementById("stringPackFile").files[0].name;
                    reader.readAsText(file, "UTF-8");
                    reader.onload = function (evt) {
                        try {
                            JSON.parse(evt.target.result);
                        }
                        catch {
                            global.settings.sPackMsg = loc(`string_pack_error`,[fileName]);
                            return;
                        }
                       
                        global.settings.sPackMsg = loc(`string_pack_using`,[fileName]);
                        save.setItem('string_pack_name',fileName); save.setItem('string_pack',LZString.compressToUTF16(evt.target.result));
                        if (global.settings.sPackOn){
                            global.queue.rename = true;
                            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                            if (webWorker.w){
                                webWorker.w.terminate();
                            }
                            window.location.reload();
                        }
                       
                    }
                    reader.onerror = function (evt) {
                        console.error("error reading file");
                    }
                }
            },
            clearStringFile(){
                if (save.getItem('string_pack')){
                    global.settings.sPackMsg = loc(`string_pack_none`);
                    save.removeItem('string_pack_name');
                    save.removeItem('string_pack');
                    if (global.settings.sPackOn){
                        global.queue.rename = true;
                        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                        if (webWorker.w){
                            webWorker.w.terminate();
                        }
                        window.location.reload();
                    }
                }
            },
            stringPackOn(){
                if (save.getItem('string_pack')){
                    global.queue.rename = true;
                    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                    if (webWorker.w){
                        webWorker.w.terminate();
                    }
                    window.location.reload();
                }
            },
            restoreGame(){
                let restore_data = save.getItem('evolveBak') || false;
                this.$buefy.dialog.confirm({
                    title: loc('restore'),
                    message: loc('restore_warning'),
                    ariaModal: true,
                    confirmText: loc('restore'),
                    onConfirm() {
                        if (restore_data){
                            importGame(restore_data,true);
                        }
                    }
                });
            },
            lChange(locale){
                global.settings.locale = locale;
                global.queue.rename = true;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            setTheme(theme){
                global.settings.theme = theme;
                $('html').removeClass();
                $('html').addClass(theme);
                $('html').addClass(global.settings.font);
            },
            numNotation(notation){
                global.settings.affix = notation;
            },
            setQueueStyle(style){
                global.settings.queuestyle = style;
                updateQueueStyle();
            },
            setQueueResize(mode) {
                global.settings.q_resize = mode;
            },
            icon(icon){
                global.settings.icon = icon;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            remove(index){
                global.r_queue.queue.splice(index,1);
            },
            font(f){
                global.settings.font = f;
                $(`html`).removeClass('standard');
                $(`html`).removeClass('large_log');
                $(`html`).removeClass('large_all');
                $('html').addClass(f);
            },
            q_merge(merge){
                global.settings.q_merge = merge;
            },
            toggleTabLoad(){
                initTabs();
            },
            unpause(){
                $(`#pausegame`).removeClass('play');
                $(`#pausegame`).removeClass('pause');
                if (global.settings.pause){
                    $(`#pausegame`).addClass('pause');
                }
                else {
                    $(`#pausegame`).addClass('play');
                }
                if (!global.settings.pause && !webWorker.s){
                    gameLoop('start');
                }
            }
        },
        filters: {
            namecase(name){
                return name.replace(/(?:^|\s)\w/g, function(match) {
                    return match.toUpperCase();
                });
            },
            label(lbl){
                return tabLabel(lbl);
            },
            sPack(){
                return global.settings.sPackMsg;
            },
            notation(n){
                switch (n){
                    case 'si':
                        return loc(`metric`);
                    case 'sci':
                        return loc(`scientific`);
                    case 'eng':
                        return loc(`engineering`);
                    case 'sln':
                        return loc(`sln`);
                }
            }
        }
    });

    ['1','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'].forEach(function(k){
        popover(`settings${k}`, function(){
                return loc(`settings${k}`);
            },
            {
                elm: `#settings span.settings${k}`
            }
        );
    });

    let example = `<div class="example">{
  "year": "Galactic Standard Year",
  "resource_Food_name": "Nom Noms"
}</div>`;

    popover(`stringPack`, function(){
            return loc(`string_example`,[example]);
        }
    );
}

export function tabLabel(lbl){
    switch (lbl){
        case 'city':
            if (global.resource[global.race.species]){
                if (global.resource[global.race.species].amount <= 5){
                    return loc('tab_city1');
                }
                else if (global.resource[global.race.species].amount <= 20){
                    return loc('tab_city2');
                }
                else if (global.resource[global.race.species].amount <= 75){
                    return loc('tab_city3');
                }
                else if (global.resource[global.race.species].amount <= 250){
                    return loc('tab_city4');
                }
                else if (global.resource[global.race.species].amount <= 600){
                    return loc('tab_city5');
                }
                else if (global.resource[global.race.species].amount <= 1200){
                    return loc('tab_city6');
                }
                else if (global.resource[global.race.species].amount <= 2500){
                    return loc('tab_city7');
                }
                else {
                    return loc('tab_city8');
                }
            }
            else {
                return loc('tab_city1');
            }
        case 'local_space':
            return loc('sol_system',[global.race['truepath'] ? races[global.race.species].home : flib('name')]);
        case 'outer_local_space':
            return loc('outer_sol_system',[global.race['truepath'] ? races[global.race.species].home : flib('name')])
        case 'old':
            return loc('tab_old_res');
        case 'new':
            return loc('tab_new_res');
        case 'old_sr':
            return loc('tab_old_sr_res');
        case 'new_sr':
            return loc('tab_new_sr_res');
        case 'tab_mech':
            return global.race['warlord'] ? loc('tab_artificer')  : loc(lbl);
        default:
            return loc(lbl);
    }
}

function updateQueueStyle(){
    const buildingQueue = $('#buildQueue');
    ['standardqueuestyle', 'listqueuestyle', 'bulletlistqueuestyle', 'numberedlistqueuestyle']
        .forEach(qstyle => {
            if (global.settings.queuestyle === qstyle) {
                buildingQueue.addClass(qstyle);
            } else {
                buildingQueue.removeClass(qstyle);
            }
        });
}

export function initTabs(){
    if (global.settings.tabLoad){
        loadTab(`mTabCivil`);
        loadTab(`mTabCivic`);
        loadTab(`mTabResearch`);
        loadTab(`mTabResource`);
        loadTab(`mTabArpa`);
        loadTab(`mTabMisc`);
        loadTab(`mTabStats`);
        loadTab(`mTabObserve`);
    }
    else {
        loadTab(global.settings.civTabs);
    }
}

export function loadTab(tab){
    const $ctx = {};
    $ctx.tab = tab;
    loadTab_s1($ctx);
        loadTab_s2($ctx);
        loadTab_s3($ctx);
}

export function index(){
    const $ctx = {};
    index_s1($ctx);
        index_s2($ctx);
}
