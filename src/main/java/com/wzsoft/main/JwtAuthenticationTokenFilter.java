package com.wzsoft.main;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;

@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    @Autowired
    private RedisCache redisCache;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        UsernamePasswordAuthenticationToken authenticationToken = null;
        String strUrl = request.getServletPath().toLowerCase();
        if((strUrl.endsWith(".html")||strUrl.indexOf("/api/")==0)&&(!(strUrl.indexOf("/portal")==0))&&(!(strUrl.indexOf("/upload/")==0)))
        { 
            authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if(authenticationToken==null)
            {
                //Get token
                String token = request.getParameter("token");
                if (token!=null&&!token.equalsIgnoreCase("")) 
                {
                    // Parse token
                    String userid;
                    try {
                        Claims claims = JwtUtil.parseJWT(token);
                        userid = claims.getSubject();
                    } catch (Exception e) {
                        e.printStackTrace();
                        throw new RuntimeException("Token invalid");
                    }

                    String redisKey = "login:" + userid;
                    UserLogin loginUser = redisCache.getCacheObject(redisKey);
                    if(loginUser==null){
                        throw new RuntimeException("User not logged in");
                    }

                    authenticationToken =
                    new UsernamePasswordAuthenticationToken(loginUser,null,null);
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
                else
                {
                    //throw new RuntimeException("Token is empty"); 
                }
            }
            if(authenticationToken!=null&&authenticationToken.getPrincipal()!=null)
            { 
                UserLogin userDetails = (UserLogin)authenticationToken.getPrincipal();
                if(userDetails.getUser().getId()!=1)
                {
                    boolean bOk = false;
                    if(!(strUrl.equals("/index.html")||
                        strUrl.equals("/manage/login.html")||
                        strUrl.equals("/manage/editor.html")||
                        strUrl.indexOf("/manage/selrole.html")==0||
                        strUrl.equals("/api/datalist")||
                        strUrl.equals("/api/datalistexcel")||
                        strUrl.equals("/api/datasubmit")||
                        strUrl.equals("/api/dataapprove")||
                        strUrl.equals("/api/datadel")||
                        strUrl.equals("/api/datadelmsg")||
                        strUrl.equals("/api/dataget")||
                        strUrl.equals("/api/dataadd")||
                        strUrl.equals("/api/dataupd")||
                        strUrl.equals("/api/datainit")||
                        strUrl.equals("/api/dataformgetlist")||
                        strUrl.equals("/api/datagenpdf")||
                        strUrl.indexOf("/api/dataorg")==0||
                        strUrl.indexOf("/api/datadept")==0||
                        strUrl.indexOf("/api/datapsn")==0||
                        strUrl.indexOf("/api/wfmwork")==0||
                        strUrl.indexOf("/manage/form_tbl")==0||     // Allow permission to view details during review
                        strUrl.indexOf("/manage/form_pubtbl")==0||   // Allow permission to view details during review
                        strUrl.equals("/api/codedo")||
                        strUrl.equals("/api/uploadfile")||
                        strUrl.equals("/api/uploadfilenodb")||
                        strUrl.equals("/api/downloadfile")||
                        strUrl.equals("/api/msgtempget")))
                    {
                        List lrolepage = (List)request.getSession().getAttribute("rolepages");
                        for(int j=0;j<lrolepage.size();j++)
                        {
                            Map<String,Object> mrolepage = (Map)lrolepage.get(j);
                            if(mrolepage.get("LOCATION")!=null)
                            {
                                String rolepage = (String)mrolepage.get("LOCATION");
                                rolepage = "/manage/"+rolepage; 
                                if(strUrl.toLowerCase().indexOf(rolepage.toLowerCase())==0)
                                {
                                    bOk = true;
                                    break;
                                }
                            }
                        }
                        if(!bOk)
                        {
                            throw new RuntimeException("Unauthorized access"); 
                        }
                    }
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
}


