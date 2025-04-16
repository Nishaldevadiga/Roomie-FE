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

    this.http.get('http://127.0.0.1:8000/api/rooms/').subscribe(
      response => {
        console.log('Rooms data:', response);
      },
      error => {
        console.error('Error fetching rooms:', error);
      }
    );
  }
}
