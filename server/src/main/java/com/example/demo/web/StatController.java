package com.example.demo.web;

import com.example.demo.event.DataChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/stats")
@Slf4j
public class StatController {

    // 保存所有活动的客户端连接
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamStats() {
        SseEmitter emitter = new SseEmitter(60 * 1000L); // 60秒超时
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));

        return emitter;
    }

    @EventListener
    public void onDataChanged(DataChangedEvent event) {
        log.info("检测到数据变化，准备推送至前端...");

        for (SseEmitter emitter : emitters) {
            try {
                // 推送一個簡單的信號，前端收到後會去重新 fetch 數據
                emitter.send(SseEmitter.event()
                        .name("data-update")
                        .data("refresh"));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}