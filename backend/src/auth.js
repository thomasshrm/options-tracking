import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

export const signToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
};

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Missing authorization header.' });
  }
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
};
