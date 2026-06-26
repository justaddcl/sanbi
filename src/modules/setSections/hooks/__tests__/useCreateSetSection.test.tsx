import { act, renderHook } from "@testing-library/react";
import { createSetSectionFixture } from "@testUtils/fixtures/setSections";
import { createSetSectionTypeFixture } from "@testUtils/fixtures/setSectionTypes";
import { createUuid } from "@testUtils/generators/createUuid";
import {
  mockCreateSetSectionMutateAsync,
  mockInvalidateSet,
  mockRefetchSetSections,
  resetMockTrpc,
  setMockCreatedSetSection,
  type TrpcMockModule,
} from "@testUtils/mocks/trpc";
import { toast } from "sonner";

import {
  createSetSectionMessages,
  useCreateSetSection,
} from "../useCreateSetSection";

jest.mock("@lib/trpc", () => {
  const { mockTrpc } = jest.requireActual<TrpcMockModule>(
    "@testUtils/mocks/trpc",
  );

  return { trpc: mockTrpc };
});

jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(() => "toast-id"),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useCreateSetSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockTrpc();
    setMockCreatedSetSection(createSetSectionFixture({ id: createUuid() }));
  });

  it("creates a section at the next position and refreshes set queries", async () => {
    const organizationId = createUuid();
    const setId = createUuid();
    const existingSectionType = createSetSectionTypeFixture({ organizationId });
    const newSectionType = createSetSectionTypeFixture({ organizationId });
    const existingSetSections = [
      createSetSectionFixture({
        organizationId,
        setId,
        sectionTypeId: existingSectionType.id,
        position: 0,
      }),
    ];
    const createdSetSection = createSetSectionFixture({
      organizationId,
      setId,
      sectionTypeId: newSectionType.id,
      position: existingSetSections.length,
    });
    setMockCreatedSetSection(createdSetSection);

    const { result } = renderHook(() => useCreateSetSection());

    let createResult: Awaited<
      ReturnType<typeof result.current.createSetSection>
    > | null = null;
    await act(async () => {
      createResult = await result.current.createSetSection({
        organizationId,
        setId,
        sectionType: newSectionType,
        existingSetSections,
      });
    });

    expect(mockCreateSetSectionMutateAsync).toHaveBeenCalledWith({
      organizationId,
      setId,
      sectionTypeId: newSectionType.id,
      position: existingSetSections.length,
    });
    expect(mockRefetchSetSections).toHaveBeenCalledWith({
      organizationId,
      setId,
    });
    expect(mockInvalidateSet).toHaveBeenCalledWith({
      organizationId,
      setId,
    });
    expect(toast.success).toHaveBeenCalledWith(
      createSetSectionMessages.success,
      { id: "toast-id" },
    );
    expect(createResult).toEqual({
      status: "created",
      setSection: createdSetSection,
    });
  });

  it("shows shared empty-selection validation before creating", async () => {
    const { result } = renderHook(() => useCreateSetSection());

    await act(async () => {
      await result.current.createSetSection({
        organizationId: createUuid(),
        setId: createUuid(),
        sectionType: null,
        existingSetSections: [],
      });
    });

    expect(mockCreateSetSectionMutateAsync).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      createSetSectionMessages.emptySelection,
      { id: "toast-id" },
    );
  });

  it("shows shared duplicate-section feedback before creating", async () => {
    const organizationId = createUuid();
    const setId = createUuid();
    const existingSectionType = createSetSectionTypeFixture({ organizationId });
    const existingSetSections = [
      createSetSectionFixture({
        organizationId,
        setId,
        sectionTypeId: existingSectionType.id,
      }),
    ];

    const { result } = renderHook(() => useCreateSetSection());

    await act(async () => {
      await result.current.createSetSection({
        organizationId,
        setId,
        sectionType: existingSectionType,
        existingSetSections,
      });
    });

    expect(mockCreateSetSectionMutateAsync).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(createSetSectionMessages.duplicate, {
      id: "toast-id",
    });
  });

  it("shows shared error feedback when the mutation fails", async () => {
    const createError = new Error("database unavailable");
    mockCreateSetSectionMutateAsync.mockRejectedValue(createError);

    const { result } = renderHook(() => useCreateSetSection());

    await act(async () => {
      await result.current.createSetSection({
        organizationId: createUuid(),
        setId: createUuid(),
        sectionType: createSetSectionTypeFixture(),
        existingSetSections: [],
      });
    });

    expect(toast.error).toHaveBeenCalledWith(
      `${createSetSectionMessages.errorPrefix}: ${createError.message}`,
      { id: "toast-id" },
    );
    expect(mockRefetchSetSections).not.toHaveBeenCalled();
    expect(mockInvalidateSet).not.toHaveBeenCalled();
  });

  it("still returns the created section when refreshing set queries fails", async () => {
    const organizationId = createUuid();
    const setId = createUuid();
    const createdSetSection = createSetSectionFixture({
      organizationId,
      setId,
      position: 0,
    });
    setMockCreatedSetSection(createdSetSection);
    const refreshError = new Error("network unavailable");
    mockRefetchSetSections.mockRejectedValue(refreshError);
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useCreateSetSection());

    let createResult: Awaited<
      ReturnType<typeof result.current.createSetSection>
    > | null = null;
    await act(async () => {
      createResult = await result.current.createSetSection({
        organizationId,
        setId,
        sectionType: createSetSectionTypeFixture({ organizationId }),
        existingSetSections: [],
      });
    });

    expect(createResult).toEqual({
      status: "created",
      setSection: createdSetSection,
    });
    expect(toast.success).toHaveBeenCalledWith(
      createSetSectionMessages.success,
      { id: "toast-id" },
    );
    expect(toast.error).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to refresh set section data",
      refreshError,
    );
    consoleErrorSpy.mockRestore();
  });
});
