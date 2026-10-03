import { global, keyMultiplier } from '../../core/vars.js';
import { traits, fathomCheck, races } from '../../races/races.js';
import { loc } from '../../core/locale.js';
import { vBind, clearPopper, popover, easterEgg, trickOrTreat, clearElement, eventActive, timeFormat } from '../../functions/functions.js';
import { govActive } from '../../governor/governor.js';
import { jobScale } from '../jobs.js';
import { govEffect } from '../civics.js';
import { govPrice, govTitle, spyCost, trainSpy } from './government_garrison_and_espionage_defs.js';
import { war_campaign, describeSoldier, soldierBreakdown, battleAssessment } from './soldier_breakdown_and_war_campaign.js';
import { garrisonSize, armyRating } from './loot_army_rating_and_mad.js';

// Fungsi-fungsi dipindah dari civics.js (urutan sumber dipertahankan). civics.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


function spyAction(sa,g){
    // Espionage researched
    if (global.tech['spy'] && global.tech['spy'] >= 2){
        // At least 1 spy and no ongoing espionage action
        let num_spies = global.civic.foreign[`gov${g}`].spy;
        if (num_spies >= 1 && global.civic.foreign[`gov${g}`].sab === 0){
            let timer;
            let can_sab = false;

            switch (sa){
                case 'influence':
                    // Timer is minimized at 5 spies (7 without spy gadgets)
                    timer = global.tech['spy'] >= 4 ? 200 : 300;
                    if (num_spies === 1){ timer *= 1.5; }
                    else if (num_spies >= 3){ timer -= (num_spies - 2) * 50; }
                    timer = Math.max(timer, 50);
                    can_sab = true;
                    break;

                case 'sabotage':
                    // Timer is minimized at 8 spies (12 without spy gadgets)
                    timer = global.tech['spy'] >= 4 ? 400 : 600;
                    if (num_spies >= 2){ timer -= (num_spies - 1) * 50; }
                    timer = Math.max(timer, 50);
                    can_sab = true;
                    break;

                case 'incite':
                    // Timer is minimized at 8 spies (11 without spy gadgets)
                    if (g >= 3){ break; }
                    timer = global.tech['spy'] >= 4 ? 600 : 900;
                    if (num_spies <= 2){ timer *= 1.5; }
                    else if (num_spies >= 4){ timer -= (num_spies - 3) * 100; }
                    timer = Math.max(timer, 100);
                    can_sab = true;
                    break;
            }

            // This part of the timer computation is currently common to all spy actions
            if (can_sab){
                if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3){ timer *= 0.9; }
                timer = Math.ceil(timer);
                if (global.race['befuddle']){
                    timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                }
                let fathom = fathomCheck('dryad');
                if (fathom > 0){
                    timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                }
                global.civic.foreign[`gov${g}`].sab = timer;
                global.civic.foreign[`gov${g}`].act = sa;
            }
        }
    }
}

export function drawEspModal(gov){
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${loc('civics_espionage_actions')}</p>`));
    
    var body = $('<div id="espModal" class="modalBody max40"></div>');
    $('#modalBox').append(body);

    if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${gov}`].spy >= 1){
        body.append($(`<button class="button gap" data-esp="influence" @click="influence('${gov}')">${loc(`civics_spy_influence`)}</button>`));
        body.append($(`<button class="button gap" data-esp="sabotage" @click="sabotage('${gov}')">${loc(`civics_spy_sabotage`)}</button>`));
        if (gov < 3){
            body.append($(`<button class="button gap" data-esp="incite" @click="incite('${gov}')">${loc(`civics_spy_incite`)}</button>`));
        }
        if (gov < 3 && global.civic.foreign[`gov${gov}`].hstl <= 50 && global.civic.foreign[`gov${gov}`].unrest >= 50){
            body.append($(`<button class="button gap" data-esp="annex" @click="annex('${gov}')">${loc(`civics_spy_annex`)}</button>`));
        }
        if (gov < 3 && global.civic.foreign[`gov${gov}`].spy >= 3){
            body.append($(`<button class="button gap" data-esp="purchase" @click="purchase('${gov}')">${loc(`civics_spy_purchase`)}</button>`));
        }
    }

    vBind({
        el: '#espModal',
        data: global.civic.foreign[`gov${gov}`],
        methods: {
            influence(g){
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1){
                    spyAction('influence',g);
                    vBind({el: '#espModal'},'destroy');
                    $('.modal-background').click();
                    clearPopper();
                }
            },
            sabotage(g){
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1){
                    spyAction('sabotage',g);
                    vBind({el: '#espModal'},'destroy');
                    $('.modal-background').click();
                    $('#popGov').hide();
                    clearPopper();
                }
            },
            incite(g){
                if (g >= 3){ return; }
                if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1){
                    spyAction('incite',g);
                    vBind({el: '#espModal'},'destroy');
                    $('.modal-background').click();
                    clearPopper();
                }
            },
            annex(g){
                if (g >= 3){ return; }
                if (global.civic.foreign[`gov${gov}`].hstl <= 50 && global.civic.foreign[`gov${gov}`].unrest >= 50 && global.city.morale.current >= (200 + global.civic.foreign[`gov${gov}`].hstl - global.civic.foreign[`gov${gov}`].unrest)){
                    if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 1 && global.civic.foreign[`gov${g}`].sab === 0){
                        let timer = global.tech['spy'] >= 4 ? 150 : 300;
                        if (global.race['befuddle']){
                            timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                        }
                        let fathom = fathomCheck('dryad');
                        if (fathom > 0){
                            timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                        }
                        global.civic.foreign[`gov${g}`].sab = timer;
                        global.civic.foreign[`gov${g}`].act = 'annex';
                        vBind({el: '#espModal'},'destroy');
                        $('.modal-background').click();
                        clearPopper();
                    }
                }
            },
            purchase(g){
                if (g >= 3){ return; }
                let price = govPrice(g);
                if (price <= global.resource.Money.amount){
                    if (global.tech['spy'] && global.tech['spy'] >= 2 && global.civic.foreign[`gov${g}`].spy >= 3 && global.civic.foreign[`gov${g}`].sab === 0){
                        global.resource.Money.amount -= price;
                        let timer = global.tech['spy'] >= 4 ? 150 : 300;
                        if (global.race['befuddle']){
                            timer = Math.round(timer * (1 - traits.befuddle.vars()[0] / 100));
                        }
                        let fathom = fathomCheck('dryad');
                        if (fathom > 0){
                            timer = Math.round(timer * (1 - traits.befuddle.vars(1)[0] / 100 * fathom));
                        }
                        global.civic.foreign[`gov${g}`].sab = timer;
                        global.civic.foreign[`gov${g}`].act = 'purchase';
                        vBind({el: '#espModal'},'destroy');
                        $('.modal-background').click();
                        clearPopper();
                    }
                }
            }
        }
    });

    popover('GovLabel', function(obj){
            let esp = $(obj.this).data('esp');
            let desc = '';
            if (esp === 'purchase'){
                let price = govPrice(gov).toLocaleString();
                desc = loc(`civics_spy_${esp}_desc`,[govTitle(gov),price])
            }
            else if (esp === 'annex'){
                if (global.city.morale.current >= (200 + global.civic.foreign[`gov${gov}`].hstl - global.civic.foreign[`gov${gov}`].unrest)){
                    desc = loc(`civics_spy_${esp}_desc`,[govTitle(gov)]);
                }
                else {
                    let morale = 200 + global.civic.foreign[`gov${gov}`].hstl - global.civic.foreign[`gov${gov}`].unrest
                    desc = loc(`civics_spy_${esp}_goal`,[govTitle(gov),morale]);
                }
            }
            else {
                desc = loc(`civics_spy_${esp}_desc`,[govTitle(gov)]);
            }
            
            let warn = '';
            if (
                (esp === 'influence' && global.civic.foreign[`gov${gov}`].hstl === 0) || 
                (esp === 'sabotage' && global.civic.foreign[`gov${gov}`].spy >= 2 && global.civic.foreign[`gov${gov}`].mil === 50) || 
                (esp === 'incite' && global.civic.foreign[`gov${gov}`].spy >= 4 && global.civic.foreign[`gov${gov}`].unrest === 100)
            ){
                warn = `<div class="has-text-danger">${loc(`civics_spy_warning`)}</div>`;
            }
            return $(`${warn}<div>${desc}</div>`);
        },
        {
            elm: `#espModal button`,
            self: true,
            classes: `has-background-light has-text-dark`
        }
    );
}

function taxCap(min){
    let extreme = global.tech['currency'] && global.tech.currency >= 5 ? true : false;
    if (min){
        return (extreme || global.race['terrifying']) && !global.race['noble'] ? 0 : (global.race['noble'] ? traits.noble.vars()[0] : 10);
    }
    else {
        let cap = 30;
        if (global.race['noble']){
            cap = traits.noble.vars()[1];
        }
        else if (extreme || global.race['terrifying']){
            cap += 20;
        }
        if (global.civic.govern.type === 'oligarchy'){
            cap += govEffect.oligarchy()[1];
        }
        let aristoVal = govActive('aristocrat',1);
        if (aristoVal){
            cap += aristoVal;
        }
        if (global.race['wish'] && global.race['wishStats']){
            cap += global.race.wishStats.tax;
        }
        return cap;
    }
}

function adjustTax(a,n){
    switch (a){
        case 'add':
            {
                let inc = n || keyMultiplier();
                let cap = taxCap(false);
                if (global.race['noble']){
                    global.civic.taxes.tax_rate += inc;
                    if (global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? traits.noble.vars()[1] + 20 : traits.noble.vars()[1])){
                        global.civic.taxes.tax_rate = global.civic.govern.type === 'oligarchy' ? traits.noble.vars()[1] + 20 : traits.noble.vars()[1];
                    }
                }
                else if (global.civic.taxes.tax_rate < cap){
                    global.civic.taxes.tax_rate += inc;
                    if (global.civic.taxes.tax_rate > cap){
                        global.civic.taxes.tax_rate = cap;
                    }
                }
            }
            break;
        case 'sub':
            {
                let dec = n || keyMultiplier();
                let min = taxCap(true);
                if (global.civic.taxes.tax_rate > min){
                    global.civic.taxes.tax_rate -= dec;
                    if (global.civic.taxes.tax_rate < min){
                        global.civic.taxes.tax_rate = min;
                    }
                }
            }
            break;
    }
}

export function taxRates(govern){
    var tax_rates = $('<div id="tax_rates" v-show="display" class="taxRate"></div>');
    govern.append(tax_rates);
    
    var label = $(`<h3 id="taxRateLabel">${loc('civics_tax_rates')}</h3>`);
    tax_rates.append(label);
    
    var tax_level = $('<span class="current" v-html="$options.filters.tax_level(tax_rate)"></span>');
    var sub = $(`<span role="button" aria-label="decrease taxes" class="sub has-text-success" @click="sub">&laquo;</span>`);
    var add = $(`<span role="button" aria-label="increase taxes" class="add has-text-danger" @click="add">&raquo;</span>`);
    tax_rates.append(sub);
    tax_rates.append(tax_level);
    tax_rates.append(add);
    
    vBind({
        el: '#tax_rates',
        data: global.civic['taxes'],
        filters: {
            tax_level(rate){
                let egg = easterEgg(11,14);
                let trick = trickOrTreat(2,14,false);
                if (egg.length > 0 && ((rate === 0 && !global.race['noble']) || (rate === 10 && global.race['noble']))){
                    return egg;
                }
                else if (rate === 13 && trick.length > 0){
                    return trick;
                }
                else {
                    return `${rate}%`;
                }
            }
        },
        methods: {
            add(){
                adjustTax('add');
            },
            sub(){
                adjustTax('sub');
            }
        }
    });
    
    popover('taxRateLabel', function(){
            return loc('civics_tax_rates_desc');
        },
        {
            classes: `has-background-light has-text-dark`
        }
    );
}

export function govCivics(f,v){
    switch (f){
        case 'm_cost':
            return mercCost();
        case 'm_buy':
            return hireMerc(1);
        case 's_cost':
            return spyCost(v);
        case 't_spy':
            return trainSpy(v);
        case 'adj_tax':
            return adjustTax(v,1);
        case 'tax_cap':
            return taxCap(v);
        case 's_influence':
            return spyAction('influence',v);
        case 's_sabotage':
            return spyAction('sabotage',v);
        case 's_incite':
            return spyAction('incite',v);
    }
}

export function mercCost(){
    let cost = Math.round((1.24 ** global.civic.garrison.workers) * 75) - 50;
    if (cost > 25000){
        cost = 25000;
    }
    if (global.civic.garrison.m_use > 0){
        cost *= 1.1 ** global.civic.garrison.m_use;
    }
    if (global.race['brute']){
        cost *= 1 - (traits.brute.vars()[0] / 100);
    }
    let fathom = fathomCheck('orc');
    if (fathom > 0){
        cost *= 1 - (traits.brute.vars(1)[0] / 100 * fathom);
    }
    if (global.race['inflation']){
        cost *= 1 + (global.race.inflation / 500);
    }
    if (global.race['high_pop']){
        cost *= traits.high_pop.vars()[1] / 100;
    }
    return Math.round(cost);
}

function hireMerc(num){
    let hired = 0;
    if (global.tech['mercs']){
        let repeats = num || keyMultiplier();
        let canBuy = true;
        while (canBuy && repeats > 0){
            let cost = mercCost();
            if (global.civic['garrison'].workers < global.civic['garrison'].max && global.resource.Money.amount >= cost){
                global.resource.Money.amount -= cost;
                global.civic['garrison'].workers++;
                global.civic.garrison.m_use++;
                hired++;
            }
            else {
                canBuy = false;
            }
            repeats--;
        }
    }
    return hired;
}

export function buildGarrison(garrison,full){
    clearElement(garrison);
    if (global.tech['world_control'] && !global.race['truepath']){
        garrison.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_garrison')}</h2> - <span class="has-text-success"><span class="defenseRating">${loc('rating')} {{ g.workers | hell | rating }}</span> - <span class="soldierRating"><span class="has-text-warning">${loc(`civics_garrison_soldier_rating`)}</span> {{ g.workers | single | rating(true) }}</span></div>`));
    }
    else {
        garrison.append($(`<div class="header"><h2 class="has-text-warning">${loc('civics_garrison')}</h2> - <span class="has-text-success"><span class="defenseRating">${loc('rating')} {{ g.workers | hell | rating }}</span> / <span class="offenseRating">{{ g.raid | rating }}</span></span> - <span class="soldierRating"><span class="has-text-warning">${loc(`civics_garrison_soldier_rating`)}</span> {{ g.workers | single | rating }}</span></div>`));
    }

    var soliders = $(`<div></div>`);
    garrison.append(soliders);

    var barracks = $('<div class="columns is-mobile bunk"></div>');
    soliders.append(barracks);

    var bunks = $('<div class="bunks"></div>');
    barracks.append(bunks);
    let soldier_title = global.tech['world_control'] && !global.race['truepath'] ? loc('civics_garrison_peacekeepers') : loc('civics_garrison_soldiers');
    if (!global.tech['isolation']){
        bunks.append($(`<div class="barracks"><span class="soldier">${soldier_title}</span> <span v-html="$options.filters.stationed(g.workers)"></span> / <span>{{ g.max | s_max }}<span></div>`));
        bunks.append($(`<div class="barracks" v-show="g.crew > 0"><span class="crew">${loc('civics_garrison_crew')}</span> <span>{{ g.crew }}</span></div>`));
        bunks.append($(`<div class="barracks"><span class="wounded">${loc('civics_garrison_wounded')}</span> <span v-html="$options.filters.wounded(g.wounded)"></span></div>`));

        barracks.append($(`<div class="hire"><button v-show="g.mercs" class="button first hmerc" @click="hire">${loc('civics_garrison_hire_mercenary')}</button><div>`));
    }
    
    if (full){
        let egg8 = '';
        if (global.tech['isolation']){
            egg8 = easterEgg(8,12);
        }

        garrison.append($(`<div class="training"><span>${loc('civics_garrison_training')} - ${loc('arpa_to_complete')} {{ g.rate, g.progress | trainTime }}${egg8}</span> <progress class="progress" :value="g.progress" max="100">{{ g.progress }}%</progress></div>`));
    }

    var campaign = $('<div class="columns is-mobile battle"></div>');
    soliders.append(campaign);

    var wrap = $('<div class="war"></div>');
    campaign.append(wrap);

    if ((!global.tech['world_control'] || global.race['truepath']) && !global.race['cataclysm'] && !global.tech['isolation']){
        var tactics = $(`<div id="${full ? 'tactics' : 'c_tactics'}" v-show="g.display" class="tactics"><span>${loc('civics_garrison_campaign')}</span></div>`);
        wrap.append(tactics);
            
        var strategy = $('<span class="current tactic">{{ g.tactic | tactics }}</span>');
        var last = $('<span role="button" aria-label="easier campaign" class="sub" @click="last">&laquo;</span>');
        var next = $('<span role="button" aria-label="harder campaign" class="add" @click="next">&raquo;</span>');
        tactics.append(last);
        tactics.append(strategy);
        tactics.append(next);

        var battalion = $(`<div id="${full ? 'battalion' : 'c_battalion'}" v-show="g.display" class="tactics"><span>${loc('civics_garrison_battalion')}</span></div>`);
        wrap.append(battalion);
            
        var armysize = $('<span class="current bat">{{ g.raid }}</span>');
        var alast = $('<span role="button" aria-label="remove soldiers from campaign" class="sub" @click="aLast">&laquo;</span>');
        var anext = $('<span role="button" aria-label="add soldiers to campaign" class="add" @click="aNext">&raquo;</span>');
        battalion.append(alast);
        battalion.append(armysize);
        battalion.append(anext);

        if (full){
            if (global.race['truepath'] && global.tech['rival']){
                campaign.append($(`<div class="launch gov3" v-show="rvis()"><div class="has-text-caution">${govTitle(3)}</div><button class="button campaign" @click="campaign(3)"><span>${loc('civics_garrison_launch_campaign')}</span></button></div>`));
            }
            if (!global.tech['world_control']){
                campaign.append($(`<div class="launch gov0"><div class="has-text-caution">${govTitle(0)}</div><button class="button campaign" @click="campaign(0)"><span v-show="!g0.occ && !g0.anx && !g0.buy">${loc('civics_garrison_launch_campaign')}</span><span v-show="g0.occ || g0.anx || g0.buy">${loc('civics_garrison_deoccupy')}</span></button></div>`));
                campaign.append($(`<div class="launch gov1"><div class="has-text-caution">${govTitle(1)}</div><button class="button campaign" @click="campaign(1)"><span v-show="!g1.occ && !g1.anx && !g1.buy">${loc('civics_garrison_launch_campaign')}</span><span v-show="g1.occ || g1.anx || g1.buy">${loc('civics_garrison_deoccupy')}</span></button></div>`));
                campaign.append($(`<div class="launch gov2"><div class="has-text-caution">${govTitle(2)}</div><button class="button campaign" @click="campaign(2)"><span v-show="!g2.occ && !g2.anx && !g2.buy">${loc('civics_garrison_launch_campaign')}</span><span v-show="g2.occ || g2.anx || g2.buy">${loc('civics_garrison_deoccupy')}</span></button></div>`));
            }
        }
    }

    let bindData = { 
        g: global.civic.garrison,
        g0: global.civic.foreign.gov0,
        g1: global.civic.foreign.gov1,
        g2: global.civic.foreign.gov2,
    };
    if (global.race['truepath']){
        bindData['g3'] = global.civic.foreign.gov3;
        bindData['g4'] = global.civic.foreign.gov4;
    }

    vBind({
        el: full ? '#garrison' : '#c_garrison',
        data: bindData,
        methods: {
            hire(){
                let hired = hireMerc();
                if (hired === 1 && !full){
                    let trick = trickOrTreat(8,14,true);
                    if (trick.length > 0){
                        $(`#c_garrison .hire`).append(trick);
                    }
                }
            },
            campaign(gov){
                war_campaign(gov);
            },
            next(){
                if (global.civic.garrison.tactic < 4){
                    global.civic.garrison.tactic++; 
                }
            },
            last(){
                if (global.civic.garrison.tactic > 0){
                    global.civic.garrison.tactic-- 
                }
            },
            aNext(){
                let inc = keyMultiplier();
                if (global.civic.garrison.raid < garrisonSize()){
                    global.civic.garrison.raid += inc;
                    if (global.civic.garrison.raid > garrisonSize()){
                        global.civic.garrison.raid = garrisonSize();
                    }
                }
            },
            aLast(){
                let dec = keyMultiplier();
                if (global.civic.garrison.raid > 0){
                    global.civic.garrison.raid -= dec;
                    if (global.civic.garrison.raid < 0){
                        global.civic.garrison.raid = 0;
                    }
                }
            },
            vis(){
                return global.civic.garrison.display;
            },
            rvis(){
                return global.tech['rival'] && !global.tech['isolation'] ? true : false;
            }
        },
        filters: {
            tactics(val){
                switch(val){
                    case 0:
                        return loc('civics_garrison_tactic_ambush');
                    case 1:
                        return loc('civics_garrison_tactic_raid');
                    case 2:
                        return loc('civics_garrison_tactic_pillage');
                    case 3:
                        return loc('civics_garrison_tactic_assault');
                    case 4:
                        return loc('civics_garrison_tactic_siege');
                }
            },
            rating(v,scale){
                if (scale){
                    return +(armyRating(v,'army',0) / v).toFixed(1);
                }
                return +armyRating(v,'army').toFixed(1);
            },
            hell(v){
                return garrisonSize();
            },
            single(v){
                return global.race['hivemind'] ? traits.hivemind.vars()[0] : 1;
            },
            stationed(v){
                let size = garrisonSize();
                let trickNum = global.race['cataclysm'] ? 13 : 31;
                let trick = size === trickNum && !full ? trickOrTreat(2,14,true) : false;
                return size === trickNum && trick.length > 0 ? trick : size;
            },
            s_max(v){
                return garrisonSize(true);
            },
            wounded(w){
                let egg = easterEgg(8,12);
                if (full && w === 0 && egg.length > 0){
                    return egg;
                }
                return eventActive('fool',2021) ? garrisonSize() - w : w;
            },
            trainTime(r,p){
                return r === 0 ? timeFormat(-1) : timeFormat((100 - p) / (r * 4));
            }
        }
    });

    ['tactic','bat','soldier','crew','wounded','hmerc','defenseRating','offenseRating','soldierRating'].forEach(function(k){
        popover(full ? `garrison${k}` : `cGarrison${k}`,
            function(){ return '<span v-html="label()"></span>'; },
            {
                elm: `${full ? '#garrison' : '#c_garrison'} .${k}`,
                in: function(obj){
                    vBind({
                        el: `#${obj.id} > span`,
                        data: { test: 'val' },
                        methods: {
                            label(){
                                switch(k){
                                    case 'tactic':
                                        {
                                            switch (global.civic.garrison.tactic){
                                                case 0:
                                                    return loc('civics_garrison_tactic_ambush_desc');
                                                case 1:
                                                    return loc('civics_garrison_tactic_raid_desc');
                                                case 2:
                                                    return loc('civics_garrison_tactic_pillage_desc');
                                                case 3:
                                                    return loc('civics_garrison_tactic_assault_desc');
                                                case 4:
                                                    return loc('civics_garrison_tactic_siege_desc',[jobScale(global.civic.govern.type === 'federation' ? 15 : 20)]);
                                            }
                                        }
                                    case 'bat':
                                        return loc('civics_garrison_army_label');
                                    case 'soldier':
                                        return describeSoldier();
                                    case 'crew':
                                        return loc('civics_garrison_crew_desc');
                                    case 'wounded':
                                        return loc('civics_garrison_wounded_desc');
                                    case 'hmerc':
                                        {
                                            let cost = Math.round(mercCost()).toLocaleString();
                                            return loc('civics_garrison_hire_mercenary_cost',[cost]);
                                        }
                                    case 'defenseRating':
                                        return loc('civics_garrison_defensive_rate');
                                    case 'offenseRating':
                                        return loc('civics_garrison_offensive_rate');
                                    case 'soldierRating':
                                        return soldierBreakdown('army');
                                }
                            }
                        }
                    });
                },
                out: function(obj){
                    vBind({el: obj.id},'destroy');
                },
            }
        );
    });

    if (full){
        let end = global.race['truepath'] ? 4 : 3;
        for (let i=0; i<end; i++){
            popover(`garrison${i}`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#garrison .gov${i} button`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    return battleAssessment(i);
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: obj.id},'destroy');
                    },
                }
            );
        }
        if (global.race['truepath'] && !global.tech['isolation']){
            popover(`garRivaldesc2`,
                function(){ return loc(`civics_gov_tp_rival`,[govTitle(3),races[global.race.species].home]); },
                {
                    elm: `#garrison .gov3 > div`,
                }
            );
        }
    }
}
