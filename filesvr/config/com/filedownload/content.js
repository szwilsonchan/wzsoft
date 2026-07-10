
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            titleshow:[@titleshow@],
            dataitem:{"fileName":"[@fileName@]","fileGUID":"[@fileGUID@]"}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=="filecontent")
            {
                return this.dataitem;
            }
        },
        setDataItem(k,v)
        {
            if(k=="filecontent")
            {
                if(Object.prototype.toString.call(v) === '[object Object]')
                {
                    if(v!={})
                    {
                        this.dataitem['fileName']=v['fileName'];
                        this.dataitem['fileGUID']=v['fileGUID'];
                    }
                }
                else
                {
                    v=JSON.parse(v);
                    this.dataitem['fileName']=v['fileName'];
                    this.dataitem['fileGUID']=v['fileGUID'];
                }
            }
            if(k=='s#display')
            {
                let p = document.getElementById("input[@configid@]").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
            else
            {
                this.dataitem[k]=v;
            }
        },
        fileDownload()
        {
            document.location.href="./../upload/[@filePath@]";
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
    }
}

Vue.createApp(ComVue[@configid@]).mount('#input[@configid@]');
