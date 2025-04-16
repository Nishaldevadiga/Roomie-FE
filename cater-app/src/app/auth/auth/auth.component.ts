import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  hidePassword = true;
  signupForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
      phoneNumber: ['', [Validators.pattern(/^\d{10}$/)]], // Optional: 10-digit phone number validation
      bio: ['']
    }, { validator: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;

      // Prepare the payload for the Django API
      const payload = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        profile: {
          role: formValue.role,
          phone_number: formValue.phoneNumber || '', // Default to empty string if not provided
          bio: formValue.bio || '' // Default to empty string if not provided
        }
      };

      // Send POST request to the API
      this.http.post('http://127.0.0.1:8000/api/register/', payload).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          // Optionally redirect to login page or auto-login
          this.router.navigate(['/Enter']); // Adjust route as needed
        },
        error: (error) => {
          console.error('Signup failed:', error);
          this.errorMessage = error.error?.detail || 'Signup failed. Please try again.';
        }
      });
    }
  }
}