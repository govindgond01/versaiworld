const adminMenu = [
  {
    items:[
       {
        type: "dropdown",
        key: "super-admin",
        icon: "adminemployees",
        label: "Super Admin",
        subItems: [
          {
            path: "/admin/super-admin/stats",
            label: "Admin Statistics",
          },
          {
            path: "/admin/super-admin/users",
            label: "User Management",
          },
        ],
      },
       {
        type: "dropdown",
        path: "/admin",
        icon: "dashboard",
        label: "Dashboard",
        subItems: [
          {
            path: "/admin/library-dash",
            label: "Library",
          },
          {
            path: "/admin/academy-dash",
            label: "Academy",
          },
          {
            path: "/admin/employees-dash",
            label: "Employees",
          },
        ],
      },
       {
        type: "dropdown",
        key: "payments",
        icon: "rupees",
        label: "Payments",
        subItems: [
          {
            path: "/admin/payments/dashboard",
            label: "Dashboard Payments",
          },
          {
            path: "/admin/payments/academy",
            label: "Academy Payments",
          },
          {
            path: "/admin/payments/library",
            label: "Library Payments",
          },
          {
            path: "/admin/payments/employees",
            label: "Employees Payments",
          },
          {
            path: "/admin/payments/add",
            label: "Add Payment",
          },
          {
            path: "/admin/payments/history",
            label: "History Payments",
          },
          {
            path: "/admin/payments/due-payments",
            label: "Due Payments",
          }
        ],
      },
      
      {
        type: "dropdown",
        key: "students",
        path: "/admin/students",
        icon: "users",
        label: "Students",
        subItems: [
          {
            path: "/admin/students/all",
            label: "All Students",
          },
          {
            path: "/admin/students/add",
            label: "Add Student",
          },
          {
            path: "/admin/students/types",
            label: "Student Types",
          },
          {
            path: "/admin/students/expiring-soon",
            label: "Expiring Soon",
          },
        ],
      },
      {
        type: "dropdown",
        key: "employees",
        icon: "adminemployees",
        label: "Employees Management",
        subItems: [
          {
            path: "/admin/employees/all",
            label: "All Employees",
          },
          {
            path: "/admin/employees/add",
            label: "Add Employees",
          },
          {
            path: "/admin/employees/analytics",
            label: "Employees Analytics",
          }
        ],
      },
      {
        type: "dropdown",
        key: "attendance",
        icon: "attendance",
        label: "Attendance",
        subItems: [
          {
            path: "/admin/attendance/academy",
            label: "Attendance Academy",
          },
          {
            path: "/admin/attendance/library",
            label: "Attendance Library",
          },
          {
            path: "/admin/attendance/employees",
            label: "Attendance Employees",
          }
        ],
      },
      {
        path: "/admin/export",
        icon: "database",
        label: "Export Data",
      },
      {
        path: "/admin/profile",
        icon: "adminemployees",
        label: "Admin Profile"
      },
      {
        path: "/admin/settings",
        icon: "setting",
        label: "System Settings",
      },
      {
        path: "/admin/notifications",
        icon: "bell",
        label: "Notifications",
        badge: "5",
      },
      {
        path: "/admin/help",
        icon: "help",
        label: "Help & Support",
      },
    ]
  },
];

export default adminMenu;