// server.js

import express from 'express';
import bodyParser from 'body-parser';
import depositRoutes from './routes/depositRoutes.js';
import userRoutes from './routes/userRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import miningRoutes from "./routes/miningRoutes.js"
import adminRoutes from './routes/adminApplication.js';
import connectDB from './mongoDb.js';
import miningJob  from './shedule-job/sheduleJobs.js';
import watchHiveTransaction  from './shedule-job/hiveJobs.js';
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 2000;

// const corsOptions = {
//   origin: 'http://example.com', // Allow requests from this origin
//   optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
// };

app.use(cors());


// Middleware
app.use(bodyParser.json());

connectDB();

// Routes
app.use('/api/deposits', depositRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/mining', miningRoutes);
app.use('/api/admin', adminRoutes);

miningJob.start();
watchHiveTransaction.start();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
