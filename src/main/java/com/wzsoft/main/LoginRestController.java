package com.wzsoft.main;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

@RestController
public class LoginRestController {
    
    @Autowired
    private LoginService loginService;

    @Autowired
    private DatalistService dService;

    @Autowired
    private UserDetailsServiceImpl uService;

    public static String gWebSiteURL=""; 

    public static String checkCpacha(String cpacha,String type,String lan,HttpServletRequest request)
    {

        String msg="";
        int times=0;
        int maxtimes=0;
        Object strCpacha = request.getSession().getAttribute(type);
        if (strCpacha == null) {
            msg = "Invalid Captcha Code";
        }
        else{

            if(type.indexOf("mobileCpacha")==0)
            {
                maxtimes=5;
            }
            else
            {
                maxtimes=500; 
            }

            if(request.getSession().getAttribute(type+"times")!=null)
            {
                times = (int)request.getSession().getAttribute(type+"times");
                times = times+1;
                if(times>maxtimes)
                {
                    msg = WSoftMsg.getMsgItem("login_vcodemany",lan);
                    return msg;
                }
            }

            request.getSession().setAttribute(type+"times", times);

            if (!cpacha.toUpperCase().equals(strCpacha.toString().toUpperCase())) {
                msg = WSoftMsg.getMsgItem("login_vcodeerr",lan);
            }
            else
            {
                if(type.indexOf("mobileCpacha")<0&&type.indexOf("formCpacha")<0)
                {
                    request.getSession().setAttribute(type, null);
                }
            }
        }
        return msg;
    }

    @PostMapping("/user/login")
    public HashMap<String,String> login(@RequestBody User user,HttpServletRequest request) throws Throwable  {

        String lan = "e";
        if(user.getLan()!=null)
        {
            lan = user.getLan(); 
        }

        String password = user.getPassword();
        if(password!=null&&(password.toLowerCase().equals("--bysmscode--")||password.toLowerCase().equals("--thirdlogin--")))
        {
            user.setPassword("");
        }

        String msg="";
        String cpacha = "";
        JSONObject jObject = null;
        String orgid="";
        String roleid="";

        if(user.getLoginorgid()!=null)
            orgid = user.getLoginorgid();

        if(user.getLoginroleid()!=null)
            roleid = user.getLoginroleid();   

        if(user.getPagepara()!=null)
        {
            jObject = (JSONObject)JSON.parse(user.getPagepara());
        }

        if(jObject!=null&&jObject.containsKey("pageParam_loginmode")&&jObject.get("pageParam_loginmode").toString().equals("login"))
        {
            String username = "";
            String reurl = "";
            String strObj = uService.codeThirdLogin(user, jObject);
            if(!strObj.equals(""))
            {
                JSONObject obj = (JSONObject)JSON.parse(strObj);
                if(obj.containsKey("USERNAME"))
                    username = obj.get("USERNAME").toString();
                if(obj.containsKey("REURL"))    
                    reurl = obj.get("REURL").toString();
                if(obj.containsKey("ROLEID"))    
                    roleid = obj.get("ROLEID").toString();
                if(obj.containsKey("ORGID"))    
                    orgid = obj.get("ORGID").toString();
            }

            user.setUserName(username);
            request.getSession().setAttribute("reurl", reurl);
            password="--thirdlogin--";
            user.setPassword(password);
        }
        else if(user.getSmscode()!=null&&user.getPhonenumber()!=null)
        {
            msg = checkCpacha(user.getSmscode(),"mobileCpacha"+user.getPhonenumber(),lan,request);
            if(msg.equals(""))
            {
                if(user.getSmscode()!=null&&user.getPhonenumber()!=null)
                {
                    user.setUserName(user.getPhonenumber());
                    password="--bysmscode--";
                    user.setPassword(password);
                }
            }
        }
        else
        {
            //If CAPTCHA is empty
            if(user.getCpachacode()==null||user.getCpachacode().trim().equals("")) 
            {
                msg = WSoftMsg.getMsgItem("login_vcodenull",lan);
            }
            else
            {
                //Load test; temporarily commented out
                //cpacha = user.getCpachacode(); 
                //msg = checkCpacha(cpacha,"loginCpacha",lan,request);
                //Load test; temporarily commented out
            }
        }

        if(jObject!=null&&jObject.containsKey("pageParam_loginreurl")&&!jObject.get("pageParam_loginreurl").toString().equals(""))
        {
            request.getSession().setAttribute("reurl", jObject.get("pageParam_loginreurl").toString());
        }

        if(!msg.equals(""))
        {
            HashMap<String,String> map = new HashMap<>();
            map.put("msg",msg);
            map.put("token","");
            map.put("reurl","");
            return map;
        }
        else
        {
            String loginreurl = "";
            if(request.getSession().getAttribute("reurl")!=null)
            {
                loginreurl = request.getSession().getAttribute("reurl").toString();
            }

            HashMap<String,String> mr = loginService.login(user,loginreurl,orgid,roleid,request);

            if(mr.get("msg").equals(""))
            {
                if(jObject!=null&&jObject.containsKey("pageParam_loginmode")&&jObject.get("pageParam_loginmode").toString().equals("ref"))
                {
                    String strObj = uService.codeThirdRefLogin(user, jObject);
                    if(!strObj.equals(""))
                    {
                        JSONObject obj = (JSONObject)JSON.parse(strObj);
                        if(obj.containsKey("REURL"))
                        {
                            if(mr.get("reurl").toString().indexOf("selrole.html")>0)
                            {
                                request.getSession().setAttribute("reurl", obj.get("REURL").toString());
                            }
                            else
                            {
                                mr.put("reurl",obj.get("REURL").toString());
                            }   
                        }
                    }
                }
            }
            return mr;
        }
    }

    @PostMapping("/user/getpassword")
    public HashMap<String,String> getpassword(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        String email = jsonObject.getString("email");
        String mobile = jsonObject.getString("mobile");
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String pageName = "reg_getpassword.html";
        if(jsonObject.containsKey("pageName"))
        {
            pageName = jsonObject.getString("pageName");
        }

        String webpage = WSoftUtil.propertyGetPara("gwebsite").toString() + "/manage/"+pageName;
        HashMap<String,String> mr = new HashMap<>();
        try
        {
            String msg="";
            String cpacha = "";
            cpacha = jsonObject.getString("cpacha");
            //If CAPTCHA is empty
            if(cpacha==null||cpacha.trim().equals("")) 
            {
                msg = WSoftMsg.getMsgItem("login_vcodenull",lan);
            }
            else
            {
                msg = checkCpacha(cpacha,"loginCpacha",lan,request);
            }
    
            if(!msg.equals(""))
            {
                mr.put("msg",msg);
                return mr;
            }
            else
            {
                mr = loginService.getpassword(email, mobile,webpage,lan);
            }
        }
        catch(Throwable e)
        {
            e.printStackTrace();
            mr.put("msg","System error");
        }
        return mr;
    }

    @PostMapping("/user/regorg")
    public HashMap<String,String> regorg(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
        
        HashMap<String,String> mr = new HashMap<>();

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String actpage = "reg_psnact.html";
        if(jsonObject.containsKey("actpage"))
        {
            actpage = jsonObject.getString("actpage");
        }

        String webpage = WSoftUtil.propertyGetPara("gwebsite").toString() + "/manage/"+actpage;
        try
        {
            String msg="";
            String cpacha = "";
            cpacha = jsonObject.getString("cpacha");
            //If CAPTCHA is empty
            if(cpacha==null||cpacha.trim().equals("")) 
            {
                msg = WSoftMsg.getMsgItem("login_vcodenull",lan);
            }
            else
            {
                msg = checkCpacha(cpacha,"loginCpacha",lan,request);
            }
    
            if(!msg.equals(""))
            {
                mr.put("msg",msg);
                return mr;
            }
            else
            {
                mr = loginService.regorg(jsonObject,webpage,lan);
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            mr.put("msg","System error");
        }
        return mr;
    }

    @PostMapping("/user/regpsn")
    public HashMap<String,String> regpsn(@RequestBody JSONObject jsonObject,HttpServletRequest request) throws Throwable {
        
        HashMap<String,String> mr = new HashMap<>();

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String actpage = "reg_psnact.html";
        if(jsonObject.containsKey("actpage"))
        {
            actpage = jsonObject.getString("actpage");
        }

        String webpage = WSoftUtil.propertyGetPara("gwebsite").toString() + "/manage/"+actpage;
        try
        {
            String msg="";
            String cpacha = "";
            cpacha = jsonObject.getString("cpacha");
            //If CAPTCHA is empty
            if(cpacha==null||cpacha.trim().equals("")) 
            {
                msg = WSoftMsg.getMsgItem("login_vcodenull",lan);
            }
            else
            {
                msg = checkCpacha(cpacha,"loginCpacha",lan,request);
            }
    
            if(!msg.equals(""))
            {
                mr.put("msg",msg);
                return mr;
            }
            else
            {
                mr = loginService.regpsn(jsonObject,webpage,lan);
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            mr.put("msg","System error");
        }
        return mr;
    }

    @PostMapping("/user/setpassword")
    public HashMap<String,String> setpassword(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        String password = jsonObject.getString("password");
        String passwordconfirm = jsonObject.getString("passwordconfirm");
        String passkey = jsonObject.getString("passkey");

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        HashMap<String,String> mr = new HashMap<>();
        try
        {
            String msg="";
            String cpacha = "";
            cpacha = jsonObject.getString("cpacha");
            //If CAPTCHA is empty
            if(cpacha==null||cpacha.trim().equals("")) 
            {
                msg = WSoftMsg.getMsgItem("login_vcodenull",lan);
            }
            else
            {
                msg = checkCpacha(cpacha,"loginCpacha",lan,request);
            }
    
            if(!msg.equals(""))
            {
                mr.put("msg",msg);
                return mr;
            }
            else
            {
                mr = loginService.setpassword(password, passwordconfirm,passkey,lan);
            }
        }
        catch(Throwable e)
        {
            mr.put("msg","System error");
        }
        return mr;
    }

    @PostMapping("/user/psnconfirm")
    public HashMap<String,String> psnconfirm(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        String password = jsonObject.getString("password");
        String passwordconfirm = jsonObject.getString("passwordconfirm");
        String activekey = jsonObject.getString("activekey");
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        HashMap<String,String> mr = new HashMap<>();
        try
        {
            String msg="";
            String cpacha = "";
            cpacha = jsonObject.getString("cpacha");
            //If CAPTCHA is empty
            if(cpacha==null||cpacha.trim().equals("")) 
            {
                msg = WSoftMsg.getMsgItem("login_vcodenull",lan);
            }
            else
            {
                msg = checkCpacha(cpacha,"loginCpacha",lan,request);
            }
    
            if(!msg.equals(""))
            {
                mr.put("msg",msg);
                return mr;
            }
            else
            {
                mr = loginService.psnconfirm(password, passwordconfirm,activekey,lan);
            }
        }
        catch(Throwable e)
        {
            mr.put("msg","System error");
        }
        return mr;
    }

    @PostMapping("/user/getmobilemsgchk")
    public HashMap<String,String> getMobileMsgChk(@RequestBody JSONObject jsonObject,HttpServletRequest request){

        String mobile = jsonObject.getString("mobile");
        String msg="";

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        HashMap<String,String> mr = new HashMap<>();
        try
        {
            if(mobile==null||mobile.trim().equals("")) 
            {
                msg = WSoftMsg.getMsgItem("login_mobilenull",lan);
            }

            if(!msg.equals(""))
            {
                mr.put("msg",msg);
                return mr;
            }
            else
            {
                LocalDateTime curTime = LocalDateTime.now();
                if(request.getSession().getAttribute("mobileCpachaTime"+mobile)!=null)
                {
                    LocalDateTime saveTime = (LocalDateTime)request.getSession().getAttribute("mobileCpachaTime"+mobile);
                    Duration durTime = Duration.between(saveTime,curTime);
                    long durMin = durTime.toMinutes();
                    if(durMin<1)
                    {
                        mr.put("msg",WSoftMsg.getMsgItem("login_vcodemany",lan));
                        return mr;
                    }
                }

                String strCode = WSoftUtil.mobileRandNum();
                //Send SMS procedure
                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid","eb66300e2abb46dea6979fa6f4fa50f2");
                mt.put("msg#captcha",strCode);
                mt.put("msg#toaddr",mobile);
                dService.codeMsgAdd(mt);

                request.getSession().setAttribute("mobileCpacha"+mobile, strCode);
                request.getSession().setAttribute("mobileCpachaTime"+mobile, curTime);

                mr.put("msg","");
            }
        }
        catch(Throwable e)
        {
            mr.put("msg","");
        }
        return mr;

    }    

    /**
     * All system CAPTCHA uses this method
     * 
     * @param vcodeLen
     * @param width
     * @param height
     * @param cpachaType:Used to distinguish CAPTCHA type, pass a string
     * @param request
     * @param response
     */
    @RequestMapping(value = "/user/getcpacha", method = RequestMethod.GET)
    public void generateCpacha(@RequestParam(name = "vl", required = false, defaultValue = "4") Integer vcodeLen,
            @RequestParam(name = "w", required = false, defaultValue = "100") Integer width,
            @RequestParam(name = "h", required = false, defaultValue = "30") Integer height,
            @RequestParam(name = "type", required = true, defaultValue = "loginCpacha") String cpachaType,
            HttpServletRequest request, HttpServletResponse response) {
        //Instantiate CAPTCHA entity based on page-supplied length, width, and height
        WSoftCpacha cpachaUtil = new WSoftCpacha(vcodeLen, width, height);
        //Generate CAPTCHA text
        String generatorVCode = cpachaUtil.generatorVCode();
        //Store CAPTCHA in session
        request.getSession().setAttribute(cpachaType, generatorVCode);
        //Generate corresponding CAPTCHA image
        BufferedImage generatorRotateVCodeImage = cpachaUtil.generatorRotateVCodeImage(generatorVCode, true);
        try {
            ImageIO.write(generatorRotateVCodeImage, "gif", response.getOutputStream());
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

}
