
    var regmode[@configid@]="";
    init[@configid@]();
    var gsendtimes=60;
    var gloopid=null;

    function login[@configid@]()
    {
        let paras = {};

        var radioButtons = document.getElementsByName('radiosmode');
        var selectedRadioButton;
        
        for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            selectedRadioButton = radioButtons[i];
            break;
        }
        }

        let v=selectedRadioButton.value;
        if(v=="p")
        {
            paras['userName']=document.getElementById("username[@configid@]").value;
            paras['password']=document.getElementById("password[@configid@]").value;
            paras['cpachacode']=document.getElementById("cpachacode[@configid@]").value;
        }
        else
        {
            paras['phonenumber']=document.getElementById("mobile[@configid@]").value;
            paras['smscode']=document.getElementById("smscode[@configid@]").value;
            paras['pagepara']="";
        }

        let pparas={};
        let pagelocation = document.location.toString();
        let pageparas = pagelocation.split("?");
        if (pageparas.length > 1) {
            pageparas = pageparas[1].split("&");
            pageparas.forEach(item => {
                item = item.split("=");
                if(item[0].indexOf("login")==0)
                    pparas['pageParam_'+item[0]] = decodeURIComponent(item[1]);
            })
        }

        paras['appType']="[@apptype@]";
        paras['lan']="[@lan@]";
        if(JSON.stringify(pparas)!="{}")
            paras['pagepara']=JSON.stringify(pparas);

        axios.post("./../user/login",paras).then(function(res){
            let mreturn = res.data
            let msg = mreturn['msg'];   
            let token = mreturn['token'];
            let reurl = mreturn['reurl'];
            if(msg!="")
            {
                document.getElementById("loginWin-info-msg[@configid@]").innerHTML=msg;
                document.getElementById("loginWin-info[@configid@]").style.display="block";
                changeCpacha[@configid@]();
            }
            else
            {
                document.location.href=reurl;
            }
        }).catch(function (err) {
        });
    }

    function init[@configid@]()
    {
        changeCpacha[@configid@]();
        
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

        if("[@apptype@]"=="2")
        {
            document.getElementById("loginWin[@configid@]").className = "loginWinMobile[@configid@]";
            document.getElementById("loginWin[@configid@]").style.display="block";
        }
        else
        {
            document.getElementById("loginWin[@configid@]").className = "loginWin[@configid@]";
            document.getElementById("loginWin[@configid@]").style.display="block";
        }

        let paras = {};
        axios.post("./../portal/api/configgetregmode",paras).then(function(res){
            regmode = res.data;
            if(regmode=="1")
            {
                document.getElementById("divorg[@configid@]").style.display="block";
                document.getElementById("divpsn[@configid@]").style.display="block";
            }
            else if(regmode=="2")
            {
                document.getElementById("divorg[@configid@]").style.display="block";
                document.getElementById("divpsn[@configid@]").style.display="none";
            }
            else if(regmode=="3")
            {
                document.getElementById("divorg[@configid@]").style.display="none";
                document.getElementById("divpsn[@configid@]").style.display="block";
            }
            else
            {
                document.getElementById("divorg[@configid@]").style.display="none";
                document.getElementById("divpsn[@configid@]").style.display="none";
            }
        }).catch(function (err) {
        });
    }

    function changeCpacha[@configid@](){
        document.getElementById("cpacha-img[@configid@]").src='./../user/getcpacha?vl=4&w=150&h=40&type=loginCpacha&t=' + new Date().getTime();
    }

    function changeModeLable[@configid@](e)
    {
        let p=e.target.previousElementSibling;
        p.click();
    }

    function changeMode[@configid@]()
    {

        var radioButtons = document.getElementsByName('radiosmode');
        var selectedRadioButton;
        
        for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            selectedRadioButton = radioButtons[i];
            break;
        }
        }

        let v=selectedRadioButton.value;
        if(v=="p")
        {
            document.getElementById("divpass[@configid@]").style.display="block";
            document.getElementById("divsms[@configid@]").style.display="none";
        }
        else
        {
            document.getElementById("divpass[@configid@]").style.display="none";
            document.getElementById("divsms[@configid@]").style.display="block";
        }
    }

    function sendMsg[@configid@](e) 
    {

        let paras = {};
        paras['mobile']=document.getElementById("mobile[@configid@]").value.trim();
        paras['lan']="[@lan@]";

        let msg="";
        if(!gCheckValueNull(paras['mobile']))
        {
            msg = msg + "[@msgmobile1@]<br/>";
        }
        else if(!gCheckMobile(paras['mobile']))
        {
            msg = msg + "[@msgmobile2@]<br/>";
        }
        if(msg!="")
        {
            document.getElementById("loginWin-info-msg[@configid@]").innerHTML=msg;
            document.getElementById("loginWin-info[@configid@]").style.display="block";
            return;
        }

        var that = this;
        axios.post("./../user/getmobilemsgchk",paras).then(function(res){
        let r =res.data;    
        if(r['msg']!="")
        {
            document.getElementById("loginWin-info-msg[@configid@]").innerHTML=msg;
            document.getElementById("loginWin-info[@configid@]").style.display="block";
        } 
        else
        {
            document.getElementById("valmsgsub[@configid@]").style.display="block";
            document.getElementById("valmsgsub[@configid@]").innerHTML="[@msgmobilesend@]";

            let p = e.target;
            p.disabled=true;
            gloopid = setInterval(showTimes[@configid@],1000,p);
        }

        }).catch(function (err) {
        });
    }

    function showTimes[@configid@](p) 
    {
        if(gsendtimes==0)
        {
            clearInterval(gloopid);
            p.disabled=false;
            p.innerHTML="[@captionsend@]";
            gsendtimes=60;
            return;
        }
        p.innerHTML=gsendtimes+"S";
        gsendtimes=gsendtimes-1;
    }