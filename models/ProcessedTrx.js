import mongoose from 'mongoose';

const ProcessedTrxSchema = new mongoose.Schema({
    trxId: {
        type: String,
        required: true,
    },
});

const ProcessedTrx = mongoose.model('ProcessedTrx', ProcessedTrxSchema);

export default ProcessedTrx;
