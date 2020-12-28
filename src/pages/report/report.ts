import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ActionSheetController, Events } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { Device } from '@ionic-native/device';
import { NativeStorage } from '@ionic-native/native-storage';

/**
 * Generated class for the ReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-report',
	templateUrl: 'report.html',
})
export class ReportPage {
	private data;

	private city;
	private region;
	private selectCity;
	private selectRegion;
	private base64File;
	private imgsrc="assets/imgs/btn_add.png";

	private images = [];
	private scale = 0;

	private selScale = ['', '', '', '', '', '', '', '', '', ''];

	private useGPS;

	constructor(
		public navCtrl: NavController,
		private events: Events,
		public actionSheetCtrl: ActionSheetController,
		private camera: Camera,
		private loadingCtrl: LoadingController,
		private geolocation: Geolocation, 
		public navParams: NavParams,
		private http: HTTP,
		private alertCtrl: AlertController, 
		private singleton: SingletonProvider,
		private device: Device,
		private nativeStorage: NativeStorage) 
	{
		this.data = navParams.get('data');
		console.log(this.data);
	}

	selectScale(idx) {
		this.scale = idx + 1;
		this.selScale = ['', '', '', '', '', '', '', '', '', ''];
		this.selScale[idx-1] = "active";
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ReportPage');

		this.nativeStorage.getItem('settings').then( data => { 
			this.useGPS = data.useGPS;

			if(!this.useGPS)
			{
				alert("위치정보 사용 동의가 필요합니다.");
				this.navCtrl.pop();
			}
		});

		this.getCityList();
		this.curLoc();
	}

	getCityList() {
		this.http.post(this.singleton.apiUrl + '/regiondb', {}, {}).then(data => {
			let resp = JSON.parse(data.data);
			if(resp.status == 1) {
				this.city=resp.city;
				this.region=resp.region;
				console.log(this.city);
				console.log(this.region);
				this.selectCity=this.city[0];
				this.selectRegion=this.region[0];
			}
		}).catch(error => {
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
		});
	}

	changeCity(regionName) {
		this.region=[];
		this.http.post(this.singleton.apiUrl + '/regiondb', {city:this.selectCity}, {}).then(data => {
			let resp = JSON.parse(data.data);
			if(resp.status == 1) {
				this.region = resp.region;
				console.log(this.region);

				if(regionName != "") this.selectRegion = regionName;
				else if(this.selectRegion == "") this.selectRegion = this.region[0];
			}
		}).catch(error => {
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
		});
	}

	curLoc() {
		this.singleton.loading = this.loadingCtrl.create({
			content: '현재 위치를 찾는중입니다.'
		});
		this.singleton.loading.present();
		this.geolocation.getCurrentPosition().then((resp) => {
			let headers = {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'KakaoAK 1cd149aaa862f47467792a6257f7afcd'
			};
			let url = 'https://dapi.kakao.com/v2/local/geo/coord2address.json?x='+resp.coords.longitude+'&y='+resp.coords.latitude+'&input_coord=WGS84';
			this.http.get(url,{},headers).then((data) => {
				// console.log(data.data);
				let resp = JSON.parse(data.data);
				// console.log(resp.documents[0]);

				console.log("REPORTS.TS :: curLoc response data");
				console.log(resp);

				if(resp.documents[0] == undefined) {
					alert("위치정보를 가져오는데 실패했습니다.");
					this.singleton.loading.dismiss();
					this.navCtrl.pop();
					return;
				}

				let cityName = resp.documents[0].address.region_1depth_name;
				let regionName = resp.documents[0].address.region_2depth_name;

				this.city = [cityName];
				this.region = [regionName];

				this.selectCity = cityName;
				this.selectRegion = regionName;
				this.singleton.loading.dismiss();
			}).catch((error) => {
				console.log(error);
				alert("위치정보를 가져오는데 실패했습니다.");
				this.singleton.loading.dismiss();
				this.navCtrl.pop();          
			});
		}).catch((error) => {
			alert("위치정보를 가져오는데 실패했습니다.");
			this.singleton.loading.dismiss();
			this.navCtrl.pop();
			console.log('Error getting location', error);
		});
	}

	addFile() {
		let actionSheet = this.actionSheetCtrl.create({
			title: '파일첨부',
			buttons: [
			{
				text: '카메라',
				handler: () => {
					const options: CameraOptions = {
						quality: 100,
						destinationType: this.camera.DestinationType.DATA_URL,
						encodingType: this.camera.EncodingType.JPEG,
						mediaType: this.camera.MediaType.PICTURE, 
						targetWidth: 150
					}
					
					this.camera.getPicture(options).then((imageData) => {
						let base64Image = 'data:image/jpeg;base64,' + imageData;
						this.images.push(base64Image);

					}, (err) => {
					});
				}
			},
			{
				text: '갤러리',
				handler: () => {
					const options: CameraOptions = {
						quality: 100,
						destinationType: this.camera.DestinationType.DATA_URL,
						encodingType: this.camera.EncodingType.JPEG,
						sourceType: this.camera.PictureSourceType.PHOTOLIBRARY, 
						targetWidth: 150
					}
				
					this.camera.getPicture(options).then((imageData) => {
						let base64Image = 'data:image/jpeg;base64,' + imageData;
						console.log(base64Image);

						this.images.push(base64Image);

					}, (err) => {
					});
				}
			},
			{
				text: '취소',
				handler: () => {
					console.log('Cancel clicked');
				}
			}
		]
		});
	
		actionSheet.present();
	}

	delFile(index) {
		this.images.splice(index, 1);
	}

	report() {
		if(this.scale < 1) {
			alert("진도 등급을 선택해주세요.");
			return;
		}

		if(this.selectCity == "" || this.selectRegion == "") {
			alert("지역이 선택되지 않았습니다.");
			return;      
		}

		let formData = {
			uuid: this.device.uuid, 
			evid: this.data.evid, 
			scale: this.scale, 
			city: this.selectCity, 
			region: this.selectRegion, 
			images: this.images
		};

		this.http.post(this.singleton.apiUrl + '/report', formData, {}).then(data => {
			let resp = JSON.parse(data.data);
			if(resp.status == 1) {
				console.log("성공");
				alert("제보하기가 완료되었습니다.");
				this.navCtrl.pop();
			} else {
				console.log("실패");
				alert("제보하기에 실패했습니다.");
			}
		}).catch(error => {
			alert("제보하기에 실패했습니다.");
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
		});
	}

	back() {
		this.navCtrl.pop()
	}
}