import { message_filters, message_logs, global } from '../core/vars.js';

export function initMessageQueue(filters){
    filters = filters || message_filters;
    filters.forEach(function (filter){
        message_logs[filter] = [];
        if (!global.settings.msgFilters[message_logs.view].vis){
            $(`#msgQueueFilter-${message_logs.view}`).removeClass('is-active').attr('aria-disabled', 'false');
            $(`#msgQueueFilter-${filter}`).addClass('is-active').attr('aria-disabled', 'true');
            message_logs.view = filter;
        }
    });
}

export function messageQueue(msg,color,dnr,tags,reload){
    tags = tags || [];
    if (!reload && !tags.includes('all')){
        tags.push('all');
    }

    color = color || 'warning';

    if (tags.includes(message_logs.view)){
        let new_message = $('<p class="has-text-'+color+'"></p>').text(msg);
        $('#msgQueueLog').prepend(new_message);
        if ($('#msgQueueLog').children().length > global.settings.msgFilters[message_logs.view].max){
            $('#msgQueueLog').children().last().remove();
        }
    }
    tags.forEach(function (tag){
        message_logs[tag].unshift({ msg: msg, color: color });
        if (message_logs[tag].length > global.settings.msgFilters[tag].max){
            message_logs[tag].pop();
        }
    });

    if (!dnr){
        tags.forEach(function (tag){
            if (global.lastMsg[tag]){
                global.lastMsg[tag].unshift({ m: msg, c: color });
                if (global.lastMsg[tag].length > global.settings.msgFilters[tag].save){
                    global.lastMsg[tag].splice(global.settings.msgFilters[tag].save);
                }
            }
        });
    }
}
