import cron from 'node-cron';
import Mining from '../models/Mining.js';
import User from '../models/Users.js';

const miningJob = cron.schedule('* * * * * *', async () => {
    // console.log(1234, "its mining");
    try {
        const users = await Mining.find({ isMining: true });

        // Update mining balances for each user
        users.forEach(async (user) => {

            if (user.startTime) {
                const elapsedTime = Date.now() - user.startTime.getTime();
                const miningBalance = user.miningRate;
               
                user.totalMined += miningBalance;
                await user.save(); 
            } else {
                console.warn('startTime is undefined for user:', user._id);
            }
        });
    } catch (error) {
        console.error('Error updating mining balances:', error);
    }
});

// Export the scheduled job
export default miningJob;
