// Batas pekerja craftsman dan pekerja khusus (surveyor, archaeologist, ghost, elysium miner) dari foundry, fabrication, forge, dan struktur terkait.
import { global, support_on, p_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { jobScale } from '../../civics/jobs/job_scale.js';

export function midLoopCraftsmanJobCaps($ctx){
        if (global.city['foundry']){
            $ctx.lCaps['craftsman'] += jobScale(global.city['foundry'].count);
        }
        if (support_on['fabrication']){
            $ctx.lCaps['craftsman'] += jobScale(support_on['fabrication']);
            if (global.race['cataclysm']){
                $ctx.lCaps['cement_worker'] += jobScale(support_on['fabrication']);
            }
        }
        if (global.tech['isolation'] && support_on['tau_factory']){
            $ctx.lCaps['craftsman'] += jobScale(support_on['tau_factory'] * 5);
            $ctx.lCaps['cement_worker'] += jobScale(support_on['tau_factory'] * 2);
        }
        if (global.race['warlord'] && p_on['hell_factory']){
            $ctx.lCaps['cement_worker'] += jobScale(p_on['hell_factory'] * 5);
        }
        if (p_on['womling_station']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['womling_station'] * 1);
            $ctx.lCaps['cement_worker'] += jobScale(p_on['womling_station'] * 1);
        }
        if (p_on['stellar_forge']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['stellar_forge'] * 2);
        }
        if (p_on['demon_forge']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['demon_forge'] * actions.portal.prtl_wasteland.demon_forge.crafters());
        }
        if (global.tech['elysium'] && global.tech.elysium >= 18 && p_on['sacred_smelter']){
            $ctx.lCaps['craftsman'] += jobScale(p_on['sacred_smelter'] * 3);
        }
        if (global.portal['carport']){
            $ctx.lCaps['hell_surveyor'] += jobScale(global.portal.carport.count) - global.portal.carport.damaged;
        }
        if (p_on['archaeology']){
            $ctx.lCaps['archaeologist'] += jobScale(p_on['archaeology'] * 2);
        }
        if (support_on['ectoplasm_processor']){
            $ctx.lCaps['ghost_trapper'] += jobScale(support_on['ectoplasm_processor'] * 5);
        }
        if (p_on['elysanite_mine']){
            $ctx.lCaps['elysium_miner'] += jobScale(p_on['elysanite_mine'] * 2);
        }
}
