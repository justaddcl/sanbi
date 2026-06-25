import {
  createPinnedAddressLookup,
  fetchResourcePreviewMetadata,
  isBlockedResourceMetadataIpAddress,
  type ResourceMetadataHttpResponse,
} from "@server/services/resource/resourceMetadata";

const createLookup = (address = "93.184.216.34") =>
  jest.fn().mockResolvedValue([{ address, family: 4 }]);

const createResponse = ({
  body = "",
  status = 200,
  headers = {},
}: {
  body?: string;
  status?: number;
  headers?: Record<string, string>;
}) =>
  ({
    status,
    ok: status >= 200 && status < 300,
    text: jest.fn().mockResolvedValue(body),
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  }) satisfies ResourceMetadataHttpResponse;

const createHtmlResponse = (html: string) =>
  createResponse({
    body: html,
    headers: { "content-type": "text/html; charset=utf-8" },
  });

describe("resource metadata", () => {
  it("allows only public unicast DNS answers for metadata requests", () => {
    expect(isBlockedResourceMetadataIpAddress("93.184.216.34")).toBe(false);
    expect(isBlockedResourceMetadataIpAddress("127.0.0.1")).toBe(true);
    expect(isBlockedResourceMetadataIpAddress("10.0.0.1")).toBe(true);
    expect(isBlockedResourceMetadataIpAddress("::1")).toBe(true);
    expect(isBlockedResourceMetadataIpAddress("64:ff9b::0a00:0001")).toBe(true);
    expect(isBlockedResourceMetadataIpAddress("2002:0a00:0001::")).toBe(true);
    expect(isBlockedResourceMetadataIpAddress("2001::0a00:0001")).toBe(true);
  });

  it("returns a pinned DNS address for single-address and all-address lookups", () => {
    const lookupAddress = createPinnedAddressLookup({
      address: "93.184.216.34",
      family: 4,
    });
    const singleAddressCallback = jest.fn();
    const allAddressesCallback = jest.fn();

    lookupAddress("example.com", {}, singleAddressCallback);
    lookupAddress("example.com", { all: true }, allAddressesCallback);

    expect(singleAddressCallback).toHaveBeenCalledWith(
      null,
      "93.184.216.34",
      4,
    );
    expect(allAddressesCallback).toHaveBeenCalledWith(null, [
      { address: "93.184.216.34", family: 4 },
    ]);
  });

  it("returns ready metadata for public HTML responses", async () => {
    const requestUrl = jest.fn().mockResolvedValue(
      createHtmlResponse(`
        <title>Resource title</title>
        <meta name="description" content="Resource description" />
      `),
    );

    await expect(
      fetchResourcePreviewMetadata(" https://example.com/song ", {
        requestUrl,
        lookupHostname: createLookup(),
      }),
    ).resolves.toMatchObject({
      normalizedUrl: "https://example.com/song",
      status: "ready",
      title: "Resource title",
      description: "Resource description",
    });
  });

  it("reads metadata from pages with large document heads", async () => {
    const requestUrl = jest.fn().mockResolvedValue(
      createHtmlResponse(`
        ${" ".repeat(600 * 1024)}
        <title>Late title</title>
        <meta property="og:image" content="https://example.com/late.jpg" />
      `),
    );

    await expect(
      fetchResourcePreviewMetadata("https://example.com/video", {
        requestUrl,
        lookupHostname: createLookup(),
      }),
    ).resolves.toMatchObject({
      status: "ready",
      title: "Late title",
      imageUrl: "https://example.com/late.jpg",
    });
    expect(requestUrl).toHaveBeenCalledWith(
      "https://example.com/video",
      expect.objectContaining({
        maxHtmlBytes: 2 * 1024 * 1024,
      }),
    );
  });

  it("follows safe redirects and stores the final normalized URL", async () => {
    const requestUrl = jest
      .fn()
      .mockResolvedValueOnce(
        createResponse({
          status: 302,
          headers: { location: "/final" },
        }),
      )
      .mockResolvedValueOnce(createHtmlResponse("<title>Final title</title>"));

    await expect(
      fetchResourcePreviewMetadata("https://example.com/start", {
        requestUrl,
        lookupHostname: createLookup(),
      }),
    ).resolves.toMatchObject({
      normalizedUrl: "https://example.com/final",
      status: "ready",
      title: "Final title",
    });
  });

  it("marks non-HTML responses as failed without throwing", async () => {
    await expect(
      fetchResourcePreviewMetadata("https://example.com/song", {
        requestUrl: jest.fn().mockResolvedValue(
          createResponse({
            body: "{}",
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
        lookupHostname: createLookup(),
      }),
    ).resolves.toMatchObject({
      status: "failed",
    });
  });
});
