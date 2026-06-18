package com.url_shortner.url_shortner.Controller;

import com.url_shortner.url_shortner.Services.UrlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
public class RedirectController {

    @Autowired
    private UrlService urlService;

    @GetMapping("/{token}")
    public ResponseEntity<Void> redirect(@PathVariable String token) {
        String originalUrl = urlService.getOriginalUrl(token);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(originalUrl))
                .build();
    }
}
