import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, concat } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Message, TypingState, CustomMessage } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  private typingSubject = new BehaviorSubject<TypingState>({ isTyping: false, contact: 'Friend' });
  public typing$ = this.typingSubject.asObservable();
  
  private playingSubject = new BehaviorSubject<boolean>(false);
  public playing$ = this.playingSubject.asObservable();
  
  private loopSubject = new BehaviorSubject<boolean>(false);
  public loop$ = this.loopSubject.asObservable();
  
  private messagesData: Message[] = [];
  private contactName: string = 'Friend';
  private isLoopEnabled: boolean = false;

  constructor() {}

  /**
   * Shows the typing indicator
   */
  private showTypingIndicator(): Observable<boolean> {
    this.typingSubject.next({ isTyping: true, contact: this.contactName });
    return of(true).pipe(delay(1500)); // Show typing for 1.5 seconds
  }
  
  /**
   * Hides the typing indicator
   */
  private hideTypingIndicator(): void {
    this.typingSubject.next({ isTyping: false, contact: this.contactName });
  }

  /**
   * Simulates the conversation flow with appropriate timing
   */
  public simulateConversation(): void {
    // Clear any existing messages
    this.messagesData = [];
    this.messagesSubject.next(this.messagesData);
    
    // Set playing state to true
    this.playingSubject.next(true);
    
    // Create an initial sequence
    let sequence = of(null).pipe(
      // First show typing indicator
      tap(() => this.typingSubject.next({ isTyping: true, contact: this.contactName })),
      delay(1500), // Typing indicator duration
      
      // First message
      tap(() => this.hideTypingIndicator()),
      tap(() => {
        const message = this.addReceivedMessage('Hey there! How are you doing today?');
      }),
      delay(2000), // Wait 2 seconds
      
      // Second message (with read receipts)
      tap(() => {
        const sentMessage = this.addSentMessage('I\'m doing great! Working on this cool animation project.');
        
        // Show delivered and read indicators for demo purposes
        setTimeout(() => {
          const index = this.messagesData.findIndex(m => m.id === sentMessage.id);
          if (index !== -1) {
            this.messagesData[index].isDelivered = true;
            this.messagesSubject.next([...this.messagesData]);
          }
        }, 500);
        
        setTimeout(() => {
          const index = this.messagesData.findIndex(m => m.id === sentMessage.id);
          if (index !== -1) {
            this.messagesData[index].isRead = true;
            this.messagesSubject.next([...this.messagesData]);
          }
        }, 1000);
      }),
      delay(2000), // Wait 2 seconds
      
      // Third message (with typing indicator)
      tap(() => this.typingSubject.next({ isTyping: true, contact: this.contactName })),
      delay(1500), // Typing indicator duration
      tap(() => this.hideTypingIndicator()),
      tap(() => {
        const message = this.addReceivedMessage('That sounds awesome! Can I see it when you\'re done?');
      }),
      delay(2500), // Wait 2.5 seconds
      
      // Fourth message (with delivered only)
      tap(() => {
        const sentMessage = this.addSentMessage('Absolutely! I\'ll send it to you as soon as it\'s ready.');
        
        // Show delivered indicator
        setTimeout(() => {
          const index = this.messagesData.findIndex(m => m.id === sentMessage.id);
          if (index !== -1) {
            this.messagesData[index].isDelivered = true;
            this.messagesSubject.next([...this.messagesData]);
          }
        }, 500);
      }),
      delay(3000) // Wait 3 seconds
    );
    
    // If in loop mode, don't fade away; if not, fade at the end
    if (this.isLoopEnabled) {
      sequence = sequence.pipe(
        tap(() => {
          // In loop mode, restart the animation after a delay
          this.playingSubject.next(false);
          setTimeout(() => {
            this.simulateConversation();
          }, 2000);
        })
      );
    } else {
      // Standard mode with fade away
      sequence = sequence.pipe(
        // Fade all messages and reset state
        tap(() => this.fadeAwayAllMessages()),
        tap(() => this.playingSubject.next(false))
      );
    }
    
    // Start the sequence
    sequence.subscribe();
  }

  /**
   * Adds a received message and returns the message object for further manipulation
   */
  private addReceivedMessage(text: string): Message {
    const message: Message = {
      id: Date.now(),
      text: text,
      isReceived: true,
      timestamp: new Date(),
      isAnimated: false,
      isFadingAway: false
    };
    
    // Add message first without animation
    this.messagesData.push(message);
    this.messagesSubject.next([...this.messagesData]);
    
    // Then trigger animation after a short delay
    setTimeout(() => {
      message.isAnimated = true;
      this.messagesSubject.next([...this.messagesData]);
    }, 100);
    
    return message;
  }

  /**
   * Adds a sent message and returns the message object for further manipulation
   */
  private addSentMessage(text: string): Message {
    const message: Message = {
      id: Date.now(),
      text: text,
      isReceived: false,
      timestamp: new Date(),
      isAnimated: false,
      isFadingAway: false
    };
    
    // Add message first without animation
    this.messagesData.push(message);
    this.messagesSubject.next([...this.messagesData]);
    
    // Then trigger animation after a short delay
    setTimeout(() => {
      message.isAnimated = true;
      this.messagesSubject.next([...this.messagesData]);
    }, 100);
    
    return message;
  }

  /**
   * Makes all messages fade away
   */
  private fadeAwayAllMessages(): void {
    // Make all messages fade away
    this.messagesData.forEach(message => {
      message.isFadingAway = true;
    });
    this.messagesSubject.next([...this.messagesData]);
    
    // Clear messages after fade animation completes
    setTimeout(() => {
      this.messagesData = [];
      this.messagesSubject.next(this.messagesData);
    }, 1500); // Animation duration
  }
  
  /**
   * Plays a custom sequence of messages
   * @param messages Array of custom messages to display
   */
  public playCustomSequence(messages: CustomMessage[]): void {
    if (messages.length === 0) {
      return;
    }
    
    // Set playing state to true to disable UI
    this.playingSubject.next(true);
    
    // Clear any existing messages
    this.messagesData = [];
    this.messagesSubject.next(this.messagesData);
    
    // Create an initial observable
    let sequence = of(null);
    
    // Chain each message in the sequence
    messages.forEach(message => {
      // Add delay before the message
      sequence = sequence.pipe(
        delay(message.delayBefore)
      );
      
      // Show typing indicator if needed
      if (message.isReceived && message.showTypingIndicator) {
        sequence = sequence.pipe(
          tap(() => this.showTypingIndicator()),
          delay(1500), // Typing indicator duration
          tap(() => this.hideTypingIndicator())
        );
      }
      
      // Add the message
      sequence = sequence.pipe(
        tap(() => {
          if (message.isReceived) {
            this.addReceivedMessage(message.text);
          } else {
            const sentMessage = this.addSentMessage(message.text);
            
            // Handle Delivered status
            if (message.showDelivered) {
              setTimeout(() => {
                const index = this.messagesData.findIndex(m => m.id === sentMessage.id);
                if (index !== -1) {
                  this.messagesData[index].isDelivered = true;
                  this.messagesSubject.next([...this.messagesData]);
                }
              }, 1000);
            }
            
            // Handle Read status
            if (message.showRead) {
              setTimeout(() => {
                const index = this.messagesData.findIndex(m => m.id === sentMessage.id);
                if (index !== -1) {
                  this.messagesData[index].isRead = true;
                  this.messagesSubject.next([...this.messagesData]);
                }
              }, 2000);
            }
          }
        })
      );
    });
    
    // If in loop mode, don't fade away; if not, fade at the end
    if (this.isLoopEnabled) {
      sequence = sequence.pipe(
        delay(3000),
        tap(() => {
          // In loop mode, restart with the same messages
          this.playingSubject.next(false);
          setTimeout(() => {
            this.playCustomSequence(messages);
          }, 2000);
        })
      );
    } else {
      // Add final fade-away after last message
      sequence = sequence.pipe(
        delay(3000), 
        tap(() => this.fadeAwayAllMessages()),
        // Set playing state back to false when complete
        tap(() => this.playingSubject.next(false))
      );
    }
    
    // Start the sequence
    sequence.subscribe();
  }
  
  /**
   * Update the contact name
   * @param name New contact name
   */
  public setContactName(name: string): void {
    this.contactName = name || 'Friend';
    // Update typing indicator if it's currently visible
    if (this.typingSubject.value.isTyping) {
      this.typingSubject.next({ 
        isTyping: true, 
        contact: this.contactName 
      });
    }
  }
  
  /**
   * Set loop mode for animations
   * @param isEnabled Whether loop mode is enabled
   */
  public setLoopMode(isEnabled: boolean): void {
    this.isLoopEnabled = isEnabled;
    this.loopSubject.next(isEnabled);
  }
}
