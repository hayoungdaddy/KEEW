import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';

import { FCM } from '@ionic-native/fcm';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeStorage } from '@ionic-native/native-storage';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { HTTP } from '@ionic-native/http';
import { Device } from '@ionic-native/device';
import { TermsPage } from '../pages/terms/terms';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SingletonProvider } from '../providers/singleton/singleton';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
    
@Component({
	templateUrl: 'app.html'
})

export class MyApp {
	@ViewChild(Nav) nav:Nav;
	rootPage:any = HomePage;

	private currentLatitude: number;
	private currentLongitude: number;

	constructor(platform: Platform, private singleton:SingletonProvider, private screenOrientation: ScreenOrientation,
		private alertCtrl: AlertController, private http:HTTP, private device:Device, splashScreen: SplashScreen, 
		private fcm: FCM, private geolocation: Geolocation, private nativeStorage: NativeStorage, private sqlite: SQLite, 
		private statusBar: StatusBar, private ga: GoogleAnalytics) {
		
		platform.ready().then(() => {
			splashScreen.hide();
			this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
			this.ga.startTrackerWithId('UA-133191757-1').then(() => {
				console.log('UA-133191757-1');
				this.ga.debugMode();
				this.ga.setAllowIDFACollection(true);        
			}).catch(e => console.log('Error starting GoogleAnalytics', e));      

			console.log("uuid : " + device.uuid)

			this.geolocation.getCurrentPosition().then((resp) => {
				this.currentLatitude = resp.coords.latitude;
				this.currentLongitude = resp.coords.longitude;
			});

			this.sqlite.create({
				name: 'data.db',
				location: 'default'
			}).then((db: SQLiteObject) => {
				let sql  = "CREATE TABLE IF NOT EXISTS earthquake ("
					+ "idx INTEGER PRIMARY KEY autoincrement, "
					+ "title VARCHAR, "
					+ "message VARCHAR, "
					+ "lat DOUBLE, "
					+ "lng DOUBLE, "
					+ "time INTEGER, "
					+ "date DATE, "
					+ "mag INTEGER, "
					+ "eID VARCHAR, "
					+ "eREV INTEGER, "
					+ "eCancel INTEGER, "
					+ "nowTime INTEGER, "
					+ "currentLatitude DOUBLE, "
					+ "currentLongitude DOUBLE "
					+ ")";
				console.log(sql);

				db.executeSql(sql, []).then(() => 
					console.log("TABLE CREATE SUCCESS"))
				.catch(e => {
					console.log("TABLE CREATE ERROR");
					console.log(e);
				});
			}).catch(e => console.log(e));

			this.checkSettings();
		
			this.fcm.getToken().then(token => {
				console.log("FCM Token : "+token);
				singleton.registrationids=token;
				this.nativeStorage.getItem('firstExe').then(data => {
					if(data == 1) {
						this.http.post(this.singleton.apiUrl + '/userRegister', {uuid:this.device.uuid,registrationids:data}, {}).then(data => {
							let resp = JSON.parse(data.data);
							if(resp.status == 1) {
								console.log("회원등록 성공")
							} else {
								console.log("회원등록 실패")
							}
						}).catch(error => {
							console.log(error.status);
							console.log(error.error); 
							console.log(error.headers);
						});
					}
				}).catch(err => {
					this.nav.setRoot(TermsPage);
				})
			});
      
			this.fcm.onNotification().subscribe(data => {
				this.geolocation.getCurrentPosition().then((resp) => {
          			this.currentLatitude = resp.coords.latitude;
          			this.currentLongitude = resp.coords.longitude;
        		});

				if(data.wasTapped) {
					console.log("Received in background");
				} else {
					console.log("Received in foreground");
				};

				this.nav.setRoot(HomePage, {'action': 'earthquake', 'data': data});
				this.savePush(data);

        		console.log(data);
			});
		});
	}

	checkSettings() {
		this.nativeStorage.getItem('settings').then(data => {
			let isUse = false;
			if(data.useNoti) isUse = true;

			if(data.useNoti) {
				this.fcm.subscribeToTopic('ver2');      
			} else {
				this.fcm.unsubscribeFromTopic('ver2');
			}
		}, error => {
			this.fcm.subscribeToTopic('ver2');
		});    
	}

	savePush(data) {
		this.sqlite.create({
			name: 'data.db',
			location: 'default'
		}).then((db: SQLiteObject) => {
			let time = new Date(data.time * 1000);
			let date = time.getFullYear() + "-"
				+ this.padLeft((time.getMonth() + 1), 2, '0') + "-"
				+ this.padLeft(time.getDate(), 2, '0');

			let sql = "INSERT INTO earthquake "
				+ "(title, message, lat, lng, time, date, mag, eID, eREV, eCancel, nowTime, currentLatitude, currentLongitude) "
				+ " VALUES "
				+ "("
				+ "'" + data.title + "', "
				+ "'" + data.message + "', "
				+ data.lat + ", "
				+ data.lng + ", "
				+ data.time + ", "
				+ "'" + date + "', "
				+ data.mag + ", "
				+ "'" + data.eID + "', "
				+ data.eREV + ", "
				+ data.eCancel + ", "
				+ new Date().getTime() / 1000 + ", "
				+ this.currentLatitude + ", "
				+ this.currentLongitude 
				+ ")";
  
      		console.log(sql);

			db.executeSql(sql, []).then(() => 
				console.log("PUSH DATA SAVE COMPLETE"))
        	.catch(e => {
				console.log("PUSH DATA SAVE ERROR");
				console.log(e);
        	});
    	}).catch(e => console.log(e));
	}

	padLeft(str, len, pad) {
		return Array(len-String(str).length+1).join(pad||'0') + str;
	}
}
