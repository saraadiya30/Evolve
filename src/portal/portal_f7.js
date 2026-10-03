import { global, hell_reports } from '../core/vars.js';
import { loc } from '../core/locale.js';
import { orbitLength } from '../races/races.js';
import { clearElement, vBind, popover } from '../functions/functions.js';
import { jobName } from '../civics/jobs.js';
import { unlockAchieve } from '../achievements/achieve.js';

// Fungsi-fungsi dipindah dari portal.js (urutan sumber dipertahankan). portal.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function drawHellReports(){
    if (!global.settings.tabLoad && global.settings.hellTabs !== 0){
        return;
    }
    purgeReports();
    
    let list = ``;
    
    let info = ($(`#h_Report`));
    let reports = $(`<div id="hellReport" class="hellReports"></div>`);
    info.append(reports);
    let reportListSection = $(`<div class="reportList vscroll"></div>`);
    reports.append(reportListSection);
    reportListSection.append(`<div id="hellReportLogTitle"><h2 class="has-text-info">${loc('hell_report_log')}</h2><span class="refresh" @click="updateList()" aria-label="${loc('hell_report_log_refresh_aria')}">
        <svg version="1.1" x="0px" y="0px" viewBox="0 0 492.883 492.883" enable-background="new 0 0 492.883 492.883" xml:space="preserve">
            <path d="M122.941,374.241c-20.1-18.1-34.6-39.8-44.1-63.1c-25.2-61.8-13.4-135.3,35.8-186l45.4,45.4c2.5,2.5,7,0.7,7.6-3    l24.8-162.3c0.4-2.7-1.9-5-4.6-4.6l-162.4,24.8c-3.7,0.6-5.5,5.1-3,7.6l45.5,45.5c-75.1,76.8-87.9,192-38.6,282    c14.8,27.1,35.3,51.9,61.4,72.7c44.4,35.3,99,52.2,153.2,51.1l10.2-66.7C207.441,421.641,159.441,407.241,122.941,374.241z"/>
		    <path d="M424.941,414.341c75.1-76.8,87.9-192,38.6-282c-14.8-27.1-35.3-51.9-61.4-72.7c-44.4-35.3-99-52.2-153.2-51.1l-10.2,66.7    c46.6-4,94.7,10.4,131.2,43.4c20.1,18.1,34.6,39.8,44.1,63.1c25.2,61.8,13.4,135.3-35.8,186l-45.4-45.4c-2.5-2.5-7-0.7-7.6,3    l-24.8,162.3c-0.4,2.7,1.9,5,4.6,4.6l162.4-24.8c3.7-0.6,5.4-5.1,3-7.6L424.941,414.341z"/>
        </svg>
    </span></div>`);
    let reportList = $(`<div id="hellReportList"></div>`);
    reportListSection.append(reportList);
    reports.append($(`<div id="hellReportDisplay" class="reportDisplay is-vertical vscroll"></div>`));
    
    let recentDay = { year: 0, day: 0 };
    if (Object.keys(hell_reports).length){
        recentDay.year = Object.keys(hell_reports)[0].split('-')[1];
        recentDay.day = Object.keys(hell_reports[`year-${recentDay.year}`])[0].split('-')[1];
    }

    let updateList = function(startYear,startDay){
        if (purgeReports(true)){
            list = ``;
            startYear = Object.keys(hell_reports)[0].split('-')[1];
            startDay = Object.keys(hell_reports[`year-${recentDay.year}`])[0].split('-')[1];
        }
        for (startYear; startYear<global.city.calendar.year; startYear++){
            for (startDay; startDay<=orbitLength(); startDay++){
                let gemString = ""; let gemCount = hell_reports[`year-${startYear}`][`day-${startDay}`].foundGems;
                if (gemCount) {
                    gemString = `<span class="has-text-advanced" aria-label="${loc(`hell_report_log_soul_gem_aria`)}">${gemCount >= 5 ? `&#9830x${gemCount}` : "&#9830".repeat(gemCount)}</span>`;
                }
                list = `
                    <div class="text-button"><span @click="reportLoad('${startYear}','${startDay}')">${loc('year') + " " + startYear + " | " + loc('day') + " " + startDay}${gemString}</span></div>
                ` + list;
            }
            startDay = 1;
        }
        //Remaining days in current year.
        for (startDay; startDay<global.city.calendar.day; startDay++){
            let gemString = ""; let gemCount = hell_reports[`year-${startYear}`][`day-${startDay}`].foundGems;
            if (gemCount) {
                gemString = `<span class="has-text-advanced" aria-label="${loc(`hell_report_log_soul_gem_aria`)}">${gemCount >= 5 ? `&#9830x${gemCount}` : "&#9830".repeat(gemCount)}</span>`;
            }
            list = `
                <div class="text-button"><span @click="reportLoad('${startYear}','${startDay}')">${loc('year') + " " + startYear + " | " + loc('day') + " " + startDay}${gemString}</span></div>
            ` + list;
        }
        recentDay.year = startYear;
        recentDay.day = startDay;
        
        let reportList = ($(`#hellReportList`));
        clearElement(reportList);
        reportList.append(list);
        vBind({
            el: '#hellReportList',
            methods: {
                reportLoad(year,day){
                    loadReport(year,day);
                }
            }
        });
    }

    let loadReport = function(year,day){
        if (!year || !day){
            return;
        }
        let info = $(`#hellReportDisplay`);
        clearElement(info);
        let curr_report = hell_reports[`year-${year}`][`day-${day}`];

        let statsBar = $(`<div id="hellReportStats" class="reportStats"></div>`);
        info.append(statsBar);
        let kills = 0;
        let gems = 0;
        Object.keys(curr_report.stats.kills).forEach(function(killType){
            kills += curr_report.stats.kills[killType];
        });
        Object.keys(curr_report.stats.gems).forEach(function(gemType){
            gems += curr_report.stats.gems[gemType];
        });
        statsBar.append(`<div><h2 class="has-text-info">${loc('hell_report_log_stats',[year,day])}</h2></div>`);
        statsBar.append(`<div>
            <h2>${loc('hell_report_log_stats_kills',[kills])}</h2>
            <h2 v-show="g.display">${loc('hell_report_log_stats_gems',[gems])}</h2>
            <h2>${loc('hell_report_log_stats_wounded',[curr_report.stats.wounded])}</h2>
            <h2>${loc('hell_report_log_stats_died',[curr_report.stats.died])}</h2>
        </div>`);

        info.append(`<div><h2 class="has-text-info">${loc('hell_report_log_report',[year,day])}</h2></div>`);
        info.append(`<p class="has-text-danger">${loc('hell_report_log_start',[curr_report.start])}</p>`);

        if (curr_report.soul_attractors){
            info.append(`<p>${loc('hell_report_log_soul_attractors',[curr_report.soul_attractors])}</p>`);
        }
        if (curr_report.ghost_trappers){
            info.append(`<p>${loc('hell_report_log_ghost_trappers',[curr_report.ghost_trappers])}</p>`);
        }
        if (curr_report.soul_forge){
            let displayText = $(`<p></p>`);
            displayText.append(`<span>${loc('hell_report_log_soul_forge',[curr_report.soul_forge.kills])}</span>`);
            if (curr_report.soul_forge.gem){
                displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,1])}</span>`);
            }
            if (curr_report.soul_forge.gem_craft){
                displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_craft',[curr_report.soul_forge.corrupt ? loc('resource_Corrupt_Gem_name') : global.resource.Soul_Gem.name])}</span>`);
            }
            info.append(displayText);
        }

        if (curr_report.stats.gems.compactor){
            let displayText = $(`<p></p>`);
            if (curr_report.stats.gems.compactor){
                displayText.append(`<span class="has-text-success">${loc('hell_report_log_compactor',[curr_report.stats.gems.compactor, global.resource.Soul_Gem.name])}</span>`);
            }
            info.append(displayText);
        }

        if (curr_report.drones){
            Object.keys(curr_report.drones).forEach(function(num){
                let drone = curr_report.drones[num];
                let name = loc('hell_report_log_obj_counter',[loc('portal_war_drone_title'),num]);
                if (drone.encounter){
                    info.append(`<p>${loc('hell_report_log_encounter',[name,drone.kills])}</p>`);
                }
                else {
                    info.append(`<p class="has-text-warning">${loc('hell_report_log_encounter_fail',[name])}</p>`);
                }
            });
        }
        if (curr_report.patrols){
            Object.keys(curr_report.patrols).forEach(function(num){
                let patrol = curr_report.patrols[num];
                let name = loc('hell_report_log_obj_counter',[loc('hell_report_log_patrol'),num]);
                name = patrol.droid ? loc('hell_report_log_patrol_droid',[name]) : name;
                if (patrol.encounter){
                    let displayText = $(`<p></p>`);
                    if (patrol.ambush){
                        displayText.append(`<span class="has-text-warning">${loc('hell_report_log_patrol_ambush',[name,patrol.kills])}</span>`);
                    }
                    else {
                        displayText.append(`<span>${loc('hell_report_log_encounter',[name,patrol.kills])}</span>`);
                    }
                    if (patrol.wounded){
                        displayText.append(`<span class="has-text-danger">${patrol.wounded > 1 ? loc('hell_report_log_patrol_wounded_plural',[patrol.wounded]) : loc('hell_report_log_patrol_wounded')}</span>`);
                    }
                    if (patrol.died){
                        displayText.append(`<span class="has-text-danger">${patrol.died > 1 ? loc('hell_report_log_patrol_killed_plural',[patrol.died]) : loc('hell_report_log_patrol_killed')}</span>`);
                    }
                    if (patrol.gem > 0){
                        displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,patrol.gem])}</span>`);
                    }
                    info.append(displayText);
                }
                else {
                    info.append(`<p class="has-text-warning">${loc('hell_report_log_encounter_fail',[name])}</p>`);
                }
            });
        }

        if (curr_report.surveyor_finds){
            Object.keys(curr_report.surveyor_finds).forEach(function(num){
                let surveyor = curr_report.surveyor_finds[num];
                let name = loc('hell_report_log_obj_counter',[jobName('hell_surveyor'),num]);

                let displayText = $(`<p></p>`);
                displayText.append(`<span>${loc('hell_report_log_search',[name,surveyor.bodies])}</span>`);
                if (surveyor.gem > 0){
                    displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_search',[global.resource.Soul_Gem.name,surveyor.gem])}</span>`);
                }
                info.append(displayText);
            });
        }

        if (curr_report.revived){
            info.append(`<p>${curr_report.revived > 1 ? loc('hell_report_log_revived_plural',[curr_report.revived]) : loc('hell_report_log_revived')}</p>`);
        }
        if (curr_report.patrols_lost){
            info.append(`<p class="has-text-danger">${loc('hell_report_log_patrols_lost',[curr_report.patrols_lost])}</p>`);
        }
        if (curr_report.siege){
            if (curr_report.siege.destroyed){
                info.append(`<p class="has-text-danger">${loc('hell_report_log_siege',[curr_report.siege.surveyors,curr_report.siege.soldiers,curr_report.siege.kills])}</p>`);
            }
            else {
                info.append(`<p class="has-text-warning">${loc('hell_report_log_siege_fail',[curr_report.siege.damage,curr_report.siege.kills])}</p>`);
            }
        }
        if (curr_report.demons){
            info.append(`<p class="has-text-danger">${loc('hell_report_log_demons',[curr_report.demons])}</p>`);
        }
        if (curr_report.surveyors){
            info.append(`<p class="has-text-danger">${curr_report.surveyors > 1 ? loc('hell_report_log_surveyors_plural',[curr_report.surveyors]) : loc('hell_report_log_surveyors')}</p>`);
        }
        if (curr_report.gun_emplacements){
            Object.keys(curr_report.gun_emplacements).forEach(function(num){
                let displayText = $(`<p></p>`);
                let gun = curr_report.gun_emplacements[num];
                let name = loc('hell_report_log_obj_counter',[loc('portal_gun_emplacement_title'),num]);
                displayText.append($(`<span>${loc('hell_report_log_misc_kills',[name,gun.kills,loc('portal_pit_name')])}</span>`));
                if (gun.gem){
                    displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,1])}</span>`);
                }
                info.append(displayText);
            });
        }
        if (curr_report.gate_turrets){
            Object.keys(curr_report.gate_turrets).forEach(function(num){
                let displayText = $(`<p></p>`);
                let turret = curr_report.gate_turrets[num];
                let name = loc('hell_report_log_obj_counter',[loc('portal_gate_turret_title'),num]);
                displayText.append(`<span>${loc('hell_report_log_misc_kills',[name,turret.kills,loc('portal_gate_name')])}</span>`);
                if (turret.gem){
                    displayText.append(`<span class="has-text-success">${loc('hell_report_log_soul_find',[global.resource.Soul_Gem.name,1])}</span>`);
                }
                info.append(displayText);
            });
        }
    
        vBind({
            el: '#hellReportDisplay',
            data: {
                g: global.resource.Soul_Gem
            }
        });
    }

    if (recentDay.day !== 0){
        updateList(recentDay.year, recentDay.day);
        let lastReportYear = recentDay.year;
        let lastReportDay = recentDay.day;
        if (lastReportDay - 1 === 0){
            lastReportYear--;
            lastReportDay = orbitLength();
        }
        else {
            lastReportDay--;
        }
        loadReport(lastReportYear,lastReportDay);
    }
    else {
        recentDay.year = global.city.calendar.year;
        recentDay.day = global.city.calendar.day;
    }

    vBind({
        el: '#hellReportLogTitle',
        methods: {
            updateList(){
                updateList(recentDay.year, recentDay.day);
            }
        }
    });

    popover(`hellReportLogs`, function(){
            return loc(`hell_report_log_tooltip`,[2500]);
        },
        {
            elm: `#hellReport .reportList div:first-child h2`
        }
    );
}

export function purgeReports(refresh){
    if (!(!!document.getElementById(`hellReportList`)) || refresh){
        let removed = false;
        let threshold = 2500;

        let approx = ((Object.keys(hell_reports).length - 1) * orbitLength()) + global.city.calendar.day;

        if (approx > threshold){
            let firstYear = Object.keys(hell_reports[Object.keys(hell_reports)[0]]).length;
            if (approx - orbitLength() + firstYear > threshold){
                removed = true;
                approx -= firstYear;
                delete hell_reports[Object.keys(hell_reports)[0]];
            }
            while (approx > threshold){
                approx -= orbitLength();
                delete hell_reports[Object.keys(hell_reports)[0]];
            }
        }
        return removed;
    }
}

export function checkWarlordAchieve(){
    if (global.race['warlord']){
        let tasks = 0;
        Object.keys(global.stats.warlord).forEach(function(k){
            if (global.stats.warlord[k]){
                tasks++;
            }
        });
        if (tasks > 0){
            unlockAchieve('what_is_best',false,tasks);
        }
    }
}
