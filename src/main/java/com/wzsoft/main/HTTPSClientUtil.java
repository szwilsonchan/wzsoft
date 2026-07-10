package com.wzsoft.main;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
 
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;
 
public class HTTPSClientUtil {
    private static final String DEFAULT_CHARSET = "UTF-8";
    
    // Map-type parameters
    public static String doPost(HttpClient httpClient, String url, Map<String, String> paramHeader,
            Map<String, String> paramBody) throws Exception {
        return doPost(httpClient, url, paramHeader, paramBody, DEFAULT_CHARSET);
    }
 
    public static String doPost(HttpClient httpClient, String url, Map<String, String> paramHeader,
            Map<String, String> paramBody, String charset) throws Exception {
 
        String result = null;
        HttpPost httpPost = new HttpPost(url);
        setHeader(httpPost, paramHeader);
        setBody(httpPost, paramBody, charset);
 
        HttpResponse response = httpClient.execute(httpPost);
        if (response != null) {
            HttpEntity resEntity = response.getEntity();
            if (resEntity != null) {
                result = EntityUtils.toString(resEntity, charset);
            }
        }
 
        return result;
    }
    // JSON-type parameters
    public static String doPostJson(HttpClient httpClient, String url,String strJson) throws Exception {
        return doPostJson(httpClient, url, strJson, DEFAULT_CHARSET);
    }
    public static String doPostJson(HttpClient httpClient, String url, String strJson, String charset) throws Exception {
 
        String result = null;
        HttpPost httpPost = new HttpPost(url);

        // Set parameters
        httpPost.addHeader("Accept", "application/json");
        httpPost.addHeader("Content-Type", "application/json");

        StringEntity stringEntity = new StringEntity(strJson,Charset.forName("UTF-8"));
        stringEntity.setContentEncoding("UTF-8");
        stringEntity.setContentType("application/json");

        httpPost.setEntity(stringEntity);
 
        HttpResponse response = httpClient.execute(httpPost);
        if (response != null) {
            HttpEntity resEntity = response.getEntity();
            if (resEntity != null) {
                result = EntityUtils.toString(resEntity, charset);
            }
        }
 
        return result;
    }
    
    public static String doGet(HttpClient httpClient, String url, Map<String, String> paramHeader,
            Map<String, String> paramBody) throws Exception {
        return doGet(httpClient, url, paramHeader, paramBody, DEFAULT_CHARSET);
    }
 
    public static String doGet(HttpClient httpClient, String url, Map<String, String> paramHeader,
            Map<String, String> paramBody, String charset) throws Exception {
 
        String result = null;
        HttpGet httpGet = new HttpGet(url);
        setHeader(httpGet, paramHeader);
 
        HttpResponse response = httpClient.execute(httpGet);
        if (response != null) {
            HttpEntity resEntity = response.getEntity();
            if (resEntity != null) {
                result = EntityUtils.toString(resEntity, charset);
            }
        }
 
        return result;
    }
 
    private static void setHeader(HttpRequestBase request, Map<String, String> paramHeader) {
        // Set Header
        if (paramHeader != null) {
            Set<String> keySet = paramHeader.keySet();
            for (String key : keySet) {
                request.addHeader(key, paramHeader.get(key));
            }
        }
    }
 
    private static void setBody(HttpPost httpPost, Map<String, String> paramBody, String charset) throws Exception {
        // Set parameters
        if (paramBody != null) {
            List<NameValuePair> list = new ArrayList<NameValuePair>();
            Set<String> keySet = paramBody.keySet();
            for (String key : keySet) {
                list.add(new BasicNameValuePair(key, paramBody.get(key)));
            }
 
            if (list.size() > 0) {
                UrlEncodedFormEntity entity = new UrlEncodedFormEntity(list, charset);
                httpPost.setEntity(entity);
            }
        }
    }
}
