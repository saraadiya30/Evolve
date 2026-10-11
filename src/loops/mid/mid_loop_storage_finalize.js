// Finalisasi storage: konversi Crates/Containers, nilai crate dan container, bonus Aether, dan bonus portofolio stock ke batas resource. Dulu bagian dari midLoop_s5.
import { global, breakdown } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { crateValue, containerValue } from '../../resources/crate_value.js';
import { storageBonus, storageLots } from '../../stocks/stocks_core.js';

export function midLoopStorageFinalize($ctx){
        let tempCrates = $ctx.caps['Crates'], tempContainers = $ctx.caps['Containers'];
        Object.keys($ctx.caps).forEach(function (res){
            $ctx.caps['Crates'] -= global.resource[res].crates;
        });
        Object.keys($ctx.caps).forEach(function (res){
            $ctx.caps['Containers'] -= global.resource[res].containers;
        });
        if ($ctx.caps['Crates'] < 0){
            let diff = 0 - $ctx.caps['Crates'];
            Object.keys($ctx.caps).forEach(function (res){
                if (diff > 0){
                    let subAmount = global.resource[res].crates;
                    if (subAmount > diff){
                        subAmount = diff;
                    }
                    $ctx.caps['Crates'] += subAmount;
                    global.resource[res].crates -= subAmount;
                    diff -= subAmount;
                }
            });
        }
        if ($ctx.caps['Containers'] < 0){
            let diff = 0 - $ctx.caps['Containers'];
            Object.keys($ctx.caps).forEach(function (res){
                if (diff > 0){
                    let subAmount = global.resource[res].containers;
                    if (subAmount > diff){
                        subAmount = diff;
                    }
                    $ctx.caps['Containers'] += subAmount;
                    global.resource[res].containers -= subAmount;
                    diff -= subAmount;
                }
            });
        }

        breakdown.c.Crates[loc('crates_used')] = ($ctx.caps['Crates'] - tempCrates) + 'v';
        breakdown.c.Containers[loc('crates_used')] = ($ctx.caps['Containers'] - tempContainers) + 'v';

        let create_value = crateValue();
        let container_value = containerValue();

        let aetherStorageMult = 1;
        if (global.prestige.hasOwnProperty('Aether') && global.settings.aetherStorage > 0){
            let draw = Math.min(global.settings.aetherStorage, global.prestige.Aether.count);
            if (draw > 0){
                global.prestige.Aether.count -= draw;
                aetherStorageMult = 1 + (draw / 0.00000000001);
            }
        }

        Object.keys($ctx.caps).forEach(function (res){
            // Stock portfolio storage bonus: +1% storage per lot the player put on storage for that resource's company. Applied to the base storage
            // only, BEFORE crates and containers are added, so it does not enlarge what crates/containers give.
            if (global.stocks && global.stocks.market && global.stocks.market[res] && storageLots(global.stocks.market[res]) > 0){
                let mult = storageBonus(storageLots(global.stocks.market[res]));
                $ctx.caps[res] *= mult;
                if (breakdown.c[res]){
                    // Breakdown values are parsed as parseFloat(raw.slice(0,-1)) - a number plus one suffix char
                    // ('v' for a flat amount, '%' for a bonus). 'x1.87' broke that (sliced to 'x1.8', NaN, silently
                    // dropped from the tooltip), which is why this line never showed up next to the others. Written
                    // as a '%' bonus instead, same convention as the production bonus below in stocks.js.
                    breakdown.c[res][loc('stock_bonus_label')] = +((mult - 1) * 100).toFixed(2) + '%';
                }
            }
            let crate = global.resource[res].crates * create_value;
            $ctx.caps[res] += crate;
            let container = global.resource[res].containers * container_value;
            $ctx.caps[res] += container;
            if (res !== 'Money' && res !== global.race.species){
                $ctx.caps[res] *= aetherStorageMult;
            }
            if (breakdown.c[res]){
                breakdown.c[res][loc('resource_Crates_plural')] = crate+'v';
                breakdown.c[res][loc('resource_Containers_plural')] = container+'v';
            }
            global.resource[res].max = $ctx.caps[res];
            if (global.resource[res].amount > global.resource[res].max && res !== 'Sus' && res !== 'Money'){
                global.resource[res].amount = global.resource[res].max;
            }
            else if (global.resource[res].amount < 0){
                //global.resource[res].amount = 0;
            }
            if (global.resource[res].amount >= global.resource[res].max * 0.99){
                if (!$(`#res${res} .count`).hasClass('has-text-warning')){
                    $(`#res${res} .count`).addClass('has-text-warning');
                }
            }
            else if ($(`#res${res} .count`).hasClass('has-text-warning')){
                $(`#res${res} .count`).removeClass('has-text-warning');
            }
        });
}
