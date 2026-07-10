package com.wzsoft.main;

import org.apache.activemq.ActiveMQConnection;
import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ActiveMqConfig {
    @Bean
    public ActiveMQConnectionFactory createAMFactory() {
        ActiveMQConnectionFactory activeMqfactory = new ActiveMQConnectionFactory(ActiveMQConnection.DEFAULT_USER, ActiveMQConnection.DEFAULT_PASSWORD, "tcp://192.168.150.90:61616");
        activeMqfactory.setTrustAllPackages(true);
        return activeMqfactory;
    }
}

