import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface Provider {
  username: string;
  bio: string;
  phone_number?: string;
  email?: string;
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
}

@Component({
  selector: 'app-roomview',
  templateUrl: './roomview.component.html',
  styleUrls: ['./roomview.component.css']
})
export class RoomviewComponent implements OnInit {
  roomId: number = 0;
  room: Room | null = null;
  loading: boolean = true;
  error: string | null = null;
  contactStatus: 'initial' | 'processing' | 'success' | 'error' = 'initial';
  contactError: string | null = null;
  isLoggedIn: boolean = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get room ID from route params
    this.route.params.subscribe(params => {
      this.roomId = +params['id']; // Convert to number
      this.fetchRoomDetails();
    });

    // Check if user is logged in
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  fetchRoomDetails(): void {
    this.loading = true;
    
    // Get the token from local storage
    const token = localStorage.getItem('token');

    this.isLoggedIn=token?true:false;
    
    // Create headers with authorization if token exists
    const headers = token ? 
      new HttpHeaders().set('Authorization', `Token ${token}`) : 
      new HttpHeaders();
    
    this.http.get<Room>(`http://127.0.0.1:8000/api/rooms/${this.roomId}/`, { headers })
      .subscribe({
        next: (data) => {
          this.room = data;
          this.loading = false;
        },
        error: (err) => {
          if (err.status === 401) {
            this.error = 'Please log in to view room details.';
            // Redirect to login page after a short delay
            setTimeout(() => {
              this.router.navigate(['/login'], { 
                queryParams: { redirect: `/roomview/${this.roomId}` } 
              });
            }, 2000);
          } else {
            this.error = 'Failed to load room details. Please try again later.';
          }
          this.loading = false;
          console.error('Error fetching room details:', err);
        }
      });
  }

  contactProvider(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { 
        queryParams: { redirect: `/roomview/${this.roomId}` } 
      });
      return;
    }

    this.contactStatus = 'processing';
    this.contactError = null;
    
    // Here we'll implement a simple contact system using JavaScript's alert for demonstration
    // In a real app, you might implement a messaging system or initiate a booking
    
    // Simulate a contact process
    setTimeout(() => {
      this.contactStatus = 'success';
      alert(`Contact request sent to ${this.room?.provider.username}. They will reach out to you soon!`);
    }, 1000);
    
    // In a real implementation, you would track the contact in your backend:
    // this.http.post(`http://127.0.0.1:8000/api/contact/${this.roomId}/`, {}, 
    //   { headers: new HttpHeaders().set('Authorization', `Token ${localStorage.getItem('token')}`) }
    // ).subscribe({
    //   next: () => {
    //     this.contactStatus = 'success';
    //   },
    //   error: (err) => {
    //     this.contactStatus = 'error';
    //     this.contactError = 'Failed to contact provider. Please try again later.';
    //     console.error('Error contacting provider:', err);
    //   }
    // });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }
}