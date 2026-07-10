package com.wzsoft.main;

import java.io.IOException;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.ExceptionConverter;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfTemplate;
import com.lowagie.text.pdf.PdfWriter;

/**
 * @Description: iText PDF page number
 * @author: lzh
 * @date: March 9, 2020 1:09:22 PM
 */
public class WSoftPdfHeaderFooter extends PdfPageEventHelper 
{
        // Total pages
        PdfTemplate totalPage;
        Font hfFont;
        {
            try {
                hfFont = new Font(BaseFont.createFont(WSoftUtil.propertyGetPara("pdffilesDir")+ "/simsun.ttc,0", BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED), 8, Font.NORMAL);
            } catch (DocumentException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        private String pdfHeader;

        public void setPdfHeader(String pdfHeader)
        {
            this.pdfHeader = pdfHeader;
        }
    
        // When opening document, create a total-pages template
        @Override
        public void onOpenDocument(PdfWriter writer, Document document) {
            PdfContentByte cb =writer.getDirectContent();
            totalPage = cb.createTemplate(30, 16);

            /* 
            try {
                image = Image.getInstance(PDFUtil.class.getResource("/template/small.png"));
                image.scalePercent(50);
                image.setAbsolutePosition(8, document.top());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            */

        }
        // Triggered when each page loads; write header and footer
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb =writer.getDirectContent();
            totalPage = cb.createTemplate(30, 16);
            PdfPTable table = new PdfPTable(3);
            try {
                table.setTotalWidth(PageSize.A4.getWidth() - 100);
                table.setWidths(new int[] { 24, 24, 3});
                table.setLockedWidth(true);
                table.getDefaultCell().setFixedHeight(-10);
                table.getDefaultCell().setBorder(Rectangle.BOTTOM);
    
                table.addCell(new Paragraph(this.pdfHeader , hfFont));// Can use addCell(str), but cannot specify font; Chinese cannot display
                table.getDefaultCell().setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(new Paragraph("Page " + writer.getPageNumber(), hfFont));
                // Total pages
                PdfPCell cell = new PdfPCell(Image.getInstance(totalPage));
                cell.setBorder(Rectangle.BOTTOM);
                table.addCell(cell);
                // Write header to document; position can be specified; at bottom would be footer
                table.writeSelectedRows(0, -1, 50, PageSize.A4.getHeight() - 20, writer.getDirectContent());
            } catch (Exception de) {
                throw new ExceptionConverter(de);
            }
        }
    
        // After all pages are done, write total-pages PDF template to specified position
        @Override
        public void onCloseDocument(PdfWriter writer, Document document) {
            //String text = "Total" + (writer.getPageNumber()) + " pages";
            //ColumnText.showTextAligned(totalPage, Element.ALIGN_LEFT, new Paragraph(text,hfFont), 2, 2, 0);
        }


}


