import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  fluid: true,
  regions: ['fra1'],
  crons: [{ path: '/api/refresh', schedule: '30 7 * * *' }],
};
