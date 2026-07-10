
window.callback=null;
window.callbackpara=null;
window.callbackparaSub=null;
window.codename=null;
var dragborder="";
var dragobj=null;
var comconfigPara=null;
var comAttrsGet={};
var comAttrsSet={};
var comAttrsField={};
var gComlist=null;
var gConClass = ",";
var gSpanImgsrc = "..";
var gSpanApi = "..";
var gSpanComImgsrc = "";
var gPageName="";
var varGDataFileds = null;
var gIsDateForm = false;
var gIsFormIn = false;
var gIsMobilePage = false;
var gIsFormPub = false;
var gIsPortalRight = false;

window.listdatafields=[];
window.selviewcode="";
window.varGLists = [];
gPageName = getPageName();
gPageName = gPageName.toString().toLowerCase();

window.bgfileContent={};
window.hashiddendiv=false;

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

function getPageName()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String).split(".");
    return c.slice(0, 1);
}

if(gPageName=="temp_formin")
{
    window.gIsFormIn=true;
    window.gIsMobilePage = parent.gIsMobilePage;
    window.gIsFormPub = parent.gIsFormPub;
    window.gIsPortalRight = parent.gIsFormPub;
}

if(gPageName=="temp_tabdiy")
{
    window.gIsMobilePage = parent.gIsMobilePage;
}

if(gPageName!="temp_formin"&&gPageName!="temp_tabdiy")
{
    initTemplate();
}

function getInitDataPara() 
{
    let paras = {};
    getPageParas(paras);

    if(paras['dataID'])
    {
        paras['viewCode']="data_fields";
        paras['curPage']=1;
        paras['pageItmes']=200;
        paras['filter_dataid_equal']=paras['dataID'];
        axios.post("./../../api/datalist",paras).then(function(res){
            varGDataFileds=Object.values(res.data)[0];  
            gIsDateForm=true;  
        }).catch(function (err) {
        });
    }
    if(paras['appType'])
    {
        if(paras['appType']=="2")
        {
            window.gIsMobilePage=true;
        }
    }
    if(paras['isPub'])
    {
        if(paras['isPub']=="1")
        {
            window.gIsFormPub=true;
            window.gIsPortalRight=true;
        }
    }
    if(paras['pageType'])
    {
        if(paras['pageType']=="2")
        {
            window.gIsPortalRight=true;
        }
    }
}

function initTemplate()
{
    getPageInitData();
    //getComlist();
    let dmr = document.getElementById("main-wrapper");
    for (let dNode of dmr.childNodes) 
    {
        initDealDiv(dNode);
    }
    genTopMenu(true);
    getInitDataPara();
}

function initTemplateList(fValue)
{
    gSpanImgsrc = "../../..";
    gSpanApi= "../../..";
    gSpanComImgsrc = "/../..";
    getPageInitData();
    //getComlist();

    varGLists = parent.varGLists;
    comAttrsField = parent.comAttrsField;

    comAttrsSet = JSON.parse(JSON.stringify(parent.comAttrsSet));
    comAttrsGet = JSON.parse(JSON.stringify(parent.comAttrsGet));

    if(fValue=="")
    {
        genTopMenu(true);
        return;
    }   

    let dmr = document.getElementById("main-wrapper");
    dmr.innerHTML = fValue["tempcontent"];

    for (let dNode of dmr.childNodes) 
    {
        initDealDiv(dNode);
    }

    genTopMenu(true);
}

function moveUp(e)
{
    let p = e.target.parentElement.parentElement;
    let pp=p.parentElement;
    let targetElement = p.previousSibling;
    if(targetElement!=null)
    {
        pp.insertBefore(p,targetElement);
    }
}
function moveDown(e)
{
    let p = e.target.parentElement.parentElement;
    let pp=p.parentElement;
    let targetElement = p.nextSibling;
    if(targetElement!=null)
    {
        if(targetElement.nextSibling==null)
            pp.appendChild(p);
        else
            pp.insertBefore(p,targetElement.nextSibling);
    }
}

function  initDealDiv(dNode)
{
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className&&dNodeSub.className=="com-wrapper")
        {
            dNodeSub.addEventListener('dragenter', (e) => {
            }, false)

            dNodeSub.addEventListener('dragover', e => {
                e.preventDefault()
                let p = e.target.parentNode;
                let targetElement = e.target;
                if(targetElement.className=="com-wrapper"&&dragobj.className=="com-wrapper")
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
                e.preventDefault();
                let targetElement = e.target;
                let tCls = targetElement.parentElement.parentElement.parentElement.parentElement.className;
                let pid = targetElement.parentElement.parentElement.parentElement.parentElement.parentElement.id;
                let obj = targetElement.parentElement.parentElement.parentElement.parentElement;
                if(tCls.indexOf("com-wrapper")==0)
                {
                    if(dragobj.className=="comitem")
                    {
                        for(let ci of gComlist)
                        {
                            if("comitem"+ci['COMID']==dragobj.id)
                            {
                                if(ci['COMID']!="21")
                                {
                                    let comconfig = ci['CONFIG'];
                                    comconfig = "."+ gSpanComImgsrc +"/."+comconfig;
                                    document.getElementById("compconfig").style.display="block";
                                    document.getElementById("compiframe").src=comconfig + "config.html?"+genUUID();
                                    openAddWin('',addContainer,pid,obj);
                                    break;
                                }
                            }
                        }
                    }
                }

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

        initDealDiv(dNodeSub);
    }
}

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
    tw.initTemplateList(fValue);
    document.getElementById("tempForm").style.display="block";
    document.getElementById("tempformiframe").detachEvent("onload", openTempFormWin1);
}
function openTempFormWin2()
{
    let iw = document.getElementById('compiframe').contentWindow;
    let fValue = iw.getFormConValue();

    let tw = document.getElementById('tempformiframe').contentWindow;
    tw.initTemplateList(fValue);
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

    if(gPageName=="temp_tabdiy"||gPageName=="temp_formin")
    {
        iframe.src="./../../../code_design.html";
    }
    else
    {
        iframe.src="./../code_design.html";
    }


    if (iframe.attachEvent)
    {
        iframe.attachEvent("onload", openCodeWin1);
        } else {
        iframe.onload = openCodeWin2;
    }
    
}
function gcopyobj(obj){return JSON.parse(JSON.stringify(obj));};
function openCodeWin1()
{

    let fValue = {};
    let cw = document.getElementById('compiframe').contentWindow;
    let varList = gcopyobj(window.varGLists);
    let varDataFieldList=[];
    if(gPageName=="temp_tabdiy")
        varDataFieldList = parent.listdatafields;
    else
        varDataFieldList = window.listdatafields;

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

    if(window.codename.indexOf("listcode")==0)
    {
        if(varDataFieldList!=null)
        {
            varList.push({"name":'ListRowData',"key":'dataitem',"type":"obj","ptype":"def"});
            for(let item of varDataFieldList)
            {
                if(window.codename.indexOf("listcodediy")==0)
                    varList.push({"name":'ListRowData_'+item['FIELD_TITLE'],"key":'dataitem.'+item['FIELD'],"type":"str","ptype":"sys"});
                else
                    varList.push({"name":'ListRowData_'+item['FIELD_TITLE'],"key":'dataitem.'+item['FIELD'].toUpperCase(),"type":"str","ptype":"sys"});
            }
        }
    }
    else if(window.codename.indexOf("topbtncode")==0)
    {
        varList.push({"name":'List',"key":'curlist',"type":"obj","ptype":"def"});
        varList.push({"name":'List.Dataset',"key":'curlist.datas',"type":"objlist","ptype":"def"});
        varList.push({"name":'list.selectedDataId',"key":'curlist.selids',"type":"objlist","ptype":"def"});
    }
    else if(window.codename.indexOf("initformdatas")==0)
    {
        varList.push({"name":'pageParam_wfmWorklistId',"key":'pageParam_wfmWorklistId',"type":"obj","ptype":"sys"});
        varList.push({"name":'pageParam_wfmNodeId',"key":'pageParam_wfmNodeId',"type":"obj","ptype":"sys"});
        varList.push({"name":'globalParam_dataId',"key":'globalParam_dataId',"type":"str","ptype":"sys"});
        varList.push({"name":'globalParam_Page URL',"key":'globalParam_Page URL',"type":"str","ptype":"sys"});

        if(gPageName=="temp_formin")
        {
            varList.push({"name":'SubDataForm|DataItem',"key":'dataitem',"type":"obj","ptype":"sys"});
        }
    }

    iw.initTemplate(window.codename,fValue,comAttrsSet,comAttrsGet,varList,"-1");
    document.getElementById("codeValiframe").detachEvent("onload", openCodeWin1);
}
function openCodeWin2()
{

    let fValue = {};
    let cw = document.getElementById('compiframe').contentWindow;
    let varList = gcopyobj(window.varGLists);
    let varDataFieldList=[];
    if(gPageName=="temp_tabdiy")
        varDataFieldList = parent.listdatafields;
    else
        varDataFieldList = window.listdatafields;

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

    if(window.codename.indexOf("listcode")==0)
    {
        if(varDataFieldList!=null)
        {
            varList.push({"name":'ListRowData',"key":'dataitem',"type":"obj","ptype":"def"});
            for(let item of varDataFieldList)
            {
                if(window.codename.indexOf("listcodediy")==0)
                    varList.push({"name":'ListRowData_'+item['FIELD_TITLE'],"key":'dataitem.'+item['FIELD'],"type":"str","ptype":"sys"});
                else
                    varList.push({"name":'ListRowData_'+item['FIELD_TITLE'],"key":'dataitem.'+item['FIELD'].toUpperCase(),"type":"str","ptype":"sys"});
            }
        }
    }
    else if(window.codename.indexOf("topbtncode")==0)
    {
        varList.push({"name":'List',"key":'curlist',"type":"obj","ptype":"def"});
        varList.push({"name":'List.Dataset',"key":'curlist.datas',"type":"objlist","ptype":"def"});
        varList.push({"name":'list.selectedDataId',"key":'curlist.selids',"type":"objlist","ptype":"def"});
    }
    else if(window.codename.indexOf("initformdatas")==0)
    {
        varList.push({"name":'pageParam_wfmWorklistId',"key":'pageParam_wfmWorklistId',"type":"obj","ptype":"sys"});
        varList.push({"name":'pageParam_wfmNodeId',"key":'pageParam_wfmNodeId',"type":"obj","ptype":"sys"});
        varList.push({"name":'globalParam_dataId',"key":'globalParam_dataId',"type":"str","ptype":"sys"});
        varList.push({"name":'globalParam_Page URL',"key":'globalParam_Page URL',"type":"str","ptype":"sys"});
        if(gPageName=="temp_formin")
        {
            varList.push({"name":'SubDataForm|DataItem',"key":'dataitem',"type":"obj","ptype":"sys"});
        }
    }

    iw.initTemplate(window.codename,fValue,comAttrsSet,comAttrsGet,varList,"-1");
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
function selComTab(e)
{
    let did = e.srcElement.id;
    document.getElementById("comlist-"+did).style.display="block";
    for(let l of e.srcElement.parentElement.childNodes)
    {
        if(l.classList&&l!=e.srcElement)
        {
            if(l.classList.contains("selected"))
            {
                l.classList.remove("selected");
                document.getElementById("comlist-"+l.id).style.display="none";
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
function submitTemplate(savePara)
{
    if(savePara['dataID'])
    {
        axios.post("./../../api/formsubmit",savePara).then(function(res)
            {
            returnmsg=Object.values(Object.values(res.data)[0])[0];
            if(returnmsg!="")
            {
                document.getElementById("main-wrapper-info-msg").innerHTML=returnmsg;
                document.getElementById("main-wrapper-info").style.display="block";
            }
            else
            {
                document.getElementById("main-wrapper-info-msg").innerHTML="Submitted successfully!";
                document.getElementById("main-wrapper-info").style.display="block";
                setTimeout(closeSaveMsg,3000);
            }
            }).catch(function (err) {
            });
    }
}

function goBack()
{

    let Para = {};
    getPageParas(Para);
    if(Para['dataID'])
    {
        document.location.href="./../"+Para['backPage']+"?dataID="+Para['dataID']+"&tblName="+Para['tblName']+"&appType="+Para['appType'];
    }
    else
    {
        document.location.href="./../"+Para['backPage']+"?appType="+Para['appType']; 
    }
}

function saveTemplatePdf(sAction)
{
    document.getElementById("main-wrapper-info-msg").innerHTML="Saving...";
    document.getElementById("main-wrapper-info").style.display="block";

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
        saveDealDivPdf(dNode,newDc,savePara);
    }

    for (let i=newDc.childNodes.length-1;i>1;i--) 
    {
        if(newDc.childNodes[i].innerHTML=="<div style=\"position:relative;float:left;page-break-before:always\"></div>")
        {
            newDc.removeChild(newDc.childNodes[i]);
            break;
        }
    }

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
            document.getElementById("main-wrapper-info-msg").innerHTML="Submitted successfully!";
            document.getElementById("main-wrapper-info").style.display="block";
            setTimeout(closeSaveMsg,3000);

        }
        }).catch(function (err) {
        });
}

function saveDealDivPdf(dNode,newDc,savePara)
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
                                    newCr.innerHTML="<div style=\"position:relative;float:left;page-break-before:always\"></div>";
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
        else if(dNodeSub.className&&(dNodeSub.className.indexOf("conParent")==0))
        {
            saveDealDivPdf(dNodeSub,newDp,savePara);
        }
    }
    if(dNode.className&&dNode.className=="conParentpdfpage")
    {

        newDp.id="";
        newDp.className="pdfpage";
        newDc.appendChild(newDp);

        let newCr = document.createElement("div");
        newCr.innerHTML="<div style=\"position:relative;float:left;page-break-before:always\"></div>";
        newDc.appendChild(newCr);
    }
    else
    {
        if(dNode.id!="intTempContent")
            newDc.appendChild(newDp);
    }
}

function saveTemplateList(sAction)
{

    let savePara = {};
    let fieldLists = [];
    savePara["comconfig"] = [];
    savePara["comAttrsGet"] = comAttrsGet;
    savePara["comAttrsSet"] = comAttrsSet;
    savePara["comAttrsField"] = comAttrsField;

    let initObj = {};
    let initValue = "";
    if(document.getElementById("Inputinitformdatas"))
        initValue = document.getElementById("Inputinitformdatas").value;
    if(initValue!="")
    {
        initObj = JSON.parse(initValue);
        savePara["initcode"] = JSON.stringify({"codelist":initObj["codelist"]});
    }

    let dmr = document.getElementById("main-wrapper");
    let newDc = dmr.cloneNode(true);
    newDc.innerHTML="";
    for (let dNode of dmr.childNodes) 
    {
        saveDealDiv(dNode,newDc,savePara,true,fieldLists);
    }

    let v = newDc.innerHTML;
    savePara["filecontent"] = v;
    v = dmr.innerHTML;
    savePara["tempcontent"] = v;

    parent.setTempFormValue(savePara);
    parent.setFieldsValue(fieldLists);
    parent.closeTempFormWin();
}

function saveTemplate(sAction)
{

    document.getElementById("main-wrapper-info-msg").innerHTML="Saving...";
    document.getElementById("main-wrapper-info").style.display="block";

    let savePara = {};
    let fileName = pageName();

    getPageParas(savePara);

    fileName = fileName + ".html";
    savePara["filename"] = fileName.substr(5,fileName.length-5);
    savePara["templatefile"] = fileName;
    savePara["comconfig"] = [];
    savePara["comAttrsField"] = comAttrsField;

    let initObj = {};
    let initValue = "";
    if(document.getElementById("Inputinitformdatas"))
        initValue = document.getElementById("Inputinitformdatas").value;
    if(initValue!="")
    {
        initObj = JSON.parse(initValue);
        savePara["initcode"] = JSON.stringify({"codelist":initObj["codelist"]});
    }
    let dmr = document.getElementById("main-wrapper");
    let newDc = dmr.cloneNode(true);
    newDc.innerHTML="";
    for (let dNode of dmr.childNodes) 
    {
        saveDealDiv(dNode,newDc,savePara,false,null);
    }
    savePara["filecontent"] = newDc.innerHTML;

    for(let fitem of savePara["comconfig"])
    {

        if(fitem['field_name']&&fitem['field_name']!="")
        {
            let pdatas = savePara["comconfig"].filter(item=>item.field_name==fitem['field_name']);
            if(pdatas.length>=2)
            {
                alert("Duplicate field name: "+fitem['field_name']);
                return;
            }
        }
    }

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
            if(savePara['dataID'])
            {
                submitTemplate(savePara);
            }
            else
            {
                document.getElementById("main-wrapper-info-msg").innerHTML="Submitted successfully!";
                document.getElementById("main-wrapper-info").style.display="block";
                setTimeout(closeSaveMsg,3000);
            }
        }
        }).catch(function (err) {
        });
}

function saveDealDiv(dNode,newDc,savePara,islist,fieldLists)
{
    let newDp = dNode.cloneNode(true);
    newDp.draggable=false;
    if(!(dNode.className&&(dNode.className=="divopTitle"||dNode.className.indexOf("conTblTh")==0)))
    {
        newDp.innerHTML="";
    }

    if(newDp.className&&newDp.style.backgroundImage)
    {
        let bgimg = newDp.style.backgroundImage;
        bgimg = bgimg.replace("url(\"./../../upload","url(\"./../upload");
        bgimg = bgimg.replace("url(\"./../../../../upload","url(\"./../upload");
        newDp.style.backgroundImage = bgimg;
    }

    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="com-wrapper")
        {
            let newCr = dNodeSub.cloneNode(true);
            newCr.draggable=false;
            newCr.innerHTML="";
            if(newCr.className&&newCr.style.backgroundImage)
            {
                let bgimg = newCr.style.backgroundImage;
                bgimg = bgimg.replace("url(\"./../../upload","url(\"./../upload");
                bgimg = bgimg.replace("url(\"./../../../../upload","url(\"./../upload");
                newCr.style.backgroundImage = bgimg;
            }
            for (let node of dNodeSub.childNodes) 
            {
                let comconfigPara = "";
                let comconfigID = "";
                let comconfigViewHtml=null;
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
                        else if(nodeSub.className=="comconfigID")
                        {
                            comconfigID = nodeSub.innerText;
                        }
                        else if(nodeSub.className=="comconfigTitle")
                        {
                            comconfigViewHtml = nodeSub;
                        }
                    }
                    
                    if(comconfigID!="")
                    {
                        let comconfig = {};
                        comconfig["comconfigid"]=comconfigID;
                        let cp = JSON.parse(comconfigPara);
                        comconfig["comid"]=cp.comid;

                        if(cp.comid=="23")
                        {
                            let vobj = comconfigViewHtml.childNodes[0];
                            saveDealDiv(vobj,newDp,savePara,islist,fieldLists);
                            
                            comconfigPara = JSON.stringify(cp);
                            comconfig["comconfigpara"]=comconfigPara;
                            savePara["comconfig"].push(comconfig);

                            continue;
                        }
                        else if(cp.comid=="20")
                        {
                            if(comconfigViewHtml.innerHTML.indexOf("class=\"conTblCell")>0)
                            {
                                saveDealDiv(comconfigViewHtml,newDp,savePara,islist,fieldLists);
                                comconfigPara = JSON.stringify(cp);
                                comconfig["comconfigpara"]=comconfigPara;
                                savePara["comconfig"].push(comconfig);
                                
                                continue;
                            }
                        }

                        comconfig["needval"]=cp.needval;
                        if(cp.temptype)
                        {
                            comconfig["temptype"]=cp.temptype;
                            comconfig["tempcontent"]=cp.tempcontent;
                        }
                        comconfig["field_title"]=cp.config.fieldtitle;
                        comconfig["field_name"]=cp.config.fieldname;
                        comconfig["field_type"]=cp.config.fieldtype;
                        comconfig["field_len"]=cp.config.fieldlen;
                        comconfig["field_show"]=cp.config.fieldshow;

                        if(!islist)
                        {
                            if(cp.config.fieldtxt)
                                comconfig["fieldtxt"]=cp.config.fieldtxt;

                            if(cp.config.fieldinfile)
                                comconfig["field_infile"]=cp.config.fieldinfile;

                            if(cp.fields)
                                comconfig["field_fields"]=cp.fields;

                            if(cp.config.fieldselvalue)
                                comconfig["field_selvalue"]=cp.config.fieldselvalue;
                        }
                        else
                        {
                            if(cp.fields)
                                fieldLists.push({"name":cp.config.fieldname,"title":cp.config.fieldtitle,"fields":cp.fields});
                            else
                            {
                                if(cp.config.fieldtxt&&cp.config.fieldtxt=="1")
                                {
                                    fieldLists.push({"name":cp.config.fieldname,"title":cp.config.fieldtitle+"ID"});
                                    fieldLists.push({"name":cp.config.fieldname+"stxt","title":cp.config.fieldtitle});
                                }
                                else
                                {
                                    fieldLists.push({"name":cp.config.fieldname,"title":cp.config.fieldtitle});
                                }
                            }
                        }
                            
                        if(cp.form)
                        {
                            cp.form.tempcontent = "";
                        }
                        if(cp.code)
                        {
                            for (let k in cp.code) 
                            {
                                if(cp.code[k].tempcontent)
                                {
                                    cp.code[k].tempcontent = "";
                                }
                            }
                        }
                        comconfigPara = JSON.stringify(cp);
                        comconfig["comconfigpara"]=comconfigPara;
                        savePara["comconfig"].push(comconfig);
                        newDv.innerText="[@"+ comconfigID +"@]";
                    }
                    else
                    {
                        //alert("ok");
                    }
                    newCr.appendChild(newDv);
                }
            }
            newDp.appendChild(newCr);
        }
        else if(dNodeSub.className&&(dNodeSub.className.indexOf("conParent")==0))
        {
            saveDealDiv(dNodeSub,newDp,savePara,islist,fieldLists);
        }
        else if(dNodeSub.className&&(dNodeSub.className.indexOf("divopTitle")==0))
        {
            saveDealDiv(dNodeSub,newDp,savePara,islist,fieldLists);
        }
        else if(dNodeSub.className&&(dNodeSub.className.indexOf("conTblCell")==0||dNodeSub.className.indexOf("conTblTh")==0))
        {
            saveDealDiv(dNodeSub,newDp,savePara,islist,fieldLists);
        }
    }
    if(dNode.id!="Inputinitformdatas")
        newDc.appendChild(newDp);
}

function showComconfig()
{
    let sIndex = document.getElementById("con-com").selectedIndex;
    let sValue = document.getElementById("con-com").options[sIndex].value;
    if(sValue!=="")
    {
        let cArrs=sValue.split("|");
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
    dragborder = e.target.style.border;
    dragobj = e.target;
}, false)

document.addEventListener('drag', (e) => {
    //e.target.style.border = '1px dashed red'
})

document.addEventListener('dragend', (e) => {
    //e.target.style.border = dragborder;
}, false)

function selChildByClass(e,cls)
{
    for (let dNode of e.childNodes) 
    {
        if(dNode.className==cls)
        {
            return dNode;
        }
    } 
    return null;
}

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
    if(p.className=="conParent"||p.className=="conParentHidden")
    {
        updConParentWin(msg,callback,p.id)
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
    document.getElementById("color-picker").value=s.borderColor;
    document.getElementById("color-picker").style.borderColor = s.borderColor;
    document.getElementById("con-border-radius").value=s.borderRadius;
    document.getElementById("color-picker1").value=s.backgroundColor;
    document.getElementById("color-picker1").style.borderColor=s.backgroundColor;

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
    document.getElementById("con-display").value=s.display;

    document.getElementById("con-bg-url").value=s.backgroundImage;
    document.getElementById("con-bg-repeat").value=s.backgroundRepeat;
    document.getElementById("con-bg-pos").value=s.backgroundPosition;
    document.getElementById("con-shadow").value=s.boxShadow;
    document.getElementById("con-bg-size").value=s.backgroundSize;
    document.getElementById("con-zindex").value=s.zIndex;

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
                if(comid=="20")
                {
                    let htmlobj = selChildByClass(node,"comconfigTitle");
                    cp.tempcontent = htmlobj.innerHTML;
                }
                
                let sel = document.getElementById("con-com");
                for (let i=0;i<sel.length;i++)
                {
                    let selvalue = sel.options[i].value;
                    cArrs=selvalue.split("|");
                    if(comid==cArrs[0])
                    {
                        sel.options[i].selected=true;
                        let comconfig = cArrs[2];
                        comconfig = "."+ gSpanComImgsrc +"/."+comconfig;
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
function openAddWin(msg,callback,callbackpara,callbackparaSub) 
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

    document.getElementById("con-position").value="relative";
    document.getElementById("con-ptop").value="";
    document.getElementById("con-pbottom").value="";
    document.getElementById("con-pleft").value="";
    document.getElementById("con-pright").value="";

    document.getElementById("con-padding-left").value="";
    document.getElementById("con-padding-top").value="";
    document.getElementById("con-padding-right").value="";
    document.getElementById("con-padding-bottom").value="";

    document.getElementById("con-margin-left").value="";
    document.getElementById("con-margin-top").value="";
    document.getElementById("con-margin-right").value="";
    document.getElementById("con-margin-bottom").value="";

    document.getElementById("con-border-width").value="";
    document.getElementById("con-border-style").value="";
    document.getElementById("color-picker").value="";
    document.getElementById("con-border-radius").value="";
    document.getElementById("color-picker1").value="";

    document.getElementById("con-width").value="100%";
    document.getElementById("con-width-min").value="";
    document.getElementById("con-height").value="fit-content";
    document.getElementById("con-height-min").value="";

    document.getElementById("con-textalign").value="";
    document.getElementById("con-overflow").value="";
    document.getElementById("con-float").value="left";
    document.getElementById("con-display").value="block";

    document.getElementById("con-shadow").value="";
    document.getElementById("con-bg-url").value="";
    document.getElementById("con-bg-repeat").value="";
    document.getElementById("con-bg-pos").value="";
    document.getElementById("con-bg-size").value="";
    document.getElementById("con-zindex").value="";

    document.getElementById("coverWin").style.display="block";
    document.getElementById("updWin").style.display="block";
    window.callback=callback;
    window.callbackpara=callbackpara;
    window.callbackparaSub=callbackparaSub;
}

function openWinOK() 
{
    if(window.callbackparaSub)
        window.callback(window.callbackpara,window.callbackparaSub); 
    else
        window.callback(window.callbackpara); 
}

function closeWin() 
{
    if(!window.hashiddendiv)
    {
        document.getElementById("coverWin").style.display="none";
        document.getElementById("modalWin").style.display="none";
        document.getElementById("updWin").style.display="none";
    }
    else
    {
        document.getElementById("modalWin").style.display="none";
        document.getElementById("updWin").style.display="none";
    }
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
function updConParentWin(msg,callback,callbackpara) 
{
    document.getElementById("divHidden").style.display="none";

    let s1 = document.getElementById("sel-tab1");
    let s2 = document.getElementById("sel-tab2");
    s2.style.display="none";

    if(s2.classList.contains("selected"))
        s2.classList.remove("selected");

    if(!s1.classList.contains("selected"))
        s1.classList.add("selected");
    
    document.getElementById("updWin-sel-tab2").style.display="none";
    document.getElementById("updWin-sel-tab1").style.display="block";
    document.getElementById("conParentId").style.display="block";
    document.getElementById("conParentName").style.display="block";
    document.getElementById("conParentPosition").style.display="block";

    let dnode = document.getElementById(callbackpara);
    let s = dnode.style;

    document.getElementById("con-id").value=dnode.id;
    document.getElementById("con-name").value=dnode.getAttribute("name");
    document.getElementById("con-position").value=s.position;
    document.getElementById("color-picker").value=s.borderColor;
    document.getElementById("color-picker").style.borderColor = s.borderColor;
    document.getElementById("con-border-radius").value=s.borderRadius;
    document.getElementById("color-picker1").value=s.backgroundColor;
    document.getElementById("color-picker1").style.borderColor=s.backgroundColor;

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
    document.getElementById("con-display").value=s.display;

    document.getElementById("con-bg-url").value=s.backgroundImage;
    document.getElementById("con-bg-repeat").value=s.backgroundRepeat;
    document.getElementById("con-bg-pos").value=s.backgroundPosition;
    document.getElementById("con-shadow").value=s.boxShadow;
    document.getElementById("con-bg-size").value=s.backgroundSize;
    document.getElementById("con-zindex").value=s.zIndex;

    document.getElementById("con-pleft").value=s.left;
    document.getElementById("con-pbottom").value=s.bottom;
    document.getElementById("con-pright").value=s.right;
    document.getElementById("con-ptop").value=s.top;

    document.getElementById("con-border-width").value = s.borderWidth;
    document.getElementById("con-border-style").value = s.borderStyle;
    document.getElementById("con-border-radius").value = s.borderRadius;

    document.getElementById("coverWin").style.display="block";
    document.getElementById("updWin").style.display="block";
    
    if(dnode.className=="conParentHidden")
    {
        window.hashiddendiv=true;
        dnode.style.display="block";
        document.getElementById("div-display").style.display="none";
    }
    else
    {
        document.getElementById("div-display").style.display="inline";
    }

    window.callback=updConParent;
    window.callbackpara=callbackpara;
}
function addConParentWin(conDiv) 
{
    document.getElementById("con-hiddendiv").value="no";

    let s1 = document.getElementById("sel-tab1");
    let s2 = document.getElementById("sel-tab2");
    s2.style.display="none";

    if(s2.classList.contains("selected"))
        s2.classList.remove("selected");

    if(!s1.classList.contains("selected"))
        s1.classList.add("selected");
    
    document.getElementById("divHidden").style.display="inline";

    document.getElementById("updWin-sel-tab2").style.display="none";
    document.getElementById("updWin-sel-tab1").style.display="block";
    document.getElementById("conParentId").style.display="block";
    document.getElementById("conParentName").style.display="block";
    document.getElementById("conParentPosition").style.display="block";

    document.getElementById("con-position").value="relative";
    document.getElementById("con-ptop").value="";
    document.getElementById("con-pbottom").value="";
    document.getElementById("con-pleft").value="";
    document.getElementById("con-pright").value="";

    document.getElementById("con-padding-left").value="";
    document.getElementById("con-padding-top").value="";
    document.getElementById("con-padding-right").value="";
    document.getElementById("con-padding-bottom").value="";

    document.getElementById("con-margin-left").value="";
    document.getElementById("con-margin-top").value="";
    document.getElementById("con-margin-right").value="";
    document.getElementById("con-margin-bottom").value="";

    document.getElementById("con-border-width").value="";
    document.getElementById("con-border-style").value="";
    document.getElementById("color-picker").value="";
    document.getElementById("con-border-radius").value="";
    document.getElementById("color-picker1").value="";

    document.getElementById("con-width").value="100%";
    document.getElementById("con-width-min").value="";
    document.getElementById("con-height").value="fit-content";
    document.getElementById("con-height-min").value="";

    document.getElementById("con-textalign").value="";
    document.getElementById("con-overflow").value="";
    document.getElementById("con-float").value="left";
    document.getElementById("con-display").value="block";

    document.getElementById("con-shadow").value="";
    document.getElementById("con-bg-url").value="";
    document.getElementById("con-bg-repeat").value="";
    document.getElementById("con-bg-pos").value="";
    document.getElementById("con-bg-size").value="";
    document.getElementById("con-zindex").value="";

    document.getElementById("coverWin").style.display="block";
    document.getElementById("updWin").style.display="block";
    
    if(gPageName.indexOf("pdf_")==0||gPageName=="temp_tabdiy"||gPageName=="temp_formin")
    {
        document.getElementById("divHidden").style.display="none";
    }

    if(conDiv==null)
        conDiv = document.getElementById("main-wrapper");

    document.getElementById("con-id").value = genUUID();

    window.callback=addConParent;
    window.callbackpara=conDiv;

}
function updConParent(did) 
{

    if(document.getElementById("con-id").value=="")
    {
        alert("Container ID cannot be empty");
        return;
    }
    else
    {
        if(did!=document.getElementById("con-id").value&&comAttrsSet["con#"+document.getElementById("con-id").value])
        {
            alert("This container ID already exists");
            return;  
        }
    }

    let d = document.getElementById(did);
    d.style.boxSizing="border-box";
    d.id=document.getElementById("con-id").value;
    d.setAttribute("name",document.getElementById("con-name").value);
    d.style.position = document.getElementById("con-position").value;
    d.style.top = document.getElementById("con-ptop").value;
    d.style.bottom = document.getElementById("con-pbottom").value;
    d.style.left = document.getElementById("con-pleft").value;
    d.style.right = document.getElementById("con-pright").value;

    //d.style.padding=document.getElementById("con-padding").value;
    d.style.paddingLeft=document.getElementById("con-padding-left").value;
    d.style.paddingTop=document.getElementById("con-padding-top").value;
    d.style.paddingRight=document.getElementById("con-padding-right").value;
    d.style.paddingBottom=document.getElementById("con-padding-bottom").value;

    //d.style.margin=document.getElementById("con-margin").value;
    d.style.marginLeft=document.getElementById("con-margin-left").value;
    d.style.marginTop=document.getElementById("con-margin-top").value;
    d.style.marginRight=document.getElementById("con-margin-right").value;
    d.style.marginBottom=document.getElementById("con-margin-bottom").value;

    d.style.borderWidth=document.getElementById("con-border-width").value;
    d.style.borderStyle=document.getElementById("con-border-style").value;
    d.style.borderColor=document.getElementById("color-picker").value;
    d.style.borderRadius=document.getElementById("con-border-radius").value;
    d.style.backgroundColor=document.getElementById("color-picker1").value;

    d.style.width = document.getElementById("con-width").value;
    d.style.minWidth = document.getElementById("con-width-min").value;
    d.style.height = document.getElementById("con-height").value;
    d.style.minHeight = document.getElementById("con-height-min").value;

    d.style.textAlign = document.getElementById("con-textalign").value;
    d.style.overflow = document.getElementById("con-overflow").value;
    d.style.float = document.getElementById("con-float").value;
    if(!window.hashiddendiv)
        d.style.display = document.getElementById("con-display").value;

    let bgimg = document.getElementById("con-bg-url").value;
    if(gPageName=="temp_formin"||gPageName=="temp_tabdiy")
    {
        bgimg = bgimg.replace("url(\"./../../upload","url(\"./../../../../upload");
    }
    d.style.backgroundImage = bgimg;

    d.style.boxShadow = document.getElementById("con-shadow").value;
    d.style.backgroundRepeat = document.getElementById("con-bg-repeat").value;
    d.style.backgroundPosition = document.getElementById("con-bg-pos").value;
    d.style.backgroundSize = document.getElementById("con-bg-size").value;
    d.style.zIndex =document.getElementById("con-zindex").value;

    genTopMenu(false);
    closeWin();

}
function addConParent(condiv) 
{

    if(document.getElementById("con-id").value=="")
    {
        alert("Container ID cannot be empty");
        return;
    }
    else
    {
        if(comAttrsSet["con#"+document.getElementById("con-id").value])
        {
            alert("This container ID already exists");
            return;  
        }
    }

    let d = document.createElement("div");
    d.style.boxSizing="border-box";
    d.id=document.getElementById("con-id").value;
    d.setAttribute("name",document.getElementById("con-name").value);
    d.style.position = document.getElementById("con-position").value;
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
    d.style.borderColor=document.getElementById("color-picker").value;
    d.style.borderRadius=document.getElementById("con-border-radius").value;
    d.style.backgroundColor=document.getElementById("color-picker1").value;

    d.style.width = document.getElementById("con-width").value;
    d.style.minWidth = document.getElementById("con-width-min").value;
    d.style.height = document.getElementById("con-height").value;
    d.style.minHeight = document.getElementById("con-height-min").value;

    d.style.textAlign = document.getElementById("con-textalign").value;
    d.style.overflow = document.getElementById("con-overflow").value;
    d.style.float = document.getElementById("con-float").value;
    d.style.display = document.getElementById("con-display").value;

    let bgimg = document.getElementById("con-bg-url").value;
    if(gPageName=="temp_formin"||gPageName=="temp_tabdiy")
    {
        bgimg = bgimg.replace("url(\"./../../upload","url(\"./../../../../upload");
    }
    d.style.backgroundImage = bgimg;

    d.style.boxShadow = document.getElementById("con-shadow").value;
    d.style.backgroundRepeat = document.getElementById("con-bg-repeat").value;
    d.style.backgroundPosition = document.getElementById("con-bg-pos").value;
    d.style.backgroundSize = document.getElementById("con-bg-size").value;
    d.style.zIndex =document.getElementById("con-zindex").value;

    let hd = document.getElementById("con-hiddendiv").value;

    let da = document.createElement("div");
    if(hd=="no")
    {
        d.className="conParent";
        da.innerHTML = document.getElementById("template-action-con").innerHTML;
    }
    else
    {
        window.hashiddendiv=true;
        d.className="conParentHidden";
        d.style.display="block";
        da.innerHTML = document.getElementById("hiddendiv-action").innerHTML;
    }

    da.className = "template-action-con";
    d.appendChild(da);

    condiv.appendChild(d);

    genTopMenu(false);
    dragConDivDeal(d);

    closeWin();

}

function genTopMenu(isinit)
{
    let dmr = document.getElementById("main-wrapper");
    let mSc = {};
    mSc['sc']="";
    mSc['scupd']="";

    genTopMenuDealSub(dmr,mSc,isinit);

    document.getElementById("divContainers").innerHTML=mSc['sc'];
    document.getElementById("divContainersUpd").innerHTML=mSc['scupd'];
}
function genTopMenuDealSub(dmr,mSc,isinit)
{
    for (let dNode of dmr.childNodes) 
    {
        if(dNode.className&&dNode.className.indexOf("conParent")==0)
        {
            dNode.draggable=false;

            mSc['sc'] = mSc['sc'] + "<li><a href='#' onclick=\"openAddWin(\'\',addContainer,\'"+ dNode.id +"\');return false\">"+ dNode.getAttribute("name") +"</a></li>";
            mSc['scupd'] = mSc['scupd'] + "<div><span class=\"action-content\" style=\"border:none\">"+ dNode.getAttribute("name") +"</span>";
            mSc['scupd'] = mSc['scupd'] + "<span class=\"action-content\" style=\"float:right\" ><a href='#' onclick=\"updConParentWin('',updConParent,'"+ dNode.id +"');return false\"><img width=\"18\"  src=\"./"+ gSpanImgsrc +"/imgs/update.png\"></a>";
            mSc['scupd'] = mSc['scupd'] + "<a href='#' onclick=\"openWin('Delete child container?',delConParent,'"+ dNode.id +"');return false\"><img width=\"18\"  src=\"./"+ gSpanImgsrc +"/imgs/del.png\"></a></span></div>";
            setConParentParalist(dNode);

            if(isinit)
            {
                dragConDivDeal(dNode);
            }
        }

        genTopMenuDealSub(dNode,mSc,isinit);
    }
}
function dragConDivDeal(dNode)
{

    dNode.addEventListener('dragenter', (e) => {
    }, false)

    dNode.addEventListener('dragover', e => {
        e.preventDefault()
    }, false)

    dNode.addEventListener('drop', e => {
        e.preventDefault();
        let targetElement = e.target;
        let tCls = targetElement.className;
        if(tCls.indexOf("conParent")==0)
        {
            if(dragobj.className=="comitem")
            {
                for(let ci of gComlist)
                {
                    if("comitem"+ci['COMID']==dragobj.id)
                    {
                        if(ci['COMID']!="21")
                        {
                            let comconfig = ci['CONFIG'];
                            comconfig = "."+ gSpanComImgsrc +"/."+comconfig;
                            document.getElementById("compconfig").style.display="block";
                            document.getElementById("compiframe").src=comconfig + "config.html?"+genUUID();
                            openAddWin('',addContainer,targetElement.id);
                            break;
                        }
                        else
                        {
                            addConParentWin(targetElement);
                        }
                    }
                }
            }
            else if(dragobj.className=="com-wrapper")
            { 
                targetElement.appendChild(dragobj);
            }
        }
    }, false)
}
function addContainerByEvent(e) 
{
    let p = e.srcElement.parentElement.parentElement;
    addContainer(p.id);
}

function addContainer(e,o) 
{
    //let sIndex = document.getElementById("con-com").selectedIndex;
    //let sValue = document.getElementById("con-com").options[sIndex].value;
    if(document.getElementById("compconfig").style.display=="block")
    {

        let iw = document.getElementById('compiframe').contentWindow;
        let comconfig = iw.getDataItem();
        if(comconfig==null)
            return;
        
        let pageparas = {};
        getPageParas(pageparas);
        if(pageparas['dataID']&&comconfig.config.fieldname&&comconfig.config.fieldtype)
        {
            let paras = {};
            
            paras['comID'] = "";
            paras['filedName'] = comconfig.config.fieldname;
            paras['dataID'] = pageparas['dataID'];

            that=this;
            axios.post("./../../api/dataformgetfield",paras).then(function(res){
            
                dataField = res.data;
                if(dataField['count']>0)
                {
                    if(dataField['dbtype'])
                    {
                        if(dataField['dbtype']!=comconfig.config.fieldtype)
                        {
                            alert("Database already has data; data type cannot be modified!");
                            return;
                        }
                        else if(dataField['dbtype']=="nvarchar2"&&parseInt(dataField['dblen'])<parseInt(comconfig.config.fieldlen))
                        {
                            alert("Database already has data; field size cannot be reduced!");
                            return;
                        }
                    }
                    else
                    {
                        addContainerDo(e,o);
                        return;
                    }
                }
                else
                {
                    addContainerDo(e,o);
                    return;
                }

            }).catch(function (err) {
            });

        }
        else
        {
            addContainerDo(e,o);
        }
    }
    else
    {
        addContainerDo(e,o);
    }
}

function addContainerDo(e,o)
{
    let d = document.createElement("div");
    let sIndex = document.getElementById("con-com").selectedIndex;
    let sValue = document.getElementById("con-com").options[sIndex].value;
    let dc = document.createElement("div");

    dc.className="comconfigDiv";
    dc.style.boxSizing="border-box";
    dc.style.padding="0px";
    dc.style.margin="0px";
    dc.style.width="100%";
    dc.style.height="100%";
    dc.style.display="none";
    dc.draggable=false;

    let spn = document.createElement("span");
    spn.className="comconfigPara";
    spn.draggable=false;
    spn.style.display="none";
    dc.appendChild(spn);

    let spntitle= document.createElement("span");
    spntitle.className="comconfigTitle";
    spntitle.draggable=false;
    dc.appendChild(spntitle);

    let spnid = document.createElement("span");
    spnid.className="comconfigID";
    spnid.draggable=false;
    spnid.style.display="none";
    dc.appendChild(spnid);

    let divcontent= document.createElement("div");
    if(gPageName.indexOf("pdf_")==0)
    {
        divcontent.className="comconfigContent";
        divcontent.draggable=false;
        dc.appendChild(divcontent);
    }

    if(document.getElementById("compconfig").style.display=="block")
    {
        let iw = document.getElementById('compiframe').contentWindow;
        let comconfig = iw.getDataItem();
        if(comconfig==null)
            return;

        let configid = "wzsoftcom" + genUUID();
        spnid.innerText=configid;
        spn.innerText=JSON.stringify(comconfig);
        if(gPageName.indexOf("pdf_")==0)
        {
            if(comconfig.config.content)
            {
                divcontent.innerHTML = comconfig.config.content;
                if(comconfig.comid=='3004')
                {
                    divcontent.style.fontSize = comconfig.config.fontsize;
                    divcontent.style.fontFamily = comconfig.config.fontfamily;
                    divcontent.style.fontStyle = comconfig.config.fontstyle;
                    divcontent.style.fontWeight = comconfig.config.fontweight;
                    divcontent.style.color = comconfig.config.fontcolor;
                }
            }
        }
        else
        {
            if(gPageName=="temp_tabdiy"&&comconfig.config.isview!=null)
            {
                d.setAttribute("v-show", comconfig.config.isview);
            }

            spntitle.innerHTML = "<b>" + comconfig.comname + "</b>:" + comconfig.comtitle;
            spntitle.style.float="left";
            spntitle.style.boxSizing="border-box";
            spntitle.style.width="100%";
            if(comconfig.config.viewhtml)
            {
                if(comconfig.comid=="1008"||comconfig.comid=="6001")
                {
                    if(gPageName=="temp_formin")
                        comconfig.config.viewhtml = comconfig.config.viewhtml.replaceAll("htmleditorhtml","./../../../../manage/editor.html");
                    else
                        comconfig.config.viewhtml = comconfig.config.viewhtml.replaceAll("htmleditorhtml","./../../manage/editor.html");
                }
                spntitle.innerHTML = comconfig.config.viewhtml;
            }
            if(comconfig.config.fieldtitle)
            {
                setCodeParalist(configid,comconfig);
            }
        }
        dc.style.display="block";
    }

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
    d.style.borderColor=document.getElementById("color-picker").value;
    d.style.borderRadius=document.getElementById("con-border-radius").value;
    d.style.backgroundColor=document.getElementById("color-picker1").value;

    d.style.width = document.getElementById("con-width").value;
    d.style.minWidth = document.getElementById("con-width-min").value;
    d.style.height = document.getElementById("con-height").value;
    d.style.minHeight = document.getElementById("con-height-min").value;

    d.style.textAlign = document.getElementById("con-textalign").value;
    d.style.overflow = document.getElementById("con-overflow").value;
    d.style.float = document.getElementById("con-float").value;
    d.style.display = document.getElementById("con-display").value;

    let bgimg = document.getElementById("con-bg-url").value;
    if(gPageName=="temp_formin"||gPageName=="temp_tabdiy")
    {
        bgimg = bgimg.replace("url(\"./../../upload","url(\"./../../../../upload");
    }
    d.style.backgroundImage = bgimg;

    d.style.boxShadow = document.getElementById("con-shadow").value;
    d.style.backgroundRepeat = document.getElementById("con-bg-repeat").value;
    d.style.backgroundPosition = document.getElementById("con-bg-pos").value;
    d.style.backgroundSize = document.getElementById("con-bg-size").value;
    d.style.zIndex =document.getElementById("con-zindex").value;

    d.addEventListener('dragenter', (e) => {
    }, false)

    d.addEventListener('dragover', e => {
        e.preventDefault()
        let p = e.target.parentNode;
        let targetElement = e.target;
        if(targetElement.className=="com-wrapper"&&dragobj.className=="com-wrapper")
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
        e.preventDefault();
        let targetElement = e.target;
        let tCls = targetElement.parentElement.parentElement.parentElement.parentElement.className;
        let pid = targetElement.parentElement.parentElement.parentElement.parentElement.parentElement.id;
        let obj = targetElement.parentElement.parentElement.parentElement.parentElement;
        if(tCls.indexOf("com-wrapper")==0)
        {
            if(dragobj.className=="comitem")
            {
                for(let ci of gComlist)
                {
                    if("comitem"+ci['COMID']==dragobj.id)
                    {
                        if(ci['COMID']!="21")
                        {
                            let comconfig = ci['CONFIG'];
                            comconfig = "."+ gSpanComImgsrc +"/."+comconfig;
                            document.getElementById("compconfig").style.display="block";
                            document.getElementById("compiframe").src=comconfig + "config.html?"+genUUID();
                            openAddWin('',addContainer,pid,obj);
                            break;
                        }
                    }
                }
            }
        }
    }, false)

    let da = document.createElement("div");
    da.innerHTML = document.getElementById("template-action").innerHTML;
    da.className = "template-action";

    d.appendChild(da);
    d.appendChild(dc);

    if(spnid.innerText!="")
    {
        if(o)
        {
            document.getElementById(e).insertBefore(d,o);
        }
        else
        {
            document.getElementById(e).appendChild(d); 
        }
    }

    closeWin();
}
function updContainer(e) 
{
    let spnid = null;
    for (let node of e.srcElement.parentElement.parentElement.childNodes) 
    {
        for (let nodeSub of node.childNodes) 
        {
            if(nodeSub.className=="comconfigID")
                spnid=nodeSub;
        }
    }

    let sIndex = document.getElementById("con-com").selectedIndex;
    let sValue = document.getElementById("con-com").options[sIndex].value;
    if(sValue!=""&&document.getElementById("compconfig").style.display=="block")
    {
        let iw = document.getElementById('compiframe').contentWindow;
        let comconfig = iw.getDataItem();
        if(comconfig==null)
            return;

        let pageparas = {};
        getPageParas(pageparas);
        if(pageparas['dataID']&&comconfig.config.fieldname&&comconfig.config.fieldtype)
        {
            let paras = {};

            let configid=spnid.innerText;
            paras['comID'] = configid;
            paras['filedName'] = comconfig.config.fieldname;
            paras['dataID'] = pageparas['dataID'];
            
            that=this;
            axios.post("./../../api/dataformgetfield",paras).then(function(res){
            
                let dataField = res.data;
                if(dataField['count']>0)
                {
                    if(dataField['dbtype'])
                    {
                        let ftype=comconfig.config.fieldtype;
                        if(ftype=='datetime')
                            ftype = 'date';
                        if(dataField['dbtype']!=ftype)
                        {
                            alert("Database already has data; data type cannot be modified!");
                            return;
                        }
                        else if(dataField['dbtype']=="nvarchar2"&&parseInt(dataField['dblen'])>parseInt(comconfig.config.fieldlen))
                        {
                            alert("Database already has data; field size cannot be reduced!");
                            return;
                        }
                    }
                }

                if(dataField['fieldname']&&dataField['fieldname']!=comconfig.config.fieldname)
                {
                    let r = confirm("The field in this component database: "+ dataField['fieldname'] +", Do you still want to force the field name change? If there are multiple FormDatasets, this may affect other forms.\n \n Click OK to force the change.");
                    if(!r)
                    {
                        return;
                    }
                    else
                    {
                        updContainerDo(e);
                        return;
                    }
                }

                updContainerDo(e);
                return;

            }).catch(function (err) {
            });
        }
        else
        {
            updContainerDo(e);
        }
    }
    else
    {
        updContainerDo(e);
    }
}
function updContainerDo(e) 
{
    let d = e.srcElement.parentElement.parentElement;
    let p=e.srcElement.parentElement;
    if(p.className=="conParent"||p.className=="conParentHidden")
    {
        updConParent(e);
        return;
    }

    let dc = null;
    let spn = null;
    let spntitle = null;
    let spnid = null;
    let img=null;
    let divcontent = null;

    for (let node of e.srcElement.parentElement.parentElement.childNodes) 
    {
        if(node.className=="comconfigDiv")
        {
            dc=node;
        }

        for (let nodeSub of node.childNodes) 
        {
            if(nodeSub.className=="comconfigPic")
                img=nodeSub;
            if(nodeSub.className=="comconfigPara")
                spn=nodeSub;
            if(nodeSub.className=="comconfigID")
                spnid=nodeSub;
            if(nodeSub.className=="comconfigTitle")
                spntitle=nodeSub;
            if(nodeSub.className=="comconfigContent")
                divcontent=nodeSub;
        }
    }

    let sIndex = document.getElementById("con-com").selectedIndex;
    let sValue = document.getElementById("con-com").options[sIndex].value;
    if(sValue!=""&&document.getElementById("compconfig").style.display=="block")
    {
        let iw = document.getElementById('compiframe').contentWindow;
        let comconfig = iw.getDataItem();
        if(comconfig==null)
            return;
        spn.innerText=JSON.stringify(comconfig);
        let configid=spnid.innerText;

        if(gPageName.indexOf("pdf_")==0)
        {
            if(comconfig.config.content)
            {
                divcontent.innerHTML = comconfig.config.content;
                if(comconfig.comid=='3004')
                {
                    divcontent.style.fontSize = comconfig.config.fontsize;
                    divcontent.style.fontFamily = comconfig.config.fontfamily;
                    divcontent.style.fontStyle = comconfig.config.fontstyle;
                    divcontent.style.fontWeight = comconfig.config.fontweight;
                    divcontent.style.color = comconfig.config.fontcolor;
                }
            }
        }
        else
        {
            if(gPageName=="temp_tabdiy"&&comconfig.config.isview!=null)
            {
                d.setAttribute("v-show", comconfig.config.isview);
            }

            spntitle.innerHTML = "<b>" + comconfig.comname + "</b>:" + comconfig.comtitle;
            spntitle.style.float="left";
            spntitle.style.boxSizing="border-box";
            spntitle.style.width="100%";
            if(comconfig.config.viewhtml)
            {
                if(comconfig.comid=="1008"||comconfig.comid=="6001")
                {
                    if(gPageName=="temp_formin")
                        comconfig.config.viewhtml = comconfig.config.viewhtml.replaceAll("htmleditorhtml","./../../../../manage/editor.html");
                    else
                        comconfig.config.viewhtml = comconfig.config.viewhtml.replaceAll("htmleditorhtml","./../../manage/editor.html");
                }
                spntitle.innerHTML = comconfig.config.viewhtml;
            }
            if(comconfig.config.fieldtitle)
            {
                setCodeParalist(configid,comconfig);
            }
        }

        dc.style.display="block";
    }
    else
    {
        dc.style.display="none";
        spn.innerText="";
        spnid.innerText="";
        img.src="";
    }

    
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
    d.style.borderColor=document.getElementById("color-picker").value;
    d.style.borderRadius=document.getElementById("con-border-radius").value;
    d.style.backgroundColor=document.getElementById("color-picker1").value;

    d.style.width = document.getElementById("con-width").value;
    d.style.minWidth = document.getElementById("con-width-min").value;
    d.style.height = document.getElementById("con-height").value;
    d.style.minHeight = document.getElementById("con-height-min").value;

    d.style.textAlign = document.getElementById("con-textalign").value;
    d.style.overflow = document.getElementById("con-overflow").value;
    d.style.float = document.getElementById("con-float").value;
    d.style.display = document.getElementById("con-display").value;

    let bgimg = document.getElementById("con-bg-url").value;
    if(gPageName=="temp_formin"||gPageName=="temp_tabdiy")
    {
        bgimg = bgimg.replace("url(\"./../../upload","url(\"./../../../../upload");
    }
    d.style.backgroundImage = bgimg;

    d.style.boxShadow = document.getElementById("con-shadow").value;
    d.style.backgroundRepeat = document.getElementById("con-bg-repeat").value;
    d.style.backgroundPosition = document.getElementById("con-bg-pos").value;
    d.style.backgroundSize = document.getElementById("con-bg-size").value;
    d.style.zIndex =document.getElementById("con-zindex").value;

    closeWin();
}

function setCodeParalist(configid,comconfig)
{
    let attrs = [];
    let nsub="";
    if(gPageName=="temp_formin")
        nsub = "SubDataForm|";

    for (let k in comconfig.attrget) 
    {
        let sK = configid+"."+k;
        let sAttr = comconfig.config.fieldtitle + "." + k;
        comAttrsField[sK]=comconfig.attrget[k];

        if(comconfig.fields!=null)
            sK="lst_"+sK;
        else
            sK="nml_"+sK;

        attrs.push({"name":nsub+sAttr,"key":sK});

        if(comconfig.fields!=null&&k=='ListData')
        {
            let arrfields = [];
            arrfields = comconfig.fields;
            for(let item of arrfields)
            {
                let subK = sK+"_entry."+item['name'];
                let subAttr = sAttr+"_entry."+item['title'];
                attrs.push({"name":nsub+subAttr,"key":subK});
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
        attrs.push({"name":nsub+sAttr,"key":sK});
        if(comconfig.fields!=null&&k=='ListData')
        {
            let arrfields = [];
            arrfields = comconfig.fields;
            for(let item of arrfields)
            {
                let subK = sK+"_entry."+item['name'];
                let subAttr = sAttr+"_entry."+item['title'];
                attrs.push({"name":nsub+subAttr,"key":subK});
            }
        }
    }
    comAttrsSet[configid]=attrs;
}

function setConParentParalist(dnode)
{
    let attrs = [];
    let sK = "nml_con#"+ dnode.id +".display";
    let sAttr = "Container"+ dnode.getAttribute("name") + ".Display";
    attrs.push({"name":sAttr,"key":sK});
    comAttrsSet["con#"+dnode.id]=attrs;
}

function copyCom(e)
{
    let p = e.target.parentElement.parentElement;
    window.gcopyConParent = p;
    if(p.className&&p.className.indexOf("conParent")==0)
        localStorage.setItem("gCopyedCom",p.innerHTML);
    alert("Copied");
}

function copyCon(e)
{
    let p = e.target.parentElement.parentElement;
    window.gcopyConParent = p;
    alert("Copied");
}

function pasteCom()
{
    let p = window.gcopyConParent;
    let tblCell = window.gcopyTblCell;
    if(tblCell!=null)
    {
        if(p!=null)
        {
            let pn = p.cloneNode();
            pn.innerHTML = p.innerHTML;
            pasteDealDiv(pn);
            tblCell.appendChild(pn);
            window.gcopyTblCell=null;
        }
    }
    else if(p!=null)
    {
        let pp =p.parentElement;
        let pn = p.cloneNode();
        pn.innerHTML = p.innerHTML;
        if(pn.className&&pn.className=='conParentpdfpage')
        {
            dragConDivDeal(pn);
        }
        pasteDealDiv(pn);
        pp.appendChild(pn);
        if(pn.className.indexOf("conParent")==0)
        {
            genTopMenu();
        }
    }
}

function pasteComSub(e)
{
    let c = localStorage.getItem("gCopyedCom");
    if(c&&c!="")
    {
        let pp =e.target.parentElement.parentElement;
        pp.innerHTML = c;
        pasteDealDivSub(pp);
    }
}

function pasteDealDivSub(dNode)
{
    if(dNode.className&&(dNode.className.indexOf("conParent")==0))
    {
        for (let dNodeSub of dNode.childNodes) 
        {
            pasteDealDivSub(dNodeSub);
        }
    }
    else if(dNode.className=="com-wrapper")
    {
        for (let node of dNode.childNodes) 
        {
            if(node.className=="comconfigDiv")
            {
                for (let nodeSub of node.childNodes) 
                {
                    if(nodeSub.className=="comconfigID")
                    {
                        nodeSub.innerText = "wzsoftcom" + genUUID();
                    }
                }
            }
        }
    }
}

function pasteDealDiv(dNode)
{
    if(dNode.className&&dNode.className.indexOf("conParent")==0)
    {
        dNode.id = genUUID();
    }
    if(dNode.className=="com-wrapper")
    {
        for (let node of dNode.childNodes) 
        {
            if(node.className=="comconfigDiv")
            {
                for (let nodeSub of node.childNodes) 
                {
                    if(nodeSub.className=="comconfigID")
                    {
                        nodeSub.innerText = "wzsoftcom" + genUUID();
                    }
                }
            }
        }
    }
    else if(dNode.className&&(dNode.className.indexOf("conParent")==0))
    {
        for (let dNodeSub of dNode.childNodes) 
        {
            pasteDealDiv(dNodeSub);
        }
    }

}

function delConParent(did)
{
    let d = document.getElementById(did);
    let dcls = d.className;

    dealDelCon(d);

    let p = d.parentElement;
    p.removeChild(d);
    closeWin();

    if(dcls=="conParent"||p.className=="conParentHidden")
    {
        genTopMenu(false);
        return;
    }
}
function hiddenContainer(e) 
{
    let d = e.srcElement.parentElement.parentElement;
    d.style.display="none";
    document.getElementById("coverWin").style.display="none";
    window.hashiddendiv=false;
}
function delContainer(e) 
{
    let d = e.srcElement.parentElement.parentElement;
    let dcls = d.className;

    dealDelCon(d);

    let p = d.parentElement;
    p.removeChild(d);
    closeWin();

    if(dcls=="conParent"||p.className=="conParentHidden")
    {
        genTopMenu(false);
        return;
    }

}

function dealDelCon(dNode)
{
    let spnid = null;
    if(dNode.className=="conParent"||dNode.className=="conParentHidden")
    {
        let conid="con#"+dNode.id;
        comAttrsSet[conid]=[];
        for (let node of dNode.childNodes) 
        {
            dealDelCon(node);
        }
    }
    else if(dNode.className=="com-wrapper")
    {
        for (let node of dNode.childNodes) 
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
}

function showComList()
{
    
    if(document.getElementById("comlist").style.display=='none')
    {
        getComlist();
        document.getElementById("comlist").style.display='block';

        if(gPageName.indexOf("pdf_")==0)
        {
            document.getElementById("main-wrapper").style.top='128px';
        }
        else if(gPageName=="temp_tabdiy")
        {
            document.getElementById("main-wrapper").style.top='128px';
        }
        else
            document.getElementById("main-wrapper").style.top='250px';
    }
    else
    {
        document.getElementById("comlist").style.display='none';
        document.getElementById("main-wrapper").style.top='50px';
    }
}

function getPageInitData()
{
    document.getElementById("main-wrapper-info").style.display="none";

    let paras = {};
    getPageParas(paras);
    if(!paras['dataID']&&!paras['pageID'])
    {
        paras['dataID'] = "0";
    }

    that=this;
    axios.post("./"+ gSpanApi +"/../api/codegetdatapara",paras).then(function(res){
    
        paraMap = res.data;
        if(paraMap['list'])
        {
            window.varGLists = paraMap['list'];
            for(let item of window.varGLists)
            {
                item['ptype']="sys";
            }
        }

        if(paraMap['html'])
        {
            document.getElementById("updWin").innerHTML=paraMap['html'];
            getComlist();
        }
         
        Colorpicker.create({
            el: "color-picker", 
            color: "", 
            change: function (elem, hex) {
                elem.style.borderColor = hex;
                elem.value=hex;
            }
            });
            
            Colorpicker.create({
            el: "color-picker1", 
            color: "", 
            change: function (elem, hex) {
                elem.style.borderColor = hex;
                elem.value=hex;
            }
            })

    }).catch(function (err) {
    });
}

function getComlist()
{
    let paras = {};
    paras['viewCode']="com";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    paras['filter_open_equal']="1";
    paras['order_snum_asc']="";
    if(gPageName.indexOf("pdf_")==0)
    {
        document.getElementById("selform").innerHTML="&nbsp;";
        paras['filter_searchkey_like']="PDF";
    }
    else if(gPageName=="temp_tabdiy")
    {
        document.getElementById("selform").innerHTML="&nbsp;";
        paras['filter_searchkey_like']="TABDIY";
    }
    else
        paras['filter_searchkey_like']="PAGE";

    var that = this;
    axios.post("./"+ gSpanApi +"/../api/datalist",paras).then(function(res){
        that.datas=Object.values(res.data)[0];   
        gComlist=that.datas;
        
        let s = document.getElementById("con-com");
        s.options.length=0
        s.add(new Option("",""));
        for( let item of that.datas)
        {
            s.add(new Option(item['NAME'],item['COMID']+'|'+item['PIC']+'|'+item['CONFIG']));
        }

        let comlistspage = document.getElementById("comlist-selpage");
        let comlistsform = document.getElementById("comlist-selform");
        comlistspage.innerHTML="";
        comlistsform.innerHTML="";
        for( let item of that.datas)
        {
            let dc = document.createElement("div");
            dc.draggable=true;
            dc.style.width="152px";
            dc.className="comitem";
            let comconfig = item['CONFIG'];

            comconfig = "."+ gSpanComImgsrc +"/."+ comconfig + "icon.png";
            
            dc.id="comitem"+item['COMID'];
            dc.innerHTML="<div style='float:left;width:30px;padding:3px' ><img draggable=false src='"+ comconfig +"' width='26px'/></div><div style='float:left;padding-left:6px'>"+ item['NAME'] +"</div>";

            if(item['TYPE'].indexOf("FORM")>=0)
                comlistsform.appendChild(dc);
            else
                comlistspage.appendChild(dc); 
        }

    }).catch(function (err) {
    });

}

function varSelShowFile(e)
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

function  fileUpload()
{
    let file = document.getElementById("bgfile").files[0];
    let fv = document.getElementById("bgfile").value;
    fv = fv.substring(fv.indexOf(".")+1);
    let params = new FormData();
    params.append('file', file)
    axios({
        url: "./"+ gSpanApi +"/../api/uploadFile",
        method: "post",
        data: params,
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(function(res)
    {
        window.bgfileContent=res.data;
        document.getElementById("fileUpded").style.display="block";
        document.getElementById("fileUpd").style.display="none";
        document.getElementById("fileHref").innerText=window.bgfileContent['fileName'];

        }).catch(function (err) {
        });
}
function fileDelete()
{
    window.bgfileContent={};
    document.getElementById("fileUpded").style.display="none";
    document.getElementById("fileUpd").style.display="block";
}

function fileDownload()
{
    axios({
        url: './'+ gSpanApi +'/../api/downloadFile',
        method: 'POST',
        data:{"fileGuid":window.bgfileContent['fileGUID']},
        responseType: 'blob', // important
    }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', window.bgfileContent['fileName']);
        document.body.appendChild(link);
        link.click();
    });
}
function imgAdd(e)
{

    if(gPageName=="temp_formin")
    {
        document.getElementById("con-bg-url").value="url(./../../../../upload/" + window.bgfileContent['filePath']+")";
    }
    else
    {
        document.getElementById("con-bg-url").value="url(./../../upload/" + window.bgfileContent['filePath']+")";
    }

    document.getElementById("divFile").style.display="none";
}

function closeAdd(e)
{
    let p = e.target;
    p.parentElement.style.display="none"
}

function addConPDfPage() 
{
    let d = document.getElementById("pdfpage");
    let dc = d.cloneNode(true);
    dc.id="pdf"+genUUID();
    dc.style.display="block";
    dc.style.position="relative";
    dc.style.float="left";

    let da = document.createElement("div");
    da.innerHTML = document.getElementById("template-action-pdf").innerHTML;
    da.className = "template-action-con";
    dc.appendChild(da);

    dragConDivDeal(dc);

    document.getElementById("main-wrapper").appendChild(dc);

}

function gDivopClick(e,dguid,bg,bgover,fcolor,fcolorsel)
{
    let p = e.target;
    let pid = p.id;
    pid=pid.substring(6);
    let pc = document.getElementById("divopcon"+dguid);
    for(let dNode of pc.childNodes)
    {
        let did = dNode.id;
        if(did.indexOf("divopc")==0)
        {
            if(dNode.id=="divopc"+pid)
            {
                dNode.style.display="block";
            }
            else
            {
                dNode.style.display="none";
            }
        }
    }

    let pp = document.getElementById("divoptitle"+dguid);
    for(let dNode of pp.childNodes)
    {
        let did = dNode.id;
        if(did.indexOf("divopt")==0)
        {
            if(dNode.id=="divopt"+pid)
            {
                dNode.style.backgroundColor=bgover;
                dNode.style.fontcolor=fcolorsel;
            }
            else
            {
                dNode.style.backgroundColor=bg;
                dNode.style.fontcolor=fcolor;
            }
        }
    }
}


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
        if(document.getElementById("intTempContent")&&document.getElementById("intTempContent").value!="")
        {
            this.dataitem = JSON.parse(document.getElementById("intTempContent").value);
        }
    }
}

Vue.createApp(TempContentVue).mount('#tempContentVue')