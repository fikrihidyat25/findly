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
  pengklaimId?: string;
  pelaporId?: string;
  pengklaimName?: string;
  pelaporName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other' | 'system';
  senderName?: string;
  senderRole?: 'pengklaim' | 'pelapor' | 'admin';
  text: string;
  time: string;
  imageUrl?: string;
}

export interface SelectedImageAttachment {
  dataUrl: string;
  name: string;
  size: number;
}
