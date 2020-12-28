import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


import { HomePage } from '../home/home';
import { MapPage } from '../map/map';

/**
 * Generated class for the MapTablePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-map-table',
	templateUrl: 'map-table.html',
})
export class MapTablePage {
	constructor(public navCtrl: NavController, public navParams: NavParams) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad MapTablePage');
	}

	back(){
		this.navCtrl.pop();
	}
}
