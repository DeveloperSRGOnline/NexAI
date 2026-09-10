import http from 'http';
import app from './src/app.js';
import { config } from './src/config/env.js';

async function runTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`[E2E Test] Test server running on ${baseUrl}`);

  try {
    // 1. Health check
    console.log('[Test 1] Testing /health...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error(`Health check failed with status ${healthRes.status}`);
    }
    console.log('✓ Health check passed');

    // 2. Unauthenticated /auth/me
    console.log('[Test 2] Testing unauthenticated /auth/me...');
    const unauthRes = await fetch(`${baseUrl}/auth/me`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401, got ${unauthRes.status}`);
    }
    console.log('✓ Protected route correctly rejects unauthenticated request');

    // 3. Dev login
    console.log('[Test 3] Testing /auth/dev-login...');
    const loginRes = await fetch(`${baseUrl}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@nexai.test', name: 'Alex Johnson' }),
    });

    if (loginRes.status !== 200) {
      throw new Error(`Dev login failed with status ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    if (!loginData.user || !loginData.token) {
      throw new Error('Dev login response missing user or token');
    }

    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie || !setCookie.includes('token=')) {
      throw new Error('HttpOnly cookie not set in response headers');
    }
    console.log('✓ Dev login issued JWT and set httpOnly cookie');

    // Extract cookie value for subsequent requests
    const tokenCookie = setCookie.split(';')[0];

    // 4. Authenticated /auth/me using cookie
    console.log('[Test 4] Testing authenticated /auth/me with cookie...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: tokenCookie },
    });

    if (meRes.status !== 200) {
      throw new Error(`Authenticated /auth/me failed with status ${meRes.status}`);
    }

    const meData = await meRes.json();
    if (meData.user?.email !== 'alex@nexai.test') {
      throw new Error(`Expected email alex@nexai.test, got ${meData.user?.email}`);
    }
    console.log(`✓ Session successfully authenticated: ${meData.user.name} (${meData.user.email})`);

    // 5. Authenticated /auth/me using Bearer token (for Chrome Extension companion)
    console.log('[Test 5] Testing authenticated /auth/me with Bearer token...');
    const bearerRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });

    if (bearerRes.status !== 200) {
      throw new Error(`Bearer auth failed with status ${bearerRes.status}`);
    }
    console.log('✓ Bearer token header authentication succeeded (Extension compatible)');

    // 6. Logout
    console.log('[Test 6] Testing /auth/logout...');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: tokenCookie },
    });

    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed with status ${logoutRes.status}`);
    }

    const logoutCookie = logoutRes.headers.get('set-cookie');
    if (!logoutCookie || !logoutCookie.includes('token=;') && !logoutCookie.includes('Max-Age=0')) {
      throw new Error('Logout did not clear cookie');
    }
    console.log('✓ Logout successfully cleared authentication cookie');

    console.log('\n=======================================');
    console.log('🎉 ALL 6 AUTHENTICATION TESTS PASSED!');
    console.log('=======================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ E2E test failed:', err);
  process.exit(1);
});
