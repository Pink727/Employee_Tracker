import pkg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from a .env file into process.env
dotenv.config();

const { Pool } = pkg;

// Create a new pool instance to manage connections to the PostgreSQL database
const pool = new Pool({
  user: process.env.DB_USER,       // Database user
  database: process.env.DB_NAME,   // Database name
  password: process.env.DB_PASSWORD, // Database password
  host: process.env.DB_HOST,       // Database host (optional, add if needed)
  port: process.env.DB_PORT        // Database port (optional, add if needed)
});

// Export the pool instance for use in other parts of the application
export default pool;