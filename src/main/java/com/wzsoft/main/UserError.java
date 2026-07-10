package com.wzsoft.main;


import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Component
public class UserError implements ErrorViewResolver {
    @Override
    public ModelAndView resolveErrorView(HttpServletRequest httpServletRequest, HttpStatus httpStatus, Map<String, Object> map) {
        ModelAndView modelAndView = new ModelAndView("error");
        modelAndView.addObject("myerror",httpServletRequest.getAttribute("javax.servlet.error.exception"));

        modelAndView.addAllObjects(map);
        return modelAndView;
    }
}

