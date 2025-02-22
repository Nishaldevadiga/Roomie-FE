import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isChatOpen = false;
  userInput = '';
  messages: { text: string; isBot: boolean }[] = [
    { text: 'Hello! I\'m Roomie AI. How can I help you today?', isBot: true }  // Fixed apostrophe
  ];

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Add user message
    this.messages.push({ text: this.userInput, isBot: false });
    
    // Simulate bot response
    setTimeout(() => {
      this.messages.push({ 
        text: 'I\'m still learning! For now, please contact our support team for detailed questions.', // Fixed apostrophe
        isBot: true 
      });
    }, 1000);

    this.userInput = '';
  }
}

