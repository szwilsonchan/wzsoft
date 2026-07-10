window.callback[@configid@]=null;
window.callbackpara[@configid@]=null;

function MyTree[@configid@](list, rootId,dbfield,itemid,itemtitles) {
    this.list = JSON.parse(JSON.stringify(list));
    this.rootId = rootId;
    this.nodesMap = {};
    this.treeData = [];
    this.dbfield=dbfield;
    this.arrf = itemtitles.split("|");
    this.code=itemid;
}

MyTree[@configid@].prototype = {
    init: function () {
        document.getElementById(this.rootId).innerHTML="<div style=\"cursor:pointer;font-size:[@itemfontsize@];height:[@itemheight@];padding:8px;text-align:right\"><span class='searchclose[@configid@]' onclick=\"closeSearchDiv[@configid@](event)\">&Chi;</span></div>";
        this.treeData = this.initTreeData(this.list);
        for (let i = 0; i < this.treeData.length; i++) {
            this.createDom(this.treeData[i]);
        }
    },

    initTreeData: function (arr) {
        for (let i = 0; i < arr.length; i++) this.nodesMap[arr[i].ID] = arr[i];
        let reArr = [];
        for (let i = 0; i < arr.length; i++) {
            arr[i]['showChilds'] = false;
            if (!this.nodesMap[arr[i].PID]) reArr.push(arr[i]);
            else {
                let fatherNode = this.nodesMap[arr[i].PID];
                fatherNode.childs = fatherNode.childs || [];
                fatherNode.childs.push(arr[i]);
            }
        }
        return reArr;
    },

    createDom: function (data) {
        let self = this;
        let fatherDom = document.getElementById(`${this.rootId}-my-tree-${data.PID}`);
        if (!fatherDom) fatherDom = document.getElementById(this.rootId);
        let dom = document.createElement("div");
        dom.id = `${this.rootId}-my-tree-${data.ID}`;
        dom.className = 'treeItem[@configid@]';
        let iconDom = document.createElement("div");
        iconDom.id = `${this.rootId}-my-tree-icon-${data.ID}`;

        if(data.childs && data.childs.length > 0) 
        {
            iconDom.innerHTML = "+";
            iconDom.className = "itemIcon[@configid@]";
        }
        else
        {
            iconDom.innerHTML = "-";  
            iconDom.className = "itemIconSub[@configid@]";
        }

        dom.appendChild(iconDom);

        let itemID = "";
        let itemTitle = "";
        itemID = data[this.code]+"";
        for(let i=0;i<this.arrf.length;i++)
        {
            itemTitle = itemTitle + data[this.arrf[i]]+ "|";
        }
        itemTitle = itemTitle.substring(0,itemTitle.length-1);

        itemID=itemID.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll('"','&quot;');

        dom.innerHTML += "<span style='cursor:pointer' onclick=\"selItemDo[@configid@]('"+ this.dbfield +"','"+ itemID +"','"+ itemTitle +"','')\">"+ itemTitle +"</span>";

        if(data.PID!=""&&data.PID!="0")
        {
            dom.style.display = 'none';
        }
        fatherDom.appendChild(dom);
        iconDom = document.getElementById(`${this.rootId}-my-tree-icon-${data.ID}`);
        iconDom.onclick = function () {
            self.iconClickHandler(iconDom);
        };
        if (data.childs && data.childs.length > 0) {
            for (let i = 0; i < data.childs.length; i++) this.createDom(data.childs[i]);
        }
    },

    iconClickHandler(dom) {
        if (!dom || !dom.id) return;
        let id = dom.id;
        if (id.indexOf("my-tree-icon-") == -1) return;
        id = id.substring(id.indexOf("my-tree-icon-") + 13);
        let node = this.nodesMap[id];
        if (!node) return;
        if (node.showChilds) {
            this.hideHandler(dom);
            if(node.childs && node.childs.length>0)
                dom.innerHTML = "+";
            else
                dom.innerHTML = "-";
        } else {
            this.showHandler(dom);
            dom.innerHTML = "-";
        }
    },

    hideHandler: function (dom) {
        if (!dom || !dom.id) return;
        let id = dom.id;
        if (id.indexOf("my-tree-icon-") == -1) return;
        id = id.substring(id.indexOf("my-tree-icon-") + 13);
        let node = this.nodesMap[id];
        if (!node) return;
        let childs = node.childs;
        if (!childs) return;
        node.showChilds = false;
        for (let i = 0; i < childs.length; i++) {
            let childDom = document.getElementById(`${this.rootId}-my-tree-${childs[i].ID}`);
            if (!childDom) continue;
            childDom.style.display = 'none';
            let childIconDom = document.getElementById(`${this.rootId}-my-tree-icon-${childs[i].ID}`);
            this.hideHandler(childIconDom);
        }
    },

    showHandler: function (dom) {
        if (!dom || !dom.id) return;
        let id = dom.id;
        if (id.indexOf("my-tree-icon-") == -1) return;
        id = id.substring(id.indexOf("my-tree-icon-") + 13);
        let node = this.nodesMap[id];
        if (!node) return;
        let childs = node.childs;
        if (!childs) return;
        node.showChilds = true;
        for (let i = 0; i < childs.length; i++) {
            let childDom = document.getElementById(`${this.rootId}-my-tree-${childs[i].ID}`);
            if (!childDom) continue;
            childDom.style.display = 'block';
            let childIconDom = document.getElementById(`${this.rootId}-my-tree-icon-${childs[i].ID}`);
            let childNode = this.nodesMap[childs[i].ID];
            if(childNode.childs && childNode.childs.length > 0) 
            {
                childIconDom.innerHTML = "+";
            }
            else
            {
                childIconDom.innerHTML = "-";  
            }
            this.hideHandler(childIconDom);
        }
    }
}
function closeSearchDiv[@configid@](e)
{
    e.target.parentElement.parentElement.style.display="none";
}
function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}
function openUpdWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("updWin[@configid@]").style.display="block";
    window.callback[@configid@]=callback;
    window.callbackpara[@configid@]=callbackpara;
}
function openWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("modalWin[@configid@]").style.display="block";
    document.getElementById("modalWinMsg[@configid@]").innerText=msg;
    window.callback[@configid@]=callback;
    window.callbackpara[@configid@]=callbackpara;
}
function openWinOK[@configid@]() 
{
    window.callback[@configid@](window.callbackpara[@configid@]); 
}

function closeWin[@configid@]() 
{
    document.getElementById("coverWin[@configid@]").style.display="none";
    document.getElementById("modalWin[@configid@]").style.display="none";
    document.getElementById("updWin[@configid@]").style.display="none";
    document.getElementById("updWin-info[@configid@]").style.display="none";
}

function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}
function pageName[@configid@]()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String).split(".");
    return c.slice(0, 1);

}
function goAddSub[@configid@](l)
{
    let f = pageName[@configid@]();
    f=f+".html";
    window.location.href="form_"+ l + "?backlocation="+f;
}
function genDateDiv[@configid@](dsname)
{
    try{
    new DatePicker[@configid@]('_DatePicker_demo'+dsname, {
        inputId: dsname,
        className: 'date-picker-wp',
        seprator: '-'
        });
    }
    catch(err)
    {
        alert(err);
    }
}
function selItemHide[@configid@](field)
{
    let dnode = document.getElementById("divSelSearchs"+ field +"[@configid@]");
    dnode.style.display="none";
}
function selItemDel[@configid@](field,e)
{
    let p = e.srcElement.parentElement.parentElement.parentElement;
    if(p.parentElement.className=="divSelItems[@configid@]")
    {
        p.parentElement.removeChild(p);
        selItemValues[@configid@](field);
    }

}
function selItemValues[@configid@](field)
{
    let ids="";
    let ds = document.getElementById("divSelItems"+ field +"[@configid@]");
    for (let dNode of ds.childNodes) 
    {
        if(dNode.className == "selItemDiv")
        {
            let id = dNode.childNodes[1].value;
            let title = dNode.childNodes[0].innerHTML;
            id = id.replaceAll(",","&#44;");
            ids=ids+id+",";
        }
    }
    if(ids.indexOf(","))
    {
        ids = ids.substring(0,ids.length-1);
    }
    document.getElementById("valSel"+ field +"[@configid@]").value=ids;
    
}
function selItemDo[@configid@](field,id,title,f)
{
   
    let d = document.createElement("div");
    d.className="selItemDiv";

    let s="";
    s = s + "<span class=\"action-content\" style=\"border:none\"></span>";
    s = s + "<input type='hidden' />";

    s = s + "<span class=\"action-content\" style=\"float:right\" >";
    s = s + "<a href='#' onclick=\"selItemDel[@configid@]('"+ field +"',event);return false\"><img width=\"80%\"  src=\"./imgs/del.png\"></a></span>";
    d.innerHTML=s;

    d.childNodes[0].innerHTML=title;
    d.childNodes[1].value=id;
    document.getElementById("divSelItems"+ field +"[@configid@]").appendChild(d);
    document.getElementById("divSelItems"+ field +"[@configid@]").style.display="block";
    document.getElementById("divSelSearchs"+ field +"[@configid@]").style.display="none";

    if(document.getElementById("inpSel"+ field +"[@configid@]"))
    {
        document.getElementById("inpSel"+ field +"[@configid@]").value="";
    }

    selItemValues[@configid@](field);

}
function selItemSearchSub[@configid@](field,f,e)
{
    let inp = e.target.value;
    if(inp.length>=2||f=="sel")
    {
        let sdata = {};
        let viewcode="";
        let fcode="";
        let ftitle="";
        let forder="";
        let searchdata = window.getSearchDatas[@configid@]();
        for (let item of searchdata) 
        {
            let fieldname = Object.keys(item)[0];
            if(fieldname==field)
            {
                let fieldobj = item[field];
                let selvalue = JSON.parse(fieldobj['fselvalue']);
                sdata=selvalue['value'];
                viewcode=sdata['viewcode'];
                fcode=sdata['valuefield'].toUpperCase();
                ftitle=sdata['showfield'].toUpperCase();
                if(sdata['orderfield'])
                    forder=sdata['orderfield'];
                break;
            }
        }

        let paras = {};
        paras['viewCode']=viewcode;
        paras['curPage']=1;
        paras['pageItmes']=100;
        if(f=="searchsel")
            paras['topItems']=3;
        if(forder!="")
            paras['order_'+forder]="";

        paras['filter_searchkey_like']=inp;

        axios.post("./../api/datalist",paras).then(function(res){
        let redatas=Object.values(res.data)[0];

        let str="";
        for (let item of redatas) 
        {
            let itemID = "";
            let itemTitle = "";

            itemID = item[fcode]+"";
            itemTitle = item[ftitle];

            itemID=itemID.replaceAll("'","\\'");
            itemTitle=itemTitle.replaceAll("'","\\'");
            itemTitle=itemTitle.replaceAll('"','&quot;');

            str = str + "<div class=\"selItemShow\" onclick=\"selItemDo[@configid@]('"+ field +"','"+ itemID +"','"+ itemTitle +"','')\" ><span style=\"border:none\">"+ itemTitle +"</span>";
            str = str + "</div>";
        }

        let dnode = document.getElementById("divSelSearchs" + field + "[@configid@]");
        if(str!="")
        {
            str = "<div class=\"selItemShow\" style=\"padding-bottom:8px;text-align:right\"><span class='searchclose[@configid@]' onclick=\"closeSearchDiv[@configid@](event)\">&Chi;</span></div>"+str;
        }
        dnode.innerHTML=str;
        dnode.style.display="block";

        }).catch(function (err) {
        });
    }
    else
        selItemHide[@configid@](field);
}

function selItemSearchTree[@configid@](field,e)
{

    let sdata = {};
    let viewcode="";
    let fcode="";
    let ftitle="";
    let forder="";
    let searchdata = window.getSearchDatas[@configid@]();
    for (let item of searchdata) 
    {
        let fieldname = Object.keys(item)[0];
        if(fieldname==field)
        {
            let fieldobj = item[field];
            let selvalue = JSON.parse(fieldobj['fselvalue']);
            sdata=selvalue['value'];
            viewcode=sdata['viewcode'];
            fcode=sdata['valuefield'].toUpperCase();
            ftitle=sdata['showfield'].toUpperCase();
            forder=sdata['orderfield'];
            break;
        }
    }

    let paras = {};
    paras['viewCode']=viewcode;
    paras['curPage']=1;
    paras['pageItmes']=1000;
    if(forder!="")
        paras['order_pid#asc,'+forder]="";
    else
        paras['order_pid_asc']="";

    axios.post("./../api/datalist",paras).then(function(res){
    let redatas=Object.values(res.data)[0];

    let dnode = document.getElementById("divSelSearchs" + field + "[@configid@]");
    dnode.style.display="block";

    var myDataTree = new MyTree[@configid@](redatas, "divSelSearchs" + field + "[@configid@]",field,fcode,ftitle);
    myDataTree.init();

    }).catch(function (err) {
    });
}

function selItemSearch[@configid@](field,f,e)
{
    if(f=='radio')
    {
        let sdata = [];
        let viewcode="";
        let fcode="";
        let ftitle="";
        let forder="";
        let searchdata = window.getSearchDatas[@configid@]();
        for (let item of searchdata) 
        {
            let fieldname = Object.keys(item)[0];
            if(fieldname==field)
            {
                let fieldobj = item[field];
                let selvalue = JSON.parse(fieldobj['fselvalue']);
                if(selvalue['dbtype']=="2")
                {
                    sdata=selvalue['value'];
                    viewcode=sdata['viewcode'];
                    fcode=sdata['valuefield'].toUpperCase();
                    ftitle=sdata['showfield'].toUpperCase();
                    forder=sdata['orderfield'];
                }
                else
                {
                    sdata=selvalue['value'];
                }
                break;
            }
        }

        if(viewcode!="")
        {
            let paras = {};
            paras['viewCode']=viewcode;
            paras['curPage']=1;
            paras['pageItmes']=100;
            if(forder!="")
                paras['order_'+forder]="";

            axios.post("./../api/datalist",paras).then(function(res){
            let redatas=Object.values(res.data)[0];
            let str="";
            for (let item of redatas) 
            {
                let itemID = "";
                let itemTitle = "";
    
                itemID = item[fcode]+"";
                itemTitle = item[ftitle];
    
                itemID=itemID.replaceAll("'","\\'");
                itemTitle=itemTitle.replaceAll("'","\\'");
                itemTitle=itemTitle.replaceAll('"','&quot;');
    
                str = str + "<div class=\"selItemShow\" onclick=\"selItemDo[@configid@]('"+ field +"','"+ itemID +"','"+ itemTitle +"','')\" ><span style=\"border:none\">"+ itemTitle +"</span>";
                str = str + "</div>";

            }

            let dnode = document.getElementById("divSelSearchs" + field + "[@configid@]");
            if(str!="")
            {
                str = "<div class=\"selItemShow\" style=\"font-size:[@itemfontsize@];height:[@itemheight@];padding-bottom:8px;text-align:right\"><span class='searchclose[@configid@]' onclick=\"closeSearchDiv[@configid@](event)\">&Chi;</span></div>"+str;
            }
            dnode.innerHTML=str;
            dnode.style.display="block";

            }).catch(function (err) {
            });

        }
        else
        {
            let str="";
            for (let item of sdata) 
            {
                let itemID = item['CODE'];
                let itemTitle = item['NAME'];

                itemID=itemID.replaceAll("'","\\'");
                itemID=itemID.replaceAll('"','&quot;');
                itemTitle=itemTitle.replaceAll("'","\\'");
                itemTitle=itemTitle.replaceAll('"','&quot;');

                str = str + "<div class=\"selItemShow\" onclick=\"selItemDo[@configid@]('"+ field +"','"+ itemID +"','"+ itemTitle +"','')\" ><span style=\"border:none\">"+ itemTitle +"</span>";
                str = str + "</div>";
            }
            let dnode = document.getElementById("divSelSearchs" + field + "[@configid@]");
            if(str!="")
            {
                str = "<div class=\"selItemShow\" style=\"font-size:[@itemfontsize@];height:[@itemheight@];padding-bottom:8px;text-align:right\"><span class='searchclose[@configid@]' onclick=\"closeSearchDiv[@configid@](event)\">&Chi;</span></div>"+str;
            }
            dnode.innerHTML=str;
            dnode.style.display="block";
        }

    }
}

var chartDom[@configid@] = null;
var ChartObj[@configid@] = null;

if('[@stattype@]'!='4')
{
    chartDom[@configid@] = document.getElementById('container[@configid@]');
    ChartObj[@configid@] = echarts.init(chartDom[@configid@], null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    window.addEventListener('resize', ChartObj[@configid@].resize);
}

const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            viewcode:"[@viewcode@]",
            datas:null,
            searchdatas:[@searchdatas@],
            statparas:[@statparas@],
            checkboxshow:[@checkboxshow@],
            dataitem:{},
            datalabs:null,
            datatotal:null,
            curpage:1,
            totalpage:0,
            totalitems:0,
            topItems:[@topitems@],
            orderField:"[@orderfield@]",
            pageitems:[@pageitems@],
            beginpage:0,
            endpage:0,
            showpages:[],
            hasitmes:true,
            pkey:null,
            isupd:true,
            returnmsg:'',
            arrShowTitles:[],
            selIds:[],
            pkeyIds:[],
            selAll:false
        }
    },
    methods: 
    {
        [@btnfunc@]
        checkedOneId(Id) 
        {
            let idIndex = this.selIds.indexOf(Id)
            if (idIndex >= 0) {
            this.selIds.splice(idIndex, 1)
            } else {
            this.selIds.push(Id)
            }
        },
        checkedAllId() 
        {
            if(!this.selAll)
            {
                this.selIds = this.pkeyIds;
                this.selAll=true;
            }
            else
            {
                this.selIds = [];
                this.selAll=false;
            }
        },
        getSearchDatas()
        {
            return this.searchdatas;
        },
        openUpdWinVue(msg,callback,callbackpara) 
        {
            openUpdWin[@configid@](msg,callback,callbackpara);
        },
        getSearchPara(paras) 
        {
            let msg="";
            let d = document.getElementById("searchDiv[@configid@]");
            for(let dc of d.childNodes)
            {
                if(msg!="")
                    break;

                for(let dNode of dc.childNodes)
                {
                    if(msg!="")
                        break;

                    let cls = dNode.className;
                    cls=cls.replaceAll(" right","");
                    cls=cls.trim();
                    if(cls=="inputVal")
                    {
                        let dNodeSub = dNode.firstChild;
                        let v = dNodeSub.value+"";
                        if(v.trim()!="")
                            paras[dNodeSub.name]=dNodeSub.value;
                        if(v.length>200)
                        {
                            msg= "[@infonoexceed@]200:" + dNodeSub.value;
                            break;
                        }
                    }
                    else if(cls=="scopeVal")
                    {
                        let logicone = "";
                        let logictwo = "";
                        let dsname1="";
                        let dsname2="";
                        let dbtype="";
                        for(let dNodeSub of dNode.childNodes)
                        {
                            let clsSub = dNodeSub.className;
                            if(clsSub=="valOneNumber")
                                dbtype = "number";
                            else if (clsSub=="valOneDate")
                                dbtype = "date";
                            else if (clsSub=="valOneDateTime")
                                dbtype = "datetime";
                            
                            if(dNodeSub.className=="logicOne")
                            {
                                logicone = dNodeSub.value;
                            }
                            else if((clsSub)&&clsSub.indexOf("valOne")==0)
                            {
                                if(logicone!=""&&dNodeSub.value!="")
                                {
                                    dsname1 = "filter_"+dNodeSub.name+"_" + logicone;
                                    paras[dsname1] = dNodeSub.value;
                                }
                            }
                            else if(dNodeSub.className=="valTimeOne")
                            {
                                if(logicone!=""&&paras[dsname1]&&dNodeSub.value!="")
                                {
                                    paras[dsname1] = paras[dsname1] + " " + dNodeSub.value;
                                }
                            }
                            else if(dNodeSub.className=="logicTwo")
                            {
                                logictwo = dNodeSub.value;
                            }
                            else if(dNodeSub.className=="valTwo")
                            {
                                if(logictwo!=""&&dNodeSub.value!="")
                                {
                                    dsname2 = "filter_"+dNodeSub.name+"_" + logictwo;
                                    paras[dsname2] = dNodeSub.value;
                                }
                            }
                            else if(dNodeSub.className=="valTimeTwo")
                            {
                                if(logictwo!=""&&paras[dsname2]&&dNodeSub.value!="")
                                {
                                    paras[dsname2] = paras[dsname2] + " " + dNodeSub.value;
                                }
                            }
                        }
                        if(dbtype=="number"||dbtype=="decimal1"||dbtype=="decimal2")
                        {
                            let strchk1 = "";
                            if(paras[dsname1])
                                strchk1 = paras[dsname1];
                            if(strchk1.trim()!="")
                            {
                                let n= strchk1.search(/^(\-)?\d+(\.\d+)?$/i);
                                if(n==-1)
                                {
                                    msg = "[@infonumber@]"+strchk1;
                                    break;
                                }
                                if(strchk1.length>15)
                                {
                                    msg= "[@infonoexceed@]15:" + strchk1;
                                    break;
                                }
                            }

                            let strchk2 = "";
                            if(paras[dsname2])
                                strchk2 = paras[dsname2];
                            if(strchk2.trim()!="")
                            {
                                let n= strchk2.search(/^(\-)?\d+(\.\d+)?$/i);
                                if(n==-1)
                                {
                                    msg = "[@infonumber@]"+strchk2;
                                    break;
                                }
                                if(strchk2.length>15)
                                {
                                    msg= "[@infonoexceed@]15:" + strchk2;
                                    break;
                                }
                            }
                        }
                        else if(dbtype=="date")
                        {
                            let strchk1 = "";
                            if(paras[dsname1])
                                strchk1 = paras[dsname1];
                            if(strchk1.trim()!="")
                            {
                                if(!this.checkDateTime(strchk1 + " 00:00:00"))
                                {
                                    msg = "[@infodate@]"+strchk1;
                                    break;
                                }
                            }

                            let strchk2 = "";
                            if(paras[dsname2])
                                strchk2 = paras[dsname2];
                            if(strchk2.trim()!="")
                            {
                                if(!this.checkDateTime(strchk2 + " 00:00:00"))
                                {
                                    msg = "[@infodate@]"+strchk2;
                                    break;
                                }
                            }
                        }
                        else if(dbtype=="datetime")
                        {
                            let strchk1 = "";
                            if(paras[dsname1])
                                strchk1 = paras[dsname1];
                            if(strchk1.trim()!="")
                            {
                                if(!this.checkDateTime(strchk1))
                                {
                                    msg = "[@infodate@]"+strchk1;
                                    break;
                                }
                            }

                            let strchk2 = "";
                            if(paras[dsname2])
                                strchk2 = paras[dsname2];
                            if(strchk2.trim()!="")
                            {
                                if(!this.checkDateTime(strchk2))
                                {
                                    msg = "[@infodate@]"+strchk2;
                                    break;
                                }
                            }
                        }
                    }
                    else if(cls=="selVal"||cls=="selValMul")
                    {
                        let dNodeSub = dNode.firstChild;
                        let v = dNodeSub.value+"";
                        if(v.trim()!="")
                            paras[dNodeSub.name]=dNodeSub.value;
                    }
                }
            }
            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@configid@]").style.display="block";
                return false;
            }
            return true;
        },
        checkDateTime(str)
        {
            let reg = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
            let r = str.match(reg);
            if(r==null)return false;
            r[2]=r[2]-1;
            let d= new Date(r[1], r[2],r[3], r[4],r[5], r[6]);
            if(d.getFullYear()!=r[1])return false;
            if(d.getMonth()!=r[2])return false;
            if(d.getDate()!=r[3])return false;
            if(d.getHours()!=r[4])return false;
            if(d.getMinutes()!=r[5])return false;
            if(d.getSeconds()!=r[6])return false;
            return true;
        },
        getSearchField(tbl,field,rvalue) 
        {  
            if(rvalue)
            {
                let dbtype=rvalue['dbtype'];
                let ftype=rvalue['ftype'];
                let fselvalue = rvalue['fselvalue'];
                let title = rvalue['title'];
                let str = "";
                str = str + "<div class=\"left\">"+ title +"</div>";

                let dc = document.createElement("div");
                dc.className="updWin-content-item";
                if(ftype=="d")
                {
                    let dsname1 = "";
                    let dsname2 = "";
                    dsname1="date" + tbl + "_" + field +"1[@configid@]";
                    dsname2="date" + tbl + "_" + field +"2[@configid@]";

                    str = str + "<div class=\"scopeVal  right\" >";
                    str = str + "<select class=\"logicOne\" >[@seloptiond@]</select>";
                    str = str + "<input class=\"valOneDate\" placeholder=\"\" style=\"width:[@searchwidth@]\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"1[@configid@]\" />";
                    str = str + "<select class=\"logicTwo\" >[@seloptiond@]</select>";
                    str = str + "<input class=\"valTwo\" placeholder=\"\" style=\"width:[@searchwidth@]\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"2[@configid@]\" />";
                    str = str + "</div>";
                    dc.innerHTML=str;
                    document.getElementById("searchDiv[@configid@]").appendChild(dc);
                    genDateDiv[@configid@](dsname1);
                    genDateDiv[@configid@](dsname2);
                }
                else if(ftype=="dt")
                {
                    let dsname1 = "";
                    let dsname2 = "";
                    dsname1="date" + tbl + "_" + field +"1[@configid@]";
                    dsname2="date" + tbl + "_" + field +"2[@configid@]";

                    str = str + "<div class=\"scopeVal  right\" style=\"line-height:40px\" >";
                    str = str + "<select class=\"logicOne\" >[@seloptiondt@]</select>";
                    str = str + "<input class=\"valOneDateTime\" placeholder=\"\" style=\"width:[@searchwidth@]\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"1[@configid@]\" />";
                    str = str + "<input class=\"valTimeOne\" style=\"width:[@searchwidth@]\" type=\"text\" value='00:00:00' />";
                    str = str + "<br/><select class=\"logicTwo\" >[@seloptiondt@]</select>";
                    str = str + "<input class=\"valTwo\" placeholder=\"\" style=\"width:[@searchwidth@]\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"2[@configid@]\" />";
                    str = str + "<input class=\"valTimeTwo\" style=\"width:[@searchwidth@]\" type=\"text\" value='00:00:00' />";
                    str = str + "</div>";

                    dc.innerHTML=str;
                    document.getElementById("searchDiv[@configid@]").appendChild(dc);
                    genDateDiv[@configid@](dsname1);
                    genDateDiv[@configid@](dsname2);
                }
                else if(dbtype=="nvarchar2")
                {
                    let fPara = {};
                    if(fselvalue!="")
                    {
                        fPara=JSON.parse(fselvalue);
                        if(fPara['type']=="radio"||fPara['type']=="mulsel")
                        {
                            str = str + "<div class=\"selVal  right\" style=\"position: relative;\" >";

                            if(fPara['type']=="mulsel")
                                str = str + "<input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_mulsel\" id=\"valSel"+ tbl + "." + field +"[@configid@]\"  />";
                            else
                                str = str + "<input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_sel\" id=\"valSel"+ tbl + "." + field +"[@configid@]\"  />";
                            
                            str = str + "<div>";
                            str = str + "<input style=\"float:left\" type=\"text\" id=\"inpSel"+ tbl + "." + field +"[@configid@]\" onclick=\"selItemSearch[@configid@]('"+ tbl + "." + field +"','radio',event)\" placeholder=\"\" />";
                            str = str + "<div class=\"divSelItems[@configid@]\" id=\"divSelItems"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontent[@configid@]\" style=\"clear:both\"  id=\"divSelSearchs"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                        }
                        else if(fPara['type']=="searchtree")
                        {
                            str = str + "<div class=\"selValMul  right\" style=\"position: relative;\" ><input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_mulsel\" id=\"valSel"+ tbl + "." + field +"[@configid@]\"  />";
                            str = str + "<div>";
                            str = str + "<input type=\"button\" class=\"btnAddVar[@configid@]\" id=\"inpSel[@configid@]\" onclick=\"selItemSearchTree[@configid@]('"+ tbl + "." + field +"',event)\" value=\" "+ fPara['value']['searchinfo'] +" \" />";
                            str = str + "<div class=\"divSelItems[@configid@]\" id=\"divSelItems"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontent[@configid@]\" style=\"clear:both;min-width:50%\"  id=\"divSelSearchs"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                        }
                        else if(fPara['type']=="searchsel")
                        {
                            str = str + "<div class=\"selValMul  right\" style=\"position: relative;\" ><input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_mulsel\" id=\"valSel"+ tbl + "." + field +"[@configid@]\"  />";
                            str = str + "<div>";
                            str = str + "<input style=\"float:left\" type=\"text\" id=\"inpSel"+ tbl + "." + field +"[@configid@]\" oninput=\"selItemSearchSub[@configid@]('"+ tbl + "." + field +"','searchsel',event)\" placeholder=\""+ fPara['value']['searchinfo'] +"\" />";
                            str = str + "<div class=\"divSelItems[@configid@]\" id=\"divSelItems"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontent[@configid@]\" style=\"clear:both\"  id=\"divSelSearchs"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                        }
                        else if(fPara['type']=="sel")
                        {
                            str = str + "<div class=\"selVal  right\" style=\"position: relative;\" ><input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_sel\" id=\"valSel"+ tbl + "." + field +"[@configid@]\"  />";
                            str = str + "<div>";
                            str = str + "<input style=\"float:left\" type=\"text\" id=\"inpSel"+ tbl + "." + field +"[@configid@]\" onclick=\"selItemSearchSub[@configid@]('"+ tbl + "." + field +"','sel',event)\" placeholder=\"\" />";
                            str = str + "<div class=\"divSelItems[@configid@]\" id=\"divSelItems"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontent[@configid@]\" style=\"clear:both\"  id=\"divSelSearchs"+ tbl + "." + field +"[@configid@]\" ></div>";
                            str = str + "</div>";
                        }
                    }
                    else
                    {
                        str = str + "<div class=\"inputVal  right\" ><input type=\"text\"  name=\"filter_"+ tbl + "." + field +"_like\"  /></div>";
                    }
                    dc.innerHTML=str;
                    document.getElementById("searchDiv[@configid@]").appendChild(dc);
                }
                else if(dbtype=="number"||dbtype=="decimal1"||dbtype=="decimal2")
                {
                    str = str + "<div class=\"scopeVal right\" ><select class=\"logicOne\" >[@seloption@]</select>";
                    str = str + "<input class=\"valOneNumber\" type=\"text\" style=\"width:128px\"  name=\""+ tbl + "." + field +"\"  />";
                    str = str + "<select class=\"logicTwo\" >[@seloption@]</select>";
                    str = str + "<input class=\"valTwo\" type=\"text\" style=\"width:128px\" name=\""+ tbl + "." + field +"\"  />";
                    dc.innerHTML=str;
                    document.getElementById("searchDiv[@configid@]").appendChild(dc);
                }
            }

        },
        getDatas () 
        {
            let paras = {};
            paras['viewCode']=this.viewcode;
            paras['curPage']=this.curpage;
            paras['pageItmes']=this.pageitems;
            if(this.topItems>0)
                paras['topItems']=this.topItems;
            if(this.orderField!="")
                paras['order_'+this.orderField]="";

            setPageParas(paras,mapPara);

            [@parasdefault@]

            if(this.statparas!=null)
            {
                paras['statparas'] = JSON.stringify(this.statparas);
            }

            paras['isdebug'] = "[@isdebug@]";

            var that = this;
            axios.post("./../[@pubtype@]api/datalist",paras).then(function(res){
            that.datas=Object.values(res.data)[0];    
            that.datalabs=Object.values(res.data)[1]; 
            that.arrShowTitles=[];
            for(let item of that.datalabs)
            {
                let fkey = Object.keys(item)[0];
                that.arrShowTitles.push(fkey.toUpperCase());
            } 
            that.datatotal=Object.values(res.data)[2];
            let p = Object.values(Object.values(res.data)[3])[0];
            that.pkey=p['pkey'];
            that.totalitems=Object.values(Object.values(Object.values(that.datatotal)[0]))[0];
            
            let m = Object.values(Object.values(res.data)[3])[1];
            getGlobalParas(m,mapPara);
            that.dealPages();

            that.pkeyIds = [];
            that.selIds=[];
            that.selAll=false;
            let chartLbl=[];
            let chartData=[];
            for(let item of that.datas)
            {
                chartLbl.push(item['[@big_statlbl@]']);
                chartData.push(item['[@big_statdata@]']);
                that.pkeyIds.push(item[that.pkey]);
            }

            for(let item of that.searchdatas)
            {
                let skey = Object.keys(item)[0];
                let svalue = item[skey];
                let tbl = skey.substring(0,skey.indexOf("."));
                let field = skey.substring(skey.indexOf(".")+1);
                that.getSearchField(tbl,field,svalue);
            }

            if('[@stattype@]'=='1')
                that.chartShow1(chartLbl,chartData);
            else if('[@stattype@]'=='2')
                that.chartShow2(chartLbl,chartData);
            else if('[@stattype@]'=='3')
                that.chartShow3(chartLbl,chartData);  
            else if('[@stattype@]'=='4')
                that.chartShow4(chartData);  

            onload[@configid@]();

            }).catch(function (err) {
            });
        },
        getDatasByFilters(curpage,f) 
        {
            if(curpage==0)
                return;
            if(curpage>this.totalpage&&this.totalpage!=0)
                return;

            let view_filters = document.getElementById("view_prp_filters[@configid@]");
            datafilter = "";
            let paras = {};
            if(f=="")
            {
                view_filters = document.getElementById("view_prp_filters[@configid@]");
                for (let node of view_filters.childNodes) 
                {
                    let fname = node.name;
                    if(fname!=undefined)
                    {
                        let farrs=fname.split("_");
                        if(farrs.length==3&&farrs[0]=="filter")
                        {
                            paras[fname]=node.value;
                        }
                    }
                }
            }
            else
            {
                if(!this.getSearchPara(paras))
                    return;
            }

            paras['viewCode']=this.viewcode;
            paras['datafilter']=datafilter;
            paras['curPage']=curpage;
            paras['pageItmes']=this.pageitems;
            if(this.topItems>0)
                paras['topItems']=this.topItems;
            if(this.orderField!="")
                paras['order_'+this.orderField]="";

            setPageParas(paras,mapPara);

            [@parasdefault@]

            if(this.statparas!=null)
            {
                paras['statparas'] = JSON.stringify(this.statparas);
            }
            
            paras['isdebug'] = "[@isdebug@]";
            
            var that = this;
            axios.post("./../[@pubtype@]api/datalist",paras).then(function(res){
            gDealAjaxLogin(res);
            that.datas=Object.values(res.data)[0];    
            that.datalabs=Object.values(res.data)[1]; 
            that.arrShowTitles=[];
            for(let item of that.datalabs)
            {
                let fkey = Object.keys(item)[0];
                that.arrShowTitles.push(fkey.toUpperCase());
            }  
            that.datatotal=Object.values(res.data)[2];
            let p = Object.values(Object.values(res.data)[3])[0];
            that.pkey=p['pkey'];
            that.totalitems=Object.values(Object.values(Object.values(that.datatotal)[0]))[0];
            that.curpage=paras['curPage'];
            
            let m = Object.values(Object.values(res.data)[3])[1];
            getGlobalParas(m,mapPara);
            that.dealPages();

            that.pkeyIds = [];
            that.selIds=[];
            that.selAll=false;
            let chartLbl=[];
            let chartData=[];
            for(let item of that.datas)
            {
                chartLbl.push(item['[@big_statlbl@]']);
                chartData.push(item['[@big_statdata@]']);
                that.pkeyIds.push(item[that.pkey]);
            }
            if(f!="")
            {
                closeWin[@configid@]();
            }

            if('[@stattype@]'=='1')
                that.chartShow1(chartLbl,chartData);
            else if('[@stattype@]'=='2')
                that.chartShow2(chartLbl,chartData);
            else if('[@stattype@]'=='3')
                that.chartShow3(chartLbl,chartData);    
            else if('[@stattype@]'=='4')
                that.chartShow4(chartData); 

            onload[@configid@]();

            }).catch(function (err) {
            });
        },
        chartDealData(chartLbl,chartData)
        {
            let chartSeriesDatas = {};
            chartSeriesDatas['lbl']=[];
            chartSeriesDatas['lblsub']=[];
            chartSeriesDatas['data']=[];
            if(this.datalabs.length==2)
            {
                let sitem = {};
                sitem['name']="";
                sitem['data']=chartData;
                chartSeriesDatas['data'].push(sitem);

                let lblInit = {};
                for(let i = 0; i < chartLbl.length; i++)
                {
                    if(lblInit[chartLbl[i]]==null)
                        lblInit[chartLbl[i]]=0;
                }
                
                for(key in lblInit)
                {
                    chartSeriesDatas['lbl'].push(key);
                }

                chartSeriesDatas['lblsub']=chartSeriesDatas['lbl'];

            }
            else if(this.datalabs.length==3)
            {
                let lblSub = {};
                let lblInit = {};
                
                for(let i = 0; i < chartLbl.length; i++)
                {
                    if(lblInit[chartLbl[i]]==null)
                        lblInit[chartLbl[i]]=0;
                }

                let keysub
                for(let item of this.datas)
                {
                    for(key in item)
                    {
                        if(key !='[@big_statlbl@]'&& key !='[@big_statdata@]'&& key !='RN')
                        {
                            keysub = key;
                            if(lblSub[item[key]]==null)
                                lblSub[item[key]]=gcopyobj(lblInit);
                        }
                    }
                }
                
                for(let item of this.datas)
                {
                    let ls = lblSub[item[keysub]];
                    ls[item['[@big_statlbl@]']]=item['[@big_statdata@]'];
                }

                for(key in lblSub)
                {
                    chartSeriesDatas['lblsub'].push(key);

                    let sitem = {};
                    sitem['name']=key;

                    let sdata = lblSub[key];
                    let cdata=[];
                    for(k in sdata)
                    {
                        cdata.push(sdata[k]);
                    }

                    sitem['data']=cdata;
                    chartSeriesDatas['data'].push(sitem);
                }
                for(key in lblInit)
                {
                    chartSeriesDatas['lbl'].push(key);
                }
            }
            return chartSeriesDatas;

        },
        chartShow1(chartLbl,chartData)
        {
            
            let csd = this.chartDealData(chartLbl,chartData);
            let chartSeriesDatas = csd['data'];
            let chartSeries = [];
            
            for(let i = 0; i < chartSeriesDatas.length; i++)
            {
                let sitem = chartSeriesDatas[i];
                let citem = {};
                citem['name'] = sitem['name'];
                citem['data'] = sitem['data'];
                citem['type'] = "bar";
                citem['showBackground'] = true;
                citem['backgroundStyle'] = {color: 'rgba(180, 180, 180, 0.2)'};
                chartSeries.push(citem);
            }

            let chartOption = {
                title: {
                    text: '[@fieldtitle@]',
                    subtext: '',
                    left: 'center',
                    textStyle: {
                      color: '[@fontcolor@]'    
                    }
                  },
                  tooltip: {
                    trigger: 'item'
                  },
                  legend: {
                    orient: 'vertical',
                    left: 'left',
                    textStyle: {
                      color: '[@fontcolor@]'    
                    }
                  },
                xAxis: {
                type: 'category',
                data: csd['lbl'],
                axisLabel: {
                    color: '[@fontcolor@]' 
                }
                },
                yAxis: {
                type: 'value'
                },
                series: chartSeries
                };
                
            if (chartOption && typeof chartOption === 'object') {
                ChartObj[@configid@].setOption(chartOption,true);
            }
        },
        chartShow2(chartLbl,chartData)
        {
            let chartShowData=[];

            for(let i = 0; i < chartLbl.length; i++)
            {
                let k = chartLbl[i];
                let v = chartData[i];
                let item = {};
                item['name'] = k;
                item['value'] = v;
                chartShowData.push(item);
            }

            let chartOption = {
                title: {
                  text: '[@fieldtitle@]',
                  subtext: '',
                  left: 'center',
                  textStyle: {
                    color: '[@fontcolor@]'    
                  }
                },
                tooltip: {
                  trigger: 'item'
                },
                legend: {
                  orient: 'vertical',
                  left: 'left',
                  textStyle: {
                    color: '[@fontcolor@]'    
                  }
                },
                series: [
                  {
                    name: 'Stat Data',
                    type: 'pie',
                    radius: '50%',
                    data: chartShowData,
                    label: {
                        show: true,
                        color: '[@fontcolor@]'
                    },
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                      }
                    }
                  }
                ]
            };
                
            if (chartOption && typeof chartOption === 'object') {
                ChartObj[@configid@].setOption(chartOption,true);
            }
        }
        ,
        chartShow3(chartLbl,chartData)
        {
            let csd = this.chartDealData(chartLbl,chartData);
            let chartSeriesDatas = csd['data'];
            let chartSeries = [];

            for(let i = 0; i < chartSeriesDatas.length; i++)
            {
                let sitem = chartSeriesDatas[i];
                let citem = {};
                citem['name'] = sitem['name'];
                citem['data'] = sitem['data'];
                citem['type'] = "line";
                chartSeries.push(citem);
            }

            let chartOption = {
                title: {
                    text: '[@fieldtitle@]',
                    subtext: '',
                    left: 'center',
                    textStyle: {
                      color: '[@fontcolor@]'    
                    }
                  },
                  tooltip: {
                    trigger: 'item'
                  },
                  legend: {
                    orient: 'vertical',
                    left: 'left',
                    textStyle: {
                      color: '[@fontcolor@]'    
                    }
                },
                xAxis: {
                type: 'category',
                data: csd['lbl'],
                axisLabel: {
                    color: '[@fontcolor@]' 
                }
                },
                yAxis: {
                type: 'value'
                },
                series: chartSeries
                };
                
            if (chartOption && typeof chartOption === 'object') {
                ChartObj[@configid@].setOption(chartOption,true);
            }
        },
        chartShow4(chartData)
        {
            document.getElementById("shownum[@configid@]").style.display="block";
            document.getElementById("shownum[@configid@]").innerHTML=chartData[0];
        },
        dealPages () 
        {
            let items = parseInt(this.totalitems);
            let pItmes = parseInt(this.pageitems);
            if(items==0)
            {
                this.hasitmes=false;
                return;
            }
            if(items % pItmes==0)
                this.totalpage = parseInt(items/pItmes);
            else
                this.totalpage = parseInt(items/pItmes)+1;
    
            this.beginpage = ((this.curpage-2)>=1)?(this.curpage-2):1;
            this.endpage = ((this.beginpage+4)<=this.totalpage)?(this.beginpage+4):this.totalpage;

            this.showpages=[];
            for(let i=this.endpage;i>=this.beginpage;i--)
            {
                this.showpages.push({i});
            }
        },
        setDataItem(k,v)
        {
            if(k=='s#display')
            {
                let p = document.getElementById("datalist[@configid@]").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
            if(k=='s#refresh')
            {
                this.getDatasByFilters(1);
            }
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        this.getDatas();
        window.getSearchDatas[@configid@]=this.getSearchDatas;
        window.setDataItem[@configid@] = this.setDataItem;
    }
}

Vue.createApp(DataListVue[@configid@]).mount('#datalist[@configid@]');

function onchange[@configid@]()
{
    [@onchange@]
}

function onload[@configid@]()
{
    [@onload@]
}
function onclicknum[@configid@]()
{
    [@onclicknum@]
}

var DatePicker[@configid@] = function () {
    var $ = function (i)
    {
    return document.getElementById(i)
    },
    addEvent = function (o, e, f) {o.addEventListener ? o.addEventListener(e, f, false) : o.attachEvent('on'+e, function(){f.call(o)})},
    getPos = function (el) {
    for (var pos = {x:0, y:0}; el; el = el.offsetParent) {
    pos.x += el.offsetLeft;
    pos.y += el.offsetTop;
    }
    return pos;
    };
    var init = function (n, config) {
    window[n] = this;
    Date.prototype._fd = function () {var d = new Date(this); d.setDate(1); return d.getDay()};
    Date.prototype._fc = function () {var d1 = new Date(this), d2 = new Date(this); d1.setDate(1); d2.setDate(1); d2.setMonth(d2.getMonth()+1); return (d2-d1)/86400000;};
    this.n = n;
    this.config = config;
    this.D = new Date;
    this.el = $(config.inputId);
    this.el.title = this.n+'DatePicker';
    this.update();
    this.bind();
    };
    init.prototype = {
    update : function (y, m) {
    var con = [], week = ['Su','Mo','Tu','We','Th','Fr','Sa'], D = this.D, _this = this;
    fn = function (a, b) {return '<td title="'+_this.n+'DatePicker" class="noborder hand" onclick="'+_this.n+'.update('+a+')">'+b+'</td>'},
    _html = '<table cellpadding=0 cellspacing=2>';
    y && D.setYear(D.getFullYear() + y);
    m && D.setMonth(D.getMonth() + m);
    var year = D.getFullYear(), month = D.getMonth() + 1, date = D.getDate();
    for (var i=0; i<week.length; i++) con.push('<td title="'+this.n+'DatePicker" class="noborder">'+week[i]+'</td>');
    for (var i=0; i<D._fd(); i++ ) con.push('<td title="'+this.n+'DatePicker" class="noborder"> </td>');
    for (var i=0; i<D._fc(); i++ ) con.push('<td class="hand[@configid@]" onclick="'+this.n+'.fillInput('+year+', '+month+', '+(i+1)+')">'+(i+1)+'</td>');
    var toend = con.length%7;
    if (toend != 0) for (var i=0; i<7-toend; i++) con.push('<td class="noborder"> </td>');
    _html += '<tr>'+fn("-1, null", "<<")+fn("null, -1", "<")+'<td title="'+this.n+'DatePicker" colspan=3 class="strong[@configid@]">'+year+'/'+month+'/'+date+'</td>'+fn("null, 1", ">")+fn("1, null", ">>")+'</tr>';
    for (var i=0; i<con.length; i++) _html += (i==0 ? '<tr>' : i%7==0 ? '</tr><tr>' : '') + con[i] + (i == con.length-1 ? '</tr>' : '');
    !!this.box ? this.box.innerHTML = _html : this.createBox(_html);
    },
    fillInput : function (y, m, d) {
    var s = this.config.seprator || '/';
    this.el.value = y + s + m + s + d;
    this.box.style.display = 'none';
    },
    show : function () {
    var s = this.box.style, is = this.mask.style;
    s['left'] = is['left'] = getPos(this.el).x + 'px';
    s['top'] = is['top'] = getPos(this.el).y + this.el.offsetHeight + 'px';
    s['display'] = is['display'] = 'block';
    is['width'] = this.box.offsetWidth - 2 + 'px';
    is['height'] = this.box.offsetHeight - 2 + 'px';
    },
    hide : function () {
    this.box.style.display = 'none';
    this.mask.style.display = 'none';
    },
    bind : function () {
    var _this = this;
    addEvent(document, 'click', function (e) {
    e = e || window.event;
    var t = e.target || e.srcElement;
    if (t.title != _this.n+'DatePicker') {_this.hide()} else {_this.show()}
    });
    },
    createBox : function (html) {
    var box = this.box = document.createElement('div'), mask = this.mask = document.createElement('iframe');
    box.className = this.config.className || 'datepicker';
    mask.src = 'javascript:false';
    mask.frameBorder = 0;
    box.style.cssText = 'position:absolute;display:none;z-index:9999';
    mask.style.cssText = 'position:absolute;display:none;z-index:9998';
    box.title = this.n+'DatePicker';
    box.innerHTML = html;
    document.body.appendChild(box);
    document.body.appendChild(mask);
    return box;
    }
    };
    return init;
    }();
