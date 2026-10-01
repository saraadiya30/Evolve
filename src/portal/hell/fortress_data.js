// fortressData / fortressDefenseRating: data dan rating pertahanan benteng.
import { global, p_on } from '../../core/vars.js';
import { loc } from '../../core/locale.js';
import { govCivics } from '../../civics/military/government_operations.js';
import { soulForgeSoldiers } from './soul_forge.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { hooks } from '../../core/registries.js';

export function fortressData(dt){
    switch (dt){
        case 'hostiles':
            {
                if (global.portal.fortress.threat >= 2000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_high')}`;
                }
                else if (global.portal.fortress.threat < 1000){
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_low')}`;
                }
                else {
                    return `${loc('fortress_threat',[global.portal.fortress.threat])} ${loc('fortress_threat_medium')}`;
                }
            }
        case 'threatLevel':
            {
                let t = global.portal.fortress.threat;
                if (t < 1000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level1')}`;
                }
                else if (t < 1500){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level2')}`;
                }
                else if (t >= 5000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level6')}`;
                }
                else if (t >= 3000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level5')}`;
                }
                else if (t >= 2000){
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level4')}`;
                }
                else {
                    return `${loc('fortress_threat_level')} ${loc('fortress_threat_level3')}`;
                }
            }
        case 'hireLabel':
            {
                let cost = Math.round(govCivics('m_cost')).toLocaleString();
                return loc('civics_garrison_hire_mercenary_cost',[cost]);
            }
    }
}

export function fortressDefenseRating(v){
    let army = v - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
    if (p_on['soul_forge']){
        let forge = soulForgeSoldiers();
        if (forge <= army){
            army -= forge;
        }
    }
    if (global.portal.hasOwnProperty('guard_post')){
        army -= jobScale(global.portal.guard_post.on);
    }
    let wounded = 0;
    if (global.civic.garrison.wounded > global.civic.garrison.workers - global.portal.fortress.garrison){
        wounded = global.civic.garrison.wounded - (global.civic.garrison.workers - global.portal.fortress.garrison);
        if (wounded > army){
            wounded = army;
        }
    }
    if (p_on['war_droid']){
        let droids = p_on['war_droid'] - global.portal.fortress.patrols > 0 ? p_on['war_droid'] - global.portal.fortress.patrols : 0;
        army += global.tech['hdroid'] ? jobScale(droids * 2) : jobScale(droids);
    }
    let turret = global.tech['turret'] ? (global.tech['turret'] >= 2 ? 70 : 50) : 35;
    return Math.round(hooks.armyRating(army,'hellArmy',wounded)) + (p_on['turret'] ? p_on['turret'] * turret : 0);
}
