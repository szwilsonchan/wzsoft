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