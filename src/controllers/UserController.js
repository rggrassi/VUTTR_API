const User = require('../models/User');

module.exports = {
  create: async (req, res) => {
    const { email } = req.value.body;
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'User not available' });
    }    

    req.value.body.role = 'user';

    const user = await User.create(req.value.body);  
    
    return res.status(201).json(user);
  },
  update: async (req, res) => {
    const { name, email, password, oldPassword, role } = req.value.body;
  
    /**
     * Checks if [id] passed by parameter matches the registered user
     */
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    /**
     * Checks if the user is trying to update data from other users. 
     * Because only admin users have this permission.
     */
    if (req.user.role === 'user' && req.user._id !== req.params.id) {
      return res.status(401).json({ message: 'Only admins can update any user' });
    }
  
    if (email && email !== user.email) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User not available' });
      }
    }
  
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ message: 'Wrong credentials' });
    }
  
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password;
    if (req.user.role === 'user') {
      user.role = 'user'; 
    } else {
      user.role = role || user.role; 
    }
  
    const updatedUser = await user.save();
    return res.json(updatedUser);
  }
}