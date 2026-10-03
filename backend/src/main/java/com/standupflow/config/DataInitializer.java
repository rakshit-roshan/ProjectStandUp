package com.standupflow.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Database starts 100% clean. Data is populated strictly via user registration and real actions.
    }
}
