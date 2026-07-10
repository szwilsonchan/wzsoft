gLan = "[@lan@]";
gFormSaveChk = [@savechk@];

const ComVue[@configid@] = 
{
    data() 
    {
        return {
            isView:false,
            hiddeReturn:false,
            showSave:true,
            dataitem:{"pdffile":null,"showreject":[@showreject@],"showpdf":[@showpdf@],"showsubmit":[@showsubmit@]}
        }
    },
    methods: 
    {
        submitForm()
        {
            gFormSaveChk = true;
            this.submitFormDo();
        },
        submitFormDo()
        {
            mapPara['globalParam_rejectNode'] = document.getElementById("selRejectNode[@apptype@][@configid@]").value;
            gFormSaveDebug ='[@isdebug@]';
            saveForm(true,'[@submitwfm@]',0);
        },
        fileDownload(fileID)
        {
            gfileDownload(fileID,fileID + '.pdf');
        },
        setDataItem(k,v)
        {
            if(k=='submitform')
            {
                gFormSaveChk =true;
                gFormSaveDebug ='[@isdebug@]';
                gFormSubmitGenPdf = [@submitgenpdf@];
                saveForm(true,'[@submitwfm@]',1);
                return;
            }
            this.dataitem[k]=v;
        },
        setSubmitComplete(m)
        {
            this.isView=true;
            this.hiddeReturn=true;
        },
        setFormNote(msg)
        {
            document.getElementById("form-action-note-msg").innerHTML=msg;
            document.getElementById("form-action-note").style.display="block";
        }
    },
    mounted() 
    {
        if("[@showsave@]"=="false")
        {
            this.showSave=false;
        }
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
        }
        if(mapPara['pageParam_newwin']&&mapPara['pageParam_newwin']=="1")
        {
            this.hiddeReturn=true;
        }
        if(mapPara['pageParam_wfmworklistid'])
        {
            this.dataitem.showreject=true;

            let paras = {};
            paras['wfmworklistid']=mapPara['pageParam_wfmworklistid'];
            var that = this;
            axios.post("./../api/wfmworkgetlist",paras).then(function(res){
            let wfmdatas=res.data;
            let mRejectNode = {};
            for(let item of wfmdatas)
            {
                if(item['ISOLD']=='0'&&item['COMPLETED']=='1')
                {
                    mRejectNode[item['WFMNODEID']+"|"+item['PSNID']]=item['PSNNAME']+"(" + item['PSNEMAIL'] + ")";
                }
            }

            let sReject = document.getElementById("selRejectNode[@apptype@][@configid@]");
            sReject.length=0
            sReject.add(new Option("[@submitpsn@]",""));
            for( let key in mRejectNode)
            {
                sReject.add(new Option(mRejectNode[key],key));
            }

            }).catch(function (err) {
            });
        }
        else
        {
            this.dataitem.showreject=false;
        }
        window.setDataItem[@configid@] = this.setDataItem;
        window.gSetSubmitComplate = this.setSubmitComplete;
        window.gSetFormNote = this.setFormNote;
    }
}

if("[@apptype@]"=="1")
{
    Vue.createApp(ComVue[@configid@]).mount('#form-action[@configid@]');
    document.getElementById("form-action[@configid@]").style.display="";
}
else
{
    Vue.createApp(ComVue[@configid@]).mount('#form-actionMobile[@configid@]');
    document.getElementById("form-actionMobile[@configid@]").style.display="";
}

function onsubmit[@configid@]()
{
    [@onsubmit@];
}

function saved[@configid@]()
{
    [@saved@];
}

function addFunc[@configid@]()
{
    let f={};
    f['func'] = saved[@configid@];
    f['arg'] = null;
    gFormCallBacks['Added'].push(f);
}