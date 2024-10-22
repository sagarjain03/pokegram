// const jwt = require('jsonwebtoken');
// const isAutheticated  = async (req, res, next) => {
//   try{
//     const token = req.cookies.token;
//     if(!token){
//       return res.status(401).json({ message: 'Unauthorized', success: false });
//     }
//     const decode = await jwt.verify(token, process.env.SECRET_KEY);
//     if(!decode){
//       return res.status(401).json({ message: 'Unauthorized', success: false });
//     }
//     req.id = decode.userId;
//     next();
//   }catch(error){
//     return res.status(500).json({ message: 'Internal server error', success: false });
//   }
// }

// module.exports = isAutheticated


const jwt = require('jsonwebtoken');
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).json({ message: 'Unauthorized', success: false });
    }
    // Use 'id' instead of 'userId'
    req.id = decode.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
};

module.exports = isAuthenticated;
