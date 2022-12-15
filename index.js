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

app.get('/api/row', urlencodedParser, async function (req, res) {
    var rowId=req.query.r;
    var row=await database.queryRowAsync(rowId);
    if (row){
        res.send({colecao:row.colecao, data:row.data});
    }
    else
        res.send("");
});
app.get('/api/load', urlencodedParser, async function (req, res) {
    var colecao=req.query.c;
    var email=req.query.e;
    var password=req.query.p;
    var row=await database.queryOneAsync(colecao,email,password);
    if (row){
        res.send({id:row.rowid, data:row.data});
    }
    else
        res.send("");
});
app.post('/api/save',urlencodedParser, async function (req, res) {
    var b=req.body;
    console.log("BODY:",b)
    var colecao=b.c;
    var email=b.e.toLowerCase();
    var password=b.p;
    var data=JSON.stringify(b.d);
    var row=await database.insertAsync(colecao,email,password,data);
    res.send("true")
});
app.get('/api/find', urlencodedParser, async function (req, res) {
    var colecao=req.query.c;
    var email=req.query.e;
    var password=req.query.p;

    var list=[];
    var row=await database.queryOneAsync(colecao,email,password);
    if (row){
        var col=JSON.parse(row.data);

        //console.log("FIND",col)
        var rows=await database.queryColecao(colecao, email);
        for(var f=0;f<rows.length;f++){
            var R=rows[f];
            var col1=JSON.parse(R.data);
            var r=find(col,col1);
            //console.log(R.email,col1,"R",r)
            if (r.length>0){
                list.push({email:R.rowid,cromos:r});
            }
        }
    }
    res.send(list)
});
app.get('/api/ask', async function (req, res) {
    var colecao=req.query.c;
    var row=req.query.r;
    var email=req.query.e;

    var r=await database.insertAskAsync(colecao, row, email);
    res.send("true")
});

function find(col,col1){
    var list=[];
    //falta
    for(var f=0;f<col.falta.length;f++)
    {
        var falta=col.falta[f];
        var encIndex=col1.rep.findIndex(R=>R.id==falta);

        if(encIndex>-1){
            list.push(falta);
        }
    }
    return list;
}


var server = app.listen(process.env.PORT || 3000, async function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("App listening at http://%s:%s", host, port)

    await database.open();
    console.log("Database ok");
 })