import { loc } from '../core/locale.js';
import { atomic_mass } from '../resources/resources.js';
import { global, keyMultiplier } from '../core/vars.js';
import { vBind, popover, modRes } from '../functions/functions.js';
import { traits } from './races_registry.js';
import { renderPsychicPowers } from './races_f5.js';

// Fungsi-fungsi dipindah dari races.js (urutan sumber dipertahankan). races.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function psychicBoost(parent){
    let container = $(`<div id="psychicBoost" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_boost_title')} <span v-html="$options.filters.boostTime()"></span></div>`));

    let content = $(`<div></div>`);
    container.append(content);

    let scrollMenu = ``;
    Object.keys(atomic_mass).forEach(function(res){
        if (global.resource[res].display){
            scrollMenu += `<b-radio-button v-model="b.r" native-value="${res}">${global.resource[res].name}</b-radio-button>`;
        }
    });
    content.append(`<div id="psyhscrolltarget" class="left hscroll"><b-field class="buttonList">${scrollMenu}</b-field></div>`); 

    container.append(`<div><b-button v-html="$options.filters.boost(b.r)" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ c.boost }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decresae Energy reserved for ${loc(`psychic_attack`)}"><span>&laquo;</span></span>`);
        let add = $(`<span role="button" class="add" @click="add" aria-label="Increase Energy reserved for ${loc(`psychic_attack`)}"><span>&raquo;</span></span>`);
        channel.append(sub);
        channel.append(psy);
        channel.append(add);
        container.append(channel);
    }
    
    let cost = global.tech.psychic >= 5 ? 60 : 75;
    let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
    vBind({
        el: `#psychicBoost`,
        data: {
            b: global.race.psychicPowers.boost,
            c: global.tech.psychic >= 4 ? global.race.psychicPowers.channel : {},
        },
        methods: {
            boostVal(){
                if (global.resource.Energy.amount >= cost){
                    global.resource.Energy.amount -= cost;
                    global.race.psychicPowers.boostTime = 72 * rank;
                }
            },
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost + global.race.psychicPowers.channel.assault + global.race.psychicPowers.channel.cash < 100){
                        global.race.psychicPowers.channel.boost++;
                    }
                    else {
                        break;
                    }
                }
            },
            sub(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost > 0){
                        global.race.psychicPowers.channel.boost--;
                    }
                    else {
                        break;
                    }
                }
            }
        },
        filters: {
            boost(r){
                return loc(`psychic_boost_button`,[global.resource[r] ? global.resource[r].name : 'N/A',cost]);
            },
            boostTime(){
                return global.race.psychicPowers.boostTime > 0 ? loc(`psychic_boost_time`,[global.race.psychicPowers.boostTime]) : '';
            }
        }
    });

    const scrollContainer = document.getElementById('psyhscrolltarget');
    scrollContainer.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        scrollContainer.scrollLeft += evt.deltaY;
    });

    popover('psychicBoost',
        function(){
            return loc(`psychic_boost_desc`,[traits.psychic.vars()[3]]);
        },{
            elm: '#psychicBoost > div > button'
        }
    );
}

export function psychicKill(parent){
    let container = $(`<div id="psychicKill" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_murder_title')}</div>`));
    container.append(`<div><b-button v-html="$options.filters.kill()" @click="murder()"></b-button></div>`);

    let cost = global.tech.psychic >= 5 ? 8 : 10;
    vBind({
        el: `#psychicKill`,
        data: {},
        methods: {
            murder(){
                if (global.resource.Energy.amount >= cost && global.resource[global.race.species].amount >= 1){
                    global.resource.Energy.amount -= cost;
                    global.resource[global.race.species].amount--;
                    global.stats.psykill++;
                    blubberFill(1);
                    if (global.race['anthropophagite']){
                        modRes('Food', 10000 * traits.anthropophagite.vars()[0], true);
                    }
                    if (global.stats.psykill === 10){
                        renderPsychicPowers();
                    }
                }
            }
        },
        filters: {
            kill(){
                return loc(`psychic_murder_button`,[cost]);
            }
        }
    });

    popover('psychicKill',
        function(){
            return loc(`psychic_murder_desc`);
        },{
            elm: '#psychicKill > div > button'
        }
    );
}

export function psychicAssault(parent){
    let container = $(`<div id="psychicAssault" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_assault_title')} <span v-html="$options.filters.boostTime()"></span></div>`));
    container.append(`<div><b-button v-html="$options.filters.boost()" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ assault }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decresae Energy reserved for ${loc(`psychic_attack`)}"><span>&laquo;</span></span>`);
        let add = $(`<span role="button" class="add" @click="add" aria-label="Increase Energy reserved for ${loc(`psychic_attack`)}"><span>&raquo;</span></span>`);
        channel.append(sub);
        channel.append(psy);
        channel.append(add);
        container.append(channel);
    }

    let cost = global.tech.psychic >= 5 ? 36 : 45;
    let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
    vBind({
        el: `#psychicAssault`,
        data: global.tech.psychic >= 4 ? global.race.psychicPowers.channel : {},
        methods: {
            boostVal(){
                if (global.resource.Energy.amount >= cost){
                    global.resource.Energy.amount -= cost;
                    global.race.psychicPowers.assaultTime = 72 * rank;
                }
            },
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost + global.race.psychicPowers.channel.assault + global.race.psychicPowers.channel.cash < 100){
                        global.race.psychicPowers.channel.assault++;
                    }
                    else {
                        break;
                    }
                }
            },
            sub(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.assault > 0){
                        global.race.psychicPowers.channel.assault--;
                    }
                    else {
                        break;
                    }
                }
            }
        },
        filters: {
            boost(){
                return loc(`psychic_boost_button`,[loc(`psychic_attack`),cost]);
            },
            boostTime(){
                return global.race.psychicPowers.assaultTime > 0 ? loc(`psychic_boost_time`,[global.race.psychicPowers.assaultTime]) : '';
            }
        }
    });

    popover('psychicAssault',
        function(){
            return loc(`psychic_assault_desc`,[traits.psychic.vars()[3]]);
        },{
            elm: '#psychicAssault > div > button'
        }
    );
}

export function psychicFinance(parent){
    let container = $(`<div id="psychicFinance" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_profit_title')} <span v-html="$options.filters.boostTime()"></span></div>`));
    container.append(`<div><b-button v-html="$options.filters.boost()" @click="boostVal()"></b-button></div>`);

    if (global.tech.psychic >= 4){
        let channel = $(`<div class="gap">${loc('psychic_channel')}</div>`);
        let psy = $(`<span class="current">{{ cash }}</span>`);
        let sub = $(`<span role="button" class="sub" @click="sub" aria-label="Decresae Energy reserved for ${loc(`psychic_profit`)}"><span>&laquo;</span></span>`);
        let add = $(`<span role="button" class="add" @click="add" aria-label="Increase Energy reserved for ${loc(`psychic_profit`)}"><span>&raquo;</span></span>`);
        channel.append(sub);
        channel.append(psy);
        channel.append(add);
        container.append(channel);
    }

    let cost = global.tech.psychic >= 5 ? 52 : 65;
    let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
    vBind({
        el: `#psychicFinance`,
        data: global.tech.psychic >= 4 ? global.race.psychicPowers.channel : {},
        methods: {
            boostVal(){
                if (global.resource.Energy.amount >= cost){
                    global.resource.Energy.amount -= cost;
                    global.race.psychicPowers.cash = 72 * rank;
                }
            },
            add(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.boost + global.race.psychicPowers.channel.assault + global.race.psychicPowers.channel.cash < 100){
                        global.race.psychicPowers.channel.cash++;
                    }
                    else {
                        break;
                    }
                }
            },
            sub(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global.race.psychicPowers.channel.cash > 0){
                        global.race.psychicPowers.channel.cash--;
                    }
                    else {
                        break;
                    }
                }
            }
        },
        filters: {
            boost(){
                return loc(`psychic_boost_button`,[loc(`psychic_profit`),cost]);
            },
            boostTime(){
                return global.race.psychicPowers.cash > 0 ? loc(`psychic_boost_time`,[global.race.psychicPowers.cash]) : '';
            }
        }
    });

    popover('psychicFinance',
        function(){
            return loc(`psychic_profit_desc`,[traits.psychic.vars()[3]]);
        },{
            elm: '#psychicFinance > div > button'
        }
    );
}

export function psychicMindBreak(parent){
    let container = $(`<div id="psychicMindBreak" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_mind_break_title')}</div>`));
    container.append(`<div><b-button v-html="$options.filters.break()" @click="breakMind()"></b-button></div>`);

    let cost = global.tech.psychic >= 5 ? 64 : 80;
    vBind({
        el: `#psychicMindBreak`,
        data: {},
        methods: {
            breakMind(){
                if (global.resource.Energy.amount >= cost && global.tech['unfathomable']){
                    let imprisoned = [];
                    if (global.city.hasOwnProperty('surfaceDwellers')){
                        for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                            let jailed = global.city.captive_housing[`jailrace${i}`];
                            if (jailed > 0){
                                imprisoned.push(i);
                            }
                        }
                    }

                    if (imprisoned.length > 0){
                        let k = imprisoned[Math.rand(0,imprisoned.length)];
                        global.city.captive_housing[`jailrace${k}`]--;
                        global.city.captive_housing[`race${k}`]++;
                        global.resource.Energy.amount -= cost;
                    }
                }
            }
        },
        filters: {
            break(){
                return loc(`psychic_mind_break_button`,[cost]);
            }
        }
    });

    popover('psychicMindBreak',
        function(){
            return loc(`psychic_mind_break_desc`);
        },{
            elm: '#psychicMindBreak > div > button'
        }
    );
}

export function psychicCapture(parent){
    let container = $(`<div id="psychicCapture" class="industry"></div>`);
    parent.append(container);

    container.append($(`<div class="header">${loc('psychic_stun_title')}</div>`));
    container.append(`<div><b-button v-html="$options.filters.break()" @click="stun()"></b-button></div>`);

    let cost = global.tech.psychic >= 5 ? 80 : 100;
    vBind({
        el: `#psychicCapture`,
        data: {},
        methods: {
            stun(){
                if (global.resource.Energy.amount >= cost && global.tech['unfathomable']){
                    let usedCap = 0;
                    if (global.city.hasOwnProperty('surfaceDwellers')){
                        for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                            let mindbreak = global.city.captive_housing[`race${i}`];
                            let jailed = global.city.captive_housing[`jailrace${i}`];
                            usedCap += mindbreak + jailed;
                        }
                    }

                    if (usedCap < global.city.captive_housing.raceCap){
                        let k = Math.rand(0,global.city.surfaceDwellers.length);
                        global.city.captive_housing[`jailrace${k}`]++;
                        global.resource.Energy.amount -= cost;
                    }
                }
            }
        },
        filters: {
            break(){
                return loc(`psychic_stun_button`,[cost]);
            }
        }
    });

    popover('psychicCapture',
        function(){
            return loc(`psychic_stun_desc`);
        },{
            elm: '#psychicCapture > div > button'
        }
    );
}

export function blubberFill(v){
    if (global.race['blubber'] && global.city.hasOwnProperty('oil_well')){
        let cap = (global.city.oil_well.count + (global.space['oil_extractor'] ? global.space.oil_extractor.count : 0)) * 50;
        global.city.oil_well.dead += v;
        if (global.city.oil_well.dead > cap){
            global.city.oil_well.dead = cap;
        }
    }
}
