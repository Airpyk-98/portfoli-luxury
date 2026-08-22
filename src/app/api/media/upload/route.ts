import { NextResponse } from 'next/server';
import { Database } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { checkUploadAllowed } from '@/lib/tiers';
import { uploadToHfHub } from '@/lib/hf-storage';
import { dispatchVideoCompression } from '@/lib/kaggle-pipeline';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('portfoli_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'User session required. Please log in.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    }

    const user = Database.findUserById(payload.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mediaType = (formData.get('type') as 'image' | 'video') || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileSizeBytes = file.size;
    const fileName = file.name || `upload_${Date.now()}`;
    const pricing = Database.getPricingConfig();

    // 1. Calculate current user counts
    let currentVideos = 0;
    let currentPhotos = 0;
    user.portfolio?.projects?.forEach((proj) => {
      proj.media?.forEach((med) => {
        if (med.type === 'video') currentVideos++;
        else currentPhotos++;
      });
    });

    // 2. Validate Quotas
    const quotaCheck = checkUploadAllowed(
      user.subscription?.tier || 'free',
      currentVideos,
      currentPhotos,
      user.storageUsedBytes || 0,
      mediaType,
      fileSizeBytes,
      pricing
    );

    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.reason }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Size Branching: If video > 100MB, send to Kaggle / WebM compression pipeline
    const MB_100 = 100 * 1024 * 1024;
    let finalUrl = '';
    let finalSizeBytes = fileSizeBytes;
    let isCompressed = false;

    if (mediaType === 'video' && fileSizeBytes > MB_100) {
      console.log(`[Media Upload] Video is ${(fileSizeBytes / (1024 * 1024)).toFixed(1)}MB (>100MB). Dispatching to Kaggle WebM compression pipeline.`);
      const compResult = await dispatchVideoCompression(buffer, fileName);
      finalUrl = compResult.url;
      finalSizeBytes = compResult.compressedSize;
      isCompressed = true;
    } else {
      // Standard Direct Upload to Hugging Face Hub dataset repository
      const folder = mediaType === 'video' ? 'videos' : 'images';
      const uploadRes = await uploadToHfHub(buffer, fileName, folder);
      finalUrl = uploadRes.url;
    }

    const newMediaItem = {
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: mediaType,
      url: finalUrl,
      originalName: fileName,
      sizeBytes: finalSizeBytes,
      storageProvider: 'hf' as const,
      uploadedAt: new Date().toISOString(),
      compressed: isCompressed,
      compressionRatio: isCompressed ? 0.35 : 1,
    };

    return NextResponse.json({
      success: true,
      media: newMediaItem,
      message: 'File optimized and uploaded to cloud storage.',
    });
  } catch (err: any) {
    console.error('Media upload error:', err);
    return NextResponse.json({ error: 'Failed to process media upload.' }, { status: 500 });
  }
}
