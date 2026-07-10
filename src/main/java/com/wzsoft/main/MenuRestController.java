package com.wzsoft.main;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.alibaba.fastjson.*;


@RestController
public class MenuRestController {

    @Autowired
    DatalistDao datalistDao;

    @RequestMapping("/apimenu/getcur")
    public String getCurrentLocation(HttpServletRequest request,HttpSession session) {
        
        String currentLocation=request.getParameter("currentLocation");
        if(currentLocation!=null&&!currentLocation.equals(""))
            session.setAttribute("CurrentLocation",currentLocation);
        else
            currentLocation = (String)session.getAttribute("CurrentLocation");
        return currentLocation;
    }

    
    @RequestMapping("/portal/apimenu/getcur")
    public String getPortalCurrentLocation(HttpServletRequest request,HttpSession session) {
        
        String currentLocation=request.getParameter("currentLocation");
        if(currentLocation!=null&&!currentLocation.equals(""))
            session.setAttribute("PortalCurrentLocation",currentLocation);
        else
            currentLocation = (String)session.getAttribute("PortalCurrentLocation");
        return currentLocation;
    }


    @RequestMapping("/apimenu/getlist")
    public List getMenu(@RequestBody JSONObject jsonObject,HttpServletRequest request)  throws Throwable  {
        
        String apptype=jsonObject.getString("apptype");
        String mrole="";
        String mdate="";

        List lreturn=new ArrayList<>();
        if(jsonObject.containsKey("mrole"))
        {
            mrole = jsonObject.getString("mrole");
            mdate = jsonObject.getString("mdate");
            if(mrole.equals(request.getSession().getAttribute("mrole").toString()))
            {
                String tblTime = WSoftUtil.dbUpdGetDataUpdTime(datalistDao,"role_app");
                if(!tblTime.equals(""))
                {
                    if(tblTime.compareTo(mdate)<0)
                    {
                        lreturn.add(null);
                        return lreturn;
                    }
                }
            }
        }

        if(apptype.equals("1"))
            lreturn.add(request.getSession().getAttribute("menupc"));
        else if (apptype.equals("2"))
            lreturn.add(request.getSession().getAttribute("menumobile"));

        HashMap<String,String> mr = new HashMap<>();
        java.util.Date curDate = new java.util.Date();
        Timestamp curTime = new Timestamp(curDate.getTime());
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String strTime  = sdf.format(curTime);

        mr.put("mrole",request.getSession().getAttribute("mrole").toString());
        mr.put("mdate",strTime);
        lreturn.add(mr);

        return lreturn;
    }

}