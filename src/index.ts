import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { AppDataSource } from './db/config';
import clientRoutes from './routes/clientRoutes';

const app = new Koa();
const router = new Router();

AppDataSource.initialize().then(() => {
  console.log('📦 Base de datos conectada');

  router.use(clientRoutes.routes());
  app
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods());

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});
