import User from "../models/Users.js";
import crypto from 'crypto';

export const generateUserMemo = async () => {
    let memo;
    let isUnique = false;
  
    while (!isUnique) {
      memo = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  
      const existingUser = await User.findOne({ 'assets.memo': memo });
      
      if (!existingUser) {
        isUnique = true;
      }
    }
  
    return memo;
  };

  export const validatePassword = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    console.log(regex.test(password))
    return regex.test(password);
  };

  export const encryptPrivateKey = (privateKey) => {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
  
      
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Error encrypting private key:', error);
      throw new Error('Encryption failed');
    }
  };

  export const decryptPrivateKey = (encryptedData) => {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Error decrypting private key:', error);
      throw new Error('Decryption failed');
    }
  }; 
  