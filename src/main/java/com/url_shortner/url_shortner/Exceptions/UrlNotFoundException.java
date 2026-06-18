package com.url_shortner.url_shortner.Exceptions;

public class UrlNotFoundException extends RuntimeException {

    public UrlNotFoundException(String shortToken) {
        super("Short URL not found for token: " + shortToken);
    }
}
