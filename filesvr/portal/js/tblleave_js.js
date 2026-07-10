;if("Role".indexOf("@btntitlesel@")>0)
{
    document.getElementById("intLogout").value="Role";
}
;    const MenuVuewzsoftcom65fe9c73c6d649656e793feb940f6f42 = 
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
                    document.getElementById("menu-contentwzsoftcom65fe9c73c6d649656e793feb940f6f42").style.display="block";

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
                    document.getElementById("menu-contentwzsoftcom65fe9c73c6d649656e793feb940f6f42").style.display="block";

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
    
    Vue.createApp(MenuVuewzsoftcom65fe9c73c6d649656e793feb940f6f42).mount('#menu-contentwzsoftcom65fe9c73c6d649656e793feb940f6f42');
    
;const ComConfigVuewzsoftcombf4e665bf53342f25b3a0666862e5e5d = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            viewdatas:null,
            dataitem:{"DEPTID":""},
            curpage:1,
            topItems:0,
            orderField:"id_asc",
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=="listdata")
            {
                return this.viewdatas;
            }
            else if(k=="seltext"||k=="DEPTIDSTXT")
            {
                let sIndex = document.getElementById("selvaluewzsoftcombf4e665bf53342f25b3a0666862e5e5d").selectedIndex;
                let sText = "";
                if(sIndex>=0)
                    sText = document.getElementById("selvaluewzsoftcombf4e665bf53342f25b3a0666862e5e5d").options[sIndex].text;
                return sText;
            }
            else if(k=="DEPTID")
            {
                return this.dataitem['DEPTID'];
            }
            else
            {
                return this.dataitem[k];
            }
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("selectwzsoftcombf4e665bf53342f25b3a0666862e5e5d").parentElement.parentElement;
            let pc = document.getElementById("selectwzsoftcombf4e665bf53342f25b3a0666862e5e5d");
            if(k=="listdata")
            {
                if(v)
                {
                    if(Object.prototype.toString.call(v) === '[object Array]')
                        this.viewdatas=v;
                    else
                        this.viewdatas=JSON.parse(v);
                
                    if('false'=='true')
                    {
                        for(let item of this.viewdatas)
                        {
                            this.dataitem['DEPTID']=item['ID'];
                            this.dataitem['DEPTIDSTXT']=item['WORKCONTENT'];
                            setTimeout(onchangewzsoftcombf4e665bf53342f25b3a0666862e5e5d,50);
                            return;
                        }
                    }
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
                }
                pc.style.display="block";
            } 
            else if(k=='seltext')
            {
                this.dataitem["DEPTIDSTXT"]=v;
                pc.style.display="block";
            }
            else
            {
                this.dataitem[k]=v;
                if(k=="DEPTID")
                {
                    onchangewzsoftcombf4e665bf53342f25b3a0666862e5e5d();
                }
                pc.style.display="block";
            }
        },
        pushDataItem(k,v)
        {
            if(k=="listdata")
            {
                this.viewdatas.push(v);
            }
        },
        getDatas() 
        {
            let paras = {};
            paras['viewCode']="tblworklog";
            if(paras['viewCode']=="")
                return;
            paras['curPage']=1;
            paras['pageItmes']=1000;
            if(this.topItems>0)
                paras['topItems']=this.topItems;
            if(this.orderField!="")
                paras['order_'+this.orderField]="";

            paras['fieldsclient']="ID,WORKCONTENT";
            var that = this;
            axios.post("./../api/datalist",paras).then(function(res){
            that.viewdatas=Object.values(res.data)[0];   
            
            if('false'=='true')
            {
                for(let item of that.viewdatas)
                {
                    that.dataitem['DEPTID']=item['ID'];
                    that.dataitem['DEPTIDSTXT']=item['WORKCONTENT'];
                    setTimeout(onchangewzsoftcombf4e665bf53342f25b3a0666862e5e5d,50);
                    return;
                }
            }

            }).catch(function (err) {
            });
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
            if(this.dataitem.DEPTID)
                str = this.dataitem.DEPTID;
            str = str.toString().trim();
            let fieldnoempty = true;
            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "Leave Type" + gMsgConstList['g_notempty_e'] ;
            }
            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["DEPTID"]=msg;
                }
                document.getElementById("valmsgwzsoftcombf4e665bf53342f25b3a0666862e5e5d").style.display="block";
                document.getElementById("valmsgwzsoftcombf4e665bf53342f25b3a0666862e5e5d").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["DEPTID"]="";
                document.getElementById("valmsgwzsoftcombf4e665bf53342f25b3a0666862e5e5d").style.display="none";
                document.getElementById("valmsgwzsoftcombf4e665bf53342f25b3a0666862e5e5d").innerHTML="";
            }
            return true;

        }
    },
    mounted() 
    {
        window.getDataItemwzsoftcombf4e665bf53342f25b3a0666862e5e5d = this.getDataItem;
        window.setDataItemwzsoftcombf4e665bf53342f25b3a0666862e5e5d = this.setDataItem;
        window.pushDataItemwzsoftcombf4e665bf53342f25b3a0666862e5e5d = this.pushDataItem;
        window.valDataItemwzsoftcombf4e665bf53342f25b3a0666862e5e5d = this.valDataItem;

        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        else
        {
            this.getDatas();
        }
    }
}

Vue.createApp(ComConfigVuewzsoftcombf4e665bf53342f25b3a0666862e5e5d).mount('#selectwzsoftcombf4e665bf53342f25b3a0666862e5e5d');

function onchangewzsoftcombf4e665bf53342f25b3a0666862e5e5d()
{
    window.valDataItemwzsoftcombf4e665bf53342f25b3a0666862e5e5d();
    ;
}
;
var DatePickerwzsoftcom62af523cd7716f27fd28c718354c1c7e = function () {
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
    for (var i=0; i<D._fc(); i++ ) con.push('<td class="handwzsoftcom62af523cd7716f27fd28c718354c1c7e" onclick="'+this.n+'.fillInput('+year+', '+month+', '+(i+1)+')">'+(i+1)+'</td>');
    var toend = con.length%7;
    if (toend != 0) for (var i=0; i<7-toend; i++) con.push('<td class="noborder"> </td>');
    _html += '<tr>'+fn("-1, null", "<<")+fn("null, -1", "<")+'<td title="'+this.n+'DatePicker" colspan=3 class="strongwzsoftcom62af523cd7716f27fd28c718354c1c7e">'+year+'/'+month+'/'+date+'</td>'+fn("null, 1", ">")+fn("1, null", ">>")+'</tr>';
    for (var i=0; i<con.length; i++) _html += (i==0 ? '<tr>' : i%7==0 ? '</tr><tr>' : '') + con[i] + (i == con.length-1 ? '</tr>' : '');
    !!this.box ? this.box.innerHTML = _html : this.createBox(_html);
    },
    fillInput : function (y, m, d) {
    var s = this.config.seprator || '/';
    this.el.value = y + s + m + s + d;
    window.setDataItemwzsoftcom62af523cd7716f27fd28c718354c1c7e('date',this.el.value);
    window.valDataItemwzsoftcom62af523cd7716f27fd28c718354c1c7e();
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

    
const ComVuewzsoftcom62af523cd7716f27fd28c718354c1c7e = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            fieldtypedb:'1',
            dataitem:{"FILLDATE":null,"date":"","time":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=='FILLDATE')
            {
                if(this.fieldtypedb=='1')
                    return this.dataitem.date;
                else
                    return this.dataitem.date + " " + this.dataitem.time;
            }
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("inputwzsoftcom62af523cd7716f27fd28c718354c1c7e").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcom62af523cd7716f27fd28c718354c1c7e");
            if(k=='s#display')
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
                }
                pc.style.display="block";
            }
            else
            {
                if(k=='FILLDATE'&&(v))
                {
                    let sd=v;
                    if(v instanceof Date)
                    {
                        sd = this.dateToStr(v);
                    }
                    sd=sd.trim();
                    if(sd.indexOf(" ")>0)
                    {
                        this.dataitem.date=sd.substring(0,sd.indexOf(" "));
                        this.dataitem.time=sd.substring(sd.indexOf(" ")+1);
                    }
                    else
                    {
                        this.dataitem.date=v;
                    }
                }
                this.dataitem[k]=v;
                pc.style.display="block";
            }
        },
        dateToStr(date) 
        {
            let year = date.getFullYear();
            let month = date.getMonth();
            let day = date.getDate();
            let hours = date.getHours();
            let min = date.getMinutes();
            let second = date.getSeconds();
            return year + "-" +
                ((month + 1) > 9 ? (month + 1) : "0" + (month + 1)) + "-" +
                (day > 9 ? day : ("0" + day)) + " " +
                (hours > 9 ? hours : ("0" + hours)) + ":" +
                (min > 9 ? min : ("0" + min)) + ":" +
                (second > 9 ? second : ("0" + second));
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
            str = this.getDataItem('FILLDATE');
            str = str.toString().trim();
            let fieldnoempty = true;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "Start Date" + gMsgConstList['g_notempty_e'] ;
            }
            if(str!="")
            {
                if(this.fieldtypedb=='1')
                    str = str + " 00:00:00";

                if(!this.checkDateTime(str))
                {
                    n=-1;
                    msg = gMsgConstList['g_inp_date_e'] ;
                }
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["FILLDATE"]=msg;
                }
    
                document.getElementById("valmsgwzsoftcom62af523cd7716f27fd28c718354c1c7e").style.display="block";
                document.getElementById("valmsgwzsoftcom62af523cd7716f27fd28c718354c1c7e").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["FILLDATE"]="";
                
                document.getElementById("valmsgwzsoftcom62af523cd7716f27fd28c718354c1c7e").style.display="none";
                document.getElementById("valmsgwzsoftcom62af523cd7716f27fd28c718354c1c7e").innerHTML="";
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
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItemwzsoftcom62af523cd7716f27fd28c718354c1c7e = this.getDataItem;
        window.setDataItemwzsoftcom62af523cd7716f27fd28c718354c1c7e = this.setDataItem;
        window.valDataItemwzsoftcom62af523cd7716f27fd28c718354c1c7e = this.valDataItem;

        initDateTimeDivwzsoftcom62af523cd7716f27fd28c718354c1c7e();

    }
}

Vue.createApp(ComVuewzsoftcom62af523cd7716f27fd28c718354c1c7e).mount('#inputwzsoftcom62af523cd7716f27fd28c718354c1c7e');

function initDateTimeDivwzsoftcom62af523cd7716f27fd28c718354c1c7e()
{
    try{
        new DatePickerwzsoftcom62af523cd7716f27fd28c718354c1c7e('_DatePicker_wzsoftcom62af523cd7716f27fd28c718354c1c7e', {
            inputId: 'datawzsoftcom62af523cd7716f27fd28c718354c1c7e',
            className: 'date-picker-wp',
            seprator: '-'
            });
    }
    catch(err)
    {
        alert(err);
    }
}

function onchangewzsoftcom62af523cd7716f27fd28c718354c1c7e()
{
    window.valDataItemwzsoftcom62af523cd7716f27fd28c718354c1c7e();
    
}

function onblurwzsoftcom62af523cd7716f27fd28c718354c1c7e()
{
    window.valDataItemwzsoftcom62af523cd7716f27fd28c718354c1c7e();
}
;
var DatePickerwzsoftcom830f903f2e95e71153dafe7c9aedb738 = function () {
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
    for (var i=0; i<D._fc(); i++ ) con.push('<td class="handwzsoftcom830f903f2e95e71153dafe7c9aedb738" onclick="'+this.n+'.fillInput('+year+', '+month+', '+(i+1)+')">'+(i+1)+'</td>');
    var toend = con.length%7;
    if (toend != 0) for (var i=0; i<7-toend; i++) con.push('<td class="noborder"> </td>');
    _html += '<tr>'+fn("-1, null", "<<")+fn("null, -1", "<")+'<td title="'+this.n+'DatePicker" colspan=3 class="strongwzsoftcom830f903f2e95e71153dafe7c9aedb738">'+year+'/'+month+'/'+date+'</td>'+fn("null, 1", ">")+fn("1, null", ">>")+'</tr>';
    for (var i=0; i<con.length; i++) _html += (i==0 ? '<tr>' : i%7==0 ? '</tr><tr>' : '') + con[i] + (i == con.length-1 ? '</tr>' : '');
    !!this.box ? this.box.innerHTML = _html : this.createBox(_html);
    },
    fillInput : function (y, m, d) {
    var s = this.config.seprator || '/';
    this.el.value = y + s + m + s + d;
    window.setDataItemwzsoftcom830f903f2e95e71153dafe7c9aedb738('date',this.el.value);
    window.valDataItemwzsoftcom830f903f2e95e71153dafe7c9aedb738();
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

    
const ComVuewzsoftcom830f903f2e95e71153dafe7c9aedb738 = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            fieldtypedb:'1',
            dataitem:{"FILLDATE":null,"date":"","time":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=='FILLDATE')
            {
                if(this.fieldtypedb=='1')
                    return this.dataitem.date;
                else
                    return this.dataitem.date + " " + this.dataitem.time;
            }
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("inputwzsoftcom830f903f2e95e71153dafe7c9aedb738").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcom830f903f2e95e71153dafe7c9aedb738");
            if(k=='s#display')
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
                }
                pc.style.display="block";
            }
            else
            {
                if(k=='FILLDATE'&&(v))
                {
                    let sd=v;
                    if(v instanceof Date)
                    {
                        sd = this.dateToStr(v);
                    }
                    sd=sd.trim();
                    if(sd.indexOf(" ")>0)
                    {
                        this.dataitem.date=sd.substring(0,sd.indexOf(" "));
                        this.dataitem.time=sd.substring(sd.indexOf(" ")+1);
                    }
                    else
                    {
                        this.dataitem.date=v;
                    }
                }
                this.dataitem[k]=v;
                pc.style.display="block";
            }
        },
        dateToStr(date) 
        {
            let year = date.getFullYear();
            let month = date.getMonth();
            let day = date.getDate();
            let hours = date.getHours();
            let min = date.getMinutes();
            let second = date.getSeconds();
            return year + "-" +
                ((month + 1) > 9 ? (month + 1) : "0" + (month + 1)) + "-" +
                (day > 9 ? day : ("0" + day)) + " " +
                (hours > 9 ? hours : ("0" + hours)) + ":" +
                (min > 9 ? min : ("0" + min)) + ":" +
                (second > 9 ? second : ("0" + second));
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
            str = this.getDataItem('FILLDATE');
            str = str.toString().trim();
            let fieldnoempty = true;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "End Date" + gMsgConstList['g_notempty_e'] ;
            }
            if(str!="")
            {
                if(this.fieldtypedb=='1')
                    str = str + " 00:00:00";

                if(!this.checkDateTime(str))
                {
                    n=-1;
                    msg = gMsgConstList['g_inp_date_e'] ;
                }
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["FILLDATE"]=msg;
                }
    
                document.getElementById("valmsgwzsoftcom830f903f2e95e71153dafe7c9aedb738").style.display="block";
                document.getElementById("valmsgwzsoftcom830f903f2e95e71153dafe7c9aedb738").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["FILLDATE"]="";
                
                document.getElementById("valmsgwzsoftcom830f903f2e95e71153dafe7c9aedb738").style.display="none";
                document.getElementById("valmsgwzsoftcom830f903f2e95e71153dafe7c9aedb738").innerHTML="";
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
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItemwzsoftcom830f903f2e95e71153dafe7c9aedb738 = this.getDataItem;
        window.setDataItemwzsoftcom830f903f2e95e71153dafe7c9aedb738 = this.setDataItem;
        window.valDataItemwzsoftcom830f903f2e95e71153dafe7c9aedb738 = this.valDataItem;

        initDateTimeDivwzsoftcom830f903f2e95e71153dafe7c9aedb738();

    }
}

Vue.createApp(ComVuewzsoftcom830f903f2e95e71153dafe7c9aedb738).mount('#inputwzsoftcom830f903f2e95e71153dafe7c9aedb738');

function initDateTimeDivwzsoftcom830f903f2e95e71153dafe7c9aedb738()
{
    try{
        new DatePickerwzsoftcom830f903f2e95e71153dafe7c9aedb738('_DatePicker_wzsoftcom830f903f2e95e71153dafe7c9aedb738', {
            inputId: 'datawzsoftcom830f903f2e95e71153dafe7c9aedb738',
            className: 'date-picker-wp',
            seprator: '-'
            });
    }
    catch(err)
    {
        alert(err);
    }
}

function onchangewzsoftcom830f903f2e95e71153dafe7c9aedb738()
{
    window.valDataItemwzsoftcom830f903f2e95e71153dafe7c9aedb738();
    
}

function onblurwzsoftcom830f903f2e95e71153dafe7c9aedb738()
{
    window.valDataItemwzsoftcom830f903f2e95e71153dafe7c9aedb738();
}
;
const ComVuewzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81 = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            dataitem:{"WORKCONTENT":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            let fieldtypedb=1;
            if(fieldtypedb=="2"||fieldtypedb=="3")
            {
                if(this.dataitem[k]=="")
                {
                    this.dataitem[k]=null;
                }
            }
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("inputwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81");
            if(k=='s#display')
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
                }
                pc.style.display="block";
            }
            else
            {
                this.dataitem[k]=v;
                pc.style.display="block";
            }
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
            if(this.dataitem.WORKCONTENT)
                str = this.dataitem.WORKCONTENT;
            str = str.toString().trim();
            let fieldtypedb=1;
            let valtype=0;
            let fieldlen=100;
            let fieldnoempty = true;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1;
                msg = "Days" + gMsgConstList['g_notempty_e'] ;
            }
            if(str!="")
            {
                if(str.length>fieldlen)
                {
                    n=-1;
                    let msgobj = {"fname":"Days","flen":fieldlen};
                    msg = gMsgConstDeal('g_noexceed_e',msgobj);

                }

                if(fieldtypedb==2&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                        msg = gMsgConstList['g_inp_number_e'];
                }
                else if(fieldtypedb==3&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+$/i);
                    if(n==-1)
                        msg = gMsgConstList['g_inp_integer_e']
                }
                else if(fieldtypedb==4&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                    {
                        msg = gMsgConstList['g_inp_amount_e']
                    }
                    else
                    {
                        let dn = str.indexOf(".");
                        let s = str.substring(dn);
                        if(dn>0&&s.length>3)
                        {
                            msg = gMsgConstList['g_inp_amount2_e']
                            n=-1;
                        }
                    }
                }
                else if(fieldtypedb==5&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                    {
                        msg = gMsgConstList['g_inp_amount_e']
                    }
                    else
                    {
                        let dn = str.indexOf(".");
                        let s = str.substring(dn);
                        if(dn>0&&s.length>5)
                        {
                            msg = gMsgConstList['g_inp_amount4_e']
                            n=-1;
                        }
                    }
                }
                
                if(valtype==1&&n!=-1)
                {
                    regx = "a";
                    if(regx!="a")
                    {
                        n= str.search(/a/i);
                        if(n==-1)
                            msg = gMsgConstList['g_inp_errv_e']
                    }
                }
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["WORKCONTENT"]=msg;
                }

                document.getElementById("valmsgwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81").style.display="block";
                document.getElementById("valmsgwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["WORKCONTENT"]="";

                document.getElementById("valmsgwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81").style.display="none";
                document.getElementById("valmsgwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81").innerHTML="";
            }
            return true;

        },
        dealValue(v)
        {
            let fieldtypedb=1;
            if(fieldtypedb==4)
            {
               v =  this.formatAmount(v,2,true,",");
            }
            if(fieldtypedb==5)
            {
               v =  this.formatAmount(v,6,true,",");
            }
            return v;
        },
        formatAmount(amount, decimalPlaces, zeroFill, thousandSeparator) 
        {
            if(amount==null||amount=="")
            {
                return "";
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
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItemwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81 = this.getDataItem;
        window.setDataItemwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81 = this.setDataItem;
        window.valDataItemwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81 = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81).mount('#inputwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81');

function onchangewzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81()
{
    window.valDataItemwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81();
    
}

function onblurwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81()
{
    window.valDataItemwzsoftcomd8fd5a78a94e153f2c3c9aa2de59bd81();
}
;
const ComVuewzsoftcomc9bd1bc8ccbdb80069063aafb4374512 = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            dataitem:{"WORKDURATION":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            let fieldtypedb=2;
            if(fieldtypedb=="2"||fieldtypedb=="3")
            {
                if(this.dataitem[k]=="")
                {
                    this.dataitem[k]=null;
                }
            }
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("inputwzsoftcomc9bd1bc8ccbdb80069063aafb4374512").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcomc9bd1bc8ccbdb80069063aafb4374512");
            if(k=='s#display')
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
                }
                pc.style.display="block";
            }
            else
            {
                this.dataitem[k]=v;
                pc.style.display="block";
            }
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
            if(this.dataitem.WORKDURATION)
                str = this.dataitem.WORKDURATION;
            str = str.toString().trim();
            let fieldtypedb=2;
            let valtype=0;
            let fieldlen=15;
            let fieldnoempty = true;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1;
                msg = "Reason" + gMsgConstList['g_notempty_e'] ;
            }
            if(str!="")
            {
                if(str.length>fieldlen)
                {
                    n=-1;
                    let msgobj = {"fname":"Reason","flen":fieldlen};
                    msg = gMsgConstDeal('g_noexceed_e',msgobj);

                }

                if(fieldtypedb==2&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                        msg = gMsgConstList['g_inp_number_e'];
                }
                else if(fieldtypedb==3&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+$/i);
                    if(n==-1)
                        msg = gMsgConstList['g_inp_integer_e']
                }
                else if(fieldtypedb==4&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                    {
                        msg = gMsgConstList['g_inp_amount_e']
                    }
                    else
                    {
                        let dn = str.indexOf(".");
                        let s = str.substring(dn);
                        if(dn>0&&s.length>3)
                        {
                            msg = gMsgConstList['g_inp_amount2_e']
                            n=-1;
                        }
                    }
                }
                else if(fieldtypedb==5&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                    {
                        msg = gMsgConstList['g_inp_amount_e']
                    }
                    else
                    {
                        let dn = str.indexOf(".");
                        let s = str.substring(dn);
                        if(dn>0&&s.length>5)
                        {
                            msg = gMsgConstList['g_inp_amount4_e']
                            n=-1;
                        }
                    }
                }
                
                if(valtype==1&&n!=-1)
                {
                    regx = "a";
                    if(regx!="a")
                    {
                        n= str.search(/a/i);
                        if(n==-1)
                            msg = gMsgConstList['g_inp_errv_e']
                    }
                }
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["WORKDURATION"]=msg;
                }

                document.getElementById("valmsgwzsoftcomc9bd1bc8ccbdb80069063aafb4374512").style.display="block";
                document.getElementById("valmsgwzsoftcomc9bd1bc8ccbdb80069063aafb4374512").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["WORKDURATION"]="";

                document.getElementById("valmsgwzsoftcomc9bd1bc8ccbdb80069063aafb4374512").style.display="none";
                document.getElementById("valmsgwzsoftcomc9bd1bc8ccbdb80069063aafb4374512").innerHTML="";
            }
            return true;

        },
        dealValue(v)
        {
            let fieldtypedb=2;
            if(fieldtypedb==4)
            {
               v =  this.formatAmount(v,2,true,",");
            }
            if(fieldtypedb==5)
            {
               v =  this.formatAmount(v,6,true,",");
            }
            return v;
        },
        formatAmount(amount, decimalPlaces, zeroFill, thousandSeparator) 
        {
            if(amount==null||amount=="")
            {
                return "";
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
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItemwzsoftcomc9bd1bc8ccbdb80069063aafb4374512 = this.getDataItem;
        window.setDataItemwzsoftcomc9bd1bc8ccbdb80069063aafb4374512 = this.setDataItem;
        window.valDataItemwzsoftcomc9bd1bc8ccbdb80069063aafb4374512 = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcomc9bd1bc8ccbdb80069063aafb4374512).mount('#inputwzsoftcomc9bd1bc8ccbdb80069063aafb4374512');

function onchangewzsoftcomc9bd1bc8ccbdb80069063aafb4374512()
{
    window.valDataItemwzsoftcomc9bd1bc8ccbdb80069063aafb4374512();
    onchange_wzsoftcomc9bd1bc8ccbdb80069063aafb4374512();
}

function onblurwzsoftcomc9bd1bc8ccbdb80069063aafb4374512()
{
    window.valDataItemwzsoftcomc9bd1bc8ccbdb80069063aafb4374512();
}
function onchange_wzsoftcomc9bd1bc8ccbdb80069063aafb4374512(){ var am='';;if(gvalnum(window.getDataItemwzsoftcomcwtype1b3c5d7e9f1a3b5c7d9e1f3a('null'))==gvalnum('FULLTIME')){am=gvalnum(window.getDataItemwzsoftcomcdurat1b3c5d7e9f1a3b5c7d9e1f3a('null'))*gvalnum('20');;}else{am=gvalnum(window.getDataItemwzsoftcomcdurat1b3c5d7e9f1a3b5c7d9e1f3a('null'))*gvalnum('10');;};;window.setDataItemwzsoftcomcperfp1b3c5d7e9f1a3b5c7d9e1f3a('null',(gvalnum(am)));;;return '';};gLan = "e";
gFormSaveChk = true;

const ComVuewzsoftcom38b8fff8ba34d83d40bf53b527853240 = 
{
    data() 
    {
        return {
            isView:false,
            hiddeReturn:false,
            showSave:true,
            dataitem:{"pdffile":null,"showreject":false,"showpdf":false,"showsubmit":true}
        }
    },
    methods: 
    {
        submitForm()
        {
            gFormSaveChk = true;
            this.submitFormDo();
        },
        submitFormDo()
        {
            mapPara['globalParam_rejectNode'] = document.getElementById("selRejectNode1wzsoftcom38b8fff8ba34d83d40bf53b527853240").value;
            gFormSaveDebug ='false';
            saveForm(true,'',0);
        },
        fileDownload(fileID)
        {
            gfileDownload(fileID,fileID + '.pdf');
        },
        setDataItem(k,v)
        {
            if(k=='submitform')
            {
                gFormSaveChk =true;
                gFormSaveDebug ='false';
                gFormSubmitGenPdf = false;
                saveForm(true,'',1);
                return;
            }
            this.dataitem[k]=v;
        },
        setSubmitComplete(m)
        {
            this.isView=true;
            this.hiddeReturn=true;
        },
        setFormNote(msg)
        {
            document.getElementById("form-action-note-msg").innerHTML=msg;
            document.getElementById("form-action-note").style.display="block";
        }
    },
    mounted() 
    {
        if("true"=="false")
        {
            this.showSave=false;
        }
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        if(mapPara['pageParam_newwin']&&mapPara['pageParam_newwin']=="1")
        {
            this.hiddeReturn=true;
        }
        if(mapPara['pageParam_wfmworklistid'])
        {
            this.dataitem.showreject=true;

            let paras = {};
            paras['wfmworklistid']=mapPara['pageParam_wfmworklistid'];
            var that = this;
            axios.post("./../api/wfmworkgetlist",paras).then(function(res){
            let wfmdatas=res.data;
            let mRejectNode = {};
            for(let item of wfmdatas)
            {
                if(item['ISOLD']=='0'&&item['COMPLETED']=='1')
                {
                    mRejectNode[item['WFMNODEID']+"|"+item['PSNID']]=item['PSNNAME']+"(" + item['PSNEMAIL'] + ")";
                }
            }

            let sReject = document.getElementById("selRejectNode1wzsoftcom38b8fff8ba34d83d40bf53b527853240");
            sReject.length=0
            sReject.add(new Option("Submitter",""));
            for( let key in mRejectNode)
            {
                sReject.add(new Option(mRejectNode[key],key));
            }

            }).catch(function (err) {
            });
        }
        else
        {
            this.dataitem.showreject=false;
        }
        window.setDataItemwzsoftcom38b8fff8ba34d83d40bf53b527853240 = this.setDataItem;
        window.gSetSubmitComplate = this.setSubmitComplete;
        window.gSetFormNote = this.setFormNote;
    }
}

if("1"=="1")
{
    Vue.createApp(ComVuewzsoftcom38b8fff8ba34d83d40bf53b527853240).mount('#form-actionwzsoftcom38b8fff8ba34d83d40bf53b527853240');
    document.getElementById("form-actionwzsoftcom38b8fff8ba34d83d40bf53b527853240").style.display="";
}
else
{
    Vue.createApp(ComVuewzsoftcom38b8fff8ba34d83d40bf53b527853240).mount('#form-actionMobilewzsoftcom38b8fff8ba34d83d40bf53b527853240');
    document.getElementById("form-actionMobilewzsoftcom38b8fff8ba34d83d40bf53b527853240").style.display="";
}

function onsubmitwzsoftcom38b8fff8ba34d83d40bf53b527853240()
{
    ;
}

function savedwzsoftcom38b8fff8ba34d83d40bf53b527853240()
{
    ;
}

function addFuncwzsoftcom38b8fff8ba34d83d40bf53b527853240()
{
    let f={};
    f['func'] = savedwzsoftcom38b8fff8ba34d83d40bf53b527853240;
    f['arg'] = null;
    gFormCallBacks['Added'].push(f);
}
