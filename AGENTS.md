# Low-Code Starter Kit - Architectural Constitution & Guidelines

This document serves as the absolute architectural single source of truth for this project and any projects cloned or derived from it. All AI coding agents and human developers MUST strictly adhere to the contracts defined herein.

---

## 1. Core Paradigm: Schema-Driven Low-Code Engine

This application is NOT a traditional hardcoded multi-page application. It is a **deterministic, schema-driven Low-Code Engine**.

- **THE GOLDEN RULE**: To introduce a new business domain, entity, or feature (e.g., CBT Exam, Inventory, Students, Invoices, Healthcare, Assets), you **MUST NEVER** manually create a new custom View, Table, or Form component from scratch.
- **HOW TO ADD A NEW FEATURE**:
  1. Open `src/core/registry.ts`.
  2. Declare the new module schema conforming to `ModuleSchema` interface in `src/core/types.ts`.
  3. The core engine will deterministically auto-generate:
     - Interactive Data Table & Card View (`ListView.tsx`) with search, multi-filter, sort, pagination, and multi-selection.
     - Universal Dynamic Form (`FormView.tsx` & `FormGenerator.tsx`) with automatic validation.
     - Rich Record Inspection Page (`DetailView.tsx`).
     - Official Print & PDF-ready Document with Cryptographic Verification QR Code (`PrintDocumentView.tsx`).
     - Real Excel Import/Export with data integrity parsing (`ImportExportView.tsx` & `excel.ts`).

---

## 2. Inviolable DRY & Rendering Contracts

### A. Universal Field Rendering
- **NEVER** write inline type checks (e.g. `if (field.type === 'number') ...`) or hardcoded Rupiah/date string transformations inside specific view components.
- **ALWAYS** use `<FieldRenderer field={field} value={value} mode="..." />` imported from `@/core/formatters`.

### B. Technical ID Filtering
- **NEVER** write manual filter checks like `schema.fields.filter(f => f.key !== 'id')` scattered across multiple components.
- **ALWAYS** call `getVisibleFields(schema)` from `@/core/formatters`.

### C. Universal Schema Validation
- Form submissions, Excel imports, and API persistence must validate records using `validateRecord(schema, recordData)` from `@/core/validator`.

---

## 3. Supported Field Types in Schema
When defining fields in `src/core/registry.ts`, use any of the following standard types:
- `text`: Single-line text input.
- `textarea`: Multi-line text block for notes, addresses, or descriptions.
- `number`: Numeric input formatted automatically as Indonesian Currency (Rupiah) or decimal values.
- `select`: Predefined enum choices rendered as styled status badges.
- `date`: Calendar date selector.
- `email`: Validated email address with clickable mailto link.
- `phone`: Indonesian/International phone number with one-click direct WhatsApp / Call triggers.
- `boolean`: Toggle switch (True/False or Aktif/Nonaktif).
- `location`: Interactive GPS coordinate picker with Google Maps launcher.
- `file`: Media attachment with automatic image previews and direct document downloader.
- `richtext`: WYSIWYG HTML formatted content with clean styling.
- `region_province`: Dependent cascading dropdown for Indonesian Provinces (BPS/Kemendagri API).
- `region_city`: Dependent cascading dropdown for Indonesian Cities/Regencies (filtered by province).
- `region_district`: Dependent cascading dropdown for Indonesian Districts/Kecamatan (filtered by city).
- `region_village`: Dependent cascading dropdown for Indonesian Villages/Desa (filtered by district).

---

## 4. Anti-Slop UI & Design Standards
- **Typography**: Clean, mathematical typography hierarchy using Inter / sans-serif with Tailwind classes.
- **Visuals**: Clean, modern enterprise styling with crisp border contrasts (`border-slate-200` to `border-slate-300`).
- **No Manual Signature Lines on Digital Documents**: All print/export official documents must rely solely on cryptographic QR Code verification compliant with modern digital document standards (UU ITE).
- **Responsive by Design**: All views must gracefully handle screen widths from 320px mobile to 4K ultra-wide displays.

---

## 5. Storage & Persistence Protocol
- Storage is powered by Firebase Firestore (`src/services/firebase.ts`) with a client-side SWR memory cache to prevent rate-limiting and flicker.
- Never write ad-hoc raw Firestore calls inside UI views. Always route persistence via `useModule.ts` or `ApiService`.

---

## 6. Zero-Build Workflow & Compilation Protocol
- **THE REFRESH-FIRST DIRECTIVE**: In standard development cycles and everyday feature updates, DO NOT execute `compile_applet`, `npm run build`, or heavy build tasks. The Vite dev server running in Node.js handles JIT (Just-In-Time) compilation on-the-fly. Code changes are served immediately upon browser refresh.
- **PRODUCTION BUILD TRIGGER**: Build and compilation steps (`compile_applet`, `npm run build`, and production packaging) MUST ONLY be executed when the user explicitly commands: **"siap produksi"**.
- For all regular iterations: make code edits cleanly, ensure type stability, and tell the user to simply refresh their browser.
