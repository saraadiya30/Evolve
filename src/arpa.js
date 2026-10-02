import { global } from './vars.js';
import { eventActive, calcPrestige, darkEffect } from './functions.js';
import { wardenLabel, structName } from './actions.js';
import { drawMechLab } from './portal.js';
import { govActive } from './governor.js';
import { loc } from './locale.js';
import { genePool } from './arp_registry.js';
import { genePoolPart1 } from './arp_genes_1.js';
import { genePoolPart2 } from './arp_genes_2.js';
import { genePoolPart3 } from './arp_genes_3.js';
import { roid_eject_type, payBloodPrice, monument_costs, costMultiplier } from './arpa_g1.js';
export { arpa, payCrispr, payBloodPrice, drawGenes, drawBlood, checkGeneRequirements, checkBloodRequirements, gainGene, gainBlood, arpaAdjustCosts, clearGeneticsDrag, dragGeneticsList, genetics, sequenceLabs, bindTrait } from './arpa_g1.js';
export { blood, buildArpa, arpaProjectCosts, updateTrades } from './arpa_g2.js';

export const arpaProjects = {
    lhc: {
        title(){ return eventActive('fool',2022) ? loc('arpa_projects_railway_title') : loc('arpa_projects_lhc_title'); },
        desc(){ return eventActive('fool',2022) ? loc('arpa_projects_railway_desc') : loc('arpa_projects_lhc_desc'); },
        reqs: { high_tech: 6 },
        grant: 'supercollider',
        effect(nofool){
            if (eventActive('fool',2022) && !nofool){
                return arpaProjects.railway.effect(true);
            }
            let sc = global.tech['tp_particles'] || (global.tech['particles'] && global.tech['particles'] >= 3) ? (global.race['cataclysm'] ? 20 : 8) : (global.race['cataclysm'] ? 10 : 4);
            if (global.tech['storage'] >= 6){
                if (global.race['warlord']){
                    return loc('arpa_projects_lhc_warlord2',[loc('portal_twisted_lab_title'),sc,100]);
                }
                else if (global.tech['particles'] && global.tech['particles'] >= 4){
                    return global.race['cataclysm'] ? loc('arpa_projects_lhc_cataclysm3',[sc]) : loc('arpa_projects_lhc_effect3',[sc,global.race['orbit_decayed'] ? loc('space_home_satellite_title') : wardenLabel()]);
                }
                else {
                    return global.race['cataclysm'] ? loc('arpa_projects_lhc_cataclysm2',[sc]) : loc('arpa_projects_lhc_effect2',[sc,global.race['orbit_decayed'] ? loc('space_home_satellite_title') : wardenLabel()]);
                }
            }
            else {
                if (global.race['warlord']){
                    return loc('arpa_projects_lhc_warlord1',[loc('portal_twisted_lab_title'),sc]);
                }
                else {
                    return global.race['cataclysm'] ? loc('arpa_projects_lhc_cataclysm1',[sc]) : global.tech['isolation'] ? loc('arpa_projects_lhc_iso1',[sc,loc('tech_infectious_disease_lab_alt')]) : (loc('arpa_projects_lhc_effect1',[sc,global.race['orbit_decayed'] ? loc('space_home_satellite_title') : wardenLabel()]));
                }
            }
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('lhc', offset, 2500000, 1.05, wiki); },
            Knowledge(offset,wiki){ return costMultiplier('lhc', offset, 500000, 1.05, wiki); },
            Copper(offset,wiki){ return costMultiplier('lhc', offset, 125000, 1.05, wiki); },
            Cement(offset,wiki){ return costMultiplier('lhc', offset, 250000, 1.05, wiki); },
            Aluminium(offset,wiki){ return costMultiplier('lhc', offset, 350000, 1.05, wiki); },
            Titanium(offset,wiki){ return costMultiplier('lhc', offset, 50000, 1.05, wiki); },
            Polymer(offset,wiki){ return costMultiplier('lhc', offset, 12000, 1.05, wiki); }
        }
    },
    stock_exchange: {
        title: loc('arpa_projects_stock_exchange_title'),
        desc: loc('arpa_projects_stock_exchange_desc'),
        reqs: { banking: 9 },
        grant: 'stock_exchange',
        effect(){
            if (global.race['warlord']){
                return loc('arpa_projects_stock_exchange_warlord',[structName('casino'),5,1]);
            }
            else if (global.tech['banking'] >= 10){
                if (global.race['cataclysm']){
                    return global.tech['gambling'] && global.tech['gambling'] >= 4 
                    ? loc('arpa_projects_stock_exchange_cataclysm2',[loc('space_red_spaceport_title'),10,structName('casino'),5,1]) 
                    : loc('arpa_projects_stock_exchange_cataclysm1',[loc('space_red_spaceport_title'),10]);
                }
                else {
                    return global.tech['gambling'] && global.tech['gambling'] >= 4 
                        ? loc('arpa_projects_stock_exchange_effect3',[loc('city_bank'),10,loc(`job_banker`),2,structName('casino'),5,1]) 
                        : loc('arpa_projects_stock_exchange_effect2',[loc('city_bank'),10,loc(`job_banker`),2]);
                }
            }
            else {
                return loc('arpa_projects_stock_exchange_effect1',[loc('city_bank'),10]);
            }
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('stock_exchange', offset, 3000000, 1.06, wiki); },
            Plywood(offset,wiki){ return costMultiplier('stock_exchange', offset, 25000, 1.06, wiki); },
            Brick(offset,wiki){ return costMultiplier('stock_exchange', offset, 20000, 1.06, wiki); },
            Wrought_Iron(offset,wiki){ return costMultiplier('stock_exchange', offset, 10000, 1.06, wiki); }
        }
    },
    tp_depot: {
        title: loc('galaxy_gateway_depot'),
        desc: loc('arpa_projects_depot_desc'),
        reqs: { high_tech: 6, storage: 4 },
        grant: 'tp_depot',
        path: ['truepath'],
        effect(){
            return loc(global.tech['isolation'] ? 'arpa_projects_depot_effect_iso' : 'arpa_projects_depot_effect',[5,50]);
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('tp_depot', offset, 1800000, 1.08, wiki); },
            Stone(offset,wiki){ return costMultiplier('tp_depot', offset, 750000, 1.08, wiki); },
            Iron(offset,wiki){ return costMultiplier('tp_depot', offset, 250000, 1.08, wiki); },
            Alloy(offset,wiki){ return costMultiplier('tp_depot', offset, 30000, 1.08, wiki); }
        }
    },
    launch_facility: {
        id: 'arpalaunch_facility',
        title: loc('arpa_projects_launch_facility_title'),
        desc: loc('arpa_projects_launch_facility_desc'),
        reqs: { high_tech: 7 },
        condition(){
            return global.race['cataclysm'] || global.race['lone_survivor'] || global.race['warlord'] ? false : true;
        },
        grant: 'launch_facility',
        rank: 1,
        queue_complete(){ return global.tech.space >= 1 ? 0 : 1; },
        effect(){
            return loc('arpa_projects_launch_facility_effect1');
        },
        cost: {
            Money(offset){ return costMultiplier('launch_facility', offset, 2000000, 1.1); },
            Knowledge(offset){ return costMultiplier('launch_facility', offset, 500000, 1.1); },
            Cement(offset){ return costMultiplier('launch_facility', offset, 150000, 1.1); },
            Oil(offset){ return costMultiplier('launch_facility', offset, 20000, 1.1); },
            Sheet_Metal(offset){ return costMultiplier('launch_facility', offset, 15000, 1.1); },
            Alloy(offset){ return costMultiplier('launch_facility', offset, 25000, 1.1); }
        }
    },
    monument: {
        title(wiki){
            if (wiki){
                return loc('arpa_project_monument_title');
            }
            switch(global.arpa.m_type){
                case 'Obelisk':
                    return loc('arpa_project_monument_obelisk');
                case 'Statue':
                    return loc('arpa_project_monument_statue');
                case 'Sculpture':
                    return loc('arpa_project_monument_sculpture');
                case 'Monolith':
                    return loc('arpa_project_monument_monolith');
                case 'Pillar':
                    return loc('arpa_project_monument_pillar');
                case 'Megalith':
                    return loc('arpa_project_monument_megalith');
            }
        },
        desc: loc('arpa_projects_monument_desc'),
        reqs: { monument: 1 },
        grant: 'monuments',
        effect(){
            let gasVal = govActive('gaslighter',2);
            let mcap = gasVal ? 2 - gasVal: 2;
            return loc('arpa_projects_monument_effect1',[mcap]);
        },
        cost: {
            Stone(offset,wiki){ return monument_costs('Stone', offset, wiki) },
            Aluminium(offset,wiki){ return monument_costs('Aluminium', offset, wiki) },
            Cement(offset,wiki){ return monument_costs('Cement', offset, wiki) },
            Steel(offset,wiki){ return monument_costs('Steel', offset, wiki) },
            Lumber(offset,wiki){ return monument_costs('Lumber', offset, wiki) },
            Crystal(offset,wiki){ return monument_costs('Crystal', offset, wiki) }
        }
    },
    railway: {
        title(){ return eventActive('fool',2022) ? loc('arpa_projects_lhc_title') : loc('arpa_projects_railway_title'); },
        desc(){ return eventActive('fool',2022) ? loc('arpa_projects_lhc_desc') : loc('arpa_projects_railway_desc'); },
        reqs: { high_tech: 6, trade: 3 },
        grant: 'railway',
        effect(nofool){
            if (eventActive('fool',2022) && !nofool){
                return arpaProjects.lhc.effect(true);
            }
            let routes = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 2 ? 1 : 0;
            let profit = global.stats.achieve['banana'] && global.stats.achieve.banana.l >= 1 ? 3 : 2;
            let desc = '';
            if (global.race['cataclysm'] || global.race['orbit_decayed']){
                routes += global.space['gps'] ? Math.floor(global.space.gps.count / 3) : 0;
                routes *= 10000;
                desc = loc('arpa_projects_railway_cataclysm1',[routes,profit,3,1]);
            }
            else if (global.race['warlord']){
                routes += 5;
                routes *= 10000;
                desc = loc('arpa_projects_railway_warlord1',[routes,profit]);
            }
            else {
                routes += global.city['storage_yard'] ? Math.floor(global.city.storage_yard.count / 6) : 0;
                routes *= 10000;
                desc = loc('arpa_projects_railway_effect1',[routes,profit,6,1]);
            }
            if (global.tech['hell_lake'] && global.tech.hell_lake >= 7){
                desc += ` ${loc('arpa_projects_railway_highway',[1,global.resource.Asphodel_Powder.name,loc('eden_asphodel_harvester_title'),1])}`;
            }
            return desc;
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('railway', offset, 2500000, 1.08, wiki); },
            Lumber(offset,wiki){ return costMultiplier('railway', offset, 750000, 1.08, wiki); },
            Iron(offset,wiki){ return costMultiplier('railway', offset, 300000, 1.08, wiki); },
            Steel(offset,wiki){ return costMultiplier('railway', offset, 450000, 1.08, wiki); }
        }
    },
    roid_eject: {
        title(){ return loc('arpa_projects_roid_eject_title',[roid_eject_type()]); },
        desc(){ return loc(global.tech['roid_eject'] <= 10 ? 'arpa_projects_roid_eject_desc' : 'arpa_projects_roid_eject_desc2',[roid_eject_type()]); },
        reqs: { blackhole: 6, gateway: 3 },
        grant: 'roid_eject',
        effect(){
            let mass = 0;
            let next = 0;
            if (global.tech['roid_eject']){
                mass += 0.225 * global.tech['roid_eject'] * (1 + (global.tech['roid_eject'] / 12));
                next = (0.225 * (global.tech['roid_eject'] + 1) * (1 + ((global.tech['roid_eject'] + 1) / 12))) - mass;
            }
            return `<div>${loc('arpa_projects_roid_eject_effect1')}</div><div>${loc('arpa_projects_roid_eject_effect2',[+(mass).toFixed(3),+(next).toFixed(3),roid_eject_type()])}</div>`;
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('roid_eject', offset, 18750000, 1.075, wiki); },
            Deuterium(offset,wiki){ return costMultiplier('roid_eject', offset, 375000, 1.075, wiki); },
            Bolognium(offset,wiki){ return costMultiplier('roid_eject', offset, 15000, 1.075, wiki); }
        }
    },
    nexus: {
        title: loc('arpa_projects_nexus_title'),
        desc: loc('arpa_projects_nexus_desc'),
        reqs: { magic: 5 },
        grant: 'nexus',
        effect(){
            if (global.tech['roguemagic'] && global.tech.roguemagic >= 7){
                return `<div>${loc('arpa_projects_nexus_effect1',[5])}</div><div>${loc('witch_hunter_nexus',[4])}</div>`;
            }
            return loc('arpa_projects_nexus_effect1',[5]);
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('nexus', offset, 5000000, 1.12, wiki); },
            Crystal(offset,wiki){ return costMultiplier('nexus', offset, 60000, 1.12, wiki); },
            Iridium(offset,wiki){ return costMultiplier('nexus', offset, 35000, 1.12, wiki); }
        }
    },
    syphon: {
        title: loc('arpa_syphon_title'),
        desc(){
            let desc = '';
            if (global.tech['syphon'] && global.tech.syphon >= 0){
                desc = `<div>${loc('arpa_syphon_desc')}</div><div class="has-text-danger">${loc('arpa_syphon_desc_warn2')}</div>`;
            }
            else {
                desc = `<div>${loc('arpa_syphon_desc')}</div><div class="has-text-danger">${loc('arpa_syphon_desc_warn1')}</div>`;
            }
            if (global.race['witch_hunter']){
                desc += `<div class="has-text-caution">${loc(`witch_hunter_suspicion`)}</div>`;
            }
            return desc;
        },
        reqs: { veil: 2 },
        grant: 'syphon',
        effect(){
            let mana = +(1/3 * darkEffect('magic')).toFixed(3);
            if (global.tech['syphon'] && global.tech.syphon >= 60){
                let gains = calcPrestige('vacuum');
                let plasmidType = loc('resource_Plasmid_plural_name');
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect4')}</div><div class="has-text-advanced">${loc('arpa_syphon_effect_reward',[gains.plasmid,gains.phage,gains.dark,plasmidType,80])}</div>`;
            }
            else if (global.tech['syphon'] && global.tech.syphon >= 40){
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect3')}</div>`;
            }
            else if (global.tech['syphon'] && global.tech.syphon >= 20){
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect2')}</div>`;
            }
            else {
                return `<div>${loc('arpa_syphon_effect_main',[mana])}</div><div class="has-text-caution">${loc('arpa_syphon_effect1')}</div>`;
            }
        },
        cost: {
            Money(offset,wiki){ return costMultiplier('syphon', offset, 7500000, 1.025, wiki); },
            Mana(offset,wiki){ return costMultiplier('syphon', offset, 5000, 1.025, wiki); },
            Crystal(offset,wiki){ return costMultiplier('syphon', offset, 100000, 1.025, wiki); },
            Infernite(offset,wiki){ return costMultiplier('syphon', offset, 10000, 1.025, wiki); },
        }
    },
};

Object.assign(genePool,
    genePoolPart1,
    genePoolPart2,
    genePoolPart3
);
export { genePool };


export const bloodPool = {
    purify: {
        id: 'blood-purify',
        title: loc('arpa_blood_purify_title'),
        desc: loc('arpa_blood_purify_desc'),
        reqs: {},
        grant: ['spire',1],
        cost: { Blood_Stone(){ return 10; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    chum: {
        id: 'blood-chum',
        title: loc('arpa_blood_chum_title'),
        desc: loc('arpa_blood_chum_desc'),
        reqs: { spire: 1 },
        grant: ['spire',2],
        cost: { Blood_Stone(){ return 25; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    lust: {
        id: 'blood-lust',
        title: loc('arpa_blood_lust_title'),
        desc: loc('arpa_blood_lust_desc'),
        reqs: {},
        grant: ['lust','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['lust'] || 0)) * 15 + 15; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['lust'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    illuminate: {
        id: 'blood-illuminate',
        title: loc('arpa_blood_illuminate_title'),
        desc: loc('arpa_blood_illuminate_desc'),
        reqs: {},
        grant: ['illuminate','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['illuminate'] || 0)) * 12 + 12; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['illuminate'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    greed: {
        id: 'blood-greed',
        title: loc('arpa_blood_greed_title'),
        desc: loc('arpa_blood_greed_desc'),
        reqs: {},
        grant: ['greed','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['greed'] || 0)) * 16 + 16; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['greed'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    hoarder: {
        id: 'blood-hoarder',
        title: loc('arpa_blood_hoarder_title'),
        desc: loc('arpa_blood_hoarder_desc'),
        reqs: {},
        grant: ['hoarder','*'],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['hoarder'] || 0)) * 14 + 14; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['hoarder'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    artisan: {
        id: 'blood-artisan',
        title: loc('arpa_blood_artisan_title'),
        desc: loc('arpa_blood_artisan_desc'),
        reqs: {},
        grant: ['artisan','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['artisan'] || 0)) * 8 + 8; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['artisan'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    attract: {
        id: 'blood-attract',
        title: loc('arpa_blood_attract_title'),
        desc: loc('arpa_blood_attract_desc'),
        reqs: {},
        grant: ['attract','*'],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['attract'] || 0)) * 4 + 4; },
            Artifact(wiki){ return ((wiki || 0) + (global.blood['attract'] || 0)) % 5 === 0 ? 1 : 0; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    wrath: {
        id: 'blood-wrath',
        title: loc('arpa_blood_wrath_title'),
        desc: loc('arpa_blood_wrath_desc'),
        reqs: {},
        grant: ['wrath','*'],
        cost: {
            Blood_Stone(wiki){ return ((wiki || 0) + (global.blood['wrath'] || 0)) * 2 + 2; },
            Artifact(){ return 1; }
        },
        effect(){ return `<span class="has-text-caution">${loc('arpa_blood_repeat')}</span>`; },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    prepared: {
        id: 'blood-prepared',
        title: loc('arpa_blood_prepared_title'),
        desc: loc('arpa_blood_prepared_desc'),
        reqs: {},
        grant: ['prepared',1],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 50; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        },
        post(){
            drawMechLab();
        }
    },
    compact: {
        id: 'blood-compact',
        title: loc('arpa_blood_compact_title'),
        desc: loc('arpa_blood_compact_desc'),
        reqs: { prepared: 1 },
        grant: ['prepared',2],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 75; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    infernal: {
        id: 'blood-infernal',
        title: loc('arpa_blood_infernal_title'),
        desc: loc('arpa_blood_infernal_desc'),
        reqs: { prepared: 2 },
        grant: ['prepared',3],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(){ return 125; },
            Artifact(){ return 1; }
        },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    unbound: {
        id: 'blood-unbound',
        title: loc('arpa_blood_unbound_title'),
        desc: loc('arpa_blood_unbound_desc'),
        reqs: {},
        grant: ['unbound',1],
        cost: { Blood_Stone(){ return 50; }, },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    unbound_resistance: {
        id: 'blood-unbound_resistance',
        title: loc('arpa_blood_unbound_resistance_title'),
        desc: loc('arpa_blood_unbound_resistance_desc'),
        reqs: { unbound: 1 },
        grant: ['unbound',2],
        cost: { Blood_Stone(){ return 100; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    shadow_war: {
        id: 'blood-shadow_war',
        title: loc('arpa_blood_shadow_war_title'),
        desc: loc('arpa_blood_shadow_war_desc'),
        reqs: { unbound: 2 },
        grant: ['unbound',3],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: {
            Blood_Stone(){ return 250; },
            Artifact(){ return 2; }
        },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    unbound_immunity: {
        id: 'blood-unbound_immunity',
        title: loc('arpa_blood_unbound_immunity_title'),
        desc: loc('arpa_blood_unbound_immunity_desc'),
        reqs: { unbound: 3 },
        grant: ['unbound',4],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 500; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
    blood_aware: {
        id: 'blood-blood_aware',
        title: loc('arpa_blood_blood_aware_title'),
        desc: loc('arpa_blood_blood_aware_desc'),
        reqs: {},
        grant: ['aware',1],
        condition(){
            return global.genes['blood'] && global.genes.blood >= 3 ? true : false;
        },
        cost: { Blood_Stone(){ return 10; } },
        action(){
            if (payBloodPrice($(this)[0].cost)){
                return true;
            }
            return false;
        }
    },
}
