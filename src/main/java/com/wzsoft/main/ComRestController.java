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
public class ComRestController {
    
    @Autowired
    private DatalistService dService;

    @RequestMapping("/api/datacomupd")
    public List updDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String itemIDs=jsonObject.getString("itemIDs");
        String comID=jsonObject.getString("field_COMID");

        String comFile="";
        if(jsonObject.containsKey("comfile"))
            comFile=jsonObject.getString("comfile");

        if(!comFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/config/com");
            configDir = configDir +"/"+comID;

            File targetDir = new File(configDir);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            comFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + comFile;
            WSoftUtilZip.unzip(comFile,configDir);
            WSoftUtil.copyDirs(targetDir,new File(WSoftUtil.propertyGetPara("configDir")+ "/com"));

            jsonObject.put("field_CONFIG","./config/com/"+ comID +"/");

        }

        List datalist = dService.updDatas(viewCode, itemIDs,jsonObject);

        return datalist;
    }
    @RequestMapping("/api/datacomadd")
    public List addDatas(@RequestBody JSONObject jsonObject)  throws Throwable {
        
        String viewCode=jsonObject.getString("viewCode");
        String comID=jsonObject.getString("field_COMID");

        String comFile="";
        if(jsonObject.containsKey("comfile"))
            comFile=jsonObject.getString("comfile");

        if(!comFile.equals(""))
        {
            String configDir = ResourceUtils.getURL("classpath:").getPath();
            configDir = configDir.replaceAll("/WEB-INF/classes", "/admin/config/com");
            configDir = configDir +"/"+comID;

            File targetDir = new File(configDir);
            if (!targetDir.exists()){ 
                targetDir.mkdirs(); 
            }

            comFile = WSoftUtil.propertyGetPara("datafilesDir") + "/" + comFile;
            WSoftUtilZip.unzip(comFile,configDir);
            WSoftUtil.copyDirs(targetDir,new File(WSoftUtil.propertyGetPara("configDir")+ "/com"));

            jsonObject.put("field_CONFIG","./config/com/"+ comID +"/");

        }

        List datalist = dService.addDatas(viewCode, jsonObject);
        return datalist;
    }

}


