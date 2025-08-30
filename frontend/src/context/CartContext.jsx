import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  eventId: null,
  subtotal: 0,
  discount: 0,
  total: 0,
  appliedCoupon: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EVENT':
      // Clear cart when switching events
      return {
        ...initialState,
        eventId: action.payload,
      };
    
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.ticketTypeId === action.payload.ticketTypeId
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const newSubtotal = newItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      
      return {
        ...state,
        items: newItems,
        subtotal: newSubtotal,
        total: newSubtotal - state.discount,
      };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(
        item => item.ticketTypeId !== action.payload
      );
      const filteredSubtotal = filteredItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      
      return {
        ...state,
        items: filteredItems,
        subtotal: filteredSubtotal,
        total: filteredSubtotal - state.discount,
      };
    
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.ticketTypeId === action.payload.ticketTypeId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const updatedSubtotal = updatedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      
      return {
        ...state,
        items: updatedItems,
        subtotal: updatedSubtotal,
        total: updatedSubtotal - state.discount,
      };
    
    case 'APPLY_COUPON':
      return {
        ...state,
        appliedCoupon: action.payload.coupon,
        discount: action.payload.discount,
        total: state.subtotal - action.payload.discount,
      };
    
    case 'REMOVE_COUPON':
      return {
        ...state,
        appliedCoupon: null,
        discount: 0,
        total: state.subtotal,
      };
    
    case 'CLEAR_CART':
      return initialState;
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const setEvent = (eventId) => {
    dispatch({ type: 'SET_EVENT', payload: eventId });
  };

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (ticketTypeId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: ticketTypeId });
  };

  const updateQuantity = (ticketTypeId, quantity) => {
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { ticketTypeId, quantity } 
    });
  };

  const applyCoupon = (coupon, discount) => {
    dispatch({ 
      type: 'APPLY_COUPON', 
      payload: { coupon, discount } 
    });
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    ...state,
    setEvent,
    addItem,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};