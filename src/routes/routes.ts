import Router from 'koa-router';
import clientRoutes from './clientRoutes';
import messagesRoutes from './messagesRoutes';

const router = new Router();

router.use(clientRoutes.routes());
router.use(clientRoutes.allowedMethods());

router.use(messagesRoutes.routes());
router.use(messagesRoutes.allowedMethods());

export default router;
