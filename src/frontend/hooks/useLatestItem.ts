import { useItemsStore } from "@/stores/useSearchStore";
import { ItemType } from "@/types/types";

// hook for fetching the most updated version of an item
export const useLatestItem = (
  itemId: number,
  fallbackItem: ItemType
): ItemType => {
  const homeItems = useItemsStore((state) => state.screens.home.items);
  const favoritesItems = useItemsStore(
    (state) => state.screens.favorites.items
  );
  const myItemsItems = useItemsStore((state) => state.screens.myItems.items);
  return (
    homeItems.find((i) => i.id === itemId) ||
    favoritesItems.find((i) => i.id === itemId) ||
    myItemsItems.find((i) => i.id === itemId) ||
    fallbackItem
  );
};
