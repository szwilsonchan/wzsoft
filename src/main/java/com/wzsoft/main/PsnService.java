package com.wzsoft.main;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import com.alibaba.fastjson.JSONObject;

import ch.qos.logback.core.joran.conditional.ElseAction;

@Service()
public class PsnService {
    
    @Autowired
    private RedisCache redisCache;

    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private DatalistService dService;

    @Autowired
    private ConfigService cService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public boolean regexMatch(String regx,String str)
    {
        Pattern pattern = Pattern.compile(regx);
        Matcher matcher = pattern.matcher(str);
        return matcher.matches();
    }

    public boolean dataNameChack(String str)
    {
        str = str.toLowerCase();
        return regexMatch("^[a-z][a-z0-9]*$",str);
    }

    @Transactional
    public int delDatas(String viewCode,String itemIDs,Object args[])   throws Throwable  
    {
        String sql="";
        int rows=0;

        UserLogin userDetails=null;
        if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }
        
        if(WSoftUtil.isOrgAdmin(userDetails))
        {
            sql = "delete from psn_role where psnid =?  and orgid=? " ;
            datalistDao.delDatas(sql, new Object[]{itemIDs,userDetails.getUser().getOrgId()});
    
            sql = "delete from psn_org where psnid =? and orgid=?" ;
            datalistDao.delDatas(sql, new Object[]{itemIDs,userDetails.getUser().getOrgId()});
        }
        else if (WSoftUtil.isDeptAdmin(userDetails))
        {
            sql = "delete from psn_role where psnid =?  and orgid=? " ;
            datalistDao.delDatas(sql, new Object[]{itemIDs,userDetails.getUser().getOrgId()});
    
            sql = "delete from psn_org where psnid =? and orgid=?" ;
            datalistDao.delDatas(sql, new Object[]{itemIDs,userDetails.getUser().getOrgId()});
        }
        else if (WSoftUtil.isAdmin(userDetails))
        {
            sql = "delete from psn_role where psnid =? " ;
            datalistDao.delDatas(sql, new Object[]{itemIDs});
    
            sql = "delete from psn_org where psnid =? " ;
            datalistDao.delDatas(sql, new Object[]{itemIDs});

            JSONObject jPara = new JSONObject();
            rows = dService.delDatas(viewCode, itemIDs, jPara);
        }
        
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn_role");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn_org");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
        return rows;
    }

    public List getDatas(String viewCode,int curPage,int pageItems,JSONObject jsonObject)  throws Throwable  
    {
        List lreturn = dService.getDatas(viewCode, curPage, pageItems, jsonObject);

        UserLogin userDetails=null;
        if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }
        
        String sql = "";
        if(WSoftUtil.isOrgAdmin(userDetails))
        {
            sql = "select ROLEID,NAME from role where roleid in ("+ userDetails.getUser().getRolesOrg() +")  order by roleid";
            List lrole = datalistDao.getDatasWeb(sql, new Object[]{});
            lreturn.add(lrole);
        }
        else if (WSoftUtil.isDeptAdmin(userDetails))
        {
            sql = "select ROLEID,NAME from role where roleid in (select roleid from dept_role where deptid=?)  order by roleid";
            List lrole = datalistDao.getDatasWeb(sql, new Object[]{userDetails.getUser().getDeptId()});
            lreturn.add(lrole);
        }
        else if (WSoftUtil.isAdmin(userDetails))
        {
            if(WSoftUtil.dbSqlIsSqlserver())
                sql = "select ROLEID,NAME from role where [open]=1  order by roleid";
            else
                sql = "select ROLEID,NAME from role where open=1  order by roleid";
            List lrole = datalistDao.getDatasWeb(sql, new Object[]{});
            lreturn.add(lrole);
        }
        
        return lreturn;
    }

    @Transactional
    public HashMap<String,String> updPwd(String psnID,String oldpassword,String password,String passwordconfirm,String lan)  throws Throwable  {
            
        String sql = "";
        String msg="";

        if(!password.trim().equals(passwordconfirm.trim()))
        {
            msg = WSoftMsg.getMsgItem("login_passnomatch",lan);
        }
        else
        {

            sql = "select password from psn where psnid=?";
            Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[]{psnID});
            if(mp!=null)
            {
                if(passwordEncoder.matches(oldpassword, mp.get("password").toString()))
                {
                    String strPassword = passwordEncoder.encode(password);
                    sql = "update psn set password=? where psnid=? ";
                    datalistDao.updDatas(sql, new Object[]{strPassword,psnID});
                    WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
                    msg = WSoftMsg.getMsgItem("psn_passsave",lan);
                }
                else
                {
                    msg = WSoftMsg.getMsgItem("psn_passerr",lan);
                }
            }
            else
            {
                msg = "Not exist this user";  
            }
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;

    }

    @Transactional
    public List getDataItem(String viewCode,String itemIDs,JSONObject jsonObject)   throws Throwable  
    {
        List lreturn = dService.getDataItem(viewCode, itemIDs, jsonObject,false);

        List ldata=(List)lreturn.get(0);
        Map<String,Object> mp=(Map)ldata.get(0);
        mp.remove("ACTIVEKEY");
        mp.remove("ACTIVETIME");
        mp.remove("PASSKEY");
        mp.remove("PASSKEYTIME");
        mp.remove("USERNAME");
        mp.remove("PASSWORD");
        mp.remove("ISACTIVE");
        mp.remove("OPEN");

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        String sql = "";
        List lrole = null;

        if(WSoftUtil.isOrgAdmin(userDetails))
        {
            sql = "select ROLEID from psn_role where psnid=? and orgid=" + userDetails.getUser().getOrgId();
            lrole = datalistDao.getDatasWeb(sql, new Object[]{itemIDs});
        }
        else if (WSoftUtil.isDeptAdmin(userDetails))
        {
            sql = "select ROLEID from psn_role where psnid=? and orgid=" + userDetails.getUser().getOrgId();
            lrole = datalistDao.getDatasWeb(sql, new Object[]{itemIDs});
        }
        else if(WSoftUtil.isAdmin(userDetails))
        {
            sql = "select ROLEID from psn_role where psnid=?";
            lrole = datalistDao.getDatasWeb(sql, new Object[]{itemIDs});
        }
        else
        {
            sql = "select ROLEID from psn_role where psnid=" + userDetails.getUser().getId();
            lrole = datalistDao.getDatasWeb(sql, new Object[]{});
        }

        lreturn.add(lrole);
        return lreturn;
    }

    @Transactional
    public List getOrgList(String searchkey)   throws Throwable  
    {
        String sql = "select " + WSoftUtil.dbSqlTopFirst("3") + " ORGID,NAME from org where name " + WSoftUtil.dbSqlLike() + "  " + WSoftUtil.dbSqlTop("3");
        List lorg = datalistDao.getDatasWeb(sql, new Object[]{searchkey});
        return lorg;
    }

    @Transactional
    public List updDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        String msg = "";
        String email = "";
        if(jsonObject.containsKey("field_EMAIL")&&jsonObject.get("field_EMAIL")!=null)
            email = jsonObject.getString("field_EMAIL");
        String mobile = "";
        if(jsonObject.containsKey("field_MOBILE")&&jsonObject.get("field_MOBILE")!=null)
            mobile = jsonObject.getString("field_MOBILE");

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String sql="";
        Map<String,Object> mp = new HashMap<>();

        String amode = cService.getConfigAmode();
        if(amode.equals("1"))
        {
            if(email.trim().equals(""))
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailnull",lan) + "<br/>";
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
        
        if(!mobile.trim().equals(""))
        {
            sql = "select psnid from psn where mobile=? and psnid<>?";
            mp = datalistDao.getDataSingle(sql, new Object[]{mobile,itemIDs});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_mobilereg",lan) + "<br/>"; 
            }
        }

        if(!email.trim().equals(""))
        {
            sql = "select psnid from psn where email=?  and psnid<>? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{email,itemIDs});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailreg",lan) + "<br/>";
            }
        }

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        if(itemIDs.equals(userDetails.getUser().getId().toString()))
        {
            WSoftUtil.setJsonRemoveKey(jsonObject, "field_reqorgid,field_reqorgname,field_reqorgtime,field_reqorgnote");

            if(amode.equals("1"))
            {
                WSoftUtil.setJsonRemoveKey(jsonObject, "field_email");
            }
            else if(amode.equals("2"))
            {
                WSoftUtil.setJsonRemoveKey(jsonObject, "field_mobile");
            }
        }

        if(!msg.equalsIgnoreCase(""))
        {
            List<Map<String,Object>> lreturn = new ArrayList<>();
            Map<String,Object> mreturn = new HashMap<String,Object>();
            mreturn.put("rows",0);
            mreturn.put("msg",msg);
            lreturn.add(mreturn);
            return lreturn;
        }

        String orgID = jsonObject.getString("field_ORGID");
        String deptID = jsonObject.getString("field_DEPTID");
        List ltmp = dService.updDatas(viewCode, itemIDs, jsonObject);

        Map<String,Object> mreturn = (Map)ltmp.get(0);
        msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {

            if(WSoftUtil.isAdmin(userDetails))
            {
                sql = "insert into psn_org(psnid,orgid,deptid) select ?,?,? from psn where psnid=? and psnid not in (select psnid from psn_org where orgid=? and psnid=?) ";
                datalistDao.updDatas(sql, new Object[]{itemIDs,orgID,deptID,itemIDs,orgID,itemIDs});
                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn_org");
            }

            sql = "update psn_org set deptid=? where orgid=? and psnid=? ";
            datalistDao.updDatas(sql, new Object[]{deptID,orgID,itemIDs});

            msg = addPsnRole(itemIDs,jsonObject);
            mreturn.put("msg",msg);
        }
        codeUpdPsn();
        return ltmp;

    }

    @Transactional
    public List addDatas(String viewCode,String itemIDs,String webpage,JSONObject jsonObject)  throws Throwable 
    {
        String msg = "";
        String email = "";
        if(jsonObject.containsKey("field_EMAIL"))
            email = jsonObject.getString("field_EMAIL");
        String mobile = "";
        if(jsonObject.containsKey("field_MOBILE"))
            mobile = jsonObject.getString("field_MOBILE");

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String sql="";
        Map<String,Object> mp = new HashMap<>();

        String amode = cService.getConfigAmode();
        if(amode.equals("1"))
        {
            if(email.trim().equals(""))
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailnull",lan) + "<br/>";
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
        
        if(!mobile.trim().equals(""))
        {
            sql = "select psnid from psn where mobile=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{mobile});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_mobilereg",lan) + "<br/>"; 
            }
        }

        if(!email.trim().equals(""))
        {
            sql = "select psnid from psn where email=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{email});
            if(mp!=null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_emailreg",lan) + "<br/>";
            }
        }

        if(!msg.equalsIgnoreCase(""))
        {
            List<Map<String,Object>> lreturn = new ArrayList<>();
            Map<String,Object> mreturn = new HashMap<String,Object>();
            mreturn.put("pid",-1);
            mreturn.put("msg",msg);
            lreturn.add(mreturn);
            return lreturn;
        }

        String orgID = jsonObject.getString("field_ORGID");
        String deptID = jsonObject.getString("field_DEPTID");

        List ltmp = dService.addDatas(viewCode, jsonObject);
        String activekey = WSoftUtil.genGuid(null);

        Map<String,Object> mreturn = (Map)ltmp.get(0);
        msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            Integer pID = (Integer)mreturn.get("pid");
            sql = "update psn set activekey=?,activetime="+ WSoftUtil.dbSqlSysdate() +" where psnid=? ";
            datalistDao.updDatas(sql, new Object[]{activekey,pID});

            sql = "insert into psn_org(psnid,orgid,deptid) select ?,?,? from psn where psnid=? and psnid not in (select psnid from psn_org where orgid=? and psnid=?) ";
            datalistDao.updDatas(sql, new Object[]{pID,orgID,deptID,pID,orgID,pID});
            WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn_org");

            sql = "update psn_org set deptid=? where orgid=? and psnid=? ";
            datalistDao.updDatas(sql, new Object[]{deptID,orgID,pID});

            msg = addPsnRole(Integer.toString(pID),jsonObject);
            mreturn.put("msg",msg);
        }

        if(msg.equalsIgnoreCase(""))
        {
            if(!email.trim().equals("")&&amode.equals("1"))
            {
                String mguid="437433267d3b4347aad79762b2b4f054";
                if(lan.equals("e"))
                {
                    mguid="437433267d3b4347aad79762b2b4f011"; 
                }

                HashMap<String,Object> mt = new HashMap<>();
                mt.put("msg#tempid",mguid);
                mt.put("msg#name",jsonObject.getString("field_NAME").trim());
                mt.put("msg#activateLink",webpage + "?key="+activekey);
                mt.put("msg#toaddr",email.trim());
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
                mt.put("msg#name",jsonObject.getString("field_NAME").trim());
                mt.put("msg#activateLink",webpage + "?key="+activekey);
                mt.put("msg#toaddr",mobile.trim());
                dService.codeMsgAdd(mt);
            }
            
        }
        return ltmp;
    }

    @Transactional
    public String addPsnRole(String psnID,JSONObject jsonObject)  throws Throwable 
    {
        String msg="";
        if(!(jsonObject.containsKey("ROLEIDS")&&jsonObject.getString("ROLEIDS").trim()!=""))
            return msg;

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        String orgID = jsonObject.getString("field_ORGID");
        String roleIDs = jsonObject.getString("ROLEIDS");
        String orgroles = userDetails.getUser().getRolesOrg();
        String sql = "";

        if(WSoftUtil.isOrgAdmin(userDetails))
        {
            sql="delete from psn_role where orgid=? and psnid =? " ;
            datalistDao.delDatas(sql, new Object[]{userDetails.getUser().getOrgId(),psnID});
        }
        else if (WSoftUtil.isDeptAdmin(userDetails))
        {
            sql="delete from psn_role where orgid=? and psnid =? and roleid in (select roleid from dept_role where deptid="+ userDetails.getUser().getDeptId() +") " ;
            datalistDao.delDatas(sql, new Object[]{userDetails.getUser().getOrgId(),psnID});
        }
        else if(WSoftUtil.isAdmin(userDetails))
        {
            sql="delete from psn_role where psnid =? and ((orgid is null) or (orgid=?) ) " ;
            datalistDao.delDatas(sql, new Object[]{psnID,orgID});
        }
        else
        {
            return msg;
        }

        String[] sarrs = roleIDs.split(",");
        orgroles = ","+ orgroles + ",";
        String rolesdo=",";
        for(int i=0;i<sarrs.length;i++)
        {

            if(rolesdo.indexOf(","+ sarrs[i] + ",")>=0)
            {
                continue;
            }

            if(WSoftUtil.isOrgAdmin(userDetails))
            {
                String roleid=","+ sarrs[i] + ",";
                if(orgroles.indexOf(roleid)>=0)
                {
                    sql = "insert into psn_role(psnid,orgid,roleid) select ?,?,roleid from role where roleid=?" ;
                    datalistDao.addDatas(sql, new Object[]{psnID,userDetails.getUser().getOrgId(),sarrs[i]});
                }
            }
            else if (WSoftUtil.isDeptAdmin(userDetails))
            {
                sql = "insert into psn_role(psnid,orgid,roleid) select ?,?,roleid from role where roleid=? and roleid in (select roleid from dept_role where deptid="+ userDetails.getUser().getDeptId() +") " ;
                datalistDao.addDatas(sql, new Object[]{psnID,userDetails.getUser().getOrgId(),sarrs[i]});
            }
            else if(WSoftUtil.isAdmin(userDetails))
            {
                sql = "insert into psn_role(psnid,roleid) select ?,? from role where roleid=? and roleid not in (select roleid from org_role) and isorg='0'";
                datalistDao.addDatas(sql, new Object[]{psnID,sarrs[i],sarrs[i]});

                sql = "insert into psn_role(psnid,orgid,roleid) select ?,?,? from role where roleid=? and (roleid in (select roleid from org_role where orgid=?) or isorg='1')";
                datalistDao.addDatas(sql, new Object[]{psnID,orgID,sarrs[i],sarrs[i],orgID});
            }
            else 
                return msg;
            
            rolesdo = rolesdo + sarrs[i] + ",";
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn_role");
        return msg;

    }

    @Transactional
    public HashMap<String,String> reqemail(JSONObject jsonObject)  throws Throwable  {
        
        String msg="";
        String email = jsonObject.getString("email").trim();
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String sql="";

        if(email.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_emailnull",lan);
        }
        
        if(msg.trim().equals(""))
        {
            UserLogin userDetails=null;
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }

            String reqkey=WSoftUtil.genReqKey(6);
            sql = "update psn set reqemail=?,reqemailkey='"+ reqkey +"' where psnid=? ";
            datalistDao.updDatas(sql, new Object[]{email,userDetails.getUser().getId()});
            WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
            
            String mguid="e6d1acc3809b4a55b044479b7c27db9e";
            if(lan.equals("e"))
            {
                mguid="e6d1acc3809b4a55b044479b7c27db11"; 
            }

            HashMap<String,Object> mt = new HashMap<>();
            mt.put("msg#tempid",mguid);
            mt.put("msg#captcha",reqkey);
            mt.put("msg#toaddr",email);
            dService.codeMsgAdd(mt);

        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    @Transactional
    public HashMap<String,String> reqemailsave(JSONObject jsonObject)  throws Throwable  {
        
        String msg="";
        String email = jsonObject.getString("email").trim();
        String reqkey = jsonObject.getString("reqkey").trim();
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }
        String sql="";
        Map<String,Object> mp = new HashMap<>();

        if(email.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_emailnull",lan)+ "<br/>";
        }

        if(reqkey.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_vcodenull1",lan)+ "<br/>";
        }
        
        if(msg.trim().equals(""))
        {
            UserLogin userDetails=null;
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }

            sql = "select psnid from psn where reqemail=? and reqemailkey=? and psnid=?";
            mp = datalistDao.getDataSingle(sql, new Object[]{email,reqkey,userDetails.getUser().getId()});
            if(mp==null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_vcodeerr1",lan)+ "<br/>";
            }
            else
            {
                sql = "update psn set email=?,reqemail=null,reqemailkey=null where psnid=? ";
                datalistDao.updDatas(sql, new Object[]{email,userDetails.getUser().getId()});
                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
                codeUpdPsn();
            }
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }
        
    @Transactional
    public HashMap<String,String> reqmobile(JSONObject jsonObject)  throws Throwable  {
        
        String msg="";
        String mobile = jsonObject.getString("mobile").trim();
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String sql="";
        if(mobile.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_mobilenull",lan);
        }
        
        if(msg.trim().equals(""))
        {
            UserLogin userDetails=null;
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }

            String reqkey=WSoftUtil.genReqKey(6);
            sql = "update psn set reqmobile=?,reqmobilekey='"+ reqkey +"' where psnid=? ";
            datalistDao.updDatas(sql, new Object[]{mobile,userDetails.getUser().getId()});
            WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
            
            String mguid="eb66300e2abb46dea6979fa6f4fa50f1";
            if(lan.equals("e"))
            {
                mguid="eb66300e2abb46dea6979fa6f4fa5011"; 
            }

            HashMap<String,Object> mt = new HashMap<>();
            mt.put("msg#tempid",mguid);
            mt.put("msg#captcha",reqkey);
            mt.put("msg#toaddr",mobile);
            dService.codeMsgAdd(mt);

        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    
    @Transactional
    public HashMap<String,String> reqmobilesave(JSONObject jsonObject)  throws Throwable  {
        
        String msg="";
        String mobile = jsonObject.getString("mobile").trim();
        String reqkey = jsonObject.getString("reqkey").trim();
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }
        String sql="";
        Map<String,Object> mp = new HashMap<>();

        if(mobile.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_mobilenull",lan)+ "<br/>";
        }

        if(reqkey.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("login_vcodenull1",lan)+ "<br/>";
        }
        
        if(msg.trim().equals(""))
        {
            UserLogin userDetails=null;
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }

            sql = "select psnid from psn where reqmobile=? and reqmobilekey=? and psnid=?";
            mp = datalistDao.getDataSingle(sql, new Object[]{mobile,reqkey,userDetails.getUser().getId()});
            if(mp==null)
            {
                msg = msg + WSoftMsg.getMsgItem("login_vcodeerr1",lan)+ "<br/>";
            }
            else
            {
                sql = "update psn set mobile=?,reqmobile=null,reqmobilekey=null where psnid=? ";
                datalistDao.updDatas(sql, new Object[]{mobile,userDetails.getUser().getId()});
                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
                codeUpdPsn();
            }
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    @Transactional
    public HashMap<String,String> reqorgsave(JSONObject jsonObject)  throws Throwable  {
        
        String msg="";
        String orgid = jsonObject.getString("orgid").trim();
        String deptid = jsonObject.getString("deptid").trim();
        String orgname = jsonObject.getString("orgname").trim();
        String reqorgnote = jsonObject.getString("reqorgnote").trim();
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String sql="";
        Map<String,Object> mp = new HashMap<>();

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        if(orgid.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("psn_orgname",lan)+ "<br/>";
        }
        else
        {
            List lorg = new ArrayList<>();
            sql = "select orgid from psn_org where orgid=? and psnid=?";
            lorg = datalistDao.getDatasWeb(sql, new Object[]{orgid,userDetails.getUser().getId()});

            if(lorg.size()>0||orgid.equals(userDetails.getUser().getOrgId().toString()))
            {
                msg = msg + WSoftMsg.getMsgItem("psn_orgjoin",lan)+ "<br/>";
            }
        }

        if(reqorgnote.trim().equals(""))
        {
            msg = msg + WSoftMsg.getMsgItem("psn_orgnote",lan)+ "<br/>";
        }
        
        if(msg.trim().equals(""))
        {
            sql = "update psn set reqdeptid=?,reqorgid=?,reqorgname=?,reqorgtime="+ WSoftUtil.dbSqlSysdate() +",reqorgnote=?,reqorgstatus='0',reqorgcomment=null where psnid=? ";
            datalistDao.updDatas(sql, new Object[]{deptid,orgid,orgname,reqorgnote,userDetails.getUser().getId()});
            WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    @Transactional
    public HashMap<String,String> psnapprove(JSONObject jsonObject)  throws Throwable  {
        
        String msg="";
        String psnid = jsonObject.getString("itemIDs").trim();
        String approvetype = jsonObject.getString("approvetype").trim();
        String reqorgcomment = jsonObject.getString("reqorgcomment").trim();
        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String sql="";
        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        if(WSoftUtil.isOrgAdmin(userDetails)||WSoftUtil.isDeptAdmin(userDetails))
        {
            if(approvetype.equals("1"))
            {
                String deptid = jsonObject.getString("deptid").trim();
                String deptname = jsonObject.getString("deptname").trim();
                String roles = jsonObject.getString("ROLEIDS").trim();

                if(deptid.trim().equals(""))
                {
                    msg = msg + WSoftMsg.getMsgItem("psn_orgnote",lan)+ "<br/>";
                }
                if(roles.trim().equals(""))
                {
                    msg = msg + WSoftMsg.getMsgItem("psn_deptrole",lan)+ "<br/>";
                }

                if(msg.trim().equals(""))
                {
                    sql = "update psn set orgid=?,orgname=?,deptid=?,deptname=?,reqorgid=null,reqdeptid=null,reqorgnote=null,reqorgstatus=null,reqorgcomment=null where reqorgid=? and psnid=? ";
                    datalistDao.updDatas(sql, new Object[]{userDetails.getUser().getOrgId(),userDetails.getUser().getOrgName(),deptid,deptname,userDetails.getUser().getOrgId(),psnid});
                    
                    sql = "insert into psn_org(psnid,orgid,deptid) select ?,?,? from psn where psnid=? and psnid not in (select psnid from psn_org where orgid=? and psnid=?) ";
                    datalistDao.updDatas(sql, new Object[]{psnid,userDetails.getUser().getOrgId(),deptid,psnid,userDetails.getUser().getOrgId(),psnid});
                   
                    sql = "update psn_org set deptid=? where orgid=? and psnid=? ";
                    datalistDao.updDatas(sql, new Object[]{deptid,userDetails.getUser().getOrgId(),psnid});

                }

                String roleIDs = jsonObject.getString("ROLEIDS");
                String orgroles = userDetails.getUser().getRolesOrg();

                if(WSoftUtil.isOrgAdmin(userDetails))
                {
                    sql = "delete from psn_role where psnid=? and orgid=? and roleid in ("+ orgroles +")";
                    datalistDao.updDatas(sql, new Object[]{psnid,userDetails.getUser().getOrgId()}); 
                }
                else if(WSoftUtil.isDeptAdmin(userDetails))
                {
                    sql = "delete from psn_role where psnid=? and orgid=? and roleid in (select roleid from dept_role where deptid="+ userDetails.getUser().getDeptId() +")";
                    datalistDao.updDatas(sql, new Object[]{psnid,userDetails.getUser().getOrgId()}); 
                }

                String[] sarrs = roleIDs.split(",");
                orgroles = ","+ orgroles + ",";
                for(int i=0;i<sarrs.length;i++)
                {
                    if(WSoftUtil.isOrgAdmin(userDetails))
                    {
                        String roleid=","+ sarrs[i] + ",";
                        if(orgroles.indexOf(roleid)>=0)
                        {
                            sql = "insert into psn_role(psnid,orgid,roleid) select ?,?,roleid from role where roleid=?" ;
                            datalistDao.addDatas(sql, new Object[]{psnid,userDetails.getUser().getOrgId(),sarrs[i]});
                        }
                    }
                    else if (WSoftUtil.isDeptAdmin(userDetails))
                    {
                        sql = "insert into psn_role(psnid,orgid,roleid) select ?,?,roleid from role where roleid=? and roleid in (select roleid from dept_role where deptid="+ userDetails.getUser().getDeptId() +")" ;
                        datalistDao.addDatas(sql, new Object[]{psnid,userDetails.getUser().getOrgId(),sarrs[i]});
                    }
                }

                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn_role");
                codeUpdPsn();

            }
            else if(approvetype.equals("2"))
            {
                if(reqorgcomment.trim().equals(""))
                {
                    msg = msg + WSoftMsg.getMsgItem("psn_orgnote",lan)+ "<br/>";
                }
                sql = "update psn set reqorgstatus='2',reqorgcomment=? where reqorgid=? and psnid=? ";
                datalistDao.updDatas(sql, new Object[]{reqorgcomment,userDetails.getUser().getOrgId(),psnid});
                WSoftUtil.dbUpdDataUpdTime(datalistDao, "psn");
            }
            else 
            {
                msg = msg + "System error<br/>";
            }
        }

        HashMap<String,String> map = new HashMap<>();
        map.put("msg",msg);
        return map;
    }

    private void codeUpdPsn() throws Throwable 
    {
        
        String exeCode = cService.getConfigUpdPsnCode();
        if(!exeCode.equals(""))
        {
            String msg = codeUpd(exeCode,dService);
            if(!msg.equals(""))
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }

    }

    private String codeUpd(String codeID,DatalistService dService) throws Throwable 
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

                UserLogin userDetails=null;
                UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
                if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
                { 
                    userDetails = (UserLogin)authenticationToken.getPrincipal();
                }

                if(userDetails!=null)
                {
                    mapPara.put("visitorId",userDetails.getUser().getId());
                    mapPara.put("visitorDeptId",userDetails.getUser().getDeptId());
                    mapPara.put("visitorOrgId",userDetails.getUser().getOrgId());
                    mapPara.put("visitorRoles",userDetails.getUser().getRoleIDs());
                }
                else
                {
                    mapPara.put("visitorId",0);
                    mapPara.put("visitorDeptId",0);
                    mapPara.put("visitorOrgId",0);
                }

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
                    throw new RuntimeException("Person info save error:"+strError);
                } 
            }
        }
        return "";
    }            
}
