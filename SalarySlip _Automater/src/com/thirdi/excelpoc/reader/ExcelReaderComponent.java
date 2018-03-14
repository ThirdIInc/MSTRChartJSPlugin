package com.thirdi.excelpoc.reader;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeMap;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileNameExtensionFilter;
import javax.swing.filechooser.FileSystemView;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONException;
import org.json.JSONObject;

import com.lowagie.text.pdf.PdfWriter;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimplePdfExporterConfiguration;

public class ExcelReaderComponent {

	private static File selectedFile = null;
	private static File pdfContainer = null;

	public ExcelReaderComponent() {
	}

	public static void main(String args[]) {

		try {

			JFileChooser file = new JFileChooser(FileSystemView.getFileSystemView().getHomeDirectory());
			FileNameExtensionFilter filter = new FileNameExtensionFilter("Excel File", "xlsx", "xlsx");
			file.setFileFilter(filter);
			file.setDialogTitle("Select a Payroll Excel to generate Pay Slips:  ");
			file.setFileSelectionMode(JFileChooser.FILES_ONLY);

			int returnValue = file.showDialog(null, "Select");
			if (returnValue == JFileChooser.APPROVE_OPTION) {
				if (file.getSelectedFile().isFile()) {
					System.out.println("You selected the directory: " + file.getSelectedFile());
					selectedFile = file.getSelectedFile();
				}
				JFileChooser directory = new JFileChooser(FileSystemView.getFileSystemView().getHomeDirectory());
				directory.setDialogTitle("Select directory to save your Pay Slips: ");
				directory.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);

				returnValue = directory.showDialog(null, "Select");
				if (returnValue == JFileChooser.APPROVE_OPTION) {
					if (directory.getSelectedFile().isDirectory()) {
						System.out.println("You selected the directory: " + directory.getSelectedFile());
						pdfContainer = directory.getSelectedFile();
					}
				}
			}
			
			if(null == selectedFile) {
				throw new Exception("Please select the file to continue.");
			}
			if(null == pdfContainer) {
				throw new Exception("Please select the folder to continue.");
			}

			FileInputStream excelFile = new FileInputStream(selectedFile);
			Map<Integer, String> headerMap = new HashMap<Integer, String>();
			Map<String, JSONObject> dataMap = new TreeMap<String, JSONObject>();
			List<JSONObject> dataList = new ArrayList<JSONObject>();
			JSONObject headerJ = new JSONObject();

			Workbook workbook = new XSSFWorkbook(excelFile);
			Sheet sh = workbook.getSheet("Payroll");

			// read first line
			Row currentRow = sh.getRow(0);
			Cell currentCell = currentRow.getCell(0);
			Cell monthCell = currentRow.getCell(2);
			if (currentCell != null && monthCell != null && currentCell.getCellType() == XSSFCell.CELL_TYPE_STRING
					&& monthCell.getCellType() == XSSFCell.CELL_TYPE_NUMERIC) {
				java.util.Date date = monthCell.getDateCellValue();
				String formatedDate = convertDateInStringFormat(date);
				headerJ.put("month", formatedDate);
			}

			Row headerRow = sh.getRow(2);
			Iterator<Cell> headerIterator = headerRow.iterator();
			int counter = 0;
			while (headerIterator.hasNext()) {
				Cell headerCell = headerIterator.next();
				if (headerCell != null && headerCell.getCellType() == XSSFCell.CELL_TYPE_STRING) {
					headerMap.put(counter, headerCell.getStringCellValue());
					counter++;
				}
			}

			int rowCounter = 3;
			int totalRowcount = sh.getPhysicalNumberOfRows();
			System.out.println("Number of headers in excel sheet :" + headerMap.size());
			for (int j = 0; j < totalRowcount - 3; j++) {
				Row consecutiveRow = sh.getRow(rowCounter);
				JSONObject dataJson = new JSONObject();
				if (headerMap != null && headerMap.size() > 0) {
					Integer cellCounter = 0;
					for (int i = 0; i < headerMap.size(); i++) {
						String key = headerMap.get(cellCounter);
						if (key != null && !key.equals("") && cellCounter <= headerMap.size()) {
							Cell dataCell = consecutiveRow.getCell(cellCounter);
							if (dataCell != null && dataCell.getCellType() == XSSFCell.CELL_TYPE_STRING
									|| dataCell.equals("-") || dataCell.equals("")) {
								dataJson.put(cellCounter.toString(), dataCell.getStringCellValue());
							}
							if (dataCell != null && dataCell.getCellType() == XSSFCell.CELL_TYPE_NUMERIC) {
								if (DateUtil.isCellDateFormatted(dataCell)) {
									SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-yyyy");
									dataJson.put(cellCounter.toString(),
											dateFormat.format(dataCell.getDateCellValue()));
								} else {
									dataJson.put(cellCounter.toString(), dataCell.getNumericCellValue());
								}
							}
							if (dataCell != null && dataCell.getCellType() == XSSFCell.CELL_TYPE_FORMULA) {
								switch (dataCell.getCachedFormulaResultType()) {
								case Cell.CELL_TYPE_NUMERIC:
									dataJson.put(cellCounter.toString(), dataCell.getNumericCellValue());
									break;
								case Cell.CELL_TYPE_STRING:
									dataJson.put(cellCounter.toString(), dataCell.getStringCellValue());
									break;
								}
							}
							cellCounter++;
						}
					}
					
					if (dataJson != null && dataJson.length() != 0) {
						if(dataJson.has("1")) {
							if (!dataJson.get("1").equals("")) {
								dataMap.put(dataJson.get("1").toString(), dataJson);
								dataList.add(dataJson);
								rowCounter++;
							}
						}
					}
				}
			}
			
		String whichMonth = headerJ.get("month").toString();
		startGeneratingPaySlips(dataMap, whichMonth);
		JOptionPane.showMessageDialog(new JFrame(), "Pay Slips has been generated successfully!", "Dialog",JOptionPane.INFORMATION_MESSAGE);
		} catch (Exception e) {
			JOptionPane.showMessageDialog(new JFrame(), e.getMessage(), "Dialog",JOptionPane.ERROR_MESSAGE);
		}
		finally {
			System.exit(0);
		}
	}

	private static Boolean startGeneratingPaySlips(Map<String, JSONObject> dataMap, String month) throws Exception {
		Set<Recipient> recipients =  new HashSet<Recipient>();
		if (dataMap != null && dataMap.size() > 0) {
			for (String empId : dataMap.keySet()) {
				JSONObject dataJson = dataMap.get(empId);
				EmployeeDetails empDetails = fillUpDataInEmployeeDetailModel(dataJson, month);
				EmployeeLeaves empLeaves = fillDataInEmployeeLeaveModel(dataJson);
				EmployeeSalaryBreakDown empSalaryBD = fillDataInEmployeeSalaryBreakdownModel(dataJson);
				String dateOfBirth = dataJson.get("56").toString();
				sendParamtersAndMakeConnectionWithJasper(empDetails, empLeaves, empSalaryBD, empId, dateOfBirth);
				recipients = sendPaySlipsInEmailWithAttachments(dataMap,month);
			}
		}
		sendEmail(recipients, month);
		return true;
	}


	private static void sendParamtersAndMakeConnectionWithJasper(EmployeeDetails empDetails, EmployeeLeaves empLeaves,
			EmployeeSalaryBreakDown empSalaryBD, String empId, String DOB) throws Exception {

			String templatePath = ExcelReaderComponent.class.getResource("/pay_slips.jrxml").toURI().getPath();
			JasperReport report = JasperCompileManager.compileReport(templatePath);
			Map<String, Object> parameterMap = new HashMap<String,Object>();
			List<EmployeeSalaryDetails> dataList = new ArrayList<EmployeeSalaryDetails>();
			EmployeeSalaryDetails containerObject = new EmployeeSalaryDetails();
			containerObject.setEmpDetails(empDetails);
			containerObject.setEmpLeaves(empLeaves);
			containerObject.setSalaryBreakdown(empSalaryBD);
			dataList.add(containerObject);
			JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(dataList);
			JasperPrint jasperprint = JasperFillManager.fillReport(report, parameterMap, dataSource);
			
			empId = empId.replaceAll("\\.0*$", "");
			JRPdfExporter exporter = new JRPdfExporter();
			Files.createDirectories(Paths.get(pdfContainer.getAbsolutePath()));
			OutputStream output = new FileOutputStream(new File(pdfContainer.getAbsolutePath() + "/PaySlip_" + empId + ".pdf"));
			exporter.setExporterInput(new SimpleExporterInput(jasperprint));
			exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(output));
			
			SimplePdfExporterConfiguration configuration = new SimplePdfExporterConfiguration();
			configuration.setEncrypted(true);
			configuration.set128BitKey(true);
			configuration.setUserPassword(DOB.replaceAll("\\.0*$", ""));
			configuration.setOwnerPassword("Admin123");
			configuration.setPermissions(PdfWriter.ALLOW_COPY | PdfWriter.ALLOW_PRINTING);
			exporter.setConfiguration(configuration);
			exporter.exportReport();
	}

	

	private static Set<Recipient> sendPaySlipsInEmailWithAttachments(Map<String, JSONObject> dataMap,String month) throws IOException,JSONException {
		Set<Recipient> recipientsSet = new HashSet<Recipient>();
		if(dataMap != null && dataMap.size() > 0) {
			System.out.println("No of records in map:" +dataMap.size());
			for(String empId : dataMap.keySet()) {
				Recipient recipient = new Recipient();
				JSONObject dataJson = dataMap.get(empId);
				if(dataJson.get("2") != null) {
					String employeeName = dataJson.get("2").toString();  
				    recipient.setName(employeeName);
				}
				if(dataJson.get("57") != null) {
					String empEmail = dataJson.get("57").toString();
					recipient.setEmail(empEmail);
				}
				if(empId != null && !empId.equals("")){
					recipient.setEmpId(empId);
				}
				if(month != null && !month.equals("")){
					recipient.setDate(month);
				}
				File paySlip = new File(pdfContainer.getAbsolutePath() + "/PaySlip_" + empId.replaceAll("\\.0*$", "") + ".pdf");
				recipient.setFile(paySlip);
				recipientsSet.add(recipient);
			}
		}
		return recipientsSet;
	}
	
	private static void sendEmail(Set<Recipient> recipients, String Month) {
		try {
			String propertyFilePath = ExcelReaderComponent.class.getResource("/email_configuration.properties").toURI().getPath();
			File file = new File(propertyFilePath);
			FileInputStream fileInput = new FileInputStream(file);
			Properties properties = new Properties();
			properties.load(fileInput);
			Enumeration<Object> enuKeys = properties.keys();
			fileInput.close();
			while (enuKeys.hasMoreElements()) {
				String key = (String) enuKeys.nextElement();
				String value = properties.getProperty(key);
				properties.put(key, value);
			}
			// creates a new session with an authenticator
			final String userName = properties.getProperty("mail.user");
			final String password = properties.getProperty("mail.password");
	        Authenticator auth = new Authenticator() {
	            public PasswordAuthentication getPasswordAuthentication() {
	                return new PasswordAuthentication(userName, password);
	            }
	        };
	        Session session = Session.getInstance(properties, auth);
	        
	        System.out.println("Total no of recipient : " +recipients.size());
			for (Iterator<Recipient> iterator = recipients.iterator(); iterator.hasNext();) {
				final Recipient recipient = iterator.next();
						if(recipient.getEmail() != null){
							Message msg = new MimeMessage(session);
					        msg.setFrom(new InternetAddress(userName));
					        InternetAddress[] toAddresses = { new InternetAddress(recipient.getEmail()) };
					        msg.setRecipients(Message.RecipientType.TO, toAddresses);
					        msg.setSubject("PaySlip " + Month);
					        msg.setSentDate(new Date());
					 
					        // creates message part
					        MimeBodyPart messageBodyPart = new MimeBodyPart();
					        messageBodyPart.setContent("<p>Hi, <br><br>PFA your pay slip for " +
					        Month + "<br><br>File is password protected. Your birthdate is your password.</p>", "text/html");
					 
					        // creates multi-part
					        Multipart multipart = new MimeMultipart();
					        multipart.addBodyPart(messageBodyPart);
					 
					        // adds attachments
					        if (recipient.getFile() != null) {
					                MimeBodyPart attachPart = new MimeBodyPart();
					                try {
					                    attachPart.attachFile(recipient.getFile());
					                } catch (IOException ex) {
					                    ex.printStackTrace();
					                }
					                multipart.addBodyPart(attachPart);
					        }
					        // sets the multi-part as e-mail's content
					        msg.setContent(multipart);
					 
					        // sends the e-mail
					        String timeStamp = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss").format(Calendar.getInstance().getTime());
					        System.out.println("Email : sending - " +timeStamp);
					        Transport.send(msg);
					        timeStamp = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss").format(Calendar.getInstance().getTime());
					        System.out.println("Email : sent - " +timeStamp);
					        System.out.println("Email has been successfully sent to : " +recipient.getEmail());
					        
						}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

	}
	
	public static String convertDateInStringFormat(Date date) throws Exception {
		SimpleDateFormat sdf = new SimpleDateFormat("MMM-YY");
		String strDate = sdf.format(date);
		return strDate;
	}

	private static EmployeeDetails fillUpDataInEmployeeDetailModel(JSONObject jo, String Month)
			throws Exception {
		EmployeeDetails empDetails = new EmployeeDetails();
		String logo = ExcelReaderComponent.class.getResource("/3i.png").toURI().getPath();
		if (jo != null && jo.length() > 0) {
			if (logo != null && !logo.equals("")) {
				empDetails.setLogo(logo);
			}

			if (Month != null && !Month.equals("")) {
				empDetails.setMonthNameV(Month);
			}
			if (jo.get("0") != null) {
				empDetails.setSerialNo(jo.get("0").toString());
			}
			if (jo.get("1") != null) {
				String empId = jo.get("1").toString().replaceAll("\\.0*$", "");
				empDetails.setEmpIdV(empId);
			}
			if (jo.get("2") != null) {
				empDetails.setEmpNameV(jo.get("2").toString());
			}
			if (jo.get("3") != null) {
				empDetails.setDesignationV(jo.get("3").toString());
			}
			if (jo.get("4") != null) {
				empDetails.setDepartmentV(jo.get("4").toString());
			}
			if (jo.get("5") != null) {
				empDetails.setPFNumberV(jo.get("5").toString());
			}
			if (jo.get("6") != null) {
				empDetails.setUANNoV(jo.get("6").toString());
			}
			if (jo.get("7") != null) {
				empDetails.setPANV(jo.get("7").toString());
			}
			if (jo.get("8") != null) {
				empDetails.setDojV(jo.get("8").toString());
			}
			if (jo.get("9") != null) {
				empDetails.setAccNumV(jo.get("9").toString());
			}
			if (jo.get("10") != null) {
				empDetails.setBankName(jo.get("10").toString());
			}
		}
		return empDetails;
	}

	private static EmployeeLeaves fillDataInEmployeeLeaveModel(JSONObject jo) throws Exception {
		EmployeeLeaves empLeaves = new EmployeeLeaves();
		if (jo != null && jo.length() > 0) {
			if (jo.get("15") != null) {
				empLeaves.setPresentDaysV(jo.get("15").toString());
			}
			if (jo.get("16") != null) {
				empLeaves.setAlAvailedV(jo.get("16").toString());
			}
			if (jo.get("17") != null) {
				empLeaves.setBlAvailedV(jo.get("17").toString());
			}
			if (jo.get("18") != null) {
				empLeaves.setCompOffV(jo.get("18").toString());
			}
			if (jo.get("19") != null) {
				empLeaves.setWfhV(jo.get("19").toString());
			}
			if (jo.get("20") != null) {
				empLeaves.setOptionalHolidayV(jo.get("20").toString());
			}
			if (jo.get("21") != null) {
				empLeaves.setHolidayV(jo.get("21").toString());
			}
			if (jo.get("22") != null) {
				empLeaves.setPeternityLeaveV(jo.get("22").toString());
			}
			if (jo.get("23") != null) {
				empLeaves.setMaternityLeave(jo.get("23").toString());
			}
			if (jo.get("24") != null) {
				empLeaves.setLeaveWOPayV(jo.get("24").toString());
			}
			if (jo.get("26") != null) {
				empLeaves.setWeeklyOffV(jo.get("26").toString());
			}
			if (jo.get("27") != null) {
				empLeaves.setSalaryPaidDaysV(jo.get("27").toString());
			}
			if (jo.get("52") != null) {
				empLeaves.setAdditionalALV(jo.get("52").toString());
			}
			if (jo.get("53") != null) {
				empLeaves.setOpeningBalanceALV(jo.get("53").toString());
			}
			if (jo.get("54") != null) {
				empLeaves.setClosingBalanceV(jo.get("54").toString());
			}
			if (jo.get("55") != null) {
				empLeaves.setBereavementLeaveBalV(jo.get("55").toString());
			}
		}
		return empLeaves;
	}

	private static EmployeeSalaryBreakDown fillDataInEmployeeSalaryBreakdownModel(JSONObject jo) throws Exception {
		EmployeeSalaryBreakDown empSalaryBD = new EmployeeSalaryBreakDown();
		if (jo != null && jo.length() > 0) {
			if(jo.get("14") != null) {
				empSalaryBD.setTotalEarningsV(jo.get("14").toString());
			}
			if (jo.get("29") != null) {
				empSalaryBD.setBasicV(jo.get("29").toString());
			}
			if (jo.get("30") != null) {
				empSalaryBD.setHraV(jo.get("30").toString());
			}
			if (jo.get("31") != null) {
				empSalaryBD.setConveyanceAllowanceV(jo.get("31").toString());
			}
			if (jo.get("32") != null) {
				empSalaryBD.setUniformAllowanceV(jo.get("32").toString());
			}
			if (jo.get("33") != null) {
				empSalaryBD.setMedicalReimbursementV(jo.get("33").toString());
			}
			if (jo.get("34") != null) {
				empSalaryBD.setSpecialAllowanceV(jo.get("34").toString());
			}
			if (jo.get("35") != null) {
				empSalaryBD.setLtaV(jo.get("35").toString());
			}
			if (jo.get("36") != null) {
				empSalaryBD.setLeaveEncashmentV(jo.get("36").toString());
			}
			if (jo.get("37") != null) {
				empSalaryBD.setDriverSalaryImbursementV(jo.get("37").toString());
			}
			if (jo.get("38") != null) {
				empSalaryBD.setVehicleRunningExpV(jo.get("38").toString());
			}
			if (jo.get("39") != null) {
				empSalaryBD.setMobileReimbursementV(jo.get("39").toString());
			}
			if (jo.get("40") != null) {
				empSalaryBD.setBooksAndPeriodicalV(jo.get("40").toString());
			}
			if (jo.get("41") != null) {
				empSalaryBD.setdifferedBonusV(jo.get("41").toString());
			}
			if (jo.get("42") != null) {
				empSalaryBD.setEmployeePerformanceBonusV(jo.get("42").toString());
			}
			if (jo.get("43") != null) {
				empSalaryBD.setCompanyPerformnaceNBonusV(jo.get("43").toString());
			}
			if (jo.get("47") != null) {
				empSalaryBD.setProvidendFundV(jo.get("47").toString());
			}
			if (jo.get("48") != null) {
				empSalaryBD.setProfessionalTaxV(jo.get("48").toString());
			}
			if (jo.get("49") != null) {
				empSalaryBD.setTdsV(jo.get("49").toString());
			}
			if (jo.get("50") != null) {
				empSalaryBD.setTotalDeductionV(jo.get("50").toString());
			}
			if (jo.get("51") != null) {
				empSalaryBD.setTakeHomePayV(jo.get("51").toString());
			}
		}
		return empSalaryBD;
	}

}
