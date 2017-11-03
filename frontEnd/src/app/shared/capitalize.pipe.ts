import {Pipe} from "@angular/core";
import {PipeTransform} from "@angular/core";

// è stato necessario creare questo filtro in quanto il locale dei mesi di Angular renderizza minuscolo il nome del mese della data in input.
@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform {

    transform(value:any, allWords: boolean) {
        if (value)
            return allWords ? value.replace(/\b\w/g, symbol => symbol.toLocaleUpperCase()) : value.charAt(0).toUpperCase() + value.slice(1);
        return value;
    }
}
