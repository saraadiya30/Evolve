import { loc } from '../../../core/locale.js';
import { payCosts } from '../../../actions/core/action_costs.js';
import { initStruct } from '../../../actions/core/structure_ui.js';
import { actions } from '../../../core/registries.js';
import { global, save } from '../../../core/vars.js';
import { planetName } from '../../../space/planet_generation.js';
import { unlockAchieve } from '../../../achievements/achievement_logic.js';
import { races } from '../../../core/registries.js';
import { messageQueue } from '../../../functions/message_log.js';
import { govTitle } from '../../../civics/military/government_definitions.js';
import { uniteEffect } from '../group_loaders.js';

// Bagian dari techsPart5 (23 entri: dyson_sphere2 .. interstellar), dipisah dari group_loader.js. Urutan entri sama persis.
export const techsPart5Part3 = {
    dyson_sphere2: {
        title: loc('tech_dyson_sphere'),
        desc: loc('tech_dyson_sphere'),
        cost: {
            Knowledge(){ return 5000000; }
        },
        effect: loc('tech_dyson_sphere2_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.dyson_sphere);
                return true;
            }
            return false;
        }
    },
    orichalcum_sphere: {
        title: loc('tech_orichalcum_sphere'),
        desc: loc('tech_orichalcum_sphere'),
        condition(){
            return global.interstellar['dyson_sphere'] && global.interstellar.dyson_sphere.count >= 100 ? true : false;
        },
        cost: {
            Knowledge(){ return 17500000; },
            Orichalcum(){ return 250000; }
        },
        effect: loc('tech_orichalcum_sphere_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.orichalcum_sphere);
                return true;
            }
            return false;
        }
    },
    elysanite_sphere: {
        title: loc('tech_elysanite_sphere'),
        desc: loc('tech_elysanite_sphere'),
        condition(){
            return global.interstellar?.orichalcum_sphere?.count >= 100;
        },
        cost: {
            Knowledge(){ return 122500000; },
            Omniscience(){ return 36500; },
        },
        effect(){ return loc('tech_elysanite_sphere_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_proxima.elysanite_sphere);
                return true;
            }
            return false;
        }
    },
    gps: {
        title: loc('tech_gps'),
        desc: loc('tech_gps'),
        cost: {
            Knowledge(){ return 150000; }
        },
        effect: loc('tech_gps_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.gps);
                return true;
            }
            return false;
        }
    },
    nav_beacon: {
        title: loc('tech_nav_beacon'),
        desc: loc('tech_nav_beacon'),
        cost: {
            Knowledge(){ return 180000; }
        },
        effect: loc('tech_nav_beacon_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_home.nav_beacon);
                return true;
            }
            return false;
        }
    },
    subspace_signal: {
        title: loc('tech_subspace_signal'),
        desc: loc('tech_subspace_signal'),
        cost: {
            Knowledge(){ return 700000; },
            Stanene(){ return 125000; }
        },
        effect(){ return loc('tech_subspace_signal_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    atmospheric_mining: {
        title: loc('tech_atmospheric_mining'),
        desc: loc('tech_atmospheric_mining'),
        cost: {
            Knowledge(){ return 190000; }
        },
        effect: loc('tech_atmospheric_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas.gas_mining);
                initStruct(actions.space.spc_gas.gas_storage);
                return true;
            }
            return false;
        }
    },
    helium_attractor: {
        title: loc('tech_helium_attractor'),
        desc: loc('tech_helium_attractor'),
        cost: {
            Knowledge(){ return 290000; },
            Elerium(){ return 250; }
        },
        effect(){ return loc('tech_helium_attractor_effect',[planetName().gas]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    ram_scoops: {
        title: loc('tech_ram_scoops'),
        desc: loc('tech_ram_scoops'),
        cost: {
            Knowledge(){ return 580000; }
        },
        effect(){ return loc('tech_ram_scoops_effect'); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_prospecting: {
        title: loc('tech_elerium_prospecting'),
        desc: loc('tech_elerium_prospecting'),
        cost: {
            Knowledge(){ return 610000; }
        },
        effect(){ return loc('tech_elerium_prospecting_effect'); },
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.interstellar.int_nebula.elerium_prospector);
                return true;
            }
            return false;
        }
    },
    zero_g_mining: {
        title: loc('tech_zero_g_mining'),
        desc: loc('tech_zero_g_mining'),
        cost: {
            Knowledge(){ return 210000; }
        },
        effect: loc('tech_zero_g_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_belt.space_station);
                initStruct(actions.space.spc_belt.iridium_ship);
                initStruct(actions.space.spc_belt.iron_ship);
                return true;
            }
            return false;
        }
    },
    elerium_mining: {
        title: loc('tech_elerium_mining'),
        desc: loc('tech_elerium_mining'),
        cost: {
            Knowledge(){ return 235000; },
            Elerium(){ return global.race['truepath'] ? 0.5 : 1; }
        },
        effect: loc('tech_elerium_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_belt.elerium_ship);
                if (global.race['cataclysm']){
                    unlockAchieve('iron_will',false,2);
                }
                return true;
            }
            return false;
        }
    },
    laser_mining: {
        title: loc('tech_laser_mining'),
        desc: loc('tech_laser_mining'),
        cost: {
            Knowledge(){ return 350000; },
        },
        effect: loc('tech_laser_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    plasma_mining: {
        title: loc('tech_plasma_mining'),
        desc: loc('tech_plasma_mining'),
        cost: {
            Knowledge(){ return 825000; },
        },
        effect: loc('tech_plasma_mining_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_tech: {
        title: loc('tech_elerium_tech'),
        desc: loc('tech_elerium_tech'),
        cost: {
            Knowledge(){ return 275000; },
            Elerium(){ return 20; }
        },
        effect: loc('tech_elerium_tech_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    elerium_reactor: {
        title: loc('tech_elerium_reactor'),
        desc: loc('tech_elerium_reactor'),
        cost: {
            Knowledge(){ return 325000; },
            Elerium(){ return 180; }
        },
        effect: loc('tech_elerium_reactor_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_dwarf.e_reactor);
                return true;
            }
            return false;
        }
    },
    neutronium_housing: {
        title: loc('tech_neutronium_housing'),
        desc: loc('tech_neutronium_housing'),
        cost: {
            Knowledge(){ return 275000; },
            Neutronium(){ return 350; }
        },
        effect(){ return loc('tech_neutronium_housing_effect',[planetName().red]); },
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    unification: {
        title: loc('tech_unification'),
        desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
        cost: {
            Knowledge(){ return 200000; }
        },
        effect: loc('tech_unification_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    unification2: {
        title: loc('tech_unification'),
        desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
        cost: {
            Bool(){
                let owned = 0;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].buy || global.civic.foreign[`gov${i}`].anx){
                        owned++;
                    }
                }
                return owned === 3 ? true : false;
            }
        },
        effect(){
            let banana_warn = global.race['banana'] ? `<div class="has-text-danger">${loc('tech_unification_banana')}</div>` : '';
            return `<div>${loc('tech_unification_effect2')}</div><div class="has-text-special">${loc('tech_unification_warning')}</div>${banana_warn}`;
        },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['banana']){
                    if (!global['sim']){
                        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                    }
                    delete global.race['banana'];
                }
                if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                    unlockAchieve(`world_domination`);
                }
                if (global.civic.foreign.gov0.anx && global.civic.foreign.gov1.anx && global.civic.foreign.gov2.anx){
                    unlockAchieve(`illuminati`);
                }
                if (global.civic.foreign.gov0.buy && global.civic.foreign.gov1.buy && global.civic.foreign.gov2.buy){
                    unlockAchieve(`syndicate`);
                }
                if (global.stats.attacks === 0){
                    unlockAchieve(`pacifist`);
                }
                uniteEffect();
                return true;
            }
            return false;
        }
    },
    unite: {
        title: loc('tech_unite'),
        desc(){ return loc('tech_unite_desc'); },
        cost: {
            Bool(){
                let owned = 0;
                for (let i=0; i<3; i++){
                    if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].buy || global.civic.foreign[`gov${i}`].anx){
                        owned++;
                    }
                }
                return owned === 3 ? true : false;
            }
        },
        effect(){ return `<div>${loc('tech_unite_effect')}</div><div class="has-text-warning">${loc('tech_unification_effect2')}</div>`; },
        action(){
            if (payCosts($(this)[0])){
                if (global.race['banana']){
                    if (!global['sim']){
                        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
                    }
                    delete global.race['banana'];
                }
                if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                    unlockAchieve(`world_domination`);
                }
                if (global.civic.foreign.gov0.anx && global.civic.foreign.gov1.anx && global.civic.foreign.gov2.anx){
                    unlockAchieve(`illuminati`);
                }
                if (global.civic.foreign.gov0.buy && global.civic.foreign.gov1.buy && global.civic.foreign.gov2.buy){
                    unlockAchieve(`syndicate`);
                }
                if (global.stats.attacks === 0){
                    unlockAchieve(`pacifist`);
                }
                uniteEffect();
                if (global.race['truepath'] && !global.tech['rival']){
                    global.tech['rival'] = 1;
                    messageQueue(loc(`civics_rival_unlocked`,[govTitle(3)]),'info',false,['progress','combat']);
                }
                return true;
            }
            return false;
        }
    },
    genesis: {
        title: loc('tech_genesis'),
        desc: loc('tech_genesis'),
        cost: {
            Knowledge(){ return 350000; }
        },
        effect: loc('tech_genesis_effect'),
        action(){
            if (payCosts($(this)[0])){
                return true;
            }
            return false;
        }
    },
    star_dock: {
        title: loc('tech_star_dock'),
        desc: loc('tech_star_dock'),
        cost: {
            Knowledge(){ return 380000; },
        },
        effect: loc('tech_star_dock_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.space.spc_gas.star_dock);
                return true;
            }
            return false;
        }
    },
    interstellar: {
        title: loc('tech_interstellar'),
        desc: loc('tech_interstellar'),
        cost: {
            Knowledge(){ return 400000; },
        },
        effect: loc('tech_interstellar_effect'),
        action(){
            if (payCosts($(this)[0])){
                initStruct(actions.starDock.probes);
                return true;
            }
            return false;
        }
    },
};
