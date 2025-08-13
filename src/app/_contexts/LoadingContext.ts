"use client";

import { createContext } from "react";

export const LoadingContext = createContext<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({
  loading: false,
  setLoading: () => {},
});
