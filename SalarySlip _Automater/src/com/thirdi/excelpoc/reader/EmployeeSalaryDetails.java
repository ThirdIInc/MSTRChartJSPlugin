package com.thirdi.excelpoc.reader;

public class EmployeeSalaryDetails {

	  
	    private EmployeeSalaryBreakDown salaryBreakdown = new EmployeeSalaryBreakDown();
		private EmployeeDetails empDetails = new  EmployeeDetails();
		private EmployeeLeaves empLeaves = new EmployeeLeaves();
		
		
		public EmployeeSalaryBreakDown getSalaryBreakdown() {
			return salaryBreakdown;
		}

		public void setSalaryBreakdown(EmployeeSalaryBreakDown salaryBreakdown) {
			this.salaryBreakdown = salaryBreakdown;
		}

		public EmployeeDetails getEmpDetails() {
			return empDetails;
		}
		
		public void setEmpDetails(EmployeeDetails empDetails) {
			this.empDetails = empDetails;
		}
		
		public EmployeeLeaves getEmpLeaves() {
			return empLeaves;
		}
		
		public void setEmpLeaves(EmployeeLeaves empLeaves) {
			this.empLeaves = empLeaves;
		}
		
		
	  
	  
}
