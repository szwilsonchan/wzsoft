function openReqPwdWin[@configid@]()
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("reqPwdWin[@configid@]").style.display="block";
}

function closeReqPwdWin[@configid@]()
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("reqPwdWin[@configid@]").style.display="none";
}

function reqPwdSave[@configid@]()
{
    let paras = {};
    paras['oldpassword']=document.getElementById("oldpassword[@configid@]").value;
    paras['password']=document.getElementById("password[@configid@]").value;
    paras['passwordconfirm']=document.getElementById("passwordconfirm[@configid@]").value;
    paras['lan']="[@lan@]";

    let msg="";
    if(paras['oldpassword']=="")
    {
        msg=msg+"[@pwd1@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }
    if(paras['password']=="")
    {
        msg=msg+"[@pwd2@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }
    if(paras['password']!=paras['passwordconfirm'])
    {
        msg = msg + "[@pwd4@]";
    }

    if(msg!="")
    {
        document.getElementById("updWin-info-pwd-msg[@configid@]").innerHTML=msg;
        document.getElementById("updWin-info-pwd[@configid@]").style.display="block";
        return;
    }

    axios.post("./../api/datapsnpwd",paras).then(function(res){
        let mreturn = res.data;
        let msg = mreturn['msg'];
        if(msg!="")
        {
            document.getElementById("updWin-info-pwd-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-pwd[@configid@]").style.display="block";
        }
        else
        {
            window.setDataItem[@configid@]('EMAIL',paras['email']);
            document.getElementById("updWin-info-pwd-msg[@configid@]").innerHTML="[@infoupdsuc@]";
            document.getElementById("updWin-info-pwd[@configid@]").style.display="block";
        }
    }).catch(function (err) {
    });
}

function openReqEmailWin[@configid@]()
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("reqEmailWin[@configid@]").style.display="block";
}

function closeReqEmailWin[@configid@]()
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("reqEmailWin[@configid@]").style.display="none";
}

function reqEmail[@configid@]()
{
    let paras = {};
    paras['email']=document.getElementById("reqemail[@configid@]").value;
    paras['reqkey']=document.getElementById("reqemailkey[@configid@]").value;
    paras['lan']="[@lan@]";
    let msg="";
    if(!gCheckValueNull(paras['email']))
    {
        msg=msg+"[@frmemail@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }

    if(msg!="")
    {
        document.getElementById("updWin-info-email-msg[@configid@]").innerHTML=msg;
        document.getElementById("updWin-info-email[@configid@]").style.display="block";
        return;
    }

    axios.post("./../api/datapsnreqmail",paras).then(function(res){
        let mreturn = res.data;
        let msg = mreturn['msg'];
        if(msg!="")
        {
            document.getElementById("updWin-info-email-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-email[@configid@]").style.display="block";
        }
        else
        {
            document.getElementById("updWin-info-email-msg[@configid@]").innerHTML="[@frmcodesend@]";
            document.getElementById("updWin-info-email[@configid@]").style.display="block";
        }
    }).catch(function (err) {
    });
}

function reqEmailSave[@configid@]()
{
    let paras = {};
    paras['email']=document.getElementById("reqemail[@configid@]").value;
    paras['reqkey']=document.getElementById("reqemailkey[@configid@]").value;
    paras['lan']="[@lan@]";

    let msg="";
    if(!gCheckValueNull(paras['email']))
    {
        msg=msg+"[@frmemail@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }
    else
    {
        if(!gCheckValueLen(paras['email'],100))
        {
            let msgobj = {"fname":"[@frmemail@]","flen":100};
            msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
        }
    }

    if(!gCheckValueNull(paras['reqkey']))
    {
        msg=msg+"[@frmcode@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }

    if(msg!="")
    {
        document.getElementById("updWin-info-email-msg[@configid@]").innerHTML=msg;
        document.getElementById("updWin-info-email[@configid@]").style.display="block";
        return;
    }

    axios.post("./../api/datapsnreqmailsave",paras).then(function(res){
        let mreturn = res.data;
        let msg = mreturn['msg'];
        if(msg!="")
        {
            document.getElementById("updWin-info-email-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-email[@configid@]").style.display="block";
        }
        else
        {
            window.setDataItem[@configid@]('EMAIL',paras['email']);
            document.getElementById("updWin-info-email-msg[@configid@]").innerHTML="[@infoupdsuc@]";
            document.getElementById("updWin-info-email[@configid@]").style.display="block";
        }
    }).catch(function (err) {
    });
}

function openReqMobileWin[@configid@]()
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("reqMobileWin[@configid@]").style.display="block";
}

function closeReqMobileWin[@configid@]()
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("reqMobileWin[@configid@]").style.display="none";
}

function reqMobile[@configid@]()
{
    let paras = {};
    paras['mobile']=document.getElementById("reqmobile[@configid@]").value;
    paras['reqkey']=document.getElementById("reqmobilekey[@configid@]").value;
    paras['lan']="[@lan@]";

    let msg="";
    if(!gCheckValueNull(paras['mobile']))
    {
        msg=msg+"[@frmmobile@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }

    if(msg!="")
    {
        document.getElementById("updWin-info-mobile-msg[@configid@]").innerHTML=msg;
        document.getElementById("updWin-info-mobile[@configid@]").style.display="block";
        return;
    }

    axios.post("./../api/datapsnreqmobile",paras).then(function(res){
        let mreturn = res.data;
        let msg = mreturn['msg'];
        if(msg!="")
        {
            document.getElementById("updWin-info-mobile-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-mobile[@configid@]").style.display="block";
        }
        else
        {
            document.getElementById("updWin-info-mobile-msg[@configid@]").innerHTML="[@frmcodesend@]";
            document.getElementById("updWin-info-mobile[@configid@]").style.display="block";
        }
    }).catch(function (err) {
    });
}

function reqMobileSave[@configid@]()
{
    let paras = {};
    paras['mobile']=document.getElementById("reqmobile[@configid@]").value;
    paras['reqkey']=document.getElementById("reqmobilekey[@configid@]").value;
    paras['lan']="[@lan@]";
    let msg="";
    if(!gCheckValueNull(paras['mobile']))
    {
        msg=msg+"[@frmmobile@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }
    else
    {
        if(!gCheckValueLen(paras['mobile'],20))
        {
            let msgobj = {"fname":"[@frmmobile@]","flen":20};
            msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
        }
    }
    if(!gCheckValueNull(paras['reqkey']))
    {
        msg=msg+"[@frmcode@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }

    if(msg!="")
    {
        document.getElementById("updWin-info-mobile-msg[@configid@]").innerHTML=msg;
        document.getElementById("updWin-info-mobile[@configid@]").style.display="block";
        return;
    }

    axios.post("./../api/datapsnreqmobilesave",paras).then(function(res){
        let mreturn = res.data;
        let msg = mreturn['msg'];
        if(msg!="")
        {
            document.getElementById("updWin-info-mobile-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-mobile[@configid@]").style.display="block";
        }
        else
        {
            window.setDataItem[@configid@]('MOBILE',paras['mobile']);
            document.getElementById("updWin-info-mobile-msg[@configid@]").innerHTML="[@infoupdsuc@]";
            document.getElementById("updWin-info-mobile[@configid@]").style.display="block";
        }
    }).catch(function (err) {
    });
}


function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}

function openReqOrgWin[@configid@]()
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("reqOrgWin[@configid@]").style.display="block";
}

function closeReqOrgWin[@configid@]()
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("reqOrgWin[@configid@]").style.display="none";
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
    }

}
function selItemDo[@configid@](id,title)
{

    let paras = {};
    paras['orgid']=id;

    var that = this;
    axios.post("./../api/datadeptlistpub",paras).then(function(res){
    depts=res.data;
    window.setDepts[@configid@](depts);

    let d = document.createElement("div");
    d.className="selItemDiv[@configid@]";

    let s="";
    s = s + "<span class=\"action-content\" ></span>";
    s = s + "<input type='hidden' />";
    s = s + "<span class=\"action-content\" style=\"float:right;\" ><a href='javascript:void(0)' onclick=\"selItemDel[@configid@](event);return false\"><img width=\"80%\"  src=\"./imgs/del.png\"></a></span>";
    d.innerHTML=s;

    d.childNodes[0].innerHTML=title;
    d.childNodes[1].value=id;
    document.getElementById("divSelItems[@configid@]").appendChild(d);
    document.getElementById("divSelItems[@configid@]").style.display="block";
    document.getElementById("divSelSearchs[@configid@]").style.display="none";
    document.getElementById("inpSel[@configid@]").style.display="none";

    }).catch(function (err) {
    });

}
function selItemSearch[@configid@](e)
{
    let inp = e.target.value;
    //alert(inp);
    if(inp.length>=2)
    {
        let paras = {};
        paras['filter_searchkey_like']=inp;

        axios.post("./../api/datapsnorglist",paras).then(function(res){
        orgdatas=res.data;

        let str="";
        for (let item of orgdatas) 
        {
            let itemID = "";
            let itemTitle = "";

            itemID = item["ORGID"]+"";
            itemTitle = item["NAME"];

            itemID=itemID.replaceAll("'","\\'");
            itemTitle=itemTitle.replaceAll("'","\\'");
            itemTitle=itemTitle.replaceAll('"','&quot;');

            str = str + "<div class=\"selItemShow\" onclick=\"selItemDo[@configid@]('"+ itemID +"','"+ itemTitle +"')\" ><span style=\"border:none\">"+ itemTitle +"</span></div>";
        }
        let dnode = document.getElementById("divSelSearchs[@configid@]");
        if(str!="")
        {
            dnode.innerHTML="<div class=\"selItemShow\" style=\"text-align:right\"><div class='searchclose[@configid@]' onclick=\"closeSearchDiv[@configid@](event)\">&Chi;</div></div>"+str;
            dnode.style.display="block";
        }

        }).catch(function (err) {
        });
    }
    else
        selItemHide[@configid@]();
}

function closeSearchDiv[@configid@](e)
{
    e.target.parentElement.parentElement.style.display="none";
}

function reqOrgSave[@configid@]()
{
    let paras={};
    let dorg = document.getElementById("divSelItems[@configid@]");
    for (let dNode of dorg.childNodes) 
    {
        if(dNode.className == "selItemDiv[@configid@]")
        {
            paras['orgid'] = dNode.childNodes[1].value;
            paras['orgname'] = dNode.childNodes[0].innerHTML;
        }
    }
    paras['reqorgnote'] = document.getElementById("reqorgnote[@configid@]").value;
    paras['lan']="[@lan@]";
    let msg="";
    if(!gCheckValueNull(paras['orgid']))
    {
        msg=msg+"[@frmapporg@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }

    paras['deptid'] = document.getElementById("reqdeptid[@configid@]").value;
    if(!gCheckValueNull(paras['deptid']))
    {
        msg=msg+"[@frmappdept@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }

    if(!gCheckValueNull(paras['reqorgnote']))
    {
        msg=msg+"[@frmapporgnote@]"+ gMsgConstList['g_notempty_[@lan@]'] +"<br/>";
    }
    else
    {
        if(!gCheckValueLen(paras['reqorgnote'],200))
        {
            let msgobj = {"fname":"[@frmapporgnote@]","flen":200};
            msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
        }
    }

    if(msg!="")
    {
        document.getElementById("updWin-info-org-msg[@configid@]").innerHTML=msg;
        document.getElementById("updWin-info-org[@configid@]").style.display="block";
        return;
    }

    axios.post("./../api/datapsnreqorgsave",paras).then(function(res){
        let mreturn = res.data;
        let msg = mreturn['msg'];
        if(msg!="")
        {
            document.getElementById("updWin-info-org-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-org[@configid@]").style.display="block";
        }
        else
        {
            document.getElementById("updWin-info-org-msg[@configid@]").innerHTML="[@frmappmsg1@]";
            document.getElementById("updWin-info-org[@configid@]").style.display="block";
            document.getElementById("spnReqOrg[@configid@]").innerText="[@frmappmsg2@]"+paras['orgname']+"[@frmappmsg3@]";

        }
    }).catch(function (err) {
    });

}

const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            viewcode:"psn",
            dataitem:{},
            depts:[],
            psnorgs:[],
            pkey:"PSNID",
            isupd:true,
            returnmsg:'',
            gAmode:""
        }
    },
    methods: 
    {
        setDataItem(k,v)
        {
            this.dataitem[k]=v;
        },
        initmode()
        {
            let paras = {};
            var that = this;
            axios.post("./../portal/api/configgetamode",paras).then(function(res){
                that.gAmode = res.data;
            }).catch(function (err) {
            });
        },
        getDataItem() 
        {
            let paras = {};
            paras['viewCode']="psn";
            paras['itemIDs']="";
            var that = this;
            axios.post("./../api/datapsnget",paras).then(function(res){
            that.dataitem=Object.values(Object.values(res.data)[0])[0];    
            that.oldlocation = that.dataitem["LOCATION"];

            if(that.dataitem['REQORGNAME']!=null)
            {
                document.getElementById("divReqOrg[@configid@]").style.display="block";
                if(that.dataitem['REQORGSTATUS']=='0')
                    document.getElementById("spnReqOrg[@configid@]").innerText="[@frmappmsg2@]"+that.dataitem['REQORGNAME']+"[@frmappmsg3@]";
                else if(that.dataitem['REQORGSTATUS']=='2')
                    document.getElementById("spnReqOrg[@configid@]").innerText="[@frmappmsg2@]"+that.dataitem['REQORGNAME']+"[@frmappmsg4@]"+ that.dataitem['REQORGCOMMENT'];
            }
            else
            {
                document.getElementById("divReqOrg[@configid@]").style.display="none";
            }


            }).catch(function (err) {
            });
        },
        getPsnOrgs() 
        {
            let paras = {};
            var that = this;
            axios.post("./../api/datapsngetorgs",paras).then(function(res){
            that.psnorgs=res.data;    

            }).catch(function (err) {
            });
        },
        updDatas() 
        {
            let paras = {};
            paras['viewCode']="psn";
            paras['itemIDs']="";
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
            if(!gCheckValueLen(paras['field_MOBILE'],20))
            {
                let msgobj = {"fname":"[@frmmobile@]","flen":20};
                msg=msg+gMsgConstDeal('g_noexceed_[@lan@]',msgobj)+"<br/>";
            }

            if(msg!="")
            {
                document.getElementById("updWin-info-msg[@configid@]").innerHTML=msg;
                document.getElementById("updWin-info[@configid@]").style.display="block";
                return;
            }

            var that = this;
            axios.post("./../api/datapsnupd",paras).then(function(res)
            {
                that.returnmsg=Object.values(Object.values(res.data)[0])[0];
                if(that.returnmsg!="")
                {
                    document.getElementById("updWin-info-msg[@configid@]").innerHTML=that.returnmsg;
                    document.getElementById("updWin-info[@configid@]").style.display="block";
                }
                else
                {
                    document.getElementById("content-info-msg[@configid@]").innerHTML="[@infoupdsuc@]";
                    document.getElementById("content-info[@configid@]").style.display="block";
                }
            }).catch(function (err) {
            });

        },
        setDepts(v)
        {
            this.depts=v;
        }
    },
    mounted() 
    {
        this.initmode();
        this.getDataItem();
        this.getPsnOrgs();
        window.setDepts[@configid@]=this.setDepts;
        window.setDataItem[@configid@] = this.setDataItem;
    }
}

Vue.createApp(DataListVue[@configid@]).mount('#datalist[@configid@]');

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
        inputId: 'birthday[@configid@]',
        className: 'date-picker-wp',
        seprator: '-'
        });