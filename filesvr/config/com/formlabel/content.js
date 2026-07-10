
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            dataitem:{"[@fieldname@]":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=='[@fieldname@]')
            {
                this.dataitem[k] = document.getElementById("label[@configid@]").innerHTML;
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
            else
            {
                if(k=='[@fieldname@]')
                {
                    document.getElementById("label[@configid@]").innerHTML=v;
                }
                this.dataitem[k]=v;
                pc.style.display="block";
            }
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

function onchange[@configid@]()
{
    [@onchange@]
}
