import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import eventSlice from './slices/eventSlice';
import ticketSlice from './slices/ticketSlice';
import paymentSlice from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    events: eventSlice,
    tickets: ticketSlice,
    payments: paymentSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
