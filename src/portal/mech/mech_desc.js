// mechDesc: deskripsi desain mech. Dipisah dari mech_lab.js supaya functions/queues.js tidak meng-import lab mech.
import { mechCost } from './mech_cost.js';
import { loc } from '../../core/locale.js';
import { timeCheck, timeFormat } from '../../functions/time_format.js';
import { global, sizeApproximation } from '../../core/vars.js';
import { vBind } from '../../functions/dom_helpers.js';

export function mechDesc(parent,obj){
    let mech = obj.type;
    let costs = mechCost(mech.size,mech.infernal,true);

    let desc = $(`<div class="shipPopper"></div>`);
    let mechPattern = $(`<div class="divider">${mech.infernal ? `${loc('portal_mech_infernal')} ` : ''}${loc(`portal_mech_size_${mech.size}`)} ${loc(`portal_mech_chassis_${mech.chassis}`)}</div>`);
    parent.append(desc);
    desc.append(mechPattern);

    let cost = $('<div class="costList"></div>');
    desc.append(cost);

    let weapons = [];
    mech.hardpoint.forEach(function(hp){
        weapons.push(`<span class="has-text-danger">${loc(`portal_mech_weapon_${hp}`)}</span>`);
    });
    desc.append(`<div>${weapons.join(', ')}</div>`);

    let equip = [];
    mech.equip.forEach(function(eq){
        let type = eq;
        if (type === 'special'){
            switch (mech.size){
                case 'large':
                case 'cyberdemon':
                    type = 'battery';
                    break;
                case 'titan':
                    type = 'target';
                    break;
                default:
                    type = 'jumpjet';
                    break;
            }
        }
        equip.push(`<span class="has-text-warning">${loc(`portal_mech_equip_${type}`)}</span>`);
    });
    desc.append(`<div>${equip.join(', ')}</div>`);

    let tc = timeCheck({ id: `${mech.size}${Math.rand(0,100)}` , cost: costs, doNotAdjustCost: true }, false, true);
    Object.keys(costs).forEach(function (res){
        if (costs[res]() > 0){
            let label = res === 'Money' ? '$' : (res === 'Supply' ? loc('resource_Supply_name') : global.resource[res].name) + ': ';
            let amount = res === 'Supply' ? global.portal.purifier.supply : global.resource[res].amount;
            let color = amount >= costs[res]() ? 'has-text-dark' : ( res === tc.r ? 'has-text-danger' : 'has-text-alert');
            cost.append($(`<div class="${color}" data-${res}="${costs[res]()}">${label}${sizeApproximation(costs[res](),2)}</div>`));
        }
    });

    if (tc && tc['t']){
        desc.append($(`<div class="divider"></div><div id="popTimer" class="flair has-text-advanced">{{ t | timer }}</div>`));
        vBind({
            el: '#popTimer',
            data: tc,
            filters: {
                timer(t){
                    return loc('action_ready',[timeFormat(t)]);
                }
            }
        });
    }
    
    return desc;
}
