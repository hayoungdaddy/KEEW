import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportListPage } from './report-list';

@NgModule({
  declarations: [
    ReportListPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportListPage),
  ],
})
export class ReportListPageModule {}
