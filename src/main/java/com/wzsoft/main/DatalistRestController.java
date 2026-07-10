package com.wzsoft.main;

import org.apache.http.util.EntityUtils;
import org.openjdk.nashorn.api.scripting.ScriptObjectMirror;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import javax.script.Bindings;
import javax.script.Compilable;
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.servlet.http.HttpServletRequest;
import com.alibaba.fastjson.*;
import com.lowagie.text.pdf.BaseFont;

import org.xhtmlrenderer.pdf.ITextFontResolver;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.*;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;

@RestController
public class DatalistRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private WfmService wService;

    @Autowired
    private FileContentService fService;

    @Autowired
    private RedisCache redisCache;

    private static String genPdfContent(String templateContent,Map<String,Object> mp,String title)
    {
        Set<String> mpset = mp.keySet();
        for (String key : mpset) 
        {
            Integer findex = templateContent.indexOf("<div>forstart[@"+ title + key.toUpperCase() +"@]</div>");
            Integer findexsub = templateContent.indexOf("<tr title=\"forstart[@"+ title + key.toUpperCase() +"@]\">");
            if(findex>0)
            {
                Integer eindex = templateContent.indexOf("<div>forend[@"+ title + key.toUpperCase() +"@]</div>");
                if(eindex>0)
                {
                    String templateContent1 = templateContent.substring(0,findex);
                    String templateContent2 = templateContent.substring(eindex + 21 + title.length() + key.length());
                    String forContent = templateContent.substring(findex + 23 + title.length()+ key.length(), eindex);
                    String forContentAll = "";
                    Object paraObj=null;
                    String paraValue = "";
                    paraObj = mp.get(key);
                    if(paraObj!=null)
                    {
                        paraValue = paraObj.toString(); 
                    }

                    JSONArray jfor = (JSONArray)JSON.parse(paraValue);
                    for(int i=0;i<jfor.size();i++)
                    {
                        String forContentItem=forContent;
                        Map<String,Object> mfor=(Map)jfor.get(i);
                        forContentItem = genPdfContent(forContentItem,mfor,title +key.toUpperCase()+"-");
                        forContentAll = forContentAll + forContentItem;
                    }
                    templateContent = templateContent1 + forContentAll + templateContent2;
                }
            }
            else if(findexsub>0)
            {
                Integer eindex = templateContent.indexOf("</tr>",findexsub);
                if(eindex>0)
                {
                    String templateContent1 = templateContent.substring(0,findexsub);
                    String templateContent2 = templateContent.substring(eindex + 5);
                    String forContent = templateContent.substring(findexsub, eindex+5);
                    String forContentAll = "";
                    String paraValue = "";
                    if(mp.get(key)!=null)
                        paraValue = mp.get(key).toString();

                    JSONArray jfor = null;
                    if(paraValue.indexOf("{\"DATAS\":")==0)
                    {
                        JSONObject jObj = (JSONObject)JSON.parse(paraValue);
                        if(jObj.containsKey("DATAS")) //Is table control data
                        {
                            jfor = (JSONArray)jObj.get("DATAS");
                        }
                    }
                    else
                    {
                        jfor = (JSONArray)JSON.parse(paraValue);
                    }

                    for(int i=0;i<jfor.size();i++)
                    {
                        String forContentItem=forContent;
                        Map<String,Object> mfor=(Map)jfor.get(i);
                        forContentItem = genPdfContent(forContentItem,mfor,title +key.toUpperCase()+"-");
                        forContentAll = forContentAll + forContentItem;
                    }

                    templateContent = templateContent1 + forContentAll + templateContent2;
                }
            }
            else
            {
                Integer imgindex = templateContent.indexOf("src=\"[@"+ title + key.toUpperCase() +"@]\"");
                Object paraObj=null;
                String paraValue = "";
                paraObj = mp.get(key);
                if(paraObj!=null)
                {
                    paraValue = paraObj.toString();
                    if((paraObj.getClass().getName().equals("java.lang.Double")||paraObj.getClass().getName().equals("java.math.BigDecimal"))&&paraObj.toString().endsWith(".0"))
                    {
                        paraValue=paraValue.substring(0,paraValue.length()-2);
                    }

                    paraValue = WSoftUtil.replaceHtmlTag(paraValue);
                    if(paraValue.indexOf("\"fileType\":\"application/pdf\"")>0)
                    {
                        JSONObject jObj = (JSONObject)JSON.parse(paraValue);
                        paraValue = jObj.getString("filePath");
                    }
                    if(imgindex>0)
                    {
                        paraValue="file:///"+WSoftUtil.propertyGetPara("datafilesDir")+"/"+paraValue;
                    }
                }
                else
                {
                    paraValue="";
                }
                templateContent = templateContent.replaceAll("\\[@"+ title + key.toUpperCase() +"@\\]", Matcher.quoteReplacement(paraValue));
            }
        }
        return templateContent;
    }
    private static void genPdfDealFile(List<Map<String,String>> lcontent,String templateContent)
    {

        Map<String,String> mp = new HashMap<>();
        Integer findex = templateContent.indexOf("<div><div class=\"pdf\">");
        if(findex<0)
        {
            if(!templateContent.equals("<div id=\"\" class=\"pdfpage\" ></div>"))
            {
                mp.put("html",templateContent);
                lcontent.add(mp);
            }
            return;
        }
        String strContent = templateContent.substring(0,findex).trim();
        if(!strContent.equals("<div id=\"\" class=\"pdfpage\" >"))
        {
            strContent = strContent + "</div>";
            mp.put("html",strContent);
            lcontent.add(mp);
        }

        templateContent = templateContent.substring(findex+1);
        findex = templateContent.indexOf("</div></div>");
        String strPdf = templateContent.substring(21,findex);
        mp = new HashMap<>();
        mp.put("pdf",strPdf);
        lcontent.add(mp);

        templateContent = templateContent.substring(findex+12).trim();
        templateContent="<div id=\"\" class=\"pdfpage\" >"+templateContent;
        genPdfDealFile(lcontent,templateContent);

    }

    private static String genPdfDo(String pdfname,String templateContent)  throws Throwable 
    {
        String strHtml = "pdf/"+ pdfname + ".html";
        String strPdfName = pdfname + ".pdf";
        String strPdf = WSoftUtil.propertyGetPara("pdffilesDir")+ "/" + strPdfName;
        String chineseFontPath = WSoftUtil.propertyGetPara("pdffilesDir")+ "/simsun.ttc,0";
        String chineseFontPathB = WSoftUtil.propertyGetPara("pdffilesDir")+ "/simsunb.ttf";

        String strHead = "<!DOCTYPE html><html lang=\"en\"><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/><title>PDF</title><style type=\"text/css\">body {font-family: SimSun;}@page{size:a4}.pdfpage {width: 21cm;padding: 0cm;margin: 0cm auto;}</style></head><body>";
        String strFoot = "</body></html>";
        templateContent = strHead + templateContent + strFoot;
        WSoftUtil.saveWebFile(strHtml, templateContent);

        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/manage");
        
        strHtml = configDir + "/" + strHtml;
        OutputStream os = null;
        try {
            String url = new File(strHtml).toURI().toURL().toString();
            os = new FileOutputStream(strPdf);
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocument(url);
            ITextFontResolver fontResolver = renderer.getFontResolver();
            fontResolver.addFont(chineseFontPath, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
            fontResolver.addFont(chineseFontPathB, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);

            renderer.layout();
            renderer.createPDF(os);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (com.lowagie.text.DocumentException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if(os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return strPdf;
    }

    @RequestMapping("/api/datagenpdf")
    public ResponseEntity<Resource> dataGenPDF(@RequestBody JSONObject jsonObject, HttpServletRequest request) throws Throwable {
    
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        Boolean blnChkWfm = false;
        blnChkWfm = chkWfmDataRights(jsonObject,viewCode,"");

        if(!blnChkWfm)
        {
            if(!checkRights(viewCode,null,false))
            {
                return null;
            }
        }

        jsonObject.put("FORMPUB", false);

        return dataGenPDFDo(viewCode,itemIDs,dService,redisCache,fService,jsonObject,request);

    }

    public static ResponseEntity<Resource> dataGenPDFDo(String viewCode,String itemIDs,DatalistService dService,RedisCache redisCache,FileContentService fService,JSONObject jsonObject, HttpServletRequest request) throws Throwable {
        
        List datalist = dService.getDataItem(viewCode,itemIDs,jsonObject,false);
        List<Map<String,Object>> dataItem = (List)datalist.get(0);
        Map<String,Object> mp = (Map)dataItem.get(0);

        Map<String,Object> mview = dService.getDataConfigMap(viewCode);
        String strCodes = (String)mview.get("codes");
        String msg =codePdfinit(dService,redisCache,mp,itemIDs,strCodes,"pdfinits");
        if(msg!=null&&!msg.equals(""))
        {
            msg = "error:" + msg;
            Resource resource = new ByteArrayResource(msg.getBytes()) {
                @Override
                public String getFilename() {
                    return "error.txt";
                }
            };
            return ResponseEntity.ok().body(resource);
        }

        String formLocation = mp.get("FORM").toString();
        formLocation = "genpdf_"+formLocation.substring(5);
        String pdfname=viewCode+ "$"+ itemIDs;
        String strPdfName = pdfname + ".pdf";

        String fileGuid = "";
        Date day=new Date();
        SimpleDateFormat sdf= new SimpleDateFormat("yyyyMMdd");
        String curDate = sdf.format(day);
        String curDateDir = WSoftUtil.propertyGetPara("pdffilesDir") + "/" + curDate;
        new File(curDateDir).mkdirs();
        
        String pdfpath = curDate + "/" + pdfname + ".pdf";
        fileGuid = dataGenPDFDoSub(mp,pdfname,pdfpath,formLocation,dService,redisCache,fService);

        jsonObject.put("field_pdffile", fileGuid);
        if(WSoftUtil.dataNameChack(viewCode))
        {
            String sqlUpd="update " + viewCode + " set pdffile=? where id=?";
            dService.updDatasBySql(sqlUpd, new Object[]{fileGuid,itemIDs});
        }

        String strPdf = WSoftUtil.propertyGetPara("pdffilesDir") + "/" + pdfpath;
        Resource resource = new UrlResource(Paths.get(strPdf).toUri());
        String contentType = "application/pdf";

        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + strPdfName + "\"")
                .body(resource);
    }

    public static String dataGenPDFDoSub(Map<String,Object> mp,String pdfname,String pdfpath,String formLocation,DatalistService dService,RedisCache redisCache,FileContentService fService) throws Throwable {
        
        String templateContent = "";
        String tempHeader="";
        templateContent = WSoftUtil.readWebFile(formLocation);
        Integer headerSIndex = templateContent.indexOf("<pdfheader>");
        if(headerSIndex>=0)
        {   
            Integer headerEIndex = templateContent.indexOf("</pdfheader>");
            tempHeader = templateContent.substring(headerSIndex+11,headerEIndex);
            templateContent = templateContent.substring(headerEIndex+12);
        }

        templateContent = genPdfContent(templateContent,mp,"");

        List<Map<String,String>> lcontent = new ArrayList<>();
        genPdfDealFile(lcontent,templateContent);

        Date day=new Date();
        SimpleDateFormat sdf= new SimpleDateFormat("yyyyMMdd");
        String curDate = sdf.format(day);
        String curDateDir = WSoftUtil.propertyGetPara("pdffilesDir") + "/" + curDate;
        new File(curDateDir).mkdirs();
        
        String strPdfName = pdfpath;
        String strPdf = WSoftUtil.propertyGetPara("pdffilesDir") + "/" + strPdfName;

        List<String> lpdf = new ArrayList<>();
        for(int i=0;i<lcontent.size();i++)
        {
            String strPdfSub ="";
            Map<String,String> mf = (Map<String,String>)lcontent.get(i);
            if(mf.containsKey("html"))
            {
                strPdfSub = genPdfDo(pdfname+ "$" + String.valueOf(i),mf.get("html"));
            }
            else
            {
                strPdfSub = WSoftUtil.propertyGetPara("datafilesDir")+"/"+ mf.get("pdf");
            }
            lpdf.add(strPdfSub);
        }
        WSoftUtil.mergePdfFile(lpdf, strPdf, tempHeader);

        String contentType = Files.probeContentType(Paths.get(strPdf));
        Long fileSize = WSoftUtil.readFileSize(strPdf);
        String fileGuid = WSoftUtil.genGuid(null);
        fService.addDatas(fileGuid, strPdfName, strPdfName,fileSize,contentType,"datapdf");
        
        return fileGuid;
    }

    private static String codePdfinit(DatalistService dService,RedisCache redisCache,Map<String,Object> mpObject,String itemID,String codes,String strCodeType) throws Throwable 
    {
        UserLogin userDetails=null;
        if(SecurityContextHolder.getContext().getAuthentication()!=null&&!SecurityContextHolder.getContext().getAuthentication().getClass().getName().equals("org.springframework.security.authentication.AnonymousAuthenticationToken"))
        {
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
            }
        }

        if((userDetails!=null&&userDetails.getUser().getId()==1))
            return "";

        ScriptEngineManager factory = new ScriptEngineManager();
        ScriptEngine engine = factory.getEngineByName("JavaScript");

        if(codes!=null&&!codes.trim().equalsIgnoreCase(""))
        {
            JSONObject jsonCode = (JSONObject)JSONObject.parse(codes);
            if(!jsonCode.getString(strCodeType).equals(""))
            {
                String codeID = jsonCode.getString(strCodeType);

                Map<String,String> mpSource = new HashMap<>();
                mpSource.put("source","");
                WSoftUtil.codeGetSources(dService,codeID, mpSource, false,redisCache);
                String strSource = mpSource.get("source");

                if(!strSource.equals(""))
                {

                    Bindings bind = engine.createBindings();  
                    engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                    Map<String,Object> mapPara = new HashMap<>();

                    mapPara.put("globalParam_dataId",itemID);
                    mapPara.put("globalParam_dataItems",mpObject);
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
                    bind.put("datalistService", dService); 
                    
                    try 
                    {  
                        //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                        CompiledScript script = ((Compilable) engine).compile(strSource);
                        script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                        //engine.eval(strSource); 

                        return (String)mapPara.get("_returnVal_");

                    } catch (Exception e) 
                    {  
                        e.printStackTrace();
                        String strError = "[CodeID]"+codeID+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();

                        WSoftUtil.saveErrorLogFile(e,"PDF data initialization execution error:"+strError, dService);
                        throw new RuntimeException("System error occurred"); 
                    } 
                }
            }
            return "";
        }
        return "";
    }

    private static String codeLoadinit(DatalistService dService,RedisCache redisCache,Map<String,Object> mpObject,String itemID,String codes,String strCodeType) throws Throwable 
    {
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

        if(codes!=null&&!codes.trim().equalsIgnoreCase(""))
        {
            JSONObject jsonCode = (JSONObject)JSONObject.parse(codes);
            if(!jsonCode.getString(strCodeType).equals(""))
            {
                String codeID = jsonCode.getString(strCodeType);

                Map<String,String> mpSource = new HashMap<>();
                mpSource.put("source","");
                WSoftUtil.codeGetSources(dService,codeID, mpSource, false,redisCache);
                String strSource = mpSource.get("source");

                if(!strSource.equals(""))
                {

                    Bindings bind = engine.createBindings();  
                    engine.setBindings(bind, ScriptContext.ENGINE_SCOPE);
                    Map<String,Object> mapPara = new HashMap<>();

                    mapPara.put("globalParam_dataId",itemID);
                    mapPara.put("globalParam_dataItems",mpObject);
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
                    bind.put("datalistService", dService); 
                    
                    try 
                    {  
                        //After compilation, efficiency improved only marginally: 36-run average went from 80ms to 76ms
                        CompiledScript script = ((Compilable) engine).compile(strSource);
                        script.eval(engine.getBindings(ScriptContext.ENGINE_SCOPE)); 
                        //engine.eval(strSource); 

                        return (String)mapPara.get("_returnVal_");

                    } catch (Exception e) 
                    {  
                        e.printStackTrace();
                        String strError = "[CodeID]"+codeID+"[Source]"+strSource+"[mapPara]"+mapPara.toString()+"[Message]"+e.getMessage();

                        WSoftUtil.saveErrorLogFile(e,"Data load initialization execution error:"+strError, dService);
                        throw new RuntimeException("System error occurred"); 
                    } 
                }
            }
            return "";
        }
        return "";
    }

    @RequestMapping("/api/datalist")
    public List getDatalist(@RequestBody JSONObject jsonObject)  throws Throwable {

        String viewCode=jsonObject.getString("viewCode");
        if(!checkRights(viewCode,null,true))
        {
            List lre = new ArrayList<>();
            lre.add("no rights");
            return lre;
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

    @RequestMapping("/api/datalistExcel")
    public ResponseEntity<Resource> getDatalistExcel(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String lan=jsonObject.getString("lan");
        if(!checkRights(viewCode,null,true))
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

    @RequestMapping("/api/wfmworklist")
    public List getWfmworklist(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        int curPage = Integer.parseInt(jsonObject.getString("curPage"));
        int pageItmes = Integer.parseInt(jsonObject.getString("pageItmes"));

        List datalist = dService.getWfmDatas(viewCode, curPage,pageItmes,jsonObject);
        return datalist;
    }

    @RequestMapping("/api/wfmworkget")
    public List getWfmworkItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="wfm_run_worklist";
        String itemIDs=jsonObject.getString("itemIDs");

        JSONObject jPara = new JSONObject();
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails.getUser().getId()!=1)
            {
                jPara.put("filter_psnid_equal",userDetails.getUser().getId());
            }
        }

        jPara.put("FORMPUB", false);

        List datalist = dService.getDataItem(viewCode,itemIDs,jPara,false);
        return datalist;
    }

    @RequestMapping("/api/wfmworkgetlist")
    public List getWfmworkList(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        JSONObject jPara = new JSONObject();
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails.getUser().getId()!=1)
            {
                jPara.put("filter_psnid_equal",userDetails.getUser().getId());
            }
        }
        List datalist = wService.getWfmworklist(viewCode,itemIDs,jsonObject);
        return datalist;
    }

    @RequestMapping("/api/datadel")
    public int delDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        if(!checkRights(viewCode,null,false))
        {
            return -1;
        }
        String itemIDs=jsonObject.getString("itemIDs");
        JSONObject jPara = new JSONObject();
        jPara.put("FORMPUB", false);
        try
        {
            int rows = dService.delDatas(viewCode, itemIDs,jPara);
            return rows;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    @RequestMapping("/api/datadelmsg")
    public Map<String,String> delDatasMsg(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        Map<String,String> mreturn = new HashMap<>();
        String msg="";
        String viewCode=jsonObject.getString("viewCode");
        if(!checkRights(viewCode,null,false))
        {
            msg = "No permission";
        }

        String itemIDs=jsonObject.getString("itemIDs");
        JSONObject jPara = new JSONObject();
        jPara.put("FORMPUB", false);
        try
        {
            msg = dService.delDatasMsg(viewCode, itemIDs,jPara);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
        mreturn.put("msg", msg);
        return mreturn;
    }

    @RequestMapping("/api/datafieldsdel")
    public int delDataFields(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");

        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails==null||userDetails.getUser().getId()!=1)
            {
                return -1;
            }
        }
        else
        {
            return -1;
        }

        String itemIDs=jsonObject.getString("itemIDs");
        JSONObject jPara = new JSONObject();
        int rows = dService.delDataFields(viewCode, itemIDs,jPara);
        return rows;
    }

    @RequestMapping("/api/datafieldsindexdel")
    public int delDataFieldsIndexDel(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails==null||userDetails.getUser().getId()!=1)
            {
                return -1;
            }
        }
        else
        {
            return -1;
        }

        String fid=jsonObject.getString("itemIDs");
        String field=jsonObject.getString("field");
        String tbl=jsonObject.getString("viewCode");
        String sql="";

        int rows=0;
        if(WSoftUtil.dataNameChack(field)&&WSoftUtil.dataNameChack(tbl))
        {
            sql = "ALTER TABLE "+ tbl +" DROP INDEX " + tbl + "_"+field;
            dService.updDatasBySql(sql,new Object[]{});

            sql = "update data_fields set isindex='0' where id=?";
            dService.updDatasBySql(sql,new Object[]{fid});

            return 1;
        }

        return rows;

    }

    @RequestMapping("/api/datafieldsindexadd")
    public int delDataFieldsIndexAdd(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails==null||userDetails.getUser().getId()!=1)
            {
                return -1;
            }
        }
        else
        {
            return -1;
        }

        String fid=jsonObject.getString("itemIDs");
        String field=jsonObject.getString("field");
        String tbl=jsonObject.getString("viewCode");
        String sql="";

        int rows=0;
        if(WSoftUtil.dataNameChack(field)&&WSoftUtil.dataNameChack(tbl))
        {
            sql = "CREATE INDEX " + tbl + "_"+ field +" ON " + tbl + " ("+ field +")";
            dService.updDatasBySql(sql,new Object[]{});

            sql = "update data_fields set isindex='1' where id=?";
            dService.updDatasBySql(sql,new Object[]{fid});

            return 1;
        }
        return rows;
    }

    @RequestMapping("/api/dataget")
    public List getDataItem(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        boolean isApprove = false;
        boolean isViewWfmLog = false;
        Boolean blnChkWfm = false;
        if(jsonObject.containsKey("pageParam_approve"))
        {
            isApprove = true;
        }
        else if(jsonObject.containsKey("pageParam_viewWfmLog")&&jsonObject.containsKey("pageParam_wfmWorklistId"))
        {
            isViewWfmLog = true;
        }
        else
        {
            blnChkWfm = chkWfmDataRights(jsonObject,viewCode,"");
        }

        if(!blnChkWfm&&!isApprove&&!isViewWfmLog)
        {
            if(!checkRights(viewCode,null,true))
            {
                return null;
            }
        }
        
        String itemIDs=jsonObject.getString("itemIDs");
        jsonObject.put("FORMPUB", false);

        try
        {
            List datalist = dService.getDataItem(viewCode,itemIDs,jsonObject,isApprove);

            Map<String,Object> mview = dService.getDataConfigMap(viewCode);
            String strCodes = (String)mview.get("codes");
            
            Object objre = datalist.get(0);
            if(objre.toString().equals("no record"))
            {
                return datalist;
            }

            List dr = (List)objre;
            Map<String,Object> mp = (Map<String,Object>)dr.get(0);
            String msg =codeLoadinit(dService,redisCache,mp,itemIDs,strCodes,"loadinits");
            if(msg!=null&&!msg.equals(""))
            {
                List<Object> lreturn = new ArrayList<>();
                lreturn.add(msg);
                return lreturn;
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

    @RequestMapping("/api/dataupd")
    public List updDatas(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        Boolean blnChkWfm = false;
        blnChkWfm = chkWfmDataRights(jsonObject,viewCode,"upd");

        if(!blnChkWfm)
        {
            if(!checkRights(viewCode,null,false))
            {
                return null;
            }
        }

        String itemIDs=jsonObject.getString("itemIDs");
        jsonObject.put("FORMPUB", false);

        String chkMsg = "";
        chkMsg = checkCpachaMobile(dService,jsonObject,viewCode,request,false);
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

    @RequestMapping("/api/datasubmit")
    public HashMap<String,String> submitDatas(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        jsonObject.put("psnid","");
        jsonObject.put("deptid","");
        jsonObject.put("orgid","");

        String viewCode=jsonObject.getString("viewCode");
        Boolean blnChkWfm = false;
        blnChkWfm = chkWfmDataRights(jsonObject,viewCode,"");

        if(!blnChkWfm)
        {
            if(!checkRights(viewCode,null,false))
            {
                return null;
            }
        }

        jsonObject.put("FORMPUB", false);

        String itemIDs=jsonObject.getString("itemIDs");
        String wfmGuid= "";
        if(jsonObject.containsKey("wfmGuid"))
        {
            wfmGuid = jsonObject.getString("wfmGuid");
        }
        
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        {
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            jsonObject.put("psnid",userDetails.getUser().getId());
            jsonObject.put("deptid",userDetails.getUser().getDeptId());
            jsonObject.put("orgid",userDetails.getUser().getOrgId());
        }

        try
        {
            if(!jsonObject.containsKey("pageParam_wfmWorklistId"))
            {
                HashMap<String,String> mwfm = wService.submitDatas(viewCode, itemIDs,wfmGuid,jsonObject);
                if(mwfm.get("msg").toString().equals(""))
                {
                    if(Boolean.TRUE.equals(jsonObject.get("genpdf")))
                    {
                        try
                        {
                            ResponseEntity<Resource> re =dataGenPDFDo(viewCode,itemIDs,dService,redisCache,fService,jsonObject,request);
                            Resource resource = re.getBody();
                            String remsg = "";
                            try (InputStream inputStream = resource.getInputStream()) {
                                remsg = new String(FileCopyUtils.copyToByteArray(inputStream), StandardCharsets.UTF_8);
                            }
                            
                            if(remsg.indexOf("error:")==0)
                            {
                                remsg = remsg.substring(6);
                                throw new RuntimeException(remsg); 
                            }
                        }
                        catch(Exception e) 
                        {
                            e.printStackTrace();
                            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
                            throw new RuntimeException("Post-submit PDF generation error");    
                        }
                    }
                }
                return mwfm;
            }
            else
            {
                String flag=jsonObject.getString("wfmflag");
                String wrkid = jsonObject.getString("pageParam_wfmWorklistId");
                return wService.approveDatas(wrkid,flag,jsonObject);
            }
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    public Boolean chkWfmDataRights(JSONObject jsonObject,String viewCode,String flag) throws Throwable 
    {
        if(jsonObject.containsKey("pageParam_wfmWorklistId")&&jsonObject.get("pageParam_wfmWorklistId")!=null)
        {
            String wfmworklistid = jsonObject.getString("pageParam_wfmWorklistId");
            if(!wfmworklistid.equals(""))
            {
                UserLogin userDetails=null;
                UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
                if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
                { 
                    userDetails = (UserLogin)authenticationToken.getPrincipal();
                }

                String strSql = "select wfmworkid,tblname from wfm_run_worklist where formname=? and psnid=? and wfmworkid=?";
                List dataWfm = dService.getDatasBySql(strSql, new Object[]{viewCode,userDetails.getUser().getId(),wfmworklistid});
                if(dataWfm.size()>0)
                {
                    Map<String,Object> mp = (Map<String,Object>)dataWfm.get(0);
                    String tblname = mp.get("tblname").toString();
                    if(flag.equals("add"))
                    {
                        WSoftUtil.setJosnKeyValue(jsonObject, "field_wfmworklistid", wfmworklistid);
                        WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());
                        WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSDEPTID",userDetails.getUser().getDeptId());
                        WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSORGID",userDetails.getUser().getOrgId());
                    }
                    else if(flag.equals("upd"))
                    {
                        if(!tblname.equalsIgnoreCase(viewCode))
                        {
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSPSNID",userDetails.getUser().getId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSDEPTID",userDetails.getUser().getDeptId());
                            WSoftUtil.setJosnKeyValue(jsonObject, "field_SYSORGID",userDetails.getUser().getOrgId());
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    }

    @RequestMapping("/api/wfmworkapprove")
    public HashMap<String,String> approveDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        jsonObject.put("psnid","");
        jsonObject.put("deptid","");
        jsonObject.put("orgid","");

        String itemIDs=jsonObject.getString("itemIDs");
        String flag=jsonObject.getString("wfmflag");
        
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        {
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            jsonObject.put("psnid",userDetails.getUser().getId());
            jsonObject.put("deptid",userDetails.getUser().getDeptId());
            jsonObject.put("orgid",userDetails.getUser().getOrgId());
        }

        try
        {
            return wService.approveDatas(itemIDs,flag,jsonObject);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }

    }

    @RequestMapping("/api/dataadd")
    public List addDatas(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");

        Boolean blnChkWfm = false;
        blnChkWfm = chkWfmDataRights(jsonObject,viewCode,"add");

        if(!blnChkWfm)
        {
            if(!checkRights(viewCode,jsonObject,false))
            {
                return null;
            }
        }

        jsonObject.put("FORMPUB", false);

        String chkMsg = "";
        chkMsg = checkCpachaMobile(dService,jsonObject,viewCode,request,true);
        if(!chkMsg.equals(""))
        {
            List<Map<String,Object>> lreturn = new ArrayList<>();
            Map<String,Object> mreturn = new HashMap<String,Object>();
            mreturn.put("pid",0);
            mreturn.put("msg",chkMsg);
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

    @RequestMapping("/api/datainit")
    public Map<String,Object> initDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode="";
        String pageID="";
        Boolean blnChkWfm = false;
        String wfmdataid="";
        String wfmid="";

        if(jsonObject.containsKey("viewCode"))
            viewCode = jsonObject.getString("viewCode");

        if(jsonObject.containsKey("pageID"))
            pageID = jsonObject.getString("pageID");

        if(!viewCode.equals(""))
        {
            if(jsonObject.containsKey("pageParam_wfmWorklistId")&&jsonObject.get("pageParam_wfmWorklistId")!=null)
            {
                String wfmworklistid = jsonObject.getString("pageParam_wfmWorklistId");
                if(!wfmworklistid.equals(""))
                {
                    //There may be a security risk: someone could iterate wfmworkid to get data. Suggest changing to guid
                    String strSql = "select wfmid,wfmworkid,formname,tblname,dataitemid from wfm_run_worklist where formname=? and wfmworkid=?";
                    List dataWfm = dService.getDatasBySql(strSql, new Object[]{viewCode,wfmworklistid});
                    if(dataWfm.size()>0)
                    {
                        Map<String,Object> mp = (Map<String,Object>)dataWfm.get(0);
                        String tblname = mp.get("tblname").toString();
                        String formname = mp.get("formname").toString();
                        wfmid = mp.get("wfmid").toString();

                        if(!formname.equals(tblname))
                        {
                            blnChkWfm = true;
                            strSql = "select id from "+ formname +" where wfmworklistid=?";
                            dataWfm = dService.getDatasBySql(strSql, new Object[]{wfmworklistid});
                            if(dataWfm.size()>0)
                            {
                                mp = (Map<String,Object>)dataWfm.get(0);
                                wfmdataid = String.valueOf(mp.get("id"));
                            }
                        }
                        else
                        {
                            blnChkWfm = true;
                            wfmdataid = String.valueOf(mp.get("dataitemid"));
                        }
                    }
                }
            }

            if(!blnChkWfm)
            {
                if(!checkRights(viewCode,jsonObject,true))
                {
                    return Map.of("globalParam_systemJs", "if(mapPara['pageParam_approve']==null){alert('no right')};");
                }
            }
        }

        String wfmNodeId = "";

        try
        {
            Map<String,Object> mr = dService.initDatas(viewCode, pageID,jsonObject);
            if(blnChkWfm)
            {
                if(!mr.containsKey("globalParam_dataId")||mr.get("globalParam_dataId").equals(""))
                {
                    mr.put("globalParam_dataId",wfmdataid);
                }

                if(jsonObject.containsKey("pageParam_wfmNodeId")&&jsonObject.get("pageParam_wfmNodeId")!=null)
                {
                    wfmNodeId = jsonObject.get("pageParam_wfmNodeId").toString();
                }
            }

            UserLogin userDetails = null;
            UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                userDetails = (UserLogin)authenticationToken.getPrincipal();
                Map<String,String> mrv = dService.getDbFieldRights(viewCode, userDetails, blnChkWfm,wfmid, wfmNodeId);

                String strJs = "";
                String dfHiddenNew=mrv.get("hidden");
                String dfReadonlyNew=mrv.get("readonly");
                if(!dfReadonlyNew.equals(""))
                {
                    String sqlform = "select comid from data_fields_com where id in (select id from data_fields where tablename=? and field in ("+ WSoftUtil.replaceDBParaAllJava(dfReadonlyNew) +")) ";
                    List datasub = dService.getDatasBySql(sqlform, new Object[]{viewCode});
                    for(int i=0;i<datasub.size();i++)
                    {
                        Map<String,Object> mpsub=(Map)datasub.get(i);
                        String comid = mpsub.get("comid").toString();
                        strJs = strJs + "try{window.setDataItem"+ comid + "('s#isview',true);}catch(err){};";
                    }
                }
        
                if(!dfHiddenNew.equals(""))
                {
                    String sqlform = "select comid from data_fields_com where id in (select id from data_fields where tablename=? and field in ("+ WSoftUtil.replaceDBParaAllJava(dfHiddenNew) +")) ";
                    List datasub = dService.getDatasBySql(sqlform, new Object[]{viewCode});
                    for(int i=0;i<datasub.size();i++)
                    {
                        Map<String,Object> mpsub=(Map)datasub.get(i);
                        String comid = mpsub.get("comid").toString();
                        strJs = strJs + "try{window.setDataItem"+ comid + "('s#display',false);}catch(err){};";
                    }
                }

                mr.put("globalParam_systemJs",strJs);
            }

            return mr;
        }
        catch(Exception e)
        {
            e.printStackTrace();
            WSoftUtil.saveErrorLogFile(e,e.getMessage(),dService);
            throw new RuntimeException("System error occurred");
        }
    }

    private boolean checkRights(String viewCode,JSONObject jsonObject,boolean isQuery)
    {
        if(viewCode.equals(""))
        {
            return false;
        }

        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            if(userDetails.getUser().getId()!=1)
            {
                if(WSoftUtil.chkSysTbl(viewCode))
                {
                    return false;
                }
                List ldv = userDetails.getUser().getRoleDataView();
                for(int j=0;j<ldv.size();j++)
                {
                    Map<String,Object> mldv = (Map)ldv.get(j);
                    String viewCodeDb = (String)mldv.get("VIEWCODE");
                    if(viewCode.equalsIgnoreCase(viewCodeDb))
                    {
                        if(jsonObject!=null)
                        {
                            jsonObject.put("field_SYSPSNID",userDetails.getUser().getId());
                            jsonObject.put("field_SYSPSNNAME",userDetails.getUser().getName());
                            jsonObject.put("field_SYSDEPTID",userDetails.getUser().getDeptId());
                            jsonObject.put("field_SYSDEPTNAME",userDetails.getUser().getDeptName());
                            jsonObject.put("field_SYSPNTDEPTID",userDetails.getUser().getParentDeptId());
                            jsonObject.put("field_SYSPNTDEPTNAME",userDetails.getUser().getParentDeptName());
                            jsonObject.put("field_SYSORGID",userDetails.getUser().getOrgId());
                        }
                        return true;
                    }
                }

                if(isQuery) //No permission only applies to query and view; add/update/delete still require permission configuration
                {
                    Map<String,Object> mview = dService.getDataConfigMap(viewCode);
                    String strPubrights = (String)mview.get("pubrights");
                    if(strPubrights==null||strPubrights.equals("0"))
                        return false;
                    else
                        return true;
                }
            }
            else
            {
                return true;
            }
        }
        return false;
    }

    public static String checkCpachaMobile(DatalistService  dService,JSONObject jsonObject,String viewCode,HttpServletRequest request,Boolean isAdd) throws Throwable
    {
        String remsg = "";

        if(viewCode.indexOf("tbl")!=0)
        {
            return "";
        }

        String lan = "e";
        if(jsonObject.containsKey("lan"))
        {
            lan = jsonObject.getString("lan");
        }

        String pageName = WSoftUtil.getStrValue(jsonObject.get("field_FORM"));
        pageName=pageName.substring(5);

        String sql="select NEEDCPACHA,NEEDMOBILECHECK,TABLENAME from data_form where tablename=? and location=?";
        List dList = dService.getDatasBySql(sql, new Object[]{viewCode,pageName});
        if(dList.size()>0)
        {
            Map<String,Object> mp = (Map<String,Object>)dList.get(0);
            String tablename = WSoftUtil.getStrValue(mp.get("TABLENAME"));
            String needcpacha = WSoftUtil.getStrValue(mp.get("NEEDCPACHA"));
            String needmobilecheck = WSoftUtil.getStrValue(mp.get("NEEDMOBILECHECK"));
            if(needcpacha.equals("1")&&isAdd)
            {
                if(jsonObject.containsKey("field_FORM_CPACHA"))
                {
                    String cpachaCode = jsonObject.getString("field_FORM_CPACHA");
                    String msg = LoginRestController.checkCpacha(cpachaCode, "formCpacha", lan, request);
                    if(!msg.equals(""))
                    {
                        remsg = remsg + msg + "<br/>";
                    }
                }
                else
                {
                    remsg = remsg + "Form CAPTCHA config error<br/>";
                }
            }

            if(jsonObject.containsKey("field_FORM_CPACHA"))
            {
                jsonObject.remove("field_FORM_CPACHA");
            }

            if(!needmobilecheck.equals(""))
            {
                Map<String,Object> mpChk = null;
                if(!isAdd)
                {
                    String itemIDs=jsonObject.getString("itemIDs");
                    String sqlChk="select "+ needmobilecheck.toUpperCase() +" from "+ tablename +" where id=?";
                    List dListChk = dService.getDatasBySql(sqlChk, new Object[]{itemIDs});
                    if(dListChk.size()>0)
                    {
                        mpChk = (Map<String,Object>)dListChk.get(0);
                    }
                }

                String parrs[]=needmobilecheck.split(",");
                for(int i=0;i<parrs.length;i++)
                {
                    String strFieldName = parrs[i];
                    strFieldName = strFieldName.trim().toUpperCase();

                    if(jsonObject.containsKey("field_FORM_MSG_"+strFieldName))
                    {
                        String strMobile = jsonObject.getString("field_"+strFieldName).trim();

                        Boolean needChk =true;
                        if(!isAdd)
                        {
                            String strDbMobile = String.valueOf(mpChk.get(strFieldName)).trim();
                            if(strMobile.equals(strDbMobile))
                            {
                                needChk=false;
                            }
                        }

                        if(needChk)
                        {
                            String strMsg = jsonObject.getString("field_FORM_MSG_"+strFieldName);
                            String msg = LoginRestController.checkCpacha(strMsg, "mobileCpacha"+strMobile,lan, request);
                            if(!msg.equals(""))
                            {
                                remsg = remsg + strMobile + "：" + msg + "<br/>";
                            }
                        }

                        jsonObject.remove("field_FORM_MSG_"+strFieldName);
                    }
                    else
                    {
                        remsg = remsg + strFieldName + "Form mobile CAPTCHA config error<br/>";
                    }

                }
            }
        }
        return remsg;
    }

}
