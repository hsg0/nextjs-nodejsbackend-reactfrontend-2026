// nextjs-reactjs-practice-2026/backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
// Import routes
import authRouter from './routes/authRoutes.js';
import userDataRouter from './routes/userDataRoutes.js';
import userRouter from './routes/userRoutes.js';
import day18Router from './routes/day18routes/day18Routes.js';
import day20Router from './routes/day20routes/day20Routes.js';
import day21Router from './routes/day21routes/day21routes.js';
import day23Router from './routes/day23routes/day23Routes.js';
// import day76AIRouter from './routes/day76routes/day76AIRoutes.js';
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
    cors({
        origin: function (origin, callback) {
            const allowedOrigins = [
                //development origins
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                "http://192.168.0.105:3000",
                "http://192.168.0.105:3001",
                //production origins
                'https://your-production-domain.com',
            ];
            if (!origin){
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error('CORS policy violation: Origin not allowed'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
    );

app.use(express.json({ limit: '10mb' }));

app.use(cookieParser());

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server is healthy' });
});

// routes
app.use('/web/api/auth', authRouter);
app.use('/web/api/data', userDataRouter);
app.use('/web/api/users', userRouter);

// rotes based on days
app.use('/web/api/day18', day18Router);
app.use('/web/api/day20', day20Router);
app.use('/web/api/day21', day21Router);
app.use('/web/api/day23', day23Router);
// app.use('/web/api/dayAI76', day76AIRouter);

app.listen(PORT, () => {
    console.log(`Next.js React.js Practice Backend Server running on port http://localhost:${PORT}`);
});
    