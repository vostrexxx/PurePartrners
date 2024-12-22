package partners.documents_microservice.service;

import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.springframework.stereotype.Service;
import partners.documents_microservice.dto.EstimateDTO;
import partners.documents_microservice.dto.OperationStatusResponse;
import partners.documents_microservice.dto.SubSubWorkCategoryDTO;
import partners.documents_microservice.dto.SubWorkCategoryDTO;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@AllArgsConstructor
public class DocumentsService {

    public OperationStatusResponse generateDOCX(Long agreementId){
        try (XWPFDocument document = new XWPFDocument()) {
            // Добавляем параграф
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText("Hello, Apache POI! This is a simple Word document.");
            run.setFontSize(14);
            run.setBold(true);
            XWPFParagraph paragraph2 = document.createParagraph();
            XWPFRun run2 = paragraph2.createRun();
            run2.setText("Вот твой agreementId: " + agreementId + ".");
            run2.setItalic(true);
            run2.setFontSize(12);
            XWPFTable table = document.createTable();
            table.getRow(0).getCell(0).setText("Header 1");
            table.getRow(0).addNewTableCell().setText("Header 2");
            table.createRow().getCell(0).setText("Row 1, Cell 1");
            table.getRow(1).getCell(1).setText("Row 1, Cell 2");
            // Сохраняем документ
            String resourcePath = "src/main/resources/documents/" + agreementId;
            String fileName = "example_" + agreementId + ".docx";

            // Создаём директорию, если её нет
            Files.createDirectories(Paths.get(resourcePath));

            // Сохраняем документ
            try (FileOutputStream out = new FileOutputStream(resourcePath + "/" + fileName)) {
                document.write(out);
                System.out.println("Word-документ создан: " + resourcePath + "/" + fileName);
            }
        } catch (IOException e) {
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
        return new OperationStatusResponse(1);
    }

    public OperationStatusResponse generateExcelEstimate(EstimateDTO estimate){
        log.info("Смета: {}", estimate);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Смета");

            // Создаем стиль для заголовков
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setWrapText(true);

            // Создаем заголовки
            Row headerRow = sheet.createRow(0);
            String[] headers = {"№ п/п", "Наименование работ", "Единица\nизмерения", "Объём\nработ", "Цена за\nед./руб.", "Всего/руб."};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            headerRow.setHeightInPoints(50);
            // Добавляем данные
            int rowNum = 1;
            int index = 1;
            CellStyle subWorkCategoryStyle = workbook.createCellStyle();
            Font subWorkCategoryFont = workbook.createFont();
            subWorkCategoryFont.setBold(true);
            subWorkCategoryFont.setFontHeightInPoints((short) 10);
            subWorkCategoryStyle.setFont(subWorkCategoryFont);
            subWorkCategoryStyle.setAlignment(HorizontalAlignment.CENTER);
            subWorkCategoryStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle subSubWorkCategoryStyle = workbook.createCellStyle();
            Font subSubWorkCategoryFont = workbook.createFont();
            subSubWorkCategoryFont.setFontHeightInPoints((short) 10);
            subSubWorkCategoryStyle.setFont(subSubWorkCategoryFont);
            subSubWorkCategoryStyle.setAlignment(HorizontalAlignment.LEFT);
            subSubWorkCategoryStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            subSubWorkCategoryStyle.setBorderTop(BorderStyle.THIN);
            subSubWorkCategoryStyle.setBorderBottom(BorderStyle.THIN);
            subSubWorkCategoryStyle.setBorderLeft(BorderStyle.THIN);
            subSubWorkCategoryStyle.setBorderRight(BorderStyle.THIN);

            CellStyle counterStyle = workbook.createCellStyle();
            Font counterFont = workbook.createFont();
            counterFont.setFontHeightInPoints((short) 10);
            counterStyle.setFont(counterFont);
            counterStyle.setAlignment(HorizontalAlignment.RIGHT);
            counterStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            counterStyle.setBorderTop(BorderStyle.THIN);
            counterStyle.setBorderBottom(BorderStyle.THIN);
            counterStyle.setBorderLeft(BorderStyle.THIN);
            counterStyle.setBorderRight(BorderStyle.THIN);

            CellStyle finalResultStyle = workbook.createCellStyle();
            Font finalResulFont = workbook.createFont();
            finalResulFont.setFontHeightInPoints((short) 10);
            finalResulFont.setBold(true);
            finalResultStyle.setFont(finalResulFont);
            finalResultStyle.setAlignment(HorizontalAlignment.CENTER);
            finalResultStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            finalResultStyle.setBorderTop(BorderStyle.THIN);
            finalResultStyle.setBorderBottom(BorderStyle.THIN);
            finalResultStyle.setBorderLeft(BorderStyle.THIN);
            finalResultStyle.setBorderRight(BorderStyle.THIN);

            CellStyle emptyStyle = workbook.createCellStyle();
            emptyStyle.setBorderTop(BorderStyle.THIN);
            emptyStyle.setBorderBottom(BorderStyle.THIN);
            emptyStyle.setBorderLeft(BorderStyle.THIN);
            emptyStyle.setBorderRight(BorderStyle.THIN);

            List<SubWorkCategoryDTO> excelEstimate = estimate.getEstimate();
            int estimateCounter = 0;
            double resultPrice = 0.0;
            for (SubWorkCategoryDTO item : excelEstimate) {
                Row excelRow = sheet.createRow(rowNum++);

                Cell subWorkCategoryCounterCell = excelRow.createCell(0);
                subWorkCategoryCounterCell.setCellValue(index++); // Номер строки
                subWorkCategoryCounterCell.setCellStyle(counterStyle);

                Row subWorkEmptyRow = sheet.createRow(rowNum++); // Создаем новую строку
                for (int col = 0; col < headers.length; col++) {
                    Cell cell = subWorkEmptyRow.createCell(col);
                    if (col == 0) {
                        cell.setCellValue(index++);
                        cell.setCellStyle(counterStyle);
                    }
                    else
                        cell.setCellStyle(headerStyle); // Устанавливаем стиль с границами
                }

                Cell subWorkCategoryCell = excelRow.createCell(1);
                subWorkCategoryCell.setCellValue(item.getSubWorkCategoryName());
                subWorkCategoryCell.setCellStyle(subWorkCategoryStyle);
                CellRangeAddress subWorkRange = new CellRangeAddress(
                        rowNum,
                        rowNum,
                        0,
                        5
                );
                for (int col = subWorkRange.getFirstColumn(); col <= subWorkRange.getLastColumn(); col++) {
                    Cell cell = excelRow.getCell(col);
                    if (cell == null) {
                        cell = excelRow.createCell(col);
                        cell.setCellStyle(emptyStyle);
                    }
                }

                List<SubSubWorkCategoryDTO> subElements = item.getSubSubWorkCategories();
                for (SubSubWorkCategoryDTO subElement : subElements) {
                    Row subElementRow = sheet.createRow(rowNum++);

                    Cell counterCell = subElementRow.createCell(0);
                    counterCell.setCellValue(index++);
                    counterCell.setCellStyle(counterStyle);

                    Cell subElementNameCell = subElementRow.createCell(1);
                    subElementNameCell.setCellValue(subElement.getSubSubWorkCategoryName());
                    subElementNameCell.setCellStyle(subSubWorkCategoryStyle);

                     Cell subElementMeasureUnitCell = subElementRow.createCell(2);
                    subElementMeasureUnitCell.setCellValue(subElement.getMeasureUnit());
                    subElementMeasureUnitCell.setCellStyle(subSubWorkCategoryStyle);

                    Cell subElementWorkAmountCell = subElementRow.createCell(3);
                    subElementWorkAmountCell.setCellValue(subElement.getWorkAmount());
                    subElementWorkAmountCell.setCellStyle(subSubWorkCategoryStyle);

                    Cell subElementPriceCell = subElementRow.createCell(4);
                    subElementPriceCell.setCellValue(subElement.getPrice());
                    subElementPriceCell.setCellStyle(subSubWorkCategoryStyle);

                    double totalPrice = safeParseDouble(String.valueOf(subElement.getPrice())) * safeParseDouble(subElement.getWorkAmount());
                    resultPrice += totalPrice;
                    Cell subElementTotalPriceCell = subElementRow.createCell(5);
                    subElementTotalPriceCell.setCellValue(totalPrice);
                    subElementTotalPriceCell.setCellStyle(subSubWorkCategoryStyle);
                }
                estimateCounter++;
                if (estimateCounter != excelEstimate.size()) {
                    Row subSubWorkEmptyRow = sheet.createRow(rowNum++); // Создаем новую строку
                    for (int col = 0; col < headers.length; col++) {
                        Cell cell = subSubWorkEmptyRow.createCell(col);
                        if (col == 0) {
                            cell.setCellValue(index++);
                            cell.setCellStyle(counterStyle);
                        }
                        else
                            cell.setCellStyle(emptyStyle); // Устанавливаем стиль с границами
                    }
                }
            }

            Row totalPriceRow = sheet.createRow(rowNum);
            Cell totalPriceNameCell = totalPriceRow.createCell(0);
            totalPriceNameCell.setCellValue("Итого");
            totalPriceNameCell.setCellStyle(finalResultStyle);


            CellRangeAddress finalRangeAddress = new CellRangeAddress(
                    rowNum,
                    rowNum,
                    0,
                    4
            );
            sheet.addMergedRegion(finalRangeAddress);
            for (int col = finalRangeAddress.getFirstColumn(); col <= finalRangeAddress.getLastColumn(); col++) {
                Cell cell = totalPriceRow.getCell(col);
                if (cell == null) {
                    cell = totalPriceRow.createCell(col);
                }
                cell.setCellStyle(finalResultStyle);
            }

            Cell totalPriceValueCell = totalPriceRow.createCell(5);
            totalPriceValueCell.setCellValue(resultPrice);
            totalPriceValueCell.setCellStyle(finalResultStyle);

            Long agreementId = estimate.getAgreementId();
            String resourcePath = "src/main/resources/documents/" + agreementId;
            String fileName = "example_" + agreementId + ".xlsx";

            int[] columnWidths = {1600, 20000, 5000, 5000, 5000, 7000};
            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, columnWidths[i]); // Автоматическая ширина
            }

            // Создаём директорию, если её нет
            Files.createDirectories(Paths.get(resourcePath));

            // Сохраняем документ
            try (FileOutputStream out = new FileOutputStream(resourcePath + "/" + fileName)) {
                workbook.write(out);
                System.out.println("Word-документ создан: " + resourcePath + "/" + fileName);
            }

            System.out.println("Файл успешно создан");
        } catch (IOException e) {
            log.error(e.getMessage());
            throw new InternalServerErrorException(e.getMessage());
        }
        return new OperationStatusResponse(1);
    }

    private double safeParseDouble(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0.0; // Если строка пустая или null, возвращаем 0
        }
        try {
            return Double.parseDouble(value); // Пробуем преобразовать строку в число
        } catch (NumberFormatException e) {
            return 0.0; // Если строка не является числом, возвращаем 0
        }
    }
}
