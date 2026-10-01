// Cari elemen lewat id TANPA membuat objek jQuery lewat parser selector ($('#id')) untuk elemen yang tidak ada.
// Di mid loop dicek ratusan tech/aksi per putaran, dan sebagian besar elemennya memang tidak sedang tampil (tab tertutup).
// Hasilnya sama dengan $('#' + id): objek jQuery berisi elemen itu, atau set kosong kalau tidak ada.
export function elementById(id){
    const el = document.getElementById(id);
    return el ? $(el) : $();
}

export function clearElement(elm,remove){
    elm.find('.vb').each(function(){
        try {
            $(this)[0].__vue__.$destroy();
        }
        catch(e){}
    });
    if (remove){
        try {
            elm[0].__vue__.$destroy();
        }
        catch(e){}
        elm.remove();
    }
    else {
        elm.empty();
    }
}

export function vBind(bind,action){
    action = action || 'create';
    if ($(bind.el).length > 0 && typeof $(bind.el)[0].__vue__ !== "undefined"){
        try {
            if (action === 'update'){
                $(bind.el)[0].__vue__.$forceUpdate();
            }
            else {
                $(bind.el)[0].__vue__.$destroy();
            }
        }
        catch(e){}
    }
    if (action === 'create'){
        new Vue(bind);
        $(bind.el).addClass('vb');
    }
}
