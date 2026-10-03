import { global, sizeApproximation } from '../core/vars.js';
import { clearElement, vBind, deepClone, timeCheck, timeFormat } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { payCosts } from '../actions/actions.js';
import { mechCost } from './portal_f3.js';
import { mechSize } from './portal_f5.js';
import { drawMechLab_s1, drawMechLab_s2 } from '../sections/sec_drawMechLab_1.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function drawMechLab(){
    const $ctx = {};
    if (!global.settings.tabLoad && (global.settings.civTabs !== 2 || global.settings.govTabs !== 4)){
        return;
    }
    clearElement($('#mechLab'));
    if (global.portal.hasOwnProperty('mechbay') && global.settings.showMechLab){
        drawMechLab_s1($ctx);
        drawMechLab_s2($ctx);
    }
}

export function buildMechQueue(action){
    let size = mechSize(action.bp.size);
    let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
    if (avail >= size && payCosts(false, action.cost)){
        buildMech(deepClone(action.bp,true));
        return true;
    }
    return false;
}

export function buildMech(bp, queue){
    let mech = deepClone(bp);
    global.portal.mechbay.mechs.push(mech);
    global.portal.mechbay.bay += mechSize(mech.size);
    global.portal.mechbay.active++;
}

export function mechDesc(parent,obj){
    let mech = obj.type;
    let costs = mechCost(mech.size,mech.infernal,true);

    var desc = $(`<div class="shipPopper"></div>`);
    var mechPattern = $(`<div class="divider">${mech.infernal ? `${loc('portal_mech_infernal')} ` : ''}${loc(`portal_mech_size_${mech.size}`)} ${loc(`portal_mech_chassis_${mech.chassis}`)}</div>`);
    parent.append(desc);
    desc.append(mechPattern);

    var cost = $('<div class="costList"></div>');
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

export function validWeapons(size,type,point){
    let weaponList = ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla'];
    if (global.race['warlord']){
        switch (size){
            case 'minion':
                if (type === 'harpy'){
                    weaponList = ['claws','venom'];
                }
                else if (type === 'hound'){
                    weaponList = ['cold','shock','fire','acid'];
                }
                else if (type === 'barghest'){
                    weaponList = ['claws','venom'];
                }
                break;
            case 'fiend':
                if (type === 'minotaur'){
                    weaponList = ['axe','hammer'];
                }
                else if (type === 'nightmare'){
                    weaponList = ['cold','shock','fire','acid'];
                }
                else if (type === 'golem'){
                    weaponList = ['stone','iron','flesh','ice','magma'];
                }
                break;
            case 'archfiend':
                if (point === undefined || point === false){
                    weaponList = ['claws','venom','cold','shock','fire','acid'];
                    switch (type){
                        case 'dragon':
                            weaponList = ['claws','cold','shock','fire','acid'];
                            break;
                        case 'snake':
                            weaponList = ['venom','cold','shock','fire','acid'];
                            break;
                        case 'gorgon':
                            weaponList = ['axe','hammer','cold','shock','fire','acid'];
                            break;
                        case 'hydra':
                            weaponList = ['cold','shock','fire','acid'];
                            break;
                    }
                }
                else {
                    switch (type){
                        case 'dragon':
                            weaponList = point === 0 ? ['claws'] : ['cold','shock','fire','acid'];
                            break;
                        case 'snake':
                            weaponList = point === 0 ? ['venom'] : ['cold','shock','fire','acid'];
                            break;
                        case 'gorgon':
                            weaponList = point === 0 ? ['axe','hammer'] : ['cold','shock','fire','acid'];
                            break;
                        case 'hydra':
                            let list = ['cold','shock','fire','acid'];
                            weaponList = [list[point]];
                            break;
                    }
                }
                break;
        }
    }
    return weaponList;
}

export function validEquipment(size,type,point){
    let equipList = ['special','shields','sonar','grapple','infrared','flare','radiator','coolant','ablative','stabilizer','seals'];
    if (global.race['warlord']){
        switch (size){
            case 'minion':
                equipList = ['scavenger','scouter','darkvision','echo','thermal','manashield','cold','heat','athletic','lucky','stoneskin'];
                break;
            case 'fiend':
            case 'archfiend':
                equipList = ['darkvision','echo','thermal','manashield','cold','heat','athletic','lucky','stoneskin'];
                break;
        }
    }
    return equipList;
}
