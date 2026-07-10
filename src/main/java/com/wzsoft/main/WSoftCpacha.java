package com.wzsoft.main;


import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.util.Random;
 
/**
 * CAPTCHA Generator
 * @author CampNou10Day
 * @date 2020-2-25
 */
public class WSoftCpacha {
     
    /**
     * CAPTCHA character set
     */
    final private char[] code = {
        '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 
        'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R',
        'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    };
    /**
     * Font
     */
    final private String[] fontNames = new String[]{
            "SimHei", "SimSun", "Courier", "Arial", 
            "Verdana", "Times", "Tahoma", "Georgia"};
    /**
     * Font styles
     */
    final private int[] fontStyles = new int[]{
            Font.BOLD, Font.ITALIC|Font.BOLD
    };
     
    /**
     * CAPTCHA length
     * Default 4 characters
     */
    private int vcodeLen = 4;
    /**
     * CAPTCHA image font size
     * Default 17
     */
    private int fontsize = 21;
    /**
     * CAPTCHA image width
     */
    private int width = (fontsize+1)*vcodeLen+10;
    /**
     * CAPTCHA image height
     */
    private int height = fontsize+12;
    /**
     * Disturbance lines count
     * Default 3 lines
     */
    private int disturbline = 3;
     
     
    public WSoftCpacha(){}
     
    /**
     * Specifies CAPTCHA length
     * @param vcodeLen CAPTCHA length
     */
    public WSoftCpacha(int vcodeLen) {
        this.vcodeLen = vcodeLen;
        this.width = (fontsize+1)*vcodeLen+10;
    }
     
    /**
     * Specifies CAPTCHA length, image width, height
     * @param vcodeLen
     * @param width
     * @param height
     */
    public WSoftCpacha(int vcodeLen,int width,int height) {
        this.vcodeLen = vcodeLen;
        this.width = width;
        this.height = height;
    }
     
    /**
     * Generate CAPTCHA image
     * @param vcode CAPTCHA text to draw
     * @param drawline YesNoDraw disturbance lines
     * @return
     */
    public BufferedImage generatorVCodeImage(String vcode, boolean drawline){
        //Create CAPTCHA image
        BufferedImage vcodeImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics g = vcodeImage.getGraphics();
        //Fill background color
        g.setColor(new Color(246, 240, 250));
        g.fillRect(0, 0, width, height);
        if(drawline){
            drawDisturbLine(g);
        }
        //Used to generate pseudo-random numbers
        Random ran = new Random();
        //Draw CAPTCHA text on the image
        for(int i = 0;i < vcode.length();i++){
            // Set font
            g.setFont(new Font(fontNames[ran.nextInt(fontNames.length)], fontStyles[ran.nextInt(fontStyles.length)], fontsize));
            //Randomly generate color
            g.setColor(getRandomColor());
            //Draw CAPTCHA character
            g.drawString(vcode.charAt(i)+"", i*fontsize+10, fontsize+5);
        }
        //Release graphics context and all associated system resources
        g.dispose();
         
        return vcodeImage;
    }
    /**
     * Get rotated CAPTCHA image
     * @param vcode
     * @param drawline YesNoDraw disturbance lines
     * @return
     */
    public BufferedImage generatorRotateVCodeImage(String vcode, boolean drawline){
        //Create CAPTCHA image
        BufferedImage rotateVcodeImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = rotateVcodeImage.createGraphics();
        //Fill background color
        g2d.setColor(new Color(246, 240, 250));
        g2d.fillRect(0, 0, width, height);
        if(drawline){
            drawDisturbLine(g2d);
        }
        //Draw CAPTCHA text on the image
        for(int i = 0;i < vcode.length();i++){
            BufferedImage rotateImage = getRotateImage(vcode.charAt(i));
            g2d.drawImage(rotateImage, null, (int) (this.height * 0.7) * i, 0);
        }
        g2d.dispose();
        return rotateVcodeImage;
    }
    /**
     * Generate CAPTCHA text
     * @return CAPTCHA text
     */
    public String generatorVCode(){
        int len = code.length;
        Random ran = new Random();
        StringBuffer sb = new StringBuffer();
        for(int i = 0;i < vcodeLen;i++){
            int index = ran.nextInt(len);
            sb.append(code[index]);
        }
        return sb.toString();
    }
    /**
     * Draw disturbance lines on CAPTCHA image
     * @param g 
     */
    private void drawDisturbLine(Graphics g){
        Random ran = new Random();
        for(int i = 0;i < disturbline;i++){
            int x1 = ran.nextInt(width);
            int y1 = ran.nextInt(height);
            int x2 = ran.nextInt(width);
            int y2 = ran.nextInt(height);
            g.setColor(getRandomColor());
            //Draw disturbance lines
            g.drawLine(x1, y1, x2, y2);
        }
    }
    /**
     * Get a rotated image
     * @param c Character to draw
     * @return
     */
    private BufferedImage getRotateImage(char c){
        BufferedImage rotateImage = new BufferedImage(height, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = rotateImage.createGraphics();
        //Set transparency to 0
        g2d.setColor(new Color(255, 255, 255, 0));
        g2d.fillRect(0, 0, height, height);
        Random ran = new Random();
        g2d.setFont(new Font(fontNames[ran.nextInt(fontNames.length)], fontStyles[ran.nextInt(fontStyles.length)], fontsize));
        g2d.setColor(getRandomColor());
        double theta = getTheta();
        //Rotate image
        g2d.rotate(theta, height/2, height/2);
        g2d.drawString(Character.toString(c), (height-fontsize)/2, fontsize+5);
        g2d.dispose();
         
        return rotateImage;
    }
    /**
     * @return a random color
     */
    private Color getRandomColor(){
        Random ran = new Random();
        return new Color(ran.nextInt(220), ran.nextInt(220), ran.nextInt(220)); 
    }
    /**
     * @return Angle
     */
    private double getTheta(){
        return ((int) (Math.random()*1000) % 2 == 0 ? -1 : 1)*Math.random();
    }
 
    /**
     * @return CAPTCHA character count
     */
    public int getVcodeLen() {
        return vcodeLen;
    }
    /**
     * Set CAPTCHA character count
     * @param vcodeLen
     */
    public void setVcodeLen(int vcodeLen) {
        this.width = (fontsize+3)*vcodeLen+10;
        this.vcodeLen = vcodeLen;
    }
    /**
     * @return Font size
     */
    public int getFontsize() {
        return fontsize;
    }
    /**
     * Set font size
     * @param fontsize
     */
    public void setFontsize(int fontsize) {
        this.width = (fontsize+3)*vcodeLen+10;
        this.height = fontsize+15;
        this.fontsize = fontsize;
    }
    /**
     * @return Image width
     */
    public int getWidth() {
        return width;
    }
    /**
     * Set image width
     * @param width
     */
    public void setWidth(int width) {
        this.width = width;
    }
    /**
     * @return Image height
     */
    public int getHeight() {
        return height;
    }
    /**
     * Set image height
     * @param height 
     */
    public void setHeight(int height) {
        this.height = height;
    }
    /**
     * @return Disturbance lines count
     */
    public int getDisturbline() {
        return disturbline;
    }
    /**
     * Set disturbance lines count
     * @param disturbline
     */
    public void setDisturbline(int disturbline) {
        this.disturbline = disturbline;
    }
     
}