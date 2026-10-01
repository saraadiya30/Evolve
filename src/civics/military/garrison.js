// garrisonSize / soldierDeath: ukuran garnisun dan kematian prajurit.
import { global, p_on } from '../../core/vars.js';
import { soulForgeSoldiers } from '../../portal/hell/soul_forge.js';
import { blubberFill } from '../../races/powers/psychic_powers.js';

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

export function soldierDeath(v){
    let killed = v;
    if (killed > global.civic.garrison.workers){
        killed = global.civic.garrison.workers;
    }
    global.civic.garrison.workers -= killed;
    global.stats.died += killed;
    blubberFill(killed);
}
