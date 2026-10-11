// validWeapons / validEquipment / buildMech: validasi desain mech. Dipisah dari mech_lab.js.
import { global } from '../../core/vars.js';
import { deepClone } from '../../core/object_utils.js';
import { mechSize } from './mechbay.js';

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

export function buildMech(bp, queue){
    let mech = deepClone(bp);
    global.portal.mechbay.mechs.push(mech);
    global.portal.mechbay.bay += mechSize(mech.size);
    global.portal.mechbay.active++;
}
