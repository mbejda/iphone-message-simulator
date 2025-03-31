import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { Subscription, interval } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { Message, TypingState } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-iphone',
  templateUrl: './iphone.component.html',
  styleUrls: ['./iphone.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('bubbleAnimation', [
      // Initial state before animation
      state('false', style({
        opacity: 0,
        transform: 'scale(0.3)',
      })),
      // Animated state
      state('true', style({
        opacity: 1,
        transform: 'scale(1)',
      })),
      // Animation for received messages
      transition('false => true', [
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
    ]),
    trigger('fadeAway', [
      // Initial state
      state('false', style({
        opacity: 1
      })),
      // Fading away state
      state('true', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      // Fade away animation
      transition('false => true', [
        animate('1000ms ease-out')
      ])
    ])
  ]
})
export class IphoneComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  typingState: TypingState = { isTyping: false, contact: 'Friend' };
  currentTime: Date = new Date();
  isIMessage: boolean = true; // Default to iMessage (blue bubbles)
  isLoopMode: boolean = false; // Default to no loop
  private subscription: Subscription = new Subscription();
  private timeInterval: any;
  constructor(
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Subscribe to the messages observable
    this.subscription.add(
      this.messageService.messages$.subscribe(messages => {
        this.messages = messages;
      })
    );
    
    // Subscribe to the typing indicator observable
    this.subscription.add(
      this.messageService.typing$.subscribe(typingState => {
        this.typingState = typingState;
      })
    );
    
    // Subscribe to the loop mode observable
    this.subscription.add(
      this.messageService.loop$.subscribe(isLoopEnabled => {
        this.isLoopMode = isLoopEnabled;
      })
    );
    
    // Update the time every minute
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
    
    // Start the conversation simulation after a short delay
    setTimeout(() => {
      this.messageService.simulateConversation();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscription.unsubscribe();
    
    // Clear time interval
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  /**
   * Restart the conversation simulation
   */
  restartConversation(): void {
    this.messageService.simulateConversation();
  }

  /**
   * Format the timestamp for display
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  /**
   * Toggle between iMessage (blue) and SMS (green) bubble styles
   */
  toggleMessageStyle(): void {
    this.isIMessage = !this.isIMessage;
  }
  
  /**
   * Toggle loop mode for animations
   */
  toggleLoopMode(): void {
    this.isLoopMode = !this.isLoopMode;
    this.messageService.setLoopMode(this.isLoopMode);
  }
}
