
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            dbmobile:"",
            needmsgval:true,
            sendtimes:60,
            loopid:0,
            dataitem:{"[@fieldname@]":"","FORM_MSG_[@fieldname@]":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            return this.dataitem[k];
        },
        setDbmobile(v)
        {
            this.dbmobile = this.dataitem.[@fieldname@];
            if(this.dbmobile&&this.dbmobile!="")
            {
                this.needmsgval=false;
            }
            else
            {
                this.needmsgval=true; 
            }
        },
        setDataItem(k,v)
        {
            if(k=='s#display')
            {
                this.formshow=v;
                let p = document.getElementById("input[@configid@]").parentElement.parentElement;
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
            else if(k=='FORM_MSG_[@fieldname@]')
            {
                if(v)
                    this.dataitem[k]=v;
                else
                    this.dataitem[k]="";
            }
            else if(k=='[@fieldname@]')
            {
                this.dataitem[k]=v;
            }
            else
                this.dataitem[k]=v;
        },
        valDataItem()
        {
            if(!this.formshow)
            {
                return true;
            }

            if(this.dbmobile!=""&&this.dbmobile==this.dataitem.[@fieldname@])
            {
                this.needmsgval=false;
            }
            else
            {
                this.needmsgval=true;
            }

            if(!this.valMobile())
            {
                return false;
            }

            if(this.needmsgval)
            {
                let mobilemsg = this.dataitem.FORM_MSG_[@fieldname@];
                mobilemsg = mobilemsg.toString().trim();
                if(mobilemsg=="")
                {
                    document.getElementById("valmsgsub[@configid@]").style.display="block";
                    document.getElementById("valmsgsub[@configid@]").innerHTML= gMsgConstList['g_mobilesms_[@lan@]'];
                    return false;
                }
                else
                {
                    document.getElementById("valmsgsub[@configid@]").style.display="none";
                    document.getElementById("valmsgsub[@configid@]").innerHTML= "";
                    return true;
                }
            }

            return true;


        },
        valMobile()
        {
            let msg="";
            let str="";
            let n=0;
            if(this.dataitem.[@fieldname@])
                str = this.dataitem.[@fieldname@];
            str = str.toString().trim();
            let fieldtypedb=[@fieldtypedb@];
            let valtype=[@valtype@];
            let fieldlen=[@fieldlen@];

            if(str=="")
            {
                n=-1;
                msg = "[@fieldtitle@]" + gMsgConstList['g_notempty_[@lan@]'] ;
            }
            if(str!="")
            {
                if(str.length>fieldlen)
                {
                    n=-1;
                    let msgobj = {"fname":"[@fieldtitle@]","flen":fieldlen};
                    msg = gMsgConstDeal('g_noexceed_[@lan@]',msgobj);
                }

                if(valtype==1&&n!=-1)
                {
                    regx = "[@regxlbl@]";
                    if(regx!="a")
                    {
                        n= str.search(/[@regxlbl@]/i);
                        if(n==-1)
                            msg = gMsgConstList['g_inp_errv_[@lan@]']
                    }
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
        sendMsg(e) 
        {
            if(!this.valMobile())
            {
                return;
            }

            let paras = {};
            paras['mobile']=this.dataitem.[@fieldname@];
            paras['lan']="[@lan@]";
            var that = this;
            axios.post("./../user/getmobilemsgchk",paras).then(function(res){
            let r =res.data;    
            if(r['msg']!="")
            {
                document.getElementById("valmsg[@configid@]").style.display="block";
                document.getElementById("valmsg[@configid@]").innerHTML=r['msg'];
            } 
            else
            {
                document.getElementById("valmsgsub[@configid@]").style.display="block";
                document.getElementById("valmsgsub[@configid@]").innerHTML=gMsgConstList['g_mobilesend_[@lan@]']+that.dataitem.[@fieldname@];

                let p = e.target;
                p.disabled=true;
                that.loopid = setInterval(that.showTimes,1000,p);
            }

            }).catch(function (err) {
            });
        },
        showTimes(p) 
        {
            if(this.sendtimes==0)
            {
                clearInterval(this.loopid);
                p.disabled=false;
                p.innerHTML="[@captionsend@]";
                this.sendtimes=60;
                return;
            }
            p.innerHTML=this.sendtimes+"S";
            this.sendtimes=this.sendtimes-1;
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

        let func={};
        func['func'] = this.setDbmobile;
        func['arg'] = null;

        window.gFormCallBacks['InitDb'].push(func);
    }
}

Vue.createApp(ComVue[@configid@]).mount('#input[@configid@]');

function onchange[@configid@]()
{
    window.valDataItem[@configid@]();
    [@onchange@]
}

function onblur[@configid@]()
{
    window.valDataItem[@configid@]();
}

function msgonchange[@configid@]()
{
    window.valDataItem[@configid@]();
}

function msgonblur[@configid@]()
{
    window.valDataItem[@configid@]();
}