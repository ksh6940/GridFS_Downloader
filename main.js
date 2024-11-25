const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const app = express();

const mongoUri = 'mongodb+srv://rkdtjrgh124:AOxDsBMgg8cP0Gih@webtable.g2ha8vc.mongodb.net/Node-API?retryWrites=true&w=majority&appName=WebTable';
const client = new MongoClient(mongoUri, { readPreference: 'secondaryPreferred' }); // Secondary 노드 우선 읽기

let gridfsBucket;

async function initialize() {
  await client.connect();
  const db = client.db('WebTable');
  gridfsBucket = new mongodb.GridFSBucket(db, { bucketName: 'myBucket' });
  console.log('MongoDB 연결 성공');
}

app.get('/api/download/:fileId', async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.fileId);

    // Secondary에서 파일 메타데이터 조회
    const files = await gridfsBucket.find({ _id: fileId }).toArray();

    if (!files.length) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    // 다운로드를 위한 헤더 설정
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);

    // 파일 We
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 서버 초기화
initialize().catch(console.error);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});