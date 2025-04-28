import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Provider {
  username: string;
  bio: string;
}

interface Room {
  id: number;
  title: string;
  price: number;
  description: string;
  location: string;
  provider: Provider;
  is_available: boolean;
  created_at: string;
  // Optional image property in case API returns it in the future
  image?: string;
}

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  error: string | null = null;
  defaultImage = './assets/room.jpg'; // Path to default image

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms(): void {
    this.loading = true;
    this.error = null;
    
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    // Create headers with authorization if token exists
    const headers = token ? 
      new HttpHeaders().set('Authorization', `Token ${token}`) : 
      new HttpHeaders();
    
    this.http.get<Room[]>('http://127.0.0.1:8000/api/rooms/', { headers })
      .subscribe({
        next: (data) => {
          this.rooms = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load rooms. Please try again later.';
          this.loading = false;
          console.error('Error fetching rooms:', err);
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  viewRoomDetails(roomId: number): void {
    // Navigate to room detail view
    this.router.navigate(['/roomview', roomId]);
  }

  getRoomImage(room: Room): string {
    // Return room image if exists, otherwise default image
    return room.image || this.defaultImage;
  }
}