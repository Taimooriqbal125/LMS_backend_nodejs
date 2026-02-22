declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_REFRESH_SECRET: string;
      JWT_REFRESH_EXPIRES_IN: string;
      PORT?: string;
      NODE_ENV: 'development' | 'production' | 'test';
      EMAIL_USER: string;
      EMAIL_PASS: string;
      EMAIL_FROM: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
    }
  }
}

// If it's a declaration file, we need this to make it a module
export { };