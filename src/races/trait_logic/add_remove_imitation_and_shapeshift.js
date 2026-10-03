import { global, power_generated, save, webWorker } from '../../core/vars.js';
import { traits, races } from '../races_registry.js';
import { defineIndustry } from '../../industry/industry.js';
import { setJobName, jobScale } from '../../civics/jobs.js';
import { setResourceName, drawResourceTab } from '../../resources/resources.js';
import { removeFromRQueue, removeFromQueue, gameLoop, calc_mastery, clearElement, vBind } from '../../functions/functions.js';
import { loc } from '../../core/locale.js';
import { defineGovernor, removeTask } from '../../governor/governor.js';
import { initStruct, actions, drawCity, drawTech } from '../../actions/actions.js';
import { buildGarrison } from '../../civics/civics.js';
import { unlockAchieve } from '../../achievements/achieve.js';
import { arpa } from '../../arpa/arpa.js';
import { renderEdenic } from '../../edenic/edenic.js';
import { genus_def } from '../races.js';
import { purgeLumber, releaseResource, adjustFood, setPurgatory, checkPurgatory } from './racial_trait_and_purgatory_helpers.js';
import { basicRace, renderSupernatural, combineTraits, setTraitRank } from './ranks_fathom_and_skins.js';
import { renderPsychicPowers } from '../powers/major_wish_and_psychic_power_panel.js';

// Fungsi-fungsi dipindah dari races.js (urutan sumber dipertahankan). races.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function cleanAddTrait(trait){
    switch (trait){
        case 'high_pop':
            global.resource[global.race.species].amount = Math.round(global.resource[global.race.species].amount * traits.high_pop.vars()[0]);
            if (global.civic.hasOwnProperty('garrison')) {
                global.civic.garrison.workers = Math.round(global.civic.garrison.workers * traits.high_pop.vars()[0]);
            }
            break;
        case 'kindling_kindred':
            if (global.race['smoldering']){
                break;
            }
            purgeLumber();
            break;
        case 'smoldering':
            global.resource.Chrysotile.display = true;
            if (global.race['kindling_kindred']){
                break;
            }
            purgeLumber();
            break;
        case 'iron_wood':
            if (global.race['smoldering']){
                break;
            }
            releaseResource('Plywood');
            break;
        case 'forge':
            defineIndustry();
            break;
        case 'soul_eater':
            setJobName('lumberjack');
        case 'detritivore':
        case 'carnivore':
        case 'herbivore':
            adjustFood();
            break;
        case 'unfathomable':
            adjustFood();
            if (!global.city.hasOwnProperty('surfaceDwellers')){
                global.city['surfaceDwellers'] = [];
            }
            while (global.city.surfaceDwellers.length < traits.unfathomable.vars()[0]){
                global.city.surfaceDwellers.push(basicRace(global.city.surfaceDwellers));
            }
            if (global.city.surfaceDwellers.length > traits.unfathomable.vars()[0]){
                global.city.surfaceDwellers.length = traits.unfathomable.vars()[0];
            }
            if (global.race['psychic']){
                renderPsychicPowers();
            }
            break;
        case 'flier':
            setResourceName('Stone');
            setResourceName('Brick');
            global.resource.Cement.display = false;
            global.civic.cement_worker.display = false;
            global.civic.cement_worker.workers = 0;
            global.civic.cement_worker.assigned = 0;
            setPurgatory('tech','cement');
            setPurgatory('city','cement_plant');
            setPurgatory('eden','eden_cement');
            break;
        case 'sappy':
            if (global.civic.d_job === 'quarry_worker'){
                global.civic.d_job = global.race['carnivore'] || global.race['soul_eater'] ? 'hunter' : 'unemployed';
            }
            global.civic.quarry_worker.display = false;
            global.civic.quarry_worker.workers = 0;
            global.civic.quarry_worker.assigned = 0;
            setResourceName('Stone');
            setPurgatory('tech','hammer');
            setPurgatory('city','rock_quarry');
            break;
        case 'apex_predator':
            removeFromRQueue(['armor']);
            setPurgatory('tech','armor');
            break;
        case 'environmentalist':
            delete power_generated[loc('city_coal_power')];
            delete power_generated[loc('city_mana_engine')];
            delete power_generated[loc('city_oil_power')];
            break;
        case 'terrifying':
            Object.keys(global.resource).forEach(function (res){
                if (global.resource[res].hasOwnProperty('trade')){
                    global.resource[res].trade = 0;
                }
            });
            global.city.market.active = false;
            if (!global.galaxy?.freighter?.count){
                global.settings.showMarket = false;
                if (global.settings.marketTabs === 0) {
                    global.settings.marketTabs = 1;
                }
            }
            removeFromQueue(['city-trade']);
            removeFromRQueue(['trade']);
            setPurgatory('tech','trade');
            setPurgatory('city','trade');
            break;
        case 'slaver':
            checkPurgatory('tech','slaves');
            if (global.tech['slaves'] >= 1) {
                checkPurgatory('city','slave_pen',{ count: 0 });
                if (global.city['slave_pen'].count > 0 && !global.race['orbit_decayed']) {
                    global.resource.Slave.display = true;
                }
                if (global.tech['slaves'] >= 2) {
                    defineGovernor();
                }
            }
            break;
        case 'cannibalize':
            checkPurgatory('tech','sacrifice');
            if (global.tech['mining']) {
                initStruct(actions.city.s_alter);
                defineGovernor();
            }
            break;
        case 'magnificent':
            if (global.tech['theology'] >= 2) {
                checkPurgatory('city','shrine',actions.city.shrine.struct().d);
            }
            break;
        case 'unified':
            global.tech['world_control'] = 1;
            global.tech['unify'] = 2;
            buildGarrison($('#garrison'),true);
            buildGarrison($('#c_garrison'),false);
            for (let i=0; i<3; i++){
                if (global.civic.foreign[`gov${i}`].occ){
                    let occ_amount = jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
                    global.civic['garrison'].max += occ_amount;
                    global.civic['garrison'].workers += occ_amount;
                    global.civic.foreign[`gov${i}`].occ = false;
                }
                global.civic.foreign[`gov${i}`].buy = false;
                global.civic.foreign[`gov${i}`].anx = false;
                global.civic.foreign[`gov${i}`].sab = 0;
                global.civic.foreign[`gov${i}`].act = 'none';
            }
            removeTask('spy');
            removeTask('spyop');
            removeTask('combo_spy');
            defineGovernor();
            break;
        case 'noble':
            if (global.civic.taxes.tax_rate < 10) {
                global.civic.taxes.tax_rate = 10;
            }
            else if (global.civic.taxes.tax_rate > 20) {
                global.civic.taxes.tax_rate = 20;
            }
            break;
        case 'toxic':
            if (global.race.species === 'troll' && global.tech['science'] && global.tech['science'] >= 8){
                unlockAchieve('godwin');
            }
            break;
        case 'thalassophobia':
            removeFromQueue(['city-wharf']);
            removeFromRQueue(['wharf']);
            setPurgatory('city','wharf');
            break;
        case 'hooved':
            global.resource.Horseshoe.display = true;
            if (!global.race.hasOwnProperty('shoecnt')){
                global.race['shoecnt'] = 0;
            }
            defineGovernor();
            break;
        case 'slow':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'hyper':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'calm':
            if (global.tech['primitive'] >= 3) {
                checkPurgatory('city','meditation',actions.city.meditation.struct().d);
                if (!global.race['orbit_decayed']){
                    global.resource.Zen.display = true;
                }
            }
            break;
        case 'blood_thirst':
            global.race['blood_thirst_count'] = 1;
            break;
        case 'deconstructor':
            global.resource.Nanite.display = true;
            checkPurgatory('city','nanite_factory',{ count: 1,
                Lumber: 0, Chrysotile: 0, Stone: 0, Crystal: 0, 
                Furs: 0, Copper: 0, Iron: 0, Aluminium: 0,
                Cement: 0, Coal: 0, Oil: 0, Uranium: 0,
                Steel: 0, Titanium: 0, Alloy: 0, Polymer: 0,
                Iridium: 0, Helium_3: 0, Water: 0, Deuterium: 0,
                Neutronium: 0, Adamantite: 0, Bolognium: 0, Orichalcum: 0,
            });
            break;
        case 'shapeshifter':
            shapeShift(false,true);
            break;
        case 'imitation':
            setImitation(true);
            if(global.race['shapeshifter']){
                shapeShift(false, true, false); //update mimic options
            }
            break;
        case 'evil':
            setResourceName('Lumber');
            setResourceName('Furs');
            setResourceName('Plywood');
            break;
        case 'psychic':
            if (global.tech['psychic']){
                global.resource.Energy.display = true;
                global.settings.showPsychic = true;
            }
            break;
        case 'wish':
            if (global.tech['wish']){
                global.settings.showWish = true;
                if (global.race['wishStats'] && global.race.wishStats.strong && !global.race['strong']){
                    global.race['strong'] = 0.25;
                    cleanAddTrait('strong')
                }
            }
            break;
        case 'ocular_power':
            global.settings.showWish = true;
            global.race['ocularPowerConfig'] = {
                d: false, p: false, w: false, t: false, f: false, c: false, ds: 0
            };
            renderSupernatural();
            break;
        case 'ooze':
            if (!global.tech['high_tech'] && global.race.species !== 'custom' && (global.race.species !== 'sludge' || global.race.species !== 'ultra_sludge')){
                global.race['gross_enabled'] = 1;
            }
            calc_mastery(true);
            break;
        default:
            break;
    }
}

export function cleanRemoveTrait(trait,rank){
    switch (trait){
        case 'high_pop':
            global.resource[global.race.species].amount = Math.round(global.resource[global.race.species].amount / traits.high_pop.vars(rank)[0]);
            if (global.civic.hasOwnProperty('garrison')) {
                global.civic.garrison.workers = Math.round(global.civic.garrison.workers / traits.high_pop.vars(rank)[0]);
            }
            break;
        case 'kindling_kindred':
            if (global.race['smoldering']){
                break;
            }
            global.resource.Lumber.display = true;
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            if (global.race['casting']){
                defineIndustry();
            }
            checkPurgatory('city','sawmill');
            checkPurgatory('city','graveyard');
            checkPurgatory('city','lumber_yard');
            checkPurgatory('tech','axe');
            checkPurgatory('tech','reclaimer');
            checkPurgatory('tech','saw');
            if ((global.tech['axe'] || global.tech['reclaimer']) && !global.race['orbit_decayed']){
                global.civic.lumberjack.display = true;
            }
            break;
        case 'smoldering':
            releaseResource('Chrysotile')
            if (global.race['kindling_kindred']){
                break;
            }
            global.resource.Lumber.display = true;
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            if (global.race['casting']){
                defineIndustry();
            }
            checkPurgatory('city','sawmill');
            checkPurgatory('city','graveyard');
            checkPurgatory('city','lumber_yard');
            checkPurgatory('tech','axe');
            checkPurgatory('tech','reclaimer');
            checkPurgatory('tech','saw');
            if ((global.tech['axe'] || global.tech['reclaimer']) && !global.race['orbit_decayed']){
                global.civic.lumberjack.display = true;
            }
            break;
        case 'iron_wood':
            if (global.tech['foundry']){
                global.resource.Plywood.display = true;
            }
            break;
        case 'forge':
            defineIndustry();
            break;
        case 'soul_eater':
            setJobName('lumberjack');
        case 'detritivore':
        case 'carnivore':
        case 'herbivore':
        case 'unfathomable':
            adjustFood();
            if (global.race['psychic']){
                renderPsychicPowers();
            }
            break;
        case 'flier':
            setResourceName('Stone');
            setResourceName('Brick');
            checkPurgatory('tech','cement');
            if (global.tech['cement']){
                checkPurgatory('city','cement_plant');
                checkPurgatory('eden','eden_cement');
                global.resource.Cement.display = true;
                global.civic.cement_worker.display = true;
            }
            break;
        case 'sappy':
            setResourceName('Stone');
            checkPurgatory('tech','hammer');
            if (global.tech['mining'] >= 1) {
                checkPurgatory('city','rock_quarry',{ count: 0, asbestos: 0 });
                if ((global.city['rock_quarry'] && global.city.rock_quarry.count > 0) || global.race['lone_survivor']) {
                    global.civic.quarry_worker.display = true;
                }
            }
            break;
        case 'apex_predator':
            checkPurgatory('tech','armor');
            break;
        case 'environmentalist':
            delete power_generated[loc('city_hydro_power')];
            delete power_generated[loc('city_wind_power')];
            break;
        case 'terrifying':
            checkPurgatory('tech','trade');
            checkPurgatory('city','trade');
            if (global.tech['trade']){
                global.settings.showMarket = true;
                global.city.market.active = true;
                drawResourceTab('market');
            }
            break;
        case 'slaver':
            removeFromQueue(['city-slave_pen']);
            removeFromRQueue(['slaves']);
            setPurgatory('city','slave_pen');
            setPurgatory('tech','slaves');
            global.resource.Slave.amount = 0;
            global.resource.Slave.max = 0;
            global.resource.Slave.display = false;
            removeTask('slave');
            defineGovernor();
            break;
        case 'cannibalize':
            removeFromQueue(['city-s_alter']);
            removeFromRQueue(['sacrifice']);
            setPurgatory('tech','sacrifice');
            delete global.city['s_alter'];
            removeTask('sacrifice');
            defineGovernor();
            break;
        case 'magnificent':
            removeFromQueue(['city-shrine']);
            setPurgatory('city','shrine');
            break;
        case 'thalassophobia':
            if (global.tech['wharf']){
                checkPurgatory('city','wharf',{ count: 0 });
            }
            break;
        case 'hooved':
            removeFromQueue(['city-horseshoe', 'space-horseshoe']);
            global.resource.Horseshoe.display = false;
            removeTask('horseshoe');
            defineGovernor();
            break;
        case 'slow':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'hyper':
            save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
            if (webWorker.w){
                gameLoop('stop');
                gameLoop('start');
            }
            else {
                window.location.reload();
            }
            break;
        case 'calm':
            removeFromQueue(['city-meditation']);
            global.resource.Zen.display = false;
            setPurgatory('city','meditation');
            break;
        case 'blood_thirst':
            delete global.race['blood_thirst_count'];
            break;
        case 'deconstructor':
            removeFromQueue(['city-nanite_factory']);
            global.resource.Nanite.display = false;
            setPurgatory('city','nanite_factory');
            break;
        case 'shapeshifter':
            clearElement($('#sshifter'));
            shapeShift();
            break;
        case 'imitation':
            if (global.race['iTraits']){
                Object.keys(global.race.iTraits).forEach(function (t){
                    if (t !== 'imitation'){
                        let base = global.race.inactiveTraits[t] ? global.race.inactiveTraits : global.race;
                        if (global.race.iTraits[t] === 0){
                            let rank = base[t];
                            delete base[t];
                            cleanRemoveTrait(t,rank);
                        }
                        else {
                            base[t] = global.race.iTraits[t];
                        }
                    }
                });
                delete global.race['iTraits'];
                if (global.race['shapeshifter']){
                    shapeShift(false, true, false); //update mimic options
                }
                combineTraits();
            }
            break;
        case 'evil':
            setResourceName('Lumber');
            setResourceName('Furs');
            setResourceName('Plywood');
            break;
        case 'psychic':
            global.resource.Energy.display = false;
            global.settings.showPsychic = false;
            break;
        case 'wish':
            if (!global.race['ocular_power']){
                global.settings.showWish = false;
            }
            if (global.race['wishStats'] && global.race.wishStats.strong){
                delete global.race['strong'];
                cleanRemoveTrait('strong')
            }
            break;
        case 'ocular_power':
            if (!global.tech['wish']){
                global.settings.showWish = false;
            }
            break;
        case 'ooze':
            delete global.race['gross_enabled'];
            calc_mastery(true);
            break;
        default:
            break;
    }
}

export function setImitation(mod){
    if (global.race['imitation'] && global.race['srace']){
        if (!global.race['iTraits']){
            global.race['iTraits'] = {};
        }
        if (global.race['shapeshifter']){
            if((races[global.race['srace']].type === 'hybrid' && races[global.race['srace']].hybrid.includes(global.race['ss_genus'])) ||
                global.race['ss_genus'] === races[global.race['srace']].type){
                shapeShift('none', true, true);
            }
        }

        Object.keys(global.race.inactiveTraits).forEach(function (trait){
            global.race[trait] = global.race.inactiveTraits[trait];
        })
        global.race.inactiveTraits = {};

        let i_traits = [];
        if(races[global.race['srace']].type === 'hybrid'){
            races[global.race['srace']].hybrid.forEach(function(genus) {
                Object.keys(genus_def[genus].traits).forEach(function (trait) {
                    if (!global.race[trait]){
                        i_traits.push(trait);
                    }
                });
            })
        }
        else {
            Object.keys(genus_def[races[global.race['srace']].type].traits).forEach(function (trait) {
                if (!global.race[trait]){
                    i_traits.push(trait);
                }
            });
        }
        if (['custom','hybrid'].includes(global.race['srace'])){
            let list = [races[global.race['srace']].fanaticism,'evil'];
            Object.keys(races[global.race['srace']].traits).forEach(function (trait) {
                if (traits[trait].val < traits[list[1]].val){
                    list[1] = trait;
                }
            });
            i_traits.push(...list);
        }
        else {
            i_traits.push(...Object.keys(races[global.race['srace']].traits));
        }

        for (let trait of i_traits) {
            if (!['evil','imitation'].includes(trait)){
                let set = global.race[trait] ? false : true;
                if (!global.race.iTraits.hasOwnProperty(trait)) {
                    global.race.iTraits[trait] = global.race[trait] || 0;
                }
                let forced = global.race.iTraits[trait] ? false : true;
                let rank = traits[trait].val < 0 ? traits.imitation.vars()[1] : traits.imitation.vars()[0];
                setTraitRank(trait,{ set: rank, force: forced });
                if (mod && set){ cleanAddTrait(trait); }
            }
        }
        combineTraits();
    }
}

export function shapeShift(genus,setup,forceClean){
    let shifted = global.race.hasOwnProperty('ss_traits') ? global.race.ss_traits : [];

    Object.keys(global.race.inactiveTraits).forEach(function (trait){
        global.race[trait] = global.race.inactiveTraits[trait];
    })
    global.race.inactiveTraits = {};

    if (!setup || forceClean){
        shifted.forEach(function(trait){
            let rank = global.race[trait];
            delete global.race[trait];
            cleanRemoveTrait(trait,rank);
        });
        shifted = [];
    }

    if (genus){
        if (genus !== 'none'){
            Object.keys(genus_def[genus].traits).forEach(function (trait) {
                if (!global.race[trait] && trait !== 'high_pop'){
                    if (traits[trait].val >= 0){
                        global.race[trait] = traits.shapeshifter.vars()[0];
                    }
                    else {
                        global.race[trait] = traits.shapeshifter.vars()[1];
                    }
                    cleanAddTrait(trait);
                    shifted.push(trait);
                }
            });
        }
        global.race['ss_genus'] = genus;
    }

    if (setup){
        clearElement($('#sshifter'));
        global.race['ss_genus'] = global.race.hasOwnProperty('ss_genus') ? global.race.ss_genus : 'none';

        let drop = ``;
        const imitation =  global.race['imitation'] ? (races[global.race['srace']].type === 'hybrid' ? races[global.race['srace']].hybrid : [races[global.race['srace']].type]) : [];
        const base = races[global.race.species].type === 'hybrid' ? races[global.race.species].hybrid : [races[global.race.species].type];
        Object.keys(genus_def).forEach(function (gen) {
            if(!['synthetic', 'eldritch', 'hybrid', ...base, ...imitation].includes(gen) && global.stats.achieve[`genus_${gen}`] && global.stats.achieve[`genus_${gen}`].l > 0){
                drop += `<b-dropdown-item v-on:click="setShape('${gen}')">{{ '${gen}' | genus }}</b-dropdown-item>`;
            }
        });

        $('#sshifter').append(
            `<span>${loc(`trait_shapeshifter_name`)}</span>: <b-dropdown hoverable scrollable>
            <button class="button is-primary" slot="trigger">
                <span>{{ ss_genus | genus }}</span>
            </button>
            <b-dropdown-item v-on:click="setShape('none')">{{ 'none' | genus }}</b-dropdown-item>${drop}
        </b-dropdown>`);

        vBind({
            el: `#sshifter`,
            data: global.race,
            methods: {
                setShape(s){
                    shapeShift(s);
                }
            },
            filters: {
                genus(g){
                    return loc(`genelab_genus_${g}`);
                }
            }
        });
    }

    global.race['ss_traits'] = shifted;
    combineTraits();
    if(genus || !setup || forceClean){
        //redraws for mimic heat or avian removing buildings or techs
        arpa('Genetics');
        drawCity();
        renderEdenic();
        drawTech();
    }
}
