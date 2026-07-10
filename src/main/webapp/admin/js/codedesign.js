
window.callback=null;
window.callbackpara=null;
var dragborder="11";
var dragobj=null;
var comconfigPara=null;
var paracomSetAttrs=[];
var paracomGetAttrs=[];
var paraVarInit=[];
var dataTblLists=[];
var gCodeLists=[];
var gCodeFrontLists=[];
var msgLists=[];
var varGLists = [];
var gCodeID="";
var gCodeType="";
var gCodeFile = "";
var formCom =false;
var gCodeOpen="0";
var isJava=true;
var gDbType="";
var gdivClass = ",varOpDiv,varConDiv,varSelDiv,varSelFieldDiv,varSelDivFilter,varSelDivGroup,varSelDivPara,";
var gdivClassCode = ",msgDiv,insObjlistDiv,insDbDiv,jsSrcDiv,subcodeJSDiv,subcodeDiv,delDbDiv,updDbDiv,jsHrefDiv,assignDiv,ifDiv,whileDiv,assignDbDiv,assignSubSqlDiv,assignSqlFilterDiv,forDiv,";

class cpilerChkAssign 
{
    //F=DOF|D
    //D=V|C|(F)
    //O='+'|'-'|'*'|'/'';

    constructor() {

    }

    chkMain(str)
    {
        let objv={};
        let c = "";
        objv['v']=str;
        objv['index']=0;

        c = objv['v'].substring(objv['index'],1);
        let chkok = this.chk_F(c,objv);

        if(objv['v'].length>(objv['index']+1))
        {
            chkok=false;
        }

        return chkok;
    }

    chk_F(c,objv)
    {

        //DOF
        let isok = false;
        let c1="";
        isok = this.chk_D(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_O(c1,objv);
            if(isok)
            {
                objv['index'] = objv['index'] +1;
                c1 = objv['v'].substring(objv['index'],objv['index']+1);

                isok = this.chk_F(c1,objv);
                if(isok)
                {
                    return true;
                }
                else
                {
                    objv['index'] = objv['index'] - 2;  
                }
            } 
            else
            {
                objv['index'] = objv['index'] - 1; 
            }

            return true;
        }

    }
    chk_D(c,objv)
    {
        if(c=="v"||c=="c")
            return true;
        else
        {
            if(c=="(")
            {
                let isok = false;

                objv['index'] = objv['index'] +1;
                c = objv['v'].substring(objv['index'],objv['index']+1);

                isok = this.chk_F(c,objv);
                if(!isok)
                {
                    objv['index'] = objv['index'] -1;
                    return false;
                }

                objv['index'] = objv['index'] +1;
                c = objv['v'].substring(objv['index'],objv['index']+1);

                if(c==")")
                {
                    return true;
                }
                else
                {
                    objv['index'] = objv['index'] -2;
                    return false;
                }
            }
        }
    }
    chk_O(c,objv)
    {
        if(c=="+"||c=="-"||c=="*"||c=="/")
            return true;
        else
            return false;
    }

}

class cpilerChkDbFilter 
{
    // F=EAF|E
    // E=LOD|(F)
    // L='l'
    // A='a'
    // O='o'
    // D='v'|'c'

    constructor() {

    }

    chkMain(str)
    {
        let objv={};
        let c = "";
        objv['v']=str.trim();
        objv['index']=0;

        c = objv['v'].substring(objv['index'],1);
        let chkok = this.chk_F(c,objv);

        if(objv['v'].length>(objv['index']+1))
        {
            chkok=false;
        }
        return chkok;
        
    }

    chk_F(c,objv)
    {
        let isok = false;
        let c1="";

        //EAF
        isok = this.chk_E(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_A(c1,objv);
            if(isok)
            {
                objv['index'] = objv['index'] +1;
                c1 = objv['v'].substring(objv['index'],objv['index']+1);

                isok = this.chk_F(c1,objv);
                if(isok)
                {
                    return true;
                }
                else
                {
                    objv['index'] = objv['index'] - 2;  
                }
            } 
            else
            {
                objv['index'] = objv['index'] - 1; 
            }

            return true;
        }

        return false;
    }
    chk_E(c,objv)
    {

        let isok = false;
        //(F)
        let c1="";
        if(c=="(")
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_F(c1,objv);
            if(!isok)
            {
                objv['index'] = objv['index'] -1;
            }
            else
            {
                objv['index'] = objv['index'] +1;
                c1 = objv['v'].substring(objv['index'],objv['index']+1);
                if(c1==")")
                {
                    return true;
                }
                else
                {
                    objv['index'] = objv['index'] -2;
                }
            }
        }

        //LOD
        isok = this.chk_L(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_O(c1,objv);
            if(isok)
            {
                objv['index'] = objv['index'] +1;
                c1 = objv['v'].substring(objv['index'],objv['index']+1);

                isok = this.chk_D(c1,objv);
                if(isok)
                {
                    return true;
                }
                else
                {
                    objv['index'] = objv['index'] - 2;  
                }
            } 
            else
            {
                objv['index'] = objv['index'] - 1; 
            }
        }
        return false;
    }

    chk_D(c,objv)
    {
        if(c=="v"||c=="c")
            return true;
        else
            return false;
    }

    chk_O(c,objv)
    {
        if(c=="o")
            return true;
        else
            return false;
    }

    chk_A(c,objv)
    {
        if(c=="a")
            return true;
        else
            return false;
    }

    chk_L(c,objv)
    {
        if(c=="l")
            return true;
        else
            return false;
    }

}

class cpilerChkDbJoin 
{
    // F=DT
    // T=JDNG
    // G=CH|C
    // C=EOE
    // H=AC
    // D='d'
    // J='j'
    // E='e'
    // 0='o'
    // N='n'
    // A='a'

    constructor() {

    }

    chkMain(str)
    {
        let objv={};
        let c = "";
        objv['v']=str.trim();
        objv['index']=0;

        c = objv['v'].substring(objv['index'],1);
        let chkok = this.chk_F(c,objv);

        if(objv['v'].length>(objv['index']+1))
        {
            chkok=false;
        }
        return chkok;
    }
    chk_F(c,objv)
    {
        let isok = false;
        let c1="";

        //DT
        isok = this.chk_D(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_T(c1,objv);
            if(isok)
            {
                return true;
            } 
            else
            {
                objv['index'] = objv['index'] - 3; 
            }
        }

        return false;
    }
    chk_T(c,objv)
    {
        let isok = false;
        let c1="";

        //JDNG
        isok = this.chk_J(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_D(c1,objv);
            if(isok)
            {
                objv['index'] = objv['index'] +1;
                c1 = objv['v'].substring(objv['index'],objv['index']+1);

                isok = this.chk_N(c1,objv);
                if(isok)
                {
                    objv['index'] = objv['index'] +1;
                    c1 = objv['v'].substring(objv['index'],objv['index']+1);

                    isok = this.chk_G(c1,objv);
                    if(isok)
                    {
                        objv['index'] = objv['index'] +1;
                        c1 = objv['v'].substring(objv['index'],objv['index']+1);
                        if(c1=="j")
                        {
                            return this.chk_T(c1,objv);
                        }
                        else
                        {
                            objv['index'] = objv['index'] - 1; 
                        }
                        return true;
                    }
                    else
                    {
                        objv['index'] = objv['index'] - 3;  
                    }
                }
                else
                {
                    objv['index'] = objv['index'] - 2;  
                }
            } 
            else
            {
                objv['index'] = objv['index'] - 1; 
            }
        }

        return false;
    }
    chk_G(c,objv)
    {
        let isok = false;
        let c1="";

        //CH
        isok = this.chk_C(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_H(c1,objv);
            if(isok)
            {
                return true;
            } 
            else
            {
                objv['index'] = objv['index'] - 3; 
            }
        }

        //C
        isok = this.chk_C(c,objv);
        if(isok)
        {
            return true;
        }

        return false;
    }
    chk_H(c,objv)
    {
        let isok = false;
        let c1="";

        //AC
        isok = this.chk_A(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_C(c1,objv);
            if(isok)
            {
                objv['index'] = objv['index'] +1;
                c1 = objv['v'].substring(objv['index'],objv['index']+1);
                if(c1=="a")
                {
                    return this.chk_H(c1,objv);
                }
                else
                {
                    objv['index'] = objv['index'] - 1; 
                }
                return true;
            } 
            else
            {
                objv['index'] = objv['index'] - 1; 
            }
        }

        return false;
    }
    chk_C(c,objv)
    {
        let isok = false;
        let c1="";

        //EOE
        isok = this.chk_E(c,objv);
        if(isok)
        {
            objv['index'] = objv['index'] +1;
            c1 = objv['v'].substring(objv['index'],objv['index']+1);

            isok = this.chk_O(c1,objv);
            if(isok)
            {
                objv['index'] = objv['index'] +1;
                c1 = objv['v'].substring(objv['index'],objv['index']+1);

                isok = this.chk_E(c1,objv);
                if(isok)
                {
                    return true;
                }
                else
                {
                    objv['index'] = objv['index'] - 2;  
                }
            } 
            else
            {
                objv['index'] = objv['index'] - 1; 
            }
        }

        return false;
    }
    chk_D(c,objv)
    {
        if(c=="d")
            return true;
        else
            return false;
    }
    chk_J(c,objv)
    {
        if(c=="j")
            return true;
        else
            return false;
    }
    chk_E(c,objv)
    {
        if(c=="e")
            return true;
        else
            return false;
    }
    chk_O(c,objv)
    {
        if(c=="o")
            return true;
        else
            return false;
    }
    chk_N(c,objv)
    {
        if(c=="n")
            return true;
        else
            return false;
    }
    chk_A(c,objv)
    {
        if(c=="a")
            return true;
        else
            return false;
    }
}

function moveUp(e)
{
    let p = e.target.parentElement.parentElement;
    let pp=p.parentElement;
    let targetElement = p.previousSibling;
    if(targetElement!=null&&targetElement.className!=null)
    {
        if(targetElement.className!="")
        {
            pp.insertBefore(p,targetElement);
        }
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
function copyCode(e)
{
    let p = e.target.parentElement.parentElement;
    localStorage.setItem("gCopyedCode",p.innerHTML);
    localStorage.setItem("gCopyedCodeCss",p.className);
    alert("Copied!");
}
function copyCodeAll(e)
{
    let p = document.getElementById("CodeVal");
    localStorage.setItem("gCopyedCodeAll",p.innerHTML);
    alert("Copied!");
}

function pasteCode(e)
{
    let p = e.target.parentElement.parentElement;
    let c = localStorage.getItem("gCopyedCode");
    let cs = localStorage.getItem("gCopyedCodeCss");
    if(c&&c!="")
    {
        if(p.className!=cs)
        {
            alert("Different statement type, cannot paste");
            return;
        }
        p.innerHTML = c;
        divDragDealLoop(p);
    }
}

function pasteCodeAll(e)
{
    let p = document.getElementById("CodeVal");
    let c = localStorage.getItem("gCopyedCodeAll");
    if(c&&c!="")
    {
        p.innerHTML = c;
        divDragDealLoop(p);
        initParaVar();
    }
}

function showCodeNote(e)
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("noteWin").style.display="block";
    let p = e.target.parentElement;
    for(let dnode of p.childNodes)
    {
        if(dnode.className=="divCodeNote")
        {
            document.getElementById("txtCodeNote").value=dnode.innerHTML;
            window.callbackpara=e;

            return;
        }
    }
}
function saveCodeNote()
{
    let e = window.callbackpara;
    let p = e.target.parentElement;
    for(let dnode of p.childNodes)
    {
        if(dnode.className=="divCodeNote")
        {
            dnode.innerHTML = document.getElementById("txtCodeNote").value;
            exitCodeNote();
            return;
        }
    }
}
function exitCodeNote()
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("noteWin").style.display="none";
    document.getElementById("txtCodeNote").value="";
}
function showConJSUpd(e)
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("conJScodeWin").style.display="block";
    let p = e.target.parentElement.parentElement.parentElement;
    document.getElementById("conJScode").value=p.childNodes[0].innerText;
    window.callbackpara=e;
}
function saveConJScode()
{
    let e = window.callbackpara;
    let p = e.target.parentElement.parentElement.parentElement;
    p.childNodes[0].innerText = document.getElementById("conJScode").value;
    exitConJScode();
}
function exitConJScode()
{
    document.getElementById("coverWin").style.display="none";
    document.getElementById("conJScodeWin").style.display="none";
    document.getElementById("conJScode").value="";
}
function getSubCodeListContent(f,e)
{
    let p = e.srcElement.parentElement;

    let s = "";
    s =s + "<ul class=\"menu-content\" >";

    if(f=="subcodejs")
    {
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('assign','forConSucdiv',event)\">Assignment</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('insObjlist','forConSucdiv',event)\">Insert Statement (Object List)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('if','forConSucdiv',event)\">Condition</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('while','forConSucdiv',event)\">Loop</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('for','forConSucdiv',event)\">Iteration</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('subcode','forConSucdiv',event)\">Sub-Code Call</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('subcodeJS','forConSucdiv',event)\">JS Remote Code Call</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('jsHref','forConSucdiv',event)\">JS Jump Statement</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('jsSrc','forConSucdiv',event)\">Native Code (Return Value)</a></li>";
    }
    else if(f=="if"||f=="iffail")
    {
        let fdiv = 'ifConSucdiv';
        if(f=="iffail")
            fdiv = 'ifConFaidiv'

        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('assign','"+ fdiv +"',event)\">Assignment</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('insObjlist','"+ fdiv +"',event)\">Insert Statement (Object List)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('if','"+ fdiv +"',event)\">Condition</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('while','"+ fdiv +"',event)\">Loop</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('for','"+ fdiv +"',event)\">Iteration</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('subcode','"+ fdiv +"',event)\">Sub-Code Call</a></li>";
        if(isJava)
        {
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('assigndb','"+ fdiv +"',event)\">Assign Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('insdb','"+ fdiv +"',event)\">Insert Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('upddb','"+ fdiv +"',event)\">Update Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('deldb','"+ fdiv +"',event)\">Delete Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('assignSqlFilter','"+ fdiv +"',event)\">Assign Statement (DB Filter)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('outSrv','"+ fdiv +"',event)\">Remote API Call</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('msg','"+ fdiv +"',event)\">Email/SMS Send</a></li>";
        }
        else
        {
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('subcodeJS','"+ fdiv +"',event)\">JS Remote Code Call</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('jsHref','"+ fdiv +"',event)\">JS Jump Statement</a></li>";
        }
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('jsSrc','"+ fdiv +"',event)\">Native Code (Return Value)</a></li>";
    }
    else if(f=="for"||f=="while")
    {
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('assign','forConSucdiv',event)\">Assignment</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('insObjlist','forConSucdiv',event)\">Insert Statement (Object List)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('if','forConSucdiv',event)\">Condition</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('while','forConSucdiv',event)\">Loop</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('for','forConSucdiv',event)\">Iteration</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('subcode','forConSucdiv',event)\">Sub-Code Call</a></li>";
        if(isJava)
        {
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('assigndb','forConSucdiv',event)\">Assign Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('insdb','forConSucdiv',event)\">Insert Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('upddb','forConSucdiv',event)\">Update Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('deldb','forConSucdiv',event)\">Delete Statement (DB)</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('outSrv','forConSucdiv',event)\">Remote API Call</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('msg','forConSucdiv',event)\">Email/SMS Send</a></li>";
        }
        else
        {
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('subcodeJS','forConSucdiv',event)\">JS Remote Code Call</a></li>";
            s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('jsHref','forConSucdiv',event)\">JS Jump Statement</a></li>";
        }

        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addSubCode('jsSrc','forConSucdiv',event)\">Native Code (Return Value)</a></li>";
    }

    for(let dnode of p.childNodes)
    {
        if(dnode.className=="dropcontent")
        {
            dnode.innerHTML =s;
        }
    }
}

function getCodeListContent(e)
{
    let p = e.srcElement.parentElement;

    let s = "";
    s =s + "<ul class=\"menu-content\" >";
    s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('assign',event)\">Assignment</a></li>";
    s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('for',event)\">Iteration</a></li>";
    s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('if',event)\">Condition</a></li>";
    s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('while',event)\">Loop</a></li>";
    if(isJava)
    {
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('assigndb',event)\">Assign Statement (DB)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('assignSqlFilter',event)\">Assign Statement (DB Filter)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('insdb',event)\">Insert Statement (DB)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('upddb',event)\">Update Statement (DB)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('deldb',event)\">Delete Statement (DB)</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('outSvr',event)\">Remote API Call</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('msg',event)\">Email/SMS Send</a></li>";
    }
    else
    {
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('subcodeJS',event)\">JS Remote Code Call</a></li>";
        s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('jsHref',event)\">JS Jump Statement</a></li>";
    }

    s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('insObjlist',event)\">Insert Statement (Object List)</a></li>";
    s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('subcode',event)\">Sub-Code Call</a></li>";
    s =s + "<li><a href=\"javascript:void(0)\" onclick=\"addCode('jsSrc',event)\">Native Code (Return Value)</a></li>";
    s =s + "</ul>";

    for(let dnode of p.childNodes)
    {
        if(dnode.className=="dropcontent")
        {
            dnode.innerHTML =s;
        }
    }


}

function getEleValue(k)
{
    return document.getElementById(k).value;
}
function setEleValue(k,v)
{
    return document.getElementById(k).value=v;
}
function delvarGList(objname)
{
    for(let i=0;i<varGLists.length;i++)
    {
        let item = varGLists[i];
        if(item['name']==objname)
        {
            if(item['ref']!=null&&item['ref']>0)
            {
                if(chkVarRef(objname))
                {
                    alert(objname+ "Variable is referenced and cannot be deleted.");
                    return false;
                }
                else
                {
                    item['ref']=0;
                }
            }
            varGLists.splice(i,1);
            break;
        }
    }
    return true;
}
function chkVarRef(v)
{
    let dmr = document.getElementById("CodeVal");
    for (let dNodeSub of dmr.childNodes) 
    {
        if(dNodeSub.className!="varDiv"&&dNodeSub.className!="varParaDiv"&&dNodeSub.id!="varGListValue")
        {
            if(dNodeSub.innerHTML)
            {
                let str = dNodeSub.innerHTML;
                if(str.indexOf(">"+ v + "</span>")>0)
                    return true;
            }
        }
    }
    return false;
}
function delSubvarGList(objname)
{
    for(let i=0;i<varGLists.length;i++)
    {
        let item = varGLists[i];
        let itemname=item['name'];
        if((item['dbauto']!=null)&&(itemname.indexOf(objname+".")==0||itemname.indexOf(objname+"_entry.")==0))
        {
            if(chkVarRef(itemname))
            {
                alert(itemname+ "Variable is referenced and cannot be deleted.");
                return false;
            }
            else
            {
                delvarGList(itemname);
                i=i-1;
            }
        }
    }
    return true;
}

function checkVarName(str)
{
    if(str.indexOf("'")>=0)
        return false;
    if(str.indexOf("#")>=0)
        return false;
    if(str.indexOf('"')>=0)
        return false;
    return true;
}
function isStrBlank(v)
{
    if(v=="")
    {
        return true;
    }
    return false;
}
function addParaWin()
{
    let v = {};
    let msg="";
    let vn = getEleValue("addVarName");
    let vt = getEleValue("addVarType");
    let vpt = getEleValue("addParaType");
    if(isStrBlank(vn))
        msg = "Enter variable name<br>";
    if(isStrBlank(vpt))
        msg = msg + "Select parameter type<br>";
    if(isStrBlank(vt))
        msg = msg + "Select Variable Type<br>";

    if(!checkVarName(vn))
        msg = msg + "Variable name cannot contain quotes or #<br>";

    if(vn.trim().length>80)
        msg = msg + "Variable name cannot exceed 80 characters<br>";

    if(vpt=="global")
        vn = "globalParam_" + vn;
    
    if(vpt=="page")
        vn = "pageParam_" + vn;   
    

    for( let item of varGLists )
    {
        if(item['name']==vn)
        {
            msg = msg + "Variable name already exists<br>";
        }
    }

    let pkey = "";
    v['key'] = vn;
    if(vn.trim().indexOf(".")>0)
    {
        let varP = vn.trim().substring(0,vn.trim().indexOf("."));
        pkey = varFindParent(varP);
        if(pkey=="")
        {
            msg = msg + "Parent variable"+ varP +"not created, cannot create property variable<br>";
        }
        else
        {
            v['key'] = pkey + vn.trim().substring(vn.trim().indexOf("."));
        }
    }

    if(msg!="")
    {
        document.getElementById("updVarWin-info").style.display="block";
        document.getElementById("updVarWin-info-msg").innerHTML=msg;
        return;
    }

    v['name'] = vn;
    v['type'] = vt;
    v['ptype'] = vpt;
    v['ref'] = 0;

    varGLists.push(v);

    document.getElementById("varGListValue").value=JSON.stringify(varGLists);

    let dc = document.createElement("div");
    dc.className="varValueDiv";
    dc.innerHTML = "<span class=\"action-content\" style=\"border:none\">"+ vn +"</span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varUpd(event);return false;\"><img width=\"18\"  src=\"./imgs/update.png\"></a><a href=\"#\" onclick=\"varDelete(event,'"+ vn +"','varParaDiv');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";

    document.getElementById("varParaTemp").appendChild(dc);

    closeWin();
}
function addVarWin()
{
    let v = {};
    let msg="";
    let vn = getEleValue("addVarName");
    let vt = getEleValue("addVarType");

    if(isStrBlank(vn))
        msg = "Enter variable name<br>";

    if(isStrBlank(vt))
        msg = msg + "Select Variable Type<br>";

    if(!checkVarName(vn))
        msg = msg + "Variable name cannot contain quotes or #<br>";

    if(vn.trim().length>80)
        msg = msg + "Variable name cannot exceed 80 characters<br>";

    for( let item of varGLists )
    {
        if(item['name']==vn)
        {
            msg = msg + "Variable name already exists<br>";
        }
    }

    let pkey = "";
    v['key'] = vn;
    if(vn.trim().indexOf(".")>0)
    {
        let varP = vn.trim().substring(0,vn.trim().indexOf("."));
        pkey = varFindParent(varP);
        if(pkey=="")
        {
            msg = msg + "Parent variable"+ varP +"not created, cannot create property variable<br>";
        }
        else
        {
            v['key'] = pkey + vn.trim().substring(vn.trim().indexOf("."));
        }
    }

    if(msg!="")
    {
        document.getElementById("updVarWin-info").style.display="block";
        document.getElementById("updVarWin-info-msg").innerHTML=msg;
        return;
    }

    v['name'] = vn;
    v['type'] = vt;
    v['ptype'] = "";
    v['ref'] = 0;
    varGLists.push(v);

    document.getElementById("varGListValue").value=JSON.stringify(varGLists);

    let dc = document.createElement("div");
    dc.className="varValueDiv";
    dc.innerHTML = "<span class=\"action-content\" style=\"border:none\">"+ vn +"</span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varUpd(event);return false;\"><img width=\"18\"  src=\"./imgs/update.png\"></a><a href=\"#\" onclick=\"varDelete(event,'"+ vn +"','varDiv');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";

    document.getElementById("varDivTemp").appendChild(dc);

    closeWin();
}
function setVarRef(vname,f)
{
    for(let i=0;i<varGLists.length;i++)
    {
        let item = varGLists[i];
        if((item['ref']!=null)&&item['name']==vname)
        {
            if(f=="a")
                item['ref']=item['ref']+1;
            else
                item['ref']=item['ref']-1;
        }
    }
}

function openWin(msg,callback,callbackpara) 
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("modalWin").style.display="block";
    document.getElementById("modalWinMsg").innerText=msg;
    window.callback=callback;
    window.callbackpara=callbackpara;
}
function openUpdVarWin(msg,callback,callbackpara) 
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("updVarWin").style.display="block";
    document.getElementById("updVarWin-info-msg").innerHTML="";
    document.getElementById("updVarWin-info").style.display="none";

    if(callback==updParaWin)
        document.getElementById("paraTypeDiv").style.display="block";
    else
        document.getElementById("paraTypeDiv").style.display="none";
    window.callback=callback;
    window.callbackpara=callbackpara;
}
function openAddVarWin(msg,callback,callbackpara) 
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("updVarWin").style.display="block";
    document.getElementById("updVarWin-info-msg").innerHTML="";
    document.getElementById("updVarWin-info").style.display="none";
    if(callback==addParaWin)
        document.getElementById("paraTypeDiv").style.display="block";
    else
        document.getElementById("paraTypeDiv").style.display="none";
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
    document.getElementById("updVarWin").style.display="none";
}

function closeInfoMsg(e) 
{
    e.srcElement.parentElement.style.display="none";
}

function varUpd(e)
{

    let p = e.target;
    let varNode=p.parentElement.parentElement.parentElement;
    let vn = varNode.firstChild.innerText;

    for(let i=varGLists.length-1;i>=0;i--)
    {
        item = varGLists[i];
        if(item['name']==vn)
        {
            if((item['ref']!=null)&&item['ref']>0)
            {
                if(chkVarRef(vn))
                {
                    //alert("Variable is referenced and cannot be modified.");
                    //return false;
                }
                else
                {
                    item['ref']=0;
                }
            }
            setEleValue("addVarName",item['name']);
            setEleValue("addVarType",item['type']);
            setEleValue("addParaType",item['ptype']);
            if(item['ptype']!="")
                openUpdVarWin('',updParaWin,varNode);
            else
                openUpdVarWin('',updVarWin,varNode);

            break;
        }
    }

}
function updParaWin(varNode)
{
    let msg="";
    let oldName = varNode.firstChild.innerText;

    if(chkVarRef(oldName))
    {
        alert("Variable is referenced and cannot be modified.");
        return;
    }

    let vn = getEleValue("addVarName");
    let vt = getEleValue("addVarType");
    let vpt = getEleValue("addParaType");

    if(isStrBlank(vn))
        msg = "Enter variable name<br>";
    if(isStrBlank(vpt))
        msg = msg + "Select parameter type<br>";
    if(isStrBlank(vt))
        msg = msg + "Select Variable Type<br>";
    if(!checkVarName(vn))
        msg = msg + "Variable name cannot contain quotes<br>";

    if(vn.trim().length>80)
        msg = msg + "Variable name cannot exceed 80 characters<br>";

    if(vpt=="global")
    {
        if(vn.indexOf("globalParam_")!=0)
            vn = "globalParam_" + vn;
    }
    if(vpt=="page")
    {
        if(vn.indexOf("pageParam_")!=0)
            vn = "pageParam_" + vn;  
    }

    for( let item of varGLists )
    {
        if(item['name']==vn&&item['name']!=oldName)
        {
            msg = msg + "Variable name already exists<br>";
        }
    }

    if(msg!="")
    {
        document.getElementById("updVarWin-info").style.display="block";
        document.getElementById("updVarWin-info-msg").innerHTML=msg;
        return;
    }

    for( let item of varGLists )
    {
        if(vn==oldName)
        {
            if(item['name']==vn)
            {
                item['type'] = vt;
                item['ptype'] = vpt;
                break;
            }
        }
        else
        {
            let objname=item['name'];
            if(objname==oldName)
            {

                let pkey = "";
                if(vn.trim().indexOf(".")>0)
                {
                    let varP = vn.trim().substring(0,vn.trim().indexOf("."));
                    pkey = varFindParent(varP);
                    if(pkey=="")
                    {
                        msg = msg + "Parent variable"+ varP +"not created, cannot create property variable<br>";
                        break;
                    }
                    else
                    {
                        item['key'] = pkey + vn.trim().substring(vn.trim().indexOf("."));
                    }
                }
                else
                {
                    item['key'] = vn;
                }

                item['name'] = vn;
                item['type'] = vt;
                item['ptype'] = vpt;
            }
            else
            {
                if(objname.indexOf(oldName+".")==0)
                {
                    item['name'] = objname.replace(oldName+".",vn+".");
                    item['key'] = objname.replace(oldName+".",vn+".");
                }
            }
            
        }
    }

    if(msg!="")
    {
        document.getElementById("updVarWin-info").style.display="block";
        document.getElementById("updVarWin-info-msg").innerHTML=msg;
        return;
    }

    document.getElementById("varGListValue").value=JSON.stringify(varGLists);

    varNode.innerHTML = "<span class=\"action-content\" style=\"border:none\">"+ vn +"</span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varUpd(event);return false;\"><img width=\"18\"  src=\"./imgs/update.png\"></a><a href=\"#\" onclick=\"varDelete(event,'"+ vn +"','varParaDiv');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";

    closeWin();
}
function updVarWin(varNode)
{
    let msg="";
    let vn = getEleValue("addVarName");
    let vt = getEleValue("addVarType");
    let oldName = varNode.firstChild.innerText;
    if(chkVarRef(oldName))
    {
        alert("Variable is referenced and cannot be modified.");
        return;
    }

    if(isStrBlank(vn))
        msg = "Enter variable name<br>";

    if(isStrBlank(vt))
        msg = msg + "Select Variable Type<br>";
    
        if(!checkVarName(vn))
        msg = msg + "Variable name cannot contain quotes<br>";

    if(vn.trim().length>80)
        msg = msg + "Variable name cannot exceed 80 characters<br>";
    
    for( let item of varGLists )
    {
        if(item['name']==vn&&item['name']!=oldName)
        {
            msg = msg + "Variable name already exists<br>";
        }
    }

    if(msg!="")
    {
        document.getElementById("updVarWin-info").style.display="block";
        document.getElementById("updVarWin-info-msg").innerHTML=msg;
        return;
    }

    for( let item of varGLists )
    {
        if(vn==oldName)
        {
            if(item['name']==vn)
            {
                item['type'] = vt;
                break;
            }
        }
        else
        {
            let objname=item['name'];
            if(objname==oldName)
            {

                let pkey = "";
                if(vn.trim().indexOf(".")>0)
                {
                    let varP = vn.trim().substring(0,vn.trim().indexOf("."));
                    pkey = varFindParent(varP);
                    if(pkey=="")
                    {
                        msg = msg + "Parent variable"+ varP +"not created, cannot create property variable<br>";
                        break;
                    }
                    else
                    {
                        item['key'] = pkey + vn.trim().substring(vn.trim().indexOf("."));
                    }
                }
                else
                {
                    item['key'] = vn;
                }

                item['name'] = vn;
                item['type'] = vt;
            }
            else
            {
                if(objname.indexOf(oldName+".")==0)
                {
                    item['name'] = objname.replace(oldName+".",vn+".");
                    item['key'] = objname.replace(oldName+".",vn+".");
                }
            }
            
        }
    }

    if(msg!="")
    {
        document.getElementById("updVarWin-info").style.display="block";
        document.getElementById("updVarWin-info-msg").innerHTML=msg;
        return;
    }

    document.getElementById("varGListValue").value=JSON.stringify(varGLists);
    varNode.innerHTML = "<span class=\"action-content\" style=\"border:none\">"+ vn +"</span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varUpd(event);return false;\"><img width=\"18\"  src=\"./imgs/update.png\"></a><a href=\"#\" onclick=\"varDelete(event,'"+ vn +"','varDiv');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";

    closeWin();
}

function varFindParent(varP)
{

    let pdatas = varGLists.filter(item=>item.name==varP);
    if(pdatas&&pdatas.length>0)
    {
        let pitem = pdatas[0];
        return pitem['key'];
    }
    return "";
}

function closeAdd(e)
{
    let p = e.target;
    p.parentElement.style.display="none"
}

function varAddShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varAdddiv")
        {
            dNode.style.display="block";
            break;
        }
    }
}
function varSelAddSubcodeJs(e,cl)
{
    let d,k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    d=p.childNodes[0];
    v=d.options[d.selectedIndex].text;
    k=d.options[d.selectedIndex].value;

    let dr,rk,rv;
    dr=p.childNodes[1];
    rv=dr.options[dr.selectedIndex].text;
    rk=dr.options[dr.selectedIndex].value;

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\"></span>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' value='"+ rk +"'/>";

    let strSub="";
    if(rv!="")
        strSub = strSub + "("+ rv +")";   

    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDelMain(event,'"+ v +"','','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    str = str + "<div class=\"showInfo\">"+ strSub +"</div>";

    dc.innerHTML = str;
    dc.childNodes[0].innerText = v;
    dc.childNodes[1].value = k;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            setVarRef(v,'a');
            break;
        }
    }
    p.style.display="none";

}
function varSelAddDb(e,flag,cl)
{
    let d,k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    d=p.childNodes[0];
    v=d.options[d.selectedIndex].text;
    k=d.options[d.selectedIndex].value;

    let dr,rk,rv;
    dr=p.childNodes[1];
    rv=dr.options[dr.selectedIndex].text;
    rk=dr.options[dr.selectedIndex].value;

    let ds,sk,sv;
    ds=p.childNodes[2];
    sv=ds.options[ds.selectedIndex].text;
    sk=ds.options[ds.selectedIndex].value;

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    let topitem = p.childNodes[3].value;

    str = "<span style=\"border:none;\"></span>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' value='"+ rk +"'/>";
    str = str + "<input type='hidden' value='"+ sk +"'/>";
    str = str + "<input type='hidden' value='"+ topitem +"'/>";

    let strSub="";
    if(rv!="")
        strSub = strSub + "(Permission Required)";    //Temporarily not needed
    if(sv!="")
        strSub = strSub + "(Include Queried SQL Condition)";
    if(topitem!="")
        strSub = strSub + "Records: "+topitem;

    let objname="";
    if(flag=="delsub")
    {
        objname = v;
    }

    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDelMain(event,'"+ v +"','"+ objname +"','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    str = str + "<div class=\"showInfo\">"+ strSub +"</div>";

    dc.innerHTML = str;
    dc.childNodes[0].innerText = v;
    dc.childNodes[1].value = k;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            setVarRef(v,'a');
            break;
        }
    }
    p.style.display="none";
}

function divDragDeal(dc)
{
    
    dc.position="relative";
    dc.draggable=true;
    dc.addEventListener('dragenter', (e) => {
    }, false);

    dc.addEventListener('dragover', e => {
        e.preventDefault();
        let p = e.target.parentNode;
        let targetElement = e.target;
        if(gdivClass.indexOf("," + targetElement.className + ",")>=0)
        {
            if(gdivClass.indexOf("," + dragobj.className + ",")>=0)
            {
                if(dragobj!=targetElement)
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
        }

    }, false)

    dc.addEventListener('drop', e => {
        e.preventDefault();
    }, false)

}

function divDragDealLoop(p)
{
    for (let dNode of p.childNodes) 
    {
        
        if(dNode.className&&gdivClass.indexOf("," + dNode.className + ",")>=0)
        {
            divDragDeal(dNode);
        }
        else
        {
            divDragDealLoop(dNode); 
        }
    }
}
function varDegbugUpd(e)
{
    let p = e.target.parentElement;
    let blnhas=false;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varSelDebug")
        {
            p.removeChild(dNode);
            blnhas=true;
            break;
        }
    }
    if(!blnhas)
    {
        let dv = document.createElement("div");
        dv.className="varSelDebug";
        str = "<span class=\"showInfo\" style='padding-left:12px'>Log Record</span>";
        dv.innerHTML = str;
        p.appendChild(dv);
    }
}
function varJsFdUpd(e)
{
    let p = e.target.parentElement;
    let blnhas=false;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varSelJsFd")
        {
            p.removeChild(dNode);
            blnhas=true;
            break;
        }
    }
    if(!blnhas)
    {
        let dv = document.createElement("div");
        dv.className="varSelJsFd";
        str = "<span class=\"showInfo\" style='padding-left:12px'>Float</span>";
        dv.innerHTML = str;
        p.appendChild(dv);
    }
}
function varSelAdd(e,flag,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varSelValue")
        {
            v=dNode.options[dNode.selectedIndex].text;
            k=dNode.options[dNode.selectedIndex].value;
            break;
        }
    }

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\"></span>";
    str = str + "<input type='hidden' />";

    let objname="";
    if(flag=="delsub")
    {
        objname = v;
    }

    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDelMain(event,'"+ v +"','"+ objname +"','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;
    dc.childNodes[0].innerText = v;
    dc.childNodes[1].value = k;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            setVarRef(v,'a');
            break;
        }
    }
    p.style.display="none";
    if(cl!="assignExpLeftDiv"&&cl!="assignSqlFilterExpLeftDiv")
        divDragDeal(dc);
}
function varReturnAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varSelValue")
        {
            v=dNode.options[dNode.selectedIndex].text;
            k=dNode.options[dNode.selectedIndex].value;
        }
    }

    for( let item of varGLists )
    {
        if(item['name']==v)
        {
            if(gCodeType.indexOf("Rights")==0||gCodeType=="Dbview")
            {
               if(item['type']!="sql")
                {
                    alert("Can only return SQL-type objects");
                    return;
                } 
            }
            break;
        }
    }

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\">return </span>";
    str = str + "<input type='hidden' />";
    str = str + "<span style=\"border:none;\"></span>";

    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDelMain(event,'"+ v +"','','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;
    dc.childNodes[1].value = k;
    dc.childNodes[2].innerText = v;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            setVarRef(v,'a');
            break;
        }
    }
    p.style.display="none";
    if(cl!="assignExpLeftDiv"&&cl!="assignSqlFilterExpLeftDiv")
        divDragDeal(dc);
}
function varSelDbAdd(e)
{
    let p = e.target.parentElement;
    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].value;
    p.childNodes[1].value=dv;
}
function varSelCodeAddDo(e,cl)
{
    let k,n
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    let d=p.childNodes[0];
    n=d.options[d.selectedIndex].text;
    k=d.options[d.selectedIndex].value;

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\">"+ n +"</span>";
    str = str + "<input type='hidden' value='"+ k +"'/>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDelSucodePara(event,'codeParaSelDiv');varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;

    let paras = {};
    paras['viewCode']="code";
    paras['itemIDs']=k;
    axios.post("./../api/codeget",paras).then(function(res){
        let codeitem=Object.values(res.data)[0];
        let ps =0;
        if(codeitem['source']!=null)
        {
            dc.childNodes[2].value="";
        }
        if(codeitem['para']!=null)
        {
            let jCode = JSON.parse(codeitem['para']);
            let strpara = ""
            for( let item of jCode['para'])
            {
                if(item['ptype']=='def')
                {
                    ps = ps + 1;
                    strpara = strpara + item['key'] + ","; 
                }
            }
            if(strpara!="")
            {
                dc.childNodes[3].value = strpara.substring(0,strpara.length-1);
            }
        }
        dc.childNodes[4].value = ps;
    }).catch(function (err) {
    });
    
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
}
function varSelMsgAddDo(e,cl)
{
    let k,n
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    let d=p.childNodes[0];
    n=d.options[d.selectedIndex].text;
    k=d.options[d.selectedIndex].value;

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\">"+ n +"</span>";
    str = str + "<input type='hidden' value='"+ k +"'/>";
    str = str + "<input type='hidden' />";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
}
function varSelDbAddDo(e,cl)
{
    let k,n,dn
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    let d=p.childNodes[0];
    n=d.options[d.selectedIndex].text;
    k=d.options[d.selectedIndex].value;

    dn=p.childNodes[1].value;
    if(!checkVarName(dn))
    {
        msg = msg + "Alias cannot contain quotes<br>";
        alert(msg);
        return;
    }

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\">"+ n +"</span>";
    str = str + "<input type='hidden' value='"+ k +"'/>";
    str = str + "<input type='hidden' value='"+ dn +"'/>";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    str = str + "<div class=\"showInfo\">("+ dn +")</div>";
    dc.innerHTML = str;
    
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);

}
function varSelSubSqlFieldAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;
    let dk=dd.options[dd.selectedIndex].value;

    let df=p.childNodes[1];
    v=df.options[df.selectedIndex].text;
    k=df.options[df.selectedIndex].value;

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\">"+ dv + "_" + v +"</span>";
    str = str + "<input type='hidden' value='"+ dk + "_" + k +"'/>";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDbFieldDel(event,'"+ v +"','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    
    dc.innerHTML = str;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);
}
function varSelDbFieldChange(e)
{
    let p = e.target.parentElement;
    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;

    let df=p.childNodes[1];
    let v=df.options[df.selectedIndex].text;
    let fk=df.options[df.selectedIndex].value;
    let k = fk.substring(0,fk.indexOf("|"));

    p.childNodes[3].value=k;
    p.childNodes[4].value=dv+v;

}
function varSelUpdDbFieldAdd(e,cl)
{
    let k,v,df,dv,vv,vk,cc,str;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    df=p.childNodes[1];
    v=df.options[df.selectedIndex].text;
    k=df.options[df.selectedIndex].value;

    if(p.childNodes[3].value=="Variable")
    {
        dv=p.childNodes[4];
        vv=dv.options[dv.selectedIndex].text;
        vk=dv.options[dv.selectedIndex].value;
    }
    else
    {
        cc=p.childNodes[5].value;
        vv=cc;
    }

    let dc = document.createElement("div");
    dc.className="varSelFieldDiv";

    str = "<span style=\"border:none;\"></span>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDbFieldDel(event,'"+ v + "_" + k +"','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;

    dc.childNodes[0].innerText = v +" = " + vv;
    dc.childNodes[1].value = k;
    
    if(p.childNodes[3].value=="Variable")
    {
        dc.childNodes[2].value = vk;
        dc.childNodes[2].className="v";
    }
    else
    {
        dc.childNodes[2].value = cc;
        dc.childNodes[2].className="c";
    }

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNodeTmp = dNode;
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);
}
function varSelDbFieldAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;
    let dk=dd.options[dd.selectedIndex].value;

    let si = dk.indexOf(" ");
    let dbalias = dk.substring(si);

    let df=p.childNodes[1];
    v=df.options[df.selectedIndex].text;
    let fk=df.options[df.selectedIndex].value;
    k = fk.substring(0,fk.indexOf("|"));
    let kdt = fk.substring(fk.indexOf("|")+1);
    let sfield=dbalias + "." + k;

    if(gDbType=="mysql")
    {
        if(kdt=="d")
            sfield = "date_format(" + sfield + ",\\'%Y-%m-%d\\')";
        else if(kdt=="dt")
            sfield = "date_format(" + sfield + ",\\'%Y-%m-%d %H:%i:%s\\')";
    }
    else if(gDbType=="oracle")
    {
        if(kdt=="d")
            sfield = "to_char(" + sfield + ",\\'yyyy-mm-dd\\')";
        else if(kdt=="dt")
            sfield = "to_char(" + sfield + ",\\'yyyy-mm-dd hh24:mi:ss\\')";
    }
    else if(gDbType=="kingbase")
    {
        if(kdt=="d")
            sfield = "to_char(" + sfield + ",\\'yyyy-mm-dd\\')";
        else if(kdt=="dt")
            sfield = "to_char(" + sfield + ",\\'yyyy-mm-dd hh24:mi:ss\\')";
    }
    else if(gDbType=="dm")
    {
        if(kdt=="d")
            sfield = "to_char(" + sfield + ",\\'yyyy-mm-dd\\')";
        else if(kdt=="dt")
            sfield = "to_char(" + sfield + ",\\'yyyy-mm-dd hh24:mi:ss\\')";
    }
    else if(gDbType=="sqlserver")
    {
        if(kdt=="d")
            sfield = "CONVERT(varchar(100)," + sfield + ",23)";
        else if(kdt=="dt")
            sfield = "CONVERT(varchar(100)," + sfield + ",20)";
    }

    let dt=p.childNodes[2];
    let tv=dt.options[dt.selectedIndex].text;
    let tk=dt.options[dt.selectedIndex].value;

    let msg="";
    let fieldalias = p.childNodes[3].value.toUpperCase();
    if(kdt!="")
    {
        fieldalias = fieldalias + "_" + kdt;
    }
    if(!checkVarName(fieldalias))
    {
        msg = msg + "Field alias cannot contain quotes<br>";
        alert(msg);
        return;
    }
    let fieldshow = p.childNodes[4].value;

    let dpk=p.childNodes[5];
    let vpk=dpk.options[dpk.selectedIndex].text;
    
    let dsk=p.childNodes[6];
    let vsk=dsk.options[dsk.selectedIndex].text;

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\">"+ dv + "_" + v +"</span>";
    str = str + "<input type='hidden' value=\""+ sfield +"\"/>";
    str = str + "<input type='hidden' value='"+ fieldalias +"'/>";
    str = str + "<input type='hidden' value='"+ tk +"'/>";
    str = str + "<input type='hidden' value='"+ vpk +"'/>";
    str = str + "<input type='hidden' value='"+ vsk +"'/>";
    str = str + "<input type='hidden' />";
    let strSub = "("+ sfield + " as " + fieldalias +")";
    
    if(tv!="")
        strSub = strSub + "("+ tv +")";
    if(vpk!="")
        strSub = strSub + "("+ vpk +")";
    if(vsk!="")
        strSub = strSub + "("+ vsk +")";
    
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDbFieldDel(event,'"+ dv + "_" + v +"','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    str = str + "<div class=\"showInfo\">Display Text: "+ fieldshow +"</div>";
    str = str + "<div class=\"showInfo\">"+ strSub +"</div>";
    dc.innerHTML = str;
    dc.childNodes[6].value = fieldshow;

    let objname="";
    let objtype="";
    let dNodeTmp=null;
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNodeTmp = dNode;
            let pp = dNode.parentElement.parentElement;
            for (let dSubNode of pp.childNodes) 
            {
                if(dSubNode.className=="assignLeftDiv")
                {
                    for (let dchildNode of dSubNode.childNodes) 
                    {
                        if(dchildNode.className=="assignDbExpLeftDiv")
                        {
                            if(dchildNode.childNodes.length>0)
                            {
                                objname = dchildNode.childNodes[0].childNodes[1].value;
                                objtype = getVarType(objname);
                                if(objtype!="obj"&&objtype!="objlist")
                                    objname = "";
                                break;
                            }
                        }
                    }
                    break;
                }
            }
            dNode.appendChild(dc);
            break;
        }
    }
    setDbObjkeys(dc,objname,objtype);
    p.style.display="none";
    divDragDeal(dc);
}
function setDbObjkeys(dc,objname,objtype)
{

    if(objname=="")
        return;

    let vn = dc.childNodes[0].innerText;
    let vk = dc.childNodes[2].value;
    if(vk.indexOf("_")>0)
    {
        vk = vk.substring(0, vk.indexOf("_"));
    }

    let vitem = {};
    if(objtype=="objlist")
        vitem['name']=objname + "_entry." + vn;
    else
        vitem['name']=objname + "." + vn;

    if(objtype=="objlist")    
        vitem['key']=objname + "_entry." + vk.toUpperCase();
    else
        vitem['key']=objname + "." + vk.toUpperCase();

    vitem['type']="str";
    vitem['ptype']=getParaType(objname);
    vitem['dbauto']="1";
    vitem['ref']=0;

    let pdatas = varGLists.filter(item=>item.name==vitem['name']);
    if(pdatas.length==0)
    {
        varGLists.push(vitem);
    }

}
function varSelDbFilterAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;
    let dk=dd.options[dd.selectedIndex].value;

    let si = dk.indexOf(" ");
    let dbalias = dk.substring(si);

    let df=p.childNodes[1];
    v=df.options[df.selectedIndex].text;
    k=df.options[df.selectedIndex].value;

    let dc = document.createElement("div");
    dc.className="varSelDivFilter";

    let str = "<span style=\"border:none;\">"+ dv + "_" + v +"</span>";
    str = str + "<input type='hidden' value='"+ dbalias + "." + k +"'/>";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;
    
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);
}
function varSelDbGroupAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;
    let dk=dd.options[dd.selectedIndex].value;

    let si = dk.indexOf(" ");
    let dbalias = dk.substring(si);

    let df=p.childNodes[1];
    v=df.options[df.selectedIndex].text;
    k=df.options[df.selectedIndex].value;
    let sfield=dbalias + "." + k;
    let strSub = sfield;
    let dt,tv,tk;
    if(p.childNodes[2].className=='varSelValueSmall')
    {
        dt=p.childNodes[2];
        tv=dt.options[dt.selectedIndex].text;
        tk=dt.options[dt.selectedIndex].value;
        strSub = strSub + "("+ tk +")"; 
    }

    let dc = document.createElement("div");
    dc.className="varSelDivGroup";

    str = "<span style=\"border:none;\">"+ dv + "_" + v +"</span>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    str = str + "<div class=\"showInfo\">"+ strSub +"</div>";
    dc.innerHTML = str;

    dc.childNodes[1].value=sfield;
    dc.childNodes[2].value=tk;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);
}
function varSelDbOrderAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;
    let dk=dd.options[dd.selectedIndex].value;

    let si = dk.indexOf(" ");
    let dbalias = dk.substring(si);

    let df=p.childNodes[1];
    v=df.options[df.selectedIndex].text;
    k=df.options[df.selectedIndex].value;
    let sfield=dbalias + "." + k;
    let strSub = sfield;
    let dt,tv,tk;
    if(p.childNodes[2].className=='varSelValueSmall')
    {
        dt=p.childNodes[2];
        tv=dt.options[dt.selectedIndex].text;
        tk=dt.options[dt.selectedIndex].value;
        strSub = strSub + "("+ tk +")"; 
    }

    let dc = document.createElement("div");
    dc.className="varSelDivOrder";

    str = "<span style=\"border:none;\">"+ dv + "_" + v +"</span>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    str = str + "<div class=\"showInfo\">"+ strSub +"</div>";
    dc.innerHTML = str;

    dc.childNodes[1].value=sfield;
    dc.childNodes[2].value=tk;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);
}
function varSelShow(c,e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            initComattr(s,c);
            break;
        }
    }
}
function varSelShowSvr(c,e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDivSvr")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            initComattr(s,c);
            break;
        }
    }
}
function varSelShowSub(c,e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDivSub")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            initComattr(s,c);
            break;
        }
    }
}
function varSelDbShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDbDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for( let item of dataTblLists)
            {
                s.add(new Option(item['NAME'],item['TABLENAME']));
            }

            break;
        }
    }
}
function varSelCodeShow(e,f)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selCodeDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            if(f==""&&!isJava)
            {
                for( let item of gCodeFrontLists)
                {
                    s.add(new Option(item['NAME'],item['GUID']));
                } 
            }
            else
            {
                for( let item of gCodeLists)
                {
                    s.add(new Option(item['NAME'],item['GUID']));
                }
            }
            break;
        }
    }
}
function varSelMsgShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selMsgDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for( let item of msgLists)
            {
                s.add(new Option(item['NAME'],item['GUID']));
            }
            break;
        }
    }
}
function varForSelShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for(let i=0;i<varGLists.length;i++)
            {
                if(varGLists[i]['type']=="objlist")
                    s.add(new Option(varGLists[i]['name'],varGLists[i]['name']));
            }
            for (let k in paracomSetAttrs) 
            {
                let sAttr = paracomSetAttrs[k];
                for(let item of sAttr)
                {
                    if(item['key'].toString().indexOf("lst_")==0)
                        s.add(new Option(item['name'],item['key'].toString().substring(4))); 
                }
            }
            break;
        }
    }
}
function varObjSqlSelShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for(let i=0;i<varGLists.length;i++)
            {
                if(varGLists[i]['type']=="sql")
                    s.add(new Option(varGLists[i]['name'],varGLists[i]['name']));
            }
            break;
        }
    }
}

function varObjListSelShow(e)
{
    let p = e.target.parentElement;
    let blnsqlPara=false;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for(let i=0;i<varGLists.length;i++)
            {
                if(varGLists[i]['type']=="objlist"||varGLists[i]['type']=="obj"||varGLists[i]['type']=="sql")
                {
                    s.add(new Option(varGLists[i]['name'],varGLists[i]['name']));
                    if(varGLists[i]['name']=="queriedDataList")
                        blnsqlPara=true;
                }
            }
            if(blnsqlPara)
                dNode.childNodes[2].style.display="block";
            else
                dNode.childNodes[2].style.display="none";
        
            break;
        }
    }
}
function varObjSelShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for(let i=0;i<varGLists.length;i++)
            {
                if(varGLists[i]['type']=="obj")
                    s.add(new Option(varGLists[i]['name'],varGLists[i]['name']));
            }
            break;
        }
    }
}
function getVarType(objName)
{
    for(let i=0;i<varGLists.length;i++)
    {
        if(varGLists[i]['name']==objName)
            return varGLists[i]['type'];
    }
    return "";
}
function getParaType(objName)
{
    for(let i=0;i<varGLists.length;i++)
    {
        if(varGLists[i]['name']==objName)
            return varGLists[i]['ptype'];
    }
    return "";
}
function varSelDbFieldShow(e,f)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDbFieldDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0

            let dNodeExp = selChildByClass(p.parentElement,"dbSelDiv");
            
            s.add(new Option("",""));
            let firstdb=""
            if(dNodeExp.childNodes[0])
            {
                firstdb = dNodeExp.childNodes[0].childNodes[1].value;
            }
            for(let dchildNode of dNodeExp.childNodes)
            {
                if(dchildNode.className=='varSelDiv')
                {
                    dbtitle = dchildNode.childNodes[0].innerText;
                    dbname = dchildNode.childNodes[1].value;
                    dbalias = dchildNode.childNodes[2].value;
                    s.add(new Option(dbtitle,dbname+' '+dbalias));
                }
            }
            if(firstdb!="")
            {
                s.selectedIndex=1;
                getDbFields(dNode,firstdb,f);
            }
            break;
        }
    }
}
function varSelDbFieldUpdShow(e,f)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDbFieldDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0

            let dNodeExp = selChildByClass(p.parentElement,"dbSelDiv");
            
            s.add(new Option("",""));
            let firstdb=""
            if(dNodeExp.childNodes[0])
            {
                firstdb = dNodeExp.childNodes[0].childNodes[1].value;
            }
            for(let dchildNode of dNodeExp.childNodes)
            {
                let dbtitle = dchildNode.childNodes[0].innerText;
                let dbname = dchildNode.childNodes[1].value;
                let dbalias = dchildNode.childNodes[2].value;
                s.add(new Option(dbtitle,dbname+' '+dbalias));
            }
            if(firstdb!="")
            {
                s.selectedIndex=1;
                getDbFields(dNode,firstdb,f);
            }

            let s1 = dNode.childNodes[4];
            s1.options.length=0;
            initComattr(s1,'r');

            dNode.childNodes[3].value="Variable";
            dNode.childNodes[4].style.display ="";
            dNode.childNodes[5].style.display ="none";

            break;

        }
    }
}
function varSelFieldDataMode(e)
{
    let dNode = e.target.parentElement;
    if(e.target.value=="Constant")
    {
        dNode.childNodes[5].style.display="";
        dNode.childNodes[4].style.display="none";
    }
    else
    {
        dNode.childNodes[4].style.display="";
        dNode.childNodes[5].style.display="none";
    }

}
function varSelFieldDataModeSub(e)
{
    let dNode = e.target.parentElement;
    if(e.target.value=="Constant")
    {
        dNode.childNodes[4].style.display="";
        dNode.childNodes[3].style.display="none";
    }
    else
    {
        dNode.childNodes[3].style.display="";
        dNode.childNodes[4].style.display="none";
    }

}
function varSelCodeParaShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selCodeParaDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0

            let dNodeExp = selChildByClass(p.parentElement,"codeSelDiv");

            s.add(new Option("",""));
            for(let dchildNode of dNodeExp.childNodes)
            {
                codeid = dchildNode.childNodes[1].value;

                let paras = {};
                paras['viewCode']="code";
                paras['itemIDs']=codeid;
                axios.post("./../api/codeget",paras).then(function(res){
                    let codeitem=Object.values(res.data)[0];
                    if(codeitem['para']!=null)
                    {
                        let s = dNode.childNodes[0];
                        s.options.length=0
                        s.add(new Option("",""));
                        let jCode = JSON.parse(codeitem['para']);
                        let strpara="";
                        for( let item of jCode['para'])
                        {
                            if(item['ptype']=='def')
                            {
                                s.add(new Option(item['name'],item['key'])); 
                                strpara = strpara + item['key'] + ","; 
                            }
                        }
                        
                        if(strpara!="")
                        {
                            dchildNode.childNodes[3].value = strpara.substring(0,strpara.length-1);
                        }

                        dNode.childNodes[2].value="Variable";
                        let s1 = dNode.childNodes[3];
                        s1.style.display ="";
                        dNode.childNodes[4].style.display ="none";
                        s1.options.length=0
                        initComattr(s1,'r');
                        
                    }
                }).catch(function (err) {
                });

                break;
            }

            break;
        }
    }
}
function varSelMsgParaShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selMsgParaDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0

            let dNodeExp = selChildByClass(p.parentElement,"msgSelDiv");
            s.add(new Option("",""));
            for(let dchildNode of dNodeExp.childNodes)
            {
                tempid = dchildNode.childNodes[1].value;

                let paras = {};
                paras['viewCode']="msg_template";
                paras['itemIDs']=tempid;
                axios.post("./../api/msgtempget",paras).then(function(res){
                    let msgitem=Object.values(res.data)[0];
                    if(msgitem['MSGKEYS']!=null)
                    {
                        let s = dNode.childNodes[0];
                        s.options.length=0
                        s.add(new Option("",""));
                        s.add(new Option("Recipient","msg#toaddr"));
                        jCode = JSON.parse(msgitem['MSGKEYS']);
                        for( let item of jCode['keys'])
                        {
                            s.add(new Option("Tag#"+item,"msg#"+item)); 
                        }
                        s.add(new Option("Custom Template Content","msg#content"));

                        dNode.childNodes[2].value="Variable";
                        let s1 = dNode.childNodes[3];
                        s1.style.display ="";
                        dNode.childNodes[4].style.display ="none";

                        s1.options.length=0
                        initComattr(s1,'r');
                    }
                }).catch(function (err) {
                });

                break;
            }

            break;
        }
    }
}
function varSelDbShowField(e,f)
{
    let p=e.target;
    let tblname = p.options[p.selectedIndex].value;

    let si = tblname.indexOf(" ");
    let dbname = tblname.substring(0,si);
    let dbalias = tblname.substring(si);

    getDbFields(e.target.parentElement,dbname,f);
}

function getDbFields(dNode,dbname,f)
{

    let paras = {};
    paras['viewCode']="data_fields";
    paras['filter_tablename_equal']=dbname;
    paras['filter_isinfile_equal']="0";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    axios.post("./../api/datalist",paras).then(function(res){
        dataTblFieldLists=Object.values(res.data)[0];
        let s = dNode.childNodes[1];
        s.options.length=0
        s.add(new Option("",""));
        for( let item of dataTblFieldLists)
        {
            if(f=='dt')
                s.add(new Option(item['FIELD_TITLE'],item['FIELD']+"|"+item['FIELD_TYPE']));
            else
                s.add(new Option(item['FIELD_TITLE'],item['FIELD']));
        }
    }).catch(function (err) {
    });
}

function varSelDbFilterShow(e,cl)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            let dNodeExp = selChildByClass(p.parentElement,"dbSelDiv");
            let firstdb=""
            if(dNodeExp.childNodes[0])
            {
                firstdb = dNodeExp.childNodes[0].childNodes[1].value;
            }
            s.add(new Option("",""));
            for(let dchildNode of dNodeExp.childNodes)
            {
                if(dchildNode.childNodes.length>0)
                {
                    if(dchildNode.className=='varSelDiv')
                    {
                        let dbtitle = dchildNode.childNodes[0].innerText;
                        let dbname = dchildNode.childNodes[1].value;
                        let dbalias = dchildNode.childNodes[2].value;
                        s.add(new Option(dbtitle,dbname+' '+dbalias));
                    }
                }
            }
            if(firstdb!="")
            {
                s.selectedIndex=1;
                getDbFields(dNode,firstdb,'');
            }

            break;
        }
    }
}
function varSelDbGroupShow(e,cls)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className==cls)
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            let dNodeExp = selChildByClass(p.parentElement,"dbSelDiv");
            let firstdb=""
            if(dNodeExp.childNodes[0])
            {
                firstdb = dNodeExp.childNodes[0].childNodes[1].value;
            }
            s.add(new Option("",""));
            for(let dchildNode of dNodeExp.childNodes)
            {
                if(dchildNode.childNodes.length>0)
                {
                    if(dchildNode.className=='varSelDiv')
                    {
                        let dbtitle = dchildNode.childNodes[0].innerText;
                        let dbname = dchildNode.childNodes[1].value;
                        let dbalias = dchildNode.childNodes[2].value;
                        s.add(new Option(dbtitle,dbname+' '+dbalias));
                    }
                }
            }
            if(firstdb!="")
            {
                s.selectedIndex=1;
                getDbFields(dNode,firstdb,'');
            }

            break;
        }
    }
}

function varSelSqlFilterShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="selDbFilterDiv")
        {
            dNode.style.display="block";
            let s = dNode.firstChild;
            s.options.length=0
            s.add(new Option("",""));
            for( let item of dataTblLists)
            {
                s.add(new Option(item['NAME'],item['TABLENAME']));
            }

            break;
        }
    }
}
function varSelSqlFilterField(e)
{
    let p=e.target;
    let tblname = p.options[p.selectedIndex].value;
    let paras = {};
    paras['viewCode']="data_fields";
    paras['filter_tablename_equal']=tblname;
    paras['filter_isinfile_equal']="0";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    axios.post("./../api/datalist",paras).then(function(res){
        dataTblFieldLists=Object.values(res.data)[0];
        let dNode = e.target.parentElement;
        let s = dNode.childNodes[1];
        s.options.length=0
        s.add(new Option("",""));
        for( let item of dataTblFieldLists)
        {
            s.add(new Option(item['FIELD_TITLE'],item['FIELD']));
        }
    }).catch(function (err) {
    });

}
function varSelSqlFilterAdd(e,cl)
{

    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    let dd=p.childNodes[0];
    let dv=dd.options[dd.selectedIndex].text;
    let dk=dd.options[dd.selectedIndex].value;

    let df=p.childNodes[1];
    v=df.options[df.selectedIndex].text;
    k=df.options[df.selectedIndex].value;

    let dc = document.createElement("div");
    dc.className="varSelDivFilter";

    let str = "<span style=\"border:none;\">"+ dv + "_" + v +"</span>";
    str = str + "<input type='hidden' value='"+ dk + "." + k +"'/>";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;
    

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }

    p.style.display="none";
    divDragDeal(dc);
}
function varSelCodeParaAdd(e,cl)
{

    let dd,dv,dk,df,vv,vk,cc,str;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    dd=p.childNodes[0];
    dv=dd.options[dd.selectedIndex].text;
    dk=dd.options[dd.selectedIndex].value;

    if(p.childNodes[2].value=="Variable")
    {
        df=p.childNodes[3];
        vv=df.options[df.selectedIndex].text;
        vk=df.options[df.selectedIndex].value;
    }
    else
    {
        cc=p.childNodes[4].value;
        vv=cc;
    }

    let dc = document.createElement("div");
    dc.className="varSelDivPara";

    str = "<span style=\"border:none;\"></span>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;

    dc.childNodes[0].innerText = dv +" = " + vv;
    dc.childNodes[1].value = dk;

    if(p.childNodes[2].value=="Variable")
    {
        dc.childNodes[2].value = vk;
        dc.childNodes[2].className="v";
        dc.childNodes[3].value = vv;
    }
    else
    {
        dc.childNodes[2].value = cc;
        dc.childNodes[2].className="c";
    }

    for (let dNode of pp.childNodes)
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }

    p.style.display="none";
}
function varSelMsgParaAdd(e,cl)
{

    let dd,dv,dk,df,vv,vk,cc;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;

    dd=p.childNodes[0];
    dv=dd.options[dd.selectedIndex].text;
    dk=dd.options[dd.selectedIndex].value;

    if(p.childNodes[2].value=="Variable")
    {
        df=p.childNodes[3];
        vv=df.options[df.selectedIndex].text;
        vk=df.options[df.selectedIndex].value;
    }
    else
    {
        cc=p.childNodes[4].value;
        vv=cc;
    }

    let dc = document.createElement("div");
    dc.className="varSelDivPara";

    let str = "<span style=\"border:none;\"></span>";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<input type='hidden' />";
    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;

    dc.childNodes[0].innerText = dv +" = " + vv;
    dc.childNodes[1].value = dk;

    if(p.childNodes[2].value=="Variable")
    {
        dc.childNodes[2].value = vk;
        dc.childNodes[2].className="v";
        dc.childNodes[3].value = vv;
    }
    else
    {
        dc.childNodes[2].value = cc;
        dc.childNodes[2].className="c";
    }

    for (let dNode of pp.childNodes)
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }

    p.style.display="none";
}
function varDelete(e,objname,cl)
{
    let p = e.target.parentElement.parentElement.parentElement;
    if(p.parentElement.className==cl)
    {
        if(delvarGList(objname))
        {
            if(delSubvarGList(objname))
                p.parentElement.removeChild(p);
        }
    }
}
function varDel(e,cl)
{
    let p = e.target.parentElement.parentElement.parentElement;
    if(p.parentElement.className==cl)
    {
        p.parentElement.removeChild(p);
    }
}
function varSelDelMain(e,v,objname,cl)
{
    let p = e.target.parentElement.parentElement.parentElement;
    if(p.parentElement.className==cl)
    {
        setVarRef(v,'d');
        if(objname!="")
        {
            if(delSubvarGList(objname))
            {
                p.parentElement.removeChild(p);
            }
        }
        else
        {
            p.parentElement.removeChild(p);;
        }
        
    }
}
function varSelDel(e,objname,cl)
{
    let p = e.target.parentElement.parentElement.parentElement;
    if(p.parentElement.className==cl)
    {
        p.parentElement.removeChild(p);
        if(objname!="")
            this.delSubvarGList(objname);
        
    }
}
function varSelDelSucodePara(e,cl)
{
    let pp = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
    for (let dSubNode of pp.childNodes) 
    {
        if(dSubNode.className==cl)
        {
            dSubNode.innerHTML="";
            break;
        }
    }

}
function varSelDbFieldDel(e,v,cl)
{
    let p = e.target.parentElement.parentElement.parentElement;
    if(p.parentElement.className==cl)
    {
        let pp = p.parentElement.parentElement.parentElement;
        let objname="";
        for (let dSubNode of pp.childNodes) 
        {
            if(dSubNode.className=="assignLeftDiv")
            {
                for (let dchildNode of dSubNode.childNodes) 
                {
                    if(dchildNode.className=="assignDbExpLeftDiv")
                    {
                        if(dchildNode.childNodes.length>0)
                            objname = dchildNode.childNodes[0].childNodes[1].value;
                        break;
                    }
                }
                break;
            }
        }
        if(objname!="")
        {
            if(delvarGList(objname+"."+v))
                p.parentElement.removeChild(p);
        }
        else
        {
            p.parentElement.removeChild(p);
        }
    }
}

function initComattr(obj,c)
{
    obj.add(new Option("",""));
    for(let i=0;i<varGLists.length;i++)
    {
        obj.add(new Option(varGLists[i]['name'],varGLists[i]['key']));
    }
    if(c=="l")
    {
        for (let k in paracomSetAttrs) 
        {
            let sAttr = paracomSetAttrs[k];
            for(let item of sAttr)
            {
                obj.add(new Option(item['name'],item['key'].toString().substring(4))); 
            }
        }
    }
    else
    {
        for (let k in paracomGetAttrs) 
        {
            let sAttr = paracomGetAttrs[k];
            for(let item of sAttr)
            {
                obj.add(new Option(item['name'],item['key'].toString().substring(4))); 
            }
        }
    }
}

function varOpAdd(e,cl)
{
    let v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varOpAddValue")
        {
            v=dNode.value;
        }
    }

    let dc = document.createElement("div");
    dc.className="varOpDiv";

    dc.innerHTML = "<span style=\"border:none;\"></span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.childNodes[0].innerText=v;
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    e.target.value="";

    divDragDeal(dc);
}
function varOpJoinAdd(e,cl)
{
    let v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varOpAddValue")
        {
            v=dNode.value;
            dNode.value="";
        }
    }

    let dc = document.createElement("div");
    dc.className="varOpDiv";

    dc.innerHTML = "<span style=\"border:none;\"></span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.childNodes[0].innerText=v;
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);
}

function varOpAddShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varOpAdddiv")
        {
            dNode.style.display="block";
            break;
        }
    }
    
}
function varOpJoinAddShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varOpJoinAdddiv")
        {
            dNode.style.display="block";
            break;
        }
    }
    
}
function varOpAddShowSub(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varOpAdddivSub")
        {
            dNode.style.display="block";
            break;
        }
    }
    
}

function varConJsAdd(e,cl)
{
    let v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varConAddValue")
        {
            v=dNode.value;
        }
    }

    let dc = document.createElement("div");
    dc.className="varConDiv";

    dc.innerHTML = "<span style=\"border:none;\"></span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"showConJSUpd(event);return false;\" ><img width=\"18\"  src=\"./imgs/update.png\"></a></span>";
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dc.firstChild.innerText = v;
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";
    divDragDeal(dc);
}
function varConAdd(e,cl)
{
    let v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varConAddValue")
        {
            v=dNode.value;
        }
    }

    v=v.replaceAll("'","\\'");
    v=v.replaceAll('"','\\"');

    let dc = document.createElement("div");
    dc.className="varConDiv";

    dc.innerHTML = "<span style=\"border:none;\"></span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            dc.firstChild.innerText = v;
            dNode.appendChild(dc);
            break;
        }
    }
    p.style.display="none";

    divDragDeal(dc);
}
function varConAddShowSub(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varConAdddivSub")
        {
            dNode.style.display="block";
            break;
        }
    }
}
function varConAddShow(e)
{
    let p = e.target.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varConAdddiv")
        {
            dNode.style.display="block";
            break;
        }
    }
}
function varOutSvrUrlAdd(e,cl)
{
    let v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varConAddValue")
        {
            v=dNode.value;
        }
    }

    let dc = document.createElement("div");
    dc.className="varConDiv";

    dc.innerHTML = "<span style=\"border:none;\"></span><span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDel(event,'','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            if(dNode.innerText=="")
            {
                dc.firstChild.innerText = v;
                dNode.appendChild(dc);
            }
            else
            {
                alert("Interface URL already added");
            }
            break;
        }
    }
    p.style.display="none";
}
function varOutSvrParaAdd(e,cl)
{
    let k,v;
    let p = e.target.parentElement;
    let pp = e.target.parentElement.parentElement.parentElement;
    for (let dNode of p.childNodes) 
    {
        if(dNode.className=="varSelValue")
        {
            v=dNode.options[dNode.selectedIndex].text;
            k=dNode.options[dNode.selectedIndex].value;
        }
    }

    let dc = document.createElement("div");
    dc.className="varSelDiv";

    str = "<span style=\"border:none;\"></span>";
    str = str + "<input type='hidden' />";
    str = str + "<span style=\"border:none;\"></span>";

    str = str + "<span class=\"action-content\" style=\"float:right\" ><a href=\"#\" onclick=\"varSelDelMain(event,'"+ v +"','','"+ cl +"');return false;\" ><img width=\"18\"  src=\"./imgs/del.png\"></a></span>";
    dc.innerHTML = str;
    dc.childNodes[1].value = k;
    dc.childNodes[2].innerText = v;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className==cl)
        {
            if(dNode.innerText=="")
            {
                dNode.appendChild(dc);
                setVarRef(v,'a');
            }
            else
            {
                if(cl=='outSvr1ExpDiv')
                    alert("Interface URL already added");
                else
                    alert("Interface parameter already added");
            }
            break;
        }
    }
    p.style.display="none";
}
function gcopyobj(obj){return JSON.parse(JSON.stringify(obj));};
function selConDefault(e,v)
{
    let p = e.target.parentElement.parentElement;
    p.childNodes[0].value=v;

}
function initTemplate(codeType,fValue,comSetAttrs,comGetAttrs,varInit,codeID)
{

    gCodeType = codeType;
    if(codeType=="Code"||codeType.indexOf("WfmRule")==0||codeType.indexOf("WfmDo")==0||codeType.indexOf("WfmSelpsn")==0||codeType.indexOf("Rights")==0||codeType=="Dbview"||codeType=="UpdView"||codeType=="Dbinit"||codeType=="Pdfinit"||codeType=="Loadinit"||codeType=="initpagedatas"||codeType=="BeforeUpd"||codeType=="AfterUpd"||codeType=="AfterDel"||codeType=="RegOrg"||codeType=="RegPsn"||codeType=="OrgRoles"||codeType=="UpdPsn")
        isJava=true;
    else
        isJava=false;

    let codeMsg="";
    
    if(codeType.indexOf("Rights")==0)
    {
        codeMsg="[Tip: Return value required, must be <font color=red>SQL Type</font> returned by Assign Statement (DB Filter)]";
    }
    else if(codeType=="Dbview")
    {
        codeMsg="[Tip: Return value required, must be an object of <font color=red>SQL Type</font>, and must include primary key and at least one full-text search field]";
    }
    else if(codeType=="UpdView")
    {
        codeMsg="[Tip: No return value needed. Process queriedDataList and queriedDataTitle, and pass the queried SQL for statistics via global params to the frontend page.";
    }
    else if(codeType=="Dbinit")
    {
        codeMsg="[Tip: No return value needed. Create one or more global params, which will automatically be returned to the frontend page.]"
    }
    else if(codeType=="Pdfinit")
    {
        codeMsg="[Tip: If the return value (must be a normal type) is not empty, it will display the return value and abort the PDF generation program.]"
    }
    else if(codeType=="Loadinit")
    {
        codeMsg="[Tip: If the return value (must be a normal type) is not empty, it will display the return value and abort the loading program.]"
    }
    else if(codeType=="initpagedatas")
    {
        codeMsg="[Tip: No return value needed. Create one or more global params, which will automatically be returned to the frontend page.]"
    }
    else if(codeType=="BeforeUpd"||codeType=="AfterUpd")
    {
        codeMsg="[Tip: If the return value (must be a normal type) is not empty, it will display the return value and abort the save program.]"
    }
    else if(codeType.indexOf("WfmDo")==0)
    {
        codeMsg="[Tip: If the return value is not empty, it will display the return value and abort the workflow program.]"
    }
    else if(codeType.indexOf("WfmSelpsn")==0)
    {
        codeMsg="[Tip: A return value is required. Must be an object list or person ID. Objects in the list must have a psnid property.]"
    }
    else if(codeType.indexOf("WfmRule")==0)
    {
        codeMsg="[Tip: A return value is required. If the return value is true, this route will be selected.]"
    }
    else if(codeType=="val")
    {
        codeMsg="[Tip: A return value is required. A non-empty return value indicates validation failure and will be displayed on the frontend.]"
    }
    else if(codeType.indexOf("listcode")==0)
    {
        codeMsg="[Tip: You can access the corresponding properties through the list row data object.]"
    }
    else if(codeType.indexOf("OrgRoles")==0)
    {
        codeMsg="[Tip: A return value is required. Must be a list object. Objects must have ROLEID and NAME properties."
    }
    else if(codeType=="RegOrg"||codeType=="RegPsn")
    {
        codeMsg="[Tip: If the return value is not empty, it will display the return value and abort the registration program.]"
    }

    document.getElementById("codeMsg").innerHTML=codeMsg;

    paracomSetAttrs = comSetAttrs;
    paracomGetAttrs = comGetAttrs;
    this.varGLists = gcopyobj(varInit);

    getCodeConfig();
    getDataTblList();
    var _codeListPromise = getCodeList();
    var _codeFrontListPromise = getCodeFrontList();
    var _msgTempListPromise = getMsgTempList();
    var _listPromises = [_codeListPromise, _codeFrontListPromise, _msgTempListPromise];

    if(codeID=="-1")
    {
        formCom = true;
        if(Object.keys(fValue).length === 0)
            return;

        let codelist = fValue["codelist"] || [];
        let varList = (codelist.length > 0 && codelist[0].type === 'def') ? codelist[0].para : [];
        this.varGLists = gcopyobj(varList);
        Promise.all(_listPromises).then(function() {
            initTemplateDo(renderTempcontentFromCodelist(codelist, varList));
        });
    }
    else
    {
        if(codeID=="")
        {
            return;
        }
        else
        {
            gCodeID=codeID;
            let paras = {};
            paras['viewCode']="code";
            paras['itemIDs']=codeID;
            var _codePromise = axios.post("./../api/codeget",paras);
            Promise.all([_codePromise].concat(_listPromises)).then(function(results){
            let dataTmp=Object.values(results[0].data)[0];
            gCodeFile=dataTmp['codefile'];
            gCodeOpen=dataTmp['OPEN'];
            let code=dataTmp['code'];
            let codeJson = JSON.parse(code);
            let codelist = codeJson['codelist'] || [];
            let varList = (codelist.length > 0 && codelist[0].type === 'def') ? codelist[0].para : [];
            initTemplateDo(renderTempcontentFromCodelist(codelist, varList));

            }).catch(function (err) {
            });
        }
    }
}

function renderTempcontentFromCodelist(codelist, varList) {
    if (!codelist || !codelist.length) return '';
    if (!varList) varList = [];

    function escHtml(s) {
        if (typeof s !== 'string') s = String(s);
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function lookupCodeName(guid) {
        var list = (typeof gCodeFrontLists !== 'undefined' && gCodeFrontLists.length) ? gCodeFrontLists
            : (typeof gCodeLists !== 'undefined' && gCodeLists.length) ? gCodeLists : null;
        if (list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].GUID === guid) return list[i].NAME;
            }
        }
        return guid;
    }

    function lookupMsgName(guid) {
        if (typeof msgLists !== 'undefined' && msgLists.length) {
            for (var i = 0; i < msgLists.length; i++) {
                if (msgLists[i].GUID === guid) return msgLists[i].NAME;
            }
        }
        return guid;
    }

    // Build option lists for different variable types
    function buildAllVarOptions(selectedVal) {
        var opts = '<option value=""></option>';
        for (var i = 0; i < varList.length; i++) {
            var v = varList[i];
            var name = v.name || v.key;
            var key = v.key;
            var sel = (selectedVal === key) ? ' selected' : '';
            opts += '<option value="' + escHtml(key) + '"' + sel + '>' + escHtml(name) + '</option>';
        }
        return opts;
    }

    function buildObjlistOptions(selectedVal) {
        var opts = '<option value=""></option>';
        for (var i = 0; i < varList.length; i++) {
            var v = varList[i];
            if (v.type !== 'objlist') continue;
            var name = v.name || v.key;
            var key = v.key;
            var sel = (selectedVal === key) ? ' selected' : '';
            opts += '<option value="' + escHtml(key) + '"' + sel + '>' + escHtml(name) + '</option>';
        }
        return opts;
    }

    function buildObjOptions(selectedVal) {
        var opts = '<option value=""></option>';
        for (var i = 0; i < varList.length; i++) {
            var v = varList[i];
            if (v.type !== 'obj') continue;
            var name = v.name || v.key;
            var key = v.key;
            var sel = (selectedVal === key) ? ' selected' : '';
            opts += '<option value="' + escHtml(key) + '"' + sel + '>' + escHtml(name) + '</option>';
        }
        return opts;
    }

    // Build expression elements
    function makeVarSelDiv(varName, containerClass, extraHidden, displayName) {
        var display = displayName || varName;
        var h = '<div class="varSelDiv" draggable="true"><span style="border:none;">' + escHtml(display) + '</span><input type="hidden" value="' + escHtml(varName) + '">';
        if (extraHidden) h += extraHidden;
        h += '<span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(display) + '\',\'\',\'' + (containerClass || 'assignExpDiv') + '\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        return h;
    }

    function makeVarConDiv(value, containerClass) {
        return '<div class="varConDiv" draggable="true"><span style="border:none;">' + escHtml(value) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'' + (containerClass || 'assignExpDiv') + '\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
    }

    function makeVarOpDiv(op, containerClass) {
        return '<div class="varOpDiv" draggable="true"><span style="border:none;">' + escHtml(op) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'' + (containerClass || 'assignExpDiv') + '\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
    }

    function makeVarSelDivFilter(fieldName, displayName, containerClass) {
        var label = displayName || fieldName;
        return '<div class="varSelDivFilter" draggable="true"><span style="border:none;">' + escHtml(label) + '</span><input type="hidden" value="' + escHtml(fieldName) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'' + (containerClass || 'dbFilterSelDiv') + '\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
    }

    function makeVarSelFieldDiv(fieldName, fieldValue, valClass, containerClass) {
        var h = '<div class="varSelFieldDiv"><span style="border:none;">' + escHtml(fieldName) + '</span><input type="hidden" value="' + escHtml(fieldName) + '">';
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            h += '<input type="hidden" value="' + escHtml(fieldValue) + '" class="' + (valClass || 'v') + '">';
        }
        h += '<span class="action-content" style="float:right"><a href="#" onclick="varSelDbFieldDel(event,\'' + escHtml(fieldName) + '\',\'' + (containerClass || 'dbFieldSelDiv') + '\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        return h;
    }

    function makeItemAction() {
        return '<div class="item-action"><input class="btnOK" type="button" value="Up" onclick="moveUp(event);return false;"><input class="btnOK" type="button" value="Down" onclick="moveDown(event);return false;"><input class="btnOK" type="button" value="Copy" onclick="copyCode(event);return false;"><input class="btnOK" type="button" value="Paste" onclick="pasteCode(event);return false;"><input class="btnOK" type="button" value="Del" onclick="openWin(\'Delete this statement?\',delContainer,event);return false;"><input class="btnOK" type="button" value="Note" onclick="showCodeNote(event);return false;"><div class="divCodeNote" style="display:none"></div></div>';
    }

    // Render expression array into HTML
    function renderExpression(exprArr, containerClass) {
        if (!exprArr || !exprArr.length) return '';
        var html = '';
        for (var i = 0; i < exprArr.length; i++) {
            var item = exprArr[i];
            if (item.v !== undefined) html += makeVarSelDiv(item.v, containerClass, null, item.ln);
            else if (item.c !== undefined) html += makeVarConDiv(item.c, containerClass);
            else if (item.o !== undefined) html += makeVarOpDiv(item.o, containerClass);
            else if (item.f !== undefined) html += makeVarSelDivFilter(item.f, item.ln, containerClass);
        }
        return html;
    }

    function renderChildren(childrenArr) {
        if (!childrenArr || !childrenArr.length) return '';
        var html = '';
        for (var i = 0; i < childrenArr.length; i++) html += renderNode(childrenArr[i]);
        return html;
    }

    // Common UI components (templates from code_design.html)
    function btnSelDiv(onclick, value, selClass, onchange) {
        return '<input class="btnAddVar" type="button" onclick="' + onclick + '" value="' + value + '">';
    }

    function btnAddVarDb(onclick, value) {
        return '<input class="btnAddVarDb" type="button" onclick="' + onclick + '" value="' + value + '">';
    }

    function hiddenSelDiv(containerClass, onchange, options) {
        return '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="' + onchange + '">' + (options || '<option></option>') + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
    }

    function hiddenConDiv(containerClass) {
        return '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'' + containerClass + '\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"><div class="conDefault"><a href="javascript:void(0)" onclick="selConDefault(event,\'true\')">True</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'false\')">False</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'null\')">Empty</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'{}\')">Empty Object</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'[]\')">Empty Object List</a></div></div>';
    }

    function hiddenOpDiv(containerClass, extraOps) {
        var ops = '<option></option><option>+</option><option>-</option><option>*</option><option>/</option><option>(</option><option>)</option>';
        if (extraOps) ops = extraOps;
        return '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'' + containerClass + '\')">' + ops + '</select><input class="btnCancleVar" value="Cancel" onclick="closeAdd(event)"></div>';
    }

    function dropButton(scope) {
        var targetDiv = '';
        if (scope === 'if') { targetDiv = 'ifConSucdiv'; }
        else if (scope === 'iffail') { targetDiv = 'ifConFaidiv'; }
        else if (scope === 'for') { targetDiv = 'forConSucdiv'; }
        else if (scope === 'while') { targetDiv = 'forConSucdiv'; }
        else { targetDiv = scope + 'ConSucdiv'; }
        var menuItems = '<li><a href="javascript:void(0)" onclick="addSubCode(\'assign\',\'' + targetDiv + '\',event)">Assignment</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'insObjlist\',\'' + targetDiv + '\',event)">Insert Statement (Object List)</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'if\',\'' + targetDiv + '\',event)">Condition</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'while\',\'' + targetDiv + '\',event)">Loop</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'for\',\'' + targetDiv + '\',event)">Iteration</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'subcode\',\'' + targetDiv + '\',event)">Sub-Code Call</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'assigndb\',\'' + targetDiv + '\',event)">Assign Statement (DB)</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'insdb\',\'' + targetDiv + '\',event)">Insert Statement (DB)</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'upddb\',\'' + targetDiv + '\',event)">Update Statement (DB)</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'deldb\',\'' + targetDiv + '\',event)">Delete Statement (DB)</a></li>';
        if (scope !== 'for' && scope !== 'while') {
            menuItems += '<li><a href="javascript:void(0)" onclick="addSubCode(\'assignSqlFilter\',\'' + targetDiv + '\',event)">Assign Statement (DB Filter)</a></li>';
        }
        menuItems += '<li><a href="javascript:void(0)" onclick="addSubCode(\'outSrv\',\'' + targetDiv + '\',event)">Remote API Call</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'msg\',\'' + targetDiv + '\',event)">Email/SMS Send</a></li>' +
            '<li><a href="javascript:void(0)" onclick="addSubCode(\'jsSrc\',\'' + targetDiv + '\',event)">Native Code (Return Value)</a></li>';
        return '<div class="codeval-action-add dropitem"><input type="button" value="+Add Execution Statement" style="width:180px" onmouseover="getSubCodeListContent(\'' + scope + '\',event)"><div class="dropcontent"><ul class="menu-content">' + menuItems + '</ul></div></div>';
    }

    function renderNode(node) {
        switch (node.type) {
            case 'def': return renderDef(node.para);
            case 'assign': return renderAssign(node.para);
            case 'for': return renderFor(node.para);
            case 'if': return renderIf(node.para);
            case 'while': return renderWhile(node.para);
            case 'assignDb': return renderAssignDb(node.para);
            case 'assignSqlFilter': return renderAssignSqlFilter(node.para);
            case 'insDb': return renderInsDb(node.para);
            case 'updDb': return renderUpdDb(node.para);
            case 'delDb': return renderDelDb(node.para);
            case 'outsvr': return renderOutSvr(node.para);
            case 'msg': return renderMsg(node.para);
            case 'insObjlist': return renderInsObjlist(node.para);
            case 'subcode': return renderSubcode(node.para);
            case 'subcodeJS': return renderSubcodeJS(node.para);
            case 'jsHref': return renderJsHref(node.para);
            case 'jsSrc': return renderJsSrc(node.para);
            default: return '';
        }
    }

    // ========== NODE RENDERERS ==========

    function renderDef(para) {
        // Build varGListValue (all vars as JSON for hidden input)
        var varGListJson = JSON.stringify(varList).replace(/"/g, '&quot;');
        var h = '<input type="hidden" id="varGListValue" value="' + varGListJson + '">\n';

        // Separate global/parameter vars and internal vars
        var globalVars = [];
        var internalVars = [];
        for (var i = 0; i < para.length; i++) {
            var v = para[i];
            if (v.ptype === 'sys') continue;
            if (v.dbauto === '1' || v.dbauto === 1) continue;
            if (v.ptype && v.ptype !== '') {
                globalVars.push(v);
            } else {
                internalVars.push(v);
            }
        }

        // varParaDiv for global/parameter variables
        h += '<div class="varParaDiv"><div><input class="btnAddVar" type="button" onclick="openAddVarWin(\'\',addParaWin,\'\')" value="+Add Parameter"></div>';
        for (var gi = 0; gi < globalVars.length; gi++) {
            var gv = globalVars[gi];
            h += '<div class="varValueDiv"><span class="action-content" style="border:none">' + escHtml(gv.name || gv.key) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varUpd(event);return false;"><img width="18" src="./imgs/update.png"></a><a href="#" onclick="varDelete(event,\'' + escHtml(gv.name || gv.key) + '\',\'varParaDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        }
        h += '</div>';

        // varDiv for internal variables
        h += '<div id="varDivTemp" class="varDiv"><div><input class="btnAddVar" type="button" onclick="openAddVarWin(\'\',addVarWin,\'\')" value="+Add Internal Variable"></div>';
        for (var ii = 0; ii < internalVars.length; ii++) {
            var iv = internalVars[ii];
            h += '<div class="varValueDiv"><span class="action-content" style="border:none">' + escHtml(iv.name || iv.key) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varUpd(event);return false;"><img width="18" src="./imgs/update.png"></a><a href="#" onclick="varDelete(event,\'' + escHtml(iv.name || iv.key) + '\',\'varDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        }
        h += '</div><div style="clear: both;"></div><div class="item-action" style="padding-right:15px;padding-top: 10px;"><input class="btnOK" type="button" value="Note" onclick="showCodeNote(event);return false;"><div class="divCodeNote" style="display:none"></div></div>';
        return h;
    }

    function renderAssign(p) {
        var leftVar = p.left || '';
        var leftn = p.leftn || leftVar;
        var leftd = p.leftd || '';
        var leftjsfd = p.leftjsfd || '';
        var h = '<div id="" class="assignDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        // Left side
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'l\',event)" value="+Select L-Value">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpLeftDiv\')">' + buildAllVarOptions(leftVar) + '</select><input class="btnSaveVar" type="button" value="Save"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpLeftDiv">';
        if (leftVar) h += makeVarSelDiv(leftVar, 'assignExpLeftDiv', null, leftn || leftVar);
        h += '</div><div class="debugDiv" style="float:left;padding-top: 5px;box-sizing: border-box;width:60%"><input class="btnCancleVar" type="button" onclick="varDegbugUpd(event)" value="Log">';
        if (leftd === 'd' || leftd === 'di') h += '<div class="varSelDebug"><span class="showInfo" style="padding-left:12px">Log Record</span></div>';
        h += '</div><div class="jsFdDiv" style="float:left;padding-top: 5px;box-sizing: border-box;;width:60%"><input class="btnCancleVar" type="button" onclick="varJsFdUpd(event)" value="Float">';
        if (leftjsfd === '1' || leftjsfd === 1) h += '<div class="varSelJsFd"><span class="showInfo" style="padding-left:12px">Float</span></div>';
        h += '</div></div>';
        // Equal sign
        h += '<div class="assignDivEqual">=</div>';
        // Right side
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Add Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varOpAddShow(event)" value="+Add Operator">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Add Constant">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpDiv\')">' + buildAllVarOptions() + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'assignExpDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"><div class="conDefault"><a href="javascript:void(0)" onclick="selConDefault(event,\'true\')">True</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'false\')">False</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'null\')">Empty</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'{}\')">Empty Object</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'[]\')">Empty Object List</a></div></div>';
        h += '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'assignExpDiv\')"><option></option><option>+</option><option>-</option><option>*</option><option>/</option><option>(</option><option>)</option></select><input class="btnCancleVar" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpDiv">';
        if (p.right && p.right.length) h += renderExpression(p.right, 'assignExpDiv');
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderFor(p) {
        var con = p.con || [];
        var conVar = (con.length > 0 && con[0].v) ? con[0].v : '';
        var conLn = (con.length > 0 && con[0].ln) ? con[0].ln : conVar;
        var h = '<div id="" class="forDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="forDivTitle">Select object to iterate:</div>';
        h += '<div class="forConDiv"><div class="forConDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varForSelShow(event)" value="+Add Variable">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'forConExpDiv\')">' + buildObjlistOptions(conVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="forConExpDiv">';
        if (conVar) h += makeVarSelDiv(conVar, 'forConExpDiv', null, conLn);
        h += '</div></div>';
        // Two forConSucTitle divs: one for text, one for dropdown button
        h += '<div class="forConSucTitle"><b>Statement to execute per iteration:</b></div>';
        h += '<div class="forConSucTitle">' + dropButton('for') + '</div>';
        h += '<div class="forConSucdiv" style="padding-left:20px">';
        if (p.exp && p.exp.length) h += renderChildren(p.exp);
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderIf(p) {
        var con = p.con || [];
        var exp = p.exp || [];
        var expfail = p.expfail || [];
        var h = '<div id="" class="ifDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="ifDivTitle">Condition Rules:</div>';
        h += '<div class="ifConDiv"><div class="ifConDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Add Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varOpAddShow(event)" value="+Add Operator">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Add Constant">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'ifConExpDiv\')">' + buildAllVarOptions() + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'ifConExpDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"><div class="conDefault"><a href="javascript:void(0)" onclick="selConDefault(event,\'true\')">True</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'false\')">False</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'null\')">Empty</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'{}\')">Empty Object</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'[]\')">Empty Object List</a></div></div>';
        h += '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'ifConExpDiv\')"><option></option><option>+</option><option>-</option><option>*</option><option>/</option><option>(</option><option>)</option><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option><option>==</option><option>!=</option><option>||</option><option>&amp;&amp;</option></select><input class="btnCancleVar" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="ifConExpDiv">';
        if (con.length) h += renderExpression(con, 'ifConExpDiv');
        h += '</div></div>';
        // Success branch: two ifConSucTitle divs
        h += '<div class="ifConSucTitle"><b>Execute When Met:</b></div>';
        h += '<div class="ifConSucTitle">' + dropButton('if') + '</div>';
        h += '<div class="ifConSucdiv" style="padding-left:20px">';
        if (exp.length) h += renderChildren(exp);
        h += '</div>';
        // Fail branch: two ifConFaiTitle divs
        h += '<div class="ifConFaiTitle"><b>Execute When Not Met:</b></div>';
        h += '<div class="ifConSucTitle">' + dropButton('iffail') + '</div>';
        h += '<div class="ifConFaidiv" style="padding-left:20px">';
        if (expfail.length) h += renderChildren(expfail);
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderWhile(p) {
        var con = p.con || [];
        var exp = p.exp || [];
        var h = '<div id="" class="whileDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="ifDivTitle">Loop Condition:</div>';
        h += '<div class="ifConDiv"><div class="ifConDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Add Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varOpAddShow(event)" value="+Add Operator">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Add Constant">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'ifConExpDiv\')">' + buildAllVarOptions() + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'ifConExpDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"><div class="conDefault"><a href="javascript:void(0)" onclick="selConDefault(event,\'true\')">True</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'false\')">False</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'null\')">Empty</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'{}\')">Empty Object</a> <a href="javascript:void(0)" onclick="selConDefault(event,\'[]\')">Empty Object List</a></div></div>';
        h += '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'ifConExpDiv\')"><option></option><option>+</option><option>-</option><option>*</option><option>/</option><option>(</option><option>)</option><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option><option>==</option><option>!=</option><option>||</option><option>&amp;&amp;</option></select><input class="btnCancleVar" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="ifConExpDiv">';
        if (con.length) h += renderExpression(con, 'ifConExpDiv');
        h += '</div></div>';
        // Only one ifConSucTitle with the dropdown button (no separate text title)
        h += '<div class="ifConSucTitle">' + dropButton('while') + '</div>';
        h += '<div class="forConSucdiv" style="padding-left:20px">';
        if (exp.length) h += renderChildren(exp);
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderAssignDb(p) {
        var left = p.left || {};
        var leftVar = typeof left === 'string' ? left : (left.v || '');
        var leftn = p.leftn || leftVar;
        var leftd = p.leftd || '';

        var h = '<div id="" class="assignDbDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        // Left side
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varObjListSelShow(event)" value="+Select L-Value/Setting">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue">' + buildObjlistOptions(leftVar) + '</select><select class="varSelValue" style="display:none"><option></option></select><select class="varSelValue" style="display:none"><option></option><option value="sqlpara">Include Queried SQL and Params</option></select><input type="text" class="varConAddValue" value="" placeholder="Record count, empty for all"><input class="btnSaveVar" type="button" value="Save" onclick="varSelAddDb(event,\'delsub\',\'assignDbExpLeftDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignDbExpLeftDiv">';
        if (leftVar) {
            // assignDb L-value has extra hidden inputs: [0]=var, [1]=role, [2]=sqlpara, [3]=recordCount
            var leftSub = '';
            if (left.r) leftSub += '(Permission Required)';
            if (left.s) leftSub += '(Include Queried SQL Condition)';
            if (left.t) leftSub += 'Records: ' + left.t;
            h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(leftn || leftVar) + '</span><input type="hidden" value="' + escHtml(leftVar) + '"><input type="hidden" value="' + escHtml(left.r || '') + '"><input type="hidden" value="' + escHtml(left.s || '') + '"><input type="hidden" value="' + escHtml(left.t || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(leftVar) + '\',\'' + escHtml(leftVar) + '\',\'assignDbExpLeftDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">' + leftSub + '</div></div>';
        }
        h += '</div><div class="debugDiv" style="float:left;padding-top: 5px;box-sizing: border-box;width:60%"><input class="btnCancleVar" type="button" onclick="varDegbugUpd(event)" value="Log">';
        if (leftd === 'd' || leftd === 'di') h += '<div class="varSelDebug"><span class="showInfo" style="padding-left:12px">Log Record</span></div>';
        h += '</div></div>';
        // Equal sign
        h += '<div class="assignDivEqual">=</div>';
        // Right side - matches assignDbDivTemp structure
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbShow(event)" value="+Select Dataset">';
        h += '<input class="btnAddVarDb" type="button" onclick="varOpJoinAddShow(event)" value="+Operator">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbFilterShow(event,\'selDbJoinFieldDiv\')" value="+Join Field">';
        h += '<input class="btnAddVar" type="button" onclick="varSelDbFieldShow(event,\'dt\')" value="+Return Field">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbFilterShow(event,\'selDbFilterDiv\')" value="+Filter Field" style="margin-left:20px;">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelShow(\'r\',event)" value="+Variable">';
        h += '<input class="btnAddVarDb" type="button" onclick="varOpAddShow(event)" value="+Operator">';
        h += '<input class="btnAddVarDb" type="button" onclick="varConAddShow(event)" value="+Constant">';
        h += '<input class="btnAddVar" type="button" onclick="varSelDbGroupShow(event,\'selDbGroupDiv\')" value="+Group Field">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbGroupShow(event,\'selDbGroupFilterDiv\')" value="+Group Filter Field">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelShowSub(\'r\',event)" value="+Variable">';
        h += '<input class="btnAddVarDb" type="button" onclick="varOpAddShowSub(event)" value="+Operator">';
        h += '<input class="btnAddVarDb" type="button" onclick="varConAddShowSub(event)" value="+Constant">';
        h += '<input class="btnAddVar" type="button" onclick="varSelDbGroupShow(event,\'selDbOrderDiv\')" value="+Sort Field">';
        // Hidden popups
        h += '<div class="selDbDiv" style="display:none"><select class="varSelValue" onchange="varSelDbAdd(event,\'dbSelDiv\')"><option></option></select><input type="text" class="varConAddValue" value="" placeholder="Alias"><input class="btnSaveVar" type="button" value="Save" onclick="varSelDbAddDo(event,\'dbSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbFieldDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event,\'dt\')"><option></option></select><select class="varSelValue" onchange="varSelDbFieldChange(event)"><option></option></select><select class="varSelValueSmall"><option></option><option value="count">Total Count</option><option value="sum">Sum</option><option value="avg">Average</option><option value="max">Maximum</option><option value="min">Minimum</option></select><input type="text" class="varConAddValue" value="" placeholder="DB Field Alias"><input type="text" class="varConAddValue" value="" placeholder="Display Text"><select class="varSelValueSmall"><option></option><option value="pkey">Is Primary Key</option></select><select class="varSelValueSmall"><option></option><option value="searchkey">Full-Text Search</option></select><input class="btnSaveVar" type="button" value="Save" onclick="varSelDbFieldAdd(event,\'dbFieldSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbFilterDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue" onchange="varSelDbFilterAdd(event,\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbJoinFieldDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue" onchange="varSelDbFilterAdd(event,\'dbSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbGroupDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue" onchange="varSelDbGroupAdd(event,\'dbGroupSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbGroupFilterDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue"><option></option></select><select class="varSelValueSmall"><option></option><option value="count">Total Count</option><option value="sum">Sum</option><option value="avg">Average</option><option value="max">Maximum</option><option value="min">Minimum</option></select><input class="btnSaveVar" type="button" value="Save" onclick="varSelDbGroupAdd(event,\'dbGroupFilterSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbOrderDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue"><option></option></select><select class="varSelValueSmall"><option></option><option value="asc">asc</option><option value="desc">desc</option></select><input class="btnSaveVar" type="button" value="Save" onclick="varSelDbOrderAdd(event,\'dbOrderSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'dbFilterSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'dbFilterSelDiv\')"><option></option><option>=</option><option>&lt;&gt;</option><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option><option>and</option><option>or</option><option>(</option><option>)</option><option>in</option><option>not in</option><option>like</option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varOpJoinAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpJoinAdd(event,\'dbSelDiv\')"><option></option><option value="left join">LEFT JOIN</option><option value="right join">RIGHT JOIN</option><option value="inner join">INNER JOIN</option><option value="on">on</option><option value="=">=</option><option value="and">AND</option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDivSub" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'dbGroupFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddivSub" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'dbGroupFilterSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varOpAdddivSub" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'dbGroupFilterSelDiv\')"><option></option><option>=</option><option>&lt;&gt;</option><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div>';
        // Display divs with data
        h += '<div class="dbSelDiv">';
        if (p.rightDb && p.rightDb.length) {
            for (var di = 0; di < p.rightDb.length; di++) {
                var dbItem = p.rightDb[di];
                if (dbItem.v !== undefined) {
                    // Dataset: varSelDiv with v + alias hidden inputs
                    h += '<div class="varSelDiv" draggable="true"><span style="border:none;">' + escHtml(dbItem.ln || dbItem.v) + '</span><input type="hidden" value="' + escHtml(dbItem.v) + '"><input type="hidden" value="' + escHtml(dbItem.a || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">(' + escHtml(dbItem.a || dbItem.v) + ')</div></div>';
                } else if (dbItem.o !== undefined) {
                    // Join/condition operator: varOpDiv
                    h += '<div class="varOpDiv" draggable="true"><span style="border:none;">' + escHtml(dbItem.o) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                } else if (dbItem.f !== undefined) {
                    // Join field: varSelDivFilter
                    h += '<div class="varSelDivFilter" draggable="true"><span style="border:none;">' + escHtml(dbItem.f) + '</span><input type="hidden" value="' + escHtml(dbItem.f) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                }
            }
        }
        h += '</div>';
        // Field div - each rightField item is a single object with v/fa/tk/vpk/vsk/ft
        h += '<div class="dbFieldSelDiv">';
        if (p.rightField && p.rightField.length) {
            for (var rfi = 0; rfi < p.rightField.length; rfi++) {
                var rf = p.rightField[rfi];
                var rfName = rf.v || rf.f || '';
                var rfDisplay = rf.ln || rfName;
                h += '<div class="varSelDiv" draggable="true"><span style="border:none;">' + escHtml(rfDisplay) + '</span>';
                h += '<input type="hidden" value="' + escHtml(rfName) + '">';
                h += '<input type="hidden" value="' + escHtml(rf.fa || '') + '">';
                h += '<input type="hidden" value="' + escHtml(rf.tk || '') + '">';
                h += '<input type="hidden" value="' + escHtml(rf.vpk || '') + '">';
                h += '<input type="hidden" value="' + escHtml(rf.vsk || '') + '">';
                h += '<input type="hidden" value="' + escHtml(rf.ft || '') + '">';
                h += '<span class="action-content" style="float:right"><a href="#" onclick="varSelDbFieldDel(event,\'' + escHtml(rfDisplay) + '\',\'dbFieldSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span>';
                if (rf.ft) h += '<div class="showInfo">Display Text: ' + escHtml(rf.ft) + '</div>';
                var infoParts = [];
                infoParts.push(escHtml(rfName));
                if (rf.fa) infoParts.push(' as ' + escHtml(rf.fa));
                var infoStr = '(' + infoParts.join('') + ')';
                if (rf.vpk) infoStr += '(' + escHtml(rf.vpk) + ')';
                if (rf.tk) infoStr += '(' + escHtml(rf.tk.charAt(0).toUpperCase() + rf.tk.slice(1)) + ')';
                if (rf.vsk) infoStr += '(' + escHtml(rf.vsk) + ')';
                h += '<div class="showInfo">' + infoStr + '</div>';
                h += '</div>';
            }
        }
        h += '</div>';
        // Filter div
        h += '<div class="dbFilterSelDiv">';
        if (p.rightFilter && p.rightFilter.length) h += renderExpression(p.rightFilter, 'dbFilterSelDiv');
        h += '</div>';
        // Group div
        h += '<div class="dbGroupSelDiv">';
        if (p.rightGroup && p.rightGroup.length) {
            for (var gi = 0; gi < p.rightGroup.length; gi++) {
                var gItem = p.rightGroup[gi];
                var gName = gItem.f || '';
                var gDisplay = gItem.ln || gName;
                h += '<div class="varSelDivGroup" draggable="true"><span style="border:none;">' + escHtml(gDisplay) + '</span><input type="hidden" value="' + escHtml(gName) + '"><input type="hidden" value="' + escHtml(gItem.tk) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbGroupSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">' + escHtml(gName) + '</div></div>';
            }
        }
        h += '</div>';
        // Group filter div - mixed expression with varSelDivGroup (f+tk), varOpDiv, varConDiv
        h += '<div class="dbGroupFilterSelDiv">';
        if (p.rightGroupFilter && p.rightGroupFilter.length) {
            for (var gfi = 0; gfi < p.rightGroupFilter.length; gfi++) {
                var gfItem = p.rightGroupFilter[gfi];
                if (gfItem.f !== undefined) {
                    var gfName = gfItem.f;
                    h += '<div class="varSelDivGroup" draggable="true"><span style="border:none;">' + escHtml(gfName) + '</span><input type="hidden" value="' + escHtml(gfName) + '"><input type="hidden" value="' + escHtml(gfItem.tk) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbGroupFilterSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">' + escHtml(gfName) + (gfItem.tk ? '(' + escHtml(gfItem.tk) + ')' : '') + '</div></div>';
                } else if (gfItem.o !== undefined) {
                    h += '<div class="varOpDiv" draggable="true"><span style="border:none;">' + escHtml(gfItem.o) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbGroupFilterSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                } else if (gfItem.c !== undefined) {
                    h += '<div class="varConDiv" draggable="true"><span style="border:none;">' + escHtml(gfItem.c) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbGroupFilterSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                }
            }
        }
        h += '</div>';
        // Order div
        h += '<div class="dbOrderSelDiv">';
        if (p.rightOrder && p.rightOrder.length) {
            for (var oi = 0; oi < p.rightOrder.length; oi++) {
                var oItem = p.rightOrder[oi];
                var oName = oItem.f || '';
                h += '<div class="varSelDivOrder" draggable="true"><span style="border:none;">' + escHtml(oName) + '</span><input type="hidden" value="' + escHtml(oName) + '"><input type="hidden" value="' + escHtml(oItem.tk || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbOrderSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">' + escHtml(oName) + (oItem.tk ? '(' + escHtml(oItem.tk) + ')' : '') + '</div></div>';
            }
        }
        h += '</div>';
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderAssignSqlFilter(p) {
        var left = p.left || {};
        var leftVar = typeof left === 'string' ? left : (left.v || '');
        var h = '<div id="" class="assignSqlFilterDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varObjSqlSelShow(event)" value="+Select L-Value">';
        h += '<div class="selDiv" style="display: none;"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignSqlFilterExpLeftDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignSqlFilterExpLeftDiv">';
        if (leftVar) h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(leftVar) + '</span><input type="hidden" value="' + escHtml(leftVar) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(leftVar) + '\',\'\',\'assignSqlFilterExpLeftDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        h += '</div></div><div class="assignDivEqual">=</div>';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelSqlFilterShow(event)" value="+Select Filter Field" style="margin-left:20px;">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Add Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varOpAddShow(event)" value="+Add Operator">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Add Constant">';
        h += '<div class="selDbFilterDiv" style="display: none;"><select class="varSelValue" onchange="varSelSqlFilterField(event)"><option></option></select><select class="varSelValue" onchange="varSelSqlFilterAdd(event,\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display: none;"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'dbFilterSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varOpAdddiv" style="display: none;"><select class="varOpAddValue" onchange="varOpAdd(event,\'dbFilterSelDiv\')"><option></option><option value="=">=</option><option value="!=">!=</option><option value="&gt;">&gt;</option><option value="&lt;">&lt;</option><option value="&gt;=">&gt;=</option><option value="&lt;=">&lt;=</option><option value="and">AND</option><option value="or">OR</option><option value="(">(</option><option value=")">)</option><option value="in">in</option><option value="not in">not in</option><option value="like">LIKE</option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="dbFilterSelDiv">';
        if (p.rightFilter && p.rightFilter.length) h += renderExpression(p.rightFilter, 'dbFilterSelDiv');
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderInsDb(p) {
        var leftVar = p.left || '';
        var leftn = p.leftn || leftVar;
        var dbAlias = (p.rightDb && p.rightDb[0]) ? (p.rightDb[0].a || p.rightDb[0].v) : '';
        var h = '<div id="" class="insDbDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'l\',event)" value="+Select L-Value (return ID)">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpLeftDiv\')">' + buildAllVarOptions(leftVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpLeftDiv">';
        if (leftVar) h += makeVarSelDiv(leftVar, 'assignExpLeftDiv', null, leftn);
        h += '</div></div><div class="assignDivEqual">=</div>';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbShow(event)" value="+Select Dataset">';
        h += '<input class="btnAddVar" type="button" onclick="varSelDbFieldUpdShow(event,\'\')" value="+Select Insert Field">';
        h += '<div class="selDbDiv" style="display:none"><select class="varSelValue" onchange="varSelDbAdd(event,\'dbSelDiv\')"><option></option></select><input type="hidden" class="varConAddValue" value="' + escHtml(dbAlias) + '" placeholder="Alias"><input class="btnSaveVar" type="button" value="Save" onclick="varSelDbAddDo(event,\'dbSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbFieldDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event,\'\')"><option></option></select><select class="varSelValue"><option></option></select><span>&nbsp;=</span><select class="varSelValueSmall" style="width:80px" onchange="varSelFieldDataMode(event)"><option>Variable</option><option>Constant</option></select><select class="varSelValue"><option></option></select><input type="text" class="varConAddValue" value="" style="display:none"><input class="btnSaveVar" type="button" value="Save" onclick="varSelUpdDbFieldAdd(event,\'dbFieldSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="dbSelDiv">';
        if (p.rightDb && p.rightDb.length) {
            for (var i = 0; i < p.rightDb.length; i++) {
                var db = p.rightDb[i];
                if (typeof db === 'object' && db.v) {
                    h += '<div class="varSelDiv" draggable="true"><span style="border:none;">' + escHtml(db.ln || db.v) + '</span><input type="hidden" value="' + escHtml(db.v) + '"><input type="hidden" value="' + escHtml(db.a || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">(' + escHtml(db.a || db.v) + ')</div></div>';
                }
            }
        }
        h += '</div><div class="dbFieldSelDiv">';
        if (p.rightField && p.rightField.length) {
            var fi = 0;
            while (fi < p.rightField.length) {
                if (p.rightField[fi].f !== undefined) {
                    var fName = p.rightField[fi].f;
                    var fLn = p.rightField[fi].ln || '';
                    fi++;
                    if (fi < p.rightField.length && p.rightField[fi].o !== undefined) fi++;
                    var fVal = '';
                    var fCls = 'v';
                    if (fi < p.rightField.length) {
                        var valObj = p.rightField[fi];
                        if (valObj.v !== undefined) { fVal = valObj.v; fCls = 'v'; }
                        else if (valObj.c !== undefined) { fVal = valObj.c; fCls = 'c'; }
                    }
                    var displayLabel = fLn || fName;
                    var displayText = fVal ? (escHtml(displayLabel) + ' = ' + escHtml(fVal)) : escHtml(displayLabel);
                    var delArg = fLn ? escHtml(fLn) + '_' + escHtml(fName) : escHtml(fName);
                    h += '<div class="varSelFieldDiv" draggable="true"><span style="border:none;">' + displayText + '</span><input type="hidden" value="' + escHtml(fName) + '">';
                    if (fVal) h += '<input type="hidden" value="' + escHtml(fVal) + '" class="' + fCls + '">';
                    h += '<span class="action-content" style="float:right"><a href="#" onclick="varSelDbFieldDel(event,\'' + delArg + '\',\'dbFieldSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                    fi++;
                    if (fi < p.rightField.length && p.rightField[fi].o === ';') fi++;
                } else { fi++; }
            }
        }
        h += '</div><div class="debugDiv" style="float:left;padding-top: 5px;box-sizing: border-box;"><input class="btnCancleVar" type="button" onclick="varDegbugUpd(event)" value="Log">';
        var insDbDebug = p.rightDb && p.rightDb.some(function(db) { return db.d === 'di' || db.d === 'd'; });
        if (insDbDebug) h += '<div class="varSelDebug"><span class="showInfo" style="padding-left:12px">Log Record</span></div>';
        h += '</div>';
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderUpdDb(p) {
        var dbAlias = (p.rightDb && p.rightDb[0]) ? (p.rightDb[0].a || p.rightDb[0].v) : '';
        var h = '<div id="" class="updDbDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbShow(event)" value="+Select Dataset">';
        h += '<input class="btnAddVar" type="button" onclick="varSelDbFieldUpdShow(event,\'\')" value="+Select Update Field">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbFilterShow(event,\'selDbFilterDiv\')" value="+Select Filter Field" style="margin-left:20px;">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Add Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varOpAddShow(event)" value="+Add Operator">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Add Constant">';
        // Hidden popups
        h += '<div class="selDbDiv" style="display:none"><select class="varSelValue" onchange="varSelDbAdd(event,\'dbSelDiv\')"><option></option></select><input type="hidden" class="varConAddValue" value="' + escHtml(dbAlias) + '" placeholder="Alias"><input class="btnSaveVar" type="button" value="Save" onclick="varSelDbAddDo(event,\'dbSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbFieldDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event,\'\')"><option></option></select><select class="varSelValue"><option></option></select><span>&nbsp;=</span><select class="varSelValueSmall" style="width:80px" onchange="varSelFieldDataMode(event)"><option>Variable</option><option>Constant</option></select><select class="varSelValue"><option></option></select><input type="text" class="varConAddValue" value="" style="display:none"><input class="btnSaveVar" type="button" value="Save" onclick="varSelUpdDbFieldAdd(event,\'dbFieldSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbFilterDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue" onchange="varSelDbFilterAdd(event,\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'dbFilterSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'dbFilterSelDiv\')"><option></option><option>=</option><option>&lt;&gt;</option><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option><option>and</option><option>or</option><option>(</option><option>)</option><option>in</option><option>not in</option><option>like</option></select><input class="btnCancleVar" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div>';
        // Display divs
        h += '<div class="dbSelDiv">';
        if (p.rightDb && p.rightDb.length) {
            for (var i = 0; i < p.rightDb.length; i++) {
                var db = p.rightDb[i];
                if (typeof db === 'object' && db.v) {
                    h += '<div class="varSelDiv" draggable="true"><span style="border:none;">' + escHtml(db.ln || db.v) + '</span><input type="hidden" value="' + escHtml(db.v) + '"><input type="hidden" value="' + escHtml(db.a || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">(' + escHtml(db.a || db.v) + ')</div></div>';
                }
            }
        }
        h += '</div><div class="dbFieldSelDiv">';
        if (p.rightField && p.rightField.length) {
            var fi = 0;
            while (fi < p.rightField.length) {
                if (p.rightField[fi].f !== undefined) {
                    var fName = p.rightField[fi].f;
                    var fLn = p.rightField[fi].ln || '';
                    fi++;
                    if (fi < p.rightField.length && p.rightField[fi].o !== undefined) fi++;
                    var fVal = '';
                    var fCls = 'v';
                    if (fi < p.rightField.length) {
                        var valObj = p.rightField[fi];
                        if (valObj.v !== undefined) { fVal = valObj.v; fCls = 'v'; }
                        else if (valObj.c !== undefined) { fVal = valObj.c; fCls = 'c'; }
                    }
                    var displayLabel = fLn || fName;
                    var displayText = fVal ? (escHtml(displayLabel) + ' = ' + escHtml(fVal)) : escHtml(displayLabel);
                    var delArg = fLn ? escHtml(fLn) + '_' + escHtml(fName) : escHtml(fName);
                    h += '<div class="varSelFieldDiv" draggable="true"><span style="border:none;">' + displayText + '</span><input type="hidden" value="' + escHtml(fName) + '">';
                    if (fVal) h += '<input type="hidden" value="' + escHtml(fVal) + '" class="' + fCls + '">';
                    h += '<span class="action-content" style="float:right"><a href="#" onclick="varSelDbFieldDel(event,\'' + delArg + '\',\'dbFieldSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                    fi++;
                    if (fi < p.rightField.length && p.rightField[fi].o === ';') fi++;
                } else { fi++; }
            }
        }
        h += '</div><div class="dbFilterSelDiv">';
        if (p.rightFilter && p.rightFilter.length) h += renderExpression(p.rightFilter, 'dbFilterSelDiv');
        h += '</div><div class="debugDiv" style="float:left;padding-top: 5px;box-sizing: border-box;"><input class="btnCancleVar" type="button" onclick="varDegbugUpd(event)" value="Log">';
        var updDbDebug = p.rightDb && p.rightDb.some(function(db) { return db.d === 'di' || db.d === 'd'; });
        if (updDbDebug) h += '<div class="varSelDebug"><span class="showInfo" style="padding-left:12px">Log Record</span></div>';
        h += '</div>';
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderDelDb(p) {
        var dbAlias = (p.rightDb && p.rightDb[0]) ? (p.rightDb[0].a || p.rightDb[0].v) : '';
        var h = '<div id="" class="delDbDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbShow(event)" value="+Select Dataset">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelDbFilterShow(event,\'selDbFilterDiv\')" value="+Select Filter Field" style="margin-left:20px;">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Add Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varOpAddShow(event)" value="+Add Operator">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Add Constant">';
        // Hidden popups
        h += '<div class="selDbDiv" style="display:none"><select class="varSelValue" onchange="varSelDbAdd(event,\'dbSelDiv\')"><option></option></select><input type="hidden" class="varConAddValue" value="' + escHtml(dbAlias) + '" placeholder="Alias"><input class="btnSaveVar" type="button" value="Save" onclick="varSelDbAddDo(event,\'dbSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbFieldDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue"><option></option></select><input class="btnSaveVar" type="button" value="Save" onclick="varSelUpdDbFieldAdd(event,\'dbFieldSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDbFilterDiv" style="display:none"><select class="varSelValue" onchange="varSelDbShowField(event)"><option></option></select><select class="varSelValue" onchange="varSelDbFilterAdd(event,\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'dbFilterSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'dbFilterSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'dbFilterSelDiv\')"><option></option><option>=</option><option>&lt;&gt;</option><option>&gt;</option><option>&lt;</option><option>&gt;=</option><option>&lt;=</option><option>and</option><option>or</option><option>(</option><option>)</option><option>in</option><option>not in</option><option>like</option></select><input class="btnCancleVar" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div>';
        // Display divs
        h += '<div class="dbSelDiv">';
        if (p.rightDb && p.rightDb.length) {
            for (var i = 0; i < p.rightDb.length; i++) {
                var db = p.rightDb[i];
                if (typeof db === 'object' && db.v) {
                    h += '<div class="varSelDiv" draggable="true"><span style="border:none;">' + escHtml(db.ln || db.v) + '</span><input type="hidden" value="' + escHtml(db.v) + '"><input type="hidden" value="' + escHtml(db.a || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'dbSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><div class="showInfo">(' + escHtml(db.a || db.v) + ')</div></div>';
                }
            }
        }
        h += '</div><div class="dbFilterSelDiv">';
        if (p.rightFilter && p.rightFilter.length) h += renderExpression(p.rightFilter, 'dbFilterSelDiv');
        h += '</div><div class="debugDiv" style="float:left;padding-top: 5px;box-sizing: border-box;"><input class="btnCancleVar" type="button" onclick="varDegbugUpd(event)" value="Log">';
        var delDbDebug = p.rightDb && p.rightDb.some(function(db) { return db.d === 'di' || db.d === 'd'; });
        if (delDbDebug) h += '<div class="varSelDebug"><span class="showInfo" style="padding-left:12px">Log Record</span></div>';
        h += '</div>';
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderOutSvr(p) {
        var leftVar = p.left || '';
        var leftn = p.leftn || leftVar;
        var urlVar = p.urlv || '';
        var urlCon = p.url || '';
        var paraVar = typeof p.para === 'string' ? p.para : '';
        var h = '<div id="" class="outSvrDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="outSvrTitle">Remote API Call</div>';
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'l\',event)" value="+Select L-Value (return object)">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpLeftDiv\')">' + buildAllVarOptions(leftVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpLeftDiv">';
        if (leftVar) h += makeVarSelDiv(leftVar, 'assignExpLeftDiv', null, leftn);
        h += '</div></div><div class="assignDivEqual">=</div>';
        h += '<div class="outSvrConDiv"><div class="ifConDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShowSvr(\'r\',event)" value="+Interface URL Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Interface URL Constant">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Interface Param">';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varOutSvrUrlAdd(event,\'outSvr1ExpDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDivSvr" style="display:none"><select class="varSelValue" onchange="varOutSvrParaAdd(event,\'outSvr1ExpDiv\')">' + buildAllVarOptions(urlVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varOutSvrParaAdd(event,\'outSvr2ExpDiv\')">' + buildAllVarOptions(paraVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="outSvr1ExpDiv">';
        if (urlVar) h += '<div class="varSelDiv"><span style="border:none;"></span><input type="hidden" value="' + escHtml(urlVar) + '"><span style="border:none;">' + escHtml(urlVar) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(urlVar) + '\',\'\',\'outSvr1ExpDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        else if (urlCon) h += '<div class="varConDiv" draggable="true"><span style="border:none;">' + escHtml(urlCon) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'outSvr1ExpDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        h += '</div><div class="outSvr2ExpDiv">';
        if (paraVar) h += '<div class="varSelDiv"><span style="border:none;"></span><input type="hidden" value="' + escHtml(paraVar) + '"><span style="border:none;">' + escHtml(paraVar) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(paraVar) + '\',\'\',\'outSvr2ExpDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderMsg(p) {
        var leftVar = p.left || '';
        var rightCode = p.rightCode || [];
        var rightPara = p.rightPara || [];
        var h = '<div id="" class="msgDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'l\',event)" value="+Select L-Value">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpLeftDiv\')">' + buildAllVarOptions(leftVar) + '</select></div>';
        h += '</div><div class="assignExpLeftDiv">';
        if (leftVar) h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(leftVar) + '</span><input type="hidden" value="' + escHtml(leftVar) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(leftVar) + '\',\'\',\'assignExpLeftDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        h += '</div></div><div class="assignDivEqual">=</div>';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelMsgShow(event)" value="+Select Template">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelMsgParaShow(event)" value="+Set Parameters" style="margin-left:20px;">';
        h += '<div class="selMsgDiv" style="display:none"><select class="varSelValue" onchange="varSelMsgAddDo(event,\'msgSelDiv\')"><option value=""></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selMsgParaDiv" style="display:none"><select class="varSelValue"><option value=""></option></select><span>&nbsp;=</span><select class="varSelValueSmall" onchange="varSelFieldDataModeSub(event)" style="width:80px"><option>Variable</option><option>Constant</option></select><select class="varSelValue" style=""><option value=""></option></select><input type="text" class="varConAddValue" value="" style="display:none"><input class="btnSaveVar" type="button" value="Save" onclick="varSelMsgParaAdd(event,\'msgParaSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="msgSelDiv">';
        if (rightCode && rightCode.length) {
            for (var i = 0; i < rightCode.length; i++) {
                var rc = rightCode[i];
                if (typeof rc === 'object' && rc.v) {
                    h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(rc.ln || lookupMsgName(rc.v)) + '</span><input type="hidden" value="' + escHtml(rc.v) + '"><input type="hidden"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'msgSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                }
            }
        }
        h += '</div><div class="msgParaSelDiv">';
        if (rightPara && rightPara.length) {
            var ri = 0;
            while (ri < rightPara.length) {
                if (rightPara[ri].f !== undefined) {
                    var fVal = rightPara[ri].f;
                    ri++;
                    if (ri < rightPara.length && rightPara[ri].o === '=') ri++;
                    var valObj = rightPara[ri] || {};
                    var val = valObj.v || valObj.c || '';
                    var valClass = valObj.v !== undefined ? 'v' : 'c';
                    var valDisplay = valObj.ln || val;
                    h += '<div class="varSelDivPara"><span style="border:none;">' + escHtml(fVal) + ' = ' + escHtml(valDisplay) + '</span><input type="hidden" value="' + escHtml(fVal) + '"><input type="hidden" value="' + escHtml(val) + '" class="' + valClass + '"><input type="hidden" value="' + escHtml(valObj.ln || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'msgParaSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                    ri++;
                    if (ri < rightPara.length && rightPara[ri].o === ';') ri++;
                } else { ri++; }
            }
        }
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderInsObjlist(p) {
        var leftVar = p.left || '';
        var leftn = p.leftn || leftVar;
        var rightExpr = p.right || [];
        var rightVar = (rightExpr.length > 0 && rightExpr[0].v) ? rightExpr[0].v : '';
        var rightn = (rightExpr.length > 0 && rightExpr[0].ln) ? rightExpr[0].ln : rightVar;
        var h = '<div id="" class="insObjlistDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varForSelShow(event)" value="+Select L-Value">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpLeftDiv\')">' + buildObjlistOptions(leftVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpLeftDiv">';
        if (leftVar) h += makeVarSelDiv(leftVar, 'assignExpLeftDiv', null, leftn);
        h += '</div></div><div class="assignDivEqual">Add</div>';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varObjSelShow(event)" value="+Add Variable">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpDiv\')">' + buildObjOptions(rightVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpDiv">';
        if (rightVar) h += makeVarSelDiv(rightVar, 'assignExpDiv', null, rightn);
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderSubcode(p) {
        var leftVar = p.left || '';
        var leftn = p.leftn || leftVar;
        var leftd = p.leftd || '';
        var rightCode = p.rightCode || [];
        var rightPara = p.rightPara || [];
        var h = '<div id="" class="subcodeDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'l\',event)" value="+Select L-Value">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'assignExpLeftDiv\')">' + buildAllVarOptions(leftVar) + '</select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpLeftDiv">';
        if (leftVar) h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(leftn || leftVar) + '</span><input type="hidden" value="' + escHtml(leftVar) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(leftVar) + '\',\'\',\'assignExpLeftDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
        h += '</div><div class="debugDiv" style="float:left;padding-top: 5px;box-sizing: border-box;width:60%"><input class="btnCancleVar" type="button" onclick="varDegbugUpd(event)" value="Log">';
        if (leftd === 'd' || leftd === 'di') h += '<div class="varSelDebug"><span class="showInfo" style="padding-left:12px">Log Record</span></div>';
        h += '</div></div><div class="assignDivEqual">=</div>';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelCodeShow(event,\'\')" value="+Select Sub-Code">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelCodeParaShow(event)" value="+Set Parameters" style="margin-left:20px;">';
        h += '<div class="selCodeDiv" style="display:none"><select class="varSelValue" onchange="varSelCodeAddDo(event,\'codeSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selCodeParaDiv" style="display:none"><select class="varSelValue"><option></option></select><span>&nbsp;=</span><select class="varSelValueSmall" onchange="varSelFieldDataModeSub(event)" style="width:80px"><option>Variable</option><option>Constant</option></select><select class="varSelValue"><option></option></select><input type="text" class="varConAddValue" value="" style="display:none"><input class="btnSaveVar" type="button" value="Save" onclick="varSelCodeParaAdd(event,\'codeParaSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="codeSelDiv">';
        if (rightCode && rightCode.length) {
            for (var i = 0; i < rightCode.length; i++) {
                var rc = rightCode[i];
                if (typeof rc === 'object' && rc.v) {
                    h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(rc.ln || lookupCodeName(rc.v)) + '</span><input type="hidden" value="' + escHtml(rc.v) + '"><input type="hidden" value="' + escHtml(rc.c || '') + '"><input type="hidden" value="' + escHtml(rc.p || '') + '"><input type="hidden" value="' + (rc.pc !== undefined ? escHtml(rc.pc) : '0') + '">';
                    h += '<span class="action-content" style="float:right"><a href="#" onclick="varSelDelSucodePara(event,\'codeParaSelDiv\');varSelDel(event,\'\',\'codeSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                }
            }
        }
        h += '</div><div class="codeParaSelDiv">';
        if (rightPara && rightPara.length) {
            var ri = 0;
            while (ri < rightPara.length) {
                if (rightPara[ri].f !== undefined) {
                    var fVal = rightPara[ri].f;
                    ri++;
                    if (ri < rightPara.length && rightPara[ri].o === '=') ri++;
                    var valObj = rightPara[ri] || {};
                    var val = valObj.v || valObj.c || '';
                    var valClass = valObj.v !== undefined ? 'v' : 'c';
                    var valDisplay = valObj.ln || val;
                    h += '<div class="varSelDivPara"><span style="border:none;">' + escHtml(fVal) + ' = ' + escHtml(valDisplay) + '</span><input type="hidden" value="' + escHtml(fVal) + '"><input type="hidden" value="' + escHtml(val) + '" class="' + valClass + '"><input type="hidden" value="' + escHtml(valObj.ln || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'codeParaSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                    ri++;
                    if (ri < rightPara.length && rightPara[ri].o === ';') ri++;
                } else { ri++; }
            }
        }
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderSubcodeJS(p) {
        var left = p.left || {};
        var leftVar = typeof left === 'string' ? left : (left.v || '');
        var leftn = p.leftn || leftVar;
        var leftd = p.leftd || '';
        var leftr = (typeof left === 'object') ? (left.r || '') : '';
        var rightCode = p.rightCode || [];
        var rightPara = p.rightPara || [];
        var h = '<div id="" class="subcodeJSDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="assignLeftDiv"><div class="assignLeftDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'l\',event)" value="+Select L-Value">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue">' + buildAllVarOptions(leftVar) + '</select><select class="varSelValue"><option value="manage"' + (leftr === 'manage' ? ' selected' : '') + '>Internal Call</option><option value="portal"' + (leftr === 'portal' ? ' selected' : '') + '>External Public Call</option></select><input class="btnSaveVar" type="button" value="Save" onclick="varSelAddSubcodeJs(event,\'assignExpLeftDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="assignExpLeftDiv">';
        if (leftVar) {
            var roleText = leftr === 'manage' ? 'Internal Call' : (leftr === 'portal' ? 'External Public Call' : '');
            h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(leftn) + '</span><input type="hidden" value="' + escHtml(leftVar) + '"><input type="hidden" value="' + escHtml(leftr) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDelMain(event,\'' + escHtml(leftVar) + '\',\'\',\'assignExpLeftDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span>';
            if (roleText) h += '<div class="showInfo">(' + roleText + ')</div>';
            h += '</div>';
        }
        h += '</div><div class="debugDiv" style="float:left;padding-top: 20px;box-sizing: border-box;width:60%"><input class="btnCancleVar" type="button" onclick="varDegbugUpd(event)" value="Log">';
        if (leftd === 'd' || leftd === 'di') h += '<div class="varSelDebug"><span class="showInfo" style="padding-left:12px">Log Record</span></div>';
        h += '</div></div><div class="assignDivEqual">=</div>';
        h += '<div class="assignRightDiv"><div class="assignRightDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelCodeShow(event,\'s\')" value="+Select Sub-Code">';
        h += '<input class="btnAddVarDb" type="button" onclick="varSelCodeParaShow(event)" value="+Set Parameters" style="margin-left:20px;">';
        h += '<div class="selCodeDiv" style="display:none"><select class="varSelValue" onchange="varSelCodeAddDo(event,\'codeSelDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selCodeParaDiv" style="display:none"><select class="varSelValue"><option></option></select><span>&nbsp;=</span><select class="varSelValueSmall" onchange="varSelFieldDataModeSub(event)" style="width:80px"><option>Variable</option><option>Constant</option></select><select class="varSelValue"><option></option></select><input type="text" class="varConAddValue" value="" style="display:none"><input class="btnSaveVar" type="button" value="Save" onclick="varSelCodeParaAdd(event,\'codeParaSelDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="codeSelDiv">';
        if (rightCode && rightCode.length) {
            for (var i = 0; i < rightCode.length; i++) {
                var rc = rightCode[i];
                if (typeof rc === 'object' && rc.v) {
                    h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(rc.ln || lookupCodeName(rc.v)) + '</span><input type="hidden" value="' + escHtml(rc.v) + '"><input type="hidden" value="' + escHtml(rc.c || '') + '"><input type="hidden" value="' + escHtml(rc.p || '') + '"><input type="hidden" value="' + (rc.pc !== undefined ? escHtml(rc.pc) : '0') + '">';
                    h += '<span class="action-content" style="float:right"><a href="#" onclick="varSelDelSucodePara(event,\'codeParaSelDiv\');varSelDel(event,\'\',\'codeSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                }
            }
        }
        h += '</div><div class="codeParaSelDiv">';
        if (rightPara && rightPara.length) {
            var ri = 0;
            while (ri < rightPara.length) {
                if (rightPara[ri].f !== undefined) {
                    var fVal = rightPara[ri].f;
                    ri++;
                    if (ri < rightPara.length && rightPara[ri].o === '=') ri++;
                    var valObj = rightPara[ri] || {};
                    var val = valObj.v || valObj.c || '';
                    var valClass = valObj.v !== undefined ? 'v' : 'c';
                    var valDisplay = valObj.ln || val;
                    h += '<div class="varSelDivPara"><span style="border:none;">' + escHtml(fVal) + ' = ' + escHtml(valDisplay) + '</span><input type="hidden" value="' + escHtml(fVal) + '"><input type="hidden" value="' + escHtml(val) + '" class="' + valClass + '"><input type="hidden" value="' + escHtml(valObj.ln || '') + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'codeParaSelDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
                    ri++;
                    if (ri < rightPara.length && rightPara[ri].o === ';') ri++;
                } else { ri++; }
            }
        }
        h += '</div></div>';
        h += '<div class="forConSucTitle"><b>Statement after sub-code execution:</b></div>';
        h += '<div class="forConSucTitle"><div class="codeval-action-add dropitem"><input type="button" value="+Add Execution Statement" style="width:180px" onmouseover="getSubCodeListContent(\'subcodejs\',event)"><div class="dropcontent"><ul class="menu-content"></ul></div></div></div>';
        h += '<div class="forConSucdiv" style="padding-left:20px">';
        if (p.exp && p.exp.length) h += renderChildren(p.exp);
        h += '</div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderJsHref(p) {
        var con = p.con || [];
        var h = '<div id="" class="jsHrefDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="jsHrefTitle">Jump URL:</div>';
        h += '<div class="jsHrefConDiv"><div class="ifConDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+Add Variable">';
        h += '<input class="btnAddVar" type="button" onclick="varOpAddShow(event)" value="+Add Operator">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+Add Constant">';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varSelAdd(event,\'\',\'jsHrefExpDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value=""><input class="btnSaveVar" type="button" value="Save" onclick="varConAdd(event,\'jsHrefExpDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="varOpAdddiv" style="display:none"><select class="varOpAddValue" onchange="varOpAdd(event,\'jsHrefExpDiv\')"><option></option><option value="+">+</option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="jsHrefExpDiv">';
        if (con && con.length) h += renderExpression(con, 'jsHrefExpDiv');
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    function renderJsSrc(p) {
        var con = p.con || [];
        var h = '<div id="" class="jsSrcDiv" onclick="selDiv(event)" draggable="true" style="display: block; position: relative;">';
        h += '<div class="jsSrcTitle">Native Code (return value):</div><div class="jsSrcConDiv"><div class="ifConDivSel">';
        h += '<input class="btnAddVar" type="button" onclick="varConAddShow(event)" value="+AddCustomCode"><input class="btnAddVar" type="button" onclick="varSelShow(\'r\',event)" value="+BackValue">';
        h += '<div class="varConAdddiv" style="display:none"><input type="text" class="varConAddValue" value="" style="width:300px"><input class="btnSaveVar" type="button" value="Save" onclick="varConJsAdd(event,\'jsSrcExpDiv\')"><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '<div class="selDiv" style="display:none"><select class="varSelValue" onchange="varReturnAdd(event,\'jsSrcExpDiv\')"><option></option></select><input class="btnCancleVar" type="button" value="Cancel" onclick="closeAdd(event)"></div>';
        h += '</div><div class="jsSrcExpDiv">';
        for (var i = 0; i < con.length; i++) {
            if (con[i].c) {
                h += '<div class="varConDiv" draggable="true"><span style="border:none;">' + escHtml(con[i].c) + '</span><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'jsSrcExpDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span><span class="action-content" style="float:right"><a href="#" onclick="showConJSUpd(event);return false;"><img width="18" src="./imgs/update.png"></a></span></div>';
            } else if (con[i].r) {
                h += '<div class="varSelDiv"><span style="border:none;">' + escHtml(con[i].r) + '</span><input type="hidden" value="' + escHtml(con[i].r) + '"><span class="action-content" style="float:right"><a href="#" onclick="varSelDel(event,\'\',\'jsSrcExpDiv\');return false;"><img width="18" src="./imgs/del.png"></a></span></div>';
            }
        }
        h += '</div></div>' + makeItemAction() + '</div>';
        return h;
    }

    var html = '';
    for (var i = 0; i < codelist.length; i++) {
        html += renderNode(codelist[i]);
    }
    return html;
}
function initTemplateDo(fValue)
{

    let dmr = document.getElementById("CodeVal");
    dmr.innerHTML = fValue;
    for (let dNodeSub of dmr.childNodes) 
    {
        if(gdivClassCode.indexOf("," +dNodeSub.className+ ",")>=0)
        {
            initDivContent(dNodeSub);

            dNodeSub.addEventListener('dragenter', (e) => {
            }, false)
        
            dNodeSub.addEventListener('dragover', e => {
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
        
            dNodeSub.addEventListener('drop', e => {
                e.preventDefault()
            }, false)

        }
    }

    initParaVar();
}

function initParaVar()
{
    let svars = getEleValue("varGListValue");
    if(svars!="")
    {
        tempVarlist = JSON.parse(svars);
        for(let item of tempVarlist)
        {
            if(item['ptype']!="sys")
            {
                let bfind=false;
                for(let itemsub of this.varGLists)
                {
                    if(item['name']==itemsub['name'])
                        bfind = true;
                }
                if(!bfind)
                {
                    this.varGLists.push(item);
                }
            }
        }
    } 
}


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
function initDivContent(pp)
{
    if(pp.className=="subcodeDiv"||pp.className=="msgDiv"||pp.className=="subcodeJSDiv")
        return;

    for (let dNode of pp.childNodes) 
    {
        if(dNode.className=="ifConDiv")
        {
            for (let dNodeSub of dNode.childNodes) 
            {
                if(dNodeSub.className!="ifConDivSel")
                {
                    for (let dNodeItem of dNodeSub.childNodes) 
                    {
                        if(gdivClass.indexOf("," + dNodeItem.className + ",")>=0)
                        {
                            divDragDeal(dNodeItem);
                        }
                    }
                }
            }
        }
        else if(dNode.className=="jsHrefConDiv")
        {
            for (let dNodeSub of dNode.childNodes) 
            {
                if(dNodeSub.className=="jsHrefExpDiv")
                {
                    for (let dNodeItem of dNodeSub.childNodes) 
                    {
                        if(gdivClass.indexOf("," + dNodeItem.className + ",")>=0)
                        {
                            divDragDeal(dNodeItem);
                        }
                    }
                }
            }
        }
        else if(dNode.className=="jsSrcConDiv")
        {
            for (let dNodeSub of dNode.childNodes) 
            {
                if(dNodeSub.className=="jsSrcExpDiv")
                {
                    for (let dNodeItem of dNodeSub.childNodes) 
                    {
                        if(gdivClass.indexOf("," + dNodeItem.className + ",")>=0)
                        {
                            divDragDeal(dNodeItem);
                        }
                    }
                }
            }
        }
        else if(dNode.className=="assignRightDiv")
        {
            for (let dNodeSub of dNode.childNodes) 
            {
                if(dNodeSub.className!="assignRightDivSel")
                {
                    for (let dNodeItem of dNodeSub.childNodes) 
                    {
                        if(gdivClass.indexOf("," + dNodeItem.className + ",")>=0)
                        {
                            divDragDeal(dNodeItem);
                        }
                    }
                }
            }
        }
        else if(dNode.className=="ifConSucdiv"||dNode.className=="ifConFaidiv"||dNode.className=="forConSucdiv")
        {
            for (let dNodeSub of dNode.childNodes) 
            {
                initDivContent(dNodeSub);
            }
        }
    }
}
function saveTemplate(sAction)
{
    gValMsg="";
    document.getElementById("main-wrapper-info").style.display="none";

    let savePara = {};
    savePara["codelist"] = [];
    let dmr = document.getElementById("CodeVal");
    for (let dNodeSub of dmr.childNodes) 
    {
        if(dNodeSub.className)
        {
            dNodeSub.classList.remove("redBorder");
            dNodeSub.classList.remove("blueBorder");
        }

        if(dNodeSub.className=="varDiv")
        {
            let codeObj = {};
            codeObj["type"]="def";
            codeObj["para"]=this.varGLists;
            savePara["codelist"].push(codeObj);
        }

        getSubcodeFunc(savePara["codelist"],dNodeSub);

        if(dNodeSub.className)
        {
            dNodeSub.style.backgroundColor="";
        }
    }

    if(gValMsg!="")
    {
        document.getElementById("main-wrapper-info").innerHTML=gValMsg;
        document.getElementById("main-wrapper-info").style.display="block";
        return;
    }

    setEleValue("varGListValue",JSON.stringify(this.varGLists));

    savePara["tempcontent"] = "";

    if(formCom)
    {
        parent.setCodeValValue(savePara);
        parent.closeCodeValWin();
    }
    else
    {
        let paras={};
        paras['viewCode']="code";
        paras['itemIDs']=gCodeID;
        paras['codefilename']=gCodeFile;
        paras['open']=gCodeOpen;
        paras["field_codefile"]=JSON.stringify(savePara);
        if(gCodeType=="CodeFront")
        {
            paras["field_ISFRONT"]="1";
        }
        else
        {
            paras["field_ISFRONT"]="0";
        }
        paras["field_ISCACHE"]="0";
        axios.post("./../api/codesave",paras).then(function(res){
            let remp = Object.values(res.data)[0];
            returnmsg=remp['msg'];
            if(returnmsg!="")
            {
                document.getElementById("main-wrapper-info").innerHTML="Save failed: "+returnmsg;
                document.getElementById("main-wrapper-info").style.display="block";
            }
            else
            {
                if(gCodeID=="")
                {
                    gCodeID = remp['guid'];
                }
                savePara["codeid"]=gCodeID;
                parent.setCodeValValue(savePara);
                parent.closeCodeValWin();
            }
        }).catch(function (err) {
        });
    }

}
function getsubcodeJSCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="subcodeJS";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            assignPara["leftd"]="";
            let dtmp = selChildByClass(dNodeSub,"debugDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    dDebug = selChildByClass(dtmp,"varSelDebug");
                    if(dDebug!=null)
                        assignPara["leftd"]="d";
                    else
                        assignPara["leftd"]="";
                }
            }
            if(assignPara["leftd"]=="d"&&isJava)
                assignPara["leftd"]="di";

            dtmp = selChildByClass(dNodeSub,"assignExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    let v = {};
                    v["v"]=dtmp.childNodes[0].childNodes[1].value;
                    v["r"]=dtmp.childNodes[0].childNodes[2].value;
                    assignPara["left"]=v;
                    assignPara["leftn"]=dtmp.childNodes[0].childNodes[0].innerText;

                    dNode.classList.remove("redBorder");
                }
                else
                {
                    dNode.classList.add("redBorder");
                    gValMsg=gValMsg+"JS remote code call missing l-value.\n";
                    return;
                }
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let dNodeExpDb=selChildByClass(dNodeSub,"codeSelDiv");
            let assignRightCode=[];
            let paraCount = 0;
            for (let dNodeVar of dNodeExpDb.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["c"]=dNodeVar.childNodes[2].value;
                    v["p"]=dNodeVar.childNodes[3].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    if(dNodeVar.childNodes[4]) {
                        paraCount=dNodeVar.childNodes[4].value;
                        v["pc"]=dNodeVar.childNodes[4].value;
                    }

                    assignRightCode.push(v);
                }
            }
            assignPara["rightCode"]=assignRightCode;
            if(assignRightCode.length==0)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Please select the sub-code to call.\n";
                return;
            }

            let dNodeExpFilter=selChildByClass(dNodeSub,"codeParaSelDiv");
            let assignRightFilter=[];
            let i=0;
            for (let dNodeVar of dNodeExpFilter.childNodes)
            {
                if(dNodeVar.className=="varSelDivPara")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    assignRightFilter.push(v);

                    v = {};
                    v["o"]="=";
                    assignRightFilter.push(v);

                    v = {};
                    if(dNodeVar.childNodes[2].className=="v") {
                        v["v"]=dNodeVar.childNodes[2].value;
                        v["ln"]=dNodeVar.childNodes[3].value;
                    }
                    else
                        v["c"]=dNodeVar.childNodes[2].value;
                        assignRightFilter.push(v);

                    if(i<dNodeExpFilter.childNodes.length)
                    {
                        v = {};
                        v["o"]=";";
                        assignRightFilter.push(v);
                    }
                    i=i+1;
                }
            }
            assignPara["rightPara"]=assignRightFilter;
            if(paraCount>i)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"JS remote code call has insufficient function parameters.\n";
                return;
            }
        }
        else if(dNodeSub.className=="forConSucdiv")
        {
            let codeLists=[];
            for (let dExpNode of dNodeSub.childNodes) 
            {
                getSubcodeFunc(codeLists,dExpNode);
            }
            assignPara["exp"]=codeLists;
        }
    }
    return assignPara;
}
function getmsgCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="msg";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            let dtmp = selChildByClass(dNodeSub,"assignExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                    assignPara["left"]=dtmp.childNodes[0].childNodes[1].value;
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let dNodeExpDb=selChildByClass(dNodeSub,"msgSelDiv");
            let assignRightCode=[];
            for (let dNodeVar of dNodeExpDb.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightCode.push(v);
                } 
            }
            assignPara["rightCode"]=assignRightCode;

            let dNodeExpFilter=selChildByClass(dNodeSub,"msgParaSelDiv");
            let assignRightFilter=[];
            let i=1;
            for (let dNodeVar of dNodeExpFilter.childNodes) 
            {
                if(dNodeVar.className=="varSelDivPara")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    assignRightFilter.push(v);

                    v = {};
                    v["o"]="=";
                    assignRightFilter.push(v);

                    v = {};
                    if(dNodeVar.childNodes[2].className=="v") {
                        v["v"]=dNodeVar.childNodes[2].value;
                        v["ln"]=dNodeVar.childNodes[3].value;
                    }
                    else
                        v["c"]=dNodeVar.childNodes[2].value;
                        assignRightFilter.push(v);

                    if(i<dNodeExpFilter.childNodes.length)
                    {
                        v = {};
                        v["o"]=";";
                        assignRightFilter.push(v);
                    }
                    i=i+1;
                }
            }
            assignPara["rightPara"]=assignRightFilter;
        }
    }
    return assignPara;
}
function getsubcodeCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="subcode";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            assignPara["leftd"]="";
            let dtmp = selChildByClass(dNodeSub,"debugDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    dDebug = selChildByClass(dtmp,"varSelDebug");
                    if(dDebug!=null)
                        assignPara["leftd"]="d";
                    else
                        assignPara["leftd"]="";
                }
            }
            if(assignPara["leftd"]=="d"&&isJava)
                assignPara["leftd"]="di";

            dtmp = selChildByClass(dNodeSub,"assignExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    assignPara["left"]=dtmp.childNodes[0].childNodes[1].value;
                    assignPara["leftn"]=dtmp.childNodes[0].childNodes[0].innerText;
                }
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let dNodeExpDb=selChildByClass(dNodeSub,"codeSelDiv");
            let assignRightCode=[];
            let paraCount=0;
            for (let dNodeVar of dNodeExpDb.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    var v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["c"]=dNodeVar.childNodes[2].value;
                    v["p"]=dNodeVar.childNodes[3].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    if(dNodeVar.childNodes[4]) {
                        paraCount=dNodeVar.childNodes[4].value;
                        v["pc"]=dNodeVar.childNodes[4].value;
                    }
                    assignRightCode.push(v);
                }
            }
            assignPara["rightCode"]=assignRightCode;
            if(assignRightCode.length==0)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Please select the sub-code to call.\n";
                return;
            }

            let dNodeExpFilter=selChildByClass(dNodeSub,"codeParaSelDiv");
            let assignRightFilter=[];
            let i=0;
            for (let dNodeVar of dNodeExpFilter.childNodes)
            {
                if(dNodeVar.className=="varSelDivPara")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    assignRightFilter.push(v);

                    v = {};
                    v["o"]="=";
                    assignRightFilter.push(v);

                    v = {};
                    if(dNodeVar.childNodes[2].className=="v") {
                        v["v"]=dNodeVar.childNodes[2].value;
                        v["ln"]=dNodeVar.childNodes[3].value;
                    }
                    else
                        v["c"]=dNodeVar.childNodes[2].value;
                    assignRightFilter.push(v);

                    if(i<dNodeExpFilter.childNodes.length)
                    {
                        v = {};
                        v["o"]=";";
                        assignRightFilter.push(v);
                    }
                    i=i+1;
                }
            }
            assignPara["rightPara"]=assignRightFilter;
            if(paraCount>i)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Sub-code function has insufficient parameters.\n";
                return;
            }
        }
    }
    return assignPara;
}
function getDelDbCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="delDb";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignRightDiv")
        {
            let leftd="";
            let dtmp = selChildByClass(dNodeSub,"debugDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    dDebug = selChildByClass(dtmp,"varSelDebug");
                    if(dDebug!=null)
                        leftd="d";
                    else
                    leftd="";
                }
            }
            if(leftd=="d"&&isJava)
                leftd="di";

            let dNodeExpDb=selChildByClass(dNodeSub,"dbSelDiv");
            let assignRightDb=[];
            for (let dNodeVar of dNodeExpDb.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["a"]=dNodeVar.childNodes[2].value;

                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    v["d"]=leftd;

                    assignRightDb.push(v);
                } 
            }
            assignPara["rightDb"]=assignRightDb;

            let dNodeExpFilter=selChildByClass(dNodeSub,"dbFilterSelDiv");
            let assignRightFilter=[];
            let chkStr = "";
            for (let dNodeVar of dNodeExpFilter.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "v";
                }
                else  if(dNodeVar.className=="varSelDivFilter")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "l";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    if(v["o"]=="and"||v["o"]=="or")
                        chkStr = chkStr + "a";
                    else if(v["o"]=="("||v["o"]==")")
                        chkStr = chkStr + v["o"];
                    else
                        chkStr = chkStr + "o";
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "c";
                }
            }
            if(chkStr=="")
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Data filter condition cannot be empty.\n";
                return;
            }

            let chk = new cpilerChkDbFilter();
            let blnchk = chk.chkMain(chkStr);
            if(!blnchk)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Data filter condition statement is incorrect.\n";
                return;
            }
            assignPara["rightFilter"]=assignRightFilter;
        }
    }
    return assignPara;
}
function getUpdDbCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="updDb";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignRightDiv")
        {

            let leftd="";
            let dtmp = selChildByClass(dNodeSub,"debugDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    dDebug = selChildByClass(dtmp,"varSelDebug");
                    if(dDebug!=null)
                        leftd="d";
                    else
                    leftd="";
                }
            }
            if(leftd=="d"&&isJava)
                leftd="di";

            let dNodeExpDb=selChildByClass(dNodeSub,"dbSelDiv");
            let assignRightDb=[];
            for (let dNodeVar of dNodeExpDb.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["a"]=dNodeVar.childNodes[2].value;

                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    v["d"]=leftd;

                    assignRightDb.push(v);
                } 
            }
            assignPara["rightDb"]=assignRightDb;

            let dNodeExpField=selChildByClass(dNodeSub,"dbFieldSelDiv");
            let assignRightField=[];
            let i=1;
            for (let dNodeVar of dNodeExpField.childNodes) 
            {
                if(dNodeVar.className=="varSelFieldDiv")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    var spanText = dNodeVar.childNodes[0].innerText;
                    var eqIdx = spanText.lastIndexOf(" = ");
                    if (eqIdx > 0) v["ln"] = spanText.substring(0, eqIdx);
                    assignRightField.push(v);

                    v = {};
                    v["o"]="=";
                    assignRightField.push(v);

                    v = {};
                    if(dNodeVar.childNodes[2].className=="v") {
                        v["v"]=dNodeVar.childNodes[2].value;
                        v["ln"]=dNodeVar.childNodes[3].value;
                    }
                    else
                        v["c"]=dNodeVar.childNodes[2].value;
                    assignRightField.push(v);

                    if(i<dNodeExpField.childNodes.length)
                    {
                        v = {};
                        v["o"]=",";
                        assignRightField.push(v);
                    }
                    i=i+1;

                }
            }
            assignPara["rightField"]=assignRightField;

            let dNodeExpFilter=selChildByClass(dNodeSub,"dbFilterSelDiv");
            let assignRightFilter=[];
            let chkStr = "";
            for (let dNodeVar of dNodeExpFilter.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "v";
                }
                else  if(dNodeVar.className=="varSelDivFilter")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "l";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    if(v["o"]=="and"||v["o"]=="or")
                        chkStr = chkStr + "a";
                    else if(v["o"]=="("||v["o"]==")")
                        chkStr = chkStr + v["o"];
                    else
                        chkStr = chkStr + "o";
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "c";
                }
            }
            if(chkStr=="")
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Data filter condition cannot be empty.\n";
                return;
            }
            let chk = new cpilerChkDbFilter();
            let blnchk = chk.chkMain(chkStr);
            if(!blnchk)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Data filter condition statement is incorrect.\n";
                return;
            }
            assignPara["rightFilter"]=assignRightFilter;
        }
    }
    return assignPara;
}
function getInsDbCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="insDb";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            let dtmp = selChildByClass(dNodeSub,"assignExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    assignPara["left"]=dtmp.childNodes[0].childNodes[1].value;
                    assignPara["leftn"]=dtmp.childNodes[0].childNodes[0].innerText;
                }
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let leftd="";
            let dtmp = selChildByClass(dNodeSub,"debugDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    dDebug = selChildByClass(dtmp,"varSelDebug");
                    if(dDebug!=null)
                        leftd="d";
                    else
                    leftd="";
                }
            }
            if(leftd=="d"&&isJava)
                leftd="di";

            let dNodeExpDb=selChildByClass(dNodeSub,"dbSelDiv");
            let assignRightDb=[];
            for (let dNodeVar of dNodeExpDb.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["a"]=dNodeVar.childNodes[2].value;

                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    v["d"]=leftd;

                    assignRightDb.push(v);
                } 
            }
            assignPara["rightDb"]=assignRightDb;

            let dNodeExpField=selChildByClass(dNodeSub,"dbFieldSelDiv");
            let assignRightField=[];
            let i=1;
            for (let dNodeVar of dNodeExpField.childNodes) 
            {
                if(dNodeVar.className=="varSelFieldDiv")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    var spanText = dNodeVar.childNodes[0].innerText;
                    var eqIdx = spanText.lastIndexOf(" = ");
                    if (eqIdx > 0) v["ln"] = spanText.substring(0, eqIdx);
                    assignRightField.push(v);

                    v = {};
                    v["o"]="=";
                    assignRightField.push(v);

                    v = {};
                    if(dNodeVar.childNodes[2].className=="v") {
                        v["v"]=dNodeVar.childNodes[2].value;
                        v["ln"]=dNodeVar.childNodes[3].value;
                    }
                    else
                        v["c"]=dNodeVar.childNodes[2].value;
                    assignRightField.push(v);

                    if(i<dNodeExpField.childNodes.length)
                    {
                        v = {};
                        v["o"]=",";
                        assignRightField.push(v);
                    }
                    i=i+1;

                }
            }
            assignPara["rightField"]=assignRightField;
        }
    }
    return assignPara;
}
function getAssignDbCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="assignDb";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            assignPara["leftd"]="";
            let dtmp = selChildByClass(dNodeSub,"debugDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    dDebug = selChildByClass(dtmp,"varSelDebug");
                    if(dDebug!=null)
                        assignPara["leftd"]="d";
                    else
                        assignPara["leftd"]="";
                }
            }
            if(assignPara["leftd"]=="d"&&isJava)
                assignPara["leftd"]="di";

            dtmp = selChildByClass(dNodeSub,"assignDbExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    let v = {};
                    v["v"]=dtmp.childNodes[0].childNodes[1].value;
                    v["r"]=dtmp.childNodes[0].childNodes[2].value;
                    v["s"]=dtmp.childNodes[0].childNodes[3].value;
                    v["t"]=dtmp.childNodes[0].childNodes[4].value;
                    assignPara["left"]=v;
                    assignPara["leftn"]=dtmp.childNodes[0].childNodes[0].innerText;

                    dNode.classList.remove("redBorder");
                }
                else
                {
                    dNode.classList.add("redBorder");
                    gValMsg=gValMsg+"Assign statement (DB) missing l-value.\n";
                    return;
                }
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let dNodeExpDb=selChildByClass(dNodeSub,"dbSelDiv");
            let assignRightDb=[];
            let chkStrJoin = "";
            for (let dNodeVar of dNodeExpDb.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["a"]=dNodeVar.childNodes[2].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightDb.push(v);
                    chkStrJoin = chkStrJoin + "d";
                } 
                else if(dNodeVar.className=="varSelDivFilter")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    assignRightDb.push(v);
                    chkStrJoin = chkStrJoin + "e";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    assignRightDb.push(v);

                    if(v["o"]=="and")
                        chkStrJoin = chkStrJoin + "a";
                    else if(v["o"]=="on")
                        chkStrJoin = chkStrJoin + "n";
                    else if(v["o"].indexOf("join")>0)
                        chkStrJoin = chkStrJoin + "j";
                    else
                        chkStrJoin = chkStrJoin + "o";
                }

            }
            assignPara["rightDb"]=assignRightDb;
            let chk = new cpilerChkDbJoin();
            let blnchk = chk.chkMain(chkStrJoin);
            if(!blnchk&chkStrJoin!="d")
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Data join condition statement is incorrect.\n";
                return; 
            }

            let dNodeExpField=selChildByClass(dNodeSub,"dbFieldSelDiv");
            let assignRightField=[];
            for (let dNodeVar of dNodeExpField.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["fa"]=dNodeVar.childNodes[2].value;
                    v["tk"]=dNodeVar.childNodes[3].value;
                    v["vpk"]=dNodeVar.childNodes[4].value;
                    v["vsk"]=dNodeVar.childNodes[5].value;
                    v["ft"]=dNodeVar.childNodes[6].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightField.push(v);
                }
            }
            assignPara["rightField"]=assignRightField;

            let dNodeExpFilter=selChildByClass(dNodeSub,"dbFilterSelDiv");
            let assignRightFilter=[];
            let chkStr = "";
            for (let dNodeVar of dNodeExpFilter.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "v";
                }
                else  if(dNodeVar.className=="varSelDivFilter")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "l";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    if(v["o"]=="and"||v["o"]=="or")
                        chkStr = chkStr + "a";
                    else if(v["o"]=="("||v["o"]==")")
                        chkStr = chkStr + v["o"];
                    else
                        chkStr = chkStr + "o";
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "c";
                }
            }
            assignPara["rightFilter"]=assignRightFilter;

            chk = new cpilerChkDbFilter();
            blnchk = chk.chkMain(chkStr);
            if(!blnchk)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Data filter condition statement is incorrect.\n";
                return; 
            }

            let dNodeExpGroup=selChildByClass(dNodeSub,"dbGroupSelDiv");
            let assignRightGroup=[];
            for (let dNodeVar of dNodeExpGroup.childNodes) 
            {
                if(dNodeVar.className=="varSelDivGroup")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightGroup.push(v);
                }
            }
            assignPara["rightGroup"]=assignRightGroup;

            let dNodeExpGroupFilter=selChildByClass(dNodeSub,"dbGroupFilterSelDiv");
            let assignRightGroupFilter=[];
            for (let dNodeVar of dNodeExpGroupFilter.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightGroupFilter.push(v);
                }
                else  if(dNodeVar.className=="varSelDivGroup")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    v["tk"]=dNodeVar.childNodes[2].value;
                    assignRightGroupFilter.push(v);
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    assignRightGroupFilter.push(v);
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    assignRightGroupFilter.push(v);
                }
            }
            assignPara["rightGroupFilter"]=assignRightGroupFilter;

            let dNodeExpOrder=selChildByClass(dNodeSub,"dbOrderSelDiv");
            let assignRightOrder=[];
            if(dNodeExpOrder!=null)
            {
                for (let dNodeVar of dNodeExpOrder.childNodes) 
                {
                    if(dNodeVar.className=="varSelDivOrder")
                    {
                        let v = {};
                        v["f"]=dNodeVar.childNodes[1].value;
                        v["tk"]=dNodeVar.childNodes[2].value;
                        assignRightOrder.push(v);
                    }
                }
            }
            assignPara["rightOrder"]=assignRightOrder;

        }
    }
    return assignPara;
}
function getAssignSqlFilterCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="assignSqlFilter";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            let dtmp = selChildByClass(dNodeSub,"assignSqlFilterExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    let v = {};
                    v["v"]=dtmp.childNodes[0].childNodes[1].value;
                    v["s"]="";
                    v["t"]="";
                    assignPara["left"]=v;
                    dNode.classList.remove("redBorder");
                }
                else
                {
                    dNode.classList.add("redBorder");
                    gValMsg=gValMsg+"Assign statement (DB filter) missing l-value.\n";
                    return;
                }
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let dNodeExpFilter=selChildByClass(dNodeSub,"dbFilterSelDiv");
            let assignRightFilter=[];
            let chkStr = "";
            for (let dNodeVar of dNodeExpFilter.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "v";
                }
                else  if(dNodeVar.className=="varSelDivFilter")
                {
                    let v = {};
                    v["f"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "l";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    if(v["o"]=="and"||v["o"]=="or")
                        chkStr = chkStr + "a";
                    else if(v["o"]=="("||v["o"]==")")
                        chkStr = chkStr + v["o"];
                    else
                        chkStr = chkStr + "o";
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    assignRightFilter.push(v);
                    chkStr = chkStr + "c";
                }
            }
            let chk = new cpilerChkDbFilter();
            let blnchk = chk.chkMain(chkStr);
            if(!blnchk)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Data filter condition statement is incorrect.\n";
                return;
            }
            assignPara["rightFilter"]=assignRightFilter;
        }
    }
    assignPara["rightGroup"]=[];
    return assignPara;
}

function getAssignCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="assign";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            assignPara["leftd"]="";
            let dtmp = selChildByClass(dNodeSub,"debugDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    dDebug = selChildByClass(dtmp,"varSelDebug");
                    if(dDebug!=null)
                        assignPara["leftd"]="d";
                    else
                        assignPara["leftd"]="";
                }
            }
            if(assignPara["leftd"]=="d"&&isJava)
                assignPara["leftd"]="di";

            dtmp = selChildByClass(dNodeSub,"jsFdDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    jsfd = selChildByClass(dtmp,"varSelJsFd");
                    if(jsfd!=null)
                        assignPara["leftjsfd"]="1";
                }
            }

            dtmp = selChildByClass(dNodeSub,"assignExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    assignPara["left"]=dtmp.childNodes[0].childNodes[1].value;
                    assignPara["leftn"]=dtmp.childNodes[0].childNodes[0].innerText;
                    dNode.classList.remove("redBorder");
                }
                else
                {
                    dNode.classList.add("redBorder");
                    gValMsg=gValMsg+"Assignment statement missing l-value.\n";
                    return; 
                }
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let dNodeExp=selChildByClass(dNodeSub,"assignExpDiv");
            let assignRight=[];
            let chkStr = "";
            for (let dNodeVar of dNodeExp.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRight.push(v);
                    chkStr = chkStr + "v";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    assignRight.push(v);
                    chkStr = chkStr + v["o"];
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    assignRight.push(v);
                    chkStr = chkStr + "c";
                }  
            }
            assignPara["right"]=assignRight;
            let chk = new cpilerChkAssign();
            let blnchk = chk.chkMain(chkStr);
            if(!blnchk)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Assignment statement is incorrect.\n";
                return; 
            }
        }
    }
    return assignPara;
}
function getinsObjlistCode(dNode)
{
    let assignPara = {};
    assignPara["codetype"]="assign";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            let dtmp = selChildByClass(dNodeSub,"assignExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    assignPara["left"]=dtmp.childNodes[0].childNodes[1].value;
                    assignPara["leftn"]=dtmp.childNodes[0].childNodes[0].innerText;
                    dNode.classList.remove("redBorder");
                }
                else
                {
                    dNode.classList.add("redBorder");
                    gValMsg=gValMsg+"Insert statement (object list) missing l-value.\n";
                    return; 
                }
            }
        }
        else if(dNodeSub.className=="assignRightDiv")
        {
            let dNodeExp=selChildByClass(dNodeSub,"assignExpDiv");
            let assignRight=[];
            for (let dNodeVar of dNodeExp.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    assignRight.push(v);
                }
            }
            assignPara["right"]=assignRight;
        }
    }
    return assignPara;
}
function getjsHrefCode(dNode)
{
    let Para = {};
    Para["codetype"]="jsHref";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="jsHrefConDiv")
        {
            let Con=[];
            let chkStr = "";
            let dNodeExp = selChildByClass(dNodeSub,"jsHrefExpDiv");
            for (let dNodeVar of dNodeExp.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    Con.push(v);
                    chkStr = chkStr + "v";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    Con.push(v);
                    chkStr = chkStr + v["o"];
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    Con.push(v);
                    chkStr = chkStr + "c";
                }  
            }
            let chk = new cpilerChkAssign();
            let blnchk = chk.chkMain(chkStr);
            if(!blnchk)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Jump statement is incorrect.\n";
                return; 
            }

            Para["con"]=Con;
            break;
        }
    }
    return Para;
}
function getOutSvrCode(dNode)
{
    let Para = {};
    Para["codetype"]="outSvr";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="assignLeftDiv")
        {
            let dtmp = selChildByClass(dNodeSub,"assignExpLeftDiv");
            if(dtmp!=null)
            {
                if(dtmp.childNodes.length>0)
                {
                    Para["left"]=dtmp.childNodes[0].childNodes[1].value;
                    Para["leftn"]=dtmp.childNodes[0].childNodes[0].innerText;
                }
            }
        }
        else if(dNodeSub.className=="outSvrConDiv")
        {
            let dNodeExp = selChildByClass(dNodeSub,"outSvr1ExpDiv");
            for (let dNodeVar of dNodeExp.childNodes) 
            {
                if(dNodeVar.className=="varConDiv")
                {
                    Para["url"]=dNodeVar.firstChild.innerText;
                }
                else if(dNodeVar.className=="varSelDiv")
                {
                    Para["urlv"]=dNodeVar.childNodes[1].value;
                }
            }

            dNodeExp = selChildByClass(dNodeSub,"outSvr2ExpDiv");
            for (let dNodeVar of dNodeExp.childNodes) 
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    Para["para"]=dNodeVar.childNodes[1].value;
                    break;
                } 
            }
        }
    }
    return Para;
}
function getjsSrcCode(dNode)
{
    let Para = {};
    Para["codetype"]="jsSrc";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="jsSrcConDiv")
        {
            let Con=[];
            let dNodeExp = selChildByClass(dNodeSub,"jsSrcExpDiv");
            for (let dNodeVar of dNodeExp.childNodes) 
            {
                if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    Con.push(v);
                }  
                else if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["r"]=dNodeVar.childNodes[1].value;
                    Con.push(v);
                } 
            }
            Para["con"]=Con;
            break;
        }
    }
    return Para;
}

function getSubcodeFunc(codeLists,dExpNode)
{

    if(dExpNode.className)
    {
        if(dExpNode.classList.contains("redBorder"))
            dExpNode.classList.remove("redBorder");
        if(dExpNode.classList.contains("blueBorder"))
            dExpNode.classList.remove("blueBorder");
    }

    if(dExpNode.className=="assignDiv")
    {
        let codeObj = {};
        codeObj["type"]="assign";
        codeObj["para"]=getAssignCode(dExpNode);
        codeLists.push(codeObj);
        
    }
    else if(dExpNode.className=="assignDbDiv")
    {
        let codeObj = {};
        codeObj["type"]="assignDb";
        codeObj["para"]=getAssignDbCode(dExpNode);
        codeLists.push(codeObj);
        
    }
    else if(dExpNode.className=="updDbDiv")
    {
        let codeObj = {};
        codeObj["type"]="updDb";
        codeObj["para"]=getUpdDbCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="delDbDiv")
    {
        let codeObj = {};
        codeObj["type"]="delDb";
        codeObj["para"]=getDelDbCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="insDbDiv")
    {
        let codeObj = {};
        codeObj["type"]="insDb";
        codeObj["para"]=getInsDbCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="subcodeDiv")
    {
        let codeObj = {};
        codeObj["type"]="subcode";
        codeObj["para"]=getsubcodeCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="subcodeJSDiv")
    {
        let codeObj = {};
        codeObj["type"]="subcodeJS";
        codeObj["para"]=getsubcodeJSCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="assignSubSqlDiv")
    {
        let codeObj = {};
        codeObj["type"]="assignSubSql";
        codeObj["para"]=getAssignSubSqlCode(dExpNode);
        codeLists.push(codeObj);
        
    }
    else if(dExpNode.className=="assignSqlFilterDiv")
    {
        let codeObj = {};
        codeObj["type"]="assignSqlFilter";
        codeObj["para"]=getAssignSqlFilterCode(dExpNode);
        codeLists.push(codeObj);
        
    }
    else if(dExpNode.className=="ifDiv")
    {
        let codeObj = {};
        codeObj["type"]="if";
        codeObj["para"]=getIfCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="jsHrefDiv")
    {
        let codeObj = {};
        codeObj["type"]="jsHref";
        codeObj["para"]=getjsHrefCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="jsSrcDiv")
    {
        let codeObj = {};
        codeObj["type"]="jsSrc";
        codeObj["para"]=getjsSrcCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="insObjlistDiv")
    {
        let codeObj = {};
        codeObj["type"]="insObjlist";
        codeObj["para"]=getinsObjlistCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="msgDiv")
    {
        let codeObj = {};
        codeObj["type"]="msg";
        codeObj["para"]=getmsgCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="forDiv")
    {
        let codeObj = {};
        codeObj["type"]="for";
        codeObj["para"]=getForCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="whileDiv")
    {
        let codeObj = {};
        codeObj["type"]="while";
        codeObj["para"]=getWhileCode(dExpNode);
        codeLists.push(codeObj);
    }
    else if(dExpNode.className=="outSvrDiv")
    {
        let codeObj = {};
        codeObj["type"]="outsvr";
        codeObj["para"]=getOutSvrCode(dExpNode);
        codeLists.push(codeObj);
    }
}

function getIfCode(dNode)
{
    let ifPara = {};
    ifPara["codetype"]="if";
    for (let dNodeSub of dNode.childNodes) 
    {
        if(dNodeSub.className=="ifConDiv")
        {
            let ifCon=[];
            let chkStr = "";
            let dNodeExp = selChildByClass(dNodeSub,"ifConExpDiv");
            for (let dNodeVar of dNodeExp.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    ifCon.push(v);
                    chkStr = chkStr + "v";
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    ifCon.push(v);
                    if(v["o"]=="("||v["o"]==")")
                        chkStr = chkStr + v["o"];
                    else
                        chkStr = chkStr + "+";
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    ifCon.push(v);
                    chkStr = chkStr + "c";
                }  
            }
            ifPara["con"]=ifCon;
            let chk = new cpilerChkAssign();
            let blnchk = chk.chkMain(chkStr);
            if(!blnchk)
            {
                dNode.classList.add("redBorder");
                gValMsg=gValMsg+"Condition check statement is incorrect.\n";
                return; 
            }
        }
        else if(dNodeSub.className=="ifConSucdiv")
        {
            let codeLists=[];
            for (let dExpNode of dNodeSub.childNodes) 
            {
                getSubcodeFunc(codeLists,dExpNode);
            }
            ifPara["exp"]=codeLists;
        }
        else if(dNodeSub.className=="ifConFaidiv")
        {
            let codeLists=[];
            for (let dExpNode of dNodeSub.childNodes) 
            {
                getSubcodeFunc(codeLists,dExpNode);
            }
            ifPara["expfail"]=codeLists;
        }
    }

    if(JSON.stringify(ifPara)=='{"codetype":"if"}')
    {
        dNode.style.width="600px;"
        dNode.style.height="600px;"
        alert(dNode.innerHTML);
    }
    return ifPara;
}
function getWhileCode(dNode)
{
    let ifPara = {};
    ifPara["codetype"]="while";
    for (let dNodeSub of dNode.childNodes)
    {
        if(dNodeSub.className=="ifConDiv")
        {
            let ifCon=[];
            let dNodeExp = selChildByClass(dNodeSub,"ifConExpDiv");
            for (let dNodeVar of dNodeExp.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    ifCon.push(v);
                }
                else if(dNodeVar.className=="varOpDiv")
                {
                    let v = {};
                    v["o"]=dNodeVar.firstChild.innerText;
                    ifCon.push(v);
                }
                else if(dNodeVar.className=="varConDiv")
                {
                    let v = {};
                    v["c"]=dNodeVar.firstChild.innerText;
                    ifCon.push(v);
                }  
            }
            ifPara["con"]=ifCon;
        }
        else if(dNodeSub.className=="forConSucdiv")
        {
            let codeLists=[];
            for (let dExpNode of dNodeSub.childNodes) 
            {
                getSubcodeFunc(codeLists,dExpNode);
            }
            ifPara["exp"]=codeLists;
        }
    }
    return ifPara;
}
function getForCode(dNode)
{
    let ifPara = {};
    ifPara["codetype"]="for";
    for (let dNodeSub of dNode.childNodes)
    {
        if(dNodeSub.className=="forConDiv")
        {
            let ifCon=[];
            let dNodeExp = selChildByClass(dNodeSub,"forConExpDiv");
            for (let dNodeVar of dNodeExp.childNodes)
            {
                if(dNodeVar.className=="varSelDiv")
                {
                    let v = {};
                    v["v"]=dNodeVar.childNodes[1].value;
                    v["ln"]=dNodeVar.childNodes[0].innerText;
                    ifCon.push(v);
                } 
            }
            ifPara["con"]=ifCon;
        }
        else if(dNodeSub.className=="forConSucdiv")
        {
            let codeLists=[];
            for (let dExpNode of dNodeSub.childNodes) 
            {
                getSubcodeFunc(codeLists,dExpNode);
            }
            ifPara["exp"]=codeLists;
        }
    }
    return ifPara;
}

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

function divDragDealCode(dc)
{
    
    dc.id="";
    dc.style.display="block";
    dc.style.position="relative";
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

function addCode(codetype,e) 
{

    let dc;
    if(codetype=="assign")
    {
        let d = document.getElementById("assignDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="assigndb")
    {
        let d = document.getElementById("assignDbDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="upddb")
    {
        let d = document.getElementById("updDbDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="deldb")
    {
        let d = document.getElementById("delDbDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="insdb")
    {
        let d = document.getElementById("insDbDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="assignSubSql")
    {
        let d = document.getElementById("assignSubSqlDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="assignSqlFilter")
    {
        let d = document.getElementById("assignSqlFilterDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="if")
    {
        let d = document.getElementById("ifDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="jsHref")
    {
        let d = document.getElementById("jsHrefDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="jsSrc")
    {
        let d = document.getElementById("jsSrcDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="insObjlist")
    {
        let d = document.getElementById("insObjlistDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="msg")
    {
        let d = document.getElementById("msgDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="for")
    {
        let d = document.getElementById("forDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="while")
    {
        let d = document.getElementById("whileDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="outSvr")
    {
        let d = document.getElementById("outSvrDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="subcode")
    {
        let d = document.getElementById("subcodeDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="msg")
    {
        let d = document.getElementById("msgDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="subcodeJS")
    {
        let d = document.getElementById("subcodeJSDivTemp");
        dc = d.cloneNode(true);
    }

    divDragDealCode(dc);

    let da = document.createElement("div");
    da.innerHTML = document.getElementById("item-action").innerHTML;
    da.className = "item-action";
    dc.appendChild(da);

    if(window.gSelDiv==null)
    {
        document.getElementById("CodeVal").appendChild(dc);
    }
    else
    {
        if(window.gSelDiv.parentNode)
        {
            let p=window.gSelDiv.parentNode;
            p.insertBefore(dc,window.gSelDiv);
        }
        else
        {
            document.getElementById("CodeVal").appendChild(dc);
        }
    }

}

function addSubCode(codetype,cl,e) 
{
    let p = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

    let dc;
    if(codetype=="assign")
    {
        let d = document.getElementById("assignDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="assigndb")
    {
        let d = document.getElementById("assignDbDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="upddb")
    {
        let d = document.getElementById("updDbDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="deldb")
    {
        let d = document.getElementById("delDbDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="insdb")
    {
        let d = document.getElementById("insDbDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="subcode")
    {
        let d = document.getElementById("subcodeDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="subcodeJS")
    {
        let d = document.getElementById("subcodeJSDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="if")
    {
        let d = document.getElementById("ifDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="jsHref")
    {
        let d = document.getElementById("jsHrefDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="jsSrc")
    {
        let d = document.getElementById("jsSrcDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="insObjlist")
    {
        let d = document.getElementById("insObjlistDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="msg")
    {
        let d = document.getElementById("msgDivTemp");
        dc = d.cloneNode(true);
    }
    else if(codetype=="for")
    {
        let d = document.getElementById("forDivTemp")
        dc = d.cloneNode(true);
    }
    else if(codetype=="while")
    {
        let d = document.getElementById("whileDivTemp")
        dc = d.cloneNode(true);
    }

    divDragDealCode(dc);

    let da = document.createElement("div");
    da.innerHTML = document.getElementById("item-action").innerHTML;
    da.className = "item-action";
    dc.appendChild(da);

    for (let dNode of p.childNodes) 
    {
        if(dNode.className==cl)
        {
            dNode.appendChild(dc);
            break;
        }
    }

}

function delContainer(e) 
{
    let d = e.srcElement.parentElement.parentElement;
    let p = d.parentElement;
    p.removeChild(d);
    closeWin();
}

function getDataTblList() 
{
    let paras = {};
    paras['viewCode']="data";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    paras['filter_opencode_equal']="1";
    axios.post("./../api/datalist",paras).then(function(res){
    dataTblLists=Object.values(res.data)[0];
    }).catch(function (err) {
    });
}

function getCodeList()
{
    let paras = {};
    paras['viewCode']="code";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    paras['filter_open_equal']="1";
    paras['filter_codemode_notequal']="2";
    return axios.post("./../api/datalist",paras).then(function(res){
    gCodeLists=Object.values(res.data)[0];
    }).catch(function (err) {
    });
}
function getCodeFrontList()
{
    let paras = {};
    paras['viewCode']="code";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    paras['filter_isfront_equal']="1";
    paras['filter_open_equal']="1";
    paras['filter_codemode_equal']="1";
    return axios.post("./../api/datalist",paras).then(function(res){
    gCodeFrontLists=Object.values(res.data)[0];
    }).catch(function (err) {
    });
}
function getCodeConfig() 
{
    let paras = {};
    axios.post("./../api/codeconfig",paras).then(function(res){
    
        let codeconfig=res.data;
        if(codeconfig['dbtype']!=null)
        {
            gDbType=codeconfig['dbtype'];
        }

    }).catch(function (err) {
    });
}
function getMsgTempList()
{
    let paras = {};
    paras['viewCode']="msg_template";
    paras['curPage']=1;
    paras['pageItmes']=1000;
    return axios.post("./../api/datalist",paras).then(function(res){
    msgLists=Object.values(res.data)[0];
    }).catch(function (err) {
    });
}

function selDiv(e)
{
    let p = e.target;
    if(p.parentElement.id=="CodeVal")
    {
        if(p.className&&p.classList.contains("blueBorder"))
        {
            p.classList.remove("blueBorder");
            if(p==window.gSelDiv)
                window.gSelDiv = null;
        }
        else
        {   
            p.classList.add("blueBorder");
            window.gSelDiv = e.target;
        }
    }
}