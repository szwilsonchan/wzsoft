
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
    window.setDataItem[@configid@]('date',this.el.value);
    window.valDataItem[@configid@]();
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

    
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            fieldtypedb:'[@fieldtypedb@]',
            dataitem:{"[@fieldname@]":null,"date":"","time":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=='[@fieldname@]')
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
            let p = document.getElementById("input[@configid@]").parentElement.parentElement;
            let pc = document.getElementById("input[@configid@]");
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
                if(k=='[@fieldname@]'&&(v))
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
            str = this.getDataItem('[@fieldname@]');
            str = str.toString().trim();
            let fieldnoempty = [@fieldnoempty@];

            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "[@fieldtitle@]" + gMsgConstList['g_notempty_[@lan@]'] ;
            }
            if(str!="")
            {
                if(this.fieldtypedb=='1')
                    str = str + " 00:00:00";

                if(!this.checkDateTime(str))
                {
                    n=-1;
                    msg = gMsgConstList['g_inp_date_[@lan@]'] ;
                }
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["[@fieldname@]"]=msg;
                }
    
                document.getElementById("valmsg[@configid@]").style.display="block";
                document.getElementById("valmsg[@configid@]").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["[@fieldname@]"]="";
                
                document.getElementById("valmsg[@configid@]").style.display="none";
                document.getElementById("valmsg[@configid@]").innerHTML="";
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
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.valDataItem[@configid@] = this.valDataItem;

        initDateTimeDiv[@configid@]();

    }
}

Vue.createApp(ComVue[@configid@]).mount('#input[@configid@]');

function initDateTimeDiv[@configid@]()
{
    try{
        new DatePicker[@configid@]('_DatePicker_[@configid@]', {
            inputId: 'data[@configid@]',
            className: 'date-picker-wp',
            seprator: '-'
            });
    }
    catch(err)
    {
        alert(err);
    }
}

function onchange[@configid@]()
{
    window.valDataItem[@configid@]();
    [@onchange@]
}

function onblur[@configid@]()
{
    window.valDataItem[@configid@]();
}