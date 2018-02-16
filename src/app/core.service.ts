import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable()
export class CoreService {
  token;
  selectedInsight:any = {};
  constructor(private http: HttpClient, private router:Router) {}

  createUser(createInfo) {
    return this.http.post('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/user', createInfo);
  }

  loginUser(createInfo) {
    return this.http.put('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/user', createInfo);
  }

  getInsights(){
    return this.http.get('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/insights');
  }

  getTags(){
    return this.http.get('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/tags');
  }

  createInsight(insight){
    return this.http.post('https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/insights', insight);
  }
  updateInsight(insight) {
    return this.http.put(`https://1wnjg3qwhl.execute-api.us-west-1.amazonaws.com/PROD/insights`, insight);
  }

}
