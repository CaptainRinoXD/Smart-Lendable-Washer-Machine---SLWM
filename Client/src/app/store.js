// src/app/store.js
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    // Add your reducers here. The key (e.g., 'counter') defines the slice of state.
    // counter: counterReducer, 
  },
})