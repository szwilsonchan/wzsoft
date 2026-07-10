package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import com.alibaba.fastjson.JSON;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

@Service()
public class MsgService 
{
    
    @Autowired
    private DatalistDao datalistDao;

    private Boolean chkPsnNum(String strTo)  throws Throwable 
    {
        Boolean chkNum = true;
        String sql = "select count(id) as num from msg_mail where status='2' and toaddr=? and "+ WSoftUtil.dbSqlDateHourDiff("sendedtime") +" <24 ";
        Map<String,Object> mpchk = datalistDao.getDataSingle(sql, new Object[]{strTo});
        if(mpchk!=null)
        {
            Integer psnnumconfig = Integer.parseInt(WSoftUtil.propertyGetPara("mailpsndaynum"));
            Integer psnnum = Integer.parseInt(mpchk.get("num").toString());
            if(psnnum>=psnnumconfig)
            {
                chkNum=false;
                System.out.println("Email exceeds daily per-person limit:"+strTo);
            }
        }
        return chkNum;
    }

    private static Boolean chkPsnNumMsg(String strTo,DatalistDao datalistDao)  throws Throwable 
    {
        Boolean chkNum = true;
        String sql = "select count(id) as num from msg_msg where status='2' and toaddr=? and "+ WSoftUtil.dbSqlDateHourDiff("sendedtime") +" <24 ";
        Map<String,Object> mpchk = datalistDao.getDataSingle(sql, new Object[]{strTo});
        if(mpchk!=null)
        {
            Integer psnnumconfig = Integer.parseInt(WSoftUtil.propertyGetPara("msgpsndaynum"));
            Integer psnnum = Integer.parseInt(mpchk.get("num").toString());
            if(psnnum>=psnnumconfig)
            {
                chkNum=false;
                System.out.println("SMS exceeds daily per-person limit:"+strTo);
            }
        }
        return chkNum;
    }

    public void sendMails()  throws Throwable 
    {

        JavaMailSenderImpl senderImpl = new JavaMailSenderImpl();
        System.setProperty("java.net.preferIPv4Stack", "true");
        senderImpl.setHost(WSoftUtil.propertyGetPara("mailhost"));

        String sql = "select * from msg_mail where status='0' ";
        List lmail = datalistDao.getDatas(sql, new Object[]{});
        for(int j=0;j<lmail.size();j++)
        {
            Map<String,Object> mp=(Map)lmail.get(j);
            String mailid = WSoftUtil.getStrValue(mp.get("id"));
            String status = WSoftUtil.getStrValue(mp.get("status")); 
            String strTo = WSoftUtil.getStrValue(mp.get("toaddr")); 

            if(chkPsnNum(strTo)&&status.trim().equals("0"))
            {
                sql = "update msg_mail set status='1' where id=?";
                datalistDao.updDatas(sql, new Object[]{mailid});
        
                String strFrom = WSoftUtil.propertyGetPara("mailusername"); 
                String strTitle = WSoftUtil.getStrValue(mp.get("title")); 
                String strContent = WSoftUtil.getStrValue(mp.get("content")); 

                MimeMessage mailMessage = senderImpl.createMimeMessage();

                try 
                {
                    MimeMessageHelper messageHelper = new MimeMessageHelper(mailMessage,true,"utf-8"); 
                    //Recipient
                    messageHelper.setTo(strTo);
                    //Sender
                    messageHelper.setFrom(strFrom);
                    //Set email subject
                    messageHelper.setSubject(strTitle);
                    //Set email content, true enables HTML text format  
                    messageHelper.setText(strContent,true);

                    senderImpl.setUsername(WSoftUtil.propertyGetPara("mailusername")) ;
                    senderImpl.setPassword(WSoftUtil.propertyGetPara("mailpassword")) ;
                    
                    Properties prop = new Properties() ;
                    prop.put("mail.smtp.auth", "true") ; // Set this to true to authenticate username and password
                    prop.put("mail.smtp.timeout", "25000") ;
                    senderImpl.setJavaMailProperties(prop);

                    //Send email
                    senderImpl.send(mailMessage);
                    System.out.println("Email sent successfully.");

                    sql = "update msg_mail set status='2',sendedtime="+ WSoftUtil.dbSqlSysdate() +",errormsg=? where id=?";
                    datalistDao.updDatas(sql, new Object[]{"",mailid});

                } catch (MessagingException e) {

                    System.out.println("Email send failed:"+mailid);

                    sql = "update msg_mail set status='3',errormsg=? where id=?";
                    datalistDao.updDatas(sql, new Object[]{e.getMessage(),mailid});
                }
            }

        }

    }

    public void sendMailsSsl()  throws Throwable 
    {

        JavaMailSenderImpl senderImpl = new JavaMailSenderImpl();
        System.setProperty("java.net.preferIPv4Stack", "true");
        senderImpl.setHost(WSoftUtil.propertyGetPara("mailhost"));

        String sql = "select * from msg_mail where status='0' ";
        List lmail = datalistDao.getDatas(sql, new Object[]{});
        for(int j=0;j<lmail.size();j++)
        {
            Map<String,Object> mp=(Map)lmail.get(j);
            String mailid = WSoftUtil.getStrValue(mp.get("id"));
            String status = WSoftUtil.getStrValue(mp.get("status")); 
            String strTo = WSoftUtil.getStrValue(mp.get("toaddr"));

            if(chkPsnNum(strTo)&&status.trim().equals("0"))
            {
                sql = "update msg_mail set status='1' where id=?";
                datalistDao.updDatas(sql, new Object[]{mailid});
        
                String strFrom = WSoftUtil.propertyGetPara("mailusername"); 
                String strTitle = WSoftUtil.getStrValue(mp.get("title")); 
                String strContent = WSoftUtil.getStrValue(mp.get("content")); 

                MimeMessage mailMessage = senderImpl.createMimeMessage();

                try 
                {
                    MimeMessageHelper messageHelper = new MimeMessageHelper(mailMessage,true,"utf-8"); 
                    //Recipient
                    messageHelper.setTo(strTo);
                    //Sender
                    messageHelper.setFrom(strFrom);
                    //Set email subject
                    messageHelper.setSubject(strTitle);
                    //Set email content, true enables HTML text format  
                    messageHelper.setText(strContent,true);

                    senderImpl.setUsername(WSoftUtil.propertyGetPara("mailusername")) ;
                    senderImpl.setPassword(WSoftUtil.propertyGetPara("mailpassword")) ;
                    //Enable SSL
                    Properties properties = new Properties();
                    properties.setProperty("mail.smtp.auth", "true");//Enable authentication
                    properties.setProperty("mail.debug", "true");//Enable debug
                    properties.setProperty("mail.smtp.timeout", "200000");//Set connection timeout
                    properties.setProperty("mail.smtp.port", Integer.toString(25));//Set port
                    properties.setProperty("mail.smtp.socketFactory.port", Integer.toString(465));//Set SSL port
                    properties.setProperty("mail.smtp.socketFactory.fallback", "false");
                    properties.setProperty("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                    senderImpl.setJavaMailProperties(properties);
                    //Send email
                    senderImpl.send(mailMessage);
                    System.out.println("Email sent successfully.");

                    sql = "update msg_mail set status='2',sendedtime="+ WSoftUtil.dbSqlSysdate() +",errormsg=? where id=?";
                    datalistDao.updDatas(sql, new Object[]{"",mailid});

                } catch (MessagingException e) {

                    System.out.println("Email send failed:"+mailid);

                    sql = "update msg_mail set status='3',errormsg=? where id=?";
                    datalistDao.updDatas(sql, new Object[]{e.getMessage(),mailid});
                }
            }

        }
    }

    
    public void sendMsgs()  throws Throwable 
    {

        String sql = "select * from msg_msg where status='0' ";
        List lmail = datalistDao.getDatas(sql, new Object[]{});
        for(int j=0;j<lmail.size();j++)
        {
            Map<String,Object> mp=(Map)lmail.get(j);
            String mailid = WSoftUtil.getStrValue(mp.get("id"));
            String status = WSoftUtil.getStrValue(mp.get("status")); 
            String strTo = WSoftUtil.getStrValue(mp.get("toaddr")); 
            String strContent = WSoftUtil.getStrValue(mp.get("content")); 
            sendMsgSingle(mailid,status,strTo,strContent,datalistDao);
        }

    }

    public static void sendMsgSingle(String mailid,String status,String strTo,String strContent,DatalistDao datalistDao)  throws Throwable 
    {
        // Signature
        String signName = WSoftUtil.propertyGetPara("msgsign");

        // SMS configuration
        String accessKeyId = WSoftUtil.propertyGetPara("msgkeyid");
        String accessKeySecret = WSoftUtil.propertyGetPara("msgkeysecret");

        String sql="";
        if(chkPsnNumMsg(strTo,datalistDao)&&status.trim().equals("0"))
        {
            sql = "update msg_msg set status='1' where id=?";
            datalistDao.updDatas(sql, new Object[]{mailid});
            try 
            {

                HttpClient httpClient = HttpClients.createDefault();
                HttpPost httpPost = new HttpPost("https://api.4321.sh/sms/send");
                httpPost.addHeader("Content-Type","application/json");
                Map<String,Object> map = new HashMap<>();
                map.put("apikey",accessKeyId);
                map.put("secret",accessKeySecret);
                map.put("sign_id",signName);
                map.put("mobile",strTo);
                map.put("content",strContent);
                String json = JSON.toJSONString(map);
                httpPost.setEntity(new StringEntity(json,"UTF-8"));

                //Temporary comment
                //HttpResponse response = httpClient.execute(httpPost);
                //HttpEntity entity = response.getEntity();
                //String res = EntityUtils.toString(entity);
                //Temporary comment

                String res = "    msg\":\"OK";
                if(res.indexOf("msg\":\"OK")>0)
                {
                    System.out.println("SMS sent successfully:"+mailid);
                    sql = "update msg_msg set status='2' where id=?";
                    datalistDao.updDatas(sql, new Object[]{mailid});
                }
                else
                {
                    System.out.println("SMS send failed:"+mailid);
                    sql = "update msg_msg set status='3',errormsg=? where id=?";
                    datalistDao.updDatas(sql, new Object[]{res,mailid});
                }

            } catch (Exception e) {

                System.out.println("SMS send failed:"+mailid);
                sql = "update msg_msg set status='3',errormsg=? where id=?";
                datalistDao.updDatas(sql, new Object[]{e.getMessage(),mailid});
            }
        }
    }
}
