//require needed modules
const express = require ("express");
const mongoose = require ("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");

//use express through keyword app
const app = express();

//port localhost:3000
const port = 3000;

//set ejs template engine
app.set('view engine', 'ejs');

//setup bodyparser and static css
app.use(bodyParser.urlencoded({extended: true}));

//setup public file location
app.use(express.static("public"));

//setup mongodb --> wikiDB
mongoose.connect("mongodb://localhost:27017/wikiDB", { useNewUrlParser: true, useUnifiedTopology:true });

//define a mongodb schema
const articleSchema = new mongoose.Schema({
    title:String,
    content:String
});

//define mongodb model
const Article = mongoose.model("Article", articleSchema);

//01 - routing the all articles chain
//app chain routing - Referer express docs
app.route("/articles")
    //overall articles get route
    .get(function(req, res){
        Article.find({}, function(err, results){
            if(!err){
                res.send(results);
            }else{
                console.log(err);
            }
        });
    })
    //articles post route
    .post(function(req, res){
        //create new article using the model
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        //use mongodb save method to save new article
        newArticle.save(function(err){
            if(!err){
                console.log("[post-request] : Data added through post route");
            }else{
                console.log(err);
            }
        });
    })
    //delete articles
    .delete(function(req, res){
        //use mongodb deleteMany() method to delete all articles
        Article.deleteMany(function(err){
            if(!err){
                console.log("[delete-request] : All articles deleted");
            } else{
                console.log(err);
            }
        });
    });

    //02 - Routing the specific articles
    //chain routing for articles/tech
    app.route("/articles/:articleTitle")
    .get(function(req, res){
        const reqParameter = req.params.articleTitle;
        Article.findOne({title: reqParameter}, function(err, result){
            if(!err){
                console.log("[Found] - Artical on : "+ reqParameter);
                res.send(result);
            }else{
                console.log("[Not Found] - No articals associate with this section");
            }
        });
    })
    //PUT request will replace a recorde completely
    .put(function(req, res){
        Article.update(
            {title: req.params.articleTitle},
            {title: req.body.title, content: req.body.content},
            {overwrite: true},
            function(err, results){
                if(!err){
                    console.log("[UPDATED] - "+req.params.articleTitle+" is updated!");
                }else{
                    console.log("Error Can't Update!");
                }
            }
        )
    })
    //PATCH will only update the required part of the recorde
    .patch(
        function(req, res){
            Article.update(
                {title: req.params.articleTitle},
                {$set: req.body},
                function(err){
                    if(!err){
                        console.log("[UPDATED] - "+req.params.articleTitle+" is updated!");
                    }else{
                        console.log("Error Can't Update!");
                    }
                }
            )
        }
    )
    //Delete a specific artical
    .delete(function(req, res){
        Article.deleteOne(
            {title: req.params.articleTitle},
            function(err){
                if(err){
                    console.log("[Delete] - error");
                }else{
                    console.log("[Delete] - Done!");
                }
            }
        )
    });

app.listen(port, function(){
    console.log("server is runing on /localhost:"+port);
});