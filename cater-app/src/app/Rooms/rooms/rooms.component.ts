import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CanDeactivateGuard } from '../../Gaurds/candeactivate.guard';

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
  filteredRooms: Room[] = [];
  loading = true;
  error: string | null = null;
  defaultImage = './assets/room.jpg';
  
  // Search functionality
  searchControl = new FormControl('');
  searchTerm: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  canDeactivate(): boolean {
    return window.confirm('Are you sure you want to leave the Rooms page?');
  }

  ngOnInit(): void {
    this.fetchRooms();
    
    
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.searchTerm = value || '';
        this.filterRooms();
      });
  }

  fetchRooms(): void {
    this.loading = true;
    this.error = null;
    
    const token = localStorage.getItem('token');
    
    
    const headers = token ? 
      new HttpHeaders().set('Authorization', `Token ${token}`) : 
      new HttpHeaders();
    
    this.http.get<Room[]>('http://127.0.0.1:8000/api/rooms/', { headers })
      .subscribe({
        next: (data) => {
          this.rooms = data;
          this.filteredRooms = data; 
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load rooms. Please try again later.';
          this.loading = false;
          console.error('Error fetching rooms:', err);
        }
      });
  }

  filterRooms(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRooms = this.rooms;
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    
    this.filteredRooms = this.rooms.filter(room => {
      return (
        room.title.toLowerCase().includes(term) ||
        room.description.toLowerCase().includes(term) ||
        room.location.toLowerCase().includes(term) ||
        room.provider.username.toLowerCase().includes(term)
      );
    });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  viewRoomDetails(roomId: number): void {
    
    this.router.navigate(['/roomview', roomId]);
  }

  getRoomImage(room: Room): string {
    
    return room.image || this.defaultImage;
  }
}