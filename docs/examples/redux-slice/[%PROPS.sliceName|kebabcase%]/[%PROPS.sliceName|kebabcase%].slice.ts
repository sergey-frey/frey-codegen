import { createSlice } from "@reduxjs/toolkit";

export const [%PROPS.sliceName|camelcase%]Slice = createSlice({
  name: "[%PROPS.sliceName|kebabcase%]",
  initialState: [%PROPS.initialValue%],
  reducers: {},
});

export const { actions: [%PROPS.sliceName|camelcase%]Actions } = [%PROPS.sliceName|camelcase%]Slice;
