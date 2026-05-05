import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FRONTEND_URL',
  'ENCRYPTION_KEY'
];

requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    console.error(`MISSING ENV: ${key} - Please add this in the platform settings.`);
  }
});

export const env = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL,
  PORT: 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || null,
};
