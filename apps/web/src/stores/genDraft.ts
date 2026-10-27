import { create } from "zustand";

interface GenDraftState {
  prompt: string;
  modelKey: string | null;
  size: string;
  ratio: string;
  count: number;
  refImages: string[];
  set: (patch: Partial<Omit<GenDraftState, "set">>) => void;
}

export const useGenDraft = create<GenDraftState>((set) => ({
  prompt: "",
  modelKey: null,
  size: "1K",
  ratio: "原始",
  count: 1,
  refImages: [],
  set: (patch) => set(patch),
}));
