// nextjs-nodejsbackend-reactfrontend-2026/backend/routes/day25routes/day25Routes.js
import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';

import {
    testPropsController,
    testuseParamsController,
    testuseSearchParamsController,
    testuseRouterController,
    testLinkingController,
} from '../../controllers/day25controllers/day25Controller.js';

const day25Router = express.Router();

day25Router.get('/test', protect, testPropsController);
day25Router.get('/useParams', protect, testuseParamsController);
day25Router.get('/useSearchParams', protect, testuseSearchParamsController);
day25Router.get('/useRouter', protect, testuseRouterController);
day25Router.get('/linking', protect, testLinkingController);    

export default day25Router;

