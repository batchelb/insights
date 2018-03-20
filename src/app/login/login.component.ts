import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { CoreService } from '../core.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  isSignup;
  loginForm:FormGroup;
  constructor(private coreService: CoreService,
              private authService: AuthService,
              private router:Router,
              private fb:FormBuilder){}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username:[''],
      hash:['']
    })
  }
    //////login
  login(){
    this.coreService.loginUser(this.loginForm.value).subscribe((token:any)=>{
      if(typeof token === 'string') {
        localStorage.setItem('currentUser', JSON.stringify({ token: token}));
        this.authService.token = token;
        console.log(token)
        this.router.navigate(['create']);
      } else {
        this.loginForm.get('username').setErrors({invalid:true});
        this.loginForm.get('hash').setErrors({invalid:true});
      }
    });
  }

  signup(){
    if(this.isSignup) {
      this.loginForm.valid && this.coreService.createUser(this.loginForm.value).subscribe((token)=>{
        if(typeof token === 'string') {
          localStorage.setItem('currentUser', JSON.stringify({ token: token}));
          this.authService.token = token;
          this.router.navigate(['create']);
        } else {
          this.loginForm.get('username').setErrors({invalid:true});
        }
      });
    } else {
      this.isSignup =true;
      this.loginForm.get('username').setValidators(Validators.required);
      this.loginForm.get('hash').setValidators(Validators.required);
    }
  }
}
