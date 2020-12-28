import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Thumbnail, AlertController, ActionSheetController } from 'ionic-angular';

//import { ListPage } from '../list/list';
import { MapTablePage } from '../map-table/map-table';

//import { HomePage } from '../home/home';
import { Geolocation } from '@ionic-native/geolocation';
//import { initDomAdapter } from '@angular/platform-browser/src/browser';
//import { DetailPage } from '../detail/detail';
import { NativeStorage } from '@ionic-native/native-storage';
import { CallNumber } from '@ionic-native/call-number';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Insomnia } from '@ionic-native/insomnia';

/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var daum: any;

@IonicPage()
@Component({
	selector: 'page-map',
	templateUrl: 'map.html',
})

export class MapPage {
	private circles; 
	private circlep; 
	private map;
	private markers=[];
	private radiusp;
	private radiuss;

	private myLat;
	private myLng;

	private pushData;

	private takenTime;
	private remainTime = 0;
	private distance;

	private mag;
	private startMag;
	private magStr;
	private message;

	private intervalTime = 0;
	private interval;

	private audio;

	private dialog=true;

	private warn=true;
	private warnInterval=true;

	private sosContacts=[];
	private cancelAdd=true;
	private useGPS;

	constructor(public navCtrl: NavController, private insomnia: Insomnia, private callNumber: CallNumber,
		private socialSharing: SocialSharing, public navParams: NavParams, private geolocation: Geolocation,
		private nativeStorage: NativeStorage, private alertCtrl: AlertController, 
		public actionSheetCtrl: ActionSheetController) {
    
		this.insomnia.keepAwake().then(
			() => console.log('success'),
			() => console.log('error')
		);
		this.audio = new Audio();
		this.audio.src = 'assets/sound/warning_cut.mp3';
		this.audio.load();
		this.audio.play();
		this.audio.addEventListener('timeupdate', function() {
		var buffer = .50
		if(this.currentTime > this.duration - buffer) {
			this.currentTime = 0
			this.play()
		}}, false);

		this.pushData = navParams.get('data');
		console.log(this.pushData);

		this.startMag=this.pushData.mag;
		this.message = this.pushData.message + "  규모 " + this.pushData.mag;
		
   		console.log(this.pushData)
	}

	ionViewWillUnload() {
		clearInterval(this.interval);
		this.interval = null;
		this.audio.pause();
	}

	ionViewDidLeave() {
		clearInterval(this.interval);
		this.interval = null;
		this.audio.pause();    
	}

	ionViewDidLoad() {
		this.nativeStorage.getItem('settings').then( data => { 
			this.useGPS = data.useGPS;

			if(!this.useGPS)
			{
				alert("위치정보 사용 동의가 필요합니다.");
				this.navCtrl.pop();
			}
		});

		console.log('ionViewDidLoad MapPage');
		for(let i=0;i<4;i++) {
			this.nativeStorage.getItem('sosName'+(i+1)).then(name => {
				if(name != "" && name != null) {
					this.nativeStorage.getItem('sosPhone'+(i+1)).then(phone => {
						this.sosContacts.push({
							text: name + "("+phone+")",
							handler:() => {
								this.callNumber.callNumber(phone,true);
							}
						})
					})
				}
			})
		}
    
		if(this.pushData.nowTime) { //리플레이
			this.takenTime = parseInt(this.pushData.nowTime) - parseInt(this.pushData.time);
			this.myLat = this.pushData.nowLat;
			this.myLng = this.pushData.nowLng;
			this.init();
		} else {
			this.takenTime = (new Date().getTime() / 1000) - parseInt(this.pushData.time)
			console.log(this.takenTime);
			this.geolocation.getCurrentPosition().then((resp) => {
				this.myLat = resp.coords.latitude;
				this.myLng = resp.coords.longitude;
				console.log(resp);
				this.init();
			}).catch((error) => {
				console.log('Error getting location', error);
			});      
		}
	}

	init() {
		this.loadMap(this.myLat, this.myLng, this.pushData.lat, this.pushData.lng);
	
		this.distance = this.calcDistance(this.myLat, this.myLng, this.pushData.lat, this.pushData.lng);
		console.log(this.distance);

		this.mag = this.calc_gal(this.startMag, this.distance);
		
		if(this.mag == 0) this.mag = 1;

		this.radiusp = this.takenTime * 5500;
		this.radiuss = this.takenTime * 3500;

		let remainTime = Math.floor( (this.distance/3500) - this.takenTime );
		if(remainTime < -5) this.remainTime = -5;
		else this.remainTime = remainTime;

		if(this.remainTime <= 0) {
			let alert=this.alertCtrl.create({
				subTitle: '이미 종료된 알림 입니다.',
				buttons: [{
					text: '확인',
					role: '확인',
					handler: () => {
						this.navCtrl.pop();
					}
				},]
			});
			alert.present();
		}

		this.interval = setInterval(() => {
			if(this.remainTime == 0) {	
				this.audio.pause();
			} else if(this.remainTime == -5) {
				document.getElementById('warning').removeAttribute('class');	
			} else if(this.remainTime == 10) {
				document.getElementById('remainTime').setAttribute('class', 'warn');
			} else if(this.remainTime < 10) {
				if(this.warnInterval) {
					this.warnInterval=false;
					setInterval(() => {
						if(this.remainTime > -5) {
							if(this.warn) document.getElementById('warning').setAttribute('class', 'warn');
							else document.getElementById('warning').removeAttribute('class');
						this.warn=!this.warn
						} else {
							document.getElementById('warning').removeAttribute('class');
							this.warn=false
						}
					},500)
				}
				if(this.audio.playbackRate != 2)
					this.audio.playbackRate = 2;
			}

			if(this.remainTime > -5) {
				//원 그리기
				this.radiusp += 55;
				this.radiuss += 35;
				this.drawP();
				this.drawS();

				//남은시간 표시
				this.intervalTime += 10;
				if(this.intervalTime == 1000) {
					this.intervalTime = 0;
				if(this.remainTime > -5)
					this.remainTime--;
				}          
			}
		}, 10);
	}

	loadMap(lat, lng, pLat, pLng) {
		var container = document.getElementById('map');

		var options = { //지도를 생성할 때 필요한 기본 옵션
			center: new daum.maps.LatLng(lat, lng), //지도의 중심좌표.
			level: 3 //지도의 레벨(확대, 축소 정도)
		};
      
    	this.map = new daum.maps.Map(container, options); //지도 생성 및 객체 리턴

		var img=[ '../assets/imgs/icon_marker_home.png','../assets/imgs/icon_marker_star.png'];
		var latitude=[lat,pLat];
		var longitude=[lng,pLng];
		var sizex=[24,20];
		var sizey=[37,20];

		var y;
		for(let i=0;i<2;i++) {
			if(i == 0) {
				y=sizey[i];
			} else {
				y=sizey[i]/2;
			}
			var imageSrc =img[i], // 마커이미지의 주소입니다    
			imageSize = new daum.maps.Size(sizex[i], sizey[i]), // 마커이미지의 크기입니다
			imageOption = {offset: new daum.maps.Point(sizex[i]/2,y)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
		
			// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
			var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption),
				markerPosition = new daum.maps.LatLng(latitude[i], longitude[i]); // 마커가 표시될 위치입니다
			
			// 마커를 생성합니다
			var marker = new daum.maps.Marker({
				map: this.map, 
				position: markerPosition, 
				image: markerImage // 마커이미지 설정 
			});

			this.markers.push(marker);
			this.markers[i].setMap(this.map);
		}
    
		var points = [
			new daum.maps.LatLng(lat, lng),
			new daum.maps.LatLng(pLat,pLng)
		];
    
		// 지도를 재설정할 범위정보를 가지고 있을 LatLngBounds 객체를 생성합니다
		var bounds = new daum.maps.LatLngBounds();   
		
		for(let i=0;i<points.length;i++) {
			bounds.extend(points[i]);
		}

		this.map.setBounds(bounds);

		let currentLevel = this.map.getLevel();
		this.map.setLevel(currentLevel + 1);

		let currentCenter = this.map.getCenter();
		this.map.setCenter(new daum.maps.LatLng(currentCenter.getLat() - 0.1, currentCenter.getLng()));    

		this.drawP();
		this.drawS();		
	}

	drawP() {//밖
		if(this.circlep)
			this.circlep.setMap(null);

		this.circlep = new daum.maps.Circle({
			center : new daum.maps.LatLng(this.pushData.lat, this.pushData.lng),  // 원의 중심좌표 입니다 
			radius: this.radiusp, // 미터 단위의 원의 반지름입니다 
			strokeWeight: 3, // 선의 두께입니다 
			strokeColor: '#0063b6', // 선의 색깔입니다
			strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
			fillOpacity: 0  // 채우기 불투명도 입니다   
		}); 
		
		// 지도에 원을 표시합니다 
		this.circlep.setMap(this.map); 
	}

	drawS() {//안
		if(this.circles)
			this.circles.setMap(null);

		this.circles= new daum.maps.Circle({
			center : new daum.maps.LatLng(this.pushData.lat, this.pushData.lng),  // 원의 중심좌표 입니다 
			radius: this.radiuss, // 미터 단위의 원의 반지름입니다 
			strokeWeight: 3, // 선의 두께입니다 
			strokeColor: '#ff5936', // 선의 색깔입니다
			strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
			fillOpacity: 0  // 채우기 불투명도 입니다   
		}); 
    
    	// 지도에 원을 표시합니다 
    	this.circles.setMap(this.map); 
  	}

	degreesToRadians(degrees) {
		return degrees * Math.PI / 180;
	}

	calcDistance(lat1, lon1, lat2, lon2) {
		var earthRadiusKm = 6371;
	
		var dLat = this.degreesToRadians(lat2 - lat1);
		var dLon = this.degreesToRadians(lon2 - lon1);
	
		lat1 = this.degreesToRadians(lat1);
		lat2 = this.degreesToRadians(lat2);
	
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		return (earthRadiusKm * c) * 1000;
	}

	calc_gal(mag, dist)
	{
		console.log("규모 : " + mag + " / " + "거리 : " + dist);

		dist = dist / 1000;

		mag = mag * 1;

		var _myGal = 0;

		if(dist <= 100) {
			if (dist < 10) dist = 10;

			_myGal = Math.exp(
				(0.1250737E+02 + 0.4874629E+00 * (mag - 6) + -0.2940726E-01 * Math.pow((mag - 6), 2) + 0.1737204E-01 * Math.pow((mag - 6), 3))
				+(-0.1928185E-02 + 0.2251016E-03 * (mag - 6) + -0.6378615E-04 * Math.pow((mag - 6), 2) + 0.6967121E-04 * Math.pow((mag - 6), 3)) * dist
				+(-0.5795112E+00 + 0.1138817E+00 * (mag - 6) + -0.1162326E-01 * Math.pow((mag - 6), 2) + -0.3646674E-02 * Math.pow((mag - 6), 3)) * Math.log(dist)
				+(-Math.log(dist) - 0.5 * Math.log(100))
			);
		} else {
			_myGal = Math.exp(
				(0.1250737E+02 + 0.4874629E+00 * (mag - 6) + -0.2940726E-01 * Math.pow((mag - 6), 2) + 0.1737204E-01 * Math.pow((mag - 6), 3))
				+(-0.1928185E-02 + 0.2251016E-03 * (mag - 6) + -0.6378615E-04 * Math.pow((mag - 6), 2) + 0.6967121E-04 * Math.pow((mag - 6), 3)) * dist
				+(-0.5795112E+00 + 0.1138817E+00 * (mag - 6) + -0.1162326E-01 * Math.pow((mag - 6), 2) + -0.3646674E-02 * Math.pow((mag - 6), 3)) * Math.log(dist)
				+(-Math.log(100) - 0.5 * Math.log(dist))
			);
		}
		
		_myGal = parseFloat(_myGal.toFixed(2));
		console.log("_myGal : " + _myGal);

		let intensity = 0;

		if(_myGal < 0.98) intensity = 1;
		else if(_myGal > 0.98 && _myGal <= 2.94) intensity = 2;
		else if(_myGal > 2.94 && _myGal <= 7.84) intensity = 3;
		else if(_myGal > 7.84 && _myGal <= 23.52) intensity = 4;
		else if(_myGal > 23.52 && _myGal <= 65.66) intensity = 5;
		else if(_myGal > 65.66 && _myGal <= 127.40) intensity = 6;
		else if(_myGal > 127.40 && _myGal <= 235.20) intensity = 7;
		else if(_myGal > 235.20 && _myGal <= 431.20) intensity = 8;
		else if(_myGal > 431.20 && _myGal <= 813.40) intensity = 9;
		else if(_myGal > 813.40) intensity = 10;

		if(intensity <= 2) this.magStr = "미세";
		else if(intensity <= 4) this.magStr = "약한";
		else if(intensity <= 5) this.magStr = "강한";
		else this.magStr = "격한";

		if(intensity <= 2) { 
			document.getElementById("infoBox1").setAttribute('style','background: #ffd300; color:#000000;');
			document.getElementById("infoBox2").setAttribute('style','background: #ffd300; color:#000000;');
		}
		else if(intensity <= 4) { 
			document.getElementById("infoBox1").setAttribute('style','background: #ffb236; color:#000000;');
			document.getElementById("infoBox2").setAttribute('style','background: #ffb236; color:#000000;');
		}
		else if(intensity <= 5) { 
			document.getElementById("infoBox1").setAttribute('style','background: #ff7b36;');
			document.getElementById("infoBox2").setAttribute('style','background: #ff7b36;');
		}
		else { 
			document.getElementById("infoBox1").setAttribute('style','background: #ff5936;');
			document.getElementById("infoBox2").setAttribute('style','background: #ff5936;');
		}

		if(!intensity) intensity = 1;

		console.log(intensity);
		return Math.round(intensity);
	}

	call() {
		if(this.cancelAdd) {
			this.sosContacts.push({
				text: 'Cancel',
				handler: () => {
					console.log('Cancel clicked');
				}
			})
			this.cancelAdd=false;
		}
		
		if(this.sosContacts.length == 1) {
			let alert=this.alertCtrl.create({
				subTitle: '등록된 연락처가 없습니다.',
				buttons: [{
				text: '확인',
				role: '확인',
				handler: () => {}
				},]
			});
			alert.present();
		} else {
			let actionSheet = this.actionSheetCtrl.create({
				title: '비상 연락망',
				buttons: this.sosContacts
			});
			actionSheet.present();
		}
	}

	share() {
		this.socialSharing.share(this.message + " " + this.pushData.el_time_utc);
	}
  
	MapTablePage() {
		this.navCtrl.push(MapTablePage);
	}

	back() {
		this.navCtrl.pop();
	}
}