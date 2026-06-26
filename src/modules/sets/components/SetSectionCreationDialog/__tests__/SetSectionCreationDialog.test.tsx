import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createSetSectionFixture } from "@testUtils/fixtures/setSections";
import { createSetSectionTypeFixture } from "@testUtils/fixtures/setSectionTypes";
import { createUuid } from "@testUtils/generators/createUuid";

import { type SetSectionWithSongs } from "@lib/types";

import { SetSectionCreationDialog } from "../SetSectionCreationDialog";

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

jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isDesktop: true,
    isMobile: false,
    textSize: "text-base",
  }),
}));

describe("SetSectionCreationDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSetSection.mockResolvedValue({
      status: "created",
      setSection: createSetSectionFixture(),
    });
  });

  it("uses the shared section creation path from the set detail dialog", async () => {
    const setId = createUuid();
    const organizationId = createUuid();
    const existingSetSections = [
      createSetSectionFixture({ setId, organizationId }),
    ] as SetSectionWithSongs[];
    const onOpenChange = jest.fn();

    render(
      <SetSectionCreationDialog
        open
        onOpenChange={onOpenChange}
        setId={setId}
        organizationId={organizationId}
        existingSetSections={existingSetSections}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select section type" }));
    fireEvent.click(screen.getByRole("button", { name: "Add section to set" }));

    await waitFor(() => {
      expect(mockCreateSetSection).toHaveBeenCalledWith({
        setId,
        organizationId,
        sectionType: mockSelectedSetSectionType,
        existingSetSections,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
