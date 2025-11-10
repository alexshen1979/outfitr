import { Router } from 'express';
import { aiService } from '../services/ai.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// 生成图像
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, negativePrompt, width, height, steps, guidance } = req.body;

    if (!prompt) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt is required',
        },
      });
      return;
    }

    const result = await aiService.generateImage({
      prompt,
      negativePrompt,
      width,
      height,
      steps,
      guidance,
    });

    if (result.success) {
      res.json({
        success: true,
        data: {
          imageUrl: result.imageUrl,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'AI_GENERATION_FAILED',
          message: result.error || 'Failed to generate image',
        },
      });
    }
  } catch (error: any) {
    console.error('Generate image error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate image',
      },
    });
  }
});

// 识别图像
router.post('/recognize', authenticateToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image URL is required',
        },
      });
      return;
    }

    const result = await aiService.recognizeImage(imageUrl);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Recognize image error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to recognize image',
      },
    });
  }
});

export default router;

