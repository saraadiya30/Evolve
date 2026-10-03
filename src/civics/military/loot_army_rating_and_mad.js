import { global, p_on } from '../../core/vars.js';
import { jobScale } from '../jobs.js';
import { traits, biomes, fathomCheck, blubberFill, planetTraits, racialTrait } from '../../races/races.js';
import { darkEffect, vBind, popover, calcPrestige } from '../../functions/functions.js';
import { templeCount } from '../../actions/actions.js';
import { astrologySign, astroVal } from '../../systems/seasons.js';
import { govActive } from '../../governor/governor.js';
import { OCULAR_POWER_DISINTEGRATION_BASE, OCULAR_POWER_WOUND_BASE } from '../../config/ocular_power.js';
import { soulForgeSoldiers } from '../../portal/portal.js';
import { loc } from '../../core/locale.js';
import { warhead } from '../../resets/resets.js';
import { govEffect } from '../civics.js';
import { looters } from './soldier_breakdown_and_war_campaign.js';

// Fungsi-fungsi dipindah dari civics.js (urutan sumber dipertahankan). civics.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function lootModify(val,gov){
    let looting = looters();
    if (global.race['high_pop']){
        looting = looting / jobScale(1);
    }
    let loot = val * Math.log(looting + 1);
    if (global.race['invertebrate']){
        loot *= 1 - (traits.invertebrate.vars()[0] / 100);
    }
    if (global.race.universe === 'evil'){
        loot *= darkEffect('evil');
    }
    if (global.race['gravity_well']){
        loot *= 1 - (0.75 * darkEffect('heavy'));
    }
    if (global.race['parasite']){
        loot *= 1 - (traits.parasite.vars()[0] / 100);
    }

    switch(global.civic.garrison.tactic){
        case 1:
            loot *= 4;
            break;
        case 2:
            loot *= 30;
            break;
        case 3:
            loot *= 100;
            break;
        case 4:
            loot *= 400;
            break;
    }

    if (global.race['banana']){
        loot *= 0.5;
    }
    if (global.city.biome === 'swamp'){
        loot *= biomes.swamp.vars()[1];
    }

    return Math.floor(loot * global.civic.foreign[`gov${gov}`].eco / 100);
}

export function weaponTechModifer(){
    let weapon_tech = global.tech['military'] ? (global.tech.military >= 5 ? global.tech.military - 1 : global.tech.military) : 1;
    if (global.tech['military'] && global.tech.military > 1){
        weapon_tech -= global.tech.military >= 11 ? 2 : 1;
        if (global.race['sniper']){
            weapon_tech *= 1 + (traits.sniper.vars()[0] / 100 * weapon_tech);
        }
        let fathom = fathomCheck('centaur');
        if (fathom > 0){
            weapon_tech *= 1 + (traits.sniper.vars(1)[0] / 100 * weapon_tech * fathom);
        }
        weapon_tech += global.tech.military >= 11 ? 2 : 1;
    }
    return weapon_tech;
}

export function soldierDeath(v){
    let killed = v;
    if (killed > global.civic.garrison.workers){
        killed = global.civic.garrison.workers;
    }
    global.civic.garrison.workers -= killed;
    global.stats.died += killed;
    blubberFill(killed);
}

export function armyRating(val,type,wound,analysis){
    if (!global.civic.hasOwnProperty('garrison')){
        return 1;
    }

    let data = [];

    let wounded = 0;
    if (typeof wound === "number"){
        wounded = wound;
    }
    else if (val > global.civic.garrison.workers - global.civic.garrison.wounded){
        wounded = val - (global.civic.garrison.workers - global.civic.garrison.wounded);
    }

    let weapon_tech = weaponTechModifer();
    let rhinoFathom = fathomCheck('rhinotaur');
    let adjusted_val = val - (wounded / 2);
    if (global.race['rage'] || rhinoFathom > 0){
        let rageVal = global.race['rage'] ? (wounded * traits.rage.vars()[1] / 100) : 0;
        let fathomVal = rhinoFathom > 0 ? (wounded * traits.rage.vars(1)[1] / 100 * rhinoFathom) : 0;
        adjusted_val = val + rageVal + fathomVal;
    }
    data.push({ k: 'base', v: adjusted_val });
    if (global.tech.military){ data.push({ k: 'civics_garrison_weaponry', v: weapon_tech - 1 }); }
    let army = global.tech['military'] ? adjusted_val * weapon_tech : adjusted_val;
    if (type === 'army' || type === 'hellArmy' || type === 'Troops'){
        if (global.race['tactical']){
            let tactical = (traits.tactical.vars()[0] * global.race['tactical'] / 100);
            army *= 1 + tactical;
            data.push({ k: 'trait_tactical_name', v: tactical });
        }
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 4){
            let zealotry = (templeCount() * 0.01);
            army *= 1 + zealotry;
            data.push({ k: 'tech_zealotry', v: zealotry });
        }
        if (global.race['rage']){
            let rage = (traits.rage.vars()[0] / 100 * (global.civic.garrison.wounded || 0));
            army *= 1 + rage;
            data.push({ k: 'trait_rage_name', v: rage });
        }
        if (rhinoFathom > 0){
            let rage = (traits.rage.vars(1)[0] / 100 * rhinoFathom * (global.civic.garrison.wounded || 0));
            army *= 1 + rage;
            data.push({ k: 'trait_rage_thrall', v: rage });
        }
        if (global.race['puny']){
            let puny = (traits.puny.vars()[0] / 100);
            army *= 1 - puny;
            data.push({ k: 'trait_puny_name', v: -(puny) });
        }
        if (global.race['claws']){
            let claws = (traits.claws.vars()[0] / 100);
            army *= 1 + claws;
            data.push({ k: 'trait_claws_name', v: claws });
        }
        let scorpidFathom = fathomCheck('scorpid');
        if (scorpidFathom > 0){
            let claws = (traits.claws.vars(1)[0] / 100 * scorpidFathom);
            army *= 1 + claws;
            data.push({ k: 'trait_claws_thrall', v: claws });
        }
        if (global.race['chameleon']){
            let cham = (traits.chameleon.vars()[0] / 100);
            army *= 1 + cham;
            data.push({ k: 'trait_chameleon_name', v: cham });
        }
        if (global.race['cautious'] && global.city.calendar.weather === 0){
            let cautious = (traits.cautious.vars()[0] / 100);
            army *= 1 - cautious;
            data.push({ k: 'trait_cautious_name', v: -(cautious) });
        }
        if (global.race['apex_predator']){
            let apex = (traits.apex_predator.vars()[0] / 100);
            army *= 1 + apex;
            data.push({ k: 'trait_apex_predator_name', v: apex });
        }
        let sharkinFathom = fathomCheck('sharkin');
        if (sharkinFathom > 0){
            let apex = (traits.apex_predator.vars(1)[0] / 100 * sharkinFathom);
            army *= 1 + apex;
            data.push({ k: 'trait_apex_predator_thrall', v: apex });
        }
        if (global.race['swift']){
            let swift = (traits.swift.vars()[0] / 100);
            army *= 1 + swift;
            data.push({ k: 'trait_swift_name', v: swift });
        }
        if (global.race['iron_wood']){
            let iron_wood = (traits.iron_wood.vars()[0] / 100);
            army *= 1 + iron_wood;
            data.push({ k: 'trait_iron_wood_name', v: iron_wood });
        }
        if (global.race['fiery']){
            let fiery = (traits.fiery.vars()[0] / 100);
            army *= 1 + fiery;
            data.push({ k: 'trait_fiery_name', v: fiery });
        }
        let balorgFathom = fathomCheck('balorg');
        if (balorgFathom > 0){
            let fiery = (traits.fiery.vars(1)[0] / 100 * balorgFathom);
            army *= 1 + fiery;
            data.push({ k: 'trait_fiery_thrall', v: fiery });
        }
        if (global.race['sticky']){
            let sticky = (traits.sticky.vars()[1] / 100);
            army *= 1 + sticky;
            data.push({ k: 'trait_sticky_name', v: sticky });
        }
        let pingFathom = fathomCheck('pinguicula');
        if (pingFathom > 0){
            let sticky = (traits.sticky.vars(1)[1] / 100 * pingFathom);
            army *= 1 + sticky;
            data.push({ k: 'trait_sticky_thrall', v: sticky })
        }
        if (global.race['pathetic']){
            let pathetic = (traits.pathetic.vars()[0] / 100);
            army *= 1 - pathetic;
            data.push({ k: 'trait_pathetic_name', v: -(pathetic) });
        }
        if (global.race['holy'] && type === 'hellArmy'){
            let holy = (traits.holy.vars()[0] / 100);
            army *= 1 + holy;
            data.push({ k: 'trait_holy_name', v: holy });
        }
        let unicornFathom = fathomCheck('unicorn');
        if (unicornFathom > 0 && type === 'hellArmy'){
            let holy = (traits.holy.vars(1)[0] / 100 * unicornFathom);
            army *= 1 + holy;
            data.push({ k: 'trait_holy_thrall', v: holy });
        }
        if (global.race['banana'] && type === 'hellArmy'){
            army *= 0.8;
            data.push({ k: 'banana', v: -(20) });
        }
        if (astrologySign() === 'aries'){
            let astro = (astroVal('aries')[0] / 100);
            army *= 1 + astro;
            data.push({ k: 'sign_aries', v: astro });
        }
        let tacVal = govActive('tactician',0);
        if (tacVal){
            let tac = (tacVal / 100);
            army *= 1 + tac;
            data.push({ k: 'gov_trait_tactician', v: tac });
        }
        if (global.city.ptrait.includes('rage')){
            let rage = planetTraits.rage.vars()[0];
            army *= rage;
            data.push({ k: 'planet_rage_bd', v: rage - 1 });
        }
        if (global.race['elemental']){
            let elemental = (traits.elemental.vars()[5] / 100);
            army *= 1 + elemental;
            data.push({ k: 'trait_elemental_name', v: elemental });
        }
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.d){
            let attack = OCULAR_POWER_DISINTEGRATION_BASE * (traits.ocular_power.vars()[1] / 100);
            let ocular = (attack / 100);
            army *= 1 + ocular;
            data.push({ k: 'trait_ocular_power_name', v: ocular });
        }
        if (global.tech['psychic'] && global.race['psychicPowers'] && global.race.psychicPowers.hasOwnProperty('assaultTime')){
            let boost = 0;
            if (global.race.psychicPowers.assaultTime > 0){
                boost += traits.psychic.vars()[3] / 100;
            }
            if (global.tech.psychic >= 4 && global.race.psychicPowers['channel']){
                let rank = global.stats.achieve['nightmare'] && global.stats.achieve.nightmare['mg'] ? global.stats.achieve.nightmare.mg : 0;
                boost += +(traits.psychic.vars()[3] / 50000 * rank * global.race.psychicPowers.channel.assault).toFixed(3);
            }
            army *= 1 + boost;
            data.push({ k: 'tech_psychic_attack', v: boost });
        }
    }
    if (type === 'hunting'){
        if (global.race['unfathomable']){
            army *= 0.66;
            data.push({ k: 'trait_unfathomable_name', v: -(34) });
        }
        if (global.race['ocular_power'] && global.race['ocularPowerConfig'] && global.race.ocularPowerConfig.w){
            let hunt = OCULAR_POWER_WOUND_BASE * (traits.ocular_power.vars()[1] / 100);
            let ocular = (hunt / 100);
            army *= 1 + ocular;
            data.push({ k: 'trait_ocular_power_name', v: ocular });
        }
    }
    if (global.race['tusk']){
        let bonus = traits.tusk.vars()[1] / 100;
        if (type === 'hellArmy'){ bonus /= 2; }
        army *= 1 + bonus;
        data.push({ k: 'trait_tusk_name', v: bonus });
    }
    if (global.race['grenadier']){
        let grenadier = (traits.grenadier.vars()[0] / 100);
        if (type === 'hellArmy' && global.race['warlord']){
            grenadier *= 0.4;
        }
        army *= 1 + grenadier;
        data.push({ k: 'trait_grenadier_name', v: grenadier });
    }
    if (global.race['rejuvenated']){
        army *= 1.05;
        data.push({ k: 'rejuvenated', v: 0.05 });
    }
    if (global.civic.govern.type === 'autocracy'){
        let auto = (govEffect.autocracy()[1] / 100);
        army *= 1 + auto;
        data.push({ k: 'govern_autocracy', v: auto });
    }
    if (global.race.universe === 'evil' && global.resource.Authority.display){
        if (global.resource.Authority.amount > 100){
            let boost = (global.resource.Authority.amount - 100) / global.resource.Authority.amount * 0.75;
            boost *= darkEffect('evil',true);
            army *= 1 + boost;
            data.push({ k: 'resource_Authority_name', v: boost });
        }
        else {
            let auth = global.resource.Authority.amount / 100;
            army *= auth;
            data.push({ k: 'resource_Authority_name', v: -(1 - auth) });
        }
    }
    army = Math.floor(army);
    let racial = racialTrait(val,type);
    army *= racial;

    if (racial > 1){
        data.push({ k: 'misc', v: racial - 1 });
    }
    else if (racial < 1){
        data.push({ k: 'misc', v: -(1 - racial) });
    }

    if ((type === 'army' || type === 'hellArmy' || type === 'Troops') && global.race['parasite']){
        if (val === 1){
            army += 2;
            data.push({ k: 'trait_parasite_name', v: '2' });
        }
        else if (val > 1){
            army += 4;
            data.push({ k: 'trait_parasite_name', v: '4' });
        }
    }
    
    if (analysis){ return data; }
    if (army <= 0 && val > 0){ army = 0.01; }
    return army;
}

export function garrisonSize(max, args = {}){
    if (!global.civic.garrison){
        return 0;
    }
    let type = max ? 'max' : 'workers';
    let fortress = global.portal['fortress'] ? global.portal.fortress.garrison : 0;
    let fob = global.space['fob'] && !args['nofob'] ? global.space.fob.troops : 0;
    let pillbox = global.eden['pillbox'] && !args['nopill'] ? global.eden.pillbox.staffed : 0;
    let troops = global.civic.garrison[type] - global.civic.garrison.crew - fortress - fob - pillbox;
    if (global.race['warlord'] && p_on['soul_forge'] && !args['no_forge']){
        let forge = soulForgeSoldiers();
        if (troops >= forge){ troops -= forge; }
    }
    return troops;
}

export function defineMad(){
    if (global.race['sludge'] || global.race['ultra_sludge']){ return false; }
    if ($(`#mad`).length === 0){
        let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
        var mad_command = $('<div id="mad" v-show="display" class="tile is-child"></div>');
        $('#military').append(mad_command);
        var mad = $('<div class="mad"></div>');
        mad_command.append(mad);

        mad.append($(`<div class="warn">${loc('civics_mad_reset_desc',[plasmidType])}</div>`));

        let altText = global.race['hrt'] && ['wolven','vulpine'].includes(global.race['hrt']) ? true : false;

        mad.append($(`<div class="defcon mdarm"><button class="button arm" @click="arm">${loc(altText ? 'civics_mad_arm_grenades' : 'civics_mad_arm_missiles')}</button></div>`));
        mad.append($(`<div class="defcon mdlaunch"><button class="button" @click="launch" :disabled="armed">${loc(altText ? 'civics_mad_launch_grenades' : 'civics_mad_launch_missiles')}</button></div>`));

        if (!global.civic.mad.armed){
            $('#mad').addClass('armed');
            $('#mad .arm').html(loc(altText ? 'civics_mad_disarm_grenades' : 'civics_mad_disarm_missiles'));
        }

        vBind({
            el: '#mad',
            data: global.civic['mad'],
            methods: {
                launch(){
                    if (!global.civic.mad.armed && !global.race['cataclysm']){
                        $('body').addClass('nuke');
                        let nuke = $('<div class="nuke"></div>');
                        $('body').append(nuke);
                        setTimeout(function(){
                            nuke.addClass('burn');
                        }, 500);
                        setTimeout(function(){
                            nuke.addClass('b');
                        }, 600);
                        setTimeout(function(){
                            warhead();
                        }, 4000);
                    }
                },
                arm(){
                    if (global.civic.mad.armed){
                        $('#mad .arm').html(loc(altText ? 'civics_mad_disarm_grenades' : 'civics_mad_disarm_missiles'));
                        global.civic.mad.armed = false;
                        $('#mad').addClass('armed');
                    }
                    else {
                        $('#mad .arm').html(loc(altText ? 'civics_mad_arm_grenades' : 'civics_mad_arm_missiles'));
                        global.civic.mad.armed = true;
                        $('#mad').removeClass('armed');
                    }
                }
            }
        });

        ['mdarm','mdlaunch'].forEach(function(k){
            popover(`mad${k}`,
                function(){ return '<span>{{ label() }}</span>'; },
                {
                    elm: `#mad .${k}`,
                    in: function(obj){
                        vBind({
                            el: `#${obj.id} > span`,
                            data: { test: 'val' },
                            methods: {
                                label(){
                                    switch(k){
                                        case 'mdarm':
                                            return global.tech['world_control'] && !global.race['truepath']
                                                ? loc('civics_mad_missiles_world_control_desc')
                                                : loc(altText ? 'civics_mad_missiles_desc_easter' : 'civics_mad_missiles_desc');
                                        case 'mdlaunch':
                                            {
                                                let gains = calcPrestige('mad');
                                                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                                                return loc('civics_mad_missiles_warning',[gains.plasmid,plasmidType]);
                                            }
                                    }
                                }
                            }
                        });
                    },
                    out: function(obj){
                        vBind({el: `#${obj.id} > span`},'destroy');
                    },
                }
            );
        });
    }
}
