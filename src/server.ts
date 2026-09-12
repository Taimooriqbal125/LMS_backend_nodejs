// server.ts
import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

// Define port with type annotation and fallback
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Start server with typed callback
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
});
