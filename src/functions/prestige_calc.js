// Isi: masteryType(), challenge_multiplier(), getResetConstants(), calcPrestige(), adjustCosts(), bloatAdjust(), loneAdjust(), truthAdjust(), inflationAdjust(), extraAdjust(), technoAdjust(), scienceAdjust(), smolderAdjust(), kindlingAdjust() +2
import { global } from '../core/vars.js';
import { universeLevel } from '../achievements/achievement_logic.js';
import { alevel } from '../achievements/achievement_helpers.js';
import { traits, races } from '../core/registries.js';
import { jobScale } from '../civics/jobs/job_scale.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function masteryType(universe,detailed,unmodified){
    if (global.genes['challenge'] && global.genes.challenge >= 2){
        universe = universe || global.race.universe;
        let ua_level = universeLevel(universe);
        let m_rate = universe === 'standard' ? 0.25 : 0.15;
        let u_rate = global.genes.challenge >= 3 ? 0.15 : 0.1;
        if (global.genes.challenge >= 4 && universe !== 'standard'){
            m_rate += 0.05;
            u_rate -= 0.05;
        }

        let perk_rank = global.stats.feat['grandmaster'] && global.stats.achieve['corrupted'] && global.stats.achieve.corrupted.l > 0 ? Math.min(global.stats.achieve.corrupted.l,global.stats.feat['grandmaster']) : 0;
        if (perk_rank > 0){
            m_rate *= 1 + (perk_rank / 100);
            u_rate *= 1 + (perk_rank / 100);
        }

        if (! unmodified) {
            if (global.race['weak_mastery'] && universe === 'antimatter'){
                m_rate /= 10;
                u_rate /= 10;
            }
            if (global.race['nerfed']){
                m_rate /= universe === 'antimatter' ? 5 : 2;
                u_rate /= universe === 'antimatter' ? 5 : 2;
            }
            if (global.race['ooze']){
                m_rate *= 1 - (traits.ooze.vars()[2] / 100);
                u_rate *= 1 - (traits.ooze.vars()[2] / 100);
            }
            if (global.genes.challenge >= 5 && global.race.hasOwnProperty('mastery')){
                m_rate *= 1 + (traits.mastery.vars()[0] * global.race.mastery / 100);
                u_rate *= 1 + (traits.mastery.vars()[0] * global.race.mastery / 100);
            }
        }

        let m_mastery = ua_level.aLvl * m_rate;
        let u_mastery = 0;
        if (universe !== 'standard'){
            u_mastery = ua_level.uLvl * u_rate;
        }
        return detailed ? { g: m_mastery, u: u_mastery, m: m_mastery + u_mastery } : m_mastery + u_mastery;
    }
    return detailed ? { g: 0, u: 0, m:0 } : 0;
}

export function challenge_multiplier(value,type,decimals,inputs){
    decimals = decimals || 0;
    inputs = inputs || {};
    
    let challenge_level = inputs.genes;
    if (challenge_level === undefined){
        challenge_level = alevel() - 1;
        if (challenge_level > 4){
            challenge_level = 4;
        }
    }
    let universe = inputs.uni || global.race.universe;

    if (universe === 'micro'){ value = value * 0.25; }
    if (universe === 'antimatter'){ value = value * 1.1; }
    if (universe === 'heavy' && type !== 'mad'){
        switch (challenge_level){
            case 1:
                value = value * 1.1;
                break;
            case 2:
                value = value * 1.15;
                break;
            case 3:
                value = value * 1.2;
                break;
            case 4:
                value = value * 1.25;
                break;
            default:
                value = value * 1.05;
                break;
        }
    }
    if (inputs.tp !== undefined ? inputs.tp : global.race['truepath']){
        value = value * 1.1;
    }
    switch (challenge_level){
        case 1:
            return +(value * 1.05).toFixed(decimals);
        case 2:
            return +(value * 1.12).toFixed(decimals);
        case 3:
            return +(value * 1.25).toFixed(decimals);
        case 4:
            return +(value * 1.45).toFixed(decimals);
        default:
            return +(value).toFixed(decimals);
    }
}

export function getResetConstants(type, inputs){
    if (!inputs) { inputs = {}; }
    let rc = {
        pop_divisor: 999,
        k_inc: 1000000,
        k_mult: 100,
        phage_mult: 0,
        plasmid_cap: 150,
    }

    switch (type){
        case 'mad':
            rc.pop_divisor = 3;
            rc.k_inc = 100000;
            rc.k_mult = 1.1;
            rc.plasmid_cap = 150;
            if (inputs.synth === true || inputs.synth.val === true){
                rc.pop_divisor = 5;
                rc.k_inc = 125000;
                rc.plasmid_cap = 100;
            }
            break;
        case 'cataclysm':
        case 'bioseed':
            rc.pop_divisor = 3;
            rc.k_inc = 50000;
            rc.k_mult = 1.015;
            rc.phage_mult = 1;
            rc.plasmid_cap = 400;
            break;
        case 'ai':
            rc.pop_divisor = 2.5;
            rc.k_inc = 45000;
            rc.k_mult = 1.014;
            rc.phage_mult = 2;
            rc.plasmid_cap = 600;
            break;
        case 'vacuum':
        case 'bigbang':
            rc.pop_divisor = 2.2;
            rc.k_inc = 40000;
            rc.k_mult = 1.012;
            rc.phage_mult = 2.5;
            rc.plasmid_cap = 800;
            break;
        case 'ascend':
        case 'terraform':
            rc.pop_divisor = 1.15;
            rc.k_inc = 30000;
            rc.k_mult = 1.008;
            rc.phage_mult = 4;
            rc.plasmid_cap = 2000;
            break;
        case 'matrix':
            rc.pop_divisor = 1.5;
            rc.k_inc = 32000;
            rc.k_mult = 1.01;
            rc.phage_mult = 3.2;
            rc.plasmid_cap = 1800;
            break;
        case 'retired':
            rc.pop_divisor = 1.15;
            rc.k_inc = 32000;
            rc.k_mult = 1.006;
            rc.phage_mult = 3.2;
            rc.plasmid_cap = 1800;
            break;
        case 'eden':
            rc.pop_divisor = 1;
            rc.k_inc = 18000;
            rc.k_mult = 1.004;
            rc.phage_mult = 2.5;
            rc.plasmid_cap = 1800;
            break;
        default:
            rc.unknown = true;
            break;
    }
    return rc;
}

export function calcPrestige(type,inputs){
    let gains = {
        plasmid: 0,
        phage: 0,
        dark: 0,
        harmony: 0,
        artifact: 0,
        cores: 0,
        supercoiled: 0,
        pdebt: 0
    };

    if (!inputs) { inputs = {}; }
    if (inputs.synth === undefined) inputs.synth = races[global.race.species].type === 'synthetic';
    let challenge = inputs.genes;
    let universe = inputs.uni;
    universe = universe || global.race.universe;

    let pop = 0;
    if (inputs.cit === undefined){
        let garrisoned = global.civic.hasOwnProperty('garrison') ? global.civic.garrison.workers : 0;
        for (let i=0; i<3; i++){
            if (global.civic.foreign[`gov${i}`].occ){
                garrisoned += jobScale(global.civic.govern.type === 'federation' ? 15 : 20);
            }
        }
        if (global.race['high_pop']){
            pop = Math.round(global.resource[global.race.species].amount / traits.high_pop.vars()[0]) + Math.round(garrisoned / traits.high_pop.vars()[0]);
        }
        else {
            pop = global.resource[global.race.species].amount + garrisoned;
        }
    }
    else {
        if (inputs.high_pop){
            pop = Math.round(inputs.cit / traits.high_pop.vars(inputs.high_pop)[0]) + Math.round(inputs.sol / traits.high_pop.vars(inputs.high_pop)[0]);
        }
        else {
            pop = inputs.cit + inputs.sol;
        }
    }

    let rc = getResetConstants(type, inputs);
    let pop_divisor = rc.pop_divisor;
    let k_inc = rc.k_inc;
    let k_mult = rc.k_mult;
    let phage_mult = rc.phage_mult;
    let plasmid_cap = rc.plasmid_cap;

    if (challenge !== undefined){
        plasmid_cap = Math.floor(plasmid_cap * (1 + (challenge + (inputs.tp ? 1 : 0)) / 8));
    }
    else {
        plasmid_cap = Math.floor(plasmid_cap * (1 + (alevel() - (global.race['truepath'] ? 0 : 1)) / 8));
    }

    if (inputs.plas === undefined){
        let k_base = inputs.know !== undefined ? inputs.know : global.stats.know;
        let new_plasmid = Math.round(pop / pop_divisor);
        while (k_base > k_inc){
            new_plasmid++;
            k_base -= k_inc;
            k_inc *= k_mult;
        }

        if (global.race['cataclysm']){
            new_plasmid += 300;
        }
        else if (global.race['lone_survivor']){
            new_plasmid += 800;
        }

        gains.plasmid = challenge_multiplier(new_plasmid,type,false,inputs);

        if (!inputs.rawPlasmids && gains.plasmid > plasmid_cap){
            let overflow = gains.plasmid - plasmid_cap;
            gains.plasmid = plasmid_cap;
            overflow = Math.floor(overflow / (overflow + plasmid_cap) * plasmid_cap);
            gains.plasmid += overflow;
        }
    }
    else {
        gains.plasmid = inputs.plas;
    }
    gains.phage = gains.plasmid > 0 ? challenge_multiplier(Math.floor(Math.log2(gains.plasmid) * Math.E * phage_mult),type,false,inputs) : 0;

    if (type === 'bigbang'){
        let exotic = inputs.exotic;
        let mass = inputs.mass;
        if (exotic === undefined && global['interstellar'] && global.interstellar['stellar_engine']){
            exotic = global.interstellar.stellar_engine.exotic;
            mass = global.interstellar.stellar_engine.mass;
        }

        let new_dark = +(Math.log(1 + (exotic * 40))).toFixed(3);
        new_dark += +(Math.log2(mass - 7)/2.5).toFixed(3);
        new_dark = challenge_multiplier(new_dark,'bigbang',3,inputs);
        gains.dark = new_dark;
    }
    else if (type === 'vacuum'){
        let mana = inputs.mana !== undefined ? inputs.mana : global.resource.Mana.gen;
        let new_dark = +(Math.log2(mana)/5).toFixed(3);
        new_dark = challenge_multiplier(new_dark,'vacuum',3,inputs);
        gains.dark = new_dark;
    }


    if (['ascend','descend','terraform','apotheosis'].includes(type)){
        let pr_gain = 1;
        if (challenge === undefined){
            pr_gain = alevel();
            if (pr_gain > 5){
                pr_gain = 5;
            }
        }
        else {
            pr_gain = challenge + 1;
        }

        if (type === 'ascend' || type === 'terraform'){
            switch (universe){
                case 'micro':
                    pr_gain *= 0.25;
                    break;
                case 'heavy':
                    pr_gain *= 1.2;
                    break;
                case 'antimatter':
                    pr_gain *= 1.1;
                    break;
                default:
                    break;
            }
            gains.harmony = parseFloat(pr_gain.toFixed(2));
        }
        else if (type === 'descend'){
            let artifact = universe === 'micro' ? 1 : pr_gain;
            let spire = inputs.floor;
            if (spire !== undefined){
                spire++;
            }
            else {
                spire = global.portal.hasOwnProperty('spire') ? global.portal.spire.count : 0;
            }
            [50,100].forEach(function(x){
                if (spire > x){
                    artifact++;
                }
            });
            gains.artifact = artifact;
        }
        else if (type === 'apotheosis'){
            gains.plasmid = (256 >> 4) ** 4 - 65535; // why? because I want you to cry about it.
            if (universe === 'micro'){
                gains.supercoiled = pr_gain ** 2;
            }
            else {
                gains.supercoiled = pr_gain ** 3;
            }
            if (global.race['warlord']){
                gains.artifact = 5;
                gains.supercoiled = 64;
            }
        }
    }

    if (type === 'ai'){
        gains.cores = universe === 'micro' ? 2 : 5;
    }
    
    if (global.stats.pdebt > 0){
        gains.plasmid -= global.stats.pdebt;
        if (gains.plasmid < 0){
            gains.pdebt = Math.abs(gains.plasmid);
            gains.plasmid = 0;
        }
        else {
            gains.pdebt = 0;
        }
    }

    return gains;
}












