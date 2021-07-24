import express from 'express';
//import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';

/*const articlesInfo = {
    'learn-react': {
        upvotes: 0,
        comments:[],
    },
    'learn-node': {
        upvotes: 0,
        comments:[],
    },
    'my-thoughts-on-resumes': {
        upvotes: 0,
        comments:[],
    },
}*/

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
//para express 4.16 anterior
//app.use(bodyParser.json());
app.use(express.json());

const withDB = async (operations, res) => {
    try{
        const client = await MongoClient.connect('mongodb://localhost:27017',{useNewUrlParser: true})
        const db = client.db('my-blog');
        await operations(db);
        client.close();
    } catch(error){
        res.status(200).json({message:'Error al conectar',error});
    }
}

app.get('/api/articles/:name', async (req,res) => {
        withDB(async(db) => {
            const articleName = req.params.name;
            const articlesInfo = await db.collection('articles').findOne({name:articleName})
            res.status(200).json(articlesInfo);
        }, res)  
} )

app.post('/api/articles/:name/upvote', async (req,res) => {
    withDB(async(db) => {
        const articleName = req.params.name;
        const articlesInfo = await db.collection('articles').findOne({name:articleName})
        await db.collection('articles').updateOne({name:articleName},{
            '$set':{
                upvotes:articlesInfo.upvotes + 1,
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName})
        res.status(200).json(updatedArticleInfo);
    }, res)    
});

app.post('/api/articles/:name/add-comment', (req,res) => {
    const {username,text} = req.body;
    const articleName = req.params.name;

    withDB(async(db)=>{
        const articlesInfo = await db.collection('articles').findOne({name:articleName});
        await db.collection('articles').updateOne({name:articleName},{
            '$set':{
                comments:articlesInfo.comments.concat({username, text}),
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name:articleName});
        res.status(200).json(updatedArticleInfo);
    }, res);
})

app.get('*',(req,res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
})

app.listen(8000, ()=> console.log('Te escucho del puerto 8000'));

//npm init -y
//npm install --save express
//npm install --save-dev @babel/core @babel/node @babel/preset-env

//npx babel-node src/server.js

//npm install --save body-parser

//npm install --save-dev nodemon
//npx nodemon --exec npx babel-node src/server.js


//npm install --save mongodb

//npm install --save whatwg-fetch