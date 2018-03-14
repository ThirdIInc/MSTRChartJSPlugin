package com.thirdi.excelpoc.reader;

import java.io.File;

public class Recipient {
	
private String name;
private String email;
private String date;
private String empId;
private File file;


public File getFile() {
	return file;
}
public void setFile(File file) {
	this.file = file;
}

public String getEmpId() {
	return empId;
}
public void setEmpId(String empId) {
	this.empId = empId;
}
public String getName() {
	return name;
}
public void setName(String name) {
	this.name = name;
}
public String getEmail() {
	return email;
}
public void setEmail(String email) {
	this.email = email;
}
public String getDate() {
	return date;
}
public void setDate(String date) {
	this.date = date;
}
	
}
