package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
public class PageRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private CodeGenService codeService;

    private void saveTemplateFile(String fileName,String fileContent) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/templates/");
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

    }

    private String readTemplateFile(String fileName) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/templates/");
        StringBuilder stringBuilder = new StringBuilder();
        try 
        {
            FileInputStream fileInputStream = new FileInputStream(configDir+ "/" +fileName);
            InputStreamReader inputStreamReader = new InputStreamReader(fileInputStream, "UTF-8");
            BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
            String tempString;
            while ((tempString = bufferedReader.readLine()) != null) {
                tempString+='\n';
                stringBuilder.append(tempString);
            }
            bufferedReader.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
        return stringBuilder.toString();
    }

    private void saveContentFile(String fileName,String fileContent) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "");
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

    }

    private String readContentFile(String fileName) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "");
        StringBuilder stringBuilder = new StringBuilder();
        try 
        {
            FileInputStream fileInputStream = new FileInputStream(configDir+ "/" +fileName);
            InputStreamReader inputStreamReader = new InputStreamReader(fileInputStream, "UTF-8");
            BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
            String tempString;
            while ((tempString = bufferedReader.readLine()) != null) {
                tempString+='\n';
                stringBuilder.append(tempString);
            }
            bufferedReader.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
        return stringBuilder.toString();
    }

    @RequestMapping("/api/pageupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        String pageLocation=jsonObject.getString("field_LOCATION");
        String oldLocation=jsonObject.getString("oldLocation");
        
        List datalist = dService.updDatas(viewCode, itemIDs,jsonObject);
        if(!pageLocation.trim().equalsIgnoreCase(oldLocation.trim()))
        {
            Map<String,Object> mview=(Map)datalist.get(0);
            String msg = (String)mview.get("msg");
            if(msg.trim().equalsIgnoreCase(""))
            {
                String templateContent = readTemplateFile("temp_" + oldLocation);
                saveTemplateFile("temp_" + pageLocation,templateContent);

                String fileContent = readContentFile(oldLocation);
                saveContentFile(pageLocation,fileContent);
            }
        }
        return datalist;
    }
    @RequestMapping("/api/pageadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String pageLocation=jsonObject.getString("field_LOCATION");
        String templateLocation=jsonObject.getString("templateLocation");
        
        List datalist = dService.addDatas(viewCode,jsonObject);
        Map<String,Object> mview=(Map)datalist.get(0);
        String msg = (String)mview.get("msg");
        if(msg.trim().equalsIgnoreCase(""))
        {

            String templateContent = readTemplateFile(templateLocation);
            pageLocation = "temp_" + pageLocation;
            saveTemplateFile(pageLocation,templateContent);
        }

        return datalist;
    }

    @RequestMapping("/api/pagedel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        // Delete related code
        String sql = "select * from page where  pageid=?";
        String pagelocation="";
        String pagetype="";
        List datalist = dService.getDatasBySql(sql, new Object[]{itemIDs});
        if(datalist.size()>0)
        {
            Map<String,Object> mp=(Map)datalist.get(0);
            pagelocation = mp.get("location").toString();
            pagetype = mp.get("pagetype").toString();
            String strCodes = "";
            if(mp.get("codes")!=null)
                strCodes = mp.get("codes").toString();

            if(strCodes!=null&&!strCodes.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strCodes);
                if(jsonCode.containsKey("inits")&&!jsonCode.getString("inits").equals(""))
                {
                    CodeGenRestController.delCodeDo(jsonCode.getString("inits"),dService);
                }
            }
        }
        int rows = dService.delDatas(viewCode, itemIDs,jsonObject);

        String classDir = ResourceUtils.getURL("classpath:").getPath();
        String  webDirTemp = classDir.replaceAll("/WEB-INF/classes", "/admin/templates");
        String webDir = "";
        if(pagetype.equals("2"))
            webDir = classDir.replaceAll("/WEB-INF/classes", "/portal");
        else
            webDir = classDir.replaceAll("/WEB-INF/classes", "/manage");

        WSoftUtil.delFile(webDir + pagelocation);
        WSoftUtil.delFile(webDirTemp + "temp_"+pagelocation);
        WSoftUtil.delFile(webDirTemp + "json_"+pagelocation.replaceAll(".html", ".txt"));

        if(pagetype.equals("2"))
            WSoftUtil.delFile(WSoftUtil.propertyGetPara("pagesPortalDir") + "/" + pagelocation);
        else
            WSoftUtil.delFile(WSoftUtil.propertyGetPara("pagesManageDir") + "/" + pagelocation);
        
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/temp_" + pagelocation);
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("templatesDir") + "/json_" + pagelocation.replaceAll(".html", ".txt"));
        WSoftUtil.delWebFiles(pagelocation.toLowerCase().replaceAll(".html","_"), webDir,pagetype);

        return rows;
    }
    
    @RequestMapping("/api/pageimport")
    public Map<String,String> pageImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String pageFile=jsonObject.getString("pagefile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!pageFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
            String configDirTemp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
            String configDirMan = configDir.replaceAll("/WEB-INF/classes", "/manage");
            String configDirPort = configDir.replaceAll("/WEB-INF/classes", "/portal");
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
            String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
            String strTarget = configDir + strTmpDir;
            File targetDir = new File(strTarget);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            pageFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + pageFile;
            WSoftUtilZip.unzip(pageFile,strTarget);

            String codeMsg="";
            codeMsg = WSoftUtil.codeImportDo(dService, strTarget, configDirCode);
            if(!codeMsg.equals(""))
            {
                msg = msg + codeMsg;
            }

            String strJsonContent = WSoftUtil.readFile(strTarget + "/page.txt");
            JSONArray jArr = JSON.parseArray(strJsonContent);
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
                        msg = msg + pageLocation +"Import failed: " + msgerr + "<br>";
                    }
                }
                else
                {
                    List ltmp = dService.addDatas("page", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg + pageLocation +"Import failed: " + msgerr + "<br>";
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

            //Process frontend scripts
            CodeGenRestController.saveFrontFuncs(dService);

            WSoftUtil.fileUploadCopy(strTarget);
        }

        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/pageexport")
    public ResponseEntity<Resource> pageExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from page where pageid in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
        String configDirTemp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
        String configDirMan = configDir.replaceAll("/WEB-INF/classes", "/manage");
        String configDirPort = configDir.replaceAll("/WEB-INF/classes", "/portal");

        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);

        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();
        String codelist = "";

        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            Set<String> keyset = mp.keySet();
            String strCodes = "";
            String pageLocation = "";
            String pageType="";

            if(mp.get("codes")!=null)
                strCodes = mp.get("codes").toString();

            if(strCodes!=null&&!strCodes.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strCodes);
                if(!jsonCode.getString("inits").equals(""))
                {
                    sql = "select * from code where guid=?";
                    List dcode = dService.getDatasBySql(sql, new Object[]{jsonCode.getString("inits")});
                    Map<String,Object> mcode=(Map)dcode.get(0);
                    codelist = codelist + "'" + WSoftUtil.replaceDBPara(mcode.get("guid").toString()) + "',";
                }
            }

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

        if(!codelist.equals(""))
        {
            WSoftUtil.codeExportDo(dService, lfiles, codelist, configDir, strTmpDir, configDirCode);
        }

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/page.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/page.txt");

        String strZipName="page.zip";
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
