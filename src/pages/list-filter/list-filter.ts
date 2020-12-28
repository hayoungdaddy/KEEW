import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, LoadingController } from 'ionic-angular';

import { HTTP } from '@ionic-native/http';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeStorage } from '@ionic-native/native-storage';

/**
 * Generated class for the ListFilterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-list-filter',
	templateUrl: 'list-filter.html',
})
export class ListFilterPage {
	private startDate:String = "";
	private endDate:String = "";
	private fromDate;
	private toDate;
	private city;
	private region;
	private selectCity;
	private selectRegion;
	private mag=2;
	private dateBtnClass = ["off", "off", "off", "off", "off"];
	private useGPS = false;

	constructor(
		public navCtrl: NavController, 
		public loadingCtrl: LoadingController, 
		public navParams: NavParams,
		private http: HTTP, 
		private singleton: SingletonProvider, 
		private events: Events,
		private geolocation: Geolocation,
		private nativeStorage: NativeStorage) 
	{
		
		if(this.singleton.fromDate != "") {
			let date = [
				this.singleton.fromDate.substring(0, 4), 
				this.singleton.fromDate.substring(4, 6), 
				this.singleton.fromDate.substring(6, 8)
			];
			this.startDate = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2])  + 1).toISOString();
		}

		if(this.singleton.toDate != "") {
			let date = [
				this.singleton.toDate.substring(0, 4), 
				this.singleton.toDate.substring(4, 6), 
				this.singleton.toDate.substring(6, 8)
			];
			this.endDate = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]) + 1).toISOString();
		}

    	if(!this.singleton.mag) this.singleton.mag = 2;
  	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ListFilterPage');

		this.nativeStorage.getItem('settings').then( data => { 
			this.useGPS = data.useGPS;
		});

		this.getCityList();
	}

	ionViewDidEnter() {
	}

	filterBox() {
		console.log("list-filter.ts > filterBox()", "this.singleton.fromDate : " + this.singleton.fromDate);
		console.log("list-filter.ts > filterBox()", "this.singleton.toDate : " + this.singleton.toDate);

		this.fromDate = this.singleton.fromDate;
		this.toDate = this.singleton.toDate;

		let toDate = [];
		let fromDate = [];

		if(this.toDate != "") {
			toDate = [
				this.toDate.substring(0, 4), 
				this.toDate.substring(4, 6), 
				this.toDate.substring(6, 8)
			];
			let endDate = new Date(toDate[0], toDate[1] - 1, toDate[2] * 1 + 1).toISOString();
			this.endDate = endDate;
		} else {
			this.endDate = "";
		}

		if(this.fromDate != "") {
			fromDate = [
				this.fromDate.substring(0, 4), 
				this.fromDate.substring(4, 6), 
				this.fromDate.substring(6, 8)
			];
			let startDate = new Date(fromDate[0], fromDate[1] - 1, fromDate[2] * 1 + 1).toISOString();
			this.startDate = startDate;      
		} else {
			this.startDate = "";
		}

		console.log(toDate);
		console.log(fromDate);

		console.log(this.startDate);
		console.log(this.endDate);

		this.selectCity=this.singleton.city;
		this.selectRegion=this.singleton.region;
		this.mag=this.singleton.mag;

		if(this.fromDate == "") document.getElementById("dateBox") ? document.getElementById("dateBox").setAttribute("style",'display: none') : "";
		else document.getElementById("dateBox") ? document.getElementById("dateBox").removeAttribute("style") : "";

		if(this.mag == null) document.getElementById("magBox") ? document.getElementById("magBox").setAttribute("style",'display: none') : "";
		else document.getElementById("magBox") ? document.getElementById("magBox").removeAttribute("style") : "";

		if(this.selectCity == "전체") document.getElementById("cityBox") ? document.getElementById("cityBox").setAttribute("style",'display: none') : "";
		else document.getElementById("cityBox") ? document.getElementById("cityBox").removeAttribute("style") : "";

		if(this.selectRegion == "전체") document.getElementById("regionBox") ? document.getElementById("regionBox").setAttribute("style",'display: none') : "";
		else document.getElementById("regionBox") ? document.getElementById("regionBox").removeAttribute("style") : "";
	}

	getCityList() {
		this.http.post(this.singleton.apiUrl + '/region', {}, {}).then(data => {
			let resp = JSON.parse(data.data);
			if(resp.status==1) {
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

	dateBtn(no) {
		if(no == -1) {
			this.singleton.fromDate = "";
			this.singleton.toDate = "";
			this.startDate = "";
			this.endDate = "";
		} else {
			var date      = new Date();
			var now       = date.getFullYear() + '-' + this.fn_leadingZeros(date.getMonth() + 1, 2) + '-' + this.fn_leadingZeros(date.getDate(), 2);
			var yesterday = this.beforeDate(now, 1);
			var week      = this.beforeDate(now, 7);
			var month     = this.lastMonth();
			var year      = this.lastYear();
		
			var nowarr   = now.split("-");
			var yestarr  = yesterday.split("-");
			var weekarr  = week.split("-");
			var montharr = month.split("-")
			var yeararr  = year.split("-");
		
			if(no == 0) { // 오늘
				this.startDate = now;
				this.singleton.fromDate = nowarr[0] + nowarr[1] + nowarr[2];
			} else if(no == 1) { // 어제
				this.startDate = yesterday;
				this.singleton.fromDate = yestarr[0] + yestarr[1] + yestarr[2];
			} else if(no == 2) { // 일주일
				this.startDate = week;
				this.singleton.fromDate = weekarr[0] + weekarr[1] + weekarr[2];
			} else if(no == 3) { // 한달
				this.startDate = month;
				this.singleton.fromDate = montharr[0] + montharr[1] + montharr[2];
			} else if(no == 4) { // 1년
				this.startDate = year;
				this.singleton.fromDate = yeararr[0] + yeararr[1] + yeararr[2];
			}
		
			this.endDate = now;
			this.singleton.toDate = nowarr[0] + nowarr[1] + nowarr[2];
		}
	}

	lastMonth() {
		var date = new Date();
		var monthOfYear = date.getMonth();
		date.setMonth(monthOfYear - 1);
		var y = date .getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();

		var mm;
		var dd;

		if(m < 10) { mm = "0" + m; }else{ mm = m }
		if(d < 10) { dd = "0" + d; }else{ dd = d }
		
		return y + "-" + mm + "-" + dd;
	}

	lastYear() {
		var date = new Date();
		var year = date.getFullYear();
		date.setFullYear(year - 1);
		var y = date .getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();

		var mm;
		var dd;

		if(m < 10) { mm = "0" + m; }else{ mm = m }
		if(d < 10) { dd = "0" + d; }else{ dd = d }
		
		return y + "-" + mm + "-" + dd;
	}

	beforeDate(now,no) {
		var beforeDate = new Date();

		var nowDate = now.split("-");

		beforeDate.setFullYear(Number(nowDate[0]), Number(nowDate[1])-1, Number(nowDate[2])-no);
		var y = beforeDate .getFullYear();
		var m = beforeDate.getMonth() + 1;
		var d = beforeDate.getDate();

		var mm;
		var dd;

		if(m < 10) { mm = "0" + m; }else{ mm = m }
		if(d < 10) { dd = "0" + d; }else{ dd = d }
		
		return y + "-" + mm + "-" + dd;
	}

	fn_leadingZeros(n, digits) {
		var zero = '';
		n = n.toString();
		if (n.length < digits) {
		for (var i = 0; i < digits - n.length; i++){ zero += '0'; }
		}
		return zero + n;
	}

	delete(no) {
		if(no == 1) {
			this.singleton.fromDate="";
			this.singleton.toDate="";
		} else if(no == 2) {
			this.singleton.mag = 2;
		} else if(no == 3) {
			this.singleton.city="전체";
			this.singleton.region="전체";
		} else if(no == 4) {
			this.singleton.region="전체";
		}
		this.filterBox();
	}

	changeCity() {
		this.region = [];
		this.selectRegion = '';
		this.http.post(this.singleton.apiUrl + '/region', {city: this.selectCity}, {}).then(data => {
			let resp = JSON.parse(data.data);
			if(resp.status==1) {
				this.region = resp.region;
				console.log(this.region);

				if(this.selectRegion == "") this.selectRegion = this.region[0];
			}
		}).catch(error => {
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
		});

		this.singleton.city = this.selectCity;
		if(this.selectCity == "전체") {
			this.singleton.region = "전체";
		}

		this.filterBox();
	}

	changeRegion() {
		this.singleton.region = this.selectRegion;
		this.filterBox();
	}

	changeMag() {
		if(!this.mag) {
			this.mag = 2;
			this.singleton.mag = 2;
		} else {
			this.singleton.mag = this.mag;
		}
		this.filterBox();
	}

	search() {
		console.log("list-filter.ts > search()", "this.singleton.fromDate : " + this.singleton.fromDate);
		console.log("list-filter.ts > search()", "this.singleton.toDate : " + this.singleton.toDate);

		this.events.publish("filter:search");
		this.navCtrl.pop();
	}

	curLoc() {
		if(!this.useGPS)
		{
			alert("위치정보 사용 동의가 필요합니다.");
			return;
		}

		this.singleton.loading = this.loadingCtrl.create({
			content: '현재 위치를 찾는중입니다.'
		});
		this.singleton.loading.present();
		this.geolocation.getCurrentPosition({timeout: 10000}).then((resp) => {
			let headers = {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'KakaoAK 1cd149aaa862f47467792a6257f7afcd'
			};
			let url = 'https://dapi.kakao.com/v2/local/geo/coord2address.json?x='+resp.coords.longitude+'&y='+resp.coords.latitude+'&input_coord=WGS84';
			this.http.get(url,{},headers).then((data) => {
				// console.log(data.data);
				let resp=JSON.parse(data.data);
				console.log(resp.documents[0]);

				if(resp.documents[0] == undefined) {
					alert("위치정보를 가져오는데 실패했습니다.");
					this.singleton.loading.dismiss();
					return;
				}

				var regionName = resp.documents[0].address.region_1depth_name.trim();

				console.log(regionName);

				let tempCity = "";
				for(let i = 0; i < this.city.length; i++) {
					if(this.city[i] == regionName) {
						tempCity = regionName;
						this.selectCity = regionName;
						this.changeCity();
					}
				}

				if(tempCity == "")
					alert("현재 위치에 해당하는 정보가 없습니다.");

				this.singleton.loading.dismiss();
			}).catch((error) => {
				console.log(error);
			});
		}).catch((error) => {
			alert("위치정보를 가져오는데 실패했습니다.");
			this.singleton.loading.dismiss();       
			console.log('Error getting location', error);
		});
	}

	getDate1() {
		// let fromDate = this.startDate.split('T');
		this.singleton.fromDate = this.startDate.replace(/-/gi, '');
		// this.filterBox();
	}

	getDate2() {
		// let toDate = this.endDate.split('T');
		this.singleton.toDate = this.endDate.replace(/-/gi, '');
		// this.filterBox();
	}

	back() {
		this.navCtrl.pop();
	}
}