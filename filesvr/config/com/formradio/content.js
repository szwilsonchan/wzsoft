
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            viewdatas:[@datas@],
            dataitem:{"[@fieldname@]":""},
            curpage:1,
            topItems:[@topitems@],
            orderField:"[@orderfield@]",
            seldatatype:[@seldatatype@]
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=="seltext"||k=="[@fieldname@]STXT")
            {
                let v = this.dataitem["[@fieldname@]"];
                let STXT="";
                for(let item of this.viewdatas)
                {
                    if(item['[@big_valuefield@]']==v)
                    {
                        STXT = item['[@big_showfield@]'];
                        break;
                    }
                }
                this.dataitem["[@fieldname@]STXT"] = STXT;
                return this.dataitem["[@fieldname@]STXT"];
            }
            else if(k=="[@fieldname@]")
            {
                let v = this.dataitem["[@fieldname@]"];
                let idv = "";
                for(let item of this.viewdatas)
                {
                    if(item['[@big_valuefield@]']==v)
                    {
                        idv = v;
                        break;
                    }
                }
                this.dataitem["[@fieldname@]"] = idv;
                return this.dataitem["[@fieldname@]"];
            }
            else
            {
                return this.dataitem[k];
            }
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
            else if(k=='seltext')
            {
                this.dataitem["[@fieldname@]STXT"]=v;
                pc.style.display="block";
            }
            else
            {
                this.dataitem[k]=v;
                if(k=="[@fieldname@]")
                {
                    onchange[@configid@]();
                }
                pc.style.display="block";
            }
        },
        getDatas() 
        {
            if(this.seldatatype=='1')
                return;

            let paras = {};
            paras['viewCode']="[@viewcode@]";
            if(paras['viewCode']=="")
                return;
            paras['curPage']=1;
            paras['pageItmes']=1000;
            if(this.topItems>0)
                paras['topItems']=this.topItems;
            if(this.orderField!="")
                paras['order_'+this.orderField]="";

            paras['fieldsclient']="[@big_valuefield@],[@big_showfield@]";
            
            var that = this;
            axios.post("./../[@pubtype@]api/datalist",paras).then(function(res){
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
            if(this.dataitem.[@fieldname@])
                str = this.dataitem.[@fieldname@];
            str = str.toString().trim();
            let fieldnoempty = [@fieldnoempty@];
            if(fieldnoempty&&str==""&&gFormSaveChk)
            {
                n=-1
                msg = "[@fieldtitle@]" + gMsgConstList['g_notempty_[@lan@]'] ;
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
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        this.getDatas();
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

function changeLable[@configid@](e)
{
    let p=e.target.previousElementSibling;
    p.click();
}