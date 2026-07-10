package com.wzsoft.main;

public class FileUploadResponse {
 
    private String fileName;

    private String filePath;

    private String fileDownloadUri;

    private String fileType;

    private long fileSize;

    private String fileGuid;

    public FileUploadResponse(String fileGuid,String filePath,String fileName, String fileType, long fileSize) {
        this.fileGuid=fileGuid;
        this.filePath = filePath;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }

    public String getFileGUID() {
        return fileGuid;
    }

    public void setFileGUID(String fileGuid) {
        this.fileGuid = fileGuid;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileDownloadUri() {
        return fileDownloadUri;
    }

    public void setFileDownloadUri(String fileDownloadUri) {
        this.fileDownloadUri = fileDownloadUri;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

}