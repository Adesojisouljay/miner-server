import { getTransactionFee } from "../../crypto/tron/index.js";

const baseFee = 1;
const congestionFee = 0.5;

export const getTrxFee = async (req, res) => {
    const { fromAddress, toAddress } = req.params;

    try {
        const response = await getTransactionFee(fromAddress, toAddress);
        console.log("object", response);

        const energyFee = parseFloat(response.energyFee);

        let totalFee;

        if (energyFee < baseFee) {
            totalFee = baseFee;
        } else {
            totalFee = baseFee + congestionFee;
        }

        res.json({
            success: true,
            fee: {
                energyFee: response.energyFee,
                totalFee: totalFee.toFixed(4)
            }
        });
    } catch (error) {
        console.error('Error getting transaction fee:', error);
        res.status(500).json({ success: false, error });
    }
}

