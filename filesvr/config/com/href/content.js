
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            titleshow:[@titleshow@],
            dataitem:{"href":"[@href@]","hrefcontent":"[@hrefcontent@]"}
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
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
