


function showMap[@configid@](ptitle,pcontent,posj,posw)
{
    var mymap = new BMapGL.Map('input[@configid@]');
    var point = new BMapGL.Point(posj,posw);
    mymap.centerAndZoom(point, 15);
    var opts = {
        width: 200,
        height: 100,
        title: ptitle
    };
    var infoWindow = new BMapGL.InfoWindow(pcontent, opts);
    mymap.openInfoWindow(infoWindow, point);
}

const ComVue[@configid@] = 
{
    data() 
    {
        return {
            dataitem:{"content":"[@titlecontent@]","title":"[@titlename@]","posj":"[@posj@]","posw":"[@posw@]"},
            fileContent:{},
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
            if(k=='s#display')
            {
                let p = document.getElementById("input[@configid@]").parentElement.parentElement;
                if(p&&v==true)
                    p.style.display="block";
                else
                    p.style.display="none";
            }
            else if(k=='s#refresh')
            {
                showMap[@configid@](this.dataitem['title'],this.dataitem['content'],this.dataitem['posj'],this.dataitem['posw']);
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
        showMap[@configid@](this.dataitem['title'],this.dataitem['content'],this.dataitem['posj'],this.dataitem['posw']);
    }
}

Vue.createApp(ComVue[@configid@]).mount('#input[@configid@]');


