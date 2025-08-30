import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Ticket, 
  DollarSign, 
  Users,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../api/events';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ticketSchema = yup.object({
  name: yup.string().required('Ticket name is required').min(3, 'Name must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  maxQuantity: yup.number().integer().min(1, 'Quantity must be at least 1').required('Quantity is required'),
  saleStartDate: yup.date().required('Sale start date is required'),
  saleEndDate: yup.date().required('Sale end date is required'),
  isActive: yup.boolean()
});

const ManageTickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [tickets, setTickets] = useState([]);

  const { data: event, isLoading: eventLoading, error } = useQuery(
    ['event', id],
    () => eventsAPI.getEventById(id)
  );

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
    resolver: yupResolver(ticketSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    if (event?.tickets) {
      setTickets(event.tickets);
    }
  }, [event]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const ticketData = {
        ...data,
        price: parseFloat(data.price),
        maxQuantity: parseInt(data.maxQuantity),
        isActive: data.isActive || false
      };

      if (editingTicket) {
        // Update existing ticket
        const updatedTickets = tickets.map(ticket => 
          ticket._id === editingTicket._id ? { ...ticket, ...ticketData } : ticket
        );
        setTickets(updatedTickets);
        toast.success('Ticket updated successfully!');
      } else {
        // Add new ticket
        const newTicket = {
          _id: Date.now().toString(), // Temporary ID for frontend
          ...ticketData,
          soldQuantity: 0
        };
        setTickets([...tickets, newTicket]);
        toast.success('Ticket created successfully!');
      }

      setShowTicketForm(false);
      setEditingTicket(null);
      reset();
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error('Failed to save ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setValue('name', ticket.name);
    setValue('description', ticket.description);
    setValue('price', ticket.price);
    setValue('maxQuantity', ticket.maxQuantity);
    setValue('saleStartDate', new Date(ticket.saleStartDate).toISOString().slice(0, 16));
    setValue('saleEndDate', new Date(ticket.saleEndDate).toISOString().slice(0, 16));
    setValue('isActive', ticket.isActive);
    setShowTicketForm(true);
  };

  const handleDeleteTicket = (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      const updatedTickets = tickets.filter(ticket => ticket._id !== ticketId);
      setTickets(updatedTickets);
      toast.success('Ticket deleted successfully!');
    }
  };

  const handleCancel = () => {
    setShowTicketForm(false);
    setEditingTicket(null);
    reset();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            onClick={() => navigate('/organizer')}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.soldQuantity * ticket.price), 0);
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.soldQuantity, 0);
  const totalCapacity = tickets.reduce((sum, ticket) => sum + ticket.maxQuantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/organizer')}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Tickets</h1>
              <p className="mt-2 text-gray-600">Create and manage ticket types for your event.</p>
            </div>
            <button
              onClick={() => setShowTicketForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Ticket Type
            </button>
          </div>
        </div>

        {/* Event Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <p className="text-gray-600">{event.description}</p>
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(event.startAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {event.capacity} capacity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
                <p className="text-sm text-gray-500">{tickets.length} ticket types</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">{totalTicketsSold}</p>
                <p className="text-sm text-gray-500">
                  {totalCapacity > 0 ? ((totalTicketsSold / totalCapacity) * 100).toFixed(1) : 0}% sold
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">From ticket sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Form */}
        {showTicketForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-6">
              {editingTicket ? 'Edit Ticket Type' : 'Create New Ticket Type'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Early Bird, VIP, General Admission"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Quantity *
                  </label>
                  <input
                    type="number"
                    {...register('maxQuantity')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                  {errors.maxQuantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxQuantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active (available for purchase)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what's included with this ticket type..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    {...register('saleStartDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.saleStartDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.saleStartDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale End Date *
                  </label>
                  <input
                    type="datetime-local"
                    {...register('saleEndDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.saleEndDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.saleEndDate.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : (editingTicket ? 'Update Ticket' : 'Create Ticket')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ticket Types</h3>
          </div>
          
          {tickets.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{ticket.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          ticket.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{ticket.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Price:</span> ₹{ticket.price}
                        </div>
                        <div>
                          <span className="font-medium">Available:</span> {ticket.maxQuantity - ticket.soldQuantity}
                        </div>
                        <div>
                          <span className="font-medium">Sold:</span> {ticket.soldQuantity}
                        </div>
                        <div>
                          <span className="font-medium">Revenue:</span> ₹{(ticket.soldQuantity * ticket.price).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="font-medium">Sale Period:</span> {new Date(ticket.saleStartDate).toLocaleDateString()} - {new Date(ticket.saleEndDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit ticket"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete ticket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No ticket types</h3>
              <p className="text-sm text-gray-500 mb-6">Get started by creating your first ticket type.</p>
              <button
                onClick={() => setShowTicketForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Ticket Type
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTickets;
