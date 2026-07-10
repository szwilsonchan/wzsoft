package com.wzsoft.main;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.openjdk.nashorn.api.scripting.ScriptObjectMirror;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.openjdk.nashorn.api.scripting.ScriptObjectMirror;

/**
 * @Author 
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private ConfigService cService;

    @Autowired
    private RedisCache redisCache;

    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private DatalistService datalistService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        User user = new User();
        List psnlist = new ArrayList<>();
        if(!username.trim().equals(""))
        {
            // Use cache approach; commented out for now
            //psnlist = datalistDao.getUserDatas("select * from psn where isactive ='1' and (username =?  or email = ? or mobile = ?)", new Object[]{username,username,username});
            
            try
            {
                Object [] dpara=new Object[]{username,username,username};
                Map<String,Object> mr = new HashMap<>();
                mr.put("tblsdb", "psn");
                psnlist = datalistService.codeGetDatasCache("select PSNID,DEPTID,ORGID,DEPTNAME,ORGNAME,USERNAME,NAME,PASSWORD,EMAIL,MOBILE from psn where isactive ='1' and (username =?  or email = ? or mobile = ?)",dpara,null,mr);
            }
            catch(Throwable e)
            {
                throw new UsernameNotFoundException(e.getMessage());
            }
        }
        
        //System.out.println(username);
        if(psnlist.size()>=1)
        {
            Map<String,Object> mpsn = (Map)psnlist.get(0);
            Integer pID = Integer.parseInt(mpsn.get("PSNID").toString());
            
            Integer deptID = 0;
            if(mpsn.get("DEPTID")!=null)
                deptID = Integer.parseInt(mpsn.get("DEPTID").toString());

            Integer orgID = 0;
            if(mpsn.get("ORGID")!=null)
                orgID = Integer.parseInt(mpsn.get("ORGID").toString());

            user.setId(pID.longValue());
            user.setDeptId(deptID.longValue());
            user.setDeptName((String)mpsn.get("DEPTNAME"));
            user.setOrgId(orgID.longValue());
            user.setOrgName((String)mpsn.get("ORGNAME"));
            user.setUserName((String)mpsn.get("USERNAME"));
            user.setName((String)mpsn.get("NAME"));
            user.setPassword((String)mpsn.get("PASSWORD"));
            user.setEmail((String)mpsn.get("EMAIL"));
            user.setPhonenumber((String)mpsn.get("MOBILE"));

            // Direct query
            List lpsnrole = datalistDao.getUserDatas("select r.name as ROLENAME,p.PSNID,p.ROLEID,o.ORGID,o.name as ORGNAME from psn_role p join role r on p.roleid=r.roleid left join org o on p.orgid=o.orgid where p.psnid=? order by p.orgid,p.roleid asc", new Object[]{pID});
            
            /*
            List lpsnrole = new ArrayList<>();
            try
            {
                Object [] dpara=new Object[]{pID};
                Map<String,Object> mr = new HashMap<>();
                mr.put("tblsdb", "psn_role,role,org");
                lpsnrole = datalistService.codeGetDatasCache("select r.name as ROLENAME,p.PSNID,p.ROLEID,o.ORGID,o.name as ORGNAME from psn_role p join role r on p.roleid=r.roleid left join org o on p.orgid=o.orgid where p.psnid=? order by p.orgid,p.roleid asc",dpara,null,mr);
            }
            catch(Throwable e)
            {
                throw new UsernameNotFoundException(e.getMessage());
            }
            */
            
            user.setRolesAll(lpsnrole);

        }
        else
        {
            throw new RuntimeException("Invalid username or password");
        }

        UserLogin loginUser = new UserLogin();
        loginUser.setUser(user);
        return loginUser;
    }

    public void selRole(User user,String orgid,String roleid) throws Throwable 
    {
        // Use cache approach; commented out for now
        //List ld = datalistDao.getUserDatas("select DEPTID,NAME from dept where deptid =(select PID from dept where deptid=?)", new Object[]{user.getDeptId()});
        
        List psnrole = new ArrayList<>();
        List psnroleall = user.getRolesAll();
        for(int i=0;i<psnroleall.size();i++)
        {
            String orgidsub="";
            String roleidsub="";
            String orgnamesub="";
            Map<String,Object> mp = (Map)psnroleall.get(i);
            roleidsub = mp.get("ROLEID").toString();
            
            if(mp.get("ORGID")!=null)
            {
                orgidsub = mp.get("ORGID").toString();
            }
            if(orgid.equals(orgidsub)&&roleid.equals(roleidsub))
            {
                psnrole.add(mp);

                if(orgid!=null&&!orgid.equals(""))
                {
                    orgnamesub = mp.get("ORGNAME").toString();
                    List ld = new ArrayList<>();
                    Object [] dpara=new Object[]{user.getId(),orgid};
                    Map<String,Object> mr = new HashMap<>();
                    mr.put("tblsdb", "psn_org,dept");
                    ld = datalistService.codeGetDatasCache("select pg.DEPTID,d.NAME from psn_org pg join dept d on pg.deptid=d.deptid where pg.psnid=? and pg.orgid=?",dpara,null,mr);
                    if(ld.size()>0)
                    {
                        Map<String,Object> mdept = (Map)ld.get(0);
                        user.setDeptId(Long.valueOf(mdept.get("DEPTID").toString()));
                        user.setDeptName(mdept.get("NAME").toString());
                    }
                    user.setOrgId(Long.valueOf(orgid));
                    user.setOrgName(orgnamesub);
                }

                break;
            }
        }

        if(psnrole.size()==0)
        {
            return;
        }
        else
        {
            user.setRoles(psnrole);
        }

        Object [] dpara=new Object[]{user.getDeptId()};
        Map<String,Object> mr = new HashMap<>();
        mr.put("tblsdb", "dept");
        List ld = datalistService.codeGetDatasCache("select DEPTID,NAME from dept where deptid =(select PID from dept where deptid=?)",dpara,null,mr);
        if(ld.size()>0)
        {
            Map<String,Object> mdept = (Map)ld.get(0);
            user.setParentDeptId(Long.valueOf(mdept.get("DEPTID").toString()));
            user.setParentDeptName(mdept.get("NAME").toString());
        }
        else
        {
            user.setParentDeptId(Long.valueOf(0));
            user.setParentDeptName("");
        }

        if(roleid.equals("2"))
        {
            List lorgrole=null;
            String sql = "select ROLEID,NAME from role where isorg='1' or roleid in (select roleid from org_role where orgid=?)";
            lorgrole = datalistDao.getUserDatas(sql, new Object[]{user.getOrgId()});
            
            String orgroles="";
            for(int i=0;i<lorgrole.size();i++)
            {
                Map<String,Object> mp = (Map)lorgrole.get(i);
                orgroles = orgroles + mp.get("ROLEID").toString()+",";
            }
            if(!orgroles.equals(""))
            {
                user.setRolesOrg(WSoftUtil.strDelLastComma(orgroles));
            }
        }

        user.setRoleIDs(roleid);

        if(!roleid.equalsIgnoreCase(""))
        {
            List lroleapppc = datalistDao.getUserDatas("select distinct a.APPID,a.NAME,a.LOCATION,a.IMG,a.IMGSEL,a.PID,a.SNUM,a.SNUMSUB from role_app r,app a where a.apptype='1' and r.appid=a.appid and r.roleid in ("+ roleid +") order by a.snum asc,a.snumsub", new Object[]{});
            user.setRoleAppPc(lroleapppc);
            
            List lroleappmobile = datalistDao.getUserDatas("select distinct a.APPID,a.NAME,a.LOCATION,a.IMG,a.IMGSEL,a.PID,a.SNUM,a.SNUMSUB from role_app r,app a where a.apptype='2' and r.appid=a.appid and r.roleid in ("+ roleid +") order by a.snum asc,a.snumsub", new Object[]{});
            user.setRoleAppMobile(lroleappmobile);

            List lpage = datalistDao.getUserDatas("select a.LOCATION from role_app r,app_page a where r.appid=a.appid and r.roleid in ("+ roleid +") ", new Object[]{});

            List lroledataview = datalistDao.getUserDatas("select rd.VIEWCODE,d.LOCATION from role_dataview rd left join data_form d on rd.viewcode=d.tablename where  rd.roleid in ("+ roleid +") ", new Object[]{});
            user.setRoleDataView(lroledataview);
            
            for(int j=0;j<lroledataview.size();j++)
            {
                Map<String,Object> mroledataview = (Map)lroledataview.get(j);
                Map mpage=new HashMap<>();
                if(mroledataview.get("LOCATION")!=null)
                {
                    String strLocation = (String)mroledataview.get("LOCATION");
                    strLocation = "form_" + strLocation;
                    mpage.put("LOCATION",strLocation);
                }
                lpage.add(mpage);
            }
            user.setRolePage(lpage);
        }
    }

    public String codeThirdLogin(User user,JSONObject jsonObject) throws Throwable 
    {

        String strCode="";
        strCode=cService.getConfigLoginThirdCode();

        Map<String,String> mpSource = new HashMap<>();
        mpSource.put("source","");
        WSoftUtil.codeGetSources(datalistService, strCode, mpSource, false,redisCache);
        String strSource = mpSource.get("source");

        if(strSource.trim().equals(""))
            return "";

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript"); 
        
        Bindings bind = engine.createBindings();  
        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);

        Map<String,Object> mapPara = new HashMap<>();
        mapPara.put("_returnVal_","");
        Set<String> jsonset = jsonObject.keySet();
        for (String key : jsonset) 
        {
            if(key.indexOf("pageParam_")==0)
            {
                mapPara.put(key,jsonObject.get(key));
            }
        }

        bind.put("mapPara", mapPara); 
        bind.put("datalistService", datalistService); 
        
        try 
        {
            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
            CompiledScript script = ((Compilable) engine).compile(strSource);
            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
            //engine.eval(strSource); 

            Object revalue=mapPara.get("_returnVal_");
            if(revalue!=null&&(!revalue.toString().equals("")))
            {
                return JSON.toJSONString(revalue);
            }

        } catch (Exception e) 
        {  
            e.printStackTrace();
            String strError = "[CodeID]"+strCode+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
            throw new RuntimeException("Third-party login code error:"+strError);
        } 
        return "";
    }

    public String codeThirdRefLogin(User user,JSONObject jsonObject) throws Throwable 
    {

        String strCode="";
        strCode=cService.getConfigLoginThirdRefCode();

        Map<String,String> mpSource = new HashMap<>();
        mpSource.put("source","");
        WSoftUtil.codeGetSources(datalistService, strCode, mpSource, false,redisCache);
        String strSource = mpSource.get("source");

        if(strSource.trim().equals(""))
            return "";

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript"); 
        
        Bindings bind = engine.createBindings();  
        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);

        Map<String,Object> mapPara = new HashMap<>();
        mapPara.put("_returnVal_","");
        Set<String> jsonset = jsonObject.keySet();
        for (String key : jsonset) 
        {
            if(key.indexOf("pageParam_")==0)
            {
                mapPara.put(key,jsonObject.get(key));
            }
        }

        mapPara.put("visitorId",user.getId());
        mapPara.put("visitorDeptId",user.getDeptId());
        mapPara.put("visitorOrgId",user.getOrgId());
        mapPara.put("visitorRoles",user.getRoleIDs());
        
        bind.put("mapPara", mapPara); 
        bind.put("datalistService", datalistService); 
        
        try 
        {
            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
            CompiledScript script = ((Compilable) engine).compile(strSource);
            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
            //engine.eval(strSource); 

            Object revalue=mapPara.get("_returnVal_");
            if(revalue!=null&&(!revalue.toString().equals("")))
            {
                return JSON.toJSONString(revalue);
            }

        } catch (Exception e) 
        {  
            e.printStackTrace();
            String strError = "[CodeID]"+strCode+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
            throw new RuntimeException("Third-party login associated code error:"+strError);
        } 
        return "";
    }

    // This method is paused
    private List codeSelOrgRole(User user,List rolelist,String strCode) throws Throwable 
    {

        if(strCode==null||strCode.equals(""))
            return rolelist;

        Map<String,String> mpSource = new HashMap<>();
        mpSource.put("source","");
        WSoftUtil.codeGetSources(datalistService, strCode, mpSource, false,redisCache);
        String strSource = mpSource.get("source");

        if(strSource.trim().equals(""))
            return rolelist;

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript"); 
        
        Bindings bind = engine.createBindings();  
        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
        Map<String,Object> mapPara = new HashMap<>();
        mapPara.put("_returnVal_","");
        mapPara.put("visitorId",user.getId());
        mapPara.put("visitorDeptId",user.getDeptId());
        mapPara.put("visitorOrgId",user.getOrgId());

        bind.put("mapPara", mapPara); 
        bind.put("datalistService", datalistService); 
        
        try 
        {
            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
            CompiledScript script = ((Compilable) engine).compile(strSource);
            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
            //engine.eval(strSource); 

            Object revalue=mapPara.get("_returnVal_");
            if(revalue!=null&&(!revalue.toString().equals("")))
            {
                Class cls = revalue.getClass();
                if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
                {
                    ScriptObjectMirror jsOriginal = (ScriptObjectMirror)revalue;
                    if (jsOriginal.isArray()) 
                    {
                        Integer length = (Integer)jsOriginal.get("length");
                        for (int i = 0; i < length; i++) {
                            rolelist.add(jsOriginal.get(""+Integer.toString(i)));
                        }
                    }
                }
                else if(cls.getName().equals("java.util.ArrayList"))
                {
                    List lsub = (List)revalue;
                    for (int i = 0; i < lsub.size(); i++) {
                        rolelist.add(lsub.get(i));
                    }
                }
            }
        } catch (Exception e) 
        {  
            e.printStackTrace();
            String strError = "[CodeID]"+strCode+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
            throw new RuntimeException("Error getting org role:"+strError);
        } 
        return rolelist;
    }
}


