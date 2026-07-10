package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import org.springframework.util.ResourceUtils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.file.Paths;
import java.io.IOException;

import com.alibaba.fastjson.*;

@RestController
public class WfmRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private WfmService wService;

    @RequestMapping("/api/wfmsave")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        if(jsonObject.containsKey("field_WFMDATA"))
        {
            JSONObject jPara = new JSONObject();
            List data = dService.getDataItem(viewCode,itemIDs,jPara,false);
            List dataItem = (List)data.get(0);
            Map<String,Object> mItem = (Map)dataItem.get(0);
            
            String wfmdatafile="";
            String wfmrulefile="";
            if(mItem.get("WFMDATA")!=null)
            {
                wfmdatafile = mItem.get("WFMDATA").toString();
            }
            else
            {
                wfmdatafile = WSoftUtil.genGuid(null) + "_data.txt";
            }
            wfmrulefile = wfmdatafile.replaceAll("_data.txt", "_rule.txt");

            String wfmData = jsonObject.getString("field_WFMDATA");
            String wfmRule = jsonObject.getString("field_WFMRULE");

            WSoftUtil.saveWfmFile(wfmdatafile, wfmData);
            WSoftUtil.saveWfmFile(wfmrulefile, wfmRule);

            jsonObject.put("field_WFMDATA",wfmdatafile);
            jsonObject.put("field_WFMRULE",wfmrulefile);

        }
        List datalist = dService.updDatas(viewCode, itemIDs,jsonObject);
        return datalist;
    }

    @RequestMapping("/api/wfmget")
    public List getDataItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        JSONObject jPara = new JSONObject();
        List datalist = dService.getDataItem(viewCode,itemIDs,jPara,false);
        List dataItem = (List)datalist.get(0);
        Map<String,String> mp=(Map)dataItem.get(0);
        String wfmdatafile = mp.get("WFMDATA");
        String wfmrulefile = mp.get("WFMRULE");
        if(wfmdatafile!=null)
        {
            String wfmdata = WSoftUtil.readWfmFile(wfmdatafile);
            String wfmrule = WSoftUtil.readWfmFile(wfmrulefile);
            mp.put("WFMDATA",wfmdata);
            mp.put("WFMRULE",wfmrule);
        }
        return datalist;
    }

    @RequestMapping("/api/wfmdel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        Object[] args = new Object[1];

        String strWfmDatasFile = "";
        String strWfmRulesFile = "";

        // Delete related code
        String sql = "select * from wfm where  wfmid=?";
        List datalist = dService.getDatasBySql(sql, new Object[]{itemIDs});
        if(datalist.size()>0)
        {
            Map<String,Object> mp=(Map)datalist.get(0);
            String strWfmDatas="";
            String strWfmRules="";
            List<String> lcodes = new ArrayList<>();

            if(mp.get("wfmdata")!=null)
            {
                strWfmDatasFile = mp.get("wfmdata").toString();
                strWfmDatas = WSoftUtil.readWfmFile(strWfmDatasFile);
            }
            
            if(mp.get("wfmrule")!=null)
            {
                strWfmRulesFile = mp.get("wfmrule").toString();
                strWfmRules = WSoftUtil.readWfmFile(strWfmRulesFile);
            }

            if(strWfmDatas!=null&&!strWfmDatas.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strWfmDatas);
                JSONArray jArr = (JSONArray)jsonCode.get("nodes");
                for(int j=0;j<jArr.size();j++)
                {
                    JSONObject job = jArr.getJSONObject(j);
                    String guids = "";
                    if(job.containsKey("startdo")&&!job.getString("startdo").equals(""))
                        guids = guids + "'" + job.getString("startdo") + "',";
                    if(job.containsKey("enddo")&&!job.getString("enddo").equals(""))
                        guids = guids + "'" + job.getString("enddo") + "',";
                    if(job.containsKey("selpsn")&&!job.getString("selpsn").equals(""))
                        guids = guids + "'" + job.getString("selpsn") + "',";

                    guids = WSoftUtil.strDelLastComma(guids);
                    if(!guids.equals(""))
                    {
                        sql = "select * from code where guid in ("+ guids +") ";
                        List dcode = dService.getDatasBySql(sql, new Object[]{});
                        for(int k=0;k<dcode.size();k++)
                        {
                            Map<String,Object> mcode=(Map)dcode.get(k);
                            lcodes.add(mcode.get("guid").toString());
                        }
                    }
                }
            }

            if(strWfmRules!=null&&!strWfmRules.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strWfmRules);
                JSONArray jArr = (JSONArray)jsonCode.get("rules");
                for(int j=0;j<jArr.size();j++)
                {
                    JSONObject job = jArr.getJSONObject(j);
                    if(!job.getString("rule_code").equals(""))
                    {
                        lcodes.add(job.getString("rule_code"));
                    }
                }
            }

            for(int j=0;j<lcodes.size();j++)
            {
                String codeGuid = lcodes.get(j);
                CodeGenRestController.delCodeDo(codeGuid, dService);
            }

        }

        int rows = wService.delDatas(viewCode, itemIDs,args);

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/wfms");
        WSoftUtil.delFile(configDir+strWfmRulesFile);
        WSoftUtil.delFile(configDir+strWfmDatasFile);
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("wfmDir") + "/"+ strWfmRulesFile);
        WSoftUtil.delFile(WSoftUtil.propertyGetPara("wfmDir") + "/"+ strWfmDatasFile);
        
        return rows;
    }

    
    @RequestMapping("/api/wfmimport")
    public Map<String,String> codeImport(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String datafile=jsonObject.getString("datafile");
        Map<String,String> mp = new HashMap<>();
        String msg = "";
        if(!datafile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
            String configDirWfm = configDir.replaceAll("/WEB-INF/classes", "/admin/wfms");

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
            
            String strJsonContent = WSoftUtil.readFile(strTarget + "/wfm.txt");
            JSONArray jArr = JSON.parseArray(strJsonContent);
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
                        msg = msg + wfmname +"Import failed: " + msgerr + "<br>";
                    }
                }
                else
                {
                    List ltmp = dService.addDatas("wfm", jPara);
                    Map<String,Object> mtmp = (Map)ltmp.get(0);
                    msgerr = (String)mtmp.get("msg");
                    if(!msgerr.equals(""))
                    {
                        msg = msg + wfmname +"Import failed: " + msgerr + "<br>";
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
        }

        mp.put("msg",msg);
        return mp;

    }

    @RequestMapping("/api/wfmexport")
    public ResponseEntity<Resource> pageExport(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String itemIDs=jsonObject.getString("itemIDs");
        String sql = "select * from wfm where wfmid in ("+ WSoftUtil.dbSqlDealInStr(itemIDs) +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        String configDirCode = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");
        String configDirWfm = configDir.replaceAll("/WEB-INF/classes", "/admin/wfms");

        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/updfiles");
        String strTmpDir = "tmp/"+WSoftUtil.genGuid(null);

        new File(configDir + strTmpDir).mkdirs();

        List<String> lfiles = new ArrayList<>();
        String codelist = "";
        String guids = "";

        for(int i=0;i<datalist.size();i++)
        {
            Map<String,Object> mp=(Map)datalist.get(i);
            String strWfmDatasFile = "";
            String strWfmRulesFile = "";
            String strWfmDatas="";
            String strWfmRules="";

            if(mp.get("wfmdata")!=null)
            {
                strWfmDatasFile = mp.get("wfmdata").toString();
                strWfmDatas = WSoftUtil.readWfmFile(strWfmDatasFile);
            }
            
            if(mp.get("wfmrule")!=null)
            {
                strWfmRulesFile = mp.get("wfmrule").toString();
                strWfmRules = WSoftUtil.readWfmFile(strWfmRulesFile);
            }

            if(strWfmDatas!=null&&!strWfmDatas.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strWfmDatas);
                JSONArray jArr = (JSONArray)jsonCode.get("nodes");
                for(int j=0;j<jArr.size();j++)
                {
                    JSONObject job = jArr.getJSONObject(j);
                    if(job.containsKey("startdo")&&!job.getString("startdo").equals(""))
                        guids = guids + "'" + job.getString("startdo") + "',";
                    if(job.containsKey("enddo")&&!job.getString("enddo").equals(""))
                        guids = guids + "'" + job.getString("enddo") + "',";
                    if(job.containsKey("selpsn")&&!job.getString("selpsn").equals(""))
                        guids = guids + "'" + job.getString("selpsn") + "',";
                }

                if(jsonCode.containsKey("returndo")&&!jsonCode.getString("returndo").equals(""))
                    guids = guids + "'" + jsonCode.getString("returndo") + "',";
                if(jsonCode.containsKey("initdo")&&!jsonCode.getString("initdo").equals(""))
                    guids = guids + "'" + jsonCode.getString("initdo") + "',";
            }

            if(strWfmRules!=null&&!strWfmRules.equals(""))
            {
                JSONObject jsonCode = (JSONObject)JSONObject.parse(strWfmRules);
                JSONArray jArr = (JSONArray)jsonCode.get("rules");
                for(int j=0;j<jArr.size();j++)
                {
                    JSONObject job = jArr.getJSONObject(j);
                    if(job.containsKey("rule_code")&&!job.getString("rule_code").equals(""))
                        guids = guids + "'" + job.getString("rule_code") + "',";
                }
            }
            lfiles.add(configDirWfm + strWfmDatasFile);
            lfiles.add(configDirWfm + strWfmRulesFile);
        }

        guids = WSoftUtil.strDelLastComma(guids);
        if(!guids.equals(""))
        {
            sql = "select * from code where guid in ("+ guids +") ";
            List dcode = dService.getDatasBySql(sql, new Object[]{});
            for(int k=0;k<dcode.size();k++)
            {
                Map<String,Object> mcode=(Map)dcode.get(k);
                codelist = codelist + "'" + WSoftUtil.replaceDBPara(mcode.get("guid").toString()) + "',";
            }
        }

        if(!codelist.equals(""))
        {
            WSoftUtil.codeExportDo(dService, lfiles, codelist, configDir, strTmpDir, configDirCode);
        }

        String strJSONContent = JSON.toJSONString(datalist);
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/wfm.txt"),false),"utf-8"));
        bw.write(strJSONContent);
        bw.flush();
        bw.close();

        lfiles.add(configDir + strTmpDir + "/wfm.txt");

        String strZipName="wfm.zip";
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

    public String submitWfmDiy(String viewCode, String itemID,String wfmGuid,String obj)  throws Throwable 
    {
        JSONObject jsonParam = JSONObject.parseObject(obj);
        HashMap<String,String> mwfm = wService.submitDatas(viewCode, itemID, wfmGuid, jsonParam);
        if(mwfm.containsKey("msg"))
        {
            return mwfm.get("msg").toString();
        }
        return "";
    }

}
