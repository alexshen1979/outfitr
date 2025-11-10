import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

async function testConnection(useLocalhost = false) {
  const config = {
    host: useLocalhost ? 'localhost' : (process.env.DB_HOST || 'localhost'),
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'outfitr',
  };

  console.log('🔌 Testing database connection...');
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);

  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });

    await connection.ping();
    console.log('✅ Database connection successful!');
    
    // 检查数据库是否存在
    const [databases] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [config.database]
    );

    if (Array.isArray(databases) && databases.length === 0) {
      console.log(`⚠️  Database '${config.database}' does not exist.`);
      console.log('   Please create the database first or update the schema.sql file.');
    } else {
      console.log(`✅ Database '${config.database}' exists.`);
    }

    await connection.end();
    return { success: true, config };
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    return { success: false, config, error };
  }
}

async function initializeDatabase(config: any) {
  console.log('\n📦 Initializing database schema...');
  
  try {
    // 读取SQL文件 - 尝试多个路径
    const possiblePaths = [
      path.join(process.cwd(), '../database/init/schema.sql'),
      path.join(process.cwd(), '../../database/init/schema.sql'),
      path.join(process.cwd(), 'database/init/schema.sql'),
    ];
    
    let sql: string | null = null;
    let sqlPath: string | null = null;
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sqlPath = p;
        sql = fs.readFileSync(p, 'utf-8');
        break;
      }
    }
    
    if (!sql) {
      throw new Error(`SQL file not found. Tried: ${possiblePaths.join(', ')}`);
    }

    console.log(`   SQL file: ${sqlPath}`);
    console.log(`   Executing schema.sql...`);
    
    // 连接到数据库
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      multipleStatements: true, // 允许多条SQL语句
    });

    // 执行SQL脚本
    await connection.query(sql);
    
    console.log('✅ Database schema initialized successfully!');
    
    // 检查表是否创建成功
    await connection.changeUser({ database: config.database });
    const [tables] = await connection.query('SHOW TABLES');
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log(`\n📊 Created tables:`);
      (tables as any[]).forEach((table: any) => {
        const tableName = Object.values(table)[0];
        console.log(`   ✓ ${tableName}`);
      });
    } else {
      console.log(`\n⚠️  No tables found. Please check if the SQL executed correctly.`);
    }

    await connection.end();
    return true;
  } catch (error: any) {
    console.error('❌ Database initialization failed:');
    console.error(`   Error: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.sql) {
      console.error(`   SQL: ${error.sql.substring(0, 200)}...`);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 OUTFITR Database Setup\n');
  
  // 先尝试使用配置的host连接
  let result = await testConnection(false);
  
  // 如果失败，尝试使用localhost（可能在服务器本地运行）
  if (!result.success && result.error?.code === 'ER_HOST_NOT_PRIVILEGED') {
    console.log('\n🔄 Trying localhost connection (for server-side execution)...');
    result = await testConnection(true);
  }
  
  if (!result.success) {
    console.log('\n❌ Cannot proceed with initialization. Please fix the connection issue first.');
    console.log('\n💡 Solutions:');
    console.log('   1. If running on the MySQL server, ensure DB_HOST=localhost in .env');
    console.log('   2. If running remotely, configure MySQL to allow your IP:');
    console.log(`      GRANT ALL PRIVILEGES ON ${result.config.database}.* TO '${result.config.user}'@'%';`);
    console.log('      FLUSH PRIVILEGES;');
    console.log('   3. Execute SQL file directly:');
    console.log('      mysql -h 192.131.142.200 -u dev_outfitr -p dev_outfitr < webapp/database/init/schema.sql');
    process.exit(1);
  }

  // 初始化数据库
  const initialized = await initializeDatabase(result.config);
  
  if (initialized) {
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Database setup failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
