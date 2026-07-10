package com.wzsoft.main;

import java.nio.file.Path;
import java.util.ResourceBundle;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileConfig implements WebMvcConfigurer 
{

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        ResourceBundle rBundle = ResourceBundle.getBundle("application");
        String webDir = rBundle.getString("webdir");
        String fileSvr = rBundle.getString("filesvr");
        String datafilesDir = fileSvr + "/uploadfiles/datafiles";

        registry.addResourceHandler(webDir)
                .addResourceLocations("file:" + datafilesDir + "/");
    }

}