package com.assetra.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Upload upload = new Upload();
    private Cors cors = new Cors();

    // Getters
    public Upload getUpload() { return upload; }
    public Cors getCors() { return cors; }

    // Setters
    public void setUpload(Upload upload) { this.upload = upload; }
    public void setCors(Cors cors) { this.cors = cors; }

    // ── Inner class for app.upload.*
    public static class Upload {
        private String dir;
        public String getDir() { return dir; }
        public void setDir(String dir) { this.dir = dir; }
    }

    // ── Inner class for app.cors.*
    public static class Cors {
        private String allowedOrigins;
        public String getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(String allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    }
}