package com.url_shortner.url_shortner.Util;

public class Base62Encoder {
    // The 62 characters used for encoding.
    // The order doesn't strictly matter, but keeping it consistent is crucial.
    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int BASE = ALPHABET.length();
    
    /**
    * Encodes a Base10 Long ID into a Base62 String token.
    * * @param id The auto-incremented database ID
    * @return The Base62 encoded short token
    */
    public static String encode(long id) {
    // Handle the edge case where the ID is 0
        if (id == 0) {
            return String.valueOf(ALPHABET.charAt(0));
        }
    
        StringBuilder shortToken = new StringBuilder();

        // Repeatedly divide the ID by 62 and map the remainder to a character

        while (id > 0) {    
            int remainder = (int) (id % BASE);   
            shortToken.append(ALPHABET.charAt(remainder));
            id = id / BASE;
        }
        // The characters are appended in reverse order, so we must reverse the string
        return shortToken.reverse().toString();
    }
    
    /**
    * Decodes a Base62 String token back into a Base10 Long ID.
    * (Useful if you want to look up the DB record without storing the token)
    * * @param token The Base62 short token
    * @return The original Base10 database ID
    */
    public static long decode(String token) {
    long id = 0;
    
    // Iterate through the characters and multiply by powers of 62
    for (int i = 0; i < token.length(); i++) {
        char c = token.charAt(i);
        id = id * BASE + ALPHABET.indexOf(c);
    }  
    return id;
    }
    
}
