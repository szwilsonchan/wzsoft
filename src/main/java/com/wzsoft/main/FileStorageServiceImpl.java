package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;
    private final Path pdfStorageLocation;

    @Autowired
    private FileContentService fService;

    @Autowired
    public FileStorageServiceImpl(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
        this.pdfStorageLocation = Paths.get(fileStorageProperties.getPdfDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create directory where the uploaded files will be stored");
        }
    }

    @Override
    public Map<String,Object> storeFile(MultipartFile file,boolean needdb) throws Throwable  {
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        try {
            if (fileName.contains("..")) {
                throw new FileStorageException("File name contains invalid path sequence");
            }

            Map<String,Object> mp = new HashMap<>();
            String fileGuid = WSoftUtil.genGuid(null);

            Date day=new Date();
            SimpleDateFormat sdf= new SimpleDateFormat("yyyyMMdd");
            String curDate = sdf.format(day);
            String curDateDir = this.fileStorageLocation.toString() + "/" + curDate;
            new File(curDateDir).mkdirs();

            String filePath = curDate + "/" + fileGuid + fileName.substring(fileName.indexOf("."));

            mp.put("fileGuid",fileGuid);
            mp.put("filePath",filePath);
            Path targetLocation = this.fileStorageLocation.resolve(filePath);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            if(needdb)
                fService.addDatas(fileGuid, fileName, filePath, file.getSize(),file.getContentType(),"normal");

            return mp;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again later!", ex);
        }
    }

    public String getFilePath(Map<String,Object> mp) 
    {
        return mp.get("filepath").toString();
    }

    public String getConType(Map<String,Object> mp) 
    {
        return mp.get("contype").toString();
    }

    public Map<String,Object> getFile(String fileGuid)  throws Throwable 
    {
        Map<String,Object> mp = fService.getFile(fileGuid);
        return mp;
    }

    @Override
    public Resource loadFileAsResource(String fileName,String conType) {
        try{


            Path filePath = null;
            if(conType.equals("datapdf"))
                filePath = this.pdfStorageLocation.resolve(fileName).normalize();
            else
                filePath =this.fileStorageLocation.resolve(fileName).normalize();

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()){
                return resource;
            }else{
                throw new FileStorageException("File not found" + fileName);
            }
        }catch (MalformedURLException ex){
            throw new FileStorageException("File not found" + fileName);
        }
    }
}