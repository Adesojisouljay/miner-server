import mongoose from 'mongoose';
import User from '../models/Users.js';

const migrateUsers = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/your_database_name');
        console.log("........object")

        const users = await User.find({});
        for (const user of users) {
            let updated = false;

            if (user.hiveBalance === undefined) {
                user.hiveBalance = 0;
                updated = true;
            }
            if (user.hbdBalance === undefined) {
                user.hbdBalance = 0;
                updated = true;
            }
            if (user.nairaBalance === undefined) {
                user.nairaBalance = 0;
                updated = true;
            }
            if (user.totalUsdValue === undefined) {
                user.totalUsdValue = 0;
                updated = true;
            }

            // Check and remove old balance field if it exists
            if (user.balance !== undefined) {
                user.balance = undefined;
                updated = true;
            }

            if (updated) {
                await user.save();
                console.log(`Updated user ${user._id} with default balance fields`);
            }
        }

        console.log('Migration completed.');
        mongoose.connection.close();
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

export default migrateUsers
// migrateUsers();
