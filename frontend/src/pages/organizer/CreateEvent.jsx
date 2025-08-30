import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../api/events';

const schema = yup.object({
  title: yup.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters').required('Title is required'),
  description: yup.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description cannot exceed 5000 characters').required('Description is required'),
  category: yup.string().required('Category is required'),
  venue: yup.object({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    country: yup.string().default('India'),
    type: yup.string().oneOf(['indoor', 'outdoor']).default('indoor')
  }).required(),
  startAt: yup.date().min(new Date(), 'Start date must be in the future').required('Start date is required'),
  endAt: yup.date().min(yup.ref('startAt'), 'End date must be after start date').required('End date is required'),
  capacity: yup.number().integer().min(1, 'Capacity must be at least 1').required('Capacity is required'),
  tags: yup.array().of(yup.string()).optional()
});

const categories = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'concert', label: 'Concert' },
  { value: 'sports', label: 'Sports' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'conference', label: 'Conference' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'festival', label: 'Festival' },
  { value: 'other', label: 'Other' }
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      venue: {
        country: 'India',
        type: 'indoor'
      }
    }
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      setCoverImage(file);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const eventData = {
        ...data,
        tags,
        coverImage
      };

      await eventsAPI.createEvent(eventData);
      toast.success('Event created successfully!');
      navigate('/organizer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details below to create a new event.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your event..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Venue Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Venue Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                {...register('venue.address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter venue address"
              />
              {errors.venue?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.venue.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                {...register('venue.city')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
              />
              {errors.venue?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.venue.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                {...register('venue.state')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter state"
              />
              {errors.venue?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.venue.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Type
              </label>
              <select
                {...register('venue.type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Date and Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                {...register('startAt')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startAt && (
                <p className="mt-1 text-sm text-red-600">{errors.startAt.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                {...register('endAt')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endAt && (
                <p className="mt-1 text-sm text-red-600">{errors.endAt.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity and Cover Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Capacity *
              </label>
              <input
                type="number"
                {...register('capacity')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter maximum capacity"
                min="1"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {coverImage && (
                <p className="mt-2 text-sm text-gray-600">Selected: {coverImage.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/organizer')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
