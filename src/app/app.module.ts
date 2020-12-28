import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { ListPage } from '../pages/list/list';
import { ListFilterPage } from '../pages/list-filter/list-filter';
import { DetailPage } from '../pages/detail/detail';
import { ReportPage } from '../pages/report/report';
import { SettingPage } from '../pages/setting/setting';
import { SettingCallPage } from '../pages/setting-call/setting-call';
import { MapPage } from '../pages/map/map';
import { MapCallPage } from '../pages/map-call/map-call';
import { MapTablePage } from '../pages/map-table/map-table';
import { AlarmPage } from '../pages/alarm/alarm';
import { ReplayMapPage } from '../pages/replay-map/replay-map'
import { TermsPage } from '../pages/terms/terms';
import { ReportListPage } from '../pages/report-list/report-list'
import { GuidePage } from '../pages/guide/guide';

import { SingletonProvider } from '../providers/singleton/singleton';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { FCM } from '@ionic-native/fcm';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeAudio } from '@ionic-native/native-audio';
import { NativeStorage } from '@ionic-native/native-storage';
import { SQLite } from '@ionic-native/sqlite';
import { Media } from '@ionic-native/media';
import { HTTP } from '@ionic-native/http';
import { Device } from '@ionic-native/device';
import { CallNumber } from '@ionic-native/call-number';

import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { VideoPlayer } from '@ionic-native/video-player';

import { StreamingMedia } from '@ionic-native/streaming-media';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Camera } from '@ionic-native/camera';
import { Insomnia } from '@ionic-native/insomnia';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { InAppBrowser } from '@ionic-native/in-app-browser';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    ListFilterPage,
    DetailPage,
    ReportPage,
    SettingPage,
    SettingCallPage,
    MapPage,
    MapCallPage,
    MapTablePage,
    AlarmPage,
    ReplayMapPage,
    TermsPage,
    ReportListPage, 
    GuidePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FCM,
    Geolocation,
    NativeAudio,
    NativeStorage, 
    SQLite, 
    Media, 
    HTTP,
    Device,
    SingletonProvider,
    CallNumber,
    SocialSharing,
    PhotoViewer,
    StreamingMedia,
    VideoPlayer,
    ScreenOrientation,
    Camera,
    Insomnia,
    GoogleAnalytics, 
    InAppBrowser, 
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}