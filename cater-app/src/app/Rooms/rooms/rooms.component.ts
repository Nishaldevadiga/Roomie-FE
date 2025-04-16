import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']  // Note: Corrected `styleUrl` to `styleUrls`
})
export class RoomsComponent implements OnInit {

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = 'cf410030a4dcb0638bd51db22be5a2c5a4e52682';  // Replace with the actual token
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);

    this.http.get('http://127.0.0.1:8000/api/rooms/', { headers }).subscribe(
      response => {
        console.log('Rooms data:', response);
      },
      error => {
        console.error('Error fetching rooms:', error);
      }
    );
  }
}
