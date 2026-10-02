import { loc } from './locale.js';
import { global } from './vars.js';
import { checkHellRequirements, mechCost, mechSize, validWeapons, validEquipment } from './portal.js';

// Bagian dari gov_tasks (1 entri: mech .. mech), dipisah dari governor.js. Urutan entri sama persis.
export const gov_tasksPart2 = {
    mech: { // Mech Builder
        name: loc(`gov_task_mech`),
        req(){
            return global.stats.achieve.hasOwnProperty('corrupted') && global.stats.achieve.corrupted.l > 0 && checkHellRequirements('prtl_spire','mechbay') && global.portal.hasOwnProperty('mechbay') ? true : false;
        },
        task(){
            if ( $(this)[0].req() ){
                let ctype = global.race['warlord'] ? 'cyberdemon' : 'large';
                let mCosts = mechCost(ctype,false);
                let cost = mCosts.c;
                let soul = mCosts.s;
                let size = mechSize(ctype);

                let mechs = {
                    type: {}
                };

                let sizeTypes = global.race['warlord'] ? ['minion','fiend','cyberdemon','archfiend'] : ['small','medium','large','titan','collector'];
                let chassisTypes = global.race['warlord'] ? ['imp','flying_imp','hound','harpy','barghest','cambion','minotaur','nightmare','rakshasa','golem','hover','spider','wheel','tread','biped','quad','dragon','snake','gorgon','hydra'] : ['hover','spider','wheel','tread','biped','quad'];
                let weaponTypes = global.race['warlord'] ? ['laser','kinetic','shotgun','missile','flame','plasma','sonic','tesla','claws','venom','cold','shock','fire','acid','stone','iron','flesh','ice','magma','axe','hammer'] : ['plasma','laser','kinetic','shotgun','missile','flame','sonic','tesla'];
                let equipTypes = global.race['warlord'] ? ['shields','flare','seals','grapple','sonar','ablative','radiator','infrared','coolant','stabilizer','scavenger','scouter','darkvision','echo','thermal','manashield','cold','heat','athletic','lucky','stoneskin'] : ['shields','flare','seals','grapple','sonar','ablative','radiator','infrared','coolant','stabilizer'];
                sizeTypes.forEach(function(type){
                    mechs.type[type] = 0;
                    mechs[type] = {
                        chassis: {},
                        weapon: {},
                        equip: {}
                    };
                    chassisTypes.forEach(function(chassis){
                        mechs[type].chassis[chassis] = 0;
                    });
                    weaponTypes.map((a) => ({sort: Math.random(), value: a})).sort((a, b) => a.sort - b.sort).map((a) => a.value).forEach(function(weapon){
                        mechs[type].weapon[weapon] = 0;
                    });
                    equipTypes.forEach(function(equip){
                        mechs[type].equip[equip] = 0;
                    });
                });

                global.portal.mechbay.mechs.forEach(function(mech){
                    mechs.type[mech.size]++;
                    mechs[mech.size].chassis[mech.chassis]++;
                    mech.hardpoint.forEach(function(wep){
                        mechs[mech.size].weapon[wep]++;
                    });
                    mech.equip.forEach(function(equip){
                        mechs[mech.size].equip[equip]++;
                    });
                });

                if (global.race['warlord']){
                    if (mechs.type.minion < 16 || (mechs.type.minion < 32 && mechs.type.fiend >= 19 && mechs.type.cyberdemon >= 6 && mechs.type.archfiend >= 5)){
                        ctype = 'minion';
                        mCosts = mechCost(ctype,false);
                        cost = mCosts.c;
                        soul = mCosts.s;
                        size = mechSize(ctype);
                    }
                    else if (mechs.type.fiend < 14 || (mechs.type.cyberdemon >= 4 && mechs.type.fiend < 19)){
                        ctype = 'fiend';
                        mCosts = mechCost(ctype,false);
                        cost = mCosts.c;
                        soul = mCosts.s;
                        size = mechSize(ctype);
                    }
                    else if (mechs.type.cyberdemon < 4 || mechs.type.archfiend >= 5){
                        ctype = 'cyberdemon';
                        mCosts = mechCost(ctype,false);
                        cost = mCosts.c;
                        soul = mCosts.s;
                        size = mechSize(ctype);
                    }
                    else if (mechs.type.archfiend < 5){
                        ctype = 'archfiend';
                        mCosts = mechCost(ctype,false);
                        cost = mCosts.c;
                        soul = mCosts.s;
                        size = mechSize(ctype);
                    }
                }
                else {
                    if ((mechs.type.large >= 6 && mechs.type.small < 12) || (mechs.type.large >= 12 && mechs.type.titan >= 2 && mechs.type.small < 24)){
                        ctype = 'small';
                        mCosts = mechCost(ctype,false);
                        cost = mCosts.c;
                        soul = mCosts.s;
                        size = mechSize(ctype);
                    }
                    else if (mechs.type.large >= 6 && mechs.type.medium < 12){
                        ctype = 'medium';
                        mCosts = mechCost(ctype,false);
                        cost = mCosts.c;
                        soul = mCosts.s;
                        size = mechSize(ctype);
                    }
                    else if (mechs.type.large >= 12 && mechs.type.titan < 2){
                        mCosts = mechCost('titan',false);
                        if (mCosts.c <= global.portal.purifier.sup_max){
                            ctype = 'titan';
                            cost = mCosts.c;
                            soul = mCosts.s;
                            size = mechSize(ctype);
                        }
                    }
                }

                let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
                if (avail < size && global.blood['prepared'] && global.blood.prepared >= 3){
                    if (global.queue.queue.some(q => ['portal-purifier','portal-port','portal-base_camp','portal-mechbay','portal-waygate','portal-bazaar'].includes(q.id))){
                        return;
                    }

                    for (let i=0; i<global.portal.mechbay.mechs.length; i++){
                        if (!global.portal.mechbay.mechs[i]['infernal']){
                            let pattern = global.portal.mechbay.mechs[i];
                            ctype = pattern.size;
                            mCosts = mechCost(ctype,true);
                            cost = mCosts.c;
                            soul = mCosts.s;

                            let gems = Math.floor(soul / 2);
                            let supply = global.portal.purifier.supply + Math.floor(cost / 3);
                            if (supply > global.portal.purifier.sup_max){
                                supply = global.portal.purifier.sup_max;
                            }

                            if (supply >= cost && global.resource.Soul_Gem.amount + gems >= soul){
                                global.resource.Soul_Gem.amount += gems;
                                global.resource.Soul_Gem.amount -= soul;
                                global.portal.purifier.supply = supply;
                                global.portal.purifier.supply -= cost;
                                global.portal.mechbay.mechs[i]['infernal'] = true;

                                if (pattern.size === 'small' && pattern.equip.length === 0){
                                    global.portal.mechbay.mechs[i].equip.push('special');
                                }
                                else if ((pattern.size === 'medium' && pattern.equip.length === 1) || (pattern.size === 'large' && pattern.equip.length === 2) || (pattern.size === 'titan' && pattern.equip.length < 5)){
                                    let equip = '???';
                                    Object.keys(mechs[ctype].equip).forEach(function(val){
                                        if (equip === '???' || mechs[ctype].equip[val] < mechs[ctype].equip[equip]){
                                            if (equip !== val){
                                                equip = val;
                                            }
                                        }
                                    });
                                    if (!pattern.equip.includes('special')){
                                        global.portal.mechbay.mechs[i].equip.push('special');
                                    }
                                    else {
                                        global.portal.mechbay.mechs[i].equip.push(equip);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                else if (global.portal.purifier.supply >= cost && avail >= size && global.resource.Soul_Gem.amount >= soul){
                    let c_val = 99;
                    let chassis = 'hover';
                    let weapons = ctype === 'titan' ? ['???','???','???','???'] : ['???','???'];
                    let equipment = [];

                    if (global.race['warlord']){
                        let cList = ['imp','flying_imp','hound','harpy','barghest'];
                        if (ctype === 'fiend'){
                            cList = ['cambion','minotaur','nightmare','rakshasa','golem'];
                        }
                        else if (ctype === 'cyberdemon'){
                            cList = ['wheel','tread','biped','quad','spider','hover'];
                        }
                        else if (ctype === 'archfiend'){
                            cList = ['dragon','snake','gorgon','hydra'];
                        }

                        let counts = {};

                        cList.forEach(function(creature){
                            counts[creature] = { c: 0, w: {}, e: {} };
                            let weapons = validWeapons(ctype,creature,false);
                            weapons.forEach(function(wep){
                                counts[creature].w[wep] = 0;
                            });
                            let equip = validEquipment(ctype,creature,false);
                            equip.forEach(function(eq){
                                counts[creature].e[eq] = 0;
                            });
                        });

                        global.portal.mechbay.mechs.forEach(function(mech){
                            if (mech.size === ctype){
                                if (cList.includes(mech.chassis)){
                                    counts[mech.chassis].c++;
                                }
                                mech.hardpoint.forEach(function(wep){
                                    counts[mech.chassis].w[wep]++;
                                });
                                mech.equip.forEach(function(equip){
                                    counts[mech.chassis].e[equip]++;
                                });
                            }
                        });

                        if (ctype === 'minion'){
                            let type = 'imp';
                            if (counts.imp.c < 4 || counts.flying_imp.c < 4 || (mechs.type.minion >= 16 && (counts.imp.c < 8 || counts.flying_imp.c < 8))){
                                type = (counts.imp.c > counts.flying_imp.c) ? 'flying_imp' : 'imp';
                            }
                            else if (counts.hound.c < 4 || (mechs.type.minion >= 16 && counts.hound.c < 8)){
                                type = 'hound';
                            }
                            else if (counts.harpy.c < 2 || (mechs.type.minion >= 16 && counts.harpy.c < 8)){
                                type = 'harpy';
                            }
                            else if (counts.barghest.c < 2 || mechs.type.minion >= 16){
                                type = 'barghest';
                            }
                            chassis = type;

                            let wTypes = validWeapons(ctype,type,0).sort(() => Math.random() - 0.5);
                            let weapon = wTypes[0];
                            wTypes.forEach(function(wep){
                                if (['imp','flying_imp'].includes(type)){
                                    if (counts.imp.w[wep] + counts.flying_imp.w[wep] < counts.imp.w[weapon] + counts.flying_imp.w[weapon]){
                                        weapon = wep;
                                    }
                                }
                                else {
                                    if (counts[type].w[wep] < counts[type].w[weapon]){
                                        weapon = wep;
                                    }
                                }
                            });
                            weapons = [weapon];

                            if (global.blood['prepared']){
                                equipment = mechs.minion.equip.scavenger < 16 ? ['scavenger'] : ['scouter'];
                            }
                        }
                        else if (ctype === 'fiend'){
                            let type = 'golem';
                            if (counts.cambion.c < 4 || counts.rakshasa.c < 4){
                                type = (counts.cambion.c > counts.rakshasa.c) ? 'rakshasa' : 'cambion';
                            }
                            else if (counts.nightmare.c < 4){
                                type = 'nightmare';
                            }
                            else if (counts.minotaur.c < 2){
                                type = 'minotaur';
                            }
                            chassis = type;

                            let wTypes = validWeapons(ctype,type,0).sort(() => Math.random() - 0.5);
                            let weapon = wTypes[0];
                            wTypes.forEach(function(wep){
                                if (['cambion','rakshasa'].includes(type)){
                                    if (counts.cambion.w[wep] + counts.rakshasa.w[wep] < counts.cambion.w[weapon] + counts.rakshasa.w[weapon]){
                                        weapon = wep;
                                    }
                                }
                                else {
                                    if (counts[type].w[wep] < counts[type].w[weapon]){
                                        weapon = wep;
                                    }
                                }
                            });
                            weapons = [weapon];
                            
                            let eTypes = validEquipment(ctype,type,0).sort(() => Math.random() - 0.5);
                            let equip = eTypes[0];
                            let eTotals = {};
                            eTypes.forEach(function(eq){
                                eTotals[eq] = counts.cambion.e[eq] + counts.minotaur.e[eq] + counts.nightmare.e[eq] + counts.rakshasa.e[eq] + counts.golem.e[eq];
                            });
                            eTypes.forEach(function(eq){
                                if (eTotals[eq] < eTotals[equip]){
                                    equip = eq;
                                }
                            });
                            equipment.push(equip);

                            if (global.blood['prepared']){
                                let equip2 = eTypes[0] === equip ? eTypes[1] : eTypes[0];
                                eTypes.forEach(function(eq){
                                    if (eTotals[eq] < eTotals[equip2] && equip != eq){
                                        equip2 = eq;
                                    }
                                });
                                equipment.push(equip2);
                            }
                        }
                        else if (ctype === 'cyberdemon'){
                            let type = 'biped';
                            let typeList = ['wheel','tread','biped','quad','spider','hover'].sort(() => Math.random() - 0.5);
                            typeList.forEach(function(loco){
                                if (mechs[ctype].chassis[loco] < mechs[ctype].chassis[type]){
                                    type = loco;
                                }
                            });
                            chassis = type;

                            weapons = [];
                            let wTypes = validWeapons(ctype,type,0).sort(() => Math.random() - 0.5);
                            for (let i=0; i<2; i++){
                                let weapon = weapons.includes(wTypes[i]) ? wTypes[i+1] : wTypes[i];
                                wTypes.forEach(function(wep){
                                    if (mechs[ctype].weapon[wep] < mechs[ctype].weapon[weapon] && !weapons.includes(wep)){
                                        weapon = wep;
                                    }
                                });
                                mechs[ctype].weapon[weapon]++;
                                weapons.push(weapon);
                            }
                            
                            let eTypes = validEquipment(ctype,type,0).sort(() => Math.random() - 0.5);
                            let eTotals = {};
                            eTypes.forEach(function(eq){
                                eTotals[eq] = counts.wheel.e[eq] + counts.tread.e[eq] + counts.biped.e[eq] + counts.quad.e[eq] + counts.spider.e[eq] + counts.hover.e[eq];
                            });

                            equipment.push('special');
                            let slots = global.blood['prepared'] ? 2 : 1;
                            for (let i=0; i<slots; i++){
                                let equip = eTypes[0];
                                eTypes.forEach(function(eq){
                                    if (eTotals[eq] < eTotals[equip] && !equipment.includes(eq)){
                                        equip = eq;
                                    }
                                });
                                equipment.push(equip);
                                eTotals[equip]++;
                            }
                        }
                        else if (ctype === 'archfiend'){
                            let type = 'gorgon';
                            if (counts.hydra.c < 1){
                                type = 'hydra';
                            }
                            else if (counts.dragon.c < 1){
                                type = 'dragon';
                            }
                            else if (counts.snake.c < 1){
                                type = 'snake';
                            }
                            chassis = type;

                            if (type === 'hydra'){
                                weapons = [
                                    validWeapons(ctype,type,0)[0],
                                    validWeapons(ctype,type,1)[0],
                                    validWeapons(ctype,type,2)[0],
                                    validWeapons(ctype,type,3)[0]
                                ];
                            }
                            else {
                                if (['dragon','snake'].includes(type)){
                                    weapons = [
                                        validWeapons(ctype,type,0)[0]
                                    ];
                                }
                                else {
                                    weapons = [counts.gorgon.w.hammer < counts.gorgon.w.axe ? 'hammer' : 'axe'];
                                }

                                let wTypes = validWeapons(ctype,type,1).sort(() => Math.random() - 0.5);
                                let weapon = wTypes[0];
                                wTypes.forEach(function(wep){
                                    if (counts.dragon.w[wep] + counts.snake.w[wep] + counts.gorgon.w[wep] < counts.dragon.w[weapon] + counts.snake.w[weapon] + counts.gorgon.w[weapon]){
                                        weapon = wep;
                                    }
                                });
                                weapons.push(weapon);
                            }
                            
                            let eTypes = validEquipment(ctype,type,0).sort(() => Math.random() - 0.5);
                            let eTotals = {};
                            eTypes.forEach(function(eq){
                                eTotals[eq] = counts.dragon.e[eq] + counts.snake.e[eq] + counts.gorgon.e[eq] + counts.hydra.e[eq];
                            });

                            let slots = global.blood['prepared'] ? 5 : 4;
                            for (let i=0; i<slots; i++){
                                let equip = eTypes[0];
                                eTypes.forEach(function(eq){
                                    if (eTotals[eq] < eTotals[equip] && !equipment.includes(eq)){
                                        equip = eq;
                                    }
                                });
                                equipment.push(equip);
                                eTotals[equip]++;
                            }
                        }
                    }
                    else {
                        Object.keys(mechs[ctype].chassis).forEach(function(val){
                            if (mechs[ctype].chassis[val] < c_val){
                                c_val = mechs[ctype].chassis[val];
                                chassis = val;
                            }
                        });

                        let wCap = ctype === 'titan' ? 4 : 2;
                        for (let i=0; i<wCap; i++){
                            Object.keys(mechs[ctype].weapon).forEach(function(val){
                                if (weapons[i] === '???' || mechs[ctype].weapon[val] < mechs[ctype].weapon[weapons[i]]){
                                    if (!weapons.includes(val)){
                                        weapons[i] = val;
                                    }
                                }
                            });
                        }
                        
                        let equip = ['???','???','???','???'];
                        for (let i=0; i<4; i++){
                            Object.keys(mechs[ctype].equip).forEach(function(val){
                                if (equip[i] === '???' || mechs[ctype].equip[val] < mechs[ctype].equip[equip[i]]){
                                    if (!equip.includes(val)){
                                        equip[i] = val;
                                    }
                                }
                            });
                        }

                        equipment = global.blood['prepared'] ? equip : [equip[0],equip[1]];
                        if (ctype === 'small'){
                            weapons = [weapons[0]];
                            equipment = global.blood['prepared'] ? ['special'] : [];
                        }
                        else if (ctype === 'medium'){
                            weapons = [weapons[0]];
                            equipment = global.blood['prepared'] ? ['special',equip[0]] : ['special'];
                        }
                        else if (ctype === 'large'){
                            equipment = global.blood['prepared'] ? ['special',equip[0],equip[1]] : ['special',equip[0]];
                        }
                        else if (ctype === 'titan'){
                            equipment = global.blood['prepared'] ? ['special',equip[0],equip[1],equip[2],equip[3]] : ['special',equip[0],equip[1],equip[2]];
                        }
                    }

                    global.portal.purifier.supply -= cost;
                    global.resource.Soul_Gem.amount -= soul;
                    global.portal.mechbay.mechs.push({
                        chassis: chassis,
                        size: ctype,
                        equip: equipment,
                        hardpoint: weapons,
                        infernal: false
                    });
                    global.portal.mechbay.bay += size;
                    global.portal.mechbay.active++;
                }
            }
        }
    },
};
