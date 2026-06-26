import { createTagFixture } from "@testUtils/fixtures/tags";
import { createUuid } from "@testUtils/generators/createUuid";

import { type SearchSongResult } from "@modules/search/components/types";
import { type Tag } from "@lib/types";

export type SongTagResult = {
  songId: string;
  tagId: string;
  tag: {
    id: string;
    tag: string;
  };
};

export type QueryResult<Data> = {
  data: Data | undefined;
  isLoading: boolean;
  error: Error | null;
};

export type SongSearchQueryResult = {
  data: SearchSongResult[];
  isFetching: boolean;
  isError: boolean;
};

export type MutationCallbacks<Result = unknown> = {
  onSuccess?: (result: Result) => void | Promise<void>;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

type QueryOptions = {
  enabled?: boolean;
};

type CreateTagInput = {
  organizationId: string;
  tag: string;
};

const createQueryResult = <Data>(data: Data): QueryResult<Data> => ({
  data,
  error: null,
  isLoading: false,
});

const createSongSearchQueryResult = (
  data: SearchSongResult[] = [],
): SongSearchQueryResult => ({
  data,
  isError: false,
  isFetching: false,
});

let mockOrganizationTagsQuery = createQueryResult<Tag[]>([]);
let mockSongTagsQuery = createQueryResult<SongTagResult[]>([]);
let mockSongSearchQuery = createSongSearchQueryResult();
let mockCreatedTag: Tag | undefined;
let mockCreateTagHookCallbacks: MutationCallbacks<Tag> | undefined;

export const mockCreateSongTagMutate = jest.fn(
  (_input: unknown, callbacks?: MutationCallbacks) => {
    void callbacks?.onSuccess?.({});
  },
);

export const mockDeleteSongTagMutate = jest.fn(
  (_input: unknown, callbacks?: MutationCallbacks) => {
    void callbacks?.onSuccess?.({});
    callbacks?.onSettled?.();
  },
);

export const mockCreateTagMutate = jest.fn(
  (input: unknown, callbacks?: MutationCallbacks<Tag>) => {
    const createInput = input as Partial<CreateTagInput>;
    const createdTag =
      mockCreatedTag ??
      createTagFixture({
        id: createUuid(),
        ...(createInput.organizationId
          ? { organizationId: createInput.organizationId }
          : {}),
        ...(createInput.tag ? { tag: createInput.tag } : {}),
      });

    void mockCreateTagHookCallbacks?.onSuccess?.(createdTag);
    void callbacks?.onSuccess?.(createdTag);
  },
);

export const mockReplaceSongMutate = jest.fn(
  (_input: unknown, callbacks?: MutationCallbacks) => {
    void callbacks?.onSuccess?.({});
  },
);

export const mockInvalidateSongTags = jest.fn();
export const mockInvalidateSong = jest.fn();
export const mockInvalidateOrganizationTags = jest.fn();
export const mockInvalidateSet = jest.fn();

export const setMockOrganizationTagsQuery = (
  queryResult: QueryResult<Tag[]>,
) => {
  mockOrganizationTagsQuery = queryResult;
};

export const setMockSongTagsQuery = (
  queryResult: QueryResult<SongTagResult[]>,
) => {
  mockSongTagsQuery = queryResult;
};

export const setMockSongSearchQuery = (
  queryResult: SongSearchQueryResult,
) => {
  mockSongSearchQuery = queryResult;
};

export const setMockCreatedTag = (tag: Tag) => {
  mockCreatedTag = tag;
};

export const resetMockTrpc = () => {
  mockOrganizationTagsQuery = createQueryResult([]);
  mockSongTagsQuery = createQueryResult([]);
  mockSongSearchQuery = createSongSearchQueryResult();
  mockCreatedTag = undefined;
  mockCreateTagHookCallbacks = undefined;
};

export const mockTrpc = {
  song: {
    search: {
      useQuery: jest.fn(() => mockSongSearchQuery),
    },
  },
  songTag: {
    create: {
      useMutation: jest.fn(() => ({
        mutate: mockCreateSongTagMutate,
      })),
    },
    delete: {
      useMutation: jest.fn(() => ({
        mutate: mockDeleteSongTagMutate,
      })),
    },
    getBySongId: {
      useQuery: jest.fn(() => mockSongTagsQuery),
    },
  },
  setSectionSong: {
    replaceSong: {
      useMutation: jest.fn(() => ({
        mutate: mockReplaceSongMutate,
      })),
    },
  },
  tag: {
    create: {
      useMutation: jest.fn((callbacks?: MutationCallbacks<Tag>) => {
        mockCreateTagHookCallbacks = callbacks;

        return {
          mutate: mockCreateTagMutate,
        };
      }),
    },
    getByOrganization: {
      useQuery: jest.fn((_input: unknown, options?: QueryOptions) => {
        if (options?.enabled === false) {
          return createQueryResult<Tag[] | undefined>(undefined);
        }

        return mockOrganizationTagsQuery;
      }),
    },
  },
  useUtils: jest.fn(() => ({
    set: {
      get: {
        invalidate: mockInvalidateSet,
      },
    },
    song: {
      get: {
        invalidate: mockInvalidateSong,
      },
    },
    songTag: {
      getBySongId: {
        invalidate: mockInvalidateSongTags,
      },
    },
    tag: {
      getByOrganization: {
        invalidate: mockInvalidateOrganizationTags,
      },
    },
  })),
};

export type TrpcMockModule = {
  mockTrpc: typeof mockTrpc;
};
