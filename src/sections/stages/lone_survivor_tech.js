// Tech awal skenario Lone Survivor (termasuk toggle theatre, cement, gov_mage, reclaimer).
import { global } from '../../core/vars.js';
import { setupRituals } from '../../industry/industry_panels.js';

export function loneSurvivorTech($ctx){
        global.tech['alloy'] = 1;
        global.tech['alumina'] = 2;
        global.tech['asteroid'] = 7;
        global.tech['banking'] = 11;
        global.tech['biotech'] = 1;
        global.tech['boot_camp'] = 2;
        global.tech['container'] = 7;
        global.tech['copper'] = 1;
        global.tech['currency'] = 6;
        global.tech['disease'] = 2;
        global.tech['drone'] = 1;
        global.tech['elerium'] = 2;
        global.tech['explosives'] = 3;
        global.tech['factory'] = 3;
        global.tech['foundry'] = 8;
        global.tech['gambling'] = 4;
        global.tech['gas_giant'] = 1;
        global.tech['gas_moon'] = 2;
        global.tech['genesis'] = 2;
        global.tech['genetics'] = 2;
        global.tech['gov_corp'] = 1;
        global.tech['gov_fed'] = 1;
        global.tech['gov_soc'] = 1;
        global.tech['gov_theo'] = 1;
        global.tech['govern'] = 3;
        global.tech['graphene'] = 1;
        global.tech['helium'] = 1;
        global.tech['hell'] = 1;
        global.tech['high_tech'] = 13;
        global.tech['home_safe'] = 2;
        global.tech['housing'] = 3;
        global.tech['housing_reduction'] = 3;
        global.tech['kuiper'] = 2;
        global.tech['launch_facility'] = 1;
        global.tech['luna'] = 2;
        global.tech['m_smelting'] = 2;
        global.tech['marines'] = 2;
        global.tech['mars'] = 5;
        global.tech['mass'] = 1;
        global.tech['medic'] = 3;
        global.tech['military'] = 8;
        global.tech['mine_conveyor'] = 1;
        global.tech['mining'] = 4;
        global.tech['monument'] = 1;
        global.tech['nano'] = 1;
        global.tech['oil'] = 7;
        global.tech['outer'] = 8;
        global.tech['pickaxe'] = 5;
        global.tech['polymer'] = 2;
        global.tech['primitive'] = 3;
        global.tech['q_factory'] = 1;
        global.tech['quantium'] = 1;
        global.tech['queue'] = 3;
        global.tech['r_queue'] = 1;
        global.tech['reproduction'] = 1;
        global.tech['rival'] = 1;
        global.tech['satellite'] = 1;
        global.tech['science'] = 9;
        global.tech['shelving'] = 3;
        global.tech['shipyard'] = 1;
        global.tech['smelting'] = 6;
        global.tech['solar'] = 5;
        global.tech['space'] = 6;
        global.tech['space_explore'] = 4;
        global.tech['space_housing'] = 1;
        global.tech['spy'] = 5;
        global.tech['stanene'] = 1;
        global.tech['steel_container'] = 6;
        global.tech['storage'] = 5;
        global.tech['swarm'] = 6;
        global.tech['syard_armor'] = 3;
        global.tech['syard_class'] = 6;
        global.tech['syard_engine'] = 5;
        global.tech['syard_power'] = 5;
        global.tech['syard_sensor'] = 4;
        global.tech['syard_weapon'] = 6;
        global.tech['syndicate'] = 0;
        global.tech['synthetic_fur'] = 1;
        global.tech['tau_home'] = 6;
        global.tech['tauceti'] = 4;
        global.tech['theology'] = 2;
        global.tech['titan'] = 9;
        global.tech['titan_ai_core'] = 3;
        global.tech['titan_power'] = 1;
        global.tech['titanium'] = 3;
        global.tech['trade'] = 3;
        global.tech['unify'] = 2;
        global.tech['uranium'] = 4;
        global.tech['v_train'] = 1;
        global.tech['vault'] = 4;
        global.tech['wharf'] = 1;
        global.tech['world_control'] = 1;
        global.tech['wsc'] = 0;

        // Note: Joyless cannot be completed in Lone Survivor, and there is no reward for trying.
        if (!global.race['joyless']){
            global.tech['theatre'] = 3;
            global.tech['broadcast'] = 2;
        }

        if (!global.race['flier']){
            global.tech['cement'] = 5;
            global.resource.Cement.display = true;
        }

        if (global.race.universe === 'magic'){
            global.tech['gov_mage'] = 1;
            global.tech['magic'] = 4;
            global.tech['conjuring'] = 2;
            global.resource.Mana.display = true;
            global.resource.Crystal.display = true;
            global.civic.crystal_miner.display = true;
            global.tauceti['pylon'] = { count: 0 };
            setupRituals(true);
        }
        if(global.race.universe === 'evil'){
            global.tech['reclaimer'] = 1;
        }
}
