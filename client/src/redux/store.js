import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({ user: userReducer });

const persistConfig = {
  key: 'root', // Use a string key here, not `rootReducer`
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Assign the store to a variable
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export both the store and persistor
export const persistor = persistStore(store);
export default store;
