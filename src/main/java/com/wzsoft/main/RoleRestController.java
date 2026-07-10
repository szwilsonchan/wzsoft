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
public class RoleRestController {
    
    @Autowired
    private RoleService rService;

    @Autowired
    private DatalistService dService;

    @RequestMapping("/api/dataroleupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        List datalist = rService.updDatas(viewCode, itemIDs,jsonObject);
        return datalist;
    }
    @RequestMapping("/api/dataroleadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        List datalist = rService.addDatas(viewCode, itemIDs,jsonObject);

        return datalist;
    }
    @RequestMapping("/api/dataroledel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        Object[] args = new Object[1];

        int rows = rService.delDatas(viewCode, itemIDs,args);
        return rows;
    }

    
    @RequestMapping("/api/roleimport")
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

            String strJsonContentCode = WSoftUtil.readFile(strTarget + "/role.txt");
            if(!strJsonContentCode.equals(""))
            {
                JSONArray jArrCode = JSON.parseArray(strJsonContentCode);
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
                            msg = msg + roleid +"Import failed: " + msgerr + "<br>";
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
                            msg = msg + roleid +"Import failed: " + msgerr + "<br>";
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

        }

        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/roleexport")
    public ResponseEntity<Resource> appExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from role where id in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);

        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();
        String roleids = "";

        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            roleids = roleids + "'" + mp.get("roleid").toString() + "',";
        }

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/role.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/role.txt");

        roleids = WSoftUtil.strDelLastComma(roleids);
        sql = "select * from role_app where roleid in ("+ roleids +") ";
        List applist = dService.getDatasBySql(sql, new Object[]{});

        String strJSONContentApp = JSON.toJSONString(applist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/roleapp.txt"),false),"utf-8"));
        bw.write(strJSONContentApp);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/roleapp.txt");

        sql = "select * from role_dataview where roleid in ("+ roleids +") ";
        List dvlist = dService.getDatasBySql(sql, new Object[]{});

        String strJSONContentDv = JSON.toJSONString(dvlist);
        bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/roledataview.txt"),false),"utf-8"));
        bw.write(strJSONContentDv);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/roledataview.txt");

        String strZipName="role.zip";
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



