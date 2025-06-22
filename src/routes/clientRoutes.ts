import Router from 'koa-router';
import { AppDataSource } from '../db/config';
import { Client } from '../models/Client';
import { ClientPayload } from '../utils/types';


const router = new Router();

router.get('/clients', async (ctx) => {
  const repo = AppDataSource.getRepository(Client);
  ctx.body = await repo.find();
});

router.get('/clients/:id', async (ctx) => {
  const repo = AppDataSource.getRepository(Client);
  const client = await repo.findOne({
    where: { id: Number(ctx.params.id) },
    relations: ['messages', 'debts'],
  });
  if (!client) {
    ctx.status = 404;
    ctx.body = { error: 'Client not found' };
  } else {
    ctx.body = client;
  }
});

router.get('/clients-to-do-follow-up', async (ctx) => {
  const repo = AppDataSource.getRepository(Client);

  const clients = await repo
    .createQueryBuilder('client')
    .where(
      `(SELECT MAX("sentAt") FROM "message" WHERE "message"."clientId" = client.id) < NOW() - INTERVAL '7 days'`
    )
    .select(['client.id', 'client.name', 'client.rut']) 
    .getMany(); 

  ctx.body = clients;
});



router.post('/client', async (ctx) => {
  try {
    const body = ctx.request.body as ClientPayload;
    const { name, rut, messages, debts } = body;

    const repo = AppDataSource.getRepository(Client);

    const newClient = repo.create({
      name,
      rut,
      messages: messages.map((msg) => ({
        ...msg,
        sentAt: new Date(msg.sentAt),
      })),
      debts: debts.map((debt) => ({
        ...debt,
        dueDate: new Date(debt.dueDate),
      })),
    });

    await repo.save(newClient);

    ctx.status = 201;
    ctx.body = newClient;
  } catch (error) {
    console.error('❌ Error saving client', error);
    ctx.status = 500;
    ctx.body = {
      error: 'Error saving client. Please verify the data and try again.',
    };
  }
});


export default router;
