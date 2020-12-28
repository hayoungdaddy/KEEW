import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapTablePage } from './map-table';

@NgModule({
  declarations: [
    MapTablePage,
  ],
  imports: [
    IonicPageModule.forChild(MapTablePage),
  ],
})
export class MapTablePageModule {}
