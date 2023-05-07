const express = require('express');
const app = express();
const awsKey = require('./collection/AwsKey');
const description=require('./collection/Description');
const crypto = require('crypto');
const randomDataName = (bytes=32) => crypto.randomBytes(bytes).toString('hex'); //hex(dataName)
let Id=0 ;
//parse key from .env
const dotenv = require('dotenv');
dotenv.config();
const bucketName=process.env.BUCKET_NAME; 
const bucketRegion=process.env.BUCKET_REGION;
const accessKey=process.env.ACCESS_KEY;
const secretAccessKey=process.env.SECRET_ACCESS_KEY;
const mongoDBKey = process.env.MONGO_KEY;
//aws authetication
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand} = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    credentials:{
        accessKeyId:accessKey,
        secretAccessKey:secretAccessKey,
    },
    region:bucketRegion
})
//midleware
const multer =require('multer'); //multipart/form-data 
app.use(express.json());
//cross origin on devServer
const cors =require("cors");
const { default: mongoose } = require('mongoose');
app.use(
    cors({origin:"http://localhost:8080"})
)
//backend temporary storage
//to do try if I can access video in mid
// const storage = multer.memoryStorage(); //create storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './video/input')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage:storage}) //uploade function
//ffmpeg
const ffmpeg = require('fluent-ffmpeg');
//production mode
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
// production mode


app.get('/api',async(req,res)=>{
    try {
        const KEYS = await awsKey.find({});
        Id=KEYS.length;
        const arr = Array.from({ length: Id }, (_, index) => ({ ID: index + 1 }));
        console.log(Id);
        res.status(200).json(arr);  
    } catch (error) {
        console.log(error.message);
        res.status(500).json("not avaliable");
    }
})
// POST to s3
const {spawn} = require('child_process');
const fs = require('fs');
app.post("/post/video",upload.single('video'),async(req,res)=>{
    const inputPath =req.file.path;
    const filename  =req.file.originalname
    const target    =`./video/output/${filename}`;	
    const outputPath='./video/output/convert.mp4';
	
    console.log(filename)
    //call model inference
    try {
        const pythonProcess = spawn('python3', ['../fasterRcnn/inference_video.py', '-i', inputPath]);
        pythonProcess.stdout.on('data', (data) => {console.log(`stdout: ${data}`);});
        pythonProcess.stderr.on('data', (data) => {console.error(`stderr: ${data}`);});
        pythonProcess.on('close', async (code) => {
            console.log(`child process exited with code ${code}`);
            res.send('Python script has finished executing.');
            //convert ffmpeg
             try{
                await ffmpeg(target)
                .videoCodec('libx264')
                .outputOptions('-crf 20')
                .on('error', (err) => {console.log(`An error occurred: ${err.message}`);})
                .on('end',async () =>{ 
                    console.log('Transcoding succeeded !');
                    const fileContent = fs.readFileSync(outputPath);
                    const validName = filename.replace(/\.mp4$/, '');
                    const params = {
                        Bucket:bucketName,
                        Key:validName,
                        Body:fileContent,
                    ContentType: 'video/mp4',
                    };
                    const query = new PutObjectCommand(params);
                    try {
                        console.log('sent do s3')
                        await s3.send(query);
                    } catch (error) {console.error(error) }
                    try {
                        console.log('sent do mongodb')
                        await awsKey.create({awsKey:validName,ID:Id})
                    } catch (error) {console.error(error);}
                })
                .save(`${outputPath}`);
             }catch (erroe){
                console.error(error);
                res.status(500).send('Internal Server Error : convert error');
             }
        });
    }catch (error) {
        console.error(err);
        res.status(500).send('Internal Server Error python process error');
    }
   res.status(200);
});
//find awsKey via mongodb value 
app.get("/get/video/:id",async(req,res)=>{
    const {id} = req.params;
    try {
        const response = await awsKey.findOne({ID:id})
        //I accidentally reuse property name with collection name :O
        const params = {
            Bucket:bucketName,
            Key:response.awsKey,
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3,command,{expiresIn:3600}); //return a out of root user url
	console.log(url)
	const data = {
		URL:url
	}
	res.status(200).json(data);
    } catch (error) {
        console.log(error.message);
        res.status(500).json("not avaliable");
    }
});
app.patch('/submit/:id',async(req,res)=>{
    const {id} = req.params;
    const data = req.body;
    const request = await description.findOneAndUpdate({ID:id},{commentTwo:`${data.inputText}`});
    res.status(200).json("good")
    console.log(data.inputText)
    console.log("id",{id})
})
mongoose.connect(mongoDBKey)
.then(()=>{
    console.log("connect to mongoDB");
    app.listen(4000,()=>{console.log("server is started at 4000")});
})

