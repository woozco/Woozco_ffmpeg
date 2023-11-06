const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
// AWS 계정 정보 설정
const client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRETE_KEY,
  },
  region: process.env.AWS_S3_REGION,
});

// 업로드할 파일 정보
const filePath = './files/장충동 왕족발 오케스트라.mp4'; // 로컬 파일 경로
const bucketName = 'woozco'; // S3 버킷 이름
const key = '장충동 왕족발 보쌈~!'; // S3에 저장될 파일 이름

// 파일 읽기
const fileContent = fs.readFileSync(filePath);

// S3에 파일 업로드
const params = {
  Bucket: bucketName,
  Key: key,
  Body: fileContent,
};

const command = new PutObjectCommand(params);

client.send(command)
  .then((data) => {
    console.log('파일이 성공적으로 업로드되었습니다.', data);
  })
  .catch((error) => {
    console.error(error);
  });
