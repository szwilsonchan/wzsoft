package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.*;

@RestController
public class OrgRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private OrgService oService;

    @RequestMapping("/api/dataorglist")
    public List getDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="org";
        if(!checkSearchRights(jsonObject))
        {
            return null;
        }

        int curPage = Integer.parseInt(jsonObject.getString("curPage"));
        int pageItmes = Integer.parseInt(jsonObject.getString("pageItmes"));

        List datalist = oService.getDatas(viewCode, curPage,pageItmes,jsonObject);
        return datalist;
    }
    @RequestMapping("/api/dataorgupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="org";
        if(!checkUpdRights(jsonObject))
        {
            return null;
        }

        String itemIDs=jsonObject.getString("itemIDs");
        List datalist = oService.updDatas(viewCode, itemIDs,jsonObject);

        return datalist;
    }
    @RequestMapping("/api/dataorgdel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="org";
        if(!checkUpdRights(jsonObject))
        {
            return 0;
        }

        String itemIDs=jsonObject.getString("itemIDs");
        int rows = oService.delDatas(viewCode, itemIDs,jsonObject);
        return rows;
    }
    @RequestMapping("/api/dataorgadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="org";
        if(!checkUpdRights(jsonObject))
        {
            return null;
        }

        String itemIDs=jsonObject.getString("itemIDs");
        List datalist = oService.addDatas(viewCode, jsonObject);

        return datalist;
    }
    @RequestMapping("/api/dataorgget")
    public List getDataItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="org";
        if(!checkSearchRights(jsonObject))
        {
            return null;
        }

        String itemIDs=jsonObject.getString("itemIDs");
        List datalist = oService.getDataItem(viewCode,itemIDs,jsonObject);

        return datalist;
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
                            jsonObject.put("field_ORGID",userDetails.getUser().getOrgId());
                        }
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

