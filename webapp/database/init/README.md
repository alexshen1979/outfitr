# 数据库初始化说明

## 方法一：通过MySQL客户端执行（推荐）

如果您的MySQL服务器允许远程连接，可以通过以下命令执行初始化脚本：

```bash
mysql -h 192.131.142.200 -P 3306 -u dev_outfitr -p dev_outfitr < webapp/database/init/schema.sql
```

或者登录MySQL后执行：

```bash
mysql -h 192.131.142.200 -P 3306 -u dev_outfitr -p
```

然后：

```sql
USE dev_outfitr;
SOURCE webapp/database/init/schema.sql;
```

## 方法二：通过数据库管理工具

使用 phpMyAdmin、Navicat、DBeaver 等工具：
1. 连接到数据库服务器
2. 选择 `dev_outfitr` 数据库
3. 执行 `schema.sql` 文件中的所有SQL语句

## 方法三：修复IP权限问题后使用脚本

如果修复了MySQL的IP权限问题，可以运行：

```bash
cd webapp/backend
npm run init-db
```

## 需要创建的表

初始化脚本会创建以下6个表：

1. **users** - 用户表
2. **user_photos** - 用户照片表
3. **wardrobe_items** - 衣柜物品表
4. **outfit_results** - 穿搭结果表
5. **api_usage_logs** - API使用日志表
6. **subscriptions** - 订阅表（未来使用）

## 验证

执行完成后，可以运行以下SQL验证：

```sql
USE dev_outfitr;
SHOW TABLES;
```

应该看到6个表。

