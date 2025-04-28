import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

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
  image?: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
  room_id: number;
}

@Component({
  selector: 'app-roomview',
  templateUrl: './roomview.component.html',
  styleUrls: ['./roomview.component.css']
})
export class RoomviewComponent implements OnInit, OnDestroy {
  roomId: number = 0;
  room: Room | null = null;
  loading: boolean = true;
  error: string | null = null;
  defaultImage = './assets/room.jpg';
  showChatWindow: boolean = false;
  
  // Chat properties
  chatMessages: ChatMessage[] = [];
  chatForm: FormGroup;
  sendingMessage: boolean = false;
  currentUsername: string = '';
  isProvider: boolean = false;
  chatPollingSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Initialize the chat form
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
    
    // Get current user info
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      this.currentUsername = parsedInfo.username;
      this.isProvider = parsedInfo.isProvider || false;
    }
  }

  ngOnInit(): void {
    // Get room ID from route params
    this.route.params.subscribe(params => {
      this.roomId = +params['id'];
      this.fetchRoomDetails();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.chatPollingSubscription) {
      this.chatPollingSubscription.unsubscribe();
    }
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

  openChatWindow(): void {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    // if (!token) {
    //   this.router.navigate(['/login'], { 
    //     queryParams: { redirect: `/roomview/${this.roomId}` } 
    //   });
    //   return;
    // }
    
    this.showChatWindow = true;
    this.fetchChatHistory();
    
    // Start polling for new messages every 5 seconds
    this.startChatPolling();
  }

  closeChatWindow(): void {
    this.showChatWindow = false;
    
    // Stop polling for messages
    if (this.chatPollingSubscription) {
      this.chatPollingSubscription.unsubscribe();
      this.chatPollingSubscription = null;
    }
  }
  
  startChatPolling(): void {
    // Poll for new messages every 5 seconds
    this.chatPollingSubscription = interval(5000).subscribe(() => {
      this.fetchChatHistory();
    });
  }

  fetchChatHistory(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    
    // Fetch chat history for this room
    this.http.get<ChatMessage[]>(`http://127.0.0.1:8000/api/rooms/${this.roomId}/messages/`, { headers })
      .subscribe({
        next: (messages) => {
          this.chatMessages = messages;
          
          // Scroll to bottom of chat after a short delay to ensure DOM updates
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },
        error: (err) => {
          console.error('Error fetching chat messages:', err);
        }
      });
  }

  sendChatMessage(): void {
    if (this.chatForm.invalid) {
      return;
    }

    const message = this.chatForm.value.message;
    this.sendingMessage = true;

    const token = localStorage.getItem('token');
    if (!token) return;
    
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    
    // Send the chat message to the API
    this.http.post<ChatMessage>('http://127.0.0.1:8000/api/messages/', {
      room_id: this.roomId,
      message: message
    }, { headers }).subscribe({
      next: (response) => {
        // Add the new message to the chat
        this.chatMessages.push(response);
        
        // Reset form and sending state
        this.chatForm.reset({ message: '' });
        this.sendingMessage = false;
        
        // Scroll to bottom of chat
        this.scrollToBottom();
      },
      error: (err) => {
        this.sendingMessage = false;
        console.error('Error sending message:', err);
      }
    });
  }

  scrollToBottom(): void {
    // Scroll the chat container to the bottom
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  formatMessageTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }
  
  getRoomImage(): string {
    return this.room?.image || this.defaultImage;
  }
  
  isOwnMessage(sender: string): boolean {
    return sender === this.currentUsername;
  }
}