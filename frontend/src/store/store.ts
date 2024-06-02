import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/user.slice";
import fileReducer from "./slice/files.slice";
import folderReducer from "./slice/folder.slice";
import containerReducer from "./slice/container.slice"

export const store = configureStore({
  reducer:{
    user: userReducer,
    file: fileReducer,
    folder: folderReducer,
    container: containerReducer
  }
})

export type RootState = ReturnType<typeof store.getState>