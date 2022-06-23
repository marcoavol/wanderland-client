import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConvertToUnitPipe } from './convert-to-unit.pipe';

@NgModule({
  declarations: [
    ConvertToUnitPipe,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ConvertToUnitPipe,
  ]
})
export class UtilsModule { }
