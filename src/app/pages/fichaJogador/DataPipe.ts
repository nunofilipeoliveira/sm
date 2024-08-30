import { Pipe, PipeTransform  } from '@angular/core';
@Pipe({
  name: 'data',
  standalone: true,
})
export class DataPipe implements PipeTransform {
  transform(value: number): string {

    let tmpData:string=value.toString();
    let tmpData2:string=tmpData.substring(0,4)+'-'+tmpData.substring(4,6)+'-'+tmpData.substring(6,8)
    return tmpData2;
  }
}
