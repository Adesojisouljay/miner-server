const messages = {
    // Withdrawal Emails
    sendWithdrawalToken: (username, withdrawalToken) => `
      Dear ${username},
    
      We hope this message finds you well. We noticed that you've initiated a withdrawal request on your EkzaTrade account. To ensure your security, we’ve generated a unique withdrawal token just for you.
  
      🔐 **Your Secure Withdrawal Token**: **${withdrawalToken}**
  
      Please enter this token within the next 15 minutes to complete your transaction. This is a one-time use code and will expire promptly to protect your account.
  
      **Why this extra step?**
      At EkzaTrade, your security is our top priority. This token adds an additional layer of protection, ensuring that your funds are safe and only accessible by you.
  
      If you didn’t request this withdrawal or have any concerns, please reach out to our support team immediately at [Support Email/Contact Info]. We're here to help 24/7.
  
      Thank you for choosing EkzaTrade. We’re proud to be your trusted partner in trading.
  
      Warm regards,
  
      The EkzaTrade Team
      [ekzatrade@outlook.com]
    `,
    withdrawalSubject: 'Withdrawal Token from EkzaTrade',

    withdrawalCompletedEmail: (username, amount, currency) => `
      Dear ${username},
    
      We’re pleased to inform you that your withdrawal request for **${amount} ${currency}** has been successfully processed.
  
      **Transaction Details:**
      - Amount: **${amount} ${currency}**
      - Status: **Completed**
  
      If you have any questions or did not authorize this transaction, please contact our support team immediately.
  
      Thank you for choosing EkzaTrade.
  
      Warm regards,
  
      The EkzaTrade Team
      [ekzatrade@outlook.com]
    `,
    withdrawalCompletedSubject: 'Withdrawal Completed',

    withdrawalReceivedEmail: (username, amount, currency) => `
      Dear ${username},
    
      Your withdrawal request for **${amount} ${currency}** has been received and is being processed.
  
      **Transaction Details:**
      - Amount: **${amount} ${currency}**
      - Status: **Confirmed**
  
      Thank you for choosing EkzaTrade. We’ll notify you once the funds have been successfully transferred.
  
      Warm regards,
  
      The EkzaTrade Team
      [ekzatrade@outlook.com]
    `,
    withdrawalReceivedSubject: 'Withdrawal Request Received',

    withdrawalCanceledEmail: (username, amount, currency) => `
      Dear ${username},
    
      We’re writing to inform you that your withdrawal request for **${amount} ${currency}** has been canceled and fund has been reversed to your account.

      Kindly check you balance to confirm reversal.
  
      **Transaction Details:**
      - Amount: **${amount} ${currency}**
      - Status: **Canceled**
  
      If you did not authorize this cancellation, please contact our support team immediately.
  
      Thank you for choosing EkzaTrade.
  
      Warm regards,
  
      The EkzaTrade Team
      [ekzatrade@outlook.com]
    `,
    withdrawalCanceledSubject: 'Your Withdrawal Request Has Been Canceled',

    // Deposit Emails
    depositReceivedEmail: (username, amount, currency) => `
      Dear ${username},
    
      We’re pleased to inform you that your deposit of **${amount} ${currency}** has been received and credited to your EkzaTrade account.
  
      **Transaction Details:**
      - Amount: **${amount} ${currency}**
      - Status: **Confirmed**
  
      You can now use these funds to continue trading on our platform.
  
      If you have any questions or concerns, please contact our support team.
  
      Thank you for choosing EkzaTrade.
  
      Warm regards,
  
      The EkzaTrade Team
      [ekzatrade@outlook.com]
    `,
    depositReceivedSubject: 'Deposit Received and Credited',

    depositFailedEmail: (username, amount, currency) => `
      Dear ${username},
    
      We regret to inform you that your deposit of **${amount} ${currency}** could not be processed.
  
      **Transaction Details:**
      - Amount: **${amount} ${currency}**
      - Status: **Failed**
  
      Please ensure that all details are correct and try again. If you continue to experience issues, contact our support team for assistance.
  
      Thank you for choosing EkzaTrade.
  
      Warm regards,
  
      The EkzaTrade Team
      [ekzatrade@outlook.com]
    `,
    depositFailedSubject: 'Deposit Failed',

    depositPendingEmail: (username, amount, currency) => `
      Dear ${username},
    
      Your deposit of **${amount} ${currency}** is currently being processed.
  
      **Transaction Details:**
      - Amount: **${amount} ${currency}**
      - Status: **Pending**
  
      Please note that it may take a few minutes for your deposit to be confirmed. We’ll notify you as soon as the funds are credited to your account.
  
      Thank you for your patience and for choosing EkzaTrade.
  
      Warm regards,
  
      The EkzaTrade Team
      [ekzatrade@outlook.com]
    `,
    depositPendingSubject: 'Deposit Pending Confirmation',
    failedLoginAttemptsEmail: (username) => `
    Dear ${username},

    We noticed multiple failed login attempts on your EkzaTrade account. For your security, your account has been temporarily suspended for 1 hour.

    **What to do next?**
    Please try logging in again after the suspension period has ended. If you believe this action was taken in error or have any concerns, please contact our support team immediately at [ekzatrade@outlook.com].

    Your account security is very important to us, and we're here to assist you with any issues you might have.

    Thank you for your understanding.

    Warm regards,

    The EkzaTrade Team
    [ekzatrade@outlook.com]
  `,
  failedLoginAttemptsSubject: 'Account Temporarily Suspended Due to Failed Login Attempts',
  cryptoDepositProcessingEmail: (username, amount, currency, transactionId) => `
  Dear ${username},
  
  We want to inform you that your deposit of **${amount} ${currency}** is currently being processed.

  **Transaction Details:**
  - Amount: **${amount} ${currency}**
  - Status: **Processing**
  - Transaction ID: [${transactionId}](https://blockstream.info/testnet/tx/${transactionId})

  Please allow some time for the transaction to be completed. We will notify you as soon as your deposit is confirmed.

  Thank you for your patience and for choosing EkzaTrade.

  Warm regards,

  The EkzaTrade Team
  [ekzatrade@outlook.com]
`,
cryptoDepositProcessingSubject: 'Your Deposit is Being Processed',
cryptoDepositConfirmedEmail: (username, amount, currency, transactionId) => `
  Dear ${username},
  
  We are pleased to confirm that your deposit of **${amount} ${currency}** has been successfully completed and credited to your EkzaTrade account.

  **Transaction Details:**
  - Amount: **${amount} ${currency}**
  - Status: **Confirmed**
  - Transaction ID: [${transactionId}](https://blockstream.info/testnet/tx/${transactionId})

  You can now use these funds for trading on our platform.

  If you have any questions or concerns, please feel free to reach out to our support team.

  Thank you for choosing EkzaTrade.

  Warm regards,

  The EkzaTrade Team
  [ekzatrade@outlook.com]
`,
cryptoDepositConfirmedSubject: 'Deposit Confirmed and Credited',
};

export default messages;
