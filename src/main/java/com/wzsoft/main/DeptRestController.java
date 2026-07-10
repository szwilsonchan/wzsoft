package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.*;

@RestController
public class DeptRestController {
    
    @Autowired
    private DeptService deptService;

    @Autowired
    private DatalistService dService;

    @RequestMapping("/api/datadeptlistpub")
    public List getDatasPub(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        List datalist = null;
        String orgid=jsonObject.getString("orgid");
        if(orgid!=null)
        {
            datalist = dService.getDatasBySql("select PID,DEPTID,NAME from dept where orgid=? and ispub='1' order by snum asc,snumsub asc", new Object[]{jsonObject.getString("orgid")});
        }
        return datalist;
    }

    @RequestMapping("/api/datadeptlist")
    public List getDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="dept";
        if(!checkSearchRights(jsonObject))
        {
            return null;
        }

        int curPage = Integer.parseInt(jsonObject.getString("curPage"));
        int pageItmes = Integer.parseInt(jsonObject.getString("pageItmes"));

        List datalist = deptService.getDatas(viewCode, curPage,pageItmes,jsonObject);

        Map<String,Object> mp = new HashMap<>();
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(WSoftUtil.isOrgAdmin(userDetails))
            {
                mp.put("role","o");
            }
            else if(WSoftUtil.isDeptAdmin(userDetails))
            {
                mp.put("role","d");
                mp.put("deptid",userDetails.getUser().getDeptId());
                if(userDetails.getUser().getParentDeptId()>0)
                {
                    mp.put("issub","1");
                }
            }
        }
        datalist.add(mp);
        return datalist;
    }
    @RequestMapping("/api/datadeptupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="dept";
        if(!checkUpdRights(jsonObject))
        {
            return null;
        }

        String itemIDs=jsonObject.getString("itemIDs");
        List datalist = deptService.updDatas(viewCode, itemIDs,jsonObject);
        return datalist;
    }
    @RequestMapping("/api/datadeptget")
    public List getDataItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="dept";
        if(!checkSearchRights(jsonObject))
        {
            return null;
        }

        String itemIDs=jsonObject.getString("itemIDs");
        List datalist = deptService.getDataItem(viewCode,itemIDs,jsonObject);

        return datalist;
    }
    @RequestMapping("/api/datadeptadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="dept";
        if(!checkUpdRights(jsonObject))
        {
            return null;
        }

        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(WSoftUtil.isDeptAdmin(userDetails))
            {
                if(userDetails.getUser().getParentDeptId()>0)
                {
                    return null;
                }
            }
        }

        List datalist = deptService.addDatas(viewCode, jsonObject);
        return datalist;
    }
    @RequestMapping("/api/datadeptdel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="dept";
        if(!checkSearchRights(jsonObject))
        {
            return 0;
        }

        String itemIDs=jsonObject.getString("itemIDs");

        int rows = deptService.delDatas(viewCode, itemIDs,jsonObject);
        return rows;
    }
    private boolean checkUpdRights(JSONObject jsonObject)
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
                            jsonObject.put("filter_orgid_equal",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGID",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGNAME",userDetails.getUser().getOrgName());
                        }
                        return true;
                    }
                    else if (roleID.equalsIgnoreCase("3"))
                    {
                        if(jsonObject!=null)
                        {
                            jsonObject.put("filter_deptid_equaldept",userDetails.getUser().getDeptId());
                            jsonObject.put("filter_orgid_equal",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());

                            String itemIDs="";
                            if(jsonObject.containsKey("itemIDs"))
                                itemIDs = jsonObject.getString("itemIDs");

                            if(!itemIDs.equals(String.valueOf(userDetails.getUser().getDeptId())))
                                WSoftUtil.setJosnKeyValue(jsonObject, "field_PID",userDetails.getUser().getDeptId());

                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGID",userDetails.getUser().getOrgId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_ORGNAME",userDetails.getUser().getOrgName());
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
                            jsonObject.put("filter_orgid_equal",userDetails.getUser().getOrgId());
                        }
                        return true;
                    }
                    else if (roleID.equalsIgnoreCase("3"))
                    {
                        if(jsonObject!=null)
                        {
                            jsonObject.put("filter_deptid_equaldept",userDetails.getUser().getDeptId());
                            jsonObject.put("filter_orgid_equal",userDetails.getUser().getOrgId());
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
}

