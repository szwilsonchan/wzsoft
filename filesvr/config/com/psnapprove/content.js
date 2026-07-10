
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
    document.getElementById("updWin[@apptype@][@configid@]").style.display="block";
    document.getElementById("content-info[@apptype@][@configid@]").style.display="none";
    window.callback[@configid@]=callback;
    window.callbackpara[@configid@]=callbackpara;
}
function openAddWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("updWin[@apptype@][@configid@]").style.display="block";
    document.getElementById("content-info[@apptype@][@configid@]").style.display="none";
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
    document.getElementById("updWin[@apptype@][@configid@]").style.display="none";
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
            viewcode:"psn",
            datas:null,
            dataitem:{},
            datalabs:null,
            datatotal:null,
            datalocations:null,
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
            roles:null,
            roleIds:[],
            depts:[],
            selIds:[],
            isDept:true,
            gAmode:"",
            approvetype:"1"
        }
    },
    methods: 
    {
        [@btnfunc@]
        setDatalocation(dl)
        {
            this.datalocations=dl;	
        },
        setDataItem(k,v)
        {
            this.dataitem[k]=v;
        },
        checkedOne(roleId) 
        {
            let idIndex = this.roleIds.indexOf(roleId)
            if (idIndex >= 0) {
            this.roleIds.splice(idIndex, 1)
            } else {
            this.roleIds.push(roleId)
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
            paras['viewCode']="psn";
            paras['curPage']=this.curpage;
            paras['pageItmes']=this.pageitems;
            paras['apppsnjoin']='1';
            paras['order_reqorgtime_asc']='1';
            var that = this;
            axios.post("./../api/datapsnlist",paras).then(function(res){
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

            that.roles = Object.values(res.data)[5];
            let mr = Object.values(res.data)[6];
            if(mr['role']=='o')
                that.isDept=false;
            else if(mr['role']=='d')
                that.isDept=true;

            }).catch(function (err) {
            });
        },
        getDeptDatas()
        {
            let paras = {};
            paras['viewCode']="psn";
            paras['curPage']=1;
            paras['pageItmes']=100;
            paras['order_snum#asc,snumsub#asc']="1";
            var that = this;
            axios.post("./../api/datadeptlist",paras).then(function(res){
            depts=Object.values(res.data)[0];
            that.setDepts(depts);

            }).catch(function (err) {
            });

        },
        getDatasByFilters(curpage) 
        {
            if(curpage==0)
                return;
            if(curpage>this.totalpage&&this.totalpage!=0)
                return;
            let view_filters = document.getElementById("view_prp_filters[@apptype@][@configid@]");
            let paras = {};
            paras['viewCode']="psn";
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
            paras['apppsnjoin']='1';
            paras['order_reqorgtime_asc']='1';
            var that = this;
            axios.post("./../api/datapsnlist",paras).then(function(res){
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
            paras['viewCode']="psn";
            paras['itemIDs']=itemid;
            paras['apppsnjoin']='1';
            var that = this;
            axios.post("./../api/datapsnget",paras).then(function(res){
            that.dataitem=Object.values(Object.values(res.data)[0])[0];    
            that.oldlocation = that.dataitem["LOCATION"];

            }).catch(function (err) {
            });
        },
        approveDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']="psn";
            paras['itemIDs']=itemid;
            paras['approvetype']=this.approvetype;
            paras['deptid']=document.getElementById("selDeptid[@apptype@][@configid@]").value;
            paras['reqorgcomment']=document.getElementById("appComment[@configid@]").value;
            paras['lan']="[@lan@]";
            
            let msg="";
            if(this.approvetype=="1")
            {
                if(gCheckValueNull(paras['deptid']))
                {
                    let obj=document.getElementById("selDeptid[@apptype@][@configid@]");
                    let objtxt = obj.options[obj.selectedIndex].text;
                    paras['deptname']=objtxt.trim();
                }
                else
                {
                    msg=msg+"[@frmdept@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
                }
    
                if(this.roleIds.join(",")!="")
                {
                    paras['ROLEIDS']=this.roleIds.join(",");
                }
                else
                {
                    msg=msg+"[@frmrole@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
                }
            }
            else
            {
                if(!gCheckValueNull(paras['reqorgcomment']))
                {
                    msg=msg+"[@appreject@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
                }
                else
                {
                    if(!gCheckValueLen(paras['reqorgcomment'],200))
                    {
                        let msgobj = {"fname":"[@appreject@]","flen":200};
                        msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj);
                    }
                }
            }

            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                return;
            }

            var that = this;
            axios.post("./../api/datapsnapprove",paras).then(function(res)
            {
                let mreturn = res.data;
                let msg = mreturn['msg'];
                if(msg!="")
                {
                    document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=msg;
                    document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                }
                else
                {
                    that.getDatasByFilters(that.curpage);
                    closeWin[@configid@]();
                    document.getElementById("content-info-msg[@apptype@][@configid@]").innerHTML="[@infoappsuc@]";
                    document.getElementById("content-info[@apptype@][@configid@]").style.display="block";
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
            document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML="";
            document.getElementById("updWin-info[@apptype@][@configid@]").style.display="none";
            
            this.getDataItemView(callbackpara);
            this.isupd=true;
            this.roleIds=[];
            document.getElementById("selDeptid[@apptype@][@configid@]").value="";
            openUpdWin[@configid@](msg,callback,callbackpara);
        },
        openAddWinVue(msg,callback,callbackpara) 
        {
            document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML="";
            document.getElementById("updWin-info[@apptype@][@configid@]").style.display="none";

            this.dataitem={};
            this.isupd=false;
            this.roleIds=[];
            openAddWin[@configid@](msg,callback,callbackpara);
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
        setDepts(v) 
        {
            this.depts = v;
        },
        showDataLbl(v)
        {
            return v;
        },
        showDataItem(k,v)
        {
            if(k!="GENDER")
                return v;
            
            if(v=="1")
                return "Male";
            else if(v=="2")
                return "Female";
            else if(v=="3")
                return "Other";
        }
    },
    mounted() 
    {
        this.getDatas();
        this.getDeptDatas();
        window.setDepts = this.setDepts;
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
    }
}

if("[@apptype@]"=="1")
{
    Vue.createApp(DataListVue[@configid@]).mount('#datalist[@configid@]');
    document.getElementById("datalist[@configid@]").style.display="";
}
else
{
    Vue.createApp(DataListVue[@configid@]).mount('#datalistmobile[@configid@]');
    document.getElementById("datalistmobile[@configid@]").style.display="";
}