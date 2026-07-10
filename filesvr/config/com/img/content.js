
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            dataitem:{"imgsrc":"[@imgsrc@]"},
            fileContent:{},
            titleshow:[@titleshow@],
            blnUpded:false
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
            if(k=="imgsrc")
            {
                this.dataitem[k]=v;
                let simg = "<img height='[@imgheight@]' src='"+ './../upload/' + this.dataitem['imgsrc'] +"' />";
                document.getElementById("img[@configid@]").innerHTML=simg;
                this.blnUpded=true;
                onchange[@configid@]();
            }
            if(k=='s#display')
            {
                let p = document.getElementById("input[@configid@]").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
        }
    },
    mounted() 
    {
        if(this.dataitem['imgsrc']!="")
        {
            this.setDataItem('imgsrc',this.dataitem['imgsrc']);
        }
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

