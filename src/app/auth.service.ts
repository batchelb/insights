import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  token;
  constructor() {
    if(localStorage.getItem('currentUser')){
      this.token = JSON.parse(localStorage.getItem('currentUser')).token;
    }
  }

}
