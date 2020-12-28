import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { HTTP } from '@ionic-native/http';
import { NativeStorage } from '@ionic-native/native-storage';
import { HomePage } from '../home/home';
import { SingletonProvider } from '../../providers/singleton/singleton';

/**
 * Generated class for the TermsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-terms',
	templateUrl: 'terms.html',
})

export class TermsPage {
	private chk1 = false;
	private chk2 = false;
	private chk3 = false;
	private chk4 = false;
	private dateStr: string;

	private settings = {
		useNoti: false, 
		useGPS: false
	};
	
	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		private device: Device,
		private singleton: SingletonProvider, 
		private http: HTTP, 
		private nativeStorage: NativeStorage,
		private alertCtrl: AlertController) 
	{
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad TermsPage');
	}

  	start() {
		var date = new Date();
		this.dateStr = date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 "
			+ this.fn_leadingZeros(date.getHours(), 2) + ":" + this.fn_leadingZeros(date.getMinutes(), 2) + ":" 
			+ this.fn_leadingZeros(date.getSeconds(), 2);
	
		this.http.post(this.singleton.apiUrl + '/userRegister', { 
			uuid: this.device.uuid, registrationids: this.singleton.registrationids }, {}).then(data => {
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

		if(this.chk1) 
		{
			this.nativeStorage.setItem("terms1time", "동의 날짜 : " + this.dateStr);

			if(this.chk2) 
			{
				this.settings.useNoti = true;
				this.nativeStorage.setItem("terms2time", "동의 날짜 : " + this.dateStr);
			}
			else 
			{
				this.settings.useNoti = false;
				this.nativeStorage.setItem("terms2time", "거부 날짜 : " + this.dateStr);
			}

			if(this.chk3) 
			{
				this.settings.useGPS = true;
				this.nativeStorage.setItem("terms3time", "동의 날짜 : " + this.dateStr);
			}
			else 
			{
				this.settings.useGPS = false;
				this.nativeStorage.setItem("terms3time", "거부 날짜 : " + this.dateStr);
			}

			this.nativeStorage.setItem('firstExe',"1");
			this.nativeStorage.setItem('settings', this.settings);
			this.messagePopup();
		} 
		else {
			let alert=this.alertCtrl.create( {
				subTitle: '약관에 동의해 주세요.',
				buttons: [{
				text: '확인',
					handler: () => {}
				},]
			});
			alert.present();
    	}
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

	termsCheck(no) {
		switch(no) {
		case 1:
			if(this.chk2 && this.chk3 && !this.chk1) {
				this.chk4 = true;
			} else {
				this.chk4 = false;
			}
			break;
		case 2:
			if(this.chk1 && this.chk3 && !this.chk2) {
				this.chk4 = true;
			} else {
				this.chk4 = false;
			}
			break;
		case 3:
			if(this.chk2 && this.chk1 && !this.chk3) {
				this.chk4 = true;
			} else {
				this.chk4 = false;
			}
			break;
		}
  	}

  	messagePopup() {
		this.nativeStorage.getItem('terms2time').then(data => {
			if(this.chk2) {
				let alert = this.alertCtrl.create( {
					title:'지진 알림 수신 동의 안내',
					message: '전송자 : 한국지질자원연구원(KIGAM)<br><br>수신'+data+'<br><br>처리내용 : 수신동의 처리완료',
					buttons: [{
						text: '확인',
						handler: () => {
							this.navCtrl.setRoot(HomePage);
						}
					},]
				});
				alert.present();
			} else {
				let alert = this.alertCtrl.create( {
					title:'지진 알림 수신 동의 안내',
					message: '전송자 : 한국지질자원연구원(KIGAM)<br><br>수신'+data+'<br><br>처리내용 : 수신거부 처리완료',
					buttons: [{
						text: '확인',
						handler: () => {
							this.navCtrl.setRoot(HomePage);
						}
					},]
				});
				alert.present();
			}
		});
  	}

	allCheck() {
		if(this.chk4 == false) {
			this.chk1 = true;
			this.chk2 = true;
			this.chk3 = true;
		} else {
			this.chk1 = false;
			this.chk2 = false;
			this.chk3 = false;
		}
	}
}