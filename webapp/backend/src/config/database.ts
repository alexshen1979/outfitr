import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 确保环境变量已加载
dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// 从环境变量读取数据库配置
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'outfitr',
};

// 创建数据库连接池
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`✅ Database connected: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return true;
  } catch (error: any) {
    console.error('Database connection failed:');
    console.error(`   Attempted to connect to: ${dbConfig.host}:${dbConfig.port}`);
    console.error(`   Database: ${dbConfig.database}`);
    console.error(`   User: ${dbConfig.user}`);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (error.message) {
      console.error(`   Error message: ${error.message}`);
    }
    return false;
  }
}

