# Storybook

Storybook is Sanbi's isolated component workbench for shared UI primitives and visually important product surfaces. Stories should render without Clerk auth, live application data, or database access.

## Commands

- `pnpm storybook` starts the local Storybook dev server on port 6006.
- `pnpm build-storybook` builds the static Storybook bundle into `storybook-static/`.

Keep stories light-mode only until Sanbi has an official dark-mode design system.

## Coverage Guidelines

Prefer stories for reusable components before product routes. Stories should cover meaningful visual states: size, variant, active/inactive, loading, empty, error, disabled, collapsed/expanded, and representative responsive states.

Organize stories by reviewer mental model:

- `Base Components/...` for generic reusable building blocks such as buttons, badges, forms, overlays, typography, layout primitives, and card surfaces.
- `App Shell/...` for app chrome and navigation surfaces such as page titles, nav links, responsive shell dialogs, global navigation, organization headers, and navbar states.
- `Sets/...`, `Songs/...`, `Resources/...`, `Event Types/...`, and `Onboarding/...` for domain-specific product surfaces, even when the component currently lives outside the matching source folder.
- `Shared Workflows/...` for cross-domain product workflows that are not generic base components, such as archived banners and draggable song lists.

The sidebar order is configured in `.storybook/preview.tsx`. `Base Components` is pinned first, then the product groups are ordered alphabetically.

Place story files next to the component they document and match the component filename casing, for example `PageTitle/PageTitle.stories.tsx`. Components under `src/components/ui` use lowercase filenames, so their stories should also use lowercase names such as `button.stories.tsx`.

When a component mixes display with Clerk, TRPC/ORPC, router navigation, mutations, query invalidation, or toast side effects, extract a small display component instead of adding broad Storybook mocks. The container should keep app behavior; the display component should accept plain props and callbacks.

## Coverage Roadmap

High-priority shared app components:

- `src/components`: keep stories for typography, badges, layout primitives, cards, page titles, song keys, nav links, responsive dialogs, action menus, keyboard shortcuts, and shell/navigation display components.
- `src/components/ui`: add or expand stories for alert, accordion, checkbox, combobox, date picker, multi-select, progress, radio group, scroll area, select, switch, tabs, and tooltip.
- `src/modules/SetListCard`: add stories for play-history items and action-menu states. `SongItem` needs a display seam before it can be story-covered without auth/TRPC.
- `src/modules/sets`: add stories for loading/error states, set details, set notes display, date/event-type form fields, and section cards. Mutation-bound forms should use display seams or form-only harnesses.
- `src/modules/songs`: add stories for song list items, song details labels/items/loading, resource image fallbacks, tags, search states, add-song-to-set step components, and resource dialog display states.
- `src/modules/shared`: add stories for archived banners and draggable song display states. Drag-and-drop containers need a DnD harness.

Known extraction candidates:

- `GlobalNavDisplay`: render nav links and the new-item action from plain organization/navigation props.
- `OrganizationHeaderDisplay`: render organization initials/name from plain props.
- `NavbarDisplay`: render signed-in and signed-out shell states without Clerk.
- `ArchivedBannerDisplay`: render set/song archived messaging and expansion state without auth, router, TRPC mutations, or toast.
