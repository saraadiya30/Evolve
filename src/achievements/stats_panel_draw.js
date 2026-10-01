import { clearElement, vBind } from '../functions/dom_helpers.js';
import { getHalloween } from '../functions/event_dates.js';
import { trickOrTreat } from '../functions/icons_easter_eggs.js';
import { loc } from '../core/locale.js';
import { global } from '../core/vars.js';
// Functions extracted from achieve.js (source order preserved). achieve.js still re-exports the previously exported names.


export function drawStats(){
    clearElement($('#statsPanel'));
    let stats = $('#statsPanel');

    // Overall Stats
    stats.append(`<div><span class="has-text-success">${loc("achieve_stats_overall")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_plasmid_earned")}</span> {{ s.plasmid | format }}</div>`);
    if (global.stats.antiplasmid > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_antiplasmid_earned")}</span> {{ s.antiplasmid | format }}</div>`);
    }
    if (global.stats.phage > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_phage_earned")}</span> {{ s.phage | format }}</div>`);
    }
    if (global.stats.dark > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_dark_earned")}</span> {{ s.dark | format }}</div>`);
    }
    if (global.stats.harmony > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_harmony_earned")}</span> {{ s.harmony | format }}</div>`);
    }
    if (global.stats.blood > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_blood_earned")}</span> {{ s.blood | format }}</div>`);
    }
    if (global.stats.artifact > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_artifact_earned")}</span> {{ s.artifact | format }}</div>`);
    }
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ s.know | t_know | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ s.starved | t_starved | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ s.died | t_died | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ s.days | played | format }}</div>`);
    if (global.stats.portals > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_portals")}</span> {{ s.portals | format }}</div>`);
    }
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_total_resets")}</span> {{ s.reset | format }}</div>`);
    if (global.stats.mad > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_mad_resets")}</span> {{ s.mad | format }}</div>`);
    }
    if (global.stats.bioseed > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_bioseed_resets")}</span> {{ s.bioseed | format }}</div>`);
    }
    if (global.stats.cataclysm > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_cataclysm_resets")}</span> {{ s.cataclysm | format }}</div>`);
    }
    if (global.stats.blackhole > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_blackhole_resets")}</span> {{ s.blackhole | format }}</div>`);
    }
    if (global.stats.ascend > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_ascension_resets")}</span> {{ s.ascend | format }}</div>`);
    }
    if (global.stats.descend > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_descension_resets")}</span> {{ s.descend | format }}</div>`);
    }
    if (global.stats.apotheosis > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_apotheosis_resets")}</span> {{ s.apotheosis | format }}</div>`);
    }
    if (global.stats.aiappoc > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_aiappoc_resets")}</span> {{ s.aiappoc | format }}</div>`);
    }
    if (global.stats.matrix > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_matrix_resets")}</span> {{ s.matrix | format }}</div>`);
    }
    if (global.stats.retire > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_retire_resets")}</span> {{ s.retire | format }}</div>`);
    }
    if (global.stats.eden > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_eden_resets")}</span> {{ s.eden | format }}</div>`);
    }
    if (global.stats.terraform > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_terraform_resets")}</span> {{ s.terraform | format }}</div>`);
    }
    if (global.stats.geck > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_gecks")}</span> {{ s.geck | format }}</div>`);
    }

    // Current Run Stats
    stats.append(`<div class="cstat"><span class="has-text-success">${loc("achieve_stats_current_game")}</span></div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_knowledge_spent")}</span> {{ s.know | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_starved_to_death")}</span> {{ s.starved | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_died_in_combat")}</span> {{ s.died | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_attacks_made")}</span> {{ s.attacks | format }}</div>`);
    stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_game_days_played")}</span> {{ s.days | format }}</div>`);
    if (global.stats.dkills > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_demons_kills")}</span> {{ s.dkills | format }}</div>`);
    }
    if (global.stats.sac > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_sacrificed")}</span> {{ s.sac | format }}</div>`);
    }
    if (global.stats.murders > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_murders")}</span> {{ s.murders | format }}</div>`);
    }
    if (global.stats.psykill > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_psymurders")}</span> {{ s.psykill | format }}</div>`);
    }
    if (global.stats.uDead > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_unstable")}</span> {{ s.uDead | format }}</div>`);
    }

    if (global.resource.hasOwnProperty('Thermite') && global.resource.Thermite.amount > 0){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_thermite")}</span> {{ r.Thermite.amount | res }}</div>`);
    }

    let hallowed = getHalloween();
    if (hallowed.active){
        let trick = '';
        if (global.stats.cfood >= 13 || global.race['cataclysm'] || global.race['orbit_decayed'] || global.race['warlord']){
            trick = `<span>${trickOrTreat(7,12,true)}</span>`;
        }
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_trickortreat")}</span> {{ s.cfood | format }} ${trick}</div>`);
    }

    if (global.race.hasOwnProperty('gods') && global.race.gods !== 'none'){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_gods")}</span> {{ g.gods | species }}</div>`)
    }
    if (global.race.hasOwnProperty('old_gods') && global.race.old_gods !== 'none'){
        stats.append(`<div><span class="has-text-warning">${loc("achieve_stats_old_gods")}</span> {{ g.old_gods | species }}</div>`)
    }

    vBind({
        el: '#statsPanel',
        data: {
            s: global.stats,
            r: global.resource,
            g: global.race
        },
        filters: {
            played(d){
                return d + global.stats.tdays;
            },
            t_know(k){
                return k + global.stats.tknow;
            },
            t_starved(s){
                return s + global.stats.tstarved;
            },
            t_died(d){
                return d + global.stats.tdied;
            },
            format(s){
                return s.toLocaleString();
            },
            res(r){
                return (+(r).toFixed(2)).toLocaleString();
            },
            species(s){
                switch (s){
                    case 'custom':
                        return global.custom.race0.name;
                    case 'hybrid':
                        return global.custom.race1.name;
                    default:
                        return loc(`race_${s}`);
                }
            }
        }
    });
}

