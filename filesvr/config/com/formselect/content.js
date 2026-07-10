const ComConfigVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            viewdatas:null,
            dataitem:{"[@fieldname@]":""},
            curpage:1,
            topItems:[@topitems@],
            orderField:"[@orderfield@]",
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
            else if(k=="seltext"||k=="[@fieldname@]STXT")
            {
                let sIndex = document.getElementById("selvalue[@configid@]").selectedIndex;
                let sText = "";
                if(sIndex>=0)
                    sText = document.getElementById("selvalue[@configid@]").options[sIndex].text;
                return sText;
            }
            else if(k=="[@fieldname@]")
            {
                return this.dataitem['[@fieldname@]'];
            }
            else
            {
                return this.dataitem[k];
            }
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("select[@configid@]").parentElement.parentElement;
            let pc = document.getElementById("select[@configid@]");
            if(k=="listdata")
            {
                if(v)
                {
                    if(Object.prototype.toString.call(v) === '[object Array]')
                        this.viewdatas=v;
                    else
                        this.viewdatas=JSON.parse(v);
                
                    if('[@setfirst@]'=='true')
                    {
                        for(let item of this.viewdatas)
                        {
                            this.dataitem['[@fieldname@]']=item['[@big_valuefield@]'];
                            this.dataitem['[@fieldname@]STXT']=item['[@big_showfield@]'];
                            setTimeout(onchange[@configid@],50);
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
            
            if('[@setfirst@]'=='true')
            {
                for(let item of that.viewdatas)
                {
                    that.dataitem['[@fieldname@]']=item['[@big_valuefield@]'];
                    that.dataitem['[@fieldname@]STXT']=item['[@big_showfield@]'];
                    setTimeout(onchange[@configid@],50);
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

        }
    },
    mounted() 
    {
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.pushDataItem[@configid@] = this.pushDataItem;
        window.valDataItem[@configid@] = this.valDataItem;

        this.setDataItem('s#display',[@formshow@]);
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

Vue.createApp(ComConfigVue[@configid@]).mount('#select[@configid@]');

function onchange[@configid@]()
{
    window.valDataItem[@configid@]();
    [@onchange@];
}