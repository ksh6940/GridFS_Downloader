const { MongoClient, GridFSBucket } = require('mongodb');
const fs = require('fs');

async function downloadFile() {
  const client = new MongoClient('mongodb+srv://rkdtjrgh124:AOxDsBMgg8cP0Gih@webtable.g2ha8vc.mongodb.net/Node-API?retryWrites=true&w=majority&appName=WebTable');
  await client.connect();

  const db = client.db('myDatabase');
  const bucket = new GridFSBucket(db, { bucketName: 'WebTable' });

  // 모든 파일 출력
  const cursor = bucket.find({});
  await cursor.forEach(doc => console.log(doc));

  // 파일 다운로드
  bucket.openDownloadStreamByName('myFile')
    .pipe(fs.createWriteStream('./outputFile'))
    .on('finish', () => {
      console.log('File downloaded successfully');
      client.close();
    });
}

downloadFile().catch(console.error);
