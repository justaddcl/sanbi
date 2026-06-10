export const e2eIds = {
  placeholderHomeOrganizationId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  organizationId: "11111111-1111-4111-8111-111111111111",
  eventTypeId: "22222222-2222-4222-8222-222222222222",
  setId: "33333333-3333-4333-8333-333333333333",
  fullBandSectionTypeId: "44444444-4444-4444-8444-444444444444",
  prayerSectionTypeId: "55555555-5555-4555-8555-555555555555",
  songDetailDesktopSectionTypeId: "16161616-1616-4616-8616-161616161616",
  songDetailMobileSectionTypeId: "17171717-1717-4717-8717-171717171717",
  fullBandSectionId: "66666666-6666-4666-8666-666666666666",
  prayerSectionId: "77777777-7777-4777-8777-777777777777",
  songDetailDesktopSectionId: "18181818-1818-4818-8818-181818181818",
  songDetailMobileSectionId: "19191919-1919-4919-8919-191919191919",
  firstSongId: "88888888-8888-4888-8888-888888888888",
  secondSongId: "99999999-9999-4999-8999-999999999999",
  addSongToSetDesktopSongId: "12121212-1212-4121-8121-121212121212",
  addSongToSetMobileSongId: "13131313-1313-4131-8131-131313131313",
  addSongToSetFromSongDetailDesktopSongId:
    "14141414-1414-4414-8414-141414141414",
  addSongToSetFromSongDetailMobileSongId:
    "15151515-1515-4515-8515-151515151515",
  songDetailDesktopAnchorSongId: "1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c",
  songDetailMobileAnchorSongId: "1d1d1d1d-1d1d-4d1d-8d1d-1d1d1d1d1d1d",
  tagId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  resourceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  firstSetSectionSongId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  secondSetSectionSongId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  songDetailDesktopSetSectionSongId: "1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a1a",
  songDetailMobileSetSectionSongId: "1b1b1b1b-1b1b-4b1b-8b1b-1b1b1b1b1b1b",
} as const;

export const e2eData = {
  placeholderHomeOrganization: {
    name: "Stoneway",
    slug: "stoneway",
  },
  organization: {
    name: "E2E Stoneway",
    slug: "e2e-stoneway",
  },
  set: {
    date: "2099-06-06",
    notes: "E2E set notes for the Sunday gathering.",
    addSongToSet: {
      desktopSong: {
        name: "E2E Set Detail Anthem",
        preferredKey: "a",
        notes: "Available for set-detail add-song coverage.",
      },
      mobileSong: {
        name: "E2E Set Detail Chorus",
        preferredKey: "e",
        notes: "Available for mobile set-detail add-song coverage.",
      },
      key: "d",
      notes: "Bring in the band after the first chorus.",
    },
  },
  eventType: {
    name: "E2E Sunday Gathering",
  },
  sectionTypes: {
    fullBand: "E2E Full Band",
    prayer: "E2E Prayer",
    songDetailDesktop: "E2E Song Detail Desktop",
    songDetailMobile: "E2E Song Detail Mobile",
  },
  songs: {
    first: {
      name: "E2E Anchored Hymn",
      notes: "Start lightly before the bridge.",
      setNotes: "Capo 2 for the opener.",
    },
    second: {
      name: "E2E Mercy Chorus",
      notes: "Keep the final chorus down.",
      setNotes: "Keys lead into prayer.",
    },
    songDetailDesktopAnchor: {
      name: "E2E Song Detail Desktop Anchor",
      notes: "Existing song for desktop song detail add-to-set positioning.",
      setNotes: "Desktop anchor song notes.",
    },
    songDetailMobileAnchor: {
      name: "E2E Song Detail Mobile Anchor",
      notes: "Existing song for mobile song detail add-to-set positioning.",
      setNotes: "Mobile anchor song notes.",
    },
    addSongToSetFromSongDetailDesktop: {
      name: "E2E Song Detail Add Desktop",
      notes: "Unused desktop song for add-to-set coverage.",
      preferredKey: "a",
      setNotes: "Desktop song detail add-to-set notes.",
    },
    addSongToSetFromSongDetailMobile: {
      name: "E2E Song Detail Add Mobile",
      notes: "Unused mobile song for add-to-set coverage.",
      preferredKey: "b_flat",
      setNotes: "Mobile song detail add-to-set notes.",
    },
  },
  tag: {
    tag: "E2E Grace",
  },
  resource: {
    title: "E2E Chart",
    url: "https://example.com/e2e-chart",
  },
} as const;
