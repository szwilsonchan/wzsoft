window.callback[@configid@]=null;
window.callbackpara[@configid@]=null;
var myDataTree[@configid@]=null;

function MyTree[@configid@](list, rootId) {
    // Simple deep copy
    this.list = JSON.parse(JSON.stringify(list));
    this.rootId = rootId;
    this.nodesMap = {};
    this.treeData = [];
    let fields="[@big_showfield@]";
    this.arrf = fields.split("|");
}

MyTree[@configid@].prototype = {
    init: function () {
        document.getElementById(this.rootId).innerHTML="";
        this.treeData = this.initTreeData(this.list);
        for (let i = 0; i < this.treeData.length; i++) {
            this.createDom(this.treeData[i]);
        }
    },

    // Initialize array to tree structure
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

    // Render tree from array
    createDom: function (data) {
        let self = this;
        let fatherDom = document.getElementById(`${this.rootId}-my-tree-${data.PID}`);
        // Virtual root node
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
        let form = "";

        for(let i=0;i<this.arrf.length;i++)
        {
            itemTitle = itemTitle + data[this.arrf[i]]+ "|";
        }
        itemTitle = itemTitle.substring(0,itemTitle.length-1);

        itemID = data["ID"]+"";
        form = data["FORM"]+"";

        itemID=itemID.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll('"','&quot;');

        dom.innerHTML += "<div class='treeItemdiv[@configid@]'><span style='cursor:pointer' onclick=\"goView[@configid@]('"+ form +"','"+ itemID +"')\">"+ itemTitle +"</span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"goUpdate[@configid@]('"+ form +"','"+ itemID +"');return false;\"><img width=\"18\"  src=\"./imgs/update.png\"></a><a href=\"#\" onclick=\"openWinVue[@configid@]('Are you sure you want to delete this record?',window.delDatas[@configid@],'"+ itemID +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span></div><div style='clear:both'></div>";

        if(data.PID!="")
        {
            dom.style.display = 'none';
        }
        fatherDom.appendChild(dom);
        iconDom = document.getElementById(`${this.rootId}-my-tree-icon-${data.ID}`);
        iconDom.onclick = function () {
            self.iconClickHandler(iconDom);
        };
        // Recursively render subtree
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

    // Hide subtree
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

    // Render subtree
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
            // Recursively render subtree
            this.hideHandler(childIconDom);
        }
    }
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

const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            viewcode:"[@viewcode@]",
            datas:null,
            dataitem:{},
            datalabs:null,
            datatotal:null,
            dataforms:null,
            curpage:1,
            totalpage:0,
            totalitems:0,
            topItems:0,
            orderField:"[@orderfield@]",
            pageitems:10000,
            beginpage:0,
            endpage:0,
            showpages:[],
            hasitmes:true,
            formlocation:"",
            pkey:null,
            isupd:true,
            returnmsg:'',
            arrShowTitles:[],
            showaddbtn:[@showaddbtn@],
            formnum:1,
            selIds:[],
            pkeyIds:[],
            selAll:false
        }
    },
    methods: 
    {
        goUpdate (sForm,pkey) 
        {
            let f = pageName[@configid@]();
            f=f+".html";
            window.location.href=sForm + "?itemid="+pkey+"&backlocation="+f;
        },
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
        goView (sForm,pkey) 
        {
            let f = pageName[@configid@]();
            f=f+".html";
            window.location.href=sForm + "?view=1&itemid="+pkey+"&backlocation="+f;
        },
        goAdd () 
        {
            let f = pageName[@configid@]();
            f=f+".html";
            window.location.href="form_"+this.formlocation + "?backlocation="+f;
        },
        openUpdWinVue(msg,callback,callbackpara) 
        {
            openUpdWin[@configid@](msg,callback,callbackpara);
        },
        showDataItem() 
        {
            for( let item of this.datas )
            {
                if(item['SYSSTATUS']=='0')
                    item['SYSSTATUS']="Draft";
                if(item['SYSSTATUS']=='1')
                    item['SYSSTATUS']="Under Review";
                if(item['SYSSTATUS']=='2')
                    item['SYSSTATUS']="Review Complete";
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
                    sc = sc + "<li><a href='#' onclick=\"goAddSub[@configid@]('"+ item['LOCATION'] +"')\" >"+ item['NAME'] +"</a></li>";
                }
                document.getElementById("divDataForms[@configid@]").innerHTML=sc;
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

            let sr=this.orderField;
            sr=sr.replace("_","#");
            if(sr!="")
                paras['order_pid#asc,'+sr]="";
            else
                paras['order_pid_asc']="";

            setPageParas(paras,mapPara);

            var that = this;
            axios.post("./../api/datalist",paras).then(function(res){
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

            that.getDataForms(Object.values(res.data)[4]);

            myDataTree[@configid@] = new MyTree[@configid@](that.datas, "divSelSearchs[@configid@]");
            myDataTree[@configid@].init();

            onload[@configid@]();

            }).catch(function (err) {
            });
        },
        getDatasByFilters(curpage,f) 
        {
            if(curpage==0)
                return;
            if(curpage>this.totalpage)
                return;
            let datafilter="";
            let paras = {};

            paras['datafilter']=datafilter;
            paras['viewCode']=this.viewcode;
            paras['curPage']=curpage;
            paras['pageItmes']=this.pageitems;
            if(this.topItems>0)
                paras['topItems']=this.topItems;

            if(this.orderField!="")
                paras['order_pid#asc,'+this.orderField]="";
            else
                paras['order_pid_asc']="";

            var that = this;
            axios.post("./../api/datalist",paras).then(function(res){
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

            myDataTree[@configid@] = new MyTree[@configid@](that.datas, "divSelSearchs[@configid@]");
            myDataTree[@configid@].init();

            onload[@configid@]();

            if(f!="")
            {
                closeWin[@configid@]();
            }
            
            }).catch(function (err) {
            });
        },
        delDatas(itemid) 
        {
            for(let i=0;i<this.datas.length;i++)
            {
                let d = this.datas[i];
                if(d['PID']==itemid)
                {
                    closeWin[@configid@]();
                    document.getElementById("content-info-msg[@configid@]").innerHTML="Child data exists. Please delete child data first!";
                    document.getElementById("content-info[@configid@]").style.display="block";
                    return;
                }
            }

            let paras = {};
            paras['viewCode']=this.viewcode;
            paras['itemIDs']=itemid;
            var that = this;
            axios.post("./../api/datadel",paras).then(function(res){
            that.getDatasByFilters(that.curpage,'');
            onchange[@configid@]();
            closeWin[@configid@]();
            document.getElementById("content-info-msg[@configid@]").innerHTML="Record deleted successfully!";
            document.getElementById("content-info[@configid@]").style.display="block";
            }).catch(function (err) {
            });
        },
        openWinVue(msg,callback,callbackpara) 
        {
            openWin[@configid@](msg,callback,callbackpara);
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
        window.setDataItem[@configid@] = this.setDataItem;
        window.goView[@configid@] = this.goView;
        window.goUpdate[@configid@] = this.goUpdate;
        window.openWinVue[@configid@]=this.openWinVue;
        window.delDatas[@configid@]=this.delDatas;
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
