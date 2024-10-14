import { calculateTransactionFee } from "../../crypto/bitcoin/helper.js";

export const getBitcoinFee = async (req, res) => {
    // const { coinId } = req.params;

    try {
        const response = await calculateTransactionFee();
        console.log("object", response);

        res.json({
            success: true,
            response
        });
    } catch (error) {
        console.error('Error getting transaction fee:', error);
        res.status(500).json({ success: false, error });
    }
}

