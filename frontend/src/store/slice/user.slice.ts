import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from '../store'

interface Iuser {
  userId: string;
  username: string;
  email: string;
  loggedIn?: boolean;
}

const instate: Iuser = {
  userId: "",
  username: "",
  email: "",
  loggedIn: false,
}

export const userSlice = createSlice({
  name: "user",
  initialState: instate,
  reducers: {
    loginUser(state, action: PayloadAction<Iuser>) {
      state.userId = action.payload.userId || state.userId
      state.username = action.payload.username
      state.email = action.payload.email
      state.loggedIn = true
    },
    logoutUser(state) {
      state.userId = ""
      state.username = ""
      state.email = ""
      state.loggedIn = false
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions;
export const userData = (state: RootState) => state.user
export default userSlice.reducer;