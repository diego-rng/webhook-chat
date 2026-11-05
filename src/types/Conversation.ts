interface Member {
  id: string & {readonly __charLength: 36};
  conversation_id: string;
  user_id: string;
}

export default interface Conversation {
  conversationId: string & {readonly __charLength: 36};
  conversationName: string | null;
  conversationCreator: string; 
  conversationMembers: Member[];
}
