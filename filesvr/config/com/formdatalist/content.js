window.callback[@configid@]=null;
window.callbackpara[@configid@]=null;

function getForm[@configid@]()
{
    var valmsgglobal="";
    var valn=1;
    [@getsubmitvaluefromcom@]
    [@valcodes@]
    if((typeof(valmsgglobal) == "undefined"||valmsgglobal=="")&&valn==1)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function setForm[@configid@](isview)
{
    [@setvaluetocom@]
}

function openWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("modalWin[@configid@]").style.display="block";
    document.getElementById("modalWinMsg[@configid@]").innerText=msg;
    window.callback[@configid@]=callback;
    window.callbackpara[@configid@]=callbackpara;
}
function openUpdWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("updWin[@configid@]").style.display="block";
    window.callback[@configid@]=callback;
    window.callbackpara[@configid@]=callbackpara;
}
function openAddWin[@configid@](msg,callback,callbackpara) 
{
    document.getElementById("coverWin[@configid@]").style.display="block";
    document.getElementById("updWin[@configid@]").style.display="block";
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
    document.getElementById("updWin[@configid@]").style.display="none";

    gFormSaveChk=gFormSaveChkSub;
    gFormSaveChkSub=true;
}

function initFormDatasJS[@configid@](dataitem)
{
    mapPara['dataitem']=dataitem;
    [@initformdatas@]
}

const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            datas:[],
            formshow:[@formshow@],
            dataitem:{"[@fieldname@]":""},
            datalabs:{[@attrtitle@]}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=="listdata")
            {
                return this.datas;
            }
            else if(k=="[@fieldname@]")
            {
                return JSON.stringify(this.datas);
            }

            let v = this.dataitem[k];
            return v;

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
                }
                else
                    this.datas=[];
            }
            else if(k=="[@fieldname@]") // What if subform field name matches list?
            {
                if(v)
                {
                    if(Object.prototype.toString.call(v) === '[object Array]')
                        this.datas=v;
                    else
                        this.datas=JSON.parse(v);
                }
                else
                    this.datas=[];
            }
            if(k=='s#display')
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
                    if(v)
                    {
                        document.getElementById("saveBtn[@configid@]").style.display="none"; 
                    }
                }
            }
            else
            {
                this.dataitem[k]=v;
            }
        },
        pushDataItem(k,v)
        {
            if(k=="listdata")
            {
                this.datas.push(v);
            }
        },
        delDatas(itemid) 
        {
            this.datas.splice(itemid,1);
            onchange[@configid@]();
            closeWin[@configid@]();
        },
        updDatas(itemid) 
        {
            let v = getForm[@configid@]();
            if(v)
            {
                this.datas[itemid] = this.dataitem;
                onchange[@configid@]();
                closeWin[@configid@]();
            }
        },
        addDatas() 
        {
            if(getForm[@configid@]())
            {
                this.datas.push(this.dataitem);
                onchange[@configid@]();
                closeWin[@configid@]();
            }
        },
        openWinVue(msg,callback,callbackpara) 
        {
            openWin[@configid@](msg,callback,callbackpara);
        },
        openUpdWinVue(msg,callback,callbackpara) 
        {
            this.dataitem=gcopyobj(this.datas[callbackpara]);
            setForm[@configid@](this.isView);
            initFormDatasJS[@configid@](this.dataitem);

            gFormSaveChkSub=gFormSaveChk;
            gFormSaveChk=true;
            openUpdWin[@configid@](msg,callback,callbackpara);
        },
        openAddWinVue(msg,callback,callbackpara) 
        {
            this.dataitem={};
            setForm[@configid@]();
            initFormDatasJS[@configid@](this.dataitem);

            gFormSaveChkSub=gFormSaveChk;
            gFormSaveChk=true;
            openAddWin[@configid@](msg,callback,callbackpara);
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
        valDataItem()
        {
            if(!this.formshow)
            {
                return true;
            }

            let n=0;
            let msg="";
            let fieldnoempty = [@fieldnoempty@];
            if(fieldnoempty&&this.datas.length==0&&gFormSaveChk)
            {
                n=-1
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

        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        if(this.isView==true)
        {
            document.getElementById("saveBtn[@configid@]").style.display="none"; 
        }
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.pushDataItem[@configid@] = this.pushDataItem;
        window.valDataItem[@configid@] = this.valDataItem;
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
    window.valDataItem[@configid@]();
    [@onchange@]
}
