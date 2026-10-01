import { global, set_alevel, set_ulevel } from './vars.js';
import { messageQueue, calc_mastery, clearElement, getBaseIcon, format_emblem, sLevel, svgViewBox, svgIcons, easterEgg, trickOrTreat, vBind, popover } from './functions.js';
import { loc } from './locale.js';
import { checkAchievements_s1, checkAchievements_s2 } from './sec_checkAchievements_1.js';
import { perkList } from './ach_registry.js';
import { achievements, feats } from './achieve.js';
import { drawStats } from './achieve_g2.js';

// Fungsi-fungsi dipindah dari achieve.js (urutan sumber dipertahankan). achieve.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function universeLevel(universe){
    universe = universe || global.race.universe;
    let affix = universeAffix(universe);
    let lvl = 0;
    let ulvl = 0;
    Object.keys(achievements).forEach(function (achievement){
        if (global.stats.achieve[achievement]){
            lvl += global.stats.achieve[achievement].l > 5 ? 5 : global.stats.achieve[achievement].l;
            if (global.stats.achieve[achievement][affix]){
                ulvl += global.stats.achieve[achievement][affix] > 5 ? 5 : global.stats.achieve[achievement][affix];
            }
        }
    });
    return { aLvl: lvl, uLvl: ulvl };
}

export function universeAffix(universe){
    universe = universe || global.race.universe;
    switch (universe){
        case 'evil':
            return 'e';
        case 'antimatter':
            return 'a';
        case 'heavy':
            return 'h';
        case 'micro':
            return 'm';
        case 'magic':
            return 'mg';
        default: // Standard
            return 'l';
    }
}

export function unlockAchieve(achievement,small,rank,universe){
    if (global.race.universe !== 'micro' && small === true){
        return false;
    }
    if (!global.settings.msgFilters.achievements.unlocked){
        global.settings.msgFilters.achievements.unlocked = true;
        global.settings.msgFilters.achievements.vis = true;
    }
    let a_level = alevel();
    let unlock = false;
    let redraw = false;
    if (typeof rank === "undefined" || rank > a_level){
        rank = a_level;
    }
    let upgrade = true;
    if (typeof global.stats.achieve[achievement] === "undefined"){
        global.stats.achieve[achievement] = { l: 0 };
        upgrade = false;
    }
    if ((global.race.universe === 'micro' && small === true) || (global.race.universe !== 'micro' && small !== true)){
        if (global.stats.achieve[achievement] && global.stats.achieve[achievement].l < rank){
            global.settings.showAchieve = true;
            global.stats.achieve[achievement].l = rank;
            messageQueue(loc(upgrade ? 'achieve_unlock_achieve_upgrade' : 'achieve_unlock_achieve', [achievements[achievement].name] ),'special',false,['achievements']);
            redraw = true;
            unlock = true;
        }
    }
    if (global.stats.achieve[achievement] && universe !== 'l'){
        let u_affix = universe || universeAffix();
        if (!global.stats.achieve[achievement][u_affix] || (global.stats.achieve[achievement][u_affix] && global.stats.achieve[achievement][u_affix] < rank)){
            let i_upgrade = global.stats.achieve[achievement][u_affix] ? true : false;
            global.stats.achieve[achievement][u_affix] = rank;
            redraw = true;
            if (!unlock){
                messageQueue(loc(i_upgrade ? 'achieve_unlock_achieve_icon_upgrade' : 'achieve_unlock_achieve_icon', [achievements[achievement].name] ),'special',false,['achievements']);
            }
        }
    }
    if (redraw){
        calc_mastery(true);
        drawPerks();
        drawAchieve();
    }
    return unlock;
}

export function unlockFeat(feat,small,rank){
    if ((global.race.universe === 'micro' && small !== true) || (global.race.universe !== 'micro' && small === true)){
        return false;
    }
    if (!global.settings.msgFilters.achievements.unlocked){
        global.settings.msgFilters.achievements.unlocked = true;
        global.settings.msgFilters.achievements.vis = true;
    }
    let a_level = alevel();
    if (typeof rank === "undefined" || rank > a_level){
        rank = a_level;
    }
    if (!global.stats.feat[feat] || (global.stats.feat[feat] && global.stats.feat[feat] < rank)){
        let upgrade = global.stats.feat[feat] ? true : false;
        global.settings.showAchieve = true;
        global.stats.feat[feat] = rank;
        messageQueue(loc(upgrade ? 'feat_upgraded' : 'feat_unlocked', [feats[feat].name] ),'special',false,['achievements']);
        drawPerks();
        drawAchieve();
        return true;
    }
    return false;
}

export function setupStats(){
    clearElement($('#achieve'));
    clearElement($('#stats'));
    let stats = $('<div id="statsPanel"></div>');
    $('#stats').append(stats);
    let perks = $('<div id="perksPanel"></div>');
    $('#perks').append(perks);
    let achieve = $('<div id="achievePanel"></div>');
    $('#achieve').append(achieve);
    drawStats();
    drawPerks();
    if ($(`body`).hasClass('fool')){
        drawAchieve({fool: true});
    }
    else {
        drawAchieve();
    }
}

export function drawAchieve(args){
    clearElement($('#achievePanel'));
    let achieve = $('#achievePanel');
    let earned = 0;
    let total = 0;
    let level = 0;
    let ulevel = 0;

    let affix = universeAffix();
    let fool = typeof args === 'object' && args['fool'] ? args.fool : false;

    Object.keys(achievements).forEach(function (achievement){
        let baseIcon = getBaseIcon(achievement,'achievement');
        total++;
        if (global.stats.achieve[achievement]){
            earned++;
            level += global.stats.achieve[achievement].l > 5 ? 5 : global.stats.achieve[achievement].l;
            if (global.stats.achieve[achievement][affix]){
                ulevel += global.stats.achieve[achievement][affix] > 5 ? 5 : global.stats.achieve[achievement][affix];
            }
            let emblem = format_emblem(achievement,16,baseIcon,fool);
            if ((fool && global.stats.achieve[achievement].l > 1) || !fool){
                achieve.append($(`<b-tooltip :label="flair('${achievement}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-warning">${achievements[achievement].name}</span><span>${achievements[achievement].desc}</span>${emblem}</div></b-tooltip>`));
            }
            else if (fool && global.stats.achieve[achievement].l === 1){
                earned--;
            }
        }
    });
    set_alevel(level);
    set_ulevel(ulevel);

    if (fool && !global.stats.feat['fool']){
        let thefool = $(`<b-tooltip :label="feat('fool')" position="is-bottom" size="is-small" animated><div id="thefool" class="achievement"><span class="has-text-danger">${feats.fool.name}</span><span>${loc('feat_fool_spoof')}</span></div></b-tooltip>`);
        achieve.append(thefool);
    }
    else {
        Object.keys(feats).forEach(function (feat){
            let baseIcon = getBaseIcon(feat,'feat');
            if (global.stats.feat[feat]){
                let star = global.stats.feat[feat] > 1 ? `<p class="flair" title="${sLevel(global.stats.feat[feat])} ${loc(baseIcon)}"><svg class="star${global.stats.feat[feat]}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox(baseIcon)}" xml:space="preserve">${svgIcons(baseIcon)}</svg></p>` : '';
                if (feat === 'easter'){
                    let egg = easterEgg(4,14);
                    if (egg.length > 0){
                        star = egg;
                    }
                }
                achieve.append($(`<b-tooltip :label="feat('${feat}')" position="is-bottom" size="is-small" animated><div class="achievement"><span class="has-text-danger">${feats[feat].name}</span><span>${feats[feat].desc}</span>${star}</div></b-tooltip>`));
            }
        });
    }

    let trick = trickOrTreat(5,12,false);
    achieve.prepend(`<div class="has-text-warning">${loc("achieve_draw_achieve_earned",[earned,total])}${trick}</div>`);

    vBind({
        el: '#achievePanel',
        methods: {
            flair(flair){
                return achievements[flair].flair;
            },
            feat(flair){
                return feats[flair].flair;
            }
        }
    });

    if (fool && !global.stats.feat['fool']){
        $(`#thefool`).on('mouseover',function(){
            if (global.race.universe === 'micro'){
                unlockFeat('fool',true);
            }
            else {
                unlockFeat('fool');
            }
            drawAchieve();
        });
    }
}

export function challengeIcon(){
    let a_level = alevel();

    if ($('#topBar span.flair')){
        clearElement($('#topBar span.flair'),true);
    }
    let egg = easterEgg(1,14);
    if (egg.length > 0){
        $('#topBar .planet').after($(egg));
    }
    if (a_level > 1 && $('#topBar .planet .flair').length === 0){
        if (egg.length === 0){
            let bIcon = getBaseIcon('topbar','challenge');
            $('#topBar .planet').after(`<span class="flair"><svg class="star${a_level}" version="1.1" x="0px" y="0px" width="16px" height="16px" viewBox="${svgViewBox(bIcon)}" xml:space="preserve">${svgIcons(bIcon)}</svg></span>`);
        }

        let desc = '';
        if (global.race['no_plasmid']){ desc += `<div>${loc('evo_challenge_plasmid')}</div>`; }
        if (global.race['weak_mastery']){ desc += `<div>${loc('evo_challenge_mastery')}</div>`; }
        if (global.race['no_trade']){ desc += `<div>${loc('evo_challenge_trade')}</div>`; }
        if (global.race['no_craft']){ desc += `<div>${loc('evo_challenge_craft')}</div>`; }
        if (global.race['no_crispr']){ desc += `<div>${loc('evo_challenge_crispr')}</div>`; }
        if (global.race['nerfed']){ desc += `<div>${loc('evo_challenge_nerfed')}</div>`; }
        if (global.race['badgenes']){ desc += `<div>${loc('evo_challenge_badgenes')}</div>`; }

        if (desc.length > 0){
            $('#topBar .planetWrap .flair').append($(`<div class="is-sr-only"><div>Active Challenge Genes</div>${desc}</div>`));
        }

        popover('topbarPlanet',
            function(obj){
                let popper = $(`<div id="topbarPlanet"></div>`);
                obj.popper.append(popper);
                popper.append($(desc));
                return undefined;
            },
            {
                elm: `#topBar .planetWrap .flair`,
                classes: `has-background-light has-text-dark`
            }
        );
    }
}

export function alevel(){
    let a_level = 1;
    if (global.race['no_plasmid']){ a_level++; }
    if (global.race['no_trade']){ a_level++; }
    if (global.race['no_craft']){ a_level++; }
    if (global.race['no_crispr']){ a_level++; }
    if (global.race['weak_mastery']){ a_level++; }
    if (global.race['nerfed']){ a_level++; }
    if (global.race['badgenes']){ a_level++; }
    if (a_level > 5){
        a_level = 5;
    }
    return a_level;
}

export function checkAchievements(){
    const $ctx = {};
    checkAchievements_s1($ctx);

    checkAchievements_s2($ctx);
}

export function checkAdept(){
    let rank = 0;
    ['whitehole','eviltwin','canceled','heavy','pw_apocalypse'].forEach(function(x){
        if (global.stats.achieve[x]){
            rank = Math.max(global.stats.achieve[x].l, rank);
        }
    });

    rank = global.stats.feat['adept'] ? Math.min(rank, global.stats.feat['adept']) : 0;
    return rank;
}

export function checkBigAchievement(frag, name, num, level){
    if (!global.stats.achieve[name] || global.stats.achieve[name].l < level){
        let total = 0;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes(frag)){
                if (global.stats.achieve[key] && global.stats.achieve[key].l >= level) {
                    total++;
                }
            }
        }
        if (total >= num){
            unlockAchieve(name,false,level);
            if (global.race.universe !== 'standard'){
                switch (global.race.universe) {
                    case 'evil':
                        global.stats.achieve[name].e = undefined;
                        break;
                    case 'antimatter':
                        global.stats.achieve[name].a = undefined;
                        break;
                    case 'heavy':
                        global.stats.achieve[name].h = undefined;
                        break;
                    case 'micro':
                        global.stats.achieve[name].m = undefined;
                        break;
                    case 'magic':
                        global.stats.achieve[name].mg = undefined;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    if (global.race.universe !== 'standard') {
        checkBigAchievementUniverse(frag, name, num, level);
    }
}

export function checkBigAchievementUniverse(frag, name, num, level){
    let proceed = false;
    switch (global.race.universe) {
        case 'evil':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].e === "undefined" || global.stats.achieve[name].e < level){
                proceed = true;
            }
            break;
        case 'antimatter':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].a === "undefined" || global.stats.achieve[name].a < level){
                proceed = true;
            }
            break;
        case 'heavy':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].h === "undefined" || global.stats.achieve[name].h < level){
                proceed = true;
            }
            break;
        case 'micro':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].m === "undefined" || global.stats.achieve[name].m < level){
                proceed = true;
            }
            break;
        case 'magic':
            if (typeof global.stats.achieve[name] === "undefined" || typeof global.stats.achieve[name].mg === "undefined" || global.stats.achieve[name].mg < level){
                proceed = true;
            }
            break;
        default:
            break;
    }
    if (proceed) {
        let total = 0;
        const keys = Object.keys(achievements)
        for (const key of keys) {
            if (key.includes(frag)){
                switch (global.race.universe){
                    case 'evil':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['e'] && global.stats.achieve[key].e >= level){
                            total++;
                        }
                        break;
                    case 'antimatter':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['a'] && global.stats.achieve[key].a >= level){
                            total++;
                        }
                        break;
                    case 'heavy':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['h'] && global.stats.achieve[key].h >= level){
                            total++;
                        }
                        break;
                    case 'micro':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['m'] && global.stats.achieve[key].m >= level){
                            total++;
                        }
                        break;
                    case 'magic':
                        if (global.stats.achieve[key] && global.stats.achieve[key]['mg'] && global.stats.achieve[key].mg >= level){
                            total++;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        if (total >= num){
            unlockAchieve(name,false,level);
        }
    }
}

export function drawPerks(){
    clearElement($('#perksPanel'));
    let perks = $('#perksPanel');

    let hasPerk = false;
    Object.keys(perkList).forEach(function(perk){
        if (perkList[perk].hasOwnProperty('group')){
            let isactive = false;
            let gperk = $(`<div class="achievement"><span class="has-text-warning">${perkList[perk].name}</span></div>`);
            perkList[perk].group.forEach(function(subperk){
                if (subperk.active()){
                    isactive = true;
                    gperk.append($(`<div class="perk">${subperk.desc()}</div>`));
                }
            });
            if (isactive){
                hasPerk = true;
                perks.append(gperk);
            }
        }
        else {
            if (perkList[perk].active()){
                hasPerk = true;
                perks.append($(`<div class="achievement"><span class="has-text-warning">${perkList[perk].name}</span><span>${perkList[perk].desc()}</span></div>`));
            }
        }
    });
    if (!hasPerk){
        perks.append($(`<div class="has-text-caution">${loc(`perks_none`)}</div>`));
    }
}
