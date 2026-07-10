package com.wzsoft.main;

import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.util.ResourceBundle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.util.ResourceUtils;

import com.alibaba.nacos.api.annotation.NacosInjected;
import com.alibaba.nacos.api.naming.NamingService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter 
{

    //@NacosInjected
    //private NamingService namingService;

    @Autowired
    JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;

    @Autowired
    private RedisCache redisCache;

    @Bean
    public BCryptPasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    /*@Bean
    SecurityDiyFilter securityDiyFilter()  throws Exception {
        SecurityDiyFilter securityDiyFilter = new SecurityDiyFilter();
        securityDiyFilter.setFilterProcessesUrl("/login");
        securityDiyFilter.setAuthenticationSuccessHandler(((request, response, authentication) -> {
            response.getWriter().write(authentication.getName());
        }));
        securityDiyFilter.setAuthenticationManager(authenticationManager());
        return securityDiyFilter;
    }*/

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(new SecurityDiyProvider(passwordEncoder()));
    }

    @Value("${server.port}")
    private int svrport;

    @Override
    public void configure(HttpSecurity httpSecurity) throws Exception {


        ResourceBundle rBundle = ResourceBundle.getBundle("application");

        httpSecurity.csrf().disable();
        httpSecurity.headers().frameOptions().sameOrigin();
        httpSecurity.formLogin().loginPage(rBundle.getString("loginpage"));
        
        httpSecurity.authorizeRequests().antMatchers("/favicon.ico").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/login.html").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/login_*.html").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/reg_*.html").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/login").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/getpassword").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/setpassword").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/regorg").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/regpsn").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/psnconfirm").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/logout").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/getcpacha").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/user/getmobilemsgchk").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/js/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/form_pubtbl**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/js/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/imgs/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/imgs/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/css/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/css/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/manage/iconfont/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/portal/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/upload/**").permitAll();
        httpSecurity.authorizeRequests().antMatchers("/index.jsp").permitAll();

        httpSecurity.authorizeRequests().anyRequest().authenticated();
        httpSecurity.addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);

        String dbType = rBundle.getString("dbtype");
        String fileSvr = rBundle.getString("filesvr");
        
        String templatesDir = fileSvr + "/templates";
        String pagesPortalDir = fileSvr + "/portal";
        String pagesManageDir = fileSvr + "/manage";
        String configDir = fileSvr + "/config";
        String codesDir = fileSvr + "/codes";
        String codelogsDir = fileSvr + "/codelogs";
        String wfmDir = fileSvr + "/wfms";
        String datafilesDir = fileSvr + "/uploadfiles/datafiles";
        String pdffilesDir = fileSvr + "/pdffiles";
        copyFileSvr(templatesDir,pagesPortalDir,pagesManageDir,configDir,codesDir,codelogsDir,wfmDir);

        WSoftUtil.propertySetPara("fileSvr", fileSvr);
        WSoftUtil.propertySetPara("dbType", dbType);
        WSoftUtil.propertySetPara("datafilesDir", datafilesDir);
        WSoftUtil.propertySetPara("templatesDir", templatesDir);
        WSoftUtil.propertySetPara("configDir", configDir);
        WSoftUtil.propertySetPara("pagesPortalDir", pagesPortalDir);
        WSoftUtil.propertySetPara("pagesManageDir", pagesManageDir);
        WSoftUtil.propertySetPara("codesDir", codesDir);
        WSoftUtil.propertySetPara("codelogsDir", codelogsDir);
        WSoftUtil.propertySetPara("wfmDir", wfmDir);
        WSoftUtil.propertySetPara("pdffilesDir", pdffilesDir);

        String mailmode = rBundle.getString("mailmode");
        String mailpsndaynum = rBundle.getString("mailpsndaynum");
        String mailhost = rBundle.getString("mailhost");
        String mailusername = rBundle.getString("mailusername");
        String mailpassword = rBundle.getString("mailpassword");
        WSoftUtil.propertySetPara("mailmode", mailmode);
        WSoftUtil.propertySetPara("mailpsndaynum", mailpsndaynum);
        WSoftUtil.propertySetPara("mailhost", mailhost);
        WSoftUtil.propertySetPara("mailusername", mailusername);
        WSoftUtil.propertySetPara("mailpassword", mailpassword);

        String msgsign = rBundle.getString("msgsign");
        String msgpsndaynum = rBundle.getString("msgpsndaynum");
        String msgtmcode = rBundle.getString("msgtmcode");
        String msgkeyid = rBundle.getString("msgkeyid");
        String msgkeysecret = rBundle.getString("msgkeysecret");
        String gwebsite = rBundle.getString("gwebsite");

        WSoftUtil.propertySetPara("msgsign", msgsign);
        WSoftUtil.propertySetPara("msgpsndaynum", msgpsndaynum);
        WSoftUtil.propertySetPara("msgtmcode", msgtmcode);
        WSoftUtil.propertySetPara("msgkeyid", msgkeyid);
        WSoftUtil.propertySetPara("msgkeysecret", msgkeysecret);
        WSoftUtil.propertySetPara("gwebsite", gwebsite);

        String dataredistime = rBundle.getString("dataredistime");
        redisCache.setCacheObject("gDataRedisTime", dataredistime);

        String codefunc = rBundle.getString("codefunc");
        redisCache.setCacheObject("gCodeFunc", codefunc);

        if(!rBundle.getString("nacos.discovery.server-addr").equals(""))
        {
            String currentIP = InetAddress.getLocalHost().getHostAddress();
            //namingService.registerInstance(rBundle.getString("spring.application.name"), currentIP, svrport);
        }

        WSoftUtil.propertySetPara("taskrun", rBundle.getString("taskrun"));
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    private static void copyFileSvr(String templatesDir,String pagesPortalDir,String pagesManageDir,String configDir,String codesDir,String codelogsDir,String wfmDir) 
    {
        try 
        {

            String adminDirWeb = ResourceUtils.getURL("classpath:").getPath();
            adminDirWeb = adminDirWeb.replaceAll("/WEB-INF/classes", "/admin");
            WSoftUtil.copyDirs(new File(templatesDir),new File(adminDirWeb));
            WSoftUtil.copyDirs(new File(configDir),new File(adminDirWeb));
            WSoftUtil.copyDirs(new File(codesDir),new File(adminDirWeb));
            WSoftUtil.copyDirs(new File(codelogsDir),new File(adminDirWeb));
            WSoftUtil.copyDirs(new File(wfmDir),new File(adminDirWeb));

            String pagesDirWeb = ResourceUtils.getURL("classpath:").getPath();
            pagesDirWeb = pagesDirWeb.replaceAll("/WEB-INF/classes", "/");
            WSoftUtil.copyDirs(new File(pagesPortalDir),new File(pagesDirWeb));
            WSoftUtil.copyDirs(new File(pagesManageDir),new File(pagesDirWeb));


        } catch (IOException e) {
            e.printStackTrace();
        }

    }

}
