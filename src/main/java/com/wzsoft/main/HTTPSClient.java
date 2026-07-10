package com.wzsoft.main;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
 
public abstract class HTTPSClient extends HttpClientBuilder {
    private CloseableHttpClient client;
    protected ConnectionSocketFactory connectionSocketFactory;
 
    /**
     * Initialize HTTPSClient
     * 
     * @return current instance
     * @throws Exception
     */
    public CloseableHttpClient init() throws Exception {
        this.prepareCertificate();
        this.regist();
 
        return this.client;
    }
 
    /**
     * Prepare certificate verification
     * 
     * @throws Exception
     */
    public abstract void prepareCertificate() throws Exception;
 
    /**
     * Register protocol and port; can be overridden by subclasses
     */
    protected void regist() {
        // Set protocol http/https corresponding socket factory objects
        Registry<ConnectionSocketFactory> socketFactoryRegistry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", PlainConnectionSocketFactory.INSTANCE)
                .register("https", this.connectionSocketFactory)
                .build();
        PoolingHttpClientConnectionManager connManager = new PoolingHttpClientConnectionManager(socketFactoryRegistry);
        HttpClients.custom().setConnectionManager(connManager);
 
        // Create custom httpclient object
        this.client = HttpClients.custom().setConnectionManager(connManager).build();
        // CloseableHttpClient client = HttpClients.createDefault();
    }
}
