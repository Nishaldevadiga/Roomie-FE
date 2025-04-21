// home.component.ts
import { Component, OnInit } from '@angular/core';
import { OpenaiService } from '../../service/openai.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isChatOpen = false;
  userInput = '';
  messages: { text: string; isBot: boolean }[] = [
    { text: 'Hello! I\'m Roomie AI. How can I help you today?', isBot: true }
  ];
  
  // Store conversation history for OpenAI context
  private conversationHistory: { role: string, content: string }[] = [
    { role: 'system', content: 'You are Roomie AI, a helpful assistant for a roommate finding service. Provide short, helpful responses about finding roommates, housing, and related topics. Keep responses under 150 words.' },
    { role: 'assistant', content: 'Hello! I\'m Roomie AI. How can I help you today?' }
  ];
  
  isLoading = false;
  isAuthenticated = false;

  constructor(
    private openaiService: OpenaiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    this.isAuthenticated = !!localStorage.getItem('auth_token');
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    
    // If user is not authenticated and tries to open chat, show login message
    if (this.isChatOpen && !this.isAuthenticated) {
      this.messages = [{ 
        text: 'Please log in to chat with Roomie AI.',
        isBot: true 
      }];
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;
    
    // Check if user is authenticated
    if (this.isAuthenticated) {
      this.messages.push({ 
        text: 'Please log in to use the AI assistant.',
        isBot: true 
      });
      return;
    }

    const userMessage = this.userInput.trim();
    this.messages.push({ text: userMessage, isBot: false });
    
    // Add user message to conversation history
    this.conversationHistory.push({ role: 'user', content: userMessage });
    
    // Clear input and show loading state
    this.userInput = '';
    this.isLoading = true;
    
    // Call OpenAI service (now through your backend)
    this.openaiService.getChatCompletion(this.conversationHistory).subscribe(
      (response) => {
        const botResponse = response.choices[0].message.content;
        
        // Add bot response to messages array and conversation history
        this.messages.push({ text: botResponse, isBot: true });
        this.conversationHistory.push({ role: 'assistant', content: botResponse });
        
        this.isLoading = false;
        
        // Scroll to bottom of chat window
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      },
      (error) => {
        console.error('Error getting response from OpenAI:', error);
        
        // Handle authentication errors
        if (error.status === 401 || error.status === 403) {
          this.isAuthenticated = false;
          this.messages.push({ 
            text: 'Your session has expired. Please log in again.',
            isBot: true 
          });
        } else {
          this.messages.push({ 
            text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
            isBot: true 
          });
        }
        this.isLoading = false;
      }
    );
  }
  
  private scrollToBottom(): void {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}