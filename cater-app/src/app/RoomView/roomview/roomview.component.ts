import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  image?: string; // Optional image property
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
  defaultImage = './assets/room.jpg'; // Path to default image
  showMessageWindow: boolean = false;
  messageForm: FormGroup;
  sendingMessage: boolean = false;
  messageSent: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Initialize the form
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
      contactMethod: ['email', Validators.required],
      contactInfo: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get room ID from route params
    this.route.params.subscribe(params => {
      this.roomId = +params['id']; // Convert to number
      this.fetchRoomDetails();
    });
  }

  fetchRoomDetails(): void {
    this.loading = true;
    
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
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
    // Toggle the message window
    this.showMessageWindow = true;
  }

  closeMessageWindow(): void {
    this.showMessageWindow = false;
    this.messageSent = false;
    this.messageForm.reset({
      message: '',
      contactMethod: 'email',
      contactInfo: ''
    });
  }

  sendMessage(): void {
    if (this.messageForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.messageForm.controls).forEach(key => {
        const control = this.messageForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.sendingMessage = true;

    // Simulate sending a message with a delay
    setTimeout(() => {
      // In a real app, you would send this to your API
      const messageData = {
        room_id: this.roomId,
        provider_username: this.room?.provider.username,
        message: this.messageForm.value.message,
        contact_method: this.messageForm.value.contactMethod,
        contact_info: this.messageForm.value.contactInfo
      };
      
      console.log('Message sent:', messageData);
      
      // Show success state
      this.sendingMessage = false;
      this.messageSent = true;
      
      // Reset form after successful send
      this.messageForm.reset({
        message: '',
        contactMethod: 'email',
        contactInfo: ''
      });
      
      // Close window after a delay
      setTimeout(() => {
        this.closeMessageWindow();
      }, 3000);
    }, 1500);
    
    // In real implementation, you would use HTTP POST:
    /*
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    
    this.http.post('http://127.0.0.1:8000/api/messages/', {
      room_id: this.roomId,
      message: this.messageForm.value.message,
      contact_method: this.messageForm.value.contactMethod,
      contact_info: this.messageForm.value.contactInfo
    }, { headers }).subscribe({
      next: (response) => {
        this.sendingMessage = false;
        this.messageSent = true;
        
        // Reset form after successful send
        this.messageForm.reset({
          message: '',
          contactMethod: 'email',
          contactInfo: ''
        });
        
        // Close window after a delay
        setTimeout(() => {
          this.closeMessageWindow();
        }, 3000);
      },
      error: (err) => {
        this.sendingMessage = false;
        console.error('Error sending message:', err);
        // Handle error state
      }
    });
    */
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }
  
  getRoomImage(): string {
    // Return room image if exists, otherwise default image
    return this.room?.image || this.defaultImage;
  }
}