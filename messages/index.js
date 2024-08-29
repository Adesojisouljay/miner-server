const messages = {
    // Withdrawal Emails
    withdrawalEmail: (username, withdrawalToken) => `
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
    
      We’re writing to inform you that your withdrawal request for **${amount} ${currency}** has been canceled.
  
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
};

export default messages;
