<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.io.File" %>
<!DOCTYPE html>
<head>
<meta charset="utf-8" > 
<title>WSoft</title>
</head>
<body scroll="no">

     <% 
     
     File f = new File(request.getRealPath("/") + "portal/pubindex.html");
     if(f.exists())
     {
          response.sendRedirect("portal/pubindex.html");
     }
     else
     {
          response.sendRedirect("manage/login.html");  
     }
     
     
     %>

</body>
</html>