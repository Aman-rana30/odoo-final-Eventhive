export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  if (!time) return 'TBD';
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getEventStatusColor = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const isEventUpcoming = (startDate) => {
  return new Date(startDate) > new Date();
};

export const getEventCategory = (category) => {
  const categories = {
    music: '🎵 Music',
    sports: '⚽ Sports',
    technology: '💻 Technology',
    business: '💼 Business',
    education: '📚 Education',
    entertainment: '🎭 Entertainment',
    workshop: '🛠️ Workshop',
    hackathon: '🏆 Hackathon',
    conference: '🎤 Conference',
    other: '📅 Other',
  };
  return categories[category] || categories.other;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

export const generateTicketPDF = async (ticket) => {
  // This would integrate with a PDF generation library
  // For now, we'll use the browser's print functionality
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Ticket - ${ticket.event.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .ticket { border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; }
          .qr-code { text-align: center; margin: 20px 0; }
          .event-details { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h1>EventMitra Ticket</h1>
          <div class="event-details">
            <h2>${ticket.event.title}</h2>
            <p><strong>Date:</strong> ${formatDate(ticket.event.startDate)}</p>
            <p><strong>Time:</strong> ${ticket.event.startTime || 'TBD'}</p>
            <p><strong>Venue:</strong> ${ticket.event.venue.name}</p>
            <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
            <p><strong>Attendee:</strong> ${ticket.attendee.firstName} ${ticket.attendee.lastName}</p>
          </div>
          <div class="qr-code">
            <img src="${ticket.qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
            <p>Scan this QR code at the venue</p>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};
