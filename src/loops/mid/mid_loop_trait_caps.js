// Batas dari trait ras unfathomable (captive housing) dan psychic. Dulu bagian dari midLoop_s2.
import { global } from '../../core/vars.js';
import { weaponTechModifer } from '../../civics/military/army_rating.js';
import { workerScale } from '../../civics/jobs/worker_scale.js';
import { racialTrait, servantTrait } from '../../races/trait_logic/racial_traits.js';
import { traits } from '../../core/registries.js';

export function midLoopTraitCaps($ctx){
        if (global.race['unfathomable'] && global.city['captive_housing']){
            let strength = weaponTechModifer();
            let hunt = workerScale(global.civic.hunter.workers,'hunter')
            hunt *= racialTrait(hunt,'hunting') * strength;
            if (global.race['swift']){
                hunt *= 1 + (traits.swift.vars()[1] / 100);
            }

            if (global.race['servants']){
                let serve = global.race.servants.jobs.hunter * strength;
                serve *= servantTrait(global.race.servants.jobs.hunter,'hunting');
                hunt += serve;
            }

            let usedCap = 0;
            let thralls = 0;
            let imprisoned = [];
            if (global.city.hasOwnProperty('surfaceDwellers')){
                for (let i = 0; i < global.city.surfaceDwellers.length; i++){
                    let mindbreak = global.city.captive_housing[`race${i}`];
                    let jailed = global.city.captive_housing[`jailrace${i}`];
                    usedCap += mindbreak + jailed;
                    thralls += mindbreak;
                    if (jailed > 0){
                        imprisoned.push(i);
                    }
                }
            }

            let catchVar = Math.round(40 / traits.unfathomable.vars()[1]);
            if (usedCap < global.city.captive_housing.raceCap && Math.rand(0,(catchVar * usedCap) - hunt) <= 0){
                let k = Math.rand(0,global.city.surfaceDwellers.length);
                global.city.captive_housing[`jailrace${k}`]++;
            }

            if (global.tech['unfathomable'] && global.tech.unfathomable >= 2 && global.civic.torturer.workers > 0 && imprisoned.length > 0){
                if (Math.rand(0,Math.ceil((thralls+1) ** 1.45)) < (global.civic.torturer.workers / 2) * (1 + traits.psychic.vars()[0])){
                    let k = imprisoned[Math.rand(0,imprisoned.length)];
                    global.city.captive_housing[`jailrace${k}`]--;
                    global.city.captive_housing[`race${k}`]++;
                }
            }
        }

        if (global.race['psychic']){
            if (global.race['psychicPowers'] && global.race.psychicPowers.boostTime > 0){
                global.race.psychicPowers.boostTime--;
                if (global.race.psychicPowers.boostTime < 0 || global.race.psychicPowers.boostTime > 360){
                    global.race.psychicPowers.boostTime = 0;
                }
            }
            if (global.race['psychicPowers'] && global.race.psychicPowers['assaultTime'] && global.race.psychicPowers.assaultTime > 0){
                global.race.psychicPowers.assaultTime--;
                if (global.race.psychicPowers.assaultTime < 0 || global.race.psychicPowers.assaultTime > 360){
                    global.race.psychicPowers.assaultTime = 0;
                }
            }
            if (global.race['psychicPowers'] && global.race.psychicPowers['cash'] && global.race.psychicPowers.cash > 0){
                global.race.psychicPowers.cash--;
                if (global.race.psychicPowers.cash < 0 || global.race.psychicPowers.cash > 360){
                    global.race.psychicPowers.cash = 0;
                }
            }
        }
}
