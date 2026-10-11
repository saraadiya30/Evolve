// Foothold, guard post, harbor, dan purifier per tick: kapasitas dan efek. Dulu bagian dari fastLoopCore_s4.
import { global, p_on, spire_on } from '../../core/vars.js';
import { actions } from '../../core/registries.js';
import { jobScale } from '../../civics/jobs/job_scale.js';
import { soulForgeSoldiers } from '../../portal/hell/soul_forge.js';

export function fastLoopOutposts($ctx){
        // Foothold
        if (global.galaxy['foothold'] && global.galaxy.foothold.count > 0){
            global.galaxy.foothold.s_max = p_on['s_gate'] * p_on['foothold'] * actions.galaxy.gxy_alien2.foothold.support();
        }

        // Guard Post
        if (global.portal['guard_post']){
            global.portal.guard_post.s_max = global.portal.guard_post.count * actions.portal.prtl_ruins.guard_post.support();

            if (global.portal.guard_post.on > 0){
                let army = global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size);
                if (p_on['soul_forge']){
                    let forge = soulForgeSoldiers();
                    if (forge <= army){
                        army -= forge;
                    }
                }
                if (army < jobScale(global.portal.guard_post.on)){
                    global.portal.guard_post.on = Math.floor(army / jobScale(1));
                    p_on['guard_post'] = Math.min(global.portal.guard_post.on, p_on['guard_post']);
                }
            }

            global.portal.guard_post.support = global.portal.guard_post.on;
        }

        // harbor
        if (global.portal['harbor']){
            global.portal.harbor.s_max = p_on['harbor'] * actions.portal.prtl_lake.harbor.support();
        }

        // Purifier
        if (global.portal['purifier']){
            global.portal.purifier.s_max = +(p_on['purifier'] * actions.portal.prtl_spire.purifier.support()).toFixed(2);

            let used_support = 0;
            let purifier_structs = global.support.spire.map(x => x.split(':')[1]);
            for ($ctx.i = 0; $ctx.i < purifier_structs.length; $ctx.i++){
                if (global.portal[purifier_structs[$ctx.i]]){
                    let operating = global.portal[purifier_structs[$ctx.i]].on;
                    let id = actions.portal.prtl_spire[purifier_structs[$ctx.i]].id;
                    if (used_support + operating > global.portal.purifier.s_max){
                        operating -= (used_support + operating) - global.portal.purifier.s_max;
                        $(`#${id} .on`).addClass('warn');
                        $(`#${id} .on`).prop('title',`ON ${operating}/${global.portal[purifier_structs[$ctx.i]].on}`);
                    }
                    else {
                        $(`#${id} .on`).removeClass('warn');
                        $(`#${id} .on`).prop('title',`ON`);
                    }
                    used_support += operating * -(actions.portal.prtl_spire[purifier_structs[$ctx.i]].support());
                    spire_on[purifier_structs[$ctx.i]] = operating;
                }
                else {
                    spire_on[purifier_structs[$ctx.i]] = 0;
                }
            }
            global.portal.purifier.support = used_support;
        }
}
