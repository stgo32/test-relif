import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { AppDataSource } from './db/config';
import router from './routes/routes';

const app = new Koa();

AppDataSource.initialize().then(() => {
  console.log('📦 Base de datos conectada');

  app.use(async (ctx, next) => {
    console.log(`🛰️  ${ctx.method} ${ctx.url}`);
    await next();
  })

  app
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
