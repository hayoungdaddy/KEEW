import { Injectable } from '@angular/core';

/*
  Generated class for the SingletonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable()
export class SingletonProvider {
    public fromDate = "";
    public toDate = "";
    public city = "전체";
    public region = "전체";
    public mag = null;

    public loading = null;
    public registrationids: string;

    public baseUrl = 'http://210.98.12.75:8343';
    public dataUrl = this.baseUrl + '/data';
    public apiUrl = this.baseUrl + '/index.php/api';

    constructor() {
    }
}