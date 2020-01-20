const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports = { 
  create: async (req, res) => {
    const { email, password } = req.value.body;
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: 'Could not find your account' });
    }

    /**
     * Check if the user is confirmed  
    */    
    if (!user.confirmed) {
      return res.status(401).json({ message: 'Unable to change an unverified user' });
    }
  
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Wrong credentials' });
    }
  
    const { _id, name, role } = user;
  
    return res.json({
      user: { _id, name, email, role },
      token: jwt.sign({ _id, name, email, role }, process.env.APP_SECRET, {
        expiresIn: "7d"
      })
    });
  }
};