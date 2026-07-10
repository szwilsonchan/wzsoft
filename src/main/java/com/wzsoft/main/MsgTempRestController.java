package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ResourceUtils;

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
import java.util.List;

import com.alibaba.fastjson.*;

@RestController
public class MsgTempRestController {

    @Autowired
    private DatalistService dService;

    @Autowired
    private MsgTempService mService;

    @RequestMapping("/api/msgtempget")
    public List msgtempget(@RequestBody JSONObject jsonObject)  throws Throwable  {
        
        String itemID = jsonObject.getString("itemIDs");
        List datalist = mService.getDataItem(itemID,jsonObject);
        return datalist;
    }

    @RequestMapping("/api/msgtempimport")
    public Map<String,String> msgtempImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String msgFile=jsonObject.getString("msgfile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!msgFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
            String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
            String strTarget = configDir + strTmpDir;
            File targetDir = new File(strTarget);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            msgFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + msgFile;
            WSoftUtilZip.unzip(msgFile,strTarget);
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
                        msg = msg + msgName+"Import failed: " + msgerr + "<br>";
                    }
                }
                else
                {
                    List ltmp = dService.addDatas("msg_template", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg + msgName+"Import failed: " + msgerr + "<br>";
                    }
                }
            }
        }
        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/msgtempexport")
    public ResponseEntity<Resource> msgtempExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from msg_template where tempid in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);
        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/msgtemp.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/msgtemp.txt");

        String strZipName="msgtemp.zip";
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