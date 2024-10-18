const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
module.exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required', success: false });
  }
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: 'User already exists', success: false });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully', success: true, user: newUser });
}

module.exports.login = async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required', success: false });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials', success: false });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials', success: false });
    }
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.cookie('token', token, { httpOnly: true, sameSite: 'strict',maxage: 24*60*60*1000 }).status(200).json({ message: 'Login successful', success: true, user: user });
   
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
}

module.exports.logout = (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful', success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
}

module.exports.getProfile = async (req, res) => {
  try{
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    return res.status(200).json({ success: true, user });
  }catch(error){
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
}
module.exports.editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId);
    if (bio) {
      user.bio = bio;
    }
    if (gender) {
      user.gender = gender;
    }
    if (profilePicture) {
      user.profilePicture = cloudResponse.url;
    }
    await user.save();
    return res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
}
// 1:40:00