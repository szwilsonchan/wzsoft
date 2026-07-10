
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            titleshow:[@titleshow@],
            dataitem:{"content":""}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if(k=='content')
            {
                this.dataitem[k] = document.getElementById("label[@configid@]").innerHTML;
            }
            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
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
                if(k=='content')
                {
                    document.getElementById("label[@configid@]").innerHTML=v;
                }
                this.dataitem[k]=v;
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

function onclick[@configid@]()
{
    [@onclick@]
}
