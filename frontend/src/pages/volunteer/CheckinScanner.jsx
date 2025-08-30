import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Users,
  Clock,
  Search,
  Download,
  Mail,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../api/events';
import { bookingsAPI } from '../../api/bookings';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CheckinScanner = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [manualBookingId, setManualBookingId] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { data: event, isLoading: eventLoading, error } = useQuery(
    ['event', eventId],
    () => eventsAPI.getEventById(eventId),
    {
      enabled: !!eventId
    }
  );

  const { data: bookings, isLoading: bookingsLoading } = useQuery(
    ['eventBookings', eventId],
    () => bookingsAPI.getEventBookings(eventId),
    {
      enabled: !!eventId
    }
  );

  useEffect(() => {
    // Mock check-in history
    if (bookings) {
      const history = bookings.slice(0, 10).map(booking => ({
        id: booking._id,
        bookingId: booking.bookingId || booking._id.slice(-8),
        customerName: booking.user?.name || 'Anonymous',
        customerEmail: booking.user?.email,
        checkinTime: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
        status: Math.random() > 0.3 ? 'checked-in' : 'pending', // 70% checked in
        tickets: booking.tickets?.length || 0
      }));
      setCheckinHistory(history);
    }
  }, [bookings]);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = (data) => {
    if (data) {
      setScannedData(data);
      stopScanning();
      toast.success('QR Code scanned successfully!');
    }
  };

  const handleManualCheckin = async () => {
    if (!manualBookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }

    try {
      // Mock check-in process
      const booking = bookings?.find(b => 
        b.bookingId === manualBookingId || 
        b._id.slice(-8) === manualBookingId
      );

      if (booking) {
        // Add to check-in history
        const newCheckin = {
          id: booking._id,
          bookingId: booking.bookingId || booking._id.slice(-8),
          customerName: booking.user?.name || 'Anonymous',
          customerEmail: booking.user?.email,
          checkinTime: new Date(),
          status: 'checked-in',
          tickets: booking.tickets?.length || 0
        };

        setCheckinHistory([newCheckin, ...checkinHistory]);
        setManualBookingId('');
        toast.success(`Successfully checked in ${newCheckin.customerName}`);
      } else {
        toast.error('Booking not found');
      }
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (eventLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or you don't have permission.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalBookings = bookings?.length || 0;
  const checkedInCount = checkinHistory.filter(item => item.status === 'checked-in').length;
  const pendingCount = totalBookings - checkedInCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Check-in Scanner</h1>
          <p className="mt-2 text-gray-600">Scan QR codes to check in attendees for the event.</p>
        </div>

        {/* Event Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(event.startAt).toLocaleDateString()} at {new Date(event.startAt).toLocaleTimeString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {event.capacity} capacity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-gray-900">{checkedInCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="space-y-6">
            {/* QR Scanner */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">QR Code Scanner</h3>
              
              {!isScanning ? (
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Click the button below to start scanning QR codes</p>
                  <button
                    onClick={startScanning}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Scanner
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 bg-gray-900 rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white rounded-lg w-48 h-48"></div>
                    </div>
                  </div>
                  <button
                    onClick={stopScanning}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Stop Scanner
                  </button>
                </div>
              )}
            </div>

            {/* Manual Check-in */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Manual Check-in</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking ID
                  </label>
                  <input
                    type="text"
                    value={manualBookingId}
                    onChange={(e) => setManualBookingId(e.target.value)}
                    placeholder="Enter booking ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleManualCheckin}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Check In
                </button>
              </div>
            </div>

            {/* Scanned Data */}
            {scannedData && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Scanned Data</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{scannedData}</pre>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setScannedData(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      // Process the scanned data
                      toast.success('Processing scanned data...');
                      setScannedData(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Process
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Check-in History */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Check-in History</h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {checkinHistory.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {checkinHistory
                    .filter(item => 
                      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <div key={item.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900">{item.customerName}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{item.status}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{item.customerEmail}</p>
                            <p className="text-xs text-gray-400">
                              Booking ID: {item.bookingId} • {item.tickets} tickets • {item.checkinTime.toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toast.success(`Resending ticket to ${item.customerEmail}`)}
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title="Resend ticket"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toast.success(`Downloading ticket for ${item.customerName}`)}
                              className="p-1 text-green-600 hover:text-green-900"
                              title="Download ticket"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No check-ins yet</h3>
                  <p className="text-sm text-gray-500">Start scanning QR codes to see check-in history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinScanner;
