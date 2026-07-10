;if("Role".indexOf("@btntitlesel@")>0)
{
    document.getElementById("intLogout").value="Role";
}
;    const MenuVuewzsoftcomc64e05056a14ca224ad296a4076497c72 = 
    {
        data() 
        {
            return {
	            curLocation:"",
                menumode:"1",
                apptype:"1",
                showpid:{},
                datas:null
            }
        },
        methods: 
        {
            getDatas() 
            {

                let paras = {};
                if(this.menumode=='1')
                {
                    if(sessionStorage)
                    {
                        let s = sessionStorage.getItem("menulist");
                        if(s)
                        {
                            let mo = JSON.parse(s);
                            paras['mrole'] = mo['mrole'];
                            paras['mdate'] = mo['mdate'];
                        }
                    }

                    paras['apptype']=this.apptype;
                    var that = this;
                    axios.post("./../apimenu/getlist",paras).then(function(res){
                    
                    let redata = res.data;
                    if(redata[0])
                    {
                        that.datas=redata[0];
                        let mo = redata[1];
                        mo['mlist'] = that.datas;
                        if(sessionStorage)
                        {
                            sessionStorage.setItem("menulist",JSON.stringify(mo));
                        }
                    }
                    else
                    {
                        if(sessionStorage)
                        {
                            let s = sessionStorage.getItem("menulist");
                            if(s)
                            {
                                let mo = JSON.parse(s);
                                that.datas = mo['mlist'];
                            }
                        }
                    }

                    for(let item of that.datas)
                    {
                        if(item["PID"]==null)
                            that.showpid['S'+item["APPID"]] = false;
                    }

                    that.getMenuSession();
                    document.getElementById("menu-contentwzsoftcomc64e05056a14ca224ad296a4076497c72").style.display="block";

                    }).catch(function (err) {
                    });
                }
                else if(this.menumode=='2')
                {
                    paras['curPage']=1;
                    paras['pageItmes']=500;
                    paras['apptype']=this.apptype;
                    paras['order_snum#asc,snumsub#asc']='';
                    var that = this;
                    axios.post("./../portal/apimenu/getlist",paras).then(function(res){
                    that.datas=redata[0];

                    for(let item of that.datas)
                    {
                        if(item["PID"]==null)
                            that.showpid['S'+item["APPID"]] = false;
                    }

                    that.getMenuSession();
                    document.getElementById("menu-contentwzsoftcomc64e05056a14ca224ad296a4076497c72").style.display="block";

                    }).catch(function (err) {
                    });
                }

            },
            onImgOver(s,e) 
            {
                let p = e.target;
                if(s&&s!="")
                {
                    p.src='./../upload/' +s;
                }
            },            
            onImgOut(s,e) 
            {
                let p = e.target;
                if(s&&s!="")
                {
                    p.src='./../upload/' +s;
                }
            },
            setMenuSession(pid,lc) 
            {
                if(pid!=null&&(lc==null||lc==''))
                {
                    if(this.showpid['S'+pid])
                        this.showpid['S'+pid]=false;
                    else
                        this.showpid['S'+pid]=true;
                }
                else
                {
                    let paras = {};
                    var that = this;
                    axios.post("./../apimenu/getcur?currentLocation="+lc,paras).then(function(res){
                    window.location.href=lc;
                    }).catch(function (err) {
                    });
                }
            },
            getMenuSession() 
            {
                let paras = {};
                var that = this;
                axios.post("./../apimenu/getcur",paras).then(function(res){
	            that.curLocation = res.data;
                for(let item of that.datas)
                {
                    if(item["LOCATION"]==that.curLocation&&that.curLocation!=null)
                    {
                        that.showpid['S'+item["PID"]] = true;
                        break;
                    }
                }
                }).catch(function (err) {
                });
            }
        },
        mounted() 
        {
            this.getDatas();
	        this.getMenuSession();
        }
    }
    
    Vue.createApp(MenuVuewzsoftcomc64e05056a14ca224ad296a4076497c72).mount('#menu-contentwzsoftcomc64e05056a14ca224ad296a4076497c72');
    
;window.callbackwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=null;
window.callbackparawzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=null;
var smodewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81="";

function MyTreewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(list, rootId,dbfield,itemid,itemtitles) {
    this.list = JSON.parse(JSON.stringify(list));
    this.rootId = rootId;
    this.nodesMap = {};
    this.treeData = [];
    this.dbfield=dbfield;
    this.arrf = itemtitles.split("|");
    this.code=itemid;
}

MyTreewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81.prototype = {
    init: function () {
        document.getElementById(this.rootId).innerHTML="<div style=\"cursor:pointer;font-size:16px;height:36px;padding:8px;text-align:right\"><span class='searchclosewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81' onclick=\"closeSearchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(event)\">&Chi;</span></div>";
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
        dom.className = 'treeItemwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81';
        let iconDom = document.createElement("div");
        iconDom.id = `${this.rootId}-my-tree-icon-${data.ID}`;

        if(data.childs && data.childs.length > 0) 
        {
            iconDom.innerHTML = "+";
            iconDom.className = "itemIconwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";
        }
        else
        {
            iconDom.innerHTML = "-";  
            iconDom.className = "itemIconSubwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";
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

        dom.innerHTML += "<span style='cursor:pointer' onclick=\"selItemDowzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ this.dbfield +"','"+ itemID +"','"+ itemTitle +"','')\">"+ itemTitle +"</span>";

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
function closeSearchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(e)
{
    e.target.parentElement.parentElement.style.display="none";
}
function closeInfoMsgwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(e) 
{
    e.srcElement.parentElement.style.display="none";
}
function openUpdWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(msg,callback,callbackpara) 
{
    document.getElementById("coverWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
    document.getElementById("updWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
    window.callbackwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=callback;
    window.callbackparawzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=callbackpara;
}
function openWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(msg,callback,callbackpara) 
{
    document.getElementById("coverWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
    document.getElementById("modalWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
    document.getElementById("modalWinMsgwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerText=msg;
    window.callbackwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=callback;
    window.callbackparawzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=callbackpara;
}
function openWinOKwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81() 
{
    window.callbackwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(window.callbackparawzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81); 
}

function closeWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81() 
{
    document.getElementById("coverWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="none";
    document.getElementById("modalWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="none";
    document.getElementById("updWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="none";
    document.getElementById("updWin-infowzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="none";
    document.getElementById("WfmWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="none";
}

function closeInfoMsgwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(e) 
{
    e.srcElement.parentElement.style.display="none";
}
function pageNamewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String).split(".");
    return c.slice(0, 1);
}
function getBackLocationwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String);
    return encodeURIComponent(c);
}
function goAddSubwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(l)
{
    let f = getBackLocationwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
    window.location.href="form_"+ l+"?backlocation="+f;
}
function genDateDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(dsname)
{
    try{
    new DatePickerwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('_DatePicker_demo'+dsname, {
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
function selItemHidewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field)
{
    let dnode = document.getElementById("divSelSearchs"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
    dnode.style.display="none";
}
function selItemDelwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field,e)
{
    let p = e.srcElement.parentElement.parentElement.parentElement;
    if(p.parentElement.className=="divSelItemswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81")
    {
        p.parentElement.removeChild(p);
        selItemValueswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field);
    }

}
function selItemValueswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field)
{
    let ids="";
    let ds = document.getElementById("divSelItems"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
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
    document.getElementById("valSel"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").value=ids;
    
}
function selItemDowzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field,id,title,f)
{
   
    let d = document.createElement("div");
    d.className="selItemDiv";

    let s="";
    s = s + "<span class=\"action-content\" style=\"border:none\"></span>";
    s = s + "<input type='hidden' />";

    s = s + "<span class=\"action-content\" style=\"float:right\" >";
    s = s + "<a href='#' onclick=\"selItemDelwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ field +"',event);return false\"><img width=\"80%\"  src=\"./imgs/del.png\"></a></span>";
    d.innerHTML=s;

    d.childNodes[0].innerHTML=title;
    d.childNodes[1].value=id;
    document.getElementById("divSelItems"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").appendChild(d);
    document.getElementById("divSelItems"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
    document.getElementById("divSelSearchs"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="none";

    if(document.getElementById("inpSel"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81"))
    {
        document.getElementById("inpSel"+ field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").value="";
    }

    selItemValueswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field);

}
function selItemSearchSubwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field,f,e)
{
    let inp = e.target.value;
    if(inp.length>=2||f=="sel")
    {
        let sdata = {};
        let viewcode="";
        let fcode="";
        let ftitle="";
        let forder="";
        let searchdata = window.getSearchDataswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
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

            str = str + "<div class=\"selItemShow\" onclick=\"selItemDowzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ field +"','"+ itemID +"','"+ itemTitle +"','')\" ><span style=\"border:none\">"+ itemTitle +"</span>";
            str = str + "</div>";
        }

        let dnode = document.getElementById("divSelSearchs" + field + "wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
        if(str!="")
        {
            str = "<div class=\"selItemShow\" style=\"padding-bottom:8px;text-align:right\"><span class='searchclosewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81' onclick=\"closeSearchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(event)\">&Chi;</span></div>"+str;
        }
        dnode.innerHTML=str;
        dnode.style.display="block";

        }).catch(function (err) {
        });
    }
    else
        selItemHidewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field);
}

function selItemSearchTreewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field,e)
{

    let sdata = {};
    let viewcode="";
    let fcode="";
    let ftitle="";
    let forder="";
    let searchdata = window.getSearchDataswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
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

    let dnode = document.getElementById("divSelSearchs" + field + "wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
    dnode.style.display="block";

    var myDataTree = new MyTreewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(redatas, "divSelSearchs" + field + "wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81",field,fcode,ftitle);
    myDataTree.init();

    }).catch(function (err) {
    });
}

function selItemSearchwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(field,f,e)
{
    if(f=='radio')
    {
        let sdata = [];
        let viewcode="";
        let fcode="";
        let ftitle="";
        let forder="";
        let searchdata = window.getSearchDataswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
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
    
                str = str + "<div class=\"selItemShow\" onclick=\"selItemDowzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ field +"','"+ itemID +"','"+ itemTitle +"','')\" ><span style=\"border:none\">"+ itemTitle +"</span>";
                str = str + "</div>";

            }

            let dnode = document.getElementById("divSelSearchs" + field + "wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
            if(str!="")
            {
                str = "<div class=\"selItemShow\" style=\"font-size:16px;height:36px;padding-bottom:8px;text-align:right\"><span class='searchclosewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81' onclick=\"closeSearchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(event)\">&Chi;</span></div>"+str;
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

                str = str + "<div class=\"selItemShow\" onclick=\"selItemDowzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ field +"','"+ itemID +"','"+ itemTitle +"','')\" ><span style=\"border:none\">"+ itemTitle +"</span>";
                str = str + "</div>";
            }
            let dnode = document.getElementById("divSelSearchs" + field + "wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
            if(str!="")
            {
                str = "<div class=\"selItemShow\" style=\"font-size:16px;height:36px;padding-bottom:8px;text-align:right\"><span class='searchclosewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81' onclick=\"closeSearchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(event)\">&Chi;</span></div>"+str;
            }
            dnode.innerHTML=str;
            dnode.style.display="block";
        }

    }
}
const DataListVuewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81 = 
{
    data() 
    {
        return {
            viewcode:"tblexpenseaccount",
            searchdatas:[],
            datas:null,
            dataitem:{},
            datalabs:null,
            datatotal:null,
            dataforms:null,
            curpage:1,
            totalpage:0,
            totalitems:0,
            topItems:0,
            orderField:"",
            pageitems:10,
            beginpage:0,
            endpage:0,
            showpages:[],
            hasitmes:true,
            formlocation:"",
            pkey:null,
            isupd:true,
            returnmsg:'',
            arrShowTitles:[],
            arrAmountFields:[],
            arrAmountFieldsM1:[],
            arrAmountFieldsM2:[],
            showaddbtn:true,
            showupdbtn:true,
            showdelbtn:true,
            showviewbtn:true,
            showdelmulbtn:true,
            formnum:1,
            selIds:[],
            pkeyIds:[],
            selAll:false,
            sortfield:'',
            sorttype:'',
            filterPara:[],
            isExcel:false,
            thWidths:{}
        }
    },
    methods: 
    {
        
        goUpdate (sForm,pkey) 
        {
            let f = getBackLocationwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
            window.location.href=sForm + "?itemid="+pkey+"&backlocation="+f;
        },
        getThWidth(f)
        {
            if(this.thWidths[f])
            {
                return this.thWidths[f];
            }
        },
        downloadExcel()
        {
            this.isExcel=true;
            gSetSessionStoreNull("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81","false");
            this.getDatasByFilters(1);
        },
        showWfmLog(itemid)
        {

            let paras = {};
            paras['viewCode']=this.viewcode;
            paras['itemIDs']=itemid;

            var that = this;
            axios.post("./../api/wfmworkgetlist",paras).then(function(res){
            let wfmdatas=res.data;    
            
            document.getElementById("coverWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
            document.getElementById("WfmWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
            let dc = document.getElementById("WfmWinMsgwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
            dc.innerHTML="";

            let f = pageNamewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
            f=f+".html";

            let iindex=0;
            for(let item of wfmdatas)
            {
                iindex=iindex+1;
                let d=document.createElement("div");
                if(item['COMPLETED']=='1')
                {
                    let apc = item['APPROVECOMMENT'];
                    if(apc==null)
                    {
                        apc="";
                    }
                    let apct = item['APPROVETIME'];
                    if(apct==null)
                    {
                        apct="";
                    }
                    let aform = item['FORMNAME'];
                    if(aform!=null&&aform!="")
                    {
                        aform = "  <a onclick=\"gGoViewLog('" + aform + "','" +item['WFMNODEID']+ "','" +item['WFMWORKID']+ "');void(0)\" >View</a>"
                    }
                    else
                    {
                        aform = "";
                    }
                    d.innerHTML="<span><b>Approved("+ item['PSNNAME'] +")</b></span><div><font style='color:grey'>"+ apc + aform + "</font></div><div><font style='color:grey'>"+ apct + "</font></div>"
                    d.className="wfmlogwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";
                    dc.appendChild(d);
                }
                else
                {
                    d.innerHTML="<span><b>Pending("+ item['PSNNAME'] +")</b></span>"
                    d.className="wfmlogwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";
                    dc.appendChild(d);
                }

                if(iindex<wfmdatas.length)
                {
                    d=document.createElement("div");
                    d.className="wfmlogArrowwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";
                    d.innerHTML="<img src='./imgs/sortdesc.png' />";
                    dc.appendChild(d);
                }

            }

            }).catch(function (err) {
            });
        },
        searchByMode(f)
        {
            smodewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81 = f;
            for(let item of this.filterPara)
            {
                if(item['key'].indexOf("pageParam_")==0)
                {
                    mapPara[item['key']]=null;
                }
            }
            this.filterPara=[];
            mapPara["globalParam_folderFilter"]=null;
            gSetSessionStoreNull("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81","false");
            this.getDatasByFilters(1);
        },
        sortdata(field)
        {
            if(field.indexOf('NOSORT')>=0)
                return;
            if(this.sortfield==field)
            {
                if(this.sorttype=='asc')
                    this.sorttype='desc';
                else
                    this.sorttype='asc';
            }
            else
                this.sorttype='asc';

            this.sortfield=field;
            gSetSessionStoreNull("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81","false");
            this.getDatasByFilters(1);
        },
        checkedOneId(Id) 
        {
            let idIndex = this.selIds.indexOf(Id)
            if (idIndex >= 0) {
            this.selIds.splice(idIndex, 1)
            } else {
            this.selIds.push(Id)
            }
            mapPara['globalParam_selectedDataIds'] = this.selIds.join(",");
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
            mapPara['globalParam_selectedDataIds'] = this.selIds.join(",");
        },
        goViewLog(sForm,wnodeid,wrkid) 
        {
            let f = pageNamewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
            f= f +".html";

            let paras = {};
            paras['tablename']=sForm;
            paras['wid']=wrkid;
            var that = this;
            axios.post("./../api/dataformgetlist",paras).then(function(res){

            let forms =res.data;  
            sForm = that.goDataForms(forms);
            let sf = "form_"+ sForm;
            window.location.href=sf + "?view=1&wfmworklistid="+ wrkid + "&wfmnodeid="+ wnodeid + "&viewwfmlog=1";

            }).catch(function (err) {
            });

        },
        goDataForms(forms) 
        { 
            let fpc = "";
            let fmobile="";
            let sform="";
            for(let i=0;i<forms.length;i++)
            {
                let mp = forms[i];
                if(mp['APPTYPE']=="2")
                {
                    fmobile = mp['LOCATION'];
                }
                else
                {
                    fpc = mp['LOCATION'];
                }
            }

            if('1'=='1')
            {
                sform =  fpc;
                if(fpc=="")
                {
                    sform =  fmobile;
                }
            }
            else
            {
                sform =  fmobile;
                if(fmobile=="")
                {
                    sform =  fpc;
                }  
            }

            if(sform.indexOf("form_")==0)
            {
                sform=sform.substring(5);
            }
            return sform;
        },
        getSearchDatas()
        {
            return this.searchdatas;
        },
        goView(sForm,pkey) 
        {
            let f = pageNamewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
            f=f+".html";

            let w = "_self";
            if(w.indexOf("@atarget@")>0)
                w = "_self";

            let nw = "";
            if(w=="_blank")
                nw = "&newwin=1";

            window.open(sForm + "?view=1"+ nw +"&itemid="+pkey,w);

        },
        goAdd() 
        {
            let f = getBackLocationwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
            window.location.href="form_"+this.formlocation+"?backlocation="+f;
        },
        goDel() 
        {
            if(this.selIds.length==0)
            {
                document.getElementById("content-info-msg1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerHTML="Please select the record you want to delete";
                document.getElementById("content-info1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
            }
            else
            {
                let notids="";
                for(let i=0;i<this.selIds.length;i++)
                {
                    for(let item of this.datas)
                    {
                        if(item[this.pkey]==this.selIds[i])
                        {
                            if(item['SYSSTATUS']!='Filling')
                            {
                                notids = notids + item[this.pkey]+",";
                            }
                        }
                    }
                }
                if(notids!="")
                {
                    notids = notids.substring(0,notids.length-1);
                    document.getElementById("content-info-msg1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerHTML="The submitted record（ID："+ notids +"））cannot be deleted, please remove the check mark";
                    document.getElementById("content-info1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
                    return;
                }
                this.openWinVue('Are you sure you want to delete the selected '+ this.selIds.length +' records',this.delDatas,this.selIds.join(","));
            }
        },
        openUpdWinVue(msg,callback,callbackpara) 
        {
            openUpdWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(msg,callback,callbackpara);
        },
        getSearchPara(paras) 
        {
            let msg="";
            let d = document.getElementById("searchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
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
                            msg= "The length of input content cannot exceed 200:" + dNodeSub.value;
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
                                    msg = "Please enter the number format:"+strchk1;
                                    break;
                                }
                                if(strchk1.length>15)
                                {
                                    msg= "The length of input content cannot exceed 15:" + strchk1;
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
                                    msg = "Please enter the number format:"+strchk2;
                                    break;
                                }
                                if(strchk2.length>15)
                                {
                                    msg= "The length of input content cannot exceed 15:" + strchk2;
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
                                    msg = "Please enter date format:"+strchk1;
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
                                    msg = "Please enter date format:"+strchk2;
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
                                    msg = "Please enter date format:"+strchk1;
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
                                    msg = "Please enter date format:"+strchk2;
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
                document.getElementById("updWin-info-msgwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerHTML=msg;
                document.getElementById("updWin-infowzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
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
        showDataItem() 
        {
            for( let item of this.datas )
            {
                if(item['SYSSTATUS']=='0')
                    item['SYSSTATUS']="Filling";
                if(item['SYSSTATUS']=='1')
                    item['SYSSTATUS']="Pending";
                if(item['SYSSTATUS']=='2')
                    item['SYSSTATUS']="Approved";
            }
        },
        getDataForms(v) 
        {
            this.dataforms=v;  
            let sc="";
            let ismobile = gClientIsMobile();

            let formpc=[];
            let formmobile=[];
            for(let i=0;i<this.dataforms.length;i++)
            {
                let fitem = this.dataforms[i];
                if(fitem['APPTYPE']=='2')
                {
                    formmobile.push(fitem);
                }
                else if(fitem['APPTYPE']=='1')
                {
                    formpc.push(fitem);
                }
            }

            if(ismobile)
            {
                if(formmobile.length==0)
                    this.dataforms=formpc;
                else
                    this.dataforms=formmobile; 
            }
            else
            {
                if(formpc.length==0)
                    this.dataforms=formmobile;
                else
                    this.dataforms=formpc; 
            }

            this.formnum=this.dataforms.length;
            if(this.formnum>0)
            {
                this.formlocation=this.dataforms[0]['LOCATION'];
            }

            if(this.formnum>1)
            {
                for (let item of this.dataforms) 
                {
                    sc = sc + "<li><a href='#' onclick=\"goAddSubwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ item['LOCATION'] +"')\" >"+ item['NAME'] +"</a></li>";
                }
                document.getElementById("divDataFormswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerHTML=sc;
            }
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
                    dsname1="date" + tbl + "_" + field +"1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";
                    dsname2="date" + tbl + "_" + field +"2wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";

                    str = str + "<div class=\"scopeVal  right\" >";
                    str = str + "<select class=\"logicOne\" ><option value='dequal'>==</option><option value='dgt'>&gt;</option><option value='dgte'>&gt;=</option><option value='dlt'>&lt;</option><option value='dlte'>&lt;=</option></select>";
                    str = str + "<input class=\"valOneDate\" placeholder=\"\" style=\"width:168px\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" />";
                    str = str + "<select class=\"logicTwo\" ><option value='dequal'>==</option><option value='dgt'>&gt;</option><option value='dgte'>&gt;=</option><option value='dlt'>&lt;</option><option value='dlte'>&lt;=</option></select>";
                    str = str + "<input class=\"valTwo\" placeholder=\"\" style=\"width:168px\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"2wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" />";
                    str = str + "</div>";
                    dc.innerHTML=str;
                    document.getElementById("searchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").appendChild(dc);
                    genDateDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(dsname1);
                    genDateDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(dsname2);
                }
                else if(ftype=="dt")
                {
                    let dsname1 = "";
                    let dsname2 = "";
                    dsname1="date" + tbl + "_" + field +"1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";
                    dsname2="date" + tbl + "_" + field +"2wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81";

                    str = str + "<div class=\"scopeVal  right\" style=\"line-height:40px\" >";
                    str = str + "<select class=\"logicOne\" ><option value='dtequal'>==</option><option value='dtgt'>&gt;</option><option value='dtgte'>&gt;=</option><option value='dtlt'>&lt;</option><option value='dtlte'>&lt;=</option></select>";
                    str = str + "<input class=\"valOneDateTime\" placeholder=\"\" style=\"width:168px\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" />";
                    str = str + "<input class=\"valTimeOne\" style=\"width:168px\" type=\"text\" value='00:00:00' />";
                    str = str + "<br/><select class=\"logicTwo\" ><option value='dtequal'>==</option><option value='dtgt'>&gt;</option><option value='dtgte'>&gt;=</option><option value='dtlt'>&lt;</option><option value='dtlte'>&lt;=</option></select>";
                    str = str + "<input class=\"valTwo\" placeholder=\"\" style=\"width:168px\" type=\"text\" name=\""+ tbl + "." + field + "\" id=\"date" + tbl + "_" + field +"2wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" />";
                    str = str + "<input class=\"valTimeTwo\" style=\"width:168px\" type=\"text\" value='00:00:00' />";
                    str = str + "</div>";

                    dc.innerHTML=str;
                    document.getElementById("searchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").appendChild(dc);
                    genDateDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(dsname1);
                    genDateDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(dsname2);
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
                                str = str + "<input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_mulsel\" id=\"valSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\"  />";
                            else
                                str = str + "<input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_sel\" id=\"valSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\"  />";
                            
                            str = str + "<div>";
                            str = str + "<input style=\"float:left\" type=\"text\" id=\"inpSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" onclick=\"selItemSearchwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ tbl + "." + field +"','radio',event)\" placeholder=\"\" />";
                            str = str + "<div class=\"divSelItemswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" id=\"divSelItems"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontentwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" style=\"clear:both\"  id=\"divSelSearchs"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                        }
                        else if(fPara['type']=="searchtree")
                        {
                            str = str + "<div class=\"selValMul  right\" style=\"position: relative;\" ><input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_mulsel\" id=\"valSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\"  />";
                            str = str + "<div>";
                            str = str + "<input type=\"button\" class=\"btnAddVarwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" id=\"inpSelwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" onclick=\"selItemSearchTreewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ tbl + "." + field +"',event)\" value=\" "+ fPara['value']['searchinfo'] +" \" />";
                            str = str + "<div class=\"divSelItemswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" id=\"divSelItems"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontentwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" style=\"clear:both;min-width:50%\"  id=\"divSelSearchs"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                        }
                        else if(fPara['type']=="searchsel")
                        {
                            str = str + "<div class=\"selValMul  right\" style=\"position: relative;\" ><input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_mulsel\" id=\"valSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\"  />";
                            str = str + "<div>";
                            str = str + "<input style=\"float:left\" type=\"text\" id=\"inpSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" oninput=\"selItemSearchSubwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ tbl + "." + field +"','searchsel',event)\" placeholder=\""+ fPara['value']['searchinfo'] +"\" />";
                            str = str + "<div class=\"divSelItemswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" id=\"divSelItems"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontentwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" style=\"clear:both\"  id=\"divSelSearchs"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                        }
                        else if(fPara['type']=="sel")
                        {
                            str = str + "<div class=\"selVal  right\" style=\"position: relative;\" ><input type=\"hidden\" name=\"filter_"+ tbl + "." + field +"_sel\" id=\"valSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\"  />";
                            str = str + "<div>";
                            str = str + "<input style=\"float:left\" type=\"text\" id=\"inpSel"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" onclick=\"selItemSearchSubwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81('"+ tbl + "." + field +"','sel',event)\" placeholder=\"\" />";
                            str = str + "<div class=\"divSelItemswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" id=\"divSelItems"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                            str = str + "<div class=\"dropcontentwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" style=\"clear:both\"  id=\"divSelSearchs"+ tbl + "." + field +"wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81\" ></div>";
                            str = str + "</div>";
                        }
                    }
                    else
                    {
                        str = str + "<div class=\"inputVal  right\" ><input type=\"text\"  name=\"filter_"+ tbl + "." + field +"_like\"  /></div>";
                    }
                    dc.innerHTML=str;
                    document.getElementById("searchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").appendChild(dc);
                }
                else if(dbtype=="number"||dbtype=="decimal1"||dbtype=="decimal2")
                {
                    str = str + "<div class=\"scopeVal right\" ><select class=\"logicOne\" ><option value='equal'>==</option><option value='gt'>&gt;</option><option value='gte'>&gt;=</option><option value='lt'>&lt;</option><option value='lte'>&lt;=</option></select>";
                    str = str + "<input class=\"valOneNumber\" type=\"text\" style=\"width:128px\"  name=\""+ tbl + "." + field +"\"  />";
                    str = str + "<select class=\"logicTwo\" ><option value='equal'>==</option><option value='gt'>&gt;</option><option value='gte'>&gt;=</option><option value='lt'>&lt;</option><option value='lte'>&lt;=</option></select>";
                    str = str + "<input class=\"valTwo\" type=\"text\" style=\"width:128px\" name=\""+ tbl + "." + field +"\"  />";
                    dc.innerHTML=str;
                    document.getElementById("searchDivwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").appendChild(dc);
                }
            }

        },
        getDatas () 
        {
            let paras = {};
            let spara = gGetSessionStore("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81","false");
            if(spara)
            {
                paras = spara['para'];
                this.pageitems = paras['pageItmes'];
            }
            else
            {
                paras['viewCode']=this.viewcode;
                paras['curPage']=this.curpage;
                paras['pageItmes']=this.pageitems;

                setPageParas(paras,mapPara);

                if(this.orderField!="")
                    paras['order_'+this.orderField]="";
            }

            if(this.topItems>0)
                paras['topItems']=this.topItems;

            paras['isdebug'] = "false";
            paras['updrights'] = "true";

            var that = this;
            axios.post("./../api/datalist",paras).then(function(res){
            if(res.data&&res.data[0]=="no rights")
            {
                document.getElementById("content-info-msg1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerHTML="No data rights";
                document.getElementById("content-info1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
                return;
            }

            that.datas=Object.values(res.data)[0];
            that.datalabs=Object.values(res.data)[1];  
            that.arrShowTitles=[];
            let labs=[];
            for(let item of that.datalabs)
            {
                let fkey = Object.keys(item)[0];
                let fi = fkey.indexOf("_");
                if(fi>0)
                {
                    let arrFkey = fkey.split("_");
                    fkey = arrFkey[0];
                    if(arrFkey[1]=="m1"||arrFkey[1]=="m2")
                    {
                        that.arrAmountFields.push(fkey.toUpperCase());
                        if(arrFkey[1]=="m1")
                            that.arrAmountFieldsM1.push(fkey.toUpperCase());
                        if(arrFkey[1]=="m2")
                            that.arrAmountFieldsM2.push(fkey.toUpperCase());
                    }
                }
                that.arrShowTitles.push(fkey.toUpperCase());
                let labitem={};
                labitem[fkey]=Object.values(item)[0];
                labs.push(labitem);
            } 
            that.datalabs=labs;
            that.datatotal=Object.values(res.data)[2];
            let p = Object.values(Object.values(res.data)[3])[0];
            that.pkey=p['pkey'];
            that.formlocation = p['formLocation'];
            that.totalitems=Object.values(Object.values(Object.values(that.datatotal)[0]))[0];

            let m = Object.values(Object.values(res.data)[3])[1];
            getGlobalParas(m,mapPara);

            that.showDataItem();
            that.dealPages();

            that.pkeyIds = [];
            that.selIds=[];
            that.selAll=false;
            for(let item of that.datas)
            {
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

            that.getDataForms(Object.values(res.data)[4]);

            that.curpage = paras['curPage'];
            gSetSessionStore("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81",paras,that.curpage,"false");

            onloadwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();

            }).catch(function (err) {
            });
        },
        getDatasByFilters(curpage,f) 
        {

            let paras = null;
            let spara = gGetSessionStore("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81","false");
            if(spara)
            {
                paras = spara['para'];
            }

            if(curpage==0)
                return;
            if(curpage>this.totalpage&&this.totalpage!=0)
                return;

            if(paras==null)
            {
                paras={};
                let datafilter="";
                if(smodewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=="")
                {
                    let view_filters = document.getElementById("view_prp_filters1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81");
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

                for(let item of this.filterPara)
                {
                    if(item['key'].indexOf("pageParam_")==0)
                    {
                        mapPara[item['key']]=item['value'];
                    }
                    paras[item['key']]=item['value'];
                }

                paras['datafilter']=datafilter;
                paras['viewCode']=this.viewcode;

                if(this.sortfield!='')
                {
                    paras['order_'+ this.sortfield + '_' + this.sorttype]="1";
                }
                else
                {
                    if(this.orderField!="")
                        paras['order_'+this.orderField]="";
                }
                setPageParas(paras,mapPara);
            }

            paras['pageItmes']=this.pageitems;
            paras['curPage']=curpage;
            if(this.topItems>0)
                paras['topItems']=this.topItems;

            paras['isdebug'] = "false";
            paras['updrights'] = "true";

            if(!this.isExcel)
            {
                var that = this;
                axios.post("./../api/datalist",paras).then(function(res){
                gDealAjaxLogin(res);
                that.datas=Object.values(res.data)[0];    
                that.datalabs=Object.values(res.data)[1];
                that.arrShowTitles=[];

                let labs=[];
                for(let item of that.datalabs)
                {
                    let fkey = Object.keys(item)[0];
                    let fi = fkey.indexOf("_");
                    if(fi>0)
                    {
                        let arrFkey = fkey.split("_");
                        fkey = arrFkey[0];
                        if(arrFkey[1]=="m1"||arrFkey[1]=="m2")
                        {
                            that.arrAmountFields.push(fkey.toUpperCase());
                        }
                    }
                    that.arrShowTitles.push(fkey.toUpperCase());
                    let labitem={};
                    labitem[fkey]=Object.values(item)[0];
                    labs.push(labitem);
                } 
                that.datalabs=labs; 

                that.datatotal=Object.values(res.data)[2];
                let p = Object.values(Object.values(res.data)[3])[0];
                that.pkey=p['pkey'];
                that.formlocation = p['formLocation'];
                that.totalitems=Object.values(Object.values(Object.values(that.datatotal)[0]))[0];
                that.curpage=paras['curPage'];

                let m = Object.values(Object.values(res.data)[3])[1];
                getGlobalParas(m,mapPara);
                
                that.showDataItem();
                that.dealPages();

                that.pkeyIds = [];
                that.selIds=[];
                that.selAll=false;
                for(let item of that.datas)
                {
                    that.pkeyIds.push(item[that.pkey]);
                }

                gSetSessionStore("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81",paras,that.curpage,"false");

                onloadwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();

                if(f!="")
                {
                    closeWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
                }

                }).catch(function (err) {
                    
                });
            }
            else
            {
                this.isExcel=false;
                paras['curPage']=1;
                paras['pageItmes']=10000;
                paras['lan']='e';
                
                var that = this;
                axios({
                    url: './../api/datalistExcel',
                    method: 'POST',
                    data:paras,
                    responseType: 'blob', 
                  }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'datalist.csv');
                    document.body.appendChild(link);
                    link.click();
                  });
                
            }
            
        },
        delDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']=this.viewcode;
            paras['itemIDs']=itemid;
            paras['isdebug'] = "false";

            var that = this;
            axios.post("./../api/datadelmsg",paras).then(function(res){

            let msg=res.data['msg'];
            if(msg!="")
            {
                document.getElementById("content-info-msg1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerHTML=msg;
                document.getElementById("content-info1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
                return;
            }

            that.getDatasByFilters(that.curpage);
            onchangewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
            closeWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81();
            document.getElementById("content-info-msg1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").innerHTML="Successfully deleted record";
            document.getElementById("content-info1wzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="block";
            }).catch(function (err) {
            });
        },
        showItemHtml(d)
        {
            if(!d||d=="")
            {
                return "/";
            }
            return d;
        },
        formatAmount(field,amount) 
        {
            if(amount==null||amount=="")
            {
                return "";
            }

            let zeroFill =true;
            let thousandSeparator =",";
            let decimalPlaces=2

            if(this.arrAmountFieldsM2.indexOf(field)>=0)
            {
                decimalPlaces =6;
            }

            let amountStr = amount.toString();
            let parts = amountStr.split('.');
            let integerPart = parts[0];
            let decimalPart = parts[1];
            if(!decimalPart)
            {
                decimalPart = "";
            }
            if (typeof decimalPlaces === 'number') {
              if (zeroFill && decimalPlaces > decimalPart.length) {
                decimalPart += '0'.repeat(decimalPlaces - decimalPart.length);
              }
            }
            let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
            return `${formattedIntegerPart}${decimalPart ? '.' : ''}${decimalPart}`;
        },
        openWinVue(msg,callback,callbackpara) 
        {
            openWinwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81(msg,callback,callbackpara);
        },
        dealPages () 
        {
            let items = parseInt(this.totalitems);
            let pItmes = parseInt(this.pageitems);
            this.hasitmes=true;
            if(items==0)
            {
                this.hasitmes=false;
                return;
            }
            else
            {
                this.hasitmes=true;
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
                let p = document.getElementById("datalistwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
            if(k=='s#refresh')
            {
                if(v==true)
                {
                    mapPara["globalParam_folderFilter"]=null;
                }
                else
                {
                    this.filterPara=v;
                    mapPara["globalParam_folderFilter"]=true;
                }
                gSetSessionStoreNull("dpwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81","false");
                this.getDatasByFilters(1);
            }
        },
        getDataItem(k)
        {
            if(k=='s#selids')
            {
                return this.selIds.join(",");
            }
            else if(k=='s#listdata')
            {
                return this.datas;
            }
        },
        fileDownload(fileID)
        {
            var that=this;
            axios({
                url: './../api/downloadFile',
                method: 'POST',
                data:{"fileGuid":fileID},
                responseType: 'blob', // important
              }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileID + '.pdf');
                document.body.appendChild(link);
                link.click();
              });
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        this.getDatas();
        window.getSearchDataswzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=this.getSearchDatas;
        window.setDataItemwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81 = this.setDataItem;
        window.getDataItemwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81 = this.getDataItem;
        window.gSearchByModewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81=this.searchByMode;
        window.gGoViewLog = this.goViewLog;
    }
}

if("1"=="1")
{
    Vue.createApp(DataListVuewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81).mount('#datalistwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81');
    document.getElementById("datalistwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="";
}
else
{
    Vue.createApp(DataListVuewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81).mount('#datalistmobilewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81');
    document.getElementById("datalistmobilewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81").style.display="";
}

function onchangewzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81()
{
    
}

function onloadwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81()
{
    
}

var DatePickerwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81 = function () {
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
    for (var i=0; i<D._fc(); i++ ) con.push('<td class="handwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81" onclick="'+this.n+'.fillInput('+year+', '+month+', '+(i+1)+')">'+(i+1)+'</td>');
    var toend = con.length%7;
    if (toend != 0) for (var i=0; i<7-toend; i++) con.push('<td class="noborder"> </td>');
    _html += '<tr>'+fn("-1, null", "<<")+fn("null, -1", "<")+'<td title="'+this.n+'DatePicker" colspan=3 class="strongwzsoftcomc2ab2649ddb6cfd01ea06f14886a0ef81">'+year+'/'+month+'/'+date+'</td>'+fn("null, 1", ">")+fn("1, null", ">>")+'</tr>';
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
