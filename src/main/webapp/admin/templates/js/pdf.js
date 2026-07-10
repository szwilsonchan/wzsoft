
window.callback=null;
window.callbackpara=null;
window.codename=null;
var dragborder="";
var dragobj=null;
var comconfigPara=null;
var comAttrsGet={};
var comAttrsSet={};
var comAttrsField={};
var varGLists = [];
var varGDataFileds = [];

String.prototype.replaceAll=function(str,replace,ingore){
				ingore = ingore || false;
				var reg;
				if(!ingore){
					reg = new RegExp(str,"g");
				}else{
					reg = new RegExp(str,"gi");
				}
				return this.replace(reg,replace);
}

initTemplate();

function getInitDataPara() 
{
    let paras = {};
    getPageParas(paras);

    paras['viewCode']="data_fields";
    paras['curPage']=1;
    paras['pageItmes']=200;
    paras['filter_dataid_equal']=paras['dataID'];
    axios.post("./../../api/datalist",paras).then(function(res){
        varGDataFileds=Object.values(res.data)[0];    
    }).catch(function (err) {
    });
}

function initTemplate()
{
    let dmr = document.getElementById("main-wrapper");
    for (let dNode of dmr.childNodes) 
    {
        for (let dNodeSub of dNode.childNodes) 
        {
            if(dNodeSub.className=="com-wrapper")
            {
                dNodeSub.addEventListener('dragenter', (e) => {
                }, false)

                dNodeSub.addEventListener('dragover', e => {
                    e.preventDefault()
                    let p = e.target.parentNode;
                    let targetElement = e.target;
                    if(targetElement.className=="com-wrapper")
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

                }, false)

                dNodeSub.addEventListener('drop', e => {
                    e.preventDefault()
                }, false)

                for (let node of dNodeSub.childNodes) 
                {
                    let comconfigPara = "";
                    let comconfigID = "";
                    if(node.className=="comconfigDiv")
                    {
                        for (let nodeSub of node.childNodes) 
                        {
                            if(nodeSub.className=="comconfigPara")
                            {
                                comconfigPara = nodeSub.innerText;
                            }
                            if(nodeSub.className=="comconfigID")
                            {
                                comconfigID = nodeSub.innerText;
                            }
                        }
                        if(comconfigID!="")
                        {
                            let comconfig = JSON.parse(comconfigPara);
                            setCodeParalist(comconfigID,comconfig);
                        }
                    }
                }
            }
        }
    }
    getInitDataPara();
}

document.getElementById("main-wrapper-info").style.display="none";

function setTempFormValue(fValue) 
{
    let iw = document.getElementById('compiframe').contentWindow;
    iw.setFormConValue(fValue);
}
function setFieldsValue(fValue) 
{
    let iw = document.getElementById('compiframe').contentWindow;
    iw.setFieldsValue(fValue);
}
function openTempFormWin(location) 
{
    let iframe = document.getElementById('tempformiframe')
    iframe.src = location;
    if (iframe.attachEvent)
    {
        iframe.attachEvent("onload", openTempFormWin1);
        } else {
        iframe.onload = openTempFormWin2;
    }
}
function openTempFormWin1()
{

    let iw = document.getElementById('compiframe').contentWindow;
    let fValue = iw.getFormConValue();

    let tw = document.getElementById('tempformiframe').contentWindow;
    tw.initTemplate(fValue);
    document.getElementById("tempForm").style.display="block";
    document.getElementById("tempformiframe").detachEvent("onload", openTempFormWin1);
}
function openTempFormWin2()
{
    let iw = document.getElementById('compiframe').contentWindow;
    let fValue = iw.getFormConValue();

    let tw = document.getElementById('tempformiframe').contentWindow;
    tw.initTemplate(fValue);
    document.getElementById("tempForm").style.display="block";
    document.getElementById("tempformiframe").onload=null;
}

function closeTempFormWin() 
{
    document.getElementById("tempForm").style.display="none";
}
function setCodeVarinit(varlist) //Temporarily unused
{
    for(let item of varlist)
    {
        let fn = 'dataitem.'+item['FIELD'];
        let ft = 'RowData.'+item['FIELD'];
        let blnFind=false;
        for(let itemsub of varGLists)
        {
            if(itemsub['name']==ft)
            {
                blnFind=true;
                break;
            }

        }
        if(!blnFind)
            varGLists.push({"name":ft,"key":fn,"type":"str","ptype":""});
    }
}
function openCodeValWin(codename) 
{
    window.codename=codename;

    document.getElementById("codeVal").style.display="block";
    let iframe = document.getElementById("codeValiframe");
    iframe.src="./../code_design.html";
    if (iframe.attachEvent)
    {
        iframe.attachEvent("onload", openCodeWin1);
        } else {
        iframe.onload = openCodeWin2;
    }
    
}
function openCodeWin1()
{
    let fValue = {};
    let cw = document.getElementById('compiframe').contentWindow;
    if(window.codename!="initformdatas")
    {
        fValue = cw.getFormValue(window.codename);
    }
    else
    {
        if(document.getElementById('Inputinitformdatas').value!="")
            fValue = JSON.parse(document.getElementById('Inputinitformdatas').value);
    }
    let iw = document.getElementById('codeValiframe').contentWindow;
    iw.initTemplate(fValue,comAttrsSet,comAttrsGet,varGLists,"-1");
    document.getElementById("codeValiframe").detachEvent("onload", openCodeWin1);
}
function openCodeWin2()
{
    let fValue = {};
    let cw = document.getElementById('compiframe').contentWindow;
    if(window.codename!="initformdatas")
    {
        fValue = cw.getFormValue(window.codename);
    }
    else
    {
        if(document.getElementById('Inputinitformdatas').value!="")
            fValue = JSON.parse(document.getElementById('Inputinitformdatas').value);
    }

    let iw = document.getElementById('codeValiframe').contentWindow;
    iw.initTemplate(fValue,comAttrsSet,comAttrsGet,varGLists,"-1");
    document.getElementById("codeValiframe").onload=null;
}
function setCodeValValue(fValue) 
{
    let iw = document.getElementById('compiframe').contentWindow;

    if(window.codename!="initformdatas")
    {
        iw.setFormValue(fValue,window.codename);
    }
    else
    {
        document.getElementById('Inputinitformdatas').value = JSON.stringify(fValue);
    }

}
function closeCodeValWin() 
{
    document.getElementById("codeVal").style.display="none";
}
function selContentTab(e)
{
    let did = e.srcElement.id;
    document.getElementById("updWin-"+did).style.display="block";
    for(let l of e.srcElement.parentElement.childNodes)
    {
        if(l.classList&&l!=e.srcElement)
        {
            if(l.classList.contains("selected"))
            {
                l.classList.remove("selected");
                document.getElementById("updWin-"+l.id).style.display="none";
            }
        }
    }
    e.srcElement.classList.add("selected");
}

function closeSaveMsg() 
{
    document.getElementById("main-wrapper-info").style.display="none";
}

function pageName()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String).split(".");
    return c.slice(0, 1);
    
}

function getPageParas(savePara) {
    let pagelocation = document.location.toString();
    let paras = pagelocation.split("?");
    if (paras.length > 1) {
        paras = paras[1].split("&");
        paras.forEach(item => {
            item = item.split("=");
            savePara[item[0]] = item[1];
        })
    }
}

function goBack()
{
    let Para = {};
    getPageParas(Para);

    if(Para['dataID'])
        document.location.href="./../data.html";
    else
        document.location.href="./../page.html";
}

function saveTemplate(sAction)
{
    let savePara = {};
    let fileName = pageName();

    getPageParas(savePara);

    fileName = fileName + ".html";
    savePara["filename"] = fileName.substr(4,fileName.length-4);
    savePara["templatefile"] = fileName;
    savePara["comconfig"] = [];
    savePara["comAttrsField"] = comAttrsField;

    let strPdfcontent = window.getContentDataItem();
    document.getElementById("intTempContent").value=strPdfcontent;
    let jt = JSON.parse(strPdfcontent);
    if(jt['temptype']=="1")
    {
        savePara["pdffilecontent"] = jt['tempcontent'];
    }
    savePara["pdfheader"] = jt['tempheader'];

    let dmr = document.getElementById("main-wrapper");
    let newDc = dmr.cloneNode(true);
    newDc.innerHTML="";
    for (let dNode of dmr.childNodes) 
    {
        let newDp = dNode.cloneNode(true);
        newDp.innerHTML="";
        for (let dNodeSub of dNode.childNodes) 
        {
            if(dNodeSub.className=="com-wrapper")
            {
                let newCr = dNodeSub.cloneNode(true);
                newCr.draggable=false;
                newCr.innerHTML="";
                for (let node of dNodeSub.childNodes) 
                {
                    let comconfigPara = "";
                    let comconfigID = "";
                    let divContent=null;
                    if(node.className=="comconfigDiv")
                    {
                        let newDv = node.cloneNode(true);
                        newDv.innerHTML="";
                        for (let nodeSub of node.childNodes) 
                        {
                            if(nodeSub.className=="comconfigPara")
                            {
                                comconfigPara = nodeSub.innerText;
                            }
                            if(nodeSub.className=="comconfigID")
                            {
                                comconfigID = nodeSub.innerText;
                            }
                            if(nodeSub.className=="comconfigContent")
                            {
                                divContent = nodeSub.cloneNode(true);
                            }
                        }
                        if(comconfigID!="")
                        {
                            let cp = JSON.parse(comconfigPara);
                            if(cp.config.content)
                            {
                                if(cp.comid=='3001'||cp.comid=='3002'||cp.comid=='3003'||cp.comid=='3006')
                                {
                                    newCr = document.createElement("div");
                                    if(cp.comid=='3001')
                                        newCr.innerHTML="<div style=\"page-break-before:always\"></div>";
                                    else if(cp.comid=='3006')
                                        newCr.innerHTML = "<div class='pdf' >"+cp.config.content+"</div>";
                                    else
                                        newCr.innerHTML = cp.config.content;
                                }
                                else if(cp.comid=='3005')
                                {
                                    let comconfig = {};
                                    comconfig["comconfigid"]=comconfigID;
                                    comconfig["comid"]=cp.comid;
                                    comconfigPara = JSON.stringify(cp);
                                    comconfig["comconfigpara"]=comconfigPara;
                                    savePara["comconfig"].push(comconfig);
                                    newDv.innerText="[@"+ comconfigID +"@]";
                                    newCr.appendChild(newDv);
                                }
                                else
                                    newCr.appendChild(divContent);
                            }
                        }
                    }
                }
                newDp.appendChild(newCr);
            }
        }
        if(dNode.className&&dNode.id!="intTempContent")
        {
            newDc.appendChild(newDp);
            let newCr = document.createElement("div");
            newCr.innerHTML="<div style=\"page-break-before:always\"></div>";
            newDc.appendChild(newCr);
        }
    }
    if(newDc.childNodes.length>=2)
        newDc.removeChild(newDc.childNodes[newDc.childNodes.length-1]);

    savePara["filecontent"] = newDc.innerHTML;

    let v = dmr.innerHTML;
    savePara["templatecontent"] = v;
    
    axios.post("./../../api/formsave",savePara).then(function(res)
        {
        returnmsg=Object.values(Object.values(res.data)[0])[0];
        if(returnmsg!="")
        {
            document.getElementById("main-wrapper-info-msg").innerHTML=returnmsg;
            document.getElementById("main-wrapper-info").style.display="block";
            setTimeout(closeSaveMsg,3000);
        }
        else
        {
            document.getElementById("main-wrapper-info-msg").innerHTML="Saved!";
            document.getElementById("main-wrapper-info").style.display="block";
            setTimeout(closeSaveMsg,3000);

        }
        }).catch(function (err) {
        });
}

function showComconfig()
{
    let sIndex = document.getElementById("con-com").selectedIndex;
    let sValue = document.getElementById("con-com").options[sIndex].value;
    if(sValue!=="")
    {
        cArrs=sValue.split("|");
        let comconfig = cArrs[2];
        comconfig = "./."+comconfig;
        document.getElementById("compconfig").style.display="block";
        document.getElementById("compiframe").src=comconfig + "config.html?"+genUUID();
    }
    else
    {
        document.getElementById("compconfig").style.display="none";
    }
}

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

function openWin(msg,callback,callbackpara) 
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("modalWin").style.display="block";
    document.getElementById("modalWinMsg").innerText=msg;
    window.callback=callback;
    window.callbackpara=callbackpara;
}
function openUpdWin(msg,callback,callbackpara) 
{
    let e = callbackpara;
    let p=e.srcElement.parentElement.parentElement;
    if(p.className=="conParent")
    {
        updConParentWin(msg,callback,callbackpara)
        return;
    }
    else
    {
        let s1 = document.getElementById("sel-tab1");
        let s2 = document.getElementById("sel-tab2");
        s2.style.display="block";
    
        if(s1.classList.contains("selected"))
            s1.classList.remove("selected");
    
        if(!s2.classList.contains("selected"))
            s2.classList.add("selected");
        
        document.getElementById("updWin-sel-tab1").style.display="none";
        document.getElementById("updWin-sel-tab2").style.display="block";
        document.getElementById("conParentId").style.display="none";
        document.getElementById("conParentName").style.display="none";
        document.getElementById("conParentPosition").style.display="none";
    }

    let s = e.srcElement.parentElement.parentElement.style;

    document.getElementById("con-border-width").value=s.borderWidth;
    document.getElementById("con-border-style").value=s.borderStyle;
    document.getElementById("color-picker").style.backgroundColor=s.borderColor;
    document.getElementById("con-border-radius").value=s.borderRadius;
    document.getElementById("color-picker1").style.backgroundColor=s.backgroundColor;

    //document.getElementById("con-padding").value=s.padding;
    document.getElementById("con-padding-left").value=s.paddingLeft;
    document.getElementById("con-padding-right").value=s.paddingRight;
    document.getElementById("con-padding-top").value=s.paddingTop;
    document.getElementById("con-padding-bottom").value=s.paddingBottom;

    //document.getElementById("con-margin").value=s.margin;
    document.getElementById("con-margin-left").value=s.marginLeft;
    document.getElementById("con-margin-right").value=s.marginRight;
    document.getElementById("con-margin-top").value=s.marginTop;
    document.getElementById("con-margin-bottom").value=s.marginBottom;

    document.getElementById("con-width").value=s.width;
    document.getElementById("con-width-min").value=s.minWidth;

    document.getElementById("con-height").value=s.height;
    document.getElementById("con-height-min").value=s.minHeight;

    document.getElementById("con-textalign").value=s.textAlign;
    document.getElementById("con-overflow").value=s.overflow;
    document.getElementById("con-float").value=s.float;
    
    document.getElementById("con-pleft").value=s.left;
    document.getElementById("con-pbottom").value=s.bottom;
    document.getElementById("con-pright").value=s.right;
    document.getElementById("con-ptop").value=s.top;

    document.getElementById("coverWin").style.display="block";
    document.getElementById("updWin").style.display="block";

    document.getElementById("compconfig").style.display="none";
    document.getElementById("compiframe").src="";
    document.getElementById("con-com").value="";

    for (let node of e.srcElement.parentElement.parentElement.childNodes) 
    {
        for (let nodeSub of node.childNodes) 
        {
            if(nodeSub.className=="comconfigPara"&&nodeSub.innerText!="")
            {
                let cp = JSON.parse(nodeSub.innerText);
                let comid = cp.comid;
                let sel = document.getElementById("con-com");
                for (var i=0;i<sel.length;i++)
                {
                    let selvalue = sel.options[i].value;
                    cArrs=selvalue.split("|");
                    if(comid==cArrs[0])
                    {
                        sel.options[i].selected=true;
                        let comconfig = cArrs[2];
                        comconfig = "./."+comconfig;
                        document.getElementById("compconfig").style.display="block";
                        let iframe = document.getElementById("compiframe");
                        iframe.src=comconfig + "config.html?"+genUUID();
                        comconfigPara = cp;
                        
                        if (iframe.attachEvent)
                        {
                            iframe.attachEvent("onload", setConfigPara1);
                            } else {
                            iframe.onload = setConfigPara2;
                        } 
                        break;
                    }
                }
            }
        }
    }

    window.callback=callback;
    window.callbackpara=callbackpara;
}
function setConfigPara1()
{
    let iw = document.getElementById('compiframe').contentWindow;
    iw.setDataItem(comconfigPara);
    document.getElementById("compiframe").detachEvent("onload", setConfigPara);
}
function setConfigPara2()
{
    let iw = document.getElementById('compiframe').contentWindow;
    iw.setDataItem(comconfigPara);
    document.getElementById("compiframe").onload=null;
}
function openAddWin(msg,callback,callbackpara) 
{
    let s1 = document.getElementById("sel-tab1");
    let s2 = document.getElementById("sel-tab2");
    s2.style.display="block";

    if(s1.classList.contains("selected"))
        s1.classList.remove("selected");

    if(!s2.classList.contains("selected"))
        s2.classList.add("selected");
    
    document.getElementById("updWin-sel-tab1").style.display="none";
    document.getElementById("updWin-sel-tab2").style.display="block";
    document.getElementById("conParentId").style.display="none";
    document.getElementById("conParentName").style.display="none";
    document.getElementById("conParentPosition").style.display="none";

    document.getElementById("coverWin").style.display="block";
    document.getElementById("updWin").style.display="block";
    window.callback=callback;
    window.callbackpara=callbackpara;
}
function openWinOK() 
{
    window.callback(window.callbackpara); 
}

function closeWin() 
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("modalWin").style.display="none";
    document.getElementById("updWin").style.display="none";
}

function closeInfoMsg(e) 
{
    e.srcElement.parentElement.style.display="none";
}

function genUUID()
{
    let s = [];
    let hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '';
    let uuid = s.join('');
    return uuid;
}

function addConParentWin() 
{
    let d = document.getElementById("pdfpage");
    let dc = d.cloneNode(true);
    dc.id="";
    dc.style.display="block";
    dc.style.position="relative";

    let da = document.createElement("div");
    da.innerHTML = document.getElementById("item-action").innerHTML;
    da.className = "template-action";
    dc.appendChild(da);

    document.getElementById("main-wrapper").appendChild(dc);

}

function addContainer(e) 
{
    let sIndex = document.getElementById("con-com").selectedIndex;
    let sValue = document.getElementById("con-com").options[sIndex].value;
    let dc = document.createElement("div");
    dc.className="comconfigDiv";
    dc.style.boxSizing="border-box";
    dc.draggable=false;

    let spn = document.createElement("span");
    spn.className="comconfigPara";
    spn.draggable=false;
    spn.style.display="none";
    dc.appendChild(spn);

    let divcontent= document.createElement("div");
    divcontent.className="comconfigContent";
    divcontent.draggable=false;
    dc.appendChild(divcontent);

    let spnid = document.createElement("span");
    spnid.className="comconfigID";
    spnid.draggable=false;
    spnid.style.display="none";
    dc.appendChild(spnid);

    if(sValue!=""&&document.getElementById("compconfig").style.display=="block")
    {
        let comid = cArrs[0];
        let iw = document.getElementById('compiframe').contentWindow;
        let comconfig = iw.getDataItem();

        spn.innerText=JSON.stringify(comconfig);
        let configid = genUUID();
        spnid.innerText=configid;
        if(comconfig.config.content)
        {
            divcontent.innerHTML = comconfig.config.content;
            if(comid=='10')
            {
                divcontent.style.fontSize = comconfig.config.fontsize;
                divcontent.style.fontFamily = comconfig.config.fontfamily;
                divcontent.style.fontStyle = comconfig.config.fontstyle;
                divcontent.style.fontWeight = comconfig.config.fontweight;
                divcontent.style.color = comconfig.config.fontcolor;
            }
        }
        dc.style.display="block";
    }

    let d = document.createElement("div");
    d.style.position="relative";
    d.className="com-wrapper";
    d.style.boxSizing="border-box";
    d.style.top = document.getElementById("con-ptop").value;
    d.style.bottom = document.getElementById("con-pbottom").value;
    d.style.left = document.getElementById("con-pleft").value;
    d.style.right = document.getElementById("con-pright").value;

    d.style.paddingLeft=document.getElementById("con-padding-left").value;
    d.style.paddingTop=document.getElementById("con-padding-top").value;
    d.style.paddingRight=document.getElementById("con-padding-right").value;
    d.style.paddingBottom=document.getElementById("con-padding-bottom").value;

    d.style.marginLeft=document.getElementById("con-margin-left").value;
    d.style.marginTop=document.getElementById("con-margin-top").value;
    d.style.marginRight=document.getElementById("con-margin-right").value;
    d.style.marginBottom=document.getElementById("con-margin-bottom").value;
    
    d.draggable=true;
    d.style.borderWidth=document.getElementById("con-border-width").value;
    d.style.borderStyle=document.getElementById("con-border-style").value;
    d.style.borderColor=document.getElementById("color-picker").style.backgroundColor;
    d.style.borderRadius=document.getElementById("con-border-radius").value;
    d.style.backgroundColor=document.getElementById("color-picker1").style.backgroundColor;

    d.style.width = document.getElementById("con-width").value;
    d.style.minWidth = document.getElementById("con-width-min").value;
    d.style.height = document.getElementById("con-height").value;
    d.style.minHeight = document.getElementById("con-height-min").value;

    d.style.textAlign = document.getElementById("con-textalign").value;
    d.style.overflow = document.getElementById("con-overflow").value;
    d.style.float = document.getElementById("con-float").value;

    d.addEventListener('dragenter', (e) => {
    }, false)

    d.addEventListener('dragover', e => {
        e.preventDefault()
        let p = e.target.parentNode;
        let targetElement = e.target;
        if(targetElement.className=="com-wrapper")
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

    }, false)

    d.addEventListener('drop', e => {
        e.preventDefault()
    }, false)

    let da = document.createElement("div");
    da.innerHTML = document.getElementById("template-action").innerHTML;
    da.className = "template-action";

    d.appendChild(da);
    d.appendChild(dc);

    e.srcElement.parentElement.parentElement.appendChild(d);
    closeWin();
}

function updContainer(e) 
{
    let p=e.srcElement.parentElement;
    if(p.className=="conParent")
    {
        updConParent(e);
        return;
    }

    let dc = null;
    let spn = null;
    let divcontent = null;
    let spnid = null;
    let img = null;

    for (let node of e.srcElement.parentElement.parentElement.childNodes) 
    {
        if(node.className=="comconfigDiv")
            dc=node;
        for (let nodeSub of node.childNodes) 
        {
            if(nodeSub.className=="comconfigPic")
                img=nodeSub;
            if(nodeSub.className=="comconfigPara")
                spn=nodeSub;
            if(nodeSub.className=="comconfigID")
                spnid=nodeSub;
            if(nodeSub.className=="comconfigContent")
                divcontent=nodeSub;
        }
    }

    let sIndex = document.getElementById("con-com").selectedIndex;
    let sValue = document.getElementById("con-com").options[sIndex].value;
    if(sValue!=""&&document.getElementById("compconfig").style.display=="block")
    {
        let comid = cArrs[0];
        let iw = document.getElementById('compiframe').contentWindow;
        let comconfig = iw.getDataItem();
        spn.innerText=JSON.stringify(comconfig);
        let configid=spnid.innerText;
        if(comconfig.config.content)
        {
            divcontent.innerHTML = comconfig.config.content;
            if(comid=='10')
            {
                divcontent.style.fontSize = comconfig.config.fontsize;
                divcontent.style.fontFamily = comconfig.config.fontfamily;
                divcontent.style.fontStyle = comconfig.config.fontstyle;
                divcontent.style.fontWeight = comconfig.config.fontweight;
                divcontent.style.color = comconfig.config.fontcolor;
            }
        }
        if(comconfig.config.fieldtitle)
        {
            setCodeParalist(configid,comconfig);
        }
    }
    else
    {
        dc.style.display="none";
        spn.innerText="";
        spnid.innerText="";
        img.src="";
    }

    let d = e.srcElement.parentElement.parentElement;
    d.style.top = document.getElementById("con-ptop").value;
    d.style.bottom = document.getElementById("con-pbottom").value;
    d.style.left = document.getElementById("con-pleft").value;
    d.style.right = document.getElementById("con-pright").value;

    d.style.paddingLeft=document.getElementById("con-padding-left").value;
    d.style.paddingTop=document.getElementById("con-padding-top").value;
    d.style.paddingRight=document.getElementById("con-padding-right").value;
    d.style.paddingBottom=document.getElementById("con-padding-bottom").value;

    d.style.marginLeft=document.getElementById("con-margin-left").value;
    d.style.marginTop=document.getElementById("con-margin-top").value;
    d.style.marginRight=document.getElementById("con-margin-right").value;
    d.style.marginBottom=document.getElementById("con-margin-bottom").value;
    
    d.draggable=true;
    d.style.borderWidth=document.getElementById("con-border-width").value;
    d.style.borderStyle=document.getElementById("con-border-style").value;
    d.style.borderColor=document.getElementById("color-picker").style.backgroundColor;
    d.style.borderRadius=document.getElementById("con-border-radius").value;
    d.style.backgroundColor=document.getElementById("color-picker1").style.backgroundColor;

    d.style.width = document.getElementById("con-width").value;
    d.style.minWidth = document.getElementById("con-width-min").value;
    d.style.height = document.getElementById("con-height").value;
    d.style.minHeight = document.getElementById("con-height-min").value;

    d.style.textAlign = document.getElementById("con-textalign").value;
    d.style.overflow = document.getElementById("con-overflow").value;
    d.style.float = document.getElementById("con-float").value;

    closeWin();
}

function setCodeParalist(configid,comconfig)
{
    let attrs = [];
    for (let k in comconfig.attrget) 
    {
        let sK = configid+"."+k;
        let sAttr = comconfig.config.fieldtitle + "." + k;
        comAttrsField[sK]=comconfig.attrget[k];
        if(comconfig.fields!=null)
            sK="lst_"+sK;
        else
            sK="nml_"+sK;
        attrs.push({"name":sAttr,"key":sK});
        if(comconfig.fields!=null)
        {
            let arrfields = [];
            arrfields = comconfig.fields;
            for(let item of arrfields)
            {
                let subK = sK+"_entry."+item['name'];
                let subAttr = sAttr+"_entry."+item['title'];
                attrs.push({"name":subAttr,"key":subK});
            }
        }
    }
    comAttrsGet[configid]=attrs;
    attrs = [];
    for (let k in comconfig.attrset) 
    {
        let sK = configid+"."+k;
        let sAttr = comconfig.config.fieldtitle + "." + k;
        comAttrsField[sK]=comconfig.attrset[k];
        if(comconfig.fields!=null)
            sK="lst_"+sK;
        else
            sK="nml_"+sK;
        attrs.push({"name":sAttr,"key":sK});
        if(comconfig.fields!=null)
        {
            let arrfields = [];
            arrfields = comconfig.fields;
            for(let item of arrfields)
            {
                let subK = sK+"_entry."+item['name'];
                let subAttr = sAttr+"_entry."+item['title'];
                attrs.push({"name":subAttr,"key":subK});
            }
        }
    }
    comAttrsSet[configid]=attrs;
}

function delContainer(e) 
{
    let d = e.srcElement.parentElement.parentElement;
    let dcls = d.className;
    let p = d.parentElement;
    p.removeChild(d);
    closeWin();

    if(dcls=="pdfpage")
    {
        return;
    }
    let spnid = null;
    for (let node of e.srcElement.parentElement.parentElement.childNodes) 
    {
        for (let nodeSub of node.childNodes) 
        {
            if(nodeSub.className=="comconfigID")
            {
                spnid=nodeSub;
                if(comAttrsGet[spnid.innerText])
                {
                    comAttrsGet[spnid.innerText]=[];
                }
                if(comAttrsSet[spnid.innerText])
                {
                    comAttrsSet[spnid.innerText]=[];
                }
                break;
            }
        }
    }
}

const ComListVue = 
{
    data() 
    {
        return {
            datas:null,
            dataitem:{},
            datalabs:null,
            datatotal:null,
            curpage:1,
            totalitems:0,
            pageitems:100
        }
    },
    methods: 
    {
        getDatas () 
        {
            let paras = {};
            paras['viewCode']="com";
            paras['curPage']=this.curpage;
            paras['pageItmes']=this.pageitems;
            paras['filter_open_equal']="1";
            paras['filter_searchkey_like']="PDF";
            paras['order_snum_asc']="";
            var that = this;
            axios.post("./../../api/datalist",paras).then(function(res){
            that.datas=Object.values(res.data)[0];    
            that.datalabs=Object.values(res.data)[1];   
            that.datatotal=Object.values(res.data)[2];
            that.pkey=Object.values(Object.values(Object.values(res.data)[3])[0])[0];
            that.totalitems=Object.values(Object.values(Object.values(that.datatotal)[0]))[0];
            }).catch(function (err) {
            });
        }
    },
    mounted() 
    {
        this.getDatas();
    }
}

Vue.createApp(ComListVue).mount('#complist')

const TempContentVue = 
{
    data() 
    {
        return {
            dataitem:{"tempheader":"","temptype":"0","tempcontent":""}
        }
    },
    methods: 
    {
        getContentDataItem() 
        {
            return JSON.stringify(this.dataitem);
        }
    },
    mounted() 
    {
        window.getContentDataItem = this.getContentDataItem;
        if(document.getElementById("intTempContent").value!="")
        {
            this.dataitem = JSON.parse(document.getElementById("intTempContent").value);
        }
    }
}

Vue.createApp(TempContentVue).mount('#tempContentVue')