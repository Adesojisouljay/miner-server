import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import depositRoutes from './routes/depositRoutes.js';
import userRoutes from './routes/userRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import miningRoutes from "./routes/miningRoutes.js"
import merchantRoutes from './routes/merchants.js';
import transactionRoute from "./routes/transactionRoutes.js"
import kycRoute from "./routes/kycRoutes.js"
import crytpoData from "./routes/cryptoDataRoutes.js"
import connectDB from './mongoDb.js';
// import miningJob  from './shedule-job/sheduleJobs.js';
import watchHiveBlocks from './shedule-job/watchHiveJobs.js';
import cors from "cors"
import { updateCryptos } from './utils/updateCryptos.js';
import { initializeSocketIO } from './sockets/index.js';

const app = express();
const server = http.createServer(app);
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
app.use('/api/merchant', merchantRoutes);
app.use("/api/transactions", transactionRoute);
app.use("/api/kyc", kycRoute);
app.use("/api/crypto-data", crytpoData);

// miningJob.start();
watchHiveBlocks.start();
updateCryptos.start()

initializeSocketIO(server)

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
