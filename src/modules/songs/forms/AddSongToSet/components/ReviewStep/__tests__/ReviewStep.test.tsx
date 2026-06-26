import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createSetDomainFixture } from "@testUtils/fixtures/sets";
import { createSongFixture } from "@testUtils/fixtures/songs";

import { useUserQuery } from "@modules/users/api/queries";
import { trpc } from "@lib/trpc";

import { ReviewStep } from "../ReviewStep";

const mockAddAndReorderSongs = jest.fn();
const mockInvalidateSong = jest.fn();
const mockInvalidateSet = jest.fn();

type AddAndReorderSongsMutationOptions = {
  onSuccess: () => void;
};

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@modules/users/api/queries", () => ({
  useUserQuery: jest.fn(),
}));

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isDesktop: true,
    isMobile: false,
    textSize: "text-base",
  }),
}));

jest.mock("@lib/trpc", () => ({
  trpc: {
    set: {
      get: {
        useQuery: jest.fn(),
      },
    },
    setSection: {
      get: {
        useQuery: jest.fn(),
      },
    },
    setSectionSong: {
      addAndReorderSongs: {
        useMutation: jest.fn(() => ({
          mutate: mockAddAndReorderSongs,
          isPending: false,
        })),
      },
    },
    useUtils: jest.fn(() => ({
      song: {
        get: {
          invalidate: mockInvalidateSong,
        },
      },
      set: {
        get: {
          invalidate: mockInvalidateSet,
        },
      },
    })),
  },
}));

const mockUseUserQuery = useUserQuery as jest.Mock;
const mockSetGetUseQuery = trpc.set.get.useQuery as jest.Mock;
const mockSetSectionGetUseQuery = trpc.setSection.get.useQuery as jest.Mock;

describe("ReviewStep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits the selected section, key, notes, and ordered song ids", () => {
    const { membership, setWithSections, setSectionSong } =
      createSetDomainFixture();
    const setSection = setWithSections.sections[0];
    const songKey = "b_flat";
    const song = createSongFixture({
      organizationId: membership.organizationId,
      preferredKey: songKey,
    });
    const notes = "Bring capo";
    const orderedSongIds = [setSectionSong.id, song.id];

    if (!setSection) {
      throw new Error("Expected set domain fixture to include a section");
    }

    mockUseUserQuery.mockReturnValue({
      userMembership: membership,
    });
    mockSetGetUseQuery.mockReturnValue({
      data: {
        ...setWithSections,
        date: new Date("2099-01-01"),
      },
    });
    mockSetSectionGetUseQuery.mockReturnValue({
      data: setSection,
    });

    render(
      <ReviewStep
        selectedSetId={setWithSections.id}
        selectedSetSection={setSection.id}
        song={song}
        songKey={songKey}
        orderedSongIds={orderedSongIds}
      />,
    );

    fireEvent.change(screen.getByLabelText("Song notes"), {
      target: { value: notes },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add song to set" }));

    expect(mockAddAndReorderSongs).toHaveBeenCalledWith(
      {
        setSectionId: setSection.id,
        newSong: {
          songId: song.id,
          key: songKey,
          notes,
        },
        newSongTempId: song.id,
        orderedSongIds,
        organizationId: membership.organizationId,
      },
      expect.any(Object),
    );
  });

  it("closes the dialog even when cache invalidation fails after submit", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { membership, setWithSections, setSectionSong } =
      createSetDomainFixture();
    const setSection = setWithSections.sections[0];
    const songKey = "b_flat";
    const song = createSongFixture({
      organizationId: membership.organizationId,
      preferredKey: songKey,
    });
    const orderedSongIds = [setSectionSong.id, song.id];
    const onAddSong = jest.fn();
    const invalidateError = new Error("Network error");

    if (!setSection) {
      throw new Error("Expected set domain fixture to include a section");
    }

    mockUseUserQuery.mockReturnValue({
      userMembership: membership,
    });
    mockSetGetUseQuery.mockReturnValue({
      data: {
        ...setWithSections,
        date: new Date("2099-01-01"),
      },
    });
    mockSetSectionGetUseQuery.mockReturnValue({
      data: setSection,
    });
    mockAddAndReorderSongs.mockImplementation(
      (_input: unknown, options: AddAndReorderSongsMutationOptions) => {
        options.onSuccess();
      },
    );
    mockInvalidateSong.mockRejectedValueOnce(invalidateError);

    render(
      <ReviewStep
        selectedSetId={setWithSections.id}
        selectedSetSection={setSection.id}
        song={song}
        songKey={songKey}
        orderedSongIds={orderedSongIds}
        onAddSong={onAddSong}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add song to set" }));

    expect(onAddSong).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockInvalidateSet).toHaveBeenCalledWith({
        setId: setWithSections.id,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to refresh song data",
        invalidateError,
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
