package com.wzsoft.main;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.ResourceUtils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class UserAop {

    private Map<String, UserLog> mapLog = new HashMap<String,UserLog>();
    private int numLog = 0;

    @Before("execution(public * com.wzsoft.main.DatalistRestController.*(..))")
    public void logit1()  throws Exception {

    }

    @After("execution(public * com.wzsoft.main.DatalistRestController.*(..))")
    public void logit2()  throws Exception {

    }
    @Around("execution(public * com.wzsoft.main.DatalistRestController.*(..))")
    public Object logit3(ProceedingJoinPoint joinPoint)  throws Throwable {

        String strPsnId = "";
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
        { 
            UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
            Long pid = userDetails.getUser().getId();
            strPsnId = String.valueOf(pid);
        }
        Object obj = null;
        Object[] args = joinPoint.getArgs();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String methodName = signature.getDeclaringTypeName() + "." + signature.getName();

        Date now1 = new Date();
        SimpleDateFormat sdf=new SimpleDateFormat("yyyyMMddhhmmssSSS");
        String str1 = sdf.format(now1);
        str1="Start:"+ strPsnId + "|" + methodName + "|" + str1;

        obj = joinPoint.proceed(args);

        Date now2 = new Date();
        String str2 = sdf.format(now2);
        str2=str2+"|Stop:"+methodName;

        writeLog(str1,str2);
        writeStatLog(methodName,now1,now2);

        return obj;
    }

    private void writeLog(String str1,String str2) throws Throwable {

        String logDir = ResourceUtils.getURL("classpath:").getPath() ;
        BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(logDir+"/serverinfo.txt"),true),"utf-8"));
        bw.write(str1+"|"+str2);
        bw.write("\r\n");
        bw.flush();
        bw.close();
    }
    private void writeStatLog(String mname,Date now1,Date now2) throws Throwable {

        String logDir = ResourceUtils.getURL("classpath:").getPath();
        long diff = now2.getTime() - now1.getTime();
        UserLog ulog = null;
        SimpleDateFormat sdf=new SimpleDateFormat("yyyyMMddhhmmssSSS");
        if (mapLog.containsKey(mname)) {
            ulog = mapLog.get(mname);
            long evtime = ulog.evtime;
            long evnum = ulog.evnum;
            long mtime = ulog.mtime;
            String mdate = ulog.mdate;
            ulog.evtime = (evtime*evnum+diff)/(evnum+1);
            ulog.evnum = evnum + 1;
            if (diff>mtime){
                ulog.mtime = diff;
                ulog.mdate = sdf.format(now1);
            }
            mapLog.put(mname,ulog);
        }
        else{
            ulog = new UserLog();
            ulog.mname = mname;
            ulog.evtime=diff;
            ulog.evnum=1;
            ulog.mtime=diff;
            ulog.mdate=sdf.format(now1);
            mapLog.put(mname,ulog);
        }
        this.numLog = this.numLog+1;
        if (this.numLog>5) {
            this.numLog = 0;
            BufferedWriter bw=new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(logDir+"/serverstatinfo.txt")),"utf-8"));
            bw.write(mapLog.toString());
            bw.flush();
            bw.close();
        }
    }
}