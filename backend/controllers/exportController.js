const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const excelJs = require('exceljs');

//  Get all categories for filters
exports.getCategories = asyncHandler(async (req, res) => {
  try {
    // Get unique student categories
    const studentCategories = await User.distinct('studentCategory', { 
      userType: 'student',
      studentCategory: { $exists: true, $ne: '' }
    });
    
    // Get unique employees roles
    const employeesRoles = await User.distinct('employeesRole', { 
      userType: 'employees',
      employeesRole: { $exists: true, $ne: '' }
    });
    
    // Get unique departments
    const departments = await User.distinct('department', { 
      department: { $exists: true, $ne: '' }
    });
    
    // Get unique courses
    const courses = await User.distinct('course', { 
      course: { $exists: true, $ne: '' }
    });
    
    res.json({
      success: true,
      categories: {
        students: [
          { value: 'all', label: 'All Students' },
          ...studentCategories.filter(c => c).map(c => ({ 
            value: c, 
            label: c.charAt(0).toUpperCase() + c.slice(1) 
          }))
        ],
        employees: [
          { value: 'all', label: 'All employees' },
          ...employeesRoles.filter(r => r).map(r => ({ 
            value: r, 
            label: r.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          }))
        ],
        departments: [
          { value: 'all', label: 'All Departments' },
          ...departments.filter(d => d).map(d => ({ 
            value: d, 
            label: d 
          }))
        ],
        courses: [
          { value: 'all', label: 'All Courses' },
          ...courses.filter(c => c).map(c => ({ 
            value: c, 
            label: c 
          }))
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

//  Export Data
exports.exportData = asyncHandler(async (req, res) => {
    try {
        const { type } = req.params;
        const { format, startDate, endDate, status, category, department, course, studentCategory, employeesRole, paymentStatus } = req.body;

        console.log(`📤 Export request: ${type}, format: ${format}, status: ${status || 'all'}, category: ${category || 'all'}, studentCategory: ${studentCategory || 'all'}, employeesRole: ${employeesRole || 'all'}, department: ${department || 'all'}, course: ${course || 'all'}, paymentStatus: ${paymentStatus || 'all'}`);

        let data;
        let filename = `${type}_${new Date().toISOString().split('T')[0]}`;
        
        // Add filters to filename
        if (status && status !== 'all') filename += `_${status}`;
        if (studentCategory && studentCategory !== 'all') filename += `_${studentCategory}`;
        if (employeesRole && employeesRole !== 'all') filename += `_${employeesRole}`;
        if (department && department !== 'all') filename += `_${department}`;
        if (course && course !== 'all') filename += `_${course}`;

        //  Fetch data based on type from User model
        switch (type) {
            case 'students':
                let studentQuery = { userType: 'student' };
                
                if (status && status !== 'all') studentQuery.status = status;
                // Use studentCategory (from frontend) or fallback to category
                const finalStudentCategory = studentCategory || category;
                if (finalStudentCategory && finalStudentCategory !== 'all') studentQuery.studentCategory = finalStudentCategory;
                if (course && course !== 'all') studentQuery.course = course;
                
                //  Date range filter on admissionDate
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    studentQuery.admissionDate = { $gte: start, $lte: end };
                }
                
                data = await User.find(studentQuery)
                    .select('-password')
                    .lean();
                break;
            
            case 'employees':
                let employeesQuery = { userType: 'employees' };
                
                if (status && status !== 'all') employeesQuery.status = status;
                // Use employeesRole (from frontend) or fallback to category
                const finalemployeesRole = employeesRole || category;
                if (finalemployeesRole && finalemployeesRole !== 'all') employeesQuery.employeesRole = finalemployeesRole;
                if (department && department !== 'all') employeesQuery.department = department;
                
                //  Date range filter on joinDate
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    employeesQuery.joinDate = { $gte: start, $lte: end };
                }
                
                data = await User.find(employeesQuery)
                    .select('-password')
                    .lean();
                break;
            
            case 'payments':
                let paymentUserQuery = {
                    'fees.paymentHistory.0': { $exists: true }
                };
                
                // Handle category filter
                if (category && category !== 'all') {
                    if (category === 'employees') {
                        paymentUserQuery.userType = 'employees';
                    } else {
                        paymentUserQuery.userType = 'student';
                        paymentUserQuery.studentCategory = category;
                    }
                }
                // Override with specific filters if provided
                if (studentCategory && studentCategory !== 'all') {
                    paymentUserQuery.userType = 'student';
                    paymentUserQuery.studentCategory = studentCategory;
                }
                if (employeesRole && employeesRole !== 'all') {
                    paymentUserQuery.userType = 'employees';
                    paymentUserQuery.employeesRole = employeesRole;
                }
                
                const users = await User.find(paymentUserQuery)
                    .select('name userId userType fees.paymentHistory status studentCategory employeesRole department')
                    .lean();
                
                data = [];
                users.forEach(user => {
                    if (user.fees?.paymentHistory) {
                        user.fees.paymentHistory.forEach(payment => {
                            data.push({
                                ...payment,
                                userName: user.name,
                                userId: user.userId,
                                userType: user.userType,
                                userCategory: user.studentCategory || user.employeesRole,
                                userStatus: user.status,
                                userDepartment: user.department
                            });
                        });
                    }
                });

                //  Filter by payment status AFTER flattening
                const finalPaymentStatus = paymentStatus || status;
                if (finalPaymentStatus && finalPaymentStatus !== 'all') {
                    data = data.filter(p => p.status === finalPaymentStatus);
                }

                //  Date range filter on payment date
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    data = data.filter(p => 
                        new Date(p.date) >= start && new Date(p.date) <= end
                    );
                }
                break;
            
            case 'courses':
                let courseQuery = { 
                    userType: 'student',
                    course: { $exists: true, $ne: '' }
                };
                
                // Apply student category filter
                const finalCourseCategory = studentCategory || category;
                if (finalCourseCategory && finalCourseCategory !== 'all') {
                    courseQuery.studentCategory = finalCourseCategory;
                }
                
                //  Date range filter on admissionDate
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    courseQuery.admissionDate = { $gte: start, $lte: end };
                }
                
                const students = await User.find(courseQuery)
                    .select('course studentCategory admissionDate')
                    .lean();
                
                const courseMap = new Map();
                students.forEach(s => {
                    if (s.course) {
                        const key = s.course;
                        if (!courseMap.has(key)) {
                            courseMap.set(key, {
                                course: s.course,
                                category: s.studentCategory,
                                count: 0
                            });
                        }
                        courseMap.get(key).count++;
                    }
                });
                data = Array.from(courseMap.values());
                
                // Apply course filter after aggregation
                if (course && course !== 'all') {
                    data = data.filter(c => c.course === course);
                }
                break;
            
            case 'attendance':
                let attendanceQuery = {
                    'attendance.present': { $exists: true }
                };
                
                // Handle category filter
                if (category && category !== 'all') {
                    if (category === 'employees') {
                        attendanceQuery.userType = 'employees';
                    } else {
                        attendanceQuery.userType = 'student';
                        attendanceQuery.studentCategory = category;
                    }
                }
                // Override with specific filters if provided
                if (studentCategory && studentCategory !== 'all') {
                    attendanceQuery.userType = 'student';
                    attendanceQuery.studentCategory = studentCategory;
                }
                if (employeesRole && employeesRole !== 'all') {
                    attendanceQuery.userType = 'employees';
                    attendanceQuery.employeesRole = employeesRole;
                }
                if (status && status !== 'all') {
                    attendanceQuery.status = status;
                }
                
                const usersWithAttendance = await User.find(attendanceQuery)
                    .select('name userId attendance status userType studentCategory employeesRole')
                    .lean();
                
                data = usersWithAttendance.map(u => ({
                    name: u.name,
                    userId: u.userId,
                    userType: u.userType,
                    category: u.studentCategory || u.employeesRole,
                    status: u.status,
                    present: u.attendance?.present || 0,
                    absent: u.attendance?.absent || 0,
                    percentage: u.attendance?.percentage || 0
                }));
                break;
            
            default:
                return res.status(400).json({ 
                    message: 'Invalid data type. Use: students, employees, payments, courses, or attendance' 
                });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: `No ${type} data found with selected filters` });
        }

        console.log(` Found ${data.length} records for ${type}`);

        //  CSV Export
        if (format === 'csv') {
            let csvContent = '';
            
            if (type === 'students') {
                csvContent = 'User ID,Name,Email,Phone,Course,Category,Department,Total Fees,Paid Fees,Due Fees,Status,Admission Date,Expiry Date\n';
                data.forEach(s => {
                    csvContent += `"${s.userId || ''}","${s.name || ''}","${s.email || ''}","${s.phone || ''}",` +
                        `"${s.course || ''}","${s.studentCategory || ''}","${s.department || ''}",${s.fees?.totalFee || 0},${s.fees?.paidFee || 0},` +
                        `${s.fees?.dueFee || 0},"${s.status || ''}","${s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : ''}",` +
                        `"${s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : ''}"\n`;
                });
            }
            else if (type === 'employees') {
                csvContent = 'User ID,Name,Email,Phone,Role,Department,Salary,Paid Salary,Due Salary,Status,Join Date\n';
                data.forEach(s => {
                    csvContent += `"${s.userId || ''}","${s.name || ''}","${s.email || ''}","${s.phone || ''}",` +
                        `"${s.employeesRole || ''}","${s.department || ''}",${s.fees?.salary || 0},${s.fees?.paidSalary || 0},` +
                        `${s.fees?.dueSalary || 0},"${s.status || ''}","${s.joinDate ? new Date(s.joinDate).toISOString().split('T')[0] : ''}"\n`;
                });
            }
            else if (type === 'payments') {
                csvContent = 'Date,User Name,User ID,User Type,Category,Department,User Status,Amount,Type,Payment Method,Status,Receipt No,Description\n';
                data.forEach(p => {
                    csvContent += `"${new Date(p.date).toISOString().split('T')[0]}","${p.userName || ''}","${p.userId || ''}",` +
                        `"${p.userType || ''}","${p.userCategory || ''}","${p.userDepartment || ''}","${p.userStatus || ''}",${p.amount || 0},"${p.type || ''}","${p.paymentMethod || ''}",` +
                        `"${p.status || ''}","${p.receiptNo || ''}","${p.description || ''}"\n`;
                });
            }
            else if (type === 'courses') {
                csvContent = 'Course,Category,Student Count\n';
                data.forEach(c => {
                    csvContent += `"${c.course || ''}","${c.category || ''}",${c.count || 0}\n`;
                });
            }
            else if (type === 'attendance') {
                csvContent = 'Name,User ID,User Type,Category,Status,Present Days,Absent Days,Attendance %\n';
                data.forEach(a => {
                    csvContent += `"${a.name || ''}","${a.userId || ''}","${a.userType || ''}","${a.category || ''}","${a.status || ''}",${a.present || 0},${a.absent || 0},${a.percentage || 0}\n`;
                });
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            return res.send(csvContent);
        }

        //  Excel Export
        if (format === 'excel') {
            const workbook = new excelJs.Workbook();
            const worksheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1));

            if (type === 'students') {
                worksheet.columns = [
                    { header: 'User ID', key: 'userId', width: 15 },
                    { header: 'Name', key: 'name', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Phone', key: 'phone', width: 15 },
                    { header: 'Course', key: 'course', width: 20 },
                    { header: 'Category', key: 'category', width: 15 },
                    { header: 'Department', key: 'department', width: 15 },
                    { header: 'Total Fees', key: 'totalFees', width: 12, style: { numFmt: '#,##0' } },
                    { header: 'Paid Fees', key: 'paidFees', width: 12, style: { numFmt: '#,##0' } },
                    { header: 'Due Fees', key: 'dueFees', width: 12, style: { numFmt: '#,##0' } },
                    { header: 'Status', key: 'status', width: 12 },
                    { header: 'Admission Date', key: 'admissionDate', width: 15 },
                    { header: 'Expiry Date', key: 'expiryDate', width: 15 }
                ];

                data.forEach(s => {
                    worksheet.addRow({
                        userId: s.userId || '',
                        name: s.name || '',
                        email: s.email || '',
                        phone: s.phone || '',
                        course: s.course || '',
                        category: s.studentCategory || '',
                        department: s.department || '',
                        totalFees: s.fees?.totalFee || 0,
                        paidFees: s.fees?.paidFee || 0,
                        dueFees: s.fees?.dueFee || 0,
                        status: s.status || '',
                        admissionDate: s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '',
                        expiryDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : ''
                    });
                });
            }
            else if (type === 'employees') {
                worksheet.columns = [
                    { header: 'User ID', key: 'userId', width: 15 },
                    { header: 'Name', key: 'name', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Phone', key: 'phone', width: 15 },
                    { header: 'Role', key: 'role', width: 15 },
                    { header: 'Department', key: 'department', width: 20 },
                    { header: 'Salary', key: 'salary', width: 12, style: { numFmt: '#,##0' } },
                    { header: 'Paid Salary', key: 'paidSalary', width: 12, style: { numFmt: '#,##0' } },
                    { header: 'Due Salary', key: 'dueSalary', width: 12, style: { numFmt: '#,##0' } },
                    { header: 'Status', key: 'status', width: 12 },
                    { header: 'Join Date', key: 'joinDate', width: 15 }
                ];

                data.forEach(s => {
                    worksheet.addRow({
                        userId: s.userId || '',
                        name: s.name || '',
                        email: s.email || '',
                        phone: s.phone || '',
                        role: s.employeesRole || '',
                        department: s.department || '',
                        salary: s.fees?.salary || 0,
                        paidSalary: s.fees?.paidSalary || 0,
                        dueSalary: s.fees?.dueSalary || 0,
                        status: s.status || '',
                        joinDate: s.joinDate ? new Date(s.joinDate).toISOString().split('T')[0] : ''
                    });
                });
            }
            else if (type === 'payments') {
                worksheet.columns = [
                    { header: 'Date', key: 'date', width: 15 },
                    { header: 'User Name', key: 'userName', width: 25 },
                    { header: 'User ID', key: 'userId', width: 15 },
                    { header: 'User Type', key: 'userType', width: 12 },
                    { header: 'Category', key: 'category', width: 15 },
                    { header: 'Department', key: 'department', width: 15 },
                    { header: 'User Status', key: 'userStatus', width: 12 },
                    { header: 'Amount', key: 'amount', width: 12, style: { numFmt: '#,##0' } },
                    { header: 'Type', key: 'type', width: 15 },
                    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
                    { header: 'Status', key: 'status', width: 12 },
                    { header: 'Receipt No', key: 'receiptNo', width: 20 },
                    { header: 'Description', key: 'description', width: 30 }
                ];

                data.forEach(p => {
                    worksheet.addRow({
                        date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
                        userName: p.userName || '',
                        userId: p.userId || '',
                        userType: p.userType || '',
                        category: p.userCategory || '',
                        department: p.userDepartment || '',
                        userStatus: p.userStatus || '',
                        amount: p.amount || 0,
                        type: p.type || '',
                        paymentMethod: p.paymentMethod || '',
                        status: p.status || '',
                        receiptNo: p.receiptNo || '',
                        description: p.description || ''
                    });
                });
            }
            else if (type === 'courses') {
                worksheet.columns = [
                    { header: 'Course', key: 'course', width: 30 },
                    { header: 'Category', key: 'category', width: 15 },
                    { header: 'Student Count', key: 'count', width: 15 }
                ];

                data.forEach(c => {
                    worksheet.addRow({
                        course: c.course || '',
                        category: c.category || '',
                        count: c.count || 0
                    });
                });
            }
            else if (type === 'attendance') {
                worksheet.columns = [
                    { header: 'Name', key: 'name', width: 25 },
                    { header: 'User ID', key: 'userId', width: 15 },
                    { header: 'User Type', key: 'userType', width: 12 },
                    { header: 'Category', key: 'category', width: 15 },
                    { header: 'Status', key: 'status', width: 12 },
                    { header: 'Present Days', key: 'present', width: 12 },
                    { header: 'Absent Days', key: 'absent', width: 12 },
                    { header: 'Attendance %', key: 'percentage', width: 12 }
                ];

                data.forEach(a => {
                    worksheet.addRow({
                        name: a.name || '',
                        userId: a.userId || '',
                        userType: a.userType || '',
                        category: a.category || '',
                        status: a.status || '',
                        present: a.present || 0,
                        absent: a.absent || 0,
                        percentage: a.percentage || 0
                    });
                });
            }

            worksheet.getRow(1).eachCell(cell => {
                cell.font = { bold: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
            
            await workbook.xlsx.write(res);
            return res.end();
        }

        //  PDF Export
        if (format === 'pdf') {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50 });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
            
            doc.pipe(res);
            
            doc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: 'center' });
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()} | Total Records: ${data.length}`, { align: 'center' });
            if (status && status !== 'all') doc.fontSize(10).text(`Status Filter: ${status}`, { align: 'center' });
            if (studentCategory && studentCategory !== 'all') doc.fontSize(10).text(`Student Category Filter: ${studentCategory}`, { align: 'center' });
            if (employeesRole && employeesRole !== 'all') doc.fontSize(10).text(`employees Role Filter: ${employeesRole}`, { align: 'center' });
            if (department && department !== 'all') doc.fontSize(10).text(`Department Filter: ${department}`, { align: 'center' });
            if (course && course !== 'all') doc.fontSize(10).text(`Course Filter: ${course}`, { align: 'center' });
            doc.moveDown(2);
            
            let y = doc.y;
            const leftMargin = 50;
            const rowHeight = 20;
            
            if (type === 'students') {
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('User ID', leftMargin, y);
                doc.text('Name', leftMargin + 80, y);
                doc.text('Course', leftMargin + 200, y);
                doc.text('Category', leftMargin + 300, y);
                doc.text('Status', leftMargin + 380, y);
                doc.text('Due Fees', leftMargin + 440, y);
                
                y += rowHeight;
                doc.font('Helvetica');
                doc.fontSize(9);
                
                data.forEach(s => {
                    if (y > 700) { doc.addPage(); y = 50; }
                    doc.text(s.userId || '', leftMargin, y);
                    doc.text(s.name || '', leftMargin + 80, y);
                    doc.text(s.course || '', leftMargin + 200, y);
                    doc.text(s.studentCategory || '', leftMargin + 300, y);
                    doc.text(s.status || '', leftMargin + 380, y);
                    doc.text(`₹${s.fees?.dueFee || 0}`, leftMargin + 440, y);
                    y += rowHeight;
                });
            }
            else if (type === 'employees') {
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('User ID', leftMargin, y);
                doc.text('Name', leftMargin + 80, y);
                doc.text('Role', leftMargin + 200, y);
                doc.text('Department', leftMargin + 280, y);
                doc.text('Status', leftMargin + 380, y);
                doc.text('Due Salary', leftMargin + 440, y);
                
                y += rowHeight;
                doc.font('Helvetica');
                doc.fontSize(9);
                
                data.forEach(s => {
                    if (y > 700) { doc.addPage(); y = 50; }
                    doc.text(s.userId || '', leftMargin, y);
                    doc.text(s.name || '', leftMargin + 80, y);
                    doc.text(s.employeesRole || '', leftMargin + 200, y);
                    doc.text(s.department || '', leftMargin + 280, y);
                    doc.text(s.status || '', leftMargin + 380, y);
                    doc.text(`₹${s.fees?.dueSalary || 0}`, leftMargin + 440, y);
                    y += rowHeight;
                });
            }
            else if (type === 'payments') {
                doc.fontSize(10).font('Helvetica-Bold');
                doc.text('Date', leftMargin, y);
                doc.text('User', leftMargin + 70, y);
                doc.text('Type', leftMargin + 190, y);
                doc.text('Amount', leftMargin + 260, y);
                doc.text('Method', leftMargin + 330, y);
                doc.text('Status', leftMargin + 410, y);
                
                y += rowHeight;
                doc.font('Helvetica');
                doc.fontSize(9);
                
                data.forEach(p => {
                    if (y > 700) { doc.addPage(); y = 50; }
                    const date = p.date ? new Date(p.date).toISOString().split('T')[0] : '';
                    doc.text(date, leftMargin, y);
                    doc.text(p.userName || '', leftMargin + 70, y, { width: 120, truncate: true });
                    doc.text(p.type || '', leftMargin + 190, y);
                    doc.text(`₹${p.amount || 0}`, leftMargin + 260, y);
                    doc.text(p.paymentMethod || '', leftMargin + 330, y);
                    doc.text(p.status || '', leftMargin + 410, y);
                    y += rowHeight;
                });
            }
            
            doc.end();
            return;
        }

        res.status(400).json({ message: 'Format not supported. Use csv, excel or pdf.' });
        
    } catch (error) {
        console.error(' Export error:', error);
        res.status(500).json({ 
            message: `Export failed for ${req.params.type}`, 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
        });
    }
});