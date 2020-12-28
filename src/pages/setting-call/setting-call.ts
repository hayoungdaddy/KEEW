import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { NativeStorage } from '@ionic-native/native-storage';
/**
 * Generated class for the SettingCallPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-setting-call',
	templateUrl: 'setting-call.html',
})
export class SettingCallPage {
	private name1;
	private phone1;
	private name2;
	private phone2;
	private name3;
	private phone3;

	constructor(public navCtrl: NavController, public navParams: NavParams,private nativeStorage:NativeStorage) {
		nativeStorage.getItem("sosName1").then(name => {
			this.name1 = name;
		}).catch(err => {
			this.name1 = "";
		});
		nativeStorage.getItem("sosPhone1").then(phone => {
			this.phone1 = phone;
		}).catch(err => {
			this.phone1 = "";
		});
		nativeStorage.getItem("sosName2").then(name => {
			this.name2 = name;
		}).catch(err => {
			this.name2 = "";
		});
		nativeStorage.getItem("sosPhone2").then(phone => {
			this.phone2 = phone;
		}).catch(err => {
			this.phone2 = "";
		});
		nativeStorage.getItem("sosName3").then(name => {
			this.name3 = name;
		}).catch(err => {
			this.name3 = "";
		});
		nativeStorage.getItem("sosPhone3").then(phone => {
			this.phone3 = phone;
		}).catch(err => {
			this.phone3 = "";
		});
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad SettingCallPage');
	}

	save(){
		this.nativeStorage.setItem("sosName1", this.name1);
		this.nativeStorage.setItem("sosPhone1", this.phone1);
		this.nativeStorage.setItem("sosName2", this.name2);
		this.nativeStorage.setItem("sosPhone2", this.phone2);
		this.nativeStorage.setItem("sosName3", this.name3);
		this.nativeStorage.setItem("sosPhone3", this.phone3);
		this.navCtrl.pop();
	}

	back(){
		this.navCtrl.pop();
	}
}
