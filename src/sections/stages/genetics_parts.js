import { global, sizeApproximation, keyMultiplier } from '../../core/vars.js';
import { traits, races } from '../../core/registries.js';
import { traitSkin, traitRank, setTraitRank, combineTraits } from '../../races/trait_logic/trait_ranks.js';
import { cleanRemoveTrait, cleanAddTrait } from '../../races/trait_logic/trait_changes.js';
import { bindTrait, genetics, dragGeneticsList } from '../../arpa/arpa_projects.js';
import { updateTrades } from '../../arpa/arpa_project_building.js';
import { loc } from '../../core/locale.js';
import { flib } from '../../functions/run_stats_helpers.js';
import { deepClone } from '../../core/object_utils.js';
import { eventActive } from '../../functions/event_dates.js';
import { fibonacci } from '../../functions/icons_easter_eggs.js';
import { vBind } from '../../functions/dom_helpers.js';
import { calc_mastery } from '../../functions/functions.js';
import { popover } from '../../functions/popover.js';
import { getTraitDesc } from '../../functions/trait_description.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { drawCity } from '../../actions/challenge/challenge_rules.js';
import { unlockFeat } from '../../achievements/achievement_logic.js';

// Part of genetics (from arpa.js), mechanically split: shared variables across parts are in $ctx.

export function genetics_s1($ctx){
        let breakdown = $('<div id="geneticBreakdown" class="geneticTraits"></div>');
        $('#arpaGenetics').append(breakdown);

        let minorList = $('<div id="geneticMinor" class="traitListing"></div>');
        breakdown.append(minorList);

        if (global.tech['decay'] && global.tech['decay'] >= 2){
            if (!global.settings.mtorder.includes('fortify')){
                global.settings.mtorder.push('fortify');
            }
        }

        Object.keys(global.race).forEach(function (trait){
            if (traits[trait] && traits[trait].type === 'minor'){
                if (!global.settings.mtorder.includes(trait)){
                    global.settings.mtorder.push(trait);
                }
            }
        });

        if (global.genes['challenge'] && global.genes['challenge'] >= 5){
            if (!global.settings.mtorder.includes('mastery')){
                global.settings.mtorder.push('mastery');
            }
        }

        let minor = false;
        $ctx.minor_list = [];
        global.settings.mtorder.forEach(function(trait){
            if ((traits[trait] && traits[trait].type === 'minor') || trait === 'mastery' || trait === 'fortify'){
                if (trait !== 'fortify' || (global.tech['decay'] && global.tech['decay'] >= 2)){
                    if ((!['promiscuous','content','resilient','industrious','tactical','fibroblast'].includes(trait) && global.race['lone_survivor']) || !global.race['lone_survivor']){
                        minor = true;
                        bindTrait(minorList,trait);
                        $ctx.minor_list.push(trait);
                    }
                }
            }
        });

        breakdown.append(`<div class="trait major has-text-success" role="heading" aria-level="3">${loc('arpa_race_genetic_traids',[flib('name')])}</div>`)

        let traitName = traitSkin('name');

        $ctx.remove_list = [];
        $ctx.null_list = [];
        let traitListing = $(`<div class="traitListing"></div>`);
        breakdown.append(traitListing);
        let trait_listing = deepClone(global.race);
        if (eventActive('fool',2023)){
            trait_listing['hooved'] = 1;
        }
        Object.keys(trait_listing).forEach(function (trait){
            if (traits[trait] && traits[trait].type !== 'minor' && traits[trait].type !== 'special' && trait !== 'evil' && trait !== 'soul_eater' && trait !== 'artifical'){
                let mimicTraits = [
                    ...(global.race['ss_traits'] ? global.race['ss_traits'] : []),
                    ...(global.race['iTraits'] ? Object.keys(global.race['iTraits']) : [])
                ];
                let readOnly = false;
                if (mimicTraits.includes(trait)){
                    readOnly = true;
                }
                else if (['sludge','ultra_sludge'].includes(global.race.species) && (trait === 'ooze' || global.race['modified'])){
                    readOnly = true;
                }
                else if (!global.race.hasOwnProperty(trait)){
                    readOnly = true;
                }
                else if (global.race.hasOwnProperty('absorbed') && global.race.absorbed.map(r => races[r].fanaticism).includes(trait) || global.race['warlord'] && ['iron_wood','unified','apex_predator'].includes(trait)){
                    readOnly = true;
                }
                else if(trait === 'forager' && mimicTraits.some(item => ['herbivore', 'carnivore'].includes(item))){
                    readOnly = true;
                }
                if (!readOnly && ((traits[trait].type === 'major' && global.genes['mutation']) || (traits[trait].type === 'genus' && global.genes['mutation'] && global.genes['mutation'] >= 2))){
                    let major = $(`<div class="traitRow"></div>`);
                    let purge = $(`<span class="remove${trait} basic-button has-text-danger" role="button" :aria-label="removeCost('${trait}')" @click="purge('${trait}')">${loc('arpa_remove_button')}</span>`);
                    $ctx.remove_list.push(trait);

                    major.append(purge);
                    major.append($(`<span class="trait has-text-warning" id="raceTrait${trait}">${traitName[trait] ? traitName[trait] : traits[trait].name} (${loc(`arpa_genepool_rank`,[traitRank(trait)])})</span>`));

                    traitListing.append(major);
                }
                else {
                    $ctx.null_list.push(trait);
                    traitListing.append(`<div class="traitRow trait${trait}"><div class="trait has-text-warning${global.genes['mutation'] ? ' indent' : ''}">${traitName[trait] ? traitName[trait] : traits[trait].name} (${loc(`arpa_genepool_rank`,[traitRank(trait)])})</div></div>`);
                }
            }
        });

        $ctx.offspec_traits = [];
        $ctx.trait_list = [];
        if (global.genes['mutation'] && global.genes['mutation'] >= 3){
            if (global.race.species !== 'hellspawn' && ((global.race.species !== 'sludge' && global.race.species !== 'ultra_sludge') || !global.race['modified'])){
                breakdown.append(`<div class="trait major has-text-success" role="heading" aria-level="3">${loc('arpa_race_genetic_gain')}</div>`);

                let conflict_traits = ['dumb','smart']; //Conflicting traits are paired together
                let mainType = races[global.race.species].type === 'hybrid' ? global.race.maintype : races[global.race.species].type
                let speciesTypes = races[global.race.species].type === 'hybrid' ? races[global.race.species].hybrid : [races[global.race.species].type];
                Object.keys(races).forEach(function (race){
                    if (race !== 'junker' && race !== 'sludge' && race !== 'ultra_sludge' && race !== 'custom' && 
                        (speciesTypes.includes(races[race].type) || (races[race].type === 'hybrid' && race === global.race.species))
                    ){
                        Object.keys(races[race].traits).forEach(function (trait){
                            if (!global.race[trait] && trait !== 'soul_eater'){
                                let conflict_pos = conflict_traits.indexOf(trait);
                                if (conflict_pos === -1){
                                    $ctx.trait_list.push(trait);
                                    if (races[race].type !== mainType && race !== global.race.species){
                                        $ctx.offspec_traits.push(trait);
                                    }
                                }
                                else {
                                    let is_conflict = false;
                                    switch (conflict_pos % 2){
                                        case 0:
                                            if (global.race[conflict_traits[conflict_pos + 1]]){
                                                is_conflict = true;
                                            }
                                            break;
                                        case 1:
                                            if (global.race[conflict_traits[conflict_pos - 1]]){
                                                is_conflict = true;
                                            }
                                            break;
                                    }
                                    if (!is_conflict) {
                                        $ctx.trait_list.push(trait);
                                        if (races[race].type !== mainType){
                                            $ctx.offspec_traits.push(trait);
                                        }
                                    }
                                }
                            }
                        });
                    }
                });

                let addListing = $(`<div class="traitListing"></div>`);
                breakdown.append(addListing);
                for (let i=0; i<$ctx.trait_list.length; i++){
                    let trait = $ctx.trait_list[i];
                    if (!['catnip','anise'].includes(trait)){
                        let major = $(`<div class="traitRow"></div>`);
                        let add = $(`<span class="add${trait} basic-button has-text-success" role="button" :aria-label="addCost('${trait}')" @click="gain('${trait}')">${loc('arpa_gain_button')}</span>`);

                        major.append(add);
                        major.append($(`<span class="trait has-text-warning" id="raceTrait${trait}">${traitName[trait] ? traitName[trait] : traits[trait].name} (${loc(`arpa_genepool_rank`,[$ctx.offspec_traits[trait] ? 0.5 : 1])})</span>`));

                        addListing.append(major);
                    }
                }
            }
        }

        if (minor){
            breakdown.prepend(`<div class="trait minor has-text-success" role="heading" aria-level="3">${loc('arpa_race_genetic_minor_traits',[flib('name')])}</div>`)
        }

        $ctx.rmCost = function(t,label){
            let cost = traits[t].val * 5;
            if (['custom','hybrid','sludge','ultra_sludge'].includes(global.race.species)){
                cost *= 10;
            }
            if (global.race[t] && traits[t].val < 0){
                switch(global.race[t]){
                    case 0.1:
                        cost *= 4;
                        break;
                    case 0.25:
                        cost *= 3;
                        break;
                    case 0.5:
                        cost *= 2;
                        break;
                }
            }
            if (cost < 0){
                cost *= -1;
            }
            if (global.race['modified']){
                cost += global.race.modified.t * 10;
                if (traits[t].val < 0){ cost += global.race.modified.nr * 10; }
            }
            if (label){
                return loc('arpa_remove',[traitSkin('name',t),cost,global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name')]);
            }
            return cost;
        };

        $ctx.addCost = function(t,label){
            let cost = traits[t].val * 5;
            if (['custom','hybrid','sludge','ultra_sludge'].includes(global.race.species)){
                cost *= 10;
            }
            if (cost < 0){
                cost *= -1;
            }
            if (global.race['modified']){
                cost += global.race.modified.t * 10;
                if (traits[t].val >= 0){ cost += global.race.modified.pa * 10; }
            }
            if (label){
                return loc('arpa_gain',[traitSkin('name',t),cost,global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name')]);
            }
            return cost;
        };

        $ctx.mGeneCost = function(t){
            let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
            if (t === 'mastery'){ cost *= 5; }
            return loc('arpa_gene_buy',[traitSkin('name',t),sizeApproximation(cost),global.resource.Genes.name]);
        };

        $ctx.mPhageCost = function(t){
            let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
            if (t === 'mastery'){ cost *= 2; }
            return loc('arpa_phage_buy',[traitSkin('name',t),sizeApproximation(cost),loc(`resource_Phage_name`)]);
        };

        vBind({
            el: `#geneticBreakdown`,
            data: {
                genes: global.genes,
                race: global.race
            },
            methods: {
                gene(t){
                    let curr_iteration = 0;
                    let iterations = keyMultiplier();
                    let can_purchase = true;
                    let redraw = false;
                    while (curr_iteration < iterations && can_purchase){
                        let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
                        if (t === 'mastery'){ cost *= 5; }
                        if (global.resource.Genes.amount >= cost){
                            global.resource.Genes.amount -= cost;
                            global.race.minor[t] ? global.race.minor[t]++ : global.race.minor[t] = 1;
                            global.race[t] ? global.race[t]++ : global.race[t] = 1;
                            redraw = true;
                        }
                        else {
                            can_purchase = false;
                        }
                        curr_iteration++;
                    }
                    if (redraw){
                        if (t === 'mastery'){
                            calc_mastery(true);
                        }
                        genetics();
                        if (t === 'persuasive'){
                            updateTrades();
                        }
                    }
                },
                phage(t){
                    let curr_iteration = 0;
                    let iterations = keyMultiplier();
                    let can_purchase = true;
                    let redraw = false;
                    while (curr_iteration < iterations && can_purchase){
                        let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
                        if (t === 'mastery'){ cost *= 2; }
                        if (global.prestige.Phage.count >= cost){
                            global.prestige.Phage.count -= cost;
                            global.genes.minor[t] ? global.genes.minor[t]++ : global.genes.minor[t] = 1;
                            global.race[t] ? global.race[t]++ : global.race[t] = 1;
                            redraw = true;
                        }
                        else {
                            can_purchase = false;
                        }
                        curr_iteration++;
                    }
                    if (redraw){
                        if (t === 'mastery'){
                            calc_mastery(true);
                        }
                        genetics();
                        if (t === 'persuasive'){
                            updateTrades();
                        }
                    }
                },
                purge(t){
                    if (['sludge','ultra_sludge'].includes(global.race.species) && (global.race['modified'] || t === 'ooze')){
                        return;
                    }
                    let cost = $ctx.rmCost(t,false);
                    let res = global.race.universe === 'antimatter' ? 'AntiPlasmid' : 'Plasmid';
                    if (global.prestige[res].count >= cost){
                        global.prestige[res].count -= cost;
                        let rank = global.race[t];
                        delete global.race[t];
                        if (!global.race['modified']){
                            global.race['modified'] = {
                                t: 0, nr: 0, na: 0, pr: 0, pa: 0
                            };
                        }
                        global.race.modified.t++;
                        if (traits[t].val >= 0){ global.race.modified.pr++; } else { global.race.modified.nr++; }

                        if(t === 'forager'){
                            delete global.race.inactiveTraits['herbivore'];
                            delete global.race.inactiveTraits['carnivore'];
                        }
                        cleanRemoveTrait(t,rank);
                        genetics();
                        drawTech();
                        drawCity();

                        let count = 0;
                        Object.keys(global.race).forEach(function (trait){
                            if ((traits[trait] && (traits[trait].type === 'major' || traits[trait].type === 'genus')) && trait !== 'evil'){
                                count++;
                            }
                        });
                        if (count === 0){
                            unlockFeat('blank_slate');
                        }
                    }
                },
                gain(t){
                    if (['hellspawn'].includes(global.race.species)){ return; }
                    else if (['sludge','ultra_sludge'].includes(global.race.species) && global.race['modified']){
                        return;
                    }
                    let cost = $ctx.addCost(t,false);
                    let res = global.race.universe === 'antimatter' ? 'AntiPlasmid' : 'Plasmid';
                    if (global.prestige[res].count >= cost){
                        global.prestige[res].count -= cost;
                        global.race[t] = 1;
                        if (!global.race.hasOwnProperty('modified')){
                            global.race['modified'] = {
                                t: 0, nr: 0, na: 0, pr: 0, pa: 0
                            };
                        }
                        global.race.modified.t++;
                        if (traits[t].val >= 0){ global.race.modified.pa++; } else { global.race.modified.na++; }
                        cleanAddTrait(t);
                        if ($ctx.offspec_traits.includes(t)){
                            setTraitRank(t, {down:true});
                        }
                        genetics();
                        drawTech();
                        drawCity();
                        combineTraits();
                    }
                },
                geneCost(t){
                    return $ctx.mGeneCost(t);
                },
                phageCost(t){
                    return $ctx.mPhageCost(t);
                },
                traitEffect(t){
                    return loc(`trait_${t}_effect`);
                },
                removeCost(t){
                    return $ctx.rmCost(t,true);
                },
                addCost(t){
                    return $ctx.addCost(t,true);
                },
                genePurchasable(t){
                    let cost = fibonacci(global.race.minor[t] ? global.race.minor[t] + 4 : 4);
                    if (t === 'mastery'){ cost *= 5; }
                    return global.resource.Genes.amount >= cost;
                },
                phagePurchasable(t){
                    let cost = fibonacci(global.genes.minor[t] ? global.genes.minor[t] + 4 : 4);
                    if (t === 'mastery'){ cost *= 2; }
                    return global.prestige.Phage.count >= cost;
                }
            }
        });
}

export function genetics_s2($ctx){
        $ctx.minor_list.forEach(function (t){
            popover(`popGenetrait${t}`, function(){
                return $ctx.mGeneCost(t);
            },
            {
                elm: `#geneticBreakdown .t-${t} .gbuy`,
                classes: `has-background-light has-text-dark`
            });

            if (global.prestige.Phage.count > 0){
                popover(`popGenetrait${t}`, function(){
                    return $ctx.mPhageCost(t);
                },
                {
                    elm: `#geneticBreakdown .t-${t} .pbuy`,
                    classes: `has-background-light has-text-dark`
                });
            }

            popover(`popGenetrait${t}`, function(){
                if (global.stats.feat['novice'] && global.stats.achieve['apocalypse'] && global.stats.achieve.apocalypse.l > 0){
                    return `<div>${traitSkin('desc',t)}</div><div>${loc(`trait_${t}_effect`)}</div>`;
                }
                else {
                    return traitSkin('desc',t);
                }
            },
            {
                elm: `#geneticBreakdown .t-${t} .name`,
                classes: `has-background-light has-text-dark`
            });
        });

        $ctx.remove_list.forEach(function (t){
            popover(`popRemoveBkdwn${t}`, function(){
                return $ctx.rmCost(t,true);
            },
            {
                elm: `#geneticBreakdown .remove${t}`,
                classes: `has-background-light has-text-dark`
            });

            let id = `raceTrait${t}`;
            let desc = $(`<div></div>`);
            getTraitDesc(desc, t, { trank: traitRank(t) });
            popover(id,desc,{ wide: true, classes: 'w30' });
        });

        $ctx.null_list.forEach(function (t){
            let id = `raceTrait${t}`;
            let desc = $(`<div></div>`);
            getTraitDesc(desc, t, { trank: traitRank(t) });
            popover(id, desc, { elm: `#geneticBreakdown .trait${t}`, wide: true, classes: 'w30' });
        });

        $ctx.trait_list.forEach(function (t){
            popover(`popAddBkdwn${t}`, function(){
                return $ctx.addCost(t,true);
            },
            {
                elm: `#geneticBreakdown .add${t}`,
                classes: `has-background-light has-text-dark`
            });

            let id = `raceTrait${t}`;
            let desc = $(`<div></div>`);
            getTraitDesc(desc, t, { trank: $ctx.offspec_traits.includes(t) ? 0.5 : 1 });
            popover(id,desc,{ wide: true, classes: 'w30' });
        });

        dragGeneticsList();
}

