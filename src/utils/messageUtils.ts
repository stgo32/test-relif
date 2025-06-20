import { Message } from '../models/Message';

export function sortMessagesChronologically(messages: Message[]): Message[] {
  return messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

export function shouldRespondToClient(messages: Message[]): boolean {
  const lastClientMessage = [...messages].reverse().find((m) => m.role === 'client');
  const lastAgentMessage = [...messages].reverse().find((m) => m.role === 'agent');

  return !!lastClientMessage &&
    (!lastAgentMessage || new Date(lastClientMessage.sentAt) > new Date(lastAgentMessage.sentAt));
}
