
const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            dataitem:{"[@fieldname@]":""},
            fileContent:{},
            blnUpded:false
        }
    },
    methods: 
    {
        valDataItem()
        {
            if(!this.formshow)
            {
                return true;
            }
            
            let n=0;
            let msg="";
            this.getDataItem("[@fieldname@]");
            let str="";
            if(this.dataitem.[@fieldname@])
                str = this.dataitem.[@fieldname@];
            str = str.toString().trim();
            let fieldnoempty = [@fieldnoempty@];
            if(fieldnoempty&&str==""&&gFormSaveChk)
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
        getDataItem(k) 
        {
            if(k=="[@fieldname@]")
            {
                let iw = document.getElementById('editorIframe[@configid@]').contentWindow;
                let v = iw.getEditerValue();
                this.dataitem[k] = v;
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
            else if(k=='s#isview')
            {
                if(v!="noset")
                {
                    this.isView = v;
                }
                pc.style.display="block";
            }
            else
            {
                this.dataitem[k]=v;
                let iframe = document.getElementById("editorIframe[@configid@]");
                iframe.src="editor.html?height=[@styleheight@]";
                if (iframe.attachEvent)
                {
                    iframe.attachEvent("onload", setWin1[@configid@]);
                    } else {
                    iframe.onload = setWin2[@configid@];
                }
                pc.style.display="block";
            }

        },
        setWin1()
        {
            let iw = document.getElementById('editorIframe[@configid@]').contentWindow;
            iw.setEditerValue(this.dataitem["[@fieldname@]"]);
            document.getElementById("editorIframe[@configid@]").detachEvent("onload", setWin1);
        },
        setWin2()
        {
            let iw = document.getElementById('editorIframe[@configid@]').contentWindow;
            iw.setEditerValue(this.dataitem["[@fieldname@]"]);
            document.getElementById("editorIframe[@configid@]").onload=null;
        },
        fileDelete()
        {
            this.fileContent={};
            this.blnUpded=false;
            this.$refs.clearFile.value = '';
        },
        fileDownload()
        {
            that=this;
            axios({
                url: './../api/downloadFile',
                method: 'POST',
                data:{"fileGuid":that.fileContent['fileGUID']},
                responseType: 'blob', // important
            }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', that.fileContent['fileName']);
                document.body.appendChild(link);
                link.click();
            });
        },
        getfileContent()
        {
            if(this.blnUpded)
                return this.fileContent;
        },
        fileUpload()
        {
            let file = document.getElementById("file[@configid@]").files[0];
            let fv = document.getElementById("file[@configid@]").value;
            fv = fv.substring(fv.indexOf(".")+1);

            let params = new FormData();
            params.append('file', file)
            that=this;
            axios({
                url: "./../api/uploadFile",
                method: "post",
                data: params,
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(function(res){
                that.fileContent=res.data;    
                that.blnUpded=true; 

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
        window.setWin1[@configid@] = this.setWin1;
        window.setWin2[@configid@] = this.setWin2;
        window.getfileContent[@configid@] = this.getfileContent;
    }
}

Vue.createApp(ComVue[@configid@]).mount('#input[@configid@]');


function varSelShowFile[@configid@](e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDiv")
        {
            dNode.style.display="block";
            break;
        }
    }
}

function closeAdd[@configid@](e)
{
    let p = e.target;
    p.parentElement.style.display="none"
}
function varSelAdd[@configid@](e)
{
    let k,v;
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varSelValue")
        {
            v=dNode.options[dNode.selectedIndex].text;
            k=dNode.options[dNode.selectedIndex].value;
            k=k.toLowerCase();
            let iw = document.getElementById('editorIframe[@configid@]').contentWindow;
            iw.setDataTag('[@'+k+'@]');
        }
    }

}

function fileAdd[@configid@](e)
{
    let f = window.getfileContent[@configid@]();
    let s = "<a href=\"./../upload/"+ f['filePath'] +"\">"+ f['fileName']  +"</a>";
    let iw = document.getElementById('editorIframe[@configid@]').contentWindow;
    iw.setDataTag(s);
}

function imgAdd[@configid@](e)
{
    let f = window.getfileContent[@configid@]();
    let s = "<img src=\"./../upload/"+ f['filePath'] +"\">";
    let iw = document.getElementById('editorIframe[@configid@]').contentWindow;
    iw.setDataTag(s);
}