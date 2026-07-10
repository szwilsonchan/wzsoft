
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
            selIds:[],
            selTexts:[],
            curpage:1,
            topItems:[@topitems@],
            orderField:"[@orderfield@]",
            seldatatype:[@seldatatype@]
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
            onchange[@configid@]();
        },
        getSelTexts()
        {
            this.selTexts=[];
            let selIdsSub = [];
            for(let val of this.viewdatas)
            {
                for(let item of this.selIds)
                {
                    if(val['[@big_valuefield@]']==item)
                    {
                        let st = val['[@big_showfield@]'];
                        this.selTexts.push(st);
                        selIdsSub.push(item);
                    }
                }

            }
            this.selIds = selIdsSub;
            this.dataitem['[@fieldname@]']=this.selIds.join(",");
            this.dataitem['[@fieldname@]STXT']=this.selTexts.join(",");
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
        getDataItem(k) 
        {
            if(k=="[@fieldname@]")
            {
                this.getSelTexts();
                return this.dataitem['[@fieldname@]'];
            }
            else if(k=="seltext"||k=="[@fieldname@]STXT")
            {
                return this.dataitem['[@fieldname@]STXT'];
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
            if(k=="[@fieldname@]"&&v)
            {
                v=v.toString();
                let a=v.split(",");
                this.selIds=a;
                /*
                this.getSelTexts(); */
                [@onchange@];
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
                this.dataitem["[@fieldname@]STXT"]=v;
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

function changeLable[@configid@](e)
{
    let p=e.target.previousElementSibling;
    p.click();
}