
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            dataitem:{"[@fieldname@]":""},
            fileContent:{},
            blnUpded:false,
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            filetypes:"[@filetypes@]"
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
            let p = document.getElementById("input[@configid@]").parentElement.parentElement;
            let pc = document.getElementById("input[@configid@]");

            if(k=="[@fieldname@]")
            {
                if(v==null||v=="")
                {
                    this.blnUpded=false;
                    return;
                }
                this.dataitem[k]=v;
                let simg = "<img height='[@imgheight@]' src='"+ './../upload/' + this.dataitem['[@fieldname@]'] +"' />";
                document.getElementById("img[@configid@]").innerHTML=simg;
                this.blnUpded=true;
                pc.style.display="block";
            }
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
            else if(k=='s#isview')
            {
                if(v!="noset")
                {
                    this.isView = v;
                }
                pc.style.display="block";
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
            if(fieldnoempty&&this.dataitem['[@fieldname@]']==""&&gFormSaveChk)
            {
                n=-1
                msg = "[@fieldtitle@]" + gMsgConstList['g_notempty_[@lan@]'] ;
            }

            if(n==-1)
            {
                if(gFormChkMsg)
                {
                    gFormChkMsg["[@fieldname@]"]=msg;
                }

                document.getElementById("valmsg[@configid@]").style.display="block";
                document.getElementById("valmsg[@configid@]").innerHTML=msg;
                return false;
            }
            else
            {
                gFormChkMsg["[@fieldname@]"]="";
                
                document.getElementById("valmsg[@configid@]").style.display="none";
                document.getElementById("valmsg[@configid@]").innerHTML="";
            }
            return true;
        },
        fileDelete()
        {
            this.dataitem['[@fieldname@]']="";
            this.blnUpded=false;
            this.$refs.clearFile.value = '';
            onchange[@configid@]();
        },
        fileUpload()
        {
            let file = document.getElementById("file[@configid@]").files[0];
            let fv = document.getElementById("file[@configid@]").value;
            fv = fv.substring(fv.indexOf(".")+1);
            fv = fv.toLowerCase();
            let arrf = this.filetypes.split(",");

            let blnCheck=false;
            for(let i=0;i<arrf.length;i++)
            {
                if(fv==arrf[i])
                {
                    blnCheck=true;
                    break;
                }
            }
            if(!blnCheck)
            {
                document.getElementById("valmsg[@configid@]").style.display="block";
                document.getElementById("valmsg[@configid@]").innerHTML=gMsgConstList['g_inp_file_[@lan@]'];
                return false;
            }

            let params = new FormData();
            params.append('file', file)
            that=this;
            axios({
                url: "./../[@pubtype@]api/uploadFile",
                method: "post",
                data: params,
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(function(res){
                that.fileContent=res.data; 
                that.dataitem['[@fieldname@]']= that.fileContent['filePath'];
                let simg = "<img height='[@imgheight@]' src='"+ './../upload/' + that.dataitem['[@fieldname@]'] +"' />";
                document.getElementById("img[@configid@]").innerHTML=simg;
                that.blnUpded=true; 
                onchange[@configid@]();

                }).catch(function (err) {
                });
        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.valDataItem[@configid@] = this.valDataItem;
    }
}

Vue.createApp(ComVue[@configid@]).mount('#input[@configid@]');

function onchange[@configid@]()
{
    window.valDataItem[@configid@]();
    [@onchange@]
}

