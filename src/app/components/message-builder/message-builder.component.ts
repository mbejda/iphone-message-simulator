import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomMessage } from '../../models/message.model';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-message-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-builder.component.html',
  styleUrls: ['./message-builder.component.scss']
})
export class MessageBuilderComponent {
  contactName: string = 'Friend';
  messages: CustomMessage[] = [];
  newMessage: CustomMessage = this.createEmptyMessage();
  isPlaying: boolean = false;
  isLoopMode: boolean = false;
  
  // Character limits
  readonly MAX_CONTACT_NAME_LENGTH: number = 20;
  readonly MAX_MESSAGE_LENGTH: number = 200;

  constructor(private messageService: MessageService) {
    // Subscribe to the playing state
    this.messageService.playing$.subscribe(isPlaying => {
      this.isPlaying = isPlaying;
    });
    
    // Subscribe to the loop mode state
    this.messageService.loop$.subscribe(isLoopEnabled => {
      this.isLoopMode = isLoopEnabled;
    });
    
    // Initialize contact name
    this.contactName = this.contactName.substring(0, this.MAX_CONTACT_NAME_LENGTH);
    this.messageService.setContactName(this.contactName);
  }
  
  /**
   * Toggle loop mode for animations
   */
  toggleLoopMode(): void {
    this.isLoopMode = !this.isLoopMode;
    this.messageService.setLoopMode(this.isLoopMode);
  }
  
  /**
   * Update contact name with character limit
   */
  updateContactName(): void {
    // Enforce character limit
    this.contactName = this.contactName.substring(0, this.MAX_CONTACT_NAME_LENGTH);
    this.messageService.setContactName(this.contactName);
  }

  /**
   * Create an empty message template
   */
  createEmptyMessage(): CustomMessage {
    return {
      text: '',
      isReceived: true,
      delayBefore: 1000,
      showTypingIndicator: true,
      showDelivered: false,
      showRead: false
    };
  }

  /**
   * Add a new message to the sequence
   */
  addMessage(): void {
    if (!this.newMessage.text.trim()) {
      return;
    }
    
    // Enforce character limit
    const trimmedText = this.newMessage.text.substring(0, this.MAX_MESSAGE_LENGTH);
    
    // Clone the message to avoid reference issues
    const messageCopy: CustomMessage = {
      text: trimmedText,
      isReceived: this.newMessage.isReceived,
      delayBefore: this.newMessage.delayBefore,
      showTypingIndicator: this.newMessage.isReceived ? this.newMessage.showTypingIndicator : false,
      showDelivered: !this.newMessage.isReceived ? this.newMessage.showDelivered : false,
      showRead: !this.newMessage.isReceived ? this.newMessage.showRead : false
    };
    
    this.messages.push(messageCopy);
    
    // Reset the form with a new empty message
    this.newMessage = this.createEmptyMessage();
  }

  /**
   * Remove a message from the sequence
   */
  removeMessage(index: number): void {
    if (index >= 0 && index < this.messages.length) {
      this.messages.splice(index, 1);
    }
  }

  /**
   * Move a message up in the sequence
   */
  moveUp(index: number): void {
    if (index > 0) {
      const temp = this.messages[index];
      this.messages[index] = this.messages[index - 1];
      this.messages[index - 1] = temp;
    }
  }

  /**
   * Move a message down in the sequence
   */
  moveDown(index: number): void {
    if (index < this.messages.length - 1) {
      const temp = this.messages[index];
      this.messages[index] = this.messages[index + 1];
      this.messages[index + 1] = temp;
    }
  }

  /**
   * Play the custom message sequence
   */
  playSequence(): void {
    if (this.messages.length === 0) {
      return;
    }
    
    // Update the contact name in the service
    this.messageService.setContactName(this.contactName);
    
    // Play the sequence
    this.messageService.playCustomSequence([...this.messages]);
  }

  /**
   * Clear all messages in the sequence
   */
  clearSequence(): void {
    this.messages = [];
  }
}