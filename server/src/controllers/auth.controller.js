import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  devLogin as devLoginService,
} from '../services/auth.service.js';
import { config } from '../config/env.js';

export const googleRedirect = (req, res) => {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (err) {
    console.warn('[AuthController] Google redirect failed:', err.message);
    res.redirect(`${config.frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
};

export const googleCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${config.frontendUrl}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${config.frontendUrl}/login?error=missing_auth_code`);
  }

  try {
    const { user, token } = await handleGoogleCallback(code);

    res.cookie(config.cookie.name, token, config.cookie.options);
    return res.redirect(`${config.frontendUrl}/?auth=success`);
  } catch (err) {
    console.error('[AuthController] Google callback error:', err.message);
    return res.redirect(`${config.frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
};

export const getCurrentUser = (req, res) => {
  // req.user was populated by authMiddleware
  res.json({
    user: req.user,
  });
};

export const logout = (req, res) => {
  res.clearCookie(config.cookie.name, {
    ...config.cookie.options,
    maxAge: 0,
  });

  res.json({
    message: 'Logged out successfully',
  });
};

export const devLogin = async (req, res) => {
  if (config.nodeEnv === 'production') {
    return res.status(403).json({
      error: 'Development login is disabled in production',
    });
  }

  try {
    const { email, name, avatar } = req.body || {};
    const { user, token } = await devLoginService({ email, name, avatar });

    res.cookie(config.cookie.name, token, config.cookie.options);

    res.json({
      user,
      token,
      message: 'Dev authentication successful',
    });
  } catch (err) {
    console.error('[AuthController] Dev login error:', err.message);
    res.status(500).json({
      error: 'Dev authentication failed: ' + err.message,
    });
  }
};
