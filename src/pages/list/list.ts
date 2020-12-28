import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

import { HomePage } from '../home/home';
import { ListFilterPage } from '../list-filter/list-filter';
import { DetailPage } from '../detail/detail';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { HTTP } from '@ionic-native/http';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { PointerEvents } from 'ionic-angular/umd/gestures/pointer-events';

/**
 * Generated class for the ListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var daum: any;
@IonicPage()
@Component({
	selector: 'page-list',
	templateUrl: 'list.html',
})

export class ListPage {
	private list = [];
	private className=[];
	private map;
	private markers=[];
	private page=1;
	private totalpage;
	private pgopen=true;
	private filt=false;

	private filterDate1;
	private filterDate2;
	private filterMag;
	private filterCity;
	private filterRegion;

	private detail=true;

	constructor(public navCtrl: NavController, public navParams: NavParams, private sqlite: SQLite, private http: HTTP,
		private events:Events,private singleton:SingletonProvider) {

		this.filterDate1=singleton.fromDate;
		this.filterDate2=singleton.toDate;
		this.filterMag=singleton.mag;
		this.filterCity=singleton.city;
		this.filterRegion=singleton.region;

		this.events.subscribe('filter:search',() => {
			console.log("list.ts", "subscribe:filter:search begin");
			
			for(let i=0;i<this.markers.length;i++) {
				this.markers[i].setMap(null);
			}

			this.markers = [];
			this.page = 1;
			this.filt = true;
			this.getFilterList();

			console.log("list.ts", "subscribe:filter:search end");
		})
	}

	ionViewDidEnter(){
		this.filterBox();
		this.detail = true;
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ListPage');
		this.filt = false;
		this.getList();
		this.filterBox();
	}

	filterBox() {
		this.filterDate1 = this.singleton.fromDate;
		this.filterDate2 = this.singleton.toDate;
		if(this.singleton.mag != null && this.singleton.mag > 0)
		this.filterMag = this.singleton.mag + " 이상";
		this.filterCity = this.singleton.city;
		this.filterRegion = this.singleton.region;
		
		if(this.filterDate1 =="") document.getElementById("fDate").setAttribute("style",'display: none');
		else document.getElementById("fDate").removeAttribute("style");

		if(this.singleton.mag == null || this.singleton.mag == 0) document.getElementById("fMag").setAttribute("style",'display: none');
		else document.getElementById("fMag").removeAttribute("style");

		if(this.filterCity == "전체") document.getElementById("fCity").setAttribute("style",'display: none');
		else document.getElementById("fCity").removeAttribute("style");

		if(this.filterRegion == "전체") document.getElementById("fRegion").setAttribute("style",'display: none');
		else document.getElementById("fRegion").removeAttribute("style");

		if(this.filterDate1 == "" && (this.singleton.mag == null || this.singleton.mag == 0) && this.filterCity == "전체" && this.filterRegion == "전체")
			document.getElementById("fContainer").setAttribute("style",'display: none');
		else
			document.getElementById("fContainer").setAttribute("style",'z-index: 9999;');
	}

	getList() {
		this.list = [];
		this.className = [];
		this.http.post(this.singleton.apiUrl + '/history', {page:this.page}, {}).then(data => {
			let resp = JSON.parse(data.data);
			this.list = resp.data;
			this.totalpage=10;
			console.log("total page : "+this.totalpage);
			console.log(this.list);

			for(let i=0;i<this.list.length;i++) {
				this.className.push("earquke lv"+Math.floor(this.list[i].el_mag));
			}

			this.loadMap();
		}).catch(error => {
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
		});
	}

	getFilterList() {
		this.list = [];
		this.className = [];

		let date = [];
		let fromDate = "";
		let toDate = "";

		if(this.singleton.fromDate != "") {
			date = [
				this.singleton.fromDate.substring(0, 4), 
				this.singleton.fromDate.substring(4, 6), 
				this.singleton.fromDate.substring(6, 8)
			];
			fromDate = date[0] + '-' + date[1] + '-' + date[2] + ' 00:00:00';
		}

		if(this.singleton.toDate != "") {
			date = [
				this.singleton.toDate.substring(0, 4), 
				this.singleton.toDate.substring(4, 6), 
				this.singleton.toDate.substring(6, 8)
			];
			toDate = date[0] + '-' + date[1] + '-' + date[2] + ' 23:59:59';
		}

		var formData = {
			page:this.page,
			fromDate: fromDate,
			toDate: toDate,
			city:this.singleton.city,
			region:this.singleton.region,
			mag:this.singleton.mag
		}

		console.log(formData);

		this.http.post(this.singleton.apiUrl + '/history', formData, {}).then(data => {
			let resp = JSON.parse(data.data);
			this.list=resp.data;

			if(resp.length == 0) {
				// alert("지진 검색결과가 없습니다.");
				this.page = 0;
			}

			this.totalpage = Math.floor(resp.length/10);
			if(resp.length % 10 > 0) this.totalpage++;      

			console.log("total page : "+this.totalpage);
			console.log(this.list);
			for(let i=0;i<this.list.length;i++) {
				this.className.push("earquke lv"+Math.floor(this.list[i].el_mag));
			}
			this.loadMap();

		}).catch(error => {
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
		});
	}

	loadMap() {
		if(this.map == null || this.map == undefined) { //지도 생성
			let container = document.getElementById('listmap');

			let options = { //지도를 생성할 때 필요한 기본 옵션
				center: new daum.maps.LatLng(this.list[0].el_lat, this.list[0].el_lng), //지도의 중심좌표.
				level: 3 //지도의 레벨(확대, 축소 정도)
			};
				
			this.map = new daum.maps.Map(container, options); //지도 생성 및 객체 리턴
		}

		// 마커 초기화
		for(let i = 0; i < this.markers.length; i++)
		if(this.markers[i] != null && this.markers[i] != undefined)
			this.markers[i].setMap(null);
		this.markers = [];

		// 마커를 표시할 위치와 title 객체 배열입니다 
		let points = [];
		
		for (let i = 0; i < this.list.length; i ++) {
			// 마커가 표시될 위치입니다
			let markerPosition = new daum.maps.LatLng(this.list[i].el_lat, this.list[i].el_lng);
			points.push(markerPosition);

			let imageSrc ="../assets/imgs/icon-marker-"+(i+1)+".png", // 마커이미지의 주소입니다
			imageSize = new daum.maps.Size(22,29), // 마커이미지의 크기입니다
			imageOption = {offset: new daum.maps.Point(11,29)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
			
			// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
			let markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption);
			
			// 마커를 생성합니다
			let marker = new daum.maps.Marker({
				map: this.map, 
				position: markerPosition, 
				image: markerImage // 마커이미지 설정 
			});

			this.markers.push(marker);
			this.markers[i].setMap(this.map);

			daum.maps.event.addListener(this.markers[i], 'click', () => {
				if(this.detail){
					this.detail=false;
					this.DetailPage(this.list[i]);
				}
			});
		}

		// 지도를 재설정할 범위정보를 가지고 있을 LatLngBounds 객체를 생성합니다
		let bounds = new daum.maps.LatLngBounds();   
		
		for(let i=0;i<points.length;i++) {
			bounds.extend(points[i]);
		}
		this.map.setBounds(bounds);
	}

	changeMap(){
		let points = [];

		console.log("changeMap");
		console.log(this.list);

		if(this.list.length > 0) {

			console.log("changeMap 1");

			for (let i = 0; i < this.list.length; i ++) {
				let imageSrc ="../assets/imgs/icon-marker-"+(i+1)+".png", // 마커이미지의 주소입니다    
				imageSize = new daum.maps.Size(22,29), // 마커이미지의 크기입니다
				imageOption = {offset: new daum.maps.Point(11,29)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
				
				// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
				let markerImage = new daum.maps.MarkerImage(imageSrc, imageSize, imageOption),
					markerPosition = new daum.maps.LatLng(this.list[i].el_lat, this.list[i].el_lng); // 마커가 표시될 위치입니다
		
				points.push(markerPosition);
				
				// 마커를 생성합니다
				let marker = new daum.maps.Marker({
					map: this.map, 
					position: markerPosition, 
					image: markerImage // 마커이미지 설정 
				});
		
				this.markers.push(marker);
				this.markers[i].setMap(this.map);
		
				daum.maps.event.addListener(this.markers[i], 'click', ()=> {
					if(this.detail) {
						this.detail=false;
						this.DetailPage(this.list[i]);
					}		
				});      
			}

			// 지도를 재설정할 범위정보를 가지고 있을 LatLngBounds 객체를 생성합니다
			let bounds = new daum.maps.LatLngBounds();   
			
			for(let i=0;i<points.length;i++) {
				bounds.extend(points[i]);
			}
			this.map.setBounds(bounds);          

		} else {
		}
	}

	pageChange(no) {
		if(no == 0) { //이전페이지
			if(this.page > 1) {
				this.page--;
				if(this.filt) this.getFilterList();
				else this.getList();
			}
			} else { //다음페이지
			if(this.page < this.totalpage) {
				this.page++;
				if(this.filt) this.getFilterList();
				else this.getList();
			}
		}
	}

	delete(no){
		if(no == 1) {
			this.singleton.fromDate = "";
			this.singleton.toDate = "";
		} else if(no == 2) {
			this.singleton.mag = null;
		}else if(no == 3) {
			this.singleton.city = "전체";
			this.singleton.region = "전체";
		}else if(no == 4) {
			this.singleton.region = "전체";
		}
		this.filterBox();
		for(let i=0;i<this.markers.length;i++) {
			this.markers[i].setMap(null);
		}
		this.markers = [];
		this.page = 1;
		this.filt = true;
		this.getFilterList();
	}

	back() {
		this.navCtrl.pop();
	}

	ListFilterPage() {
		this.navCtrl.push(ListFilterPage);
	}

	DetailPage(data) {
		console.log(data)
		this.navCtrl.push(DetailPage,{data:data});
	}

	padLeft(str, len, pad) {
		return Array(len-String(str).length+1).join(pad||'0') + str;
	}
}