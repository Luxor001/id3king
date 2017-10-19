import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'time' })
export class MinutesToHoursPipe implements PipeTransform {
  transform(minutes: number) {
    var hours = Math.floor(minutes / 60);
    return hours + "h " + minutes % 60 + "m";
  }
}
