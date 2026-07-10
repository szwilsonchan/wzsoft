package com.wzsoft.main;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

public class WSoftUtilZip
{

    public static void unzip(String zipFilePath, String descDir) 
    {
        try {
            File descFile = new File(descDir);
            if (!descFile.exists()) {
                descFile.mkdirs();
            }
            ZipFile zipFile = new ZipFile(zipFilePath);
            // List all items, including subdirectories and their files
            Enumeration<? extends ZipEntry> zs = zipFile.entries();
            while (zs.hasMoreElements()) {
                ZipEntry zipEntry = zs.nextElement();
                if (!zipEntry.isDirectory()) {
                    InputStream in = zipFile.getInputStream(zipEntry);
                    OutputStream os = new FileOutputStream(descDir + File.separator + zipEntry.getName());
                    byte[] data = new byte[1024];
                    int len = -1;
                    while ((len = in.read(data)) != -1) {
                        os.write(data, 0, len);
                    }
                    os.flush();
                    os.close();
                    in.close();
                } else {
                    new File(descDir + File.separator + zipEntry.getName()).mkdirs();
                }
            }
            zipFile.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void ZipMultiFile(List<String> files ,String zippath) {
        try {

            File zipFile = new File(zippath);
            InputStream input = null;
            ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(zipFile));

            for(int i = 0; i < files.size(); ++i){
                String filePath = files.get(i);
                String fileFolder = "";
                if(filePath.indexOf("f-")==0)
                {
                    fileFolder = filePath.substring(2,10);
                    filePath = filePath.substring(10);
                    try
                    {
                        // May show duplicate entry warning, so ignore errors
                        zipOut.putNextEntry(new ZipEntry("upload/"));
                    } catch (Exception e) {
                        //e.printStackTrace();
                    }
                    
                    try
                    {
                        // May show duplicate entry warning, so ignore errors
                        zipOut.putNextEntry(new ZipEntry("upload/"+fileFolder+"/"));
                    } catch (Exception e) {
                        //e.printStackTrace();
                    }
                }
                File file = new File(filePath);
                if(file.exists())
                {
                    input = new FileInputStream(file);

                    if(fileFolder.equals(""))
                    {
                        try
                        {
                            // May have duplicate files, so ignore errors
                            zipOut.putNextEntry(new ZipEntry(file.getName()));
                            int temp = 0;
                            while((temp = input.read()) != -1){
                                zipOut.write(temp);
                            }
                            input.close();

                        } catch (Exception e) {
                            //e.printStackTrace();
                        }
                    }
                    else
                    {
                        try
                        {
                            // May have duplicate files, so ignore errors
                            zipOut.putNextEntry(new ZipEntry("/upload/" + fileFolder + "/" + file.getName()));
                            int temp = 0;
                            while((temp = input.read()) != -1){
                                zipOut.write(temp);
                            }
                            input.close();
                            
                        } catch (Exception e) {
                            //e.printStackTrace();
                        }
                    }
                }
            }

            zipOut.close();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Export Error");
        }
    }

}