import Router from 'koa-router';
import { AppDataSource } from '../db/data-source';
import { Client } from '../models/Client';
import { MoreThan, LessThan } from 'typeorm';

const router = new Router();

router.get('/clients', async (ctx) => {
  const repo = AppDataSource.getRepository(Client);
  ctx.body = await repo.find();
});

router.get('/clients/:id', async (ctx) => {
  const repo = AppDataSource.getRepository(Client);
  const client = await repo.findOne({
    where: { id: Number(ctx.params.id) },
    relations: ['messages', 'deudas'],
  });
  if (!client) {
    ctx.status = 404;
    ctx.body = { error: 'Cliente no encontrado' };
  } else {
    ctx.body = client;
  }
});

router.get('/clients-to-do-follow-up', async (ctx) => {
  const repo = AppDataSource.getRepository(Client);
  const clients = await repo
    .createQueryBuilder('client')
    .leftJoinAndSelect('client.messages', 'message')
    .where(
      `(SELECT MAX("sentAt") FROM "message" WHERE "message"."clientId" = client.id) < NOW() - INTERVAL '7 days'`
    )
    .getMany();

  ctx.body = clients;
});

router.post('/client', async (ctx) => {
  const { name, rut, messages, deudas } = ctx.request.body;
  const repo = AppDataSource.getRepository(Client);

  const newClient = repo.create({
    name,
    rut,
    messages,
    deudas,
  });

  await repo.save(newClient);
  ctx.status = 201;
  ctx.body = newClient;
});

export default router;
