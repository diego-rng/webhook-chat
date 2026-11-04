import Messages from '../../../types/Messages.ts';

export default function onClientOpen(
  ws: WebSocket,
  id: string,
  conversationId: string,
  sendHeartbeat: () => void,
): ReturnType<typeof setInterval> {
  console.log('[Client] Connected.');
  const identMessage: Messages = {
    messageId: crypto.randomUUID(),
    type: 'identification-msg',
    userId: id,
    target: conversationId,
    origin: 'Client',
    timeSent: new Date(),
  };
  ws.send(JSON.stringify(identMessage));

  sendHeartbeat();
  return setInterval(sendHeartbeat, 5000);
}
