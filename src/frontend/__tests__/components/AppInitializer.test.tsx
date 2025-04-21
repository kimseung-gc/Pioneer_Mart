import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { AppInitialier } from "../../components/AppInitializer";
import { useAuth } from "@/app/contexts/AuthContext";
import { useUserStore } from "@/stores/userStore";

const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

jest.mock("@/app/contexts/AuthContext");
jest.mock("@/stores/userStore");

describe("AppInitialier", () => {
  const mockFetchUserData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      fetchUserData: mockFetchUserData,
    });
  });

  it("calls fetchUserData when authenticated and token exists", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: "valid-token",
      isAuthenticated: true,
    });

    render(<AppInitialier />);

    await waitFor(() => {
      expect(mockFetchUserData).toHaveBeenCalledWith("valid-token");
    });
  });

  it("does not call fetchUserData when not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      authToken: null,
      isAuthenticated: false,
    });

    render(<AppInitialier />);

    await waitFor(() => {
      expect(mockFetchUserData).not.toHaveBeenCalled();
    });
  });

  it("logs error if fetchUserData fails", async () => {
    mockFetchUserData.mockRejectedValueOnce(new Error("fail"));

    (useAuth as jest.Mock).mockReturnValue({
      authToken: "bad-token",
      isAuthenticated: true,
    });

    render(<AppInitialier />);

    await waitFor(() => {
      expect(mockFetchUserData).toHaveBeenCalledWith("bad-token");
      expect(consoleLogSpy).toHaveBeenCalledWith("Failed to fetch user data");
    });
  });
});
