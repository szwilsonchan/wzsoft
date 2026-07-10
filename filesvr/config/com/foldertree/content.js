window.callback=null;
window.callbackpara=null;
var myDataTree[@configid@]=null;
var myDataTreeClickE[@configid@]=null;

function MyTree[@configid@](list, rootId) {
    // Simple deep copy
    this.list = JSON.parse(JSON.stringify(list));
    this.rootId = rootId;
    this.nodesMap = {};
    this.treeData = [];
    let fields="[@valuefield@]";
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
        iconDom.className = "itemIcon[@configid@]";
        if(data.childs && data.childs.length > 0) 
        {
            iconDom.innerHTML = "+";
        }
        else
        {
            iconDom.innerHTML = "-";  
        }
        dom.appendChild(iconDom);

        let itemID = "";
        let itemTitle = "";
        let vfspan = "[@vfspan@]";

        for(let i=0;i<this.arrf.length;i++)
        {
            itemTitle = itemTitle + data[this.arrf[i]]+ vfspan;
        }
        itemTitle = itemTitle.substring(0,itemTitle.length-vfspan.length);

        itemID = data["ID"]+"";

        itemID=itemID.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll("'","\\'");
        itemTitle=itemTitle.replaceAll('"','&quot;');

        dom.innerHTML += "<div class='treeItemdiv[@configid@]'><span style='cursor:pointer' onclick=\"itemclick[@configid@]('"+ itemID +"',event)\">"+ itemTitle +"</span></div><div style='clear:both'></div>";

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


function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}
const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            datas:[],
            pkeyvalue:"",
            valuefield:'[@valuefield@]',
            isshow:true
        }
    },
    methods: 
    {
        itemclick(dataid,e) 
        {
            for(let item of this.datas)
            {
                if(item['ID']==dataid)
                {
                    mapPara["dataitem"] = item;
                    break;
                }
            };
            if(myDataTreeClickE[@configid@]!=null)
            {
                myDataTreeClickE[@configid@].className="notsel"; 
            }
            myDataTreeClickE[@configid@]=e;
            myDataTreeClickE[@configid@].className="sel";
            let dataitem = mapPara["dataitem"];
            [@listcode@];
        },
        showfolder() 
        {
            if(this.isshow)
                this.isshow=false;
            else
                this.isshow=true; 
        },
        getDataItem(k) 
        {
            if(k=="listdata")
            {
                return JSON.stringify(this.datas);
            }
        },
        setDataItem(k,v)
        {
            if(k=="listdata")
            {
                if(mapPara["globalParam_folderFilter"]==true)
                {
                    return;
                }

                this.pkeyvalue="";
                if(Object.prototype.toString.call(v) === '[object Array]')
                    this.datas=v;
                else
                    this.datas=JSON.parse(v);

                myDataTree[@configid@] = new MyTree[@configid@](this.datas, "divSelSearchs[@configid@]");
                myDataTree[@configid@].init();
            }
            if(k=='s#display')
            {
                let p = document.getElementById("datalist[@configid@]").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
        },
        pushDataItem(k,v)
        {
            if(k=="listdata")
            {
                this.datas.push(v);
            }
        },
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        window.setDataItem[@configid@]=this.setDataItem;
        window.getDataItem[@configid@]=this.getDataItem;
        window.pushDataItem[@configid@]=this.pushDataItem;
        window.itemclick[@configid@] = this.itemclick;
    }
}

Vue.createApp(DataListVue[@configid@]).mount('#datalist[@configid@]');