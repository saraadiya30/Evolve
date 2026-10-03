import { loc } from '../core/locale.js';
import { vBind, messageQueue, popover } from '../functions/functions.js';
import { global, seededRandom, sizeApproximation } from '../core/vars.js';
import { traits, races } from '../races/races_registry.js';
import { unlockAchieve } from '../achievements/achieve.js';
import { drawCity, drawTech, actions } from '../actions/actions.js';
import { govCivics, govTitle } from '../civics/civics.js';
import { events, eventList } from '../events/events.js';
import { swissKnife } from '../tech/tech.js';
import { setTraitRank } from '../races/races_f3.js';

// Bagian dari minorWish (races_f4.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function minorWish_s1($ctx){
        let container = $(`<div id="minorWish" class="industry"></div>`);
    $ctx.parent.append(container);

    container.append($(`<div class="header"><span class="has-text-warning">${loc('tech_minor_wish')}</span> - <span v-html="$options.filters.wish(minor)"></span></div>`));
    let spells = $(`<div class="flexWrap"></div>`);
    container.append(spells);

    spells.append(`<div><b-button id="wishMoney" v-html="$options.filters.money()" @click="money()"></b-button></div>`);
    spells.append(`<div><b-button id="wishRes" v-html="$options.filters.label('resources')" @click="res()"></b-button></div>`);
    spells.append(`<div><b-button id="wishKnow" v-html="$options.filters.know()" @click="know()"></b-button></div>`);
    spells.append(`<div><b-button id="wishFame" v-html="$options.filters.label('fame')" @click="famous()"></b-button></div>`);
    spells.append(`<div><b-button id="wishStrength" v-html="$options.filters.label('strength')" @click="strength()"></b-button></div>`);
    spells.append(`<div><b-button id="wishInfluence" v-html="$options.filters.label('influence')" @click="influence()"></b-button></div>`);
    spells.append(`<div><b-button id="wishExcite" v-html="$options.filters.label('event')" @click="excite()"></b-button></div>`);
    spells.append(`<div><b-button id="wishLove" v-html="$options.filters.label('love')" @click="love()"></b-button></div>`);
}

export function minorWish_s2($ctx){
        vBind({
        el: `#minorWish`,
        data: global.race.wishStats,
        methods: {
            know(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['inspire'];
                    if (!global.race['lone_survivor'] && !global.race['cataclysm'] && !global.race['orbit_decay']){
                        options.push('know');
                    }
                    if (global.tech['science']){
                        if (global.tech.science >= 1 && global.tech.science <= 3){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 3 && global.tech.science >= 4 && global.tech.science <= 6){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 4 && global.tech.science === 7){
                            options.push('science');
                        }
                        else if (global.tech['space'] && global.tech.space >= 3 && global.tech.science === 8 && global.tech['luna']){
                            options.push('science');
                        }
                        else if (global.tech['alpha'] && global.tech.alpha >= 2 && global.tech.science === 11){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 12 && global.tech.science === 12){
                            options.push('science');
                        }
                        else if (global.tech['infernite'] && global.tech.infernite >= 2 && global.tech.science === 13){
                            options.push('science');
                        }
                        else if (global.tech['neutron'] && global.tech.science === 14){
                            options.push('science');
                        }
                        else if (global.tech['xeno'] && global.tech.xeno >= 4 && global.tech.science === 15){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 16 && global.tech.science === 16){
                            options.push('science');
                        }
                        else if (global.tech['conflict'] && global.tech.conflict >= 5 && global.tech.science === 17){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 17 && global.tech.science === 18){
                            options.push('science');
                        }
                        else if (global.tech['high_tech'] && global.tech.high_tech >= 18 && global.tech.science === 19){
                            options.push('science');
                        }
                        else if (global.tech['asphodel'] && global.tech.asphodel >= 3 && global.tech.science === 21){
                            options.push('science');
                        }
                        else if (global.tech['asphodel'] && global.tech.asphodel >= 8 && global.tech.science === 22){
                            options.push('science');
                        }
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'inspire':
                        {
                            global.race['inspired'] = Math.floor(seededRandom(300,600));
                            let msg = loc('event_inspiration');
                            messageQueue(msg,false,false,['events','major_events']);
                            break;
                        }
                        case 'know':
                        {
                            let gain = Math.floor(seededRandom(global.resource.Knowledge.max / 5,global.resource.Knowledge.max / 2));
                            global.resource.Knowledge.amount += gain;
                            if (global.resource.Knowledge.amount > global.resource.Knowledge.max){
                                global.resource.Knowledge.amount = global.resource.Knowledge.max;
                            }
                            messageQueue(loc('wish_know',[global.resource.Knowledge.name,sizeApproximation(gain)]),'warning',false,['events']);
                            break;
                        }
                        case 'science':
                        {
                            global.tech.science++;
                            switch(global.tech.science){
                                case 2:
                                    global.city['library'] = { count: 0 };
                                    break;
                                case 8:
                                    if (global.race['toxic'] && global.race.species === 'troll'){
                                        unlockAchieve('godwin');
                                    }
                                    break;
                                case 9:
                                    global.space['observatory'] = { count: 0, on: 0 };
                                    break;
                                case 12:
                                    global.interstellar['laboratory'] = { count: 0, on: 0 };
                                    break;
                            }
                            drawCity();
                            drawTech();

                            let techs = {
                                2: 'library', 3: 'thesis', 4: 'research_grant', 5: 'scientific_journal', 6: 'adjunct_professor', 7: 'tesla_coil', 8: 'internet',
                                9: 'observatory', 12: 'laboratory', 13: 'virtual_assistant', 14: 'dimensional_readings', 15: 'quantum_entanglement',
                                16: 'expedition', 17: 'subspace_sensors', 18: 'alien_database', 19: 'orichalcum_capacitor', 20: 'advanced_biotech'
                            };

                            let tech = typeof actions.tech[techs[global.tech.science]].title === 'function' ? actions.tech[techs[global.tech.science]].title() : actions.tech[techs[global.tech.science]].title;
                            messageQueue(loc('wish_tech',[tech]), 'warning',false,['progress']);
                            break;
                        }
                    }
                }
            },
            money(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['money','robbery'];
                    if (global.race.wishStats.tax === 0){
                        options.push('taxes');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'money':
                        {
                            let cash = Math.floor(seededRandom(1,Math.round(global.resource.Money.max / 8)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            messageQueue(loc('wish_cash',[sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                        case 'taxes':
                        {
                            global.race.wishStats.tax = 5;
                            global.civic.taxes.rax_rate = govCivics('tax_cap');
                            messageQueue(loc('wish_taxes'),'warning',false,['events']);
                            break;
                        }
                        case 'robbery':
                        {
                            let cash = Math.floor(seededRandom(1,Math.round(global.resource.Money.max / 8)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            let victim = Math.floor(seededRandom(0,10));
                            global.race.wishStats.bad += Math.floor(seededRandom(50,100));
                            messageQueue(loc('wish_robbery',[loc(`wish_robbery${victim}`),sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                    }
                }
            },
            res(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['useless','common','rare','stolen','2xcommon','2xrare'];
                    let spell = options[Math.floor(seededRandom(0,options.length))];

                    let resList = [];
                    [
                        'Lumber','Stone','Furs','Copper','Iron','Aluminium','Cement','Coal','Oil','Uranium',
                        'Steel','Titanium','Alloy','Polymer','Iridium','Helium_3','Crystal','Chrysotile'
                    ].forEach(function(res){
                        if (global.resource[res].display && global.resource[res].amount * 1.05 < global.resource[res].max){
                            resList.push(res);
                        }
                    });

                    if (spell === 'rare' || spell === 'stolen' || spell === '2xrare'){
                        [
                            'Deuterium','Neutronium','Adamantite','Nano_Tube','Graphene','Stanene','Bolognium',
                            'Vitreloy','Orichalcum','Infernite','Elerium','Soul_Gem'
                        ].forEach(function(res){
                            if (global.resource[res].display && (res === 'Soul_Gem' || global.resource[res].amount * 1.05 < global.resource[res].max)){
                                resList.push(res);
                            }
                        });
                    }

                    if (spell === 'useless' || resList.length === 0){
                        global.resource.Useless.display = true;
                        let gain = Math.floor(seededRandom(1,global.stats.know));
                        global.resource.Useless.amount += gain;
                        messageQueue(loc('wish_gain_res',[sizeApproximation(gain),global.resource.Useless.name]),'warning',false,['events']);
                    }
                    else {
                        let picked = [resList[Math.floor(seededRandom(0,resList.length))]];
                        if (spell === '2xcommon' || spell === '2xrare'){
                            picked.push(resList[Math.floor(seededRandom(0,resList.length))]);
                        }
                        
                        let gains = [];
                        picked.forEach(function(res){
                            let gain = 0;
                            if (res === 'Soul_Gem'){
                                gain = Math.floor(seededRandom(1,global.tech['science'] || 2));
                                global.resource[res].amount += gain;
                            }
                            else {
                                gain = Math.floor(seededRandom(1,Math.floor(global.resource[res].max * 0.25)));
                                global.resource[res].amount += gain;
                                if (global.resource[res].amount > global.resource[res].max){
                                    global.resource[res].amount = global.resource[res].max;
                                }
                            }
                            gains.push(gain);
                        });

                        if (['2xcommon','2xrare'].includes(spell)){
                            messageQueue(loc('wish_gain_double',[sizeApproximation(gains[0]),global.resource[picked[0]].name,sizeApproximation(gains[1]),global.resource[picked[1]].name]),'warning',false,['events']);
                        }
                        else if (['common','rare'].includes(spell)){
                            messageQueue(loc('wish_gain_res',[sizeApproximation(gains[0]),global.resource[picked[0]].name]),'warning',false,['events']);
                        }
                        else if (spell === 'stolen'){
                            global.race.wishStats.bad += Math.floor(seededRandom(50,100));
                            messageQueue(loc('wish_steal_res',[sizeApproximation(gains[0]),global.resource[picked[0]].name]),'warning',false,['events']);
                        }
                    }
                }
            },
            love(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['pet'];
                    let rivals = ['gov0','gov1','gov2'];
                    if (global.race['truepath'] && !global.tech['isolation'] && global.tech['rival']){
                        rivals.push('gov3');
                    }

                    rivals.forEach(function(gov){
                        if (global.civic.foreign[gov].hstl > 0 && !global.civic.foreign[gov].anx && !global.civic.foreign[gov].buy && !global.civic.foreign[gov].occ){
                            options.push(gov);
                        }
                    });

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    if (spell === 'pet'){
                        let msg = events.pet.effect();
                        messageQueue(msg,false,false,['events','minor_events']);
                    }
                    else {
                        global.civic.foreign[spell].hstl = 0;
                        messageQueue(loc('wish_love_gov',[govTitle(spell.substring(3))]),false,false,['minor_events']);
                    }
                }
            },
            excite(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 4;

                    let event_pool = eventList('minor');
                    if (event_pool.length > 0){
                        let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
                        let msg = events[event].effect();
                        messageQueue(msg,false,false,['events','minor_events']);
                        global.m_event.l = event;
                    }
                }
            },
            famous(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['notorious','reputable'];
                    let event = Math.floor(seededRandom(0,10));
                    let cheeseList = swissKnife(false,true);
                    let cheese = cheeseList[Math.floor(seededRandom(0,cheeseList.length))];

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'notorious':
                        {
                            global.race.wishStats.fame = -10;
                            let args = event === 8 ? [cheese] : [];
                            messageQueue(loc('wish_famous',[loc(`wish_notorious${event}`,args)]),'warning',false,['events']);
                            break;
                        }
                        case 'reputable':
                        {
                            global.race.wishStats.fame = 10;
                            let args = event === 4 ? [cheese] : [];
                            messageQueue(loc('wish_famous',[loc(`wish_reputable${event}`,args)]),'warning',false,['events']);
                            break;
                        }
                    }
                }
            },
            strength(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['troops'];
                    if (!global.race['strong']){
                        options.push('trait');
                    }

                    if (global.tech['military']){
                        if (global.tech.military === 1){
                            options.push('military');
                        }
                        else if (global.tech.military === 2 && global.tech['explosives']){
                            options.push('military');
                        }
                        else if (global.tech.military === 3 && global.tech['oil']){
                            options.push('military');
                        }
                        else if (global.tech.military === 4 && global.tech['high_tech'] && global.tech.high_tech >= 4){
                            options.push('military');
                        }
                        else if (global.tech.military === 5 && global.tech['mass']){
                            options.push('military');
                        }
                        else if (global.tech.military === 6 && global.tech['high_tech'] && global.tech.high_tech >= 9 && global.tech['elerium']){
                            options.push('military');
                        }
                        else if (global.tech.military === 7 && global.tech['high_tech'] && global.tech.high_tech >= 13){
                            options.push('military');
                        }
                        else if (global.tech.military === 8 && global.tech['high_tech'] && global.tech.high_tech >= 14 && global.tech['science'] && global.tech.science >= 15 && global.tech['infernite']){
                            options.push('military');
                        }
                        else if (global.tech.military === 9 && global.tech['science'] && global.tech.science >= 18){
                            options.push('military');
                        }
                        else if (global.tech.military === 10 && global.tech['high_tech'] && global.tech.high_tech >= 18){
                            options.push('military');
                        }
                        else if (global.tech.military === 11 && global.tech['asphodel'] && global.tech.asphodel >= 5){
                            options.push('military');
                        }
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'troops':
                        {
                            if (global.race.wishStats.troop < 25){
                                global.race.wishStats.troop++;
                                messageQueue(loc('wish_troop'),'warning',false,['events']);
                            }
                            break;
                        }
                        case 'trait':
                        {
                            global.race.wishStats.strong = true;
                            setTraitRank('strong',{ set: 0.25, force: true });
                            messageQueue(loc('wish_muscle'),'warning',false,['events']);
                            break;
                        }
                        case 'military':
                        {
                            global.tech.military++;
                            switch(global.tech.military){
                                case 7:
                                    if (global.race.species === 'sharkin'){
                                        unlockAchieve('laser_shark');
                                    }
                                    break;
                            }
                            drawCity();
                            drawTech();

                            let techs = {
                                2: 'bows', 3: 'flintlock_rifle', 4: 'machine_gun', 5: 'bunk_beds', 6: 'rail_guns', 7: 'laser_rifles',
                                8: 'plasma_rifles', 9: 'disruptor_rifles', 10: 'gauss_rifles', 11: 'cyborg_soldiers', 12: 'ethereal_weapons',
                            };

                            let tech = typeof actions.tech[techs[global.tech.military]].title === 'function' ? actions.tech[techs[global.tech.military]].title() : actions.tech[techs[global.tech.military]].title;
                            messageQueue(loc('wish_tech',[tech]), 'warning',false,['progress']);
                            break;
                        }
                    }
                }
            },
            influence(){
                if (global.race.wishStats.minor === 0){
                    global.race.wishStats.minor = traits.wish.vars()[0] / 3;

                    let options = ['magazine'];
                    if (!global.race.wishStats.astro){
                        options.push('astro');
                    }
                    if (global.race.wishStats.prof < 25 && global.civic.professor.display){
                        options.push('professor');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'magazine':
                        {
                            messageQueue(loc('wish_magazine',[races[global.race.species].name]),'warning',false,['events']);
                            break;
                        }
                        case 'astro':
                        {
                            global.race.wishStats.astro = true;
                            messageQueue(loc('wish_astro'),'warning',false,['events']);
                            break;
                        }
                        case 'professor':
                        {
                            global.race.wishStats.prof++;
                            messageQueue(loc('wish_prof'),'warning',false,['events']);
                            break;
                        }
                    }
                }
            }
        },
        filters: {
            wish(v){
                return v === 0 ? `<span class="has-text-success">${loc(`power_available`)}</span>` : `<span class="has-text-danger">${v}</span>`;
            },
            label(v){
                return loc(`wish_${v}`);
            },
            know(){
                return global.resource.Knowledge.name;
            },
            money(){
                return loc('resource_Money_name');
            },
        }
    });
}

export function minorWish_s3($ctx){
        ['Know','Money','Res','Love','Excite','Fame','Strength','Influence'].forEach(function(wish){
        popover(`wish${wish}`,
            function(){
                switch(wish){
                    case 'Know':
                        return loc(`wish_for`,[global.resource.Knowledge.name]);
                    case 'Money':
                        return loc(`wish_for`,[loc('resource_Money_name')]);
                    case 'Res':
                        return loc(`wish_for`,[loc('wish_resources')]);
                    case 'Love':
                        return loc(`wish_for`,[loc('wish_love')]);
                    case 'Excite':
                        return loc(`wish_for`,[loc('wish_event')]);
                    case 'Fame':
                        return loc(`wish_for`,[loc('wish_fame')]);
                    case 'Strength':
                        return loc(`wish_for`,[loc('wish_strength')]);
                    case 'Influence':
                        return loc(`wish_for`,[loc('wish_influence')]);
                }
            },{
                elm: `#wish${wish}`
            }
        );
    });
}
