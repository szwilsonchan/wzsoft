package com.wzsoft.main;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.sql.Timestamp;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.util.ResourceUtils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.lowagie.text.Document;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfImportedPage;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfWriter;

public class WSoftUtil {
    private static final String ENCODE = "UTF-8";
    private static final Map<String,String> gPropertyPara = new HashMap<>();

    public static void propertySetPara(String k,String v) {
        gPropertyPara.put(k, v);
    }

    public static String propertyGetPara(String k) {
        return gPropertyPara.get(k).toString();
    }

    public static boolean isDouble(Object obj) {
        return obj instanceof Double;
    }
    public static String genGuid(String[] args) {
        UUID uuid = UUID.randomUUID();
        return uuid.toString().replaceAll("-", "");
    }
    public static void copyFile(File srcFile, File targetFile) throws IOException {
        if(!srcFile.exists())
            return;
        FileInputStream in = new FileInputStream(srcFile);
        FileOutputStream out = new FileOutputStream(targetFile);
        byte[] bytes = new byte[1024 * 1024];
        int length = -1;
        while ((length = in.read(bytes)) != -1) {
            out.write(bytes, 0, length);
        }
        out.flush();
        out.close();
        in.close();
    }
    public static void copyDirs(File srcDir, File targetDir) throws IOException {
        if (srcDir != null && targetDir != null) {
            if (srcDir.isDirectory()) {
                //Copy folder
                targetDir = new File(targetDir, srcDir.getName());
                boolean b = targetDir.mkdirs();
                //System.out.println("Copy folder" + srcDir + "\t" + targetDir+"\t" + b);
                //Copy files
                String[] list = srcDir.list();
                if (list != null && list.length > 0) {
                    for (String s : list) {
                        //Source file
                        File srcFile = new File(srcDir, s);
                        File targetFile = new File(targetDir, s);
                        if (srcFile.isDirectory()) {
                            //Recursive call
                            copyDirs(srcFile, targetDir);
                        }else{
                            //Create file
                            targetFile.createNewFile();
                            //Start copy
                            copyFile(srcFile, targetFile);
                        }
                    }
                }
            }
        }
    }

    public static void deleteDir(File directory)
    {
        File files[] = directory.listFiles();
        for (File file : files) {
            if(file.isDirectory()){
                deleteDir(file);
            }else {
                file.delete();
            }
        }

        directory.delete();
    }

    public static void saveTemplateFile(String fileName,String fileContent) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

        WSoftUtil.copyFile(new File(configDir+ "/" +fileName), new File(WSoftUtil.propertyGetPara("templatesDir")+"/"+fileName));
    }
    public static String readTemplateFile(String fileName) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/templates");
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
    public static String readWebFile(String fileName) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/manage");
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
    public static void saveWebFile(String fileName,String fileContent) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/manage");
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

    }
    public static void saveFile(String fileName,String fileContent) throws Throwable 
    {
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();
    }
    public static String replaceHtmlTag(String strHtml)
    {
        strHtml = strHtml.replaceAll("<", Matcher.quoteReplacement("&lt;"));
        strHtml = strHtml.replaceAll("&lt;br>&lt;/br>", Matcher.quoteReplacement("<br></br>"));  // Keep only line breaks
        return strHtml;
    }
    public static void saveCodeFile(String fileName,String fileContent) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");

        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

        WSoftUtil.copyFile(new File(configDir+ "/" +fileName), new File(WSoftUtil.propertyGetPara("codesDir")+"/"+fileName));
    }
    public static void saveErrorLogFile(Exception e,String err,DatalistService dService) throws Throwable 
    {

        StackTraceElement[] st=e.getStackTrace();
        String strSt="";
        for(int i=0;i<st.length;i++)
        {
            if(st[i].getClassName().indexOf("com.wzsoft")==0)
            {
                strSt = st[i].getFileName() + ",lines:" + String.valueOf(st[i].getLineNumber())+" ";
                break;
            }
        }
        err  = strSt + err;

        String fileContent  = err;
        String fileName = WSoftUtil.genGuid(null) + ".txt";
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/codelogs");

        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

        WSoftUtil.copyFile(new File(configDir+ "/" +fileName), new File(WSoftUtil.propertyGetPara("codelogsDir")+"/"+fileName));

        String strSql = "";
        if(WSoftUtil.dbSqlIsMysql())
            strSql = "insert into code_logs(id,logfile) values(null,?)";
        else if(WSoftUtil.dbSqlIsOracle())
            strSql = "insert into code_logs(id,logfile) values(seq_code_logs.nextval,?)";
        else if(WSoftUtil.dbSqlIsKingbase())
            strSql = "insert into code_logs(logfile) values(?)";
        else if(WSoftUtil.dbSqlIsDm())
            strSql = "insert into code_logs(id,logfile) values(seq_code_logs.nextval,?)";
        else if(WSoftUtil.dbSqlIsSqlserver())
            strSql = "insert into code_logs(id,logfile) values(NEXT VALUE FOR seq_code_logs,?)";
        dService.updDatasBySql(strSql, new Object[] {fileName});

    }
    public static void saveWfmFile(String fileName,String fileContent) throws Throwable 
    {
        String configDir = ResourceUtils.getURL("classpath:").getPath();
        
        configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/wfms");

        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir+ "/" +fileName),false),"utf-8"));
        bw.write(fileContent);
        bw.flush();
        bw.close();

        WSoftUtil.copyFile(new File(configDir+ "/" +fileName), new File(WSoftUtil.propertyGetPara("wfmDir")+"/"+fileName));
    }
    public static void saveLogoFile(String fileName) throws Throwable 
    {
        WSoftUtil.copyFile(new File(WSoftUtil.propertyGetPara("datafilesDir")+ "/" +fileName), new File(WSoftUtil.propertyGetPara("datafilesDir")+"/logo.png"));
    }
    public static String getStrValue(Object v)
    {
        if(v==null)
            return "";
        else
            return String.valueOf(v);
    }
    public static String strDelLastComma(String str)
    {
        if(!str.equalsIgnoreCase(""))
            return str.substring(0, str.length()-1);
        else
            return str;
    }
    public static String dateCurrent()
    {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
        Date date = new Date();
        String format = simpleDateFormat.format(date);
        return format;
    }
    public static String datetimeCurrent()
    {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = new Date();
        String format = simpleDateFormat.format(date);
        return format;
    }
    public static void delFile(String fileName) throws Throwable 
    {
        File fd = new File(fileName);
        if(fd.exists())
        {
            fd.delete();
        }
    }
    public static String readFile(String fileName) throws Throwable 
    {
        StringBuilder stringBuilder = new StringBuilder();
        File f = new File(fileName);
        if(f.exists())
        {
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
        }
        return stringBuilder.toString();
    }
    public static String readCodeFile(String fileName) throws Throwable 
    {
        StringBuilder stringBuilder = new StringBuilder();
        try 
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/codes");

            FileInputStream fileInputStream = new FileInputStream(configDir + fileName);
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
    public static String readWfmFile(String fileName) throws Throwable 
    {
        StringBuilder stringBuilder = new StringBuilder();
        try 
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/wfms");

            FileInputStream fileInputStream = new FileInputStream(configDir + fileName);
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

    public static Long readFileSize(String fileName) throws Throwable 
    {
        Long fLong = Long.valueOf(0);
        File f = new File(fileName);
        if(f.exists())
        {
            return f.length();
        }
        return fLong;
    }

    public static boolean dataDatetimeCheck(String str)
    {
        str = str.toLowerCase();
        return regexMatch("^(\\d{4})-(\\d{1,2})-(\\d{1,2}) (\\d{1,2}):(\\d{1,2}):(\\d{1,2})$",str);
    }
    public static boolean dataDateCheck(String str)
    {
        str = str.toLowerCase();
        return regexMatch("^(\\d{4})-(\\d{1,2})-(\\d{1,2})$",str);
    }
    public static boolean dataNameChack(String str)
    {
        str = str.toLowerCase().replaceAll("_", "");
        return regexMatch("^[a-z][a-z0-9]*$",str);
    }
    public static boolean regexMatch(String regx,String str)
    {
        Pattern pattern = Pattern.compile(regx);
        Matcher matcher = pattern.matcher(str);
        return matcher.matches();
    }
    public static String replaceDBPara(String para) throws Throwable 
    {
        String s=para;
        s = s.replaceAll("'", Matcher.quoteReplacement(""));
        s = s.replaceAll("%", Matcher.quoteReplacement(""));
        return s;
    }
    public static String replaceDBParaAllJava(String para)  
    {
        String s=para;
        s = s.replaceAll("'", Matcher.quoteReplacement(""));
        s = s.replaceAll("%", Matcher.quoteReplacement(""));

        String r="";
        String arr[] = para.split(",");
        for(int i=0;i<arr.length;i++)
        {
            r = r + "'" + arr[i] + "',";
        }
        r = strDelLastComma(r);
        return r;
    }
    public static String replaceDBParaAll(String para)  
    {
        String s=para;
        s = s.replaceAll("'", Matcher.quoteReplacement(""));
        s = s.replaceAll("%", Matcher.quoteReplacement(""));

        String r="";
        String arr[] = para.split(",");
        for(int i=0;i<arr.length;i++)
        {
            r = r + "\\'" + arr[i] + "\\',";
        }
        r = strDelLastComma(r);
        return r;
    }
    public static Long convertDouble2Long(Double d) {
        NumberFormat nf= NumberFormat.getInstance();
        nf.setGroupingUsed(false);
        String s = nf.format(d);
        return Long.valueOf(s);
    }
    public static String getURLDecoderString(String str) {
        String result = "";
        if (null == str) {
            return "";
        }
        try {
            result = java.net.URLDecoder.decode(str, ENCODE);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return result;
    }
    public static void mergePdfFile(List<String> sourceFilePaths, String destFilePath,String pdfHeader) throws Throwable  
    {
        if (sourceFilePaths == null || sourceFilePaths.isEmpty() || destFilePath == null) {
            return;
        }

        Document document = null;
        PdfWriter writer = null;
        OutputStream os = null;
        PdfContentByte cb = null;
        PdfReader reader = null;
        PdfReader pdfReader = null;
        try {

            os = new BufferedOutputStream(new FileOutputStream(new File(destFilePath)));
            //InputStream is = new FileInputStream(new File(sourceFilePaths.get(0)));
            //pdfReader = new PdfReader(is);
            //document = new Document(pdfReader.getPageSize(1));
            document = new Document();
            //pdfReader.close();
            //pdfReader=null;

            writer = PdfWriter.getInstance(document, os);
            WSoftPdfHeaderFooter pageEvent = new WSoftPdfHeaderFooter();
            pageEvent.setPdfHeader(pdfHeader);
            writer.setPageEvent(pageEvent);
            
            document.open();
            //copy = new PdfCopy(document, os);
            cb = writer.getDirectContent();
            
            for (String sourceFilePath : sourceFilePaths) {
                // Skip if PDF file does not exist
                if (!new File(sourceFilePath).exists()) {
                    continue;
                }

                // Read PDF files to merge
                try (InputStream isin = new FileInputStream(new File(sourceFilePath))) 
                {
                    reader = new PdfReader(isin);
                    // Get total pages of PDF file
                    int n = reader.getNumberOfPages();
                    for (int j = 1; j <= n; j++) {
                        document.newPage();
                        PdfImportedPage page = writer.getImportedPage(reader, j);
                        cb.addTemplate(page, 0, 0);
                    }
                    reader.close();
                    reader=null;
                    if(sourceFilePath.indexOf("uploadfiles")<0)
                        WSoftUtil.delFile(sourceFilePath);
                    
                } catch(Exception e) {
                    
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (pdfReader != null) {
                try {
                    pdfReader.close();
                    pdfReader=null;
                } catch (Exception ex) {
                    /* ignore */
                }
            }
            if (writer != null) {
                try {
                    writer.close();
                    writer = null;
                } catch (Exception ex) {
                    /* ignore */
                }
            }
            if (reader != null) {
                try {
                    reader.close();
                    reader = null;
                } catch (Exception ex) {
                    /* ignore */
                }
            }
            if (document != null) {
                try {
                    document.close();
                    document = null;
                } catch (Exception ex) {
                    /* ignore */
                }
            }
            if (os != null) {
                try {
                    os.close();
                    os = null;
                } catch (Exception ex) {
                    /* ignore */
                }
            }
        }
    }

    public static boolean isOrgAdmin(UserLogin userDetails)
    {
        if(userDetails.getUser().getId()!=1)
        {
            List lro = userDetails.getUser().getRoles();
            for(int j=0;j<lro.size();j++)
            {
                Map<String,Object> mldv = (Map)lro.get(j);
                String roleID = String.valueOf(mldv.get("ROLEID"));
                if(roleID.equalsIgnoreCase("2"))
                {
                    return true;
                }
            }
        }
        return false;
    }

    public static boolean isAdmin(UserLogin userDetails)
    {
        if(userDetails.getUser().getId()==1)
        {
            return true;
        }
        return false;
    }

    public static boolean isDeptAdmin(UserLogin userDetails)
    {
        if(userDetails.getUser().getId()!=1)
        {
            List lro = userDetails.getUser().getRoles();
            for(int j=0;j<lro.size();j++)
            {
                Map<String,Object> mldv = (Map)lro.get(j);
                String roleID = String.valueOf(mldv.get("ROLEID"));
                if (roleID.equalsIgnoreCase("3"))
                {
                    return true;
                }
            }
        }
        return false;
    }

    public static boolean dbSqlIsMysql()
    {
        if(WSoftUtil.propertyGetPara("dbType").equalsIgnoreCase("mysql"))
            return true;
        else
            return false;
    }

    public static boolean dbSqlIsKingbase()
    {
        if(WSoftUtil.propertyGetPara("dbType").equalsIgnoreCase("kingbase"))
            return true;
        else
            return false;
    }

    public static boolean dbSqlIsSqlserver()
    {
        if(WSoftUtil.propertyGetPara("dbType").equalsIgnoreCase("sqlserver"))
            return true;
        else
            return false;
    }

    public static String dbSqlSqlserverDealFname(String fname)
    {
        if(dbSqlIsSqlserver()&&fname.equalsIgnoreCase("open"))
            return "["+ fname +"]";
        else
            return fname;
    }

    public static boolean dbSqlIsDm()
    {
        if(WSoftUtil.propertyGetPara("dbType").equalsIgnoreCase("dm"))
            return true;
        else
            return false;
    }

    public static boolean dbSqlIsOracle()
    {
        if(WSoftUtil.propertyGetPara("dbType").equalsIgnoreCase("oracle"))
            return true;
        else
            return false;
    }

    public static String dbSqlDealFieldLen(String dbtype,String fieldlen)
    {
        if(dbtype.equalsIgnoreCase("decimal1"))
        {
            return "15,2";
        }
        if(dbtype.equalsIgnoreCase("decimal2"))
        {
            return "15,6";
        }

        Integer fl = Integer.valueOf(fieldlen);
        if(dbtype.equalsIgnoreCase("nvarchar2")&&(dbSqlIsDm()))
            fl = fl*2;

        return Integer.toString(fl);
    }

    public static String dbSqlPage(String sql,int iBegin,int iEnd,int pageItems)
    {

        if(WSoftUtil.dbSqlIsMysql())
            sql = sql + " limit " + String.valueOf(iBegin-1) +"," + pageItems + "";
        else if(WSoftUtil.dbSqlIsOracle())
            sql = "select * from (select v1.*,rownum rn from (" + sql + ") v1 where rownum<=" + String.valueOf(iEnd) +" ) v2 where rn>=" + String.valueOf(iBegin) + "";
        else if(WSoftUtil.dbSqlIsKingbase())
            sql = sql + " limit " + String.valueOf(iBegin-1) +"," + pageItems + "";
        else if(WSoftUtil.dbSqlIsDm())
            sql = "select * from (select v1.*,rownum rn from (" + sql + ") v1 where rownum<=" + String.valueOf(iEnd) +" ) v2 where rn>=" + String.valueOf(iBegin) + "";
        else if(WSoftUtil.dbSqlIsSqlserver())
            sql = "select * from (select v1.*,(ROW_NUMBER() over(ORDER BY (SELECT null))) as rn from (" + sql + ") v1) v2 where rn<=" + String.valueOf(iEnd) +"  and rn>=" + String.valueOf(iBegin) + "";
        return sql;
    }

    public static String dbSqlFieldType(String fieldType)
    {
        if(fieldType.equalsIgnoreCase("number"))
        {
            if(WSoftUtil.dbSqlIsMysql())
                fieldType = "double";
            else if (WSoftUtil.dbSqlIsOracle())
                fieldType = "number";
            else if (WSoftUtil.dbSqlIsKingbase())
                fieldType = "number";
            else if (WSoftUtil.dbSqlIsDm())
                fieldType = "number";
            else if (WSoftUtil.dbSqlIsSqlserver())
                fieldType = "real";
        }
        else if(fieldType.equalsIgnoreCase("nvarchar2"))
        {
            if(WSoftUtil.dbSqlIsMysql())
                fieldType = "varchar";
            else if (WSoftUtil.dbSqlIsOracle())
                fieldType = "nvarchar2";
            else if (WSoftUtil.dbSqlIsKingbase())
                fieldType = "varchar";
            else if (WSoftUtil.dbSqlIsDm())
                fieldType = "varchar";
            else if (WSoftUtil.dbSqlIsSqlserver())
                fieldType = "nvarchar";
        }
        else if(fieldType.equalsIgnoreCase("date"))
        {
            if(WSoftUtil.dbSqlIsMysql())
                fieldType = "datetime";
            else if (WSoftUtil.dbSqlIsOracle())
                fieldType = "date";
            else if (WSoftUtil.dbSqlIsKingbase())
                fieldType = "datetime";
            else if (WSoftUtil.dbSqlIsDm())
                fieldType = "datetime";
            else if (WSoftUtil.dbSqlIsSqlserver())
                fieldType = "datetime";
        }
        else if(fieldType.equalsIgnoreCase("decimal1")||fieldType.equalsIgnoreCase("decimal2"))
        {
            fieldType = "decimal";
        }

        return fieldType;
    }

    public static String dbSqlAutoID(String tbl,String id)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsOracle())
            strReturn = "select  SEQ_"+ tbl +".nextval as NEXTVAL from dual";
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = "select  nextval('"+ tbl +"_"+ id +"_seq'::regclass) as NEXTVAL";
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = "select SEQ_"+ tbl.toUpperCase() +".nextval as NEXTVAL";
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = "select NEXT VALUE FOR SEQ_"+ tbl.toUpperCase() +" as NEXTVAL";
        return strReturn;
    }

    public static String dbSqlAutoIDGet(DatalistDao datalistDao,String tbl,String id) throws Throwable
    {
        String rid="0";
        if(WSoftUtil.dbSqlIsMysql())
        {
            return rid;
        }
        String sql = dbSqlAutoID(tbl,id);
        Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[] {});
        if(mp.get("NEXTVAL")!=null)
            rid = mp.get("nextval").toString();
        else
            rid =  "1";
        return rid;
    }

    public static String dbSqlTop(String top)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = "limit 0,"+top;
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = "and rownum<="+top;
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = "limit 0,"+top;
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = "and rownum<="+top;
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = "";
        return strReturn;
    }

    public static String dbSqlTopFirst(String top)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = " top " + top + " ";
        return strReturn;
    }

    //Not yet modified
    public static String dbSqlLike()
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = " like concat('%',?,'%') ";
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = " like '%'||?||'%' ";
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = " like concat('%',?,'%') ";
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = " like '%'||?||'%' ";
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = " like '%'+?+'%' ";
        return strReturn;
    }

    public static String dbSqlLikeJs()
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = " concat(\\'%\\',?,\\'%\\') ";
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = " \\'%\\'||?||\\'%\\' ";
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = " concat(\\'%\\',?,\\'%\\') ";
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = " \\'%\\'||?||\\'%\\' ";
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = " like '%'+?+'%' ";
        return strReturn;
    }

    public static String dbSqlLikeByField(String fname)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = "concat(',',"+fname +",',') like concat('%',?,'%') ";
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = "','||" + fname + "||','" + " like  '%'||?||'%' ";
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = "concat(',',"+fname +",',') like concat('%',?,'%') ";
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = "','||" + fname + "||','" + " like  '%'||?||'%' ";
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = "','+" + fname + "+','" + " like  '%'+?+'%' ";
        return strReturn;
    }

    public static String dbSqlSysdate()
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = "CURRENT_TIMESTAMP";
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = "sysdate";
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = "CURRENT_TIMESTAMP";
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = "sysdate";
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = "getdate()";
        return strReturn;
    }

    public static String dbSqlDateHourDiff(String d)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = " (UNIX_TIMESTAMP(CURRENT_TIMESTAMP)- UNIX_TIMESTAMP("+ d +"))/3600 ";
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = " (sysdate- "+ d +")*24 ";
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = " (to_date(CURRENT_TIMESTAMP,'yyyy-mm-dd hh24:mi:ss')-to_date("+ d +",'yyyy-mm-dd hh24:mi:ss'))*24 ";
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = " (sysdate- "+ d +")*24 ";
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = " datediff([hh],"+ d +",getdate()) ";
        return strReturn;
    }

    public static String dbSqlDateStr(String strFtName)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = "date_format(" + strFtName + ",'%Y-%m-%d') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = "to_char(" + strFtName + ",'yyyy-mm-dd') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = "to_char(" + strFtName + ",'yyyy-mm-dd') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = "to_char(" + strFtName + ",'yyyy-mm-dd') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = "CONVERT(varchar(100)," + strFtName + ",23) as "+ strFtName.toUpperCase();
        return strReturn;
    }

    public static String dbSqlDateTimeStr(String strFtName)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
            strReturn = "date_format(" + strFtName + ",'%Y-%m-%d %H:%i:%s') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsOracle())
            strReturn = "to_char(" + strFtName + ",'yyyy-mm-dd hh24:mi:ss') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsKingbase())
            strReturn = "to_char(" + strFtName + ",'yyyy-mm-dd hh24:mi:ss') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsDm())
            strReturn = "to_char(" + strFtName + ",'yyyy-mm-dd hh24:mi:ss') as "+ strFtName.toUpperCase();
        else if(WSoftUtil.dbSqlIsSqlserver())
            strReturn = "CONVERT(varchar(100)," + strFtName + ",20) as "+ strFtName.toUpperCase();
        return strReturn;
    }

    public static String dbSqlDateStrDeal(Object d,String fmt)
    {
        String strReturn="";
        if(WSoftUtil.dbSqlIsMysql())
        {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(fmt);
            java.time.LocalDateTime dateTmp = (java.time.LocalDateTime)d;
            strReturn = dateTmp.format(formatter);
        }
        else if(WSoftUtil.dbSqlIsOracle())
        {
            SimpleDateFormat sdf = new SimpleDateFormat(fmt);
            java.sql.Timestamp dateTmp = (java.sql.Timestamp)d;
            strReturn = sdf.format(dateTmp);
        }
        else if(WSoftUtil.dbSqlIsKingbase())
        {
            SimpleDateFormat sdf = new SimpleDateFormat(fmt);
            java.sql.Timestamp dateTmp = null;
            if(d.getClass().getName().equals("java.sql.Date"))
            {
                java.sql.Date dt = (java.sql.Date)d;
                java.util.Date ud = new java.util.Date(dt.getTime());
                dateTmp = new java.sql.Timestamp(ud.getTime());
            }
            else{
                dateTmp = (java.sql.Timestamp)d;
            }
            strReturn = sdf.format(dateTmp);
        }
        else if(WSoftUtil.dbSqlIsDm())
        {
            SimpleDateFormat sdf = new SimpleDateFormat(fmt);
            java.sql.Timestamp dateTmp = (java.sql.Timestamp)d;
            strReturn = sdf.format(dateTmp);
        }
        else if(WSoftUtil.dbSqlIsSqlserver())
        {
            SimpleDateFormat sdf = new SimpleDateFormat(fmt);
            java.sql.Timestamp dateTmp = (java.sql.Timestamp)d;
            strReturn = sdf.format(dateTmp);
        }
        return strReturn;
    }

    public static java.sql.Timestamp dbSqlDateFromDb(Object d)
    {
        if(WSoftUtil.dbSqlIsMysql())
        {
            java.time.LocalDateTime dateTmp = (java.time.LocalDateTime)d;
            return Timestamp.valueOf(dateTmp);
        }
        else
        {
          return (Timestamp)d;  
        }
    }

    public static String genReqKey(int n) {
		String codes="";
		Random r=new Random();
		for(int i=0;i<n;i++) {
			int num=r.nextInt(2);
			switch(num) {
			case 0:
				codes+=r.nextInt(10);
				break;
			case 1:
				char ch2=(char)(r.nextInt(26)+97);
				codes+=ch2;
				break;
			}
		}
		return codes;
	}

    public static File csvCreateFile(List<Map<String,Object>> head, List<Map<String,Object>> dataList,String outPutPath,String lan) {

        File csvFile = null;
        BufferedWriter csvWtriter = null;
        try {
            csvFile = new File(outPutPath);
            File parent = csvFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            csvFile.createNewFile();

            // Read separator ","
            csvWtriter = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(csvFile), "utf-8"), 1024);
            // Write file header
            csvWriteHead(head, csvWtriter);

            // Write file content
            for (Map<String,Object> row : dataList) {
                csvWriteRow(head,row, csvWtriter,lan);
            }
            csvWtriter.flush();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                csvWtriter.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return csvFile;
        }

    /**
    * Write row data method
    * @param row
    * @param csvWriter
    * @throws IOException
    */
    private static void csvWriteHead(List<Map<String,Object>> row, BufferedWriter csvWriter) throws IOException {
        // Write file header
        for (Map<String,Object> mp: row) {
            for (String key : mp.keySet()) {
                StringBuffer sb = new StringBuffer();
                String rowStr = sb.append("\"").append(mp.get(key)).append("\",").toString();
                csvWriter.write(rowStr);
            }
        }
        csvWriter.newLine();
    }
        /**
    * Write row data method
    * @param row
    * @param csvWriter
    * @throws IOException
    */
    private static void csvWriteRow(List<Map<String,Object>> head,Map<String,Object> row, BufferedWriter csvWriter,String lan) throws IOException {
        // Write file header

        for (Map<String,Object> mp: head) {
            for (String key : mp.keySet()) 
            {
                key = key.substring(0,key.indexOf("_"));

                String data = "";
                if(row.get(key.toUpperCase())!=null)
                    data = String.valueOf(row.get(key.toUpperCase()));

                if(key.equalsIgnoreCase("SYSSTATUS")&&lan.equalsIgnoreCase("c"))
                {
                    if(data.equals("0"))
                        data = "Draft";
                    else if(data.equals("1"))
                        data = "Under Review";
                    else if(data.equals("2"))
                        data = "Review Complete";
                }
                else if(key.equalsIgnoreCase("SYSSTATUS")&&lan.equalsIgnoreCase("e"))
                {
                    if(data.equals("0"))
                        data = "Filling";
                    else if(data.equals("1"))
                        data = "Pending";
                    else if(data.equals("2"))
                        data = "Approved";
                }

                StringBuffer sb = new StringBuffer();
                String rowStr = sb.append("\"").append(data).append("\",").toString();
                csvWriter.write(rowStr);

            }
        }

        csvWriter.newLine();
    }

    public static String dbSqlDealInStr(String paramValue)  throws Throwable
    {
        String parrs[]=String.valueOf(paramValue).split(",");
        String strParaInValues = "";
        for(int i=0;i<parrs.length;i++)
        {
            String strParaInValue = parrs[i];
            strParaInValue = replaceDBPara(strParaInValue);
            strParaInValue = "'" + strParaInValue + "'";
            strParaInValues = strParaInValues + strParaInValue + ",";
        }
        if(!strParaInValues.equalsIgnoreCase(""))
            strParaInValues = strParaInValues.substring(0, strParaInValues.length()-1);
        return strParaInValues;
    }

    public static void codeGetGuidsDo(DatalistService dService,String guids,Map<String,String> mpSource) throws Throwable
    {
        if(!mpSource.containsKey("guids"))
            mpSource.put("guids",guids);
        else
            mpSource.put("guids",mpSource.get("guids") + "," + guids);
        
        String funcguids = "";
        String sql = "select funcguid from code_funcs where guid in ("+ guids +") ";
        List datalist = dService.getDatasBySql(sql, new Object[]{});
        for(int k=0;k<datalist.size();k++)
        {
            Map<String,String> mpfunc=(Map)datalist.get(k);
            String funcguid = mpfunc.get("funcguid").toString();
            String strGuids = mpSource.get("guids").toString();
            if(strGuids.indexOf(funcguid)<0)
            {
                funcguids = "'" + funcguid+"',";
            }
        }
        funcguids = WSoftUtil.strDelLastComma(funcguids);
        if(!funcguids.equals(""))
        {
            codeGetGuidsDo(dService,funcguids,mpSource);
        }

    }

    public static String codeGetConfig(String k,RedisCache redisCache) throws Throwable
    {
        Object rv = redisCache.getCacheObject(k);
        if(rv!=null)
        {
            return rv.toString();
        }
        return "";
    }
    public static void codeGetSourcesImport(DatalistService dService,String guid,Boolean isfunc,RedisCache redisCache) throws Throwable
    {
        Map<String,String> mpSource = new HashMap<>();
        mpSource.put("source","");

        String sql = "select iscache,open from code where guid=?";
        List datalist = dService.getDatasBySql(sql, new Object[]{guid});
        if(datalist.size()>0)
        {
            String strSource = "";
            Map<String,String> mp=(Map)datalist.get(0);
            String isopen = mp.get("open").toString();

            codeGetSourcesDo(dService,guid,mpSource,isfunc);
            redisCache.setCacheObject("code:"+guid, mpSource.get("source"));
            sql = "update code set iscache='1' where guid=?";
            dService.updDatasBySql(sql, new Object[]{guid});
            
            strSource = mpSource.get("source");
            if(!isopen.equals("1"))
            {
                if(strSource.indexOf("function gvalnum(v)")<0)
                {
                    strSource = WSoftUtil.codeGetConfig("gCodeFunc", redisCache) + ";" + strSource;
                }
            }
            mpSource.put("source",strSource);
        }
    }
    public static void codeGetSources(DatalistService dService,String guid,Map<String,String> mpSource,Boolean isfunc,RedisCache redisCache) throws Throwable
    {
        String sql = "select iscache,open from code where guid=?";
        List datalist = dService.getDatasBySql(sql, new Object[]{guid});
        if(datalist.size()>0)
        {
            String strSource = "";
            Map<String,String> mp=(Map)datalist.get(0);
            String iscache = mp.get("iscache").toString();
            String isopen = mp.get("open").toString();
            if(iscache.equals("1"))
            {
                strSource = redisCache.getCacheObject("code:"+guid);
            }

            if(strSource!=null&&!strSource.equals(""))
            {
                if(!isopen.equals("1"))
                {
                    if(strSource.indexOf("function gvalnum(v)")<0)
                    {
                        strSource = WSoftUtil.codeGetConfig("gCodeFunc", redisCache) + ";" + strSource;
                    }
                }
                mpSource.put("source",strSource);
            }
            else
            {
                codeGetSourcesDo(dService,guid,mpSource,isfunc);
                redisCache.setCacheObject("code:"+guid, mpSource.get("source"));
                sql = "update code set iscache='1' where guid=?";
                dService.updDatasBySql(sql, new Object[]{guid});
                
                strSource = mpSource.get("source");
                if(!isopen.equals("1"))
                {
                    if(strSource.indexOf("function gvalnum(v)")<0)
                    {
                        strSource = WSoftUtil.codeGetConfig("gCodeFunc", redisCache) + ";" + strSource;
                    }
                }
                mpSource.put("source",strSource);
            
            }
        }
    }
    public static void codeGetSourcesDo(DatalistService dService,String guid,Map<String,String> mpSource,Boolean isfunc) throws Throwable
    {
        String sql = "select * from code where guid=?";
        List datalist = dService.getDatasBySql(sql, new Object[]{guid});
        if(datalist.size()>0)
        {
            Map<String,String> mp=(Map)datalist.get(0);
            String sourcefile = "";
            String source="";
            String parafile = "";
            String para = "";
            String paraList="";

            sourcefile = mp.get("source").toString();
            parafile = mp.get("para").toString();  
            source = WSoftUtil.readCodeFile(sourcefile);
            para = WSoftUtil.readCodeFile(parafile);

            if(isfunc)
            {
                JSONObject jPara = JSON.parseObject(para);
                JSONArray jArr = (JSONArray)jPara.get("para");
                for(int j=0;j<jArr.size();j++)
                {
                    JSONObject job = jArr.getJSONObject(j);
                    if(job.get("ptype").toString().equals("def"))
                    {
                        paraList = paraList + job.get("key").toString() + ","; 
                    }
                }
                paraList = WSoftUtil.strDelLastComma(paraList);
                source = "function func"+ guid + "(" + paraList + "){"+ source + "};";
            }

            mpSource.put("source",mpSource.get("source") + source);

            sql = "select funcguid from code_funcs where guid=?";
            datalist = dService.getDatasBySql(sql, new Object[]{guid});
            for(int k=0;k<datalist.size();k++)
            {
                Map<String,String> mpfunc=(Map)datalist.get(k);
                String funcguid = mpfunc.get("funcguid").toString();
                // Check if code already generated to prevent infinite loop
                String strSourceSub = mpSource.get("source").toString();
                if(strSourceSub.indexOf("function func"+ funcguid)<0)
                {
                    codeGetSourcesDo(dService,funcguid,mpSource,true);
                }
            }

        }
    }

    public static String codeImportDo(DatalistService dService,String strTarget,String configDirCode) throws Throwable
    {
        String msg = "";
        String strJsonContentCode = WSoftUtil.readFile(strTarget + "/code.txt");
        if(!strJsonContentCode.equals(""))
        {
            JSONArray jArrCode = JSON.parseArray(strJsonContentCode);
            for(int i=0;i<jArrCode.size();i++)
            {
                JSONObject job = jArrCode.getJSONObject(i);
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
                        msg = msg + codeName+"Import failed: " + msgerr + "<br>";
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
                        msg = msg + codeName+"Import failed: " + msgerr + "<br>";
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
        }
        
        String strJsonContent = WSoftUtil.readFile(strTarget + "/code_funcs.txt");
        if(!strJsonContent.equals(""))
        {
            JSONArray jArr = JSON.parseArray(strJsonContent);
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
        }
        return msg;
    }

    public static void codeExportDo(DatalistService dService,List<String> lfiles,String codelist,String configDir,String strTmpDir,String configDirCode) throws Throwable
    {
        codelist = WSoftUtil.strDelLastComma(codelist);
        Map<String,String> mpSource = new HashMap<>();
        WSoftUtil.codeGetGuidsDo(dService, codelist, mpSource);
        codelist = mpSource.get("guids");

        String sql = "select * from code where guid in ("+ codelist +") ";
        List datalistcode = dService.getDatasBySql(sql, new Object[]{});
        if(datalistcode.size()>0)
        {
            String strJSONContentCode = JSON.toJSONString(datalistcode);
            BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/code.txt"),false),"utf-8"));
            bw.write(strJSONContentCode);
            bw.flush();
            bw.close(); 
            lfiles.add(configDir + strTmpDir + "/code.txt");

            for(int ff=0;ff<datalistcode.size();ff++)
            {
                Map<String,Object> mcode=(Map)datalistcode.get(ff);
                String codefile = "";
                String sourcefile = "";
                String parafile = "";

                codefile = mcode.get("codefile").toString();
                sourcefile = mcode.get("source").toString();
                parafile = mcode.get("para").toString();  

                lfiles.add(configDirCode + codefile);
                lfiles.add(configDirCode + sourcefile);
                lfiles.add(configDirCode + parafile);
            }

        }

        sql = "select * from code_funcs where guid in ("+ codelist +") ";
        datalistcode = dService.getDatasBySql(sql, new Object[]{});
        if(datalistcode.size()>0)
        {
            String strJSONContentCode = JSON.toJSONString(datalistcode);
            BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(configDir + strTmpDir + "/code_funcs.txt"),false),"utf-8"));
            bw.write(strJSONContentCode);
            bw.flush();
            bw.close(); 
            lfiles.add(configDir + strTmpDir + "/code_funcs.txt");
        }
    }

    public static void fileUploadCopy(String strTarget) throws Throwable
    {
        File updSrcDir = new File(strTarget + "/upload");
        File updTargetDir = new File(WSoftUtil.propertyGetPara("datafilesDir"));

        if(updSrcDir.exists())
        {
            String[] updList = updSrcDir.list();
            if (updList != null && updList.length > 0) {
                for (String s : updList) {
                    File srcFile = new File(updSrcDir, s);
                    WSoftUtil.copyDirs(srcFile, updTargetDir);
                }
            }
        }
    }

    public static void fileUploadDeal(String strFileCon,List<String> lfiles,boolean blntemp) throws Throwable
    {
        if(!blntemp)
        {

            String rFile = "/upload/\\d{8}/[A-Za-z0-9]{32}.[A-Za-z]+&";
            Pattern pFile = Pattern.compile(rFile);
            Matcher mFile = pFile.matcher(strFileCon);
            while (mFile.find())
            {
                String strFileMatch = mFile.group();
                strFileMatch = strFileMatch.substring(0, strFileMatch.length()-1);
                String strFolder = strFileMatch.substring(8, 16);
                String strFilePath = WSoftUtil.propertyGetPara("datafilesDir") + "/" + strFileMatch.substring(8);
                if(!lfiles.contains("f-" + strFolder + strFilePath))
                    lfiles.add("f-" + strFolder + strFilePath);
            }
        }
        else
        {
            String  rFile = "\\\\\"filePath\\\\\":\\\\\"\\d{8}/[A-Za-z0-9]{32}.[A-Za-z]+\\\\";
            Pattern pFile = Pattern.compile(rFile);
            Matcher mFile = pFile.matcher(strFileCon);
            while (mFile.find())
            {
                String strFileMatch = mFile.group();
                strFileMatch = strFileMatch.substring(15, strFileMatch.length()-1);
                String strFolder = strFileMatch.substring(0, 8);
                String strFilePath = WSoftUtil.propertyGetPara("datafilesDir") + "/" + strFileMatch;
                if(!lfiles.contains("f-" + strFolder + strFilePath))
                    lfiles.add("f-" + strFolder + strFilePath);
            }
        }
    }

    public static String dbRedisConfig(String k,RedisCache redisCache) throws Throwable
    {
        Object rv = redisCache.getCacheObject(k);
        if(rv!=null)
        {
            return rv.toString();
        }
        return "";
    }

    public static void dbUpdDataUpdTime(DatalistDao datalistDao,String tblname) throws Throwable
    {
        tblname = tblname.toLowerCase();
        Date curDate = new Date();
        Timestamp curTime = new Timestamp(curDate.getTime());
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String strTime  = sdf.format(curTime);
        datalistDao.updDatas("update data set updtime=? where tablename=?" , new Object[]{strTime,tblname});
    }
    public static String dbUpdGetDataUpdTime(DatalistDao datalistDao,String tblname) throws Throwable
    {
        //Check status from DB each time; performance optimization possible, consider using redis
        String sql = "select updtime from data where tablename=?";
        Map<String,Object> mp = datalistDao.getDataSingle(sql, new Object[]{tblname});
        if(mp!=null&&mp.get("updtime")!=null)
        {
            return (String)mp.get("updtime");
        }
        return "";
    }
    public static Boolean dbComDataUpdTime(DatalistDao datalistDao,Map<String,Object> mpCache,Map<String,String> mpData) throws Throwable
    {
        Set<String> mpTblSet = mpData.keySet();
        String cacheTime = (String)mpCache.get("updtime");
        for (String key : mpTblSet) 
        {
            String tblTime = dbUpdGetDataUpdTime(datalistDao,key);
            if(!tblTime.equals(""))
            {
                if(tblTime.compareTo(cacheTime)>=0)
                {
                    return true;
                }
            }
        }
        return false;
    }
    public static void delWebFiles(String fileNamePart1,String webDir,String pageType) throws Throwable
    {
        File fWebDir = new File(webDir + "/js");
        File[] arrFileWeb = fWebDir.listFiles();
        for (File file : arrFileWeb) 
        {
            String fWebName = file.getName();
            if(fWebName.indexOf(fileNamePart1)==0)
            {
                file.delete();
                if(pageType.equals("1"))
                    delFile(WSoftUtil.propertyGetPara("pagesManageDir") + "/js/" + fWebName);
                else
                    delFile(WSoftUtil.propertyGetPara("pagesPortalDir") + "/js/" + fWebName);
            }
        }

        fWebDir = new File(webDir + "/css");
        arrFileWeb = fWebDir.listFiles();
        for (File file : arrFileWeb) 
        {
            String fWebName = file.getName();
            if(fWebName.indexOf(fileNamePart1)==0)
            {
                file.delete();
                if(pageType.equals("1"))
                    delFile(WSoftUtil.propertyGetPara("pagesManageDir") + "/css/" + fWebName);
                else
                    delFile(WSoftUtil.propertyGetPara("pagesPortalDir") + "/css/" + fWebName);
            }
        }
    }

	public static List<Map<String, Object>> dbDealListMap(List list){
		List<Map<String, Object>> select = new ArrayList<>();
		for (int i=0;i<list.size();i++) 
        {
			 Map<String, Object> resultMap = new HashMap<>();
			 Map<String, Object> map = (Map<String, Object>)list.get(i);
			 Set<String> keySet = map.keySet(); 
			 for (String key : keySet) { 
				 String newKey = key.toUpperCase(); 
				 resultMap.put(newKey, map.get(key)); 
			 }
			 select.add(resultMap);
		}
		return select;
	}

    public static String mobileRandNum() {
        Random random = new Random();
        StringBuffer sb = new StringBuffer();
        for(int i = 0; i <= 3; i++) {
            String s = random.nextInt(10) + "";
            sb.append(s);
        }
        return sb.toString();
    }

    public static String getFirstPage(List lapp)
    {
        String reurl="";
        for(int i=0;i<lapp.size();i++)
        {
            Map<String,String> mp = (Map)lapp.get(i);
            reurl=WSoftUtil.getStrValue(mp.get("LOCATION"));
            if(!reurl.equals(""))
            {
                return reurl;
            }
        }
        return reurl;
    }

    public static void setJosnKeyValue(JSONObject jsonObject,String k,Object v)
    {
        setJsonRemoveKey(jsonObject,k);
        jsonObject.put(k,v);
    }

    public static void setJsonRemoveKey(JSONObject jsonObject,String k) {

        List arr = new ArrayList<>();
        Set<String> jsonset = jsonObject.keySet();
        for (String key : jsonset) 
        {
            String k1 = "," + key.toLowerCase() + ",";
            k = ","+ k.toLowerCase() +",";
            if(k.indexOf(k1)>=0)
            {
                arr.add(key);
            }
        }

        for(int i=0;i<arr.size();i++)
        {
            String key = arr.get(i).toString();
            jsonObject.remove(key);
        }

	}

    public static boolean chkSysTbl(String viewCode)
    {
        if(viewCode.indexOf("tbl")==0||viewCode.indexOf("view")==0)
        {
            return false;
        }
        return true;
    }

}


