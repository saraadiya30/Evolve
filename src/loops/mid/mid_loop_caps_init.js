// Inisialisasi tabel batas resource ($ctx.caps) dan batas pekerja ($ctx.lCaps), bonus dasar (cataclysm, adept, psychic), serta penyiapan breakdown.c. Dulu awal midLoop_s2.
import { global, breakdown } from '../../core/vars.js';
import { checkAdept } from '../../achievements/achievement_logic.js';
import { loc } from '../../core/locale.js';

export function midLoopCapsInit($ctx){
        $ctx.caps = {
            Money: 1000,
            Slave: 0,
            Authority: global.race['cataclysm'] || global.race['orbit_decayed'] ? 90 : (global.race['lone_survivor'] ? 100 : 80),
            Mana: 0,
            Energy: 100,
            Sus: 100,
            Knowledge: global.stats.achieve['extinct_junker'] && global.stats.achieve['extinct_junker'].l >= 1 ? 1000 : 100,
            Omniscience: 0,
            Zen: 0,
            Food: 1000,
            Crates: 0,
            Containers: 0,
            Lumber: 200,
            Stone: 200,
            Chrysotile: 200,
            Crystal: 10,
            Furs: 100,
            Copper: 100,
            Iron: 100,
            Cement: 100,
            Coal: 50,
            Oil: 0,
            Uranium: 10,
            Aluminium: 50,
            Steel: 50,
            Titanium: 50,
            Alloy: 50,
            Polymer: 50,
            Iridium: 0,
            Helium_3: 0,
            Water: 0,
            Deuterium: 0,
            Neutronium: 0,
            Adamantite: 0,
            Infernite: 0,
            Elerium: 1,
            Nano_Tube: 0,
            Graphene: 0,
            Stanene: 0,
            Bolognium: 0,
            Vitreloy: 0,
            Orichalcum: 0,
            Asphodel_Powder: 0,
            Elysanite: 0,
            Unobtainium: 0,
            Cipher: 0,
            Nanite: 0,
            Materials: 0,
        };
        // labor caps
        $ctx.lCaps = {
            unemployed: -1,
            hunter: -1,
            forager: -1,
            farmer: -1,
            lumberjack: -1,
            quarry_worker: -1,
            crystal_miner: -1,
            scavenger: -1,
            teamster: -1,
            meditator: -1,
            torturer: 0,
            miner: 0,
            coal_miner: 0,
            craftsman: 0,
            cement_worker: 0,
            banker: 0,
            entertainer: 0,
            priest: 0,
            professor: 0,
            scientist: 0,
            garrison: 0,
            colonist: 0,
            titan_colonist: 0,
            space_miner: 0,
            hell_surveyor: 0,
            archaeologist: 0,
            ghost_trapper: 0,
            elysium_miner: 0,
            pit_miner: 0,
            crew: 0
        };

        if (global.race['cataclysm']){
            $ctx.caps['Money'] += 250000;
            $ctx.caps['Knowledge'] += 100000;
            $ctx.caps['Lumber'] += 100000;
            $ctx.caps['Stone'] += 100000;
            $ctx.caps['Chrysotile'] += 100000;
            $ctx.caps['Furs'] += 100000;
            $ctx.caps['Aluminium'] += 100000;
            $ctx.caps['Steel'] += 100000;
            $ctx.caps['Copper'] += 100000;
            $ctx.caps['Iron'] += 100000;
            $ctx.caps['Coal'] += 100000;
            $ctx.caps['Cement'] += 100000;
            $ctx.caps['Titanium'] += 75000;
            $ctx.caps['Alloy'] += 20000;
            $ctx.caps['Polymer'] += 20000;
            $ctx.caps['Uranium'] += 1000;
        }
        else if (global.race['lone_survivor']){
            $ctx.caps['Money'] += 1000000000;
            $ctx.caps['Knowledge'] += 100000;
            $ctx.caps['Food'] += 9000;
            $ctx.caps['Water'] += 10000;
            $ctx.caps['Elerium'] += 999;
        }

        if (global.stats.feat['adept']){
            let rank = checkAdept();
            if (global.race['smoldering']){
                $ctx.caps['Chrysotile'] += rank * 60;
            }
            else {
                $ctx.caps['Lumber'] += rank * 60;
            }
            $ctx.caps['Stone'] += rank * 60;
        }

        if (global.race.hasOwnProperty('psychicPowers') && global.race.psychicPowers.hasOwnProperty('channel')){
            $ctx.caps['Energy'] -= global.race.psychicPowers.channel.boost;
            $ctx.caps['Energy'] -= global.race.psychicPowers.channel.assault;
            $ctx.caps['Energy'] -= global.race.psychicPowers.channel.cash;
            if ($ctx.caps['Energy'] < 0){
                $ctx.caps['Energy'] = 100;
                global.race.psychicPowers.channel.boost = 0;
                global.race.psychicPowers.channel.assault = 0;
                global.race.psychicPowers.channel.cash = 0;
            }
        }

        $ctx.caps[global.race.species] = 0;

        breakdown.c = {};
        Object.keys($ctx.caps).forEach(function(res){
            breakdown.c[res] = { [loc('base')]: $ctx.caps[res]+'v' };
        });
}
