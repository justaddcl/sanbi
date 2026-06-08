---
name: Sanbi
description: A calm worship set planning product for church teams.
colors:
  background: "#ffffff"
  foreground: "#020817"
  card: "#ffffff"
  primary: "#0f172a"
  primary-foreground: "#f8fafc"
  secondary: "#f1f5f9"
  secondary-foreground: "#0f172a"
  muted: "#f1f5f9"
  muted-foreground: "#64748b"
  accent: "#f1f5f9"
  accent-foreground: "#0f172a"
  border: "#e2e8f0"
  destructive: "#ef4444"
  warn-bg: "#fffbeb"
  warn-border: "#fde68a"
  warn-text: "#b45309"
typography:
  display:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.025em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "8px"
---

# Design System: Sanbi

## 1. Overview

**Creative North Star: "Planning Desk / Set Builder Hybrid"**

Sanbi is a restrained product interface for worship planning. It should feel like a clear planning desk: direct rows, sectioned lists, timelines, and practical controls that help a leader prepare a set without training.

The visual language is calm and lightweight, with warmth coming from rhythm, copy, and tactile details rather than decorative religious imagery. The current implementation uses Poppins, shadcn/Radix foundations, Phosphor icons, slate-based neutrals, bordered surfaces, skeleton loading states, responsive dialogs, and a left navigation app shell.

Future UI should keep Linear-like clarity and Notion-like approachable organization, with small moments of tactile personality inspired by Teenage Engineering / Native Instruments. The product should reject generic SaaS KPI dashboards, marketing layouts, purple-gradient cliches, overly rounded card walls, church-bulletin aesthetics, and dense music-pro software.

**Key Characteristics:**
- Product-first, quiet, and task-focused.
- Mobile and desktop are equal surfaces, not primary and secondary variants.
- Set Detail is the primary editing workspace.
- Dashboard is a planning home base, not an analytics surface.
- Direct lists, rows, sections, timelines, and rails are preferred over decorative cards.

## 2. Colors

The current palette is a restrained slate-neutral product system with semantic state colors and very sparse accent usage.

### Primary

- **Slate Ink** (`#0f172a`): primary actions, strong text, active controls, and compact command surfaces.
- **Paper White** (`#ffffff`): current page and card background token. Treat this as the implemented token; future polish may tint neutrals subtly if the system moves toward a warmer surface.

### Secondary

- **Soft Slate Wash** (`#f1f5f9`): secondary buttons, muted surfaces, hover backgrounds, and low-emphasis filled controls.
- **Selected Slate** (`#e2e8f0`): borders and selected navigation backgrounds.

### Tertiary

- **Archive Amber** (`#fffbeb`, `#fde68a`, `#b45309`): archived banners, warning badges, and reversible caution states. Use amber for workflow warnings, not decoration.

### Neutral

- **Near Black Slate** (`#020817`): primary foreground.
- **Muted Slate** (`#64748b`): helper text, inactive nav, metadata, and lower-priority descriptions.
- **Slate 700** (`#334155`): active nav text, readable secondary text, and grounded labels.
- **Slate 100** (`#f1f5f9`): hover fills, dividers, and quiet nested surface separation.

### Named Rules

**The Rare Accent Rule.** Color is functional. Use it for primary action, selected state, focus, warning, destructive, and readiness cues, not decoration.

**The Readiness Cue Rule.** Missing keys, empty sets, empty sections, and missing upcoming sets may use state color, but the message must also be visible through text or structure.

## 3. Typography

**Display Font:** Poppins with `ui-sans-serif`, `system-ui`, and platform emoji fallbacks.
**Body Font:** Poppins with the same fallback stack.
**Label/Mono Font:** No separate label or mono family is currently defined.

**Character:** The type system is compact, rounded, and approachable. It should remain product-dense and avoid display-font theatricality.

### Hierarchy

- **Display** (600, 36px, 1.25): rare page-level emphasis and large headers.
- **Headline** (400, 18px, 1.25): section-level headings and prominent empty-state lines.
- **Title** (600, 16px, 1.25): card titles, form titles, dialog titles, and compact workspace headings.
- **Body** (400, 14px, 1.5): descriptions, row text, metadata with enough breathing room for mobile scanning.
- **Label** (600, 12px, 1.5): badges, compact labels, helper affordances, and tight metadata.

### Named Rules

**The Long Song Title Rule.** `I Love You Lord / What A Beautiful Name` must fit cleanly through wrapping or truncation in mobile and desktop layouts.

**The Product Scale Rule.** Keep headings fixed and compact. Do not use viewport-scaled type for app surfaces.

## 4. Elevation

Sanbi is flat by default. Depth comes from borders, tonal layering, spacing, collapsible sections, and responsive overlays rather than heavy shadows.

Cards use rounded `8px` borders with small internal padding and a divider between header and body. Dialogs and drawers carry the highest layer in the interface, but they should be used for focused creation or editing flows rather than as the first answer for every interaction.

### Shadow Vocabulary

- **None by default:** content surfaces should rely on border and background contrast.
- **Overlay elevation:** Radix dialogs, drawers, dropdowns, popovers, and tooltips may use the project primitive defaults for separation.

### Named Rules

**The Border-First Rule.** Use borders, spacing, and tonal surfaces before shadows. Heavy card shadows do not fit Sanbi's current product language.

## 5. Components

### Buttons

- **Shape:** medium radius (`6px`) with a stable `40px` default height.
- **Primary:** Slate Ink background with Paper White text, used for central actions like create, add, save, and confirm.
- **Hover / Focus:** color transitions, visible `2px` focus ring, and ring offset from the existing Radix/shadcn vocabulary.
- **Secondary / Ghost:** soft slate fills or transparent backgrounds for supporting actions. Ghost buttons are common in card headers and navigation.
- **Loading:** primary button loading uses a small Phosphor `CircleNotch` spinner and disables the button.

### Chips

- **Style:** rounded-full badges with `12px` text, semibold weight, compact horizontal padding, and border or semantic fills.
- **State:** `warn` badges use amber for archived and caution states. Dismissible badges include a small close button with its own focus ring.

### Cards / Containers

- **Corner Style:** `8px` rounded cards.
- **Background:** current card background token is white, with slate dividers and hover fills inside action headers.
- **Shadow Strategy:** flat by default; rely on border and internal rhythm.
- **Border:** one-pixel border using the global border token.
- **Internal Padding:** `4px` to `8px` shell padding, `12px 16px` or `12px 24px` content padding depending on breakpoint and density.

### Inputs / Fields

- **Style:** full-width bordered inputs, `40px` height, `6px` radius, background token fill, and muted placeholder text.
- **Focus:** visible two-pixel ring and ring offset.
- **Error / Disabled:** disabled fields use opacity reduction and not-allowed cursor. Error language should pair semantic color with text.

### Navigation

- **Style:** persistent desktop left sidebar with Sanbi/team context, Dashboard/Home, Search, Sets, Songs, settings utility area, global search affordance, and account affordance.
- **Active State:** selected slate background, stronger slate text, and semibold weight.
- **Hover State:** slate hover fill with modest horizontal expansion from the current `NavLink` pattern.
- **Mobile Treatment:** navigation must remain easy to access, with Dashboard, Sets, Songs, and Search reachable without relying on hover.

### Responsive Dialogs / Drawers

- **Role:** creation, editing, add-to-set, duplicate, replace, resource editing, and archive/delete confirmations.
- **Behavior:** mobile should use drawer-like focused flows where helpful; desktop can use dialogs or side rails when the workflow benefits from more density.
- **Guardrail:** do not hide central set-building actions in action menus when they are the main task.

### Set Builder

Set Detail should feel like a document-like planning surface with section rails, ordered songs, keys, set-specific notes, add section, add song, reorder, replace, and remove actions. Desktop may support richer density and drag-and-drop; mobile must provide button or menu-based reorder controls.

## 6. Do's and Don'ts

### Do:

- **Do** keep Set Detail as the primary editing workspace.
- **Do** make Dashboard a planning home base with upcoming favorite event sets, current-month additional sets, missing-set prompts, readiness cues, and a clear create set action.
- **Do** use direct lists, rows, sections, timelines, rails, and obvious actions before introducing new cards.
- **Do** make mobile and desktop equally complete, including non-hover access to every core workflow.
- **Do** keep archive reversible and make delete explicit, rare, and clearly permanent.
- **Do** test realistic content such as `Stoneway`, `Sunday Service`, `Lord's Supper`, and `I Love You Lord / What A Beautiful Name`.
- **Do** ensure no text overlap, clipped typography, broken borders, or controls spilling outside containers on realistic mobile and 1920x1080 desktop canvases.

### Don't:

- **Don't** create generic SaaS dashboards, KPI cards, hero-metric sections, marketing-site layouts, or repeated icon-card grids.
- **Don't** use purple-gradient SaaS cliches, gradient text, glassmorphism, decorative orbs, or heavy visual effects in task screens.
- **Don't** use crosses, stained glass, parchment, script fonts, religious stock imagery, or church-bulletin aesthetics.
- **Don't** build overly rounded card walls. The current product vocabulary is restrained and mostly `6px` to `8px`.
- **Don't** emphasize artist, album, BPM, time signature, recording, or performance metadata as primary V0 song fields.
- **Don't** rely only on drag-and-drop, hover, color, or menus for central workflows.
