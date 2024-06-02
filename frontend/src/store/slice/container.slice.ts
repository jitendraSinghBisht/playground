import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { IContainer } from "@/types";

const instate: IContainer = {
  wsurl: "",
  containerId: "",
  containerName: "",
}

export const containerSlice = createSlice({
  name: "container",
  initialState: instate,
  reducers: {
    setContainer(state, action: PayloadAction<IContainer>) {
      state.wsurl = action.payload.wsurl
      state.containerId = action.payload.containerId
      state.containerName = action.payload.containerName
    },
  },
});

export const { setContainer } = containerSlice.actions;
export const containerData = (state: RootState) => state.container;
export default containerSlice.reducer;