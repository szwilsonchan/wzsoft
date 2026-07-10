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
public class DataRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private CodeGenService codeService;
    
    @Autowired
    private DatalistDao datalistDao;

    @RequestMapping("/api/dataformupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        List datalist = dService.updDatas(viewCode, itemIDs,jsonObject);
        
        String sql = "";
        
        if(viewCode.equals("data_form"))
            sql="select tablename from data_form where formid=?";
        
        if(viewCode.equals("data"))
            sql="select tablename from data where dataid=?";

        Map<String,Object> mp = (Map<String,Object>)datalistDao.getDataSingle(sql, new Object[] {itemIDs});
        String tableName = (String)mp.get("tablename");

        if(tableName.indexOf("tbl")==0)
        {
            WSoftUtil.dbUpdDataUpdTime(datalistDao,tableName);
        }

        return datalist;
    }
    @RequestMapping("/api/dataformadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String pageLocation=jsonObject.getString("field_LOCATION");
        String templateLocation=jsonObject.getString("templateLocation");
        
        List datalist = dService.addDatas(viewCode,jsonObject);

        Map<String,Object> mreturn = (Map)datalist.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase("")&&jsonObject.getString("field_TABLENAME").indexOf("tbl")==0)
        {
            JSONObject jPara = new JSONObject();
            //jPara.put("field_dataid", pID);
            jPara.put("field_tablename", jsonObject.getString("field_TABLENAME"));
            jPara.put("field_name", jsonObject.getString("field_NAME")+"Form");
            jPara.put("field_formname", jsonObject.getString("field_TABLENAME"));
            jPara.put("field_location", pageLocation);
            jPara.put("field_templocation", jsonObject.getString("field_templocation"));
            dService.addDatas("data_form",jPara);

            String templateContent = "";
            if(templateLocation!=null)
            {
                templateContent = WSoftUtil.readTemplateFile(templateLocation);
    
                WSoftUtil.saveTemplateFile("temp_" + pageLocation,templateContent);
    
                if(templateLocation.indexOf("temp_")==0)
                    templateContent = WSoftUtil.readTemplateFile(templateLocation.replaceAll("temp_", "pdf_"));
                else
                    templateContent = WSoftUtil.readTemplateFile("pdf.html");
                WSoftUtil.saveTemplateFile("pdf_" + pageLocation,templateContent);
            }
        }
        return datalist;
    }
    @RequestMapping("/api/dataformdel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        Object[] args = new Object[1];

        // Delete related code
        String sql = "select * from data where  dataid=?";
        List datalist = dService.getDatasBySql(sql, new Object[]{itemIDs});
        if(datalist.size()>0)
        {
            Map<String,Object> mp=(Map)datalist.get(0);
            String strCodes = "";
            if(mp.get("codes")!=null)
                strCodes = mp.get("codes").toString();

            if(strCodes!=null&&!strCodes.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strCodes);
                List<String> lcodes = new ArrayList<>();
                if(jsonCode.containsKey("views")&&!jsonCode.getString("views").equals(""))
                    lcodes.add(jsonCode.getString("views"));

                if(jsonCode.containsKey("updview")&&!jsonCode.getString("updview").equals(""))
                    lcodes.add(jsonCode.getString("updview"));

                if(jsonCode.containsKey("inits")&&!jsonCode.getString("inits").equals(""))
                    lcodes.add(jsonCode.getString("inits"));
                
                if(jsonCode.containsKey("pdfinits")&&!jsonCode.getString("pdfinits").equals(""))
                    lcodes.add(jsonCode.getString("pdfinits"));

                if(jsonCode.containsKey("loadinits")&&!jsonCode.getString("loadinits").equals(""))
                    lcodes.add(jsonCode.getString("loadinits"));

                if(jsonCode.containsKey("beforeupd")&&!jsonCode.getString("beforeupd").equals(""))
                    lcodes.add(jsonCode.getString("beforeupd"));

                if(jsonCode.containsKey("afterupd")&&!jsonCode.getString("afterupd").equals(""))
                    lcodes.add(jsonCode.getString("afterupd"));

                if(jsonCode.containsKey("afterdel")&&!jsonCode.getString("afterdel").equals(""))
                    lcodes.add(jsonCode.getString("afterdel"));

                if(jsonCode.containsKey("rights")&&!jsonCode.getString("rights").equals(""))
                {
                    JSONArray lrole = (JSONArray)jsonCode.get("rights");
                    for(int k=0;k<lrole.size();k++)
                    {
                        JSONObject mrole=(JSONObject)lrole.get(k);
                        if(mrole.containsKey("view"))
                        {
                            if(!mrole.get("view").toString().equals("")&&!mrole.get("view").toString().equals("undefined"))
                            {
                                lcodes.add(mrole.get("view").toString());
                            }
                        }
                        if(mrole.containsKey("upd"))
                        {
                            if(!mrole.get("upd").toString().equals("")&&!mrole.get("upd").toString().equals("undefined"))
                            {
                                lcodes.add(mrole.get("upd").toString());
                            }
                        }
                        if(mrole.containsKey("del"))
                        {
                            if(!mrole.get("del").toString().equals("")&&!mrole.get("del").toString().equals("undefined"))
                            {
                                lcodes.add(mrole.get("del").toString());
                            }
                        }
                    }
                }

                for(int j=0;j<lcodes.size();j++)
                {
                    String codeGuid = lcodes.get(j);
                    CodeGenRestController.delCodeDo(codeGuid, dService);
                }
            }
        }
        // Delete related code

        int rows = dService.delDataForms(viewCode, itemIDs,args);

        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data_fields");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data_form");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "role_dataview");

        return rows;
    }
    @RequestMapping("/api/dataformgetfield")
    public Map<String,Object> getDataField(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String fieldName=jsonObject.getString("fieldName");
        String comID=jsonObject.getString("comID");
        Integer dataID=Integer.valueOf(jsonObject.getString("dataID"));
        return dService.getDataFormField(true,fieldName,comID,dataID);
    }
    @RequestMapping("/api/dataformgetfieldlist")
    public List getDataFieldList(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String tblName=jsonObject.getString("tablename");
        String sql = "SELECT FIELD,FIELD_TITLE FROM data_fields where tablename=? and id in (select id from data_fields_com)";
        return dService.getDatasBySql(sql, new Object[]{tblName});
    }
    @RequestMapping("/api/dataformgetlist")
    public List getDataFromList(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String tblName=jsonObject.getString("tablename");
        String did=jsonObject.getString("did");
        String wid=jsonObject.getString("wid");

        String sql = "SELECT TABLENAME,LOCATION,APPTYPE FROM data_form where tablename=? order by formid";
        List reList =  dService.getDatasBySql(sql, new Object[]{tblName});
        if(reList.size()>1)
        {
            if(!WSoftUtil.dataNameChack(tblName))
            {
                return null;
            }
            if(wid!=null)
            {
                sql = "SELECT FORM AS LOCATION,'' as APPTYPE FROM "+ tblName +" where wfmworklistid = ?";
                reList =  dService.getDatasBySql(sql, new Object[]{wid});
            }
            else if(did!=null)
            {
                sql = "SELECT FORM AS LOCATION,'' as APPTYPE FROM "+ tblName +" where id = ?";
                reList =  dService.getDatasBySql(sql, new Object[]{did});
            }
        }
        return reList;
    }

    @RequestMapping("/api/dataformaddpage")
    public List addDataFormPage(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String dataID=jsonObject.getString("field_DATAID");
        String pageLocation=jsonObject.getString("field_LOCATION");
        String templateLocation=jsonObject.getString("templateLocation");
        
        List datalist = dService.addDatas(viewCode,jsonObject);

        Map<String,Object> mreturn = (Map)datalist.get(0);
        String msg = (String)mreturn.get("msg");
        if(msg.equalsIgnoreCase(""))
        {
            String templateContent = "";
            if(templateLocation!=null)
            {
                templateContent = WSoftUtil.readTemplateFile(templateLocation);
                WSoftUtil.saveTemplateFile("temp_" + pageLocation,templateContent);

                if(templateLocation.indexOf("temp_")==0)
                    templateContent = WSoftUtil.readTemplateFile(templateLocation.replaceAll("temp_", "pdf_"));
                else
                    templateContent = WSoftUtil.readTemplateFile("pdf.html");
                WSoftUtil.saveTemplateFile("pdf_" + pageLocation,templateContent);

                if(templateLocation.indexOf("temp_")==0)
                {
                    dService.dataFormCopyInit(dataID,pageLocation,templateLocation.substring(5));
                }
            }
        }

        return datalist;
    }

    @RequestMapping("/api/dataformdelpage")
    public int delDataFormPage(@RequestBody JSONObject jsonObject)  throws Throwable 
    {
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        int rows = dService.dataFormDelPage(viewCode, itemIDs);

        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data_form");
        WSoftUtil.dbUpdDataUpdTime(datalistDao, "data_fields");

        return rows;
    }

    @RequestMapping("/api/dataformimport")
    public Map<String,String> dataformImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String datafile=jsonObject.getString("datafile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!datafile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
            String configDirTemp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
            String configDirMan = configDir.replaceAll("/WEB-INF/classes", "/manage");

            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
            String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
            String strTarget = configDir + strTmpDir;
            File targetDir = new File(strTarget);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            datafile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + datafile;
            WSoftUtilZip.unzip(datafile,strTarget);

            String codeMsg="";
            codeMsg = WSoftUtil.codeImportDo(dService, strTarget, configDirCode);
            if(!codeMsg.equals(""))
            {
                msg = msg + codeMsg;
            }
            
            String strJsonContent = WSoftUtil.readFile(strTarget + "/data.txt");
            String strJsonContentForm = WSoftUtil.readFile(strTarget + "/dataform.txt");
            JSONArray jArr = JSON.parseArray(strJsonContent);
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
                        msg = msg + tblname +"Import failed: " + msgerr + "<br>";
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
                        msg = msg + tblname +"Import failed: " + msgerr + "<br>";
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
                            msg = msg + location  +"Import failed: " + msgerr + "<br>";
                        }
                    }
                    else
                    {
                        List ltmp = dService.addDatas("data_form", jPara);
                        Map<String,Object> mtmp = (Map)ltmp.get(0);
                        msgerr = (String)mtmp.get("msg");
                        if(!msgerr.equals(""))
                        {
                            msg = msg + location +"Import failed: " + msgerr + "<br>";
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

            //Process frontend scripts
            CodeGenRestController.saveFrontFuncs(dService);
            
            WSoftUtil.fileUploadCopy(strTarget);
        }

        mp.put("msg",msg);
        return mp;
    }

    @RequestMapping("/api/dataformexport")
    public ResponseEntity<Resource> dataformExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from data where dataid in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
        String configDirTemp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
        String configDirMan = configDir.replaceAll("/WEB-INF/classes", "/manage");

        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);

        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();
        String codelist = "";
        String tblnames = "";

        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            String strCodes = "";
            String pageLocation = "";

            tblnames = tblnames + "'" + WSoftUtil.replaceDBPara(mp.get("tablename").toString()) + "',";

            if(mp.get("codes")!=null)
                strCodes = mp.get("codes").toString();

            if(strCodes!=null&&!strCodes.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strCodes);
                List<String> lcodes = new ArrayList<>();
                if(jsonCode.containsKey("views")&&!jsonCode.getString("views").equals(""))
                    lcodes.add(jsonCode.getString("views"));

                if(jsonCode.containsKey("updview")&&!jsonCode.getString("updview").equals(""))
                    lcodes.add(jsonCode.getString("updview"));

                if(jsonCode.containsKey("inits")&&!jsonCode.getString("inits").equals(""))
                    lcodes.add(jsonCode.getString("inits"));

                if(jsonCode.containsKey("beforeupd")&&!jsonCode.getString("beforeupd").equals(""))
                    lcodes.add(jsonCode.getString("beforeupd"));

                if(jsonCode.containsKey("afterupd")&&!jsonCode.getString("afterupd").equals(""))
                    lcodes.add(jsonCode.getString("afterupd"));

                if(jsonCode.containsKey("afterdel")&&!jsonCode.getString("afterdel").equals(""))
                    lcodes.add(jsonCode.getString("afterdel"));

                if(jsonCode.containsKey("pdfinits")&&!jsonCode.getString("pdfinits").equals(""))
                    lcodes.add(jsonCode.getString("pdfinits"));

                if(jsonCode.containsKey("loadinits")&&!jsonCode.getString("loadinits").equals(""))
                    lcodes.add(jsonCode.getString("loadinits"));

                if(jsonCode.containsKey("rights")&&!jsonCode.getString("rights").equals(""))
                {
                    JSONArray lrole = (JSONArray)jsonCode.get("rights");
                    for(int k=0;k<lrole.size();k++)
                    {
                        JSONObject mrole=(JSONObject)lrole.get(k);
                        if(mrole.containsKey("view"))
                        {
                            if(!mrole.get("view").toString().equals("")&&!mrole.get("view").toString().equals("undefined"))
                            {
                                lcodes.add(mrole.get("view").toString());
                            }
                        }
                        if(mrole.containsKey("upd"))
                        {
                            if(!mrole.get("upd").toString().equals("")&&!mrole.get("upd").toString().equals("undefined"))
                            {
                                lcodes.add(mrole.get("upd").toString());
                            }
                        }
                        if(mrole.containsKey("del"))
                        {
                            if(!mrole.get("del").toString().equals("")&&!mrole.get("del").toString().equals("undefined"))
                            {
                                lcodes.add(mrole.get("del").toString());
                            }
                        }
                    }
                }

                for(int j=0;j<lcodes.size();j++)
                {
                    sql = "select * from code where guid=?";
                    List dcode = dService.getDatasBySql(sql, new Object[]{lcodes.get(j)});
                    Map<String,Object> mcode=(Map)dcode.get(0);
                    codelist = codelist + "'" + WSoftUtil.replaceDBPara(mcode.get("guid").toString()) + "',";

                }
            }

        }

        if(!codelist.equals(""))
        {
            WSoftUtil.codeExportDo(dService, lfiles, codelist, configDir, strTmpDir, configDirCode);
        }

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/data.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/data.txt");

        tblnames = WSoftUtil.strDelLastComma(tblnames);
        sql = "select * from data_form where tablename in ("+ tblnames +") ";
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

        String strZipName="data.zip";
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
