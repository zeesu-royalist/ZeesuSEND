import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  PutBucketCorsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  });
}

export function getBucketName(): string {
  return process.env.S3_BUCKET_NAME || 'transfers';
}

let isCorsEnsured = false;

/**
 * Ensures bucket has CORS enabled so browser direct uploads never fail with preflight 403.
 */
export async function ensureBucketCors(): Promise<void> {
  if (isCorsEnsured) return;
  try {
    const s3 = getS3Client();
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: getBucketName(),
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
    isCorsEnsured = true;
  } catch (err) {
    console.error('[Storage Warning] Could not set CORS rules:', err);
  }
}

/**
 * Creates a presigned PUT URL for direct browser upload.
 * Omits ContentType from signing so browsers can upload any file format (.docx, .pdf, .png, etc.)
 * without header signature mismatches.
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType?: string,
  expiresIn = 900 // 15 minutes
): Promise<string> {
  // Ensure CORS is set on the bucket in background
  ensureBucketCors().catch(() => {});

  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn });
}

function formatContentDisposition(filename: string): string {
  // Strip control characters and quotes for ASCII fallback
  const asciiFallback = filename.replace(/["\r\n]/g, '').replace(/[^\x20-\x7E]/g, '_');
  const utf8Encoded = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`;
}

/**
 * Creates a presigned GET URL for viewing or downloading a file.
 */
export async function createPresignedDownloadUrl(
  key: string,
  downloadFilename?: string | null,
  expiresIn = 3600 // 1 hour for preview, 300 for download
): Promise<string> {
  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ...(downloadFilename
      ? {
          ResponseContentDisposition: formatContentDisposition(downloadFilename),
        }
      : {}),
  });

  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Deletes multiple files from S3 storage.
 */
export async function deleteStorageFiles(keys: string[]) {
  if (!keys || keys.length === 0) return;

  const s3 = getS3Client();
  const command = new DeleteObjectsCommand({
    Bucket: getBucketName(),
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
      Quiet: true,
    },
  });

  return s3.send(command);
}

export { getS3Client };
