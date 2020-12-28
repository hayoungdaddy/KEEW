import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { ListPage } from '../list/list';
import { SettingPage } from '../setting/setting';
import { MapPage } from '../map/map';
import { HTTP } from '@ionic-native/http';
import { DetailPage } from '../detail/detail';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { GuidePage } from '../guide/guide';

declare var daum: any;
@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})

export class HomePage {
	private list = [];
	private className = [];
	private date = [];
	private map;
	private markers = [];
  	private detail = true;
	  
	constructor(
		public navCtrl: NavController,
		private platform:Platform, 
		public navParams: NavParams,
		private http:HTTP,
		private singleton:SingletonProvider, 
		private iab: InAppBrowser
	) {
		if(navParams.get('action')) {
			let action = navParams.get('action');
			switch(action) {
			case 'earthquake':
				navCtrl.push(MapPage, {'data': navParams.get('data')});
			break;
			}
		}
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad HomePage');
	}

	ionViewDidEnter() {
		this.platform.ready().then(() => {
			this.detail=true;
			this.list=[];
			this.getList();
		})
	}

	getList() {
		this.http.get(this.singleton.apiUrl + '/history', {}, {}).then(data => {
			let resp = JSON.parse(data.data);
			for(let i=0;i<4;i++) // 최신 지진 목록 4개 수록
			{
				this.list.push(resp.data[i]);
			}
			//console.log(this.list);
		
			for(let i=0;i<this.list.length;i++) 
			{
				this.className.push("magnitude lv" + Math.floor(this.list[i].el_mag));
				var splitDate = this.list[i].el_time_kst.split(' ');
				var splitDate2 = splitDate[0].split('-');
				this.date.push(splitDate2[1] + "월 " + splitDate2[2] + "일");
			}

			this.loadMap();
		
		}).catch(error => {
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
		});
	}

	loadMap() {
		var container = document.getElementById('map');

		var options = { //지도를 생성할 때 필요한 기본 옵션
			center: new daum.maps.LatLng(this.list[0].el_lat, this.list[0].el_lng), //지도의 중심좌표.
			level: 3 //지도의 레벨(확대, 축소 정도)
		};
		
		this.map = new daum.maps.Map(container, options); //지도 생성 및 객체 리턴

		// 마커를 표시할 위치와 title 객체 배열입니다 
		var points = [];

		for (var i = 0; i < this.list.length; i ++) {
			var imageSrc ="../assets/imgs/icon-marker-"+(i+1)+".png", // 마커이미지의 주소입니다    
			imageSize = new daum.maps.Size(22,29), // 마커이미지의 크기입니다
			imageOption = {offset: new daum.maps.Point(11,29)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
			
			// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
			var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption),
				markerPosition = new daum.maps.LatLng(this.list[i].el_lat, this.list[i].el_lng); // 마커가 표시될 위치입니다

			points.push(markerPosition);
		
			// 마커를 생성합니다
			var marker = new daum.maps.Marker({
				map: this.map, 
				position: markerPosition, 
				image: markerImage // 마커이미지 설정 
			});

			this.markers.push(marker);
			this.markers[i].setMap(this.map);

			// 지도를 재설정할 범위정보를 가지고 있을 LatLngBounds 객체를 생성합니다
			var bounds = new daum.maps.LatLngBounds();   
			
			for(let i=0;i<points.length;i++){
				bounds.extend(points[i]);
			}
			this.map.setBounds(bounds);
		}

		for(let i=0;i<this.list.length;i++) {
			daum.maps.event.addListener(this.markers[i], 'click', ()=> {
				if(this.detail) {
					this.detail=false;
					this.DetailPage(this.list[i]);
				}     
			});
		}
	}

	DetailPage(data) {
		console.log(data)
		this.navCtrl.push(DetailPage,{data:data});
	}

	ListPage() {
		this.singleton.fromDate = "";
		this.singleton.toDate = "";
		this.singleton.mag = null;
		this.singleton.city = "전체";
		this.singleton.region = "전체";
		this.singleton.region = "전체";
		this.navCtrl.push(ListPage);
	}

	SettingPage() {
		this.navCtrl.push(SettingPage);
	}

	MapPage() {
		this.navCtrl.push(MapPage);
	}

	OpenManual() {
		// window.open("http://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/contents/prevent/prevent09.html?menuSeq=126", '_blank');
		// this.iab.create('http://app.kigam.codexbridge.com/index.php/keew/guide', '_blank', 'location=yes, closebuttoncaption="닫기"');
		this.navCtrl.push(GuidePage);
	}
}
