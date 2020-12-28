import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListFilterPage } from './list-filter';

@NgModule({
  declarations: [
    ListFilterPage,
  ],
  imports: [
    IonicPageModule.forChild(ListFilterPage),
  ],
})
export class ListFilterPageModule {}
