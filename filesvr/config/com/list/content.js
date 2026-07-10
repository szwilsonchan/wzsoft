window.callback=null;
window.callbackpara=null;

function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}
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

const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            datas:[],
            datalabs:[@attrtitle@],
            thWidths:{[@thwidths@]}
        }
    },
    methods: 
    {
        [@btnfunc@]
        getDataItem(k) 
        {
            if(k=="listdata")
            {
                return this.datas;
            }
        },
        getThWidth(f)
        {
            if(this.thWidths[f])
            {
                return this.thWidths[f];
            }
        },
        setDataItem(k,v)
        {
            if(k=="listdata")
            {
                if(Object.prototype.toString.call(v) === '[object Array]')
                    this.datas=v;
                else
                    this.datas=JSON.parse(v);
            }
            if(k=='s#display')
            {
                let p = document.getElementById("datalist[@configid@]").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
        },
        pushDataItem(k,v)
        {
            if(k=="listdata")
            {
                this.datas.push(v);
            }
        },
        openWinVue(msg,callback,callbackpara) 
        {
            openWin[@configid@](msg,callback,callbackpara);
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        window.setDataItem[@configid@]=this.setDataItem;
        window.getDataItem[@configid@]=this.getDataItem;
        window.pushDataItem[@configid@]=this.pushDataItem;
    }
}

Vue.createApp(DataListVue[@configid@]).mount('#datalist[@configid@]');