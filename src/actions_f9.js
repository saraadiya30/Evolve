import { global, setupStats, save, webWorker } from './vars.js';
import { deepClone, clearElement, vBind, clearPopper, timeFormat } from './functions.js';
import { actions } from './actions_registry.js';
import { addSmelter } from './industry.js';
import { arpa } from './arpa.js';
import { randomMinorTrait, races, setTraitRank, setImitation, shapeShift, cleanAddTrait } from './races.js';
import { unlockAchieve } from './achieve.js';
import { loc } from './locale.js';
import { initStruct } from './actions_f7.js';
import { drawCity } from './actions_f3.js';
import { drawTech } from './actions_f4.js';
import { resDragQueue } from './actions_f10.js';
import { cataclysm_s1, cataclysm_s2 } from './sec_cataclysm_1.js';

// Fungsi-fungsi dipindah dari actions.js (urutan sumber dipertahankan). actions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function simulation(){
    if (global.race['simulation']){
        if (!global.hasOwnProperty('sim')){
            global['sim'] = {
                stats: deepClone(global.stats),
                prestige: deepClone(global.prestige),
                genes: deepClone(global.genes),
                blood: deepClone(global.blood),
                pillars: deepClone(global.pillars),
                race: deepClone(global.race)
            };

            global.stats = {
                start: Date.now(),
                days: 0,
                tdays: 0
            };
            setupStats();

            global.genes = { minor: {}, challenge: 1 };
            global.blood = { aware: 1 };
            global.pillars = {};
            delete global.race['ancient_ruins'];
            delete global.race['rapid_mutation'];
            delete global.race['corruption'];
            delete global.race['rejuvenated'];
            global.race.ascended = false;
            global.race.gods = 'none';
            global.race.old_gods = 'none';
            
            ['Plasmid','AntiPlasmid','Phage','Dark','Harmony','AICore','Artifact','Blood_Stone'].forEach(function (res){
                global.prestige[res] = { count: Number(global.race.simConfig[res]) };
            });
        }
    }
}

export function exitSim(){
    if (global.hasOwnProperty('sim')){
        global.stats = deepClone(global.sim.stats);
        global.prestige = deepClone(global.sim.prestige);
        global.genes = deepClone(global.sim.genes);
        global.blood = deepClone(global.sim.blood);
        global.pillars = deepClone(global.sim.pillars);
        global.race = deepClone(global.sim.race);
        delete global['sim'];
        
        global.race.species = 'protoplasm';
        delete global.race['simulation'];

        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        if (webWorker.w){
            webWorker.w.terminate();
        }
        window.location.reload();
    }
}

export function aiStart(){
    if (global.race['artifical']){
        global.tech['spy'] = 5;
        global.tech['primitive'] = 3;
        global.tech['currency'] = 6;
        global.tech['govern'] = 3;
        global.tech['boot_camp'] = 1;
        global.tech['medic'] = 1;
        global.tech['military'] = 5;
        global.tech['explosives'] = 3;
        global.tech['trade'] = 3;
        global.tech['banking'] = 6;
        global.tech['home_safe'] = 1;
        global.tech['housing'] = 3;
        global.tech['smelting'] = 3;
        global.tech['copper'] = 1;
        global.tech['storage'] = 5;
        global.tech['container'] = 4;
        global.tech['steel_container'] = 3;
        global.tech['mining'] = 4;
        global.tech['pickaxe'] = 2;
        global.tech['hammer'] = 2;
        global.tech['oil'] = 3;
        global.tech['alumina'] = 1;
        global.tech['titanium'] = 1;
        global.tech['foundry'] = 7;
        global.tech['factory'] = 1;
        global.tech['science'] = 7;
        global.tech['high_tech'] = 4;
        global.tech['theology'] = 2;

        if (!global.race['joyless']){
            global.tech['theatre'] = 3;
            global.tech['broadcast'] = 1;
        }

        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;

        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Food.display = true;

        global.resource.Money.amount = 1000;

        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        if (!global.race['flier']){
            global.tech['cement'] = 5;
            global.resource.Cement.display = true;
        }

        if (!global.race['kindling_kindred'] && !global.race['smoldering']){
            if (global.race['evil']){
                global.tech['reclaimer'] = 3;
                initStruct(actions.city.graveyard); global.city.graveyard.count = 1;
            }
            else {
                global.tech['axe'] = 3;
                global.tech['saw'] = 2;
                initStruct(actions.city.lumber_yard); global.city.lumber_yard.count = 1;
                initStruct(actions.city.sawmill);
            }
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.civic.lumberjack.display = true;
        }
        if (global.race['smoldering']){
            global.resource.Chrysotile.display = true;
        }

        global.resource[global.race.species].max = 0;
        global.resource[global.race.species].amount = 0;
        global.resource.Crates.amount = 10;
        global.resource.Containers.amount = 10;

        global.civic.taxes.display = true;

        global.civic.miner.display = true;
        global.civic.coal_miner.display = true;
        if (!global.race['sappy']){
            global.civic.quarry_worker.display = true;
        }
        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        if (!global.race['flier']){
            global.civic.cement_worker.display = true;
        }
        global.civic.banker.display = true;

        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 7.5;
        global.city['powered'] = true;

        initStruct(actions.city.factory);
        initStruct(actions.city.foundry);
        initStruct(actions.city.smelter); addSmelter(1, 'Iron');
        initStruct(actions.city.oil_power); global.city.oil_power.count = 1; global.city.oil_power.on = 1; 
        initStruct(actions.city.coal_power);
        initStruct(actions.city.transmitter); global.city.transmitter.count = 1; global.city.transmitter.on = 1;
        initStruct(actions.city.mine); global.city.mine.count = 1;
        initStruct(actions.city.coal_mine); global.city.coal_mine.count = 1;
        initStruct(actions.city.oil_well); global.city.oil_well.count = 1;
        initStruct(actions.city.oil_depot); global.city.oil_depot.count = 1;
        initStruct(actions.city.cement_plant);  global.city.cement_plant.count = 1;
        initStruct(actions.city.garrison);
        initStruct(actions.city.boot_camp);
        initStruct(actions.city.basic_housing);
        initStruct(actions.city.cottage);
        initStruct(actions.city.apartment);
        initStruct(actions.city.amphitheatre);
        initStruct(actions.city.rock_quarry); global.city.rock_quarry.count = 1;
        initStruct(actions.city.metal_refinery); global.city.metal_refinery.count = 1;
        initStruct(actions.city.shed); global.city.shed.count = 2;
        initStruct(actions.city.storage_yard); global.city.storage_yard.count = 1;
        initStruct(actions.city.warehouse); global.city.warehouse.count = 1;
        initStruct(actions.city.trade);
        initStruct(actions.city.wharf);
        initStruct(actions.city.bank); global.city.bank.count = 1;
        initStruct(actions.city.university); global.city.university.count = 1;
        initStruct(actions.city.library); global.city.library.count = 1;
        initStruct(actions.city.wardenclyffe);
        initStruct(actions.city.temple);

        if (global.race['calm']){
            global.resource.Zen.display = true;
            initStruct(actions.city.meditation);
        }
        if (global.race['cannibalize']){
            initStruct(actions.city.s_alter);
        }
        if (global.race['magnificent']){
            initStruct(actions.city.shrine);
        }

        global.civic.govern.type = 'technocracy';
        drawCity();
        drawTech();
    }
}

export function cataclysm(){
    const $ctx = {};
    if (global.race['cataclysm']){
        cataclysm_s1($ctx);
        cataclysm_s2($ctx);
    }
}

export function fanaticism(god){
    if (['custom','hybrid','nano'].includes(god) && global.race['warlord']){
        randomMinorTrait(5);
        arpa('Genetics');
    }
    else {
        switch (races[god].fanaticism){
            case 'smart':
                if (global.race['dumb']){
                    randomMinorTrait(5);
                    arpa('Genetics');
                }
                else {
                    fanaticTrait('smart');
                }
                break;
            case 'infectious':
                fanaticTrait('infectious');
                if (global.race.species === 'human'){
                    unlockAchieve(`infested`);
                }
                break;
            case 'blood_thirst':
                fanaticTrait('blood_thirst');
                if (global.race.species === 'entish'){
                    unlockAchieve(`madagascar_tree`);
                }
                break;
            case 'none':
                randomMinorTrait(5);
                arpa('Genetics');
                break;
            case 'kindling_kindred':
                fanaticTrait(races[god].fanaticism);
                break;
            default:
                fanaticTrait(races[god].fanaticism);
                break;
        }
    }
    if (global.race['warlord']){
        global.race.absorbed.push(god);
    }
}

export function absorbRace(race){
    if (global.race['warlord']){
        fanaticTrait(races[race].fanaticism, 0.25);
        if (!global.race.absorbed.includes(race)){
            global.race.absorbed.push(race);
        }
    }
}

export function fanaticTrait(trait,rank){
    if (global.race['warlord'] && trait === 'kindling_kindred'){ trait = 'iron_wood'; }
    else if (global.race['warlord'] && trait === 'spiritual'){ trait = 'unified'; }
    else if (global.race['warlord'] && trait === 'blood_thirst'){ trait = 'apex_predator'; }
    if (global.race[trait]){
        if (!setTraitRank(trait)){
            randomMinorTrait(5);
        }
        else if (trait === 'imitation'){
            setImitation(true);
        }
        else if (trait === 'shapeshifter'){
            shapeShift(global.race['ss_genus']);
        }
    }
    else {
        if (global.race['warlord']){
            global.race[trait] = rank ?? 0.5;
        }
        else {
            global.race[trait] = rank ?? 1;
        }
        cleanAddTrait(trait);
    }
    arpa('Genetics');
}

export function resQueue(){
    if (!global.settings.tabLoad && global.settings.civTabs !== 3){
        return;
    }
    clearResDrag();
    clearElement($('#resQueue'));
    $('#resQueue').append($(`
        <h2 class="has-text-success">${loc('research_queue')} ({{ queue.length }}/{{ max }})</h2>
        <span id="pauserqueue" class="${global.r_queue.pause ? 'pause' : 'play'}" role="button" @click="pauseRQueue()" :aria-label="pausedesc()"></span>
    `));

    let queue = $(`<ul class="buildList"></ul>`);
    $('#resQueue').append(queue);

    queue.append($(`<li v-for="(item, index) in queue"><a v-bind:id="setID(index)" class="queued" v-bind:class="{ 'qany': item.qa }" @click="remove(index)" role="link"><span class="has-text-warning">{{ item.label }}</span> [<span v-bind:class="{ 'has-text-danger': item.cna, 'has-text-success': !item.cna && item.req, 'has-text-caution': !item.req && !item.cna }">{{ item.time | time }}</span>]</a></li>`));

    try {
        vBind({
            el: '#resQueue',
            data: global.r_queue,
            methods: {
                remove(index){
                    clearPopper(`rq${global.r_queue.queue[index].id}`);
                    global.r_queue.queue.splice(index,1);
                    resQueue();
                    drawTech();
                },
                setID(index){
                    return `rq${global.r_queue.queue[index].id}`;
                },
                pauseRQueue(){
                    $(`#pauserqueue`).removeClass('play');
                    $(`#pauserqueue`).removeClass('pause');
                    if (global.r_queue.pause){
                        global.r_queue.pause = false;
                        $(`#pauserqueue`).addClass('play');
                    }
                    else {
                        global.r_queue.pause = true;
                        $(`#pauserqueue`).addClass('pause');
                    }
                },
                pausedesc(){
                    return global.r_queue.pause ? loc('r_queue_play') : loc('r_queue_pause');
                }
            },
            filters: {
                time(time){
                    return timeFormat(time);
                }
            }
        });
        resDragQueue();
    }
    catch {
        global.r_queue.queue = [];
    }
}

export function clearResDrag(){
    let el = $('#resQueue .buildList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}
