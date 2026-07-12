# Shared Components

## Forms

### DateTimePickerComponent

- **Selector:** `app-date-time-picker-component`
- **Location:** `shared/forms/date-time-picker/`
- **Standalone:** Yes
- **Dependencies:** Angular Material (MatDatepicker, MatFormField, MatInput, MatButton)
- **Purpose:** Date + time range picker pair (start/end). Combines `mat-datepicker` dates with native `<input type="time">` values via `getCombinedDateTime()`.
- **Properties:** `startDate: Date`, `endDate: Date`, `startTime: string`, `endTime: string`
- **Usage:** `<app-date-time-picker-component></app-date-time-picker-component>`

### SearchInputComponent

- **Selector:** `app-search-input`
- **Location:** `shared/forms/search-input/`
- **Standalone:** Yes
- **Inputs:** `placeholder: string` (default `'Search..'`)
- **Outputs:** `search: EventEmitter<string>` — emits on each input event
- **Purpose:** Simple text input wrapper for search bars.
- **Usage:** `<app-search-input (search)="onSearch($event)"></app-search-input>`

## Directives

### FuseScrollbarDirective

- **Selector:** `[fuseScrollbar]`
- **ExportAs:** `fuseScrollbar`
- **Location:** `@fuse/directives/scrollbar/`
- **Standalone:** Yes
- **Library:** Perfect Scrollbar (`perfect-scrollbar`)
- **Purpose:** Wraps an element with a custom scrollbar. Provides scrollTo, scrollToTop, scrollToBottom, scrollToElement, geometry, position APIs.
- **Inputs:** `fuseScrollbar: boolean` (toggle, default true), `fuseScrollbarOptions: PerfectScrollbar.Options`
- **Usage:** `<div fuseScrollbar [fuseScrollbarOptions]="{ wheelSpeed: 0.5 }">`
- **Auto-disabled on:** Android, iOS, server-side rendering

### FuseScrollResetDirective

- **Selector:** `[fuseScrollReset]`
- **ExportAs:** `fuseScrollReset`
- **Location:** `@fuse/directives/scroll-reset/`
- **Standalone:** Yes
- **Purpose:** Resets scroll position to top on `NavigationEnd` router event.
- **Usage:** `<div fuseScrollReset>`

## Pipes

### FuseFindByKeyPipe

- **Name:** `fuseFindByKey`
- **Location:** `@fuse/pipes/find-by-key/`
- **Standalone:** Yes, impure (`pure: false`)
- **Purpose:** Finds an object from a source array by matching a key-value pair. Accepts single string or string array.
- **Usage:**
  - Single: `{ sourceArray | fuseFindByKey: 'id' : items }` returns matching object
  - Multi: `{ ['id1', 'id2'] | fuseFindByKey: 'id' : items }` returns array of matches

## Validators

### ExistingValidator

- **Location:** `shared/validators/existing.validator.ts`
- **Type:** Injectable service providing `AsyncValidatorFn`
- **Injected Services:** `RoleService`, `PermissionService`
- **Method:** `IsUnique(table, method, id?)` returns async validator
  - `table`: `'permissions'` or `'role'`
  - `method`: `'Add'` or `'Update'`
  - `id`: optional — excludes current record on update
- **Behavior:** Debounces 500ms, calls `service.findOne()` on the control's form key. Returns `{ alreadyExists: true }` if duplicate found.
- **Usage:**
  ```typescript
  this._formBuilder.control('', {
    asyncValidators: [this.validator.IsUnique('role', 'Add')],
  })
  ```

## Utils

### cleanFilters

- **Location:** `shared/utils/clean-filters.util.ts`
- **Signature:** `cleanFilters(filterData: Record<string, FilterMetadata | FilterMetadata[]>)`
- **Purpose:** Strips empty/null/invalid `FilterMetadata` values from PrimeNG filter state. Removes `global` key, filters out null/empty string/empty array conditions. Returns only valid entries.
- **Usage:** `const valid = cleanFilters(event.filters)` in PrimeNG lazy load handler.

## Dialogs

### FuseConfirmationService

- **Location:** `@fuse/services/confirmation/`
- **Injectable:** `providedIn: 'root'`
- **Method:** `open(config: FuseConfirmationConfig)` returns `MatDialogRef`
- **Purpose:** Opens a Material-based confirmation dialog with customizable title, message, icon, and confirm/cancel buttons.
- **Config Interface (`FuseConfirmationConfig`):**
  - `title?: string`
  - `message?: string`
  - `icon?: { show, name, color }` — color supports: primary, accent, warn, basic, info, success, warning, error
  - `actions?: { confirm?: { show, label, color }, cancel?: { show, label } }`
  - `dismissible?: boolean`
- **Usage:**
  ```typescript
  const dialog = this.confirmationService.open({
    title: 'Delete?',
    message: 'Are you sure?',
    actions: { confirm: { label: 'Delete' } },
  });
  dialog.afterClosed().subscribe(result => {
    if (result === 'confirmed') { /* delete */ }
  });
  ```
