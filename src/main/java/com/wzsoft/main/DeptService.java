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
public class DeptService {
    
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
        
        String sql = "";
        if(WSoftUtil.isOrgAdmin(userDetails))
        {
            sql = "select ROLEID,NAME from role where roleid in ("+ userDetails.getUser().getRolesOrg() +") order by roleid";
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
    public int delDatas(String viewCode,String itemIDs,JSONObject jsonObject)   throws Throwable  
    {
        String sql = "delete from dept_role where deptid =? " ;
        datalistDao.delDatas(sql, new Object[]{itemIDs});

        JSONObject jPara = new JSONObject();
        return dService.delDatas(viewCode, itemIDs, jPara);
    }

    @Transactional
    public String addDeptRole(String deptID,JSONObject jsonObject)  throws Throwable 
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

        if(WSoftUtil.isDeptAdmin(userDetails)&&deptID.equals(String.valueOf(userDetails.getUser().getDeptId())))
        {
            return msg;
        }

        String roleIDs = jsonObject.getString("ROLEIDS");
        String sql = "delete from dept_role where deptid =? " ;
        datalistDao.delDatas(sql, new Object[]{deptID});

        String[] sarrs = roleIDs.split(",");
        String orgroles = ","+ userDetails.getUser().getRolesOrg() + ",";
        for(int i=0;i<sarrs.length;i++)
        {
            if(WSoftUtil.isOrgAdmin(userDetails))
            {
                String roleid=","+ sarrs[i] + ",";
                if(orgroles.indexOf(roleid)>=0)
                {
                    sql = "insert into dept_role(deptid,roleid) select ?,roleid from role where roleid=?" ;
                    datalistDao.addDatas(sql, new Object[]{deptID,sarrs[i]});
                }
            }
            else if (WSoftUtil.isDeptAdmin(userDetails))
            {
                sql = "insert into dept_role(deptid,roleid) select ?,roleid from role where roleid=? and roleid in (select roleid from dept_role where deptid="+ userDetails.getUser().getDeptId() +") " ;
                datalistDao.addDatas(sql, new Object[]{deptID,sarrs[i]});
            }
            else if(WSoftUtil.isAdmin(userDetails))
            {
                sql = "insert into dept_role(deptid,roleid) values(?,?)";
                datalistDao.addDatas(sql, new Object[]{deptID,sarrs[i]});
            }
            else 
                return msg;
        }

        return msg;

    }

    @Transactional
    public List getDataItem(String viewCode,String itemIDs,JSONObject jsonObject)   throws Throwable  
    {
        List lreturn = dService.getDataItem(viewCode, itemIDs, jsonObject,false);

        String sql = "select ROLEID from dept_role where deptid=?";
        List lrole = datalistDao.getDatas(sql, new Object[]{itemIDs});
        lreturn.add(lrole);
        return lreturn;
    }

    @Transactional
    public List updDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {

        List datalist =  dService.updDatas(viewCode, itemIDs, jsonObject);

        String sql="";
        Map<String,Object> mp = new HashMap<>();
        if(!itemIDs.trim().equals(""))
        {
            sql = "select snum from dept where deptid=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{itemIDs});
            if(mp!=null)
            {
                String snum = String.valueOf(mp.get("snum"));
                sql = "update dept set snum=? where pid=? ";
                datalistDao.updDatas(sql, new Object[]{snum,itemIDs});
            }
        }

        Map<String,Object> mreturn = (Map)datalist.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            msg = addDeptRole(itemIDs,jsonObject);
            mreturn.put("msg",msg);
        }

        return datalist;
    }

    @Transactional
    public List addDatas(String viewCode,JSONObject jsonObject)  throws Throwable 
    {

        String PID = "";
        if(jsonObject.containsKey("field_PID"))
            PID = jsonObject.getString("field_PID");

        String sql="";
        Map<String,Object> mp = new HashMap<>();
        if(!PID.trim().equals(""))
        {
            sql = "select snum from dept where deptid=? ";
            mp = datalistDao.getDataSingle(sql, new Object[]{PID});
            if(mp!=null)
            {
                String snum = String.valueOf(mp.get("snum"));
                jsonObject.put("field_SNUM", snum);
            }
        }

        List datalist = dService.addDatas(viewCode,jsonObject);

        Map<String,Object> mreturn = (Map)datalist.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            Integer deptID = (Integer)mreturn.get("pid");
            msg = addDeptRole(Integer.toString(deptID),jsonObject);
            mreturn.put("msg",msg);
        }
        return datalist;
    }

}
