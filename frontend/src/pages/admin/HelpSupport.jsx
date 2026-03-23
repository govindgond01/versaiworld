import { useState } from 'react';
import { 
  FiHelpCircle, FiSearch, FiMessageSquare,
  FiPhone, FiMail, FiGlobe, FiCheckCircle, 
  FiAlertCircle, FiClock, FiChevronRight
} from 'react-icons/fi';
import { 
  MdOutlineSupportAgent, MdContactSupport,
  MdOutlineQuestionAnswer
} from 'react-icons/md';

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketData, setTicketData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // FAQs based on admin menu structure
  const faqs = [
    // Dashboard Related
    { q: 'What does the Dashboard show?', a: 'Dashboard shows overview stats for Library, Academy and Staff.', cat: 'dashboard' },
    { q: 'How to view Library dashboard?', a: 'Go to Dashboard → Library Dashboard', cat: 'dashboard' },
    { q: 'How to view Academy dashboard?', a: 'Go to Dashboard → Academy Dashboard', cat: 'dashboard' },
    { q: 'How to view Staff dashboard?', a: 'Go to Dashboard → Staff Dashboard', cat: 'dashboard' },
    
    // Payments Related
    { q: 'How to view Payments dashboard?', a: 'Go to Payments → Dashboard Payments', cat: 'payments' },
    { q: 'How to check Academy payments?', a: 'Go to Payments → Academy Payments', cat: 'payments' },
    { q: 'How to check Library payments?', a: 'Go to Payments → Library Payments', cat: 'payments' },
    { q: 'How to manage Staff payments?', a: 'Go to Payments → Staff Payments', cat: 'payments' },
    { q: 'How to add a new payment?', a: 'Go to Payments → Add Payment', cat: 'payments' },
    { q: 'How to view payment history?', a: 'Go to Payments → History Payments', cat: 'payments' },
    { q: 'How to check due payments?', a: 'Go to Payments → Due Payments', cat: 'payments' },
    
    // Students Related
    { q: 'How to view all students?', a: 'Go to Students → All Students', cat: 'students' },
    { q: 'How to add a new student?', a: 'Go to Students → Add Student', cat: 'students' },
    { q: 'How to manage student types?', a: 'Go to Students → Student Types', cat: 'students' },
    { q: 'How to view expiring soon students?', a: 'Go to Students → Expiring Soon', cat: 'students' },
    
    // Staff Related
    { q: 'How to view all staff members?', a: 'Go to Staff Management → All Staffs', cat: 'staff' },
    { q: 'How to add a new staff member?', a: 'Go to Staff Management → Add Staff', cat: 'staff' },
    { q: 'How to view staff analytics?', a: 'Go to Staff Management → Staffs Analytics', cat: 'staff' },
    
    // Attendance Related
    { q: 'How to mark Academy attendance?', a: 'Go to Attendance → Attendance Academy', cat: 'attendance' },
    { q: 'How to mark Library attendance?', a: 'Go to Attendance → Attendance Library', cat: 'attendance' },
    { q: 'How to mark Staff attendance?', a: 'Go to Attendance → Attendance Staffs', cat: 'attendance' },
    
    // Other Features
    { q: 'How to export data?', a: 'Click on Export Data in the menu', cat: 'export' },
    { q: 'How to change system settings?', a: 'Go to System Settings', cat: 'settings' },
    { q: 'How to check notifications?', a: 'Click on Notifications', cat: 'notifications' }
  ];

  const quickActions = [
    { label: 'Live Chat', icon: <FiMessageSquare />, color: 'blue', desc: 'Chat with agent', action: () => setActiveTab('contact') },
    { label: 'Call', icon: <FiPhone />, color: 'green', desc: '+91-8619708196', action: () => window.location.href = 'tel:+918619708196' },
    { label: 'Email', icon: <FiMail />, color: 'purple', desc: 'versaiacademy94@gmail.com', action: () => window.location.href = 'mailto:versaiacademy94@gmail.com' },
    { label: 'Ticket', icon: <MdOutlineSupportAgent />, color: 'yellow', desc: 'Create ticket', action: () => setActiveTab('ticket') }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:versaiacademy94@gmail.com?subject=${encodeURIComponent(ticketData.subject)}&body=${encodeURIComponent(
      `Name: ${ticketData.name}\nEmail: ${ticketData.email}\nPriority: ${ticketData.priority}\n\nMessage:\n${ticketData.message}`
    )}`;
    
    window.location.href = mailtoLink;
    
    setSubmitStatus('success');
    setTicketData({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
    
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      dashboard: 'bg-blue-100 text-blue-700',
      payments: 'bg-green-100 text-green-700',
      students: 'bg-purple-100 text-purple-700',
      staff: 'bg-orange-100 text-orange-700',
      attendance: 'bg-pink-100 text-pink-700',
      export: 'bg-indigo-100 text-indigo-700',
      settings: 'bg-gray-100 text-gray-700',
      notifications: 'bg-yellow-100 text-yellow-700'
    };
    return colors[cat] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sm:max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
              <FiHelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                <FiClock className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span>24/7 support available</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar - Mobile Optimized */}
        <div className="relative max-w-2xl mx-auto mb-4 sm:mb-6">
          <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input 
            type="text" 
            placeholder="Search FAQs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-8 sm:px-10 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
          />
        </div>

        {/* Quick Actions Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {quickActions.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 text-center hover:shadow-md transition-all active:scale-95`}
            >
              <div className={`text-xl sm:text-2xl md:text-3xl text-${item.color}-600 mb-1 sm:mb-2`}>{item.icon}</div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">{item.label}</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 break-words">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* Tabs with Icons and Labels - Responsive */}
        <div className="bg-white rounded-t-xl border border-gray-200 border-b-0">
          <div className="flex flex-wrap items-center gap-1 p-1 sm:p-2">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
                activeTab === 'faq'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MdOutlineQuestionAnswer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>FAQ</span>
            </button>
            
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
                activeTab === 'contact'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Contact</span>
            </button>
            
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
                activeTab === 'ticket'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MdOutlineSupportAgent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Ticket</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl border border-gray-200 border-t-0">
          {/* FAQs Tab */}
          {activeTab === 'faq' && (
            <div className="p-3 sm:p-4 md:p-6">
              <h2 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <MdOutlineQuestionAnswer className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> 
                <span>Frequently Asked Questions</span>
              </h2>
              
              {filteredFaqs.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {filteredFaqs.map((faq, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-200 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-1">{faq.q}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{faq.a}</p>
                        </div>
                        <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap self-start ${getCategoryColor(faq.cat)}`}>
                          {faq.cat}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <FiSearch className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500">No FAQs found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="p-3 sm:p-4 md:p-6">
              <h2 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <MdContactSupport className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> 
                <span>Contact Information</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Support Hours */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-gray-900 text-xs sm:text-sm">Support Hours</h3>
                  {[
                    { day: 'Mon - Fri', hours: '9:00 AM - 6:00 PM' },
                    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                    { day: 'Sunday', hours: 'Closed' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                      <span className="text-gray-600">{item.day}</span>
                      <span className="font-medium text-gray-900">{item.hours}</span>
                    </div>
                  ))}
                </div>

                {/* Contact Details */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-medium text-gray-900 text-xs sm:text-sm">Contact Details</h3>
                  <div className="space-y-2">
                    <a href="tel:+918619708196" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg text-blue-600">
                        <FiPhone className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-900">+91-8619708196</span>
                    </a>
                    
                    <a href="mailto:versaiacademy94@gmail.com" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg text-blue-600">
                        <FiMail className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-900 break-all">versaiacademy94@gmail.com</span>
                    </a>
                    
                    <a href="https://help.versai.edu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg text-blue-600">
                        <FiGlobe className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-900">help.versai.edu</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Tab */}
          {activeTab === 'ticket' && (
            <div className="p-3 sm:p-4 md:p-6">
              <h2 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <MdOutlineSupportAgent className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> 
                <span>Submit Support Ticket</span>
              </h2>
              
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Tickets will be sent to <span className="font-medium text-blue-600">versaiacademy94@gmail.com</span>
              </p>
              
              {/* Status Message */}
              {submitStatus === 'success' && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Ticket submitted successfully! We'll get back to you soon.</span>
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Name *" 
                    value={ticketData.name}
                    onChange={(e) => setTicketData({...ticketData, name: e.target.value})}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email *" 
                    value={ticketData.email}
                    onChange={(e) => setTicketData({...ticketData, email: e.target.value})}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <input 
                    type="text" 
                    placeholder="Subject *" 
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                    required
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                  />
                  <select 
                    value={ticketData.priority}
                    onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                    className="w-full sm:w-32 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <textarea 
                  placeholder="Describe your issue in detail *" 
                  value={ticketData.message}
                  onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
                  required
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm h-24 sm:h-32 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                />
                
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setTicketData({
                        name: '',
                        email: '',
                        subject: '',
                        message: '',
                        priority: 'medium'
                      });
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-50 order-2 sm:order-1"
                  >
                    Clear
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    Submit Ticket
                    <FiMail className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                
                <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-2">
                  Response time: Within 24 hours
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;