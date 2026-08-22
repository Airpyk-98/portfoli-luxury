import fs from 'fs';
import path from 'path';

const HF_TOKEN = process.env.HF_TOKEN || process.env.EPIC98_HF_TOKEN || '';
const HF_USERNAME = process.env.HF_USERNAME || 'epic98';
const HF_DATASET_NAME = process.env.HF_DATASET_NAME || 'portfoli-media';
const REPO_ID = `${HF_USERNAME}/${HF_DATASET_NAME}`;

/**
 * Ensures the Hugging Face dataset repository exists.
 */
export async function ensureHfDatasetExists(): Promise<boolean> {
  if (!HF_TOKEN) return false;

  try {
    const checkRes = await fetch(`https://huggingface.co/api/datasets/${REPO_ID}`, {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
      },
    });

    if (checkRes.status === 200) {
      return true;
    }

    if (checkRes.status === 404) {
      // Create new public dataset repository
      const createRes = await fetch('https://huggingface.co/api/repos/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'dataset',
          name: HF_DATASET_NAME,
          private: false,
        }),
      });
      return createRes.ok || createRes.status === 409;
    }

    return false;
  } catch (err) {
    console.error('Error verifying HF dataset:', err);
    return false;
  }
}

/**
 * Uploads a buffer directly to Hugging Face Hub dataset repository via ndjson Commit API.
 * Returns the public direct download/CDN URL.
 */
export async function uploadToHfHub(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<{ url: string; hfPath: string; success: boolean }> {
  const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const hfFilePath = `${folder}/${cleanFileName}`;

  // Always write local mirror to public/uploads
  const localUploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }
  const localFilePath = path.join(localUploadsDir, cleanFileName);
  fs.writeFileSync(localFilePath, fileBuffer);
  const localUrl = `/uploads/${folder}/${cleanFileName}`;

  try {
    if (HF_TOKEN) {
      await ensureHfDatasetExists();

      const base64Content = fileBuffer.toString('base64');
      const ndjsonPayload = [
        JSON.stringify({ key: 'header', value: { summary: `Upload ${cleanFileName}` } }),
        JSON.stringify({
          key: 'file',
          value: {
            path: hfFilePath,
            encoding: 'base64',
            content: base64Content,
          },
        }),
      ].join('\n');

      const commitUrl = `https://huggingface.co/api/datasets/${REPO_ID}/commit/main`;
      const res = await fetch(commitUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/x-ndjson',
        },
        body: ndjsonPayload,
      });

      if (res.ok) {
        const rawCdnUrl = `https://huggingface.co/datasets/${REPO_ID}/resolve/main/${hfFilePath}`;
        return {
          url: rawCdnUrl,
          hfPath: hfFilePath,
          success: true,
        };
      }
    }
  } catch (err) {
    console.warn('HF remote commit fallback to local mirror:', err);
  }

  return {
    url: localUrl,
    hfPath: hfFilePath,
    success: true,
  };
}
