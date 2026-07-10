package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.*;

@Service()
public class AppService {
    
    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private DatalistService dService;

    public List getPortalAppDatas(String apptype)  throws Throwable  
    {

        String sql = "select APPID,NAME,LOCATION,PID,SNUM,SNUMSUB from appportal where apptype=? order by snum asc,snumsub asc";
        List lreturn = datalistDao.getDatasWeb(sql, new Object[]{apptype});
        return lreturn;
    }

    @Transactional
    public int delDatas(String viewCode,String itemIDs,Object args[])  throws Throwable 
    {
        if(viewCode.equalsIgnoreCase("app"))
        {
            delAppPage(itemIDs);
        }
            
        JSONObject jPara = new JSONObject();
        WSoftUtil.dbUpdDataUpdTime(datalistDao, viewCode);
        return dService.delDatas(viewCode, itemIDs, jPara);
    }

    @Transactional
    public List updDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {

        String parentID = "";
        String appID = jsonObject.getString("field_APPID");
        if(jsonObject.containsKey("field_PID"))
        {
            parentID = jsonObject.getString("field_PID");
            if(parentID==null)
                parentID = "";
        }

        if(parentID.equals(""))
        {
            String sql = "";
            if(viewCode.equalsIgnoreCase("app"))
                sql = "update app set snum=? where pid=?";
            else
                sql = "update appportal set snum=? where pid=?";
            datalistDao.updDatas(sql, new Object[] {jsonObject.getString("field_SNUM"),appID});
            jsonObject.put("field_PID", null);
            jsonObject.put("field_SNUMSUB", 0);
        }
        else
        {
            jsonObject.put("field_SNUMSUB", jsonObject.getString("field_SNUM"));
        }

        List ltmp = dService.updDatas(viewCode, itemIDs, jsonObject);
        if(!parentID.equals(""))
        {
            String sql = "";
            String psnum=null;
            Map<String,Object> mp = new HashMap<>();
            sql = "select snum from app where appid=?";
            mp = datalistDao.getDataSingle(sql, new Object[]{parentID});
            if(mp!=null)
            {
                psnum = mp.get("snum").toString();
            }

            if(viewCode.equalsIgnoreCase("app"))
                sql = "update app set snum=? where appid=?";
            else
                sql = "update appportal set snum=? where appid=?";
            datalistDao.updDatas(sql, new Object[] {psnum,appID});
        }

        if(viewCode.equalsIgnoreCase("app"))
        {
            Map<String,Object> mreturn = (Map)ltmp.get(0);
            String msg = (String)mreturn.get("msg");
            if(msg.equalsIgnoreCase(""))
            {
                msg = addAppPage(appID,jsonObject);
                mreturn.put("msg",msg);
            }
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, viewCode);
        return ltmp;

    }

    @Transactional
    public List addDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {

        String parentID = "";
        if(jsonObject.containsKey("field_PID"))
        {
            parentID = jsonObject.getString("field_PID");
            if(!parentID.equals(""))
            {
                String sql ="";
                if(viewCode.equalsIgnoreCase("app"))
                    sql = "select snum from app where appid=?";
                else
                    sql = "select snum from appportal where appid=?";
                Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[] {parentID});
                jsonObject.put("field_SNUMSUB", jsonObject.get("field_SNUM"));
                jsonObject.put("field_SNUM", mp.get("SNUM"));
            }
        }

        if(parentID.equals(""))
        {
            jsonObject.put("field_SNUMSUB", "0");
            jsonObject.put("field_PID", null);
        }

        List ltmp = dService.addDatas(viewCode, jsonObject);

        if(viewCode.equalsIgnoreCase("app"))
        {
            Map<String,Object> mreturn = (Map)ltmp.get(0);
            String msg = (String)mreturn.get("msg");
            if(msg.equalsIgnoreCase(""))
            {
                String appID = jsonObject.getString("field_APPID");
                if(msg.equalsIgnoreCase(""))
                {
                    msg = addAppPage(appID,jsonObject);
                    mreturn.put("msg",msg);
                }
                else
                    mreturn.put("msg",msg); 
            }
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, viewCode);
        return ltmp;
    }

    @Transactional
    public String addAppPage(String appID,JSONObject jsonObject)  throws Throwable 
    {
        String msg="";
        String pageIDs = jsonObject.getString("PAGEIDS");
        String sql = "delete from app_page where appid =? " ;
        datalistDao.delDatas(sql, new Object[]{appID});
        if(pageIDs.equals(""))
            return msg;

        String[] sarrs = pageIDs.split(",");
        for(int i=0;i<sarrs.length;i++)
        {
            sql = "insert into app_page(appid,location) values(?,?)" ;
            datalistDao.addDatas(sql, new Object[]{appID,sarrs[i]});
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "app_page");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "role_app");
        return msg;

    }

    @Transactional
    public String delAppPage(String ID)  throws Throwable  
    {
        String msg="";
        String sql = "delete from app_page where appid in (select appid from app where id=?) " ;
        datalistDao.delDatas(sql, new Object[]{ID});

        sql = "delete from role_app where appid in (select appid from app where id=?) " ;
        datalistDao.delDatas(sql, new Object[]{ID});

        WSoftUtil.dbUpdDataUpdTime(datalistDao, "app_page");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "role_app");

        return msg;

    }
}

