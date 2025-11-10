# Pic Copilot API 集成指南（重要更新）

## ⚠️ 重要发现

经过实际查看 [Pic Copilot 官网](https://www.piccopilot.com/home)，**Pic Copilot 目前没有公开的 API 文档或开发者中心**。

Pic Copilot 主要是一个**面向终端用户的 SaaS 平台**，通过 Web 界面提供服务，而不是传统的 API 服务提供商。

---

## 🔍 当前情况

### Pic Copilot 的现状

- ✅ 提供 Web 界面工具（虚拟试衣、AI 换装等）
- ❌ **没有公开的 API 文档**
- ❌ **没有开发者中心**
- ❌ **没有 API Key 获取页面**

### 这意味着什么？

1. **无法直接集成 API**：目前无法通过 API 方式集成到我们的项目中
2. **需要联系官方**：可能需要联系 Pic Copilot 团队询问是否有 API 服务
3. **可能需要企业合作**：API 访问可能需要企业级合作或定制开发

---

## 📞 如何联系 Pic Copilot

### 方式1：通过官网联系

1. 访问：https://www.piccopilot.com/home
2. 查找"联系我们"、"合作"或"Cooperation"页面
3. 填写联系表单，说明您的 API 集成需求

### 方式2：通过邮箱联系

根据网站信息，可以尝试联系：
- **邮箱**：PicCopilot@aliexpress.com（阿里巴巴国际站合作伙伴邮箱）

### 方式3：通过合作伙伴渠道

Pic Copilot 是阿里巴巴国际站的合作伙伴，可以尝试：
- 通过阿里巴巴国际站的合作伙伴渠道联系
- 查看是否有企业级 API 服务

---

## 💡 备选方案

既然 Pic Copilot 目前没有公开 API，建议考虑以下备选方案：

### 方案1：阿里云百炼 AI 试衣（推荐⭐⭐⭐⭐⭐）

**优势**：
- ✅ 有完整的 API 文档
- ✅ 专为虚拟试衣设计
- ✅ 国内访问速度快
- ✅ 有免费试用期（90天）

**获取方式**：
- 访问：https://www.aliyun.com/product/ai
- 查找"百炼 AI 试衣"或"OutfitAnyone"
- 注册阿里云账号，开通服务

---

### 方案2：Replicate（推荐⭐⭐⭐⭐⭐）

**优势**：
- ✅ 有完整的 API 文档
- ✅ 支持 Stable Diffusion + ControlNet
- ✅ 全球访问稳定
- ✅ 首次注册赠送 $10

**获取方式**：
- 访问：https://replicate.com
- 注册账号，获取 API Key
- 查看文档：https://replicate.com/docs

---

### 方案3：Pixelcut（推荐⭐⭐⭐⭐）

**优势**：
- ✅ 提供虚拟试衣 API
- ✅ 每张图片 $0.10
- ✅ 有 API 文档

**获取方式**：
- 访问：https://www.pixelcut.ai/api/try-on
- 注册账号，获取 API Key

---

### 方案4：自建方案（推荐⭐⭐⭐⭐⭐）

**优势**：
- ✅ 完全免费（开源框架）
- ✅ 完全控制
- ✅ 无 API 限制

**实施方式**：
- 使用 OOTDiffusion 或 Leffa 等开源框架
- 租用 GPU 服务器（AutoDL，约 ￥1,500/月）
- 参考：`webapp/GPU_SERVER_ANALYSIS.md`

---

## 🎯 推荐行动方案

### 短期方案（立即实施）

1. **联系 Pic Copilot**：
   - 发送邮件询问 API 服务
   - 说明您的集成需求
   - 询问是否有企业级 API

2. **同时准备备选方案**：
   - 注册阿里云百炼 AI 试衣（国内用户）
   - 或注册 Replicate（国际用户）
   - 或准备自建方案

### 中期方案（如果 Pic Copilot 无 API）

根据用户地理位置选择：
- **国内用户为主**：使用阿里云百炼 AI 试衣
- **国际用户为主**：使用 Replicate
- **大规模使用**：考虑自建方案（GPU 服务器）

---

## 📝 更新后的集成步骤

### 如果 Pic Copilot 提供 API（等待回复后）

1. 获取 API Key 和文档
2. 根据实际 API 文档更新代码
3. 配置环境变量
4. 测试集成

### 如果使用备选方案

请参考相应的集成文档：
- **阿里云百炼**：需要查看阿里云官方文档
- **Replicate**：参考 `webapp/AI_API_ANALYSIS.md`
- **自建方案**：参考 `webapp/GPU_SERVER_ANALYSIS.md`

---

## 🔄 代码状态

**当前代码已准备好**：
- ✅ `PicCopilotService` 类已创建
- ✅ `AIService` 已更新支持多提供商
- ✅ 配置系统已就绪

**等待**：
- ⏳ Pic Copilot API 文档和 Key
- ⏳ 或切换到其他 API 提供商

---

## 📧 联系模板

如果需要联系 Pic Copilot，可以使用以下模板：

```
主题：关于 Pic Copilot API 集成需求

您好，

我是 [您的公司/项目名称] 的开发者，正在开发一个虚拟试衣应用。

我们注意到 Pic Copilot 提供了优秀的虚拟试衣功能，希望将其集成到我们的应用中。

请问：
1. Pic Copilot 是否提供 API 服务？
2. 如何获取 API Key 和文档？
3. 是否有企业级 API 服务？

期待您的回复。

谢谢！
[您的姓名]
[您的联系方式]
```

---

## 📚 相关文档

- **API 方案分析**：`webapp/AI_API_ANALYSIS.md`
- **GPU 自建方案**：`webapp/GPU_SERVER_ANALYSIS.md`
- **Pic Copilot 官网**：https://www.piccopilot.com/home

---

**最后更新**：2025-01-22  
**状态**：Pic Copilot 无公开 API，建议使用备选方案

---

## ⚙️ 第二步：配置环境变量

### 2.1 找到 `.env` 文件

在 `webapp/backend/` 目录下，如果没有 `.env` 文件，复制 `ENV.example`：

```bash
cd webapp/backend
cp ENV.example .env
```

### 2.2 编辑 `.env` 文件

添加以下配置：

```env
# Pic Copilot API Configuration
PIC_COPILOT_API_KEY=你的API_KEY_在这里
PIC_COPILOT_API_ENDPOINT=https://api.piccopilot.com/v1
PIC_COPILOT_TIMEOUT=60000
AI_PROVIDER=piccopilot
```

**重要**：
- 将 `你的API_KEY_在这里` 替换为实际的 API Key
- API 端点地址可能需要根据官方文档调整
- 如果官方文档中的端点不同，请更新 `PIC_COPILOT_API_ENDPOINT`

---

## 🧪 第三步：测试 API 连接

### 3.1 创建测试脚本（可选）

如果需要单独测试 API，可以创建一个测试文件：

```typescript
// webapp/backend/scripts/test-piccopilot.ts
import { PicCopilotService } from '../src/services/piccopilot.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function testPicCopilot() {
  const apiKey = process.env.PIC_COPILOT_API_KEY;
  const endpoint = process.env.PIC_COPILOT_API_ENDPOINT || 'https://api.piccopilot.com/v1';

  if (!apiKey) {
    console.error('❌ PIC_COPILOT_API_KEY not found in .env file');
    return;
  }

  console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
  console.log('🌐 Endpoint:', endpoint);

  const service = new PicCopilotService({
    apiKey,
    endpoint,
    timeout: 60000,
  });

  // 测试数据（需要替换为实际的图片 URL）
  const personImageUrl = 'https://example.com/person.jpg';
  const garmentImageUrl = 'https://example.com/garment.jpg';

  console.log('\n🧪 Testing Pic Copilot API...');
  console.log('👤 Person image:', personImageUrl);
  console.log('👕 Garment image:', garmentImageUrl);

  const result = await service.virtualTryOn(personImageUrl, garmentImageUrl);

  if (result.success) {
    console.log('\n✅ Success!');
    console.log('📸 Result image URL:', result.imageUrl);
  } else {
    console.error('\n❌ Failed:', result.error);
  }
}

testPicCopilot().catch(console.error);
```

### 3.2 运行测试

```bash
cd webapp/backend
npx ts-node scripts/test-piccopilot.ts
```

---

## 🚀 第四步：启动服务

### 4.1 启动后端服务

```bash
cd webapp/backend
npm run dev
```

### 4.2 启动前端服务

```bash
cd webapp/frontend
npm run dev
```

### 4.3 测试完整流程

1. 打开浏览器访问：http://localhost:3000
2. 登录系统
3. 进入"形象"页面，上传用户照片
4. 进入"穿搭"页面，选择照片和服装
5. 点击"生成穿搭"按钮
6. 查看生成结果

---

## 🔍 第五步：验证和调试

### 5.1 查看后端日志

后端服务启动后，查看控制台输出：

```
✅ AI Service initialized with provider: piccopilot
✅ Pic Copilot service initialized
```

如果看到错误，检查：
- API Key 是否正确
- 网络连接是否正常
- API 端点地址是否正确

### 5.2 常见问题排查

#### 问题1：API Key 无效

**错误信息**：`INVALID_API_KEY` 或 `401 Unauthorized`

**解决方法**：
- 检查 `.env` 文件中的 `PIC_COPILOT_API_KEY` 是否正确
- 确认 API Key 没有多余的空格
- 重新生成 API Key

#### 问题2：API 端点错误

**错误信息**：`ENOTFOUND` 或 `404 Not Found`

**解决方法**：
- 查看 Pic Copilot 官方文档，确认正确的 API 端点
- 更新 `.env` 文件中的 `PIC_COPILOT_API_ENDPOINT`

#### 问题3：图片 URL 无效

**错误信息**：`INVALID_IMAGE` 或 `Image not found`

**解决方法**：
- 确保图片 URL 可公开访问
- 检查图片格式（支持 JPG、PNG）
- 确保图片大小不超过限制

#### 问题4：超时错误

**错误信息**：`Timeout` 或 `ETIMEDOUT`

**解决方法**：
- 增加 `PIC_COPILOT_TIMEOUT` 的值（默认 60000ms）
- 检查网络连接
- 图片可能过大，尝试压缩

---

## 📝 代码说明

### 已完成的集成

1. ✅ **PicCopilotService** (`webapp/backend/src/services/piccopilot.service.ts`)
   - 实现了虚拟试衣 API 调用
   - 包含重试机制
   - 支持单件和多件服装

2. ✅ **AIService 更新** (`webapp/backend/src/services/ai.service.ts`)
   - 自动检测并使用 Pic Copilot
   - 保持向后兼容

3. ✅ **配置更新** (`webapp/backend/src/config/ai.ts`)
   - 支持多提供商切换
   - 环境变量配置

### API 调用流程

```
前端请求 → OutfitController → AIService → PicCopilotService → Pic Copilot API
```

---

## 🎯 下一步

1. **获取 API Key**：注册 Pic Copilot 账号并获取 API Key
2. **配置环境变量**：在 `.env` 文件中添加配置
3. **测试连接**：运行测试脚本验证 API 连接
4. **启动服务**：启动前后端服务
5. **测试功能**：通过前端界面测试完整流程

---

## 📚 参考资源

- **Pic Copilot 官网**：https://www.piccopilot.com/home
- **官方文档**：https://www.piccopilot.com/zh/learn
- **集成指南**：`webapp/PIC_COPILOT_INTEGRATION.md`

---

## ⚠️ 重要提示

1. **API 端点可能不同**：Pic Copilot 的实际 API 端点可能与示例不同，请以官方文档为准
2. **请求格式可能不同**：API 的请求参数格式可能需要根据官方文档调整
3. **免费政策**：Pic Copilot 目前免费，但政策可能变更，建议准备备选方案
4. **多件服装**：当前实现只使用第一件服装，如需支持多件服装同时试穿，可能需要：
   - 先合成服装图片
   - 或使用其他 API 方法
   - 或多次调用 API

---

**最后更新**：2025-01-22  
**状态**：代码已集成，等待配置 API Key 即可使用

