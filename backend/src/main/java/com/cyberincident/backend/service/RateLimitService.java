package com.cyberincident.backend.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 60_000;

    private final Map<String, RequestCounter> requestCounters =
            new ConcurrentHashMap<>();

    public boolean isAllowed(String key) {

        long currentTime = System.currentTimeMillis();

        RequestCounter counter = requestCounters.computeIfAbsent(
                key,
                k -> new RequestCounter(currentTime)
        );

        synchronized (counter) {

            if (currentTime - counter.windowStart >= WINDOW_MILLIS) {
                counter.windowStart = currentTime;
                counter.count = 0;
            }

            if (counter.count >= MAX_ATTEMPTS) {
                return false;
            }

            counter.count++;
            return true;
        }
    }

    private static class RequestCounter {

        private long windowStart;
        private int count;

        public RequestCounter(long windowStart) {
            this.windowStart = windowStart;
            this.count = 0;
        }
    }
}