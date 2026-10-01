import { loc } from '../../core/locale.js';
import { payCrispr } from '../arpa_projects.js';
import { hooks } from '../../core/registries.js';

export const genePoolPart3 = {
    essence_absorber: {
        id: 'genes-essence_absorber',
        title: loc('arpa_genepool_essence_absorber_title'),
        desc: loc('arpa_genepool_essence_absorber_desc'),
        reqs: { blood: 2 },
        grant: ['blood',3],
        cost: {
            Plasmid(){ return 7500; },
            Phage(){ return 250; },
            Artifact(){ return 1; }
        },
        action(){
            if (payCrispr('essence_absorber')){
                return true;
            }
            return false;
        },
        post(){
            hooks.blood();
        }
    },
};
