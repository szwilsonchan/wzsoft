package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SpringTask {

    @Autowired
    private MsgService msgService;
    @Autowired
    private CodeGenService codeService;

    @Scheduled(fixedRate = 60000)
    public void taskMail() throws Throwable
    {
        if(WSoftUtil.propertyGetPara("taskrun").equals("true"))
        {
            System.out.println(Thread.currentThread().getName()+":taskmail--->");
            Thread.sleep(2000);

            if(WSoftUtil.propertyGetPara("mailmode").equals("ssl"))
            {
                msgService.sendMailsSsl();
            }
            else
            {
                msgService.sendMails();
            }
        }
    }

    @Scheduled(fixedRate = 60000)
    public void taskMsg() throws Throwable
    {
        if(WSoftUtil.propertyGetPara("taskrun").equals("true"))
        {
            System.out.println(Thread.currentThread().getName()+":taskmsg--->");
            Thread.sleep(2000);

            msgService.sendMsgs();
        }
    }

    @Scheduled(fixedRate = 60000)
    public void taskCode() throws Throwable
    {
        if(WSoftUtil.propertyGetPara("taskrun").equals("true"))
        {
            System.out.println(Thread.currentThread().getName()+":taskcode--->");
            Thread.sleep(2000);

            codeService.codeTask();
        }

    }
}
