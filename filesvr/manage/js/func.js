var gMsgConstList={};
var gLan="c";

gMsgConstList['g_notempty_c']="Cannot be Null";
gMsgConstList['g_notempty_e']=" cannot be empty";

gMsgConstList['g_noexceed_c']="[@fname@]Length cannot exceed [@flen@]";
gMsgConstList['g_noexceed_e']="The length of the [@fname@] cannot exceed [@flen@]";

gMsgConstList['g_inp_number_c']="Please enter Number";
gMsgConstList['g_inp_number_e']="Please enter a number";

gMsgConstList['g_inp_integer_c']="Please enter an integer";
gMsgConstList['g_inp_integer_e']="Please enter an integer";

gMsgConstList['g_inp_amount_c']="Please enter an amount";
gMsgConstList['g_inp_amount_e']="Please enter the amount";

gMsgConstList['g_inp_amount2_c']="Please enter correct amount format， decimal places cannot exceed 2 digits";
gMsgConstList['g_inp_amount2_e']="Please enter the correct amount format, and the decimal places of the amount cannot exceed 2";

gMsgConstList['g_inp_amount4_c']="Please enter correct amount format，10K decimal places cannot exceed 4 digits";
gMsgConstList['g_inp_amount4_e']="Please enter the correct amount format, and the decimal places of the amount cannot exceed 4";

gMsgConstList['g_inp_errv_c']="Please enter correct format";
gMsgConstList['g_inp_errv_e']="Please enter the correct format";

gMsgConstList['g_inp_date_c']="Please enter DateFormat";
gMsgConstList['g_inp_date_e']="Please enter date format";

gMsgConstList['g_inp_file_c']="Does not support this FileType";
gMsgConstList['g_inp_file_e']="This file type is not supported";

gMsgConstList['g_mobilesend_c']="SMSCAPTCHA sent to ";
gMsgConstList['g_mobilesend_e']="The SMS code has been sent to ";

gMsgConstList['g_mobilesms_c']="SMSVerifyCannot be Null";
gMsgConstList['g_mobilesms_e']="The SMS code cannot be empty";

gMsgConstList['g_pdfgen_c']="PDFGenerateCenter......";
gMsgConstList['g_pdfgen_e']="PDF Generating ";

gMsgConstList['g_formsub_c']="SubmitCenter......";
gMsgConstList['g_formsub_e']="Submiting";

function gMsgConstDeal(k,arr)
{
    let s = gMsgConstList[k];
    for(let key in arr)
    {
        s = s.replace("[@"+ key +"@]",arr[key]);
    }
    return s;
}

var mapPara={};
getPageParas();
mapPara['globalParam_pageUrl']=document.location.href;
mapPara['globalParam_selectedDataId']="";

var gItemID = getItemID();
var gFormSubmitGenPdf = false;
var gFormSaveChk = true;
var gFormSaveChkSub = true;
var gFormSaveDebug = "false";
var gFormSaving = false;
var gFormChkMsg = {};

var gFormCallBacks={};
gFormCallBacks['InitDb']=[];
gFormCallBacks['Added']=[];
gFormCallBacks['AddErr']=[];
gFormCallBacks['Submit']=[];

function gFormCallBackDo(ftype)
{
    for(let f of gFormCallBacks[ftype])
    {
        let func = f['func'];
        let arg = f['arg'];
        if(func)
        {
            func(arg);
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

function setContainer(p,v)
{
    let sp = p.substring(4);
    let did = sp.substring(0,sp.indexOf("."));
    if(v)
    {
        document.getElementById(did).style.display="block";
        if(document.getElementById(did).className=="conParentHidden")
            document.getElementById("coverWin").style.display="block";
    }
    else
    {
        document.getElementById(did).style.display="none";
        if(document.getElementById(did).className=="conParentHidden")
            document.getElementById("coverWin").style.display="none";
    }
}

function getPageParas() {
    let pagelocation = document.location.toString();
    let paras = pagelocation.split("?");
    if (paras.length > 1) {
        paras = paras[1].split("&");
        paras.forEach(item => {
            item = item.split("=");
            mapPara['pageParam_'+item[0]] = decodeURIComponent(item[1]);
        })
    }
}
function getGlobalParas(paras,m) {
    for(let k in paras)
    {
        if(k.indexOf('globalParam_')==0)
        {
            m[k]=paras[k];
        }
    }
}
function setPageParas(paras,m) {
    for(let k in m)
    {
        if(k.indexOf('pageParam_')==0)
        {
            paras[k]=m[k];
        }
    }
}
function gaddlist(o,v){if(Object.prototype.toString.call(o) === '[object Array]'){o.push(v)}else{o.add(v)}};
function gcopyobj(obj){return JSON.parse(JSON.stringify(obj));};
function gvalnum(v){if(v==null){return null};if(v==true&&(v+''=='true')){return true};if(v==false&&(v+''=='false')){return false};if(v=='undefined'){return undefined;};if(v=='[]'){return [];};if(v=='{}'){return {};};if(v==''){return v;};if(v=='null'){return null;};if(v=='true'){return true;};if(v=='false'){return false;};if(v&&v.toString().trim().length<80&&(v.toString().indexOf(':')>0||v.toString().indexOf('-')>0)){if(v instanceof Date){return v;};var vt=v;var regd = /^\d{4}-\d{1,2}-\d{1,2}$/;var rd = regd.test(vt);var regt = /^\d{4}-\d{1,2}-\d{1,2}(\s|T)\d{1,2}:\d{1,2}:\d{1,2}$/;var rt = regt.test(vt);if(rd||rt){if(vt.toString().indexOf(':')<0){vt=vt+ ' 00:00:00';};var dt = new Date(vt);if(dt!='Invalid Date'){return dt}}};if(isNaN(Number(v))){return v;}else{v=v+'';var s = v.trim();if(s==''){return v};if(s.indexOf('0')==0&&s.length>=2&&s.indexOf('.')!=1){return v};return Number(v);};};
function gFloatIsOperator(value){var operatorString = "+-*/()";return operatorString.indexOf(value) > -1};
function gFloatGetPrioraty(value){switch(value){case '+':case '-':return 1;case '*':case '/':return 2;default:return 0;}};
function gFloatPrioraty(o1, o2){return gFloatGetPrioraty(o1) <= gFloatGetPrioraty(o2);};
function gFloatExps(exp,jpara){var inputStack = [];var outputStack = [];var outputQueue = [];var st="";var bg=false;var tmpStack=[];for(var i = 0, len = exp.length; i < len; i++){var cur = exp[i];if(cur != ' ' ){st = st + cur + '';if(cur=='g'&&!bg){bg=true;}else if(bg){if(cur=='('){tmpStack.push('(');}else if(cur==')'){tmpStack.pop();if(tmpStack.length==0){bg=false;inputStack.push(jpara[st]);st ="";}}}else{inputStack.push(st);st ="";}}}while(inputStack.length > 0){var cur = inputStack.shift();if(gFloatIsOperator(cur)){if(cur == '('){outputStack.push(cur);}else if(cur == ')'){var po = outputStack.pop();while(po != '(' && outputStack.length > 0){outputQueue.push(po);po = outputStack.pop();}}else{while(gFloatPrioraty(cur, outputStack[outputStack.length - 1]) && outputStack.length > 0){outputQueue.push(outputStack.pop());}outputStack.push(cur);}}else{outputQueue.push(cur);}}if(outputStack.length > 0){while(outputStack.length > 0){outputQueue.push(outputStack.pop());}}return outputQueue;};
function gFloatEval(rpnQueue){var outputStack = [];while(rpnQueue.length > 0){var cur = rpnQueue.shift();if(!gFloatIsOperator(cur)){outputStack.push(cur);}else{var sec = outputStack.pop();var fir = outputStack.pop();outputStack.push(gFloatResult(fir, sec, cur));}}return eval(outputStack[0]);};
function gFloatResult(a, b, op){a=eval(a);b=eval(b);switch (op) {case '+':return gFloatAdd(a,b);case '-':return gFloatSub(a,b);case '*':return gFloatMul(a,b);case '/':return gFloatDiv(a,b);}};
function gFloatAdd(arg1,arg2){var r1,r2,m;try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;}try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;}m=Math.pow(10,Math.max(r1,r2));return (arg1*m+arg2*m)/m;};
function gFloatSub(arg1,arg2){var r1,r2,m,n;try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;}try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;}m=Math.pow(10,Math.max(r1,r2));n=(r1>=r2)?r1:r2;return ((arg1*m-arg2*m)/m).toFixed(n);};
function gFloatMul(arg1,arg2){var m=0,s1=arg1.toString(),s2=arg2.toString();try{m+=s1.split(".")[1].length;}catch(e){}try{m+=s2.split(".")[1].length;}catch(e){}return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);};
function gFloatDiv(arg1,arg2){var t1=0,t2=0,r1,r2;try{t1=arg1.toString().split(".")[1].length}catch(e){}try{t2=arg2.toString().split(".")[1].length}catch(e){}with(Math){r1=Number(arg1.toString().replace(".",""));r2=Number(arg2.toString().replace(".",""));return (r1/r2)*pow(10,t2-t1);}};

function gcodejsfd(v,jpara){return gFloatEval(gFloatExps(v,jpara))};
function getItemID()
{
    if(mapPara['pageParam_itemid'])
        return mapPara['pageParam_itemid'];
    else
        return "";
}
function pageName()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String).split(".");
    return c.slice(0, 1);
}
function backForm()
{
    if(mapPara['pageParam_backlocation'])
        window.location.href=mapPara['pageParam_backlocation'];
    else
        window.history.back();
}
function gDateToStr(date) 
{
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hours = date.getHours();
    let min = date.getMinutes();
    let second = date.getSeconds();
    return year + "-" +
            ((month + 1) > 9 ? (month + 1) : "0" + (month + 1)) + "-" +
            (day > 9 ? day : ("0" + day)) + " " +
            (hours > 9 ? hours : ("0" + hours)) + ":" +
            (min > 9 ? min : ("0" + min)) + ":" +
            (second > 9 ? second : ("0" + second));
}
function chkAjaxPara(v) 
{
    if(v instanceof Date)
    {
        return gDateToStr(v);
    }
    else
        return v;
}

function gCheckValueLen(str,len)
{
    if(str==null)
        return true;

    if(str.toString().trim().length>len)
    {
        return false;
    }

    return true;
}

function gCheckEmail(str)
{
    if(str==null||str.toString().trim()=="")
        return true;

    let reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    let r = str.match(reg);
    if(r==null)return false;

    return true;

}

function gCheckMobile(str)
{
    if(str==null||str.toString().trim()=="")
        return true;

    let reg = /^1[3|4|5|7|8]\d{9}$/;
    let r = str.match(reg);
    if(r==null)return false;

    return true;

}

function gCheckDateTime(str)
{
    if(str==null||str.toString().trim()=="")
        return true;

    let reg = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    let r = str.match(reg);
    if(r==null)return false;
    r[2]=r[2]-1;
    let d= new Date(r[1], r[2],r[3], r[4],r[5], r[6]);
    if(d.getFullYear()!=r[1])return false;
    if(d.getMonth()!=r[2])return false;
    if(d.getDate()!=r[3])return false;
    if(d.getHours()!=r[4])return false;
    if(d.getMinutes()!=r[5])return false;
    if(d.getSeconds()!=r[6])return false;
    return true;
}

function gCheckDate(str)
{
    if(str==null||str.toString().trim()=="")
        return true;
    else
        str = str + " 00:00:00";

    return gCheckDateTime(str);
}

function gCheckValueNum(str,v1,v2)
{
    
    if(str==null||str.toString().trim()=="")
        return true;

    let n= str.toString().search(/^[1-9][0-9]*$/i);
    if(n!=-1)
    {
        if(str>v1&&str<v2)
        {
            return true;
        }
    }
    return false;
}
function gCheckValueNull(str)
{
    if(str==null||str.toString().trim()=="")
    {
        return false;
    }
    return true;
}
function gDealAjaxLogin(res)
{
    if(res&&res.data)
    {
        let str = res.data.toString();
        if(str.indexOf("id=\"password\"")>0)
        {
            document.location.href="./../login.html";
        }
    }
}

function gClientIsMobile()
{
    var ua=navigator.userAgent.toLowerCase();
    var ismobile=false;
    if(gContains(ua,"ipad")||(gContains(ua,"rv:1.2.3.4"))||(gContains(ua,"0.0.0.0"))||(gContains(ua,"8.0.552.237"))){return false}
    if((gContains(ua,"android") && gContains(ua,"mobile"))||(gContains(ua,"android") && gContains(ua,"mozilla")) ||(gContains(ua,"android") && gContains(ua,"opera"))
||gContains(ua,"ucweb7")||gContains(ua,"iphone"))
    {ismobile=true;}

    return ismobile;
}

function gContains(a, b)
{
    if(a.indexOf(b)!=-1)
        return true;
    else
        return false;
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
                dNode.style.color=fcolorsel;
            }
            else
            {
                dNode.style.backgroundColor=bg;
                dNode.style.color=fcolor;
            }
        }
    }
}

function gmodalWinConfirm(msg,f,p)
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("modalWin").style.display="block";
    document.getElementById("modalWinMsg").style.display="block";
    document.getElementById("modalWinBtnCancle").style.display="";
    document.getElementById("modalWinMsg").innerHTML=msg;
    document.getElementById("modalWinBtnOK").onclick=function(){f(p);document.getElementById("coverWin").style.display="none";document.getElementById("modalWin").style.display="none";document.getElementById("modalWinMsg").style.display='none';};
    document.getElementById("modalWinBtnCancle").onclick=function(){document.getElementById("coverWin").style.display="none";document.getElementById("modalWin").style.display="none";document.getElementById("modalWinMsg").style.display='none';};
}

function gmodalWinAlert(msg)
{
    document.getElementById("coverWin").style.display="block";
    document.getElementById("modalWin").style.display="block";
    document.getElementById("modalWinMsg").style.display="block";
    document.getElementById("modalWinBtnCancle").style.display="none";
    document.getElementById("modalWinMsg").innerHTML=msg;
    document.getElementById("modalWinBtnOK").onclick=function(){document.getElementById("coverWin").style.display="none";document.getElementById("modalWin").style.display="none";document.getElementById("modalWinMsg").style.display='none';};
}

function gDebugLog(n,v)
{
    console.log(n+":"+JSON.stringify(v));
}

function gSetSessionStore(page,para,curpage,flag)
{
    if(flag!="true")
        return;

    page = pageName()+page;
    if(sessionStorage)
    {
        let obj = {};
        obj['para']=para;
        obj['page']=curpage;
        sessionStorage.setItem(page,JSON.stringify(obj));
    }
}

function gGetSessionStore(page,flag)
{
    if(flag!="true")
        return;

    page = pageName()+page;
    let obj = null;
    if(sessionStorage)
    {
        let s = sessionStorage.getItem(page);
        if(s)
        {
            return JSON.parse(s);
        }
    }
    return obj;
}

function gSetSessionStoreNull(page,flag)
{
    if(flag!="true")
        return;
    
    page = pageName()+page;
    if(sessionStorage)
    {
        sessionStorage.setItem(page,null);
    }
}