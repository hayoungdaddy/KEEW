import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SettingCallPage } from '../setting-call/setting-call';
import { AlarmPage } from '../alarm/alarm';
import { NativeStorage } from '@ionic-native/native-storage';
import { MapTablePage } from '../map-table/map-table';

/**
 * Generated class for the SettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-setting',
	templateUrl: 'setting.html',
})

export class SettingPage {
	private terms1time: string;
	private terms2time: string;
	private terms3time: string;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		private nativeStorage:NativeStorage) 
	{
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad SettingPage');
	}

	ionViewDidEnter() {
		this.nativeStorage.getItem('terms1time').then(data => {
			this.terms1time = data;
		})

		this.nativeStorage.getItem('terms2time').then(data => {
			this.terms2time = data;
		})

		this.nativeStorage.getItem('terms3time').then(data => {
			this.terms3time = data;
		})
	}

	alarmPage() {
		this.navCtrl.push(AlarmPage);
	}

	SettingCallPage() {
		this.navCtrl.push(SettingCallPage);
	}

	MapTablePage() {
		this.navCtrl.push(MapTablePage);
	}

	back() {
		this.navCtrl.pop();
	}
}
