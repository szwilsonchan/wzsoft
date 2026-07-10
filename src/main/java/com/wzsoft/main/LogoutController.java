package com.wzsoft.main;

import java.util.HashMap;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class LogoutController {
    
    @Autowired
    private LoginService loginService;

    @RequestMapping("/user/logout")
    public String logout(HttpSession session){
        loginService.logout();
        session.invalidate();
        return "forword:/manage/login.html";
    }

}
