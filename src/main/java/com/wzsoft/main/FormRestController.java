package com.wzsoft.main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;

@RestController
public class FormRestController {
    
    @Autowired
    private DatalistService dService;

    @Autowired
    private CodeGenService cService;

    private static void saveConfigFile(String fileName,String fileContent,String pageType) throws Throwable 
    {
        String desDir = "";
        if(pageType.equals("1"))
            desDir = "/manage";
        else
            desDir = "/portal";
        String configDir = ResourceUtils.getURL("classpath:").getPath();

        configDir = configDir.replaceAll("/WEB-INF/classes", desDir);

        String ft = "";
        if(fileName.indexOf(".js")>0)
            ft = "/js";
        if(fileName.indexOf(".css")>0)
            ft = "/css";

        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ ft + "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

        if(pageType.equals("1"))
            WSoftUtil.copyFile(new File(configDir+ ft + "/" +fileName), new File(WSoftUtil.propertyGetPara("pagesManageDir")+ ft + "/"+fileName));
        else
            WSoftUtil.copyFile(new File(configDir+ ft + "/" +fileName), new File(WSoftUtil.propertyGetPara("pagesPortalDir")+ ft + "/"+fileName));
    }

    private static void saveContentFile(String fileName,String fileContent,boolean isTemplate,String pageType) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        
        if(isTemplate)
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/templates/");
        else
        {
            if(pageType.equals("1"))
                configDir = configDir.replaceAll("/WEB-INF/classes", "/manage/");
            else
                configDir = configDir.replaceAll("/WEB-INF/classes", "/portal/");
        }
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

        if(isTemplate)
            WSoftUtil.copyFile(new File(configDir+ "/" +fileName), new File(WSoftUtil.propertyGetPara("templatesDir")+"/"+fileName));
        else
        {
            if(pageType.equals("1"))
                WSoftUtil.copyFile(new File(configDir+ "/" +fileName), new File(WSoftUtil.propertyGetPara("pagesManageDir")+"/"+fileName));
            else
                WSoftUtil.copyFile(new File(configDir+ "/" +fileName), new File(WSoftUtil.propertyGetPara("pagesPortalDir")+"/"+fileName));
        }

    }

    private static String readConfigFile(String fileName) throws Throwable 
    {
        StringBuilder stringBuilder = new StringBuilder();
        try 
        {
            FileInputStream fileInputStream = new FileInputStream(fileName);
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

    private static Map<String,String> saveFormDo(String tblname,String formname,DatalistService dService,CodeGenService cService,String fileNamePart1,String strOutFileContent,String strOutJSContent,String pageType,@RequestBody JSONObject jsonObject)  throws Throwable 
    {
        String fileContent=jsonObject.getString("filecontent");
        Map<String,String> comAttrsField=(Map)jsonObject.get("comAttrsField");
        String strAttrget="";
        String strAttrset="";
        String strAttrsubmit="";
        String strAttrtitle="";

        String strJSFiles = "";
        String strCSSFiles = "";
        String strValCodes = "";
        String strInitCodes = "";

        Map<String,String> mfuncs = new HashMap<>();

        if(jsonObject.containsKey("initcode"))
        {
            JSONObject paraValue= (JSONObject)JSONObject.parse(jsonObject.getString("initcode"));
            strInitCodes = cService.codeDeal(paraValue, "codelist",comAttrsField,true,mfuncs);
        }

        if(jsonObject.containsKey("pdffilecontent"))
            fileContent=jsonObject.getString("pdffilecontent");
        
        if(jsonObject.containsKey("pdfheader"))
            fileContent = "<pdfheader>" + jsonObject.getString("pdfheader") + "</pdfheader>" + fileContent;

        String needCpacha="0";
        String needMobilecheck="";

        List<Object> lconfig = (List<Object>)jsonObject.get("comconfig");
        for(int i=0;i<lconfig.size();i++)
        {
            Map<String,String> config=(Map)lconfig.get(i);
            String comid=config.get("comid");
            Boolean needval = false;
            if(config.containsKey("needval")&&config.get("needval").equals("true"))
                needval = true;

            String configDir="";

            List lviewSub = dService.getDatasBySql("select * from com where comid=?", new Object[] {comid});
            if(lviewSub.size()>0)
            {
                Map<String,Object> mview=(Map)lviewSub.get(0);
                configDir=(String)mview.get("config");
                String classDir = ResourceUtils.getURL("classpath:").getPath();
                configDir = configDir.substring(1, configDir.length()-1);
                configDir = classDir.replaceAll("/WEB-INF/classes", "/admin" + configDir);
            }

            String strHtml = readConfigFile(configDir+"content.html");
            if(config.containsKey("temptype"))
            {
                if(config.get("temptype").equals("1"))
                    strHtml = config.get("tempcontent");
            }

            String strJs = readConfigFile(configDir+"content.js");
            String strCss = readConfigFile(configDir+"content.css");

            String comconfigid=(String)config.get("comconfigid");
            String comconfigidNew = fileNamePart1+comconfigid;
            strHtml = strHtml.replaceAll("\\[@configid@\\]", comconfigid);
            strJs = strJs.replaceAll("\\[@configid@\\]", comconfigid);
            strCss = strCss.replaceAll("\\[@configid@\\]", comconfigid);

            String comconfigpara=(String)config.get("comconfigpara");
            JSONObject comParaObj = JSONObject.parseObject(comconfigpara);
            JSONObject comConfigObj = (JSONObject)comParaObj.get("config");

            Set<String> jsonset = comConfigObj.keySet();
            String fieldName = "";
            for (String key : jsonset) 
            {
                String paraValue = comConfigObj.getString(key);
                if(key.indexOf("big_")==0)
                {
                    paraValue = paraValue.toUpperCase();
                }

                if(key.equals("fieldname"))
                    fieldName = paraValue;

                strHtml = strHtml.replaceAll("\\[@"+ key +"@\\]", Matcher.quoteReplacement(paraValue));
                strJs = strJs.replaceAll("\\[@"+ key +"@\\]", Matcher.quoteReplacement(paraValue));
                strCss = strCss.replaceAll("\\[@"+ key +"@\\]", Matcher.quoteReplacement(paraValue));
            }

            strHtml = strHtml.replaceAll("\\[@fieldname@\\]", Matcher.quoteReplacement(fieldName));
            strJs = strJs.replaceAll("\\[@fieldname@\\]", Matcher.quoteReplacement(fieldName));
            strCss = strCss.replaceAll("\\[@fieldname@\\]", Matcher.quoteReplacement(fieldName));

            strHtml = strHtml.replaceAll("\\[@configid@\\]", Matcher.quoteReplacement(comconfigid));
            strJs = strJs.replaceAll("\\[@configid@\\]", Matcher.quoteReplacement(comconfigid));
            strCss = strCss.replaceAll("\\[@configid@\\]", Matcher.quoteReplacement(comconfigid));

            if(comParaObj.containsKey("form"))
            {
                if(!comParaObj.get("form").equals(""))
                {
                    JSONObject comFormObj = (JSONObject)comParaObj.get("form");
                    Map<String,String> mre = saveFormDo("","",dService,cService,fileNamePart1,strHtml, strJs,pageType,comFormObj);
                    strCSSFiles = strCSSFiles + mre.get("cssfile");
                    strJSFiles = strJSFiles + mre.get("jsfile");
                    strHtml = mre.get("filecotent");
                    strJs = mre.get("jscotent");
                    strJs = strJs.replaceAll("\\[@configid@\\]", Matcher.quoteReplacement(comconfigid));
                }
            }

            if(needval)
            {
                strValCodes = strValCodes + "if(!window.valDataItem"+comconfigid+"()){valn=-1};";
            }

            if(comParaObj.containsKey("code"))
            {

                JSONObject comCodeObj = (JSONObject)comParaObj.get("code");
                jsonset = comCodeObj.keySet();
                for (String key : jsonset) 
                {
                    JSONObject paraValue = (JSONObject)comCodeObj.get(key);
                    String strCode = "";
                    strCode = cService.codeDeal(paraValue, "codelist",comAttrsField,true,mfuncs);

                    if(!strCode.equalsIgnoreCase(""))
                    {
                        if(key.indexOf("listcode")==0)
                            strCode = "function "+ key +"_"+ comconfigid +"(dataitem){" + strCode + ";return '';}";
                        else if(key.indexOf("topbtncode")==0)
                            strCode = "function "+ key +"_"+ comconfigid +"(curlist){" + strCode + ";return '';}";
                        else
                            strCode = "function "+ key +"_"+ comconfigid +"(){" + strCode + ";return '';}";

                        String strCodeName = "";
                        if(key.indexOf("listcode")==0)
                            strCodeName = key+"_"+comconfigid+"(dataitem);";
                        else if(key.indexOf("topbtncode")==0)
                            strCodeName = key+"_"+comconfigid+"(curlist);";
                        else
                            strCodeName = key+"_"+comconfigid+"();";

                        if(key.equalsIgnoreCase("val"))
                        {
                            strCodeName = "valmsg=" + strCodeName + ";";
                            strCodeName = strCodeName + "if(gFormSaveChk){";
                            strCodeName = strCodeName + "if (typeof(valmsg) != \"undefined\"&&valmsg!='') {valmsgglobal = valmsgglobal + valmsg + '<br/>';";
                            strCodeName = strCodeName + "document.getElementById(\"val-info-msg" + comconfigid + "\").innerHTML=valmsg;";
                            strCodeName = strCodeName + "document.getElementById(\"val-info" + comconfigid + "\").style.display=\"block\";";
                            strCodeName = strCodeName + "}else";
                            strCodeName = strCodeName + "{document.getElementById(\"val-info" + comconfigid + "\").style.display=\"none\";}";
                            strCodeName = strCodeName + "}else{document.getElementById(\"val-info" + comconfigid + "\").style.display=\"none\";}";
                            strValCodes = strValCodes + strCodeName;
                        }
                        strJs = strJs + strCode;
                        strJs = strJs.replaceAll("\\[@"+ key +"@\\]", Matcher.quoteReplacement(strCodeName));
                    }
                    else
                    {
                        strJs = strJs.replaceAll("\\[@"+ key +"@\\]", Matcher.quoteReplacement(strCode)); 
                    }
                }
            }

            // If Save component is present, pass PDF file
            if(comid.equals("1001"))
            {
                strAttrset = strAttrset + "window.setDataItem"+ comconfigid + "('pdffile',window.getDataItem[@configid@]('pdffile'));";
            }

            // If CAPTCHA component present, update form settings
            if(comid.equals("1020"))
            {
                needCpacha = "1";
            }
            if(comid.equals("1021"))
            {
                needMobilecheck = needMobilecheck + fieldName + ",";
            }

            if(comParaObj.containsKey("attrsubmit"))
            {
                JSONObject comAttrsubmitObj = (JSONObject)comParaObj.get("attrsubmit");
                jsonset = comAttrsubmitObj.keySet();
                for (String key : jsonset) 
                {
                    String paraValue = comAttrsubmitObj.getString(key);
                    strAttrsubmit = strAttrsubmit + "window.setDataItem[@configid@]('"+paraValue+"',window.getDataItem"+ comconfigid +"('"+paraValue+"'));";
                    strAttrset = strAttrset + "window.setDataItem"+ comconfigid + "('"+paraValue+"',window.getDataItem[@configid@]('"+paraValue+"'));";
                    strAttrset = strAttrset + "window.setDataItem"+ comconfigid + "('s#isview',isview);";
                }
            }
            if(comParaObj.containsKey("attrtitle"))
            {
                JSONObject comAttrtitleObj = (JSONObject)comParaObj.get("attrtitle");
                jsonset = comAttrtitleObj.keySet();
                for (String key : jsonset) 
                {
                    String paraValue = comAttrtitleObj.getString(key);
                    if(!paraValue.trim().equals(""))
                    {
                        paraValue=paraValue.replaceAll("\"", Matcher.quoteReplacement("\\\""));
                        strAttrtitle = strAttrtitle + "\""+ key +"\":\""+ paraValue +"\",";
                    }
                }
            }
            if(!strJs.trim().equals(""))
            {
                //saveConfigFile(comconfigidNew+".js",strJs,pageType);
                //strJSFiles = strJSFiles + "<script src=\"./js/"+ comconfigidNew +".js\"></script>";

                // Changed to concatenate all JS together
                strJSFiles = strJSFiles + ";" + strJs;
            }
            if(!strCss.trim().equals(""))
            {    
                //saveConfigFile(comconfigidNew+".css",strCss,pageType);
                //strCSSFiles = strCSSFiles + "<link rel=\"stylesheet\" href=\"./css/"+ comconfigidNew +".css\" type=\"text/css\"  />";
        
                // Changed to concatenate all CSS together
                strCSSFiles = strCSSFiles + " \r\n" + strCss;
            }
            fileContent = fileContent.replaceAll("\\[@"+ comconfigid +"@\\]", Matcher.quoteReplacement(strHtml));

        }

        if(!strAttrtitle.equalsIgnoreCase(""))
            strAttrtitle = strAttrtitle.substring(0, strAttrtitle.length()-1);

        String strFunctions = "";

        strOutFileContent = strOutFileContent.replaceAll("\\[@getvaluefromcom@\\]", Matcher.quoteReplacement(strAttrsubmit));
        strOutFileContent = strOutFileContent.replaceAll("\\[@setvaluetocom@\\]", Matcher.quoteReplacement(strAttrset));
        strOutFileContent = strOutFileContent.replaceAll("\\[@getsubmitvaluefromcom@\\]", Matcher.quoteReplacement(strAttrsubmit));
        strOutFileContent = strOutFileContent.replaceAll("\\[@attrtitle@\\]", Matcher.quoteReplacement(strAttrtitle));
        strOutFileContent = strOutFileContent.replaceAll("\\[@valcodes@\\]", Matcher.quoteReplacement(strValCodes));
        strOutFileContent = strOutFileContent.replaceAll("\\[@initformdatas@\\]", Matcher.quoteReplacement(strInitCodes));
        strOutFileContent = strOutFileContent.replaceAll("\\[@gfuncs@\\]", Matcher.quoteReplacement(strFunctions));
        
        strOutFileContent = strOutFileContent.replaceAll("\\[@filecontent@\\]",Matcher.quoteReplacement(fileContent));

        strOutJSContent = strOutJSContent.replaceAll("\\[@getvaluefromcom@\\]", Matcher.quoteReplacement(strAttrget));
        strOutJSContent = strOutJSContent.replaceAll("\\[@setvaluetocom@\\]", Matcher.quoteReplacement(strAttrset));
        strOutJSContent = strOutJSContent.replaceAll("\\[@getsubmitvaluefromcom@\\]", Matcher.quoteReplacement(strAttrsubmit));
        strOutJSContent = strOutJSContent.replaceAll("\\[@attrtitle@\\]", Matcher.quoteReplacement(strAttrtitle));
        strOutJSContent = strOutJSContent.replaceAll("\\[@valcodes@\\]", Matcher.quoteReplacement(strValCodes));
        strOutJSContent = strOutJSContent.replaceAll("\\[@initformdatas@\\]", Matcher.quoteReplacement(strInitCodes));

        needMobilecheck = WSoftUtil.strDelLastComma(needMobilecheck);
        if(!tblname.equals(""))
        {
            String strSql = "update data_form set needcpacha=?,needmobilecheck=? where tablename=? and location=?";
            dService.updDatasBySql(strSql, new Object[]{needCpacha,needMobilecheck,tblname,formname.substring(5)});
        }

        Map<String,String> mreturn = new HashMap<String,String>();
        mreturn.put("filecotent",strOutFileContent);
        mreturn.put("jscotent",strOutJSContent);
        mreturn.put("cssfile",strCSSFiles);
        mreturn.put("jsfile",strJSFiles);
        return mreturn;

    }

    @RequestMapping("/api/formsave")
    public List saveForm(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        return saveFormFunc(dService,cService,jsonObject);
    }

    @RequestMapping("/api/formsubmit")
    public List submitForm(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        return submitFormDo(dService,jsonObject);
    }

    public static List submitFormDo(DatalistService dService,JSONObject jsonObject) throws Throwable 
    {
        String dataID=jsonObject.getString("dataID");
        String msg="";
        try
        {
            List list = dService.createData(dataID, jsonObject);
        }
        catch(Exception e)
        {
            msg = e.getMessage();
            e.printStackTrace();
        }

        List<Map<String,Object>> lreturn = new ArrayList<>();
        Map<String,Object> mreturn = new HashMap<String,Object>();
        mreturn.put("rows",1);
        mreturn.put("msg",msg);
        lreturn.add(mreturn);

        return lreturn; 
    }

    public static List saveFormFunc(DatalistService dService,CodeGenService cService, JSONObject jsonObject) throws Throwable 
    {
        String dataID="";
        String tblName="";
        String pageLocation = "";
        String pageType="";
        String pageTemp="";
        Boolean isPub=false;
        
        if(jsonObject.containsKey("dataID"))
        {
            dataID = jsonObject.getString("dataID");
            tblName = jsonObject.getString("tblName");
            pageType = "1";
        }
        if(jsonObject.containsKey("pageID"))
        {
            pageLocation = jsonObject.getString("pageLocation");
            pageType = jsonObject.getString("pageType");
        }
        if(jsonObject.containsKey("isPub"))
        {
            if(jsonObject.getString("isPub").equals("1"))
            {
                isPub = true;
            }
        }

        pageTemp = jsonObject.getString("pageTemp");

        String fileName=jsonObject.getString("filename");
        String templatefile=jsonObject.getString("templatefile");
        String templateContent=jsonObject.getString("templatecontent");
        String fileNamePart1 = fileName.substring(0,fileName.length()-5) + "_";

        String fileJson = "";
        fileJson = "json_"+fileName.replaceAll(".html", ".txt");
        if(!dataID.equals(""))
        {
            if(pageTemp.equals("pdf"))
                fileName = "genpdf_"+fileName;
            else
                fileName = "form_"+fileName;
        }
        String strOutFileContent = "";
        String strOutTemplateContent = "";
        String classDir = ResourceUtils.getURL("classpath:").getPath();
        String templateDir = classDir.replaceAll("/WEB-INF/classes", "/admin/templates");
        String webDir = "";

        if(pageType.equals("1"))
            webDir = classDir.replaceAll("/WEB-INF/classes", "/manage");
        else
            webDir = classDir.replaceAll("/WEB-INF/classes", "/portal");

        strOutTemplateContent = readConfigFile(templateDir+"/"+ pageTemp +"in.html");
        if(isPub)
            strOutFileContent = readConfigFile(templateDir+"/"+ pageTemp +"outpub.html");
        else
            strOutFileContent = readConfigFile(templateDir+"/"+ pageTemp +"out.html");

        if(!pageTemp.equals("pdf"))  
        {    
            // To prevent leftover JS/CSS from removed page components, clean up everything first
            // Note: better to comment out rather than delete; if save fails midway, frontend will break
            //WSoftUtil.delWebFiles(fileNamePart1, webDir,pageType);
        }

        int fIndex = strOutTemplateContent.indexOf("[@filecontent@]");
        String strPart1 = strOutTemplateContent.substring(0, fIndex);
        String strPart2 = strOutTemplateContent.substring(fIndex+15);
        strOutTemplateContent = strPart1 + templateContent + strPart2;
        //strOutTemplateContent = strOutTemplateContent.replaceAll("\\[@filecontent@\\]", templateContent);
        // This method may produce garbled output

        if(!dataID.equals(""))
        {
            strOutFileContent = strOutFileContent.replaceAll("\\[@dataformname@\\]", Matcher.quoteReplacement(tblName));
        }
        else
            strOutFileContent = strOutFileContent.replaceAll("\\[@pageid@\\]", Matcher.quoteReplacement(pageLocation));

        String strCSSFiles="";
        String strJSFiles="";
        String msg="";
        Map<String,String> mre = new HashMap<>();
        try
        {
            mre = saveFormDo(tblName,fileName,dService,cService,fileNamePart1,strOutFileContent,"", pageType,jsonObject);
        }
        catch(Exception e)
        {
            e.printStackTrace();
            msg = e.getMessage();
        }

        if(msg.equals(""))
        {
            strCSSFiles = strCSSFiles + mre.get("cssfile");
            strJSFiles = strJSFiles + mre.get("jsfile");

            // Concatenate entire JS and CSS
            if(!strJSFiles.trim().equals(""))
            {
                saveConfigFile(fileName.toLowerCase().replaceAll(".html","")+"_js.js",strJSFiles,pageType);
                strJSFiles = "<script src=\"./js/"+ fileName.toLowerCase().replaceAll(".html","") +"_js.js\"></script>";
            }
            if(!strCSSFiles.trim().equals(""))
            {    
                saveConfigFile(fileName.toLowerCase().replaceAll(".html","")+"_css.css",strCSSFiles,pageType);
                strCSSFiles = "<link rel=\"stylesheet\" href=\"./css/"+ fileName.toLowerCase().replaceAll(".html","") +"_css.css\" type=\"text/css\"  />";
            }

            strOutFileContent = mre.get("filecotent");
            strOutFileContent = strOutFileContent.replaceAll("\\[@configid@\\]", Matcher.quoteReplacement(""));

            strOutFileContent = strOutFileContent.replaceAll("\\[@stylefile@\\]",Matcher.quoteReplacement(strCSSFiles));
            strOutFileContent = strOutFileContent.replaceAll("\\[@jsfile@\\]",Matcher.quoteReplacement(strJSFiles));

            saveContentFile(templatefile,strOutTemplateContent,true,pageType);
            saveContentFile(fileName,strOutFileContent,false,pageType);
            if(!dataID.equals(""))
            {
                if(!pageTemp.equals("pdf"))
                    saveContentFile(fileJson,jsonObject.toJSONString(),true,pageType);
            }
            else
            {
                saveContentFile(fileJson,jsonObject.toJSONString(),true,pageType); 
            }
            
            WSoftUtil.copyDirs(new File(templateDir+"/css/" + pageTemp), new File(webDir+"/css"));
            WSoftUtil.copyDirs(new File(templateDir+"/imgs/" + pageTemp), new File(webDir+"/imgs"));

            if(pageType.equals("1"))
            {
                WSoftUtil.copyDirs(new File(templateDir+"/css/" + pageTemp), new File(WSoftUtil.propertyGetPara("pagesManageDir")+"/css"));
                WSoftUtil.copyDirs(new File(templateDir+"/imgs/" + pageTemp), new File(WSoftUtil.propertyGetPara("pagesManageDir")+"/imgs"));
            }
            else
            {
                WSoftUtil.copyDirs(new File(templateDir+"/css/" + pageTemp), new File(WSoftUtil.propertyGetPara("pagesPortalDir")+"/css"));
                WSoftUtil.copyDirs(new File(templateDir+"/imgs/" + pageTemp), new File(WSoftUtil.propertyGetPara("pagesPortalDir")+"/imgs"));
            }
        }

        List<Map<String,Object>> lreturn = new ArrayList<>();
        Map<String,Object> mreturn = new HashMap<String,Object>();
        mreturn.put("rows",1);
        mreturn.put("msg",msg);
        lreturn.add(mreturn);

        return lreturn;
    }

}
