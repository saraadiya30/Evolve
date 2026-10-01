import { loc } from './locale.js';
import { vBind, messageQueue, popover } from './functions.js';
import { global, seededRandom, sizeApproximation } from './vars.js';
import { traits } from './races_registry.js';
import { structName } from './actions.js';
import { warhead, big_bang } from './resets.js';
import { eventList, events } from './events.js';
import { govTitle } from './civics.js';
import { alevel, unlockFeat } from './achieve.js';

// Bagian dari majorWish (races_f5.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function majorWish_s1($ctx){
        let container = $(`<div id="majorWish" class="industry"></div>`);
    $ctx.parent.append(container);

    container.append($(`<div class="header"><span class="has-text-warning">${loc('tech_major_wish')}</span> - <span v-html="$options.filters.wish(major)"></span></div>`));
    let spells = $(`<div class="flexWrap"></div>`);
    container.append(spells);

    spells.append(`<div><b-button id="wishBigMoney" v-html="$options.filters.money()" @click="money()"></b-button></div>`);
    spells.append(`<div><b-button id="wishBigRes" v-html="$options.filters.label('resources')" @click="res()"></b-button></div>`)
    spells.append(`<div><b-button id="wishPlasmid" v-html="$options.filters.label('plasmid')" @click="plasmid()"></b-button></div>`);
    spells.append(`<div><b-button id="wishPower" v-html="$options.filters.label('power')" @click="power()"></b-button></div>`);
    spells.append(`<div><b-button id="wishAdoration" v-html="$options.filters.label('adoration')" @click="adoration()"></b-button></div>`);
    spells.append(`<div><b-button id="wishThrill" v-html="$options.filters.label('thrill')" @click="thrill()"></b-button></div>`);
    spells.append(`<div><b-button id="wishPeace" v-html="$options.filters.label('peace')" @click="peace()"></b-button></div>`);
    spells.append(`<div><b-button id="wishGreatness" v-html="$options.filters.label('greatness')" @click="greatness()"></b-button></div>`);
}

export function majorWish_s2($ctx){
        vBind({
        el: `#majorWish`,
        data: global.race.wishStats,
        methods: {
            money(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['money','robbery'];
                    if (!global.race.wishStats.casino){
                        options.push('casino');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'money':
                        {
                            let cash = Math.floor(seededRandom(Math.round(global.resource.Money.max / 12),Math.round(global.resource.Money.max / 4)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            messageQueue(loc('wish_cash',[sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                        case 'robbery':
                        {
                            let cash = Math.floor(seededRandom(Math.round(global.resource.Money.max / 12),Math.round(global.resource.Money.max / 4)));
                            global.resource.Money.amount += cash;
                            if (global.resource.Money.amount > global.resource.Money.max){
                                global.resource.Money.amount = global.resource.Money.max;
                            }
                            let victim = Math.floor(seededRandom(0,10));
                            global.race.wishStats.bad += Math.floor(seededRandom(100,200));
                            messageQueue(loc('wish_robbery',[loc(`wish_robbery${victim}`),sizeApproximation(cash)]),'warning',false,['events']);
                            break;
                        }
                        case 'casino':
                        {
                            global.race.wishStats.casino = true;
                            let game = Math.floor(seededRandom(0,10));
                            messageQueue(loc('wish_casino',[loc(`wish_casino${game}`),structName('casino')]),'warning',false,['events']);
                        }
                    }
                }
            },
            res(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

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
                        let gain = Math.floor(seededRandom(100,global.stats.know * 4));
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
                                gain = Math.floor(seededRandom(1,(global.tech['science'] + global.tech['high_tech']) || 2));
                                global.resource[res].amount += gain;
                            }
                            else {
                                gain = Math.floor(seededRandom(10000,Math.floor(global.resource[res].max * 0.5)));
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
                            global.race.wishStats.bad += Math.floor(seededRandom(100,200));
                            messageQueue(loc('wish_steal_res',[sizeApproximation(gains[0]),global.resource[picked[0]].name]),'warning',false,['events']);
                        }
                    }
                }
            },
            plasmid(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['fake','future'];
                    if (!global.race['warlord']){
                        if (global.tech['blackhole'] && global.tech.blackhole >= 5 && global.interstellar['mass_ejector'] && global.interstellar.mass_ejector.count >= 1){
                            options.push('blackhole');
                        }
                        else if (!global.race['cataclysm'] && !global.race['lone_survivor'] && global.race.species !== 'sludge'){
                            options.push('mad');
                        }
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'fake':
                        {
                            let gain = Math.floor(seededRandom(100,50000));
                            global.resource.Knockoff.amount = gain;
                            global.resource.Knockoff.display = true;
                            messageQueue(loc('wish_plasmid_gain',[gain,loc(`resource_Knockoff_plural_name`)]),'warning',false,['events']);
                            break;
                        }
                        case 'future':
                        {
                            let gain = Math.floor(seededRandom(2,global.tech.science + 2));
                            global.stats.pdebt += gain;
                            global.race.wishStats.plas += gain;
                            if (global.race.universe === 'antimatter'){
                                global.prestige.AntiPlasmid.count += gain;
                                global.stats.antiplasmid += gain;
                            }
                            else {
                                global.prestige.Plasmid.count += gain;
                                global.stats.plasmid += gain;
                            }
                            messageQueue(loc('wish_plasmid_gain',[gain,loc(global.race.universe === 'antimatter' ? `resource_AntiPlasmid_plural_name` : `resource_Plasmid_plural_name`)]),'warning',false,['events']);
                            break;
                        }
                        case 'mad':
                        {
                            $('body').addClass('nuke');
                            let nuke = $('<div class="nuke"></div>');
                            $('body').append(nuke);
                            setTimeout(function(){
                                nuke.addClass('burn');
                            }, 500);
                            setTimeout(function(){
                                nuke.addClass('b');
                            }, 600);
                            setTimeout(function(){
                                global.civic.mad.armed = false;
                                warhead();
                            }, 4000);
                            break;
                        }
                        case 'blackhole':
                        {
                            let bang = $('<div class="bigbang"></div>');
                            $('body').append(bang);
                            setTimeout(function(){
                                bang.addClass('burn');
                            }, 125);
                            setTimeout(function(){
                                bang.addClass('b');
                            }, 150);
                            setTimeout(function(){
                                bang.addClass('c');
                            }, 2000);
                            setTimeout(function(){
                                big_bang();
                            }, 4000);
                        }
                    }
                }
            },
            power(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['potato'];
                    if (!global.race['warlord'] && !global.race.wishStats.ship && (global.tech['shipyard'] || (global.tech['science'] && global.tech.science >= 16))){
                        options.push('ship');
                    }
                    if (!global.race.wishStats.gov){
                        options.push('government');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'potato':
                        {
                            global.race.wishStats.potato++;
                            messageQueue(loc('wish_energized'),'warning',false,['events']);
                            break;
                        }
                        case 'ship':
                        {
                            global.race.wishStats.ship = true;
                            messageQueue(loc('wish_ship'),'warning',false,['events']);
                            break;
                        }
                        case 'government':
                        {
                            global.race.wishStats.gov = true;
                            global.civic.govern.type = 'dictator';
                            messageQueue(loc('wish_gov'),'warning',false,['events']);
                        }
                    }
                }
            },
            adoration(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['priest'];
                    if (!global.race.wishStats.temple && !global.race['cataclysm'] && !global.race['lone_survivor'] && !global.race['warlord']){
                        options.push('temple');
                    }
                    if (!global.race.wishStats.zigg && !global.race['lone_survivor'] && !global.race['warlord']){
                        options.push('zigg');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'priest':
                        {
                            if (global.civic.priest.display && global.race.wishStats.priest < 25){
                                global.race.wishStats.priest++;
                                messageQueue(loc('wish_priest'),'warning',false,['events']);
                            }
                            else {
                                messageQueue(loc('wish_priest_fail'),'warning',false,['events']);
                            }
                            break;
                        }
                        case 'temple':
                        {
                            global.race.wishStats.temple = true;
                            messageQueue(loc('wish_temple',[structName('temple')]),'warning',false,['events']);
                            break;
                        }
                        case 'zigg':
                        {
                            global.race.wishStats.zigg = true;
                            messageQueue(loc('wish_temple',[loc('space_red_ziggurat_title')]),'warning',false,['events']);
                        }
                    }
                }
            },
            thrill(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let event_pool = eventList('major');
                    if (event_pool.length > 0){
                        let event = event_pool[Math.floor(seededRandom(0,event_pool.length))];
                        let msg = events[event].effect();
                        messageQueue(msg,'caution',false,['events','major_events']);
                        global.m_event.l = event;
                    }
                }
            },
            peace(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['flower'];
                    let rivals = ['gov0','gov1','gov2'];
                    rivals.forEach(function(gov){
                        if (!global.civic.foreign[gov].anx && !global.civic.foreign[gov].buy && !global.civic.foreign[gov].occ && !global.tech['world_control']){
                            options.push(gov);
                        }
                    });

                    if (global.race['truepath'] && !global.tech['isolation'] && global.tech['rival'] && global.civic.foreign.gov3.hstl > 0){
                        options.push('gov3');
                    }

                    if (!global.race['truepath'] && global.tech.piracy > 1){
                        options.push('piracy');
                    }

                    if (global.race['truepath'] && global.space['syndicate']){
                        options.push('syndicate');
                    }
                    
                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    if (['gov0','gov1','gov2'].includes(spell)){
                        global.civic.foreign[spell].hstl = 0;
                        global.civic.foreign[spell].anx = true;
                        messageQueue(loc('wish_peace_join',[govTitle(spell.substring(3))]),'warning',false,['events']);
                    }
                    else {
                        switch(spell){
                            case 'flower':
                                messageQueue(loc('wish_peace_flower'),'warning',false,['events']);
                                break;
                            case 'gov3':
                                global.civic.foreign[spell].hstl = 0;
                                break;
                            case 'piracy':
                                global.tech.piracy = Math.floor(seededRandom(1,global.tech.piracy));
                                messageQueue(loc('wish_piracy'),'warning',false,['events']);
                                break;
                            case 'syndicate':
                                Object.keys(global.space.syndicate).forEach(function(synd){
                                    if (global.space.syndicate[synd] > 10){
                                        global.space.syndicate[synd] = Math.floor(seededRandom(10,global.space.syndicate[synd]));
                                    }
                                });
                                messageQueue(loc('wish_piracy'),'warning',false,['events']);
                                break;
                        }
                    }
                }
            },
            greatness(){
                if (global.race.wishStats.major === 0){
                    global.race.wishStats.major = traits.wish.vars()[0];

                    let options = ['wonder'];

                    let a_level = alevel();
                    if (!global.race['lone_survivor'] && !global.race['warlord'] && !global.stats.feat['wish'] || (global.stats.feat['wish'] && global.stats.feat['wish'] < a_level)){
                        options.push('feat');
                    }

                    let spell = options[Math.floor(seededRandom(0,options.length))];
                    switch (spell){
                        case 'wonder':
                        {
                            let wonders = [];
                            if (!global.race['lone_survivor']){
                                let hasCity = global.race['cataclysm'] || global.race['orbit_decay'] || global.race['warlord'] ? false : true;
                                let hasMars = global.tech['mars'] && !global.race['warlord'] ? true : false;
                                if (!global.city.hasOwnProperty('wonder_lighthouse') && hasCity){
                                    wonders.push('lighthouse');
                                }
                                if (!global.city.hasOwnProperty('wonder_pyramid') && hasCity){
                                    wonders.push('pyramid');
                                }
                                if (!global.space.hasOwnProperty('wonder_statue') && hasMars){
                                    wonders.push('statue');
                                }
                                if (global.race['warlord']){
                                    if (!global.portal.hasOwnProperty('wonder_gardens')){
                                        wonders.push('gardens');
                                    }
                                }
                                else if (global.race['truepath']){
                                    if (!global.space.hasOwnProperty('wonder_gardens') && global.tech['titan'] && global.tech.titan >= 2){
                                        wonders.push('gardens');
                                    }
                                }
                                else {
                                    if (!global.interstellar.hasOwnProperty('wonder_gardens') && global.tech['alpha'] && global.tech.alpha >= 2){
                                        wonders.push('gardens');
                                    }
                                }
                            }

                            if (wonders.length > 0){
                                let monument = wonders[Math.floor(seededRandom(0,wonders.length))];
                                switch (monument){
                                    case 'lighthouse':
                                        global.city['wonder_lighthouse'] = { count: 1 };
                                        break;
                                    case 'pyramid':
                                        global.city['wonder_pyramid'] = { count: 1 };
                                        break
                                    case 'statue':
                                        global.space['wonder_statue'] = { count: 1 };
                                        break;
                                    case 'gardens':
                                        global[global.race['warlord'] ? 'portal' : (global.race['truepath'] ? 'space' : 'interstellar')]['wonder_gardens'] = { count: 1 };
                                        break;
                                }
                                messageQueue(loc('wish_wonder'),'warning',false,['events']);
                            }
                            else {
                                messageQueue(loc('wish_no_wonder'),'warning',false,['events']);
                            }
                            break;
                        }
                        case 'feat':
                        {
                            unlockFeat('wish',global.race.universe === 'micro' ? true : false);
                            break;
                        }
                    }
                }
            },
        },
        filters: {
            wish(v){
                return v === 0 ? `<span class="has-text-success">${loc(`power_available`)}</span>` : `<span class="has-text-danger">${v}</span>`;
            },
            label(v){
                return loc(`wish_${v}`);
            },
            money(){
                return loc('resource_Money_name');
            },
        }
    });
}

export function majorWish_s3($ctx){
        ['BigMoney','BigRes','Plasmid','Power','Adoration','Thrill','Peace','Greatness'].forEach(function(wish){
        popover(`wish${wish}`,
            function(){
                switch(wish){
                    case 'BigMoney':
                        return loc(`wish_for`,[loc('wish_big_money')]);
                    case 'BigRes':
                        return loc(`wish_for`,[loc('wish_big_resources')]);
                    case 'Plasmid':
                        return loc(`wish_for`,[loc('wish_plasmid')]);
                    case 'Power':
                        return loc(`wish_for`,[loc('wish_power')]);
                    case 'Adoration':
                        return loc(`wish_for`,[loc('wish_adoration')]);
                    case 'Thrill':
                        return loc(`wish_for`,[loc('wish_thrill')]);
                    case 'Peace':
                        return loc(`wish_for`,[loc('wish_peace')]);
                    case 'Greatness':
                        return loc(`wish_for`,[loc('wish_greatness')]);
                }
            },{
                elm: `#wish${wish}`
            }
        );
    });
}
