package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

import com.alibaba.fastjson.*;


@Service()
public class MsgTempService {
    
    @Autowired
    private DatalistDao datalistDao;

    public List getDataItem(String itemIDs,JSONObject jsonObject)   throws Throwable  
    {

        String sql = "select GUID,MSGCONTENT,MSGKEYS,MSGTITLE,MSGTYPE,NAME,TEMPID  from msg_template where guid=?";
        List lreturn = datalistDao.getDatasWeb(sql, new Object[]{itemIDs});
        return lreturn;
    }

}
