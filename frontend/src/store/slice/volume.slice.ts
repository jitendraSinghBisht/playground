import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { IVolume } from "@/types";

const instate: IVolume = {
  _id: "",
  volumeName: "",
  volumeLang: ""
}

export const volumeSlice = createSlice({
  name: "container",
  initialState: instate,
  reducers: {
    setVolume(state, action: PayloadAction<IVolume>) {
      state._id = action.payload._id
      state.volumeName = action.payload.volumeName
      state.volumeLang = action.payload.volumeLang
    },
  },
});

export const { setVolume } = volumeSlice.actions;
export const volumeData = (state: RootState) => state.volume;
export default volumeSlice.reducer;