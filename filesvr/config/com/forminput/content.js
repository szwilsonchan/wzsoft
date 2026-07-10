
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            dataitem:{"[@fieldname@]":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            let fieldtypedb=[@fieldtypedb@];
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
            if(this.dataitem.[@fieldname@])
                str = this.dataitem.[@fieldname@];
            str = str.toString().trim();
            let fieldtypedb=[@fieldtypedb@];
            let valtype=[@valtype@];
            let fieldlen=[@fieldlen@];
            let fieldnoempty = [@fieldnoempty@];

            if(fieldnoempty&&str==""&&gFormSaveChk)
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
                        msg = gMsgConstList['g_inp_integer_[@lan@]']
                }
                else if(fieldtypedb==4&&n!=-1)
                {
                    n= str.search(/^(\-)?\d+(\.\d+)?$/i);
                    if(n==-1)
                    {
                        msg = gMsgConstList['g_inp_amount_[@lan@]']
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
                        msg = gMsgConstList['g_inp_amount_[@lan@]']
                    }
                    else
                    {
                        let dn = str.indexOf(".");
                        let s = str.substring(dn);
                        if(dn>0&&s.length>5)
                        {
                            msg = gMsgConstList['g_inp_amount4_[@lan@]']
                            n=-1;
                        }
                    }
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
        dealValue(v)
        {
            let fieldtypedb=[@fieldtypedb@];
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
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.valDataItem[@configid@] = this.valDataItem;
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