import { create } from "zustand";

interface SingleItemState {
  showFavoritesIcon: boolean;
  hasRequestedItem: boolean;
  setShowFavoritesIcon: (show: boolean) => void;
  setHasRequestedItem: (hasRequested: boolean) => void;
}

const useSingleItemStore = create<SingleItemState>((set) => ({
  showFavoritesIcon: true, //initial state: show the icon
  hasRequestedItem: false, //initial state: not requested yet
  setShowFavoritesIcon: (show) => set({ showFavoritesIcon: show }),
  setHasRequestedItem: (hasRequested) =>
    set({ hasRequestedItem: hasRequested }),
}));

export default useSingleItemStore;
