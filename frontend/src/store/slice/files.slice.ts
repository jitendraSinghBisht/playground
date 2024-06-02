import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface Ifile {
  curFile?: string;
  curFileId?: string;
  curFileData?: string;
}

const instate: Ifile = {
    curFile: "start.md",
    curFileId: "",
    curFileData: "# Welcome to the playground\n## Enjoy your code",
  }

export const fileSlice = createSlice({
  name: "file",
  initialState: instate,
  reducers: {
    updateFile(state, action: PayloadAction<Ifile>) {
      state.curFile = action.payload.curFile || state.curFile
      state.curFileId = action.payload.curFileId || state.curFileId
      state.curFileData = action.payload.curFileData || state.curFileData
    },
  },
});

export const { updateFile } = fileSlice.actions;
export const fileData = (state: RootState) => state.file;
export default fileSlice.reducer;
export type { Ifile }