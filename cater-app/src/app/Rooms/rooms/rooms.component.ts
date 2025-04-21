import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Provider {
  username: string;
  email: string;
  role: string;
  phone_number: string;
  bio: string;
}

interface Room {
  id: number;
  provider: Provider;
  title: string;
  description: string;
  price: string;
  location: string;
  is_available: boolean;
  created_at: string;
}

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms(): void {
    this.loading = true;
    this.http.get<Room[]>('http://127.0.0.1:8000/api/rooms/').subscribe(
      (response) => {
        this.rooms = Array.isArray(response) ? response : [response]; // Handle both array and single object responses
        this.loading = false;
        console.log('Rooms data:', this.rooms);
      },
      (error) => {
        this.error = 'Error fetching rooms data';
        this.loading = false;
        console.error('Error fetching rooms:', error);
      }
    );
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}