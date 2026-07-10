package com.wzsoft.main;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.springframework.util.ResourceUtils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.file.Paths;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;

import com.alibaba.fastjson.*;

@RestController
public class AppRestController {
    
    @Autowired
    private AppService aService;

    @Autowired
    private DatalistService dService;

    @RequestMapping("/api/dataappupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        List datalist = aService.updDatas(viewCode, itemIDs,jsonObject);

        return datalist;
    }
    @RequestMapping("/api/dataappadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        List datalist = aService.addDatas(viewCode, itemIDs,jsonObject);

        return datalist;
    }
    @RequestMapping("/api/dataappdel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        Object[] args = new Object[1];

        int rows = aService.delDatas(viewCode, itemIDs,args);
        return rows;
    }

    @RequestMapping("/portal/apimenu/getlist")
    public List getPortalMenu(@RequestBody JSONObject jsonObject)  throws Throwable  {
        String apptype=jsonObject.getString("apptype");
        List datalist = aService.getPortalAppDatas(apptype);
        return datalist;
    }

    
    @RequestMapping("/api/appimport")
    public Map<String,String> appImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String datafile=jsonObject.getString("datafile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!datafile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
            String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
            String strTarget = configDir + strTmpDir;
            File targetDir = new File(strTarget);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            datafile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + datafile;
            WSoftUtilZip.unzip(datafile,strTarget);

            String strJsonContentCode = WSoftUtil.readFile(strTarget + "/app.txt");
            if(!strJsonContentCode.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContentCode);
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
                            msg = msg + appid +"Import failed: " + msgerr + "<br>";
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
                            msg = msg + appid +"Import failed: " + msgerr + "<br>";
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
                    JSONObject jPara = new JSONObject();
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

        }

        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/appexport")
    public ResponseEntity<Resource> appExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from app where id in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);

        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();
        String appids = "";

        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            appids = appids + "'" + mp.get("appid").toString() + "',";
        }

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/app.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/app.txt");

        appids = WSoftUtil.strDelLastComma(appids);
        sql = "select * from app_page where appid in ("+ appids +") ";
        List apppagelist = dService.getDatasBySql(sql, new Object[]{});

        String strJSONContentPage = JSON.toJSONString(apppagelist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/apppage.txt"),false),"utf-8"));
        bw.write(strJSONContentPage);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/apppage.txt");

        String strZipName="app.zip";
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

    
    @RequestMapping("/api/appportalimport")
    public Map<String,String> appportalImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String datafile=jsonObject.getString("datafile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!datafile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
            String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
            String strTarget = configDir + strTmpDir;
            File targetDir = new File(strTarget);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            datafile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + datafile;
            WSoftUtilZip.unzip(datafile,strTarget);

            String strJsonContentCode = WSoftUtil.readFile(strTarget + "/appportal.txt");
            if(!strJsonContentCode.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContentCode);
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
                            msg = msg + appid +"Import failed: " + msgerr + "<br>";
                        }

                    }
                    else
                    {
                        List ltmp = dService.addDatas("appportal", jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {
                            msg = msg + appid +"Import failed: " + msgerr + "<br>";
                        }
                    }

                }
            }
            
        }

        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/appportalexport")
    public ResponseEntity<Resource> appportalExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from appportal where id in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);

        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();
        String appids = "";

        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            appids = appids + "'" + mp.get("appid").toString() + "',";
        }

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/appportal.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/appportal.txt");

        String strZipName="appportal.zip";
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


