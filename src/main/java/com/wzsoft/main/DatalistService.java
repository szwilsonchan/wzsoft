package com.wzsoft.main;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Date;
import java.sql.Timestamp;
import java.text.NumberFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.apache.http.client.HttpClient;
import org.openjdk.nashorn.api.scripting.ScriptObjectMirror;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.util.ResourceUtils;
import org.springframework.web.client.RestTemplate;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.opencsv.CSVReader;

import ch.qos.logback.core.joran.conditional.ElseAction;


@Service()
public class DatalistService {
    
    @Autowired
    private DatalistDao datalistDao;

    @Autowired
    private RedisCache redisCache;

    @Autowired
    private FileContentService fService;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private RestTemplate restTemplate;

    public String getDataRoleCodeID(String roleID,String rightsType,JSONObject jsonCode)
    {
        List<Object> lcode = (List<Object>)jsonCode.get("rights");
        for(int i=0;i<lcode.size();i++)
        {
            Map<String,String> mc=(Map)lcode.get(i);
            if(roleID.equalsIgnoreCase(mc.get("roleid")))
            {
                return mc.get(rightsType);
            }
        }
        return "";
    }

    public Map<String,String> getDbFieldRights(String viewCode,UserLogin userDetails,Boolean chkWfm, String wfmid,String wfmNodeId) throws Throwable
    {
        Map<String,String> mrv = new HashMap<>();

        String dfHiddenNew = "";
        String dfReadonlyNew = "";

        if(chkWfm&&!wfmid.equals("")&&!wfmNodeId.equals(""))
        {
            String formSetName = "";
            String formSetreadonly = "";
            String formSethidden = "";
            String sql = "select * from wfm where wfmid=? ";
            List datalist = getDatasBySql(sql, new Object[]{wfmid});
            if(datalist.size()>0)
            {
                Map<String,Object> mp=(Map)datalist.get(0);
                String strWfmDatasFile = "";
                String strWfmDatas="";
                if(mp.get("wfmdata")!=null)
                {
                    strWfmDatasFile = mp.get("wfmdata").toString();
                    strWfmDatas = WSoftUtil.readWfmFile(strWfmDatasFile);
                    Map<String,String> mnode = WfmService.getTargetNode(wfmNodeId, JSON.parseObject(strWfmDatas));
                    if(mnode.containsKey("formsetname"))
                    {
                        formSetName = mnode.get("formsetname").toString();
                        if(viewCode.equalsIgnoreCase(formSetName))
                        {
                            formSetreadonly = mnode.get("formsetreadonly").toString();
                            formSethidden = mnode.get("formsethidden").toString();
                        }
                    }
                }
            }
            dfHiddenNew = formSethidden;
            dfReadonlyNew = formSetreadonly;
        }
        else if (!viewCode.equals("")&&viewCode.indexOf("tbl")==0)
        {
            String dfHiddenAll = "";
            String dfReadonlyAll = "";

            String sql = "select codes from data where tablename=? ";
            List datalist = getDatasBySql(sql, new Object[]{viewCode});
            if(datalist.size()>0)
            {
                Map<String,Object> mp=(Map)datalist.get(0);
                String codes = "";
                if(mp.get("codes")!=null&&!mp.get("codes").toString().trim().equals(""))
                {
                    codes = mp.get("codes").toString();
                    JSONObject jsonCode = (JSONObject)JSONObject.parse(codes);
                    List lroles = userDetails.getUser().getRoles();
                    if(lroles==null) lroles = userDetails.getUser().getRolesAll();
                    if(lroles==null) lroles = new ArrayList();
                    for(int j=0;j<lroles.size();j++)
                    {
                        Map<String,Object> mlr=(Map)lroles.get(j);
                        String roleID = mlr.get("ROLEID").toString();
                        String dbFileds = getDataRoleCodeID(roleID,"dbfields",jsonCode);
                        if(dbFileds!=null&&!dbFileds.equals(""))
                        {
                            JSONObject jsonDf = (JSONObject)JSONObject.parse(dbFileds);
                            String dfHidden = "";
                            String dfReadonly ="";
                            if(jsonDf.containsKey("hidden"))
                            {
                                dfHidden = jsonDf.getString("hidden");
                                dfHiddenAll = dfHiddenAll + dfHidden + "," ;
                            }
                            if(jsonDf.containsKey("readonly"))
                            {
                                dfReadonly = jsonDf.getString("readonly");
                                dfReadonlyAll = dfReadonlyAll + dfReadonly+ "," ;
                            }
                        }
                    }
                    dfHiddenAll = WSoftUtil.strDelLastComma(dfHiddenAll);
                    dfReadonlyAll = WSoftUtil.strDelLastComma(dfReadonlyAll);
                }
            }

            //Remove duplicate values
            String dfHiddenArr[]=dfHiddenAll.split(",");
            for(int i=0;i<dfHiddenArr.length;i++)
            {
                String df = dfHiddenArr[i].trim();
                if(dfHiddenNew.indexOf(df)<0)
                {
                    dfHiddenNew = dfHiddenNew + df + ",";
                }
            }
            
            String dfReadonlyArr[]=dfReadonlyAll.split(",");
            for(int i=0;i<dfReadonlyArr.length;i++)
            {
                String df = dfReadonlyArr[i].trim();
                if(dfReadonlyNew.indexOf(df)<0)
                {
                    dfReadonlyNew = dfReadonlyNew + df + ",";
                }
            }

            dfHiddenNew = WSoftUtil.strDelLastComma(dfHiddenNew);
            dfReadonlyNew = WSoftUtil.strDelLastComma(dfReadonlyNew);
        }
        
        mrv.put("hidden", dfHiddenNew);
        mrv.put("readonly", dfReadonlyNew);
        return mrv;

    }

    public void dataFormCopyInit(String dataID,String pageLocation,String tempLocation)  throws Throwable 
    {
        String sql = "insert into data_fields_com(id,comid,dataid,form) select id,comid,dataid,? from DATA_FIELDS_COM where dataid=? and form=?";
        datalistDao.updDatas(sql, new Object[] {pageLocation,dataID,tempLocation});
    }

    public int dataFormDelPage(String viewCode,String itemID)  throws Throwable
    {
        String sql = "select d.dataid,d.tablename,d.tableexist,df.location from data d,data_form df where d.tablename=df.tablename and df.formid=?";
        Map<String,Object> rvalue = datalistDao.getDataSingle(sql, new Object[] {itemID});
        String dataID = rvalue.get("dataid").toString();
        String tablename = rvalue.get("tablename").toString();
        String pageLocation = rvalue.get("location").toString();

        boolean hasData=true;
        if(rvalue.get("tableexist")==null)
        {
            hasData=false;
        }
        else
        {    
            sql = "select " + WSoftUtil.dbSqlTopFirst("1") + " t.* from " + tablename + " t where 1=1 " + WSoftUtil.dbSqlTop("1") ;
            List listCount = datalistDao.getDatas(sql, new Object[]{});
            if(listCount.size()==0)
                hasData=false;
        }

        sql = "select d.id,d.field,d.isinfile,dc.* from data_fields d,data_fields_com dc where d.id=dc.id and dc.dataid=? and dc.form=?" ;
        List ldfc = datalistDao.getDatas(sql, new Object[] {dataID,pageLocation});
        for(int j=0;j<ldfc.size();j++)
        {
            Map<String,Object> mdf = (Map<String,Object>)ldfc.get(j);
            String dataFieldID = mdf.get("id").toString();
            String strFtName = mdf.get("field").toString();
            String strIsinfile = mdf.get("isinfile").toString();
            String strDBField = "select form from DATA_FIELDS_COM where id=?";
            List ldfcsub =  datalistDao.getDatas(strDBField, new Object[]{dataFieldID});
            if(!hasData&&ldfcsub.size()<=1)
            {
                Map<String,Object> mdfc=null;
                if(ldfcsub.size()==1)
                    mdfc = (Map<String,Object>)ldfcsub.get(0);
                if(ldfcsub.size()==0||mdfc.get("form").toString().equalsIgnoreCase(pageLocation))
                {
                    strDBField = "delete from DATA_FIELDS_COM  where id=?";
                    datalistDao.updDatas(strDBField, new Object[]{dataFieldID});

                    strDBField = "delete from DATA_FIELDS  where id=?";
                    datalistDao.updDatas(strDBField, new Object[]{dataFieldID});

                    if(strIsinfile.equals("0"))
                    {
                        strDBField = "alter table "+ tablename +"  DROP COLUMN " + strFtName;
                        datalistDao.updDatas(strDBField, new Object[]{});
                    }
                }
            }
            else
            {
                strDBField = "delete from DATA_FIELDS_COM  where id=? and form=?";
                datalistDao.updDatas(strDBField, new Object[]{dataFieldID,pageLocation});
            }
        }

        String classDir = ResourceUtils.getURL("classpath:").getPath();
        String  webDir = classDir.replaceAll("/WEB-INF/classes", "/manage");
        String  webDirTemp = classDir.replaceAll("/WEB-INF/classes", "/admin/templates");

        String formName = pageLocation.substring(0,pageLocation.length()-5);
        WSoftUtil.delFile(webDir + "form_" + formName + ".html");
        WSoftUtil.delFile(webDir + "genpdf_" + formName + ".html");
        WSoftUtil.delFile(webDirTemp + "temp_" + formName + ".html");
        WSoftUtil.delFile(webDirTemp + "pdf_" + formName + ".html");
        WSoftUtil.delFile(webDirTemp + "json_" + formName + ".txt");

        WSoftUtil.delFile(WSoftUtil.propertyGetPara("pagesManageDir") + "/form_" + formName + ".html");
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("pagesManageDir") + "/genpdf_" + formName + ".html");
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/temp_" + formName + ".html");
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/pdf_" + formName + ".html");
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/json_" + formName + ".txt");

        WSoftUtil.delWebFiles("form_"+formName.toLowerCase()+"_", webDir,"1");

        sql = "delete from data_fields_com where dataid=? and form=?";
        datalistDao.updDatas(sql, new Object[] {dataID,pageLocation});

        sql = "delete from data_form where formid=?";
        int rows = datalistDao.updDatas(sql, new Object[] {itemID});

        return rows;
    }

    public  Map<String,Object> getDataFormField(Boolean checkData, String fieldName,String comID,Integer dataID)  throws Throwable 
    {
        Map<String,Object> mreturn = new HashMap<>();
        String sql ="";
        Map<String,Object>  rvalue =null;
        Map<String,Object>  rvaluesub =null;
        if(checkData)
        {
            sql = "select tablename,tableexist from data where dataid=?";
            rvalue = datalistDao.getDataSingle(sql, new Object[] {dataID});
            Map<String,Object> mp = (Map<String,Object>)rvalue;
            String tableName = (String)mp.get("tablename");
            if(mp.get("tableexist")==null)
            {
                mreturn.put("count",0);
                return mreturn;
            }
            sql = "select " + WSoftUtil.dbSqlTopFirst("1") + " t.* from " + tableName + " t where 1=1 " +WSoftUtil.dbSqlTop("1") ;
            List listCount = datalistDao.getDatas(sql, new Object[]{});
            mreturn.put("count",listCount.size());
        }

        sql = "select id from data_fields_com where dataid=? and comID=?";
        rvalue = datalistDao.getDataSingle(sql, new Object[] {dataID,comID});
        if(rvalue==null)
        {
            sql = "select * from data_fields where dataid=? and field=?";
            rvalue = datalistDao.getDataSingle(sql, new Object[] {dataID,fieldName});
        }
        else
        {
            Map<String,Object> mid = (Map<String,Object>)rvalue;
            String dfid = String.valueOf(mid.get("id"));
            sql = "select * from data_fields where dataid=? and id=?";
            rvalue = datalistDao.getDataSingle(sql, new Object[] {dataID,dfid});

            //Check if the modified field already exists; if so, use it as primary, since the pre-modification field will be deleted
            sql = "select * from data_fields where dataid=? and field=?";
            rvaluesub = datalistDao.getDataSingle(sql, new Object[] {dataID,fieldName});
            if(rvaluesub!= null&&rvalue!=null)
            {
                if(!rvaluesub.get("id").toString().equals(rvalue.get("id").toString()))
                {
                    rvalue = rvaluesub;
                }
            }
        }
        
        if(rvalue!=null)
        {
            Map<String,Object> mdf = (Map<String,Object>)rvalue;
            mreturn.put("id",mdf.get("id"));
            mreturn.put("fieldname",mdf.get("field"));
            mreturn.put("dbtype",mdf.get("db_type")); 
            mreturn.put("dblen",mdf.get("db_length"));
            mreturn.put("isinfile",mdf.get("isinfile"));
            mreturn.put("fieldindb",mdf.get("fieldindb"));

            sql = "select id from data_fields where dataid=? and field=?";
            rvalue = datalistDao.getDataSingle(sql, new Object[] {dataID,mdf.get("field").toString()+"STXT"});
            if(rvalue!=null)
            {
                mdf = (Map<String,Object>)rvalue;
                mreturn.put("txtid",mdf.get("id")); 
            }
        }
        return mreturn;
    }
    public String codePubSubmitWfm(String viewCode, String itemID,String wfmGuid,String obj)  throws Throwable {

        WfmRestController myCon = applicationContext.getBean(WfmRestController.class);
        return myCon.submitWfmDiy(viewCode, itemID, wfmGuid, obj);
    }
    public String codePubSvrDo(String url, String obj)  throws Throwable {

        JSONObject jsonParam = JSONObject.parseObject(obj);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(jsonParam.toString(), headers);
        String result = restTemplate.postForObject(url, entity, String.class);
        return result;
    }
    public String codePubPropertyGet(String k)  throws Throwable {

        String str = WSoftUtil.propertyGetPara(k);
        return str;
    }
    public void codePubPropertySet(String k,String v)  throws Throwable {

        WSoftUtil.propertySetPara(k,v);
    }
    public String codePubListToStr(Object lst)  throws Throwable {

        ArrayList arr = (ArrayList)lst;
        String str = JSONObject.toJSONString(arr);
        return str;
    }
    public String codePubMapToStr(Object obj)  throws Throwable {

        String str = JSONObject.toJSONString(obj);
        return str;
    }
    public List codePubReadCsv(String fileID)  throws Throwable {

        ArrayList arr = new ArrayList<>();

        List list = datalistDao.getDatasWeb("select filepath from filecontent where fileguid=?", new Object[]{fileID});
        Map<String,Object> mf = new HashMap<>();
        String filePath = "";
        if(list.size()>0)
        {
            mf= (Map)list.get(0);
            filePath=mf.get("filepath").toString();
        }
        if(!filePath.equals(""))
        {
            filePath = WSoftUtil.propertyGetPara("datafilesDir")+ "/"+filePath;
        }
        else
        {
            return arr;
        }

        try {


            CSVReader reader = new CSVReader(new FileReader(filePath));
            List<String[]> myEntries = reader.readAll();
            reader.close();
 
            for (String[] row : myEntries) 
            {   
                int i=0;
                Map<String,Object> mc = new HashMap<>();
                for (String item : row) {
                    mc.put("K"+Integer.valueOf(i),item); 
                    i=i+1;
                }
                arr.add(mc);
            }
 
        } catch (Exception e) 
        {
            throw new RuntimeException("Error on CSV Reading:"+e.getMessage());
        }

        return arr;
    }
    public Object[] codeUpdDealParaAll(Object args)  throws Throwable {

        List<Object> lsub = new ArrayList<>();
        Class cls = args.getClass();
        if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
        {
            ScriptObjectMirror jsOriginal = (ScriptObjectMirror)args;
            if (jsOriginal.isArray()) 
            {
                Integer length = (Integer)jsOriginal.get("length");
                for (int i = 0; i < length; i++) {
                    codeDealPara(lsub,jsOriginal.get(""+Integer.toString(i)));
                }
            }
        }
        Object[] argssub = new Object[lsub.size()];
        for(int j=0;j<lsub.size();j++)
        {
            argssub[j]= lsub.get(j); 
        }
        return argssub;
    }
    public int codeUpdDatas(String sql,String tbl,Object args)  throws Throwable {

        Object[] argssub = codeUpdDealParaAll(args);
        int rows = datalistDao.updDatas(sql, argssub);
        WSoftUtil.dbUpdDataUpdTime(datalistDao, tbl);
        return rows;
    }
    public Map<String,Object> codeGetDataSingle(String sql,Object[] args,String topItems) throws Throwable {

        if(topItems!=null&&(!topItems.trim().equalsIgnoreCase("")))
        {
            if(WSoftUtil.dbSqlIsOracle())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else if(WSoftUtil.dbSqlIsMysql())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a "; 
            else if(WSoftUtil.dbSqlIsKingbase())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a ";
            else  if(WSoftUtil.dbSqlIsDm())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else  if(WSoftUtil.dbSqlIsSqlserver())
                sql = "select top "+ topItems +" from (" + sql +") tbltop ";
        }

        Map<String,Object> mp = new HashMap<>();
        List list = datalistDao.getDatasWeb(sql, args);
        if(list.size()>0)
        {
            mp= (Map)list.get(0);
        }
        if(mp==null)
        {
            mp = new HashMap<>();
        }
        return mp;
    }
    public Map<String,Object> codeGetDataSingleCache(String sql,Object[] args,String topItems,Object configPara) throws Throwable {

        if(topItems!=null&&(!topItems.trim().equalsIgnoreCase("")))
        {
            if(WSoftUtil.dbSqlIsOracle())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else if(WSoftUtil.dbSqlIsMysql())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a "; 
            else if(WSoftUtil.dbSqlIsKingbase())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a ";
            else  if(WSoftUtil.dbSqlIsDm())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else  if(WSoftUtil.dbSqlIsSqlserver())
                sql = "select top "+ topItems +" from (" + sql +") tbltop ";
        }

        Map<String,Object> mp = new HashMap<>();
        List list=null;
        
        Boolean needCache=false;
        String dbRedisConfig="";
        long dbRedisExpires = 0;
        dbRedisConfig = WSoftUtil.dbRedisConfig("gDataRedisTime", redisCache);
        if(dbRedisConfig!=null&&!dbRedisConfig.equals(""))
        {
            dbRedisExpires = Long.valueOf(dbRedisConfig);
            if(dbRedisExpires>0)
                needCache = true;
        }

        if(needCache)
        {
            String viewTbls = "";
            ScriptObjectMirror jsOriginal = null;
            HashMap<String,String> mpTables = new HashMap<>();
            if(configPara.getClass().getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
            {
                ScriptObjectMirror mrights = (ScriptObjectMirror)configPara;
                jsOriginal = (ScriptObjectMirror)mrights.get("tblInPara");
                viewTbls = mrights.get("tblsdb").toString().trim();
            }
            else
            {
                Map<String,Object> mrights= (Map<String,Object>)configPara;
                viewTbls = mrights.get("tblsdb").toString().trim();
            }

            if(!viewTbls.equals(""))
            {
                String tblnames[]=viewTbls.split(",");
                for(int i=0;i<tblnames.length;i++)
                {
                    String tblName="";
                    Integer ias = tblnames[i].trim().indexOf(" ");
                    if(ias>0)
                    {
                        tblName = tblnames[i].substring(0,ias);
                        if(!mpTables.containsKey(tblName.toLowerCase()))
                        {
                            mpTables.put(tblName.toLowerCase(),"");
                        }
                    }
                    else
                    {
                        mpTables.put(tblnames[i].toLowerCase(),""); 
                    }
                }
            }

            if (jsOriginal!=null&&jsOriginal.isArray()) 
            {
                Integer length = (Integer)jsOriginal.get("length");
                for (int i = 0; i < length; i++) 
                {
                    ScriptObjectMirror jsTabInPara = (ScriptObjectMirror)jsOriginal.get(""+Integer.toString(i));
                    if (jsTabInPara.isArray()) 
                    {
                        Integer tlen = (Integer)jsTabInPara.get("length");
                        for (int j = 0; j < tlen; j++) 
                        {
                            String tblInName = jsTabInPara.get(""+Integer.toString(j)).toString();
                            Integer ias = tblInName.trim().indexOf(" ");
                            if(ias>0)
                            {
                                tblInName = tblInName.substring(0,ias);
                                if(!mpTables.containsKey(tblInName.toLowerCase()))
                                {
                                    mpTables.put(tblInName.toLowerCase(),"");
                                }
                            }
                        }
                    }
                }
            }

            String encodeLdata = WSoftUtilBase64.encodeBase64(sql+"_"+JSON.toJSONString(args));
            Map<String,Object> reLdata = null;
            reLdata = redisCache.getCacheMap("ldback:"+encodeLdata);
            if(reLdata.size()>0&&!WSoftUtil.dbComDataUpdTime(datalistDao,reLdata,mpTables))
            {
                list = (List)reLdata.get("obj");
            }
            else
            {
                list = datalistDao.getDatasWeb(sql, args);
                Map<String,Object> mpCache = new HashMap<>();
                java.util.Date curDate = new java.util.Date();
                Timestamp curTime = new Timestamp(curDate.getTime());
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String strTime  = sdf.format(curTime);

                mpCache.put("updtime",strTime);
                mpCache.put("obj",list);
                redisCache.setCacheMap("ldback:"+encodeLdata, mpCache);
                redisCache.expire("ldback:"+encodeLdata, dbRedisExpires);
            }
        }
        else
        {
            list = datalistDao.getDatasWeb(sql, args);  
        }

        if(list.size()>0)
        {
            mp= (Map)list.get(0);
        }
        if(mp==null)
        {
            mp = new HashMap<>();
        }
        return mp;
    }
    public List codeGetDatas(String sql,Object[] args,String topItems)  throws Throwable {

        if(topItems!=null&&(!topItems.trim().equalsIgnoreCase("")))
        {
            if(WSoftUtil.dbSqlIsOracle())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else if(WSoftUtil.dbSqlIsMysql())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a "; 
            else if(WSoftUtil.dbSqlIsKingbase())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a ";
            else  if(WSoftUtil.dbSqlIsDm())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else  if(WSoftUtil.dbSqlIsSqlserver())
                sql = "select top "+ topItems +" from (" + sql +") tbltop ";
        }

        List list = datalistDao.getDatasWeb(sql, args);

        return list;
    }
    public List codeGetDatasCache(String sql,Object[] args,String topItems,Object configPara)  throws Throwable {

        List list = null;
        if(topItems!=null&&(!topItems.trim().equalsIgnoreCase("")))
        {
            if(WSoftUtil.dbSqlIsOracle())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else if(WSoftUtil.dbSqlIsMysql())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a "; 
            else if(WSoftUtil.dbSqlIsKingbase())
                sql = "select a.* from (" + sql +" limit 0," + topItems +  ") a ";
            else  if(WSoftUtil.dbSqlIsDm())
                sql = "select rownum rt,tbltop.* from (" + sql +") tbltop where rownum<=" + topItems +  " ";
            else  if(WSoftUtil.dbSqlIsSqlserver())
                sql = "select top "+ topItems +" from (" + sql +") tbltop ";
        }

        Boolean needCache=false;
        String dbRedisConfig="";
        long dbRedisExpires = 0;
        dbRedisConfig = WSoftUtil.dbRedisConfig("gDataRedisTime", redisCache);
        if(dbRedisConfig!=null&&!dbRedisConfig.equals(""))
        {
            dbRedisExpires = Long.valueOf(dbRedisConfig);
            if(dbRedisExpires>0)
                needCache = true;
        }

        if(needCache)
        {
            String viewTbls = "";
            ScriptObjectMirror jsOriginal = null;

            HashMap<String,String> mpTables = new HashMap<>();
            if(configPara.getClass().getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
            {
                ScriptObjectMirror mrights = (ScriptObjectMirror)configPara;
                jsOriginal = (ScriptObjectMirror)mrights.get("tblInPara");
                viewTbls = mrights.get("tblsdb").toString().trim();
            }
            else
            {
                Map<String,Object> mrights= (Map<String,Object>)configPara;
                viewTbls = mrights.get("tblsdb").toString().trim();
            }

            if(!viewTbls.equals(""))
            {
                String tblnames[]=viewTbls.split(",");
                for(int i=0;i<tblnames.length;i++)
                {
                    String tblName="";
                    Integer ias = tblnames[i].trim().indexOf(" ");
                    if(ias>0)
                    {
                        tblName = tblnames[i].substring(0,ias);
                        if(!mpTables.containsKey(tblName.toLowerCase()))
                        {
                            mpTables.put(tblName.toLowerCase(),"");
                        }
                    }
                    else
                    {
                        mpTables.put(tblnames[i].toLowerCase(),""); 
                    }
                }
            }

            if (jsOriginal!=null&&jsOriginal.isArray()) 
            {
                Integer length = (Integer)jsOriginal.get("length");
                for (int i = 0; i < length; i++) 
                {
                    ScriptObjectMirror jsTabInPara = (ScriptObjectMirror)jsOriginal.get(""+Integer.toString(i));
                    if (jsTabInPara.isArray()) 
                    {
                        Integer tlen = (Integer)jsTabInPara.get("length");
                        for (int j = 0; j < tlen; j++) 
                        {
                            String tblInName = jsTabInPara.get(""+Integer.toString(j)).toString();
                            Integer ias = tblInName.trim().indexOf(" ");
                            if(ias>0)
                            {
                                tblInName = tblInName.substring(0,ias);
                                if(!mpTables.containsKey(tblInName.toLowerCase()))
                                {
                                    mpTables.put(tblInName.toLowerCase(),"");
                                }
                            }
                        }
                    }
                }
            }

            String encodeLdata = WSoftUtilBase64.encodeBase64(sql+"_"+JSON.toJSONString(args));
            Map<String,Object> reLdata = null;
            reLdata = redisCache.getCacheMap("ldback:"+encodeLdata);
            if(reLdata.size()>0&&!WSoftUtil.dbComDataUpdTime(datalistDao,reLdata,mpTables))
            {
                list = (List)reLdata.get("obj");
                return list;
            }
            else
            {
                list = datalistDao.getDatasWeb(sql, args);

                Map<String,Object> mpCache = new HashMap<>();
                java.util.Date curDate = new java.util.Date();
                Timestamp curTime = new Timestamp(curDate.getTime());
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String strTime  = sdf.format(curTime);

                mpCache.put("updtime",strTime);
                mpCache.put("obj",list);
                redisCache.setCacheMap("ldback:"+encodeLdata, mpCache);
                redisCache.expire("ldback:"+encodeLdata, dbRedisExpires);
                return list;
            }
        }
        else
        {
            return datalistDao.getDatasWeb(sql, args);
        }

    }
    public void codeDebugLog(String objName,Object obj) throws Throwable {

        String objType="";
        String objValue="";

        try
        {
            if(obj==null)
            {
                objType = "Empty";
                objValue="null";
            }
            else
            {
                objValue = JSON.toJSONString(obj); 
                if(objValue.equals(""))
                    objType = "Empty String";
                else if(objValue.equals("{}"))
                {
                    objType = "Empty Object";
                    Class cls = obj.getClass();
                    if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
                    {
                        ScriptObjectMirror jsOriginal = (ScriptObjectMirror)obj;
                        if (jsOriginal.isArray()) 
                        {
                            objType = "Empty Object List";
                            objValue="[]";
                        }
                        else
                        {
                            objValue = obj.toString();
                        }
                    }
                }
                else if(objValue.equals("[]"))
                {
                    objType = "Empty Object List";
                }
                else
                {
                    objType = "Object";
                }
            }
            Map<String,Object> mp = new HashMap<>();
            mp.put("name",objName);
            mp.put("type",objType);
            mp.put("value",objValue);


            Map<String,Object> mr = null;
            mr = redisCache.getCacheMap("codedebuglog");

            List lstLog = null;
            if(mr.size()>0)
            {
                lstLog = (List)mr.get("list");
                if(lstLog.size()>1000)
                    lstLog = new ArrayList<Map<String,Object>>(); 
            }
            else
            {
                lstLog = new ArrayList<Map<String,Object>>(); 
            }
            lstLog.add(mp);
            mr.put("list",lstLog);
            redisCache.setCacheMap("codedebuglog", mr);


        }
        catch(Exception e)
        {

        }
        
    }
    public Integer codeInsDatas(String tbl,String insSql,Object args) throws Throwable {

        String dataid = "0";
        if(tbl.toLowerCase().indexOf("tbl")==0||tbl.toLowerCase().equals("org")||tbl.toLowerCase().equals("dept")||tbl.toLowerCase().equals("psn"))
        {
            Map<String,Object> mp = datalistDao.getDataSingle("select pkey from data where tablename=?", new Object[] {tbl});
            String pkey = mp.get("pkey").toString();
            dataid =  WSoftUtil.dbSqlAutoIDGet(datalistDao,tbl,pkey);
            insSql = insSql.replaceAll(" \\(id,", " \\("+ pkey+",");
            insSql = insSql.replaceAll("@dataid@", dataid);
        }

        Object[] argssub = codeUpdDealParaAll(args);
        int autoid = datalistDao.addDatas(insSql, argssub);
        if(WSoftUtil.dbSqlIsMysql()&&autoid>0)
        {
            dataid = String.valueOf(autoid);
        }

        WSoftUtil.dbUpdDataUpdTime(datalistDao, tbl);
        return Integer.parseInt(dataid);
    }
    public String codeHttpClient(String url,String para) throws Throwable 
    {
        String strReturn;
        HttpClient httpClient = null;
        httpClient = new HTTPSTrustClient().init();
        strReturn = HTTPSClientUtil.doPostJson(httpClient, url, para);
        return strReturn;
    }
    public List getDatasBySql(String sql,Object[] args)  throws Throwable {

        return datalistDao.getDatas(sql, args);
    }
    public int updDatasBySql(String sql,Object[] args)  throws Throwable {

        return datalistDao.updDatas(sql, args);
    }
    public Integer codeMsgAdd(Map<String,Object> mt)  throws Throwable 
    {
        String toAddr = "";
        String msgTempID="";
        String msgTitle="";
        String msgContent="";
        String msgType="";
        String msgContentPara="";
        String isNow="";
        String logoImg = LoginRestController.gWebSiteURL + "/upload/logo.png";

        UserLogin userDetails=null;
        if(SecurityContextHolder.getContext().getAuthentication()!=null&&!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }

        Set<String> mtset = mt.keySet();
        for (String keyt : mtset) 
        {
            if(keyt.indexOf("msg#")==0)
            {
                String k = keyt.substring(4);
                if(k.equalsIgnoreCase("toaddr"))
                {
                    if(mt.get(keyt)!=null)
                    {
                        Object ov = mt.get(keyt);
                        if(WSoftUtil.isDouble(ov))
                        {
                            NumberFormat nf = NumberFormat.getInstance();
                            nf.setGroupingUsed(false);
                            toAddr = nf.format(ov);
                        }
                        else
                        {
                            toAddr = String.valueOf(ov);
                        }
                    }
                }

                if(k.equalsIgnoreCase("tempid"))
                {
                    msgTempID = mt.get(keyt).toString();
                }

                if(k.equalsIgnoreCase("content"))
                    msgContentPara = mt.get(keyt).toString();
            }
        }

        if(toAddr.equals(""))
        {
            return 0;
        }
        
        if(msgContentPara.trim().equals(""))
        {
            Map<String,Object> msg = datalistDao.getDataSingle("select * from msg_template where guid=?", new Object[]{msgTempID});
            msgTitle=msg.get("msgtitle").toString();
            msgType=msg.get("msgtype").toString();
            msgContent=msg.get("msgcontent").toString();
            isNow = msg.get("isnow").toString();
        }
        else
        {
            JSONObject jPara = JSONObject.parseObject(msgContentPara);
            msgTitle=jPara.getString("title");
            msgType=jPara.getString("type");
            msgContent=jPara.getString("content");
        }

        for (String keyt : mtset) 
        {
            if(keyt.indexOf("msg#")==0)
            {
                String k = keyt.substring(4);
                Object ov = mt.get(keyt);
                String v = "";
                if(WSoftUtil.isDouble(ov))
                {
                    NumberFormat nf = NumberFormat.getInstance();
                    nf.setGroupingUsed(false);
                    v = nf.format(ov);
                }
                else
                {
                    v = String.valueOf(ov);
                }
                msgTitle = msgTitle.replaceAll("\\[@"+ k.toUpperCase() +"@\\]", Matcher.quoteReplacement(v));
                msgContent = msgContent.replaceAll("\\[@"+ k.toUpperCase() +"@\\]", Matcher.quoteReplacement(v));
            }
        }
        msgContent = msgContent.replaceAll("\\[@logoimg@\\]", Matcher.quoteReplacement(logoImg));
        
        String viewCode = "";
        JSONObject jMsg = new JSONObject();
        jMsg.put("field_toaddr",toAddr);
        jMsg.put("field_title",msgTitle);
        jMsg.put("field_content",msgContent);
        if(userDetails!=null)
            jMsg.put("field_psnid",userDetails.getUser().getId());
        else
            jMsg.put("field_psnid",0);

        if(msgType.equals("m"))
            viewCode = "msg_mail";
        else
            viewCode = "msg_msg";

        List<Map<String,Object>> lreturn = (List)this.addDatas(viewCode, jMsg);
        Map<String,Object> mreturn = (Map<String,Object>)lreturn.get(0);
        String mid = String.valueOf(mreturn.get("pid"));

        if(isNow.equals("1")&&msgType.equals("p"))
        {
            MsgService.sendMsgSingle(mid, "0", toAddr,msgContent,datalistDao);
        }

        return Integer.valueOf(mid);

    }
    private  Map<String,Object> codeUpdView(List datas,List fieldTitles,String sql,List larg,UserLogin userDetails,String codes,String strCodeType,JSONObject jsonObject,String tblsIn) throws Throwable 
    {
        Map<String,Object> mreturn = new HashMap<>();

        if(codes!=null&&!codes.trim().equalsIgnoreCase(""))
        {
            JSONObject jsonCode = (JSONObject)JSONObject.parse(codes);
            if(jsonCode.getString(strCodeType)!=null&&!jsonCode.getString(strCodeType).equals(""))
            {
                String codeID = jsonCode.getString(strCodeType);

                Map<String,String> mpSource = new HashMap<>();
                mpSource.put("source","");
                WSoftUtil.codeGetSources(this, codeID, mpSource, false,redisCache);
                String strSource = mpSource.get("source");

                if(!strSource.equals(""))
                {

                    ScriptEngineManager factory = new ScriptEngineManager();
                    ScriptEngine engine = factory.getEngineByName("JavaScript");
                    Bindings bind = engine.createBindings();  
                    engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                    Map<String,Object> mapPara = new HashMap<>();

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
                    }

                    mapPara.put("queriedDataList",datas);
                    mapPara.put("queriedDataTitle",fieldTitles);
                    if(sql.indexOf("where 1=1 and")==0)
                    {
                        sql = sql.substring(14);
                    }
                    mapPara.put("queriedFilterSql",sql);
                    mapPara.put("queriedFilterParams",null);

                    Set<String> jsonset = jsonObject.keySet();
                    for (String key : jsonset) 
                    {
                        if(key.indexOf("pageParam_")==0)
                        {
                            mapPara.put(key,WSoftUtil.getURLDecoderString(jsonObject.getString(key)));
                        }
                    }

                    bind.put("mapPara", mapPara); 
                    bind.put("datalistService", this); 
                    
                    try 
                    {  
                        String tblInNames="";
                        if(!tblsIn.equals(""))
                        {
                            String tblnames[]=tblsIn.split(",");
                            for(int i=0;i<tblnames.length;i++)
                            {
                                String tblName=tblnames[i];
                                tblInNames = tblInNames + "'" + tblName + "',";
                            }
                            tblInNames=WSoftUtil.strDelLastComma(tblInNames);
                        }

                        String sourceSub = "var filterParaTemp=[];mapPara['queriedFilterParams']=filterParaTemp;var tblInParaTemp=["+ tblInNames +"];mapPara['queriedTblIn']=tblInParaTemp;";
                        engine.eval(sourceSub); 
                        
                        ScriptObjectMirror jsOriginal = (ScriptObjectMirror)mapPara.get("queriedFilterParams");
                        if (jsOriginal.isArray()) 
                        {
                            Integer length = larg.size();
                            for (int i = 0; i < length; i++) {
                                jsOriginal.put(String.valueOf(i),larg.get(i));
                            }
                        }
                        mapPara.put("queriedFilterParams",jsOriginal);

                        //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                        CompiledScript script = ((Compilable) engine).compile(strSource);
                        script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                        //engine.eval(strSource); 

                        for(Map.Entry<String,Object> entry:mapPara.entrySet())
                        {
                            if(entry.getKey().indexOf("globalParam_")==0)
                            {
                                mreturn.put(entry.getKey(),entry.getValue());
                                if(entry.getValue()!=null)
                                {
                                    Class cls = entry.getValue().getClass();
                                    if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
                                    {
                                        jsOriginal = (ScriptObjectMirror)entry.getValue();
                                        if (jsOriginal.isArray()) 
                                        {
                                            List<Object> lsub = new ArrayList<>();
                                            Integer length = (Integer)jsOriginal.get("length");
                                            for (int i = 0; i < length; i++) {
                                                lsub.add(jsOriginal.get(""+Integer.toString(i)));
                                            }
                                            mreturn.put(entry.getKey(),lsub);
                                        }
                                    }
                                }
                            }
                        }
                        return mreturn;
                    } catch (Exception e) 
                    {  
                        e.printStackTrace();
                        String strError = "[CodeID]"+codeID+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
                        throw new RuntimeException("Save code execution error:"+strError);
                    } 
                }
            }
            return mreturn;
        }
        return mreturn;
    }

    public void codeRedisConfigSet(String k,String v)
    {
        redisCache.setCacheObject(k, v);
    }

    public String codeRedisConfigGet(String k)
    {
        Object rv = redisCache.getCacheObject(k);
        if(rv==null)
        {
            return "";
        }
        else
        {
            return rv.toString();
        }
    }

    private void codeDealPara(List<Object> larg,Object obj)
    {
        if(obj==null)
        {
            larg.add(obj);
            return;
        }

        Class cls = obj.getClass();
        if(cls.getName().equals("java.lang.String"))
        {
            String strPara = (String)obj;
            if(WSoftUtil.dataDateCheck(strPara))
            {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                java.sql.Date sDate = null;
                try 
                {
                    java.util.Date dateTmp = sdf.parse(strPara);
                    sDate = new java.sql.Date(dateTmp.getTime());
                    larg.add(sDate);
                } catch (ParseException e) {
                    e.printStackTrace();
                }
            }
            else if(WSoftUtil.dataDatetimeCheck(strPara))
            {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                java.sql.Timestamp sDate = null;
                try 
                {
                    java.util.Date dateTmp = sdf.parse(strPara);
                    sDate = new java.sql.Timestamp(dateTmp.getTime());
                    larg.add(sDate);
                } catch (ParseException e) {
                    e.printStackTrace();
                }
            }
            else
            {
                larg.add(obj); 
            }
        }
        else if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
        {
            String strj = JSON.toJSONString(obj);
            if(strj.equals("{}"))
            {
                ScriptObjectMirror jsObj = (ScriptObjectMirror)obj;
                if(jsObj.isArray())
                {
                    larg.add("[]"); 
                }
                else
                {
                    try 
                    {
                        Double timestampLocalTime = (Double)jsObj.callMember("getTime");
                        long time = WSoftUtil.convertDouble2Long(timestampLocalTime);
                        java.sql.Timestamp sDate = null;
                        sDate = new java.sql.Timestamp(time);
                        larg.add(sDate);
                    }
                    catch (Exception e) {
                        larg.add("{}"); 
                    }
                }
            }
            else
            {
                larg.add(strj); 
            }
        }
        else if(cls.getName().equals("java.lang.Double"))
        {
            String paramValue = obj.toString();
            if(obj.toString().endsWith(".0"))
            {
                paramValue=paramValue.substring(0,paramValue.length()-2);
            }
            larg.add(paramValue);
        }
        else
        {
            larg.add(obj);  
        }

    }
    private String codeUpd(JSONObject jsonObject,String itemID,UserLogin userDetails,ScriptEngineManager factory,ScriptEngine engine,String codes,String strCodeType) throws Throwable 
    {
        if((userDetails!=null&&userDetails.getUser().getId()==1))
            return "";

        if(codes!=null&&!codes.trim().equalsIgnoreCase(""))
        {
            JSONObject jsonCode = (JSONObject)JSONObject.parse(codes);
            if(jsonCode.getString(strCodeType)!=null&&!jsonCode.getString(strCodeType).equals(""))
            {
                String codeID = jsonCode.getString(strCodeType);

                Map<String,String> mpSource = new HashMap<>();
                mpSource.put("source","");
                WSoftUtil.codeGetSources(this, codeID, mpSource, false,redisCache);
                String strSource = mpSource.get("source");

                if(!strSource.equals(""))
                {
                    Bindings bind = engine.createBindings();  
                    engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                    Map<String,Object> mapPara = new HashMap<>();

                    Set<String> jsonset = jsonObject.keySet();
                    for (String key : jsonset) 
                    {
                        if(key.indexOf("field_")==0)
                        {
                            mapPara.put(key,jsonObject.get(key));
                        }
                    }
                    mapPara.put("globalParam_dataId",itemID);
                    mapPara.put("globalParam_dataItems",jsonset);
                    mapPara.put("_returnVal_","");

                    if(userDetails==null)
                    {
                        mapPara.put("visitorId",-1);
                        mapPara.put("visitorDeptId",-1);
                        mapPara.put("visitorOrgId",-1);
                        mapPara.put("visitorRoles","");
                    }
                    else
                    {
                        mapPara.put("visitorId",userDetails.getUser().getId());
                        mapPara.put("visitorDeptId",userDetails.getUser().getDeptId());
                        mapPara.put("visitorOrgId",userDetails.getUser().getOrgId());
                        mapPara.put("visitorRoles",userDetails.getUser().getRoleIDs());
                    }
                    
                    bind.put("mapPara", mapPara); 
                    bind.put("datalistService", this); 
                    
                    try 
                    {  
                        //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                        CompiledScript script = ((Compilable) engine).compile(strSource);
                        script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                        //engine.eval(strSource);

                        if(strCodeType.equals("beforeupd"))
                        {
                            for (String key : jsonset) 
                            {
                                if(key.indexOf("field_")==0)
                                {
                                    Object revalue = mapPara.get(key);
                                    if(revalue!=null)
                                    {
                                        Class cls = revalue.getClass();
                                        if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
                                        {
                                            ScriptObjectMirror jsOriginal = (ScriptObjectMirror)revalue;
                                            if (jsOriginal.isArray()) 
                                            {

                                            }
                                            else
                                            {
                                                ScriptObjectMirror jsObj = (ScriptObjectMirror)revalue;
                                                Double timestampLocalTime = (Double)jsObj.callMember("getTime");
                                                long time = WSoftUtil.convertDouble2Long(timestampLocalTime);
                                                java.sql.Timestamp sDate = null;
                                                sDate = new java.sql.Timestamp(time);
                                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                                                String strDate = sdf.format(sDate);
                                                revalue = strDate;
                                            }
                                        }
                                    }
                                    jsonObject.put(key,revalue);
                                }
                            }
                        }

                        return (String)mapPara.get("_returnVal_");

                    } catch (Exception e) 
                    {  
                        e.printStackTrace();
                        String strError = "[CodeID]"+codeID+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
                        throw new RuntimeException("Save code execution error:"+strError);
                    } 
                }
            }
            return "";
        }
        return "";
    }
    private String getDataRights(String tblname,UserLogin userDetails,ScriptEngineManager factory,ScriptEngine engine,String codes,String rightsType,List<Object> larg) throws Throwable 
    {
        if(userDetails.getUser().getId()==1)
            return "";

        String strSqlFilter = "";
        if(codes!=null&&!codes.trim().equalsIgnoreCase(""))
        {
            JSONObject jsonCode = (JSONObject)JSONObject.parse(codes);
            List lroles = userDetails.getUser().getRoles();

            for(int j=0;j<lroles.size();j++)
            {
                Map<String,Object> mr=(Map)lroles.get(j);
                String roleID = mr.get("ROLEID").toString();
                String codeID = getDataRoleCodeID(roleID,rightsType,jsonCode);
                String selRight = getDataRoleCodeID(roleID,"sel"+rightsType,jsonCode);
                if(selRight.equals(""))
                {
                    strSqlFilter = strSqlFilter + " ("+tblname+".syspsnid=?)  or ";
                    larg.add(userDetails.getUser().getId());
                }
                else if(selRight.equals("1"))
                {
                    strSqlFilter = strSqlFilter + " ("+tblname+".sysdeptid in (select deptid from dept where deptid=? or pid=?))  or ";
                    larg.add(userDetails.getUser().getDeptId());
                    larg.add(userDetails.getUser().getDeptId());
                }
                else if(selRight.equals("2"))
                {
                    strSqlFilter = strSqlFilter + " ("+tblname+".sysorgid=?)  or ";
                    larg.add(userDetails.getUser().getOrgId());
                }
                else if(selRight.equals("3"))
                {
                    strSqlFilter = strSqlFilter + " (1=1)  or ";
                }
                else if(selRight.equals("4"))
                {

                    if(codeID.equals(""))
                        break;

                    Map<String,String> mpSource = new HashMap<>();
                    mpSource.put("source","");
                    WSoftUtil.codeGetSources(this, codeID, mpSource, false,redisCache);
                    String strSource = mpSource.get("source");

                    if(!strSource.equals(""))
                    {
                        Bindings bind = engine.createBindings();  
                        engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                        Map<String,Object> mapPara = new HashMap<>();
                        mapPara.put("_returnVal_","");
                        mapPara.put("visitorId",userDetails.getUser().getId());
                        mapPara.put("visitorDeptId",userDetails.getUser().getDeptId());
                        mapPara.put("visitorOrgId",userDetails.getUser().getOrgId());
                        mapPara.put("visitorRoles",userDetails.getUser().getRoleIDs());

                        bind.put("mapPara", mapPara); 
                        bind.put("datalistService", this); 
                        
                        try 
                        {  
                            //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                            CompiledScript script = ((Compilable) engine).compile(strSource);
                            script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                            //engine.eval(strSource); 

                            if(!mapPara.get("_returnVal_").toString().equals(""))
                            {
                                Map<String,Object> mrp = (Map<String,Object>)mapPara.get("_returnVal_");
                                if(mrp.containsKey("sql"))
                                {
                                    ScriptObjectMirror jsOriginal = (ScriptObjectMirror)mrp.get("para");
                                    if (jsOriginal.isArray()) 
                                    {
                                        Integer length = (Integer)jsOriginal.get("length");
                                        for (int i = 0; i < length; i++) {
                                            codeDealPara(larg,jsOriginal.get(""+Integer.toString(i)));
                                        }
                                    } 
                                    strSqlFilter = strSqlFilter + " (" + mrp.get("sql").toString() + ")  or ";
                                }
                            }

                        } catch (Exception e) 
                        {  
                            e.printStackTrace();
                            String strError = "[CodeID]"+codeID+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
                            throw new RuntimeException("Query permission rule execution error:"+strError);
                            
                        } 
                    }
                }
            }
            if(strSqlFilter.endsWith(" or "))
            {
                strSqlFilter = "(" + strSqlFilter.substring(0, strSqlFilter.length()-4) + ")";
            }
        }

        if(strSqlFilter.trim().equals(""))
        {
            if(tblname.indexOf("tbl")==0)
            {
                strSqlFilter = strSqlFilter + " ("+tblname+".syspsnid=?) ";
                larg.add(userDetails.getUser().getId());
            }
        }
        return strSqlFilter;
    }
    private Map<String,Object> getDataRightsView(String dataType,String pubRights,UserLogin userDetails,String codes,String rightsType,List<Object> larg,JSONObject jsonObject) throws Throwable 
    {
        if(needCheckRights(pubRights,userDetails))
        {
            if(userDetails==null)
                return null;
        }

        Map<String,Object> mreturn = new HashMap<String,Object>(){};
        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");
        if(codes!=null&&!codes.trim().equalsIgnoreCase(""))
        {
            String strSql = "";
            JSONObject jsonCode = (JSONObject)JSONObject.parse(codes);
            if(!jsonCode.getString("views").equals(""))
            {
                String codeID = jsonCode.getString("views");

                Map<String,String> mpSource = new HashMap<>();
                mpSource.put("source","");
                WSoftUtil.codeGetSources(this, codeID, mpSource, false,redisCache);
                String strSource = mpSource.get("source");
                if(!strSource.equals(""))
                {
                    Bindings bind = engine.createBindings();  
                    engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                    Map<String,Object> mapPara = new HashMap<>();
                    mapPara.put("_returnVal_","");

                    Set<String> jsonset = jsonObject.keySet();
                    for (String key : jsonset) 
                    {
                        if(key.indexOf("pageParam_")==0)
                        {
                            mapPara.put(key,WSoftUtil.getURLDecoderString(jsonObject.getString(key)));
                        }
                    }

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
                    }

                    bind.put("mapPara", mapPara); 
                    bind.put("datalistService", this); 
                    
                    try 
                    {  
                        //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                        CompiledScript script = ((Compilable) engine).compile(strSource);
                        script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                        //engine.eval(strSource); 

                        if(!mapPara.get("_returnVal_").toString().equals(""))
                        {
                            Map<String,Object> mrp = (Map<String,Object>)mapPara.get("_returnVal_");
                            if(mrp.containsKey("sql"))
                            {
                                ScriptObjectMirror jsOriginal = (ScriptObjectMirror)mrp.get("para");
                                if (jsOriginal.isArray()) 
                                {
                                    Integer length = (Integer)jsOriginal.get("length");
                                    for (int i = 0; i < length; i++) {
                                        codeDealPara(larg,jsOriginal.get(""+Integer.toString(i)));
                                    }
                                } 

                                String strSqlFilterSub = ""; 
                                String  strSqltbls = mrp.get("tbls").toString();
                                String  strSqlFilter = mrp.get("sqlFilter").toString();
                                String  strSqlGroup = mrp.get("sqlGroup").toString();
                                String  strSqlGroupFilter = mrp.get("sqlGroupFilter").toString();
                                String  strSqlOrder = mrp.get("sqlOrder").toString();

                                //Get related tables
                                String tblInNamesAll="";
                                if(mrp.containsKey("tblInPara"))
                                {
                                    jsOriginal = (ScriptObjectMirror)mrp.get("tblInPara");
                                    if (jsOriginal.isArray()) 
                                    {
                                        Integer length = (Integer)jsOriginal.get("length");
                                        for (int i = 0; i < length; i++) 
                                        {
                                            ScriptObjectMirror jsTabInPara = (ScriptObjectMirror)jsOriginal.get(""+Integer.toString(i));
                                            if (jsTabInPara.isArray()) 
                                            {
                                                Integer tlen = (Integer)jsTabInPara.get("length");
                                                for (int j = 0; j < tlen; j++) 
                                                {
                                                    String tblInName = jsTabInPara.get(""+Integer.toString(j)).toString();
                                                    tblInNamesAll = tblInNamesAll + tblInName + ",";
                                                }
                                            }
                                        }
                                    }
                                    tblInNamesAll = WSoftUtil.strDelLastComma(tblInNamesAll);
                                }

                                jsOriginal = (ScriptObjectMirror)mrp.get("tblPara");
                                if (jsOriginal.isArray()) 
                                {
                                    Integer length = (Integer)jsOriginal.get("length");
                                    for (int i = 0; i < length; i++) {
                                        String tblName = jsOriginal.get(""+Integer.toString(i)).toString();

                                        String tblalias="";
                                        Integer ias = tblName.trim().indexOf(" ");
                                        if(ias>0)
                                        {
                                            tblalias = tblName.substring(ias+1).trim();
                                            tblName = tblName.substring(0,ias);
                                        }

                                        if(needCheckRights(pubRights,userDetails))
                                        {
                                            List<Map<String,Object>> lview = datalistDao.getDataConfig(tblName);
                                            if(lview.size()>0)
                                            {
                                                Map<String,Object> mview=(Map)lview.get(0);
                                                String pubRightsSub = (String)mview.get("pubrights");
                                                Boolean blnLeft=false;
                                                if(strSqltbls.indexOf("left join")>0&&strSqltbls.indexOf("left join")<strSqltbls.indexOf(tblName))
                                                {
                                                    //If there is a left join on the right table, skip permission check; left table permissions take precedence
                                                    blnLeft = true;
                                                }
                                                if(!pubRightsSub.equals("1")&&!blnLeft)
                                                {
                                                    String codeSource = (String)mview.get("codes");
                                                    String strSqlSub = getDataRights(tblName,userDetails,factory,engine,codeSource,rightsType,larg);
                                                    if(!strSqlSub.equals(""))
                                                    {
                                                        strSqlSub = strSqlSub.replaceAll(" " + tblName+".", " " + tblalias+".");
                                                        strSqlFilterSub = strSqlFilterSub + " (" + strSqlSub + ")  and ";
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if(strSqlFilterSub.endsWith(" and "))
                                        strSqlFilterSub = strSqlFilterSub.substring(0, strSqlFilterSub.length()-5);
                                } 
                                if(!strSqlFilter.equals(""))
                                {
                                    strSqlFilter = " (" + strSqlFilter + ") ";
                                    if(!strSqlFilterSub.equals(""))
                                        strSqlFilter = strSqlFilter + " and " + strSqlFilterSub;
                                }
                                else
                                    strSqlFilter = strSqlFilterSub;

                                mreturn.put("sql",strSql);
                                mreturn.put("sqlFilter",strSqlFilter);
                                mreturn.put("sqlGroup",strSqlGroup);
                                mreturn.put("sqlGroupFilter",strSqlGroupFilter);
                                mreturn.put("sqlOrder",strSqlOrder);
                                mreturn.put("tbls",mrp.get("tbls").toString());
                                mreturn.put("tblsdb",mrp.get("tblsdb").toString());
                                mreturn.put("topitem",mrp.get("topitem").toString());
                                mreturn.put("fields",mrp.get("fields").toString());
                                mreturn.put("fieldsPara",mrp.get("fieldsPara"));
                                mreturn.put("pkey",mrp.get("pkey").toString());
                                mreturn.put("searchKey",mrp.get("searchKey"));
                                mreturn.put("isdebug",mrp.get("isdebug"));
                                mreturn.put("tblsin",tblInNamesAll);

                                return mreturn;
                            }
                        }

                    } catch (Exception e) 
                    {  
                        e.printStackTrace();
                        String strError = "[CodeID]"+ codeID +"[Source]"+ strSource +"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
                        throw new RuntimeException("Query permission rule execution error:"+strError);
                    } 
                }
            }
        }

        if(needCheckRights(pubRights,userDetails))
        {
            String strSqlSub = getDataRights(dataType,userDetails,factory,engine,codes,rightsType,larg); 
            mreturn.put("sqlFilter",strSqlSub);
            return mreturn;
        }
        
        return null;
    }

    private boolean needCheckRights(String pubRights,UserLogin userDetails)
    {

        if(pubRights==null||pubRights.equals("0"))
        {
            if(userDetails==null||userDetails.getUser().getId()>1)
                return true;
            else
                return false;
        }
        else
            return false;
    }
    public List getWfmDatas(String viewCode,int curPage,int pageItems,JSONObject jsonObject)  throws Throwable  {

        String dataType="";
        String strCodes="";
        String dataFields="";
        String strFilters ="";
        String strPkey ="";
        String strSearchkey = "";
        String strPubrights="1";  //Workflow does not enforce business data permission control
        String sql ="";
        String sqlCount ="";
        String topItems = "";

        String dataFilters="";
        String dataOrders="";

        Map<String,String> mpTables=new HashMap<>();
        Boolean needCache = true;

        String dbRedisConfig="";
        long dbRedisExpires = 0;
        dbRedisConfig = WSoftUtil.dbRedisConfig("gDataRedisTime", redisCache);
        if(dbRedisConfig!=null&&!dbRedisConfig.equals(""))
        {
            dbRedisExpires = Long.valueOf(dbRedisConfig);
            if(dbRedisExpires>0)
                needCache = true;
        }

        if(viewCode.equals(""))
        {
            viewCode = "wfm_run_worklist";
            //needCache = false;  Workflow list page can use cache
        }

        UserLogin userDetails=null;
        if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }

        List<Map<String,Object>> lviewfts = new ArrayList<>();

        List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
        if(lview.size()>0)
        {
            List<Object> larg = new ArrayList<>();

            Map<String,Object> mview=(Map)lview.get(0);
            dataType=(String)mview.get("tablename");
            mpTables.put(dataType.toLowerCase(), "");

            String viewTbls ="";
            String tblsIn = "";
            strFilters = (String)mview.get("filters");
            strCodes = (String)mview.get("codes");
            strPkey = (String)mview.get("pkey");
            strSearchkey = (String)mview.get("searchkey");
            if(strSearchkey!=null&&!strSearchkey.equals(""))
            {   
                strSearchkey = strSearchkey.replace(",", ","+dataType+".");
                strSearchkey = dataType + "." + strSearchkey;
            }

            Map<String,Object> mrights = null;
            mrights = getDataRightsView(dataType,strPubrights,userDetails,strCodes,"view",larg,jsonObject);
            if(mrights!=null&&mrights.containsKey("sql"))
            {
                dataType = mrights.get("tbls").toString().trim();
                viewTbls = mrights.get("tblsdb").toString().trim();
                tblsIn = mrights.get("tblsin").toString().trim();
                if(!viewTbls.equals(""))
                {
                    String tblnames[]=viewTbls.split(",");
                    for(int i=0;i<tblnames.length;i++)
                    {
                        String tblName="";
                        Integer ias = tblnames[i].trim().indexOf(" ");
                        if(ias>0)
                        {
                            tblName = tblnames[i].substring(0,ias);
                            if(!mpTables.containsKey(tblName.toLowerCase()))
                            {
                                mpTables.put(tblName.toLowerCase(),"");
                            }
                        }
                    }
                }

                if(!tblsIn.equals(""))
                {
                    String tblnames[]=tblsIn.split(",");
                    for(int i=0;i<tblnames.length;i++)
                    {
                        String tblName="";
                        Integer ias = tblnames[i].trim().indexOf(" ");
                        if(ias>0)
                        {
                            tblName = tblnames[i].substring(0,ias);
                            if(!mpTables.containsKey(tblName.toLowerCase()))
                            {
                                mpTables.put(tblName.toLowerCase(),"");
                            }
                        }
                    }
                }

                dataFields = mrights.get("fields").toString();
                String strFiltersSub = mrights.get("sqlFilter").toString().trim();
                topItems = mrights.get("topitem").toString().trim();
                if(!mrights.get("sqlOrder").toString().trim().equals(""))
                    dataOrders = mrights.get("sqlOrder").toString().trim() + ",";

                if(!strFiltersSub.equals(""))
                    strFilters = strFilters + " and " + mrights.get("sqlFilter").toString();

                ScriptObjectMirror jsOriginal = (ScriptObjectMirror)mrights.get("fieldsPara");
                if (jsOriginal.isArray()) 
                {
                    Integer length = (Integer)jsOriginal.get("length");
                    for (int i = 0; i < length; i++) {
                        lviewfts.add((Map<String,Object>)jsOriginal.get(""+Integer.toString(i)));
                    }
                }
                if(mrights.get("pkey")!=null&&!mrights.get("pkey").toString().equals(""))
                    strPkey = mrights.get("pkey").toString();
                
                if(mrights.get("searchKey")!=null)
                {
                    jsOriginal = (ScriptObjectMirror)mrights.get("searchKey");
                    if (jsOriginal.isArray()) 
                    {
                        Integer length = (Integer)jsOriginal.get("length");
                        if(length>0)
                        {
                            strSearchkey = "";
                            for (int i = 0; i < length; i++) {
                                Map<String,Object> msp = (Map<String,Object>)jsOriginal.get(""+Integer.toString(i));
                                strSearchkey = strSearchkey + (String)msp.get("name") + ",";
                            }
                            if(!strSearchkey.equalsIgnoreCase(""))
                                strSearchkey = strSearchkey.substring(0, strSearchkey.length()-1);
                        }
                    }
                }
            }
            else
            {

                List lfts = (List)datalistDao.getDataFileds(dataType);
                for(int j=0;j<lfts.size();j++)
                {
                    Map<String,String> mft=(Map)lfts.get(j);
                    String strFtName = mft.get("field");
                    String strFtTitle = mft.get("field_title"); 
                    String strFtType = mft.get("field_type");
                    strFtName=strFtName.trim().toLowerCase();
                    if(mft.get("isshow").equals("1"))
                    {
                        Map<String,Object> mftsub = new HashMap<String,Object>();
                        if(dataType.indexOf("tbl")==0)
                            mftsub.put(strFtName.toUpperCase()+"_"+strFtType,strFtTitle);
                        else
                            mftsub.put("WRK"+strFtName.toUpperCase(),strFtTitle);

                        lviewfts.add(mftsub);
                    }
                    if(strFtType!=null&&strFtType.equalsIgnoreCase("d"))
                        dataFields = dataFields + WSoftUtil.dbSqlDateStr(strFtName) +",";
                    else if(strFtType!=null&&strFtType.equalsIgnoreCase("dt"))
                        dataFields = dataFields + WSoftUtil.dbSqlDateTimeStr(strFtName) +",";
                    else
                        dataFields = dataFields + strFtName.toUpperCase() + ",";
                }
                if(!dataFields.equalsIgnoreCase(""))
                    dataFields = dataFields.substring(0, dataFields.length()-1);
            }

            //This search filter code can be reused
            Set<String> jsonset = jsonObject.keySet();
            for (String key : jsonset) 
            {
                Object paramValue = jsonObject.get(key);
                String farrs[]=key.split("_");
                if(farrs.length==3&&farrs[0].equalsIgnoreCase("filter"))
                {
                    if(farrs[1].equals("searchkey"))
                    {
                        String sarrs[]=strSearchkey.split(",");
                        if(sarrs.length>0&&paramValue!=null&&!paramValue.toString().equals(""))
                        {
                            dataFilters = dataFilters + " and (";
                            for(int i=0;i<sarrs.length;i++)
                            {
                                if(i>0)
                                    dataFilters = dataFilters + " or ";
                                dataFilters = dataFilters + " " + WSoftUtil.dbSqlSqlserverDealFname(sarrs[i]);
                                dataFilters = dataFilters + WSoftUtil.dbSqlLike(); 
                                
                                larg.add(paramValue);
                            }
                            dataFilters = dataFilters + ")";
                        }
                    }
                    else
                    {
                        String sarrs[]=farrs[1].split(",");
                        if(sarrs.length>1)
                        {
                            dataFilters = dataFilters + " and (";
                            for(int i=0;i<sarrs.length;i++)
                            {
                                if(!WSoftUtil.dataNameChack(sarrs[i]))
                                {
                                    throw new RuntimeException("Invalid character");
                                }
                                dataFilters = dataFilters + WSoftUtil.dbSqlSqlserverDealFname(sarrs[i]);
                                if(farrs[2].equalsIgnoreCase("like"))
                                {
                                    dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                                }
                                if(farrs[2].equalsIgnoreCase("equal"))
                                {
                                    dataFilters = dataFilters + " = ?";
                                }
                                larg.add(paramValue);
                                if(i<sarrs.length-1)
                                    dataFilters = dataFilters + " or ";
                            }
                            dataFilters = dataFilters + ") ";        
                        }
                        else
                        {
                            String fname = farrs[1];
                            String fnamechk = fname.replace(".", "");
                            if(!WSoftUtil.dataNameChack(fnamechk))
                            {
                                throw new RuntimeException("Invalid character");
                            }

                            fname =WSoftUtil.dbSqlSqlserverDealFname(fname);
                            if(!viewTbls.equals(""))
                            {
                                String tblnames[]=viewTbls.split(",");
                                for(int i=0;i<tblnames.length;i++)
                                {
                                    String tblalias="";
                                    String tblName="";
                                    Integer ias = tblnames[i].trim().indexOf(" ");
                                    if(ias>0)
                                    {
                                        tblalias = tblnames[i].substring(ias+1).trim();
                                        tblName = tblnames[i].substring(0,ias);
                                        if(fname.indexOf(tblName+".")==0)
                                        {
                                            fname = fname.replaceAll("" + tblName+".", "" + tblalias+".");
                                            break;
                                        }
                                    }
                                }
                            }

                            String opname = farrs[2];
                            opname=opname.toLowerCase();

                            if(!opname.equals("mulsel"))
                                dataFilters = dataFilters + " and " + fname;

                            if(opname.equals("like"))
                            {
                                dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                            }
                            else if(opname.equals("equal")||opname.equals("dequal")||opname.equals("dtequal"))
                            {
                                dataFilters = dataFilters + " = ?";
                            }
                            else if(opname.equals("notequal"))
                            {
                                dataFilters = dataFilters + " != ?";
                            }
                            else if(opname.equals("lte")||opname.equals("dlte")||opname.equals("dtlte"))
                            {
                                dataFilters = dataFilters + "  <= ?";
                            }
                            else if(opname.equals("gte")||opname.equals("dgte")||opname.equals("dtgte"))
                            {
                                dataFilters = dataFilters + "  >= ?";
                            }
                            else if(opname.equals("lt")||opname.equals("dlt")||opname.equals("dtlt"))
                            {
                                dataFilters = dataFilters + "  < ?";
                            }
                            else if(opname.equals("gt")||opname.equals("dgt")||opname.equals("dtgt"))
                            {
                                dataFilters = dataFilters + "  > ?";
                            }
                            else if(opname.equals("sel"))
                            {
                                String parrs[]=String.valueOf(paramValue).split(",");
                                String strParaInValues = "";
                                for(int i=0;i<parrs.length;i++)
                                {
                                    String strParaInValue = parrs[i];
                                    strParaInValue = WSoftUtil.replaceDBPara(strParaInValue);
                                    strParaInValue = "'" + strParaInValue + "'";
                                    strParaInValues = strParaInValues + strParaInValue + ",";
                                }
                                if(!strParaInValues.equalsIgnoreCase(""))
                                    strParaInValues = strParaInValues.substring(0, strParaInValues.length()-1);
                                
                                dataFilters = dataFilters + "  in ("+ strParaInValues +") ";
                                
                            }
                            else if(opname.equals("mulsel"))
                            {
                                dataFilters = dataFilters + " and (";
                                String parrs[]=String.valueOf(paramValue).split(",");
                                for(int i=0;i<parrs.length;i++)
                                {
                                    String strParaInValue = parrs[i];
                                    strParaInValue = ","+ strParaInValue +",";
                                    dataFilters = dataFilters + WSoftUtil.dbSqlLikeByField(fname);
                                    larg.add(strParaInValue);

                                    if(i<parrs.length-1)
                                        dataFilters = dataFilters + " or ";
                                }
                                dataFilters = dataFilters + ") ";
                            }
                            else if (opname.equals("equaldept"))
                            {
                                if(userDetails.getUser().getParentDeptId()==0)
                                {
                                    dataFilters = dataFilters + " in ("+ getSubDeptIDs(userDetails.getUser()) +") ";
                                }
                                else
                                {
                                    dataFilters = dataFilters + " = "+ userDetails.getUser().getDeptId().toString() +" ";
                                }
                            }
                            else if (opname.equals("psndept"))
                            {
                                if(userDetails.getUser().getParentDeptId()==0)
                                {
                                    dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid in ("+ getSubDeptIDs(userDetails.getUser()) +")) ";
                                }
                                else
                                {
                                    dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid = "+ userDetails.getUser().getDeptId().toString() +") ";
                                }
                            }
                            else if (opname.equals("psnorg"))
                            {
                                dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" ) ";
                            }

                            if(opname.indexOf("dt")==0)
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                                java.sql.Timestamp sDate = null;
                                try 
                                {
                                    java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                    sDate = new java.sql.Timestamp(dateTmp.getTime());
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(opname.indexOf("d")==0)
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                                java.sql.Date sDate = null;
                                try 
                                {
                                    java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                    sDate = new java.sql.Date(dateTmp.getTime());
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(!opname.equals("sel")&&!opname.equals("mulsel")&&!opname.equals("equaldept")&&!opname.equals("psndept")&&!opname.equals("psnorg"))
                            {
                                larg.add(paramValue);
                            }
                        }
                    }
                }
                if(farrs.length>=2&&farrs[0].equalsIgnoreCase("order"))
                {
                    String orderFname = farrs[1];
                    String oarrs[]=orderFname.split(",");
                    if(oarrs.length>1)
                    {
                        for(int i=0;i<oarrs.length;i++)
                        {
                            String orderType="";
                            orderFname = oarrs[i].substring(0,oarrs[i].indexOf("#"));
                            orderType = oarrs[i].substring(oarrs[i].indexOf("#")+1);
                            if(!WSoftUtil.dataNameChack(orderFname)||!WSoftUtil.dataNameChack(orderType))
                            {
                                throw new RuntimeException("Invalid character");
                            }
                            dataOrders = dataOrders + "  " + orderFname;
                            dataOrders = dataOrders + "  " + orderType+ ",";
                        }
                    }
                    else
                    {
                        if(!WSoftUtil.dataNameChack(orderFname))
                        {
                            throw new RuntimeException("Invalid character");
                        }
                        dataOrders = dataOrders + "  " + orderFname;
                        if(farrs[2].equalsIgnoreCase("desc"))
                        {
                            dataOrders = dataOrders + " desc ";
                        }
                        if(farrs[2].equalsIgnoreCase("asc"))
                        {
                            dataOrders = dataOrders + " asc ";
                        }
                        dataOrders = dataOrders + ",";
                    }
                }
            }
    
            if(!dataOrders.equalsIgnoreCase(""))
            {
                dataOrders = " order by " + dataOrders.substring(0, dataOrders.length()-1);  
            }

            Object[] args = new Object[larg.size()];
            for(int j=0;j<larg.size();j++)
            {
                args[j]= larg.get(j); 
            }
            
            if(!dataFilters.equals(""))
                strFilters = strFilters + " " + dataFilters;

            String topItemsSub = jsonObject.getString("topItems");
            if(topItemsSub!=null&&(!topItemsSub.trim().equalsIgnoreCase("")))
            {
                topItems = topItemsSub;
            }

            String wrkApprove="";
            if(jsonObject.containsKey("wrkcompleted"))
            {
                if(jsonObject.get("wrkcompleted").toString().equals("1"))
                {
                    wrkApprove = "and wrklst.completed='1'";
                }
                else if(jsonObject.get("wrkcompleted").toString().equals("0"))
                {
                    wrkApprove = "and wrklst.completed='0'";
                }
                else
                {
                    wrkApprove = "";
                }
            }

            String wfmDataField = "";
            String wfmTbl = "";
            if(viewCode.equals("wfm_run_worklist"))
            {
                dataFields = "WRKLST.WFMID AS WRKWFMID,WRKLST.WFMWORKID AS WRKWFMWORKID,WRKLST.WFMNODEID AS WRKWFMNODEID,WRKLST.DATAITEMID AS WRKDATAITEMID,WRKLST.DATAITEMNAME AS WRKDATAITEMNAME,WRKLST.COMPLETED AS WRKCOMPLETED,WRKLST.APPROVE AS WRKAPPROVE,WRKLST.TBLNAME AS WRKTBLNAME,WRKLST.APPNAME AS WRKAPPNAME,WRKLST.FORMNAME AS WRKFORMNAME";
                dataType = " wfm_run_worklist wrklst ";
                strFilters = strFilters.replace("wfm_run_worklist.", "wrklst.");
                strFilters = strFilters + " and wrklst.psnid='"+ String.valueOf(userDetails.getUser().getId()) +"' " + wrkApprove;
            }
            else
            {
                wfmDataField = ",WRKLST.WFMID AS WRKWFMID,WRKLST.WFMWORKID AS WRKWFMWORKID,WRKLST.WFMNODEID AS WRKWFMNODEID,WRKLST.DATAITEMID AS WRKDATAITEMID,WRKLST.COMPLETED AS WRKCOMPLETED,WRKLST.APPROVE AS WRKAPPROVE,WRKLST.TBLNAME AS WRKTBLNAME,WRKLST.FORMNAME AS WRKFORMNAME ";
                wfmTbl = " join wfm_run_worklist wrklst on wrklst.dataitemid = " + dataType + ".id and wrklst.tblname='"+dataType+"' and wrklst.psnid='"+ String.valueOf(userDetails.getUser().getId()) +"' " + wrkApprove; //Only associated with dataType
                dataFields = dataFields + wfmDataField;
                dataType = dataType + wfmTbl;
            }

            if(topItems!=null&&(!topItems.trim().equalsIgnoreCase("")))
            {
                if(WSoftUtil.dbSqlIsOracle())
                    sql = "select rownum rt,tbltop.* from (select " + dataFields + " from " + dataType + " " + strFilters + dataOrders +") tbltop where rownum<=" + topItems +  " ";
                else if(WSoftUtil.dbSqlIsMysql())
                    sql = "select a.* from (select " + dataFields + " from " + dataType + " " + strFilters + dataOrders +" limit 0," + topItems +  ") a "; 
                else if(WSoftUtil.dbSqlIsKingbase())
                    sql = "select a.* from (select " + dataFields + " from " + dataType + " " + strFilters + dataOrders +" limit 0," + topItems +  ") a "; 
                else if(WSoftUtil.dbSqlIsDm())
                    sql = "select rownum rt,tbltop.* from (select " + dataFields + " from " + dataType + " " + strFilters + dataOrders +") tbltop where rownum<=" + topItems +  " ";
                else if(WSoftUtil.dbSqlIsSqlserver())
                    sql = "select top "+ topItems +" " + dataFields + " from " + dataType + " " + strFilters + dataOrders +" ";
                
            }
            else
            {
                if(WSoftUtil.dbSqlIsSqlserver())
                    sql = "select top 1000000000 " + dataFields + " from " + dataType + " " + strFilters + dataOrders;
                else
                    sql = "select " + dataFields + " from " + dataType + " " + strFilters + dataOrders;
            }
            sqlCount = sql;

            int iEnd = curPage*pageItems;
            int iBegin = ((curPage-1)*pageItems)+1;
            sql = WSoftUtil.dbSqlPage(sql, iBegin, iEnd, pageItems);
            sqlCount = "select count(*) as total from (" + sqlCount + ") a ";

            List lcount =null;
            List ldatas =null;

            if(jsonObject.containsKey("isdebug")&&jsonObject.getString("isdebug").equals("true"))
            {
                codeDebugLog("sql", sql);
                codeDebugLog("args", args);
            }
            
            if(needCache)
            {
                String encodeLcount = WSoftUtilBase64.encodeBase64(sqlCount+"_"+JSON.toJSONString(args));
                Boolean needFromDb = true;
                Map<String,Object> reLcount = null;
                reLcount = redisCache.getCacheMap("ldcount:"+encodeLcount);
                if(reLcount.size()>0)
                {
                    if(!WSoftUtil.dbComDataUpdTime(datalistDao,reLcount,mpTables))
                    {
                        needFromDb = false;
                        lcount = (List)reLcount.get("obj");
                    }
                }

                if(needFromDb)
                {
                    lcount = datalistDao.getDatas(sqlCount, args);

                    Map<String,Object> mpCache = new HashMap<>();
                    java.util.Date curDate = new java.util.Date();
                    Timestamp curTime = new Timestamp(curDate.getTime());
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String strTime  = sdf.format(curTime);

                    mpCache.put("updtime",strTime);
                    mpCache.put("obj",lcount);
                    redisCache.setCacheMap("ldcount:"+encodeLcount, mpCache);
                    redisCache.expire("ldcount:"+encodeLcount, dbRedisExpires);
                }

                needFromDb = true;

                String encodeLdatas = WSoftUtilBase64.encodeBase64(sql+"_"+JSON.toJSONString(args));
                Map<String,Object> reLdata = null;
                reLdata = redisCache.getCacheMap("ldata:"+encodeLdatas);
                if(reLdata.size()>0)
                {
                    if(!WSoftUtil.dbComDataUpdTime(datalistDao,reLdata,mpTables))
                    {
                        needFromDb = false;
                        ldatas = (List)reLdata.get("obj");
                    }
                }

                if(needFromDb)
                {
                    ldatas =  datalistDao.getDatasWeb(sql, args);

                    Map<String,Object> mpCache = new HashMap<>();
                    java.util.Date curDate = new java.util.Date();
                    Timestamp curTime = new Timestamp(curDate.getTime());
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String strTime  = sdf.format(curTime);

                    mpCache.put("updtime",strTime);
                    mpCache.put("obj",ldatas);
                    redisCache.setCacheMap("ldata:"+encodeLdatas, mpCache);
                    redisCache.expire("ldata:"+encodeLdatas, dbRedisExpires);
                }
            }
            else
            {
                lcount = datalistDao.getDatas(sqlCount, args);
                ldatas =  datalistDao.getDatasWeb(sql, args);
            }

            List<Object> lreturn = new ArrayList<>();
            lreturn.add(ldatas);
            lreturn.add(lviewfts);
            lreturn.add(lcount);
            
            if(dataType.indexOf(" ")>0)
                dataType = dataType.substring(0, dataType.indexOf(" "));

            List lforms = new ArrayList<>();
            List<Map<String,Object>> ldataconfig = datalistDao.getDataConfig(dataType);
            String formLocation="";
            if(ldataconfig.size()>0)
            {
                Map<String,Object> mdc=(Map)ldataconfig.get(0);
                formLocation=(String)mdc.get("location");

                sql = "select TABLENAME,NAME,LOCATION,FORMID,TEMPLOCATION,FORMNAME,APPTYPE from data_form where tablename=? and ispub='0'";
                lforms = datalistDao.getDatasWeb(sql, new Object[]{dataType});
            }

            List<Map<String,Object>> lother = new ArrayList<>();
            Map<String,Object> mpkey = new HashMap<String,Object>();
            mpkey.put("formLocation",formLocation);
            mpkey.put("pkey",strPkey.toUpperCase());
            lother.add(mpkey);

            Map<String,Object> mreturn = this.codeUpdView(ldatas, lviewfts,strFilters, larg,userDetails,strCodes, "updview",jsonObject,tblsIn);
            lother.add(mreturn);

            lreturn.add(lother);
            lreturn.add(lforms);

            return lreturn;
        }

        return null;
        
    }
    public List getDatas(String viewCode,int curPage,int pageItems,JSONObject jsonObject)  throws Throwable  {

        String dataType="";
        String strCodes="";
        String dataFields="";
        String strFilters ="";
        String strGroup ="";
        String strGroupFilter ="";
        String strPkey ="";
        String strSearchkey = "";
        String strPubrights="0";
        String sql ="";
        String sqlCount ="";
        String topItems = "";
        String dataFieldsClient="";
        
        String dataFilters="";
        String dataOrders="";

        if(jsonObject.containsKey("fieldsclient"))
        {
            dataFieldsClient = ","+jsonObject.getString("fieldsclient").toLowerCase()+",";
        }

        Map<String,String> mpTables=new HashMap<>();
        Boolean needCache = false;
        String dbRedisConfig="";

        long dbRedisExpires = 0;
        dbRedisConfig = WSoftUtil.dbRedisConfig("gDataRedisTime", redisCache);
        if(dbRedisConfig!=null&&!dbRedisConfig.equals(""))
        {
            dbRedisExpires = Long.valueOf(dbRedisConfig);
            if(dbRedisExpires>0)
                needCache = true;
        }

        if(!(viewCode.indexOf("tbl")==0||viewCode.indexOf("view")==0))
        {
            if(!viewCode.equals("psn"))
                needCache = false;
        }

        UserLogin userDetails=null;
        if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }

        List<Map<String,Object>> lviewfts = new ArrayList<>();

        List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
        if(lview.size()>0)
        {
            List<Object> larg = new ArrayList<>();

            Map<String,Object> mview=(Map)lview.get(0);
            dataType=(String)mview.get("tablename");
            mpTables.put(dataType.toLowerCase(), "");

            String viewTbls ="";
            String tblsIn = "";
            strFilters = (String)mview.get("filters");
            strCodes = (String)mview.get("codes");
            strPkey = (String)mview.get("pkey");
            strSearchkey = (String)mview.get("searchkey");
            if(strSearchkey!=null&&!strSearchkey.equals(""))
            {   
                strSearchkey = strSearchkey.replace(",", ","+dataType+".");
                strSearchkey = dataType + "." + strSearchkey;
            }
            strPubrights = (String)mview.get("pubrights");
            if(userDetails==null&&strPubrights.equals("0"))
            {
                return null;
            }
            
            String rights="view";
            if(jsonObject.containsKey("updrights")&&jsonObject.getString("updrights").equals("true"))
            {
                rights="upd";
            }

            Map<String,Object> mrights = null;
            mrights = getDataRightsView(dataType,strPubrights,userDetails,strCodes,rights,larg,jsonObject);
            if(mrights!=null&&mrights.containsKey("sql"))
            {

                if(jsonObject.containsKey("isdebug")&&jsonObject.getString("isdebug").equals("true"))
                {

                }
                else if(mrights.containsKey("isdebug")&&mrights.get("isdebug")!=null)
                {
                    jsonObject.put("isdebug",mrights.get("isdebug").toString());
                }

                dataType = mrights.get("tbls").toString().trim();
                viewTbls = mrights.get("tblsdb").toString().trim();
                if(!viewTbls.equals(""))
                {
                    String tblnames[]=viewTbls.split(",");
                    for(int i=0;i<tblnames.length;i++)
                    {
                        String tblName="";
                        Integer ias = tblnames[i].trim().indexOf(" ");
                        if(ias>0)
                        {
                            tblName = tblnames[i].substring(0,ias);
                            if(!mpTables.containsKey(tblName.toLowerCase()))
                            {
                                mpTables.put(tblName.toLowerCase(),"");
                            }
                        }
                    }
                }

                tblsIn = mrights.get("tblsin").toString().trim();
                if(!tblsIn.equals(""))
                {
                    String tblnames[]=tblsIn.split(",");
                    for(int i=0;i<tblnames.length;i++)
                    {
                        String tblName="";
                        Integer ias = tblnames[i].trim().indexOf(" ");
                        if(ias>0)
                        {
                            tblName = tblnames[i].substring(0,ias);
                            if(!mpTables.containsKey(tblName.toLowerCase()))
                            {
                                mpTables.put(tblName.toLowerCase(),"");
                            }
                        }
                    }
                }

                dataFields = mrights.get("fields").toString();
                String strFiltersSub = mrights.get("sqlFilter").toString().trim();
                strGroup = mrights.get("sqlGroup").toString().trim();
                strGroupFilter = mrights.get("sqlGroupFilter").toString().trim();
                topItems = mrights.get("topitem").toString().trim();
                if(!mrights.get("sqlOrder").toString().trim().equals(""))
                    dataOrders = mrights.get("sqlOrder").toString().trim() + ",";

                if(!strFiltersSub.equals(""))
                    strFilters = strFilters + " and " + mrights.get("sqlFilter").toString();

                ScriptObjectMirror jsOriginal = (ScriptObjectMirror)mrights.get("fieldsPara");
                if (jsOriginal.isArray()) 
                {
                    Integer length = (Integer)jsOriginal.get("length");
                    for (int i = 0; i < length; i++) {
                        lviewfts.add((Map<String,Object>)jsOriginal.get(""+Integer.toString(i)));
                    }
                }
                if(mrights.get("pkey")!=null&&!mrights.get("pkey").toString().equals(""))
                    strPkey = mrights.get("pkey").toString();
                
                if(mrights.get("searchKey")!=null)
                {
                    jsOriginal = (ScriptObjectMirror)mrights.get("searchKey");
                    if (jsOriginal.isArray()) 
                    {
                        Integer length = (Integer)jsOriginal.get("length");
                        if(length>0)
                        {
                            strSearchkey = "";
                            for (int i = 0; i < length; i++) {
                                Map<String,Object> msp = (Map<String,Object>)jsOriginal.get(""+Integer.toString(i));
                                strSearchkey = strSearchkey + (String)msp.get("name") + ",";
                            }
                            if(!strSearchkey.equalsIgnoreCase(""))
                                strSearchkey = strSearchkey.substring(0, strSearchkey.length()-1);
                        }
                    }
                }
            }
            else
            {
                if(mrights!=null&&mrights.containsKey("sqlFilter"))
                {
                    String strFilterRight = mrights.get("sqlFilter").toString();
                    if(!strFilterRight.trim().equals(""))
                        strFilters = strFilters + " and " + mrights.get("sqlFilter").toString();
                    else if(userDetails.getUser().getId()!=1)
                    {
                        if(dataType.indexOf("tbl")==0)
                        {
                            jsonObject.put("filter_"+ dataType +".syspsnid_equal",userDetails.getUser().getId());
                        }
                    }
                }
                else
                {
                    if(needCheckRights(strPubrights,userDetails))
                    {
                        if(userDetails.getUser().getId()!=1)
                        {
                            if(dataType.indexOf("tbl")==0)
                            {
                                jsonObject.put("filter_"+ dataType +".syspsnid_equal",userDetails.getUser().getId());
                            }
                        }
                    }
                }

                //Using cache plan, commenting out here
                //List lfts = (List)datalistDao.getDataFileds(dataType);

                Object [] dpara=new Object[]{dataType};
                Map<String,Object> mr = new HashMap<>();
                mr.put("tblsdb", "data_fields");
                List lfts  = this.codeGetDatasCache("select FIELD,FIELD_TITLE,FIELD_TYPE,ISSHOW from data_fields where tablename=? and isinfile='0' order by showsort",dpara,null,mr);

                for(int j=0;j<lfts.size();j++)
                {
                    Map<String,String> mft=(Map)lfts.get(j);
                    String strFtName = mft.get("FIELD");
                    String strFtTitle = mft.get("FIELD_TITLE"); 
                    String strFtType = mft.get("FIELD_TYPE");
                    strFtName=strFtName.trim().toLowerCase();
                    if(dataFieldsClient.equals("")||(!dataFieldsClient.equals("")&&dataFieldsClient.indexOf(","+strFtName+",")>=0))
                    {
                        if(strFtType!=null&&strFtType.equalsIgnoreCase("d"))
                            dataFields = dataFields + WSoftUtil.dbSqlDateStr(strFtName) +",";
                        else if(strFtType!=null&&strFtType.equalsIgnoreCase("dt"))
                            dataFields = dataFields + WSoftUtil.dbSqlDateTimeStr(strFtName) +",";
                        else
                            dataFields = dataFields + strFtName.toUpperCase() + ",";
                    }

                    if(mft.get("ISSHOW").equals("1")&&dataFieldsClient.equals(""))
                    {
                        Map<String,Object> mftsub = new HashMap<String,Object>();
                        if(dataType.indexOf("tbl")==0)
                            mftsub.put(strFtName.toUpperCase()+"_"+strFtType,strFtTitle);
                        else
                            mftsub.put(strFtName.toUpperCase(),strFtTitle);
                        lviewfts.add(mftsub);
                    }

                }
                if(!dataFields.equalsIgnoreCase(""))
                    dataFields = dataFields.substring(0, dataFields.length()-1);
            }

            Set<String> jsonset = jsonObject.keySet();
            for (String key : jsonset) 
            {
                Object paramValue = jsonObject.get(key);
                String farrs[]=key.split("_");
                if(farrs.length==3&&farrs[0].equalsIgnoreCase("filter"))
                {
                    if(farrs[1].equals("searchkey"))
                    {
                        String sarrs[]=strSearchkey.split(",");
                        if(sarrs.length>0&&paramValue!=null&&!paramValue.toString().equals(""))
                        {
                            dataFilters = dataFilters + " and (";
                            for(int i=0;i<sarrs.length;i++)
                            {
                                if(i>0)
                                    dataFilters = dataFilters + " or ";
                                dataFilters = dataFilters + " " + WSoftUtil.dbSqlSqlserverDealFname(sarrs[i]);
                                dataFilters = dataFilters + WSoftUtil.dbSqlLike(); 
                                
                                larg.add(paramValue);
                            }
                            dataFilters = dataFilters + ")";
                        }
                    }
                    else
                    {
                        String sarrs[]=farrs[1].split(",");
                        if(sarrs.length>1)
                        {
                            dataFilters = dataFilters + " and (";
                            for(int i=0;i<sarrs.length;i++)
                            {
                                if(!WSoftUtil.dataNameChack(sarrs[i]))
                                {
                                    throw new RuntimeException("Invalid character");
                                }
                                dataFilters = dataFilters + WSoftUtil.dbSqlSqlserverDealFname(sarrs[i]);
                                if(farrs[2].equalsIgnoreCase("like"))
                                {
                                    dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                                }
                                if(farrs[2].equalsIgnoreCase("equal"))
                                {
                                    dataFilters = dataFilters + " = ?";
                                }
                                larg.add(paramValue);
                                if(i<sarrs.length-1)
                                    dataFilters = dataFilters + " or ";
                            }
                            dataFilters = dataFilters + ") ";        
                        }
                        else
                        {
                            String fname = farrs[1];
                            String fnamechk = fname.replace(".", "");
                            if(!WSoftUtil.dataNameChack(fnamechk))
                            {
                                throw new RuntimeException("Invalid character");
                            }

                            fname =WSoftUtil.dbSqlSqlserverDealFname(fname);
                            if(!viewTbls.equals(""))
                            {
                                String tblnames[]=viewTbls.split(",");
                                for(int i=0;i<tblnames.length;i++)
                                {
                                    String tblalias="";
                                    String tblName="";
                                    Integer ias = tblnames[i].trim().indexOf(" ");
                                    if(ias>0)
                                    {
                                        tblalias = tblnames[i].substring(ias+1).trim();
                                        tblName = tblnames[i].substring(0,ias);
                                        if(fname.indexOf(tblName+".")==0)
                                        {
                                            fname = fname.replaceAll("" + tblName+".", "" + tblalias+".");
                                            break;
                                        }
                                    }
                                }
                            }

                            String opname = farrs[2];
                            opname=opname.toLowerCase();

                            if(!opname.equals("mulsel"))
                                dataFilters = dataFilters + " and " + fname;

                            if(opname.equals("like"))
                            {
                                dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                            }
                            else if(opname.equals("equal")||opname.equals("dequal")||opname.equals("dtequal"))
                            {
                                dataFilters = dataFilters + " = ?";
                            }
                            else if(opname.equals("notequal"))
                            {
                                dataFilters = dataFilters + " != ?";
                            }
                            else if(opname.equals("lte")||opname.equals("dlte")||opname.equals("dtlte"))
                            {
                                dataFilters = dataFilters + "  <= ?";
                            }
                            else if(opname.equals("gte")||opname.equals("dgte")||opname.equals("dtgte"))
                            {
                                dataFilters = dataFilters + "  >= ?";
                            }
                            else if(opname.equals("lt")||opname.equals("dlt")||opname.equals("dtlt"))
                            {
                                dataFilters = dataFilters + "  < ?";
                            }
                            else if(opname.equals("gt")||opname.equals("dgt")||opname.equals("dtgt"))
                            {
                                dataFilters = dataFilters + "  > ?";
                            }
                            else if(opname.equals("sel"))
                            {
                                String parrs[]=String.valueOf(paramValue).split(",");
                                String strParaInValues = "";
                                for(int i=0;i<parrs.length;i++)
                                {
                                    String strParaInValue = parrs[i];
                                    strParaInValue = WSoftUtil.replaceDBPara(strParaInValue);
                                    strParaInValue = "'" + strParaInValue + "'";
                                    strParaInValues = strParaInValues + strParaInValue + ",";
                                }
                                if(!strParaInValues.equalsIgnoreCase(""))
                                    strParaInValues = strParaInValues.substring(0, strParaInValues.length()-1);
                                
                                dataFilters = dataFilters + "  in ("+ strParaInValues +") ";
                                
                            }
                            else if(opname.equals("mulsel"))
                            {
                                dataFilters = dataFilters + " and (";
                                String parrs[]=String.valueOf(paramValue).split(",");
                                for(int i=0;i<parrs.length;i++)
                                {
                                    String strParaInValue = parrs[i];
                                    strParaInValue = ","+ strParaInValue +",";
                                    dataFilters = dataFilters + WSoftUtil.dbSqlLikeByField(fname);
                                    larg.add(strParaInValue);

                                    if(i<parrs.length-1)
                                        dataFilters = dataFilters + " or ";
                                }
                                dataFilters = dataFilters + ") ";
                            }
                            else if (opname.equals("equaldept"))
                            {
                                if(userDetails.getUser().getParentDeptId()==0)
                                {
                                    dataFilters = dataFilters + " in ("+ getSubDeptIDs(userDetails.getUser()) +") ";
                                }
                                else
                                {
                                    dataFilters = dataFilters + " = "+ userDetails.getUser().getDeptId().toString() +" ";
                                }
                            }
                            else if (opname.equals("psndept"))
                            {
                                if(userDetails.getUser().getParentDeptId()==0)
                                {
                                    dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid in ("+ getSubDeptIDs(userDetails.getUser()) +")) ";
                                }
                                else
                                {
                                    dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid = "+ userDetails.getUser().getDeptId().toString() +") ";
                                }
                            }
                            else if (opname.equals("psnorg"))
                            {
                                dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" ) ";
                            }

                            if(opname.indexOf("dt")==0)
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                                java.sql.Timestamp sDate = null;
                                try 
                                {
                                    java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                    sDate = new java.sql.Timestamp(dateTmp.getTime());
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(opname.indexOf("d")==0)
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                                java.sql.Date sDate = null;
                                try 
                                {
                                    java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                    sDate = new java.sql.Date(dateTmp.getTime());
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(!opname.equals("sel")&&!opname.equals("mulsel")&&!opname.equals("equaldept")&&!opname.equals("psndept")&&!opname.equals("psnorg"))
                            {
                                larg.add(paramValue);
                            }
                        }
                    }
                }
                if(farrs.length>=2&&farrs[0].equalsIgnoreCase("order"))
                {
                    String orderFname = farrs[1];
                    String oarrs[]=orderFname.split(",");
                    if(oarrs.length>1)
                    {
                        for(int i=0;i<oarrs.length;i++)
                        {
                            String orderType="";
                            orderFname = oarrs[i].substring(0,oarrs[i].indexOf("#"));
                            orderType = oarrs[i].substring(oarrs[i].indexOf("#")+1);
                            if(!WSoftUtil.dataNameChack(orderFname)||!WSoftUtil.dataNameChack(orderType))
                            {
                                throw new RuntimeException("Invalid character");
                            }
                            dataOrders = dataOrders + "  " + orderFname;
                            dataOrders = dataOrders + "  " + orderType+ ",";
                        }
                    }
                    else
                    {
                        if(!WSoftUtil.dataNameChack(orderFname))
                        {
                            throw new RuntimeException("Invalid character");
                        }
                        dataOrders = dataOrders + "  " + orderFname;
                        if(farrs.length==3)
                        {
                            if(farrs[2].equalsIgnoreCase("desc"))
                            {
                                dataOrders = dataOrders + " desc ";
                            }
                            else if(farrs[2].equalsIgnoreCase("asc"))
                            {
                                dataOrders = dataOrders + " asc ";
                            }
                        }
                        else
                        {
                            dataOrders = dataOrders + " asc ";
                        }
                        dataOrders = dataOrders + ",";
                    }
                }
            }
    
            //Custom statistics, reassemble return fields and group/order fields
            if(jsonObject.containsKey("statparas"))
            {

                lviewfts.clear();

                String statStr = jsonObject.get("statparas").toString();
                JSONObject jStat = (JSONObject)JSON.parse(statStr);

                String statFields = "";
                String statGroups = "";
                String statOrders = "";

                if(!jStat.getString("field1").equals(""))
                {
                    statFields = statFields + jStat.getString("field1").toUpperCase() + ",";
                    statGroups = statGroups + jStat.getString("field1").toUpperCase();
                    statOrders = statOrders + jStat.getString("field1").toUpperCase();
                }

                Map<String,Object> mftsub = new HashMap<String,Object>();
                if(!jStat.getString("field1").equals(""))
                {
                    mftsub.put(jStat.getString("field1").toUpperCase(),jStat.getString("field1txt"));
                    lviewfts.add(mftsub);
                }

                if(!jStat.getString("field2").equals(""))
                {
                    statFields = statFields + jStat.getString("field2").toUpperCase()+ ",";
                    statGroups = statGroups + "," + jStat.getString("field2").toUpperCase();
                    statOrders = statOrders + "," + jStat.getString("field2").toUpperCase();
                    mftsub = new HashMap<String,Object>();
                    mftsub.put(jStat.getString("field2").toUpperCase(),jStat.getString("field2txt"));
                    lviewfts.add(mftsub);
                }

                if(jStat.getString("fielddatamode").equals("Total"))
                {
                    statFields = statFields + "count(" + jStat.getString("fielddata") + ") as " + jStat.getString("fielddata").toUpperCase();
                }
                else if (jStat.getString("fielddatamode").equals("Sum"))
                {
                    statFields = statFields + "sum(" + jStat.getString("fielddata") + ") as " + jStat.getString("fielddata").toUpperCase(); 
                }
                else if (jStat.getString("fielddatamode").equals("Average"))
                {
                    statFields = statFields + "avg(" + jStat.getString("fielddata") + ") as " + jStat.getString("fielddata").toUpperCase(); 
                }
                else if (jStat.getString("fielddatamode").equals("Maximum"))
                {
                    statFields = statFields + "max(" + jStat.getString("fielddata") + ") as " + jStat.getString("fielddata").toUpperCase(); 
                }
                else if (jStat.getString("fielddatamode").equals("Minimum"))
                {
                    statFields = statFields + "min(" + jStat.getString("fielddata") + ") as " + jStat.getString("fielddata").toUpperCase(); 
                }

                mftsub = new HashMap<String,Object>();
                mftsub.put(jStat.getString("fielddata").toUpperCase(),jStat.getString("fielddatatxt"));
                lviewfts.add(mftsub);

                dataFields = statFields;

                if(!jStat.getString("field1").equals(""))
                {
                    strGroup = statGroups;
                    dataOrders = statOrders + ",";
                }
            }

            if(!dataOrders.equalsIgnoreCase(""))
            {
                dataOrders = " order by " + dataOrders.substring(0, dataOrders.length()-1);  
            }

            Object[] args = new Object[larg.size()];
            for(int j=0;j<larg.size();j++)
            {
                args[j]= larg.get(j); 
            }
            
            if(!dataFilters.equals(""))
                strFilters = strFilters + " " + dataFilters;

            if(!strGroup.equals(""))
                strGroup = " group by " + strGroup;

            if(!strGroupFilter.equals(""))
                strGroupFilter = " " + strGroupFilter;
                
            String topItemsSub = jsonObject.getString("topItems");
            if(topItemsSub!=null&&(!topItemsSub.trim().equalsIgnoreCase("")))
            {
                topItems = topItemsSub;
            }

            if(topItems!=null&&(!topItems.trim().equalsIgnoreCase("")))
            {
                if(WSoftUtil.dbSqlIsOracle())
                    sql = "select rownum rt,tbltop.* from (select " + dataFields + " from " + dataType + " " + strFilters + strGroup + " " + strGroupFilter + " " + dataOrders +") tbltop where rownum<=" + topItems +  " ";
                else if(WSoftUtil.dbSqlIsMysql())
                    sql = "select a.* from (select " + dataFields + " from " + dataType + " " + strFilters + strGroup + " " + strGroupFilter + " " + dataOrders +" limit 0," + topItems +  ") a "; 
                else if(WSoftUtil.dbSqlIsKingbase())
                    sql = "select a.* from (select " + dataFields + " from " + dataType + " " + strFilters + strGroup + " " + strGroupFilter + " " + dataOrders +" limit 0," + topItems +  ") a "; 
                else if(WSoftUtil.dbSqlIsDm())
                    sql = "select rownum rt,tbltop.* from (select " + dataFields + " from " + dataType + " " + strFilters + strGroup + " " + strGroupFilter + " " + dataOrders +") tbltop where rownum<=" + topItems +  " ";
                else if(WSoftUtil.dbSqlIsSqlserver())
                    sql = "select top "+ topItems +" " + dataFields + " from " + dataType + " " + strFilters + strGroup + " " + strGroupFilter + " " + dataOrders +" ";
                
            }
            else
            {
                if(WSoftUtil.dbSqlIsSqlserver())
                    sql = "select top 1000000000 " + dataFields + " from " + dataType + " " + strFilters + strGroup + " " + strGroupFilter + " " + dataOrders;
                else
                    sql = "select " + dataFields + " from " + dataType + " " + strFilters + strGroup + " " + strGroupFilter + " " + dataOrders;
            }
            sqlCount = sql;

            int iEnd = curPage*pageItems;
            int iBegin = ((curPage-1)*pageItems)+1;
            sql = WSoftUtil.dbSqlPage(sql, iBegin, iEnd, pageItems);
            sqlCount = "select count(*) as total from (" + sqlCount + ") a ";

            if(jsonObject.containsKey("isdebug")&&jsonObject.getString("isdebug").equals("true"))
            {
                codeDebugLog("sql", sql);
                codeDebugLog("args", args);
            }

            List lcount =null;
            List ldatas =null;

            if(needCache)
            {
                String encodeLcount = WSoftUtilBase64.encodeBase64(sqlCount+"_"+JSON.toJSONString(args));
                Boolean needFromDb = true;
                Map<String,Object> reLcount = null;
                reLcount = redisCache.getCacheMap("ldcount:"+encodeLcount);
                if(reLcount.size()>0)
                {
                    if(!WSoftUtil.dbComDataUpdTime(datalistDao,reLcount,mpTables))
                    {
                        needFromDb = false;
                        lcount = (List)reLcount.get("obj");
                    }
                }

                if(needFromDb)
                {
                    lcount = datalistDao.getDatas(sqlCount, args);

                    Map<String,Object> mpCache = new HashMap<>();
                    java.util.Date curDate = new java.util.Date();
                    Timestamp curTime = new Timestamp(curDate.getTime());
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String strTime  = sdf.format(curTime);

                    mpCache.put("updtime",strTime);
                    mpCache.put("obj",lcount);
                    redisCache.setCacheMap("ldcount:"+encodeLcount, mpCache);
                    redisCache.expire("ldcount:"+encodeLcount, dbRedisExpires);
                }

                needFromDb = true;

                String encodeLdatas = WSoftUtilBase64.encodeBase64(sql+"_"+JSON.toJSONString(args));
                Map<String,Object> reLdata = null;
                reLdata = redisCache.getCacheMap("ldata:"+encodeLdatas);
                if(reLdata.size()>0)
                {
                    if(!WSoftUtil.dbComDataUpdTime(datalistDao,reLdata,mpTables))
                    {
                        needFromDb = false;
                        ldatas = (List)reLdata.get("obj");
                    }
                }

                if(needFromDb)
                {
                    ldatas =  datalistDao.getDatasWeb(sql, args);

                    Map<String,Object> mpCache = new HashMap<>();
                    java.util.Date curDate = new java.util.Date();
                    Timestamp curTime = new Timestamp(curDate.getTime());
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                    String strTime  = sdf.format(curTime);

                    mpCache.put("updtime",strTime);
                    mpCache.put("obj",ldatas);
                    redisCache.setCacheMap("ldata:"+encodeLdatas, mpCache);
                    redisCache.expire("ldata:"+encodeLdatas, dbRedisExpires);
                }
            }
            else
            {
                lcount = datalistDao.getDatas(sqlCount, args);
                ldatas =  datalistDao.getDatasWeb(sql, args);
            }

            List<Object> lreturn = new ArrayList<>();
            lreturn.add(ldatas);

            if(dataFieldsClient.equals(""))
            {
                lreturn.add(lviewfts);
                lreturn.add(lcount);
                
                if(dataType.indexOf(" ")>0)
                    dataType = dataType.substring(0, dataType.indexOf(" "));

                List lforms = new ArrayList<>();
                String formLocation="";

                if(viewCode.indexOf("view")!=0)
                {
                    List<Map<String,Object>> ldataconfig = datalistDao.getDataConfig(dataType);
                    if(ldataconfig.size()>0)
                    {
                        Map<String,Object> mdc=(Map)ldataconfig.get(0);
                        formLocation=(String)mdc.get("location");

                        sql = "select TABLENAME,NAME,LOCATION,FORMID,TEMPLOCATION,FORMNAME,APPTYPE from data_form where tablename=? and ispub='0'";
                        lforms = datalistDao.getDatasWeb(sql, new Object[]{dataType});
                    }
                }

                List<Map<String,Object>> lother = new ArrayList<>();
                Map<String,Object> mpkey = new HashMap<String,Object>();
                mpkey.put("formLocation",formLocation);
                if(strPkey==null)
                    strPkey="";
                mpkey.put("pkey",strPkey.toUpperCase());
                lother.add(mpkey);

                Map<String,Object> mreturn = this.codeUpdView(ldatas, lviewfts,strFilters, larg,userDetails,strCodes, "updview",jsonObject,tblsIn);
                lother.add(mreturn);

                lreturn.add(lother);
                lreturn.add(lforms);
            }
            return lreturn;
        }

        return null;
        
    }

    public Map<String,Object> getDataConfigMap(String viewCode)
    {
        return datalistDao.getDataConfigMap(viewCode);
    }

    public List getDataItem(String viewCode,String itemIDs,JSONObject jsonObject,boolean isapprove)  throws Throwable {

        String sql = "";
        String dataType = "";
        String pkey = "";
        String pkeyType = "";
        List<Object> larg = new ArrayList<>();
        String dataFilters="";

        UserLogin userDetails=null;
        if(SecurityContextHolder.getContext().getAuthentication()!=null&&!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }

        boolean isViewWfmLog = false;
        boolean isUpdWfmForm = false;
        String wfmId="";
        String wfmNodeId="";
        if(jsonObject.containsKey("pageParam_viewWfmLog"))
        {
            if(jsonObject.containsKey("pageParam_wfmWorklistId")&&jsonObject.get("pageParam_wfmWorklistId")!=null)
            {
                String wfmworklistid = jsonObject.getString("pageParam_wfmWorklistId");
                if(!wfmworklistid.equals(""))
                {
                    String strSql = "select wfmid,wfmnodeid,dataitemid,tblname,formname from wfm_run_worklist where wfmworkid=?";
                    List dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid});
                    if(dataWfm.size()>0)
                    {
                        Map<String,Object> mp = (Map<String,Object>)dataWfm.get(0);
                        String did = mp.get("dataitemid").toString();
                        String tbl = mp.get("tblname").toString();
                        String formname = mp.get("formname").toString();
                        wfmId = mp.get("wfmid").toString();
                        wfmNodeId = mp.get("wfmnodeid").toString();
                        JSONObject jPara = new JSONObject();

                        List litem = null;
                        if(jsonObject.containsKey("pageParam_appPsn"))
                        {
                            strSql = "select wfmworkid from wfm_run_worklist where psnid=? and tblname=? and dataitemid=? order by wfmworkid desc";
                            litem = this.getDatasBySql(strSql, new Object[]{userDetails.getUser().getId(),tbl,did});
                            if(litem.size()>0)
                            {
                                mp = (Map<String,Object>)litem.get(0);
                                String wrkid = String.valueOf(mp.get("wfmworkid"));
                                if(Integer.valueOf(wrkid)<Integer.valueOf(wfmworklistid))
                                {
                                    litem = null;
                                }
                            }
                        }
                        else
                        {
                            litem = this.getDataItem(tbl, did, jPara, false);
                        }

                        if(litem!=null&&litem.size()>0)
                        {
                            if(!formname.equalsIgnoreCase(tbl))
                            {
                                strSql = "select id from "+ formname +" where wfmworklistid=?";
                                dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid});
                                if(dataWfm.size()>0)
                                {
                                    mp = (Map<String,Object>)dataWfm.get(0);
                                    itemIDs = String.valueOf(mp.get("id"));
                                    isViewWfmLog=true;
                                }
                            }
                            else
                            {
                                itemIDs = did;
                                isViewWfmLog=true;
                            }
                        }
                    }
                }
            }
        }
        else if(jsonObject.containsKey("pageParam_updWfmForm"))
        {
            if(jsonObject.containsKey("pageParam_wfmWorklistId")&&jsonObject.get("pageParam_wfmWorklistId")!=null)
            {
                String wfmworklistid = jsonObject.getString("pageParam_wfmWorklistId");
                if(!wfmworklistid.equals(""))
                {
                    String strSql = "select wfmid,wfmnodeid,dataitemid,tblname,formname from wfm_run_worklist where wfmworkid=? and psnid=? and completed='0'";
                    List dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid,userDetails.getUser().getId()});
                    if(dataWfm.size()>0)
                    {
                        Map<String,Object> mp = (Map<String,Object>)dataWfm.get(0);
                        String did = mp.get("dataitemid").toString();
                        String formname = mp.get("formname").toString();
                        String tblname = mp.get("tblname").toString();
                        wfmId = mp.get("wfmid").toString();
                        wfmNodeId = mp.get("wfmnodeid").toString();

                        if(!formname.equalsIgnoreCase(tblname))
                        {
                            strSql = "select id from "+ formname +" where wfmworklistid=?";
                            dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid});
                            if(dataWfm.size()>0)
                            {
                                mp = (Map<String,Object>)dataWfm.get(0);
                                itemIDs = String.valueOf(mp.get("id"));
                                isUpdWfmForm=true;
                            }
                        }
                        else
                        {
                            itemIDs = did;
                            isUpdWfmForm=true;
                        }
                    }
                }
            }
        }
        else if(jsonObject.containsKey("pageParam_viewWfmForm"))
        {
            if(jsonObject.containsKey("pageParam_wfmWorklistId")&&jsonObject.get("pageParam_wfmWorklistId")!=null)
            {
                String wfmworklistid = jsonObject.getString("pageParam_wfmWorklistId");
                if(!wfmworklistid.equals(""))
                {
                    String strSql = "select wfmid,wfmnodeid,dataitemid,tblname,formname from wfm_run_worklist where wfmworkid=? and psnid=?";
                    List dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid,userDetails.getUser().getId()});
                    if(dataWfm.size()>0)
                    {
                        Map<String,Object> mp = (Map<String,Object>)dataWfm.get(0);
                        String did = mp.get("dataitemid").toString();
                        String formname = mp.get("formname").toString();
                        String tblname = mp.get("tblname").toString();
                        wfmId = mp.get("wfmid").toString();
                        wfmNodeId = mp.get("wfmnodeid").toString();

                        if(!formname.equalsIgnoreCase(tblname))
                        {
                            strSql = "select id from "+ formname +" where wfmworklistid=?";
                            dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid});
                            if(dataWfm.size()>0)
                            {
                                mp = (Map<String,Object>)dataWfm.get(0);
                                itemIDs = String.valueOf(mp.get("id"));
                                isUpdWfmForm=true;
                            }
                        }
                        else
                        {
                            itemIDs = did;
                            isUpdWfmForm=true;
                        }
                    }
                }
            }
        }
        else if(isapprove)
        {
            String strSqlApprove = "select wfmid from wfm_run_worklist where tblname=? and dataitemid=? and psnid=?";
            List dataApprove = datalistDao.getDatas(strSqlApprove, new Object[]{viewCode,itemIDs,userDetails.getUser().getId()});
            if(dataApprove.size()==0)
            {
                return null;
            }
        }

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");


        List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
        if(lview.size()>0)
        {
            Map<String,Object> mview=(Map)lview.get(0);
            dataType=(String)mview.get("tablename");
            pkey=(String)mview.get("pkey");
            pkeyType=(String)mview.get("pkey_type");
            String strCodes = (String)mview.get("codes");
            String strPubrights = (String)mview.get("pubrights");
            String strIsPub = (String)mview.get("ispub");

            Boolean isFormPub=false;
            if(jsonObject.containsKey("FORMPUB")&&jsonObject.getBoolean("FORMPUB"))
            {
                isFormPub = true;
            }

            if(!isFormPub&&(userDetails==null&&(strPubrights.equals("0")||strIsPub.equals("0"))))
            {
                return null;
            }

            if(needCheckRights(strPubrights,userDetails)&&!isFormPub&&!isapprove&&!isViewWfmLog&&!isUpdWfmForm)
            {
                String strSqlSub = getDataRights(dataType,userDetails,factory,engine,strCodes,"view",larg); 
                if(!strSqlSub.trim().equals(""))
                {
                    dataFilters = dataFilters + " and " + strSqlSub + " ";
                }
                else
                {
                    if(userDetails.getUser().getId()!=1)
                    {
                        if(dataType.indexOf("tbl")==0)
                        {
                            jsonObject.put("filter_syspsnid_equal",userDetails.getUser().getId());
                        }
                    }
                }
            }

            Set<String> jsonset = jsonObject.keySet();
            for (String key : jsonset) 
            {
                Object paramValue = jsonObject.get(key);
                String farrs[]=key.split("_");
                if(farrs.length==3&&farrs[0].equalsIgnoreCase("filter"))
                {
                    String sarrs[]=farrs[1].split(",");
                    if(sarrs.length>1)
                    {
                        dataFilters = dataFilters + " and (";
                        for(int i=0;i<sarrs.length;i++)
                        {
                            if(!WSoftUtil.dataNameChack(sarrs[i]))
                            {
                                throw new RuntimeException("Invalid character");
                            }
                            dataFilters = dataFilters + sarrs[i];
                            if(farrs[2].equalsIgnoreCase("like"))
                            {
                                dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                            }
                            if(farrs[2].equalsIgnoreCase("equal"))
                            {
                                dataFilters = dataFilters + " = ?";
                            }
                            larg.add(paramValue);
                            if(i<sarrs.length-1)
                                dataFilters = dataFilters + " or ";
                        }
                        dataFilters = dataFilters + ") ";        
                    }
                    else
                    {
                        String fname = farrs[1];
                        String fnamechk = fname.replace(".", "");
                        if(!WSoftUtil.dataNameChack(fnamechk))
                        {
                            throw new RuntimeException("Invalid character");
                        }
                        
                        String opname = farrs[2];
                        opname=opname.toLowerCase();

                        if(!opname.equals("mulsel"))
                            dataFilters = dataFilters + " and " + fname;

                        if(opname.equals("like"))
                        {
                            dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                        }
                        else if(opname.equals("equal")||opname.equals("dequal")||opname.equals("dtequal"))
                        {
                            dataFilters = dataFilters + " = ?";
                        }
                        else if(opname.equals("lte")||opname.equals("dlte")||opname.equals("dtlte"))
                        {
                            dataFilters = dataFilters + "  <= ?";
                        }
                        else if(opname.equals("gte")||opname.equals("dgte")||opname.equals("dtgte"))
                        {
                            dataFilters = dataFilters + "  >= ?";
                        }
                        else if(opname.equals("lt")||opname.equals("dlt")||opname.equals("dtlt"))
                        {
                            dataFilters = dataFilters + "  < ?";
                        }
                        else if(opname.equals("gt")||opname.equals("dgt")||opname.equals("dtgt"))
                        {
                            dataFilters = dataFilters + "  > ?";
                        }
                        else if(opname.equals("sel"))
                        {
                            String parrs[]=String.valueOf(paramValue).split(",");
                            String strParaInValues = "";
                            for(int i=0;i<parrs.length;i++)
                            {
                                String strParaInValue = parrs[i];
                                strParaInValue = WSoftUtil.replaceDBPara(strParaInValue);
                                strParaInValue = "'" + strParaInValue + "'";
                                strParaInValues = strParaInValues + strParaInValue + ",";
                            }
                            if(!strParaInValues.equalsIgnoreCase(""))
                                strParaInValues = strParaInValues.substring(0, strParaInValues.length()-1);
                            
                            dataFilters = dataFilters + "  in ("+ strParaInValues +") ";
                            
                        }
                        else if(opname.equals("mulsel"))
                        {
                            dataFilters = dataFilters + "  and (";
                            String parrs[]=String.valueOf(paramValue).split(",");
                            for(int i=0;i<parrs.length;i++)
                            {
                                String strParaInValue = parrs[i];
                                strParaInValue = ","+ strParaInValue +",";
                                dataFilters = dataFilters + WSoftUtil.dbSqlLikeByField(fname);
                                larg.add(strParaInValue);

                                if(i<parrs.length-1)
                                    dataFilters = dataFilters + " or ";
                            }
                            dataFilters = dataFilters + ") ";
                        }
                        else if (opname.equals("equaldept"))
                        {
                            if(userDetails.getUser().getParentDeptId()==0)
                            {
                                dataFilters = dataFilters + " in ("+ getSubDeptIDs(userDetails.getUser()) +") ";
                            }
                            else
                            {
                                dataFilters = dataFilters + " = "+ userDetails.getUser().getDeptId().toString() +" ";
                            }
                        }
                        else if (opname.equals("psndept"))
                        {
                            if(userDetails.getUser().getParentDeptId()==0)
                            {
                                dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid in ("+ getSubDeptIDs(userDetails.getUser()) +")) ";
                            }
                            else
                            {
                                dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid = "+ userDetails.getUser().getDeptId().toString() +") ";
                            }
                        }
                        else if (opname.equals("psnorg"))
                        {
                            dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" ) ";
                        }

                        if(opname.indexOf("dt")==0)
                        {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                            java.sql.Timestamp sDate = null;
                            try 
                            {
                                java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                sDate = new java.sql.Timestamp(dateTmp.getTime());
                                larg.add(sDate);
                            } catch (ParseException e) {
                                e.printStackTrace();
                            }
                        }
                        else if(opname.indexOf("d")==0)
                        {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                            java.sql.Date sDate = null;
                            try 
                            {
                                java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                sDate = new java.sql.Date(dateTmp.getTime());
                                larg.add(sDate);
                            } catch (ParseException e) {
                                e.printStackTrace();
                            }
                        }
                        else if(!opname.equals("sel")&&!opname.equals("mulsel")&&!opname.equals("equaldept")&&!opname.equals("psndept")&&!opname.equals("psnorg"))
                        {
                            larg.add(paramValue);
                        }
                    }
                }
            }

            if(!dataFilters.equals(""))
                dataFilters = " 1=1 " + dataFilters + " and ";

            sql = "select * from " + dataType + " where " + dataFilters + " " + pkey + " = ? " ;

            Object[] args = new Object[larg.size()+1];
            for(int j=0;j<larg.size();j++)
            {
                args[j]= larg.get(j); 
            }

            if(pkeyType.equals("i"))
                args[args.length-1]=Integer.parseInt(itemIDs);
            else
                args[args.length-1]=itemIDs;

            if(jsonObject.containsKey("pageParam_isDebug")&&jsonObject.getString("pageParam_isDebug").equals("1"))
            {
                codeDebugLog("sql", sql);
                codeDebugLog("args", args);
            }

            List ldatas =  datalistDao.getDatas(sql, args);
            if(ldatas.size()==0)
            {
                List<Object> lreturn = new ArrayList<>();
                lreturn.add("no record");
                return lreturn;
            }

            //Hidden fields need to be removed and should not be loaded to the client
            String dfHiddenNew="";
            Boolean chkWfmForm = false;
            if(isViewWfmLog||isUpdWfmForm)
            {
                chkWfmForm = true;
            }
            Map<String,String> mrv = getDbFieldRights(viewCode, userDetails, chkWfmForm,wfmId, wfmNodeId);
            dfHiddenNew=mrv.get("hidden");
            dfHiddenNew = dfHiddenNew.toUpperCase();

            Map<String,Object> mpdb=(Map)ldatas.get(0);
            Set<String> mpsets = mpdb.keySet();
            Map<String, Object> mp = new HashMap<String, Object>();
            for (String key : mpsets) 
            {
                if(!dfHiddenNew.equals(""))
                {
                    if(dfHiddenNew.indexOf(key.toUpperCase())<0)
                    {
                        mp.put(key.toUpperCase(), mpdb.get(key));
                    }
                }
                else
                {
                    mp.put(key.toUpperCase(), mpdb.get(key)); 
                }
            }
            ldatas.set(0, mp);

            Map<String,Object> mdfdb = new HashMap<>();
            List ldfs = datalistDao.getDataFileds(dataType);
            for(int j=0;j<ldfs.size();j++)
            {
                Map<String,Object> mdf=(Map)ldfs.get(j);
                String strFdName = (String)mdf.get("FIELD");
                String strFdTitle = (String)mdf.get("FIELD_TYPE"); 
                mdfdb.put(strFdName.toUpperCase(),"1");
                if(strFdTitle.equalsIgnoreCase("d"))
                {
                    if(mp.containsKey(strFdName.toUpperCase())&&mp.get(strFdName.toUpperCase())!=null)
                    {
                        mp.put(strFdName.toUpperCase(),WSoftUtil.dbSqlDateStrDeal(mp.get(strFdName.toUpperCase()), "yyyy-MM-dd"));
                    }
                }
                else if(strFdTitle.equalsIgnoreCase("dt"))
                {
                    if(mp.containsKey(strFdName.toUpperCase())&&mp.get(strFdName.toUpperCase())!=null)
                    {
                        mp.put(strFdName.toUpperCase(),WSoftUtil.dbSqlDateStrDeal(mp.get(strFdName.toUpperCase()), "yyyy-MM-dd HH:mm:ss"));
                    }
                }
            }

            String strClob="";
            JSONObject jDataFile=null;
            if(dataType.indexOf("tbl")==0)
            {
                Map<String,Object> mdb =  datalistDao.getDataSingle("select id from  "+ dataType + "_clob where id=?",new Object[] {itemIDs});
                if(mdb!=null)
                {
                    strClob = datalistDao.getClobDatas("select datacontent from "+ dataType + "_clob where id=?", "datacontent",itemIDs);
                    jDataFile = JSON.parseObject(strClob);
                    Set<String> jDataFileSet = jDataFile.keySet();
                    for (String key : jDataFileSet) 
                    {
                        if(key.indexOf("field_")==0)
                        {
                            String strKeyField = key.substring(6).toUpperCase();
                            if(!mdfdb.containsKey(strKeyField))
                            {
                                mp.put(strKeyField, jDataFile.getString(key));
                            }
                        }
                    }
                }
            }

            List<List> lreturn = new ArrayList<>();
            lreturn.add(ldatas);
            return lreturn;

        }
        return null;
        
    }

    public void codeAddClobDatas(String viewCode,String itemIDs,String content)  throws Throwable 
    {
        datalistDao.addClobDatas("insert into " + viewCode + "_clob(id,datacontent) values(?,?) ", itemIDs, content);
    }

    public void codeUpdClobDatas(String viewCode,String itemIDs,String content)  throws Throwable 
    {
        datalistDao.updClobDatas("update " + viewCode + "_clob set datacontent=? where id=? ", itemIDs,content);
    }

    public Map<String,Object> codeGetClobDatas(String viewCode,String itemIDs)  throws Throwable 
    {
        Map<String,Object> mreturn = new HashMap<>();
        String strClob = datalistDao.getClobDatas("select datacontent from "+ viewCode + "_clob where id=?", "datacontent",itemIDs);
        JSONObject jDataFile = JSON.parseObject(strClob);
        Set<String> jDataFileSet = jDataFile.keySet();
        for (String key : jDataFileSet) 
        {
            if(key.indexOf("field_")==0)
            {
                mreturn.put(key.substring(6).toUpperCase(), jDataFile.getString(key));
            }
        }
        return mreturn;
    }

    public Map<String,Object> codeGetClobDatasCopy(String viewCode,String itemIDs)  throws Throwable 
    {
        Map<String,Object> mreturn = new HashMap<>();
        String strClob = datalistDao.getClobDatas("select datacontent from "+ viewCode + "_clob where id=?", "datacontent",itemIDs);
        JSONObject jDataFile = JSON.parseObject(strClob);
        Set<String> jDataFileSet = jDataFile.keySet();
        for (String key : jDataFileSet) 
        {
            mreturn.put(key, jDataFile.getString(key));
        }
        return mreturn;
    }

    public String codeFileSaveTxt(String fileName,String content)  throws Throwable 
    {
        Boolean needdb=true;
        try {

            String fileGuid = WSoftUtil.genGuid(null);
            java.util.Date day= new java.util.Date();
            
            SimpleDateFormat sdf= new SimpleDateFormat("yyyyMMdd");
            String curDate = sdf.format(day);
            String curDateDir = WSoftUtil.propertyGetPara("datafilesDir") + "/" + curDate;
            new File(curDateDir).mkdirs();

            String filePath = curDate + "/" + fileGuid + fileName.substring(fileName.indexOf("."));
            
            WSoftUtil.saveFile(WSoftUtil.propertyGetPara("datafilesDir") + "/" + filePath, content);
            String fileType = Files.probeContentType(Paths.get(filePath));
            Long fileSize = WSoftUtil.readFileSize(filePath);
            
            if(needdb)
                fService.addDatas(fileGuid, fileName, filePath, fileSize,fileType,"normal");
            
            return fileGuid;

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again later!", ex);
        }
    }

    public String codeFileSavePDF(String temHtml,String content)  throws Throwable 
    {
        Boolean needdb=true;
        try {

        Map<String,Object> mp = (Map<String,Object>)JSON.parse(content);

        String pdfname=WSoftUtil.genGuid(null);
        String strPdfName = pdfname + ".pdf";

        String fileGuid = "";
        java.util.Date day=new java.util.Date();
        SimpleDateFormat sdf= new SimpleDateFormat("yyyyMMdd");
        String curDate = sdf.format(day);
        String curDateDir = WSoftUtil.propertyGetPara("pdffilesDir") + "/" + curDate;
        new File(curDateDir).mkdirs();
        
        String pdfpath = curDate + "/" + pdfname + ".pdf";
        fileGuid = DatalistRestController.dataGenPDFDoSub(mp,pdfname,pdfpath,temHtml,this,redisCache,fService);
        
        return fileGuid;

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file. Please try again later!", ex);
        }
    }

    @Transactional
    public Map<String,Object> initDatas(String viewCode,String pageID,JSONObject jsonObject)  throws Throwable 
    {
        Map<String,Object> mreturn = new HashMap<>();

        UserLogin userDetails=null;
        if(!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }
        String strCodes = "";
        if(!viewCode.equals(""))
        {
            List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
            if(lview.size()>0)
            {
                Map<String,Object> mview=(Map)lview.get(0);
                strCodes = (String)mview.get("codes");
            }
        }
        else
        {
            Map<String,Object> mdb =  datalistDao.getDataSingle("select codes from page where location=?",new Object[] {pageID});
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
                Map<String,String> mpSource = new HashMap<>();
                mpSource.put("source","");
                WSoftUtil.codeGetSources(this, codeID, mpSource, false,redisCache);
                String strSource = mpSource.get("source");
                if(!strSource.equals(""))
                {
                    ScriptEngineManager factory = new ScriptEngineManager();
                    ScriptEngine engine = factory.getEngineByName("JavaScript");
                    Bindings bind = engine.createBindings();  
                    engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                    Map<String,Object> mapPara = new HashMap<>();

                    Set<String> jsonset = jsonObject.keySet();
                    for (String key : jsonset) 
                    {
                        if(key.indexOf("pageParam_")==0)
                        {
                            mapPara.put(key,WSoftUtil.getURLDecoderString(jsonObject.getString(key)));
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
                        mapPara.put("visitorId",-1);
                        mapPara.put("visitorDeptId",-1);
                        mapPara.put("visitorOrgId",-1);
                    }

                    bind.put("mapPara", mapPara); 
                    bind.put("datalistService", this); 
                    
                    try 
                    {  
                        //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                        CompiledScript script = ((Compilable) engine).compile(strSource);
                        script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                        //engine.eval(strSource); 
                        
                        //Map<String,Object> mrp = (Map<String,Object>)mapPara.get("_returnVal_");
                        for(Map.Entry<String,Object> entry:mapPara.entrySet())
                        {
                            if(entry.getKey().indexOf("globalParam_")==0)
                            {
                                mreturn.put(entry.getKey(),entry.getValue());
                                if(entry.getValue()!=null)
                                {
                                    Class cls = entry.getValue().getClass();
                                    if(cls.getName().equals("org.openjdk.nashorn.api.scripting.ScriptObjectMirror"))
                                    {
                                        ScriptObjectMirror jsOriginal = (ScriptObjectMirror)entry.getValue();
                                        if (jsOriginal.isArray()) 
                                        {
                                            List<Object> lsub = new ArrayList<>();
                                            Integer length = (Integer)jsOriginal.get("length");
                                            for (int i = 0; i < length; i++) {
                                                lsub.add(jsOriginal.get(""+Integer.toString(i)));
                                            }
                                            mreturn.put(entry.getKey(),lsub);
                                        }
                                    }
                                }
                            }
                        }

                    } catch (Exception e) 
                    {  
                        e.printStackTrace();
                        String strError = "[CodeID]"+ codeID +"[Source]"+ strSource +"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();
                        throw new RuntimeException("Data initialization rule execution error:"+strError);
                    } 
                }
            }
        }

        return mreturn;
    }

    @Transactional
    public int delDataFields(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        String sql = "select tablename,field,fieldindb from data_fields where id=?";
        Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[]{itemIDs});
        if(mp!=null)
        {
            String tbl = mp.get("tablename").toString();
            String field = mp.get("field").toString();
            String fieldindb = mp.get("fieldindb").toString();
            
            if(fieldindb.equals("1"))
            {
                sql = "alter table " + tbl + " drop column " + field;
                datalistDao.updDatas(sql, new Object[]{});
            }

            sql = "delete from data_fields where id=?";
            datalistDao.delDatas(sql, new Object[]{itemIDs});

            sql = "delete from data_fields_com where id=?";
            datalistDao.delDatas(sql, new Object[]{itemIDs});
        }
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data_fields");
        return 0;
    }

    @Transactional
    public int delDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        int rows=0;
        String msg ="";
        msg = delDatasDo(viewCode,itemIDs,jsonObject);
        if(msg.matches("[0-9]+"))
        {
            return Integer.valueOf(msg);
        }
        return rows;
    }

    @Transactional
    public String delDatasMsg(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        String msg ="";
        msg = delDatasDo(viewCode,itemIDs,jsonObject);
        if(msg.matches("[0-9]+"))
        {
            return "";
        }
        return msg;
    }

    @Transactional
    public String delDatasDo(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        String sql = "";
        String dataType = "";
        String pkey = "";
        String pkeyType = "";
        List<Object> larg = new ArrayList<>();
        String dataFilters="";

        UserLogin userDetails=null;
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            userDetails = (UserLogin)authenticationToken.getPrincipal();
        }
        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");

        List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
        if(lview.size()>0)
        {
            Map<String,Object> mview=(Map)lview.get(0);
            dataType=(String)mview.get("tablename");
            pkey=(String)mview.get("pkey");
            pkeyType=(String)mview.get("pkey_type");
            String strCodes = (String)mview.get("codes");

            String strSqlSub = getDataRights(dataType,userDetails,factory,engine,strCodes,"del",larg); 
            if(!strSqlSub.trim().equals(""))
            {
                dataFilters = dataFilters + " and " + strSqlSub + " ";
            }
            else
            {
                if(userDetails.getUser().getId()!=1)
                {
                    if(dataType.indexOf("tbl")==0)
                    {
                        jsonObject.put("filter_syspsnid_equal",userDetails.getUser().getId());
                    }
                }
            }

            Set<String> jsonset = jsonObject.keySet();
            for (String key : jsonset) 
            {
                Object paramValue = jsonObject.get(key);
                String farrs[]=key.split("_");
                if(farrs.length==3&&farrs[0].equalsIgnoreCase("filter"))
                {
                    String sarrs[]=farrs[1].split(",");
                    if(sarrs.length>1)
                    {
                        dataFilters = dataFilters + " and (";
                        for(int i=0;i<sarrs.length;i++)
                        {
                            if(!WSoftUtil.dataNameChack(sarrs[i]))
                            {
                                throw new RuntimeException("Invalid character");
                            }
                            dataFilters = dataFilters + sarrs[i];
                            if(farrs[2].equalsIgnoreCase("like"))
                            {
                                dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                            }
                            if(farrs[2].equalsIgnoreCase("equal"))
                            {
                                dataFilters = dataFilters + " = ?";
                            }
                            larg.add(paramValue);
                            if(i<sarrs.length-1)
                                dataFilters = dataFilters + " or ";
                        }
                        dataFilters = dataFilters + ") ";        
                    }
                    else
                    {
                        String fname = farrs[1];
                        String fnamechk = fname.replace(".", "");
                        if(!WSoftUtil.dataNameChack(fnamechk))
                        {
                            throw new RuntimeException("Invalid character");
                        }
                        
                        String opname = farrs[2];
                        opname=opname.toLowerCase();

                        if(!opname.equals("mulsel"))
                            dataFilters = dataFilters + " and " + fname;

                        if(opname.equals("like"))
                        {
                            dataFilters = dataFilters + WSoftUtil.dbSqlLike();
                        }
                        else if(opname.equals("equal")||opname.equals("dequal")||opname.equals("dtequal"))
                        {
                            dataFilters = dataFilters + " = ?";
                        }
                        else if(opname.equals("lte")||opname.equals("dlte")||opname.equals("dtlte"))
                        {
                            dataFilters = dataFilters + "  <= ?";
                        }
                        else if(opname.equals("gte")||opname.equals("dgte")||opname.equals("dtgte"))
                        {
                            dataFilters = dataFilters + "  >= ?";
                        }
                        else if(opname.equals("lt")||opname.equals("dlt")||opname.equals("dtlt"))
                        {
                            dataFilters = dataFilters + "  < ?";
                        }
                        else if(opname.equals("gt")||opname.equals("dgt")||opname.equals("dtgt"))
                        {
                            dataFilters = dataFilters + "  > ?";
                        }
                        else if(opname.equals("sel"))
                        {
                            String parrs[]=String.valueOf(paramValue).split(",");
                            String strParaInValues = "";
                            for(int i=0;i<parrs.length;i++)
                            {
                                String strParaInValue = parrs[i];
                                strParaInValue = WSoftUtil.replaceDBPara(strParaInValue);
                                strParaInValue = "'" + strParaInValue + "'";
                                strParaInValues = strParaInValues + strParaInValue + ",";
                            }
                            if(!strParaInValues.equalsIgnoreCase(""))
                                strParaInValues = strParaInValues.substring(0, strParaInValues.length()-1);
                            
                            dataFilters = dataFilters + "  in ("+ strParaInValues +") ";
                            
                        }
                        else if(opname.equals("mulsel"))
                        {
                            dataFilters = dataFilters + "  and (";
                            String parrs[]=String.valueOf(paramValue).split(",");
                            for(int i=0;i<parrs.length;i++)
                            {
                                String strParaInValue = parrs[i];
                                strParaInValue = ","+ strParaInValue +",";
                                dataFilters = dataFilters + WSoftUtil.dbSqlLikeByField(fname);
                                larg.add(strParaInValue);

                                if(i<parrs.length-1)
                                    dataFilters = dataFilters + " or ";
                            }
                            dataFilters = dataFilters + ") ";
                        }
                        else if (opname.equals("equaldept"))
                        {
                            if(userDetails.getUser().getParentDeptId()==0)
                            {
                                dataFilters = dataFilters + " in ("+ getSubDeptIDs(userDetails.getUser()) +") ";
                            }
                            else
                            {
                                dataFilters = dataFilters + " = "+ userDetails.getUser().getDeptId().toString() +" ";
                            }
                        }
                        else if (opname.equals("psndept"))
                        {
                            if(userDetails.getUser().getParentDeptId()==0)
                            {
                                dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid in ("+ getSubDeptIDs(userDetails.getUser()) +")) ";
                            }
                            else
                            {
                                dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid = "+ userDetails.getUser().getDeptId().toString() +") ";
                            }
                        }
                        else if (opname.equals("psnorg"))
                        {
                            dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" ) ";
                        }

                        if(opname.indexOf("dt")==0)
                        {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                            java.sql.Timestamp sDate = null;
                            try 
                            {
                                java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                sDate = new java.sql.Timestamp(dateTmp.getTime());
                                larg.add(sDate);
                            } catch (ParseException e) {
                                e.printStackTrace();
                            }
                        }
                        else if(opname.indexOf("d")==0)
                        {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                            java.sql.Date sDate = null;
                            try 
                            {
                                java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                sDate = new java.sql.Date(dateTmp.getTime());
                                larg.add(sDate);
                            } catch (ParseException e) {
                                e.printStackTrace();
                            }
                        }
                        else if(!opname.equals("sel")&&!opname.equals("mulsel")&&!opname.equals("equaldept")&&!opname.equals("psndept")&&!opname.equals("psnorg"))
                        {
                            larg.add(paramValue);
                        }
                    }
                }
            }

            if(!dataFilters.equals(""))
                dataFilters = " 1=1 " + dataFilters + " and ";

            String parrs[]=String.valueOf(itemIDs).split(",");
            String strParaInValues = "";
            if(parrs.length>1)
            {
                Object[] args = new Object[larg.size()];
                for(int j=0;j<larg.size();j++)
                {
                    args[j]= larg.get(j); 
                }

                for(int i=0;i<parrs.length;i++)
                {
                    String strParaInValue = parrs[i];
                    strParaInValue = WSoftUtil.replaceDBPara(strParaInValue);
                    strParaInValue = "'" + strParaInValue + "'";
                    strParaInValues = strParaInValues + strParaInValue + ",";
                }
                if(!strParaInValues.equalsIgnoreCase(""))
                    strParaInValues = strParaInValues.substring(0, strParaInValues.length()-1);
                dataFilters = dataFilters + " " + pkey + " in ("+ strParaInValues +") ";

                String msg = codeUpd(jsonObject,strParaInValues,userDetails,factory,engine,strCodes,"afterdel");
                if(!msg.equals(""))
                {
                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                    return msg;
                }

                sql = "delete from " + dataType + " where " + dataFilters ;
                if(jsonObject.containsKey("isdebug")&&jsonObject.getString("isdebug").equals("true"))
                {
                    codeDebugLog("sql", sql);
                    codeDebugLog("args", args);
                }

                int rows = datalistDao.delDatas(sql, args);

                if(dataType.indexOf("tbl")==0)
                {
                    sql = "delete from " + dataType + "_clob where  id in ("+ strParaInValues +") ";
                    datalistDao.delDatas(sql, new Object[]{});
                }

                WSoftUtil.dbUpdDataUpdTime(datalistDao, dataType);

                return String.valueOf(rows);
            }
            else
            {
                Object[] args = new Object[larg.size()+1];
                for(int j=0;j<larg.size();j++)
                {
                    args[j]= larg.get(j); 
                }

                String msg = codeUpd(jsonObject,itemIDs,userDetails,factory,engine,strCodes,"afterdel");
                if(!msg.equals(""))
                {
                    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                    return msg;
                }

                sql = "delete from " + dataType + " where " + dataFilters + " " + pkey + " = ? " ;
                if(pkeyType.equals("i"))
                    args[args.length-1]=Integer.parseInt(itemIDs);
                else
                    args[args.length-1]=itemIDs;
                
                if(jsonObject.containsKey("isdebug")&&jsonObject.getString("isdebug").equals("true"))
                {
                    codeDebugLog("sql", sql);
                    codeDebugLog("args", args);
                }

                int rows = datalistDao.delDatas(sql, args);

                if(dataType.indexOf("tbl")==0)
                {
                    sql = "delete from " + dataType + "_clob where  id =? ";
                    datalistDao.delDatas(sql, new Object[]{itemIDs});
                }

                WSoftUtil.dbUpdDataUpdTime(datalistDao, dataType);

                return String.valueOf(rows);
            }
        }
        return "0";
    }

    @Transactional
    public List updDatas(String viewCode,String itemIDs,JSONObject jsonObject)  throws Throwable 
    {
        String msg="";
        int rows = 0;
        String sql = "";
        String dataType = "";
        String pkey = "";
        String pkeyType = "";
        String dataFilters="";
        List<Object> larg = new ArrayList<>();

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        Set<String> jsonset = jsonObject.keySet();
        String sqlFields = "";

        if(itemIDs==null||itemIDs.trim().equals(""))
        {
            return null;
        }

        UserLogin userDetails=null;
        if(SecurityContextHolder.getContext().getAuthentication()!=null&&!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }

        Boolean isUpdWfmForm = false;
        String wfmid = "";
        String wfmNodeId = "";
        String notUpds = ",";
        if(jsonObject.containsKey("pageParam_updWfmForm"))
        {
            if(jsonObject.containsKey("pageParam_wfmWorklistId")&&jsonObject.get("pageParam_wfmWorklistId")!=null)
            {
                String wfmworklistid = jsonObject.getString("pageParam_wfmWorklistId");
                if(!wfmworklistid.equals(""))
                {
                    String strSql = "select wfmid,wfmnodeid,dataitemid,tblname,formname from wfm_run_worklist where wfmworkid=? and psnid=? and completed='0'";
                    List dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid,userDetails.getUser().getId()});
                    if(dataWfm.size()>0)
                    {
                        Map<String,Object> mp = (Map<String,Object>)dataWfm.get(0);
                        String did = mp.get("dataitemid").toString();
                        String formname = mp.get("formname").toString();
                        String tblname = mp.get("tblname").toString();
                        wfmid = mp.get("wfmid").toString();
                        wfmNodeId = mp.get("wfmnodeid").toString();

                        if(!formname.equalsIgnoreCase(tblname))
                        {
                            strSql = "select id from "+ formname +" where wfmworklistid=?";
                            dataWfm = this.getDatasBySql(strSql, new Object[]{wfmworklistid});
                            if(dataWfm.size()>0)
                            {
                                mp = (Map<String,Object>)dataWfm.get(0);
                                itemIDs = String.valueOf(mp.get("id"));
                                isUpdWfmForm=true;
                            }
                        }
                        else
                        {
                            itemIDs = did;
                            isUpdWfmForm=true;
                        }
                    }
                }
            }
        }

        //Remove hidden and read-only fields
        String dfHiddenNew="";
        String dfReadonlyNew="";
        Map<String,String> mrv = getDbFieldRights(viewCode, userDetails, isUpdWfmForm,wfmid, wfmNodeId);
        dfHiddenNew=mrv.get("hidden");
        dfReadonlyNew=mrv.get("readonly");
        notUpds = notUpds + dfHiddenNew + "," + dfReadonlyNew+",";
        notUpds = notUpds.toUpperCase();

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");

        List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
        if(lview.size()>0)
        {
            Map<String,Object> mview=(Map)lview.get(0);
            dataType=(String)mview.get("tablename");
            pkey=(String)mview.get("pkey");
            pkeyType=(String)mview.get("pkey_type");
            String strCodes = (String)mview.get("codes");
            String rules=(String)mview.get("RULES_NOTDUPLICATE");

            if(dataType.indexOf("tbl")==0&&!isUpdWfmForm)
            {
                String chkUpdSql="select id from "+ dataType + " where id=? and sysstatus='0' ";
                List updDatalist = datalistDao.getDatas(chkUpdSql,new Object[]{itemIDs});
                if(updDatalist.size()==0)
                {
                    msg = WSoftMsg.getMsgItem("data_sub",lan);
                }
            }

            if(rules!=null)
                rules=rules.trim();
            else
                rules="";
            String rulesCompare = rules+"=?";

            if(msg.equals(""))
            {
                msg = codeUpd(jsonObject,itemIDs,userDetails,factory,engine,strCodes,"beforeupd");
            }

            Boolean isFormPub=false;
            if(jsonObject.containsKey("FORMPUB")&&jsonObject.getBoolean("FORMPUB"))
            {
                isFormPub = true;
            }

            List<Object> largRights = new ArrayList<>();
            if(msg==null||msg.equals(""))
            {
                if(!isUpdWfmForm&&!isFormPub)
                {
                    String strSqlSub = getDataRights(dataType,userDetails,factory,engine,strCodes,"upd",largRights); 
                    if(!strSqlSub.trim().equals(""))
                    {
                        dataFilters = dataFilters + " and " + strSqlSub + " ";
                    }
                    else
                    {
                        if(userDetails.getUser().getId()!=1)
                        {
                            if(dataType.indexOf("tbl")==0)
                            {
                                jsonObject.put("filter_syspsnid_equal",userDetails.getUser().getId());
                            }
                        }
                    }
                }

                List ldfs = datalistDao.getDataFileds(dataType);
                Map<String,String> mdfs = new HashMap<String,String>();
                for(int j=0;j<ldfs.size();j++)
                {
                    Map<String,Object> mdf=(Map)ldfs.get(j);
                    String strFdName = (String)mdf.get("FIELD");
                    String strFdTitle = (String)mdf.get("FIELD_TYPE"); 
                    mdfs.put(strFdName.toLowerCase(),strFdTitle); 
                }
        
                for (String key : jsonset) 
                {
                    if(key.indexOf("field_")==0)
                    {
                        String sArr[] = key.split("_");
                        String paramValue = jsonObject.getString(key);
                        Object pObj =  jsonObject.get(key);
                        if(pObj instanceof Double)
                        {
                            if(jsonObject.getString(key).endsWith(".0"))
                            {
                                paramValue=paramValue.substring(0,paramValue.length()-2);
                            }
                        }
                        if(!WSoftUtil.dataNameChack(key.substring(6)))
                        {
                            msg = "Illegal parameter:"+key;
                            break;
                        }

                        notUpds = notUpds + "SYSORGID,SYSPNTDEPTID,SYSPNTDEPTNAME,SYSDEPTID,SYSDEPTNAME,SYSPSNID,SYSPSNNAME,SYSSTATUS,UPDPSNID,UPDTIME,DGUID,VERSION,";
                        if(!pkey.equalsIgnoreCase(sArr[1])&&notUpds.indexOf(","+sArr[1].toUpperCase()+",")<0)
                        {
                            if(mdfs.containsKey(sArr[1].toLowerCase()))
                            {
                                String ftype = mdfs.get(sArr[1].toLowerCase()).trim();

                                if(ftype.equalsIgnoreCase("i"))
                                {
                                    if(paramValue!=null)
                                        larg.add(Integer.parseInt(paramValue));
                                    else
                                        larg.add(paramValue);
                                }
                                else if(ftype.equalsIgnoreCase("d"))
                                {
                                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                                    java.sql.Date sDate = null;
                                    try 
                                    {
                                        if(paramValue!=null&&!paramValue.trim().equals(""))
                                        {
                                            java.util.Date dateTmp = sdf.parse(paramValue);
                                            sDate = new java.sql.Date(dateTmp.getTime());
                                        }
                                        larg.add(sDate);
                                    } catch (ParseException e) {
                                        e.printStackTrace();
                                    }
                                }
                                else if(ftype.equalsIgnoreCase("dt"))
                                {
                                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                                    java.sql.Timestamp sDate = null;
                                    try 
                                    {
                                        if(paramValue!=null&&!paramValue.trim().equals(""))
                                        {
                                            java.util.Date dateTmp = sdf.parse(paramValue);
                                            sDate = new java.sql.Timestamp(dateTmp.getTime());
                                        }
                                        larg.add(sDate);
                                    } catch (ParseException e) {
                                        e.printStackTrace();
                                    }
                                }
                                else if(ftype.equalsIgnoreCase("m1")||ftype.equalsIgnoreCase("m2"))
                                {
                                    if(paramValue!=null&&paramValue.trim().equals(""))
                                    {
                                        paramValue = null;
                                        larg.add(paramValue);
                                    }
                                    else
                                    {
                                        larg.add(paramValue);  
                                    }
                                }
                                else
                                    larg.add(paramValue);

                                sqlFields = sqlFields + " " + WSoftUtil.dbSqlSqlserverDealFname(key.substring(6)) + "=?,";
                            }
                            else
                            {
                                if(dataType.indexOf("tbl")!=0)
                                {
                                    larg.add(paramValue);
                                    sqlFields = sqlFields + " " + WSoftUtil.dbSqlSqlserverDealFname(key.substring(6)) + "=?,";
                                }
                            }

                        }
                    }
                }

                for(int k=0;k<largRights.size();k++)
                {
                    larg.add(largRights.get(k)); 
                }

                for (String key : jsonset) 
                {
                    Object paramValue = jsonObject.get(key);
                    String farrs[]=key.split("_");
                    if(farrs.length==3&&farrs[0].equalsIgnoreCase("filter"))
                    {
                        String sarrs[]=farrs[1].split(",");
                        if(sarrs.length>1)
                        {
                            dataFilters = dataFilters + " and (";
                            for(int i=0;i<sarrs.length;i++)
                            {
                                if(!WSoftUtil.dataNameChack(sarrs[i]))
                                {
                                    throw new RuntimeException("Invalid character");
                                }
                                dataFilters = dataFilters + sarrs[i];
                                if(farrs[2].equalsIgnoreCase("like"))
                                {
                                    dataFilters = dataFilters + WSoftUtil.dbSqlLike(); 
                                }
                                if(farrs[2].equalsIgnoreCase("equal"))
                                {
                                    dataFilters = dataFilters + " = ?";
                                }
                                larg.add(paramValue);
                                if(i<sarrs.length-1)
                                    dataFilters = dataFilters + " or ";
                            }
                            dataFilters = dataFilters + ") ";        
                        }
                        else
                        {
                            String fname = farrs[1];
                            String fnamechk = fname.replace(".", "");
                            if(!WSoftUtil.dataNameChack(fnamechk))
                            {
                                throw new RuntimeException("Invalid character");
                            }
                            
                            String opname = farrs[2];
                            opname=opname.toLowerCase();

                            if(!opname.equals("mulsel"))
                                dataFilters = dataFilters + " and " + fname;

                            if(opname.equals("like"))
                            {
                                dataFilters = dataFilters + WSoftUtil.dbSqlLike(); 
                            }
                            else if(opname.equals("equal")||opname.equals("dequal")||opname.equals("dtequal"))
                            {
                                dataFilters = dataFilters + " = ?";
                            }
                            else if(opname.equals("lte")||opname.equals("dlte")||opname.equals("dtlte"))
                            {
                                dataFilters = dataFilters + "  <= ?";
                            }
                            else if(opname.equals("gte")||opname.equals("dgte")||opname.equals("dtgte"))
                            {
                                dataFilters = dataFilters + "  >= ?";
                            }
                            else if(opname.equals("lt")||opname.equals("dlt")||opname.equals("dtlt"))
                            {
                                dataFilters = dataFilters + "  < ?";
                            }
                            else if(opname.equals("gt")||opname.equals("dgt")||opname.equals("dtgt"))
                            {
                                dataFilters = dataFilters + "  > ?";
                            }
                            else if(opname.equals("sel"))
                            {
                                String parrs[]=String.valueOf(paramValue).split(",");
                                String strParaInValues = "";
                                for(int i=0;i<parrs.length;i++)
                                {
                                    String strParaInValue = parrs[i];
                                    strParaInValue = WSoftUtil.replaceDBPara(strParaInValue);
                                    strParaInValue = "'" + strParaInValue + "'";
                                    strParaInValues = strParaInValues + strParaInValue + ",";
                                }
                                if(!strParaInValues.equalsIgnoreCase(""))
                                    strParaInValues = strParaInValues.substring(0, strParaInValues.length()-1);
                                
                                dataFilters = dataFilters + "  in ("+ strParaInValues +") ";
                                
                            }
                            else if(opname.equals("mulsel"))
                            {
                                dataFilters = dataFilters + "  and (";
                                String parrs[]=String.valueOf(paramValue).split(",");
                                for(int i=0;i<parrs.length;i++)
                                {
                                    String strParaInValue = parrs[i];
                                    strParaInValue = ","+ strParaInValue +",";
                                    dataFilters = dataFilters + WSoftUtil.dbSqlLikeByField(fname);
                                    larg.add(strParaInValue);

                                    if(i<parrs.length-1)
                                        dataFilters = dataFilters + " or ";
                                }
                                dataFilters = dataFilters + ") ";
                            }
                            else if (opname.equals("equaldept"))
                            {
                                if(userDetails.getUser().getParentDeptId()==0)
                                {
                                    dataFilters = dataFilters + " in ("+ getSubDeptIDs(userDetails.getUser()) +") ";
                                }
                                else
                                {
                                    dataFilters = dataFilters + " = "+ userDetails.getUser().getDeptId().toString() +" ";
                                }
                            }
                            else if (opname.equals("psndept"))
                            {
                                if(userDetails.getUser().getParentDeptId()==0)
                                {
                                    dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid in ("+ getSubDeptIDs(userDetails.getUser()) +")) ";
                                }
                                else
                                {
                                    dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" and deptid = "+ userDetails.getUser().getDeptId().toString() +") ";
                                }
                            }
                            else if (opname.equals("psnorg"))
                            {
                                dataFilters = dataFilters + " in (select psnid from psn_org where orgid="+ userDetails.getUser().getOrgId().toString() +" ) ";
                            }

                            if(opname.indexOf("dt")==0)
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                                java.sql.Timestamp sDate = null;
                                try 
                                {
                                    java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                    sDate = new java.sql.Timestamp(dateTmp.getTime());
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(opname.indexOf("d")==0)
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                                java.sql.Date sDate = null;
                                try 
                                {
                                    java.util.Date dateTmp = sdf.parse(paramValue.toString());
                                    sDate = new java.sql.Date(dateTmp.getTime());
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(!opname.equals("sel")&&!opname.equals("mulsel")&&!opname.equals("equaldept")&&!opname.equals("psndept")&&!opname.equals("psnorg"))
                            {
                                larg.add(paramValue);
                            }
                        }
                    }
                }

                Object[] args = new Object[larg.size()+1];

                if(msg.equalsIgnoreCase(""))
                {
                    if(!sqlFields.equalsIgnoreCase(""))
                        sqlFields = sqlFields.substring(0, sqlFields.length()-1);

                    for(int j=0;j<larg.size();j++)
                    {
                        args[j]= larg.get(j); 
                    }

                    if(!rules.equalsIgnoreCase(""))
                    {
                        String strSqlRule="";
                        Object[] argsRule = new Object[2];
                        String[] strFieldArrs = sqlFields.split(",");
                        for(int i=0;i<strFieldArrs.length;i++)
                        {
                            if(rulesCompare.equalsIgnoreCase(strFieldArrs[i].trim()))
                            {
                                argsRule[0]=args[i]; 
                                break;
                            }    
                        }
                        
                        if(pkeyType.equals("i"))
                            argsRule[1]=Integer.parseInt(itemIDs);
                        else
                            argsRule[1]=itemIDs;

                        strSqlRule = "select " + WSoftUtil.dbSqlTopFirst("1") + " "+ rules + " from " + dataType + " where " + rules +"=? and " + pkey +"!=? " + WSoftUtil.dbSqlTop("1");
                        List lrules =  datalistDao.getDatas(strSqlRule, argsRule);
                        if(lrules.size()>0)
                        {
                            msg=WSoftMsg.getMsgItem("data_duplic",lan);
                            List lfts = datalistDao.getDataFileds(dataType);
                            for(int j=0;j<lfts.size();j++)
                            {
                                Map<String,Object> mft=(Map)lfts.get(j);
                                String strFtName = (String)mft.get("field");
                                String strFtTitle = (String)mft.get("field_title");
                                if(strFtName.equalsIgnoreCase(rules))
                                {
                                    msg=strFtTitle + WSoftMsg.getMsgItem("data_duplic",lan);
                                    break;
                                }    
                            }
                        }
                    }
                }

                if(msg.equalsIgnoreCase(""))
                {
                    if(!dataFilters.equals(""))
                        dataFilters = " 1=1 " + dataFilters + " and ";

                    String updPsn = "-1";
                    if(userDetails!=null)
                    {
                        updPsn = String.valueOf(userDetails.getUser().getId()); 
                    }

                    if(dataType.indexOf("tbl")==0)
                    {
                        //Will querying before update cause performance issues?
                        String strVersion = "";
                        Map<String,Object> mversion = datalistDao.getDataSingle("select version from "+dataType+" where id=?", new Object[]{itemIDs});
                        if(mversion.get("version")!=null)
                            strVersion = mversion.get("version").toString();
                        else
                            strVersion = "V1000-000";

                            Map<String,Object> mdb =  datalistDao.getDataSingle("select id from  "+ dataType + "_clob where id=?",new Object[] {itemIDs});
                            if(mdb!=null)
                            {
                                String strClobData = datalistDao.getClobDatas("select datacontent from "+dataType+"_clob where id=?", "datacontent", itemIDs);
                                if(!strClobData.equals(jsonObject.toJSONString()))
                                {
                                    strVersion = strVersion.replaceAll("V", "");
                                    strVersion = strVersion.replaceAll("-", "");
                                    Integer intVersion = Integer.parseInt(strVersion)+1;
                                    strVersion = "V"+ intVersion.toString();
                                    strVersion = strVersion.substring(0, 5) + "-" + strVersion.substring(5);
                                    jsonObject.put("field_VERSION",strVersion);
                                }
                            }

                        sql = "update " + dataType + " set " + sqlFields + ",version='"+ strVersion +"',updpsnid='"+ updPsn +"',updtime="+ WSoftUtil.dbSqlSysdate() +" where " + dataFilters + pkey + " = ? " ;
                    }
                    else
                    {
                        sql = "update " + dataType + " set " + sqlFields + " where " + dataFilters + pkey + " = ? " ;
                    }

                    if(pkeyType.equals("i"))
                        args[args.length-1]=Integer.parseInt(itemIDs);
                    else
                        args[args.length-1]=itemIDs;
                    
                    if(jsonObject.containsKey("isdebug")&&jsonObject.getString("isdebug").equals("true"))
                    {
                        codeDebugLog("sql", sql);
                        codeDebugLog("args", args);
                    }

                    rows = datalistDao.updDatas(sql, args);

                    if(rows>0)
                    {
                        if(dataType.indexOf("tbl")==0)
                            datalistDao.updClobDatas("update " + dataType + "_clob set datacontent=? where id=? ", itemIDs, jsonObject.toJSONString());

                        WSoftUtil.dbUpdDataUpdTime(datalistDao, dataType);

                        msg = codeUpd(jsonObject,itemIDs,userDetails,factory,engine,strCodes,"afterupd");
                        if(!msg.equals(""))
                            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                    }
                    else
                        msg="System update error";
                    
                }
            }
        }

        List<Map<String,Object>> lreturn = new ArrayList<>();
        Map<String,Object> mreturn = new HashMap<String,Object>();
        mreturn.put("rows",rows);
        mreturn.put("msg",msg);
        lreturn.add(mreturn);

        return lreturn;
        
    }

    @Transactional
    public List addDatas(String viewCode,JSONObject jsonObject)  throws Throwable 
    {
        String msg="";
        String sql = "";
        String dataType = "";
        String pkey = "";
        Set<String> jsonset = jsonObject.keySet();
        String sqlFields = "";
        String sqlFieldsSub = "";
        String rules="";
        String pID="0";
        String strVersion="V1000-000";

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        UserLogin userDetails=null;
        if(SecurityContextHolder.getContext().getAuthentication()!=null&&!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }
        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");

        String dGuid = WSoftUtil.genGuid(null);
        Boolean isFormPub=false;
        if(jsonObject.containsKey("FORMPUB")&&jsonObject.getBoolean("FORMPUB"))
        {
            isFormPub = true;
        }

        List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
        if(lview.size()>0)
        {
            Map<String,Object> mview=(Map)lview.get(0);
            dataType=(String)mview.get("tablename");
            pkey=(String)mview.get("pkey");
            if(mview.get("RULES_NOTDUPLICATE")!=null)
            {
                rules=(String)mview.get("RULES_NOTDUPLICATE");
                rules=rules.trim();
            }
            String strCodes = (String)mview.get("codes");
            msg = codeUpd(jsonObject,"",userDetails,factory,engine,strCodes,"beforeupd");
            if(msg==null||msg.equals(""))
            {

                List<Object> larg = new ArrayList<>();

                List ldfs = datalistDao.getDataFileds(dataType);
                Map<String,String> mdfs = new HashMap<String,String>();
                for(int j=0;j<ldfs.size();j++)
                {
                    Map<String,Object> mdf=(Map)ldfs.get(j);
                    String strFdName = (String)mdf.get("FIELD");
                    String strFdTitle = (String)mdf.get("FIELD_TYPE"); 
                    mdfs.put(strFdName.toLowerCase(),strFdTitle); 
                }
            
                String notUpds = ",";
                if(isFormPub)
                    notUpds = notUpds + "ID,SYSORGID,SYSPNTDEPTID,SYSPNTDEPTNAME,SYSDEPTID,SYSDEPTNAME,SYSPSNID,SYSPSNNAME,SYSSTATUS,UPDPSNID,UPDTIME,DGUID,VERSION,";
                else
                    notUpds = notUpds + "ID,SYSSTATUS,DGUID,VERSION,";

                for (String key : jsonset) 
                {
                    if(key.indexOf("field_")==0&&notUpds.indexOf(","+key.substring(6).toUpperCase()+",")<0)
                    {
                        String sArr[] = key.split("_");
                        String paramValue = jsonObject.getString(key);

                        Object pObj =  jsonObject.get(key);
                        if(pObj instanceof Double)
                        {
                            if(jsonObject.getString(key).endsWith(".0"))
                            {
                                paramValue=paramValue.substring(0,paramValue.length()-2);
                            }
                        }

                        if(!WSoftUtil.dataNameChack(key.substring(6)))
                        {
                            msg = "Illegal parameter:"+key;
                            break;
                        }

                        if(mdfs.containsKey(sArr[1].toLowerCase()))
                        {
                            String ftype = mdfs.get(sArr[1].toLowerCase()).trim();
                            if(ftype.equalsIgnoreCase("i"))
                            {
                                if(paramValue!=null)
                                    larg.add(Integer.parseInt(paramValue));
                                else
                                    larg.add(paramValue);
                            }
                            else if(ftype.equalsIgnoreCase("d"))
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                                java.sql.Date sDate = null;
                                try 
                                {
                                    if(!paramValue.trim().equals(""))
                                    {
                                        java.util.Date dateTmp = sdf.parse(paramValue);
                                        sDate = new java.sql.Date(dateTmp.getTime());
                                    }
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(ftype.equalsIgnoreCase("dt"))
                            {
                                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                                java.sql.Timestamp sDate = null;
                                try 
                                {
                                    if(!paramValue.trim().equals(""))
                                    {
                                        java.util.Date dateTmp = sdf.parse(paramValue);
                                        sDate = new java.sql.Timestamp(dateTmp.getTime());
                                    }
                                    larg.add(sDate);
                                } catch (ParseException e) {
                                    e.printStackTrace();
                                }
                            }
                            else if(ftype.equalsIgnoreCase("m1")||ftype.equalsIgnoreCase("m2"))
                            {
                                if(paramValue!=null&&paramValue.trim().equals(""))
                                {
                                    paramValue = null;
                                    larg.add(paramValue);
                                }
                                else
                                {
                                    larg.add(paramValue);  
                                }
                            }
                            else
                                larg.add(paramValue);

                            sqlFields = sqlFields + " " + WSoftUtil.dbSqlSqlserverDealFname(key.substring(6)) + ",";
                            sqlFieldsSub = sqlFieldsSub + "?,";
                        }
                        else
                        {
                            if(dataType.indexOf("tbl")!=0)
                            {
                                larg.add(paramValue);
                                sqlFields = sqlFields + " " + WSoftUtil.dbSqlSqlserverDealFname(key.substring(6)) + ",";
                                sqlFieldsSub = sqlFieldsSub + "?,";
                            }
                        }
                    }
                }
            
                Object[] args = new Object[larg.size()];

                if(msg.equalsIgnoreCase(""))
                {
                    if(!sqlFields.equalsIgnoreCase(""))
                    {
                        sqlFields = sqlFields.substring(0, sqlFields.length()-1);
                        sqlFieldsSub = sqlFieldsSub.substring(0, sqlFieldsSub.length()-1);
                    }

                    for(int j=0;j<larg.size();j++)
                    {
                        args[j]= larg.get(j); 
                    }

                    if(!rules.equalsIgnoreCase(""))
                    {
                        String strSqlRule="";
                        Object[] argsRule = new Object[1];
                        String[] strFieldArrs = sqlFields.split(",");
                        for(int i=0;i<strFieldArrs.length;i++)
                        {
                            if(rules.equalsIgnoreCase(strFieldArrs[i].trim()))
                            {
                                argsRule[0]=args[i]; 
                                break;
                            }    
                        }
                        strSqlRule = "select " + WSoftUtil.dbSqlTopFirst("1") + " "+ rules + " from " + dataType + " where " + rules +"=? " + WSoftUtil.dbSqlTop("1");
                        List lrules =  datalistDao.getDatas(strSqlRule, argsRule);
                        if(lrules.size()>0)
                        {
                            msg=WSoftMsg.getMsgItem("data_duplic",lan);
                            List lfts = datalistDao.getDataFileds(dataType);
                            for(int j=0;j<lfts.size();j++)
                            {
                                Map<String,Object> mft=(Map)lfts.get(j);
                                String strFtName = (String)mft.get("field");
                                String strFtTitle = (String)mft.get("field_title");
                                if(strFtName.equalsIgnoreCase(rules))
                                {
                                    msg=strFtTitle + WSoftMsg.getMsgItem("data_duplic",lan);
                                    break;
                                }    
                            }
                        }
                    }
                }
                if(msg.equalsIgnoreCase(""))
                {
                    pID = WSoftUtil.dbSqlAutoIDGet(datalistDao,dataType,pkey);
                    if(!pID.equals(""))
                    {
                        String updPsn = "-1";
                        if(userDetails!=null)
                        {
                            updPsn = String.valueOf(userDetails.getUser().getId()); 
                        }

                        if(dataType.indexOf("tbl")==0)
                            sql = "insert into " + dataType + "(" + pkey + "," + sqlFields + ",sysstatus,updpsnid,updtime,dguid,version) values(" + pID.toString() + ","  + sqlFieldsSub + ",'0','"+ updPsn +"',"+ WSoftUtil.dbSqlSysdate() +",'"+ dGuid +"','"+ strVersion +"')" ;
                        else
                            sql = "insert into " + dataType + "(" + pkey + "," + sqlFields + ") values(" + pID + ","  + sqlFieldsSub + ")" ;

                        if(jsonObject.containsKey("isdebug")&&jsonObject.getString("isdebug").equals("true"))
                        {
                            codeDebugLog("sql", sql);
                            codeDebugLog("args", args);
                        }

                        int autoid = datalistDao.addDatas(sql, args);
                        if(WSoftUtil.dbSqlIsMysql()&&autoid>0)
                        {
                            pID = String.valueOf(autoid);
                        }

                        if(dataType.indexOf("tbl")==0)
                        {
                            jsonObject.put("field_VERSION",strVersion);
                            datalistDao.addClobDatas("insert into " + dataType + "_clob(id,datacontent) values(?,?) ", pID, jsonObject.toJSONString());
                        }

                        WSoftUtil.dbUpdDataUpdTime(datalistDao, dataType);    

                        msg = codeUpd(jsonObject,pID,userDetails,factory,engine,strCodes,"afterupd");
                        if(!msg.equals(""))
                            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

                    }
                    else
                    {
                        msg="Cannot get ID";
                    }
                }
            }
        }
        List<Map<String,Object>> lreturn = new ArrayList<>();
        Map<String,Object> mreturn = new HashMap<String,Object>();
        mreturn.put("pid",Integer.valueOf(pID));
        mreturn.put("msg",msg);
        if(jsonObject.containsKey("FORMPUB")&&jsonObject.getBoolean("FORMPUB"))
        {
            mreturn.put("reguid",dGuid);
        }
        lreturn.add(mreturn);

        return lreturn;
    }

    @Transactional
    public List createData(String dataID,JSONObject jsonObject)  throws Throwable 
    {

        String msg="";
        String strSql = "select dataid,name,tablename,tableexist from data where tablename=?";
        String tableName= jsonObject.getString("tblName");
        String tableExist = "";
        boolean hasData = true;

        Object[] args = new Object[]{tableName};
        List ltab =  datalistDao.getDatas(strSql, args);
        if(ltab.size()>0)
        {
            Map<String,Object> mtab=(Map)ltab.get(0);
            tableName = (String)mtab.get("tablename");
            dataID= mtab.get("dataid").toString();
            tableName = tableName.toLowerCase();
            tableExist = (String)mtab.get("tableexist");
            if(tableExist!=null&&tableExist.equals("1"))
            {
                strSql = "select " + WSoftUtil.dbSqlTopFirst("1") + " t.* from " + tableName + " t where 1=1 " + WSoftUtil.dbSqlTop("1");
                List listCount = datalistDao.getDatas(strSql, new Object[]{});

                strSql = "select t.formid from data_form t where t.tablename=? " ;
                List listCountForm = datalistDao.getDatas(strSql, new Object[]{tableName});

                if(listCount.size()==0)
                {
                    hasData=false;
                    //delDataTables(tableName,tableExist);  //No longer drop and recreate the table
                    //tableExist=null;
                }
            }    
        }
        else
        {
            return null;
        }

        int rows=0;
        String formName = jsonObject.getString("filename");
        List<Object> lconfig = (List<Object>)jsonObject.get("comconfig");
        String strSeqCreate = "";
        String strTableCreate = "";
        String strFields = "";
        String strFieldNames = "";
        Integer fieldCount = 0;

        List<Map<String,String>> ldataField = new ArrayList<>();
        Map<String,String> mField = new HashMap<String,String>();
        String strPkey = "id";
        String sqlDf = "select * from data_fields where tablename=?";
        List ldf = datalistDao.getDatas(sqlDf, new Object[]{tableName});
        Map<String,Object> mdfs = new HashMap<String,Object>();
        fieldCount=ldf.size();
        if(fieldCount==0)
        {
            mField.put("name",strPkey);
            mField.put("title","ID");
            mField.put("isshow","1");
            mField.put("fields","");
            mField.put("fields_selvalue","");
            mField.put("infile","");
            mField.put("fieldindb","1");
            mField.put("dbtype","number");
            mField.put("dblen","");
            mField.put("upd","a");
            ldataField.add(mField);
        }

        String tmp = "";
        for(int i=0;i<lconfig.size();i++)
        {
            Map<String,String> config=(Map)lconfig.get(i);
            String comconfigid = config.get("comconfigid");
            String fieldTitle=config.get("field_title");
            String fieldName=config.get("field_name");
            if(fieldName!=null)
                fieldName=fieldName.toUpperCase();
            String fieldType=config.get("field_type");
            String fieldLength=config.get("field_len");
            String fieldShow="";
            if(config.containsKey("field_show"))
                fieldShow=String.valueOf(config.get("field_show"));

            String fieldInFile = "";
            if(config.containsKey("field_infile"))
                fieldInFile=String.valueOf(config.get("field_infile"));

            if(!WSoftUtil.dataNameChack(fieldName+fieldType+fieldLength))
            {
                msg = "Invalid parameter: tableName";
                break;
            }
            if(fieldName!=null&&!fieldName.trim().equals("")&&fieldType!=null&&fieldLength!=null&&fieldTitle!=null)  
            {
                String show="0";
                if(fieldShow.equalsIgnoreCase("true"))
                    show="1";

                if(fieldName.equals(tmp))
                {
                    tmp="";
                }

                HashMap<String,String> mFieldTxt =null;
                String fieldNameTxt = "";
                String fieldTypeTxt = "";
                String fieldLengthTxt = "";
                if(config.containsKey("fieldtxt")&&config.get("fieldtxt").equals("1"))
                {
                    mFieldTxt = new HashMap<String,String>();
                    fieldNameTxt = fieldName+"STXT";
                    fieldTypeTxt = "nvarchar2";
                    fieldLengthTxt = "300";
                    mFieldTxt.put("name",fieldNameTxt);
                    mFieldTxt.put("title",fieldTitle);
                    mFieldTxt.put("isshow",show);
                    mFieldTxt.put("fields","");
                    mFieldTxt.put("infile",fieldInFile);
                    mFieldTxt.put("dbtype",fieldType);
                    mFieldTxt.put("dblen",fieldLength);

                    strFieldNames = strFieldNames + fieldNameTxt + ",";
                    show = "0";
                    fieldTitle = fieldTitle + "ID";
                }

                mField = new HashMap<String,String>();
                mField.put("comid",comconfigid);
                mField.put("name",fieldName);
                mField.put("title",fieldTitle);
                mField.put("isshow",show);
                mField.put("dblen",fieldLength);
                mField.put("infile",fieldInFile);

                String fieldFields = "";
                if(config.containsKey("field_fields"))
                {
                    fieldFields = JSON.toJSONString(config.get("field_fields"));
                }
                mField.put("fields",fieldFields);

                String fieldSelValue = "";
                if(config.containsKey("field_selvalue"))
                {
                    fieldSelValue = JSON.toJSONString(config.get("field_selvalue"));
                }
                mField.put("fields_selvalue",fieldSelValue);

                if(fieldType.equalsIgnoreCase("date"))
                {
                    mField.put("type","d");
                }
                else if(fieldType.equalsIgnoreCase("datetime"))
                {
                    fieldType = fieldType.substring(0,4);
                    mField.put("type","dt");
                }

                if(fieldType.equalsIgnoreCase("decimal1"))
                {
                    mField.put("type","m1");
                }
                else if(fieldType.equalsIgnoreCase("decimal2"))
                {
                    mField.put("type","m2");
                }

                mField.put("dbtype",fieldType);
                Map<String,Object> mDataField =  this.getDataFormField(false,fieldName, comconfigid, Integer.parseInt(dataID));
                if(mDataField.containsKey("dbtype"))
                {

                    String sDbIsinfile = mDataField.get("isinfile").toString();
                    String sDbFieldindb = mDataField.get("fieldindb").toString();
                    String updid = mDataField.get("id").toString();
                    String updtxtid="";
                    if(mDataField.containsKey("txtid"))
                        updtxtid = mDataField.get("txtid").toString();
                    
                    mField.put("upd","u");
                    mField.put("updid",updid);
                    mField.put("fieldindb",sDbFieldindb);

                    if(mFieldTxt!=null)
                    {
                        mFieldTxt.put("upd","u"); 
                        mFieldTxt.put("updid",updtxtid);
                        mFieldTxt.put("fieldindb",sDbFieldindb);
                    }

                    if(sDbFieldindb.equals("0")&&(mField.get("infile").equals("")))
                    {
                        if(mFieldTxt!=null)
                        { 
                            if(mFieldTxt.get("infile").equals(""))
                            {
                                mFieldTxt.put("fieldindb","1");
                                strFields = strFields + " " + fieldNameTxt + " " + WSoftUtil.dbSqlFieldType(fieldTypeTxt) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldTypeTxt,fieldLengthTxt) +"),";
                            }
                        }
                        
                        if(mField.get("infile").equals(""))
                        {
                            mField.put("fieldindb","1");
                            if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                                strFields = strFields + " " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + ",";
                            else
                                strFields = strFields + " " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +"),";
                        }
                        mField.put("fieldindb","1");

                    }
                    else if (sDbFieldindb.equals("1")&&mField.get("infile").equals(""))
                    {

                        String dbfieldname = mDataField.get("fieldname").toString();
                        String dbtype= mDataField.get("dbtype").toString();
                        Integer dblen = Integer.valueOf(mDataField.get("dblen").toString());

                        if(hasData)
                        {
                            if(!dbtype.equals(fieldType))
                            {
                                msg = "Database has existing data, cannot change field type:"+fieldTitle;
                                break;
                            }
                            else if(fieldType.equalsIgnoreCase("nvarchar2"))
                            {
                                if(Integer.valueOf(fieldLength)<dblen)
                                {
                                    msg = "Database has existing data, cannot reduce field size:"+fieldTitle;
                                    break;
                                }
                            }
                        }

                        if(msg.equals("")&&mField.get("infile").equals(""))
                        {
                            if(!dbtype.equals(fieldType)||Integer.valueOf(fieldLength)!=dblen||!dbfieldname.equals(fieldName))
                            {
                                if(!dbfieldname.equals(fieldName))
                                {
                                    if(WSoftUtil.dbSqlIsMysql())
                                    {
                                        if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                                            mField.put("upddbrename","change column "+ dbfieldname +" "+ fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType));
                                        else
                                            mField.put("upddbrename","change column "+ dbfieldname +" "+ fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +")");

                                        if(mFieldTxt!=null)
                                            mFieldTxt.put("upddbrename","change column "+ dbfieldname +"STXT "+ fieldName +"STXT " + WSoftUtil.dbSqlFieldType(fieldTypeTxt) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldTypeTxt,fieldLengthTxt) +")"); 
                                    }
                                    else if(WSoftUtil.dbSqlIsOracle())
                                    {
                                        mField.put("upddbrename","rename column "+ dbfieldname +" to "+ fieldName +"");
                                        if(mFieldTxt!=null)
                                            mFieldTxt.put("upddbrename","rename column "+ dbfieldname +"STXT to "+ fieldName +"STXT"); 
                                    }
                                    else if(WSoftUtil.dbSqlIsKingbase())
                                    {
                                        mField.put("upddbrename","rename column "+ dbfieldname +" to "+ fieldName +"");
                                        if(mFieldTxt!=null)
                                            mFieldTxt.put("upddbrename","rename column "+ dbfieldname +"STXT to "+ fieldName +"STXT"); 
                                    }
                                    else if(WSoftUtil.dbSqlIsDm())
                                    {
                                        mField.put("upddbrename","rename column "+ dbfieldname +" to "+ fieldName +"");
                                        if(mFieldTxt!=null)
                                            mFieldTxt.put("upddbrename","rename column "+ dbfieldname +"STXT to "+ fieldName +"STXT"); 
                                    }
                                    else if(WSoftUtil.dbSqlIsSqlserver())
                                    {
                                        mField.put("upddbrename","execute sp_rename '"+ tableName +"."+ dbfieldname +"', '"+ fieldName +"'");
                                        if(mFieldTxt!=null)
                                            mFieldTxt.put("upddbrename","execute sp_rename '"+ tableName +"."+ dbfieldname +"STXT','"+ fieldName +"STXT'"); 
                                    }
                                }

                                if(!dbtype.equals(fieldType)||Integer.valueOf(fieldLength)!=dblen)
                                {
                                    String alterField = "";

                                    if(WSoftUtil.dbSqlIsMysql())
                                    {
                                        if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                                            alterField = "modify column " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + " ";
                                        else
                                            alterField = "modify column " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +") ";
                                    }
                                    else if(WSoftUtil.dbSqlIsOracle())
                                    {
                                        if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                                            alterField = "modify ( " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + " )";
                                        else
                                            alterField = "modify ( " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +") )";
                                    }
                                    else if(WSoftUtil.dbSqlIsKingbase())
                                    {
                                        if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                                            alterField = "modify " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + " ";
                                        else
                                            alterField = "modify " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +") ";
                                    }
                                    else if(WSoftUtil.dbSqlIsDm())
                                    {
                                        if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                                            alterField = "modify " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + " ";
                                        else
                                            alterField = "modify " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +") ";
                                    }
                                    else if(WSoftUtil.dbSqlIsSqlserver())
                                    {
                                        if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                                            alterField = "alter column " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + " ";
                                        else
                                            alterField = "alter column " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +") ";
                                    }
                                    mField.put("upddb",alterField);
                                }
                            }
                        }
                    }
                }
                else
                {
                    mField.put("upd","a");   
                    if(mFieldTxt!=null)
                    {
                        mFieldTxt.put("upd","a");   
                        if(mFieldTxt.get("infile").equals(""))
                        {
                            mFieldTxt.put("fieldindb","1");
                            strFields = strFields + " " + fieldNameTxt + " " + WSoftUtil.dbSqlFieldType(fieldTypeTxt) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldTypeTxt,fieldLengthTxt) +"),";
                        }
                    }
                    
                    if(mField.get("infile").equals(""))
                    {
                        mField.put("fieldindb","1");
                        if(fieldType.equalsIgnoreCase("number")||fieldType.equalsIgnoreCase("date"))
                            strFields = strFields + " " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + ",";
                        else
                            strFields = strFields + " " + fieldName + " " + WSoftUtil.dbSqlFieldType(fieldType) + "("+ WSoftUtil.dbSqlDealFieldLen(fieldType,fieldLength) +"),";
                    }

                }

                ldataField.add(mField);
                if(mFieldTxt!=null)
                    ldataField.add(mFieldTxt);

                if(mField.get("infile").equals(""))  
                    strFieldNames = strFieldNames + fieldName + ",";
            }
        }

        if(msg.trim().equals(""))
        {
            strFieldNames = strPkey + "," + strFieldNames;
            strFieldNames = strFieldNames.substring(0, strFieldNames.length()-1);
            Map<String,String> mdfkey = new HashMap<String,String>();
            mdfkey.put("id","1");
            mdfkey.put("wfmworklistid","1");
            mdfkey.put("sysorgid","1");
            mdfkey.put("syspsnid","1");
            mdfkey.put("syspsnname","1");
            mdfkey.put("syspntdeptid","1");
            mdfkey.put("syspntdeptname","1");
            mdfkey.put("sysdeptid","1");
            mdfkey.put("sysdeptname","1");
            mdfkey.put("form","1");
            mdfkey.put("sysstatus","1");
            mdfkey.put("pdffile","1");
            mdfkey.put("updpsnid","1");
            mdfkey.put("updtime","1");
            mdfkey.put("dguid","1");
            mdfkey.put("version","1");

            if(!strFields.equalsIgnoreCase("")&&(tableExist==null||!tableExist.equals("1")))
            {
                strFields = strFields.substring(0, strFields.length()-1);

                if(WSoftUtil.dbSqlIsMysql())
                    strFields = strFields + ",wfmworklistid int,sysorgid int,syspsnid int,syspsnname varchar(50),sysdeptid int,sysdeptname varchar(200),syspntdeptid int,syspntdeptname varchar(200),form varchar(50),sysstatus varchar(2),pdffile varchar(50),updpsnid int,updtime datetime,dguid varchar(50),version varchar(20)";
                else if(WSoftUtil.dbSqlIsOracle())
                    strFields = strFields + ",wfmworklistid number,sysorgid number,syspsnid number,syspsnname nvarchar2(50),sysdeptid number,sysdeptname nvarchar2(200),syspntdeptid number,syspntdeptname nvarchar2(200),form nvarchar2(50),sysstatus varchar2(2),pdffile varchar2(50),updpsnid number,updtime date,dguid varchar2(50),version varchar2(20)";
                else if(WSoftUtil.dbSqlIsKingbase())
                    strFields = strFields + ",wfmworklistid int,sysorgid int,syspsnid int,syspsnname varchar(50),sysdeptid int,sysdeptname varchar(200),syspntdeptid int,syspntdeptname varchar(200),form varchar(50),sysstatus varchar(2),pdffile varchar(50),updpsnid int,updtime date,dguid varchar(50),version varchar(20)";
                else if(WSoftUtil.dbSqlIsDm())
                    strFields = strFields + ",wfmworklistid int,sysorgid int,syspsnid int,syspsnname varchar(100),sysdeptid int,sysdeptname varchar(400),syspntdeptid int,syspntdeptname varchar(400),form varchar(50),sysstatus varchar(2),pdffile varchar(50),updpsnid int,updtime datetime,dguid varchar(50),version varchar(20)";
                else if(WSoftUtil.dbSqlIsSqlserver())
                    strFields = strFields + ",wfmworklistid int,sysorgid int,syspsnid int,syspsnname nvarchar(50),sysdeptid int,sysdeptname nvarchar(200),syspntdeptid int,syspntdeptname nvarchar(200),form nvarchar(50),sysstatus varchar(2),pdffile varchar(50),updpsnid int,updtime datetime,dguid varchar(50),version varchar(20)";
                
                mField = new HashMap<String,String>();
                mField.put("name","wfmworklistid");
                mField.put("title","wfmId");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","number");
                mField.put("dblen","");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","sysorgid");
                mField.put("title","Submitter Org ID");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","number");
                mField.put("dblen","");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","syspsnid");
                mField.put("title","Submitter ID");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","number");
                mField.put("dblen","");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","syspsnname");
                mField.put("title","Submitter Name");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","50");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","sysdeptid");
                mField.put("title","Submitter Dept ID");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","number");
                mField.put("dblen","");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","sysdeptname");
                mField.put("title","Submitter Dept Name");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","200");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","syspntdeptid");
                mField.put("title","Submitter Parent Dept ID");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","number");
                mField.put("dblen","");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","syspntdeptname");
                mField.put("title","Submitter Parent Dept Name");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","200");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","form");
                mField.put("title","Form URL");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","50");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","sysstatus");
                mField.put("title","Status");
                mField.put("isshow","1");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","2");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","pdffile");
                mField.put("title","PDF");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","50");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","updpsnid");
                mField.put("title","Updater ID");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","number");
                mField.put("dblen","");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","updtime");
                mField.put("title","Update Time");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","dt");
                mField.put("dblen","");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","dguid");
                mField.put("title","Data Unique ID");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","50");
                mField.put("upd","a"); 
                ldataField.add(mField);

                mField = new HashMap<String,String>();
                mField.put("name","version");
                mField.put("title","Version");
                mField.put("isshow","0");
                mField.put("fields","");
                mField.put("fields_selvalue","");
                mField.put("infile","");
                mField.put("fieldindb","1");
                mField.put("dbtype","nvarchar2");
                mField.put("dblen","20");
                mField.put("upd","a"); 
                ldataField.add(mField);

                if(WSoftUtil.dbSqlIsMysql())
                {
                    strTableCreate = "create table " + tableName + "(" + strPkey + " INT NOT NULL AUTO_INCREMENT," + strFields +", PRIMARY KEY (`id`))";
                    datalistDao.createTable(strTableCreate);

                    strTableCreate = "create table " + tableName + "_clob (" + strPkey + " INT,datacontent text)";
                    datalistDao.createTable(strTableCreate);
                }
                else if(WSoftUtil.dbSqlIsOracle())
                {
                    strSeqCreate = "create sequence SEQ_"+ tableName.toUpperCase() +" increment by 1";
                    datalistDao.createTable(strSeqCreate);

                    strTableCreate = "create table " + tableName + "(" + strPkey + " number," + strFields +", PRIMARY KEY (" + strPkey + "))";
                    datalistDao.createTable(strTableCreate);

                    strTableCreate = "create table " + tableName + "_clob (" + strPkey + " number,datacontent clob)";
                    datalistDao.createTable(strTableCreate);
                }
                else if(WSoftUtil.dbSqlIsKingbase())
                {
                    strTableCreate = "create table " + tableName + "(" + strPkey + " INT NOT NULL AUTO_INCREMENT," + strFields +", PRIMARY KEY (" + strPkey + "))";
                    datalistDao.createTable(strTableCreate);

                    strTableCreate = "create table " + tableName + "_clob (" + strPkey + " INT,datacontent text)";
                    datalistDao.createTable(strTableCreate);
                }
                else if(WSoftUtil.dbSqlIsDm())
                {
                    strSeqCreate = "create sequence SEQ_"+ tableName.toUpperCase() +" start with 1";
                    datalistDao.createTable(strSeqCreate);

                    strTableCreate = "create table " + tableName + "(" + strPkey + " int not null," + strFields +", PRIMARY KEY (" + strPkey + "))";
                    datalistDao.createTable(strTableCreate);

                    strTableCreate = "create table " + tableName + "_clob (" + strPkey + " INT,datacontent text)";
                    datalistDao.createTable(strTableCreate);
                }
                else if(WSoftUtil.dbSqlIsSqlserver())
                {
                    strSeqCreate = "create sequence SEQ_"+ tableName.toUpperCase() +" start with 1";
                    datalistDao.createTable(strSeqCreate);

                    strTableCreate = "create table " + tableName + "(" + strPkey + " int," + strFields +", PRIMARY KEY (" + strPkey + "))";
                    datalistDao.createTable(strTableCreate);

                    strTableCreate = "create table " + tableName + "_clob (" + strPkey + " int,datacontent ntext)";
                    datalistDao.createTable(strTableCreate);
                }

                datalistDao.createTable("CREATE INDEX "+ tableName +"_syspsnid  ON "+ tableName +" (syspsnid)");
                datalistDao.createTable("CREATE INDEX "+ tableName +"_sysorgid  ON "+ tableName +" (sysorgid)");
                datalistDao.createTable("CREATE INDEX "+ tableName +"_sysdeptid  ON "+ tableName +" (sysdeptid)");
                datalistDao.createTable("CREATE INDEX "+ tableName +"_syspntdeptid ON "+ tableName +" (syspntdeptid)");

                String strViewConfig = "";
                if(WSoftUtil.dbSqlIsSqlserver())
                {
                    strViewConfig = "update data set tableexist='1',searchkey=?,pkey=?,filters=?,pkey_type='i',[open]='1' where tablename=?"; 
                }
                else
                {
                    strViewConfig = "update data set tableexist='1',searchkey=?,pkey=?,filters=?,pkey_type='i',open='1' where tablename=?";
                }
                datalistDao.updDatas(strViewConfig, new Object[]{strFieldNames,strPkey,"where 1=1",tableName});

                WSoftUtil.dbUpdDataUpdTime(datalistDao, tableName);
                
            }
            else if(!strFields.equalsIgnoreCase(""))
            {
                strFields = strFields.substring(0, strFields.length()-1);
                if(WSoftUtil.dbSqlIsSqlserver())
                    strTableCreate = "alter table " + tableName + " add " + strFields +" ";
                else
                    strTableCreate = "alter table " + tableName + " add (" + strFields +")";
                datalistDao.createTable(strTableCreate);

                String strViewConfig = "update data set searchkey=? where tablename=?"; 
                datalistDao.updDatas(strViewConfig, new Object[]{strFieldNames,tableName});
    
                WSoftUtil.dbUpdDataUpdTime(datalistDao, tableName);

            }

            for(int j=0;j<ldataField.size();j++)
            {
                Map<String,String> mdf=(Map)ldataField.get(j);
                String strFtName = (String)mdf.get("name");
                String strFtTitle = (String)mdf.get("title");
                String strDbtype= (String)mdf.get("dbtype");
                String strDblen = (String)mdf.get("dblen");
                String show = (String)mdf.get("isshow");
                String fields = (String)mdf.get("fields");
                String fieldSelValue = (String)mdf.get("fields_selvalue");
                String inFile = (String)mdf.get("infile");
                String fieldIndb = (String)mdf.get("fieldindb");

                if(inFile==null||inFile.equals(""))
                {
                    inFile = "0";
                }

                if(fieldIndb==null)
                {
                    fieldIndb = "0";
                }

                mdfkey.put(strFtName.trim().toLowerCase(),"1"); 

                if(mdf.get("upd").equals("a"))
                {
                    Object[] argConfigs = new Object[14];
                    argConfigs[0] = dataID;
                    argConfigs[1] = tableName;
                    argConfigs[2] = strFtName;
                    argConfigs[3] = strFtTitle;

                    if(mdf.containsKey("type"))
                    {
                        argConfigs[4] = (String)mdf.get("type");
                    }
                    else
                    {
                        if(!strPkey.equals(strFtName))
                            argConfigs[4] = "s";
                        else
                            argConfigs[4] = "i";
                    }

                    argConfigs[5] = show;

                    if(strFtName.equals(strPkey))
                        argConfigs[6] = 0;
                    else if(strFtName.equals("sysstatus"))
                        argConfigs[6] = 1000;
                    else
                        argConfigs[6] = j+1;

                    argConfigs[7] = fields;
                    argConfigs[8] = fieldSelValue;
                    argConfigs[9] = strDbtype;
                    argConfigs[10] = strDblen;
                    argConfigs[11] = inFile;
                    argConfigs[12] = fieldIndb;
                    
                    String dataFieldID;
                    dataFieldID = WSoftUtil.dbSqlAutoIDGet(datalistDao,"DATA_FIELDS","id");
                    argConfigs[13] = dataFieldID;

                    String strDBField = "insert into DATA_FIELDS(dataid,tablename,field,field_title,field_type,isshow,showsort,field_fields,field_selvalue,db_type,db_length,isinfile,fieldindb,id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    
                    int autoid = datalistDao.addDatas(strDBField, argConfigs);
                    if(WSoftUtil.dbSqlIsMysql()&&autoid>0)
                    {
                        dataFieldID = String.valueOf(autoid);
                    }

                    if(mdf.containsKey("comid"))
                    {
                        strDBField = "insert into DATA_FIELDS_COM(id,dataid,comid,form) values(?,?,?,?)";
                        datalistDao.addDatas(strDBField, new Object[]{dataFieldID,dataID,(String)mdf.get("comid"),formName});
                    }
                }
                else
                {
                    Object[] argConfigs = new Object[12];
                    argConfigs[0] = strFtName;
                    argConfigs[1] = strFtTitle;

                    String sType= "";
                    if(mdf.containsKey("type"))
                    {
                        sType = (String)mdf.get("type");
                    }
                    else
                    {
                        if(!strPkey.equals(strFtName))
                            sType = "s";
                        else
                            sType = "i";
                    }
                    argConfigs[2] = sType;

                    argConfigs[3] = show;

                    if(strFtName.equals(strPkey))
                        argConfigs[4] = 0;
                    else if(strFtName.equals("sysstatus"))
                        argConfigs[4] = 1000;
                    else
                        argConfigs[4] = j+1;
                    
                    argConfigs[5] = fields;
                    argConfigs[6] = fieldSelValue;

                    if(mdf.containsKey("dbtype"))
                        argConfigs[7] = String.valueOf(mdf.get("dbtype"));
                    else
                        argConfigs[7] = null;
                    
                    if(mdf.containsKey("dblen"))
                        argConfigs[8] = String.valueOf(mdf.get("dblen"));
                    else
                        argConfigs[8] = null;
                    
                    Integer dataFieldID =Integer.valueOf(mdf.get("updid"));
                    
                    argConfigs[9] = fieldIndb;
                    argConfigs[10] = inFile;
                    argConfigs[11] = dataFieldID;

                    String strDBField = "update DATA_FIELDS set field=?,field_title=?,field_type=?,isshow=?,showsort=?,field_fields=?,field_selvalue=?,db_type=?,db_length=?,fieldindb=?,isinfile=? where id=? ";
                    datalistDao.updDatas(strDBField, argConfigs);

                    if(mdf.containsKey("comid"))
                    {
                        strDBField = "delete from DATA_FIELDS_COM where id=? and dataid=? and form=?";
                        datalistDao.updDatas(strDBField, new Object[]{dataFieldID,dataID,formName});

                        strDBField = "select * from DATA_FIELDS_COM where id=? and comid=? and form=?";
                        if(datalistDao.getDataSingle(strDBField, new Object[]{dataFieldID,(String)mdf.get("comid"),formName})==null)
                        {
                            strDBField = "insert into DATA_FIELDS_COM(id,dataid,comid,form) values(?,?,?,?)";
                            datalistDao.addDatas(strDBField, new Object[]{dataFieldID,dataID,(String)mdf.get("comid"),formName});
                        }
                    }

                    if(inFile.equals("0")&&mdf.containsKey("upddbrename"))
                    {
                        String alterSql = "";
                        if(WSoftUtil.dbSqlIsSqlserver())
                            alterSql = " " + mdf.get("upddbrename");
                        else
                            alterSql = "alter table " + tableName + " " + mdf.get("upddbrename");
                        datalistDao.updDatas(alterSql, new Object[]{});
                    }
                    if(inFile.equals("0")&&mdf.containsKey("upddb"))
                    {
                        String alterSql = "";
                        alterSql = "alter table " + tableName + " " + mdf.get("upddb");
                        datalistDao.updDatas(alterSql, new Object[]{});
                    }
                }
            }

            //Delete non-existent fields
            sqlDf = "select * from data_fields where tablename=?";
            ldf = datalistDao.getDatas(sqlDf, new Object[]{tableName});
            for(int j=0;j<ldf.size();j++)
            {
                Map<String,Object> mdf=(Map)ldf.get(j);
                String strID = mdf.get("id").toString();
                String strInFile = mdf.get("isinfile").toString();
                String strFtName = (String)mdf.get("field");
                if(!mdfkey.containsKey(strFtName.toLowerCase())&&!strFtName.endsWith("STXT"))
                {
                    String strDBField = "select form from DATA_FIELDS_COM where id=?";
                    List ldfc =  datalistDao.getDatas(strDBField, new Object[]{strID});
                    if(!hasData&&ldfc.size()<=1)
                    {
                        Map<String,Object> mdfc=null;
                        if(ldfc.size()==1)
                            mdfc = (Map<String,Object>)ldfc.get(0);
                        if(ldfc.size()==0||mdfc.get("form").toString().equalsIgnoreCase(formName))
                        {
                            strDBField = "delete from DATA_FIELDS_COM  where id=?";
                            datalistDao.updDatas(strDBField, new Object[]{strID});

                            strDBField = "delete from DATA_FIELDS  where id=?";
                            datalistDao.updDatas(strDBField, new Object[]{strID});

                            if(strInFile.equals("0"))
                            {
                                strDBField = "alter table "+ tableName +"  DROP COLUMN " + strFtName;
                                datalistDao.updDatas(strDBField, new Object[]{});
                            }

                            strDBField = "select id from DATA_FIELDS where tablename=? and field=?";
                            List ldfcSub =  datalistDao.getDatas(strDBField, new Object[]{tableName,strFtName+"STXT"});
                            if(ldfcSub.size()>0)
                            {
                                strDBField = "delete from DATA_FIELDS  where tablename=? and field=?";
                                datalistDao.updDatas(strDBField, new Object[]{tableName,strFtName+"STXT"});

                                if(strInFile.equals("0"))
                                {
                                    strDBField = "alter table "+ tableName +"  DROP COLUMN " + strFtName+"STXT";
                                    datalistDao.updDatas(strDBField, new Object[]{});
                                }
                            }
                        }
                    }
                    else
                    {
                        strDBField = "delete from DATA_FIELDS_COM  where id=? and form=?";
                        datalistDao.updDatas(strDBField, new Object[]{strID,formName});
                    }
                }
            }

        }

        WSoftUtil.dbUpdDataUpdTime(datalistDao, tableName); 
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data_fields");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data_form");

        List<Map<String,Object>> lreturn = new ArrayList<>();
        Map<String,Object> mreturn = new HashMap<String,Object>();
        mreturn.put("rows",rows);
        mreturn.put("msg",msg);
        lreturn.add(mreturn);

        return lreturn;
    }

    public void delDataTables(String tablename,String tableExist)  throws Throwable 
    {
        int rows;
        String sql;

        sql = "delete from DATA_FIELDS where tablename =? " ;
        rows = datalistDao.delDatas(sql, new Object[]{tablename});

        sql = "delete from DATA_FIELDS_COM where dataid in (select dataid from data where tablename =?) " ;
        rows = datalistDao.delDatas(sql, new Object[]{tablename});

        if(tableExist!=null&&tableExist.equals("1"))
        {
            if(WSoftUtil.dbSqlIsOracle())
            {
                sql = "drop sequence SEQ_" + tablename.toUpperCase() ;
                rows = datalistDao.dropTable(sql);
            }
            else if(WSoftUtil.dbSqlIsDm())
            {
                sql = "drop sequence SEQ_" + tablename.toUpperCase() ;
                rows = datalistDao.dropTable(sql);
            }
            else if(WSoftUtil.dbSqlIsSqlserver())
            {
                sql = "drop sequence SEQ_" + tablename.toUpperCase() ;
                rows = datalistDao.dropTable(sql);
            }

            sql = "drop table " + tablename +"_clob" ;
            rows = datalistDao.dropTable(sql);

            sql = "drop table " + tablename ;
            rows = datalistDao.dropTable(sql);

        }    
    }

    @Transactional
    public int delDataForms(String viewCode,String itemIDs,Object args[])  throws Throwable 
    {
        String sql = "";
        String dataType = "";
        String pkey = "";
        String pkeyType = "";

        List<Map<String,Object>> lview = datalistDao.getDataConfig(viewCode);
        if(lview.size()>0)
        {
            Map<String,Object> mview=(Map)lview.get(0);
            dataType=(String)mview.get("tablename");
            pkey=(String)mview.get("pkey");
            pkeyType=(String)mview.get("pkey_type");
        }
        if(pkeyType.equals("i"))
            args[0]=Integer.parseInt(itemIDs);
        else
            args[0]=itemIDs;

        String tableName="";
        String tableExist="";
        List ltab =  datalistDao.getDatas("select * from " + dataType + " where " + pkey + " = ? " , args);
        if(ltab.size()>0)
        {
            Map<String,Object> mtab=(Map)ltab.get(0);
            tableName = (String)mtab.get("tablename");
            tableExist = (String)mtab.get("TABLEEXIST");
        }

        String classDir = ResourceUtils.getURL("classpath:").getPath();
        String  webDir = classDir.replaceAll("/WEB-INF/classes", "/manage");
        String  webDirTemp = classDir.replaceAll("/WEB-INF/classes", "/admin/templates");
        List lform =  datalistDao.getDatas("select * from DATA_FORM where tablename = ? " , new Object[]{tableName});
        for(int i=0;i<lform.size();i++)
        {
            Map<String,Object> mf=(Map)lform.get(i);
            String formName = (String)mf.get("location"); 
            formName = formName.substring(0,formName.length()-5);
            WSoftUtil.delFile(webDir + "form_" + formName + ".html");
            WSoftUtil.delFile(webDir + "genpdf_" + formName + ".html");
            WSoftUtil.delFile(webDirTemp + "temp_" + formName + ".html");
            WSoftUtil.delFile(webDirTemp + "pdf_" + formName + ".html");
            WSoftUtil.delFile(webDirTemp + "json_" + formName + ".txt");

            WSoftUtil.delFile(WSoftUtil.propertyGetPara("pagesManageDir") + "/form_" + formName + ".html");
            WSoftUtil.delFile(WSoftUtil.propertyGetPara("pagesManageDir") + "/genpdf_" + formName + ".html");
            WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/temp_" + formName + ".html");
            WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/pdf_" + formName + ".html");
            WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/json_" + formName + ".txt");

            WSoftUtil.delWebFiles("form_"+formName.toLowerCase()+"_", webDir,"1");
        }

        sql = "delete from DATA_FORM where tablename =? " ;
        datalistDao.delDatas(sql, new Object[]{tableName});

        sql = "delete from ROLE_DATAVIEW where viewcode =? " ;
        datalistDao.delDatas(sql, new Object[]{tableName});

        delDataTables(tableName,tableExist);

        sql = "delete from " + dataType + " where " + pkey + " = ? " ;
        int rows = datalistDao.delDatas(sql, args);  
        return rows;
    }

    public String getSubDeptIDs(User user)
    {
        List lsubDepts = datalistDao.getUserDatas("select DEPTID from dept where deptid=? or pid=?", new Object[]{user.getDeptId(),user.getDeptId()});
        user.setSubDepts(lsubDepts);

        String subdeptids="";
        for(int i=0;i<lsubDepts.size();i++)
        {
            Map<String,Object> mp = (Map)lsubDepts.get(i);
            subdeptids = subdeptids + mp.get("DEPTID").toString()+",";
        }
        if(!subdeptids.equals(""))
        {
           return WSoftUtil.strDelLastComma(subdeptids);
        }
        else
            return "";
    }
}

