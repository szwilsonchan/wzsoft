window.callback=null;
window.callbackpara=null;

function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}
const DataListVue[@configid@] = 
{
    data() 
    {
        return {
            datas:[],
            pkeyvalue:"",
            valuefield:'[@valuefield@]',
            isshow:true
        }
    },
    methods: 
    {
        itemclick(d) 
        {
            this.pkeyvalue = d['[@pkey@]'];
            mapPara["dataitem"] = d;
            let dataitem = d;
            [@listcode@];
        },
        dealitem(data) 
        {
            let arrf = this.valuefield.split("|");
            let itemTitle="";
            let vfspan = "[@vfspan@]";
            for(let i=0;i<arrf.length;i++)
            {
                itemTitle = itemTitle + data[arrf[i]]+ vfspan;
            }
            itemTitle = itemTitle.substring(0,itemTitle.length-vfspan.length);
            return itemTitle;
        },
        showfolder() 
        {
            if(this.isshow)
                this.isshow=false;
            else
                this.isshow=true; 
        },
        getDataItem(k) 
        {
            if(k=="listdata")
            {
                return JSON.stringify(this.datas);
            }
        },
        setDataItem(k,v)
        {
            if(k=="listdata")
            {
                if(mapPara["globalParam_folderFilter"]==true)
                {
                    return;
                }
                this.pkeyvalue="";
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