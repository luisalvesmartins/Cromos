var autenticado=false;

async function loadId(idCromos){
    let response = await fetch(`/api/row?r=${idCromos}`);
    var id=null;
    try {
        let result = await response.json();
        col=JSON.parse(result.data);
        colecao=result.colecao;
        document.getElementById("divColecoes").value=colecao;
    } catch (error) {
        col={falta:[],rep:[]}                        
    }
    document.getElementById("divAuth").style.display="none";
    document.getElementById("divEscolha").style.display="block";
    document.getElementById("divIntro").style.display="none";
    document.getElementById("divLinkOut").style.display="none";
    document.getElementById("render").innerHTML=render(struct,"");
    document.getElementById("render").style.display="block";
}


function copyToClipBoard() {
    var content=document.getElementById("divLink").innerText;
    navigator.clipboard.writeText(content);
}

function getAllUrlParams(url) {
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    var obj = {};
    if (queryString) {
        queryString = queryString.split('#')[0];
        var arr = queryString.split('&');
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].split('=');
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            paramName = paramName.toLowerCase();
            if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
            if (paramName.match(/\[(\d+)?\]$/)) {

                var key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];
                if (paramName.match(/\[\d+\]$/)) {
                    var index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                obj[key].push(paramValue);
                }
            } else {
                if (!obj[paramName]) {
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string'){
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    obj[paramName].push(paramValue);
                }
            }
        }
    }
    return obj;
}

var UI={
    pedir:async function(r){
        var c=document.getElementById("divColecoes").value;
        var e=document.getElementById("email").value;
        let response = await fetch(`/api/ask?c=${c}&r=${r}&e=${e}`, async function (req, res) {
            var result=response.text();
            if (result=="true" || result==true)
                    alert("Gravado")
                else
                    alert(result)
        });
    },
    procurar:async function(){
        var c=document.getElementById("divColecoes").value;
        var e=document.getElementById("email").value;
        var p=document.getElementById("password").value;

        if (autenticado){
            if (c!="Escolha"){
                let response = await fetch(`/api/find?c=${c}&e=${e}&p=${p}`);
                try {
                    let result = await response.json();

                    var s="";
                    if (result.length==0)
                    {
                        s="Não há utilizadores com os cromos que procuras"
                    }
                    else
                    {
                        s+="Estes utilizadores têm estes cromos que procuras:<br>";
                        for(var f=0;f<result.length;f++)
                        {
                            s+="<div onclick='UI.pedir(" + result[f].email + ")' style='cursor:pointer;margin-top:6px;'><b><u>Pedir</u></b></div>";
                            s+="<div style='display:flex;flex-wrap:wrap;'>";
                                for(var g=0;g<result[f].cromos.length;g++){
                                    var a=result[f].cromos[g].split("_");
                                    s+="<div>" + a[0] ;
                                    s+=renderCromo(a[0], a[1], true, 0);
                                    s+="</div>"
                                }
                                // + ([f].cromos
                            s+="</div>";
                        }
                    }
                    document.getElementById("render").innerHTML=s;
                } catch (error) {
                }
            }
            else
            {
                alert("Escolha uma colecção primeiro");
            }

        }
        else
        {
            alert("Tem que estar autenticado primeiro");
        }
    },
    redraw:function(){
        if (autenticado){
            document.getElementById("divAuth").style.display="none";
            document.getElementById("divEscolha").style.display="block";
            document.getElementById("btnUser").innerText=email.value;

            var c=document.getElementById("divColecoes").value;            
            if (c!="Escolha"){
                document.getElementById("divIntro").style.display="none";
                UI.unfreeze("btnEditar");
            }
            else
            {
                document.getElementById("divIntro").style.display="block";
                UI.freeze("btnEditar");
            }
            UI.unfreeze("btnProcurar");
        }
        else
        {
            document.getElementById("divAuth").style.display="flex";
            document.getElementById("divEscolha").style.display="none";
            document.getElementById("divColecoes").value="Escolha";
            document.getElementById("render").style.display="none";
            document.getElementById("divIntro").style.display="block";
            UI.freeze("btnEditar");
            UI.freeze("btnEditar");
            UI.freeze("btnProcurar");
        }
    },
    change:async function(){
        var c=document.getElementById("divColecoes").value;
        var e=document.getElementById("email").value;
        var p=document.getElementById("password").value;
        
        if (c!="Escolha"){
            if (autenticado){
                let response = await fetch(`/api/load?c=${c}&e=${e}&p=${p}`);
                var id=null;
                try {
                    let result = await response.json();
                    col=JSON.parse(result.data);
                    id=result.id;
                } catch (error) {
                    col={falta:[],rep:[]}                        
                }
                if (id)
                    document.getElementById("divLink").innerText=window.location.origin + "?id=" + id;
                else
                    document.getElementById("divLink").innerText="";
                document.getElementById("divLinkOut").style.display="block";
                console.log(JSON.stringify(col))
                document.getElementById("render").innerHTML=render(struct,"");
                document.getElementById("render").style.display="block";
            }
            else
            {
                alert("Tem que estar autenticado primeiro");
            }
        }
        else
        {
            document.getElementById("divLinkOut").style.display="none";
            document.getElementById("render").style.display="none";
        }
        UI.redraw();
    },
    freeze:function(btn){
        document.getElementById(btn).style.color="gray";
    },
    unfreeze:function(btn){
        document.getElementById(btn).style.color="white";
    },
    user:function(){
        autenticado=false;
        UI.redraw();
    },
    editar:function(){
        if (!autenticado){
            // document.getElementById("divAuth").style.display="flex";
            UI.freeze("btnEditar");
            UI.freeze("btnGravar");
            alert("Tem que estar autenticado primeiro");
        }
        else
        {
            var c=document.getElementById("divColecoes").value;
            if (c!="Escolha"){
                UI.freeze("btnEditar");
                UI.unfreeze("btnGravar");
                document.getElementById("render").innerHTML=render(struct,"EDIT");
            }
            else
            {
                alert("Escolha uma colecção primeiro");
            }
        }
    },
    auth:function(){
        var e=document.getElementById("email").value;
        var p=document.getElementById("password").value;
        if (e!="" && p!=""){
            autenticado=true;
            UI.redraw();
        }
    },
    gravar:async function(){
        if (!autenticado){
            // document.getElementById("divAuth").style.display="flex";
            UI.freeze("btnEditar");
            UI.freeze("btnGravar");
            alert("Tem que estar autenticado primeiro");
        }
        else
        {
            var c=document.getElementById("divColecoes").value;
            var e=document.getElementById("email").value;
            var p=document.getElementById("password").value;
            
            if (c!="Escolha"){
                let response = await fetch('/api/save', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({c:c,e:e,p:p,d:col})
                });

                let result = await response.json();
                if (result=="true" || result==true)
                    alert("Gravado")
                else
                    alert(result)

                UI.unfreeze("btnEditar");
                UI.freeze("btnGravar");
                document.getElementById("render").innerHTML=render(struct,"");
            }

        }
    }
}

//STRUCT describes the stickers
var struct={
    title:"Qatar 2022",
    forceShow:true,
    options:[
        {title:"FWC",options:[{min:0,max:29}]},
        {title:"ARG",options:[{min:1,max:20}]},
        {title:"AUS",options:[{min:1,max:20}]},
        {title:"BEL",options:[{min:1,max:20}]},
        {title:"BRA",options:[{min:1,max:20}]},
        {title:"CAN",options:[{min:1,max:20}]},
        {title:"CMR",options:[{min:1,max:20}]},
        {title:"CRC",options:[{min:1,max:20}]},
        {title:"CRO",options:[{min:1,max:20}]},
        {title:"DEN",options:[{min:1,max:20}]},
        {title:"ECU",options:[{min:1,max:20}]},
        {title:"ENG",options:[{min:1,max:20}]},
        {title:"ESP",options:[{min:1,max:20}]},
        {title:"FRA",options:[{min:1,max:20}]},
        {title:"GER",options:[{min:1,max:20}]},
        {title:"GHA",options:[{min:1,max:20}]},
        {title:"IRN",options:[{min:1,max:20}]},
        {title:"JPN",options:[{min:1,max:20}]},
        {title:"KOR",options:[{min:1,max:20}]},
        {title:"KSA",options:[{min:1,max:20}]},
        {title:"MAR",options:[{min:1,max:20}]},
        {title:"MEX",options:[{min:1,max:20}]},
        {title:"NED",options:[{min:1,max:20}]},
        {title:"POL",options:[{min:1,max:20}]},
        {title:"POR",options:[{min:1,max:20}]},
        {title:"QAT",options:[{min:1,max:20}]},
        {title:"SEN",options:[{min:1,max:20}]},
        {title:"SRB",options:[{min:1,max:20}]},
        {title:"SUI",options:[{min:1,max:20}]},
        {title:"TUN",options:[{min:1,max:20}]},
        {title:"URU",options:[{min:1,max:20}]},
        {title:"USA",options:[{min:1,max:20}]},
        {title:"WAL",options:[{min:1,max:20}]}
    ]
}

var col={falta:[],rep:[]}
//var col={falta:['DEN_16'],rep:[{id:'DEN_17',v:1},{id:'DEN_19',v:1},{id:'WAL_20',v:2}]}

function falta(id){
    var c=document.getElementById(id).className;
    if (c.indexOf(" falta")>-1){
        document.getElementById(id).className=c.replace(" falta","");
        var i=col.falta.findIndex(I=>I==id);
        col.falta.splice(i,1);
        document.getElementById(id + "_e").style.display="flex";
    }
    else{
        col.falta.push(id)
        document.getElementById(id).className+=" falta";
        document.getElementById(id + "_e").style.display="none";
    }
}
function repet(id,dir){
    var idCor=id.substring(0,id.length-2);
    var i=col.rep.findIndex(I=>I.id==idCor);
    if (i>-1){
        col.rep[i].v+=dir;
        var v=col.rep[i].v;
        if (col.rep[i].v==0)
            col.rep.splice(i,1)
    }
    else
    {
        col.rep.push({id:idCor,v:1});
        var v=1;
    }
    if (dir)
        document.getElementById(id).innerHTML=v;
}
function renderCromo(title, num, bFalta, nRep){
    var sClass="cromo";
    var sAdd="";
    if (bFalta) {
        sClass+=" falta";
    }
    else
    {
        sAdd= `<div class="cromor" id="${title}_${num}_e">
                <div id="${title}_${num}_R">${nRep}</div>
                </div>`;
    }
    return `<div id="${title}_${num}" class="${sClass}">
                <div class=cromonum>${num}</div>
                ${sAdd}
            </div>`;

}
function render(elem,displayMode){
    var s="";
    var bFaltaAlgum=false;
    var bTemRepetidos=false;
    if (elem.title) {
        s+="<div class=cromotitle>" + elem.title + "</div>";
    }
    for(var f=0;f<elem.options.length;f++){
        var bLeaf=true;
        if (elem.options[f].options)
            bLeaf=false

            if (elem.options[f].max){
                s+="<div style='display:flex;flex-wrap:wrap;'>"
                for(var g=elem.options[f].min;g<=elem.options[f].max;g++){
                    var sClass="cromo";
                    var elemId=elem.title+ "_" + g;
                    var bFalta=false;
                    if (col.falta.findIndex(I=>I==elemId)>-1)
                    {
                        bFalta=true;
                        bFaltaAlgum=true;
                        sClass="cromo falta";
                    }
                    var nRep=0;
                    var r=col.rep.findIndex(I=>I.id==elemId);
                    if (r>-1)
                    {
                        nRep=col.rep[r].v;
                        if (nRep>0){
                            bTemRepetidos=true;
                        }
                    }
                    if (displayMode=="EDIT"){
                        s+=`<div id="${elem.title}_${g}" class="${sClass}">
                            <div class=cromonum onclick=falta('${elem.title}_${g}')>${g}</div>
                        <div class="cromor" id="${elem.title}_${g}_e">
                                <div class=hand onclick=repet("${elem.title}_${g}_R",-1)>-</div>
                                <div id="${elem.title}_${g}_R">${nRep}</div>
                                <div class=hand onclick=repet("${elem.title}_${g}_R",1)>+</div>
                        </div>
                        </div>`
                    }
                    else
                    {
                        if(bFalta || nRep>0){
                            s+=renderCromo(elem.title, g, bFalta, nRep);
                        }
                    }
                }
                s+="</div>"
            }

        if (!bLeaf)
            s+=render(elem.options[f], displayMode);
    }
    if (displayMode!="EDIT" && !elem.forceShow){
        if (!(bFaltaAlgum || bTemRepetidos))
            s="";
    }
    return s;
}

async function init(){
    var o=new Option("Qatar 2022");
    document.getElementById("divColecoes").appendChild(o)

    UI.redraw();

    var idCromos=getAllUrlParams().id;
    if (idCromos!=null)
    {
        await loadId(idCromos);
    }
}

window.onload=init;
