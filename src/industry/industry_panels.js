// Isi: loadPylon(), setupRituals(), cancelRituals(), loadQuarry(), loadMechStation(), loadTMine(), loadMiningShip(), loadAlienSpaceStation(), loadReplicator(), replicator(), manaCost(), maxRitualNum(), colorRange(), gridEnabled() +1
import { loc } from '../core/locale.js';
import { global, keyMultiplier, active_rituals, quantum_level, callback_queue } from '../core/vars.js';
import { vBind, clearElement } from '../functions/dom_helpers.js';
import { powerGrid } from './power_grid.js';
import { popover } from '../functions/popover.js';
import { binary_limit_test, trickOrTreat, easterEgg } from '../functions/icons_easter_eggs.js';
import { atomic_mass } from '../resources/resources.js';
import { checkCityRequirements, checkPowerRequirements } from '../actions/challenge/challenge_rules.js';
import { actions } from '../core/registries.js';
import { checkSpaceRequirements, checkRequirements, convertSpaceSector } from '../space/space_requirements.js';
import { fortressTech } from '../portal/hell/fortress_defense.js';
import { checkPathRequirements } from '../truepath/tau_ceti_shipyard.js';
import { edenicTech } from '../edenic/edenic.js';
import { ritual_types } from './industry.js';
import { gridDefs, clearGrids, dragPowerGrid } from './power_grid.js';

// Fungsi-fungsi dipindah dari industry.js (urutan sumber dipertahankan). industry.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function loadPylon(parent,bind){
    let casting = $(`<div><span class="has-text-warning">${loc('modal_pylon_casting')}:</span> <span :class="level()">{{total | drain}}</span></div>`);
    parent.append(casting);

    let spellTypes = $('<div class="pylon wrap"></div>');
    parent.append(spellTypes);

    let ritualList = ['science','army','hunting'];

    if (!global.race['detritivore'] && !global.race['carnivore'] && !global.race['soul_eater'] && !global.race['artifical'] && !global.race['unfathomable'] && !global.race['cataclysm'] && !global.race['orbit_decayed']) {
        ritualList.push('farmer');
    }
    if (!global.race['cataclysm']) {
        ritualList.push('miner');
    }
    if (!global.race['kindling_kindred'] && !global.race['smoldering'] && !global.race['evil'] && !global.race['cataclysm'] && !global.race['orbit_decayed']) {
        ritualList.push('lumberjack');
    }
    if (!global.race['flier']) {
        ritualList.push('factory');
    }
    if (global.tech.magic >= 4) {
        ritualList.push('crafting');
    }

    if (global.tech['magic'] && global.tech.magic >= 3){
        ritualList.forEach(function (spell){
            let cast = $(`<span :aria-label="buildLabel('${spell}') + ariaCount('${spell}')" class="current ${spell}">${loc(`modal_pylon_spell_${spell}`)} {{ ${spell} }}</span>`);
            let sub = $(`<span role="button" class="sub" @click="subSpell('${spell}')" aria-label="Stop casting '${spell}' ritual"><span>&laquo;</span></span>`);
            let add = $(`<span role="button" class="add" @click="addSpell('${spell}')" aria-label="Cast '${spell}' ritual"><span>&raquo;</span></span>`);
            spellTypes.append(sub);
            spellTypes.append(cast);
            spellTypes.append(add);
        });
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.race['casting'],
        methods: {
            buildLabel(spell){
                return tooltip(spell);
            },
            addSpell(spell){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    let diff = manaCost(global.race.casting[spell] + 1) - manaCost(global.race.casting[spell]);
                    if (global.resource.Mana.diff >= diff){
                        global.race.casting[spell]++;
                        global.race.casting.total++;
                        global.resource.Mana.diff -= diff;
                    }
                    else {
                        break;
                    }
                }
            },
            subSpell(spell){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.casting[spell] > 0){
                        global.race.casting[spell]--;
                        global.race.casting.total--;
                    }
                    else {
                        break;
                    }
                }
            },
            ariaCount(spell){
                return ` ${spell} casting.`;
            },
            level(){
                return colorRange(global.race.casting.total,global.resource.Mana.gen,true);
            }
        },
        filters: {
            drain: function(c){
                let total = 0;
                ritualList.forEach(function (spell){
                    if (global.race.casting[spell] && global.race.casting[spell] > 0){
                        total += manaCost(global.race.casting[spell]);
                    }
                });
                return loc('modal_pylon_casting_cost',[+(total).toFixed(3)]);
            }
        }
    });

    function tooltip(spell){
        let draw = +(manaCost(global.race.casting[spell])).toFixed(4);
        let diff = +(manaCost(global.race.casting[spell] + 1) - manaCost(global.race.casting[spell])).toFixed(4);
        let boost = +(100 * (global.race.casting[spell] / (global.race.casting[spell] + 75))).toFixed(2);
        if (spell === 'crafting'){
            let auto = +(100 * (2 * global.race.casting[spell] / (2 * global.race.casting[spell] + 75))).toFixed(2);
            return loc('modal_pylon_casting_label_crafting',[draw,boost,auto,diff]);
        }
        return loc('modal_pylon_casting_label',[loc(`modal_pylon_spell_${spell}`),draw,diff,boost]);
    }

    ritualList.forEach(function(type){
        let id = parent.hasClass('modalBody') ? `specialModal` : `iPylon`;
        popover(`${id}${type}`,function(){
            return tooltip(type);
        }, {
            elm: $(`#${id} > .pylon > .${type}`),
            attach: '#main',
        });
    });
}

export function setupRituals(define=false){
    if (define){
        global.race['casting'] = {
            farmer: 0,
            miner: 0,
            lumberjack: 0,
            science: 0,
            factory: 0,
            army: 0,
            hunting: 0,
            crafting: 0,
            total: 0,
        };
    }

    if (global.race['casting']){
        ritual_types.forEach(function (c){
            active_rituals[c] = global.race.casting[c];
        });
    }
}

export function cancelRituals(){
    if (global.race['casting']){
        Object.keys(global.race.casting).forEach(function (c){
            global.race.casting[c] = 0;
            active_rituals[c] = 0;
        });
    }
}

export function loadQuarry(parent,bind){
    parent.append($(`<div>${loc('modal_quarry_ratio',[global.resource.Chrysotile.name])}</div>`));

    let slider = $(`<div class="sliderbar"><span class="sub" role="button" @click="sub" aria-label="Increase Stone Production">&laquo;</span><b-slider v-model="asbestos" format="percent"></b-slider><span class="add" role="button" @click="add" aria-label="Increase Chrysotile Production">&raquo;</span></div>`);
    parent.append(slider);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.city.rock_quarry,
        methods: {
            sub(){
                let keyMult = keyMultiplier();
                if (global.city.rock_quarry.asbestos > 0){
                    global.city.rock_quarry.asbestos -= keyMult;
                    if (global.city.rock_quarry.asbestos < 0){
                        global.city.rock_quarry.asbestos = 0;
                    }
                }
            },
            add(){
                let keyMult = keyMultiplier();
                if (global.city.rock_quarry.asbestos < 100){
                    global.city.rock_quarry.asbestos += keyMult;
                    if (global.city.rock_quarry.asbestos > 100){
                        global.city.rock_quarry.asbestos = 100;
                    }
                }
            }
        }
    });
}

export function loadMechStation(parent,bind){
    let mech = $(`<div class="factory"><span>${global.race['warlord'] ? loc(`eden_demon_station_control`) : loc(`eden_mech_station_control`)}</span></div>`);
    parent.append(mech);
    let mechPatrol = $(`<span class="current">{{ mode | patrolMode }}</span>`);
    let mechDown = $(`<span class="sub" @click="lower()" role="button" aria-label="Decrease Patrol Aggression">&laquo;</span>`);
    let mechUp = $(`<span class="add" @click="higher()" role="button" aria-label="Increase Patrol Aggression">&raquo;</span>`);
    mech.append(mechDown);
    mech.append(mechPatrol);
    mech.append(mechUp);

    let stats = $(`<div class="flexAround"></div>`);
    stats.append($(`<span v-html="$options.filters.patrol(mechs)"></span>`));
    stats.append($(`<span v-html="$options.filters.effect(effect)"></span>`));
    parent.append(stats);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.eden['mech_station'],
        methods: {
            lower: function(){
                if (global.eden.mech_station.mode > 0){
                    global.eden.mech_station.mode--;
                }
            },
            higher: function(){
                if (global.eden.mech_station.mode < 5){
                    global.eden.mech_station.mode++
                }
            },
        },
        filters: {
            patrolMode(v){
                return loc(`eden_mech_station_patrol${v}`);
            },
            patrol(v){
                return loc(global.race['warlord'] ? `eden_demon_station_mechs` : `eden_mech_station_mechs`,[v]);
            },
            effect(v){
                return loc(`eden_mech_station_effective`,[v]);
            }
        }
    });
}

export function loadTMine(parent,bind){
    parent.append($(`<div>${loc('modal_quarry_ratio',[global.resource.Adamantite.name])}</div>`));

    let slider = $(`<div class="sliderbar"><span class="sub" role="button" @click="sub" aria-label="Increase Aluminium Production">&laquo;</span><b-slider v-model="ratio" format="percent"></b-slider><span class="add" role="button" @click="add" aria-label="Increase Adamantite Production">&raquo;</span></div>`);
    parent.append(slider);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.space.titan_mine,
        methods: {
            sub(){
                let keyMult = keyMultiplier();
                if (global.space.titan_mine.ratio > 0){
                    global.space.titan_mine.ratio -= keyMult;
                    if (global.space.titan_mine.ratio < 0){
                        global.space.titan_mine.ratio = 0;
                    }
                }
            },
            add(){
                let keyMult = keyMultiplier();
                if (global.space.titan_mine.ratio < 100){
                    global.space.titan_mine.ratio += keyMult;
                    if (global.space.titan_mine.ratio > 100){
                        global.space.titan_mine.ratio = 100;
                    }
                }
            }
        }
    });
}

export function loadMiningShip(parent,bind){
    parent.append($(`<div>${loc('tau_roid_mining_ship_ratio',[global.resource.Iron.name,global.resource.Aluminium.name])}</div>`));
    let common = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('common')" aria-label="Increase Iron Production">&laquo;</span><b-slider v-model="common" format="percent"></b-slider><span class="add" role="button" @click="add('common')" aria-label="Increase Aluminium Production">&raquo;</span></div>`);
    parent.append(common);

    parent.append($(`<div>${loc('tau_roid_mining_ship_ratio',[global.resource.Iridium.name,global.resource.Neutronium.name])}</div>`));
    let uncommon = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('uncommon')" aria-label="Increase Iridium Production">&laquo;</span><b-slider v-model="uncommon" format="percent"></b-slider><span class="add" role="button" @click="add('uncommon')" aria-label="Increase Neutronium Production">&raquo;</span></div>`);
    parent.append(uncommon);

    if (global.tech.tau_roid >= 5){
        parent.append($(`<div>${loc('tau_roid_mining_ship_ratio',[global.resource.Orichalcum.name,global.resource.Elerium.name])}</div>`));
        let rare = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('rare')" aria-label="Increase Orichalcum Production">&laquo;</span><b-slider v-model="rare" format="percent"></b-slider><span class="add" role="button" @click="add('rare')" aria-label="Increase Elerium Production">&raquo;</span></div>`);
        parent.append(rare);
    }

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.tauceti.mining_ship,
        methods: {
            sub(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.mining_ship[r] > 0){
                    global.tauceti.mining_ship[r] -= keyMult;
                    if (global.tauceti.mining_ship[r] < 0){
                        global.tauceti.mining_ship[r] = 0;
                    }
                }
            },
            add(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.mining_ship[r] < 100){
                    global.tauceti.mining_ship[r] += keyMult;
                    if (global.tauceti.mining_ship[r] > 100){
                        global.tauceti.mining_ship[r] = 100;
                    }
                }
            }
        }
    });
}

export function loadAlienSpaceStation(parent,bind){
    parent.append($(`<div>${loc('tau_gas2_alien_station_focus',[global.resource.Knowledge.name])}</div>`));
    let common = $(`<div class="sliderbar thin"><span class="sub" role="button" @click="sub('focus')" aria-label="Decrease Knowledge Focus">&laquo;</span><b-slider v-model="focus" format="percent"></b-slider><span class="add" role="button" @click="add('focus')" aria-label="Increase Knowledge Focus">&raquo;</span></div>`);
    parent.append(common);

    vBind({
        el: bind ? bind : '#specialModal',
        data: global.tauceti.alien_space_station,
        methods: {
            sub(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.alien_space_station[r] > 0){
                    global.tauceti.alien_space_station[r] -= keyMult;
                    if (global.tauceti.alien_space_station[r] < 0){
                        global.tauceti.alien_space_station[r] = 0;
                    }
                }
            },
            add(r){
                let keyMult = keyMultiplier();
                if (global.tauceti.alien_space_station[r] < 100){
                    global.tauceti.alien_space_station[r] += keyMult;
                    if (global.tauceti.alien_space_station[r] > 100){
                        global.tauceti.alien_space_station[r] = 100;
                    }
                }
            }
        }
    });
}

export function loadReplicator(parent,bind){
    if (global.race['replicator']){
        parent.append($(`<div>${global.race.universe === 'antimatter' ? loc('tech_antireplicator') : loc('tech_replicator')}</div>`));

        let content = $(`<div class="doublePane"></div>`);
        parent.append(content);
        
        if (bind){
        let values = ``;
            Object.keys(atomic_mass).forEach(function(res){
                if (res !== 'Asphodel_Powder' && res !== 'Elysanite'){
                    values += `<b-dropdown-item aria-role="listitem" v-on:click="setVal('${res}')" data-val="${res}" v-show="avail('${res}')">${global.resource[res].name}</b-dropdown-item>`;
                }
            });

            content.append(`<div><b-dropdown :triggers="['hover', 'click']" aria-role="list" :scrollable="true" :max-height="200" class="dropList">
                <button class="button is-info" slot="trigger">
                    <span>{{ res | resName }}</span>
                </button>${values}
            </b-dropdown></div>`);
        }
        else {
            let scrollMenu = ``;
            let blacklist = ['Asphodel_Powder', 'Elysanite'];
            if(global.race['fasting']){
                blacklist.push('Food');
            }
            Object.keys(atomic_mass).forEach(function(res){
                if (global.resource[res].display && !blacklist.includes(res)){
                    scrollMenu += `<b-radio-button v-model="res" native-value="${res}">${global.resource[res].name}</b-radio-button>`;
                }
            });
            content.append(`<div id="hscrolltarget" class="left hscroll"><b-field class="buttonList">${scrollMenu}</b-field></div>`);
        }

        let power = bind ? $(`<div></div>`) : $(`<div class="right"></div>`);
        content.append(power);

        let current = $(`<span :aria-label="aria" class="current"><span>{{ pow }}MW</span></span>`);
        let less = $(`<span role="button" class="sub" @click="less" aria-label="Reduce power by 1"><span>&laquo;</span></span>`);
        let more = $(`<span role="button" class="add" @click="more" aria-label="Increase power by 1"><span>&raquo;</span></span>`);
        power.append(less);
        power.append(current);
        power.append(more);

        parent.append(`<div class="topPad">{{ res | result }}</div>`); 

        vBind({
            el: bind ? bind : '#specialModal',
            data: global.race.replicator,
            methods: {
                less(){
                    let keyMult = keyMultiplier();
                    if (global.race.replicator.pow > 0){
                        global.race.replicator.pow -= keyMult;
                        if (global.race.replicator.pow < 0){
                            global.race.replicator.pow = 0;
                        }
                    }
                },
                more(){
                    let keyMult = keyMultiplier();
                    global.race.replicator.pow += keyMult;
                },
                setVal(r){
                    if (global.resource[r].display){
                        global.race.replicator.res = r;
                    }
                },
                avail(r){
                    return global.resource[r].display && !(global.race['fasting'] && r === 'Food');
                },
                aria(){
                    return global.race.replicator.pow + 'MW';
                }
            },
            filters: {
                resName(r){
                    return global.resource[r].name;
                },
                result(r){
                    return loc(`tau_replicator`,[replicator(r,global.race.replicator.pow).toFixed(2),global.resource[r].name]);
                }
            }
        });

        if (!bind){
            const scrollContainer = document.getElementById('hscrolltarget');

            scrollContainer.addEventListener("wheel", (evt) => {
                evt.preventDefault();
                scrollContainer.scrollLeft += evt.deltaY;
            });
        }
    }
}

export function replicator(res,pow){
    if (global.race['lone_survivor']){
        return 17.5 * quantum_level / atomic_mass[res] * pow;
    }
    else {
        let qLevel = quantum_level || 1;
        let mass = res === 'Infernite' || res === 'Elerium' ? atomic_mass[res] * 4 : atomic_mass[res];
        if (pow > 5000){
            pow = ((pow - 5000) ** 0.9) + 5000;
        }
        if (qLevel > 40){
            qLevel = ((qLevel - 40) ** 0.75) + 40;
        }
        return 12.5 * qLevel / mass * (pow ** 0.75);
    }
}

export function manaCost(spell,rate=0.0025){
    return spell * ((1 + rate) ** spell - 1);
}

export function maxRitualNum(mana, time_multiplier=0.25, rate=0.0025){
    return binary_limit_test(function(num){
        return (manaCost(num, rate) * time_multiplier) <= mana;
    });
}

export function colorRange(num,max,invert){
    if (num <= 0){
        return invert ? 'has-text-success' : 'has-text-danger';
    }
    else if (num >= max){
        return invert ? 'has-text-danger' : 'has-text-success';
    }
    else if (num <= max / 3){
        return invert ? 'has-text-info' : 'has-text-caution';
    }
    else if (num <= max * 0.66){
        return 'has-text-warning';
    }
    else if (num < max){
        return invert ? 'has-text-caution' : 'has-text-info';
    }
    else {
        return '';
    }
}

export function gridEnabled(c_action,region,p0,p1){
    let isOk = false;
    switch (region){
        case 'city':
            if (p1 === 'replicator' && global.race['replicator']){
                isOk = true;
            }
            else {
                isOk = global.race['cataclysm'] || global.race['orbit_decayed'] || global.tech['isolation'] || global.race['warlord'] ? false : checkCityRequirements(p1);
            }
            break;
        case 'space':
            isOk = global.tech['isolation'] || global.race['warlord'] ? false : checkSpaceRequirements(region,p0,p1);
            break;
        case 'portal':
            isOk = checkRequirements(fortressTech(),p0,p1);
            break;
        case 'tauceti':
            isOk = checkPathRequirements(region,p0,p1);
            break;
        case 'eden':
            isOk = checkRequirements(edenicTech(),p0,p1);
            break;
        default:
            isOk = p0 === 'spc_moon' && global.race['orbit_decayed'] ? false : checkSpaceRequirements(region,p0,p1);
            break;
    }
    return global[region][p1] && isOk && checkPowerRequirements(c_action) ? true : false;
}

export function setPowerGrid(){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 2)){
        return;
    }
    let grids = gridDefs();
    clearGrids(grids);

    clearElement($('#powerGrid'));
    $('#powerGrid').append(`<div class="powerGridHead"><div class="powerGridHeader has-text-info">${loc(`power_grid_header`)}</div><div id="powerModeSwitch"><b-switch class="setting" v-model="lowPowerBalance">Distribute Low Power</b-switch></div></div>`);
    vBind({
        el: `#powerModeSwitch`,
        data: global.settings
    });

    Object.keys(grids).forEach(function(grid_type){
        if (!grids[grid_type].s){
            return;
        }

        let candy = '';
        if (grid_type === 'power'){
            candy = trickOrTreat(7,12,false);
        }

        if (grids[grid_type].r && grids[grid_type].rs && global[grids[grid_type].r][grids[grid_type].rs]){
            $('#powerGrid').append(`<div id="pg${grid_type}sup" class="gridHeader"><span class="has-text-caution">${grids[grid_type].n}</span> {{ support }}/{{ s_max }}</div>`);
            vBind({
                el: `#pg${grid_type}sup`,
                data: global[grids[grid_type].r][grids[grid_type].rs]
            });
        }
        else {
            $('#powerGrid').append(`<div class="gridHeader has-text-caution">${grids[grid_type].n}${candy}</div>`);
        }

        let grid = $(`<div id="grid${grid_type}" class="powerGrid"></div>`);
        $('#powerGrid').append(grid);

        let idx = 0;
        for (let i=0; i< grids[grid_type].l.length; i++){
            let struct = grids[grid_type].l[i];

            let parts = struct.split(":");
            let space = convertSpaceSector(parts[0]);
            let region = parts[0] === 'city' ? parts[0] : space;
            let c_action = parts[0] === 'city' ? actions.city[parts[1]] : actions[space][parts[0]][parts[1]];

            let title = typeof c_action.title === 'function' ? c_action.title() : c_action.title;
            let extra = ``;
            switch (parts[1]){
                case 'factory':
                    extra = ` (${loc(`tab_city5`)})`;
                    break;
                case 'red_factory':
                    extra = ` (${loc(`tab_space`)})`;
                    break;
                case 'casino':
                    extra = ` (${loc(`tab_city5`)})`;
                    break;
                case 'spc_casino':
                    extra = ` (${loc(`tab_space`)})`;
                    break;
            }

            if (gridEnabled(c_action,region,parts[0],parts[1])){
                idx++;
                let circuit = $(`<div id="pg${c_action.id}${grid_type}" class="circuit" data-idx="${i}"></div>`);
                circuit.append(`<span v-html="$options.filters.idx(${idx})"></span> <span class="struct has-text-warning">${title}${extra}</span>`);
                circuit.append(`<span role="button" class="sub off" @click="power_off" aria-label="Powered Off"><span>{{ on | off }}</span></span> <span role="button" class="add on" @click="power_on" aria-label="Powered On"><span>{{ on }}</span></span>`);
                circuit.append(`<span role="button" class="sub is-sr-only" @click="higher" aria-label="Raise Power Priority"><span>&laquo;</span></span> <span role="button" class="add is-sr-only" @click="lower" aria-label="Lower Power Priority"><span>&raquo;</span></span>`);
                grid.append(circuit);

                vBind({
                    el: `#pg${c_action.id}${grid_type}`,
                    data: global[region][parts[1]],
                    methods: {
                        power_on(){
                            let keyMult = keyMultiplier();
                            for (let i=0; i<keyMult; i++){
                                if (global[region][parts[1]].on < global[region][parts[1]].count){
                                    global[region][parts[1]].on++;
                                }
                                else {
                                    break;
                                }
                            }
                            if (c_action['postPower']){
                                callback_queue.set([c_action, 'postPower'], [true]);
                            }
                        },
                        power_off(){
                            let keyMult = keyMultiplier();
                            for (let i=0; i<keyMult; i++){
                                if (global[region][parts[1]].on > 0){
                                    global[region][parts[1]].on--;
                                }
                                else {
                                    break;
                                }
                            }
                            if (c_action['postPower']){
                                callback_queue.set([c_action, 'postPower'], [false]);
                            }
                        },
                        higher(){
                            let oIdx = $(`#pg${c_action.id}${grid_type}`).attr(`data-idx`);
                            let nIdx = $(`#pg${c_action.id}${grid_type}`).prevAll(`.circuit:not(".inactive")`).attr(`data-idx`);
                            if (nIdx >= 0){
                                let order = grids[grid_type].l;
                                order.splice(nIdx, 0, order.splice(oIdx, 1)[0]);
                                grids[grid_type].l = order;
                                setPowerGrid();
                            }
                        },
                        lower(){
                            let oIdx = $(`#pg${c_action.id}${grid_type}`).attr(`data-idx`);
                            let nIdx = $(`#pg${c_action.id}${grid_type}`).nextAll(`.circuit:not(".inactive")`).attr(`data-idx`);
                            if (nIdx < grids[grid_type].l.length){
                                let order = grids[grid_type].l;
                                order.splice(nIdx, 0, order.splice(oIdx, 1)[0]);
                                grids[grid_type].l = order;
                                setPowerGrid(grid_type);
                            }
                        }
                    },
                    filters: {
                        off(c){
                            return global[region][parts[1]].count - c;
                        },
                        idx(idx){
                            let egg18 = easterEgg(18,11);
                            if (idx === 10 && egg18.length > 0){
                                return '1'+egg18;
                            }
                            return idx;
                        }
                    }
                });
            }
            else {
                let circuit = $(`<div id="pg${c_action.id}${grid_type}" class="circuit inactive" data-idx="${i}"></div>`);
                circuit.append(`<span class="has-text-warning">${title}${extra}</span>`);
                grid.append(circuit);
            }
        };

        dragPowerGrid(grid_type);

        let reset = $(`<div id="${grid_type}GridReset" class="resetPowerGrid"><button class="button" @click="resetGrid('${grid_type}')">${loc('power_grid_reset',[grids[grid_type].n])}</button></div>`);
        $('#powerGrid').append(reset);

        vBind({
            el: `#${grid_type}GridReset`,
            data: {},
            methods: {
                resetGrid(type){
                    powerGrid(type,true);
                    setPowerGrid();
                }
            }
        });
    });
}
