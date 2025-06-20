interface MessageInput {
  text: string;
  sentAt: string; 
  role: 'client' | 'agent';
}

interface DebtInput {
  amount: number;
  institution: string;
  dueDate: string; 
}

interface ClientPayload {
  name: string;
  rut: string;
  messages: MessageInput[];
  debts: DebtInput[]; 
}


export { MessageInput, DebtInput, ClientPayload };