/**
 * Message model representing a text message in the iPhone simulation
 */
export interface Message {
  id: number;
  text: string;
  isReceived: boolean;
  timestamp: Date;
  isAnimated: boolean;
  isFadingAway: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
}

/**
 * Typing indicator state
 */
export interface TypingState {
  isTyping: boolean;
  contact: string;
}

/**
 * Custom message for the message builder
 */
export interface CustomMessage {
  text: string;
  isReceived: boolean;
  delayBefore: number;
  showTypingIndicator?: boolean;
  showDelivered?: boolean;
  showRead?: boolean;
}
