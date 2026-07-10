package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.*;

@Service()
public class RoleService {
    
    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private DatalistService dService;

    @Transactional
    public int delDatas(String viewCode,String itemIDs,Object args[])  throws Throwable 
    {
        delRoleApp(itemIDs);
        delRoleDataview(itemIDs);

        WSoftUtil.dbUpdDataUpdTime(datalistDao, viewCode);

        JSONObject jPara = new JSONObject();
        return dService.delDatas(viewCode, itemIDs, jPara);
    }

    @Transactional
    public List updDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        List ltmp = dService.updDatas(viewCode, itemIDs, jsonObject);

        String roleID = jsonObject.getString("field_ROLEID");
        Map<String,Object> mreturn = (Map)ltmp.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            msg = addRoleApp(roleID,jsonObject);
            mreturn.put("msg",msg);

            msg = addRoleDataview(roleID,jsonObject);
            mreturn.put("msg",msg);
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, viewCode);
        return ltmp;

    }

    @Transactional
    public List addDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        List ltmp = dService.addDatas(viewCode, jsonObject);

        Map<String,Object> mreturn = (Map)ltmp.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            String roleID = jsonObject.getString("field_ROLEID");
            if(msg.equalsIgnoreCase(""))
            {
                msg = addRoleApp(roleID,jsonObject);
                mreturn.put("msg",msg);

                msg = addRoleDataview(roleID,jsonObject);
                mreturn.put("msg",msg);
            }
            else
                mreturn.put("msg",msg); 
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, viewCode);
        return ltmp;
    }

    @Transactional
    public String addRoleApp(String roleID,JSONObject jsonObject)  throws Throwable 
    {
        String msg="";
        String appIDs = jsonObject.getString("APPIDS");
        String sql = "delete from role_app where roleid =? " ;
        datalistDao.delDatas(sql, new Object[]{roleID});

        if(!appIDs.equals(""))
        {
            String[] sarrs = appIDs.split(",");
            for(int i=0;i<sarrs.length;i++)
            {
                sql = "insert into role_app(roleid,appid) values(?,?)" ;
                datalistDao.addDatas(sql, new Object[]{roleID,sarrs[i]});
            }
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "role_app");
        return msg;

    }

    @Transactional
    public String delRoleApp(String ID)  throws Throwable 
    {
        String msg="";
        String sql = "delete from role_app where roleid in (select roleid from role where id=?) " ;
        datalistDao.delDatas(sql, new Object[]{ID});
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "role_app");
        return msg;

    }

    @Transactional
    public String addRoleDataview(String roleID,JSONObject jsonObject)  throws Throwable 
    {
        String msg="";
        String viewCodes = jsonObject.getString("VIEWCODES");
        String sql = "delete from role_dataview where roleID =? " ;
        datalistDao.delDatas(sql, new Object[]{roleID});

        if(!viewCodes.equals(""))
        {
            String[] sarrs = viewCodes.split(",");
            for(int i=0;i<sarrs.length;i++)
            {
                sql = "insert into role_dataview(roleid,viewcode) values(?,?)" ;
                datalistDao.addDatas(sql, new Object[]{roleID,sarrs[i]});
            }
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "role_dataview");
        return msg;

    }

    @Transactional
    public String delRoleDataview(String ID)  throws Throwable 
    {
        String msg="";
        String sql = "delete from role_dataview where roleid in (select roleid from role where id=?) " ;
        datalistDao.delDatas(sql, new Object[]{ID});
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "role_dataview");
        return msg;

    }
}


