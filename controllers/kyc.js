import KYC from '../models/Kyc.js';

export const submitKYC = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, otherName, idDocument, selfie } = req.body;

    let kyc = await KYC.findOne({ userId });
    if (!kyc) {
      kyc = new KYC({
        userId,
        firstName,
        lastName,
        otherName,
        idDocument,
        selfie,
        kycStatus: 'pending'
      });
    } else {
      kyc.firstName = firstName;
      kyc.lastName = lastName;
      kyc.otherName = otherName;
      kyc.idDocument = idDocument;
      kyc.selfie = selfie;
      kyc.kycStatus = 'pending';
    }

    await kyc.save();
    
    res.status(200).json({ success: true, message: 'KYC documents submitted successfully' });
  } catch (error) {
    console.error('Error submitting KYC:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const approveKyc = async (req, res) => {
  try {
    const { kycId } = req.params;

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    kyc.kycStatus = 'verified';
    await kyc.save();

    res.status(200).json({ success: true, message: 'KYC record verified successfully' });
  } catch (error) {
    console.error('Error verifying KYC:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const rejectKyc = async (req, res) => {
  try {
    const { kycId } = req.params;

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    kyc.kycStatus = 'rejected';
    await kyc.save();

    res.status(200).json({ success: true, message: 'KYC record rejected successfully' });
  } catch (error) {
    console.error('Error rejecting KYC:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getAllKyc = async (req, res) => {
    console.log("object....")
  try {
    const kycs = await KYC.find();
    console.log(kycs)

    res.status(200).json({ success: true, data: kycs });
  } catch (error) {
    console.error('Error fetching KYC records:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};