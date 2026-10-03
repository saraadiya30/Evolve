import { global, p_on, support_on, hell_reports, hell_graphs } from '../core/vars.js';
import { traits, fathomCheck } from '../races/races.js';
import { soulForgeSoldiers, casualties, fortressDefenseRating, renderFortress } from '../portal/portal_f1.js';
import { soulCapacitor } from '../portal/portal_f3.js';
import { jobScale } from '../civics/jobs.js';
import { armyRating, soldierDeath } from '../civics/civics.js';
import { messageQueue } from '../functions/functions.js';
import { loc } from '../core/locale.js';
import { govActive } from '../governor/governor.js';
import { highPopAdjust } from '../resources/prod.js';
import { actions, drawTech } from '../actions/actions.js';
import { asphodelResist } from '../edenic/edenic.js';
import { purgeReports } from '../portal/portal_f7.js';

// Bagian dari bloodwar (portal_f2.js), dipisah mekanis: variabel yang dibagi antar bagian ada di $ctx.

export function bloodwar_s1($ctx){
        $ctx.day_report = {
        start: global.portal.fortress.threat,
        foundGems: 0,
        stats: {
            wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
            kills: {
                drones: 0,
                patrols: 0,
                sieges: 0,
                guns: 0,
                soul_forge: 0,
                turrets: 0
            },
            gems: {
                patrols: 0,
                guns: 0,
                soul_forge: 0,
                crafted: 0,
                turrets: 0,
                surveyors: 0,
                compactor: 0
            },
        }
    };

    let pat_armor = global.tech['armor'] ? global.tech['armor'] : 0;
    if (global.race['armored']){
        pat_armor += traits.armored.vars()[1];
    }
    let torFathom = fathomCheck('tortoisan');
    if (torFathom > 0){
        pat_armor += Math.floor(traits.armored.vars(1)[1] * torFathom);
    }
    if (global.race['scales']){
        pat_armor += traits.scales.vars()[2];
    }

    $ctx.forgeOperating = false;                    
    if (p_on['soul_forge']){
        let troops = global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
        let forge = soulForgeSoldiers();
        if (forge <= troops){
            $ctx.forgeOperating = true;
            $(`#portal-soul_forge .on`).removeClass('altwarn');
        }
        else {
            $ctx.forgeOperating = false;
            $(`#portal-soul_forge .on`).addClass('altwarn');
        }
    }
    else {
        $(`#portal-soul_forge .on`).addClass('altwarn');
    }

    // Drones
    $ctx.drone_kills = 0;
    if (global.tech['portal'] >= 3 && p_on['war_drone']){
        $ctx.day_report.drones = {};
        for (let i=0; i<p_on['war_drone']; i++){
            let drone_report = { encounter: false, kills: 0 };
            if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
                let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));
                let killed = global.tech.portal >= 7 ? Math.rand(50,125) : Math.rand(25,75);
                if (demons < killed){
                    killed = demons;
                }
                global.portal.fortress.threat -= killed;
                global.stats.dkills += killed;
                if ($ctx.forgeOperating){
                    global.portal.soul_forge.kills += killed;
                    soulCapacitor(killed);
                }
                drone_report = { encounter: true, kills: killed };
                $ctx.day_report.stats.kills.drones += killed;
                $ctx.drone_kills += killed;
            }
            $ctx.day_report.drones[i+1] = drone_report;
        }
    }

    if (!global.portal.fortress['pity']){
        global.portal.fortress['pity'] = 0;
    }

    let game_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 9000 : 10000;
    $ctx.gem_chance = game_base - global.portal.fortress.pity;
    
    if (global.tech['portal'] >= 4 && p_on['attractor']){
        $ctx.gem_chance = Math.round($ctx.gem_chance * (0.948 ** p_on['attractor']));
    }

    if (global.race['ghostly']){
        $ctx.gem_chance = Math.round($ctx.gem_chance * ((100 - traits.ghostly.vars()[2]) / 100));
    }

    let wendFathom = fathomCheck('wendigo');
    if (wendFathom > 0){
        $ctx.gem_chance = Math.round($ctx.gem_chance * ((100 - (traits.ghostly.vars(1)[2] * wendFathom)) / 100));
    }

    if ($ctx.gem_chance < 12){
        $ctx.gem_chance = 12;
    }

    // Patrols
    let dead = 0;
    let terminators = p_on['war_droid'] ? p_on['war_droid'] : 0;
    $ctx.has_drop = false;
    let wounded = 0;
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.portal.fortress.garrison){
        wounded = global.civic.garrison.wounded - (global.civic.garrison.workers - global.portal.fortress.garrison);
        if (wounded > global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size)){
            wounded -= global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
            wounded /= global.portal.fortress.patrols;
        }
        else {
            wounded = 0;
        }
    }
    let brkpnt = +(wounded % 1).toFixed(10);
    $ctx.day_report.patrols = {};
    for (let i=0; i<global.portal.fortress.patrols; i++){
        let patrol_report = { encounter: false, droid: false, ambush: false, gem: 0, kills: 0, wounded: 0, died: 0};
        let hurt = brkpnt > (1 / global.portal.fortress.patrols * i) ? Math.ceil(wounded) : Math.floor(wounded);
        if (Math.rand(0,global.portal.fortress.threat) >= Math.rand(0,999)){
            patrol_report.encounter = true;
            let pat_size = global.portal.fortress.patrol_size;
            if (terminators > 0){
                patrol_report.droid = true;
                pat_size += global.tech['hdroid'] ? jobScale(2) : jobScale(1);
                terminators--;
            }
            let pat_rating = Math.round(armyRating(pat_size,'hellArmy',hurt));

            let demons = Math.rand(Math.floor(global.portal.fortress.threat / 50), Math.floor(global.portal.fortress.threat / 10));

            if (global.race['blood_thirst']){
                global.race['blood_thirst_count'] += Math.rand(0,Math.ceil(demons / 10));
                if (global.race['blood_thirst_count'] > traits.blood_thirst.vars()[0]){
                    global.race['blood_thirst_count'] = traits.blood_thirst.vars()[0];
                }
            }

            let odds = 30 + Math.max(global.race['chameleon'] ? traits.chameleon.vars()[1] : 0,
                                     global.race['elusive'] ? traits.elusive.vars()[0] : 0);
            if (global.race['chicken']){
                odds -= Math.round(traits.chicken.vars()[0] / 5);
            }
            if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.f){
                odds += Math.round(3 * traits.ocular_power.vars()[1] / 100);
            }

            if (Math.rand(0,odds) === 0){
                patrol_report.ambush = true;
                dead += casualties(Math.round(demons * (1 + Math.random() * 3)),0,true,patrol_report);
                let killed = Math.round(pat_rating / 2);
                if (demons < killed){
                    killed = demons;
                }
                global.portal.fortress.threat -= killed;
                global.stats.dkills += killed;
                if ($ctx.forgeOperating){
                    global.portal.soul_forge.kills += killed;
                    soulCapacitor(killed);
                }
                patrol_report.kills = killed;
                if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
                    global.race.ocularPowerConfig.ds += Math.round(killed * traits.ocular_power.vars()[1]);
                }
            }
            else {
                let killed = pat_rating;
                if (demons <= killed){
                    killed = demons;
                }
                else {
                    dead += casualties(demons-killed,pat_armor,false,patrol_report);
                }
                patrol_report.kills = killed;
                global.portal.fortress.threat -= killed;
                global.stats.dkills += killed;
                if ($ctx.forgeOperating){
                    global.portal.soul_forge.kills += killed;
                    soulCapacitor(killed);
                }
                if (killed > 0){
                    let div = 35 - Math.floor(p_on['attractor'] / 3);
                    if (div < 5){ div = 5; }
                    let chances = Math.round(killed / div);
                    for (let j=0; j<chances; j++){
                        if (Math.rand(0,$ctx.gem_chance) === 0){
                            patrol_report.gem++;
                            $ctx.day_report.stats.gems.patrols++;
                            global.resource.Soul_Gem.amount++;
                            global.portal.fortress.pity = 0;
                            if (!global.resource.Soul_Gem.display){
                                global.resource.Soul_Gem.display = true;
                                messageQueue(loc('portal_first_gem'),'info',false,['progress','hell']);
                            }
                            $ctx.has_drop = true;
                        }
                    }
                    if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
                        global.race.ocularPowerConfig.ds += Math.round(killed * traits.ocular_power.vars()[1]);
                    }
                }
            }
                
            $ctx.day_report.stats.kills.patrols += patrol_report.kills;
            $ctx.day_report.stats.wounded += patrol_report.wounded;
            $ctx.day_report.stats.died += patrol_report.died;
        }
        $ctx.day_report.patrols[i+1] = patrol_report;
    }

    let revive = 0;
    if (global.race['revive']){
        revive = Math.round(Math.rand(0,(dead / traits.revive.vars()[6]) + 0.25));
        $ctx.day_report.revived = revive;
        $ctx.day_report.stats.revived = revive;
        global.civic.garrison.workers += revive;
    }

    // Soldier Rebalancing
    if (global.civic.garrison.wounded > global.civic.garrison.workers){
        global.civic.garrison.wounded = global.civic.garrison.workers;
    }
    let garrison_size = global.portal.fortress.nocrew ? global.civic.garrison.workers - global.civic.garrison.crew : global.civic.garrison.workers;
    if (garrison_size < global.portal.fortress.garrison){
        global.portal.fortress.garrison = garrison_size;
    }
    if (global.portal.fortress.garrison < global.portal.fortress.patrols * global.portal.fortress.patrol_size){
        let patrol_start = global.portal.fortress.patrols;
        global.portal.fortress.patrols = Math.floor(global.portal.fortress.garrison / global.portal.fortress.patrol_size);
        $ctx.day_report.patrols_lost = patrol_start - global.portal.fortress.patrols;
    }

    if (dead > 0 && global.portal.fortress.notify === 'Yes'){
        if (revive > 0){
            messageQueue(loc('fortress_patrol_casualties_revive',[dead,revive]),false,false,['hell']);
        }
        else {
            messageQueue(loc('fortress_patrol_casualties',[dead]),false,false,['hell']);
        }
    }

    // Siege Chance
    if (global.portal.fortress.garrison > 0 && global.portal.fortress.siege > 0){
        global.portal.fortress.siege--;
    }
    if (global.portal.fortress.siege <= 900 && global.portal.fortress.garrison > 0 && 1 > Math.rand(0,global.portal.fortress.siege)){
        let siege_report = { destroyed: false, damage: 0, kills: 0, surveyors: 0, soldiers: 0};
        let defense = fortressDefenseRating(global.portal.fortress.garrison);
        let defend = defense / 35 > 1 ? defense / 35 : 1;
        let siege = Math.round(global.portal.fortress.threat / 2);

        let damage = 0;
        let killed = 0;
        let destroyed = false;
        while (siege > 0 && global.portal.fortress.walls > 0){
            let terminated = Math.round(Math.rand(1,defend + 1));
            if (terminated > siege){
                terminated = siege;
            }
            siege -= terminated;
            global.portal.fortress.threat -= terminated;
            global.stats.dkills += terminated;
            if ($ctx.forgeOperating){
                global.portal.soul_forge.kills += terminated;
                soulCapacitor(terminated);
            }
            killed += terminated;
            if (siege > 0){
                damage++;
                global.portal.fortress.walls--;
                if (global.portal.fortress.walls === 0){
                    siege_report.destroyed = true;
                    destroyed = true;
                    break;
                }
            }
        }
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
            global.race.ocularPowerConfig.ds += Math.round(killed * traits.ocular_power.vars()[1]);
        }
        siege_report.damage = damage;
        siege_report.kills = killed;
        $ctx.day_report.stats.kills.sieges = killed;
        
        if (destroyed){
            messageQueue(loc('fortress_lost'),false,false,['hell']);
            siege_report.surveyors = global.civic.hell_surveyor.workers;
            global.resource[global.race.species].amount -= global.civic.hell_surveyor.workers;
            global.civic.hell_surveyor.workers = 0;
            global.civic.hell_surveyor.assigned = 0;

            siege_report.soldiers = global.portal.fortress.garrison;
            $ctx.day_report.stats.died += global.portal.fortress.garrison;
            global.portal.fortress.patrols = 0;
            soldierDeath(global.portal.fortress.garrison);
            global.portal.fortress.garrison = 0;
            global.portal.fortress['assigned'] = 0;
        }
        else {
            messageQueue(loc('fortress_sieged',[killed,damage]),false,false,['hell']);
        }

        global.portal.fortress.siege = 999;
        $ctx.day_report.stats.sieges++;
        $ctx.day_report.siege = siege_report;
    }

    if (global.portal.fortress.threat < 10000){
        let influx = ((10000 - global.portal.fortress.threat) / 2500) + 1;
        if (global.tech['portal'] >= 4 && p_on['attractor']){
            influx *= 1 + (p_on['attractor'] * 0.22);
        }
        if (global.race['chicken']){
            influx *= 1 + traits.chicken.vars()[0] / 100;
        }
        if (global.race.universe === 'evil'){
            influx *= 1.1;
        }
        let demon_spawn = Math.rand(Math.round(10 * influx),Math.round(50 * influx));
        global.portal.fortress.threat += demon_spawn;
        $ctx.day_report.demons = demon_spawn;
    }
}

export function bloodwar_s2($ctx){
        if (global.civic.hell_surveyor.display && global.civic.hell_surveyor.workers > 0){
        let divisor = 1000;
        let painVal = govActive('runner',0);
        if (painVal){
            divisor *= 1 + (painVal / 100);
        }
        if (global.race['blurry']){
            divisor *= 1 + (traits.blurry.vars()[0] / 100);
        }
        let fathom = fathomCheck('yeti');
        if (fathom > 0){
            divisor *= 1 + (traits.blurry.vars(1)[0] / 100 * fathom);
        }
        if (global.race['instinct']){
            divisor *= 1 + (traits.instinct.vars()[0] / 100);
        }
        if (global.tech['infernite'] && global.tech.infernite >= 5){
            divisor += 250;
        }
        // Higher danger increases both chance of death and average number of deaths, with no limit
        let danger = jobScale(global.portal.fortress.threat / divisor);

        // Higher exposure increases only chance of death, up to a limit
        let max_risk = jobScale(10);
        let exposure = Math.min(max_risk, global.civic.hell_surveyor.workers);
        let risk = max_risk - Math.rand(0,exposure + 1);

        if (danger > risk){
            let cap = Math.round(danger);
            let dead = Math.rand(0,cap + 1); // +1 for inclusive cap
            if (dead > 0){
                if (dead > global.civic.hell_surveyor.workers){
                    dead = global.civic.hell_surveyor.workers;
                }
                if (global.portal.fortress.s_ntfy === 'Yes'){
                    if (dead === 1){
                        messageQueue(loc('fortress_killed'),false,false,['hell']);
                    }
                    else {
                        messageQueue(loc('fortress_eviscerated',[dead]),false,false,['hell']);
                    }
                }
                $ctx.day_report.surveyors = dead;
                $ctx.day_report.stats.surveyors = dead;
                global.civic.hell_surveyor.workers -= dead;
                global.civic.hell_surveyor.max -= dead;
                global.resource[global.race.species].amount -= dead;
                global.portal.carport.damaged += dead;
            }
        }

        $ctx.day_report.surveyor_finds = {};
        if (global.civic.hell_surveyor.workers > 0 && $ctx.drone_kills > 0){
            let drone_kills_left = $ctx.drone_kills;
            for (let i=0; i<global.civic.hell_surveyor.workers; i++){
                let surv_report = { gem: 0, bodies: 0 };
                // Avoid rounding error in total number of drone kills to distribute
                let max_search_chance = Math.round(drone_kills_left / (global.civic.hell_surveyor.workers - i));
                let min_search_chance = Math.round(max_search_chance / 2);
                drone_kills_left -= max_search_chance;

                // Each surveyor may search from 50% to 100% of 1 equal share of drone kills
                let searched = Math.rand(min_search_chance, max_search_chance+1);
                // Limit to 100 bodies per surveyor
                let search_limit = highPopAdjust(100);
                if (searched > search_limit){ searched = search_limit; }
                surv_report.bodies = searched;
                if (searched > 0){
                    let div = 25 - Math.floor(p_on['attractor'] / 5);
                    if (div < 5){ div = 5; }
                    let chances = Math.round(searched / div);
                    for (let j=0; j<chances; j++){
                        if (Math.rand(0,$ctx.gem_chance) === 0){
                            surv_report.gem++;
                            $ctx.day_report.stats.gems.surveyors++;
                            global.resource.Soul_Gem.amount++;
                            global.portal.fortress.pity = 0;
                            if (!global.resource.Soul_Gem.display){
                                global.resource.Soul_Gem.display = true;
                                messageQueue(loc('portal_first_gem'),'info',false,['progress','hell']);
                            }
                            $ctx.has_drop = true;
                        }
                    }
                }
                $ctx.day_report.surveyor_finds[i+1] = surv_report;
            }
        } 
    }

    if (!$ctx.has_drop && global.portal.fortress.pity < 10000){
        global.portal.fortress.pity++;
    }

    if (global.stats.dkills >= 1000000 && global.tech['gateway'] && !global.tech['hell_pit']){
        global.tech['hell_pit'] = 1;
        global.settings.portal.pit = true;
        messageQueue(loc('portal_hell_pit_found'),'info',false,['progress','hell']);
        renderFortress();
    }

    if (global.tech['hell_pit']){
        if ($ctx.forgeOperating && global.tech.hell_pit >= 5 && p_on['soul_attractor']){
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            if (global.tech['hell_pit'] && global.tech.hell_pit >= 8){ attract *= 2; }
            let souls = p_on['soul_attractor'] * Math.rand(40 + attract, 120 + attract);
            global.portal.soul_forge.kills += souls;
            $ctx.day_report.soul_attractors = souls;
            soulCapacitor(souls);
        }

        if ($ctx.forgeOperating && global.tech['asphodel'] && global.tech.asphodel >= 2 && support_on['ectoplasm_processor']){
            let attract = global.blood['attract'] ? global.blood.attract * 5 : 0;
            let souls = global.civic.ghost_trapper.workers * Math.rand(150 + attract, 250 + attract);
            if (p_on['ascension_trigger'] && global.eden.hasOwnProperty('encampment') && global.eden.encampment.asc){
                let heatSink = actions.interstellar.int_sirius.ascension_trigger.heatSink();
                heatSink = heatSink < 0 ? Math.abs(heatSink) : 0;
                if (heatSink > 0){
                    souls *= 1 + (heatSink / 12500);
                }
            }
            souls = Math.floor(souls * asphodelResist());
            global.portal.soul_forge.kills += souls;
            soulCapacitor(souls);
        }

        if ($ctx.forgeOperating && global.tech['hell_gun'] && p_on['gun_emplacement']){
            $ctx.day_report.gun_emplacements = {};
            let gunKills = 0;
            for (let i=0; i<p_on['gun_emplacement']; i++){
                $ctx.day_report.gun_emplacements[i+1] = { kills: 0, gem: false };
                let kills = global.tech.hell_gun >= 2 ? Math.rand(35,75) : Math.rand(20,40);
                gunKills += kills;
                $ctx.day_report.gun_emplacements[i+1].kills = kills;
            }
            $ctx.day_report.stats.kills.guns = gunKills;
            global.portal.soul_forge.kills += gunKills;
            soulCapacitor(gunKills);
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 6750 : 7500;
            if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
                gun_base *= 0.94 ** p_on['soul_attractor'];
            }
            for (let i=0; i<p_on['gun_emplacement']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    $ctx.day_report.gun_emplacements[i+1].gem = true;
                    $ctx.day_report.stats.gems.guns++;
                    global.resource.Soul_Gem.amount++;
                }
            }
        }

        if ($ctx.forgeOperating){
            $ctx.day_report.soul_forge = { kills: 0, gem: false, gem_craft: false, corrupt: false };
            let forgeKills = Math.rand(25,150);
            $ctx.day_report.stats.kills.soul_forge = forgeKills;
            $ctx.day_report.soul_forge.kills = forgeKills;
            global.stats.dkills += forgeKills;
            global.portal.soul_forge.kills += forgeKills;
            soulCapacitor(forgeKills);
            if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.p){
                global.race.ocularPowerConfig.ds += Math.round(forgeKills * traits.ocular_power.vars()[1]);
            }
            let forge_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 4500 : 5000;
            if (Math.rand(0,forge_base) === 0){
                $ctx.day_report.soul_forge.gem = true;
                $ctx.day_report.stats.gems.soul_forge++;
                global.resource.Soul_Gem.amount++;
            }
        }

        let cap = global.tech.hell_pit >= 6 ? 750000 : 1000000;
        if (global.tech.hell_pit >= 7 && p_on['soul_attractor'] > 0){
            cap *= (global.stats.achieve['what_is_best'] && global.stats.achieve.what_is_best.e >= 3 ? 0.96 : 0.97) ** p_on['soul_attractor'];
        }
        if ($ctx.forgeOperating && global.portal.soul_forge.kills >= Math.round(cap)){
            $ctx.day_report.soul_forge.gem_craft = true;
            let gems = Math.floor(global.portal.soul_forge.kills / Math.round(cap));
            global.portal.soul_forge.kills -= Math.round(cap) * gems;
            let c_max = 10 - p_on['soul_attractor'] > 0 ? 10 - p_on['soul_attractor'] : 1;
            if (global.tech.high_tech >= 16 && !global.tech['corrupt'] && Math.rand(0,c_max + 1) === 0){
                $ctx.day_report.soul_forge.corrupt = true;
                global.resource.Corrupt_Gem.amount++;                  
                global.resource.Corrupt_Gem.display = true;
                messageQueue(loc('portal_corrupt_gem'),'info',false,['progress','hell']);
                global.tech['corrupt'] = 1;
                drawTech();
            }
            else {
                global.resource.Soul_Gem.amount += gems;
                $ctx.day_report.stats.gems.crafted += gems;
            }
        }
    }

    if (global.tech['hell_gate'] && global.tech['hell_gate'] >= 3){
        if (p_on['gate_turret']){
            $ctx.day_report.gate_turrets = {};
            let gunKills = 0;
            let min = global.tech.hell_gun >= 2 ? 65 : 40;
            let max = global.tech.hell_gun >= 2 ? 100 : 60;
            for (let i=0; i<p_on['gate_turret']; i++){
                $ctx.day_report.gate_turrets[i+1] = { kills: 0, gem: false };
                let kills = Math.rand(min,max);
                gunKills += kills;
                $ctx.day_report.gate_turrets[i+1].kills = kills;
            }
            if ($ctx.forgeOperating){
                $ctx.day_report.stats.kills.turrets = gunKills;
                global.portal.soul_forge.kills += gunKills;
                soulCapacitor(gunKills);
            }
            global.stats.dkills += gunKills;
            let gun_base = global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 5 ? 2700 : 3000;
            for (let i=0; i<p_on['gate_turret']; i++){
                if (Math.rand(0,Math.round(gun_base)) === 0){
                    $ctx.day_report.gate_turrets[i+1].gem = true;
                    $ctx.day_report.stats.gems.turrets++;
                    global.resource.Soul_Gem.amount++;
                }
            }
        }
    }

    if (global.eden.hasOwnProperty('soul_compactor') && global.eden.soul_compactor.count === 1){
        $ctx.day_report.stats.gems.compactor = global.eden.soul_compactor.report;
        global.eden.soul_compactor.report = 0;
    }
    
    global.portal.observe.stats.total.days++;
    global.portal.observe.stats.period.days++;
    Object.keys($ctx.day_report.stats).forEach(function(stat){
        if (['kills','gems'].includes(stat)){
            Object.keys($ctx.day_report.stats[stat]).forEach(function(subStat){
                if (stat === 'gems' && $ctx.day_report.stats[stat][subStat]){
                    $ctx.day_report.foundGems += $ctx.day_report.stats[stat][subStat];
                }
                global.portal.observe.stats.total[stat][subStat] += $ctx.day_report.stats[stat][subStat];
                global.portal.observe.stats.period[stat][subStat] += $ctx.day_report.stats[stat][subStat];
            });
        }
        else {
            global.portal.observe.stats.total[stat] += $ctx.day_report.stats[stat];
            global.portal.observe.stats.period[stat] += $ctx.day_report.stats[stat];
        }
    });
    if (!hell_reports[`year-${global.city.calendar.year}`]){
        hell_reports[`year-${global.city.calendar.year}`] = {};
    }
    hell_reports[`year-${global.city.calendar.year}`][`day-${global.city.calendar.day}`] = $ctx.day_report;
    
    purgeReports();
    
    Object.keys(global.portal.observe.graphs).forEach(function (id){
        if (!!document.getElementById(global.portal.observe.graphs[id].chartID)){
            let newData = [];
            hell_graphs[id].data.forEach(function (dataPoint){
                newData.push(dataPoint.length === 3 ? global.portal.observe.stats[dataPoint[0]][dataPoint[1]][dataPoint[2]] : global.portal.observe.stats[dataPoint[0]][dataPoint[1]]);
            });
            hell_graphs[id].graph.data.datasets[0].data = newData;
            hell_graphs[id].graph.update();
        }
    });
}
