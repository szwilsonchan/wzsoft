
window.callback[@configid@]=null;
window.callbackpara[@configid@]=null;

function openWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("modalWin[@configid@]").style.display="block";
    document.getElementById("modalWinMsg[@configid@]").innerText=msg;
    window.callback[@configid@]=callback;
    window.callbackpara[@configid@]=callbackpara;
}
function openUpdWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("updWin[@configid@]").style.display="block";
    document.getElementById("content-info[@configid@]").style.display="none";
    window.callback[@configid@]=callback;
    window.callbackpara[@configid@]=callbackpara;
}
function openAddWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("updWin[@configid@]").style.display="block";
    document.getElementById("content-info[@configid@]").style.display="none";
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
            viewcode:"dept",
            datas:null,
            dataitem:{},
            datalabs:null,
            datatotal:null,
            datalocations:null,
            checkboxshow:[@checkboxshow@],
            showupdbtn:[@showupdbtn@],
            curpage:1,
            totalpage:0,
            totalitems:[@topitems@],
            pageitems:[@pageitems@],
            beginpage:0,
            endpage:0,
            showpages:[],
            hasitmes:true,
            pkey:null,
            isupd:true,
            oldlocation:"",
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
        setDatalocation(dl)
        {
            this.datalocations=dl;	
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
                this.filterPara=v;
                mapPara["globalParam_folderFilter"]=true;
                this.getDatasByFilters(1);
            }
        },
        getDataItem(k)
        {
            if(k=='s#selids')
            {
                return this.selIds.join(",");
            }
        },
        getDatas () 
        {
            let paras = {};
            paras['viewCode']="org";
            paras['curPage']=this.curpage;
            paras['pageItmes']=this.pageitems;
            var that = this;
            axios.post("./../api/dataorglist",paras).then(function(res){
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

            that.pkeyIds = [];
            that.selIds=[];
            that.selAll=false;
            for(let item of that.datas)
            {
                that.pkeyIds.push(item[that.pkey]);
            }

            }).catch(function (err) {
            });
        },
        getDatasByFilters(curpage) 
        {
            if(curpage==0)
                return;
            if(curpage>this.totalpage&&this.totalpage!=0)
                return;
            let view_filters = document.getElementById("view_prp_filters[@configid@]");
            let paras = {};
            paras['viewCode']="org";
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
            axios.post("./../api/dataorglist",paras).then(function(res){
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
            that.dealPages();
            }).catch(function (err) {
            });
        },
        getDataItemView(itemid) 
        {
            let paras = {};
            paras['viewCode']="org";
            paras['itemIDs']=itemid;
            var that = this;
            axios.post("./../api/dataorgget",paras).then(function(res){
            that.dataitem=Object.values(Object.values(res.data)[0])[0];    
            that.oldlocation = that.dataitem["LOCATION"];

            }).catch(function (err) {
            });
        },
        updDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']="org";
            paras['itemIDs']=itemid;
            for (let v in this.dataitem) 
            {
                if(v!=this.pkey&&v!="OLD_LOCATION")
                {
                    paras['field_'+v] = this.dataitem[v];
                }
            }

            let msg="";
            if(!gCheckValueNull(this.dataitem['NAME']))
            {
                msg=msg+"[@frmname@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            else
            {
                if(!gCheckValueLen(this.dataitem['NAME'],200))
                {
                    let msgobj = {"fname":"[@frmname@]","flen":200};
                    msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
                }
            }
            if(!gCheckValueLen(this.dataitem['ENAME'],500))
            {
                let msgobj = {"fname":"[@frmnamesub@]","flen":500};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckValueLen(this.dataitem['ORGCODE'],50))
            {
                let msgobj = {"fname":"[@frminscode@]","flen":50};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@configid@]").style.display="block";
                return;
            }

            var that = this;
            axios.post("./../api/dataorgupd",paras).then(function(res)
            {
                that.returnmsg=Object.values(Object.values(res.data)[0])[0];
                if(that.returnmsg!="")
                {
                    document.getElementById("updWin-info-msg[@configid@]").innerHTML=that.returnmsg;
                    document.getElementById("updWin-info[@configid@]").style.display="block";
                }
                else
                {
                    that.getDatasByFilters(that.curpage);
                    closeWin[@configid@]();
                    document.getElementById("content-info-msg[@configid@]").innerHTML="[@infoupdsuc@]";
                    document.getElementById("content-info[@configid@]").style.display="block";
                }
            }).catch(function (err) {
            });

        },
        openWinVue(msg,callback,callbackpara) 
        {
            openWin[@configid@](msg,callback,callbackpara);
        },
        openUpdWinVue(msg,callback,callbackpara) 
        {
            document.getElementById("updWin-info-msg[@configid@]").innerHTML="";
            document.getElementById("updWin-info[@configid@]").style.display="none";

            this.getDataItemView(callbackpara);
            this.isupd=true;
            openUpdWin[@configid@](msg,callback,callbackpara);
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
        showDataLbl(v)
        {
            return v;
        }
    },
    mounted() 
    {
        this.getDatas();
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
    }
}

Vue.createApp(DataListVue[@configid@]).mount('#datalist[@configid@]');
