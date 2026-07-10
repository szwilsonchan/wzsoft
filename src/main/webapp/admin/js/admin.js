window.callback=null;
window.callbackpara=null;

function openWin(msg,callback,callbackpara) 
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("modalWin").style.display="block";
    document.getElementById("modalWinMsg").innerText=msg;
    window.callback=callback;
    window.callbackpara=callbackpara;
}
function openUpdWin(msg,callback,callbackpara) 
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("updWin").style.display="block";
    document.getElementById("content-info").style.display="none";
    window.callback=callback;
    window.callbackpara=callbackpara;
}
function openAddWin(msg,callback,callbackpara) 
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("updWin").style.display="block";
    document.getElementById("content-info").style.display="none";
    window.callback=callback;
    window.callbackpara=callbackpara;
}
function openWinOK() 
{
    window.callback(window.callbackpara); 
}

function closeWin() 
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("modalWin").style.display="none";
    document.getElementById("updWin").style.display="none";
}

function closeInfoMsg(e) 
{
    e.srcElement.parentElement.style.display="none";
}
const DataListVue = 
{
    data() 
    {
        return {
            datas:null,
            dataitem:{},
            datalabs:null,
            datatotal:null,
            curpage:1,
            totalpage:0,
            totalitems:0,
            pageitems:10,
            beginpage:0,
            endpage:0,
            showpages:[],
            hasitmes:true,
            pkey:null,
            isupd:true,
            returnmsg:'',
            arrShowTitles:[]
        }
    },
    methods: 
    {
        getDatas () 
        {
            let paras = {};
            paras['viewCode']=window.viewcode;
            paras['curPage']=this.curpage;
            paras['pageItmes']=this.pageitems;
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
            that.totalitems=Object.values(Object.values(Object.values(that.datatotal)[0]))[0];
            that.dealPages();
            }).catch(function (err) {
            });
        },
        getDatasByFilters(curpage) 
        {
            if(curpage==0)
                return;
            if(curpage>this.totalpage&&this.totalpage!=0)
                return;
            let view_filters = document.getElementById("view_prp_filters");
            let paras = {};
            paras['viewCode']=window.viewcode;
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
            paras['curPage']=curpage;
            paras['pageItmes']=this.pageitems;
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
            that.totalitems=Object.values(Object.values(Object.values(that.datatotal)[0]))[0];
            that.curpage=paras['curPage'];
            that.dealPages();
            }).catch(function (err) {
            });
        },
        getDataItem(itemid) 
        {
            let paras = {};
            paras['viewCode']=window.viewcode;
            paras['itemIDs']=itemid;
            var that = this;
            axios.post("./../api/dataget",paras).then(function(res){
            that.dataitem=Object.values(Object.values(res.data)[0])[0];    
            
            }).catch(function (err) {
            });
        },
        delDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']=window.viewcode;
            paras['itemIDs']=itemid;
            var that = this;
            axios.post("./../api/datadel",paras).then(function(res){
            that.getDatasByFilters(that.curpage);
            closeWin();
            document.getElementById("content-info-msg").innerHTML="Record deleted successfully!";
            document.getElementById("content-info").style.display="block";
            }).catch(function (err) {
            });
        },
        updDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']=window.viewcode;
            paras['itemIDs']=itemid;
            for (let v in this.dataitem) 
            {
                if(v!=this.pkey)
                {
                    paras['field_'+v] = this.dataitem[v];
                }
            }

            var that = this;
            axios.post("./../api/dataupd",paras).then(function(res)
            {
                that.returnmsg=Object.values(Object.values(res.data)[0])[0];
                if(that.returnmsg!="")
                {
                    document.getElementById("updWin-info-msg").innerHTML=that.returnmsg;
                    document.getElementById("updWin-info").style.display="block";
                }
                else
                {
                    that.getDatasByFilters(that.curpage);
                    closeWin();
                    document.getElementById("content-info-msg").innerHTML="Record updated successfully!";
                    document.getElementById("content-info").style.display="block";
                }
            }).catch(function (err) {
            });

        },
        addDatas() 
        {
            let paras = {};
            paras['viewCode']=window.viewcode;
            for (let v in this.dataitem) 
            {
                if(v!=this.pkey)
                {
                    paras['field_'+v] = this.dataitem[v];
                }
            }

            var that = this;
            axios.post("./../api/dataadd",paras).then(function(res){
                that.returnmsg=Object.values(Object.values(res.data)[0])[0];
                if(that.returnmsg!="")
                {
                    document.getElementById("updWin-info-msg").innerHTML=that.returnmsg;
                    document.getElementById("updWin-info").style.display="block";
                }
                else
                {
                    that.getDatasByFilters(that.curpage);
                    closeWin();
                    document.getElementById("content-info-msg").innerHTML="Record added successfully!";
                    document.getElementById("content-info").style.display="block";
                }
            }).catch(function (err) {
            });

        },
        openWinVue(msg,callback,callbackpara) 
        {
            openWin(msg,callback,callbackpara);
        },
        openUpdWinVue(msg,callback,callbackpara) 
        {
            this.getDataItem(callbackpara);
            this.isupd=true;
            openUpdWin(msg,callback,callbackpara);
        },
        openAddWinVue(msg,callback,callbackpara) 
        {
            this.dataitem={};
            this.isupd=false;
            openAddWin(msg,callback,callbackpara);
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
        }
    },
    mounted() 
    {
        this.getDatas();
    }
}

Vue.createApp(DataListVue).mount('#datalist');