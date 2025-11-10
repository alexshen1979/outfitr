const playwright = require('playwright');
const path = require('path');

async function testPhotoUpload() {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. 导航到登录页面...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    console.log('2. 填写登录信息...');
    await page.fill('input[type="email"], input[placeholder*="you@example.com"]', 'thesuper@alexshen.com');
    await page.fill('input[type="password"]', '11111111');
    
    console.log('3. 点击登录按钮...');
    await page.click('button:has-text("登录")');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ 登录成功');

    console.log('4. 导航到生成穿搭页面...');
    await page.goto('http://localhost:3000/outfit/generate');
    await page.waitForTimeout(2000);
    console.log('✅ 已到达生成穿搭页面');

    console.log('5. 等待上传区域加载...');
    await page.waitForSelector('input[type="file"]', { state: 'attached' });
    
    console.log('6. 上传照片文件...');
    const filePath = path.resolve('C:\\00-DE-Sync\\00-DigitsEcho\\00-outfitr\\testimages\\微信图片_20251107155811_78_264.jpg');
    
    // 使用Playwright的文件上传API
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(filePath);
      console.log('✅ 文件已选择');
      
      // 等待预览出现
      console.log('7. 等待预览显示...');
      await page.waitForTimeout(3000);
      
      // 检查是否有预览
      const previews = await page.$$('img[alt*="Preview"], img[alt*="预览"]');
      if (previews.length > 0) {
        console.log(`✅ 预览已显示，找到 ${previews.length} 个预览图片`);
      } else {
        console.log('⚠️  未找到预览图片，检查页面状态...');
      }
      
      // 等待上传完成
      console.log('8. 等待上传完成...');
      await page.waitForTimeout(5000);
      
      // 检查是否有"保存照片"按钮
      const saveButton = await page.$('button:has-text("保存照片"), button:has-text("保存")');
      if (saveButton) {
        console.log('✅ 找到保存按钮');
        const buttonText = await saveButton.textContent();
        console.log(`   按钮文本: ${buttonText}`);
      } else {
        console.log('⚠️  未找到保存按钮');
      }
      
      // 检查是否有进度条
      const progressBar = await page.$('[role="progressbar"], .progress-bar, [class*="progress"]');
      if (progressBar) {
        console.log('✅ 找到进度条');
      }
      
      // 截图保存当前状态
      await page.screenshot({ path: 'test-upload-result.png', fullPage: true });
      console.log('✅ 已保存截图: test-upload-result.png');
      
    } else {
      console.log('❌ 未找到文件输入元素');
    }
    
    console.log('\n9. 等待10秒以观察页面状态...');
    await page.waitForTimeout(10000);
    
    console.log('\n✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
    console.log('已保存错误截图: test-error.png');
  } finally {
    await browser.close();
  }
}

// 检查是否安装了playwright
try {
  require('playwright');
  testPhotoUpload();
} catch (e) {
  console.log('需要安装Playwright。正在安装...');
  console.log('请运行: npm install playwright');
  console.log('然后运行: npx playwright install chromium');
  process.exit(1);
}

