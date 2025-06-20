import Router from 'koa-router';
import OpenAI from 'openai';
import { ChatCompletionUserMessageParam, ChatCompletionAssistantMessageParam, ChatCompletionSystemMessageParam } from 'openai/resources/chat';
import { AppDataSource } from '../db/config';
import { Client } from '../models/Client';
import { Message } from '../models/Message';

const router = new Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'TU_API_KEY_AQUI',
});

const autosDisponibles = [
  { modelo: 'Ferrari 488 GTB', precio: '$220.000.000', tipo: 'coupé', año: 2020 },
  { modelo: 'Lamborghini Huracán EVO', precio: '$250.000.000', tipo: 'coupé', año: 2021 },
  { modelo: 'Porsche 911 Turbo S', precio: '$190.000.000', tipo: 'coupé', año: 2022 },
  { modelo: 'Ferrari Roma', precio: '$230.000.000', tipo: 'coupé', año: 2023 },
  { modelo: 'Lamborghini Urus', precio: '$210.000.000', tipo: 'SUV', año: 2022 },
];


function mapRole(role: string): 'user' | 'assistant' {
  return role === 'client' ? 'user' : 'assistant';
}


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
      ctx.body = { error: 'Cliente no encontrado' };
      return;
    }

    const sortedMessages = client.messages.sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );

    // Verifica si el último mensaje fue del cliente
    const ultimoMensaje = sortedMessages[sortedMessages.length - 1];
    if (!ultimoMensaje || ultimoMensaje.role !== 'client') {
      ctx.body = { message: 'Esperando nuevo mensaje del cliente para continuar la conversación.' };
      return;
    }

    const autosTexto = autosDisponibles
      .map((auto) => `${auto.modelo} (${auto.tipo}, ${auto.año}) - ${auto.precio}`)
      .join('\n');

    const chatHistory: (
      | ChatCompletionUserMessageParam
      | ChatCompletionAssistantMessageParam
      | ChatCompletionSystemMessageParam
    )[] = [
      {
        role: 'system',
        content: `Eres Santiago, un asesor de automóviles experto en ventas en Chile. 
                  Estás manteniendo una conversación en curso con un cliente interesado en comprar un auto.
                  Solo vendes autos nuevos de Ferrari, Lamborghini y Porsche, en las sucursales de Vitacura y Lo Barnechea.

                  Tu objetivo es ayudarlo a encontrar el auto ideal con amabilidad y profesionalismo.

                  Autos disponibles:
                  ${autosTexto}`,
      },
      ...sortedMessages.map((msg) => ({
        role: mapRole(msg.role),
        content: msg.text,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatHistory,
    });

    const respuesta = completion.choices[0].message.content;

    // Guardar el nuevo mensaje del agente
    const mensajeGenerado = messageRepo.create({
      text: respuesta || '',
      role: 'agent',
      sentAt: new Date(),
      client,
    });

    await messageRepo.save(mensajeGenerado);

    ctx.body = { message: respuesta };
  } catch (error) {
    console.error('❌ Error generando y guardando mensaje:', error);
    ctx.status = 500;
    ctx.body = { error: 'No se pudo generar ni guardar el mensaje de IA' };
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

