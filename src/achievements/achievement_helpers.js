import { global } from '../core/vars.js';
import { clearElement } from '../functions/dom_helpers.js';
import { easterEgg, getBaseIcon, svgViewBox, svgIcons } from '../functions/icons_easter_eggs.js';
import { loc } from '../core/locale.js';
import { popover } from '../functions/popover.js';

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
