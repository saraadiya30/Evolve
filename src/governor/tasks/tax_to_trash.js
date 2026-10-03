import { loc } from '../../core/locale.js';
import { global, p_on, breakdown } from '../../core/vars.js';
import { govCivics } from '../../civics/civics.js';
import { checkCityRequirements, actions, checkAffordable } from '../../actions/actions.js';
import { crateGovHook, atomic_mass } from '../../resources/resources.js';
import { hoovedRename, adjustCosts } from '../../functions/functions.js';
import { stabilize_blackhole } from '../../tech/tech.js';
import { gov_tasks } from './registry.js';
import { govActive } from '../governor.js';

// Bagian dari gov_tasks (14 entri: tax .. trash), dipisah dari governor.js. Urutan entri sama persis.
export const gov_tasksPart1 = {
    tax: { // Dynamic Taxes
        name: loc(`gov_task_tax`),
        req(){
            return global.civic.taxes.display;
        },
        task(){
            if ( $(this)[0].req() ){
                let add_morale = 1;
                if (global.civic.taxes.tax_rate >= 40){
                    add_morale += 0.5;
                }
                if (global.civic.govern.type === 'oligarchy'){
                    if (global.civic.taxes.tax_rate >= 20){
                        add_morale -= 0.5;
                    }
                }
                let max = govCivics('tax_cap',false);
                if (global.city.morale.current < 100 && global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? 45 : 25)){
                    while (global.city.morale.current < 100 && global.civic.taxes.tax_rate > (global.civic.govern.type === 'oligarchy' ? 45 : 25)){
                        govCivics('adj_tax','sub');
                    }
                }
                else if (global.city.morale.potential >= global.city.morale.cap + add_morale && global.civic.taxes.tax_rate < max){
                    govCivics('adj_tax','add');
                }
                else if (global.city.morale.current < global.city.morale.cap && global.civic.taxes.tax_rate > global.race.governor.config.tax.min){
                    govCivics('adj_tax','sub');
                }
            }
        }
    },
    storage: { // Crate/Container Construction
        name: loc(`gov_task_storage`),
        req(){
            return checkCityRequirements('storage_yard') && global.tech['container'] && global.resource.Crates.display ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                if (global.resource.Crates.amount < global.resource.Crates.max){
                    let mat = global.race['kindling_kindred'] || global.race['smoldering'] ? (global.race['smoldering'] ? 'Chrysotile' : 'Stone') : 'Plywood';
                    let cost = global.race['kindling_kindred'] || global.race['smoldering'] ? 200 : 10;
                    let reserve = global.race.governor.config.storage.crt;
                    if (global.resource[mat].amount > reserve + cost){
                        let build = Math.floor((global.resource[mat].amount - reserve) / cost);
                        crateGovHook('crate',build);
                    }
                }
                if (checkCityRequirements('warehouse') && global.resource.Containers.display && global.resource.Containers.amount < global.resource.Containers.max){
                    let cost = 125;
                    let reserve = global.race.governor.config.storage.cnt;
                    if (global.resource.Steel.amount > reserve + cost){
                        let build = Math.floor((global.resource.Steel.amount - reserve) / cost);
                        crateGovHook('container',build);
                    }
                }
            }
        }
    },
    bal_storage: { // Balanced Storage
        name: loc(`gov_task_bal_storage`),
        req(){
            return checkCityRequirements('storage_yard') && global.tech['container'] && global.resource.Crates.display ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let crates = global.resource.Crates.amount;
                let sCrate = crates;
                let containers = global.resource.Containers.amount;
                let sCon = containers;
                let active = 0;

                let res_list = Object.keys(global.resource).slice().reverse();

                res_list.forEach(function(res){
                    if (global.resource[res].display && global.resource[res].stackable){
                        crates += global.resource[res].crates;
                        containers += global.resource[res].containers;
                        active++;
                    }
                    else {
                        global.resource[res].crates = 0;
                        global.resource[res].containers = 0;
                    }
                });

                let crateSet = Math.floor(crates / active);
                let containerSet = Math.floor(containers / active);

                let dist = {
                    Food: { m: 0.1, cap: 100 },
                    Coal: { m: 0.25 },
                };

                if (global.race['artifical']){
                    delete dist.Food;
                }

                Object.keys(global.race.governor.config.bal_storage).forEach(function(res){
                    let val = Number(global.race.governor.config.bal_storage[res]);
                    if (res === 'Coal'){
                        dist[res] = { m: 0.125 * val };
                    }
                    else if (res === 'Food'){
                        dist[res] = { m: 0.05 * val, cap: 50 * val };
                    }
                    else if (global.resource[res]){
                        dist[res] = { m: val };
                    }
                });

                Object.keys(dist).forEach(function(r){
                    if (global.resource[r].display){
                        if (dist[r].hasOwnProperty('cap')){
                            active--;
                            {
                                let set = Math.floor(crateSet * dist[r].m);
                                if (dist[r].hasOwnProperty('cap') && set > dist[r].cap){ set = dist[r].cap; }
                                global.resource[r].crates = set;
                                crates -= set;
                            }
                            if (global.resource.Containers.display){
                                let set = Math.floor(containerSet * dist[r].m);
                                if (dist[r].hasOwnProperty('cap') && set > dist[r].cap){ set = dist[r].cap; }
                                global.resource[r].containers = set;
                                containers -= set;
                            }
                        }
                        else {
                            active += dist[r].m - 1;
                        }
                    }
                });
                
                crateSet = active !== 0 ? Math.floor(crates / active) : 0;
                containerSet = active !== 0 ? Math.floor(containers / active): 0;
                crates -= Math.floor(crateSet * active);
                containers -= Math.floor(containerSet * active);

                res_list.forEach(function(res){
                    if (dist[res] && dist[res].hasOwnProperty('cap')){
                        return;
                    }
                    if (global.race['artifical'] && res === 'Food'){
                        return;
                    }
                    if (global.resource[res].display && global.resource[res].stackable){
                        let multiplier = dist[res] ? dist[res].m : 1;
                        let crtAssign = Math.floor(crateSet > 0 ? crateSet * multiplier : 0);
                        global.resource[res].crates = crtAssign;
                        if (global.resource.Containers.display){
                            let cntAssign = Math.floor(containerSet > 0 ? containerSet * multiplier : 0);
                            global.resource[res].containers = cntAssign;
                        }
                        if (crates > 0 && multiplier >= 1){
                            let adjust = Math.ceil(multiplier / 2);
                            if (crates < adjust){ adjust = crates; }
                            global.resource[res].crates += adjust;
                            crates -= adjust;
                        }
                        if (containers > 0 && multiplier >= 1){
                            let adjust = Math.ceil(multiplier / 2);
                            if (containers < adjust){ adjust = containers; }
                            global.resource[res].containers += adjust;
                            containers -= adjust;
                        }
                    }
                });

                let max = 3;
                while (max > 0 && (crates > 0 || containers > 0)){
                    max--;
                    res_list.forEach(function(res){
                        if (dist[res] && dist[res].hasOwnProperty('cap')){
                            return;
                        }
                        if (global.race['artifical'] && res === 'Food'){
                            return;
                        }
                        if (global.resource[res].display && global.resource[res].stackable){
                            if (crates > 0){
                                global.resource[res].crates++;
                                crates--;
                            }
                            if (containers > 0){
                                global.resource[res].containers++;
                                containers--;
                            }
                        }
                    });
                }

                global.resource.Crates.amount = crates;
                global.resource.Containers.amount = containers;
                if (active){
                    global.resource.Crates.max -= sCrate;
                    global.resource.Containers.max -= sCon;
                }
            }
        }
    },
    combo_storage: {
        name: loc(`gov_task_combo_storage`),
        req(){
            return checkCityRequirements('storage_yard') && global.tech['container'] && global.resource.Crates.display && global.genes.governor >= 3 ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                gov_tasks.storage.task();
                gov_tasks.bal_storage.task();
            }
        }
    },
    assemble: { // Assemble Citizens
        name: loc(`gov_task_assemble`),
        req(){
            return global.race['artifical'] && (!global.tech['focus_cure'] || global.tech.focus_cure < 7) ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
                    actions.city.assembly.action();
                }
            }
        }
    },
    clone: { // Clone Citizens
        name: loc(`gov_task_clone`),
        req(){
            return global.tech['cloning'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                if (global['resource'][global.race.species].max > global['resource'][global.race.species].amount){
                    actions.tauceti.tau_home.cloning_facility.action();
                }
            }
        }
    },
    merc: { // Hire Mercs
        name: loc(`gov_task_merc`),
        req(){
            return checkCityRequirements('garrison') && global.tech['mercs'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let cashCap = global.resource.Money.max * (global.race.governor.config.merc.reserve / 100);
                while (global.civic.garrison.max > global.civic.garrison.workers + global.race.governor.config.merc.buffer && global.resource.Money.amount >= govCivics('m_cost') && (global.resource.Money.amount + global.resource.Money.diff >= cashCap || global.resource.Money.diff >= govCivics('m_cost')) ){
                    govCivics('m_buy');
                }
            }
        }
    },
    spy: { // Spy Recruiter
        name: loc(`gov_task_spy`),
        req(){
            if (global.tech['isolation']){
                return false;
            }
            if (global.race['truepath'] && global.tech['spy']){
                return true;
            }
            return global.tech['spy'] && !global.tech['world_control'] && !global.race['cataclysm'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let cashCap = global.resource.Money.max * (global.race.governor.config.spy.reserve / 100);
                let max = global.race['truepath'] && global.tech['rival'] ? 4 : 3;
                let min = global.tech['world_control'] ? 3 : 0;
                for (let i=min; i<max; i++){
                    let cost = govCivics('s_cost',i);
                    if (!global.civic.foreign[`gov${i}`].anx && !global.civic.foreign[`gov${i}`].buy && !global.civic.foreign[`gov${i}`].occ && global.civic.foreign[`gov${i}`].trn === 0 && global.resource.Money.amount >= cost && (global.resource.Money.diff >= cost || global.resource.Money.amount + global.resource.Money.diff >= cashCap)){
                        govCivics('t_spy',i);
                    }
                }
            }
        }
    },
    spyop: { // Spy Operator
        name: loc(`gov_task_spyop`),
        req(){
            if (global.tech['isolation']){
                return false;
            }
            if (global.race['truepath'] && global.tech['spy'] && global.tech.spy >= 2){
                return true;
            }
            return global.tech['spy'] && global.tech.spy >= 2 && !global.tech['world_control'] && !global.race['cataclysm'] ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let range = global.race['truepath'] && global.tech['rival'] ? [0,1,2,3] : [0,1,2];
                if (global.tech['world_control']){ range = [3]; }
                range.forEach(function(gov){
                    if (global.civic.foreign[`gov${gov}`].sab === 0 && global.civic.foreign[`gov${gov}`].spy > 0 && !global.civic.foreign[`gov${gov}`].anx && !global.civic.foreign[`gov${gov}`].buy && !global.civic.foreign[`gov${gov}`].occ){
                        global.race.governor.config.spyop[`gov${gov}`].every(function (mission){
                            switch (mission){
                                case 'influence':
                                    if (global.civic.foreign[`gov${gov}`].hstl > 0 && global.civic.foreign[`gov${gov}`].spy > 1){
                                        govCivics('s_influence',gov);
                                        return false;
                                    }
                                    break;
                                case 'sabotage':
                                    if (global.civic.foreign[`gov${gov}`].mil > 50){
                                        govCivics('s_sabotage',gov);
                                        return false;
                                    }
                                    break;
                                case 'incite':
                                    if (global.civic.foreign[`gov${gov}`].unrest < 100 && global.civic.foreign[`gov${gov}`].spy > 2 && gov < 3){
                                        govCivics('s_incite',gov);
                                        return false;
                                    }
                                    break;
                            }
                            return true;
                        });
                    }
                });
            }
        }
    },
    combo_spy: {
        name: loc(`gov_task_combo_spy`),
        req(){
            return (global.genes.governor >= 3) && gov_tasks.spyop.req();
        },
        task(){
            if ( $(this)[0].req() ){
                gov_tasks.spy.task();
                gov_tasks.spyop.task();
            }
        }
    },
    slave: { // Replace Slaves
        name(){ return loc(`gov_task_slave`,[global.resource.Slave.name]); },
        req(){
            return !global.race['orbit_decayed'] && checkCityRequirements('slave_market') && global.race['slaver'] && global.city['slave_pen'] ? true : false;
        },
        task(){
            let cashCap = global.resource.Money.max * (global.race.governor.config.slave.reserve / 100);
            let slaveCost = 25000;
            if (global.race['inflation']){
                slaveCost *= 1 + (global.race.inflation / 100);
            }
            let extraVal = govActive('extravagant',0);
            if (extraVal){
                slaveCost *= 1 + (extraVal / 100);
            }
            if ( $(this)[0].req() && global.resource.Money.amount >= slaveCost && (global.resource.Money.diff >= slaveCost || global.resource.Money.amount + global.resource.Money.diff >= cashCap) ){
                let max = global.city.slave_pen.count * 4;
                if (max > global.resource.Slave.amount){
                    actions.city.slave_market.action();
                }
            }
        }
    },
    sacrifice: { // Sacrifice Population
        name: loc(`gov_task_sacrifice`),
        req(){
            return checkCityRequirements('s_alter') && global.city.hasOwnProperty('s_alter') && global.city['s_alter'].count >= 1 ? true : false;
        },
        task(){
            if ( $(this)[0].req() && global.resource[global.race.species].amount === global.resource[global.race.species].max ){
                if ((!global.race['kindling_kindred'] && !global.race['smoldering'] && global.city.s_alter.harvest <= 10000) || global.city.s_alter.mind <= 10000 || global.city.s_alter.mine <= 10000 || global.city.s_alter.rage <= 10000 || global.city.s_alter.regen <= 10000){
                    actions.city.s_alter.action();
                }
            }
        }
    },
    horseshoe: { // Forge horseshoes
        name(){ return loc(`city_${hoovedRename(true)}`,[hoovedRename(false)]); },
        req(){
            return global.race['hooved'] ? true : false;
        },
        task(){
            let cost = actions.city.horseshoe.cost;
            if ( $(this)[0].req() && checkAffordable(cost)){
                cost = adjustCosts(actions.city.horseshoe);
                let res = 'Copper';
                let amount = 10;
                Object.keys(cost).forEach(function(r){
                    if (cost[r]() > 0){
                        res = r;
                        amount = cost[r]();
                    }
                });
                if (global.resource[res].amount > amount && (global.resource[res].diff >= amount || global.resource[res].amount + global.resource[res].diff >= global.resource[res].max) ){
                    actions.city.horseshoe.action();
                }
            }
        }
    },
    trash: {
        name: loc(`gov_task_trash`),
        req(){
            return global.interstellar['mass_ejector'] && global.interstellar.mass_ejector.count >= 1 ? true : false;
        },
        task(){
            let mass = function(m){
                return global.race.universe === 'magic' ? atomic_mass[m] : (['Elerium','Infernite'].includes(m) ? atomic_mass[m] * 10 : atomic_mass[m]);
            };
            let remain = p_on['mass_ejector'] * 1000;
            Object.keys(atomic_mass).sort((a,b) => (mass(a) < mass(b)) ? 1 : -1).forEach(function(res){
                let trade = breakdown.p.consume[res].hasOwnProperty(loc('trade')) ? breakdown.p.consume[res][loc('trade')]: 0;
                let craft = breakdown.p.consume[res].hasOwnProperty(loc('job_craftsman')) ? breakdown.p.consume[res][loc('job_craftsman')]: 0;
                if (trade < 0){ trade = 0; }
                if (craft > 0){ craft = 0; }

                if (global.race.governor.config.trash[res] || global.interstellar.mass_ejector.hasOwnProperty(res) && global.resource[res].display && global.resource[res].max > 0 && global.interstellar.mass_ejector[res] + global.resource[res].diff > 0 && global.resource[res].amount + trade - craft >= global.resource[res].max * 0.999 - 1){
                    let set = (global.resource[res].amount + trade - craft >= global.resource[res].max * 0.999 - 1) || (global.race.governor.config.trash[res] && !global.race.governor.config.trash[res].s)
                        ? Math.floor(global.interstellar.mass_ejector[res] + global.resource[res].diff)
                        : 0;
                    
                    if (global.race.governor.config.trash[res] && set < global.race.governor.config.trash[res].v && global.race.governor.config.trash[res].s){
                        set = Math.abs(global.race.governor.config.trash[res].v);
                    }
                    else if (global.race.governor.config.trash[res] && !global.race.governor.config.trash[res].s){
                        set = (global.resource[res].amount + trade - craft >= global.resource[res].max * 0.999 - 1) ? set : set - Math.abs(global.race.governor.config.trash[res].v);
                    }
                    if (set > remain){ set = remain; }
                    if (set < 0){ set = 0; }
                    if (global.race['artifical'] && res === 'Food'){ set = 0; }
                    global.interstellar.mass_ejector[res] = set;
                    remain -= set;
                }
                else {
                    global.interstellar.mass_ejector[res] = 0;
                }
            });
            global.interstellar.mass_ejector.total = p_on['mass_ejector'] * 1000 - remain;

            if (global.genes.hasOwnProperty('governor') && global.genes.governor >= 3 && global.race.governor.config.trash.stab){
                stabilize_blackhole();
            }
        }
    },
};
