var selType[@configid@]="[@seltype@]";

function selItemHide[@configid@]()
{
    let dnode = document.getElementById("divSelSearchs[@configid@]");
    dnode.style.display="none";
}
function selItemDel[@configid@](e)
{
    let p = e.srcElement.parentElement.parentElement.parentElement;
    if(p.parentElement.className=="divSelItems[@configid@]")
    {
        p.parentElement.removeChild(p);
        document.getElementById("inpSel[@configid@]").style.display="block";
        selItemValues[@configid@]();
    }

}
function selItemDo[@configid@](id,title,f,init)
{
    let d = document.createElement("div");
    d.className="selItemDiv";

    let s="";
    s = s + "<span class=\"action-content\" style=\"border:none;\"></span>";
    s = s + "<input type='hidden' />";

    if(f!="view")
    {
        let sa = "[@itemheight@]";
        if(sa.indexOf("px")>0)
        {
            sa=sa.replace("px","");
            sa = (parseInt(sa)-6) + 'px';
        }
        
        d.style.paddingLeft="15px";
        s = s + "<span class=\"action-content\" style=\"float:right;padding-top:2px;padding-right:5px;\" >";
        s = s + "<a href='#' style=\"float:right;height:"+ sa +";width:"+ sa +";\" onclick=\"selItemDel[@configid@](event);return false\" ><img width=\"66%\"  src=\"./imgs/del.png\"></a></span>";
    }
    else
    {
        d.style.border="none";
    }

    d.innerHTML=s;

    d.childNodes[0].innerHTML=title;
    d.childNodes[1].value=id;
    document.getElementById("divSelItems[@configid@]").appendChild(d);
    document.getElementById("divSelItems[@configid@]").style.display="block";
    document.getElementById("divSelSearchs[@configid@]").style.display="none";

    if(selType[@configid@]=="1")
    {
        document.getElementById("inpSel[@configid@]").style.display="none";
    }
    document.getElementById("inpSel[@configid@]").value="";

    selItemValues[@configid@](init);

}
function selItemValues[@configid@](init)
{
    let ids="";
    let titles="";
    let ds = document.getElementById("divSelItems[@configid@]");
    for (let dNode of ds.childNodes) 
    {
        if(dNode.className == "selItemDiv")
        {
            let id = dNode.childNodes[1].value;
            let title = dNode.childNodes[0].innerHTML;
            id = id.replaceAll(",","&#44;");
            title = title.replaceAll(",","&#44;");
            ids=ids+id+",";
            titles=titles+title+",";
        }
    }

    if(ids.indexOf(","))
    {
        ids = ids.substring(0,ids.length-1);
        titles = titles.substring(0,titles.length-1);
    }

    window.setDataItemIn[@configid@]("[@fieldname@]",ids);
    window.setDataItemIn[@configid@]("[@fieldname@]STXT",titles);

    if(init!="true")
        onchange[@configid@]();

}
function selItemSearch[@configid@](e)
{
    let inp = e.target.value;
    //alert(inp);
    if(inp.length>=2)
    {
        let paras = {};
        paras['viewCode']="[@viewcode@]";
        paras['curPage']=1;
        paras['pageItmes']=100;
        paras['topItems']=3;
        paras['filter_searchkey_like']=inp;

        let sf="[@big_showfield@]";
        paras['fieldsclient']="[@big_valuefield@]," + sf.replace("|",",");
        
        axios.post("./../[@pubtype@]api/datalist",paras).then(function(res){
        redatas=Object.values(res.data)[0];

        let fields="[@big_showfield@]";
        arrf = fields.split("|");

        let str="";
        for (let item of redatas) 
        {
            let itemID = "";
            let itemTitle = "";
            let itemTitleSave = "";

            itemID = item["[@big_valuefield@]"]+"";
            itemTitleSave = item[arrf[0]];

            for(let i=0;i<arrf.length;i++)
            {
                itemTitle = itemTitle + item[arrf[i]]+ "|";
            }
            itemTitle = itemTitle.substring(0,itemTitle.length-1);

            itemID=itemID.replaceAll("'","\\'");
            itemTitle=itemTitle.replaceAll("'","\\'");
            itemTitle=itemTitle.replaceAll('"','&quot;');

            str = str + "<div class=\"selItemShow\" onclick=\"selItemDo[@configid@]('"+ itemID +"','"+ itemTitleSave +"','','false')\" ><span style=\"border:none\">"+ itemTitle +"</span>";
            str = str + "</div>";
        }
        let dnode = document.getElementById("divSelSearchs[@configid@]");
        if(str!="")
        {
            str = "<div class=\"selItemShow\" style=\"height:[@itemheight@];padding-bottom:8px;text-align:right\"><span class='searchclose[@configid@]' onclick=\"closeSearchDiv[@configid@](event)\">&Chi;</span></div>"+str;
        }
        dnode.innerHTML=str;
        dnode.style.display="block";

        }).catch(function (err) {
        });
    }
    else
        selItemHide[@configid@]();
}

function closeSearchDiv[@configid@](e)
{
    e.target.parentElement.parentElement.style.display="none";
}

const ComConfigVue[@configid@] = 
{
    data() 
    {
        return {
            isView:[@isview@],
            titleshow:[@titleshow@],
            formshow:[@formshow@],
            viewdatas:null,
            dataitem:{"[@fieldname@]":"","[@fieldname@]STXT":""},
            curpage:1
        }
    },
    methods: 
    {
        getDataItem(k) 
        {
            if("[@caninput@]"=="true")
            {
                if(document.getElementById("inpSel[@configid@]").style.display!="none")
                    this.dataitem['[@fieldname@]STXT'] = document.getElementById("inpSel[@configid@]").value;
            }

            if(k=="seltext")
            {
                return this.dataitem['[@fieldname@]STXT'];
            }

            return this.dataitem[k];
        },
        setDataItem(k,v)
        {
            let p = document.getElementById("select[@configid@]").parentElement.parentElement;
            let pc = document.getElementById("select[@configid@]");
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
                    this.setDataItem('refreshdata','1');
                }
                pc.style.display="block";
            }
            else
            {
                if(k=="seltext")
                {
                    this.dataitem['[@fieldname@]STXT']=v;
                }
                else
                    this.dataitem[k]=v;

                document.getElementById("divSelItems[@configid@]").innerHTML="";

                if(this.dataitem['[@fieldname@]']&&this.dataitem['[@fieldname@]']!=""&&this.dataitem['[@fieldname@]STXT'])
                {
                    let ids=this.dataitem['[@fieldname@]']+'';
                    let titles=this.dataitem['[@fieldname@]STXT'];
                    let arrids = ids.split(",");
                    let arrtitles = titles.split(",");
                    for(var i=0;i<arrids.length;i++)
                    {
                        if(this.isView)
                            selItemDo[@configid@](arrids[i],arrtitles[i],'view','[@noevent@]');
                        else
                            selItemDo[@configid@](arrids[i],arrtitles[i],'','[@noevent@]');
                    }
                    if(selType[@configid@]=="1")
                    {
                        document.getElementById("inpSel[@configid@]").style.display="none";
                    }
                }
                else
                {
                    if("[@caninput@]"=="true")
                    {
                        document.getElementById("inpSel[@configid@]").style.display="block";
                        document.getElementById("inpSel[@configid@]").value=this.dataitem['[@fieldname@]STXT'];
                    }
                }
                pc.style.display="block";
            }
            
        },
        setDataItemIn(k,v)
        {
            this.dataitem[k]=v;
        },
        valDataItem()
        {
            if(!this.formshow)
            {
                return true;
            }
            
            let n=0;
            let msg="";
            let str="";
            if(this.dataitem.[@fieldname@])
                str = this.dataitem.[@fieldname@];

            if("[@caninput@]"=="true")
            {
                if(document.getElementById("inpSel[@configid@]").style.display!="none")
                {
                    str = document.getElementById("inpSel[@configid@]").value;
                }
            }

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

        }
    },
    mounted() 
    {
        this.setDataItem('s#display',[@formshow@]);
        if(mapPara['pageParam_view']&&mapPara['pageParam_view']=="1")
        {
            this.isView=true;
            document.getElementById("inpSel[@configid@]").style.display="none";
            document.getElementById("inpSel[@configid@]").readOnly =true;
        }
        window.getDataItem[@configid@] = this.getDataItem;
        window.setDataItem[@configid@] = this.setDataItem;
        window.setDataItemIn[@configid@] = this.setDataItemIn;
        window.valDataItem[@configid@] = this.valDataItem;
    }
}

Vue.createApp(ComConfigVue[@configid@]).mount('#select[@configid@]');

function onchange[@configid@]()
{
    window.valDataItem[@configid@]();
    [@onchange@]
}