// openai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  // Use your Django backend endpoint
  private apiUrl = `${environment.apiUrl}/api/openai/chat/`;

  constructor(private http: HttpClient) {}

  getChatCompletion(conversation: { role: string; content: string }[]): Observable<any> {
    // Get the auth token from storage
    const token = localStorage.getItem('auth_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    });

    // Send conversation to backend API
    return this.http.post(this.apiUrl, { conversation }, { headers });
  }
}