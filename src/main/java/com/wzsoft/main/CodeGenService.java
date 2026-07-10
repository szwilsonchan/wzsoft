package com.wzsoft.main;

import org.apache.http.client.HttpClient;
import org.openjdk.nashorn.api.scripting.ScriptObjectMirror;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
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
import javax.servlet.http.HttpServletRequest;

import com.alibaba.fastjson.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@Service()
public class CodeGenService  
{
    
    @Autowired
    private RedisCache redisCache;

    @Autowired
    private DatalistService datalistService;

    @Autowired
    private DatalistDao datalistDao;

    public void codeTask()  throws Throwable
    {
        String sql = "select * from code where codemode='2' and taskstart='1'";
        List lcode = datalistDao.getDatas(sql, new Object[]{});
        for(int j=0;j<lcode.size();j++)
        {
            Map<String,Object> mp=(Map)lcode.get(j);
            String codeid=WSoftUtil.getStrValue(mp.get("guid"));
            String taskmode=WSoftUtil.getStrValue(mp.get("taskmode"));
            String taskinterval=WSoftUtil.getStrValue(mp.get("taskinterval"));
            String taskdaytime=WSoftUtil.getStrValue(mp.get("taskdaytime"));
            String taskweek=WSoftUtil.getStrValue(mp.get("taskweek"));
            String taskmonth=WSoftUtil.getStrValue(mp.get("taskmonth"));
            String taskyear=WSoftUtil.getStrValue(mp.get("taskyear"));

            Map<String,String> mpSource = new HashMap<>();
            mpSource.put("source","");
            WSoftUtil.codeGetSources(datalistService, codeid, mpSource, false,redisCache);
            String source = mpSource.get("source");

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            java.sql.Timestamp dtRun = null;
            if(mp.get("tasklastrun")!=null)
            {
                dtRun=WSoftUtil.dbSqlDateFromDb(mp.get("tasklastrun"));
            }

            Boolean bRun = false;
            if(taskdaytime.equals(""))
            {
                taskdaytime = "00:00:00";
            }
            Date dtStart = sdf.parse( WSoftUtil.dateCurrent() + " " + taskdaytime);
            Date dtNow = new Date();
            Calendar calendarNow = Calendar.getInstance();
            calendarNow.setTime(dtNow);

            if(taskmode.equals("1")&&dtRun==null)
            {
                bRun=true;
            }
            else if(taskmode.equals("2"))
            {
                if(taskinterval.equals("1"))
                {
                    if(dtRun!=null)
                    {
                        Calendar calendarRun = Calendar.getInstance();
                        calendarRun.setTime(dtRun);

                        if(!(calendarNow.get(Calendar.YEAR)==calendarRun.get(Calendar.YEAR)
                        &&calendarNow.get(Calendar.MONTH)==calendarRun.get(Calendar.MONTH)
                        &&calendarNow.get(Calendar.DAY_OF_MONTH)==calendarRun.get(Calendar.DAY_OF_MONTH)
                        &&calendarNow.get(Calendar.HOUR_OF_DAY)==calendarRun.get(Calendar.HOUR_OF_DAY)))
                        {
                            dtRun=null;
                        }
                    }

                    if(dtRun==null)
                    {
                        bRun=true;
                    }
                }
                else if(taskinterval.equals("2"))
                {
                    if(dtRun!=null)
                    {
                        Calendar calendarRun = Calendar.getInstance();
                        calendarRun.setTime(dtRun);

                        if(!(calendarNow.get(Calendar.YEAR)==calendarRun.get(Calendar.YEAR)
                        &&calendarNow.get(Calendar.MONTH)==calendarRun.get(Calendar.MONTH)
                        &&calendarNow.get(Calendar.DAY_OF_MONTH)==calendarRun.get(Calendar.DAY_OF_MONTH)))
                        {
                            dtRun=null;
                        }
                    }

                    if(dtRun==null&&dtNow.getTime()>dtStart.getTime())
                    {
                        bRun=true;
                    }
                }
                else if(taskinterval.equals("3"))
                {
                    if(dtRun!=null)
                    {
                        Calendar calendarRun = Calendar.getInstance();
                        calendarRun.setTime(dtRun);

                        if(!(calendarNow.get(Calendar.YEAR)==calendarRun.get(Calendar.YEAR)
                        &&calendarNow.get(Calendar.MONTH)==calendarRun.get(Calendar.MONTH)
                        &&calendarNow.get(Calendar.WEEK_OF_MONTH)==calendarRun.get(Calendar.WEEK_OF_MONTH)))
                        {
                            dtRun=null;
                        }
                    }
                    if(dtRun==null&&dtNow.getTime()>dtStart.getTime())
                    {
                        if(calendarNow.get(Calendar.DAY_OF_WEEK)==Integer.valueOf(taskweek))
                            bRun=true;
                    }
                }
                else if(taskinterval.equals("4"))
                {
                    if(dtRun!=null)
                    {
                        Calendar calendarRun = Calendar.getInstance();
                        calendarRun.setTime(dtRun);

                        if(!(calendarNow.get(Calendar.YEAR)==calendarRun.get(Calendar.YEAR)
                        &&calendarNow.get(Calendar.MONTH)==calendarRun.get(Calendar.MONTH)))
                        {
                            dtRun=null;
                        }
                    }
                    if(dtRun==null&&dtNow.getTime()>dtStart.getTime())
                    {
                        if(calendarNow.get(Calendar.DAY_OF_MONTH)==Integer.valueOf(taskmonth))
                            bRun=true;
                    }
                }
                else if(taskinterval.equals("5"))
                {
                    if(dtRun!=null)
                    {
                        Calendar calendarRun = Calendar.getInstance();
                        calendarRun.setTime(dtRun);

                        if(!(calendarNow.get(Calendar.YEAR)==calendarRun.get(Calendar.YEAR)))
                        {
                            dtRun=null;
                        }
                    }
                    if(dtRun==null&&dtNow.getTime()>dtStart.getTime())
                    {
                        if((calendarNow.get(Calendar.MONTH)+1)==Integer.valueOf(taskyear)&&calendarNow.get(Calendar.DAY_OF_MONTH)==Integer.valueOf(taskmonth))
                            bRun=true;
                    }
                }
            }

            if(bRun)
            {
                codeTaskDo(codeid,source);
            }
        }
    }

    @Transactional
    public void codeTaskDo(String codeid,String source)  throws Throwable
    {
        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");

        Bindings bind = engine.createBindings();  
        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
        Map<String,Object> mapPara = new HashMap<>();
        bind.put("mapPara", mapPara); 
        bind.put("datalistService", datalistService); 
        
        source = WSoftUtil.codeGetConfig("gCodeFunc", redisCache) + ";function codedo(){" + source + "};codedo();";

        try 
        {  
            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
            CompiledScript script = ((Compilable) engine).compile(source);
            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
            //engine.eval(source); 

            String sql = "update code set tasklastrun="+ WSoftUtil.dbSqlSysdate() +" where guid=?";
            datalistDao.updDatas(sql, new Object[]{codeid});

        } catch (Exception e) 
        {  
            e.printStackTrace();
            String strError = "[CodeID]"+codeid+"[Source]"+source+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
            WSoftUtil.saveErrorLogFile(e,strError,datalistService);
            throw new RuntimeException("Code execution error:"+strError);
        }
    }

    @Transactional
    public Map<String,Object> codeDo(String itemIDs,JSONObject jsonObject,HttpServletRequest request)  throws Throwable
    {
        if(itemIDs==null||itemIDs.trim().equals(""))
            return null;

        String sql = "";
        if(jsonObject.containsKey("ispub")&&jsonObject.getString("ispub").equals("1"))
            sql = "select * from code where codemode='1' and ispub='1' and guid=?";
        else
            sql = "select * from code where  codemode='1' and guid=?";

        Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[]{itemIDs});
        if(mp==null)
            return mp;

        UserLogin userDetails=null;
        if(SecurityContextHolder.getContext().getAuthentication()!=null&&!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }

        String guid = (String)mp.get("guid");
        String ispub = (String)mp.get("ispub");
        if(ispub.equals("0")&&userDetails==null)
        {
            return null;
        }

        Map<String,String> mpSource = new HashMap<>();
        mpSource.put("source","");
        WSoftUtil.codeGetSources(datalistService, guid, mpSource, false,redisCache);
        String source = mpSource.get("source");

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");

        Bindings bind = engine.createBindings();  
        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
        Map<String,Object> mapPara = new HashMap<>();

        String strPara = "";
        Set<String> jsonset = jsonObject.keySet();
        for (String key : jsonset) 
        {
            if(key.indexOf("_")>0)
            {
                mapPara.put(key,jsonObject.get(key));
                if(key.indexOf("para_")==0)
                    strPara = strPara + "var " + key.substring(5) + "=gvalnum(mapPara['" + key + "']);";
            }
        }

        mapPara.put("_returnVal_","");
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
            mapPara.put("visitorRoles","");
        }

        bind.put("mapPara", mapPara); 
        bind.put("datalistService", datalistService); 
        bind.put("mRequest", request); 
        
        source = WSoftUtil.codeGetConfig("gCodeFunc", redisCache) + ";mapPara['_returnVal_']=func"+ guid +"();function func" + guid +"(){" + strPara + ";" +  source + "};";

        try 
        {  
            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
            CompiledScript script = ((Compilable) engine).compile(source);
            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
            //engine.eval(source); 

            Map<String,Object> mrp = new HashMap<>();
            Object revalue = mapPara.get("_returnVal_");

            //try
            //{
            //    Map<String,Object> mr = (Map<String,Object>)revalue;
            //    mrp.put("returnvalue",mr);
            //    return mrp;
            //}
            //catch (Exception me)
            //{
            //}

            Class cls = revalue.getClass();
            if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
            {
                ScriptObjectMirror jsOriginal = (ScriptObjectMirror)revalue;
                if (jsOriginal.isArray()) 
                {
                    List<Object> lsub = new ArrayList<>();
                    Integer length = (Integer)jsOriginal.get("length");
                    for (int i = 0; i < length; i++) {
                        lsub.add(jsOriginal.get(""+Integer.toString(i)));
                    }
                    revalue = lsub;
                }
                else
                {
                    ScriptObjectMirror jsObj = (ScriptObjectMirror)revalue;
                    try
                    {
                        Double timestampLocalTime = (Double)jsObj.callMember("getTime");
                        long time = WSoftUtil.convertDouble2Long(timestampLocalTime);
                        java.sql.Timestamp sDate = null;
                        sDate = new java.sql.Timestamp(time);
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                        String strDate = sdf.format(sDate);
                        revalue = strDate;
                    }
                    catch (Exception e) 
                    {

                    }
                }
            }
            mrp.put("returnvalue",revalue);
            return mrp;

        } catch (Exception e) 
        {  
            e.printStackTrace();
            String strError = "[CodeID]"+itemIDs+"[Source]"+source+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
            throw new RuntimeException("Code execution error:"+strError);
        }
    }

    @NonNull
    public String codeDeal(JSONObject comCode,String codeName,Map<String,String> comAttrsField,boolean noFunc,Map<String,String> mfuncs)  throws Throwable 
    {
        String strJSContent="";
        if(!noFunc)
        {
            //Splice into common function only when actually running
            strJSContent = ";function codedo(){";
        }
        if(!comCode.containsKey(codeName))
            return "";
        
        List<Object> lvars=null;
        Map<String,Object> mvars=new HashMap<>();
        List<Object> lcode = (List<Object>)comCode.get(codeName);
        for(int i=0;i<lcode.size();i++)
        {
            Map<String,Object> config=(Map)lcode.get(i);
            String strType=(String)config.get("type");
            if(strType.equalsIgnoreCase("def"))
            {
                lvars=(List<Object>)config.get("para");
                for(int k=0;k<lvars.size();k++)
                {
                    Map<String,String> mv=(Map)lvars.get(k);
                    String vt = mv.get("type");
                    String vpt = mv.get("ptype");
                    String vn = mv.get("key");
                    mvars.put(vn, mv);

                    if(vpt.equals("")&&vt.equalsIgnoreCase("str")&&vn.indexOf(".")<0)
                    {
                        strJSContent = strJSContent + " var "+ vn + "='';";
                    }
                    else if(vpt.equals("")&&vt.equalsIgnoreCase("sql")&&vn.indexOf(".")<0)
                    {
                        strJSContent = strJSContent + " var "+ vn + "={};";
                    }
                    else if(vpt.equals("")&&vt.equalsIgnoreCase("obj")&&vn.indexOf(".")<0)
                    {
                        strJSContent = strJSContent + " var "+ vn + "={};";
                    }
                    else if(vpt.equals("")&&vt.equalsIgnoreCase("objlist")&&vn.indexOf(".")<0)
                    {
                        strJSContent = strJSContent + " var "+ vn + "=[];";
                    }

                }
            }

            strJSContent = strJSContent + getSubCodesFunc(strType,config,mvars,"[global]",comAttrsField,mfuncs,"");
            strJSContent = strJSContent + ";";

        }
        if(!noFunc)
        {
            strJSContent = strJSContent  + ";return ''};mapPara['_returnVal_']=codedo();";
        }
        return strJSContent;
    }

    private String getSubCodesFunc(String strType,Map<String,Object> config,Map<String,Object>  mvars,String forListName,Map<String,String> comAttrsField,Map<String,String>  mfuncs,String vi) throws Throwable
    {
        String strJSContent = "";
        if(strType.equalsIgnoreCase("assign"))
        {
            strJSContent = strJSContent + getAssignString(config,mvars,forListName,comAttrsField,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("insObjlist"))
        {
            strJSContent = strJSContent + getInsObjlistString(config,mvars,forListName,comAttrsField,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("assignDb"))
        {
            strJSContent = strJSContent + getAssignDbString(config,mvars,forListName,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("subcode"))
        {
            strJSContent = strJSContent + getSubCodeString(config,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("msg"))
        {
            strJSContent = strJSContent + getMsgString(config,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("subcodeJS"))
        {
            strJSContent = strJSContent + getSubCodeJSString(config,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("updDb"))
        {
            strJSContent = strJSContent + getUpdDbString(config,mvars,forListName,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("delDb"))
        {
            strJSContent = strJSContent + getDelDbString(config,mvars,forListName,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("insDb"))
        {
            strJSContent = strJSContent + getInsDbString(config,mvars,forListName,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("assignSqlFilter"))
        {
            strJSContent = strJSContent + getAssignDbString(config,mvars,forListName,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("if"))
        {
            strJSContent = strJSContent + getIfString(config,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("jsHref"))
        {
            strJSContent = strJSContent + getjsHrefString(config,mvars,forListName,comAttrsField,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("jsSrc"))
        {
            strJSContent = strJSContent + getjsSrcString(config,mvars,forListName,comAttrsField,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("for"))
        {
            strJSContent = strJSContent + getForString(config,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("while"))
        {
            strJSContent = strJSContent + getWhileString(config,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        else if(strType.equalsIgnoreCase("outSvr"))
        {
            strJSContent = strJSContent + getOutSvrString(config,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        return strJSContent;
    }

    private Map<String,String> getVarType(String varName,Map<String,Object> mvars)
    {
        if(mvars.containsKey(varName))
        {
            return (Map<String,String>)mvars.get(varName);
        }
        return null;
    }

    private boolean getVarTypeIsSys(String varName,Map<String,Object> mvars)
    {
        Map<String,String> mv = null;
        if(mvars.containsKey(varName))
        {
            mv = (Map<String,String>)mvars.get(varName);
        }
        else
        {
            throw new RuntimeException("Variable missing:"+varName);
        }
        if(mv!=null)
        {
            if((!mv.get("ptype").equals("")&&!mv.get("ptype").equals("def")))
                return true;
        }
        return false;
    }

    private String getDelDbString(Map<String,Object> config,Map<String,Object> mvars,String forListName,String vi)
    { 
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        JSONObject jpara = (JSONObject)config.get("para");
        String strRightFilterDb="";
        String strLeftDebug="";
        String strLeftName="";
        List<Object> lrightDb=(List<Object>)jpara.get("rightDb");
        if(lrightDb!=null)
        {
            for(int j=0;j<lrightDb.size();j++)
            {
                Map<String,String> mr=(Map)lrightDb.get(j);
                String dbname = mr.get("v").trim();
                strRightFilterDb = dbname;

                if(mr.containsKey("d"))
                    strLeftDebug = mr.get("d");
        
                if(mr.containsKey("ln"))
                    strLeftName = mr.get("ln");
            }
        }

        strJSContent = strJSContent + "sql='';filterPara=[];sqltbls='"+strRightFilterDb+"';";
        strJSContent = strJSContent + "sqlfiltes='';";

        String strRightFilterSql="";
        List<Object> lrightFilter=(List<Object>)jpara.get("rightFilter");
        Boolean blnHasIn = false;
        Boolean blnHasLike = false;
        for(int j=0;j<lrightFilter.size();j++)
        {
            Map<String,String> mr=(Map)lrightFilter.get(j);
            String varKey = "";
            String varValue = "";
            if(mr.containsKey("f"))
            {
                varKey = "f";
                varValue = mr.get("f").toString();
            }
            else
            {    
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                if(blnHasIn)
                {
                    varValue = " ("+ WSoftUtil.replaceDBParaAll(varValue) + ") ";
                    strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'"+ varValue +"';";
                }
                else
                {
                    if(blnHasLike)
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'" + WSoftUtil.dbSqlLikeJs() + "';";
                        strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                    }
                    else
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'?';";
                        strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                    }
                    blnHasLike=false;
                }
                blnHasIn=false; 
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strRightFilterSql = strRightFilterSql + varValue;
                strJSContent = strJSContent +"sqlfiltes=sqlfiltes+' "+ varValue +" ';";
                if(varValue.equalsIgnoreCase("in")||varValue.equalsIgnoreCase("not in"))
                    blnHasIn = true;
                else
                    blnHasIn=false;
                
                if(varValue.equalsIgnoreCase("like"))
                    blnHasLike = true;
                else
                    blnHasLike=false;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                Map<String,String> mcr = codeDealVar(varValue);
                String strRightConfigid=mcr.get("configid");
                String strRightParaName=mcr.get("paraname");
                
                if(blnHasIn)
                {
                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                        {
                            strJSContent = strJSContent +"if(mapPara['"+ varValue + "']['sql']!=null){sqlfiltes=sqlfiltes + ' (' + mapPara['"+ varValue + "']['sql'] + ')';}else{sqlfiltes=sqlfiltes + ' (' + repdbpara(mapPara['"+ varValue + "']) + ')';};";
                            strJSContent = strJSContent + "if(mapPara['"+ varValue + "']['sql']!=null){filterPara=filterPara.concat(mapPara['"+ varValue + "']['para']);}else{};";
                        }
                        else
                        {
                            strJSContent = strJSContent +"if("+ varValue + "['sql']!=null){sqlfiltes=sqlfiltes + ' (' + "+ varValue + "['sql'] + ')';}else{sqlfiltes=sqlfiltes + ' (' + repdbpara("+ varValue + ") + ')';};";
                            strJSContent = strJSContent + "if("+ varValue + "['sql']!=null){filterPara=filterPara.concat("+ varValue + "['para']);}else{};"; 
                        }
                    }
                    else   //This section needs testing
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara("+ strRightConfigid + "['"+ strRightParaName + "']) + ')';";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']) + ')';";
                            else
                                strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara("+ strRightConfigid + "['"+ strRightParaName + "']) + ')';";
                        }
                    }
                    blnHasIn = false;
                }
                else
                {
                    if(blnHasLike)
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'" + WSoftUtil.dbSqlLikeJs() + "';";
                    }
                    else
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'?';";
                    }
                    blnHasLike=false;
                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                            strJSContent = strJSContent + "filterPara.push(mapPara['"+ varValue + "']);";
                        else
                            strJSContent = strJSContent + "filterPara.push("+ varValue + ");";
                    }
                    else
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "filterPara.push("+ strRightConfigid +"['"+ strRightParaName + "']);";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "filterPara.push(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']);";
                            else
                                strJSContent = strJSContent + "filterPara.push("+ strRightConfigid + "['"+ strRightParaName + "']);";
                        }
                    }
                }
            }
            else if(varKey.equalsIgnoreCase("f"))
            {
                strJSContent = strJSContent +"sqlfiltes=sqlfiltes+' "+ varValue +"';";
                blnHasIn=false;
            }
        }

        strJSContent = strJSContent +"if(sqltbls!=''){sql='delete from ' + sqltbls + ' where 1=1 '};";
        strJSContent = strJSContent +"if(sql!=''){if(sqlfiltes!=''){sql=sql + ' and ' + sqlfiltes}}else{sql=sqlfiltes};";

        if(strLeftDebug.equals("di"))
        {
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":sql\",sql);";
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":para\",filterPara);";
        }

        strJSContent = strJSContent + "datalistService.codeUpdDatas(sql,sqltbls,filterPara);";

        return strJSContent;
    }
    private String getInsDbString(Map<String,Object> config,Map<String,Object> mvars,String forListName,String vi)
    { 
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        String strLeftContent = "";
        String strLeft="";
        Map<String,String> mc = new HashMap<>();
        JSONObject jpara = (JSONObject)config.get("para");
        if(jpara.containsKey("left"))
        {
            strLeft=jpara.get("left").toString();
            mc = codeDealVar(strLeft);
            strLeftContent = getVarLeftNames(mc,forListName,strLeft,null,mvars);
        }

        String strRightFilterDb="";
        String strLeftDebug="";
        String strLeftName="";
        List<Object> lrightDb=(List<Object>)jpara.get("rightDb");
        if(lrightDb!=null)
        {
            for(int j=0;j<lrightDb.size();j++)
            {
                Map<String,String> mr=(Map)lrightDb.get(j);
                String dbname = mr.get("v").trim();
                strRightFilterDb = dbname;

                if(mr.containsKey("d"))
                    strLeftDebug = mr.get("d");
        
                if(mr.containsKey("ln"))
                    strLeftName = mr.get("ln");
            }
        }

        String seqTbl="";
        String seqID="";

        if(strRightFilterDb.toLowerCase().indexOf("tbl")==0||strRightFilterDb.toLowerCase().equals("org")||strRightFilterDb.toLowerCase().equals("dept")||strRightFilterDb.toLowerCase().equals("psn"))
        {
            seqTbl="@dataid@,";
            seqID="id,";
        }

        strJSContent = strJSContent + "sql='';filterPara=[];sqlfields='';sqlfieldssub='',sqltbls='"+strRightFilterDb+"';";

        List<Object> lrightField=(List<Object>)jpara.get("rightField");
        if(lrightField!=null)
        {
            for(int j=0;j<lrightField.size();j++)
            {
                Map<String,String> mr=(Map)lrightField.get(j);
                String varKey = "";
                String varValue = "";
                if(mr.containsKey("v"))
                {
                    varKey = "v";
                    varValue = mr.get("v").toString();
                }
                else if(mr.containsKey("f"))
                {
                    varKey = "f";
                    varValue = mr.get("f").toString();
                }
                else
                {
                    Map.Entry entry = mr.entrySet().iterator().next();
                    varKey = (String)entry.getKey();
                    varValue = (String)entry.getValue();
                }
                if(varKey.equalsIgnoreCase("c"))
                {
                    if(varValue.toLowerCase().startsWith("seq_")&&varValue.toLowerCase().endsWith(".nextval"))
                    {
                        strJSContent = strJSContent +"sqlfieldssub=sqlfieldssub+'"+ varValue +"';";
                    }
                    else
                    {
                        strJSContent = strJSContent +"sqlfieldssub=sqlfieldssub+'?';";
                        strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                    }
                }
                else if(varKey.equalsIgnoreCase("o"))
                {
                    if(varValue.equals(","))
                    {
                        strJSContent = strJSContent +"sqlfields=sqlfields+' "+ varValue +" ';";
                        strJSContent = strJSContent +"sqlfieldssub=sqlfieldssub+' "+ varValue +" ';";
                    }

                }
                else if(varKey.equalsIgnoreCase("v"))
                {
                    Map<String,String> mcr = codeDealVar(varValue);
                    String strRightConfigid=mcr.get("configid");
                    String strRightParaName=mcr.get("paraname");
                    strJSContent = strJSContent +"sqlfieldssub=sqlfieldssub+'?';";

                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                            strJSContent = strJSContent + "filterPara.push(mapPara['"+ varValue + "']);";
                        else
                            strJSContent = strJSContent + "filterPara.push("+ varValue + ");";
                    }
                    else
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "filterPara.push("+ strRightConfigid +"['"+ strRightParaName + "']);";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "filterPara.push(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']);";
                            else
                                strJSContent = strJSContent + "filterPara.push("+ strRightConfigid + "['"+ strRightParaName + "']);";
                        }
                    }
                }
                else if(varKey.equalsIgnoreCase("f"))
                {
                    strJSContent = strJSContent +"sqlfields=sqlfields+'"+ varValue +"';";
                }

            }
        }

        strJSContent = strJSContent +"if(sqltbls!=''){sql='insert into ' + sqltbls + ' ("+ seqID +"' + sqlfields + ') '};";
        strJSContent = strJSContent +"if(sqlfieldssub!=''){sql=sql + ' values("+ seqTbl +"' + sqlfieldssub + ')'};";

        if(strLeftDebug.equals("di"))
        {
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":sql\",sql);";
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":para\",filterPara);";
        }

        if(!strLeftContent.equals(""))
            strJSContent = strJSContent + strLeftContent + "=datalistService.codeInsDatas(sqltbls,sql,filterPara)";
        else
            strJSContent = strJSContent + "datalistService.codeInsDatas(sqltbls,sql,filterPara)";

        return strJSContent;
    }
    private String getUpdDbString(Map<String,Object> config,Map<String,Object> mvars,String forListName,String vi)
    { 
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        JSONObject jpara = (JSONObject)config.get("para");
        String strRightFilterDb="";
        String strLeftDebug="";
        String strLeftName="";
        List<Object> lrightDb=(List<Object>)jpara.get("rightDb");
        if(lrightDb!=null)
        {
            for(int j=0;j<lrightDb.size();j++)
            {
                Map<String,String> mr=(Map)lrightDb.get(j);
                String dbname = mr.get("v").trim();
                strRightFilterDb = dbname;

                if(mr.containsKey("d"))
                    strLeftDebug = mr.get("d");
        
                if(mr.containsKey("ln"))
                    strLeftName = mr.get("ln");

            }
        }

        strJSContent = strJSContent + "sql='';filterPara=[];sqlfields='';sqltbls='"+strRightFilterDb+"';";

        List<Object> lrightField=(List<Object>)jpara.get("rightField");
        if(lrightField!=null)
        {
            for(int j=0;j<lrightField.size();j++)
            {
                Map<String,String> mr=(Map)lrightField.get(j);
                String varKey = "";
                String varValue = "";
                if(mr.containsKey("v"))
                {
                    varKey = "v";
                    varValue = mr.get("v").toString();
                }
                else if(mr.containsKey("f"))
                {
                    varKey = "f";
                    varValue = mr.get("f").toString();
                }
                else
                {
                    Map.Entry entry = mr.entrySet().iterator().next();
                    varKey = (String)entry.getKey();
                    varValue = (String)entry.getValue();
                }
                if(varKey.equalsIgnoreCase("c"))
                {
                    strJSContent = strJSContent +"sqlfields=sqlfields+'?';";
                    strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                }
                else if(varKey.equalsIgnoreCase("o"))
                {
                    strJSContent = strJSContent +"sqlfields=sqlfields+' "+ varValue +" ';";
                }
                else if(varKey.equalsIgnoreCase("v"))
                {
                    Map<String,String> mcr = codeDealVar(varValue);
                    String strRightConfigid=mcr.get("configid");
                    String strRightParaName=mcr.get("paraname");
                    strJSContent = strJSContent +"sqlfields=sqlfields+'?';";
                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                            strJSContent = strJSContent + "filterPara.push(mapPara['"+ varValue + "']);";
                        else
                            strJSContent = strJSContent + "filterPara.push("+ varValue + ");";
                    }
                    else
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "filterPara.push("+ strRightConfigid +"['"+ strRightParaName + "']);";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "filterPara.push(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']);";
                            else
                                strJSContent = strJSContent + "filterPara.push("+ strRightConfigid + "['"+ strRightParaName + "']);";
                        }
                    }
                    
                }
                else if(varKey.equalsIgnoreCase("f"))
                {
                    strJSContent = strJSContent +"sqlfields=sqlfields+'"+ varValue +"';";
                }

            }
        }

        strJSContent = strJSContent + "sqlfiltes='';";

        String strRightFilterSql="";
        List<Object> lrightFilter=(List<Object>)jpara.get("rightFilter");
        Boolean blnHasIn = false;
        Boolean blnHasLike = false;
        for(int j=0;j<lrightFilter.size();j++)
        {
            Map<String,String> mr=(Map)lrightFilter.get(j);
            String varKey = "";
            String varValue = "";
            if(mr.containsKey("f"))
            {
                varKey = "f";
                varValue = mr.get("f").toString();
            }
            else
            {    
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                if(blnHasIn)
                {
                    varValue = " ("+ WSoftUtil.replaceDBParaAll(varValue) + ") ";
                    strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'"+ varValue +"';";
                }
                else
                {
                    if(blnHasLike)
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'" + WSoftUtil.dbSqlLikeJs() + "';";
                        strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                    }
                    else
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'?';";
                        strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                    }
                    blnHasLike=false;
                }
                blnHasIn=false; 
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strRightFilterSql = strRightFilterSql + varValue;
                strJSContent = strJSContent +"sqlfiltes=sqlfiltes+' "+ varValue +" ';";
                if(varValue.equalsIgnoreCase("in")||varValue.equalsIgnoreCase("not in"))
                    blnHasIn = true;
                else
                    blnHasIn=false;

                if(varValue.equalsIgnoreCase("like"))
                    blnHasLike = true;
                else
                    blnHasLike=false;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                Map<String,String> mcr = codeDealVar(varValue);
                String strRightConfigid=mcr.get("configid");
                String strRightParaName=mcr.get("paraname");
                
                if(blnHasIn)
                {
                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                        {
                            strJSContent = strJSContent +"if(mapPara['"+ varValue + "']['sql']!=null){sqlfiltes=sqlfiltes + ' (' + mapPara['"+ varValue + "']['sql'] + ')';}else{sqlfiltes=sqlfiltes + ' (' + repdbpara(mapPara['"+ varValue + "']) + ')';};";
                            strJSContent = strJSContent + "if(mapPara['"+ varValue + "']['sql']!=null){filterPara=filterPara.concat(mapPara['"+ varValue + "']['para']);}else{};";
                        }
                        else
                        {
                            strJSContent = strJSContent +"if("+ varValue + "['sql']!=null){sqlfiltes=sqlfiltes + ' (' + "+ varValue + "['sql'] + ')';}else{sqlfiltes=sqlfiltes + ' (' + repdbpara("+ varValue + ") + ')';};";
                            strJSContent = strJSContent + "if("+ varValue + "['sql']!=null){filterPara=filterPara.concat("+ varValue + "['para']);}else{};"; 
                        }
                    }
                    else   //This section needs testing
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara("+ strRightConfigid + "['"+ strRightParaName + "']) + ')';";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']) + ')';";
                            else
                                strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara("+ strRightConfigid + "['"+ strRightParaName + "']) + ')';";
                        }
                    }
                    blnHasIn = false;
                }
                else
                {
                    if(blnHasLike)
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'" + WSoftUtil.dbSqlLikeJs() + "';";
                    }
                    else
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'?';";
                    }
                    blnHasLike=false;
                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                            strJSContent = strJSContent + "filterPara.push(mapPara['"+ varValue + "']);";
                        else
                            strJSContent = strJSContent + "filterPara.push("+ varValue + ");";
                    }
                    else
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "filterPara.push("+ strRightConfigid +"['"+ strRightParaName + "']);";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "filterPara.push(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']);";
                            else
                                strJSContent = strJSContent + "filterPara.push("+ strRightConfigid + "['"+ strRightParaName + "']);";
                        }
                    }
                }
            }
            else if(varKey.equalsIgnoreCase("f"))
            {
                strJSContent = strJSContent +"sqlfiltes=sqlfiltes+' "+ varValue +"';";
                blnHasIn=false;
            }
        }

        strJSContent = strJSContent +"if(sqlfields!=''&&sqltbls!=''){sql='update ' + sqltbls + ' set ' + sqlfields + ' where 1=1 '};";
        strJSContent = strJSContent +"if(sql!=''){if(sqlfiltes!=''){sql=sql + ' and ' + sqlfiltes}}else{sql=sqlfiltes};";

        if(strLeftDebug.equals("di"))
        {
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":sql\",sql);";
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":para\",filterPara);";
        }

        strJSContent = strJSContent + "datalistService.codeUpdDatas(sql,sqltbls,filterPara);";

        return strJSContent;
    }

    private String getAssignDbString(Map<String,Object> config,Map<String,Object> mvars,String forListName,String vi)
    { 
        String strLeftContent = "";
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        JSONObject jpara = (JSONObject)config.get("para");
        Map<String,String> mpLeft=(Map<String,String>)jpara.get("left");

        String strLeftDebug="";
        if(jpara.containsKey("leftd"))
            strLeftDebug = (String)jpara.get("leftd");

        String strLeftName="";
        if(jpara.containsKey("leftn"))
            strLeftName = (String)jpara.get("leftn");

        String strLeft=mpLeft.get("v");
        String strSqlPara = mpLeft.get("s");
        String strTopitem = mpLeft.get("t");
        
        Map<String,String> mc = codeDealVar(strLeft);
        String strLeftConfigid=mc.get("configid");
        String strLeftParaName=mc.get("paraname");
        if(strLeftConfigid.equalsIgnoreCase(""))
        {
            if(getVarTypeIsSys(strLeftParaName,mvars))
                strLeftContent = "mapPara['"+ strLeftParaName + "']";
            else
                strLeftContent = ""+ strLeftParaName + "";
        }

        Map<String,String> mobjtype = getVarType(strLeft, mvars);
        strJSContent = "tblInPara=[];tblPara=[];fieldTitle=[];searchKey=[];mapPara['pkey']='';";

        String strRightFilterDb="";
        String strTbls = "";
        List<Object> lrightDb=(List<Object>)jpara.get("rightDb");
        if(lrightDb!=null)
        {
            for(int j=0;j<lrightDb.size();j++)
            {
                Map<String,String> mr=(Map)lrightDb.get(j);
                if(mr.containsKey("a"))
                {
                    String dbname = mr.get("v").trim();
                    String dbalias = mr.get("a").trim();
                    
                    if(!dbalias.equals(""))
                        dbname = dbname + " " + dbalias;
                    strRightFilterDb = strRightFilterDb + " " + dbname;
                    strTbls = strTbls + dbname + ",";
                    strJSContent = strJSContent + "tblPara.push('"+dbname+"');";
                }
                else if(mr.containsKey("o"))
                {
                    strRightFilterDb = strRightFilterDb + " " + mr.get("o").toString();
                }
                else if(mr.containsKey("f"))
                {
                    strRightFilterDb = strRightFilterDb +  " " + mr.get("f").toString();
                }
            }
        }

        if(!strTbls.equalsIgnoreCase(""))
            strTbls = strTbls.substring(0, strTbls.length()-1);

        if(getVarTypeIsSys(strLeftParaName,mvars))
            strJSContent = strJSContent + "mapPara['"+ strLeftParaName + "']={};sql='';sqlfields='';sqltbls='"+strRightFilterDb+"';";
        else
            strJSContent = strJSContent + "sql='';sqlfields='';sqltbls='"+strRightFilterDb+"';";

        String strRightFilterField="";
        List<Object> lrightField=(List<Object>)jpara.get("rightField");
        if(lrightField!=null)
        {
            for(int j=0;j<lrightField.size();j++)
            {
                Map<String,String> mr=(Map)lrightField.get(j);

                String strRightParaName="";
                String strFieldDb = mr.get("v").trim();
                String strFieldAlias = "";
                String strFieldAliasSub = mr.get("fa").trim().toUpperCase();
                if(strFieldAliasSub.indexOf("_")>0)
                {
                    strFieldAlias = strFieldAliasSub.substring(0, strFieldAliasSub.indexOf("_"));
                    strFieldAliasSub = strFieldAlias+ strFieldAliasSub.substring(strFieldAliasSub.indexOf("_")).toLowerCase();
                }
                else
                {
                    strFieldAlias = strFieldAliasSub; 
                }

                String strCountSum = mr.get("tk").trim();
                String strPkey = mr.get("vpk").trim();
                String strSearchkey = mr.get("vsk").trim();
                String strFieldtitle = mr.get("ft").trim();

                if(!strFieldtitle.equals(""))
                    strJSContent = strJSContent + "ft={'"+ strFieldAliasSub +"':'"+ strFieldtitle +"'};fieldTitle.push(ft);";

                if(!strSearchkey.equals(""))
                    strJSContent = strJSContent + "ffa={'name':'"+ strFieldDb +"'};searchKey.push(ffa);";
                
                if(!strPkey.equals(""))
                    strJSContent = strJSContent + "mapPara['pkey']='"+ strFieldAlias +"';";

                if(strCountSum.equals("count"))
                    strRightParaName = "count("+ strFieldDb + ") as " + strFieldAlias;
                else if(strCountSum.equals("sum"))
                    strRightParaName = "sum("+ strFieldDb + ") as " + strFieldAlias;
                else if(strCountSum.equals("avg"))
                    strRightParaName = "avg("+ strFieldDb + ") as " + strFieldAlias;
                else if(strCountSum.equals("max"))
                    strRightParaName = "max("+ strFieldDb + ") as " + strFieldAlias;
                else if(strCountSum.equals("min"))
                    strRightParaName = "min("+ strFieldDb + ") as " + strFieldAlias;
                else 
                    strRightParaName = strFieldDb + " as " + strFieldAlias;
            
                strRightFilterField = strRightFilterField + strRightParaName + ",";

            }
        }
        
        if(!strRightFilterField.equalsIgnoreCase(""))
            strRightFilterField = strRightFilterField.substring(0, strRightFilterField.length()-1);
        
        strJSContent = strJSContent + "sqlfields='"+strRightFilterField+"';";
        
        if(strSqlPara.equals("sqlpara"))
            strJSContent = strJSContent + "if(mapPara['queriedFilterSql']){tblInPara.push(mapPara['queriedTblIn']);sqlfiltes=mapPara['queriedFilterSql'];filterPara=gcopyobj(mapPara['queriedFilterParams']);if(sqlfiltes!=''){sqlfiltes=sqlfiltes+' and ';}}else{sqlfiltes='';filterPara=[]};";
        else
            strJSContent = strJSContent + "sqlfiltes='';filterPara=[];";
        
        List<Object> lrightFilter=(List<Object>)jpara.get("rightFilter");
        Boolean blnHasIn = false;
        Boolean blnHasLike = false;
        for(int j=0;j<lrightFilter.size();j++)
        {
            Map<String,String> mr=(Map)lrightFilter.get(j);

            String varKey = "";
            String varValue = "";
            if(mr.containsKey("f"))
            {
                varKey = "f";
                varValue = mr.get("f").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }

            if(varKey.equalsIgnoreCase("c"))
            {
                if(blnHasIn)
                {
                    varValue = " ("+ WSoftUtil.replaceDBParaAll(varValue) + ") ";
                    strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'"+ varValue +"';";
                }
                else
                {
                    if(blnHasLike)
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'" + WSoftUtil.dbSqlLikeJs() + "';";
                        strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                    }
                    else
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'?';";
                        strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                    }
                    blnHasLike=false;
                }
                blnHasIn=false;

            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strJSContent = strJSContent +"sqlfiltes=sqlfiltes+' "+ varValue +" ';";
                if(varValue.equalsIgnoreCase("in")||varValue.equalsIgnoreCase("not in"))
                    blnHasIn = true;
                else
                    blnHasIn=false;

                if(varValue.equalsIgnoreCase("like"))
                    blnHasLike = true;
                else
                    blnHasLike=false;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                Map<String,String> mcr = codeDealVar(varValue);
                String strRightConfigid=mcr.get("configid");
                String strRightParaName=mcr.get("paraname");
                
                if(blnHasIn)
                {
                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                        {
                            strJSContent = strJSContent +"if(mapPara['"+ varValue + "']['sql']!=null){tblInPara.push(mapPara['"+ varValue + "']['tblPara']);sqlfiltes=sqlfiltes + ' (' + mapPara['"+ varValue + "']['sql'] + ')';}else{sqlfiltes=sqlfiltes + ' (' + repdbpara(mapPara['"+ varValue + "']) + ')';};";
                            strJSContent = strJSContent + "if(mapPara['"+ varValue + "']['sql']!=null){filterPara=filterPara.concat(mapPara['"+ varValue + "']['para']);}else{};";
                        }
                        else
                        {
                            strJSContent = strJSContent +"if("+ varValue + "['sql']!=null){tblInPara.push("+ varValue + "['tblPara']);sqlfiltes=sqlfiltes + ' (' + "+ varValue + "['sql'] + ')';}else{sqlfiltes=sqlfiltes + ' (' + repdbpara("+ varValue + ") + ')';};";
                            strJSContent = strJSContent + "if("+ varValue + "['sql']!=null){filterPara=filterPara.concat("+ varValue + "['para']);}else{};"; 
                        }
                    }
                    else   //This section needs testing
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara("+ strRightConfigid + "['"+ strRightParaName + "']) + ')';";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']) + ')';";
                            else
                                strJSContent = strJSContent + "sqlfiltes=sqlfiltes + ' (' + repdbpara("+ strRightConfigid + "['"+ strRightParaName + "']) + ')';";
                        }
                    }
                    blnHasIn = false;
                }
                else
                {
                    if(blnHasLike)
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'" + WSoftUtil.dbSqlLikeJs() + "';";
                    }
                    else
                    {
                        strJSContent = strJSContent +"sqlfiltes=sqlfiltes+'?';";
                    }
                    blnHasLike=false;

                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                            strJSContent = strJSContent + "filterPara.push(mapPara['"+ varValue + "']);";
                        else
                            strJSContent = strJSContent + "filterPara.push("+ varValue + ");";
                    }
                    else
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "filterPara.push("+ strRightConfigid +"['"+ strRightParaName + "']);";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "filterPara.push(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']);";
                            else
                                strJSContent = strJSContent + "filterPara.push("+ strRightConfigid + "['"+ strRightParaName + "']);";
                        }
                    }
                }
            }
            else if(varKey.equalsIgnoreCase("f"))
            {
                strJSContent = strJSContent +"sqlfiltes=sqlfiltes+' "+ varValue +"';";
                blnHasIn=false;
            }
        }

        strJSContent = strJSContent + "sqlgroup='';";

        List<Object> lrightGroup=(List<Object>)jpara.get("rightGroup");
        String strGroup = "";
        for(int j=0;j<lrightGroup.size();j++)
        {
            Map<String,String> mr=(Map)lrightGroup.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("f"))
            {
                varKey = "f";
                varValue = mr.get("f").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("f"))
            {
                strGroup = strGroup + varValue +",";
            }
        }
        if(!strGroup.equalsIgnoreCase(""))
        {
            strGroup = strGroup.substring(0, strGroup.length()-1);
            strJSContent = strJSContent +"sqlgroup=sqlgroup+' "+ strGroup +"';";
        }

        strJSContent = strJSContent + "sqlgpfilter='';";

        List<Object> lrightGroupFilter=(List<Object>)jpara.get("rightGroupFilter");
        if(lrightGroupFilter!=null)
        {
            if(lrightGroupFilter.size()>0)
            {
                strJSContent = strJSContent +"sqlgpfilter=sqlgpfilter+'having(';";
            }
            for(int j=0;j<lrightGroupFilter.size();j++)
            {
                Map<String,String> mr=(Map)lrightGroupFilter.get(j);
                if(mr.containsKey("f"))
                {
                    String strField = mr.get("f").trim();
                    String strCountSum = mr.get("tk").trim();
                    String varValue="";
                    if(strCountSum.equals("count"))
                        varValue = "count("+ strField + ")";
                    else if(strCountSum.equals("sum"))
                        varValue = "sum("+ strField + ")";
                    else if(strCountSum.equals("avg"))
                        varValue = "avg("+ strField + ")";
                    else if(strCountSum.equals("max"))
                        varValue = "max("+ strField + ")";
                    else if(strCountSum.equals("min"))
                        varValue = "min("+ strField + ")";
                    else
                        varValue = strField;
                    strJSContent = strJSContent +"sqlgpfilter=sqlgpfilter+'"+ varValue +"';";
                }
                else if(mr.containsKey("c"))
                {
                    String varValue=mr.get("c").trim();
                    strJSContent = strJSContent +"sqlgpfilter=sqlgpfilter+'?';";
                    strJSContent = strJSContent + "filterPara.push('"+ varValue + "');";
                }
                else if(mr.containsKey("o"))
                {
                    String varValue=mr.get("o").trim();
                    strJSContent = strJSContent +"sqlgpfilter=sqlgpfilter+' "+ varValue +" ';";
                }
                else if(mr.containsKey("v"))
                {
                    String varValue=mr.get("v").trim();
                    Map<String,String> mcr = codeDealVar(varValue);
                    String strRightConfigid=mcr.get("configid");
                    String strRightParaName=mcr.get("paraname");
                    strJSContent = strJSContent +"sqlgpfilter=sqlgpfilter+'?';";
                    if(strRightConfigid.equalsIgnoreCase(""))
                    {
                        if(getVarTypeIsSys(varValue,mvars))
                            strJSContent = strJSContent + "filterPara.push(mapPara['"+ varValue + "']);";
                        else
                            strJSContent = strJSContent + "filterPara.push("+ varValue + ");";
                    }
                    else
                    {
                        if(strRightConfigid.endsWith("_entry"))  //Is the iterated item
                            strJSContent = strJSContent + "filterPara.push("+ strRightConfigid +"['"+ strRightParaName + "']);";
                        else
                        {
                            if(getVarTypeIsSys(strRightConfigid,mvars))
                                strJSContent = strJSContent + "filterPara.push(mapPara['"+ strRightConfigid + "']['"+ strRightParaName + "']);";
                            else
                                strJSContent = strJSContent + "filterPara.push("+ strRightConfigid + "['"+ strRightParaName + "']);";
                        }
                    }
                }
            }
            if(lrightGroupFilter.size()>0)
            {
                strJSContent = strJSContent +"sqlgpfilter=sqlgpfilter+')';";
            }
        }

        strJSContent = strJSContent + "sqlorder='';";
        String strOrders = "";
        List<Object> lrightOrder=(List<Object>)jpara.get("rightOrder");
        if(lrightOrder!=null)
        {
            for(int j=0;j<lrightOrder.size();j++)
            {
                Map<String,String> mr=(Map)lrightOrder.get(j);
                if(mr.containsKey("f"))
                {
                    String strField = mr.get("f").trim();
                    String strOrder = mr.get("tk").trim();
                    strOrders = strOrders + strField + " " + strOrder + ","; 
                }
            }
            if(!strOrders.equalsIgnoreCase(""))
            {
                strOrders = strOrders.substring(0, strOrders.length()-1);
                strJSContent = strJSContent +"sqlorder='"+ strOrders +"';";
            }
        }

        strJSContent = strJSContent +"if(sqlfields!=''&&sqltbls!=''){sql='select ' + sqlfields + ' from ' + sqltbls + ' where 1=1 '};";
        strJSContent = strJSContent +"if(sql!=''){if(sqlfiltes!=''){sql=sql + ' and ' + sqlfiltes}}else{sql=sqlfiltes};";
        strJSContent = strJSContent +"if(sql!=''){if(sqlgroup!=''){sql=sql + ' group by ' + sqlgroup}};";
        strJSContent = strJSContent +"if(sqlgroup!=''){if(sqlgpfilter!=''){sql=sql + ' ' + sqlgpfilter}};";
        strJSContent = strJSContent +"if(sqlorder!=''){sql=sql + ' order by ' + sqlorder};";

        if(mobjtype.get("type").endsWith("obj"))
        {
            if(strLeftDebug.equals("di"))
            {
                strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":SQL\",sql);";
                strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":PARA\",filterPara);";
            }

            strJSContent = strJSContent + ";var cacheobj={};cacheobj['tblsdb']='"+ strTbls +"';cacheobj['tblInPara']=tblInPara;" + strLeftContent + "=" + "datalistService.codeGetDataSingleCache(sql,filterPara,'"+ strTopitem +"',cacheobj)";
            if(strLeftDebug.equals("di"))
            {
                strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + "\","+ strLeftContent +");";
            }
        }
        else if(mobjtype.get("type").endsWith("objlist"))
        {
            if(strLeftDebug.equals("di"))
            {
                strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":SQL\",sql);";
                strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + ":PARA\",filterPara);";
            }

            strJSContent = strJSContent + ";var cacheobj={};cacheobj['tblsdb']='"+ strTbls +"';cacheobj['tblInPara']=tblInPara;" + strLeftContent + "=" + "datalistService.codeGetDatasCache(sql,filterPara,'"+ strTopitem +"',cacheobj)";
            
            if(strLeftDebug.equals("di"))
            {
                strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + "\","+ strLeftContent +");";
            }
        }
        else
        {
            strJSContent = strJSContent + strLeftContent + "['sql']=sql;";
            strJSContent = strJSContent + strLeftContent + "['sqlFilter']=sqlfiltes;";
            strJSContent = strJSContent + strLeftContent + "['sqlGroup']=sqlgroup;";
            strJSContent = strJSContent + strLeftContent + "['sqlGroupFilter']=sqlgpfilter;";
            strJSContent = strJSContent + strLeftContent + "['sqlOrder']=sqlorder;";  
            strJSContent = strJSContent + strLeftContent + "['pkey']=mapPara['pkey'];";
            strJSContent = strJSContent + strLeftContent + "['searchKey']=searchKey;";
            strJSContent = strJSContent + strLeftContent + "['para']=filterPara;";
            strJSContent = strJSContent + strLeftContent + "['tblPara']=tblPara;";
            strJSContent = strJSContent + strLeftContent + "['tblInPara']=tblInPara;";
            strJSContent = strJSContent + strLeftContent + "['tbls']=sqltbls;";
            strJSContent = strJSContent + strLeftContent + "['tblsdb']='"+ strTbls +"';";
            strJSContent = strJSContent + strLeftContent + "['topitem']='"+ strTopitem +"';";
            strJSContent = strJSContent + strLeftContent + "['fields']=sqlfields;";
            strJSContent = strJSContent + strLeftContent + "['fieldsPara']=fieldTitle;";
            if(strLeftDebug.equals("di"))
            {
                strJSContent = strJSContent + strLeftContent + "['isdebug']='true';";
            }
            else
            {
                strJSContent = strJSContent + strLeftContent + "['isdebug']='false';"; 
            }
        }

        return strJSContent;
    }


    private String getVarLeftNames(Map<String,String> mc,String forListName,String strVar,Map<String,String> comAttrsField,Map<String,Object> mvars)
    {
        String strConfigid=mc.get("configid");
        String strParaName=mc.get("paraname");
        String strContent = "";
        if(strConfigid.equalsIgnoreCase(""))
        {
            if(getVarTypeIsSys(strVar,mvars))
                strContent = "mapPara['"+ strVar + "']";
            else
                strContent = strVar;
        }
        else
        {

            if(strVar.indexOf("wzsoftcom")==0&&strVar.length()>35) //Control name from the form
            {
                if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
                {
                    String strListField=mc.get("formlistfield");
                    strContent = strContent + " "+ strParaName +"['"+ strListField + "']";
                }
                else
                {
                    String strField = getAttrFieldName(strConfigid,strParaName,comAttrsField);
                    strContent = "window.setDataItem"+ strConfigid + "('"+strField+"',";
                }
            }
            else if(strVar.indexOf("con#")==0) //Set container property
            {
                strContent = "setContainer('"+ strVar +"',";
            }
            else
            {
                if(strConfigid.endsWith("_entry"))  //Is the iterated item
                {
                    strContent = strConfigid+"['"+ strParaName + "']";
                }
                else
                {
                    if(getVarTypeIsSys(strConfigid,mvars))
                        strContent = "mapPara['"+ strConfigid + "']['"+ strParaName + "']";
                    else
                        strContent = strConfigid + "['"+ strParaName + "']";
                }
            }
        }
        return strContent;
    }
    public String getAttrFieldName(String configID,String varName,Map<String,String> comAttrsField)
    {
        return comAttrsField.get(configID+"."+varName);
    }
    private String getVarRightNames(String forListName,String strVar,Map<String,String> comAttrsField,Map<String,Object> mvars)
    {
        Map<String,String> mc = codeDealVar(strVar);
        String strConfigid=mc.get("configid");
        String strParaName=mc.get("paraname");
        String strContent = "";
        if(strConfigid.equalsIgnoreCase(""))
        {
            if(getVarTypeIsSys(strVar,mvars))
                strContent = strContent + "gvalnum(mapPara['"+ strVar + "'])";
            else
                strContent = strContent + "gvalnum("+ strVar + ")";

        }
        else
        {
            if(strVar.indexOf("wzsoftcom")==0&&strVar.length()>35) //Control name from the form
            {
                if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
                {
                    String strListField=mc.get("formlistfield");
                    strContent = strContent + "gvalnum("+ strParaName +"['"+ strListField + "'])";
                }
                else
                {
                    String strField = getAttrFieldName(strConfigid,strParaName,comAttrsField);
                    strContent = strContent + "gvalnum(window.getDataItem"+ strConfigid + "('"+strField+"'))";
                }
            }
            else
            {
                if(strConfigid.endsWith("_entry"))  //Is the iterated item
                {
                    strContent = strContent + "gvalnum("+ strConfigid +"['"+ strParaName + "'])";
                }
                else
                {
                    if(getVarTypeIsSys(strConfigid,mvars))
                        strContent = "gvalnum(mapPara['"+ strConfigid + "']['"+ strParaName + "'])";
                    else
                        strContent = "gvalnum("+ strConfigid + "['"+ strParaName + "'])";
                }
            }
        }
        return strContent;
    }
    private String getSubCodeJSString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,Map<String,String> mfuncs,String vi)  throws Throwable 
    {
        String strLeftContent = "";
        String strJSContent = "jscodeparas={};setPageParas(jscodeparas,mapPara);";
        if(!config.containsKey("para"))
            return "";

        JSONObject jpara = (JSONObject)config.get("para");
        Map<String,String> mpLeft=(Map<String,String>)jpara.get("left");
        String strLeft=mpLeft.get("v");
        String strPub = mpLeft.get("r");

        String strLeftDebug="";
        if(jpara.containsKey("leftd"))
            strLeftDebug = (String)jpara.get("leftd");

        String strLeftName="";
        if(jpara.containsKey("leftn"))
            strLeftName = (String)jpara.get("leftn");
        
        Map<String,String> mc = codeDealVar(strLeft);
        strLeftContent = getVarLeftNames(mc,forListName,strLeft,comAttrsField,mvars);

        List<Object> lrightcode=(List<Object>)jpara.get("rightCode");
        Map<String,String> mrc=(Map)lrightcode.get(0);
        String codeID = mrc.get("v").trim();

        strJSContent = strJSContent + "jscodeparas['codeid']='"+ codeID +"';";

        String strRightContent="";
        List<Object> lright=(List<Object>)jpara.get("rightPara");
        for(int j=0;j<lright.size();j++)
        {
            Map<String,String> mr=(Map)lright.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                strRightContent = strRightContent + "chkAjaxPara(gvalnum('"+varValue+"'))";
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strRightContent = strRightContent + varValue;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                strRightContent = strRightContent + "chkAjaxPara(" + getVarRightNames(forListName,varValue,comAttrsField,mvars) + ")";
            }
            else if(varKey.equalsIgnoreCase("f"))
            {
                strRightContent = strRightContent + "jscodeparas['para_"+ varValue +"']";
            }
        }

        strJSContent = strJSContent + strRightContent + ";";
        if(strPub.equals("portal"))
            strJSContent = strJSContent +  "axios.post(\"./../portal/api/codeDo\",jscodeparas).then(function(res){gDealAjaxLogin(res);let redata = res.data; if(redata!=null){";
        else
            strJSContent = strJSContent +  "axios.post(\"./../api/codeDo\",jscodeparas).then(function(res){gDealAjaxLogin(res);let redata = res.data; if(redata!=null){";
        
        if(strLeft.indexOf("wzsoftcom")==0&&strLeft.length()>35) //Control name from the form
        {
            String strParaName=mc.get("paraname");
            if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
            {
                strJSContent = strJSContent + strLeftContent + "=redata['returnvalue'];";
            }
            else
            {
                strJSContent = strJSContent + strLeftContent + "(redata['returnvalue']));";
            }
        }
        else
        {
            strJSContent = strJSContent + strLeftContent + "=redata['returnvalue'];";
        }

        if(strLeftDebug.equals("di"))
        {
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + "\",redata['returnvalue'])";
        }
        else if(strLeftDebug.equals("d"))
        {
            strJSContent = strJSContent + ";gDebugLog(\"" + strLeftName + "\",redata['returnvalue']);";
        }

        List<Object> lexp=(List<Object>)jpara.get("exp");
        for(int j=0;j<lexp.size();j++)
        {
            Map<String,Object> mexp=(Map)lexp.get(j);
            String strType=(String)mexp.get("type");
            strJSContent = strJSContent + getSubCodesFunc(strType,mexp,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }

        strJSContent = strJSContent + " }}).catch(function (err) {});";
        return strJSContent;
    }
    private String getMsgString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,Map<String,String> mfuncs,String vi)
    {
        String strJSContent = "setmsgpara(mapPara);";
        if(!config.containsKey("para"))
            return "";
        
        String strLeftContent = "";
        String strLeft="";
        Map<String,String> mc = new HashMap<>();

        JSONObject jpara = (JSONObject)config.get("para");
        if(jpara.containsKey("left"))
        {
            strLeft=(String)jpara.get("left");
            mc = codeDealVar(strLeft);
            strLeftContent = getVarLeftNames(mc,forListName,strLeft,comAttrsField,mvars);
        }

        List<Object> lrightcode=(List<Object>)jpara.get("rightCode");
        Map<String,String> mrc=(Map)lrightcode.get(0);
        String tempid = mrc.get("v").trim();
        strJSContent = strJSContent + "mapPara['msg#tempid']='"+ tempid +"';";

        String strRightContent="";
        List<Object> lright=(List<Object>)jpara.get("rightPara");
        for(int j=0;j<lright.size();j++)
        {
            Map<String,String> mr=(Map)lright.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                strRightContent = strRightContent + "gvalnum('"+varValue+"')";
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strRightContent = strRightContent + varValue;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                strRightContent = strRightContent + getVarRightNames(forListName,varValue,comAttrsField,mvars);
            }
            else if(varKey.equalsIgnoreCase("f"))
            {
                strRightContent = strRightContent + "mapPara['" + varValue + "']";
            }
        }

        strJSContent = strJSContent + strRightContent + ";";

        if(strLeftContent.equals(""))
        {
            strJSContent = strJSContent + "datalistService.codeMsgAdd(mapPara);";
        }
        else
        {
            if(strLeft.indexOf("wzsoftcom")==0&&strLeft.length()>35) //Control name from the form
            {
                String strParaName=mc.get("paraname");
                if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
                {
                    strJSContent = strJSContent + strLeftContent + "=datalistService.codeMsgAdd(mapPara);";
                }
                else
                {
                    strJSContent = strJSContent + strLeftContent + "(datalistService.codeMsgAdd(mapPara)));";
                }
            }
            else
            {
                strJSContent = strJSContent + strLeftContent + "=datalistService.codeMsgAdd(mapPara);";
            }
        }

        return strJSContent;
    }
    private String getSubCodeString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,Map<String,String> mfuncs,String vi) throws Throwable 
    {
        String strLeft="";
        String strLeftContent = "";
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        Map<String,String> mc = new HashMap<>();
        JSONObject jpara = (JSONObject)config.get("para");
        String strLeftDebug="";
        String strLeftName="";
        if(jpara.containsKey("left"))
        {
            strLeft=(String)jpara.get("left");
            mc = codeDealVar(strLeft);
            strLeftContent = getVarLeftNames(mc,forListName,strLeft,comAttrsField,mvars);

            if(jpara.containsKey("leftd"))
                strLeftDebug = (String)jpara.get("leftd");
    
            if(jpara.containsKey("leftn"))
                strLeftName = (String)jpara.get("leftn");
        }

        List<Object> lrightcode=(List<Object>)jpara.get("rightCode");
        Map<String,String> mrc=(Map)lrightcode.get(0);
        String codeid = mrc.get("v").trim();
        String source = mrc.get("c").trim();
        String para = mrc.get("p").trim();

        String strRightContent="";
        String strFuncPara = "";
        String strFuncParaValue = "";
        List<Object> lright=(List<Object>)jpara.get("rightPara");
        for(int j=0;j<lright.size();j++)
        {
            Map<String,String> mr=(Map)lright.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                strFuncParaValue = strFuncParaValue + "gvalnum('"+varValue+"')@,@";
                //2024-06-01 Constants also undergo type conversion here
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                //strRightContent = strRightContent + varValue;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                strFuncParaValue = strFuncParaValue + getVarRightNames(forListName,varValue,comAttrsField,mvars) + "@,@";
            }
            else if(varKey.equalsIgnoreCase("f"))
            {
                strFuncPara = strFuncPara + varValue + ",";
            }
        }

        strFuncPara = WSoftUtil.strDelLastComma(strFuncPara);
        if(!strFuncParaValue.equals(""))
        {
            strFuncParaValue = strFuncParaValue.substring(0,strFuncParaValue.length()-3);
        }

        String arrParaFunc[] = para.split(",");
        String arrPara[] = strFuncPara.split(",");
        String arrValue[] = strFuncParaValue.split("@,@");
        String strParaDo = "";

        if(!para.equals("")&&!strFuncPara.equals("")&&!strFuncParaValue.equals("")&&arrParaFunc.length==arrPara.length)
        {
            strParaDo = ","+para+",";
            for(int i=0;i<arrValue.length;i++)
            {   
                strParaDo = strParaDo.replace(","+arrPara[i]+",", ","+arrValue[i]+",");
            }
            strParaDo = strParaDo.substring(1,strParaDo.length()-1);
        }

        mfuncs.put(codeid+"#"+para,source);
        strJSContent = strJSContent + strRightContent + ";";
        String strFuncDo = "var rv" + codeid +"=func"+ codeid +"("+strParaDo+");";
        String strFuncRe = "rv" + codeid +"";

        strJSContent = strJSContent + strFuncDo +";";

        if(strLeftContent.equals(""))
        {

        }
        else
        {
            if(strLeft.indexOf("wzsoftcom")==0&&strLeft.length()>35) //Control name from the form
            {
                String strParaName=mc.get("paraname");
                if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
                {
                    strJSContent = strJSContent + strLeftContent + "="+ strFuncRe +";";
                }
                else
                {
                    strJSContent = strJSContent + strLeftContent + "("+ strFuncRe +"));";
                }
            }
            else
            {
                strJSContent = strJSContent + strLeftContent + "="+ strFuncRe +";";
            }
        }

        if(strLeftDebug.equals("di"))
        {
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + "\","+ strFuncRe +");";
        }
        else if(strLeftDebug.equals("d"))
        {
            strJSContent = strJSContent + ";gDebugLog(\"" + strLeftName + "\","+ strFuncRe +");";
        }

        return strJSContent;
    }
    private String getAssignString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,String vi)
    {
        String strLeftContent = "";
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        JSONObject jpara = (JSONObject)config.get("para");
        String strLeft=(String)jpara.get("left");

        String strLeftDebug="";
        if(jpara.containsKey("leftd"))
            strLeftDebug = (String)jpara.get("leftd");

        String strLeftJsFd="";
        String strJsFdPara="";
        if(jpara.containsKey("leftjsfd"))
        {
            strLeftJsFd = (String)jpara.get("leftjsfd");
        }

        String strLeftName="";
        if(jpara.containsKey("leftn"))
            strLeftName = (String)jpara.get("leftn");

        Map<String,String> mc = codeDealVar(strLeft);
        strLeftContent = strLeftContent + getVarLeftNames(mc,forListName,strLeft,comAttrsField,mvars);

        String strRightContent="";
        List<Object> lright=(List<Object>)jpara.get("right");
        for(int j=0;j<lright.size();j++)
        {
            Map<String,String> mr=(Map)lright.get(j);

            String varKey = "";
            String varValue = "";
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }

            if(varKey.equalsIgnoreCase("c"))
            {
                String gPara = "gvalnum('"+varValue+"')";
                strRightContent = strRightContent + gPara;
                if(!strLeftJsFd.equals(""))
                {
                    strJsFdPara = strJsFdPara + "jsfdpara[\""+ gPara + "\"]="+ gPara +";";
                }
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strRightContent = strRightContent + varValue;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                String gPara = getVarRightNames(forListName,varValue,comAttrsField,mvars);
                strRightContent = strRightContent + gPara;
                if(!strLeftJsFd.equals(""))
                {
                    strJsFdPara = strJsFdPara + "jsfdpara[\""+ gPara + "\"]="+ gPara +";";
                }
            }
        }

        if(!strLeftJsFd.equals(""))
        {
            strLeftContent = "jsfdpara={};"+strJsFdPara + strLeftContent;
            strRightContent = "gcodejsfd(\"" + strRightContent+"\",jsfdpara)";
        }

        if(strLeft.indexOf("wzsoftcom")==0&&strLeft.length()>35) //Control name from the form
        {
            String strParaName=mc.get("paraname");
            if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
            {
                strJSContent = strJSContent + strLeftContent + "=" + strRightContent;
            }
            else
            {
                strJSContent = strJSContent + strLeftContent + "(" + strRightContent + "))";
            }
        }
        else if(strLeft.indexOf("con#")==0) //Set container property
        {
            strJSContent = strJSContent + strLeftContent + "(" + strRightContent + "))";
        }
        else
        {
            strJSContent = strJSContent + strLeftContent + "=" + strRightContent;
        }

        if(strLeftDebug.equals("di"))
        {
            strJSContent = strJSContent + ";datalistService.codeDebugLog(\"" + strLeftName + "\","+ strRightContent +");";
        }
        else if(strLeftDebug.equals("d"))
        {
            strJSContent = strJSContent + ";gDebugLog(\"" + strLeftName + "\","+ strRightContent +");";
        }

        return strJSContent;
    }
    private String getInsObjlistString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,String vi)
    {
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        JSONObject jpara = (JSONObject)config.get("para");
        String strLeft=(String)jpara.get("left");
        
        Map<String,String> mc = codeDealVar(strLeft);
        String strConfigid=mc.get("configid");
        String strParaName=mc.get("paraname");
        String strContent = "";
        if(strConfigid.equalsIgnoreCase(""))
        {
            if(getVarTypeIsSys(strLeft,mvars))
                strContent = "mapPara['"+ strLeft + "']";
            else
                strContent = ""+ strLeft + "";
        }
        else
        {
            if(strLeft.indexOf("wzsoftcom")==0&&strLeft.length()>35) //Control name from the form
            {
                if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
                {
                    String strListField=mc.get("formlistfield");
                    strContent = strContent + strParaName +"['"+ strListField + "']";
                }
                else
                {
                    String strField = getAttrFieldName(strConfigid,strParaName,comAttrsField);
                    strContent = "window.pushDataItem"+ strConfigid + "('"+strField+"',";
                }
            }
            else
            {
                if(strConfigid.endsWith("_entry"))  //Is the iterated item
                    strContent = strConfigid+"['"+ strParaName + "']";
                else
                {
                    if(getVarTypeIsSys(strConfigid,mvars))
                        strContent = "mapPara['"+ strConfigid + "']['"+ strParaName + "']";
                    else
                        strContent = ""+ strConfigid + "['"+ strParaName + "']"; 
                }
            }
        }

        String strRightContent="";
        List<Object> lright=(List<Object>)jpara.get("right");
        for(int j=0;j<lright.size();j++)
        {
            Map<String,String> mr=(Map)lright.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("v"))
            {
                strRightContent = strRightContent + getVarRightNames(forListName,varValue,comAttrsField,mvars);
            }
        }

        if(strLeft.indexOf("wzsoftcom")==0&&strLeft.length()>35) //Control name from the form
        {
            strParaName=mc.get("paraname");
            if(strParaName.endsWith("_entry"))  //Is an item in the form's list during iteration
            {
                strJSContent = strJSContent + "gaddlist("+ strContent + ",gcopyobj(" + strRightContent + "));";
            }
            else
            {
                strJSContent = strJSContent + strContent + "gcopyobj(" + strRightContent + "))";
            }
        }
        else
        {
            strJSContent = strJSContent + "gaddlist("+ strContent + ",gcopyobj(" + strRightContent + "));";
        }

        return strJSContent;
    }
    private String getjsHrefString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,String vi)
    {
        JSONObject jpara = (JSONObject)config.get("para");
        String strJSContent="";

        List<Object> lcon=(List<Object>)jpara.get("con");
        for(int j=0;j<lcon.size();j++)
        {
            Map<String,String> mr=(Map)lcon.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                strJSContent = strJSContent + "\"" + varValue + "\"";
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strJSContent = strJSContent + varValue;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                strJSContent = strJSContent + getVarRightNames(forListName,varValue,comAttrsField,mvars);
            }
        }
        strJSContent = "document.location.href="  + strJSContent + ";";
        return strJSContent;
    }
    private String getjsSrcString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,String vi)
    {
        JSONObject jpara = (JSONObject)config.get("para");
        String strJSContent="";

        List<Object> lcon=(List<Object>)jpara.get("con");
        for(int j=0;j<lcon.size();j++)
        {
            Map<String,String> mr=(Map)lcon.get(j);
            Map.Entry entry = mr.entrySet().iterator().next();
            String varKey = (String)entry.getKey();
            String varValue = (String)entry.getValue();
            if(varKey.equalsIgnoreCase("c"))
            {
                strJSContent = strJSContent + varValue + ";";
            }
            else if(varKey.equalsIgnoreCase("r"))
            {
                strJSContent = strJSContent + "return " + getVarRightNames(forListName,varValue,comAttrsField,mvars) + ";";
            }
        }
        return strJSContent;
    }
    private String getIfString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,Map<String,String> mfuncs,String vi) throws Throwable 
    {
        JSONObject jpara = (JSONObject)config.get("para");
        String strJSContent="";

        List<Object> lcon=(List<Object>)jpara.get("con");
        for(int j=0;j<lcon.size();j++)
        {
            Map<String,String> mr=(Map)lcon.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                strJSContent = strJSContent + "gvalnum('"+varValue+"')";
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strJSContent = strJSContent + varValue;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                strJSContent = strJSContent + getVarRightNames(forListName,varValue,comAttrsField,mvars);
            }
        }
        strJSContent = "if("+ strJSContent + "){";

        List<Object> lexp=(List<Object>)jpara.get("exp");
        for(int j=0;j<lexp.size();j++)
        {
            Map<String,Object> mexp=(Map)lexp.get(j);
            String strType=(String)mexp.get("type");
            strJSContent = strJSContent + getSubCodesFunc(strType,mexp,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        strJSContent = strJSContent + "}";

        lexp=(List<Object>)jpara.get("expfail");
        if(lexp.size()>0)
        {
            strJSContent = strJSContent + "else{";
            for(int j=0;j<lexp.size();j++)
            {
                Map<String,Object> mexp=(Map)lexp.get(j);
                String strType=(String)mexp.get("type");
                strJSContent = strJSContent + getSubCodesFunc(strType,mexp,mvars,forListName,comAttrsField,mfuncs,vi);
                strJSContent = strJSContent + ";";
            }
            strJSContent = strJSContent + "}";
        }
        return strJSContent;
    }

    private String getWhileString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,Map<String,String> mfuncs,String vi) throws Throwable 
    {
        JSONObject jpara = (JSONObject)config.get("para");
        String strJSContent="";

        List<Object> lcon=(List<Object>)jpara.get("con");
        for(int j=0;j<lcon.size();j++)
        {
            Map<String,String> mr=(Map)lcon.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("c"))
            {
                strJSContent = strJSContent + "gvalnum('"+varValue+"')";
            }
            else if(varKey.equalsIgnoreCase("o"))
            {
                strJSContent = strJSContent + varValue;
            }
            else if(varKey.equalsIgnoreCase("v"))
            {
                strJSContent = strJSContent + getVarRightNames(forListName,varValue,comAttrsField,mvars);
            }
        }
        strJSContent = "while ("+ strJSContent + ") {";

        List<Object> lexp=(List<Object>)jpara.get("exp");
        for(int j=0;j<lexp.size();j++)
        {
            Map<String,Object> mexp=(Map)lexp.get(j);
            String strType=(String)mexp.get("type");
            strJSContent = strJSContent + getSubCodesFunc(strType,mexp,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        strJSContent = strJSContent + "}";
        return strJSContent;
    }

    private String getOutSvrString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,Map<String,String> mfuncs,String vi) throws Throwable 
    {
        JSONObject jpara = (JSONObject)config.get("para");
        String strLeftContent = "";
        String strJSContent = "";
        if(!config.containsKey("para"))
            return "";

        if(jpara.containsKey("left"))
        {
            String strLeft=(String)jpara.get("left");
            Map<String,String> mc = codeDealVar(strLeft);
            strLeftContent = getVarLeftNames(mc,forListName,strLeft,comAttrsField,mvars);
        }
        if(jpara.containsKey("url")||jpara.containsKey("urlv"))
        {

            String strHttpUrl = "";
            if(jpara.containsKey("url"))
                strHttpUrl = "svrurl=\""+ jpara.getString("url") +"\";";

            if(jpara.containsKey("urlv"))
                strHttpUrl = "svrurl="+ jpara.getString("urlv") +";";

            String strHttpPara = "var para=JSON.stringify("+ jpara.getString("para") +");";
            String strHttpReturn = "";
            if(!strLeftContent.equals(""))
            {
                strHttpReturn = ";osvrre=datalistService.codeHttpClient(svrurl,para);try{osvrre=JSON.parse(osvrre)}catch(error){};"+ strLeftContent + "=osvrre;";
            }
            else
            {
                strHttpReturn = "datalistService.codeHttpClient(url,para);";
            }
            strJSContent = strJSContent + strHttpUrl + strHttpPara + strHttpReturn;
        }

        return strJSContent;
    }

    private String getForString(Map<String,Object> config,Map<String,Object> mvars,String forListName,Map<String,String> comAttrsField,Map<String,String> mfuncs,String vi)  throws Throwable 
    {
        JSONObject jpara = (JSONObject)config.get("para");
        String strJSContent="";
        String strForListName="";
        //forListName parameter has been deprecated

        // Using 'i' in nested loops causes issues; using GUID-based variable names instead
        vi = "i"+ WSoftUtil.genGuid(null);

        List<Object> lcon=(List<Object>)jpara.get("con");
        for(int j=0;j<lcon.size();j++)
        {
            Map<String,String> mr=(Map)lcon.get(j);
            String varKey;
            String varValue;
            if(mr.containsKey("v"))
            {
                varKey = "v";
                varValue = mr.get("v").toString();
            }
            else
            {
                Map.Entry entry = mr.entrySet().iterator().next();
                varKey = (String)entry.getKey();
                varValue = (String)entry.getValue();
            }
            if(varKey.equalsIgnoreCase("v"))
            {
                Map<String,String> mc = codeDealVar(varValue);
                String strConfigid=mc.get("configid");
                String strParaName=mc.get("paraname");
                if(varValue.indexOf("wzsoftcom")==0&&varValue.length()>35) //Control name from the form
                {
                    String strField = getAttrFieldName(strConfigid,strParaName,comAttrsField);
                    strJSContent = "for("+ vi +"=0;"+ vi +"<window.getDataItem"+ strConfigid + "('"+strField+"').length;"+ vi +"++){var  "+ strParaName +"_entry=window.getDataItem"+ strConfigid + "('"+strField+"')["+ vi +"];";
                }
                else
                {
                    if(getVarTypeIsSys(strParaName,mvars))
                        strJSContent = "for("+ vi +"=0;"+ vi +"<mapPara['"+ strParaName + "'].length;"+ vi +"++){var  "+ strParaName +"_entry=mapPara['"+ strParaName + "']["+ vi +"];";
                    else
                        strJSContent = "for("+ vi +"=0;"+ vi +"<"+ strParaName + ".length;"+ vi +"++){var  "+ strParaName +"_entry="+ strParaName + "["+ vi +"];"; 
                }
            }
        }

        List<Object> lexp=(List<Object>)jpara.get("exp");
        for(int j=0;j<lexp.size();j++)
        {
            Map<String,Object> mexp=(Map)lexp.get(j);
            String strType=(String)mexp.get("type");
            strJSContent = strJSContent + getSubCodesFunc(strType,mexp,mvars,forListName,comAttrsField,mfuncs,vi);
            strJSContent = strJSContent + ";";
        }
        strJSContent = strJSContent + "}";
        return strJSContent;
    }
    
    private Map<String,String> codeDealVar(String varName)
    {
        Map<String,String> mc = new HashMap<String,String>();
        mc.put("formlistfield","");
        String[] strVars = varName.split("\\.");
        if(strVars.length>=2)
        {
            mc.put("configid",strVars[0]);
            mc.put("paraname",strVars[1]);
            if(strVars.length==3)
                mc.put("formlistfield",strVars[2]);
        }
        else
        {
            mc.put("configid","");
            mc.put("paraname",varName);
        }
        return mc;
    }

    public List getinitDataPara(String dataID,String pageID,JSONObject jsonObject)   throws Throwable
    {
        List<Map<String,String>> lreturn = new ArrayList<>();
        String strCodes = "";

        if(!dataID.equals(""))
        {
            String viewCode = "";
            Map<String,Object> mdb =  datalistDao.getDataSingle("select tablename from data where dataid=?",new Object[] {Integer.valueOf(dataID)});
            if(mdb!=null)
            {
                viewCode = mdb.get("tablename").toString();
            }
            else
                return null;

            List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
            if(lview.size()>0)
            {
                Map<String,Object> mview=(Map)lview.get(0);
                strCodes = (String)mview.get("codes");
            }
        }
        else
        {
            Map<String,Object> mdb =  datalistDao.getDataSingle("select codes from page where pageid=?",new Object[] {Integer.valueOf(pageID)});
            if(mdb!=null)
            {
                strCodes = (String)mdb.get("codes");
            }
            else
                return null;
        }

        if(strCodes!=null&&!strCodes.equals(""))
        {
            JSONObject jsonCode = (JSONObject)JSONObject.parse(strCodes);
            if(!jsonCode.getString("inits").equals(""))
            {
                String codeID = jsonCode.getString("inits");
                Map<String,Object> mcode =  datalistDao.getDataSingle("select para from code where guid=?",new Object[] {codeID});
                if(mcode!=null)
                {
                    String parafile = (String)mcode.get("para");
                    String para=WSoftUtil.readCodeFile(parafile);
                    JSONObject jPara = (JSONObject)JSONObject.parse(para);
                    List<Object> lvars=(List<Object>)jPara.get("para");
                    for(int k=0;k<lvars.size();k++)
                    {
                        Map<String,String> mv=(Map)lvars.get(k);
                        String vt = mv.get("type");
                        String vpt = mv.get("ptype");
                        String vn = mv.get("name");
                        if(vpt.equals("global"))
                        {
                            lreturn.add(mv);
                        }
                    }
                }
            }
        }
        return lreturn;
    }
}
