import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const createOrder = createAsyncThunk(
  'payments/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/create-order', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payments/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/verify', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'payments/fetchUserOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'payments/applyCoupon',
  async ({ couponCode, eventId, amount }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/apply-coupon', {
        couponCode,
        eventId,
        amount,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  razorpayOrder: null,
  paymentStatus: 'idle', // idle, processing, success, failed
  appliedCoupon: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentStatus: (state) => {
      state.paymentStatus = 'idle';
    },
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
    setPaymentProcessing: (state) => {
      state.paymentStatus = 'processing';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data.order;
        state.razorpayOrder = action.payload.data.razorpayOrder;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.paymentStatus = 'processing';
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.paymentStatus = 'success';
        state.currentOrder = action.payload.data.order;
        state.orders.unshift(action.payload.data.order);
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.paymentStatus = 'failed';
        state.error = action.payload;
      })

      // Fetch User Orders
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.orders = action.payload.data.orders;
      })

      // Apply Coupon
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.appliedCoupon = action.payload.data;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.error = action.payload;
        state.appliedCoupon = null;
      });
  },
});

export const {
  clearError,
  clearPaymentStatus,
  clearAppliedCoupon,
  setPaymentProcessing,
} = paymentSlice.actions;

export default paymentSlice.reducer;
