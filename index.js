var express = require('express');
const {DB}=require("./db")
var bodyParser = require('body-parser');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var app = express();
var database=new DB();
app.use(bodyParser.json());

//Serves resources from public folder 
app.use('/',express.static(__dirname + '/site')); 
app.get('/api/load', urlencodedParser, async function (req, res) {
    var colecao=req.query.c;
    var email=req.query.e;
    var password=req.query.p;
    var row=await database.queryOneAsync(colecao,email,password);
    if (row)
        res.send(row.data);
    else
        res.send("");
});
app.post('/api/save',urlencodedParser, async function (req, res) {
    var b=req.body;
    console.log("BODY:",b)
    var colecao=b.c;
    var email=b.e;
    var password=b.p;
    var data=JSON.stringify(b.d);
    var row=await database.insertAsync(colecao,email,password,data);
    res.send("true")
});

async function a(){
    await database.open();
}

var server = app.listen(3000, async function () {
    await a();
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })