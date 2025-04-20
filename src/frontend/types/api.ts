import { BASE_URL } from "@/config";
import axios from "axios";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
