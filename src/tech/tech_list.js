
// Gabungkan data statis (techs_data.js) dengan logika per entri. Key harus persis sama di kedua sisi.
export const techs = {};

export const techPath = {
    standard: ['primitive', 'discovery', 'civilized', 'industrialized', 'globalized', 'early_space', 'deep_space', 'interstellar', 'intergalactic', 'dimensional','existential'],
    truepath: ['primitive', 'discovery', 'civilized', 'industrialized', 'globalized', 'early_space', 'deep_space', 'solar', 'tauceti'],
};

export function techList(path){
    if (path){
        let techList = {};
        Object.keys(techs).forEach(function(t){
            if (techPath[path].includes(techs[t].era) || techs[t].hasOwnProperty('path')){
                if (!techs[t].hasOwnProperty('path') || (techs[t].hasOwnProperty('path') && techs[t].path.includes(path))){
                    techList[t] = techs[t];
                }
            }
        });
        return techList;
    }
    return techs;
}
