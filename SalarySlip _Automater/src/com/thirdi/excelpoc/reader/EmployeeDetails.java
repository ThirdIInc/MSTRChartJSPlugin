package com.thirdi.excelpoc.reader;

public class EmployeeDetails {
    
    private String SerialNo= "-";  // 0
	private String monthNameV= "-"; 
	private String empNameV= "-";  //2
	private String designationV= "-"; //3 
	private String departmentV= "-"; //4
	private String empIdV= "-"; // 1
	private String dojV= "-"; // 8
	private String accNumV; // 9
	private String PANV= "-"; // 7
	private String PFNumberV= "-"; // 5
	private String UANNoV= "-"; // 6
	private String bankName= "-";  // 10
	private String logo;
	
	
	public String getLogo() {
		return logo;
	}
	public void setLogo(String logo) {
		this.logo = logo;
	}
	public String getSerialNo() {
		return SerialNo;
	}
	public void setSerialNo(String serialNo) {
		SerialNo = serialNo;
	}
	public String getMonthNameV() {
		return monthNameV;
	}
	public void setMonthNameV(String monthNameV) {
		this.monthNameV = monthNameV;
	}
	public String getEmpNameV() {
		return empNameV;
	}
	public void setEmpNameV(String empNameV) {
		this.empNameV = empNameV;
	}
	public String getDesignationV() {
		return designationV;
	}
	public void setDesignationV(String designationV) {
		this.designationV = designationV;
	}
	public String getDepartmentV() {
		return departmentV;
	}
	public void setDepartmentV(String departmentV) {
		this.departmentV = departmentV;
	}
	public String getEmpIdV() {
		return empIdV;
	}
	public void setEmpIdV(String empIdV) {
		this.empIdV = empIdV;
	}
	public String getDojV() {
		return dojV;
	}
	public void setDojV(String dojV) {
		this.dojV = dojV;
	}
	public String getAccNumV() {
		return accNumV;
	}
	public void setAccNumV(String accNumV) {
		this.accNumV = accNumV;
	}
	public String getPANV() {
		return PANV;
	}
	public void setPANV(String pANV) {
		PANV = pANV;
	}
	public String getPFNumberV() {
		return PFNumberV;
	}
	public void setPFNumberV(String pFNumberV) {
		PFNumberV = pFNumberV;
	}
	public String getUANNoV() {
		return UANNoV;
	}
	public void setUANNoV(String uANNoV) {
		UANNoV = uANNoV;
	}
	public String getBankName() {
		return bankName;
	}
	public void setBankName(String bankName) {
		this.bankName = bankName;
	}
		
}
