package com.wzsoft.main;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ResourceUtils;

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
public class ConfigRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private ConfigService cService;

    @Autowired
    private CodeGenService codeService;

    @Autowired
    private RedisCache redisCache;

    @RequestMapping("/api/configsave")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        String logo = jsonObject.getString("field_LOGO");
        if(logo!=null&&!logo.equalsIgnoreCase(""))
        {
            WSoftUtil.saveLogoFile(logo);
        }

        List datalist = dService.updDatas(viewCode, itemIDs,jsonObject);
        return datalist;
    }

    @RequestMapping("/portal/api/configgetamode")
    public String getConfigAmode(@RequestBody JSONObject jsonObject)  throws Throwable 
    {
        return cService.getConfigAmode();
    }

    @RequestMapping("/portal/api/configgetregmode")
    public String getConfigRegmode(@RequestBody JSONObject jsonObject)  throws Throwable 
    {
        return cService.getConfigRegmode();
    }

    
    @RequestMapping("/api/configimport")
    public Map<String,String> configImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String dataFile=jsonObject.getString("datafile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!dataFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
            String configDirTemp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
            String configDirPort = configDir.replaceAll("/WEB-INF/classes", "/portal");
            String configDirMan = configDir.replaceAll("/WEB-INF/classes", "/manage");
            String configDirWfm = configDir.replaceAll("/WEB-INF/classes", "/admin/wfms");

            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
            String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
            String strTarget = configDir + strTmpDir;
            File targetDir = new File(strTarget);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            dataFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + dataFile;
            WSoftUtilZip.unzip(dataFile,strTarget);

            
            //Import EmailTemplate start
            System.out.println("import msgtemplate begin ...");
            String strJsonContent = WSoftUtil.readFile(strTarget + "/msgtemp.txt");
            JSONArray jArr = JSON.parseArray(strJsonContent);
            for(int i=0;i<jArr.size();i++)
            {
                JSONObject job = jArr.getJSONObject(i);
                Set<String> jsonset = job.keySet();
                JSONObject jPara = new JSONObject();
                String msgGuid = "";
                String msgName = "";

                for (String key : jsonset) 
                {
                    if(!key.equalsIgnoreCase("tempid"))
                    {
                        if(key.equalsIgnoreCase("guid"))
                            msgGuid = job.get(key).toString();
                        if(key.equalsIgnoreCase("name"))
                            msgName = job.get(key).toString();
  
                        jPara.put("field_"+ key.toUpperCase(), job.get(key));
                    }
                }

                String sql = "select TEMPID from msg_template where guid=?";
                List datalist = dService.getDatasBySql(sql, new Object[]{msgGuid});
                String msgerr = "";
                if(datalist.size()>0)
                {
                    Map<String,Object> mcode=(Map)datalist.get(0);
                    String msgid = mcode.get("TEMPID").toString();
                    List ltmp = dService.updDatas("msg_template", msgid,jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {   
                        msg = msg+ "EmailTemplate: "+ msgName+"Import failed: " + msgerr + "<br>";
                    }
                }
                else
                {
                    List ltmp = dService.addDatas("msg_template", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg+ "EmailTemplate: "+msgName+"Import failed: " + msgerr + "<br>";
                    }
                }
            }
            System.out.println("import msgtemplate end");
            //Import EmailTemplate end

            //Import Workflow start
            System.out.println("import wfm begin ...");
            strJsonContent = WSoftUtil.readFile(strTarget + "/wfm.txt");
            jArr = JSON.parseArray(strJsonContent);
            for(int i=0;i<jArr.size();i++)
            {
                JSONObject job = jArr.getJSONObject(i);
                Set<String> jsonset = job.keySet();
                JSONObject jPara = new JSONObject();
                String wfmdatafile = "";
                String wfmrulefile = "";
                String wfmguid="";
                String wfmname="";

                for (String key : jsonset) 
                {
                    if(!key.equalsIgnoreCase("wfmid"))
                    {
                        if(key.equalsIgnoreCase("wfmdata"))
                            wfmdatafile = job.get(key).toString();
                        if(key.equalsIgnoreCase("wfmrule"))
                            wfmrulefile = job.get(key).toString();
                        if(key.equalsIgnoreCase("guid"))
                            wfmguid = job.get(key).toString();
                        if(key.equalsIgnoreCase("name"))
                            wfmname = job.get(key).toString();
                        
                        jPara.put("field_"+ key.toUpperCase(), job.get(key));
                    }
                }

                String sql = "select wfmid from wfm where guid=?";
                List datalist = dService.getDatasBySql(sql, new Object[]{wfmguid});
                String msgerr = "";
                if(datalist.size()>0)
                {
                    Map<String,Object> mcode=(Map)datalist.get(0);
                    String wfmid = mcode.get("wfmid").toString();
                    List ltmp = dService.updDatas("wfm", wfmid,jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {   
                        msg = msg+ "Workflow: "+ wfmname +"Import failed: " + msgerr + "<br>";
                    }
                }
                else
                {
                    List ltmp = dService.addDatas("wfm", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg+ "Workflow: "+ wfmname +"Import failed: " + msgerr + "<br>";
                    }
                }

                if(msgerr.equals(""))
                {
                    WSoftUtil.copyFile(new File(strTarget+"/"+wfmdatafile), new File(configDirWfm+ wfmdatafile));
                    WSoftUtil.copyFile(new File(strTarget+"/"+wfmrulefile), new File(configDirWfm+ wfmrulefile));

                    WSoftUtil.copyFile(new File(strTarget+"/"+wfmdatafile), new File(WSoftUtil.propertyGetPara("wfmDir")+"/"+wfmdatafile));
                    WSoftUtil.copyFile(new File(strTarget+"/"+wfmrulefile), new File(WSoftUtil.propertyGetPara("wfmDir")+"/"+wfmrulefile));

                }
            }
            System.out.println("import wfm end ...");
            //Import Workflow end


            //Import Page start
            System.out.println("import page begin...");
            strJsonContent = WSoftUtil.readFile(strTarget + "/page.txt");
            jArr = JSON.parseArray(strJsonContent);
            for(int i=0;i<jArr.size();i++)
            {
                JSONObject job = jArr.getJSONObject(i);
                Set<String> jsonset = job.keySet();
                JSONObject jPara = new JSONObject();
                String pageLocation = "";
                String pegeType="";

                for (String key : jsonset) 
                {
                    if(!key.equalsIgnoreCase("pageid"))
                    {
                        if(key.equalsIgnoreCase("location"))
                            pageLocation = job.get(key).toString();
                        if(key.equalsIgnoreCase("pagetype"))
                            pegeType = job.get(key).toString();
                        
                        jPara.put("field_"+ key.toUpperCase(), job.get(key));
                    }
                }

                String sql = "select pageid from page where location=?";
                List datalist = dService.getDatasBySql(sql, new Object[]{pageLocation});
                String msgerr = "";
                if(datalist.size()>0)
                {
                    Map<String,Object> mcode=(Map)datalist.get(0);
                    String pageid = mcode.get("pageid").toString();
                    List ltmp = dService.updDatas("page", pageid,jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {   
                        msg = msg + "Page："+ pageLocation +"Import failed: " + msgerr + "<br>";
                    }
                }
                else
                {
                    List ltmp = dService.addDatas("page", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg + "Page："+ pageLocation +"Import failed: " + msgerr + "<br>";
                    }
                }

                if(msgerr.equals(""))
                {
                    WSoftUtil.copyFile(new File(strTarget+"/temp_"+pageLocation), new File(configDirTemp+ "temp_"+pageLocation));
                    WSoftUtil.copyFile(new File(strTarget+"/json_"+pageLocation.replaceAll(".html", ".txt")), new File(configDirTemp+"json_"+pageLocation.replaceAll(".html", ".txt")));
                    if(pegeType.equals("1"))
                    {
                        WSoftUtil.copyFile(new File(strTarget+"/"+pageLocation), new File(configDirMan+ pageLocation));
                        WSoftUtil.copyFile(new File(strTarget+"/"+pageLocation), new File(WSoftUtil.propertyGetPara("pagesManageDir")+"/"+pageLocation));
                    }
                    else
                    {
                        WSoftUtil.copyFile(new File(strTarget+"/"+pageLocation), new File(configDirPort+ pageLocation));
                        WSoftUtil.copyFile(new File(strTarget+"/"+pageLocation), new File(WSoftUtil.propertyGetPara("pagesPortalDir")+"/"+pageLocation));
                    }

                    WSoftUtil.copyFile(new File(strTarget+"/temp_"+pageLocation), new File(WSoftUtil.propertyGetPara("templatesDir")+"/temp_"+pageLocation));
                    WSoftUtil.copyFile(new File(strTarget+"/json_"+pageLocation.replaceAll(".html", ".txt")), new File(WSoftUtil.propertyGetPara("templatesDir")+"/json_"+pageLocation.replaceAll(".html", ".txt")));
                
                    String strJsonFile = strTarget+"/json_"+pageLocation.replaceAll(".html", ".txt");
                    File jsonFile = new File(strJsonFile);
                    if(jsonFile.exists())
                    {
                        String strJsonForm = WSoftUtil.readFile(strJsonFile);
                        if(!strJsonForm.equals(""))
                        {
                            JSONObject jForm = JSON.parseObject(strJsonForm);
                            FormRestController.saveFormFunc(dService,codeService,jForm);
                        }
                    }

                }
            }
            System.out.println("import page end");
            //Import Page end

            //Import App start
            System.out.println("import app begin...");
            strJsonContent = WSoftUtil.readFile(strTarget + "/app.txt");
            if(!strJsonContent.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContent);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    JSONObject jPara = new JSONObject();
                    String appid = "";

                    for (String key : jsonset) 
                    {
                        if(!key.equalsIgnoreCase("id"))
                        {
                            if(key.equalsIgnoreCase("appid"))
                                appid = job.get(key).toString(); 
                            jPara.put("field_"+ key.toUpperCase(), job.get(key));
                        }
                    }

                    String sql = "select id from app where appid=?";
                    List datalist = dService.getDatasBySql(sql, new Object[]{appid});
                    String msgerr = "";
                    if(datalist.size()>0)
                    {
                        Map<String,Object> mcode=(Map)datalist.get(0);
                        String aid = mcode.get("id").toString();
                        List ltmp = dService.updDatas("app", aid,jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {   
                            msg = msg + "App: "+ appid +"Import failed: " + msgerr + "<br>";
                        }

                        String strUpdSql = "delete from app_page where appid=?";
                        dService.updDatasBySql(strUpdSql, new Object[]{appid});
                    }
                    else
                    {
                        List ltmp = dService.addDatas("app", jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {
                            msg = msg + "App: "+ appid +"Import failed: " + msgerr + "<br>";
                        }
                    }

                }
            }
            
            String strJsonContentPage = WSoftUtil.readFile(strTarget + "/apppage.txt");
            if(!strJsonContentPage.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContentPage);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    String location = "";
                    String appid = "";

                    for (String key : jsonset) 
                    {
                        if(key.equalsIgnoreCase("location"))
                            location = job.get(key).toString();
                            
                        if(key.equalsIgnoreCase("appid"))
                            appid = job.get(key).toString();
                    }

                    String strUpdSql = "insert into app_page(appid,location) values(?,?)";
                    dService.updDatasBySql(strUpdSql, new Object[]{appid,location});

                }
            }

            strJsonContent = WSoftUtil.readFile(strTarget + "/appportal.txt");
            if(!strJsonContent.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContent);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    JSONObject jPara = new JSONObject();
                    String appid = "";

                    for (String key : jsonset) 
                    {
                        if(!key.equalsIgnoreCase("id"))
                        {
                            if(key.equalsIgnoreCase("appid"))
                                appid = job.get(key).toString(); 
                            jPara.put("field_"+ key.toUpperCase(), job.get(key));
                        }
                    }

                    String sql = "select id from appportal where appid=?";
                    List datalist = dService.getDatasBySql(sql, new Object[]{appid});
                    String msgerr = "";
                    if(datalist.size()>0)
                    {
                        Map<String,Object> mcode=(Map)datalist.get(0);
                        String aid = mcode.get("id").toString();
                        List ltmp = dService.updDatas("appportal", aid,jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {   
                            msg = msg + "App: "+ appid +"Import failed: " + msgerr + "<br>";
                        }

                    }
                    else
                    {
                        List ltmp = dService.addDatas("appportal", jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {
                            msg = msg + "App: "+ appid +"Import failed: " + msgerr + "<br>";
                        }
                    }

                }
            }
            System.out.println("import app end");
            //Import App end

            //Import Dataset start
            System.out.println("import data begin...");
            strJsonContent = WSoftUtil.readFile(strTarget + "/data.txt");
            String strJsonContentForm = WSoftUtil.readFile(strTarget + "/dataform.txt");
            jArr = JSON.parseArray(strJsonContent);
            for(int i=0;i<jArr.size();i++)
            {
                JSONObject job = jArr.getJSONObject(i);
                Set<String> jsonset = job.keySet();
                JSONObject jPara = new JSONObject();
                String tblname = "";

                for (String key : jsonset) 
                {
                    if(!key.equalsIgnoreCase("dataid"))
                    {
                        if(key.equalsIgnoreCase("tablename"))
                            tblname = job.get(key).toString();
                        
                        jPara.put("field_"+ key.toUpperCase(), job.get(key));
                    }
                }

                String sql = "select dataid from data where tablename=?";
                List datalist = dService.getDatasBySql(sql, new Object[]{tblname});
                String msgerr = "";
                if(datalist.size()>0)
                {
                    jPara.remove("field_TABLEEXIST");
                    Map<String,Object> mcode=(Map)datalist.get(0);
                    String dataid = mcode.get("dataid").toString();
                    List ltmp = dService.updDatas("data", dataid,jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {   
                        msg = msg + "Dataset: "+ tblname +"Import failed: " + msgerr + "<br>";
                    }
                    if(strJsonContentForm.indexOf("\"tablename\":\""+ tblname +"\"")>0)
                    {
                        String strUpdSql = "delete from data_form where tablename=?";
                        dService.updDatasBySql(strUpdSql, new Object[]{tblname});
                    }
                }
                else
                {
                    jPara.put("field_TABLEEXIST", "0");
                    List ltmp = dService.addDatas("data", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg + "Dataset: "+ tblname +"Import failed: " + msgerr + "<br>";
                    }
                }
            }
            
            if(!strJsonContentForm.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContentForm);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    JSONObject jPara = new JSONObject();
                    String location = "";
                    String tblname = "";

                    for (String key : jsonset) 
                    {
                        if(!key.equalsIgnoreCase("formid"))
                        {
                            if(key.equalsIgnoreCase("location"))
                                location = job.get(key).toString();
                            
                            if(key.equalsIgnoreCase("tablename"))
                                tblname = job.get(key).toString();
  
                            jPara.put("field_"+ key.toUpperCase(), job.get(key));
                        }
                    }

                    String sql = "select formid from data_form where tablename=? and location=?";
                    List datalist = dService.getDatasBySql(sql, new Object[]{tblname,location});
                    String msgerr = "";
                    if(datalist.size()>0)
                    {
                        Map<String,Object> mcode=(Map)datalist.get(0);
                        String formid = mcode.get("formid").toString();
                        List ltmp = dService.updDatas("data_form", formid,jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {   
                            msg = msg + "Dataset Form: "+ location  +"Import failed: " + msgerr + "<br>";
                        }
                    }
                    else
                    {
                        List ltmp = dService.addDatas("data_form", jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {
                            msg = msg + "Dataset Form: "+ location +"Import failed: " + msgerr + "<br>";
                        }
                    }

                    if(msgerr.equals(""))
                    {

                        WSoftUtil.copyFile(new File(strTarget+"/temp_"+location), new File(configDirTemp+"temp_"+location));
                        WSoftUtil.copyFile(new File(strTarget+"/pdf_"+location), new File(configDirTemp+"pdf_"+location));
                        WSoftUtil.copyFile(new File(strTarget+"/json_"+location.replaceAll(".html", ".txt")), new File(configDirTemp+"json_"+location.replaceAll(".html", ".txt")));
                        WSoftUtil.copyFile(new File(strTarget+"/form_"+location), new File(configDirMan+"form_"+location));
                        WSoftUtil.copyFile(new File(strTarget+"/genpdf_"+location), new File(configDirMan+"genpdf_"+location));

                        WSoftUtil.copyFile(new File(strTarget+"/temp_"+location), new File(WSoftUtil.propertyGetPara("templatesDir")+"/temp_"+location));
                        WSoftUtil.copyFile(new File(strTarget+"/pdf_"+location), new File(WSoftUtil.propertyGetPara("templatesDir")+"/pdf_"+location));
                        WSoftUtil.copyFile(new File(strTarget+"/json_"+location.replaceAll(".html", ".txt")), new File(WSoftUtil.propertyGetPara("templatesDir")+"/json_"+location.replaceAll(".html", ".txt")));
                        WSoftUtil.copyFile(new File(strTarget+"/form_"+location), new File(WSoftUtil.propertyGetPara("pagesManageDir")+"/form_"+location));
                        WSoftUtil.copyFile(new File(strTarget+"/genpdf_"+location), new File(WSoftUtil.propertyGetPara("pagesManageDir")+"/genpdf_"+location));
                        
                        String strJsonFile = strTarget+"/json_"+location.replaceAll(".html", ".txt");
                        File jsonFile = new File(strJsonFile);
                        if(jsonFile.exists())
                        {
                            String strJsonForm = WSoftUtil.readFile(strJsonFile);
                            if(!strJsonForm.equals(""))
                            {
                                JSONObject jForm = JSON.parseObject(strJsonForm);
                                FormRestController.saveFormFunc(dService,codeService,jForm);
                                FormRestController.submitFormDo(dService, jForm);
                            }
                        }
                    }
                }
            }
            System.out.println("import data end");
            //Import Dataset end

            //Import Role start
            System.out.println("import role begin...");
            strJsonContent = WSoftUtil.readFile(strTarget + "/role.txt");
            if(!strJsonContent.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContent);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    JSONObject jPara = new JSONObject();
                    String roleid = "";

                    for (String key : jsonset) 
                    {
                        if(!key.equalsIgnoreCase("id"))
                        {
                            if(key.equalsIgnoreCase("roleid"))
                                roleid = job.get(key).toString(); 
                            jPara.put("field_"+ key.toUpperCase(), job.get(key));
                        }
                    }

                    String sql = "select id from role where roleid=?";
                    List datalist = dService.getDatasBySql(sql, new Object[]{roleid});
                    String msgerr = "";
                    if(datalist.size()>0)
                    {
                        Map<String,Object> mcode=(Map)datalist.get(0);
                        String aid = mcode.get("id").toString();
                        List ltmp = dService.updDatas("role", aid,jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {   
                            msg = msg + "Role："+ roleid +"Import failed: " + msgerr + "<br>";
                        }

                        String strUpdSql = "delete from role_app where roleid=?";
                        dService.updDatasBySql(strUpdSql, new Object[]{roleid});

                        strUpdSql = "delete from role_dataview where roleid=?";
                        dService.updDatasBySql(strUpdSql, new Object[]{roleid});
                    }
                    else
                    {
                        List ltmp = dService.addDatas("role", jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {
                            msg = msg + "Role："+ roleid +"Import failed: " + msgerr + "<br>";
                        }
                    }
                }
            }
            
            String strJsonContentApp = WSoftUtil.readFile(strTarget + "/roleapp.txt");
            if(!strJsonContentApp.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContentApp);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    String appid = "";
                    String roleid = "";

                    for (String key : jsonset) 
                    {
                        if(key.equalsIgnoreCase("roleid"))
                            roleid = job.get(key).toString();
                            
                        if(key.equalsIgnoreCase("appid"))
                            appid = job.get(key).toString();
                    }

                    String strUpdSql = "insert into role_app(roleid,appid) values(?,?)";
                    dService.updDatasBySql(strUpdSql, new Object[]{roleid,appid});

                }
            }

            String strJsonContentDv = WSoftUtil.readFile(strTarget + "/roledataview.txt");
            if(!strJsonContentDv.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContentDv);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    String viewcode = "";
                    String roleid = "";

                    for (String key : jsonset) 
                    {
                        if(key.equalsIgnoreCase("roleid"))
                            roleid = job.get(key).toString();
                            
                        if(key.equalsIgnoreCase("viewcode"))
                            viewcode = job.get(key).toString();
                    }

                    String strUpdSql = "insert into role_dataview(roleid,viewcode) values(?,?)";
                    dService.updDatasBySql(strUpdSql, new Object[]{roleid,viewcode});

                }
            }
            System.out.println("import role end");
            //Import Role end

            //Import Config start
            System.out.println("import config begin...");
            strJsonContent = WSoftUtil.readFile(strTarget + "/config.txt");
            if(!strJsonContent.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContent);
                for(int i=0;i<jArrCode.size();i++)
                {
                    JSONObject job = jArrCode.getJSONObject(i);
                    Set<String> jsonset = job.keySet();
                    JSONObject jPara = new JSONObject();
                    String id = "";

                    for (String key : jsonset) 
                    {
                        if(key.equalsIgnoreCase("id"))
                        {
                            id = job.get(key).toString(); 
                        }
                        else
                        {
                            jPara.put("field_"+ key.toUpperCase(), job.get(key));
                        }
                    }

                    String sql = "select id from config where id=?";
                    List datalist = dService.getDatasBySql(sql, new Object[]{id});
                    String msgerr = "";
                    if(datalist.size()>0)
                    {
                        Map<String,Object> mcode=(Map)datalist.get(0);
                        String aid = mcode.get("id").toString();
                        List ltmp = dService.updDatas("config", aid,jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {   
                            msg = msg + "Config: "+ id +"Import failed: " + msgerr + "<br>";
                        }
                    }
                    else
                    {
                        List ltmp = dService.addDatas("config", jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {
                            msg = msg + "Config: "+ id +"Import failed: " + msgerr + "<br>";
                        }
                    }

                }
            }
            System.out.println("import config end");
            //Import Config end

            System.out.println("import code begin ...");
            //Import Code start
            strJsonContent = WSoftUtil.readFile(strTarget + "/code.txt");
            jArr = JSON.parseArray(strJsonContent);
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
                        msg = msg + "Code："+ codeName+"Import failed: " + msgerr + "<br>";
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
                        msg = msg + "Code："+ codeName+"Import failed: " + msgerr + "<br>";
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

            CodeGenRestController.saveFrontFuncs(dService);
            System.out.println("import code end");
            //Import Code end

            //Process frontend scripts
            CodeGenRestController.saveFrontFuncs(dService);
            System.out.println("import deal jsfront end");

            WSoftUtil.fileUploadCopy(strTarget);
            System.out.println("import deal uploadfile end");

            CodeGenRestController.dealCodeCache(dService,redisCache);
            System.out.println("import deal codecache end");
        }
        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/configexport")
    public ResponseEntity<Resource> configExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
        String configDirTemp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
        String configDirMan = configDir.replaceAll("/WEB-INF/classes", "/manage");
        String configDirPort = configDir.replaceAll("/WEB-INF/classes", "/portal");
        String configDirWfm = configDir.replaceAll("/WEB-INF/classes", "/admin/wfms");

        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();

        String sql = "select * from code";
        List datalist = dService.getDatasBySql(sql, new Object[]{});
        for(int i=0;i<datalist.size();i++)
        {
            Map<String,String> mp=(Map)datalist.get(i);
            Set<String> keyset = mp.keySet();
            String codefile = "";
            String sourcefile = "";
            String parafile = "";
            for (String key : keyset) 
            {
                if(key.equalsIgnoreCase("codefile"))
                    codefile = mp.get(key).toString();
                if(key.equalsIgnoreCase("source"))
                    sourcefile = mp.get(key).toString();
                if(key.equalsIgnoreCase("para"))
                    parafile = mp.get(key).toString();    
            }
            lfiles.add(configDirCode + codefile);
            lfiles.add(configDirCode + sourcefile);
            lfiles.add(configDirCode + parafile);
        }
        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/code.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/code.txt");

        sql = "select * from code_funcs";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/code_funcs.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/code_funcs.txt");

        sql = "select * from msg_template";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/msgtemp.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/msgtemp.txt");

        sql = "select * from wfm";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            String strWfmDatasFile = "";
            String strWfmRulesFile = "";

            if(mp.get("wfmdata")!=null)
            {
                strWfmDatasFile = mp.get("wfmdata").toString();
            }
            if(mp.get("wfmrule")!=null)
            {
                strWfmRulesFile = mp.get("wfmrule").toString();
            }
            lfiles.add(configDirWfm + strWfmDatasFile);
            lfiles.add(configDirWfm + strWfmRulesFile);
        }
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/wfm.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/wfm.txt");

        sql = "select * from page";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            String pageLocation = "";
            String pageType="";

            pageLocation = mp.get("location").toString();
            lfiles.add(configDirTemp + "temp_" + pageLocation);
            pageType=mp.get("pagetype").toString();

            String strFileCon = "";
            if(pageType.equals("1"))
            {
                lfiles.add(configDirMan + pageLocation);
                strFileCon = WSoftUtil.readFile(configDirMan + pageLocation);
            }
            else
            {
                lfiles.add(configDirPort + pageLocation);
                strFileCon = WSoftUtil.readFile(configDirPort + pageLocation);
            }
            WSoftUtil.fileUploadDeal(strFileCon, lfiles,false);

            String strFileConTemp = "";
            strFileConTemp = WSoftUtil.readFile(configDirTemp + "temp_" + pageLocation);
            WSoftUtil.fileUploadDeal(strFileConTemp, lfiles,true);

            lfiles.add(configDirTemp + "json_" + pageLocation.replaceAll(".html", ".txt"));
        }
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/page.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/page.txt");

        sql = "select * from app";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/app.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/app.txt");

        sql = "select * from app_page";
        List apppagelist = dService.getDatasBySql(sql, new Object[]{});
        String strJSONContentPage = JSON.toJSONString(apppagelist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/apppage.txt"),false),"utf-8"));
        bw.write(strJSONContentPage);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/apppage.txt");

        sql = "select * from appportal";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/appportal.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/appportal.txt");

        sql = "select * from data";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/data.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/data.txt");

        sql = "select * from data_form";
        List fromlist = dService.getDatasBySql(sql, new Object[]{});
        for(int i=0;i<fromlist.size();i++)
        {
            Map<String,Object> mpdf=(Map)fromlist.get(i);
            if(mpdf.get("location")!=null&&!mpdf.get("location").toString().equals(""))
            {
                String pageLocation = mpdf.get("location").toString();
                lfiles.add(configDirTemp + "temp_" + pageLocation);
                lfiles.add(configDirTemp + "pdf_" + pageLocation);
                lfiles.add(configDirTemp + "json_" + pageLocation.replaceAll(".html", ".txt"));
                lfiles.add(configDirMan + "form_" + pageLocation);
                lfiles.add(configDirMan + "genpdf_" + pageLocation);

                String strFileCon = WSoftUtil.readFile(configDirMan + "form_" + pageLocation);

                WSoftUtil.fileUploadDeal(strFileCon, lfiles,false);

                String strFileConTemp = "";
                strFileConTemp = WSoftUtil.readFile(configDirTemp + "temp_" + pageLocation);
                WSoftUtil.fileUploadDeal(strFileConTemp, lfiles,true);
            }
        }
        String strJSONContentForm = JSON.toJSONString(fromlist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/dataform.txt"),false),"utf-8"));
        bw.write(strJSONContentForm);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/dataform.txt");

        sql = "select * from role";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        strJSONContent = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/role.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/role.txt");

        sql = "select * from role_app";
        List applist = dService.getDatasBySql(sql, new Object[]{});
        String strJSONContentApp = JSON.toJSONString(applist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/roleapp.txt"),false),"utf-8"));
        bw.write(strJSONContentApp);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/roleapp.txt");

        sql = "select * from role_dataview";
        List dvlist = dService.getDatasBySql(sql, new Object[]{});
        String strJSONContentDv = JSON.toJSONString(dvlist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/roledataview.txt"),false),"utf-8"));
        bw.write(strJSONContentDv);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/roledataview.txt");

        sql = "select * from config where id=1";
        datalist = dService.getDatasBySql(sql, new Object[]{});
        String strJSONContentCf = JSON.toJSONString(datalist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/config.txt"),false),"utf-8"));
        bw.write(strJSONContentCf);
        bw.flush();
        bw.close();
        lfiles.add(configDir + strTmpDir + "/config.txt");

        String strZipName="config.zip";
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


}
