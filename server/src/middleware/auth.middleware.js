import { verifyToken, getUserById } from "../services/auth.service.js";
import { config } from "../config/env.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check httpOnly cookie
    if (req.cookies && req.cookies[config.cookie.name]) {
      token = req.cookies[config.cookie.name];
    }
    // 2. Check Authorization header (Bearer <token>)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: Authentication token required",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized: Token is invalid or expired",
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token payload",
      });
    }

    // Fetch user
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized: User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error:", error.message);
    return res.status(500).json({
      error: "Internal server error during authentication verification",
    });
  }
};

export default authMiddleware;
