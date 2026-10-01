import { global, p_on, support_on, active_rituals } from './vars.js';
import { calc_mastery, calcPillar, darkEffect } from './functions.js';
import { traits } from './races.js';
import { templeCount, actions } from './actions.js';
import { hellSupression } from './portal.js';
import { syndicate } from './truepath.js';
import { govEffect } from './civics.js';
import { highPopAdjust, teamster } from './prod.js';
import { loc } from './locale.js';
export { craftCost, initResourceTabs, drawResourceTab, defineResources, tradeSummery } from './resources_f1.js';
export { setResourceName, marketItem, galaxyOffers } from './resources_f2.js';
export { galacticTrade, containerItem, tradeSellPrice, tradeBuyPrice, craftingPopover } from './resources_f3.js';
export { crateGovHook, unlockCrates, unlockContainers, crateValue, containerValue, loadEjector, loadSupply } from './resources_f4.js';
import { faithTempleCount, faithBonus, templePlasmidBonus } from './resources_f5.js';
export { loadAlchemy, initAether, faithTempleCount, faithBonus, templePlasmidBonus } from './resources_f5.js';

export const resource_values = {
    Food: 5,
    Lumber: 5,
    Chrysotile: 5,
    Stone: 5,
    Crystal: 6,
    Furs: 8,
    Copper: 25,
    Iron: 40,
    Aluminium: 50,
    Cement: 15,
    Coal: 20,
    Oil: 75,
    Uranium: 550,
    Steel: 100,
    Titanium: 150,
    Alloy: 350,
    Polymer: 250,
    Iridium: 420,
    Helium_3: 620,
    Deuterium: 950,
    Elerium: 2000,
    Water: 2,
    Neutronium: 1500,
    Adamantite: 2250,
    Infernite: 2750,
    Nano_Tube: 750,
    Graphene: 3000,
    Stanene: 3600,
    Bolognium: 9000,
    Vitreloy: 10200,
    Orichalcum: 99000,
    Asphodel_Powder: 249000,
    Horseshoe: 0,
    Nanite: 0,
    Genes: 0,
    Soul_Gem: 0,
    Corrupt_Gem: 0,
    Codex: 0,
    Cipher: 0,
    Demonic_Essence: 0,
    Blessed_Essence: 0
};

export const tradeRatio = {
    Food: 20,
    Lumber: 20,
    Chrysotile: 10,
    Stone: 20,
    Crystal: 4,
    Furs: 10,
    Copper: 10,
    Iron: 10,
    Aluminium: 10,
    Cement: 10,
    Coal: 10,
    Oil: 5,
    Uranium: 1.2,
    Steel: 5,
    Titanium: 2.5,
    Alloy: 2,
    Polymer: 2,
    Iridium: 1,
    Helium_3: 1,
    Deuterium: 1,
    Elerium: 0.2,
    Water: 20,
    Neutronium: 0.5,
    Adamantite: 0.5,
    Infernite: 0.1,
    Nano_Tube: 1,
    Graphene: 1,
    Stanene: 1,
    Bolognium: 1.2,
    Vitreloy: 1.2,
    Orichalcum: 0.5
}

export const atomic_mass = {
    Food: 4.355,
    Lumber: 7.668,
    Chrysotile: 15.395,
    Stone: 20.017,
    Crystal: 5.062,
    Furs: 13.009,
    Copper: 63.546,
    Iron: 55.845,
    Aluminium: 26.9815,
    Cement: 20.009,
    Coal: 12.0107,
    Oil: 5.342,
    Uranium: 238.0289,
    Steel: 55.9,
    Titanium: 47.867,
    Alloy: 45.264,
    Polymer: 120.054,
    Iridium: 192.217,
    Helium_3: 3.0026,
    Deuterium: 2.014,
    Neutronium: 248.74,
    Adamantite: 178.803,
    Infernite: 222.666,
    Elerium: 297.115,
    Nano_Tube: 15.083,
    Graphene: 26.9615,
    Stanene: 33.9615,
    Bolognium: 75.898,
    Unobtainium: 168.59,
    Vitreloy: 41.08,
    Orichalcum: 237.8,
    Asphodel_Powder: 0.01,
    Elysanite: 13.666,
    Water: 18.01,
    Plywood: 7.666,
    Brick: 20.009,
    Wrought_Iron: 55.845,
    Sheet_Metal: 26.9815,
    Mythril: 94.239,
    Aerogel: 7.84,
    Nanoweave: 23.71,
    Scarletite: 188.6,
    Quantium: 241.35
};

export const supplyValue = {
    Lumber: { in: 0.5, out: 25000 },
    Chrysotile: { in: 0.5, out: 25000 },
    Stone: { in: 0.5, out: 25000 },
    Crystal: { in: 3, out: 25000 },
    Furs: { in: 3, out: 25000 },
    Copper: { in: 1.5, out: 25000 },
    Iron: { in: 1.5, out: 25000 },
    Aluminium: { in: 2.5, out: 25000 },
    Cement: { in: 3, out: 25000 },
    Coal: { in: 1.5, out: 25000 },
    Oil: { in: 2.5, out: 12000 },
    Uranium: { in: 5, out: 300 },
    Steel: { in: 3, out: 25000 },
    Titanium: { in: 3, out: 25000 },
    Alloy: { in: 6, out: 25000 },
    Polymer: { in: 6, out: 25000 },
    Iridium: { in: 8, out: 25000 },
    Helium_3: { in: 4.5, out: 12000 },
    Deuterium: { in: 4, out: 1000 },
    Neutronium: { in: 15, out: 1000 },
    Adamantite: { in: 12.5, out: 1000 },
    Infernite: { in: 25, out: 250 },
    Elerium: { in: 30, out: 250 },
    Nano_Tube: { in: 6.5, out: 1000 },
    Graphene: { in: 5, out: 1000 },
    Stanene: { in: 4.5, out: 1000 },
    Bolognium: { in: 18, out: 1000 },
    Vitreloy: { in: 14, out: 1000 },
    Orichalcum: { in: 10, out: 1000 },
    Plywood: { in: 10, out: 250 },
    Brick: { in: 10, out: 250 },
    Wrought_Iron: { in: 10, out: 250 },
    Sheet_Metal: { in: 10, out: 250 },
    Mythril: { in: 12.5, out: 250 },
    Aerogel: { in: 16.5, out: 250 },
    Nanoweave: { in: 18, out: 250 },
    Scarletite: { in: 35, out: 250 }
};

export const craftingRatio = (function(){
    var crafting = {};
    
    return function (res,type,recalc){
        if (recalc){
            let noEarth = global.race['cataclysm'] || global.race['orbit_decayed'] ? true : false;
            crafting = {
                general: {
                    add: [],
                    multi: []
                },
                Plywood: {
                    add: [],
                    multi: []
                },
                Brick: {
                    add: [],
                    multi: []
                },
                Wrought_Iron: {
                    add: [],
                    multi: []
                },
                Sheet_Metal: {
                    add: [],
                    multi: []
                },
                Mythril: {
                    add: [],
                    multi: []
                },
                Aerogel: {
                    add: [],
                    multi: []
                },
                Nanoweave: {
                    add: [],
                    multi: []
                },
                Scarletite: {
                    add: [],
                    multi: []
                },
                Quantium: {
                    add: [],
                    multi: []
                },
                Thermite: {
                    add: [],
                    multi: []
                }
            };
            if (global.tech['foundry'] >= 2){
                let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 0.08 : 0.05) : 0.03;
                crafting.general.add.push({
                    name: loc(`city_foundry`),
                    manual: global.city.foundry.count * skill,
                    auto: global.city.foundry.count * skill
                });
            }
            if (global.tech['foundry'] >= 3){
                Object.keys(crafting).forEach(function(resource){
                    if (global.city.foundry[resource] && global.city.foundry[resource] > 1){
                        crafting[resource].add.push({
                            name: loc(`tech_apprentices`),
                            manual: (global.city.foundry[resource] - 1) * highPopAdjust(0.03),
                            auto: (global.city.foundry[resource] - 1) * highPopAdjust(0.03)
                        });
                    }
                });
            }
            if (global.tech['foundry'] >= 4 && global.city['sawmill']){
                crafting.Plywood.add.push({
                    name: loc(`city_sawmill`),
                    manual: global.city['sawmill'].count * 0.02,
                    auto: global.city['sawmill'].count * 0.02
                });
            }
            if (global.tech['foundry'] >= 6){
                crafting.Brick.add.push({
                    name: loc(`city_foundry`),
                    manual: global.city['foundry'].count * 0.02,
                    auto: global.city['foundry'].count * 0.02
                });
            }
            if (global.tech['foundry'] >= 7){
                crafting.general.add.push({
                    name: loc(`city_factory`) + ` (${loc(`tab_city5`)})`,
                    manual: p_on['factory'] * 0.05,
                    auto: p_on['factory'] * 0.05
                });
                if (global.tech['mars'] >= 4){
                    crafting.general.add.push({
                        name: loc(`city_factory`) + ` (${loc(`tab_space`)})`,
                        manual: p_on['red_factory'] * 0.05,
                        auto: p_on['red_factory'] * 0.05
                    });
                }
                if (global.interstellar['int_factory'] && p_on['int_factory']){
                    crafting.general.add.push({
                        name: loc(`interstellar_int_factory_title`),
                        manual: p_on['int_factory'] * 0.1,
                        auto: p_on['int_factory'] * 0.1
                    });
                }
            }
            if (global.portal['demon_forge'] && p_on['demon_forge']){
                crafting.general.add.push({
                    name: loc(`portal_demon_forge_title`),
                    manual: 0,
                    auto: p_on['demon_forge'] * actions.portal.prtl_wasteland.demon_forge.crafting() / 100
                });
            }
            if (global.portal['hell_factory'] && p_on['hell_factory']){
                crafting.general.add.push({
                    name: loc(`portal_factory_title`),
                    manual: p_on['hell_factory'] * 0.25,
                    auto: p_on['hell_factory'] * 0.25
                });
            }
            if (global.space['fabrication'] && support_on['fabrication']){
                crafting.general.add.push({
                    name: loc(`space_red_fabrication_title`),
                    manual: support_on['fabrication'] * global.civic.colonist.workers * (noEarth ? highPopAdjust(0.05) : highPopAdjust(0.02)),
                    auto: support_on['fabrication'] * global.civic.colonist.workers * (noEarth ? highPopAdjust(0.05) : highPopAdjust(0.02))
                });
            }
            if (global.race['artisan']){
                crafting.general.multi.push({
                    name: loc(`trait_artisan_name`),
                    manual: 1,
                    auto: 1 + (traits.artisan.vars()[0] / 100)
                });
            }
            if (p_on['stellar_forge']){
                crafting.Mythril.add.push({
                    name: loc(`interstellar_stellar_forge_title`),
                    manual: p_on['stellar_forge'] * 0.05,
                    auto: p_on['stellar_forge'] * 0.05
                });
                crafting.general.add.push({
                    name: loc(`interstellar_stellar_forge_title`),
                    manual: 0,
                    auto: p_on['stellar_forge'] * 0.1
                });
            }
            if (p_on['hell_forge']){
                let sup = hellSupression('ruins');
                crafting.general.add.push({
                    name: loc(`portal_hell_forge_title`),
                    manual: 0,
                    auto: p_on['hell_forge'] * 0.75 * sup.supress
                });
                crafting.Scarletite.multi.push({
                    name: loc(`portal_ruins_supressed`),
                    manual: 1,
                    auto: sup.supress
                });
            }
            if (global.tauceti['tau_factory'] && support_on['tau_factory']){
                crafting.general.add.push({
                    name: loc(`tau_home_tau_factory`),
                    manual: 0,
                    auto: (support_on['tau_factory'] * (global.tech['isolation'] ? 2.75 : 0.9))
                });
            }
            if (global.tech['isolation'] && global.tauceti['colony'] && support_on['colony']){
                crafting.general.add.push({
                    name: loc(`tau_home_colony`),
                    manual: support_on['colony'] * 0.5,
                    auto: support_on['colony'] * 0.5
                });
            }
            if ((support_on['zero_g_lab'] && p_on['zero_g_lab']) || (support_on['infectious_disease_lab'] && p_on['infectious_disease_lab'])){
                let synd = syndicate('spc_enceladus');
                crafting.Quantium.multi.push({
                    name: loc(`space_syndicate`),
                    manual: 1,
                    auto: synd
                });
            }
            if (global.tech['alien_crafting'] && support_on['infectious_disease_lab'] && p_on['infectious_disease_lab']){
                let qCraft = 1 + (0.65 * Math.min(support_on['infectious_disease_lab'],p_on['infectious_disease_lab']));
                crafting.Quantium.multi.push({
                    name: loc(`tech_infectious_disease_lab_alt`),
                    manual: 1,
                    auto: qCraft
                });
            }
            if (global.race['crafty']){
                crafting.general.add.push({
                    name: loc(`wiki_arpa_crispr_crafty`),
                    manual: 0.03,
                    auto: 0.03
                });
            }
            if (global.race['ambidextrous']){
                crafting.general.add.push({
                    name: loc(`trait_ambidextrous_name`),
                    manual: traits.ambidextrous.vars()[0] * global.race['ambidextrous'] / 100,
                    auto: traits.ambidextrous.vars()[0] * global.race['ambidextrous'] / 100
                });
            }
            if (global.race['rigid']){
                crafting.general.add.push({
                    name: loc(`trait_rigid_name`),
                    manual: -(traits.rigid.vars()[0] / 100),
                    auto: -(traits.rigid.vars()[0] / 100)
                });
            }
            if (global.civic.govern.type === 'socialist'){
                crafting.general.multi.push({
                    name: loc(`govern_socialist`),
                    manual: 1 + (govEffect.socialist()[0] / 100),
                    auto: 1 + (govEffect.socialist()[0] / 100)
                });
            }
            if (global.race['casting'] && active_rituals['crafting']){
                let num_rituals = active_rituals['crafting'];
                let boost_m = 1 + (num_rituals / (num_rituals + 75));
                let boost_a = 1 + (2 * num_rituals / (2 * num_rituals + 75));
                crafting.general.multi.push({
                    name: loc(`modal_pylon_casting`),
                    manual: boost_m,
                    auto: boost_a
                });
            }
            if (global.race['universe'] === 'magic'){
                crafting.general.multi.push({
                    name: loc(`universe_magic`),
                    manual: 0.8,
                    auto: 0.8
                });
            }
            if (global.tech['v_train']){
                crafting.general.multi.push({
                    name: loc(`tech_vocational_training`),
                    manual: 1,
                    auto: 2
                });
            }
            if (global.genes['crafty']){
                crafting.general.multi.push({
                    name: loc(`tab_arpa_crispr`) + ' ' + loc(`wiki_arpa_crispr_crafty`),
                    manual: 1,
                    auto: 1 + ((global.genes.crafty - 1) * 0.5)
                });
            }
            if (global.race['living_tool']){
                crafting.general.multi.push({
                    name: loc(`trait_living_tool_name`),
                    manual: 1,
                    auto: 1 + (traits.living_tool.vars()[1] / 100)
                });
            }
            if (global.stats.achieve['lamentis'] && global.stats.achieve.lamentis.l >= 1){
                crafting.general.multi.push({
                    name: loc(`evo_challenge_orbit_decay`),
                    manual: 1,
                    auto: 1.1
                });
            }
            if (global.race['ambidextrous']){
                crafting.general.multi.push({
                    name: loc(`trait_ambidextrous_name`),
                    manual: 1,
                    auto: 1 + (traits.ambidextrous.vars()[1] * global.race['ambidextrous'] / 100)
                });
            }
            if (global.blood['artisan']){
                crafting.general.multi.push({
                    name: loc(`tab_arpa_blood`) + ' ' + loc(`arpa_blood_artisan_title`),
                    manual: 1,
                    auto: 1 + (global.blood.artisan / 100)
                });
            }
            let faith = faithBonus();
            if (faith > 0){
                crafting.general.multi.push({
                    name: loc(`faith`),
                    manual: 1,
                    auto: 1 + (faith / (global.race.universe === 'antimatter' ? 1.5 : 3))
                });
            }
            if (global.prestige.Plasmid.count > 0){
                crafting.general.multi.push({
                    name: loc(`resource_Plasmid_plural_name`),
                    manual: plasmidBonus() / 8 + 1,
                    auto: plasmidBonus() / 8 + 1
                });
            }
            if (global.genes['challenge'] && global.genes['challenge'] >= 2){
                crafting.general.multi.push({
                    name: loc(`mastery`),
                    manual: 1 + (calc_mastery() / (global.race['weak_mastery'] ? 50 : 100)),
                    auto: 1 + (calc_mastery() / (global.race['weak_mastery'] ? 50 : 100))
                });
            }
            if (global.race['gravity_well']){
                crafting.general.multi.push({
                    name: loc(`evo_challenge_gravity_well`),
                    manual: teamster(1),
                    auto: teamster(1)
                });
            }
        }
        else {
            let multiplier = 1;
            let add_bd = {};
            let multi_bd = {};
            if (crafting['general']){
                for (let i=0; i<crafting.general.add.length; i++){
                    let curr = crafting.general.add[i];
                    add_bd[curr.name] = curr[type];
                    multiplier += curr[type];
                }
                for (let i=0; i<crafting[res].add.length; i++){
                    let curr = crafting[res].add[i];
                    add_bd[curr.name] = curr[type] + (add_bd[curr.name] ? add_bd[curr.name] : 0);
                    multiplier += curr[type];
                }
                multi_bd[loc(`craft_tools`)] = multiplier - 1;
                for (let i=0; i<crafting.general.multi.length; i++){
                    let curr = crafting.general.multi[i];
                    multi_bd[curr.name] = +(curr[type]) - 1;
                    multiplier *= curr[type];
                }
                for (let i=0; i<crafting[res].multi.length; i++){
                    let curr = crafting[res].multi[i];
                    multi_bd[curr.name] = (curr[type] * (1 + (multi_bd[curr.name] ? +(multi_bd[curr.name]) : 0))) - 1;
                    multiplier *= curr[type];
                }
            }

            Object.keys(add_bd).forEach(function(add){
                add_bd[add] = (+(add_bd[add]) * 100).toFixed(2) + '%';
            });
            Object.keys(multi_bd).forEach(function(multi){
                multi_bd[multi] = (+(multi_bd[multi]) * 100).toFixed(2) + '%';
            });

            let craft_total = {
                multiplier: multiplier,
                add_bd: add_bd,
                multi_bd: multi_bd
                
            }
            return craft_total;
        }
    }
})();

export const aether_big_affix = ['K','M','B','T','q','Q','s','S'];
export const aether_small_affix = ['m','μ','n','p','f','a','z','y'];

export const spatialReasoning = (function(){
    var spatial = {};
    return function (value,type,recalc){
        let tkey = type ? type : 'a';
        let key = [
            global.race.universe,
            global.prestige.Plasmid.count,
            global.prestige.AntiPlasmid.count,
            global.prestige.Phage.count,
            global.race['no_plasmid'] || '0',
            global.race['p_mutation'] || '0',
            global.race['nerfed'] || '0',
            global.genes['store'] || '0',
            global.genes['bleed'] || '0',
            templeCount(false) || '0',
            templeCount(true) || '0',
            global.race['cataclysm'] ? global.race.cataclysm : '0',
            global.race['orbit_decayed'] ? global.race.orbit_decayed : '0',
            global.genes['ancients'] || '0',
            global.civic['priest'] ? global.civic.priest.workers : '0'
        ].join('-');

        if (!spatial[tkey]){
            spatial[tkey] = {};
        }
        if (!spatial[tkey][key] || recalc){            
            let modifier = 1;
            if (global.genes['store']){
                let plasmids = 0;
                if (!type || (type && ((type === 'plasmid' && global.race.universe !== 'antimatter') || (type === 'anti' && global.race.universe === 'antimatter')))){
                    plasmids = global.race.universe === 'antimatter' ? global.prestige.AntiPlasmid.count : global.prestige.Plasmid.count;
                    let raw = plasmids;
                    if (global.race['no_plasmid']){
                        let active = global.race.p_mutation + (global.race['wish'] && global.race['wishStats'] ? global.race.wishStats.plas : 0);
                        raw = Math.min(active, plasmids);
                    }
                    else if (global.race['nerfed']){
                        raw = Math.floor(plasmids / (global.race.universe === 'antimatter' ? 2 : 5));
                    }
                    plasmids = Math.round(raw * (global.race['nerfed'] ? 0.5 : 1));
                }
                if (!type || (type && type === 'phage')){
                    if (global.genes['store'] >= 4){
                        plasmids += Math.round(global.prestige.Phage.count * (global.race['nerfed'] ? (1/3) : 1));
                    }
                }
                let divisor = global.genes.store >= 2 ? (global.genes.store >= 3 ? 1250 : 1666) : 2500;
                if (global.race.universe === 'antimatter'){
                    divisor *= 2;
                }
                if (global.genes['bleed'] && global.genes['bleed'] >= 3){
                    if (!type || (type && ((type === 'plasmid' && global.race.universe === 'antimatter') || (type === 'anti' && global.race.universe !== 'antimatter')))){
                        let raw = global.race.universe === 'antimatter' ? global.prestige.Plasmid.count / 5 : global.prestige.AntiPlasmid.count / 10;
                        plasmids += Math.round(raw * (global.race['nerfed'] ? 0.5 : 1));
                    }
                }
                modifier *= 1 + (plasmids / divisor);
            }
            if (global.race.universe === 'standard'){
                modifier *= darkEffect('standard');
            }
            if (global.race.universe === 'antimatter' && faithTempleCount()){
                let temple = 0.06;
                if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                    let priest = global.genes['ancients'] >= 5 ? 0.0012 : (global.genes['ancients'] >= 3 ? 0.001 : 0.0008);
                    if (global.race['high_pop']){
                        priest = highPopAdjust(priest);
                    }
                    temple += priest * global.civic.priest.workers;
                }
                modifier *= 1 + (faithTempleCount() * temple);
            }
            if (!type){
                if (global['pillars']){
                    let harmonic = calcPillar();
                    modifier *= harmonic[1];
                }
            }
            spatial[tkey] = {};
            spatial[tkey][key] = modifier;
        }
        return type ? (spatial[tkey][key] * value) : Math.round(spatial[tkey][key] * value);
    }
})();

export const plasmidBonus = (function (){
    var plasma = {};
    return function(type){
        let key = [
            global.race.universe,
            global.prestige.Plasmid.count,
            global.prestige.AntiPlasmid.count,
            global.prestige.Phage.count,
            global.civic.govern.type,
            global.civic.professor.assigned,
            global.genes['bleed'] || '0',
            global.race['decayed'] || '0',
            global.race['gene_fortify'] || '0',
            global.tech['anthropology'] || '0',
            global.tech['fanaticism'] || '0',
            global.race['nerfed'] || '0',
            global.race['no_plasmid'] || '0',
            global.genes['ancients'] || '0',
            templeCount(false) || '0',
            templeCount(true) || '0',
            global.civic['priest'] ? global.civic.priest.workers : '0',
            global.race['orbit_decayed'] ? global.race.orbit_decayed : '0',
            global.race['spiritual'] || '0',
            global.tech['outpost_boost'] || '0',
            p_on['alien_outpost'] || '0',
        ].join('-');

        if (!plasma[key]){
            let standard = 0;
            let anti = 0; 
            if (global.race.universe !== 'antimatter' || global.genes['bleed']){
                let active = global.race.p_mutation + (global.race['wish'] && global.race['wishStats'] ? global.race.wishStats.plas : 0);
                let plasmids = global.race['no_plasmid'] ? Math.min(active, global.prestige.Plasmid.count) : global.prestige.Plasmid.count;
                if (global.race.universe === 'antimatter' && global.genes['bleed']){
                    plasmids *= 0.025
                }
                if (global.race['decayed']){
                    plasmids -= Math.round((global.stats.days - global.race.decayed) / (300 + global.race.gene_fortify * 6));
                }
                let p_cap = 250 + global.prestige.Phage.count;
                if (plasmids > p_cap){
                    standard = (+((Math.log(p_cap + 50) - 3.91202)).toFixed(5) / 2.888) + ((Math.log(plasmids + 1 - p_cap) / Math.LN2 / 250));
                }
                else if (plasmids < 0){
                    standard = 0;
                }
                else {
                    standard = +((Math.log(plasmids + 50) - 3.91202)).toFixed(5) / 2.888;
                }
                if (global.tech['outpost_boost'] && global.race['truepath'] && p_on['alien_outpost']){
                    standard *= 2;
                }

                let temple_bonus = templePlasmidBonus();
                standard *= 1 + temple_bonus;
            }

            if (global.race.universe === 'antimatter' || (global.genes['bleed'] && global.genes['bleed'] >= 2)){
                let plasmids = global.prestige.AntiPlasmid.count;
                if (global.race.universe !== 'antimatter' && global.genes['bleed'] && global.genes['bleed'] >= 2){
                    plasmids *= 0.25
                }
                if (global.race['decayed']){
                    plasmids -= Math.round((global.stats.days - global.race.decayed) / (300 + global.race.gene_fortify * 6));
                }
                let p_cap = 250 + global.prestige.Phage.count;
                if (plasmids > p_cap){
                    anti = (+((Math.log(p_cap + 50) - 3.91202)).toFixed(5) / 2.888) + ((Math.log(plasmids + 1 - p_cap) / Math.LN2 / 250));
                }
                else if (plasmids < 0){
                    anti = 0;
                }
                else {
                    anti = +((Math.log(plasmids + 50) - 3.91202)).toFixed(5) / 2.888;
                }
                if (global.tech['outpost_boost'] && global.race['truepath'] && p_on['alien_outpost']){
                    anti *= 2;
                }
                anti /= 3;
            }

            if (global.race['nerfed']){
                if (global.race.universe === 'antimatter'){
                    standard /= 2;
                    anti /= 2;
                }
                else {
                    standard /= 5;
                    anti /= 5;
                }
            }

            plasma = {};
            let final = (1 + standard) * (1 + anti) - 1;            
            plasma[key] = [final,standard,anti];
        }

        if (type && type === 'raw'){
            return plasma[key];
        }
        else if (type && type === 'plasmid'){
            return plasma[key][1];
        }
        else if (type && type === 'antiplasmid'){
            return plasma[key][2];
        }
        else {
            return plasma[key][0];
        }
    }
})();
