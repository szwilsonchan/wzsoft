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
function genUUID()
{
    let s = [];
    let hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; 
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '';
    let uuid = s.join('');
    return uuid;
}

function getPageParaItem(para) 
{   
    let r="";
    let pagelocation = document.location.toString();
    let paras = pagelocation.split("?");
    if (paras.length > 1) {
        paras = paras[1].split("&");
        paras.forEach(item => {
            item = item.split("=");
            if(item[0]==para)
            {
                r=item[1];
            }
        })
    }
    return r;
}

function gPageLocation()
{
    let a = location.href;
    let b = a.split("/");
    let c = b.slice(b.length-1, b.length).toString(String).split("?");
    return c.slice(0, 1);
}

function gSetSessionStore(page,para,curpage)
{
    if(sessionStorage)
    {
        let obj = {};
        obj['para']=para;
        obj['page']=curpage;
        sessionStorage.setItem(page,JSON.stringify(obj));
    }
}

function gGetSessionStore(page)
{
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

function gSetSessionStoreNull(page)
{
    if(sessionStorage)
    {
        sessionStorage.setItem(page,null);
    }
}

function gIsFirefox() {
    return /firefox/i.test(navigator.userAgent);
}