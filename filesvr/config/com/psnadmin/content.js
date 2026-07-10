
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
            roles:null,
            roleIds:[],
            depts:[],
            isDept:true,
            selIds:[],
            pkeyIds:[],
            selAll:false,
            gAmode:"",
            sortfield:'',
            sorttype:''
        }
    },
    methods: 
    {
        [@btnfunc@]
        setDatalocation(dl)
        {
            this.datalocations=dl;	
        },
        sortdata(field)
        {
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
            this.getDatasByFilters(1);
        },
        initmode()
        {
            let paras = {};
            var that = this;
            axios.post("./../portal/api/configgetregmode",paras).then(function(res){
                that.gAmode = res.data;
            }).catch(function (err) {
            });
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
        getDatas () 
        {
            let paras = {};
            paras['viewCode']="psn";
            paras['curPage']=this.curpage;
            paras['pageItmes']=this.pageitems;
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
            if(this.sortfield!='')
                paras['order_'+ this.sortfield + '_' + this.sorttype]="1";
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
            var that = this;
            axios.post("./../api/datapsnget",paras).then(function(res){
            that.dataitem=Object.values(Object.values(res.data)[0])[0];    
            that.oldlocation = that.dataitem["LOCATION"];

            that.roleIds=[];
            let arrTmp=Object.values(res.data)[1];
            for(let item of arrTmp)
            {
                that.roleIds.push(item['ROLEID']); 
            }

            }).catch(function (err) {
            });
        },
        delDatas(itemid) 
        {
            let paras = {};
            paras['viewCode']="psn";
            paras['itemIDs']=itemid;
            var that = this;
            axios.post("./../api/datapsndel",paras).then(function(res){
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
            paras['viewCode']="psn";
            paras['itemIDs']=itemid;
            paras['lan']="[@lan@]";
            for (let v in this.dataitem) 
            {
                if(v!=this.pkey&&v!="OLD_LOCATION")
                {
                    paras['field_'+v] = this.dataitem[v];
                }
            }
            let msg="";
            if(!gCheckValueNull(paras['field_NAME']))
            {
                msg=msg+"[@frmname@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            else
            {
                if(!gCheckValueLen(paras['field_NAME'],50))
                {
                    let msgobj = {"fname":"[@frmname@]","flen":50};
                    msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
                }
            }
            if(!gCheckValueLen(paras['field_EMPID'],50))
            {
                let msgobj = {"fname":"[@frmno@]","flen":50};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckDate(paras['field_BIRTHDAY']))
            {
                msg = msg+"[@frmdobmsg@]<br/>";
            }
            if(gCheckValueNull(document.getElementById("selDeptid[@apptype@][@configid@]").value))
            {
                let obj=document.getElementById("selDeptid[@apptype@][@configid@]");
                let objtxt = obj.options[obj.selectedIndex].text;
                paras['field_DEPTNAME']=objtxt.trim();
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

            if(this.gAmode=="")
            {
                alert("System Config Error"); 
                return;
            }
            else if(this.gAmode=="1")
            {
                if(!gCheckValueNull(paras['field_EMAIL']))
                {
                    msg=msg+"[@frmemail@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
                }
            }
            else if(this.gAmode=="2")
            {
                if(!gCheckValueNull(paras['field_MOBILE']))
                {
                    msg=msg+"[@frmmobile@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
                }
            }
            if(!gCheckEmail(paras['field_EMAIL']))
            {
                msg = msg+"[@frmemailmsg@]<br/>";
            }
            if(!gCheckValueLen(paras['field_EMAIL'],100))
            {
                let msgobj = {"fname":"[@frmemail@]","flen":100};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckValueLen(paras['field_TEL'],100))
            {
                let msgobj = {"fname":"[@frmtel@]","flen":100};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckMobile(paras['field_MOBILE']))
            {
                msg = msg+"[@frmmobilemsg@]<br/>";
            }
            if(!gCheckValueLen(paras['field_MOBILE'],20))
            {
                let msgobj = {"fname":"[@frmmobile@]","flen":20};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }

            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                return;
            }

            var that = this;
            axios.post("./../api/datapsnupd",paras).then(function(res)
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
            paras['viewCode']="psn";
            paras['lan']="[@lan@]";
            for (let v in this.dataitem) 
            {
                if(v!=this.pkey)
                {
                    paras['field_'+v] = this.dataitem[v];
                }
            }

            let msg="";
            if(!gCheckValueNull(paras['field_NAME']))
            {
                msg=msg+"[@frmname@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
            }
            else
            {
                if(!gCheckValueLen(paras['field_NAME'],50))
                {
                    let msgobj = {"fname":"[@frmname@]","flen":50};
                    msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
                }
            }
            if(!gCheckValueLen(paras['field_EMPID'],50))
            {
                let msgobj = {"fname":"[@frmno@]","flen":50};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckDate(paras['field_BIRTHDAY']))
            {
                msg = msg+"[@frmdobmsg@]<br/>";
            }
            if(gCheckValueNull(document.getElementById("selDeptid[@apptype@][@configid@]").value))
            {
                let obj=document.getElementById("selDeptid[@apptype@][@configid@]");
                let objtxt = obj.options[obj.selectedIndex].text;
                paras['field_DEPTNAME']=objtxt.trim();
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

            if(this.gAmode=="")
            {
                alert("System Config Error"); 
                return;
            }
            else if(this.gAmode=="1")
            {
                if(!gCheckValueNull(paras['field_EMAIL']))
                {
                    msg=msg+"[@frmemail@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
                }
            }
            else if(this.gAmode=="2")
            {
                if(!gCheckValueNull(paras['field_MOBILE']))
                {
                    msg=msg+"[@frmmobile@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
                }
            }
            if(!gCheckEmail(paras['field_EMAIL']))
            {
                msg = msg+"[@frmemailmsg@]<br/>";
            }
            if(!gCheckValueLen(paras['field_EMAIL'],100))
            {
                let msgobj = {"fname":"[@frmemail@]","flen":100};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckValueLen(paras['field_TEL'],100))
            {
                let msgobj = {"fname":"[@frmtel@]","flen":100};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }
            if(!gCheckMobile(paras['field_MOBILE']))
            {
                msg = msg+"[@frmmobilemsg@]<br/>";
            }
            if(!gCheckValueLen(paras['field_MOBILE'],20))
            {
                let msgobj = {"fname":"[@frmmobile@]","flen":20};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }

            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@apptype@][@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@apptype@][@configid@]").style.display="block";
                return;
            }
            paras['ROLEIDS']=this.roleIds.join(",");
            var that = this;
            axios.post("./../api/datapsnadd",paras).then(function(res){
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
            
            this.getDataItemView(callbackpara);
            this.isupd=true;
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
        this.initmode();
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
    window.setDataItem[@configid@]("BIRTHDAY",this.el.value);
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

    new DatePicker[@configid@]('_DatePicker_date', {
        inputId: 'birthday[@apptype@][@configid@]',
        className: 'date-picker-wp',
        seprator: '-'
        });