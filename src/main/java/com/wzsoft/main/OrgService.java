package com.wzsoft.main;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.alibaba.fastjson.JSONObject;

@Service()
public class OrgService {
    
    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private DatalistService dService;

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
        
        if (WSoftUtil.isAdmin(userDetails))
        {
            String sql="";
            if(WSoftUtil.dbSqlIsSqlserver())
                sql = "select ROLEID,NAME from role where [open]=1 and isorg='0'  order by roleid";
            else
                sql = "select ROLEID,NAME from role where open=1  and isorg='0' order by roleid";
            List lrole = dService.getDatasBySql(sql, new Object[]{});
            lreturn.add(lrole);
        }
        
        return lreturn;
    }
    
    @Transactional
    public int delDatas(String viewCode,String itemIDs,JSONObject jsonObject)   throws Throwable  
    {
        String sql = "delete from org_role where orgid =? " ;
        datalistDao.delDatas(sql, new Object[]{itemIDs});

        JSONObject jPara = new JSONObject();
        return dService.delDatas(viewCode, itemIDs, jPara);
    }

    @Transactional
    public String addOrgRole(String orgID,JSONObject jsonObject)  throws Throwable 
    {
        String msg="";

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }

        if(!WSoftUtil.isAdmin(userDetails))
        {
            msg="No Rights";
            return msg;
        }

        String roleIDs = jsonObject.getString("ROLEIDS");
        String sql = "delete from org_role where orgid =? " ;
        datalistDao.delDatas(sql, new Object[]{orgID});

        if(!(jsonObject.containsKey("ROLEIDS")&&jsonObject.getString("ROLEIDS").trim()!=""))
            return msg;

        String[] sarrs = roleIDs.split(",");
        for(int i=0;i<sarrs.length;i++)
        {
            sql = "insert into org_role(orgid,roleid) values(?,?)";
            datalistDao.addDatas(sql, new Object[]{orgID,sarrs[i]});
        }

        return msg;

    }

    @Transactional
    public List getDataItem(String viewCode,String itemIDs,JSONObject jsonObject)   throws Throwable  
    {
        List lreturn = dService.getDataItem(viewCode, itemIDs, jsonObject,false);

        String sql = "select ROLEID from org_role where orgid=?";
        List lrole = datalistDao.getDatas(sql, new Object[]{itemIDs});
        lreturn.add(lrole);
        return lreturn;
    }

    @Transactional
    public List updDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {

        List datalist =  dService.updDatas(viewCode, itemIDs, jsonObject);

        Map<String,Object> mreturn = (Map)datalist.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            msg = addOrgRole(itemIDs,jsonObject);
            mreturn.put("msg",msg);
        }

        return datalist;
    }

    @Transactional
    public List addDatas(String viewCode,JSONObject jsonObject)  throws Throwable 
    {

        List datalist = dService.addDatas(viewCode,jsonObject);

        Map<String,Object> mreturn = (Map)datalist.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            Integer orgID = (Integer)mreturn.get("pid");
            msg = addOrgRole(Integer.toString(orgID),jsonObject);
            mreturn.put("msg",msg);
        }
        return datalist;
    }

}
