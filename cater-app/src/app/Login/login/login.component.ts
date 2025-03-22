import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const loginData = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };
      
      this.http.post('http://127.0.0.1:8000/api/login/', loginData)
        .subscribe({
          next: (response: any) => {
            console.log('Login successful', response);
            
            // Store the token if it's in the response
            if (response.token) {
              localStorage.setItem('authToken', response.token);
              
              // Store user info if needed
              if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
              }
              
              // Save "remember me" setting if checked
              if (this.loginForm.value.rememberMe) {
                localStorage.setItem('rememberUser', 'true');
              } else {
                localStorage.removeItem('rememberUser');
              }
            }
            
            // Navigate to dashboard/home after successful login
            this.router.navigate(['/dashboard']);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Login failed', error);
            
            // Handle different error scenarios
            if (error.status === 401) {
              this.errorMessage = 'Invalid email or password';
            } else if (error.status === 0) {
              this.errorMessage = 'Could not connect to server. Please try again later.';
            } else {
              this.errorMessage = error.error?.message || 'Login failed. Please try again.';
            }
            
            this.isLoading = false;
          }
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  signInWithGoogle() {
    // Implement Google Sign In logic
    console.log('Sign in with Google clicked');
  }

  goToSignUp() {
    this.router.navigate(['/login']);
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}