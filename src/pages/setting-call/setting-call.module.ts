import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingCallPage } from './setting-call';

@NgModule({
  declarations: [
     SettingCallPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingCallPage),
  ],
})
export class SettingCallPageModule {}
