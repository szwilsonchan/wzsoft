package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import com.alibaba.fastjson.*;


@RestController
public class CodeGenRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private CodeGenService cService;

    @Autowired
    private RedisCache redisCache;

    @RequestMapping("/api/codedebuglog")
    public List<Object> codeDebuglog(@RequestBody JSONObject jsonObject)  throws Throwable {
     

        List lstLog = new ArrayList<Map<String,Object>>();
        if(jsonObject.getString("clear").equals("1"))
        {
            Map<String,Object> mr = new HashMap<>();
            mr.put("list",lstLog);
            redisCache.setCacheMap("codedebuglog", mr);
            return lstLog;
        }

        Map<String,Object> mp = redisCache.getCacheMap("codedebuglog");
        if(mp.size()>0)
        {
            return (List)mp.get("list");
        }
        return lstLog;

    }

    @RequestMapping("/api/codedel")
    public Map<String,String> codeDel(@RequestBody JSONObject jsonObject)  throws Throwable {
     
        Map<String,String> mp = new HashMap<>();
        String msg="";

        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select guid from code_funcs where funcguid=? ";
        List datalist = dService.getDatasBySql(sql, new Object[]{itemIDs});
        if(datalist.size()>0)
        {
            msg = "This function is referenced; please remove all callers before deleting."; 
        }

        if(msg.equals(""))
        {
            delCodeDo(itemIDs,dService);
        }

        mp.put("msg",msg);
        return mp;

    }

    public static void delCodeDo(String guid,DatalistService dService) throws Throwable 
    {

        String sql = "select * from code where guid=? ";
        List dcode = dService.getDatasBySql(sql, new Object[]{guid});
        if(dcode.size()>0)
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");

            Map<String,Object> mcode=(Map)dcode.get(0);
            if(mcode.get("codefile")!=null)
            {
                String codefile = mcode.get("codefile").toString();
                String sourcefile = mcode.get("source").toString();
                String parafile = mcode.get("para").toString(); 

                WSoftUtil.delFile(configDirCode+codefile);
                WSoftUtil.delFile(configDirCode+sourcefile);
                WSoftUtil.delFile(configDirCode+parafile);

                WSoftUtil.delFile(WSoftUtil.propertyGetPara("codesDir") + "/"+ codefile);
                WSoftUtil.delFile(WSoftUtil.propertyGetPara("codesDir") + "/"+ sourcefile);
                WSoftUtil.delFile(WSoftUtil.propertyGetPara("codesDir") + "/"+parafile);
            }

            sql = "delete from code_funcs where guid=? ";
            dService.updDatasBySql(sql, new Object[]{guid});
    
            sql = "delete from code where guid=? ";
            dService.updDatasBySql(sql, new Object[]{guid});

            if(mcode.get("isfront").equals("1"))
            {
                saveFrontFuncs(dService);
            }
            
        }

    }

    @RequestMapping("/api/codeDo")
    public Map<String,Object> codeDo(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
     
        String itemIDs=jsonObject.getString("codeid");
        jsonObject.put("ispub", "0");
        try
        {
            return cService.codeDo(itemIDs,jsonObject,request);
        }
        catch(Exception e)
        {
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }
    @RequestMapping("/portal/api/codeDo")
    public Map<String,Object> codeDoPortal(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
     
        String itemIDs=jsonObject.getString("codeid");
        jsonObject.put("ispub", "1");
        try
        {
            return cService.codeDo(itemIDs,jsonObject,request);
        }
        catch(Exception e)
        {
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }
    @RequestMapping("/api/codesave")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        String codeID = "";
        String codefilename="";
        String guid="";

        if(!itemIDs.equals(""))
        {
            String sql = "select codeid from code where guid=?";
            List ditem = dService.getDatasBySql(sql, new Object[]{itemIDs});
            Map<String,Object> mp=(Map)ditem.get(0);
            codeID = String.valueOf(mp.get("codeid"));
            guid = itemIDs;
        }
        else
        {
            guid = WSoftUtil.genGuid(null);
        }

        codefilename=jsonObject.getString("codefilename");
        String open = jsonObject.getString("open");

        String code = jsonObject.getString("field_codefile");
        String codefile = "";
        if(codefilename==null||codefilename.equals(""))
            codefile = guid + ".html";
        else
            codefile = codefilename;
            
        WSoftUtil.saveCodeFile(codefile,code);
        
        JSONObject jcodePara = (JSONObject)JSON.parse(code);

        String para = "";
        List<Object> lcode = (List<Object>)jcodePara.get("codelist");
        for(int i=0;i<lcode.size();i++)
        {
            Map<String,Object> config=(Map)lcode.get(i);
            String strType=(String)config.get("type");
            if(strType.equalsIgnoreCase("def"))
            {
                para=config.toString();
                break;
            }
        }

        Map<String,String> comAttrsField=new HashMap<>();
        boolean noFunc = false;
        if(open.equals("1"))
            noFunc=true;

        Map<String,String> mfuncs = new HashMap<>();
        String genCodes = "";
        String msg="";
        try
        {
            genCodes = cService.codeDeal(jcodePara, "codelist",comAttrsField,noFunc,mfuncs);
        }
        catch(Exception e)
        {
            msg = e.getMessage();
            e.printStackTrace();
        }

        List reList = new ArrayList<>();
        Map<String,Object> reMp = new HashMap<String,Object>();

        if(!msg.equalsIgnoreCase(""))
        {
            reMp.put("msg",msg);
            reList.add(reMp);
            return reList;
        }

        String sourcefile = codefile.replaceAll(".html", ".txt");
        WSoftUtil.saveCodeFile(sourcefile,genCodes);

        String parafile = codefile.replaceAll(".html", "_para.txt");
        WSoftUtil.saveCodeFile(parafile,para);

        jsonObject.put("field_guid", guid);
        jsonObject.put("field_codefile", codefile);
        jsonObject.put("field_source", sourcefile);
        jsonObject.put("field_para", parafile);

        if(itemIDs.equals(""))
        {
            List datalist = dService.addDatas(viewCode,jsonObject);
            Map<String,Object> mp = (Map<String,Object>)datalist.get(0);
            reMp.put("msg",String.valueOf(mp.get("msg")));
            reMp.put("guid",guid);
            reList.add(reMp);
            reList.add(datalist);

            if(reMp.get("msg").toString().equals(""))
            {
                saveCalledFuncs(guid,mfuncs);
                if(jsonObject.getString("field_ISFRONT").equals("1"))
                {
                    saveFrontFuncs(dService);
                }
                setFuncsCacheStatus(guid);
            }
            return reList;
        }
        else
        {
            List datalist = dService.updDatas(viewCode, codeID,jsonObject);
            Map<String,Object> mp = (Map<String,Object>)datalist.get(0);
            reMp.put("msg",String.valueOf(mp.get("msg")));
            reList.add(reMp);
            reList.add(datalist);

            if(reMp.get("msg").toString().equals(""))
            {
                saveCalledFuncs(guid,mfuncs);
                if(jsonObject.getString("field_ISFRONT").equals("1"))
                {
                    saveFrontFuncs(dService);
                }
                setFuncsCacheStatus(guid);
            }
            return reList;
        }
    }

    public void saveCalledFuncs(String guid,Map<String,String> mfuncs)  throws Throwable 
    {
        String sql ="delete from code_funcs where guid=?";
        dService.updDatasBySql(sql, new Object[]{guid});
        for(String key:mfuncs.keySet())
        {
            String strFuncName = key.substring(0,key.indexOf("#"));
            if(!guid.equals(strFuncName))
            {
                sql ="insert into code_funcs(guid,funcguid) values(?,?) ";
                dService.updDatasBySql(sql, new Object[]{guid,strFuncName});
            }
        }
    }

    public void setFuncsCacheStatus(String guid) throws Throwable
    {
        String sql = "select guid from code_funcs where funcguid=? ";
        List datalist = dService.getDatasBySql(sql, new Object[]{guid});
        for(int i=0;i<datalist.size();i++)
        {
            Map<String,String> mp=(Map)datalist.get(i);
            String codeguid = mp.get("guid").toString(); 
            sql ="update code set iscache='0' where guid=?";
            dService.updDatasBySql(sql, new Object[]{codeguid});
            setFuncsCacheStatus(codeguid);
        }
    }

    public static void saveFrontFuncs(DatalistService dService) throws Throwable
    {

        String strSources="";
        String sql = "select * from code where isfront='1'";
        List datalist = dService.getDatasBySql(sql, new Object[]{});
        for(int i=0;i<datalist.size();i++)
        {
            Map<String,String> mp=(Map)datalist.get(i);
            String sourcefile = "";
            String source="";
            String parafile = "";
            String para = "";
            String paraList="";
            String guid="";

            if(mp.get("source")!=null)
            {
                sourcefile = mp.get("source").toString();
                parafile = mp.get("para").toString();  
                guid = mp.get("guid").toString();
                source = WSoftUtil.readCodeFile(sourcefile);
                para = WSoftUtil.readCodeFile(parafile);

                JSONObject jPara = JSON.parseObject(para);
                JSONArray jArr = (JSONArray)jPara.get("para");
                for(int j=0;j<jArr.size();j++)
                {
                    JSONObject job = jArr.getJSONObject(j);
                    if(job.get("ptype").toString().equals("def"))
                    {
                        paraList = paraList + job.get("key").toString() + ","; 
                    }
                }
                paraList = WSoftUtil.strDelLastComma(paraList);

                source = "function func"+ guid + "(" + paraList + "){"+ source + "};";
                strSources = strSources + source;
            }
        }

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        String configDirMan = configDir.replaceAll("/WEB-INF/classes", "/manage");
        String configDirPort = configDir.replaceAll("/WEB-INF/classes", "/portal");

        WSoftUtil.saveFile(configDirMan + "js/funcfront.js", strSources);
        WSoftUtil.copyFile(new File(configDirMan + "js/funcfront.js"), new File(configDirPort + "js/funcfront.js"));
        WSoftUtil.copyFile(new File(configDirMan + "js/funcfront.js"), new File(WSoftUtil.propertyGetPara("pagesManageDir") + "/js/funcfront.js"));
        WSoftUtil.copyFile(new File(configDirMan + "js/funcfront.js"), new File(WSoftUtil.propertyGetPara("pagesPortalDir") + "/js/funcfront.js"));
    }

    public static void dealCodeCache(DatalistService dService,RedisCache redisCache) throws Throwable
    {
        String sql = "select * from code";
        List datalist = dService.getDatasBySql(sql, new Object[]{});
        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            String codeid=WSoftUtil.getStrValue(mp.get("guid"));
            WSoftUtil.codeGetSourcesImport(dService, codeid,false, redisCache);
        }
    }

    @RequestMapping("/api/codeget")
    public List getDataItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select CODEFILE,SOURCE,PARA,OPEN from code where guid=?";
        List datalist = dService.getDatasBySql(sql, new Object[]{itemIDs});

        Map<String,String> mp=(Map)datalist.get(0);
        String codefile = mp.get("CODEFILE");
        String code = WSoftUtil.readCodeFile(codefile);
        String sourcefile = mp.get("SOURCE");
        String source = WSoftUtil.readCodeFile(sourcefile);
        String parafile = mp.get("PARA");
        String para = WSoftUtil.readCodeFile(parafile);
        mp.put("codefile",codefile);
        mp.put("code",code);
        mp.put("source",source);
        mp.put("para",para);

        return datalist;
    }

    @RequestMapping("/api/codeimport")
    public Map<String,String> codeImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String codeFile=jsonObject.getString("codefile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!codeFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
            String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
            String strTarget = configDir + strTmpDir;
            File targetDir = new File(strTarget);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            codeFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + codeFile;
            WSoftUtilZip.unzip(codeFile,strTarget);
            String strJsonContent = WSoftUtil.readFile(strTarget + "/code.txt");
            JSONArray jArr = JSON.parseArray(strJsonContent);
            JSONArray jArrSub = JSON.parseArray(strJsonContent);
            for(int i=0;i<jArr.size();i++)
            {
                JSONObject job = jArr.getJSONObject(i);
                Set<String> jsonset = job.keySet();
                JSONObject jPara = new JSONObject();
                String codeGuid = "";
                String codeName = "";
                String codefile = "";
                String sourcefile = "";
                String parafile = "";

                for (String key : jsonset) 
                {
                    if(!key.equalsIgnoreCase("codeid")&&!key.equalsIgnoreCase("tasklastrun"))
                    {
                        if(key.equalsIgnoreCase("guid"))
                            codeGuid = job.get(key).toString();
                        if(key.equalsIgnoreCase("name"))
                            codeName = job.get(key).toString();
                        if(key.equalsIgnoreCase("codefile"))
                            codefile = job.get(key).toString();
                        if(key.equalsIgnoreCase("source"))
                            sourcefile = job.get(key).toString();
                        if(key.equalsIgnoreCase("para"))
                            parafile = job.get(key).toString();    
                        jPara.put("field_"+ key.toUpperCase(), job.get(key));
                    }
                }

                String sql = "select CODEID from code where guid=?";
                List datalist = dService.getDatasBySql(sql, new Object[]{codeGuid});
                String msgerr = "";
                if(datalist.size()>0)
                {
                    jPara.put("field_ISCACHE", "0");

                    Map<String,Object> mcode=(Map)datalist.get(0);
                    String codeid = mcode.get("CODEID").toString();
                    List ltmp = dService.updDatas("code", codeid,jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {   
                        msg = msg + codeName+"Import failed: " + msgerr + "<br>";
                    }
                    String strUpdSql = "delete from code_funcs where guid=?";
                    dService.updDatasBySql(strUpdSql, new Object[]{codeGuid});
                }
                else
                {
                    jPara.put("field_ISCACHE", "0");

                    List ltmp = dService.addDatas("code", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg + codeName+"Import failed: " + msgerr + "<br>";
                    }
                }

                if(msgerr.equals(""))
                {
                    WSoftUtil.copyFile(new File(strTarget+"/"+codefile), new File(configDirCode+codefile));
                    WSoftUtil.copyFile(new File(strTarget+"/"+sourcefile), new File(configDirCode+sourcefile));
                    WSoftUtil.copyFile(new File(strTarget+"/"+parafile), new File(configDirCode+parafile));

                    WSoftUtil.copyFile(new File(strTarget+"/"+codefile), new File(WSoftUtil.propertyGetPara("codesDir")+"/"+codefile));
                    WSoftUtil.copyFile(new File(strTarget+"/"+sourcefile), new File(WSoftUtil.propertyGetPara("codesDir")+"/"+sourcefile));
                    WSoftUtil.copyFile(new File(strTarget+"/"+parafile), new File(WSoftUtil.propertyGetPara("codesDir")+"/"+parafile));
                }
            }

            strJsonContent = WSoftUtil.readFile(strTarget + "/code_funcs.txt");
            if(!strJsonContent.equals(""))
            {
                jArr = JSON.parseArray(strJsonContent);
                for(int i=0;i<jArr.size();i++)
                {
                    JSONObject job = jArr.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    String codeGuid = "";
                    String codeFunc = "";

                    for (String key : jsonset) 
                    {
                        if(key.equalsIgnoreCase("guid"))
                            codeGuid = job.get(key).toString();
                            
                        if(key.equalsIgnoreCase("funcguid"))
                            codeFunc = job.get(key).toString();
                    }

                    String strUpdSql = "insert into code_funcs(guid,funcguid) values(?,?)";
                    dService.updDatasBySql(strUpdSql, new Object[]{codeGuid,codeFunc});
                }
            }

            for(int i=0;i<jArrSub.size();i++)
            {
                JSONObject job = jArrSub.getJSONObject(i);
                String guid=job.get("guid").toString();
                WSoftUtil.codeGetSourcesImport(dService, guid,false, redisCache);
            }

            saveFrontFuncs(dService);
        }
        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/codeexport")
    public ResponseEntity<Resource> codeExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from code where codeid in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");

        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);

        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();

        String codeguids = "";
        for(int i=0;i<datalist.size();i++)
        {
            Map<String,String> mp=(Map)datalist.get(i);
            Set<String> keyset = mp.keySet();
            String codefile = "";
            String sourcefile = "";
            String parafile = "";
            String guid="";
            for (String key : keyset) 
            {
                if(key.equalsIgnoreCase("codefile"))
                    codefile = mp.get(key).toString();
                if(key.equalsIgnoreCase("source"))
                    sourcefile = mp.get(key).toString();
                if(key.equalsIgnoreCase("para"))
                    parafile = mp.get(key).toString();    
                if(key.equalsIgnoreCase("guid"))
                    guid = mp.get(key).toString();  
            }
            codeguids = codeguids + "'" + WSoftUtil.replaceDBPara(guid) + "',";
            lfiles.add(configDirCode + codefile);
            lfiles.add(configDirCode + sourcefile);
            lfiles.add(configDirCode + parafile);
        }

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/code.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        if(!codeguids.equals(""))
        {
            codeguids = WSoftUtil.strDelLastComma(codeguids);
            sql = "select * from code_funcs where guid in ("+ codeguids +") ";
            List datalistcode = dService.getDatasBySql(sql, new Object[]{});
            if(datalistcode.size()>0)
            {
                String strJSONContentCode = JSON.toJSONString(datalistcode);
                bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/code_funcs.txt"),false),"utf-8"));
                bw.write(strJSONContentCode);
                bw.flush();
                bw.close(); 
                lfiles.add(configDir + strTmpDir + "/code_funcs.txt");
            }
        }

        lfiles.add(configDir + strTmpDir + "/code.txt");

        String strZipName="code.zip";
        String strZip = configDir + strTmpDir + "/" + strZipName;

        WSoftUtilZip.ZipMultiFile(lfiles, strZip);

        if(!File.separator.equals("/"))            //The leading  /  needs to be removed, otherwise error; verify on Linux
            strZip = strZip.substring(1);

        Resource resource = new UrlResource(Paths.get(strZip).toUri());
        String contentType = null;
        try{
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        }catch (IOException ex)
        {
            ex.printStackTrace();
        }

        if (contentType == null){
            contentType = "application/octet-stream";
        }
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + strZipName + "\"")
                .body(resource);

    }

    @RequestMapping("/api/codegetdatapara")
    public Map<String,Object> getDataPara(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String dataID="";
        String pageID="";
        
        if(jsonObject.containsKey("dataID"))
            dataID = jsonObject.getString("dataID");

        if(jsonObject.containsKey("pageID"))
            pageID = jsonObject.getString("pageID");
        
        List lreturn = cService.getinitDataPara(dataID,pageID, jsonObject);

        Map<String,Object> mreturn = new HashMap<String,Object>();
        String strOutFileContent = WSoftUtil.readTemplateFile("updhtml.html");
        mreturn.put("list",lreturn);
        mreturn.put("html",strOutFileContent);
        return mreturn;
    }

    @RequestMapping("/api/codeconfig")
    public Map<String,Object> getCodeConfig(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        Map<String,Object> mreturn = new HashMap<String,Object>();
        mreturn.put("dbtype",WSoftUtil.propertyGetPara("dbType"));
        return mreturn;
    }

}

