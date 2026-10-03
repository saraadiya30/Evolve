import { global } from './vars.js';
import { loc } from './locale.js';

// Dipisah dari tech.js karena dipakai di level modul oleh techs_part2.js (title/desc dievaluasi saat load),
// sehingga tidak boleh menunggu tech.js selesai dievaluasi. tech.js me-re-export biar importer lama tetap jalan.
export function swissKnife(cheeseOnly,cheeseList){
    let cheeses = [
        'swiss','gouda','cheddar','brie','feta','ricotta','goat','mascarpone','bleu','colby_jack','camembert','gorgonzola',
        'mozzarella','roquefort','provolone','monterey_jack','muenster','cambozola','jarlsberg','bocconcini','cantal',
        'emmental','havarti','burrata','cottage','asiago','wensleydale','pepper_jack','queso_blanco','pecorino','raclette',
        'fontina','reblochon','port_salut','brillat_savarin','cream','stilton','taleggio','manchego','edam','gruyeye',
        'parmigiano_reggiano','epoisses','comte','caciocavallo','teleme','grana_padano','chaumes','morbier','halloumi',
        'lancashire','bleu_de_gex','fourme_d_ambert','fromage_blanc','red_leicester','bleu_d_auvergne','pont_l_eveque',
        'jl_grubb','castello_blue','wagasi','ayibe','caravane','limburger','herve','kashkaval','sirene','paski_sir','akkawi',
        'olomoucke_syrecky','anari','danbo','hermelín','trappista','stinking_bishop','banbury','sulguni','hofoingi',
        'urda','golka','rokpol','telemea','bryndza','parenica','kackavalj','liptauer','greve','korbaciky','herrgardsost',
        'vasterbottensost','mish','anejo','quesillo','nacho','reggianito','catupiry','queso_paipa','canastra','port_wine',
        'cados','brie_de_meaux'
    ];
    if (cheeseList){
        return cheeses;
    }
    let type = (global.stats.hasOwnProperty('reset') ? global.stats.reset : 0) % cheeses.length;
    return cheeseOnly ? loc(`cheese_${cheeses[type]}`) : loc(`tech_swiss_bank`,[loc(`cheese_${cheeses[type]}`)]);
}
