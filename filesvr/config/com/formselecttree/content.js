var selType[@configid@]="[@seltype@]";
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
        document.getElementById(this.rootId).innerHTML="<div style=\"cursor:pointer;font-size:[@itemfontsize@];height:[@itemheight@];padding:8px;text-align:right\"><span class='searchclose[@configid@]' onclick=\"closeSearchDiv[@configid@](event)\">&Chi;</span></div>";
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
        itemID = data["[@big_valuefield@]"]+"";
        for(let i=0;i<this.arrf.length;i++)
        {
            itemTitle = itemTitle + data[this.arrf[i]]+ "|";
        }
        itemTitle = itemTitle.substring(0,itemTitle.length-1);

        itemID=itemID.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll('"','&quot;');

        dom.innerHTML += "<span style='cursor:pointer' onclick=\"selItemDo[@configid@]('"+ itemID +"','"+ itemTitle +"','')\">"+ itemTitle +"</span>";

        if(data.PID!=""&&data.PID!="0")
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

function selItemHide[@configid@]()
{
    let dnode = document.getElementById("divSelSearchs[@configid@]");
    dnode.style.display="none";
}
function selItemDel[@configid@](e)
{
    let p = e.srcElement.parentElement.parentElement.parentElement;
    if(p.parentElement.className=="divSelItems[@configid@]")
    {
        p.parentElement.removeChild(p);
        document.getElementById("inpSel[@configid@]").style.display="block";
        selItemValues[@configid@]();
    }

}
function selItemDo[@configid@](id,title,f)
{
    let d = document.createElement("div");
    d.className="selItemDiv";

    let s="";
    s = s + "<span class=\"action-content\" style=\"border:none\"></span>";
    s = s + "<input type='hidden' />";

    if(f!="view")
    {
        let sa = "[@itemheight@]";
        if(sa.indexOf("px")>0)
        {
            sa=sa.replace("px","");
            sa = (parseInt(sa)-6) + 'px';
        }
        d.style.paddingLeft="15px";
        s = s + "<span class=\"action-content\" style=\"float:right;padding-top:2px;padding-right:5px;\" >";
        s = s + "<a href='#' style=\"float:right;height:"+ sa +";width:"+ sa +";\" onclick=\"selItemDel[@configid@](event);return false\" ><img width=\"66%\"  src=\"./imgs/del.png\"></a></span>";
    }
    else
    {
        d.style.border="none";
    }
    d.innerHTML=s;

    d.childNodes[0].innerHTML=title;
    d.childNodes[1].value=id;
    document.getElementById("divSelItems[@configid@]").appendChild(d);
    document.getElementById("divSelItems[@configid@]").style.display="block";
    document.getElementById("divSelSearchs[@configid@]").style.display="none";

    if(selType[@configid@]=="1")
    {
        document.getElementById("inpSel[@configid@]").style.display="none";
    }

    selItemValues[@configid@]();

}
function selItemValues[@configid@]()
{
    let ids="";
    let titles="";
    let ds = document.getElementById("divSelItems[@configid@]");
    for (let dNode of ds.childNodes) 
    {
        if(dNode.className == "selItemDiv")
        {
            let id = dNode.childNodes[1].value;
            let title = dNode.childNodes[0].innerHTML;
            id = id.replaceAll(",","&#44;");
            title = title.replaceAll(",","&#44;");
            ids=ids+id+",";
            titles=titles+title+",";
        }
    }

    if(ids.indexOf(","))
    {
        ids = ids.substring(0,ids.length-1);
        titles = titles.substring(0,titles.length-1);
    }

    window.setDataItemIn[@configid@]("[@fieldname@]",ids);
    window.setDataItemIn[@configid@]("[@fieldname@]STXT",titles);

    onchange[@configid@]();

}
function selItemSearch[@configid@](e)
{

    let redatas = window.getDataItem[@configid@]('listdata');
    if(redatas!="null")
    {
        redatas = JSON.parse(redatas); 
    }
    let dnode = document.getElementById("divSelSearchs[@configid@]");
    dnode.style.display="block";

    myDataTree[@configid@] = new MyTree[@configid@](redatas, "divSelSearchs[@configid@]");
    myDataTree[@configid@].init();

}

function closeSearchDiv[@configid@](e)
{
    e.target.parentElement.parentElement.style.display="none";
}

const ComConfigVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            orderField:"[@orderfield@]",
            viewdatas:null,
            dataitem:{"[@fieldname@]":"","[@fieldname@]STXT":""},
            curpage:1
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=="listdata")
            {
                return JSON.stringify(this.viewdatas);
            }
            else if(k=="seltext")
            {
                return this.dataitem['[@fieldname@]STXT'];
            }
            return this.dataitem[k];
        },
        pushDataItem(k,v)
        {
            if(k=="listdata")
            {
                this.viewdatas.push(v);
            }
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("select[@configid@]").parentElement.parentElement;
            let pc = document.getElementById("select[@configid@]");
            if(k=="listdata")
            {
                if(v)
                {
                    if(Object.prototype.toString.call(v) === '[object Array]')
                        this.viewdatas=v;
                    else
                        this.viewdatas=JSON.parse(v);
                }
                pc.style.display="block";
            }
            else if(k=='s#display')
            {
                this.formshow=v;
                if(p&&v==true)
                {
                    p.style.display="block";
                    pc.style.display="block";
                }
                else
                {
                    p.style.display="none";
                    pc.style.display="none";
                }
            }
            else if(k=='s#isview')
            {
                if(v!="noset")
                {
                    this.isView = v;
                    this.setDataItem('refreshdata','1');
                }
                pc.style.display="block";
            }
            else
            {
                if(k=="seltext")
                {
                    this.dataitem['[@fieldname@]STXT']=v;
                }
                else
                    this.dataitem[k]=v;

                document.getElementById("divSelItems[@configid@]").innerHTML="";

                if(this.dataitem['[@fieldname@]']&&this.dataitem['[@fieldname@]']!=""&&this.dataitem['[@fieldname@]STXT'])
                {
                    let ids=this.dataitem['[@fieldname@]']+'';
                    let titles=this.dataitem['[@fieldname@]STXT'];
                    let arrids = ids.split(",");
                    let arrtitles = titles.split(",");
                    for(var i=0;i<arrids.length;i++)
                    {
                        if(this.isView)
                            selItemDo[@configid@](arrids[i],arrtitles[i],'view');
                        else
                            selItemDo[@configid@](arrids[i],arrtitles[i],'');
                    }
                    if(selType[@configid@]=="1")
                    {
                        document.getElementById("inpSel[@configid@]").style.display="none";
                    }
                }
                else
                {
                    if(!this.isView)
                        document.getElementById("inpSel[@configid@]").style.display="block";
                }
                pc.style.display="block";
            }
            
        },
        setDataItemIn(k,v)
        {
            this.dataitem[k]=v;
        },
        valDataItem()
        {
            if(!this.formshow)
            {
                return true;
            }
            
            let n=0;
            let msg="";
            let str="";
            if(this.dataitem.[@fieldname@])
                str = this.dataitem.[@fieldname@];
            str = str.toString().trim();
            let fieldnoempty = [@fieldnoempty@];
            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "[@fieldtitle@]" + gMsgConstList['g_notempty_[@lan@]'] ;
            }
            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["[@fieldname@]"]=msg;
                }
                document.getElementById("valmsg[@configid@]").style.display="block";
                document.getElementById("valmsg[@configid@]").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["[@fieldname@]"]="";
                document.getElementById("valmsg[@configid@]").style.display="none";
                document.getElementById("valmsg[@configid@]").innerHTML="";
            }
            return true;

        },
        getDatas() 
        {

            let paras = {};
            paras['viewCode']="[@viewcode@]";
            paras['curPage']=1;
            paras['pageItmes']=1000;
        
            let sr="[@orderfield@]";
            sr=sr.replace("_","#");
            if(sr!="")
                paras['order_pid#asc,'+sr]="";
            else
                paras['order_pid_asc']="";
        
            let sf="[@big_showfield@]";
            paras['fieldsclient']="id,pid,[@big_valuefield@]," + sf.replace("|",",");

            var that = this;
            axios.post("./../[@pubtype@]api/datalist",paras).then(function(res){
            that.viewdatas=Object.values(res.data)[0];

            }).catch(function (err) {
            });
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
            document.getElementById("inpSel[@configid@]").style.display="none";
        }
        else
        {
            this.getDatas();
        }
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.setDataItemIn[@configid@] = this.setDataItemIn;
        window.pushDataItem[@configid@] = this.pushDataItem;
        window.valDataItem[@configid@] = this.valDataItem;
    }
}

Vue.createApp(ComConfigVue[@configid@]).mount('#select[@configid@]');

function onchange[@configid@]()
{
    window.valDataItem[@configid@]();
    [@onchange@]
}