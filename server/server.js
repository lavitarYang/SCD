const express = require('express');
const app = express();
const awsKey = require('./collection/AwsKey');
const description=require('./collection/Description');
const crypto = require('crypto');
const randomDataName = (bytes=32) => crypto.randomBytes(bytes).toString('hex'); //hex(dataName)
let Id ;
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
const storage = multer.memoryStorage(); //create storage
const upload = multer({storage:storage}) //uploade function

//production mode
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
//production mode

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
//insomnia test api
app.post('/api',async(req,res)=>{
    try{
        const requset = await awsKey.create(req.body);
        res.status(200).json(requset);
    } catch (error) {
        console.log(error.message);
        res.status(500).json("not avaliable");
    }
})
// POST to s3
app.post("/post/video",upload.single('video'),async(req,res)=>{
    //middleware upload.single('video')
    const AWSKEY = randomDataName();
    const params = {
        Bucket:bucketName,
        Key:AWSKEY,
        Body:req.file.buffer,
        ContentType:req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    await awsKey.create({awsKey:AWSKEY,ID:Id})
    await description.create({ID:Id});

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
        try {
            const detail =  await description.findOne({ID:id});
            const data = {
                URL:url,
                commentOne:detail.commentOne,
                commentTwo:detail.commentTwo,
                MLtimestamp:detail.MLtimestamp
            }
            res.status(200).json(data);
        } catch (error) {
            console.log(error.message)
        }

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

