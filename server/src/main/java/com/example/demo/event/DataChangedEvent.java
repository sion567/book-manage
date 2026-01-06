package com.example.demo.event;

import org.springframework.context.ApplicationEvent;

public class DataChangedEvent extends ApplicationEvent {
    public DataChangedEvent(Object source) {
        super(source);
    }
}
