import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { AuthService } from '../auth.service'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

@Injectable()
export class Interceptor implements HttpInterceptor {
    public authToken;
    constructor(private authService:AuthService){}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(this.authService.token){
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authService.token}`
                  }
            });
        }
    return next.handle(request);
  }
}