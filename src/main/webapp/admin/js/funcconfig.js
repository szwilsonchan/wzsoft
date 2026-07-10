
if(!parent.gIsDateForm&&!parent.gIsFormIn)
{
    if(document.getElementById("inpDbField"))
        document.getElementById("inpDbField").style.display="none";
}
if(parent.gIsFormIn)
{
    if(document.getElementById("inpDbField"))
        document.getElementById("inpDbField").style.display="none";
}

function selCloseAdd(e)
{
    let p = e.target;
    p.parentElement.style.display="none"
}
function selFieldAdd(e)
{
    let p = e.target.parentElement;
    let dNode = p.childNodes[0];
    let k=dNode.options[dNode.selectedIndex].value;
    let v=dNode.options[dNode.selectedIndex].text;
    if(k=="")
    {
        alert("Please selectField");
        return;
    }
    let ditem = window.getDataItemSub();
    ditem['config']['fieldname']=k.toUpperCase();
    ditem['config']['fieldtitle']=v;
    selCloseAdd(e);
}

function selFieldGetDbFields(e)
{
    if(!parent.gIsDateForm&&!parent.gIsFormIn)
    {
        return;
    }

    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for( let item of parent.varGDataFileds)
            {
                s.add(new Option(item['FIELD_TITLE'],item['FIELD']));
            }

            break;
        }
    }
}
function gCheckFieldName(str)
{
    if(!parent.gIsDateForm&&!parent.gIsFormIn)
    {
        return 1;
    }

    let n= str.search(/^[a-z][a-z0-9]*$/i);
    if(n!=-1)
    {
        if(str.trim().length>20)
        {
            n=-1;
        }
    }
    return n;
}

function gCheckFieldlen(str)
{
    let n= str.search(/^[1-9][0-9]*$/i);
    if(n!=-1)
    {
        if(str>2000)
        {
            n=-1;
        }
    }
    return n;
}

function gCheckField(name,len)
{
    let msg="";
    if(gCheckFieldName(name)==-1)
    {
        msg = msg + "Field must start with English letter, only letters and numbers, AND length <=20;\n";
    }
    if(gCheckFieldlen(len)==-1)
    {
        msg = msg + "Length must be a number >0 and <2000;";
    }
    return msg;
}

function gInitConfig()
{
    let bm = parent.gIsMobilePage;
    let ditem = window.getDataItemSub();
    if(!bm)
    {
        ditem['config']['apptype']="1";
        ditem['config']['titleshow']=true;
        ditem['config']['titlealign']="right";
        ditem['config']['titlewidth']="15%";
        ditem['config']['namewidth']="85%";
        ditem['config']['itemheight']="36px";
        ditem['config']['itemfontsize']="16px";
    }
    else
    {
        ditem['config']['apptype']="2";
        ditem['config']['titleshow']=true;
        ditem['config']['titlealign']="left";
        ditem['config']['titlewidth']="95%";
        ditem['config']['namewidth']="95%";
        ditem['config']['itemheight']="80px";
        ditem['config']['itemfontsize']="36px";
    }

    if(parent.gIsPortalRight)
    {
        ditem['config']['pubtype']="portal/";
    }
    else
    {
        ditem['config']['pubtype']="";
    }

}

function gChangeStyles()
{
    let ditem = window.getDataItemSub();
    let apptype = ditem['config']['apptype'];
    if(apptype=="1")
    {
        ditem['config']['titleshow']=true;
        ditem['config']['titlealign']="right";
        ditem['config']['titlewidth']="15%";
        ditem['config']['namewidth']="85%";
        ditem['config']['itemheight']="36px";
        ditem['config']['itemfontsize']="16px";
    }
    else
    {
        ditem['config']['titleshow']=true;
        ditem['config']['titlealign']="left";
        ditem['config']['titlewidth']="95%";
        ditem['config']['namewidth']="95%";
        ditem['config']['itemheight']="80px";
        ditem['config']['itemfontsize']="36px";
    }
}

function gGetGUIDID()
{
    var guid = "";
    for (var i=1; i<=32; i++){
        var n = Math.floor(Math.random()*16.0).toString(16);
        guid +=   n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "";
    }
    return guid;
}