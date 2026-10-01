// Penutup skenario Warlord: struktur trait ras (calm, cannibalize, magnificent), lalu gambar ulang tech, ARPA, foundry, dan fortress.
import { global } from '../../core/vars.js';
import { initStruct } from '../../actions/core/structure_ui.js';
import { actions, hooks } from '../../core/registries.js';
import { drawTech } from '../../actions/core/action_runner.js';
import { loadFoundry } from '../../civics/jobs/foundry_panel.js';
import { renderFortress } from '../../portal/hell/fortress_defense.js';

export function warlordSetupFinish($ctx){
        if (global.race['calm']){
            global.resource.Zen.display = true;
            initStruct(actions.city.meditation);
        }
        if (global.race['cannibalize']){
            initStruct(actions.city.s_alter);
        }
        if (global.race['magnificent']){
            initStruct(actions.city.shrine);
        }

        global.portal['fortress'] = {
            threat: 10000,
            garrison: 0,
            walls: 100,
            repair: 0,
            patrols: 0,
            patrol_size: 10,
            siege: 999,
            notify: 'Yes',
            s_ntfy: 'Yes',
            nocrew: false,
        };
        global.portal.observe = {
            settings: {
                expanded: false,
                average: false,
                hyperSlow: false,
                display: 'game_days',
                dropKills: true,
                dropGems: true
            },
            stats: {
                total: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
                    wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                    kills: {
                        drones: 0,
                        patrols: 0,
                        sieges: 0,
                        guns: 0,
                        soul_forge: 0,
                        turrets: 0
                    },
                    gems: {
                        patrols: 0,
                        guns: 0,
                        soul_forge: 0,
                        crafted: 0,
                        turrets: 0,
                        surveyors: 0
                    },
                },
                period: {
                    start: { year: global.city.calendar.year, day: global.city.calendar.day },
                    days: 0,
                    wounded: 0, died: 0, revived: 0, surveyors: 0, sieges: 0,
                    kills: {
                        drones: 0,
                        patrols: 0,
                        sieges: 0,
                        guns: 0,
                        soul_forge: 0,
                        turrets: 0
                    },
                    gems: {
                        patrols: 0,
                        guns: 0,
                        soul_forge: 0,
                        crafted: 0,
                        turrets: 0,
                        surveyors: 0
                    },
                }
            },
            graphID: 0,
            graphs: {}
        };

        drawTech();
        hooks.arpa('Physics');
        loadFoundry();
        renderFortress();
}
