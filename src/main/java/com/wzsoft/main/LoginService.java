package com.wzsoft.main;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

@Service
public class LoginService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private RedisCache redisCache;

    @Autowired
    private DatalistService dService;

    @Autowired
    private ConfigService cService;

    @Autowired
    private UserDetailsServiceImpl uService;

    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public HashMap<String,String> login(User user,String loginreurl,String orgid,String roleid,HttpServletRequest request) throws Throwable {
        
        String msg = "";
        String jwt="";
        String reurl="";
        String reroles="";

        Authentication authenticate = null;
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(user.getUserName(),user.getPassword());
        try
        {
            authenticate = authenticationManager.authenticate(authenticationToken);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        if(authenticate==null){
            msg = WSoftMsg.getMsgItem("login_err",user.getLan());  //Invalid username or password
        }
        else
        {
            UserLogin loginUser = (UserLogin)authenticate.getPrincipal();
            if(loginUser.getUser().getId()==null)
            {
                msg = WSoftMsg.getMsgItem("login_err",user.getLan());
            }
            else
            {
                String userId = loginUser.getUser().getId().toString();
                if(userId.equals("1"))
                {
                    reurl="./../admin/index.html";
                    // Admin also needs roles set for getDbFieldRights
                    List lroles = loginUser.getUser().getRolesAll();
                    if(lroles.size()>0)
                    {
                        Map<String,Object> mrole = (Map)lroles.get(0);
                        String aroleid = mrole.get("ROLEID").toString();
                        String aorgid = "";
                        if(mrole.get("ORGID")!=null)
                            aorgid = mrole.get("ORGID").toString();
                        uService.selRole(loginUser.getUser(), aorgid, aroleid);
                    }
                }
                else
                {
                    String strType="1";
                    if(user.getAppType()!=null)
                    {
                        strType =  user.getAppType();
                    }

                    List lroles = loginUser.getUser().getRolesAll();
                    if(lroles.size()>1&&orgid.equals("")&&roleid.equals(""))
                    {
                        reurl="./../manage/selrole.html?apptype="+strType;
                        reroles=JSON.toJSONString(lroles);
                    }
                    else
                    {

                        if(roleid.equals(""))
                        {
                            Map<String,Object> mrole = (Map)lroles.get(0);
                            roleid=mrole.get("ROLEID").toString();
                            if(mrole.get("ORGID")!=null)
                                orgid = mrole.get("ORGID").toString();
                        }

                        uService.selRole(loginUser.getUser(),orgid,roleid);

                        List lapppc = loginUser.getUser().getRoleAppPc();
                        List lappmobile = loginUser.getUser().getRoleAppMobile();

                        if(!loginreurl.equals(""))
                        {
                            reurl=loginreurl;
                        }
                        else if(strType.equals("1"))
                        {
                            if(lapppc.size()>0)
                            {
                                reurl="./../manage/"+ WSoftUtil.getFirstPage(lapppc);
                            }
                            else if(lappmobile.size()>0)
                            {
                                reurl="./../manage/"+ WSoftUtil.getFirstPage(lappmobile);
                            }
                            else
                            {
                                msg=WSoftMsg.getMsgItem("login_noapp",user.getLan()); //Application not configured
                            }
                        }
                        else if (strType.equals("2"))
                        {
                            if(lappmobile.size()>0)
                            {
                                reurl="./../manage/"+ WSoftUtil.getFirstPage(lappmobile);
                            }
                            else if(lapppc.size()>0)
                            {
                                reurl="./../manage/"+ WSoftUtil.getFirstPage(lapppc);
                            }
                            else
                            {
                                msg=WSoftMsg.getMsgItem("login_noapp",user.getLan()); 
                            }
                        }

                        request.getSession().setAttribute("menupc", lapppc);
                        request.getSession().setAttribute("menumobile", lappmobile);
                        request.getSession().setAttribute("rolepages", loginUser.getUser().getRolePage());
                        request.getSession().setAttribute("mrole", loginUser.getUser().getRoleIDs());

                        loginUser.getUser().setRoleAppMobile(null);
                        loginUser.getUser().setRoleAppPc(null);
                        loginUser.getUser().setRolePage(null);

                        jwt = JwtUtil.createJWT(userId);
                        redisCache.setCacheObject("login:"+userId,loginUser);
                    }
                }

                if(msg.equalsIgnoreCase(""))
                {
                    authenticationToken = new UsernamePasswordAuthenticationToken(loginUser,null,null);
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
        
            }
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        map.put("token",jwt);
        map.put("reurl",reurl);
        map.put("reroles",reroles);
        return map;
        
    }

    @Transactional
    public HashMap<String,String> getpassword(String email,String mobile,String webpage,String lan)  throws Throwable  {
        
        String passkey = WSoftUtil.genGuid(null);
        String sql = "";
        
        String msg="";

        String amode = cService.getConfigAmode();
        Map<String,Object> mp = new HashMap<>();
        if(amode.equals("1"))
        {
            if(!email.trim().equals(""))
            {
                sql = "select psnid from psn where email=? ";
                mp = datalistDao.getDataSingle(sql, new Object[]{email});
                if(mp!=null)
                {
                    String mguid="badb4c0790ab47b48bbd0fc4c6e150f8";
                    if(lan.equals("e"))
                    {
                        mguid="badb4c0790ab47b48bbd0fc4c6e15011"; 
                    }
                    String psnid = mp.get("psnid").toString();
                    sql = "update psn set passkey=?,passkeytime="+ WSoftUtil.dbSqlSysdate() +" where psnid=? ";
                    datalistDao.updDatas(sql, new Object[]{passkey,psnid});
                    HashMap<String,Object> mt = new HashMap<>();
                    mt.put("msg#tempid",mguid);
                    mt.put("msg#resetLink",webpage + "?key="+passkey);
                    mt.put("msg#toaddr",email);
                    dService.codeMsgAdd(mt);
                }
                else
                {
                    msg=WSoftMsg.getMsgItem("login_emailnoreg",lan);  //This email is not registered.
                }
            }
            else
            {
                msg=WSoftMsg.getMsgItem("login_emailnull",lan); //Email cannot be empty.
            }
        }
        else if(amode.equals("2"))
        {
            if(!mobile.trim().equals(""))
            {
                sql = "select psnid from psn where mobile=? ";
                mp = datalistDao.getDataSingle(sql, new Object[]{mobile});
                if(mp!=null)
                {
                    String mguid="92e6916f85984f128f9f68cf3777d004";
                    if(lan.equals("e"))
                    {
                        mguid="92e6916f85984f128f9f68cf3777d011"; 
                    }

                    String psnid = mp.get("psnid").toString();
                    sql = "update psn set passkey=?,passkeytime="+ WSoftUtil.dbSqlSysdate() +" where psnid=? ";
                    datalistDao.updDatas(sql, new Object[]{passkey,psnid});

                    HashMap<String,Object> mt = new HashMap<>();
                    mt.put("msg#tempid",mguid);
                    mt.put("msg#resetLink",webpage + "?key="+passkey);
                    mt.put("msg#toaddr",mobile);
                    dService.codeMsgAdd(mt);
                }
                else
                {
                    msg=WSoftMsg.getMsgItem("login_mobilenoreg",lan); //This mobile is not registered.
                }
            }
            else
            {
                msg=WSoftMsg.getMsgItem("login_mobilenull",lan); //Mobile cannot be empty.
            }
        }
        else
        {
            msg="System config error";
        }
        
        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;

    }

    public HashMap<String,String> logout() {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserLogin loginUser = (UserLogin) authentication.getPrincipal();
        Long userid = loginUser.getUser().getId();
        redisCache.deleteObject("login:"+userid);

        HashMap<String,String> map = new HashMap<>();
        map.put("msg","");
        return map;

    }
    
    @Transactional
    public HashMap<String,String> regpsn(JSONObject jsonObject,String webpage,String lan)  throws Throwable  {
        
        String msg="";
        String psnname = jsonObject.getString("psnname").trim();
        String email = jsonObject.getString("email").trim();
        String mobile = jsonObject.getString("mobile").trim();
        String activekey = WSoftUtil.genGuid(null);

        if(psnname.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_namenull",lan) + "<br/>"; // Name cannot be empty.<br/>
        }


        String sql="";
        Map<String,Object> mp = new HashMap<>();

        String amode = cService.getConfigAmode();
        if(amode.equals("1"))
        {
            if(email.trim().equals(""))
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailnull",lan) + "<br/>"; //Email cannot be empty.<br/>
            }
        }
        else if(amode.equals("2"))
        {
            if(mobile.trim().equals(""))
            {
                msg = msg + WSoftMsg.getMsgItem("login_mobilenull",lan) + "<br/>";
            }
        }
        else
        {
            msg="System config error";
        }

        if(!email.trim().equals(""))
        {
            sql = "select psnid from psn where email=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{email});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailreg",lan) + "<br/>";   //Email already registered.
            }
        }

        if(!mobile.trim().equals(""))
        {
            sql = "select psnid from psn where mobile=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{mobile});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_mobilereg",lan) + "<br/>"; //Mobile already registered.
            }
        }

        if(msg.trim().equals(""))
        {

            Integer orgID=0;
            Integer psnID=0;

            JSONObject jPara = new JSONObject();
            jPara = new JSONObject();
            jPara.put("field_NAME",psnname);
            jPara.put("field_ORGID",orgID);
            jPara.put("field_DEPTID",0);
            jPara.put("field_EMAIL",email);
            jPara.put("field_MOBILE",mobile);
            jPara.put("field_ISACTIVE","0");
            List lpsn = dService.addDatas("psn", jPara);
            Map<String,Object> mreturn = (Map)lpsn.get(0);
            msg = (String)mreturn.get("msg");
            if(msg.equalsIgnoreCase(""))
            {
                psnID = (Integer)mreturn.get("pid");
            }

            if(msg.trim().equals("")&&psnID>0)
            {
                int row;
                sql = "update psn set activekey=?,activetime="+ WSoftUtil.dbSqlSysdate() +" where psnid=? ";
                row = datalistDao.updDatas(sql, new Object[]{activekey,psnID});

                String psnrole="";
                psnrole = cService.getConfigRegPsnRole();
                if(!psnrole.equals(""))
                {
                    sql = "insert into psn_role(psnid,roleid) values(?,?)";
                    row = datalistDao.updDatas(sql, new Object[]{psnID,psnrole});
                }
                
                if(!email.trim().equals("")&&amode.equals("1"))
                {
                    String mguid="437433267d3b4347aad79762b2b4f054";
                    if(lan.equals("e"))
                    {
                        mguid="437433267d3b4347aad79762b2b4f011"; 
                    }

                    HashMap<String,Object> mt = new HashMap<>();
                    mt.put("msg#tempid",mguid);
                    mt.put("msg#name",psnname);
                    mt.put("msg#activateLink",webpage + "?key="+activekey);
                    mt.put("msg#toaddr",email);
                    dService.codeMsgAdd(mt);
                }
                
                if(!mobile.trim().equals("")&&amode.equals("2"))
                {
                    String mguid="681d6ab75c6d42a6826ea31f48e8fdd8";
                    if(lan.equals("e"))
                    {
                        mguid="681d6ab75c6d42a6826ea31f48e8fd11"; 
                    }

                    HashMap<String,Object> mt = new HashMap<>();
                    mt.put("msg#tempid",mguid);
                    mt.put("msg#name",psnname);
                    mt.put("msg#activateLink",webpage + "?key="+activekey);
                    mt.put("msg#toaddr",mobile);
                    dService.codeMsgAdd(mt);
                }

                String exeCode = cService.getConfigRegPsnCode();
                if(!exeCode.equals(""))
                {
                    msg = codeUpd(jsonObject, exeCode,dService);
                    if(!msg.equals(""))
                        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                }

            }
        }
        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    @Transactional
    public HashMap<String,String> regorg(JSONObject jsonObject,String webpage,String lan)  throws Throwable {
        
        String msg="";
        String name = jsonObject.getString("name").trim();
        String psnname = jsonObject.getString("psnname").trim();
        String email = jsonObject.getString("email").trim();
        String mobile = jsonObject.getString("mobile").trim();
        String activekey = WSoftUtil.genGuid(null);

        if(name.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_orgname",lan) + "<br/>";  //Org name cannot be empty.
        }
        if(psnname.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_adminname",lan) + "<br/>"; //Admin name cannot be empty.
        }

        String sql="";
        Map<String,Object> mp = new HashMap<>();

        String amode = cService.getConfigAmode();
        if(amode.equals("1"))
        {
            if(email.trim().equals(""))
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailnull",lan) + "<br/>"; //Email cannot be empty.
            }
        }
        else if(amode.equals("2"))
        {
            if(mobile.trim().equals(""))
            {
                msg = msg + WSoftMsg.getMsgItem("login_mobilenull",lan) + "<br/>";  //Mobile cannot be empty.
            }
        }
        else
        {
            msg="System config error";
        }

        if(!name.trim().equals(""))
        {
            sql = "select name from org where name=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{name});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_orgnamereg",lan) + "<br/>";  //Org name already registered.
            }
        }

        if(!email.trim().equals(""))
        {
            sql = "select psnid from psn where email=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{email});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailreg",lan) + "<br/>";  //Email already registered.
            }
        }

        if(!mobile.trim().equals(""))
        {
            sql = "select psnid from psn where mobile=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{mobile});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_mobilereg",lan) + "<br/>";  //Mobile already registered.
            }
        }

        if(msg.trim().equals(""))
        {
            JSONObject jPara = new JSONObject();
            jPara.put("field_NAME",name);
            List lorg = dService.addDatas("org", jPara);

            Integer orgID=0;
            Integer psnID=0;
            Map<String,Object> mreturn = (Map)lorg.get(0);
            msg = (String)mreturn.get("msg");
            if(msg.equalsIgnoreCase(""))
            {
                orgID = (Integer)mreturn.get("pid");

                jPara = new JSONObject();
                jPara.put("field_NAME",psnname);
                jPara.put("field_ORGID",orgID);
                jPara.put("field_DEPTID",0);
                jPara.put("field_ORGNAME",name);
                jPara.put("field_EMAIL",email);
                jPara.put("field_MOBILE",mobile);
                jPara.put("field_ISACTIVE","0");
                List lpsn = dService.addDatas("psn", jPara);
                mreturn = (Map)lpsn.get(0);
                msg = (String)mreturn.get("msg");
                if(msg.equalsIgnoreCase(""))
                {
                    psnID = (Integer)mreturn.get("pid");
                }
            }

            if(msg.trim().equals("")&&orgID>0&&psnID>0)
            {
                sql = "update psn set activekey=?,activetime="+ WSoftUtil.dbSqlSysdate() +" where psnid=? ";
                datalistDao.updDatas(sql, new Object[]{activekey,psnID});

                String psnrole="";
                psnrole = cService.getConfigRegOrgRole();

                if(psnrole.equals(""))
                    psnrole = "2";
                    
                sql = "insert into psn_role(psnid,roleid,orgid) values(?,?,?)";
                datalistDao.updDatas(sql, new Object[]{psnID,psnrole,orgID});

                sql = "insert into psn_org(psnid,deptid,orgid) values(?,?,?)";
                datalistDao.updDatas(sql, new Object[]{psnID,0,orgID});

                if(!email.trim().equals("")&&amode.equals("1"))
                {
                    String mguid="437433267d3b4347aad79762b2b4f054";
                    if(lan.equals("e"))
                    {
                        mguid="437433267d3b4347aad79762b2b4f011"; 
                    }
                    HashMap<String,Object> mt = new HashMap<>();
                    mt.put("msg#tempid",mguid);
                    mt.put("msg#name",psnname);
                    mt.put("msg#activateLink",webpage + "?key="+activekey);
                    mt.put("msg#toaddr",email);
                    dService.codeMsgAdd(mt);
                }

                if(!mobile.trim().equals("")&&amode.equals("2"))
                {
                    String mguid="681d6ab75c6d42a6826ea31f48e8fdd8";
                    if(lan.equals("e"))
                    {
                        mguid="681d6ab75c6d42a6826ea31f48e8fd11"; 
                    }
                    HashMap<String,Object> mt = new HashMap<>();
                    mt.put("msg#tempid",mguid);
                    mt.put("msg#name",psnname);
                    mt.put("msg#activateLink",webpage + "?key="+activekey);
                    mt.put("msg#toaddr",mobile);
                    dService.codeMsgAdd(mt);
                }

                String exeCode = cService.getConfigRegOrgCode();
                if(!exeCode.equals(""))
                {
                    msg = codeUpd(jsonObject, exeCode,dService);
                    if(!msg.equals(""))
                        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                }

            }
        }
        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    private String codeUpd(JSONObject jsonObject,String codeID,DatalistService dService) throws Throwable 
    {
        if(!codeID.trim().equalsIgnoreCase(""))
        {
            ScriptEngineManager factory = new ScriptEngineManager();
            ScriptEngine engine = factory.getEngineByName("JavaScript");

            Map<String,String> mpSource = new HashMap<>();
            mpSource.put("source","");
            WSoftUtil.codeGetSources(dService, codeID, mpSource, false,redisCache);
            String strSource = mpSource.get("source");
            if(!strSource.trim().equals(""))
            {
                Bindings bind = engine.createBindings();  
                engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                Map<String,Object> mapPara = new HashMap<>();
                bind.put("mapPara", mapPara); 
                bind.put("datalistService", dService); 
                
                try 
                {  
                    //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                    CompiledScript script = ((Compilable) engine).compile(strSource);
                    script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                    //engine.eval(strSource); 
                    
                    return (String)mapPara.get("_returnVal_");
                } catch (Exception e) 
                {  
                    e.printStackTrace();
                    String strError = "[CodeID]"+codeID+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
                    throw new RuntimeException("Post-registration code execution error:"+strError);
                } 
            }
        }
        return "";
    }

    @Transactional
    public HashMap<String,String> setpassword(String password,String passwordconfirm,String passkey,String lan)  throws Throwable  {
            
        String sql = "";
        String msg="";

        if(password.trim().equals("")||passwordconfirm.trim().equals("")||passkey.trim().equals(""))
        {
            msg = WSoftMsg.getMsgItem("login_infoerr",lan);  //Information is incomplete.
        }
        else if(!password.trim().equals(passwordconfirm.trim()))
        {
            msg = WSoftMsg.getMsgItem("login_passnomatch",lan);   //The two entered passwords do not match.
        }
        else if(passkey.trim().length()<30)
        {
            msg = WSoftMsg.getMsgItem("login_passurl",lan);    //Reset link is incorrect.
        }
        else
        {
            sql = "select psnid from psn where passkey=? and "+ WSoftUtil.dbSqlDateHourDiff("passkeytime") +" <24 ";
            Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[]{passkey});
            if(mp!=null)
            {
                String strPassword = passwordEncoder.encode(password);
                String psnid = mp.get("psnid").toString();
                sql = "update psn set isactive='1',password=?,passkey='' where psnid=? ";
                datalistDao.updDatas(sql, new Object[]{strPassword,psnid});
                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
            }
            else
            {
                msg = WSoftMsg.getMsgItem("login_passurlno",lan);  //Reset link has expired. Please resend the password reset request.
            }

        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;

    }

    @Transactional
    public HashMap<String,String> psnconfirm(String password,String passwordconfirm,String activekey,String lan)  throws Throwable  {
            
        String sql = "";
        String msg="";

        if(activekey.trim().equals("")||password.trim().equals("")||passwordconfirm.trim().equals(""))
        {
            msg = WSoftMsg.getMsgItem("login_infoerr",lan);
        }
        else if(!password.trim().equals(passwordconfirm.trim()))
        {
            msg = WSoftMsg.getMsgItem("login_passnomatch",lan);
        }
        else if(activekey.trim().length()<30)
        {
            msg = WSoftMsg.getMsgItem("login_passurl",lan);
        }
        else
        {

            sql = "select psnid from psn where activekey=? ";
            Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[]{activekey});
            if(mp!=null)
            {
                String psnid = mp.get("psnid").toString();
                String strPassword = passwordEncoder.encode(password);

                sql = "update psn set activekey='',isactive='1',password=? where psnid=? ";
                datalistDao.updDatas(sql, new Object[]{strPassword,psnid});
                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
            }
            else
            {
                msg = WSoftMsg.getMsgItem("login_passurl",lan); 
            }
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;

    }

}


