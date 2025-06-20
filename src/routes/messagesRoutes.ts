import Router from 'koa-router';
import { AppDataSource } from '../db/config';
import { Client } from '../models/Client';
import { Message } from '../models/Message';
import { shouldRespondToClient, sortMessagesChronologically } from '../utils/messageUtils';
import { buildChatHistory, generateAIResponse } from '../services/aiResponder';

const router = new Router();

router.get('/clients/:id/generateMessage', async (ctx) => {
  try {
    const clientId = Number(ctx.params.id);
    const clientRepo = AppDataSource.getRepository(Client);
    const messageRepo = AppDataSource.getRepository(Message);

    const client = await clientRepo.findOne({
      where: { id: clientId },
      relations: ['messages'],
    });

    if (!client) {
      ctx.status = 404;
      ctx.body = { error: 'Client not found' };
      return;
    }

    const sortedMessages = sortMessagesChronologically(client.messages);

    if (!shouldRespondToClient(sortedMessages)) {
      ctx.body = { message: 'Waiting for a new message from the client.' };
      return;
    }

    const chatHistory = buildChatHistory(sortedMessages);
    const aiReply = await generateAIResponse(chatHistory);

    const savedMessage = messageRepo.create({
      text: aiReply,
      role: 'agent',
      sentAt: new Date(),
      client,
    });

    await messageRepo.save(savedMessage);
    ctx.body = { message: aiReply };
  } catch (error) {
    console.error('❌ Error generating and saving AI message:', error);
    ctx.status = 500;
    ctx.body = { error: 'Could not generate or save the AI message.' };
  }
});

router.post('/clients/:id/message', async (ctx) => {
  try {
    const clientId = Number(ctx.params.id);
    const { text, sentAt, role } = ctx.request.body as {
      text: string;
      sentAt: string;
      role: 'client' | 'agent';
    };

    const clientRepo = AppDataSource.getRepository(Client);
    const messageRepo = AppDataSource.getRepository(Message);

    const client = await clientRepo.findOne({ where: { id: clientId } });

    if (!client) {
      ctx.status = 404;
      ctx.body = { error: 'Cliente no encontrado' };
      return;
    }

    const message = messageRepo.create({
      text,
      role,
      sentAt: new Date(sentAt),
      client,
    });

    await messageRepo.save(message);

    ctx.status = 201;
    ctx.body = message;
  } catch (error) {
    console.error('❌ Error al guardar el mensaje:', error);
    ctx.status = 500;
    ctx.body = { error: 'Error al guardar el mensaje para el cliente' };
  }
});



export default router;

