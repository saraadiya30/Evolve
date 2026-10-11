// Batas Money dan hiburan dari amphitheatre, casino (kota, ruang angkasa, hell, tau ceti), dan resort. Dulu bagian dari midLoop_s2.
import { global, breakdown, p_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { structName } from '../../actions/core/structure_ui.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { govActive } from '../../governor/gov_active.js';

export function midLoopCasinoCaps($ctx){
        if (global.city['amphitheatre']){
            let athVal = govActive('athleticism',1);
            $ctx.lCaps['entertainer'] += jobScale(athVal ? (global.city.amphitheatre.count * athVal) : global.city.amphitheatre.count);
        }
        if (global.city['casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.city.casino.count);
            }
        }
        if (global.space['spc_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.space.spc_casino.count);
            }
            if (global.race['orbit_decayed']){
                $ctx.lCaps['banker'] += jobScale(global.space.spc_casino.count);
            }
        }
        if (global.portal['hell_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.portal.hell_casino.count * 3);
            }
            $ctx.lCaps['banker'] += jobScale(global.portal.hell_casino.count);
        }
        if (global.tauceti['tauceti_casino']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(global.tauceti.tauceti_casino.count);
            }
            if (global.tech['isolation']){
                $ctx.lCaps['banker'] += jobScale(global.tauceti.tauceti_casino.count);

                let pop = p_on['tauceti_casino'] * actions.tauceti.tau_home.tauceti_casino.citizens();
                $ctx.caps[global.race.species] += pop;
                breakdown.c[global.race.species][structName('casino')] = pop + 'v';
            }
        }
        if (global.galaxy['resort']){
            if (global.tech['theatre'] && !global.race['joyless']){
                $ctx.lCaps['entertainer'] += jobScale(p_on['resort'] * 2);
            }
        }
}
