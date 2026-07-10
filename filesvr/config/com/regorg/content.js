
    
    var gAmode[@configid@]="";
    init[@configid@]();

    function regorg[@configid@]()
    {
        let paras = {};
        paras['name']=document.getElementById("name[@configid@]").value.trim();
        paras['psnname']=document.getElementById("psnname[@configid@]").value.trim();
        paras['email']=document.getElementById("psnemail[@configid@]").value.trim();
        paras['mobile']=document.getElementById("psnmobile[@configid@]").value.trim();
        paras['cpacha']=document.getElementById("cpachacode[@configid@]").value;
        paras['lan']="[@lan@]";
        paras['actpage']="[@actpage@]";

        let msg="";

        if(!gCheckValueNull(paras['name']))
        {
            msg = msg + "[@msgorg1@]<br/>";
        }
        if(!gCheckValueLen(paras['name'],200))
        {
            msg = msg+"[@msgorg2@]<br/>";
        }
        if(!gCheckValueNull(paras['psnname']))
        {
            msg = msg + "[@msgpsn1@]<br/>";
        }
        if(!gCheckValueLen(paras['psnname'],50))
        {
            msg = msg+"[@msgpsn2@]<br/>";
        }
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
            document.getElementById("updWin-info-sendrequest-msg[@configid@]").innerHTML=msg;
            document.getElementById("updWin-info-sendrequest[@configid@]").style.display="block";
            return;
        }

        axios.post("./../user/regorg",paras).then(function(res){
            let mreturn = res.data;
            let msg = mreturn['msg'];
            if(msg!="")
            {
                document.getElementById("updWin-info-sendrequest-msg[@configid@]").innerHTML=msg;
                document.getElementById("updWin-info-sendrequest[@configid@]").style.display="block";
                changeCpacha[@configid@]();
            }
            else
            {
                document.getElementById("content-info-sendrequest-msg[@configid@]").innerHTML="[@msgsend@]";
                document.getElementById("content-info-sendrequest[@configid@]").style.display="block";
            }
        }).catch(function (err) {
        });
    }

    function init[@configid@]()
    {
        if("[@apptype@]"=="2")
        {
            document.getElementById("sendRequest[@configid@]").className = "loginWinMobile[@configid@]";
            document.getElementById("sendRequest[@configid@]").style.display="block";
        }
        else
        {
            document.getElementById("sendRequest[@configid@]").className = "loginWin[@configid@]";
            document.getElementById("sendRequest[@configid@]").style.display="block";
        }
        
        let paras = {};
        axios.post("./../portal/api/configgetamode",paras).then(function(res){
            gAmode = res.data;
        }).catch(function (err) {
        });
    }

    function changeCpacha[@configid@](){
        document.getElementById("cpacha-img[@configid@]").src='./../user/getcpacha?vl=4&w=150&h=40&type=loginCpacha&t=' + new Date().getTime();
    }
