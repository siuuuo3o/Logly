package com.siuuuuu.logly_backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LoglyBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoglyBackendApplication.class, args);
    }

}
