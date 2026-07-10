package com.wzsoft.main;

import java.io.UnsupportedEncodingException;
import java.util.Base64;

public class WSoftUtilBase64 {

    public static final String encodingUTF_8 = "UTF-8";
    public static Base64.Encoder baseEncoder;
    public static Base64.Decoder baseDecoder;

    static {
        baseDecoder = Base64.getDecoder();
        baseEncoder = Base64.getEncoder();
    }

    /**
     * byte[] Base64 encoding
     *
     * @Author wuwenchao
     * @Date 2022/4/29 10:11
     */
    public static byte[] encodeBase64(byte[] bytes) {
        return baseEncoder.encode(bytes);
    }

    public static String encodeBase64(String source) {
        byte[] bytes = encodeBase64(source.getBytes());
        try {
            return new String(bytes, encodingUTF_8);
        } catch (UnsupportedEncodingException ex) {
            ex.printStackTrace();
        }
        return  null;
    }

    public static byte[] decodeBase64(byte[] bytes) {
        return baseDecoder.decode(bytes);
    }

    public static String decodeBase64(String string) {
        byte[] decode = decodeBase64(string.getBytes());
        try {
            return new String(decode, encodingUTF_8);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return null;
    }
}
