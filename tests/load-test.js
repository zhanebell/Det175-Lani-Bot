// Load test for Lani Bot API using k6
// Run with: k6 run load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 VUs
    { duration: '1m', target: 30 },   // Stay at 30 VUs
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of requests under 1.5s
    http_req_failed: ['rate<0.1'],     // Less than 10% failure rate
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080';

export default function () {
  // Health check
  let healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check returns ok': (r) => JSON.parse(r.body).ok === true,
  });

  sleep(1);

  // Chat request (will fail without Turnstile, but tests rate limiting)
  const payload = JSON.stringify({
    messages: [{ role: 'user', content: 'What is the F-15?' }],
    llab_numbers: [2],
    quiz_mode: 'mixed',
    turnstile_token: 'test-token',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let chatRes = http.post(`${BASE_URL}/chat`, payload, params);
  check(chatRes, {
    'chat endpoint responds': (r) => r.status !== 0,
    'not internal server error': (r) => r.status !== 500,
  });

  sleep(2);

  // Static question
  const staticPayload = JSON.stringify({ llab_numbers: [2, 4] });
  let staticRes = http.post(`${BASE_URL}/static-question`, staticPayload, params);
  check(staticRes, {
    'static question status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
