import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dataBr', standalone: true })
export class DataBrPipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    if (!iso) {
      return '';
    }
    const [ano, mes, dia] = iso.split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
  }
}
