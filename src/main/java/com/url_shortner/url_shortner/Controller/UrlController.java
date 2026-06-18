package com.url_shortner.url_shortner.Controller;

import com.url_shortner.url_shortner.DTO.ShortenRequest;
import com.url_shortner.url_shortner.DTO.ShortenResponse;
import com.url_shortner.url_shortner.Services.UrlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/urls")
public class UrlController {

    @Autowired
    private UrlService urlService;

    @PostMapping
    public ShortenResponse shortenUrl(@RequestBody ShortenRequest request) {
        String token = urlService.shortenUrl(request.getUrl());

        ShortenResponse response = new ShortenResponse();
        response.setShortToken(token);
        return response;
    }
}
