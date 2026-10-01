// Isi: calcGenomeScore(), updateResetStats(), deepClone(), flib(), eventActive(), getEaster(), getHalloween(), shrineBonusActive(), getShrineBonus(), getTraitVals(), hoovedRename(), rName()
import { global } from '../core/vars.js';
import { universe_affixes } from './universe_utils.js';
import { genus_def } from '../races/genus_def.js';
import { traits, races } from '../core/registries.js';
import { loc } from '../core/locale.js';
import { actions } from '../core/registries.js';
import { valAdjust } from './value_utils.js';
import { eventActive } from './event_dates.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function calcGenomeScore(genome,wiki,tRanks){
    if (!tRanks){ tRanks = genome.ranks || {}; }
    let genes = 0;

    if (wiki){
        Object.keys(wiki.ascended).forEach(function (uni){
            genes += wiki.ascended[uni];
        });
    }
    else if (global.stats.achieve[`ascended`]){
        for (let i=0; i<universe_affixes.length; i++){
            if (global.stats.achieve.ascended.hasOwnProperty(universe_affixes[i])){
                genes += global.stats.achieve.ascended[universe_affixes[i]];
            }
        }
    }

    let active_genus = genome.genus === 'hybrid' ? genome.hybrid : [genome.genus];
    let oppose_genus = [];
    active_genus.forEach(function(g){
        Object.keys(genus_def[g].traits).forEach(function (t){
            let value = traits[t].val;
            genes -= value;
        });
        oppose_genus = oppose_genus.concat(genus_def[g].oppose);
    });
    
    if (wiki){
        genes += wiki.technophobe * 4;
    }
    else if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 1){
        genes += global.stats.achieve.technophobe.l * 4;
    }

    let max_complexity = 1;

    let complexity = { utility: 0, resource: 0, production: 0, combat: 0 };
    let neg_complexity = { utility: 0, resource: 0, production: 0, combat: 0 };
    for (let i=0; i<genome.traitlist.length; i++){
        let taxonomy = traits[genome.traitlist[i]].taxonomy;
        let gene_cost = traits[genome.traitlist[i]].val;

        if (traits[genome.traitlist[i]].val >= 0){
            if (complexity[taxonomy] > max_complexity){
                gene_cost -= max_complexity - complexity[taxonomy];
            }
            complexity[taxonomy]++;
        }
        else {
            if (neg_complexity[taxonomy] >= max_complexity){
                gene_cost += neg_complexity[taxonomy];
            }
            neg_complexity[taxonomy]++;
        }

        if (tRanks[genome.traitlist[i]]){
            if (traits[genome.traitlist[i]].val >= 0){
                switch (tRanks[genome.traitlist[i]]){
                    case 0.1:
                        gene_cost -= 3;
                        break;
                    case 0.25:
                        gene_cost -= 2;
                        break;
                    case 0.5:
                        gene_cost--;
                        break;
                    case 2:
                        gene_cost = Math.max(Math.round(gene_cost * 1.5), gene_cost + 1);;
                        break;
                    case 3:
                        gene_cost = Math.max(Math.round(gene_cost * 2), gene_cost + 2);;
                        break;
                    case 4:
                        gene_cost = Math.max(Math.round(gene_cost * 2.5), gene_cost + 3);;
                        break;
                }
                if (gene_cost < 1){ gene_cost = 1; }
            }
            else {
                switch (tRanks[genome.traitlist[i]]){
                    case 0.1:
                        gene_cost -= 3;
                        break;
                    case 0.25:
                        gene_cost -= 2;
                        break;
                    case 0.5:
                        gene_cost--;
                        break;
                    case 2:
                        gene_cost++;
                        break;
                    case 3:
                        gene_cost += 2;
                        break;
                    case 4:
                        gene_cost += 3;
                        break
                }
            }
        }

        let genus_origin = races[traits[genome.traitlist[i]].origin].type === 'hybrid' ? races[traits[genome.traitlist[i]].origin].hybrid : [races[traits[genome.traitlist[i]].origin].type];
        if (active_genus.filter(x => genus_origin.includes(x)).length > 0){ active_genus.filter(x => genus_origin.includes(x)).length === 1 ? gene_cost-- : gene_cost -= 2; }
        if (oppose_genus.filter(x => genus_origin.includes(x)).length > 0){ oppose_genus.filter(x => genus_origin.includes(x)).length === 1 ? gene_cost++ : gene_cost += 2; }

        genes -= gene_cost;
    }

    return genes;
}

export function updateResetStats(){
    global.stats.reset++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;
    global.stats.tsac += global.stats.sac;
    global.stats.sac = 0;
    global.stats.tcattle += global.stats.cattle;
    global.stats.cattle = 0;
    global.stats.tmurders += global.stats.murders;
    global.stats.murders = 0;
    global.stats.tpsykill += global.stats.psykill;
    global.stats.psykill = 0;
}


// function library
export function flib(func,val,val2){
    switch (func){
        case 'reverse':
        {
            let str = val.toLowerCase().split('').reverse().join('');
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        case 'name':
        {
            if (eventActive('fool',2021)){
                return flib('reverse',races[global.race.species].name);
            }
            return races[global.race.species].name;
        }
        case 'curve':
        {   
            let exp = val2 || 1.5;
            return 1-((1-(val))**exp);
        }
    }
    return false;
}




export function shrineBonusActive() {
	return (global.race['magnificent'] && global.city.hasOwnProperty('shrine') && global.city.shrine.count > 0);
}

export function getShrineBonus(type) {
	let shrine_bonus = {
        mult: 1,
        add: 0,
        active: false
	};

	if (shrineBonusActive()){
		switch(type){
			case 'metal':
                let metal = global.city.shrine.metal;
                if ((global.city.calendar.moon >= 7 && global.city.calendar.moon < 14) || global.city.calendar.moon === 14){ metal += global.city.shrine.cycle; }
				shrine_bonus.mult += +(metal / 100 * traits.magnificent.vars()[3]);
                if (metal > 0){ shrine_bonus.active = true; }
				break;
			case 'tax':
                let tax = global.city.shrine.tax;
                if (global.city.calendar.moon >= 21 || global.city.calendar.moon === 14){ tax += global.city.shrine.cycle; }
				shrine_bonus.mult += +(tax / 100 * traits.magnificent.vars()[2]);
                if (tax > 0){ shrine_bonus.active = true; }
				break;
			case 'know':
                let know = global.city.shrine.know;
                if ((global.city.calendar.moon > 14 && global.city.calendar.moon <= 21) || global.city.calendar.moon === 14){ know += global.city.shrine.cycle; }
                shrine_bonus.add += +(know* traits.magnificent.vars()[0]);
                shrine_bonus.mult += +(know * traits.magnificent.vars()[1] / 100);
                if (know > 0){ shrine_bonus.active = true; }
				break;
			case 'morale':
                let morale = global.city.shrine.morale;
                if ((global.city.calendar.moon > 0 && global.city.calendar.moon <= 7) || global.city.calendar.moon === 14){ morale += global.city.shrine.cycle; }
				shrine_bonus.add += morale * traits.magnificent.vars()[4];
                if (morale > 0){ shrine_bonus.active = true; }
				break;
			default:
				break;
		}
	}

	return shrine_bonus;
}

export function getTraitVals(trait, rank, species){
    let vals = traits[trait].hasOwnProperty('vars') ? traits[trait].vars(rank) : [];
    if (valAdjust.hasOwnProperty(trait)){
        if (trait === 'fibroblast'){
            vals = [vals[0] * 5];
        }
        else if (trait === 'hivemind' && global.race['high_pop']){
            vals = [vals[0] * traits.high_pop.vars()[0]];
        }
        else if (trait === 'imitation'){
            vals.push(races[global.race['srace'] || 'protoplasm'].name);
        }
        else if (trait === 'elusive'){
            vals = [Math.round(((1/30)/(1/(30+vals[0]))-1)*100)];
        }
        else if (trait === 'chameleon'){
            vals = [vals[0], Math.round(((1/30)/(1/(30+vals[1]))-1)*100)];
        }
        else if (trait === 'blood_thirst'){
            vals = [Math.ceil(Math.log2(vals[0]))];
        }
        else if (trait === 'selenophobia'){
            vals = [14 - vals[0], vals[0]];
        }
        else if (trait === 'hooved'){
            vals.unshift(hoovedRename(false, species));
        }
        else if (trait === 'anthropophagite'){
            vals = [vals[0] * 10000];
        }
        else if (trait === 'living_materials'){
            vals = [global.resource.Lumber.name, global.resource.Plywood.name, global.resource.Furs.name, loc('resource_Amber_name')];
        }
        else if (trait === 'environmentalist'){
            let coal = -(actions.city.coal_power.powered(true));
            let oil = -(actions.city.oil_power.powered(true));
            vals = [coal + vals[0], oil + vals[0] - 1, oil + vals[0] + 1, coal, oil, vals[1]];
        }
        else if (trait === 'blurry'){
            if (global.race['warlord']){
                vals = [+((100/(100-vals[0])-1)*100).toFixed(1)];
            }
        }
        else if (trait === 'playful'){
            if (global.race['warlord']){
                vals = [vals[0] * 100, global.resource.Furs.name];
            }
        }
        else if (trait === 'ghostly'){
            if (global.race['warlord']){
                vals = [vals[0], +((vals[1] - 1) * 100).toFixed(0), global.resource.Soul_Gem.name];
            }
        }
        else if (trait === 'catnip' || trait === 'anise'){
            vals = rank <= 2 ? [] : (rank === 3  ? [vals[0]] : [vals[0],vals[1]]);
        }
        else if (!valAdjust[trait]){
            vals = [];
        }
    }
    else if (trait === 'elemental'){
        switch (traits.elemental.vars(rank)[0]){
            case 'electric':
                vals = [loc(`element_electric`), traits.elemental.vars(rank)[1], traits.elemental.vars(rank)[5]];
                break;
            case 'acid':
                vals = [loc(`element_acid`), traits.elemental.vars(rank)[2], traits.elemental.vars(rank)[5]];
                break;
            case 'fire':
                vals = [loc(`element_fire`), traits.elemental.vars(rank)[3], traits.elemental.vars(rank)[5]];
                break;
            case 'frost':
                vals = [loc(`element_frost`), traits.elemental.vars(rank)[4], traits.elemental.vars(rank)[5], loc('city_biolab')];
                break;
        }
    }
    return vals;
}

export function hoovedRename(style, species=global.race.species){
    if (species === 'sludge'){
        return style ? 'craft' : loc('resource_Beaker_name');
    }
    else if (species === 'cath'){
        return style ? 'craft' : loc('resource_Box_name');
    }
    else if (species === 'wolven'){
        return style ? 'craft' : loc('resource_ChewToy_name');
    }
    else if (species === 'dracnid'){
        return style ? 'craft' : loc('resource_Hoard_name');
    }
    else if (species === 'seraph'){
        return style ? 'forge' : loc('resource_Halo_name');
    }
    else if (species === 'cyclops'){
        return style ? 'craft' : loc('resource_Monocle_name');
    }
    else if (species === 'kobold'){
        return style ? 'craft' : loc('resource_Candle_name');
    }
    else if (species === 'tuskin'){
        return style ? 'craft' : loc('resource_Goggles_name');
    }
    else if (species === 'sharkin'){
        return style ? 'craft' : loc('resource_ToothSharpener_name');
    }
    else if (species === 'beholder'){
        return style ? 'craft' : loc('resource_ContactLens_name');
    }
    else if (species === 'djinn'){
        return style ? 'craft' : loc('resource_Bottle_name');
    }
    else if (races[species].type === 'humanoid'){
        return style ? 'craft' : loc('resource_Sandals_name');
    }
    else if (races[species].type === 'avian'){
        return style ? 'craft' : loc('resource_Perch_name');
    }
    else if (races[species].type === 'plant'){
        return style ? 'craft' : loc('resource_Planter_name');
    }
    else if (races[species].type === 'fungi'){
        return style ? 'craft' : loc('resource_DampCloth_name');
    }
    else if (races[species].type === 'reptilian'){
        return style ? 'craft' : loc('resource_HeatRock_name');
    }
    else if (races[species].type === 'fey'){
        return style ? 'craft' : loc('resource_PixieDust_name');
    }
    else if (races[species].type === 'synthetic'){
        return style ? 'craft' : loc('resource_Battery_name');
    }
    else {
        return style ? 'forge' : loc('resource_Horseshoe_name');
    }
}

