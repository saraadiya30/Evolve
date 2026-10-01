import { S_functions as S } from '../core/registries.js';
import { eventActive } from './event_dates.js';
import { global } from '../core/vars.js';
import { clearElement } from './dom_helpers.js';

// Fungsi-fungsi dipindah dari functions.js (urutan sumber dipertahankan). functions.js tetap mengekspor ulang nama yang tadinya ter-ekspor.


export function popover(id,content,opts){
    if (!opts){ opts = {}; }
    if (!opts.hasOwnProperty('elm')){ opts['elm'] = '#'+id; }
    if (!opts.hasOwnProperty('bind')){ opts['bind'] = true; }
    if (!opts.hasOwnProperty('unbind')){ opts['unbind'] = true; }
    if (!opts.hasOwnProperty('placement')){ opts['placement'] = 'bottom'; }
    if (opts['bind']){
        $(opts.elm).on(opts['bind_mouse_enter'] ? 'mouseenter' : 'mouseover',function(){
            if (S.popperRef || $(`#popper`).length > 0){
                clearPopper();
            }
            let wide = opts['wide'] ? ' wide' : '';
            let classes = opts['classes'] ? opts['classes'] : `has-background-light has-text-dark pop-desc`;
            let popper = $(`<div id="popper" class="popper${wide} ${classes}" data-id="${id}"></div>`);
            if (opts['attach']){
                $(opts['attach']).append(popper);
            }
            else {
                $(`#main`).append(popper);
            }
            if (content){
                popper.append(typeof content === 'function' ? content({ this: this, popper: popper }) : content);
            }

            S.popperRef = Popper.createPopper(opts['self'] ? this : $(opts.elm)[0],
                document.querySelector(`#popper`),
                {
                    placement: opts['placement'],
                    modifiers: [
                        {
                            name: 'flip',
                            enabled: true,
                        },
                        {
                            name: 'offset',
                            options: {
                                offset: opts['offset'] ? opts['offset'] : [0, 0],
                            },
                        }
                    ],
                }
            );

            popper.show();
            if (opts.hasOwnProperty('in') && typeof opts['in'] === 'function'){
                opts['in']({ this: this, popper: popper, id: `popper` });
            }

            if (eventActive('firework') && global[global.race['cataclysm'] || global.race['orbit_decayed'] ? 'space' : 'city'].firework.on > 0){
                $(popper).append(`<span class="pyro"><span class="before"></span><span class="after"></span></span>`);
            }
        });
    }
    if (opts['unbind']){
        if ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/ && global.settings.touch) ? true : false){
            $(opts.elm).on('touchend',function(e){
                clearPopper();
                if (opts.hasOwnProperty('out') && typeof opts['out'] === 'function'){
                    opts['out']({ this: this, popper: $(`#popper`), id: `popper`});
                }
            });
        }
        else {
            $(opts.elm).on(opts['bind_mouse_enter'] ? 'mouseleave' : 'mouseout',function(){
                clearPopper();
                if (opts.hasOwnProperty('out') && typeof opts['out'] === 'function'){
                    opts['out']({ this: this, popper: $(`#popper`), id: `popper`});
                }
            });
        }
    }
}

export function clearPopper(id){
    if (id && $(`#popper`).data('id') !== id){
        return;
    }
    $(`#popper`).hide();
    if (S.popperRef){
        S.popperRef.destroy();
        S.popperRef = false;
    }
    clearElement($(`#popper`),true);
}
