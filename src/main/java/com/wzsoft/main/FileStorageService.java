package com.wzsoft.main;

import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService 
{
    Map<String,Object> storeFile(MultipartFile file,boolean needdb)  throws Throwable ;
    Resource loadFileAsResource(String fileName,String conType);
    String getFilePath(Map<String,Object> mp);
    String getConType(Map<String,Object> mp);
    Map<String,Object> getFile(String fileGuid)  throws Throwable ;
    
}