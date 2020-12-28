import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReplayMapPage } from './replay-map';

@NgModule({
  declarations: [
    ReplayMapPage,
  ],
  imports: [
    IonicPageModule.forChild(ReplayMapPage),
  ],
})
export class ReplayMapPageModule {}
