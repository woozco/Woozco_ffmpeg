const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// AWS 계정 설정
AWS.config.update({
  accessKeyId: '',
  secretAccessKey: '',
  region: '',
});

// S3 및 CloudFront 설정
const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();

// 업로드할 파일이 있는 폴더 경로
const folderPath = '../files/id1';

// S3 버킷 이름
const bucketName = 'woozco';

// CloudFront Distribution ID
const distributionId = 'ERFTZNQLTW15L';

// S3에 파일 업로드 함수
async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: 'application/x-mpegURL', // For m3u8, use 'application/x-mpegURL'
  };

  return s3.upload(params).promise();
}

// CloudFront 캐시 무효화 함수
async function invalidateCache() {
  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `${Date.now()}`,
      Paths: {
        Quantity: 1,
        Items: ['/*'],
      },
    },
  };

  return cloudfront.createInvalidation(params).promise();
}

// 폴더 내의 파일 업로드 및 CloudFront 캐시 무효화 실행
async function uploadAndInvalidate() {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      if (file.endsWith('.m3u8') || file.endsWith('.ts')) {
        const s3Key = path.join('video/id1/', file);
        await uploadFile(filePath, s3Key);
        console.log(`${file} uploaded successfully`);
      }
    }

    // CloudFront 캐시 무효화
    await invalidateCache();
    console.log('CloudFront cache invalidated successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

uploadAndInvalidate();
