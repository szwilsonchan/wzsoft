package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.alibaba.fastjson.*;

@RestController
public class PsnRestController {
    
    @Autowired
    private UserDetailsServiceImpl uService;

    @Autowired
    private PsnService pService;

    @Autowired
    private RedisCache redisCache;

    @Autowired
    private DatalistService dService;

    @RequestMapping("/api/datapsnlist")
    public List getDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="psn";
        if(!checkSearchRights(jsonObject))
        {
            return null;
        }

        UserLogin userDetails = null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        int curPage = Integer.parseInt(jsonObject.getString("curPage"));
        int pageItmes = Integer.parseInt(jsonObject.getString("pageItmes"));
        jsonObject.put("filter_psnid_notequal",userDetails.getUser().getId());

        List datalist = pService.getDatas(viewCode, curPage,pageItmes,jsonObject);

        Map<String,Object> mp = new HashMap<>();
        if(WSoftUtil.isOrgAdmin(userDetails))
            mp.put("role","o");
        else if(WSoftUtil.isDeptAdmin(userDetails))
            mp.put("role","d");

        datalist.add(mp);
        
        return datalist;
    }
    @RequestMapping("/api/datapsnorglist")
    public List getOrgDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String searchkey = jsonObject.getString("filter_searchkey_like");
        if(searchkey.trim().equals(""))
        {
            return null;
        }

        List datalist = pService.getOrgList(searchkey);
        return datalist;
    }
    @RequestMapping("/api/datapsnget")
    public List getDataItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="psn";
        if(!checkSearchRights(jsonObject))
        {
            return null;
        }

        String itemIDs=jsonObject.getString("itemIDs");

        if(itemIDs.equals(""))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
                itemIDs = String.valueOf(userDetails.getUser().getId());
            }
        }

        List datalist = pService.getDataItem(viewCode,itemIDs,jsonObject);
        return datalist;
    }
    @RequestMapping("/api/datapsngetorgs")
    public List getPsnOrgs(@RequestBody JSONObject jsonObject)  throws Throwable {
        

        List datalist = new ArrayList<>();

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        if(WSoftUtil.isAdmin(userDetails))
        {
            String sql = "select o.orgid as ORGID,o.name as ORGNAME,d.deptid as DEPTID,d.name as DEPTNAME from psn_org p join org o on p.orgid=o.orgid left join dept d on p.deptid=d.deptid where p.psnid=?";
            datalist = dService.getDatasBySql(sql, new Object[]{jsonObject.getString("psnid")});
        }
        else
        {
            String sql = "select o.orgid as ORGID,o.name as ORGNAME,d.deptid as DEPTID,d.name as DEPTNAME from psn_org p join org o on p.orgid=o.orgid left join dept d on p.deptid=d.deptid where p.psnid=?";
            datalist = dService.getDatasBySql(sql, new Object[]{userDetails.getUser().getId()});
        }

        return datalist;
    }
    @RequestMapping("/api/datapsngetroles")
    public List getPsnRoles(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        List datalist = new ArrayList<>();

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
            return userDetails.getUser().getRolesAll();
        }

        return datalist;
    }
    @RequestMapping("/api/datapsnselrole")
    public String getPsnSelRole(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
        
        String orgID = jsonObject.getString("orgid");
        String roleID = jsonObject.getString("roleid");
        String strType = jsonObject.getString("apptype");
        String reurl="";
        String msg="";

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
            User user = userDetails.getUser();
            uService.selRole(user, orgID, roleID);

            String loginreurl = "";
            if(request.getSession().getAttribute("reurl")!=null)
            {
                loginreurl = request.getSession().getAttribute("reurl").toString();
            }

            List lapppc = user.getRoleAppPc();
            List lappmobile = user.getRoleAppMobile();

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
            request.getSession().setAttribute("rolepages", user.getRolePage());
            request.getSession().setAttribute("mrole", user.getRoleIDs());

            user.setRoleAppMobile(null);
            user.setRoleAppPc(null);
            user.setRolePage(null);
            
            if(msg.equalsIgnoreCase(""))
            {
                authenticationToken = new UsernamePasswordAuthenticationToken(userDetails,null,null);
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        return reurl;

    }
    @RequestMapping("/api/datapsndelorg")
    public int getPsnDelOrg(@RequestBody JSONObject jsonObject)  throws Throwable {
        

        int rows=0;

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        if(WSoftUtil.isAdmin(userDetails))
        {
            String sql = "delete from psn_org where orgid=? and psnid=? ";
            rows = dService.updDatasBySql(sql, new Object[]{jsonObject.getString("orgid"),jsonObject.getString("psnid")});

            sql = "delete from psn_role where orgid=? and psnid=? ";
            rows = dService.updDatasBySql(sql, new Object[]{jsonObject.getString("orgid"),jsonObject.getString("psnid")});
        }

        return rows;
    }
    @RequestMapping("/api/datapsnupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="psn";
        if(!checkUpdRights(jsonObject))
        {
            return null;
        }

        UserLogin userDetails = null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        String itemIDs=jsonObject.getString("itemIDs");

        if(itemIDs.equals(""))  // Update own info
        {
            itemIDs = String.valueOf(userDetails.getUser().getId());
            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());
            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGID",userDetails.getUser().getOrgId());
            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGNAME",userDetails.getUser().getOrgName());
            WSoftUtil.setJosnKeyValue(jsonObject, "field_DEPTID",userDetails.getUser().getDeptId());
            WSoftUtil.setJosnKeyValue(jsonObject, "field_DEPTNAME",userDetails.getUser().getDeptName());
            WSoftUtil.setJosnKeyValue(jsonObject, "ROLEIDS","");

        }

        List datalist = pService.updDatas(viewCode, itemIDs,jsonObject);
        return datalist;
    }
    @RequestMapping("/api/datapsnpwd")
    public HashMap<String,String> updPwd(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        UserLogin userDetails = null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String itemIDs = String.valueOf(userDetails.getUser().getId());
        String oldpassword = jsonObject.getString("oldpassword");
        String password = jsonObject.getString("password");
        String passwordconfirm = jsonObject.getString("passwordconfirm");

        return pService.updPwd(itemIDs,oldpassword,password,passwordconfirm,lan);
    }
    @RequestMapping("/api/datapsnadd")
    public List addDatas(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
        
        String viewCode="psn";
        String webpage = WSoftUtil.propertyGetPara("gwebsite").toString() + "/manage/reg_psnact.html";
        if(!checkUpdRights(jsonObject))
        {
            return null;
        }
        String itemIDs=jsonObject.getString("itemIDs");
        List datalist = pService.addDatas(viewCode, itemIDs,webpage,jsonObject);

        return datalist;
    }
    @RequestMapping("/api/datapsndel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="psn";
        if(!checkSearchRights(jsonObject))
        {
            return 0;
        }
        String itemIDs=jsonObject.getString("itemIDs"); 
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();  // Cannot delete self
            if(itemIDs.equals(String.valueOf(userDetails.getUser().getId())))
                return 0;
        }

        Object[] args = new Object[1];
        int rows = pService.delDatas(viewCode, itemIDs,args);
        return rows;
    }

    @RequestMapping("/api/datapsnreqmail")
    public HashMap<String,String> reqmail(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        HashMap<String,String> mr = new HashMap<>();
        try
        {
            mr = pService.reqemail(jsonObject);
        }
        catch(Throwable e)
        {
            e.printStackTrace();
            mr.put("msg","System error");
        }
        return mr;
    }

    @RequestMapping("/api/datapsnapprove")
    public HashMap<String,String> psnapprove(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        HashMap<String,String> mr = new HashMap<>();
        try
        {
            mr = pService.psnapprove(jsonObject);
        }
        catch(Throwable e)
        {
            e.printStackTrace();
            mr.put("msg","System error");
        }
        return mr;
    }

    @RequestMapping("/api/datapsnreqmailsave")
    public HashMap<String,String> reqmailsave(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        HashMap<String,String> mr = new HashMap<>();
        try
        {
            mr = pService.reqemailsave(jsonObject);
        }
        catch(Throwable e)
        {
            e.printStackTrace();
            mr.put("msg","System error");
        }
        return mr;
    }

    @RequestMapping("/api/datapsnreqmobile")
    public HashMap<String,String> reqmobile(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        HashMap<String,String> mr = new HashMap<>();
        try
        {
            mr = pService.reqmobile(jsonObject);
        }
        catch(Throwable e)
        {
            e.printStackTrace();
            mr.put("msg","System error");
        }
        return mr;
    }

    @RequestMapping("/api/datapsnreqmobilesave")
    public HashMap<String,String> reqmobilesave(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        HashMap<String,String> mr = new HashMap<>();
        try
        {
            mr = pService.reqmobilesave(jsonObject);
        }
        catch(Throwable e)
        {
            e.printStackTrace();
            mr.put("msg","System error");
        }
        return mr;
    }
    
    @RequestMapping("/api/datapsnreqorgsave")
    public HashMap<String,String> reqorgsave(@RequestBody JSONObject jsonObject,HttpServletRequest request){
        
        HashMap<String,String> mr = new HashMap<>();
        try
        {
            mr = pService.reqorgsave(jsonObject);
        }
        catch(Throwable e)
        {
            e.printStackTrace();
            mr.put("msg","System error");
        }
        return mr;
    }

    private boolean checkUpdRights(JSONObject jsonObject) throws Throwable
    {
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails.getUser().getId()!=1)
            {
                List lro = userDetails.getUser().getRoles();

                // Add records: itemid=null; edit own info: itemid=""
                String itemIDs="";
                if(jsonObject.get("itemIDs")!=null)
                    itemIDs = jsonObject.getString("itemIDs");
                else
                    itemIDs="0";

                for(int j=0;j<lro.size();j++)
                {
                    Map<String,Object> mldv = (Map)lro.get(j);
                    String roleID = String.valueOf(mldv.get("ROLEID"));
                    if(roleID.equalsIgnoreCase("2")&&!itemIDs.equals(""))
                    {
                        if(jsonObject!=null)
                        {
                            jsonObject.put("filter_psnid_psnorg",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGID",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGNAME",userDetails.getUser().getOrgName());

                            String strDept = jsonObject.getString("field_DEPTID");
                            if(!strDept.equals("0"))
                            {
                                List ldept = dService.getDatasBySql("select DEPTID from dept where deptid=? and orgid=?", new Object[] {jsonObject.getString("field_DEPTID"),userDetails.getUser().getOrgId()});
                                if(ldept.size()==0)
                                {
                                    return false;
                                }
                            }
                        }
                        return true;
                    }
                    else if (roleID.equalsIgnoreCase("3")&&!itemIDs.equals(""))
                    {
                        if(jsonObject!=null)
                        {
                            jsonObject.put("filter_psnid_psndept",userDetails.getUser().getDeptId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());

                            Boolean findDept=false;
                            List lsubDepts = dService.getDatasBySql("select DEPTID from dept where deptid=? or pid=?", new Object[] {userDetails.getUser().getDeptId(),userDetails.getUser().getDeptId()});
                            for(int k=0;k<lsubDepts.size();k++)
                            {
                                Map<String,Object> msd = (Map)lsubDepts.get(k);
                                String deptID = String.valueOf(msd.get("DEPTID"));
                                if(deptID.equals(jsonObject.getString("field_DEPTID")))
                                {
                                    findDept=true;
                                    break;
                                }
                            }
                            
                            if(!findDept)
                            {
                                WSoftUtil.setJosnKeyValue(jsonObject, "field_DEPTID",userDetails.getUser().getDeptId());
                                WSoftUtil.setJosnKeyValue(jsonObject, "field_DEPTNAME",userDetails.getUser().getDeptName());
                            }

                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGID",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGNAME",userDetails.getUser().getOrgName());
                            return true;
                        }
                    }
                    else
                    {
                        if(jsonObject!=null)
                        {
                            jsonObject.put("filter_psnid_equal",userDetails.getUser().getId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGID",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGNAME",userDetails.getUser().getOrgName());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_DEPTID",userDetails.getUser().getDeptId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_DEPTNAME",userDetails.getUser().getDeptName());
                            WSoftUtil.setJosnKeyValue(jsonObject, "ROLEIDS","");
                            return true;
                        }
                    }
                }
            }
            else
            {
                return true;
            }
        }
        return false;
    }

    private boolean checkSearchRights(JSONObject jsonObject)
    {
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails.getUser().getId()!=1)
            {
                List lro = userDetails.getUser().getRoles();
                for(int j=0;j<lro.size();j++)
                {
                    Map<String,Object> mldv = (Map)lro.get(j);
                    String roleID = String.valueOf(mldv.get("ROLEID"));
                    if(roleID.equalsIgnoreCase("2"))
                    {
                        if(jsonObject!=null)
                        {
                            if(jsonObject.containsKey("apppsnjoin"))
                            {
                                jsonObject.put("filter_reqorgid_equal",userDetails.getUser().getOrgId());
                                jsonObject.put("filter_reqorgstatus_equal","0");
                            }
                            else
                                jsonObject.put("filter_psnid_psnorg",userDetails.getUser().getOrgId());
                        }
                        return true;
                    }
                    else if (roleID.equalsIgnoreCase("3"))
                    {
                        if(jsonObject!=null)
                        {
                            if(jsonObject.containsKey("apppsnjoin"))
                            {
                                jsonObject.put("filter_reqdeptid_equal",userDetails.getUser().getDeptId());
                                jsonObject.put("filter_reqorgstatus_equal","0");
                            }
                            else
                            {
                                jsonObject.put("filter_psnid_psndept",userDetails.getUser().getDeptId());
                            }

                            return true;
                        }
                    }
                    else
                    {
                        jsonObject.put("filter_psnid_equal",userDetails.getUser().getId());
                        return true;
                    }
                }
            }
            else
            {
                return true;
            }
        }
        return false;
    }
}

