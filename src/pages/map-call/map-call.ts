import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MapCallPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  	selector: 'page-map-call',
  	templateUrl: 'map-call.html',
})

export class MapCallPage {
  	constructor(public navCtrl: NavController, public navParams: NavParams) {}

	ionViewDidLoad() {
		console.log('ionViewDidLoad MapCallPage');
	}
}