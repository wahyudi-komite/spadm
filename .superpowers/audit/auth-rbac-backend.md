# Auth & RBAC Backend Audit Report

> Audited: `backend/src/modules/auth/`, `modules/roles/`, `modules/permissions/`, `modules/members/`, `modules/audit-logs/`, `common/guards/`, `common/decorators/`
> Date: 2026-07-15

---

## HIGH SEVERITY

### H1. Hardcoded default password fallback — `MembersService`

**File:** `modules/members/members.service.ts:127, 169, 346`

**Description:** When `DEFAULT_MEMBER_PASSWORD` env var is not set, the code falls back to the string `'SmartCare'`. This means every imported member gets the same predictable password. If an attacker guesses the pattern, they can access any imported account. Additionally, there is no requirement for the user to immediately change this password on first login for imported users — `mustChangePassword: true` IS set, which mitigates this partially, but the default fallback is still problematic.

```ts
const defaultPassword = this.configService.get('DEFAULT_MEMBER_PASSWORD') || 'SmartCare';
```

**Fix:** Remove the fallback — require `DEFAULT_MEMBER_PASSWORD` via env validation, or generate a random password per user. At minimum, ensure the env var is required in production.

---

### H2. `MembersController.update` uses `@Body() data: any` — no DTO, no validation

**File:** `modules/members/members.controller.ts:41`, `modules/members/dto/` (empty)

**Description:** The `PATCH /members/:id` endpoint accepts `@Body() data: any` with no DTO class, no validation decorators, and no whitelist. This means a malicious actor with `member.update` permission can send arbitrary fields directly into the database via `this.membersService.update(id, data, userId)` which passes `data` straight to `this.memberRepository.update(id, data)`. An attacker could overwrite `deletedAt`, `createdAt`, `updatedAt`, or any other column.

```ts
async update(@Param('id') id: number, @Body() data: any, @CurrentUser() userId: number) {
```

**Fix:** Create `UpdateMemberDto` with explicit `@IsOptional()` decorated fields for allowed updatable properties. Use `PartialType` or explicit validation.

---

### H3. `DB_PASSWORD` default fallback to empty string

**File:** `config/database.config.ts:7`

**Description:** `password: process.env.DB_PASSWORD || ''` defaults database password to empty string. In production this is a severe misconfiguration risk — if the env var is accidentally unset, the app connects without a password.

**Fix:** Remove the `|| ''` fallback and add `DB_PASSWORD` to `environment.validation.ts` required variables.

---

### H4. `LoginHistory` and `PasswordResetToken` entities missing FK relations to `User`

**Files:**
- `modules/auth/entities/login-history.entity.ts:8-9`
- `modules/auth/entities/password-reset-token.entity.ts:8-9`

**Description:** Both entities store `userId` as a plain `@Column()` with no `@ManyToOne` relation. This means the database has no foreign key constraint — orphaned records can exist if a user is deleted (logical deletion via `DELETE FROM users` would fail silently or produce junk data). TypeORM also loses the ability to eager/lazy load.

**Fix:** Add `@ManyToOne(() => User) @JoinColumn({ name: 'userId' })` to both entities.

---

### H5. `AuthController.refresh` mixes cookie and body-based token extraction with no CSRF protection

**File:** `modules/auth/auth.controller.ts:44`

**Description:** The refresh endpoint reads the token from `req.cookies?.refreshToken || req.body?.refreshToken`. Accepting the token from the request body defeats the purpose of httpOnly cookies — an XSS attacker can read the body payload. The cookie path is set to `/api/auth` which only restricts csrf, but body fallback opens a window.

**Fix:** Remove the `|| req.body?.refreshToken` fallback. The refresh token should ONLY come from the httpOnly cookie.

---

### H6. `signOut` silently returns 200 even when `refreshToken` is missing — no session invalidation

**File:** `modules/auth/auth.service.ts:191-192`

**Description:** `signOut` returns immediately if refreshToken is falsy. This means a logout request without a refresh token (`POST /auth/logout` with no cookie and no body) still returns HTTP 200 "Logout berhasil" without actually invalidating anything. This gives false sense of security.

**Fix:** Either require the refresh token or invalidate ALL sessions for the user. Don't silently succeed on no-op.

---

### H7. `ChangePasswordDto` missing `@Matches` for password complexity

**File:** `modules/auth/dto/change-password.dto.ts:10-14`

**Description:** Only `@MinLength(8)` is enforced. No requirement for uppercase, lowercase, number, or special character. Combined with the `'SmartCare'` default password, users could set equally weak passwords.

**Fix:** Add `@Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Password must contain uppercase, lowercase, and number' })`.

---

## MEDIUM SEVERITY

### M1. `AreaAccessGuard` uses hardcoded role name checks

**File:** `common/guards/area-access.guard.ts:41`

**Description:** Hardcoded role names `'SUPER_ADMIN'`, `'BAZAAR_ADMIN'`, `'AREA_PIC'` are compared against role names. If roles are renamed in the database, this guard silently breaks.

```ts
['SUPER_ADMIN', 'BAZAAR_ADMIN'].includes(assignment.role?.name),
```

**Fix:** Store role-based access configuration in the database (e.g., a `roles.isSuperAdmin` flag) or use permission-based checks rather than role name strings.

---

### M2. `PermissionsGuard` loads permissions on every request with no caching

**File:** `common/guards/permissions.guard.ts:30-41`

**Description:** Every guarded request queries `user_roles` → `roles` → `role_permissions` → `permissions` with 4 joined tables. There is no in-memory cache, no Redis layer, and no request-scoped cache. For high-traffic endpoints this creates unnecessary database load.

**Fix:** Add a simple in-memory cache (e.g., `node-cache` with short TTL like 30s) or use request-scoped caching. At minimum, cache the permission query per-request.

---

### M3. `AuditLogService.log` accepts `Record<string, any>` for oldValues/newValues — no type safety

**File:** `modules/audit-logs/audit-log.entity.ts:24-27`, `modules/audit-logs/audit-log.service.ts:19-20`

**Description:** The audit log uses `Record<string, any>` for JSON columns and the `log()` method accepts `any`-typed values. This bypasses TypeScript compile-time safety and could allow storing circular references or non-serializable objects, causing `JSON.stringify` to throw at query time.

**Fix:** Replace `any` with a constrained type like `Record<string, unknown>` and apply a JSON-safe sanitization check before saving.

---

### M4. `PermissionsGuard` uses `DataSource.getRepository()` instead of injected repository

**File:** `common/guards/permissions.guard.ts:12, 30`

**Description:** The guard uses `@InjectDataSource() private dataSource: DataSource` and then calls `this.dataSource.getRepository(UserRole)`. This is an anti-pattern — it bypasses the DI-registered repository and any custom repository methods. It also makes unit testing harder (must mock DataSource instead of Repository).

**Fix:** Inject `UserRole` repository directly via `@InjectRepository(UserRole)`.

---

### M5. `UserRoleHistory.action` uses TypeORM `enum` column type but MySQL compatibility is inconsistent

**File:** `modules/roles/user-role-history.entity.ts:28`

**Description:** `@Column({ type: 'enum', enum: ['ASSIGN', 'REVOKE'] })` — TypeORM's enum type maps to `ENUM(...)` in MySQL which is non-standard SQL and can cause migration issues. The entity also declares a string type `status` (`@Column({ length: 20 })`) while using a separate enum column. Consider using a string column with a simple validation or an enum constant.

**Fix:** Use `@Column({ type: 'varchar', length: 10 })` and validate the value at the application layer, or switch to a TypeScript enum.

---

### M6. `MembersService.findAll` duplicates query logic for search vs non-search paths

**File:** `modules/members/members.service.ts:48-89`

**Description:** The method has an `if (query.search)` branch that duplicates the entire query logic (lines 50-66) with a separate `findAndCount` call using `searchWhere`, then a separate block for the non-search case (lines 67-89). The `searchWhere` approach also fails to properly combine search with status/plant filters when no search term is provided.

```ts
const searchWhere: any = [
  { name: Like(`%${query.search}%`), deletedAt: IsNull() },
  { npk: Like(`%${query.search}%`), deletedAt: IsNull() },
];
if (query.status) searchWhere.forEach((w: any) => w.status = query.status);
```

This mutates the array entries but the `Like` and `deletedAt` are still duplicated. This is overly complex and error-prone.

**Fix:** Refactor to use `FindOptionsWhere` with `OR` syntax (`[{ name: Like(...) }, { npk: Like(...) }]`) in a single query path.

---

### M7. `generateTokens` uses `payload as object` type assertion

**File:** `modules/auth/auth.service.ts:307, 312`

**Description:** The `generateTokens` method casts `payload as object` when passing to `jwtService.sign()`. This indicates the JwtService type expects specific payload types. Using `as object` bypasses type checking and could allow accidentally signing sensitive data into the token.

**Fix:** Define an explicit interface for the JWT payload (`JwtPayload { sub: number; npk: string }`) and pass it typed.

---

### M8. `RoleGuard` mentioned in scope but does not exist

**File:** Not found in `common/guards/` — only `index.ts` exports `JwtAuthGuard`, `PermissionsGuard`, `AreaAccessGuard`

**Description:** The audit scope requested review of `RoleGuard`. No `role.guard.ts` exists in `common/guards/` or anywhere in the codebase. If this guard was planned but not implemented, it's either dead requirement or a missing implementation.

**Fix:** Either implement `RoleGuard` or remove it from all documentation/imports.

---

## LOW SEVERITY

### L1. Unused `IsNull` import in multiple files

**Files:**
- `modules/auth/auth.service.ts:3` (`import { Repository, IsNull } from 'typeorm'`)
- `modules/roles/roles.service.ts:3` (`import { Repository, In, IsNull } from 'typeorm'`)
- `modules/members/members.service.ts:3` (`import { Repository, Like, IsNull, In } from 'typeorm'`)

**Description:** `IsNull` is imported but never used in `auth.service.ts`. In `roles.service.ts` it's used in `getUserRoles` but could be replaced with `: null`. In `members.service.ts` it's used. The import in `auth.service.ts` is dead.

**Fix:** Remove unused `IsNull` import from `auth.service.ts`.

---

### L2. `RolePermission` entity is declared but never directly queried

**File:** `modules/roles/role-permission.entity.ts`

**Description:** The `RolePermission` entity maps the `role_permissions` junction table. However, the `@ManyToMany` relationship on `Role` (with `@JoinTable`) manages this table automatically. The `RolePermission` entity appears to be dead code — it's imported in `roles.module.ts` but never used in any service. TypeORM's `@JoinTable` handles the junction table without needing a dedicated entity.

**Fix:** Remove `RolePermission` entity and its TypeORM import in `roles.module.ts` if it's not used anywhere.

---

### L3. `MembersModule` imports `Role` and `UserRole` entities in `confirmImport` via raw `manager.findOne` but does not declare them in `TypeOrm.forFeature`

**File:** `modules/members/members.module.ts:12-19`, `modules/members/members.service.ts:352-357`

**Description:** The `confirmImport` method uses `manager.findOne(Role, ...)` and `manager.save(UserRole, ...)` inside a transaction. These entities (`Role`, `UserRole`) are NOT imported in the module's `TypeOrmModule.forFeature()`. While this works at runtime because the transaction manager has access to all registered entities globally, it's a violation of NestJS module encapsulation and can cause issues with tree-shaking or testing.

**Fix:** Add `Role` and `UserRole` to the `TypeOrmModule.forFeature()` array in `MembersModule`.

---

### L4. `AuthModule` imports `Member` and `UserRole` in `TypeOrmModule.forFeature` but not in service

**File:** `modules/auth/auth.module.ts:17`

**Description:** The module registers `Member` and `UserRole` in TypeOrm's feature scope, which is correct since `AuthService` injects both repositories. However, the `JwtStrategy` is in the providers array but does not inject these. Fine, but worth noting for clarity.

---

### L5. `AuthController.refresh` does not set `@Throttle()` limits

**File:** `modules/auth/auth.controller.ts:40-65`

**Description:** The `refresh` endpoint has no `@Throttle()` decorator, while `sign-in` is throttled to 5 req/min. An attacker could brute-force refresh tokens on this endpoint without rate limiting.

**Fix:** Add `@Throttle({ default: { limit: 10, ttl: 60000 } })` to the refresh endpoint.

---

### L6. `forgotPassword` returns the same message for found/not-found, but leaks user existence via timing

**File:** `modules/auth/auth.service.ts:225-241`

**Description:** The method correctly returns the same message regardless of whether the user exists ("Jika NPK terdaftar..."), which is good. However, bcrypt `hashToken` is only called when the user exists — a timing attacker could measure response time differences to determine if an NPK is registered.

**Fix:** Always hash a dummy token (or call `hashToken` on a random value) even when user is not found, to normalize timing. This is a low-severity issue given the 32-byte random token generation doesn't involve bcrypt, but the DB write vs no-DB-write timing difference still exists.

---

### L7. `session.entity.ts` has no `@Index` on `refreshToken` column

**File:** `modules/auth/entities/session.entity.ts:16-17`

**Description:** The `refreshToken` column (length 500) is queried by `refresh()` method in `AuthService` but has no database index. With thousands of sessions, `SELECT ... WHERE refreshToken = ?` will be a full table scan.

**Fix:** Add `@Index()` decorator on the `refreshToken` column.

---

### L8. `UserRole` entity missing `@ManyToOne` for `assignedBy` / `revokedBy`

**File:** `modules/roles/user-role.entity.ts:19-20, 37-38`

**Description:** The `assignedBy` and `revokedBy` columns store plain `number` userIds but have no `@ManyToOne` relation to `User`. This means no FK constraint and no ability to eager-load who performed the action.

**Fix:** Add `@ManyToOne(() => User)` relations for both fields.

---

### L9. `AllExceptionsFilter` catches ALL exceptions including programming errors

**File:** `common/filters/http-exception.filter.ts:4-5`

**Description:** `@Catch()` without arguments catches every exception including `TypeError`, `ReferenceError`, database connection errors, etc. These are swallowed and returned as generic "Terjadi kesalahan internal server". In development mode this is fine, but in production it makes debugging operational issues extremely difficult — the original error stack trace is lost.

**Fix:** Log the full error (including stack trace) before returning the generic response. Consider adding a logger.

---

### L10. `SanitizeUser` uses destructuring which spreads all properties including relation objects

**File:** `modules/auth/auth.service.ts:324-326`

**Description:** `const { password, ...rest } = user` removes only `password`. If `user` has loaded relations (like `sessions`, `userRoles`), those relations are included in the sanitized object and returned to the client. While bcrypt-hashed passwords are not readable, the `mustChangePassword` flag and other sensitive fields leak.

**Fix:** Either explicitly pick allowed fields or use `@Exclude()` decorators from `class-transformer` with a serialization group.

---

### L11. `PermissionsGuard` uses `some()` for permission matching — any single permission grants access

**File:** `common/guards/permissions.guard.ts:50`

**Description:** `requiredPermissions.some((p) => userPermissions.has(p))` — this means if an endpoint requires `['role.read', 'role.create']`, a user with only `role.read` can access it. This is by design in many RBAC systems (OR semantics), but should be documented. AND semantics would use `every()`.

**Fix:** If AND semantics are intended, change `some` to `every`. Otherwise document the OR behavior.

---

### L12. `MembersService.importFromExcel` appears to be dead code

**File:** `modules/members/members.service.ts:141-200`

**Description:** The `importFromExcel` method is never called from any controller. The actual import flow uses `previewImport` + `confirmImport` split. `importFromExcel` looks like a legacy method that was replaced by the two-step flow.

**Fix:** Remove `importFromExcel` if it's confirmed unused, or keep it as a fallback with a `@deprecated` comment.

---

### L13. `ErrorCode` enum exists but is only partially used

**File:** `common/enums/error-code.enum.ts`

**Description:** The `ErrorCode` enum defines 20 error codes. However, in the auth/RBAC code, error codes are passed as inline string literals (`'INVALID_CREDENTIALS'`, etc.) instead of using the enum constants. This means the enum is essentially dead code — it's not imported or referenced anywhere in the audited modules.

**Fix:** Replace all hardcoded error code strings with references to the `ErrorCode` enum.

---

### L14. `MembersService.confirmImport` assigns `MEMBER` role to imported users without checking if it exists first

**File:** `modules/members/members.service.ts:352-357`

**Description:** The code finds the `MEMBER` role and throws if not found. However, the `reason` field on UserRole includes `Import anggota #${importId}` which leaks internal ID to the role assignment records. Not a security issue per se, but a data leakage concern.

---
