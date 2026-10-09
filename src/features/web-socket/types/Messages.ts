export interface Messages {
  value?: string;
  origin: "Client" | "Server";
  userId?: string;
  messageId: string;
  timeSent: Date;
  type?: string;
  target?: string | null;
  seen?: boolean;
}