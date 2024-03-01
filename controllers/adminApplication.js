import User from '../models/Users.js';
import AdminApplication from '../models/AdminApplication.js';

export const applyForAdmin = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'User is already an admin' });
    }

    const application = new AdminApplication({
      userId: userId,
      reason: reason,
      status: 'Pending'
    });
    await application.save();

    res.status(200).json({ success: true, message: 'Admin application submitted successfully' });
  } catch (error) {
    console.error('Error submitting admin application:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
