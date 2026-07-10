
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            dataitem:{"form_cpacha":""}
        }
    },
    methods: 
    {
        changeCpacha()
        {
            document.getElementById("cpacha-img[@configid@]").src='./../user/getcpacha?vl=4&w=150&h=40&type=formCpacha&t=' + new Date().getTime();
        },
        getDataItem(k) 
        {
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            if(k=='s#isview')
            {
                if(v!="noset")
                {
                    this.isView = v;
                }
            }
            else
                this.dataitem[k]=v;
        },
        valDataItem()
        {
            if(!this.formshow||this.isView)
            {
                return true;
            }

            let n=0;
            let msg="";
            let str="";
            if(this.dataitem.form_cpacha)
                str = this.dataitem.form_cpacha;
            str = str.toString().trim();
            if(str=="")
            {
                n=-1;
                msg = "[@caption@]" + gMsgConstList['g_notempty_[@lan@]'] ;
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["form_cpacha"]=msg;
                }

                document.getElementById("valmsg[@configid@]").style.display="block";
                document.getElementById("valmsg[@configid@]").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["form_cpacha"]="";

                document.getElementById("valmsg[@configid@]").style.display="none";
                document.getElementById("valmsg[@configid@]").innerHTML="";
            }
            return true;

        },
        setView(v)
        {
            this.isView=v;
        },
        setEmpty(v)
        {
            if(v==true)
            {
                this.dataitem.form_cpacha="";
                this.changeCpacha();
            }
        }
    },
    mounted() 
    {
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.valDataItem[@configid@] = this.valDataItem;

        let funcview={};
        funcview['func'] = this.setView;
        funcview['arg'] = true;

        window.gFormCallBacks['InitDb'].push(funcview);
        window.gFormCallBacks['Added'].push(funcview);

    }
}

function onchange[@configid@]()
{
    window.valDataItem[@configid@]();
}

function onblur[@configid@]()
{
    window.valDataItem[@configid@]();
}

Vue.createApp(ComVue[@configid@]).mount('#input[@configid@]');
