import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { ListPage } from '../list/list';
import { ReportPage} from '../report/report';
import { MapTablePage } from '../map-table/map-table';
import { MapPage } from '../map/map';
import { Geolocation } from '@ionic-native/geolocation';
import { ReplayMapPage } from '../replay-map/replay-map';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { VideoPlayer } from '@ionic-native/video-player';
import { ReportListPage } from '../report-list/report-list';
import { SocialSharing } from '@ionic-native/social-sharing';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media';
import { SingletonProvider } from '../../providers/singleton/singleton';

import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Generated class for the DetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var daum: any;
@IonicPage()
@Component({
	selector: 'page-detail',
	templateUrl: 'detail.html',
})

export class DetailPage {
	private data;
	private map;
	private files=[];

	constructor(public navCtrl:NavController, private loadingCtrl:LoadingController, private singleton:SingletonProvider,
		private streamingMedia:StreamingMedia, public navParams:NavParams, private geolocation:Geolocation,
		private socialSharing:SocialSharing, private photoViewer:PhotoViewer, private videoPlayer:VideoPlayer, 
		private iab: InAppBrowser) {
	
		this.data = navParams.get('data');
    	console.log(this.data)
  	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad DetailPage');
		this.loadMap();

		if(this.data.files.length > 0) {
			for(let i = 0; i < 3; i++) {
				if(this.data.files[i] != undefined) {
					console.log(this.data.files[i]);
					this.files.push(this.singleton.baseUrl + this.data.files[i].rf_path + this.data.files[i].rf_filename);
				}
			}
		}
	}

  	loadMap() {
    	var container = document.getElementById('detailmap');

		var options = { //지도를 생성할 때 필요한 기본 옵션
			center: new daum.maps.LatLng(this.data.el_lat, this.data.el_lng), //지도의 중심좌표.
			level: 12 //지도의 레벨(확대, 축소 정도)
		};
      
    	this.map = new daum.maps.Map(container, options); //지도 생성 및 객체 리턴

   		// 마커를 표시할 위치와 title 객체 배열입니다 
    	var points = [];

		var imageSrc ="../assets/imgs/icon_marker_star.png", // 마커이미지의 주소입니다    
		imageSize = new daum.maps.Size(20,20), // 마커이미지의 크기입니다
		imageOption = {offset: new daum.maps.Point(10,10)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
		
		// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
		var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption),
			markerPosition = new daum.maps.LatLng(this.data.el_lat, this.data.el_lng); // 마커가 표시될 위치입니다

		points.push(markerPosition);
        
		// 마커를 생성합니다
		var marker = new daum.maps.Marker({
			map: this.map, 
			position: markerPosition, 
			image: markerImage // 마커이미지 설정 
		});

      	marker.setMap(this.map);
	}

	replay() {
		this.singleton.loading = this.loadingCtrl.create({
			content: '페이지를 여는중입니다.'
		});
		this.singleton.loading.present();
		console.log("replay")
		var nowTime=new Date().getTime() / 1000;
		this.geolocation.getCurrentPosition({timeout: 10000}).then((resp) => {
			this.singleton.loading.dismiss();
			this.navCtrl.push(ReplayMapPage,{"mode":"0","data":{
				lat: this.data.el_lat,
				lng: this.data.el_lng,
				mag: this.data.el_mag,
				message: this.data.el_addr,
				nowLat: resp.coords.latitude,
				nowLng: resp.coords.longitude,
				nowTime: nowTime,
				time: nowTime,
				el_time_kst:this.data.el_time_kst, 
				el_time_utc:this.data.el_time_utc, 
			}})
		}).catch((error) => {
			alert("위치정보를 가져오는데 실패했습니다.");
			this.singleton.loading.dismiss();
			console.log('Error getting location', error);
		});      	
	}

  	kigamLink() {
		console.log(this.data);
		const el_time_utc = this.data.el_time_utc;
		console.log(el_time_utc.substring(5, 2));

		let link = "http://eewweb.kigam.re.kr:3952/EEW-RTB/RT/"
		link += el_time_utc.substring(0, 4) + "/";
		link += el_time_utc.substring(5, 7) + "/";
		link += this.data.evid;

		console.log(link);
		this.iab.create(link, '_system');
	}

	view(no) {
		this.photoViewer.show(this.singleton.baseUrl+this.data.files[no].rf_path+this.data.files[no].rf_filename);
		// this.photoViewer.show("http://app.kigam.codexbridge.com/index.php/data/2018/05/01/5ae7fb443688e1.png");

		// if(this.files[no].rf_type=="image"){
		//   this.photoViewer.show("http://app.kigam.codexbridge.com/index.php"+this.data.files[no].rf_path+this.data.files[no].rf_filename);
		// }else if(this.files[no].rf_type=="video"){

		// }
	}

	more() {
		this.navCtrl.push(ReportListPage,{evid:this.data.evid});
	}

	test1() {
		this.photoViewer.show(this.singleton.dataUrl+"/2018/05/01/5ae7fb443688e1.png");
	}

	test2() {
		// this.videoPlayer.play('https://st2.depositphotos.com/thumbs/1121376/75037991/api_thumb_600.mp4',{scalingMode:1}).then(() => {
		//   console.log('video completed');
		// }).catch(err => {
		//   console.log(err);
		// });
		let options: StreamingVideoOptions = {
			successCallback: () => { console.log('Video played') },
			errorCallback: (e) => { console.log('Error streaming') },
			orientation: 'sensor',
			shouldAutoClose: true,
			controls: true
		};
    
    	this.streamingMedia.playVideo('https://st2.depositphotos.com/thumbs/1121376/75037991/api_thumb_600.mp4', options);
  	}

  	share() {
		console.log(this.data);
		const el_time_utc = this.data.el_time_utc;
		console.log(el_time_utc.substring(5, 2));
		let link = "http://eewweb.kigam.re.kr:3952/EEW-RTB/RT/"
		link += el_time_utc.substring(0, 4) + "/";
		link += el_time_utc.substring(5, 7) + "/";
		link += this.data.evid;
		
		this.socialSharing.share(link);
	}

	back() {
		this.navCtrl.pop();
	}

	ReportPage() {
		this.navCtrl.push(ReportPage,{data:this.data});
	}

	MapTablePage() {
		this.navCtrl.push(MapTablePage);
	}  

	setMapType(maptype) { 
		var roadmapControl = document.getElementById('btnRoadmap');
		var skyviewControl = document.getElementById('btnSkyview'); 
		if (maptype === 'roadmap') {
			this.map.setMapTypeId(daum.maps.MapTypeId.ROADMAP);    
			roadmapControl.className = 'selected_btn';
			skyviewControl.className = 'btn';
		} else {
			this.map.setMapTypeId(daum.maps.MapTypeId.HYBRID);    
			skyviewControl.className = 'selected_btn';
			roadmapControl.className = 'btn';
		}
	}  
}