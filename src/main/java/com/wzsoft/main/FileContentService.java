package com.wzsoft.main;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service()
public class FileContentService {
    
    @Autowired
    private DatalistDao datalistDao;

    @Transactional
    public void delDatas(String fileGuid)   throws Throwable  
    {
        datalistDao.addDatas("delete filecontent where fileguid=?", new Object[]{fileGuid}); 
    }

    @Transactional
    public void addDatas(String fileGuid,String fileName,String filePath,Long fileSize,String fileType,String conType)  throws Throwable 
    {
        datalistDao.addDatas("insert into filecontent (fileguid,filename,filepath,filesize,filetype,contype) values(?,?,?,?,?,?) ", new Object[]{fileGuid,fileName,filePath,fileSize,fileType,conType});    
    }

    public Map<String,Object> getFile(String fileGuid)  throws Throwable 
    {
        Map<String,Object> mp = datalistDao.getDataSingle("select * from filecontent where fileguid=?", new Object[]{fileGuid});
        return mp;
    }
}

