import { clearElement, vBind, calc_mastery, popover, trickOrTreat, easterEgg } from '../functions/functions.js';
import { global, keyMultiplier, breakdown, sizeApproximation } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { traits, fathomCheck } from '../races/races.js';
import { production } from './prod.js';
import { craftingRatio } from './resources.js';
import { tradeRatio } from '../config/trade.js';
import { galaxyOffers } from './resources_f2.js';
import { crateValue, containerValue } from './resources_f4.js';

// Fungsi-fungsi dipindah dari resources.js (urutan sumber dipertahankan). resources.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function galacticTrade(modal){
    let galaxyTrade = modal ? modal : $(`#galaxyTrade`);
    if (!modal){
        clearElement($(`#galaxyTrade`));
    }

    if (global.galaxy['trade']){
        galaxyTrade.append($(`<div class="market-item trade-header"><span class="has-text-special">${loc('galaxy_trade')}</span></div>`));

        let offers = galaxyOffers();
        for (let i=0; i<offers.length; i++){
            let offer = $(`<div class="market-item trade-offer"></div>`);
            galaxyTrade.append(offer);

            offer.append($(`<span class="offer-item has-text-success">${global.resource[offers[i].buy.res].name}</span>`));
            offer.append($(`<span class="offer-vol has-text-advanced">+{{ '${i}' | t_vol }}/s</span>`));
            
            offer.append($(`<span class="offer-item has-text-danger">${global.resource[offers[i].sell.res].name}</span>`));
            offer.append($(`<span class="offer-vol has-text-caution">-{{ '${i}' | s_vol }}/s</span>`));

            let trade = $(`<span class="trade"><span class="has-text-warning">${loc('resource_market_routes')}</span></span>`);
            offer.append(trade);
            
            let assign = loc('galaxy_freighter_assign',[global.resource[offers[i].buy.res].name,global.resource[offers[i].sell.res].name]);
            let unassign = loc('galaxy_freighter_unassign',[global.resource[offers[i].buy.res].name,global.resource[offers[i].sell.res].name]);
            trade.append($(`<b-tooltip :label="desc('${unassign}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="${unassign}" class="sub has-text-danger" @click="less('${i}')"><span>-</span></span></b-tooltip>`));
            trade.append($(`<span class="current">{{ g.f${i} }}</span>`));
            trade.append($(`<b-tooltip :label="desc('${assign}')" position="is-bottom" size="is-small" multilined animated><span role="button" aria-label="${assign}" class="add has-text-success" @click="more('${i}')"><span>+</span></span></b-tooltip>`));
            trade.append($(`<span role="button" class="zero has-text-advanced" @click="zero('${i}')">${loc('cancel_routes')}</span>`));
        }

        let totals = $(`<div class="market-item trade-offer"><div id="galacticTradeTotal"><span class="tradeTotal"><span class="has-text-caution">${loc('resource_market_galactic_trade_routes')}</span> {{ g.cur }} / {{ g.max }}</span></div></div>`);
        totals.append($(`<span role="button" class="zero has-text-advanced" @click="zero()">${loc('cancel_all_routes')}</span>`));
        galaxyTrade.append(totals);
    }

    vBind({
        el: modal ? '#specialModal' : '#galaxyTrade',
        data: {
            g: global.galaxy.trade,
            t: global.tech
        },
        methods: {
            less(idx){
                let keyMutipler = keyMultiplier();
                if (global.galaxy.trade[`f${idx}`] >= keyMutipler){
                    global.galaxy.trade[`f${idx}`] -= keyMutipler;
                    global.galaxy.trade.cur -= keyMutipler;
                }
                else {
                    global.galaxy.trade.cur -= global.galaxy.trade[`f${idx}`];
                    global.galaxy.trade[`f${idx}`] = 0;
                }
            },
            more(idx){
                let keyMutipler = keyMultiplier();
                if (global.galaxy.trade.cur < global.galaxy.trade.max){
                    if (keyMutipler > global.galaxy.trade.max - global.galaxy.trade.cur){
                        keyMutipler = global.galaxy.trade.max - global.galaxy.trade.cur;
                    }
                    global.galaxy.trade[`f${idx}`] += keyMutipler;
                    global.galaxy.trade.cur += keyMutipler;
                }
            },
            zero(idx){
                if (idx){
                    global.galaxy.trade.cur -= global.galaxy.trade[`f${idx}`];
                    global.galaxy.trade[`f${idx}`] = 0;
                }
                else {
                    let offers = galaxyOffers();
                    for (let i=0; i<offers.length; i++){
                        global.galaxy.trade.cur -= global.galaxy.trade[`f${i}`];
                        global.galaxy.trade[`f${i}`] = 0;
                    }
                }
            },
            desc(s){
                return s; 
            }
        },
        filters: {
            t_vol(idx){
                let offers = galaxyOffers();
                let buy_vol = offers[idx].buy.vol;
                if (global.race['persuasive']){
                    buy_vol *= 1 + (global.race['persuasive'] / 100);
                }
                if (global.race['devious']){
                    buy_vol *= 1 - (traits.devious.vars()[0] / 100);
                }
                if (global.race['merchant']){
                    buy_vol *= 1 + (traits.merchant.vars()[1] / 100);
                }
                let fathom = fathomCheck('goblin');
                if (fathom > 0){
                    buy_vol *= 1 + (traits.merchant.vars(1)[1] / 100 * fathom);
                }
                if (global.genes['trader']){
                    let mastery = calc_mastery();
                    buy_vol *= 1 + (mastery / 100);
                }
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    buy_vol *= 1 + (rank / 50);
                }
                buy_vol = +(buy_vol).toFixed(2);
                return buy_vol;
            },
            s_vol(idx){
                let offers = galaxyOffers();
                let sell_vol = offers[idx].sell.vol;
                if (global.stats.achieve.hasOwnProperty('trade')){
                    let rank = global.stats.achieve.trade.l;
                    if (rank > 5){ rank = 5; }
                    sell_vol *= 1 - (rank / 100);
                }
                sell_vol = +(sell_vol).toFixed(2);
                return sell_vol;
            }
        }
    });

    popover(`galacticTradeTotal`,function(){
        let bd = $(`<div class="resBreakdown"></div>`);
        if (breakdown.hasOwnProperty('gt_route')){
            Object.keys(breakdown.gt_route).forEach(function(k){
                if (breakdown.gt_route[k] > 0){
                    bd.append(`<div class="modal_bd"><span class="has-text-warning">${k}</span> <span>+${breakdown.gt_route[k]}</span></div>`);
                }
            });
        }
        bd.append(`<div class="modal_bd ${global.galaxy.trade.max > 0 ? 'sum' : ''}"><span class="has-text-caution">${loc('resource_market_galactic_trade_routes')}</span> <span>${global.galaxy.trade.max}</span></div>`);
        return bd;
    },{
        elm: `#galacticTradeTotal > span`
    });
}

export function unassignCrate(res){
    let keyMutipler = keyMultiplier();
    let cap = crateValue();
    if (keyMutipler > global.resource[res].crates){
        keyMutipler = global.resource[res].crates;
    }
    if (keyMutipler > 0){
        global.resource.Crates.amount += keyMutipler;
        global.resource.Crates.max += keyMutipler;
        global.resource[res].crates -= keyMutipler;
        global.resource[res].max -= (cap * keyMutipler);
    }
}

export function assignCrate(res){
    let keyMutipler = keyMultiplier();
    let cap = crateValue();
    if (keyMutipler > global.resource.Crates.amount){
        keyMutipler = global.resource.Crates.amount;
    }
    if (keyMutipler > 0){
        global.resource.Crates.amount -= keyMutipler;
        global.resource.Crates.max -= keyMutipler;
        global.resource[res].crates += keyMutipler;
        global.resource[res].max += (cap * keyMutipler);
    }
}

export function unassignContainer(res){
    let keyMutipler = keyMultiplier();
    let cap = containerValue();
    if (keyMutipler > global.resource[res].containers){
        keyMutipler = global.resource[res].containers;
    }
    if (keyMutipler > 0){
        global.resource.Containers.amount += keyMutipler;
        global.resource.Containers.max += keyMutipler;
        global.resource[res].containers -= keyMutipler;
        global.resource[res].max -= (cap * keyMutipler);
    }
}

export function assignContainer(res){
    let keyMutipler = keyMultiplier();
    let cap = containerValue();
    if (keyMutipler > global.resource.Containers.amount){
        keyMutipler = global.resource.Containers.amount;
    }
    if (keyMutipler > 0){
        global.resource.Containers.amount -= keyMutipler;
        global.resource.Containers.max -= keyMutipler;
        global.resource[res].containers += keyMutipler;
        global.resource[res].max += (cap * keyMutipler);
    }
}

export function containerItem(mount,market_item,name,color){
    if (!global.settings.tabLoad && (global.settings.civTabs !== 4 || global.settings.marketTabs !== 1)){
        return;
    }

    market_item.append($(`<h3 class="res has-text-${color}">{{ name }}</h3>`));

    if (global.resource.Crates.display){
        let crate = $(`<span class="trade"><span class="has-text-warning">${global.resource.Crates.name}</span></span>`);
        market_item.append(crate);

        crate.append($(`<span role="button" aria-label="remove ${global.resource[name].name} ${global.resource.Crates.name}" class="sub has-text-danger" @click="subCrate('${name}')"><span>&laquo;</span></span>`));
        crate.append($(`<span class="current" v-html="$options.filters.cCnt(crates,'${name}')"></span>`));
        crate.append($(`<span role="button" aria-label="add ${global.resource[name].name} ${global.resource.Crates.name}" class="add has-text-success" @click="addCrate('${name}')"><span>&raquo;</span></span>`));
    }

    if (global.resource.Containers.display){
        let container = $(`<span class="trade"><span class="has-text-warning">${global.resource.Containers.name}</span></span>`);
        market_item.append(container);

        container.append($(`<span role="button" aria-label="remove ${global.resource[name].name} ${global.resource.Containers.name}" class="sub has-text-danger" @click="subCon('${name}')"><span>&laquo;</span></span>`));
        container.append($(`<span class="current" v-html="$options.filters.trick(containers)"></span>`));
        container.append($(`<span role="button" aria-label="add ${global.resource[name].name} ${global.resource.Containers.name}" class="add has-text-success" @click="addCon('${name}')"><span>&raquo;</span></span>`));
    }

    vBind({
        el: mount,
        data: global.resource[name],
        methods: {
            addCrate(res){
                assignCrate(res);
            },
            subCrate(res){
                unassignCrate(res);
            },
            addCon(res){
                assignContainer(res);
            },
            subCon(res){
                unassignContainer(res);
            }
        },
        filters: {
            trick(v){
                if (name === 'Stone' && global.resource[name].crates === 10 && global.resource[name].containers === 31){
                    let trick = trickOrTreat(4,13,true);
                    if (trick.length > 0){
                        return trick;
                    }
                }
                return v;
            },
            cCnt(ct,res){
                if ((res === 'Food' && !global.race['artifical']) || (global.race['artifical'] && res === 'Coal') || res === 'Souls'){
                    let egg = easterEgg(13,10);
                    if (ct === 10 && egg.length > 0){
                        return '1'+egg;
                    }
                }
                return ct;
            }
        }
    });
}

export function tradeSellPrice(res){
    let divide = 4;
    if (global.race['merchant']){
        divide *= 1 - (traits.merchant.vars()[0] / 100);
    }
    let fathom = fathomCheck('goblin');
    if (fathom > 0){
        divide *= 1 - (traits.merchant.vars(1)[0] / 100 * fathom);
    }
    if (global.race['asymmetrical']){
        divide *= 1 + (traits.asymmetrical.vars()[0] / 100);
    }
    if (global.race['devious']){
        divide *= 1 + (traits.devious.vars()[0] / 100);
    }
    if (global.race['conniving']){
        divide--;
    }
    let price = global.resource[res].value * tradeRatio[res] / divide;
    if (global.city['wharf']){
        price = price * (1 + (global.city['wharf'].count * 0.01));
    }
    if (global.space['gps'] && global.space['gps'].count > 3){
        price = price * (1 + (global.space['gps'].count * 0.01));
    }
    if (global.tech['railway']){
        let boost = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? 0.03 : 0.02;
        price = price * (1 + (global.tech['railway'] * boost));
    }
    if (global.race['truepath'] && !global.race['lone_survivor']){
        price *= 1 - (global.civic.foreign.gov3.hstl / 101);
    }
    if (global.race['inflation']){
        price *= 1 + (global.race.inflation / 500);
    }
    if (global.race['witch_hunter'] && global.resource.Sus.amount > 50){
        let wariness = (global.resource.Sus.amount - 50) / 52;
        price *= 1 - wariness;
    }
    price *= production('psychic_cash');
    price = +(price).toFixed(1);
    return price;
}

export function tradeBuyPrice(res){
    let rate = global.resource[res].value;
    if (global.race['arrogant']){
        rate *= 1 + (traits.arrogant.vars()[0] / 100);
    }
    if (global.race['conniving']){
        rate *= 1 - (traits.conniving.vars()[0] / 100);
    }
    let impFathom = fathomCheck('imp');
    if (impFathom > 0){
        rate *= 1 - (traits.conniving.vars(1)[0] / 100 * impFathom);
    }
    let price = rate * tradeRatio[res];
    if (global.city['wharf']){
        price = price * (0.99 ** global.city['wharf'].count);
    }
    if (global.space['gps'] && global.space['gps'].count > 3){
        price = price * (0.99 ** global.space['gps'].count);
    }
    if (global.tech['railway']){
        let boost = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? 0.97 : 0.98;
        price = price * (boost ** global.tech['railway']);
    }
    if (global.race['truepath'] && !global.race['lone_survivor']){
        price *= 1 + (global.civic.foreign.gov3.hstl / 101);
    }
    if (global.race['inflation']){
        price *= 1 + (global.race.inflation / 300);
    }
    if (global.race['quarantine']){
        price *= 1 + Math.round(global.race.quarantine ** 3.5);
    }
    if (global.race['witch_hunter'] && global.resource.Sus.amount > 50){
        let wariness = (global.resource.Sus.amount - 50) / 8;
        price *= 1 + wariness;
    }
    price = +(price).toFixed(1);
    return price;
}

export function craftingPopover(id,res,type,extra){
    popover(`${id}`,function(){
        let bd = $(`<div class="resBreakdown"><div class="has-text-info">{{ res.name | namespace }}</div></div>`);
        let table = $(`<div class="parent"></div>`);
        bd.append(table);
        
        let craft_total = craftingRatio(res,type);

        let col1 = $(`<div></div>`);
        table.append(col1);
        if (type === 'auto' && breakdown.p[res]){
            Object.keys(breakdown.p[res]).forEach(function (mod){
                let raw = breakdown.p[res][mod];
                let val = parseFloat(raw.slice(0,-1));
                if (val != 0 && !isNaN(val)){
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    mod = mod.replace(/'/g, "\\'");
                    col1.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ ${[res]}['${mod}'] | translate }}</span></div>`);
                }
            });
        }
        Object.keys(craft_total.multi_bd).forEach(function (mod){
            let raw = craft_total.multi_bd[mod];
            let val = parseFloat(raw.slice(0,-1));
            if (val != 0 && !isNaN(val)){
                let type = val > 0 ? 'success' : 'danger';
                let label = mod.replace(/\+.+$/,"");
                mod = mod.replace(/'/g, "\\'");
                col1.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ craft.multi_bd['${mod}'] | translate }}</span></div>`);
            }
        });
        
        let col2 = $(`<div class="col"></div>`);
        let title = $(`<div class="has-text-info">${loc(`craft_tools_multi`)}</div>`);
        col2.append(title);
        let count = 0;
        Object.keys(craft_total.add_bd).forEach(function (mod){
            let raw = craft_total.add_bd[mod];
            let val = parseFloat(raw.slice(0,-1));
            if (val != 0 && !isNaN(val)){
                count++;
                let type = val > 0 ? 'success' : 'danger';
                let label = mod.replace(/\+.+$/,"");
                mod = mod.replace(/'/g, "\\'");
                col2.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ craft.add_bd['${mod}'] | translate }}</span></div>`);
            }
        });
        if (count > 0){
            table.append(col2);
        }

        if (breakdown.p.consume && breakdown.p.consume[res]){
            let col3 = $(`<div class="col"></div>`);
            let count = 0;
            Object.keys(breakdown.p.consume[res]).forEach(function (mod){                
                let val = breakdown.p.consume[res][mod];
                if (val != 0 && !isNaN(val)){
                    count++;
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    mod = mod.replace(/'/g, "\\'");
                    col3.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ consume.${res}['${mod}'] | fix | translate }}</span></div>`);
                }
            });
            if (count > 0){
                table.append(col3);
            }
        }
        
        if (global['resource'][res].diff < 0 && global['resource'][res].amount > 0){
            bd.append(`<div class="modal_bd sum"><span>${loc('to_empty')}</span><span class="has-text-danger">{{ res.amount | counter }}</span></div>`);
        }
        
        if (extra){
            bd.append(`<div class="modal_bd sum"></div>`);
            bd.append(extra);
        }
        return bd;
    },{
        in: function(){
            vBind({
                el: `#popper > div`,
                data: {
                    [res]: breakdown.p[res],
                    res: global['resource'][res],
                    'consume': breakdown.p['consume'],
                    craft: craftingRatio(res,type)
                }, 
                filters: {
                    translate(raw){
                        let type = raw[raw.length -1];
                        let val = parseFloat(raw.slice(0,-1));
                        let precision = (val > 0 && val < 1) || (val < 0 && val > -1) ? 4 
                            : ((val > 0 && val < 10) || (val < 0 && val > -10) ? 3 : 2);
                        val = +(val).toFixed(precision);
                        let suffix = type === '%' ? '%' : '';
                        if (val > 0){
                            return '+' + sizeApproximation(val,precision) + suffix;
                        }
                        else if (val < 0){
                            return sizeApproximation(val,precision) + suffix;
                        }
                    },
                    fix(val){
                        return val + 'v';
                    },
                    counter(val){
                        let rate = -global['resource'][res].diff;
                        let time = +(val / rate).toFixed(0);
                        
                        if (time > 60){
                            let secs = time % 60;
                            let mins = (time - secs) / 60;
                            if (mins >= 60){
                                let r = mins % 60;
                                let hours = (mins - r) / 60;
                                return `${hours}h ${r}m`;
                            }
                            else {
                                return `${mins}m ${secs}s`;
                            }
                        }
                        else {
                            return `${time}s`;
                        }
                    },
                    namespace(name){
                        return name.replace("_"," ");
                    }
                }
            });
        },
        out: function(){
            vBind({el: `#popper > div`},'destroy');
        },
        classes: `breakdown has-background-light has-text-dark`,
        prop: {
            modifiers: {
                preventOverflow: { enabled: false },
                hide: { enabled: false }
            }
        }
    });
}

export function breakdownPopover(id,name,type){
    popover(`${id}`,function(){
        let bd = $(`<div class="resBreakdown"><div class="has-text-info">{{ res.name | namespace }}</div></div>`);
        if(type === 'p' && name === global.race.species){
            bd = $(`<div class="resBreakdown"><div class="has-text-info">${loc('starvation_resist')}</div></div>`);
        }
        let table = $(`<div class="parent"></div>`);
        bd.append(table);
        let prevCol = false;
        
        if (breakdown[type][name] && !(global.race.species === name && type === 'p')){
            let col1 = $(`<div></div>`);
            table.append(col1);
            let types = [name];
            types.push('Global');
            for (var i = 0; i < types.length; i++){
                let t = types[i];
                if (breakdown[type][t]){
                    Object.keys(breakdown[type][t]).forEach(function (mod){
                        let raw = breakdown[type][t][mod];
                        let val = parseFloat(raw.slice(0,-1));
                        if (val != 0 && !isNaN(val)){
                            prevCol = true;
                            let type = val > 0 ? 'success' : 'danger';
                            let label = mod.replace(/\+.+$/,"");
                            mod = mod.replace(/'/g, "\\'");
                            col1.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ ${t}['${mod}'] | translate }}</span></div>`);
                        }
                    });
                }
            }
        }

        if (breakdown[type].consume && breakdown[type].consume[name]){
            let col2 = $(`<div class="${prevCol ? 'col' : ''}"></div>`);
            let count = 0;
            Object.keys(breakdown[type].consume[name]).forEach(function (mod){                
                let val = breakdown[type].consume[name][mod];
                if (val != 0 && !isNaN(val)){
                    count++;
                    let type = val > 0 ? 'success' : 'danger';
                    let label = mod.replace(/\+.+$/,"");
                    mod = mod.replace(/'/g, "\\'");
                    col2.append(`<div class="modal_bd"><span>${label}</span><span class="has-text-${type}">{{ consume.${name}['${mod}'] | fix | translate }}</span></div>`);
                }
            });
            if (count > 0){
                table.append(col2);
            }
        }

        if (type === 'p' && name !== global.race.species){
            let dir = global['resource'][name].diff > 0 ? 'success' : 'danger';
            bd.append(`<div class="modal_bd sum"><span>{{ res.diff | direction }}</span><span class="has-text-${dir}">{{ res.amount | counter }}</span></div>`);
        }

        return bd;
    },{
        in: function(){
            vBind({
                el: `#popper > div`,
                data: {
                    'Global': breakdown[type]['Global'],
                    [name]: breakdown[type][name],
                    'consume': breakdown[type]['consume'],
                    res: global['resource'][name]
                }, 
                filters: {
                    translate(raw){
                        let type = raw[raw.length -1];
                        let val = parseFloat(raw.slice(0,-1));
                        let precision = (val > 0 && val < 1) || (val < 0 && val > -1) ? 4 
                            : ((val > 0 && val < 10) || (val < 0 && val > -10) ? 3 : 2);
                        let suffix = type === '%' ? '%' : '';
                        if (val > 0){
                            return '+' + sizeApproximation(val,precision) + suffix;
                        }
                        else if (val < 0){
                            return sizeApproximation(val,precision) + suffix;
                        }
                    },
                    fix(val){
                        return val + 'v';
                    },
                    counter(val){
                        let rate = global['resource'][name].diff;
                        let time = 0;
                        if (rate < 0){
                            rate *= -1;
                            time = +(val / rate).toFixed(0);
                        }
                        else {
                            let gap = global['resource'][name].max - val;
                            time = +(gap / rate).toFixed(0);
                        }
    
                        if (time === Infinity || Number.isNaN(time)){
                            return 'Never';
                        }
                        
                        if (time > 60){
                            let secs = time % 60;
                            let mins = (time - secs) / 60;
                            if (mins >= 60){
                                let r = mins % 60;
                                let hours = (mins - r) / 60;
                                return `${hours}h ${r}m`;
                            }
                            else {
                                return `${mins}m ${secs}s`;
                            }
                        }
                        else {
                            return `${time}s`;
                        }
                    },
                    direction(val){
                        return val >= 0 ? loc('to_full') : loc('to_empty');
                    },
                    namespace(name){
                        return name.replace("_"," ");
                    }
                }
            });
        },
        out: function(){
            vBind({el: `#popper > div`},'destroy');
        },
        classes: `breakdown has-background-light has-text-dark`,
        prop: {
            modifiers: {
                preventOverflow: { enabled: false },
                hide: { enabled: false }
            }
        }
    });
}
