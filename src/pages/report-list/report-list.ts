import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { VideoPlayer } from '@ionic-native/video-player';
import { StreamingVideoOptions, StreamingMedia } from '@ionic-native/streaming-media';
import { HTTP } from '@ionic-native/http';
import { SingletonProvider } from '../../providers/singleton/singleton';

/**
 * Generated class for the ReportListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  	selector: 'page-report-list',
  	templateUrl: 'report-list.html',
})
export class ReportListPage {
	private evid;
	private files=[];
	private lines=[];

	constructor(public navCtrl: NavController, private http: HTTP, public navParams: NavParams, 
		private photoViewer: PhotoViewer, private videoPlayer: VideoPlayer, private streamingMedia: StreamingMedia, 
		private singleton:SingletonProvider) {
    		this.evid=navParams.get('evid');  
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ReportListPage');
	}

	ionViewDidEnter() {
		this.files=[];
		this.getFiles();
	}

	getFiles() {
		this.http.get(this.singleton.apiUrl + '/reportHistory/'+this.evid, {}, {}).then(data => {
			let resp = JSON.parse(data.data);
			console.log(resp);
			if(resp.status == 1) {
				this.files=resp.data;
				console.log(this.files)
				let lineCnt=this.files.length/3;
				if(this.files.length%3!=0) lineCnt++;
				for(let i=0;i<Math.floor(lineCnt);i++) {
					let line=[];
					for(let j=0;j<3;j++) {
						if(this.files[i*3+j]) {
							line.push(this.singleton.baseUrl + this.files[i*3+j].rf_path + this.files[i*3+j].rf_filename);
						}
					}
					this.lines.push(line);
				}
			}
		}).catch(error => {
			console.log(error.status);
			console.log(error.error); // error message as string
			console.log(error.headers);
    	});
  	}

	view(file) {
		this.photoViewer.show(file);
	}  

	back() {
		this.navCtrl.pop();
	}
}