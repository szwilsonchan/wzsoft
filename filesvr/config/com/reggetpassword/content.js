
   
    var gAmode[@configid@]="";
    var passkey[@configid@] = "";
    init[@configid@]();

    function getpassword[@configid@]()
    {
        let paras = {};
        paras['email']=document.getElementById("email[@configid@]").value.trim();
        paras['mobile']=document.getElementById("mobile[@configid@]").value.trim();
        paras['cpacha']=document.getElementById("cpachacode1[@configid@]").value.trim();
        paras['lan']="[@lan@]";
        paras['pageName']=pageName()+".html";

        let msg="";

        if(gAmode=="")
        {
            alert("System config error"); 
            return;
        }
        else if(gAmode=="1")
        {
            if(!gCheckValueNull(paras['email']))
            {
                msg = msg + "[@msgemail1@]<br/>";
            }
        }
        else if(gAmode=="2")
        {
            if(!gCheckValueNull(paras['mobile']))
            {
                msg = msg + "[@msgmobile1@]<br/>";
            }
        }
        
        if(!gCheckEmail(paras['email']))
        {
            msg = msg + "[@msgemail2@]<br/>";
        }
        if(!gCheckValueLen(paras['email'],100))
        {
            msg = msg+"[@msgemail3@]<br/>";
        }
        if(!gCheckMobile(paras['mobile']))
        {
            msg = msg + "[@msgmobile2@]<br/>";
        }
        if(!gCheckValueLen(paras['mobile'],20))
        {
            msg = msg+"[@msgmobile3@]<br/>";
        }
        if(msg!="")
        {
            document.getElementById("loginWin-info-sendrequest-msg[@configid@]").innerHTML=msg;
            document.getElementById("loginWin-info-sendrequest[@configid@]").style.display="block";
            return;
        }

        axios.post("./../user/getpassword",paras).then(function(res){
            let mreturn = res.data;
            let msg = mreturn['msg'];
            if(msg!="")
            {
                document.getElementById("loginWin-info-sendrequest-msg[@configid@]").innerHTML=msg;
                document.getElementById("loginWin-info-sendrequest[@configid@]").style.display="block";
                changeCpacha1[@configid@]();
            }
            else
            {
                document.getElementById("content-info-sendrequest-msg[@configid@]").innerHTML="[@msgsend@]";
                document.getElementById("content-info-sendrequest[@configid@]").style.display="block";
            }
        }).catch(function (err) {
        });
    }

    function setpassword[@configid@]()
    {
        let paras = {};
        paras['password']=document.getElementById("password[@configid@]").value.trim();
        paras['passwordconfirm']=document.getElementById("passwordconfirm[@configid@]").value.trim();
        paras['cpacha']=document.getElementById("cpachacode2[@configid@]").value.trim();
        paras['passkey']=passkey[@configid@];
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
            document.getElementById("loginWin-info-setpass-msg[@configid@]").innerHTML=msg;
            document.getElementById("loginWin-info-setpass[@configid@]").style.display="block";
            return;
        }

        axios.post("./../user/setpassword",paras).then(function(res){
            let mreturn = res.data
            let msg = mreturn['msg'];   
            if(msg!="")
            {
                document.getElementById("loginWin-info-setpass-msg[@configid@]").innerHTML=msg;
                document.getElementById("loginWin-info-setpass[@configid@]").style.display="block";
                changeCpacha2[@configid@]();
            }
            else
            {
                document.getElementById("content-info-setpass-msg[@configid@]").innerHTML="[@msgpwdnew3@]";
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

    function init[@configid@]()
    {

        let repage="[@repage@]";
        if("[@apptype@]"=="1")
        {
            if(gClientIsMobile()&&repage!="")
            {
                document.location.href=repage;
                return;
            }
        }
        else
        {
            if(!gClientIsMobile()&&repage!="")
            {
                document.location.href=repage;
                return;
            }
        }

        passkey[@configid@] = getKey[@configid@]();

        if(passkey[@configid@]!="")
        {
            document.getElementById("setPass[@configid@]").style.display="block";
            document.getElementById("sendRequest[@configid@]").style.display="none";
            if("[@apptype@]"=="2")
            {
                document.getElementById("setPass[@configid@]").className = "loginWinMobile[@configid@]";
            }
            else
            {
                document.getElementById("setPass[@configid@]").className = "loginWin[@configid@]";
            }
            document.getElementById("setPass[@configid@]").style.display="block";
            changeCpacha2[@configid@]();
        }
        else
        {
            document.getElementById("setPass[@configid@]").style.display="none";
            document.getElementById("sendRequest[@configid@]").style.display="block";
            if("[@apptype@]"=="2")
            {
                document.getElementById("sendRequest[@configid@]").className = "loginWinMobile[@configid@]";
            }
            else
            {
                document.getElementById("sendRequest[@configid@]").className = "loginWin[@configid@]";
            }
            document.getElementById("sendRequest[@configid@]").style.display="block";
            changeCpacha1[@configid@]();
        }


        let paras = {};
        axios.post("./../portal/api/configgetamode",paras).then(function(res){
            gAmode = res.data;
            if(gAmode=="1")
            {
                document.getElementById("divmobile[@configid@]").style.display="none";
            }
            else if(gAmode=="2")
            {
                document.getElementById("divemail[@configid@]").style.display="none";
            }
            else
            {
                alert("System config error");
            }
        }).catch(function (err) {
        });
    }

    function changeCpacha1[@configid@](){
        document.getElementById("cpacha-img1[@configid@]").src='./../user/getcpacha?vl=4&w=150&h=40&type=loginCpacha&t=' + new Date().getTime();
    }

    function changeCpacha2[@configid@](){
        document.getElementById("cpacha-img2[@configid@]").src='./../user/getcpacha?vl=4&w=150&h=40&type=loginCpacha&t=' + new Date().getTime();
    }