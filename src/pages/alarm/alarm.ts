import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Device } from '@ionic-native/device';
import { NativeStorage } from '@ionic-native/native-storage';
import { FCM } from '@ionic-native/fcm';
import { SingletonProvider } from '../../providers/singleton/singleton';

/**
 * Generated class for the AlarmPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  	selector: 'page-alarm',
  	templateUrl: 'alarm.html',
})

export class AlarmPage {
	private dateStr: string;
	private settings = {
		useNoti: false, 
		useGPS: false
	};
	private ori_useNoti: false;
	private ori_useGPS: false;

	constructor(public navCtrl: NavController, public navParams: NavParams, private http: HTTP, private device:Device, 
		private nativeStorage: NativeStorage, private fcm: FCM, private singleton:SingletonProvider) {
			console.log('ionViewDidLoad AlarmPage 1');
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad AlarmPage 2');
		this.nativeStorage.getItem('settings').then( data => { 
			this.ori_useNoti = data.useNoti;
			this.ori_useGPS = data.useGPS;
			this.settings.useNoti = data.useNoti;
			this.settings.useGPS = data.useGPS;
		});
	}

	save() {
		var date = new Date();
		this.dateStr = date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 "
			+ this.fn_leadingZeros(date.getHours(), 2) + ":" + this.fn_leadingZeros(date.getMinutes(), 2) + ":" 
			+ this.fn_leadingZeros(date.getSeconds(), 2);

		if(this.ori_useNoti != this.settings.useNoti)
		{
			if(this.settings.useNoti)
			{
				this.fcm.subscribeToTopic('ver2');
				this.nativeStorage.setItem("terms2time", "동의 날짜 : " + this.dateStr);
			}
			else
			{
				this.fcm.unsubscribeFromTopic('ver2');
				this.nativeStorage.setItem("terms2time", "거부 날짜 : " + this.dateStr);
			}
		}

		if(this.ori_useGPS != this.settings.useGPS)
		{
			if(this.settings.useGPS)
			{
				this.nativeStorage.setItem("terms3time", "동의 날짜 : " + this.dateStr);
			}
			else
			{
				this.nativeStorage.setItem("terms3time", "거부 날짜 : " + this.dateStr);
			}
		}

		this.nativeStorage.setItem('settings', this.settings);
		this.navCtrl.pop();
	}

	fn_leadingZeros(n, digits) {
		var zero = '';
		n = n.toString();
		if (n.length < digits) {
			for (var i = 0; i < digits - n.length; i++) { 
				zero += '0'; 
			}
		}
		return zero + n;
	}

	back() {
		this.navCtrl.pop();
	}
}
