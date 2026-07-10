;if("Role".indexOf("@btntitlesel@")>0)
{
    document.getElementById("intLogout").value="Role";
}
;    const MenuVuewzsoftcom6ef1c8a5919e408c889ce2c9df6eb8bb = 
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
                    document.getElementById("menu-contentwzsoftcom6ef1c8a5919e408c889ce2c9df6eb8bb").style.display="block";

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
                    document.getElementById("menu-contentwzsoftcom6ef1c8a5919e408c889ce2c9df6eb8bb").style.display="block";

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
    
    Vue.createApp(MenuVuewzsoftcom6ef1c8a5919e408c889ce2c9df6eb8bb).mount('#menu-contentwzsoftcom6ef1c8a5919e408c889ce2c9df6eb8bb');
    
;
const ComVuewzsoftcom4ab99babc57d44a58db81cc9e3e71a96 = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            dataitem:{"WKCON":""}
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
            let p = document.getElementById("inputwzsoftcom4ab99babc57d44a58db81cc9e3e71a96").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcom4ab99babc57d44a58db81cc9e3e71a96");
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
            if(this.dataitem.WKCON)
                str = this.dataitem.WKCON;
            str = str.toString().trim();
            let fieldtypedb=1;
            let valtype=0;
            let fieldlen=100;
            let fieldnoempty = true;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1;
                msg = "WorkContent" + gMsgConstList['g_notempty_e'] ;
            }
            if(str!="")
            {
                if(str.length>fieldlen)
                {
                    n=-1;
                    let msgobj = {"fname":"WorkContent","flen":fieldlen};
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
                    gFormChkMsg["WKCON"]=msg;
                }

                document.getElementById("valmsgwzsoftcom4ab99babc57d44a58db81cc9e3e71a96").style.display="block";
                document.getElementById("valmsgwzsoftcom4ab99babc57d44a58db81cc9e3e71a96").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["WKCON"]="";

                document.getElementById("valmsgwzsoftcom4ab99babc57d44a58db81cc9e3e71a96").style.display="none";
                document.getElementById("valmsgwzsoftcom4ab99babc57d44a58db81cc9e3e71a96").innerHTML="";
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
        window.getDataItemwzsoftcom4ab99babc57d44a58db81cc9e3e71a96 = this.getDataItem;
        window.setDataItemwzsoftcom4ab99babc57d44a58db81cc9e3e71a96 = this.setDataItem;
        window.valDataItemwzsoftcom4ab99babc57d44a58db81cc9e3e71a96 = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcom4ab99babc57d44a58db81cc9e3e71a96).mount('#inputwzsoftcom4ab99babc57d44a58db81cc9e3e71a96');

function onchangewzsoftcom4ab99babc57d44a58db81cc9e3e71a96()
{
    window.valDataItemwzsoftcom4ab99babc57d44a58db81cc9e3e71a96();
    
}

function onblurwzsoftcom4ab99babc57d44a58db81cc9e3e71a96()
{
    window.valDataItemwzsoftcom4ab99babc57d44a58db81cc9e3e71a96();
}
;
var DatePickerwzsoftcomc853ac8c10359a9bd3087e561d73ac24b = function () {
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
    for (var i=0; i<D._fc(); i++ ) con.push('<td class="handwzsoftcomc853ac8c10359a9bd3087e561d73ac24b" onclick="'+this.n+'.fillInput('+year+', '+month+', '+(i+1)+')">'+(i+1)+'</td>');
    var toend = con.length%7;
    if (toend != 0) for (var i=0; i<7-toend; i++) con.push('<td class="noborder"> </td>');
    _html += '<tr>'+fn("-1, null", "<<")+fn("null, -1", "<")+'<td title="'+this.n+'DatePicker" colspan=3 class="strongwzsoftcomc853ac8c10359a9bd3087e561d73ac24b">'+year+'/'+month+'/'+date+'</td>'+fn("null, 1", ">")+fn("1, null", ">>")+'</tr>';
    for (var i=0; i<con.length; i++) _html += (i==0 ? '<tr>' : i%7==0 ? '</tr><tr>' : '') + con[i] + (i == con.length-1 ? '</tr>' : '');
    !!this.box ? this.box.innerHTML = _html : this.createBox(_html);
    },
    fillInput : function (y, m, d) {
    var s = this.config.seprator || '/';
    this.el.value = y + s + m + s + d;
    window.setDataItemwzsoftcomc853ac8c10359a9bd3087e561d73ac24b('date',this.el.value);
    window.valDataItemwzsoftcomc853ac8c10359a9bd3087e561d73ac24b();
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

    
const ComVuewzsoftcomc853ac8c10359a9bd3087e561d73ac24b = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            fieldtypedb:'1',
            dataitem:{"LOGDATE":null,"date":"","time":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=='LOGDATE')
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
            let p = document.getElementById("inputwzsoftcomc853ac8c10359a9bd3087e561d73ac24b").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcomc853ac8c10359a9bd3087e561d73ac24b");
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
                if(k=='LOGDATE'&&(v))
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
            str = this.getDataItem('LOGDATE');
            str = str.toString().trim();
            let fieldnoempty = true;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "Date" + gMsgConstList['g_notempty_e'] ;
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
                    gFormChkMsg["LOGDATE"]=msg;
                }
    
                document.getElementById("valmsgwzsoftcomc853ac8c10359a9bd3087e561d73ac24b").style.display="block";
                document.getElementById("valmsgwzsoftcomc853ac8c10359a9bd3087e561d73ac24b").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["LOGDATE"]="";
                
                document.getElementById("valmsgwzsoftcomc853ac8c10359a9bd3087e561d73ac24b").style.display="none";
                document.getElementById("valmsgwzsoftcomc853ac8c10359a9bd3087e561d73ac24b").innerHTML="";
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
        window.getDataItemwzsoftcomc853ac8c10359a9bd3087e561d73ac24b = this.getDataItem;
        window.setDataItemwzsoftcomc853ac8c10359a9bd3087e561d73ac24b = this.setDataItem;
        window.valDataItemwzsoftcomc853ac8c10359a9bd3087e561d73ac24b = this.valDataItem;

        initDateTimeDivwzsoftcomc853ac8c10359a9bd3087e561d73ac24b();

    }
}

Vue.createApp(ComVuewzsoftcomc853ac8c10359a9bd3087e561d73ac24b).mount('#inputwzsoftcomc853ac8c10359a9bd3087e561d73ac24b');

function initDateTimeDivwzsoftcomc853ac8c10359a9bd3087e561d73ac24b()
{
    try{
        new DatePickerwzsoftcomc853ac8c10359a9bd3087e561d73ac24b('_DatePicker_wzsoftcomc853ac8c10359a9bd3087e561d73ac24b', {
            inputId: 'datawzsoftcomc853ac8c10359a9bd3087e561d73ac24b',
            className: 'date-picker-wp',
            seprator: '-'
            });
    }
    catch(err)
    {
        alert(err);
    }
}

function onchangewzsoftcomc853ac8c10359a9bd3087e561d73ac24b()
{
    window.valDataItemwzsoftcomc853ac8c10359a9bd3087e561d73ac24b();
    
}

function onblurwzsoftcomc853ac8c10359a9bd3087e561d73ac24b()
{
    window.valDataItemwzsoftcomc853ac8c10359a9bd3087e561d73ac24b();
}
;
const ComVuewzsoftcomca1ed8de214a5fe652ac04a2646919b03 = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            dataitem:{"WORKHOUR":""}
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
            let p = document.getElementById("inputwzsoftcomca1ed8de214a5fe652ac04a2646919b03").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcomca1ed8de214a5fe652ac04a2646919b03");
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
            if(this.dataitem.WORKHOUR)
                str = this.dataitem.WORKHOUR;
            str = str.toString().trim();
            let fieldtypedb=2;
            let valtype=0;
            let fieldlen=15;
            let fieldnoempty = true;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1;
                msg = "WorkHours" + gMsgConstList['g_notempty_e'] ;
            }
            if(str!="")
            {
                if(str.length>fieldlen)
                {
                    n=-1;
                    let msgobj = {"fname":"WorkHours","flen":fieldlen};
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
                    gFormChkMsg["WORKHOUR"]=msg;
                }

                document.getElementById("valmsgwzsoftcomca1ed8de214a5fe652ac04a2646919b03").style.display="block";
                document.getElementById("valmsgwzsoftcomca1ed8de214a5fe652ac04a2646919b03").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["WORKHOUR"]="";

                document.getElementById("valmsgwzsoftcomca1ed8de214a5fe652ac04a2646919b03").style.display="none";
                document.getElementById("valmsgwzsoftcomca1ed8de214a5fe652ac04a2646919b03").innerHTML="";
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
        window.getDataItemwzsoftcomca1ed8de214a5fe652ac04a2646919b03 = this.getDataItem;
        window.setDataItemwzsoftcomca1ed8de214a5fe652ac04a2646919b03 = this.setDataItem;
        window.valDataItemwzsoftcomca1ed8de214a5fe652ac04a2646919b03 = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcomca1ed8de214a5fe652ac04a2646919b03).mount('#inputwzsoftcomca1ed8de214a5fe652ac04a2646919b03');

function onchangewzsoftcomca1ed8de214a5fe652ac04a2646919b03()
{
    window.valDataItemwzsoftcomca1ed8de214a5fe652ac04a2646919b03();
    
}

function onblurwzsoftcomca1ed8de214a5fe652ac04a2646919b03()
{
    window.valDataItemwzsoftcomca1ed8de214a5fe652ac04a2646919b03();
}
;
const ComVuewzsoftcomcc63b8769c760d43525b5d0f4a0cd2659 = 
{
    data() 
    {
        return {
            isView:false,
            dataitem:{"FILEATT":""},
            fileContent:{},
            blnUpded:false,
            titleshow:true,
            formshow:true,
            filetypes:"gif,jpg,jpeg,png,pdf,doc,docx,xls,xlsx,csv,ppt,pptx"
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=="FILEATT")
            {
                return JSON.stringify(this.fileContent);
            }
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("inputwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659");
            if(k=="FILEATT")
            {
                if(v)
                {
                    this.fileContent=JSON.parse(v);
                    if(this.fileContent['fileGUID'])
                        this.blnUpded=true;
                }
                else
                {
                    this.fileContent={};
                    this.blnUpded=false; 
                }
                pc.style.display="block";
            }
            
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
            let fieldnoempty = false;
            if(fieldnoempty&&!this.fileContent['fileGUID']&&gFormSaveChk)
            {
                n=-1
                msg = "FileAttachment" + gMsgConstList['g_notempty_e'] ;
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["FILEATT"]=msg;
                }
 
                document.getElementById("valmsgwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").style.display="block";
                document.getElementById("valmsgwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["FILEATT"]="";
                
                document.getElementById("valmsgwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").style.display="none";
                document.getElementById("valmsgwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").innerHTML="";
            }
            return true;
        },
        fileDelete()
        {
            this.fileContent={};
            this.blnUpded=false;
            this.$refs.clearFile.value = '';
            onchangewzsoftcomcc63b8769c760d43525b5d0f4a0cd2659();
        },
        fileDownload()
        {
            that=this;
            axios({
                url: './../api/downloadFile',
                method: 'POST',
                data:{"fileGuid":that.fileContent['fileGUID']},
                responseType: 'blob', // important
              }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', that.fileContent['fileName']);
                document.body.appendChild(link);
                link.click();
              });
        },
        fileUpload()
        {
            let file = document.getElementById("filewzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").files[0];
            let fv = document.getElementById("filewzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").value;
            fv = fv.substring(fv.indexOf(".")+1);
            fv = fv.toLowerCase();
            let arrf = this.filetypes.split(",");

            let blnCheck=false;
            for(let i=0;i<arrf.length;i++)
            {
                if(fv==arrf[i])
                {
                    blnCheck=true;
                    break;
                }
            }
            if(!blnCheck)
            {
                document.getElementById("valmsgwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").style.display="block";
                document.getElementById("valmsgwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659").innerHTML=gMsgConstList['g_inp_file_e'];
                return false;
            }

            let params = new FormData();
            params.append('file', file)
            that=this;
            axios({
                url: "./../api/uploadFile",
                method: "post",
                data: params,
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(function(res){
                that.fileContent=res.data;    
                that.blnUpded=true; 
                onchangewzsoftcomcc63b8769c760d43525b5d0f4a0cd2659();

                }).catch(function (err) {
                });
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItemwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659 = this.getDataItem;
        window.setDataItemwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659 = this.setDataItem;
        window.valDataItemwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659 = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcomcc63b8769c760d43525b5d0f4a0cd2659).mount('#inputwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659');

function onchangewzsoftcomcc63b8769c760d43525b5d0f4a0cd2659()
{
    window.valDataItemwzsoftcomcc63b8769c760d43525b5d0f4a0cd2659();
    
}

;
const ComVuewzsoftcom35767560df644583b8ebc6479551366f = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            viewdatas:[{"CODE": "DEV", "NAME": "Development"}, {"CODE": "TEST", "NAME": "Testing"}, {"CODE": "MEET", "NAME": "Meeting"}, {"CODE": "DOC", "NAME": "Documentation"}, {"CODE": "SUP", "NAME": "Support"}],
            dataitem:{"WORKCAT":""},
            selIds:[],
            selTexts:[],
            curpage:1,
            topItems:0,
            orderField:"",
            seldatatype:1
        }
    },
    methods: 
    {
        checkedOneApp(Id) 
        {
            let idIndex = this.selIds.indexOf(Id)
            if (idIndex >= 0) {
            this.selIds.splice(idIndex, 1)
            } else {
            this.selIds.push(Id)
            }
            this.getSelTexts();
            onchangewzsoftcom35767560df644583b8ebc6479551366f();
        },
        getSelTexts()
        {
            this.selTexts=[];
            let selIdsSub = [];
            for(let val of this.viewdatas)
            {
                for(let item of this.selIds)
                {
                    if(val['CODE']==item)
                    {
                        let st = val['NAME'];
                        this.selTexts.push(st);
                        selIdsSub.push(item);
                    }
                }

            }
            this.selIds = selIdsSub;
            this.dataitem['WORKCAT']=this.selIds.join(",");
            this.dataitem['WORKCATSTXT']=this.selTexts.join(",");
        },
        getDatas() 
        {
            if(this.seldatatype=='1')
                return;

            let paras = {};
            paras['viewCode']="";
            if(paras['viewCode']=="")
                return;
            paras['curPage']=1;
            paras['pageItmes']=1000;
            if(this.topItems>0)
                paras['topItems']=this.topItems;
            if(this.orderField!="")
                paras['order_'+this.orderField]="";

            paras['fieldsclient']="CODE,NAME";
            
            var that = this;
            axios.post("./../api/datalist",paras).then(function(res){
            that.viewdatas=Object.values(res.data)[0];     
            }).catch(function (err) {
            });
        },
        getDataItem(k) 
        {
            if(k=="WORKCAT")
            {
                this.getSelTexts();
                return this.dataitem['WORKCAT'];
            }
            else if(k=="seltext"||k=="WORKCATSTXT")
            {
                return this.dataitem['WORKCATSTXT'];
            }
            else
            {
                return this.dataitem[k];
            }
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("inputwzsoftcom35767560df644583b8ebc6479551366f").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcom35767560df644583b8ebc6479551366f");
            if(k=="WORKCAT"&&v)
            {
                v=v.toString();
                let a=v.split(",");
                this.selIds=a;
                /*
                this.getSelTexts(); */
                ;
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
                this.dataitem["WORKCATSTXT"]=v;
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
            if(this.dataitem.WORKCAT)
                str = this.dataitem.WORKCAT;
            str = str.toString().trim();
            let fieldnoempty = true;
            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "Work Category" + gMsgConstList['g_notempty_e'] ;
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["WORKCAT"]=msg;
                }

                document.getElementById("valmsgwzsoftcom35767560df644583b8ebc6479551366f").style.display="block";
                document.getElementById("valmsgwzsoftcom35767560df644583b8ebc6479551366f").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["WORKCAT"]="";
                document.getElementById("valmsgwzsoftcom35767560df644583b8ebc6479551366f").style.display="none";
                document.getElementById("valmsgwzsoftcom35767560df644583b8ebc6479551366f").innerHTML="";
            }
            return true;

        },
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        this.getDatas();
        window.getDataItemwzsoftcom35767560df644583b8ebc6479551366f = this.getDataItem;
        window.setDataItemwzsoftcom35767560df644583b8ebc6479551366f = this.setDataItem;
        window.valDataItemwzsoftcom35767560df644583b8ebc6479551366f = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcom35767560df644583b8ebc6479551366f).mount('#inputwzsoftcom35767560df644583b8ebc6479551366f');

function onchangewzsoftcom35767560df644583b8ebc6479551366f()
{
    window.valDataItemwzsoftcom35767560df644583b8ebc6479551366f();
    
}

function changeLablewzsoftcom35767560df644583b8ebc6479551366f(e)
{
    let p=e.target.previousElementSibling;
    p.click();
}
;
const ComVuewzsoftcom21e376bd4a7a41cfa4aa0617596afc96 = 
{
    data() 
    {
        return {
            isView:false,
            titleshow:true,
            formshow:true,
            viewdatas:[{"CODE": "NORMAL", "NAME": "Normal"}, {"CODE": "OVERTIME", "NAME": "Overtime"}, {"CODE": "HOLIDAY", "NAME": "Holiday"}, {"CODE": "TRAINING", "NAME": "Training"}],
            dataitem:{"WORKTYPE":""},
            curpage:1,
            topItems:0,
            orderField:"",
            seldatatype:1
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=="seltext"||k=="WORKTYPESTXT")
            {
                let v = this.dataitem["WORKTYPE"];
                let STXT="";
                for(let item of this.viewdatas)
                {
                    if(item['CODE']==v)
                    {
                        STXT = item['NAME'];
                        break;
                    }
                }
                this.dataitem["WORKTYPESTXT"] = STXT;
                return this.dataitem["WORKTYPESTXT"];
            }
            else if(k=="WORKTYPE")
            {
                let v = this.dataitem["WORKTYPE"];
                let idv = "";
                for(let item of this.viewdatas)
                {
                    if(item['CODE']==v)
                    {
                        idv = v;
                        break;
                    }
                }
                this.dataitem["WORKTYPE"] = idv;
                return this.dataitem["WORKTYPE"];
            }
            else
            {
                return this.dataitem[k];
            }
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("inputwzsoftcom21e376bd4a7a41cfa4aa0617596afc96").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcom21e376bd4a7a41cfa4aa0617596afc96");
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
            else if(k=='seltext')
            {
                this.dataitem["WORKTYPESTXT"]=v;
                pc.style.display="block";
            }
            else
            {
                this.dataitem[k]=v;
                if(k=="WORKTYPE")
                {
                    onchangewzsoftcom21e376bd4a7a41cfa4aa0617596afc96();
                }
                pc.style.display="block";
            }
        },
        getDatas() 
        {
            if(this.seldatatype=='1')
                return;

            let paras = {};
            paras['viewCode']="";
            if(paras['viewCode']=="")
                return;
            paras['curPage']=1;
            paras['pageItmes']=1000;
            if(this.topItems>0)
                paras['topItems']=this.topItems;
            if(this.orderField!="")
                paras['order_'+this.orderField]="";

            paras['fieldsclient']="CODE,NAME";
            
            var that = this;
            axios.post("./../api/datalist",paras).then(function(res){
            that.viewdatas=Object.values(res.data)[0];     
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
            if(this.dataitem.WORKTYPE)
                str = this.dataitem.WORKTYPE;
            str = str.toString().trim();
            let fieldnoempty = true;
            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "Work Type" + gMsgConstList['g_notempty_e'] ;
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["WORKTYPE"]=msg;
                }
                document.getElementById("valmsgwzsoftcom21e376bd4a7a41cfa4aa0617596afc96").style.display="block";
                document.getElementById("valmsgwzsoftcom21e376bd4a7a41cfa4aa0617596afc96").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["WORKTYPE"]="";
                document.getElementById("valmsgwzsoftcom21e376bd4a7a41cfa4aa0617596afc96").style.display="none";
                document.getElementById("valmsgwzsoftcom21e376bd4a7a41cfa4aa0617596afc96").innerHTML="";
            }
            return true;

        },
    },
    mounted() 
    {
        this.setDataItem('s#display',true);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        this.getDatas();
        window.getDataItemwzsoftcom21e376bd4a7a41cfa4aa0617596afc96 = this.getDataItem;
        window.setDataItemwzsoftcom21e376bd4a7a41cfa4aa0617596afc96 = this.setDataItem;
        window.valDataItemwzsoftcom21e376bd4a7a41cfa4aa0617596afc96 = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcom21e376bd4a7a41cfa4aa0617596afc96).mount('#inputwzsoftcom21e376bd4a7a41cfa4aa0617596afc96');

function onchangewzsoftcom21e376bd4a7a41cfa4aa0617596afc96()
{
    window.valDataItemwzsoftcom21e376bd4a7a41cfa4aa0617596afc96();
    
}

function onblurwzsoftcom21e376bd4a7a41cfa4aa0617596afc96()
{
    window.valDataItemwzsoftcom21e376bd4a7a41cfa4aa0617596afc96();
}

function changeLablewzsoftcom21e376bd4a7a41cfa4aa0617596afc96(e)
{
    let p=e.target.previousElementSibling;
    p.click();
}
;function closeInfoMsgwzsoftcom1334986dd628443186786a1660d0ff6d(e) 
{
    e.srcElement.parentElement.style.display="none";
}

const ComVuewzsoftcom1334986dd628443186786a1660d0ff6d = 
{
    data() 
    {
        return {
            isView:true,
        }
    },
    methods: 
    {
        setDataItem(k,v)
        {
            if(k=='s#display')
            {
                let p = document.getElementById("val-infowzsoftcom1334986dd628443186786a1660d0ff6d");
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
        }
    },
    mounted() 
    {
        window.setDataItemwzsoftcom1334986dd628443186786a1660d0ff6d = this.setDataItem;
    }
}

Vue.createApp(ComVuewzsoftcom1334986dd628443186786a1660d0ff6d).mount('#val-infowzsoftcom1334986dd628443186786a1660d0ff6d');
function val_wzsoftcom1334986dd628443186786a1660d0ff6d(){ var tmpv='';;if(gvalnum(window.getDataItemwzsoftcomca1ed8de214a5fe652ac04a2646919b03('WORKHOUR'))>gvalnum('10')){tmpv=gvalnum('WorkHours no big than 10');;};;return gvalnum(tmpv);;;;return '';};
const ComVuewzsoftcom8df2361404f46494d379857f629db65f = 
{
    data() 
    {
        return {
            isView:true,
            titleshow:true,
            formshow:true,
            dataitem:{"PERFORMANCEPAY":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            let fieldtypedb=4;
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
            let p = document.getElementById("inputwzsoftcom8df2361404f46494d379857f629db65f").parentElement.parentElement;
            let pc = document.getElementById("inputwzsoftcom8df2361404f46494d379857f629db65f");
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
            if(this.dataitem.PERFORMANCEPAY)
                str = this.dataitem.PERFORMANCEPAY;
            str = str.toString().trim();
            let fieldtypedb=4;
            let valtype=0;
            let fieldlen=15;
            let fieldnoempty = false;

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1;
                msg = "PerformancePay" + gMsgConstList['g_notempty_e'] ;
            }
            if(str!="")
            {
                if(str.length>fieldlen)
                {
                    n=-1;
                    let msgobj = {"fname":"PerformancePay","flen":fieldlen};
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
                    gFormChkMsg["PERFORMANCEPAY"]=msg;
                }

                document.getElementById("valmsgwzsoftcom8df2361404f46494d379857f629db65f").style.display="block";
                document.getElementById("valmsgwzsoftcom8df2361404f46494d379857f629db65f").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["PERFORMANCEPAY"]="";

                document.getElementById("valmsgwzsoftcom8df2361404f46494d379857f629db65f").style.display="none";
                document.getElementById("valmsgwzsoftcom8df2361404f46494d379857f629db65f").innerHTML="";
            }
            return true;

        },
        dealValue(v)
        {
            let fieldtypedb=4;
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
        window.getDataItemwzsoftcom8df2361404f46494d379857f629db65f = this.getDataItem;
        window.setDataItemwzsoftcom8df2361404f46494d379857f629db65f = this.setDataItem;
        window.valDataItemwzsoftcom8df2361404f46494d379857f629db65f = this.valDataItem;
    }
}

Vue.createApp(ComVuewzsoftcom8df2361404f46494d379857f629db65f).mount('#inputwzsoftcom8df2361404f46494d379857f629db65f');

function onchangewzsoftcom8df2361404f46494d379857f629db65f()
{
    window.valDataItemwzsoftcom8df2361404f46494d379857f629db65f();
    
}

function onblurwzsoftcom8df2361404f46494d379857f629db65f()
{
    window.valDataItemwzsoftcom8df2361404f46494d379857f629db65f();
}
;gLan = "e";
gFormSaveChk = true;

const ComVuewzsoftcombabd33688f1241e69d85ca1e51784411 = 
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
            mapPara['globalParam_rejectNode'] = document.getElementById("selRejectNode1wzsoftcombabd33688f1241e69d85ca1e51784411").value;
            gFormSaveDebug ='false';
            saveForm(true,'219a9efffb5244f8adf2fbdf83907549',0);
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
                saveForm(true,'219a9efffb5244f8adf2fbdf83907549',1);
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

            let sReject = document.getElementById("selRejectNode1wzsoftcombabd33688f1241e69d85ca1e51784411");
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
        window.setDataItemwzsoftcombabd33688f1241e69d85ca1e51784411 = this.setDataItem;
        window.gSetSubmitComplate = this.setSubmitComplete;
        window.gSetFormNote = this.setFormNote;
    }
}

if("1"=="1")
{
    Vue.createApp(ComVuewzsoftcombabd33688f1241e69d85ca1e51784411).mount('#form-actionwzsoftcombabd33688f1241e69d85ca1e51784411');
    document.getElementById("form-actionwzsoftcombabd33688f1241e69d85ca1e51784411").style.display="";
}
else
{
    Vue.createApp(ComVuewzsoftcombabd33688f1241e69d85ca1e51784411).mount('#form-actionMobilewzsoftcombabd33688f1241e69d85ca1e51784411');
    document.getElementById("form-actionMobilewzsoftcombabd33688f1241e69d85ca1e51784411").style.display="";
}

function onsubmitwzsoftcombabd33688f1241e69d85ca1e51784411()
{
    ;
}

function savedwzsoftcombabd33688f1241e69d85ca1e51784411()
{
    ;
}

function addFuncwzsoftcombabd33688f1241e69d85ca1e51784411()
{
    let f={};
    f['func'] = savedwzsoftcombabd33688f1241e69d85ca1e51784411;
    f['arg'] = null;
    gFormCallBacks['Added'].push(f);
}
