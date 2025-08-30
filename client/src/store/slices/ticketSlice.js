import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchUserTickets = createAsyncThunk(
  'tickets/fetchUserTickets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/tickets', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const verifyTicket = createAsyncThunk(
  'tickets/verifyTicket',
  async ({ ticketId, qrCode }, { rejectWithValue }) => {
    try {
      const response = await api.post('/tickets/verify', { ticketId, qrCode });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const checkInTicket = createAsyncThunk(
  'tickets/checkInTicket',
  async ({ ticketId, location }, { rejectWithValue }) => {
    try {
      const response = await api.post('/tickets/checkin', { ticketId, location });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  tickets: [],
  categorizedTickets: {
    upcoming: [],
    past: [],
    cancelled: [],
  },
  loading: false,
  error: null,
  verificationResult: null,
  checkInResult: null,
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVerificationResult: (state) => {
      state.verificationResult = null;
    },
    clearCheckInResult: (state) => {
      state.checkInResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Tickets
      .addCase(fetchUserTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data.tickets;
        state.categorizedTickets = action.payload.data.categorizedTickets;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Ticket
      .addCase(verifyTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationResult = action.payload.data;
      })
      .addCase(verifyTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check In Ticket
      .addCase(checkInTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.checkInResult = action.payload.data;
        // Update the ticket in the list
        const ticketIndex = state.tickets.findIndex(
          ticket => ticket.ticketId === action.payload.data.ticket.ticketId
        );
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = action.payload.data.ticket;
        }
      })
      .addCase(checkInTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearVerificationResult, clearCheckInResult } = ticketSlice.actions;
export default ticketSlice.reducer;
