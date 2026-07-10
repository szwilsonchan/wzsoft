package com.wzsoft.main;

import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
 
public class HTTPSTrustClient extends HTTPSClient {
 
    public HTTPSTrustClient() {
 
    }
 
    @Override
    public void prepareCertificate() throws Exception {
        // Skip certificate verification
        SSLContext ctx = SSLContext.getInstance("TLS");
        X509TrustManager tm = new X509TrustManager() {
            @Override
            public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            }
 
            @Override
            public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
            }
 
            @Override
            public X509Certificate[] getAcceptedIssuers() {
                return null;
            }
        };
        // Set as trusted certificate
        ctx.init(null, new TrustManager[] { tm }, null);
        this.connectionSocketFactory = new SSLConnectionSocketFactory(ctx);
    }
}
