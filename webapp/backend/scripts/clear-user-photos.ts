import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';

// 加载环境变量
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dev_outfitr',
};

async function clearUserPhotos() {
  let connection: mysql.Connection | null = null;

  try {
    console.log('Connecting to database...');
    console.log(`Host: ${dbConfig.host}, Database: ${dbConfig.database}, User: ${dbConfig.user}`);

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // 清空user_photos表（软删除：设置is_active=false）
    console.log('\nClearing user photos (setting is_active=false)...');
    const [result] = await connection.execute(
      'UPDATE user_photos SET is_active = false WHERE is_active = true'
    );
    const updateResult = result as mysql.ResultSetHeader;
    console.log(`✅ Updated ${updateResult.affectedRows} user photos`);

    // 或者完全删除（硬删除）
    console.log('\nDeleting all user photos from database...');
    const [deleteResult] = await connection.execute('DELETE FROM user_photos');
    const deleteResultSet = deleteResult as mysql.ResultSetHeader;
    console.log(`✅ Deleted ${deleteResultSet.affectedRows} user photos`);

    console.log('\n✅ All user photos cleared successfully!');
  } catch (error: any) {
    console.error('❌ Error clearing user photos:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

clearUserPhotos();

