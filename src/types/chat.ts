export interface ChatConversation {
  id: string;
  counterpartName: string;
  counterpartRole: string;
  itemTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  status: 'VERIFYING' | 'RESOLVED' | 'DISPUTED';
  initialPesanVerifikasi?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other' | 'system';
  text: string;
  time: string;
  imageUrl?: string;
}

export interface SelectedImageAttachment {
  dataUrl: string;
  name: string;
  size: number;
}
