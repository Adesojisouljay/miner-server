const messages = {
  welcomeEmail: (username) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>
          Welcome to Ekzatrade, your new home for secure and seamless crypto trading! We're excited to have you join our growing community of traders.
      </p>
      <p>
          At <a href="https://ezabay.com" style="color: #1a0dab;">ezabay.com</a>, you’ll find a range of features designed to make your trading experience smooth and rewarding:
      </p>
      <ul>
          <li><strong>Wide Selection of Cryptocurrencies</strong>: Trade a variety of popular digital assets with ease.</li>
          <li><strong>Secure Platform</strong>: We prioritize your security with advanced measures to protect your assets.</li>
          <li><strong>24/7 Support</strong>: Our dedicated support team is here to assist you anytime.</li>
      </ul>
      <p>
          To get started, log in to your account and explore the platform. If you need any help, don't hesitate to reach out to our support team.
      </p>

      <p>
          Thank you for choosing ezabay.com. We look forward to supporting your trading journey.
      </p>

      <p>Warm regards,<br>The ezabay Team<br><a href="mailto:support@ezabay.com">support@ezabay.com</a></p>
  </div>
`,
welcomeSubject: 'Welcome to Ekzatrade - Your Crypto Trading Hub',

loginDetectedEmail: (username, ipAddress, userAgent) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
  <img src="https://ekza.vercel.app/static/media/logo-cut.7ed5421e82e0651cd749.png" alt="EkzaTrade Logo" style="max-width: 100px; margin-bottom: 20px;" />
      <h4>Dear ${username},</h4>
      <p>We detected a login to your EkzaTrade account from a new device or location. If this was you, no further action is required.</p>

      <h5>Login Details:</h5>
      <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Device:</strong> ${userAgent}</p>
      <p><strong>Location:</strong> ${ipAddress}</p>

      <p>If you did not attempt to log in, please secure your account immediately by changing your password. You can do this by logging into your account or reaching out to our support team.</p>

      <p>Your account security is our top priority, and we want to ensure your information is safe.</p>

      <p>Thank you for your attention to this matter.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br><a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
loginDetectedSubject: 'New Login Detected on Your Ekzatrade Account',

sendWithdrawalToken: (username, withdrawalToken) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We hope this message finds you well. We noticed that you've initiated a withdrawal request on your Ekzatrade account. To ensure your security, we’ve generated a unique withdrawal token just for you.</p>

      <p><strong>🔐 Your Secure Withdrawal Token:</strong> <strong>${withdrawalToken}</strong></p>

      <p>Please enter this token within the next 15 minutes to complete your transaction. This is a one-time use code and will expire promptly to protect your account.</p>

      <p><strong>Why this extra step?</strong><br>At EkzaTrade, your security is our top priority. This token adds an additional layer of protection, ensuring that your funds are safe and only accessible by you.</p>

      <p>If you didn’t request this withdrawal or have any concerns, please reach out to our support team immediately. We're here to help 24/7.</p>

      <p>Thank you for choosing EkzaTrade. We’re proud to be your trusted partner in trading.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br><a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
withdrawalSubject: 'Withdrawal Token from EkzaTrade',
sendPasswordResetToken: (username, resetToken) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We received a request to reset the password associated with your EkzaTrade account. To help you securely reset your password, we’ve generated a unique reset token just for you.</p>

      <p><strong>🔐 Your Password Reset Token:</strong> <strong>${resetToken}</strong></p>

      <p>Please enter this token within the next 15 minutes to proceed with resetting your password. This token is for one-time use only and will expire shortly for your security.</p>

      <p><strong>Why this extra step?</strong><br>At EkzaTrade, safeguarding your account is our top priority. The password reset token ensures that only authorized users can make changes to your account.</p>

      <p>If you did not request a password reset or have any security concerns, please contact our support team immediately. We’re available 24/7 to assist you.</p>

      <p>Thank you for being a valued EkzaTrade user. We’re committed to ensuring your account remains safe and secure.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br><a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
passwordResetSubject: 'Password Reset Token from EkzaTrade',


withdrawalCompletedEmail: (username, amount, currency) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We’re pleased to inform you that your withdrawal request for <strong>${amount} ${currency}</strong> has been successfully processed.</p>

      <h5>Transaction Details:</h5>
      <p><strong>Amount:</strong> ${amount} ${currency}</p>
      <p><strong>Status:</strong> Completed</p>

      <p>If you have any questions or did not authorize this transaction, please contact our support team immediately.</p>

      <p>Thank you for choosing EkzaTrade.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br><a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
withdrawalCompletedSubject: 'Withdrawal Completed',

withdrawalReceivedEmail: (username, amount, currency) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>Your withdrawal request for <strong>${amount} ${currency}</strong> has been received and is being processed.</p>

      <h5>Transaction Details:</h5>
      <p><strong>Amount:</strong> ${amount} ${currency}</p>
      <p><strong>Status:</strong> Confirmed</p>

      <p>Thank you for choosing EkzaTrade. We’ll notify you once the funds have been successfully transferred.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br><a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
withdrawalReceivedSubject: 'Withdrawal Request Received',

withdrawalCanceledEmail: (username, amount, currency) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We’re writing to inform you that your withdrawal request for <strong>${amount} ${currency}</strong> has been canceled and funds have been reversed to your account.</p>

      <p>Kindly check your balance to confirm the reversal.</p>

      <h5>Transaction Details:</h5>
      <p><strong>Amount:</strong> ${amount} ${currency}<br>
      <strong>Status:</strong> Canceled</p>

      <p>If you did not authorize this cancellation, please contact our support team immediately.</p>

      <p>Thank you for choosing EkzaTrade.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br>
      <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
withdrawalCanceledSubject: 'Your Withdrawal Request Has Been Canceled',

// Deposit Emails
depositReceivedEmail: (username, amount, currency) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We’re pleased to inform you that your deposit of <strong>${amount} ${currency}</strong> has been received and credited to your EkzaTrade account.</p>

      <h5>Transaction Details:</h5>
      <p><strong>Amount:</strong> ${amount} ${currency}<br>
      <strong>Status:</strong> Confirmed</p>

      <p>You can now use these funds to continue trading on our platform.</p>

      <p>If you have any questions or concerns, please contact our support team.</p>

      <p>Thank you for choosing EkzaTrade.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br>
      <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
depositReceivedSubject: 'Deposit Received and Credited',

depositFailedEmail: (username, amount, currency) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We regret to inform you that your deposit of <strong>${amount} ${currency}</strong> could not be processed.</p>

      <h5>Transaction Details:</h5>
      <p><strong>Amount:</strong> ${amount} ${currency}<br>
      <strong>Status:</strong> Failed</p>

      <p>Please ensure that all details are correct and try again. If you continue to experience issues, contact our support team for assistance.</p>

      <p>Thank you for choosing EkzaTrade.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br>
      <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
depositFailedSubject: 'Deposit Failed',

depositPendingEmail: (username, amount, currency) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>Your deposit of <strong>${amount} ${currency}</strong> is currently being processed.</p>

      <h5>Transaction Details:</h5>
      <p><strong>Amount:</strong> ${amount} ${currency}<br>
      <strong>Status:</strong> Pending</p>

      <p>Please note that it may take a few minutes for your deposit to be confirmed. We’ll notify you as soon as the funds are credited to your account.</p>

      <p>Thank you for your patience and for choosing EkzaTrade.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br>
      <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
depositPendingSubject: 'Deposit Pending Confirmation',

failedLoginAttemptsEmail: (username) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We noticed multiple failed login attempts on your EkzaTrade account. For your security, your account has been temporarily suspended for 1 hour.</p>

      <h5>What to do next?</h5>
      <p>Please try logging in again after the suspension period has ended. If you believe this action was taken in error or have any concerns, please contact our support team immediately at <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a>.</p>

      <p>Your account security is very important to us, and we're here to assist you with any issues you might have.</p>

      <p>Thank you for your understanding.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br>
      <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,
failedLoginAttemptsSubject: 'Account Temporarily Suspended Due to Failed Login Attempts',

cryptoDepositProcessingEmail: (username, amount, currency, transactionId) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Dear ${username},</p>

      <p>We want to inform you that your deposit of <strong>${amount} ${currency}</strong> is currently being processed.</p>

      <h5>Transaction Details:</h5>
      <p><strong>Amount:</strong> ${amount} ${currency}<br>
      <strong>Status:</strong> Processing<br>
      <strong>Transaction ID:</strong> <a href="https://blockstream.info/testnet/tx/${transactionId}">${transactionId}</a></p>

      <p>Please allow some time for the transaction to be completed. We will notify you as soon as your deposit is confirmed.</p>

      <p>Thank you for your patience and for choosing EkzaTrade.</p>

      <p>Warm regards,<br>The EkzaTrade Team<br>
      <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
  </div>
`,

cryptoDepositProcessingSubject: 'Your Deposit is Being Processed',
  
cryptoDepositConfirmedEmail: (username, amount, currency, transactionId) => `
  <p>Dear ${username},</p>

  <p>We are pleased to confirm that your deposit of <strong>${amount} ${currency}</strong> has been successfully completed and credited to your EkzaTrade account.</p>

  <p><strong>Transaction Details:</strong></p>
  <ul>
    <li>Amount: <strong>${amount} ${currency}</strong></li>
    <li>Status: <strong>Confirmed</strong></li>
    <li>Transaction ID: <a href="https://blockstream.info/testnet/tx/${transactionId}">${transactionId}</a></li>
  </ul>

  <p>You can now use these funds for trading on our platform.</p>

  <p>If you have any questions or concerns, please feel free to reach out to our support team.</p>

  <p>Thank you for choosing EkzaTrade.</p>

  <p>Warm regards,</p>

  <p>The EkzaTrade Team<br>
  <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
`,

cryptoDepositConfirmedSubject: 'Deposit Confirmed and Credited',

kycSubmissionEmail: (username) => `
  <p>Dear ${username},</p>

  <p>Thank you for submitting your KYC (Know Your Customer) documents to EkzaTrade. We have received your documents and will begin reviewing them shortly.</p>

  <p><strong>What to expect next:</strong></p>
  <ul>
    <li>Our verification team will review your submission.</li>
    <li>We will notify you via email once the review is complete or if any additional information is required.</li>
  </ul>

  <p>The review process may take up to 48 hours. If you have any questions or need assistance during this time, feel free to contact our support team.</p>

  <p>Thank you for choosing EkzaTrade. Your compliance helps us maintain a secure and trustworthy platform.</p>

  <p>Warm regards,</p>

  <p>The EkzaTrade Team<br>
  <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
`,

kycSubmissionSubject: 'KYC Submission Received - Under Review',

kycApprovalEmail: (username) => `
  <p>Dear ${username},</p>

  <p>Congratulations! Your KYC (Know Your Customer) verification has been successfully approved. You now have full access to all the features and benefits of EkzaTrade.</p>

  <p><strong>What this means for you:</strong></p>
  <ul>
    <li>Increased account limits for trading and withdrawals.</li>
    <li>Full access to all trading pairs and features on our platform.</li>
  </ul>

  <p>Thank you for completing the KYC process and helping us maintain a safe trading environment. If you have any further questions, our support team is always here to assist you.</p>

  <p>Warm regards,</p>

  <p>The EkzaTrade Team<br>
  <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
`,

kycApprovalSubject: 'KYC Verification Approved - Welcome to Full Access',

kycRejectionEmail: (username) => `
  <p>Dear ${username},</p>

  <p>We regret to inform you that your KYC (Know Your Customer) verification has not been approved at this time.</p>

  <p><strong>Reason for rejection:</strong></p>
  <ul>
    <li>The submitted documents did not meet our verification requirements.</li>
  </ul>

  <p>To resolve this, we encourage you to re-submit your documents. Please ensure that the documents are clear, legible, and meet our guidelines. You can upload your updated documents by logging into your EkzaTrade account.</p>

  <p>If you need further assistance or have questions, please contact our support team.</p>

  <p>Thank you for your understanding.</p>

  <p>Warm regards,</p>

  <p>The EkzaTrade Team<br>
  <a href="mailto:ekzatrade@outlook.com">ekzatrade@outlook.com</a></p>
`,

kycRejectionSubject: 'KYC Verification Unsuccessful - Action Required',
};

export default messages;
