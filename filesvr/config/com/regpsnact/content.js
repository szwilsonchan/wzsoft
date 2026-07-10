

    var confirmkey[@configid@] = "";
    init[@configid@]();

    function init[@configid@]()
    {
        confirmkey[@configid@] = getKey[@configid@]();

        let repage="[@repage@]";
        if("[@apptype@]"=="1")
        {
            if(gClientIsMobile()&&repage!="")
            {
                document.location.href=repage + "?key=" + confirmkey[@configid@];
                return;
            }
        }
        else
        {
            if(!gClientIsMobile()&&repage!="")
            {
                document.location.href=repage+ "?key=" + confirmkey[@configid@];
                return;
            }
        }

        if(confirmkey[@configid@]!="")
        {
            document.getElementById("setPass[@configid@]").style.display="block";

            if("[@apptype@]"=="2")
            {
                document.getElementById("setPass[@configid@]").className = "loginWinMobile[@configid@]";
                document.getElementById("setPass[@configid@]").style.display="block";
            }
            else
            {
                document.getElementById("setPass[@configid@]").className = "loginWin[@configid@]";
                document.getElementById("setPass[@configid@]").style.display="block";
            }
        }
    }

    function setconfirm[@configid@]()
    {
        let paras = {};
        paras['password']=document.getElementById("password[@configid@]").value.trim();
        paras['passwordconfirm']=document.getElementById("passwordconfirm[@configid@]").value.trim();
        paras['cpacha']=document.getElementById("cpachacode[@configid@]").value;
        paras['activekey']=confirmkey[@configid@];
        paras['lan']="[@lan@]";
        let msg="";
        if(!gCheckValueNull(paras['password']))
        {
            msg = msg + "[@msgpwdnew@]<br/>";
        }
        if(!gCheckValueLen(paras['password'],20))
        {
            msg = msg+"[@msgpwdnew1@]<br/>";
        }
        if(paras['password']!=paras['passwordconfirm'])
        {
            msg = msg + "[@msgpwdnew2@]<br/>";
        }
        if(msg!="")
        {
            document.getElementById("updWin-info-setpass-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-setpass[@configid@]").style.display="block";
            return;
        }

        axios.post("./../user/psnconfirm",paras).then(function(res){
            let mreturn = res.data
            let msg = mreturn['msg'];   
            if(msg!="")
            {
                document.getElementById("updWin-info-setpass-msg[@configid@]").innerHTML=msg;
                document.getElementById("updWin-info-setpass[@configid@]").style.display="block";
                changeCpacha[@configid@]();
            }
            else
            {
                document.getElementById("content-info-setpass-msg[@configid@]").innerHTML="[@msgact@]";
                document.getElementById("content-info-setpass[@configid@]").style.display="block";
            }
        }).catch(function (err) {
        });
    }

    function getKey[@configid@]() 
    {
        let pagelocation = document.location.toString();
        let paras = pagelocation.split("?");
        if (paras.length > 1) 
        {
            item = paras[1].split("=");
            if(item[0]=="key")
            {
                return item[1];
            }
        }
        return "";
    }

    function changeCpacha[@configid@](){
        document.getElementById("cpacha-img[@configid@]").src='./../user/getcpacha?vl=4&w=150&h=40&type=loginCpacha&t=' + new Date().getTime();
    }