package com.wzsoft.main;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service()
public class ConfigService {
    
    @Autowired
    private DatalistDao datalistDao;

    public Map<String,Object> getConfig()  throws Throwable  
    {
        String sql = "select * from config where id=1";
        return datalistDao.getDataSingle(sql, new Object[]{});
    }

    public String getConfigAmode()  throws Throwable  
    {
        String sql = "select ACTIVEMODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            return mp.get("ACTIVEMODE").toString();
        }
        return "";
    }

    public String getConfigRegmode()  throws Throwable  
    {
        String sql = "select REGMODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            return mp.get("REGMODE").toString();
        }
        return "";
    }

    public String getConfigRegPsnRole()  throws Throwable  
    {
        String sql = "select REGPSNROLE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("REGPSNROLE")!=null)
                return String.valueOf(mp.get("REGPSNROLE"));
            else
                return "";
        }
        return "";
    }

    public String getConfigRegOrgRole()  throws Throwable  
    {
        String sql = "select REGORGROLE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("REGORGROLE")!=null)
                return String.valueOf(mp.get("REGORGROLE"));
            else
                return "";
        }
        return "";
    }

    public String getConfigOrgRoleCode()  throws Throwable  
    {
        String sql = "select ORGROLECODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("ORGROLECODE")!=null)
                return mp.get("ORGROLECODE").toString();
        }
        return "";
    }

    public String getConfigRegOrgCode()  throws Throwable  
    {
        String sql = "select REGORGCODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("REGORGCODE")!=null)
                return mp.get("REGORGCODE").toString();
        }
        return "";
    }

    public String getConfigRegPsnCode()  throws Throwable  
    {
        String sql = "select REGPSNCODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("REGPSNCODE")!=null)
                return mp.get("REGPSNCODE").toString();
        }
        return "";
    }

    public String getConfigUpdPsnCode()  throws Throwable  
    {
        String sql = "select UPDPSNCODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("UPDPSNCODE")!=null)
                return mp.get("UPDPSNCODE").toString();
        }
        return "";
    }

    public String getConfigLoginThirdCode()  throws Throwable  
    {
        String sql = "select LOGINTHIRDCODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("LOGINTHIRDCODE")!=null)
                return mp.get("LOGINTHIRDCODE").toString();
        }
        return "";
    }

    public String getConfigLoginThirdRefCode()  throws Throwable  
    {
        String sql = "select LOGINTHIRDREFCODE from config where id=1";
        Map<String,Object> mp = new HashMap<>();
        mp=datalistDao.getDataSingle(sql, new Object[]{});
        if(mp!=null)
        {
            if(mp.get("LOGINTHIRDREFCODE")!=null)
                return mp.get("LOGINTHIRDREFCODE").toString();
        }
        return "";
    }

}
