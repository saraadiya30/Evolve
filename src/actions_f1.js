import { clearElement } from './functions.js';
import { global } from './vars.js';
import { actions } from './actions_registry.js';
import { removeAction, challengeGeneHeader, challengeActionHeader, scenarioActionHeader, exitSimulation, configSimulation } from './actions_f6.js';
import { evoProgress } from './actions_f7.js';
import { addAction } from './actions_f4.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function setChallengeScreen(){
    let list = $(`#evolution .evolving`).nextAll();
    Object.values(list).forEach(function(elm){
        clearElement($(elm),true);
    });
    clearElement($(`#evolution .evolving`),true);
    global.evolution['bunker'] = { count: 1 };
    removeAction(actions.evolution.bunker.id);
    evoProgress();
    if (global.race['truepath'] || global.race['lone_survivor']){
        global.evolution['nerfed'] = { count: 0 };
        global.evolution['badgenes'] = { count: 0 };
    }
    else {
        if (global.race.universe === 'antimatter'){
            global.evolution['mastery'] = { count: 0 };
        }
        else {
            global.evolution['plasmid'] = { count: 0 };
        }
        global.evolution['crispr'] = { count: 0 };
    }
    global.evolution['trade'] = { count: 0 };
    global.evolution['craft'] = { count: 0 };
    global.evolution['junker'] = { count: 0 };
    global.evolution['joyless'] = { count: 0 };
    global.evolution['steelen'] = { count: 0 };
    if (global.stats.achieve['whitehole'] || global['sim']){
        global.evolution['decay'] = { count: 0 };
    }
    if (global.stats.achieve['ascended'] || global['sim']){
        global.evolution['emfield'] = { count: 0 };
    }
    if (global.stats.achieve['scrooge'] || global['sim']){
        global.evolution['inflation'] = { count: 0 };
    }
    if (global.stats.achieve['shaken'] || global['sim']){
        global.evolution['cataclysm'] = { count: 0 };
    }
    if (global.stats.achieve['whitehole'] || global.stats.achieve['ascended'] || global['sim']){
        global.evolution['banana'] = { count: 0 };
        global.evolution['orbit_decay'] = { count: 0 };
    }
    if (global.race.universe === 'standard' && (global.stats.achieve['whitehole'] || global['sim'])){
        //global.evolution['nonstandard'] = { count: 0 };
    }
    if (global.race.universe === 'heavy' && ((global.stats.achieve['seeder'] && global.stats.achieve.seeder['h']) || global['sim'])){
        global.evolution['gravity_well'] = { count: 0 };
    }
    if (global.race.universe === 'magic' && ((global.stats.achieve['ascended'] && global.stats.achieve.ascended['mg']) || global['sim'])){
        global.evolution['witch_hunter'] = { count: 0 };
    }
    if (global.race.universe === 'evil' && ((global.stats.achieve['godslayer'] && global.stats.achieve.godslayer['e']) || global['sim'])){
        global.evolution['warlord'] = { count: 0 };
    }
    if (global.stats.achieve['ascended'] || global.stats.achieve['corrupted'] || global['sim']){
        global.evolution['truepath'] = { count: 0 };
    }
    if ((global.stats.achieve['ascended'] || global.stats.achieve['corrupted']) && global.stats.achieve['extinct_junker'] || global['sim']){
        global.evolution['sludge'] = { count: 0 };
    }
    if (global.stats.achieve['godslayer'] && global.stats.achieve['extinct_sludge'] || global['sim']){
        global.evolution['ultra_sludge'] = { count: 0 };
    }
    if (global.stats.achieve['bluepill'] || global['sim']){
        global.evolution['simulation'] = { count: 0 };
    }
    if (global.stats.achieve['retired'] || global['sim']){
        global.evolution['lone_survivor'] = { count: 0 };
    }
    if(global.stats.achieve['corrupted'] || global['sim']){
        global.evolution['fasting'] = { count:0 };
    }
    challengeGeneHeader();
    if (global.race['truepath'] || global.race['lone_survivor']){
        addAction('evolution','nerfed');
    }
    else {
        if (global.race.universe === 'antimatter'){
            addAction('evolution','mastery');
        }
        else {
            addAction('evolution','plasmid');
        }
    }
    addAction('evolution','trade');
    addAction('evolution','craft');
    if (global.race['truepath'] || global.race['lone_survivor']){
        addAction('evolution','badgenes');
    }
    else {
        addAction('evolution','crispr');
    }
    challengeActionHeader();
    addAction('evolution','joyless');
    addAction('evolution','steelen');
    if (global.stats.achieve['whitehole'] || global['sim']){
        addAction('evolution','decay');
    }
    if (global.stats.achieve['ascended'] || global['sim']){
        addAction('evolution','emfield');
    }
    if (global.stats.achieve['scrooge'] || global['sim']){
        addAction('evolution','inflation');
    }
    if ((global.stats.achieve['ascended'] || global.stats.achieve['corrupted']) && global.stats.achieve['extinct_junker'] || global['sim']){
        addAction('evolution','sludge');
    }
    if (global.stats.achieve['godslayer'] && global.stats.achieve['extinct_sludge'] || global['sim']){
        addAction('evolution','ultra_sludge');
    }
    if (global.stats.achieve['whitehole'] || global.stats.achieve['ascended'] || global['sim']){
        addAction('evolution','orbit_decay');
    }
    if (global.race.universe === 'standard' && (global.stats.achieve['whitehole'] || global['sim'])){
        //addAction('evolution','nonstandard');
    }
    if (global.race.universe === 'heavy' && ((global.stats.achieve['seeder'] && global.stats.achieve.seeder['h']) || global['sim'])){
        addAction('evolution','gravity_well');
    }
    if (global.race.universe === 'magic' && ((global.stats.achieve['ascended'] && global.stats.achieve.ascended['mg']) || global['sim'])){
        addAction('evolution','witch_hunter');
    }
    if (global.hasOwnProperty('beta') && !global['sim']){
        addAction('evolution','simulation');
    }
    scenarioActionHeader();
    addAction('evolution','junker');
    if (global.stats.achieve['shaken'] || global['sim']){
        addAction('evolution','cataclysm');
    }
    if (global.stats.achieve['whitehole'] || global.stats.achieve['ascended'] || global['sim']){
        addAction('evolution','banana');
    }
    if (global.stats.achieve['ascended'] || global.stats.achieve['corrupted'] || global['sim']){
        addAction('evolution','truepath');
    }
    if (global.stats.achieve['retired'] || global['sim']){
        addAction('evolution','lone_survivor');
    }
    if(global.stats.achieve['corrupted'] || global['sim']){
        addAction('evolution','fasting');
    }
    if (global.race.universe === 'evil' && ((global.stats.achieve['godslayer'] && global.stats.achieve.godslayer['e']) || global['sim'])){
        addAction('evolution','warlord');
    }
    if (global['sim']){
        exitSimulation();
    }
    else if (global.race['simulation']){
        configSimulation();
    }

    if (global.race['warlord']){
        ['custom','hybrid','nano','sentience'].forEach(function(r){
            if ($(`#evolution-${r}`).length > 0){
                $(`#evolution-${r}`).addClass('disabled');
            }
        });
    }
    else {
        ['custom','hybrid','nano','sentience'].forEach(function(r){
            if ($(`#evolution-${r}`).length > 0 && $(`#evolution-${r}`).hasClass('disabled')){
                $(`#evolution-${r}`).removeClass('disabled');
            }
        });
    }
}
