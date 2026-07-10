window.callback[@configid@]=null;
window.callbackpara[@configid@]=null;
var smode[@configid@]="";

function openWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("modalWin[@configid@]").style.display="block";
    document.getElementById("modalWinMsg[@configid@]").innerText=msg;
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
}

function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}

function pageName[@configid@]()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String).split(".");
    return c.slice(0, 1);

}

function genDateDiv[@configid@](dsname)
{
    try{
    new DatePicker[@configid@]('_DatePicker_demo'+dsname, {
        inputId: dsname,
        className: 'date-picker-wp',
        seprator: '-'
        });
    }
    catch(err)
    {
        alert(err);
    }
}

const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            viewcode:"[@viewcode@]",
            datas:[],
            dataitem:{},
            formshow:[@formshow@],
            isTree:false,
            treefirst:'[@treefirst@]',
            celltype:'[@celltype@]',
            orderField:"[@orderfield@]",
            sumfields:[@sumfields@],
            formfield:[@formfield@],
            selConfigs:[@selconfigs@],
            selDatas:{},
            returnmsg:'',
        }
    },
    methods: 
    {
        [@btnfunc@]
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
        },
        initSelDatas()
        {
            for(let item of this.selConfigs)
            {
                let viewcode = item['itemviewcode'];
                let pubtype = item['itempubtype'];
                let seltype = item['itemseltype'];
                let orderone = item['itemorderone'];
                let ordertwo = item['itemordertwo'];
                let orderfield = item['itemorderfield'];

                if(seltype=="1")
                {
                    if(orderone!="")
                        orderfield = orderone + "_" + ordertwo;
                    else
                        orderfield="";
                }
                this.getSelDatas(viewcode,orderfield,pubtype);
            }
        },
        getSelDatas(viewcode,orderField,pubtype) 
        {
            let paras = {};
            paras['viewCode']=viewcode;
            paras['curPage']=1;
            paras['pageItmes']=1000;

            let sf="[@big_showfield@]";
            paras['fieldsclient']="id,pid,[@big_valuefield@]," + sf.replace("|",",");
            
            if(orderField!="")
                paras['order_'+this.orderField]="";

            var that = this;
            axios.post("./../"+ pubtype +"api/datalist",paras).then(function(res){
                
            that.selDatas[viewcode]=Object.values(res.data)[0];   

            }).catch(function (err) {
            });
        },
        initCell(e,f,index,field)
        {
            if(f!=6||this.isView)
            {
                return;
            }
            let p=e.target;
            let objs = this.datas[index];
            initDateDiv[@configid@](p.id,objs,field);
        },
        formatStr(amount,fs) 
        {
            if(amount==null||amount=="")
            {
                return "";
            }

            let zeroFill =true;
            let thousandSeparator =",";
            let decimalPlaces=2

            if(fs==5)
            {
                decimalPlaces =6;
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
        },
        getDatas () 
        {
            if(this.viewcode=="")
                return;

            let paras = {};
            paras['viewCode']=this.viewcode;
            paras['curPage']=1;
            paras['pageItmes']=1000;

            if(this.orderField!="")
                paras['order_'+this.orderField]="";

            setPageParas(paras,mapPara);

            var that = this;
            axios.post("./../[@pubtype@]api/datalist",paras).then(function(res){
            
            // May already have been set
            if(that.datas.length==0)
            {
                that.datas=Object.values(res.data)[0];   
                that.dealCellDatasInit(); 
                onload[@configid@]();
            }

            }).catch(function (err) {
                alert(err);
            });
        },
        dealCellDatasInit()
        {
            let ditem = this.datas[0]
            if(ditem)
            {
                if(ditem.hasOwnProperty("ID")&&ditem.hasOwnProperty("PID"))
                {
                    this.isTree=true;
                    this.dealCellDatasDo();
                }
            }

            this.initDatasBlank();
        },
        initDatasBlank()
        {
            for(let di of this.datas)
            {
                for(let f of this.formfield)
                {
                    let fn = f["name"];
                    if(!di[fn])
                    {
                        di[fn]=""; 
                    }
                }
            }
        },
        dealCellDatasDo()
        {
            let pdatas = this.datas.filter(item=>item.PID==null||item.PID=="");
            let cdatas = [];
            for(let ditem of pdatas)
            {
                cdatas.push(ditem);
                this.dealCellDatasDoSub(cdatas,ditem,1);
            }
            this.datas=cdatas;
        },
        dealCellDatasDoSub(cdatas,ditem,i)
        {
            let pdatas = this.datas.filter(item=>item.PID==ditem['ID']);
            if(pdatas&&pdatas.length>0)
            {
                ditem['HASCHILD']=true;
                for(let ditem of pdatas)
                {
                    ditem[this.treefirst] = '　　'.repeat(i) + ditem[this.treefirst];
                    cdatas.push(ditem);
                    this.dealCellDatasDoSub(cdatas,ditem,i+1);
                }
            }
            else
            {
                ditem['HASCHILD']=false;
            }
        },
        sumCell(ditem,f)
        {
            if(f=="2"||f=="3"||f=="4"||f=="5")
            {
                for(let item in this.sumfields)
                {
                    this.sumCellSub(ditem,item);
                }
            }
            onchange[@configid@]();
        },
        sumCellSub(ditem,k)
        {
            if(this.isTree)
            {
                this.sumCellDo(ditem,k);
            }
            else
            {
                let sumtotal=0;
                for(let item of this.datas)
                {
                    if(item[k]&&item[k]!="")
                    {
                        sumtotal = gFloatAdd(sumtotal,Number(item[k]));
                    }
                }
                this.sumfields[k]=sumtotal;
            }
        },
        sumCellDo(ditem,k)
        {
            let t=0;
            if(ditem['PID']&&ditem['PID']!="")
            {
                let cdatas = this.datas.filter(item=>item.PID==ditem['PID']);
                for(let ditem of cdatas)
                {
                    if(ditem[k]&&ditem[k]!="")
                    {
                        t = gFloatAdd(t,Number(ditem[k]));
                    }
                }
                let pdatas = this.datas.filter(item=>item.ID==ditem['PID']);
                let pitem = pdatas[0];
                pitem[k] = t;
                this.sumCellDo(pitem,k);
            }
            else
            {
                let pdatas = this.datas.filter(item=>item.PID==null||item.PID=="");
                for(let ditem of pdatas)
                {
                    if(ditem[k]&&ditem[k]!="")
                    {
                        t = gFloatAdd(t,Number(ditem[k]));
                    }
                }
                this.sumfields[k]=t; 
            }
        },
        showItemHtml(d)
        {
            if(!d||d=="")
            {
                return "/";
            }
            return d;
        },
        openWinVue(msg,callback,callbackpara) 
        {
            openWin[@configid@](msg,callback,callbackpara);
        },
        addDatas() 
        {
            this.dataitem={};
            this.datas.push(this.dataitem);
        },
        delDatas(itemid) 
        {
            this.datas.splice(itemid,1);
            onchange[@configid@]();
        },
        moveUp(dindex) 
        {
            if(dindex>0)
            {
                let item = this.datas[dindex];
                this.datas[dindex]=this.datas[dindex-1];
                this.datas[dindex-1]=item; 
            }
        },
        moveDown(dindex) 
        {
            if(dindex<this.datas.length-1)
            {
                let item = this.datas[dindex];
                this.datas[dindex]=this.datas[dindex+1];
                this.datas[dindex+1]=item; 
            }
        },
        getDataItem(k) 
        {
            if(k=="listdata")
            {
                return this.datas;
            }
            else if(k=="sumdata")
            {
                return this.sumfields;
            }
            else if(k=="[@fieldname@]")
            {
                let p = {};
                p['DATAS']=this.datas;
                p['SUMFIELDS']=this.sumfields;
                return JSON.stringify(p);
            }
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            if(k=="listdata")
            {
                if(v)
                {
                    if(Object.prototype.toString.call(v) === '[object Array]')
                        this.datas=v;
                    else
                        this.datas=JSON.parse(v);
                    // Summary calculation
                    for(let ditem of this.datas)
                    {
                        this.sumCell(ditem,'2');
                    }
                    if(this.datas.length==0)
                    {
                        this.sumCell({},'2');
                    }
                }
            }
            else if(k=="sumdata")
            {
                this.sumfields=v;
            }
            else if(k=="[@fieldname@]")
            {
                if(v)
                {
                    let p = JSON.parse(v);
                    this.datas=p['DATAS'];
                    let ps = p['SUMFIELDS'];
                    for(let k in this.sumfields)
                    {
                        if(ps[k])
                        {
                            this.sumfields[k]=ps[k];
                        }
                    }
                    this.initDatasBlank();
                }
            }
            else if(k=='s#display')
            {
                this.formshow=v;
                let p = document.getElementById("datalist[@configid@]").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
            else if(k=='s#isview')
            {
                if(v!="noset")
                {
                    this.isView = v;
                }
            }
        },
        valDataItem()
        {
            let n=0;
            let msg="";
            if(!this.formshow)
            {
                return true;
            }
            let fieldnoempty = [@fieldnoempty@];

            if(fieldnoempty&&this.datas.length==0&&gFormSaveChk)
            {
                n=-1;
                msg = "[@fieldtitle@]" + gMsgConstList['g_notempty_[@lan@]'] ;
            }
            if(this.datas.length>[@itemmax@])
            {
                n=-1
                msg = "[@fieldtitle@][@msgitemmax@][@itemmax@]";
            }
            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["[@fieldname@]"]=msg;
                }
                document.getElementById("valmsg[@apptype@][@configid@]").style.display="block";
                document.getElementById("valmsg[@apptype@][@configid@]").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["[@fieldname@]"]="";
                document.getElementById("valmsg[@apptype@][@configid@]").style.display="none";
                document.getElementById("valmsg[@apptype@][@configid@]").innerHTML="";
            }
            return true;

        },
        valCell(dataitem,k,f,e)
        {
            let v = dataitem[k];
            if(!this.formshow||(!v))
            {
                return true;
            }

            let n=0;
            let msg="";
            let str=v.toString().trim();
            let fieldtypedb=f;

            if(str!="")
            {
                if(str.length>500)
                {
                    n=-1;
                    let msgobj = {"fname":"","flen":500};
                    msg = gMsgConstDeal('g_noexceed_[@lan@]',msgobj); 
                }

                if(fieldtypedb==2&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                        msg = gMsgConstList['g_inp_number_[@lan@]'];
                }
                else if(fieldtypedb==3&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+$/i);
                    if(n==-1)
                        msg = gMsgConstList['g_inp_integer_[@lan@]'];
                }
                else if(fieldtypedb==4&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                    {
                        msg = gMsgConstList['g_inp_amount_[@lan@]'];
                    }
                    else
                    {
                        let dn = str.indexOf(".");
                        let s = str.substring(dn);
                        if(dn>0&&s.length>3)
                        {
                            msg = gMsgConstList['g_inp_amount2_[@lan@]']
                            n=-1;
                        }
                    }
                }
                else if(fieldtypedb==5&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                    {
                        msg = gMsgConstList['g_inp_amount_[@lan@]'];
                    }
                    else
                    {
                        let dn = str.indexOf(".");
                        let s = str.substring(dn);
                        if(dn>0&&s.length>5)
                        {
                            msg = gMsgConstList['g_inp_amount4_[@lan@]'];
                            n=-1;
                        }
                    }
                } 
                else if(fieldtypedb==6&&n!=-1)
                {
                    str = str + " 00:00:00";
                    if(!this.checkDateTime(str))
                    {
                        n=-1;
                        msg = gMsgConstList['g_inp_date_[@lan@]'];
                    }
                } 
            }

            if(n==-1)
            {
                dataitem[k]="";
                document.getElementById("content-info[@apptype@][@configid@]").style.display="block";
                document.getElementById("content-info-msg[@apptype@][@configid@]").innerHTML=msg;
                //return false;
            }
            else
            {
                gFormChkMsg["[@fieldname@]"]="";
                document.getElementById("content-info[@apptype@][@configid@]").style.display="none";
                document.getElementById("content-info-msg[@apptype@][@configid@]").innerHTML="";
            }

            return true;
        },
        genCellID()
        {
            var guid = "";
            for (var i=1; i<=32; i++){
                var n = Math.floor(Math.random()*16.0).toString(16);
                guid +=   n;
                if((i==8)||(i==12)||(i==16)||(i==20))
                    guid += "";
            }
            return guid;
        },
        updSelCell(e,d,fr)
        {
            let p=e.target;
            let pv=p.options[p.selectedIndex].text;
            d[fr+'STXT'] = pv;
        },
        pushDataItem(k,v)
        {
            if(k=="listdata")
            {
                this.datas.push(v);
            }
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        this.getDatas();
        this.initSelDatas();
        window.setDataItem[@configid@] = this.setDataItem;
        window.getDataItem[@configid@] = this.getDataItem;
        window.valDataItem[@configid@] = this.valDataItem;
        window.pushDataItem[@configid@] = this.pushDataItem;
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

function onchange[@configid@]()
{
    [@onchange@]
}

function onload[@configid@]()
{
    [@onload@]
}

function initDateDiv[@configid@](id,objs,field)
{
    let dp = new DatePicker[@configid@]('_DatePicker_demo'+id, {
        inputId: id,
        className: 'date-picker-wp',
        seprator: '-',
        dataobj:objs,
        datafield:field,
        });
}

var DatePicker[@configid@] = function () {
    var $ = function (i)
    {
    return document.getElementById(i);
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
    this.dataobj=config.dataobj;
    this.datafield=config.datafield;
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
    this.dataobj[this.datafield]=this.el.value;
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
