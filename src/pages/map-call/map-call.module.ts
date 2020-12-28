import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapCallPage } from './map-call';

@NgModule({
  declarations: [
     MapCallPage,
  ],
  imports: [
    IonicPageModule.forChild(MapCallPage),
  ],
})
export class MapCallPageModule {}
