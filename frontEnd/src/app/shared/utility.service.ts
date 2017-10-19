import { Injectable } from '@angular/core';


@Injectable()
export class UtilityService {

  // funzione che espande (in altezza) l'elemento jquery passato come parametro in base allo spazio disponibile
  static resizeToParent(elementParam: any): any {
    var parentHeight = elementParam.parent().outerHeight();
    var offset = elementParam.offset().top - elementParam.parent().offset().top;
    var height = parentHeight - offset - 10;
    elementParam.height(height);
  }
}
