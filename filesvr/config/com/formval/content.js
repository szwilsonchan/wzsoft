function closeInfoMsg[@configid@](e) 
{
    e.srcElement.parentElement.style.display="none";
}

const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:true,
        }
    },
    methods: 
    {
        setDataItem(k,v)
        {
            if(k=='s#display')
            {
                let p = document.getElementById("val-info[@configid@]");
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
        }
    },
    mounted() 
    {
        window.setDataItem[@configid@] = this.setDataItem;
    }
}

Vue.createApp(ComVue[@configid@]).mount('#val-info[@configid@]');