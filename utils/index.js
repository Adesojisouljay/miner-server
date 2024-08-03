import User from "../models/Users.js";

export const generateUserMemo = async () => {
    let memo;
    let isUnique = false;
  
    while (!isUnique) {
      // Generate a 10-digit random number
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