
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
            viewcode:"dept",
            datas:null,
            dataitem:{},
            datalabs:null,
            datatotal:null,
            datalocations:null,
            checkboxshow:[@checkboxshow@],
            showaddbtn:[@showaddbtn@],
            showupdbtn:[@showupdbtn@],
            showdelbtn:[@showdelbtn@],
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
            depts:[],
            isDept:true,
            isSubDept:true,
            DeptID:0,
            selIds:[],
            pkeyIds:[],
            selAll:false,
            roles:null,
            roleIds:[]
        }
    },
    methods: 
    {
        [@btnfunc@]
        setDatalocation(dl)
        {
            this.datalocations=dl;	
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
            paras['viewCode']="dept";
            paras['curPage']=this.curpage;
            paras['pageItmes']=this.pageitems;
            paras['order_snum#asc,snumsub#asc']="1";
            var that = this;
            axios.post("./../api/datadeptlist",paras).then(function(res){
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
            {
                that.isDept=false;
                that.isSubDept = false;
            }
            else if(mr['role']=='d')
            {
                that.isDept=true;
                that.DeptID = mr['deptid'];
                if(mr['issub']=='1')
                    that.isSubDept = true;
                else
                    that.isSubDept = false; 
            }

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
        getDeptDatas()
        {
            let paras = {};
            paras['viewCode']="dept";
            paras['curPage']=1;
            paras['pageItmes']=100;
            paras['filter_pid_equal']="0";
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
            paras['viewCode']="dept";
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
            paras['order_snum#asc,snumsub#asc']="1";
            var that = this;
            axios.post("./../api/datadeptlist",paras).then(function(res){
            
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
                alert(err);
            });
        },
        getDataItemView(itemid) 
        {
            let paras = {};
            paras['viewCode']="dept";
            paras['itemIDs']=itemid;
            var that = this;
            axios.post("./../api/datadeptget",paras).then(function(res){
            that.dataitem=Object.values(Object.values(res.data)[0])[0];    
            that.oldlocation = that.dataitem["LOCATION"];

            that.roleIds=[];
            let arrTmp=Object.values(res.data)[1];
            for(let item of arrTmp)
            {
                that.roleIds.push(item['ROLEID']); 
            }

            if(that.dataitem['PID']!=0)
            {
                that.dataitem['PID'] = that.dataitem['PID'] + "|" + that.dataitem['SNUM'];
                that.dataitem['SNUM'] = that.dataitem['SNUMSUB'];
            }

            }).catch(function (err) {
            });
        },
        delDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']="dept";
            paras['itemIDs']=itemid;
            var that = this;
            axios.post("./../api/datadeptdel",paras).then(function(res){
            that.getDatasByFilters(that.curpage);
            closeWin[@configid@]();
            document.getElementById("content-info-msg[@apptype@][@configid@]").innerHTML="[@infodelsuc@]";
            document.getElementById("content-info[@apptype@][@configid@]").style.display="block";
            }).catch(function (err) {
                
            });
        },
        updDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']="dept";
            paras['itemIDs']=itemid;
            for (let v in this.dataitem) 
            {
                if(v!=this.pkey&&v!="OLD_LOCATION")
                {
                    paras['field_'+v] = this.dataitem[v];
                }
            }
            paras['field_ORGID'] = null;
            paras['field_ORGNAME'] = null;

            if(this.dataitem['PID']==null||this.dataitem['PID']=="")
            {
                paras['field_PID'] = "0";
                paras['field_SNUMSUB'] = "0";
            }
            else
            {
                let sp = this.dataitem['PID'];
                paras['field_PID'] = sp.substring(0,sp.indexOf("|"));
                paras['field_SNUMSUB'] = paras['field_SNUM'];
                paras['field_SNUM'] = sp.substring(sp.indexOf("|")+1);
            }

            if(paras['field_PID']+''==itemid)
            {
                document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML="[@frmnopnt@]";
                document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                return;
            }
            else
            {
                document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML="";
                document.getElementById("updWin-info[@apptype@][@configid@]").style.display="none";
            }

            let msg="";
            if(!gCheckValueNull(this.dataitem['NAME']))
            {
                msg=msg+"[@frmname@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            else
            {
                if(!gCheckValueLen(this.dataitem['NAME'],100))
                {
                    let msgobj = {"fname":"[@frmname@]","flen":100};
                    msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
                }
            }
            if(!gCheckValueLen(this.dataitem['ENAME'],500))
            {
                let msgobj = {"fname":"[@frmnamesub@]","flen":500};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckValueNull(this.dataitem['SNUM']))
            {
                msg=msg+"[@frmsort@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            else
            {
                if(!gCheckValueNum(this.dataitem['SNUM'],0,1000))
                {
                    msg=msg+"[@frmsortmsg@]<br/>";
                }
            }
            if(this.roleIds.join(",")!="")
            {
                paras['ROLEIDS']=this.roleIds.join(",");
            }
            else
            {
                msg=msg+"[@frmrole@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                return;
            }

            var that = this;
            axios.post("./../api/datadeptupd",paras).then(function(res)
            {
                that.returnmsg=Object.values(Object.values(res.data)[0])[0];
                if(that.returnmsg!="")
                {
                    document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=that.returnmsg;
                    document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                }
                else
                {
                    that.getDatasByFilters(that.curpage);
                    closeWin[@configid@]();
                    document.getElementById("content-info-msg[@apptype@][@configid@]").innerHTML="[@infoupdsuc@]";
                    document.getElementById("content-info[@apptype@][@configid@]").style.display="block";
                }
            }).catch(function (err) {
            });

        },
        addDatas() 
        {
            let paras = {};
            paras['viewCode']="dept";
            for (let v in this.dataitem) 
            {
                if(v!=this.pkey)
                {
                    paras['field_'+v] = this.dataitem[v];
                }
            }
            paras['field_ORGID'] = null;
            paras['field_ORGNAME'] = null;

            if(!this.isDept)
            {
                if(this.dataitem['PID']==null||this.dataitem['PID']=="")
                {
                    paras['field_PID'] = "0";
                    paras['field_SNUMSUB'] = "0";
                }
                else
                {
                    let sp = this.dataitem['PID'];
                    paras['field_PID'] = sp.substring(0,sp.indexOf("|"));
                    paras['field_SNUMSUB'] = paras['field_SNUM'];
                    paras['field_SNUM'] = sp.substring(sp.indexOf("|")+1);
                }
            }
            else
            {
                paras['field_SNUMSUB'] = paras['field_SNUM'];
            }

            let msg="";
            if(!gCheckValueNull(this.dataitem['NAME']))
            {
                msg=msg+"[@frmname@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            else
            {
                if(!gCheckValueLen(this.dataitem['NAME'],100))
                {
                    let msgobj = {"fname":"[@frmname@]","flen":100};
                    msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
                }
            }
            if(!gCheckValueLen(this.dataitem['ENAME'],500))
            {
                let msgobj = {"fname":"[@frmnamesub@]","flen":500};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckValueNull(this.dataitem['SNUM']))
            {
                msg=msg+"[@frmsort@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            else
            {
                if(!gCheckValueNum(this.dataitem['SNUM'],0,1000))
                {
                    msg=msg+"[@frmsortmsg@]<br/>";
                }
            }
            if(this.roleIds.join(",")!="")
            {
                paras['ROLEIDS']=this.roleIds.join(",");
            }
            else
            {
                msg=msg+"[@frmrole@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                return;
            }


            var that = this;
            axios.post("./../api/datadeptadd",paras).then(function(res){
                that.returnmsg=Object.values(Object.values(res.data)[0])[0];
                if(that.returnmsg!="")
                {
                    document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=that.returnmsg;
                    document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                }
                else
                {
                    that.getDatasByFilters(that.curpage);
                    closeWin[@configid@]();
                    document.getElementById("content-info-msg[@apptype@][@configid@]").innerHTML="[@infoaddsuc@]";
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

            this.getDeptDatas();
            this.getDataItemView(callbackpara);
            this.isupd=true;
            openUpdWin[@configid@](msg,callback,callbackpara);
        },
        openAddWinVue(msg,callback,callbackpara) 
        {
            document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML="";
            document.getElementById("updWin-info[@apptype@][@configid@]").style.display="none";

            this.getDeptDatas();
            this.dataitem={"ISPUB":"1"};
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
            this.depts = v
        },
        showDataLbl(v)
        {
            return v;
        }
    },
    mounted() 
    {
        this.getDatas();
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

