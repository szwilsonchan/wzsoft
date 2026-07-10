package com.wzsoft.main;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.List;

import com.alibaba.fastjson.*;

@RestController
public class TmpRestController {
    
    @Autowired
    private DatalistService dService;

    @RequestMapping("/api/datatmpupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");

        String tmpFile="";
        if(jsonObject.containsKey("tmpfile"))
            tmpFile=jsonObject.getString("tmpfile");

        if(!tmpFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirAdmin = configDir.replaceAll("/WEB-INF/classes", "/admin");
            String configDirTmp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates/upload/templates");

            File targetDir = new File(configDirTmp);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }
            else
            {
                WSoftUtil.deleteDir(targetDir);
                targetDir.mkdirs();
            }

            tmpFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + tmpFile;
            WSoftUtilZip.unzip(tmpFile,configDirTmp);
            WSoftUtil.copyDirs(targetDir,new File(configDirAdmin));
            WSoftUtil.copyDirs(targetDir,new File(WSoftUtil.propertyGetPara("fileSvr")));

        }

        List datalist = dService.updDatas(viewCode, itemIDs,jsonObject);
        return datalist;
    }
    @RequestMapping("/api/datatmpadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");

        String tmpFile="";
        if(jsonObject.containsKey("tmpfile"))
            tmpFile=jsonObject.getString("tmpfile");

        if(!tmpFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            String configDirAdmin = configDir.replaceAll("/WEB-INF/classes", "/admin");
            String configDirTmp = configDir.replaceAll("/WEB-INF/classes", "/admin/templates/upload/templates");

            File targetDir = new File(configDirTmp);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }
            else
            {
                targetDir.delete();
                targetDir.mkdirs(); 
            }

            tmpFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + tmpFile;
            WSoftUtilZip.unzip(tmpFile,configDirTmp);
            WSoftUtil.copyDirs(targetDir,new File(configDirAdmin));
            WSoftUtil.copyDirs(targetDir,new File(WSoftUtil.propertyGetPara("fileSvr")));

        }

        List datalist = dService.addDatas(viewCode, jsonObject);
        return datalist;
    }

}


