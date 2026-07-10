package com.wzsoft.main;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.alibaba.fastjson.JSONObject;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;


@RestController
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);
    private final FileStorageService storageService;
    
    public FileController(FileStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/api/uploadFile")
    public FileUploadResponse uploadFile(@RequestParam("file")MultipartFile file)  throws Throwable {
        
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        Map<String,Object> mp = storageService.storeFile(file,true);
        return new FileUploadResponse(mp.get("fileGuid").toString(),mp.get("filePath").toString(),fileName,file.getContentType(),file.getSize());
    }

    @PostMapping("/portal/api/uploadFile")
    public FileUploadResponse uploadFilePortal(@RequestParam("file")MultipartFile file)  throws Throwable {
        
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        Map<String,Object> mp = storageService.storeFile(file,true);
        return new FileUploadResponse(mp.get("fileGuid").toString(),mp.get("filePath").toString(),fileName,file.getContentType(),file.getSize());
    }

    @PostMapping("/api/uploadFileNoDb")
    public FileUploadResponse uploadFileNoDb(@RequestParam("file")MultipartFile file)  throws Throwable {
        
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        Map<String,Object> mp = storageService.storeFile(file,false);
        return new FileUploadResponse(mp.get("fileGuid").toString(),mp.get("filePath").toString(),fileName,file.getContentType(),file.getSize());
    }

    @RequestMapping("/api/downloadFile")
    public ResponseEntity<Resource> downloadFile(@RequestBody JSONObject jsonObject, HttpServletRequest request) throws Throwable {
        
        return downloadFileDo(jsonObject,request);
    }
    @RequestMapping("/portal/api/downloadFile")
    public ResponseEntity<Resource> downloadFilePortal(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable {
        
        return downloadFileDo(jsonObject,request);
    }
    private ResponseEntity<Resource> downloadFileDo(@RequestBody JSONObject jsonObject, HttpServletRequest request)  throws Throwable 
    {
        String fileGuid = jsonObject.getString("fileGuid");
        Map<String,Object> mp  = storageService.getFile(fileGuid);
        String filePath = storageService.getFilePath(mp);
        String conType=storageService.getConType(mp);


        Resource resource = storageService.loadFileAsResource(filePath,conType);

        String contentType = null;
        try{
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        }catch (IOException ex){
            logger.info("Could not determine file type");
        }

        if (contentType == null){
            contentType = "application/octet-stream";
        }
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}