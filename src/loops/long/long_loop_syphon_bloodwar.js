// Syphon (hentikan web worker) dan bloodwar fortress per detik. Dulu bagian dari longLoop_s1.
import { global, webWorker } from '../../core/vars.js';
import { vacuumCollapse } from '../../resets/reset_vacuum_collapse_ascend_descension_apotheosis.js';
import { bloodwar } from '../../portal/hell/warlord_setup.js';
import { hellguard } from '../../portal/mech/hellguard.js';

export function longLoopSyphonBloodwar($ctx){
        if (global.tech['syphon'] && global.tech.syphon >= 80){
            if (webWorker.w){
                webWorker.w.terminate();
            }
            let bang = $('<div class="bigbang"></div>');
            $('body').append(bang);
            setTimeout(function(){
                bang.addClass('burn');
            }, 125);
            setTimeout(function(){
                bang.addClass('b');
            }, 150);
            setTimeout(function(){
                bang.addClass('c');
            }, 2000);
            setTimeout(function(){
                vacuumCollapse();
            }, 4000);
        }

        if (global.portal['fortress'] && !global.race['warlord']){
            bloodwar();
        }
        else if (global.race['warlord'] && global.portal['minions'] && global.portal.minions.count > 0){
            hellguard();
        }
}
