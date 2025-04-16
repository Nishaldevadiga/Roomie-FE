import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token);
  

    if (token) {
      // Clone the request and add the Authorization header
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      });

      // Pass the cloned request to the next handler
      return next.handle(clonedRequest);
    }

    // If no token is found, just pass the request as is
    return next.handle(req);
  }
}
