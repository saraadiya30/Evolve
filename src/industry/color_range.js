// colorRange: interpolasi warna indikator industri. Modul daun tanpa dependensi.


export function colorRange(num,max,invert){
    if (num <= 0){
        return invert ? 'has-text-success' : 'has-text-danger';
    }
    else if (num >= max){
        return invert ? 'has-text-danger' : 'has-text-success';
    }
    else if (num <= max / 3){
        return invert ? 'has-text-info' : 'has-text-caution';
    }
    else if (num <= max * 0.66){
        return 'has-text-warning';
    }
    else if (num < max){
        return invert ? 'has-text-caution' : 'has-text-info';
    }
    else {
        return '';
    }
}
