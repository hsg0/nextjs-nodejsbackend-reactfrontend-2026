import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';

import {
    testPropsController,
    testuseParamsController,
    testuseSearchParamsController,
    testuseRouterController,
    testLinkingController,
} from '../../controllers/day26controllers/day26Controller.js';

const day26Router = express.Router();

day26Router.get('/test', protect, testPropsController);
day26Router.get('/useParams', protect, testuseParamsController);
day26Router.get('/useSearchParams', protect, testuseSearchParamsController);
day26Router.get('/useRouter', protect, testuseRouterController);
day26Router.get('/linking', protect, testLinkingController);

export default day26Router;
