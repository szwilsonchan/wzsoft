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

import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.alibaba.fastjson.*;


@RestController
public class PortalDatalistRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private WfmService wService;

    @Autowired
    private FileContentService fService;

    @Autowired
    private RedisCache redisCache;

    @RequestMapping("/portal/api/datagenpdf")
    public ResponseEntity<Resource> dataGenPDF(@RequestBody JSONObject jsonObject, HttpServletRequest request) throws Throwable {
    
        String viewCode=jsonObject.getString("viewCode");
        if(jsonObject.containsKey("formLocation"))
        {
            if(!checkFormPub(viewCode,jsonObject.getString("formLocation")))
            {
                return null;
            }
        }
        else
        {
            return null;
        }

        String itemIDs="";
        if(jsonObject.containsKey("dguid"))
        {
            itemIDs= checkFormPubItemID(viewCode,jsonObject.getString("dguid"));
        }
        else
        {
            return null;
        }

        jsonObject.put("FORMPUB", true);

        return DatalistRestController.dataGenPDFDo(viewCode,itemIDs,dService,redisCache,fService,jsonObject,request);

    }

    @RequestMapping("/portal/api/datalist")
    public List getDatalist(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        if(!checkRights(viewCode,jsonObject))
        {
            return null;
        }
        int curPage = Integer.parseInt(jsonObject.getString("curPage"));
        int pageItmes = Integer.parseInt(jsonObject.getString("pageItmes"));

        try
        {
            List datalist = dService.getDatas(viewCode, curPage,pageItmes,jsonObject);
            return datalist;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    @RequestMapping("/portal/api/datalistExcel")
    public ResponseEntity<Resource> getDatalistExcel(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String lan=jsonObject.getString("lan");
        if(!checkRights(viewCode,null))
        {
            return null;
        }
        
        int curPage = Integer.parseInt(jsonObject.getString("curPage"));
        int pageItmes = Integer.parseInt(jsonObject.getString("pageItmes"));

        try
        {
            List datalist = dService.getDatas(viewCode, curPage,pageItmes,jsonObject);
            
            String strCsvName = WSoftUtil.genGuid(null) + ".csv";
            String strCsv = WSoftUtil.propertyGetPara("datafilesDir") + "/" + strCsvName;

            WSoftUtil.csvCreateFile((List<Map<String,Object>>)datalist.get(1), (List<Map<String,Object>>)datalist.get(0),strCsv,lan);

            Resource resource = new UrlResource(Paths.get(strCsv).toUri());
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
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + strCsvName + "\"")
                    .body(resource);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    @RequestMapping("/portal/api/datasubmit")
    public HashMap<String,String> submitDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        if(jsonObject.containsKey("formLocation"))
        {
            if(!checkFormPub(viewCode,jsonObject.getString("formLocation")))
            {
                return null;
            }
        }
        else
        {
            return null;
        }

        String itemIDs="";
        if(jsonObject.containsKey("dguid"))
        {
            itemIDs= checkFormPubItemID(viewCode,jsonObject.getString("dguid"));
        }
        else
        {
            return null;
        }

        jsonObject.put("FORMPUB", true);
        jsonObject.put("psnid",-1);
        jsonObject.put("deptid",-1);
        jsonObject.put("orgid",-1);

        String wfmGuid= "";
        if(jsonObject.containsKey("wfmGuid"))
        {
            wfmGuid = jsonObject.getString("wfmGuid");
        }
        
        try
        {
            return wService.submitDatas(viewCode, itemIDs,wfmGuid,jsonObject);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    @RequestMapping("/portal/api/dataadd")
    public List addDatas(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        if(jsonObject.containsKey("formLocation"))
        {
            if(!checkFormPub(viewCode,jsonObject.getString("formLocation")))
            {
                return null;
            }
        }
        else
        {
            return null;
        }

        jsonObject.put("FORMPUB", true);

        String chkMsg = "";
        chkMsg = DatalistRestController.checkCpachaMobile(dService,jsonObject,viewCode,request,true);
        if(!chkMsg.equals(""))
        {
            List<Map<String,Object>> lreturn = new ArrayList<>();
            Map<String,Object> mreturn = new HashMap<String,Object>();
            mreturn.put("pid",0);
            mreturn.put("msg",chkMsg);
            mreturn.put("reguid","");
            lreturn.add(mreturn);
            return lreturn;
        }

        try
        {
            List datalist = dService.addDatas(viewCode, jsonObject);

            Map<String,Object> mreturn = (Map<String,Object>)datalist.get(0);
            int pid =  (int)mreturn.get("pid");
            if(pid>0)
            {
                request.getSession().setAttribute("formCpacha", null);
            }
            
            return datalist;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    @RequestMapping("/portal/api/dataget")
    public List getDataItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        if(jsonObject.containsKey("formLocation"))
        {
            if(!checkFormPub(viewCode,jsonObject.getString("formLocation")))
            {
                return null;
            }
        }
        else
        {
            return null;
        }

        String itemIDs="";
        if(jsonObject.containsKey("dguid"))
        {
            itemIDs= checkFormPubItemID(viewCode,jsonObject.getString("dguid"));
        }
        else
        {
            return null;
        }

        jsonObject.put("FORMPUB", true);

        try
        {
            List datalist = dService.getDataItem(viewCode,itemIDs,jsonObject,false);
            return datalist;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    @RequestMapping("/portal/api/dataupd")
    public List updDatas(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        if(jsonObject.containsKey("formLocation"))
        {
            if(!checkFormPub(viewCode,jsonObject.getString("formLocation")))
            {
                return null;
            }
        }
        else
        {
            return null;
        }

        String itemIDs="";
        if(jsonObject.containsKey("dguid"))
        {
            itemIDs= checkFormPubItemID(viewCode,jsonObject.getString("dguid"));
        }
        else
        {
            return null;
        }

        jsonObject.put("FORMPUB", true);

        String chkMsg = "";
        chkMsg = DatalistRestController.checkCpachaMobile(dService,jsonObject,viewCode,request,false);
        if(!chkMsg.equals(""))
        {
            List<Map<String,Object>> lreturn = new ArrayList<>();
            Map<String,Object> mreturn = new HashMap<String,Object>();
            mreturn.put("rows",0);
            mreturn.put("msg",chkMsg);
            lreturn.add(mreturn);
            return lreturn;
        }

        try
        {
            List datalist = dService.updDatas(viewCode, itemIDs,jsonObject);
            return datalist;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }

    }

    @RequestMapping("/portal/api/datainit")
    public Map<String,Object> initDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="";
        String pageID="";

        if(jsonObject.containsKey("viewCode"))
        {
            viewCode = jsonObject.getString("viewCode");
            if(jsonObject.containsKey("formLocation"))
            {
                if(!checkFormPub(viewCode,jsonObject.getString("formLocation")))
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }

        if(jsonObject.containsKey("pageID"))
        {
            pageID = jsonObject.getString("pageID");
            if(!checkPages(pageID))
            {
                return null;
            }
        }

        try
        {
            Map<String,Object> mr = dService.initDatas(viewCode, pageID,jsonObject);
            return mr;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    private boolean checkFormPub(String viewCode,String formLocation) throws Throwable
    {
        if(formLocation.toLowerCase().indexOf("form_")!=0)
        {
            return false;
        }
        String fl = formLocation.substring(5)+ ".html";
        String sql="select * from data_form where tablename=? and location=? and ispub='1'";
        List dList = dService.getDatasBySql(sql, new Object[]{viewCode,fl});
        if(dList.size()>0)
        {
            return true;
        }
        return false;
    }

    private boolean checkRights(String viewCode,JSONObject jsonObject) throws Throwable
    {

        if(viewCode.equals(""))
        {
            return false;
        }
        
        Map<String,Object> mview = dService.getDataConfigMap(viewCode);
        String strPubrights = (String)mview.get("pubrights");
        String strIsPub = (String)mview.get("ispub");
        if(strPubrights==null||strPubrights.equals("0"))
        {
            return false;
        }
        else
        {
            if(strIsPub==null||strIsPub.equals("0"))
                return false;
            else
                return true;
        }

    }

    private boolean checkPages(String location) throws Throwable
    {
        String sql="select * from page where pagetype='2' and location=?";
        List dList = dService.getDatasBySql(sql, new Object[]{location});
        if(dList.size()==0)
        {
            return false;
        }
        return true;

    }

    private String checkFormPubItemID(String viewCode,String dguid) throws Throwable
    {
        Map<String,Object> mview=dService.getDataConfigMap(viewCode);
        String sql="select ID from " + mview.get("TABLENAME").toString() + " where dguid=?";
        List dList = dService.getDatasBySql(sql, new Object[]{dguid});
        if(dList.size()>0)
        {
            Map<String,Object> mp = (Map<String,Object>)dList.get(0);
            return String.valueOf(mp.get("ID"));
        }
        return "";

    }

}
