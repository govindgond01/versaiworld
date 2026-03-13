const adminMenu = [
  {
    items:[
       {
        type: "dropdown",
        path: "/admin-dashboard",
        icon: "dashboard",
        label: "Dashboard",
        subItems: [
          {
            path: "/admin-dashboard/library-dash",
            label: "Library",
          },
          {
            path: "/admin-dashboard/academy-dash",
            label: "Academy",
          },
          {
            path: "/admin-dashboard/staff-dash",
            label: "Staff",
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
            path: "/admin-dashboard/payments/dashboard",
            label: "Dashboard Payments",
          },
          {
            path: "/admin-dashboard/payments/academy",
            label: "Academy Payments",
          },
          {
            path: "/admin-dashboard/payments/library",
            label: "Library Payments",
          },
          {
            path: "/admin-dashboard/payments/staff",
            label: "Staff Payments",
          },
          {
            path: "/admin-dashboard/payments/add",
            label: "Add Payment",
          },
          {
            path: "/admin-dashboard/payments/history",
            label: "History Payments",
          },
          {
            path: "/admin-dashboard/payments/due-payments",
            label: "Due Payments",
          }
        ],
      },
      
      {
        type: "dropdown",
        key: "students",
        path: "/admin-dashboard/students",
        icon: "users",
        label: "Students",
        subItems: [
          {
            path: "/admin-dashboard/students/all",
            label: "All Students",
          },
          {
            path: "/admin-dashboard/students/add",
            label: "Add Student",
          },
          {
            path: "/admin-dashboard/students/types",
            label: "Student Types",
          },
          {
            path: "/admin-dashboard/students/expiring-soon",
            label: "Expiring Soon",
          },
        ],
      },
      {
        type: "dropdown",
        key: "staff",
        icon: "adminstaff",
        label: "Staff Management",
        subItems: [
          {
            path: "/admin-dashboard/staff/all",
            label: "All Staffs",
          },
          {
            path: "/admin-dashboard/staff/add",
            label: "Add Staff",
          },
          {
            path: "/admin-dashboard/staff/analytics",
            label: "Staffs Analytics",
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
            path: "/admin-dashboard/attendance/academy",
            label: "Attendance Academy",
          },
          {
            path: "/admin-dashboard/attendance/library",
            label: "Attendance Library",
          },
          {
            path: "/admin-dashboard/attendance/staff",
            label: "Attendance Staffs",
          }
        ],
      },
      {
        path: "/admin-dashboard/export",
        icon: "database",
        label: "Export Data",
      },
      {
        path: "/admin-dashboard/profile",
        icon: "adminstaff",
        label: "Admin Profile"
      },
      {
        path: "/admin-dashboard/settings",
        icon: "setting",
        label: "System Settings",
      },
      {
        path: "/admin-dashboard/notifications",
        icon: "bell",
        label: "Notifications",
        badge: "5",
      },
      {
        path: "/admin-dashboard/help",
        icon: "help",
        label: "Help & Support",
      },
    ]
  },
];

export default adminMenu;