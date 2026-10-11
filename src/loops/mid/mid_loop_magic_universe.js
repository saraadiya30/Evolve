// Aturan khusus universe magic (witch hunter). Dulu bagian dari midLoop_s5.
import { global, breakdown, p_on } from '../../core/vars.js';
import { wardenLabel } from '../../actions/core/structure_ui.js';
import { loc } from '../../core/locale.js';
import { highPopAdjust } from '../../functions/adjusters_basic.js';
import { jobName } from '../../civics/jobs/job_name.js';
import { messageQueue } from '../../functions/message_log.js';

export function midLoopMagicUniverse($ctx){
        if (global.race['universe'] === 'magic' && global.race['witch_hunter']){
            let sus = 0;

            if (global.city['wardenclyffe']){
                let wiz = global.city.wardenclyffe.count;
                wiz += p_on['wardenclyffe'];

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 6){
                    wiz /= 2;
                }

                breakdown.c.Sus[wardenLabel()] = wiz+'v';
                sus += wiz;
            }

            if (global.civic.scientist.workers > 0){
                let wiz = global.civic.scientist.workers;
                if (global.civic.govern.type === 'magocracy'){
                    wiz /= 2;
                }
                wiz = highPopAdjust(wiz);
                breakdown.c.Sus[jobName('wizard')] = wiz+'v';
                sus += wiz;
            }

            if (global.city['coal_power'] && !global.race['environmentalist']){
                let mana_engine = p_on['coal_power'];

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 6){
                    mana_engine /= 2;
                }

                breakdown.c.Sus[loc('city_mana_engine')] = mana_engine+'v';
                sus += mana_engine;
            }

            if (global.city['pylon'] || global.space['pylon'] || global.tauceti['pylon']){
                let p_count = 0;
                let name = 'city_pylon';
                if ((global.race['cataclysm'] || global.race['orbit_decayed']) && global.space['pylon']){
                    p_count = global.space.pylon.count;
                    name = 'space_red_pylon';
                }
                else if (global.tech['isolation'] && global.tauceti['pylon']){
                    p_count = global.tauceti.pylon.count;
                    name = 'tau_home_pylon';
                }
                else if (global.city['pylon']){
                    p_count = global.city.pylon.count;
                }

                if (global.tech['roguemagic'] && global.tech.roguemagic >= 5){
                    p_count /= 3;
                }

                breakdown.c.Sus[loc(name)] = p_count+'v';
                sus += p_count;
            }

            if (global.race['casting']){
                let ritual = global.race.casting.total;
                if (global.tech['roguemagic'] && global.tech.roguemagic >= 2){
                    if (global.tech.roguemagic >= 4){
                        ritual /= 4;
                    }

                    ritual -= highPopAdjust(global.civic.priest.workers);
                    if (ritual < 0){
                        ritual = 0;
                    }
                }
                breakdown.c.Sus[loc('tech_rituals')] = ritual+'v';
                sus += ritual;
            }

            if (global.race['totTransmute'] && global.race.totTransmute > 0){
                let transmute = global.race.totTransmute / 5;
                breakdown.c.Sus[loc('tech_alchemy')] = transmute+'v';
                sus += transmute;
            }

            let mtech = 0;
            if (global.tech['explosives']){
                mtech += 4;
            }
            if (global.tech['military']){
                if (global.tech.military >= 10){
                    mtech += 28;
                }
                else if (global.tech.military >= 9){
                    mtech += 24;
                }
                else if (global.tech.military >= 8){
                    mtech += 20;
                }
                else if (global.tech.military >= 7){
                    mtech += 16;
                }
                else if (global.tech.military >= 6){
                    mtech += 12;
                }
                else if (global.tech.military >= 4){
                    mtech += 8;
                }
                else if (global.tech.military >= 3){
                    mtech += 4;
                }
            }
            breakdown.c.Sus[loc('witch_hunter_magic_tech')] = mtech+'v';
            sus += mtech;

            if (!global.tech['roguemagic']){
                breakdown.c.Sus[loc('overt')] = (sus*5-sus)+'v';
                sus *= 5;
            }

            if (global.tech['nexus']){
                let nexus = global.tech['nexus'] * 0.15;
                breakdown.c.Sus[loc('arpa_projects_nexus_title')] = nexus+'v';
                sus += nexus;
            }

            if (global.tech['syphon']){
                let syphon = global.tech['syphon'] * 2.5;
                breakdown.c.Sus[loc('arpa_syphon_title')] = syphon+'v';
                sus += syphon;
            }

            if (global.portal.hasOwnProperty('soul_capacitor')){
                let capacitors = p_on['soul_capacitor'] || 0;
                global.portal.soul_capacitor['ecap'] = 2500000 * capacitors;
                breakdown.c.Sus[loc('portal_soul_capacitor_title')] = (capacitors / 3)+'v';
                sus += capacitors / 3;
            }

            if (global.tech['roguemagic'] && global.tech.roguemagic >= 3 && global.city['conceal_ward']){
                let wards = global.city.conceal_ward.count;
                if (global.tech.roguemagic >= 8){
                    wards *= 1.25;
                }
                breakdown.c.Sus[loc('city_conceal_ward')] = -(wards)+'v';
                sus -= wards;
            }

            if (sus < 0){ sus = 0; }
            sus = Math.floor(sus);
            global.resource.Sus.amount = sus;

            if (sus >= 50 && !global.race['witch_hunter_warned']){
                global.race['witch_hunter_warned'] = 1;
                messageQueue(loc('witch_hunter_warning'),'danger',false,['progress']);
            }
            else if (sus >= 80 && global.race['witch_hunter_warned'] && global.race.witch_hunter_warned === 1){
                global.race.witch_hunter_warned = 2;
                messageQueue(loc('witch_hunter_warning2'),'danger',false,['progress']);
            }

            if (sus >= 100){
                global.civic.foreign.gov0.hstl = 100;
                global.civic.foreign.gov1.hstl = 100;
                global.civic.foreign.gov2.hstl = 100;
                if (global.race['truepath']){
                    global.civic.foreign.gov3.hstl = 100;
                }
            }
        }
}
