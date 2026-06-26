import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createOrganizationMembershipWithOrganizationFixture } from "@testUtils/fixtures/organizations";
import { createSetWithSectionsSongsAndEventTypeFixture } from "@testUtils/fixtures/sets";
import { createSetSectionFixture } from "@testUtils/fixtures/setSections";
import { createSetSectionTypeFixture } from "@testUtils/fixtures/setSectionTypes";

import { useUserQuery } from "@modules/users/api/queries";
import { trpc } from "@lib/trpc";

import { SetSectionSelectionStep } from "../SetSectionSelectionStep";

const mockSelectedSetSectionType = createSetSectionTypeFixture();
const mockCreateSetSection = jest.fn();

jest.mock("@modules/setSections/hooks", () => ({
  useCreateSetSection: jest.fn(() => ({
    createSetSection: mockCreateSetSection,
    isPending: false,
  })),
}));

jest.mock("@modules/sets/components/SetSectionTypeCombobox", () => ({
  SetSectionTypeCombobox: ({
    onChange,
  }: {
    onChange: (option: typeof mockSelectedSetSectionType) => void;
  }) => (
    <button type="button" onClick={() => onChange(mockSelectedSetSectionType)}>
      Select section type
    </button>
  ),
}));

jest.mock("@modules/songs/forms/AddSongToSet/components", () => ({
  SelectedSetCard: ({ set }: { set: { id: string } }) => (
    <div>Selected set {set.id}</div>
  ),
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
  },
}));

const mockUseUserQuery = useUserQuery as jest.Mock;
const mockSetGetUseQuery = trpc.set.get.useQuery as jest.Mock;

describe("SetSectionSelectionStep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSetSection.mockResolvedValue({
      status: "created",
      setSection: createSetSectionFixture(),
    });
  });

  it("uses the shared section creation path from the add-song section step", async () => {
    const membership = createOrganizationMembershipWithOrganizationFixture();
    const set = createSetWithSectionsSongsAndEventTypeFixture({
      organizationId: membership.organizationId,
    });
    const createdSetSection = createSetSectionFixture({
      setId: set.id,
      organizationId: membership.organizationId,
    });
    const onSelectSetSection = jest.fn();
    mockCreateSetSection.mockResolvedValue({
      status: "created",
      setSection: createdSetSection,
    });
    mockUseUserQuery.mockReturnValue({ userMembership: membership });
    mockSetGetUseQuery.mockReturnValue({ data: set });

    render(
      <SetSectionSelectionStep
        selectedSet={{ id: set.id, songCount: 0 }}
        onSelectSetSection={onSelectSetSection}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add another section/i }));
    fireEvent.click(screen.getByRole("button", { name: "Select section type" }));
    fireEvent.click(screen.getByRole("button", { name: "Add section to set" }));

    await waitFor(() => {
      expect(mockCreateSetSection).toHaveBeenCalledWith({
        setId: set.id,
        organizationId: membership.organizationId,
        sectionType: mockSelectedSetSectionType,
        existingSetSections: set.sections,
      });
    });
    expect(onSelectSetSection).toHaveBeenCalledWith(createdSetSection.id, 0);
  });
});
