import { global, keyMap } from './vars.js';
import { loc } from './locale.js';
import { validWeapons, validEquipment, buildMech, drawMechLab } from './portal_f4.js';
import { vBind, deepClone, buildQueue, clearPopper, popover } from './functions.js';
import { mechCost } from './portal_f3.js';
import { mechSize, drawMechs } from './portal_f5.js';

// Bagian dari drawMechLab (portal_f4.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function drawMechLab_s1($ctx){
        $ctx.lab = $(`#mechLab`);

        if (!global.portal.mechbay.hasOwnProperty('blueprint')){
            global.portal.mechbay['blueprint'] = {
                size: 'small',
                hardpoint: ['laser'],
                chassis: 'tread',
                equip: [],
                infernal: false
            };
        }

        let assemble = $(`<div id="mechAssembly" class="mechAssembly"></div>`);
        $ctx.lab.append(assemble);

        let title = $(`<div><span class="has-text-caution">${loc(global.race['warlord'] ? `portal_mech_spawn` : `portal_mech_assembly`)}</span> - <span>{{ b.size | slabel }} {{ b.chassis | clabel }}</span></div>`);
        assemble.append(title);

        title.append(` | <span><span class="has-text-warning">${loc(global.race['warlord'] ? `portal_mech_lair_space` : 'portal_mech_bay_space')}</span>: {{ m.bay }} / {{ m.max }}</span>`);
        title.append(` | <span><span class="has-text-warning">${loc('portal_mech_sup_avail')}</span>: {{ p.supply | round }} / {{ p.sup_max }}</span>`);

        let infernal = global.blood['prepared'] && global.blood.prepared >= 3 ? `<b-checkbox class="patrol" v-model="b.infernal">${loc('portal_mech_infernal')} (${loc('portal_mech_infernal_effect',[25])})</b-checkbox>` : ``;
        assemble.append(`<div><span class="has-text-warning">${loc(global.race['warlord'] ? `portal_mech_lair` : `portal_mech_space`)}</span> <span class="has-text-danger">{{ b.size | bay }}</span> | <span class="has-text-warning">${loc(`portal_mech_cost`)}</span> <span class="has-text-danger">{{ b.size | price }}</span> | <span class="has-text-warning">${loc(`portal_mech_soul`,[global.resource.Soul_Gem.name])}</span> <span class="has-text-danger">{{ b.size | soul }}</span>${infernal}</div>`)
        assemble.append(`<div>{{ b.size | desc }}</div>`);

        let options = $(`<div class="bayOptions"></div>`);
        assemble.append(options);

        let sizes = ``;
        let sizeTypes = global.race['warlord'] ? ['minion','fiend','cyberdemon','archfiend'] : ['small','medium','large','titan','collector'];
        sizeTypes.forEach(function(size,idx){
            sizes += `<b-dropdown-item aria-role="listitem" v-on:click="setSize('${size}')" class="size r0 a${idx}" data-val="${size}">${loc(`portal_mech_size_${size}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_size`)}: {{ b.size | slabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${sizes}
        </b-dropdown>`);

        let chassis = ``;
        let typeList = ['wheel','tread','biped','quad','spider','hover'];
        if (global.race['warlord']){
            switch (global.portal.mechbay.blueprint.size){
                case 'minion':
                    typeList = ['imp','flying_imp','hound','harpy','barghest'];
                    break;
                case 'fiend':
                    typeList = ['cambion','minotaur','nightmare','rakshasa','golem'];
                    break;
                case 'cyberdemon':
                    typeList = ['wheel','tread','biped','quad','spider','hover'];
                    break;
                case 'archfiend':
                    typeList = ['dragon','snake','gorgon','hydra'];
                    break;
            }
        }
        typeList.forEach(function(val,idx){
            chassis += `<b-dropdown-item aria-role="listitem" v-on:click="setType('${val}')" class="chassis r0 a${idx}" data-val="${val}">${loc(`portal_mech_chassis_${val}`)}</b-dropdown-item>`;
        });

        options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list">
            <button class="button is-info" slot="trigger">
                <span>${loc(`portal_mech_type`)}: {{ b.chassis | clabel }}</span>
                <b-icon icon="menu-down"></b-icon>
            </button>${chassis}
        </b-dropdown>`);

        for (let i=0; i<4; i++){
            let weapons = ``;
            let weaponList = validWeapons(global.portal.mechbay.blueprint.size,global.portal.mechbay.blueprint.chassis,i);
            weaponList.forEach(function(val,idx){
                weapons += `<b-dropdown-item aria-role="listitem" v-on:click="setWep('${val}',${i})" class="weapon r${i} a${idx}" data-val="${val}">${loc(`portal_mech_weapon_${val}`)}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list" v-show="vis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(`portal_mech_weapon`)}: {{ b.hardpoint[${i}] || 'laser' | wlabel }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>${weapons}
            </b-dropdown>`);
        }

        $ctx.e_cap = global.blood['prepared'] ? 5 : 4;
        for (let i=0; i<$ctx.e_cap; i++){
            let equip = ``;
            let equipTypes = validEquipment(global.portal.mechbay.blueprint.size,global.portal.mechbay.blueprint.chassis,i);
            equipTypes.forEach(function(val,idx){
                equip += `<b-dropdown-item aria-role="listitem" v-on:click="setEquip('${val}',${i})" class="equip r${i} a${idx}" data-val="${val}">{{ '${val}' | equipment }}</b-dropdown-item>`;
            });

            options.append(`<b-dropdown :triggers="['hover', 'click']" aria-role="list" v-show="eVis(${i})">
                <button class="button is-info" slot="trigger">
                    <span>${loc(global.race['warlord'] ? `portal_mech_attribute` : `portal_mech_equipment`)}: {{ b.equip[${i}] || 'shields' | equipment }}</span>
                    <b-icon icon="menu-down"></b-icon>
                </button>${equip}
            </b-dropdown>`);
        }

        assemble.append(`<div class="mechAssemble"><button class="button is-info" slot="trigger" v-on:click="build()"><span>${global.race['warlord'] ? loc('portal_mech_summon') : loc('portal_mech_construct')}</span></button></div>`);

        vBind({
            el: '#mechAssembly',
            data: {
                p: global.portal.purifier,
                m: global.portal.mechbay,
                b: global.portal.mechbay.blueprint
            },
            methods: {
                build(){
                    let costs = mechCost(global.portal.mechbay.blueprint.size,global.portal.mechbay.blueprint.infernal);

                    let cost = costs.c;
                    let soul = costs.s;
                    let size = mechSize(global.portal.mechbay.blueprint.size);

                    let avail = global.portal.mechbay.max - global.portal.mechbay.bay;
                    if (!(global.settings.qKey && keyMap.q) && global.portal.purifier.supply >= cost && avail >= size && global.resource.Soul_Gem.amount >= soul){
                        global.portal.purifier.supply -= cost;
                        global.resource.Soul_Gem.amount -= soul;
                        buildMech(global.portal.mechbay.blueprint);
                    }
                    else {
                        let used = 0;
                        for (let j=0; j<global.queue.queue.length; j++){
                            used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                        }
                        if (used < global.queue.max){
                            let blueprint = deepClone(global.portal.mechbay.blueprint);
                            global.queue.queue.push({ 
                                id: `hell-mech-${Math.rand(0,100000)}`, 
                                action: 'hell-mech', 
                                type: blueprint,
                                label: `${loc(`portal_mech_size_${blueprint.size}`)} ${loc(`portal_mech_chassis_${blueprint.chassis}`)}`, 
                                cna: false, 
                                time: 0, 
                                q: 1, 
                                qs: 1, 
                                t_max: 0, 
                                bres: false 
                            });
                            buildQueue();
                        }
                    }
                },
                setSize(s){
                    global.portal.mechbay.blueprint.size = s;
                    if (s === 'collector'){
                        global.portal.mechbay.blueprint.hardpoint.length = 0;
                    }
                    else if (s === 'small' || s === 'medium' || s === 'minion' || s === 'fiend'){
                        if (global.portal.mechbay.blueprint.hardpoint.length === 0){
                            global.portal.mechbay.blueprint.hardpoint.push('laser');
                        }
                        global.portal.mechbay.blueprint.hardpoint.length = 1;
                    }
                    else {
                        if (global.portal.mechbay.blueprint.hardpoint.length === 0){
                            global.portal.mechbay.blueprint.hardpoint.push('laser');
                        }
                        if (global.portal.mechbay.blueprint.hardpoint.length === 1){
                            global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser') ? 'plasma' : 'laser');
                        }
                        if (s === 'titan'){
                            if (global.portal.mechbay.blueprint.hardpoint.length === 2){
                                global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser')  ? 'shotgun' : 'laser');
                                global.portal.mechbay.blueprint.hardpoint.push(global.portal.mechbay.blueprint.hardpoint.includes('laser')  ? 'kinetic' : 'laser');
                            }
                        }
                        else {
                            global.portal.mechbay.blueprint.hardpoint.length = 2;
                        }
                    }
                    if (global.race['warlord']){ 
                        global.portal.mechbay.blueprint.equip[0] = validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]; 
                        global.portal.mechbay.blueprint.equip.length = 1;
                    }
                    switch (s){
                        case 'small':
                        case 'minion':
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]);
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 1 : 0;
                            break;
                        case 'medium':
                        case 'fiend':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]);
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[1]);
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 2 : 1;
                            break;
                        case 'collector':
                        case 'large':
                        case 'cyberdemon':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push('special');
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 2){
                                global.portal.mechbay.blueprint.equip.push('shields');
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push('grapple');
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 3 : 2;
                            break;
                        case 'titan':
                        case 'archfiend':
                            if (global.portal.mechbay.blueprint.equip.length < 1){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[0]);
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 2){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[1]);
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 3){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[2]);
                            }
                            if (global.portal.mechbay.blueprint.equip.length < 4){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[3]);
                            }
                            if (global.blood['prepared']){
                                global.portal.mechbay.blueprint.equip.push(validEquipment(s,global.portal.mechbay.blueprint.chassis)[4]);
                            }
                            global.portal.mechbay.blueprint.equip.length = global.blood['prepared'] ? 5 : 4;
                            break;
                    }
                    if (global.race['warlord']){
                        switch (s){
                            case 'minion':
                                global.portal.mechbay.blueprint.chassis = 'imp';
                                break;
                            case 'fiend':
                                global.portal.mechbay.blueprint.chassis = 'cambion';
                                break;
                            case 'cyberdemon':
                                global.portal.mechbay.blueprint.chassis = 'biped';
                                global.portal.mechbay.blueprint.hardpoint[1] = validWeapons(s,global.portal.mechbay.blueprint.chassis,1)[1];
                                break;
                            case 'archfiend':
                                global.portal.mechbay.blueprint.chassis = 'dragon';
                                global.portal.mechbay.blueprint.hardpoint[1] = validWeapons(s,global.portal.mechbay.blueprint.chassis,1)[0];
                                break;
                        }
                        global.portal.mechbay.blueprint.hardpoint[0] = validWeapons(s,global.portal.mechbay.blueprint.chassis,0)[0];
                        drawMechLab();
                        clearPopper();
                    }
                },
                setType(c){
                    global.portal.mechbay.blueprint.chassis = c;
                    if (global.race['warlord']){
                        global.portal.mechbay.blueprint.hardpoint[0] = validWeapons(global.portal.mechbay.blueprint.size,c,0)[0];
                        if (c === 'hydra'){
                            global.portal.mechbay.blueprint.hardpoint[1] = validWeapons(global.portal.mechbay.blueprint.size,c,1)[0];
                            global.portal.mechbay.blueprint.hardpoint[2] = validWeapons(global.portal.mechbay.blueprint.size,c,2)[0];
                            global.portal.mechbay.blueprint.hardpoint[3] = validWeapons(global.portal.mechbay.blueprint.size,c,3)[0];
                        }
                        else if (c !== 'hydra' && global.portal.mechbay.blueprint.size === 'archfiend'){
                            global.portal.mechbay.blueprint.hardpoint.length = 2;
                        }
                        drawMechLab();
                        clearPopper();
                    }
                },
                setWep(w,i){
                    global.portal.mechbay.blueprint.hardpoint[i] = w;
                    vBind({el: `#mechAssembly`},'update');
                },
                setEquip(e,i){
                    global.portal.mechbay.blueprint.equip[i] = e;
                    vBind({el: `#mechAssembly`},'update');
                },
                vis(hp){
                    if (global.portal.mechbay.blueprint.size === 'collector'){
                        return false;
                    }
                    if (hp === 0 || (['large','cyberdemon'].includes(global.portal.mechbay.blueprint.size) && hp < 2) || global.portal.mechbay.blueprint.size === 'titan'){
                        return true;
                    }
                    else if (global.portal.mechbay.blueprint.size === 'archfiend'){
                        switch (global.portal.mechbay.blueprint.chassis){
                            case 'dragon':
                            case 'snake':
                            case 'gorgon':
                                return hp < 2 ? true : false;
                            case 'hydra':
                                return hp < 4 ? true : false;
                        }
                    }
                    return false;
                },
                eVis(es){
                    let prep = global.blood['prepared'] ? 1 : 0;
                    switch (global.portal.mechbay.blueprint.size){
                        case 'small':
                        case 'minion':
                            return prep === 1 && es === 0 ? true : false;
                        case 'medium':
                        case 'fiend':
                            return es <= (0 + prep) ? true : false;
                        case 'collector':
                        case 'large':
                        case 'cyberdemon':
                            return es <= (1 + prep) ? true : false;
                        case 'titan':
                        case 'archfiend':
                            return true;
                    }
                }
            },
            filters: {
                bay(s){
                    return mechSize(s);
                },
                price(s){
                    let costs = mechCost(s,global.portal.mechbay.blueprint.infernal);
                    return costs.c;
                },
                soul(s){
                    let costs = mechCost(s,global.portal.mechbay.blueprint.infernal);
                    return costs.s;
                },
                slabel(s){
                    return loc(`portal_mech_size_${s}`);
                },
                clabel(c){
                    return loc(`portal_mech_chassis_${c}`);
                },
                wlabel(w){
                    return loc(`portal_mech_weapon_${w}`);
                },
                desc(s){
                    return loc(`portal_mech_size_${s}_desc`);
                },
                round(v){
                    return Math.round(v);
                },
                equipment(e){
                    if (e !== 'special'){
                        return loc(`portal_mech_equip_${e}`);
                    }
                    let type = 'jumpjet';
                    switch (global.portal.mechbay.blueprint.size){
                        case 'large':
                        case 'cyberdemon':
                            type = 'battery';
                            break;
                        case 'titan':
                            type = 'target';
                            break;
                    }
                    return loc(`portal_mech_equip_${type}`);
                }
            }
        });
}

export function drawMechLab_s2($ctx){
        ['size','chassis','weapon','equip'].forEach(function(type){
            let range = 1;
            if (type === 'weapon'){
                range = 4;
            }
            else if (type === 'equip'){
                range = $ctx.e_cap;
            }

            for (let idx=0; idx<range; idx++){
                for (let i=0; i<$(`#mechAssembly .${type}.r${idx}`).length; i++){
                    popover(`mechAssembly${type}${idx}${i}`, function(obj){
                        let val = $(obj.this).attr(`data-val`);
                        if (val === 'special'){
                            switch (global.portal.mechbay.blueprint.size){
                                case 'large':
                                case 'cyberdemon':
                                    val = 'battery';
                                    break;
                                case 'titan':
                                    val = 'target';
                                    break;
                                default:
                                    val = 'jumpjet';
                                    break;
                            }
                        }
                        return loc(`portal_mech_${type}_${val}_desc`);
                    },
                    {
                        elm: `#mechAssembly .${type}.r${idx}.a${i}`,
                        placement: 'right'
                    });
                }
            }
        });

        let mechs = $(`<div id="mechList" class="sticky mechList"></div>`);
        $ctx.lab.append(mechs);
        drawMechs();
}
