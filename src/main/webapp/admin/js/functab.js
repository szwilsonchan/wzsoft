var dragborder="11";
var dragobj=null;
var gdivClassCode = ",selBtnDiv,";

document.addEventListener('dragstart', (e) => {
    dragborder = e.target.style.border
    dragobj = e.target;
}, false)

document.addEventListener('drag', (e) => {
    e.target.style.border = '1px dashed red'
})

document.addEventListener('dragend', (e) => {
    e.target.style.border = dragborder;
}, false)

function dealDivDrag(dc)
{
    dc.draggable=true;
    dc.addEventListener('dragenter', (e) => {
    }, false)

    dc.addEventListener('dragover', e => {
        e.preventDefault()
        let p = e.target.parentNode;
        let targetElement = e.target;
        if(gdivClassCode.indexOf("," +targetElement.className+ ",")>=0)
        {
            if(gdivClassCode.indexOf("," +dragobj.className+ ",")>=0)
            {
                if(dragobj.nextSibling===targetElement)
                {
                    if(targetElement.nextSibling==null)
                        p.appendChild(dragobj);
                    else
                        p.insertBefore(dragobj,targetElement.nextSibling);
                }
                else
                {
                    p.insertBefore(dragobj,targetElement);
                }
            }
        }

    }, false)

    dc.addEventListener('drop', e => {
        e.preventDefault()
    }, false)
}


function genSearchContent(pp)
{
    let sdata=[];
    for (let dNodeSub of pp.childNodes) 
    {
        let fn = dNodeSub.childNodes[0].innerText;
        let fr = dNodeSub.childNodes[1].innerText;
        let ftype = dNodeSub.childNodes[2].value;
        let dbtype = dNodeSub.childNodes[3].value;
        let fselvalue = dNodeSub.childNodes[4].value;
        let sdv = {};
        sdv['title']=fn;
        sdv['ftype']=ftype;
        sdv['dbtype']=dbtype;
        sdv['fselvalue']=fselvalue;
        let sd = {};
        sd[fr]=sdv;
        sdata.push(sd);
    }
    window.setDataItemByKey("searchdatas",JSON.stringify(sdata));
    window.setDataItemByKey("searchcontent",pp.innerHTML);
}

function varSelDbFieldAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;
    let dk=dd.options[dd.selectedIndex].value;

    let df=p.childNodes[1];
    let fv=df.options[df.selectedIndex].text;
    let fk=df.options[df.selectedIndex].value;
    let arr = fk.split("|");
    let sfield=dk + "." + arr[0];

    let dc = document.createElement("div");
    dc.className="selBtnDiv";

    let str = "<span style=\"border:none;\"></span>";
    str = str + "<span style=\"display:none;\"></span>";
    str = str + "<input type=\"hidden\"/>";
    str = str + "<input type=\"hidden\"/>";
    str = str + "<input type=\"hidden\"/>";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"selSearchDel(event,'"+ cl +"')\" ><img width=\"18\"  src=\"./../../../imgs/del.png\"></a></span>";
    str = str + "<div class=\"showInfo\">"+ sfield +"</div>";
    dc.innerHTML = str;
    dc.childNodes[0].innerText = p.childNodes[2].value;
    dc.childNodes[1].innerText = sfield;
    dc.childNodes[2].value = p.childNodes[3].value;
    dc.childNodes[3].value = p.childNodes[4].value;
    dc.childNodes[4].value = p.childNodes[5].value;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            dealDivDrag(dc);
            genSearchContent(dNode);
            
            break;
        }
    }

    p.style.display="none";

}
function selSearchDel(e,cl)
{
    let p = e.target.parentElement.parentElement.parentElement;
    let pp=p.parentElement;
    if(pp.className==cl)
    {
        pp.removeChild(p);
        genSearchContent(pp);
    }
}
function varSelDbShow(e,f)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="addBtnDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            let seldb="";
            seldb = window.getDataItemByKey("viewcode");
            let fi=0;
            for(let item of window.gDatalist)
            {
                s.add(new Option(item['NAME'],item['TABLENAME']));
                if(seldb==item['TABLENAME'])
                    s.selectedIndex=fi+1;
                fi=fi+1;
            }
            if(seldb!="")
            {
                getDbFields(dNode,seldb,f);
            }

            break;
        }
    }
}

function varSelDbFieldName(e,f)
{
    let p = e.target.parentElement;
    let d = p.childNodes[0];
    let dk = d.options[d.selectedIndex].value;
    let dv = d.options[d.selectedIndex].text;

    let df = p.childNodes[1];
    let fk = df.options[df.selectedIndex].value;
    let fv = df.options[df.selectedIndex].text;
    let arr = fk.split("||");

    p.childNodes[2].value=dv+"_"+fv;
    p.childNodes[3].value=arr[1];
    p.childNodes[4].value=arr[2];
    p.childNodes[5].value=arr[3];

}
function varSelDbFieldShow(e,f)
{
    let p = e.target.parentElement;
    let d = p.firstChild;
    let dk = d.options[d.selectedIndex].value;
    let dv = d.options[d.selectedIndex].text;

    let seldb = dk;
    if(seldb!="")
    {
        getDbFields(p,seldb,f);
    }

}
function getDbFields(dNode,dbname,f)
{

    let paras = {};
    paras['viewCode']="data_fields";
    paras['filter_isinfile_equal']="0";
    paras['filter_tablename_equal']=dbname;
    paras['curPage']=1;
    paras['pageItmes']=100;
    axios.post("./../../../../api/datalist",paras).then(function(res){
        dataTblFieldLists=Object.values(res.data)[0];
        let s = dNode.childNodes[1];
        s.options.length=0
        s.add(new Option("",""));
        for( let item of dataTblFieldLists)
        {
            let ftype="";
            let dbtype="";
            let fselvalue="";
            if(item['FIELD_TYPE'])
                ftype = item['FIELD_TYPE'];
            if(item['DB_TYPE'])
                dbtype = item['DB_TYPE'];    
            if(item['FIELD_SELVALUE'])
                fselvalue = item['FIELD_SELVALUE']; 
            s.add(new Option(item['FIELD_TITLE'],item['FIELD']+"||"+ftype+"||"+dbtype+"||"+fselvalue));
        }
    }).catch(function (err) {
    });
}
function closeAdd(e)
{
    let p = e.target;
    p.parentElement.style.display="none"
}
function checkVarName(str)
{
    if(str.indexOf("'")>=0)
        return false;
    if(str.indexOf('"')>=0)
        return false;
    return true;
}

function gCofigItemInitSelPara()
{

}

function gConfigItemShowEdit(e,d,f)
{
    gCofigItemInitSelPara();

    let pd=document.getElementById(d);
    pd.style.display="block";

    let ps=document.getElementById('divItemUpdNode'+f);
    let pp=e.target.parentElement.parentElement.parentElement;

    let fn = pp.childNodes[0].innerText;
    let fr = pp.childNodes[1].innerText;
    let fm = pp.childNodes[3].innerText;
    let fguid = pp.childNodes[2].value;

    ps.childNodes[0].value=fn;
    ps.childNodes[1].value=fr;
    ps.childNodes[3].value=fm;
    ps.childNodes[2].value=fguid;
    if(f=='mid')
    {
        ps.childNodes[4].value = pp.childNodes[4].innerText;
    }
    
    window.gItemForUpd=pp;

    return;
}

function configItemUpdDo(e,cl,m,f)
{
    configItemUpdFunc(e,cl,m,window.gItemForUpd,f);
    gConfigItemClose(e);
}

function configItemUpdFunc(e,cl,m,dc,f)
{
    let dn,df,dm
    let p = e.target.parentElement;
    let da="";

    dn=p.childNodes[0].value;
    df=p.childNodes[1].value;
    let fguid="";
    if(m=="a")
    {
        dm=p.childNodes[2].value;
        if(f=='mid')
            da=p.childNodes[3].value;
        fguid=gGetGUIDID();
    }
    else
    {
        fguid= p.childNodes[2].value;
        dm=p.childNodes[3].value;
        if(f=='mid')
            da=p.childNodes[4].value;
    }

    if(!dc)
    {
        dc = document.createElement("div");
        dc.className="selBtnDiv";
    }

    let msg="";

    if(dn.trim().length==0)
        msg = msg + "Button name cannot be empty;\n";


    if(!checkVarName(dn))
        msg = msg + "Button name cannot contain quotes;\n";

    if(!checkVarName(dm))
        msg = msg + "Tooltip cannot contain quotes;\n";

    if(!checkVarName(da))
        msg = msg + "Linked field cannot contain quotes;\n";

    if(msg!="")
    {
        alert(msg);
        return;
    }

    let cn="listcode";
    if(f=="top")
        cn = "topbtncode";

    let str = "<span style=\"border:none;\"></span>";
    str = str + "<span style=\"display:none;\"></span>";
    str = str + "<input type=\"hidden\" />";
    str = str + "<span style=\"display:none;\"></span>";
    if(f=='mid')
        str = str + "<span style=\"display:none;\"></span>";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"javascript:void(0)\" onclick=\"gConfigItemShowEdit(event,'divItemUpd"+ f +"','"+ f +"');\" ><img width=\"18\"  src=\"./../../../imgs/update.png\"></a><a href=\"javascript:void(0)\" onclick=\"parent.openCodeValWin('"+ cn + fguid +"');\" >&lt;/&gt;</a><a href=\"javascript:void(0)\" onclick=\"selBtnDel(event,'','"+ cl +"','"+ m +"','"+ f +"')\" ><img width=\"18\"  src=\"./../../../imgs/del.png\"></a></span>";
    str = str + "<span class=\"showInfo\" style=\"width:100%;float:left\" >"+ df + "</span>";
    dc.innerHTML = str;
    
    dc.childNodes[0].innerText = dn;
    dc.childNodes[1].innerText = df;
    dc.childNodes[2].value = fguid;
    dc.childNodes[3].innerText = dm;
    if(f=='mid')
        dc.childNodes[4].innerText = da.toUpperCase();
    return dc;

}

function gConfigItemClose(e)
{
    let p = e.target;
    p.parentElement.parentElement.style.display="none"
}

function addBtnShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="addBtnDiv")
        {
            dNode.style.display="block";
            break;
        }
    }
}
function addBtnDo(e,cl,m,f)
{
    let dc=configItemUpdFunc(e,cl,m,null,f);
    closeAdd(e);

    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            dealDivDrag(dc);
            genBtnContent(dNode,dc,'a',m,f);
            break;
        }
    }
}

function selBtnDel(e,objname,cl,m,f)
{
    let p = e.target.parentElement.parentElement.parentElement;
    if(p.parentElement.className==cl)
    {
        genBtnContent(p.parentElement,p,'d',m,f);
    }
}

function gGenBtnContent(dataitem,pp,dNode,f,m,tf)
{
    let dn = dNode.childNodes[2].value;
    let fn = "listcode";
    if(tf=="top")
        fn = "topbtncode";

    if(f=='d')
    {
        pp.removeChild(dNode);
        dataitem['code'][fn+dn]={};
    }
    else
    {
        let c = dataitem['code'];
        c[fn+dn]={};
    }
}

function gGetBtnContentDo(dataitem,pp,tf)
{
    let shtml ="";
    let sfunc ="";
    let shtmla="";
    let shtmlano="";

    for (let dNodeSub of pp.childNodes) 
    {
        let fn = dNodeSub.childNodes[0].innerText;
        let fr = dNodeSub.childNodes[1].innerText;
        let fm = dNodeSub.childNodes[3].innerText;
        let fa = "";
        if(tf!="top")
            fa=dNodeSub.childNodes[4].innerText;
        let fguid = dNodeSub.childNodes[2].value;

        let sfitem = "func_"+ fguid + "(data)";
        if(fm!="")
        {
            sfitem = "openWinVue('"+ fm +"',func_"+ fguid +",data)";
        }

        let sfitem1 = "func_"+ fguid + "()";
        if(fm!="")
        {
            sfitem1 = "openWinVue('"+ fm +"',func_"+ fguid +",null)";
        }

        if(tf!="top")
        {
            if(fa=='')
            {
                shtml = shtml + "<li v-if=\""+ fr +"\"><a href=\"javascript:void(0)\" @click=\""+ sfitem + "\">"+ fn +"</a></li>";
            }
            else
            {
                shtmla = shtmla + "<td v-if=\"Object.keys(item)[0]!='SYSSTATUS'&&arrShowTitles.indexOf(Object.keys(item)[0])!=-1&&arrAmountFields.indexOf(Object.keys(item)[0])==-1&&Object.keys(item)[0]=='"+ fa +"'\" ><a href=\"javascript:void(0)\" @click=\""+ sfitem + "\">{{data[Object.keys(item)[0]]}}</a></td><td v-if=\"Object.keys(item)[0]!='SYSSTATUS'&&arrShowTitles.indexOf(Object.keys(item)[0])!=-1&&arrAmountFields.indexOf(Object.keys(item)[0])!=-1&&Object.keys(item)[0]=='"+ fa +"'\" style=\"text-align: right;\"><a href=\"javascript:void(0)\" @click=\""+ sfitem + "\">{{formatAmount(Object.keys(item)[0],data[Object.keys(item)[0]])}}</a></td>";
                shtmlano = shtmlano + "&&Object.keys(item)[0]!='"+ fa +"'";
            }
        }
        else
            shtml = shtml + "<input type=\"button\" v-if=\""+ fr +"\" value=\"+"+ fn + "\" @click=\""+ sfitem1 + "\" />";

        if(tf!="top")
            sfunc = sfunc + " func_"+ fguid + "(dataitem){[@listcode"+fguid+"@];closeWin[@configid@]()},";
        else
            sfunc = sfunc + " func_"+ fguid + "(){var curlist={};curlist['datas']=this.datas;curlist['selids']=this.selIds.join(',');[@topbtncode"+fguid+"@];closeWin[@configid@]()},"; 
    }

    if(tf=="top")
        dataitem['config']['btntophtml']=shtml;
    else
        dataitem['config']['btnmidhtml']=shtml;

    dataitem['config']['btnfunc'+tf]=sfunc;

    if(tf=="top")
        dataitem['config']['btntopcontent'] = pp.innerHTML;
    else
        dataitem['config']['btnmidcontent'] = pp.innerHTML;

    if(tf!="top")
    {
        if(shtmla=='')
        {
            shtmla = "<td v-if=\"Object.keys(item)[0]!='SYSSTATUS'&&arrShowTitles.indexOf(Object.keys(item)[0])!=-1&&arrAmountFields.indexOf(Object.keys(item)[0])==-1\" v-html=\"data[Object.keys(item)[0]]\"></td><td v-if=\"Object.keys(item)[0]!='SYSSTATUS'&&arrShowTitles.indexOf(Object.keys(item)[0])!=-1&&arrAmountFields.indexOf(Object.keys(item)[0])!=-1\" style=\"text-align: right;\" v-html=\"formatAmount(Object.keys(item)[0],data[Object.keys(item)[0]])\"></td>";
        }
        else
        {
            shtmla = shtmla + "<td v-if=\"Object.keys(item)[0]!='SYSSTATUS'&&arrShowTitles.indexOf(Object.keys(item)[0])!=-1&&arrAmountFields.indexOf(Object.keys(item)[0])==-1"+ shtmlano +"\" v-html=\"data[Object.keys(item)[0]]\"></td><td v-if=\"Object.keys(item)[0]!='SYSSTATUS'&&arrShowTitles.indexOf(Object.keys(item)[0])!=-1&&arrAmountFields.indexOf(Object.keys(item)[0])!=-1"+ shtmlano +"\" style=\"text-align: right;\" v-html=\"formatAmount(data[Object.keys(item)[0]])\"></td>";
        }

        dataitem['config']['shtmla']=shtmla;
    }
}