# Phase 3 — Role & Permission (RBAC)

## Approach

Flat permission strings (`module.action`) with many-to-many RBAC:
- Role ↔ Permission via `role_permissions`
- User ↔ Role via `user_roles`
- Users can have multiple roles; effective permissions = union of all role permissions

## Entities

### roles
| Column | Type | Notes |
|--------|------|-------|
| id | PK | auto increment |
| name | VARCHAR(50) | unique, e.g. `SUPER_ADMIN` |
| description | VARCHAR(255) | |
| isSystem | boolean | cannot be deleted |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### permissions
| Column | Type | Notes |
|--------|------|-------|
| id | PK | auto increment |
| name | VARCHAR(100) | unique, format `module.action` |
| group | VARCHAR(50) | category for UI grouping |
| description | VARCHAR(255) | |
| createdAt | timestamp | |

### role_permissions
| Column | Type |
|--------|------|
| roleId | FK → roles.id |
| permissionId | FK → permissions.id |

Composite PK (roleId, permissionId).

### user_roles
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| userId | FK → users.id | |
| roleId | FK → roles.id | |
| areaId | FK → distribution_areas.id | nullable, for AREA_PIC |
| assignedBy | FK → users.id | who assigned |
| assignedAt | timestamp | |
| revokedAt | timestamp | nullable |
| revokedBy | FK → users.id | nullable |
| reason | varchar | nullable |

### user_role_histories
| Column | Type |
|--------|------|
| id | PK |
| userId | FK |
| roleId | FK |
| areaId | FK nullable |
| action | enum: ASSIGN, REVOKE |
| changedBy | FK → users.id |
| reason | varchar nullable |
| createdAt | timestamp |

## API Endpoints

### Roles
- `GET /api/roles` — list all roles with their permissions
- `POST /api/roles` — create role (name, description)
- `GET /api/roles/:id` — detail role with permissions
- `PATCH /api/roles/:id` — update role
- `DELETE /api/roles/:id` — soft delete (kecuali isSystem)
- `POST /api/roles/:id/permissions` — assign permissions to role
- `DELETE /api/roles/:id/permissions/:permissionId` — revoke permission from role

### Permissions
- `GET /api/permissions` — list all permissions (grouped by module)
- `POST /api/permissions` — create custom permission

### User Roles
- `GET /api/users/:id/roles` — list roles assigned to user
- `POST /api/users/:id/roles` — assign role to user
- `DELETE /api/users/:id/roles/:roleId` — revoke role from user
- `GET /api/me/permissions` — check current user's permissions

## Guard

`PermissionsGuard` with `@Permissions('module.action')` decorator:
1. JwtAuthGuard authenticates first
2. PermissionsGuard reads userId from request, queries all roles + permissions
3. Checks if required permission exists in user's permission set
4. Returns 403 if not authorized

`AreaAccessGuard` — for area-based access (PIC), checks user's assigned area against request params.

## Frontend Pages

1. **Role List** (`/admin/roles`) — table CRUD
2. **Role Detail** (`/admin/roles/:id`) — toggle permissions per group
3. **User Roles** (`/admin/users/:id/roles`) — assign/revoke roles with history

## Seed Migration

Seed migration steps:
1. Create all permissions
2. Create initial roles (SUPER_ADMIN, BAZAAR_ADMIN, FINANCE_ADMIN, AREA_PIC, LEADERSHIP, MEMBER)
3. Assign all permissions to SUPER_ADMIN
4. Assign BAZAAR_ADMIN permissions: bazaar.*, member.read
5. Assign FINANCE_ADMIN permissions: finance.*, bazaar.payment.*, bazaar.report.*
6. Assign AREA_PIC permissions: bazaar.distribution.scan, bazaar.distribution.confirm
7. Assign LEADERSHIP permissions: bazaar.report.read, finance.dashboard.read
8. Assign MEMBER permissions: bazaar.order.create, bazaar.order.read
9. Assign SUPER_ADMIN role to NPK 23893 and 15012

## Files to Create/Modify

### Backend (new)
- `src/modules/roles/role.entity.ts`
- `src/modules/roles/role-permission.entity.ts`
- `src/modules/roles/roles.service.ts`
- `src/modules/roles/roles.controller.ts`
- `src/modules/roles/roles.module.ts`
- `src/modules/roles/dto/create-role.dto.ts`
- `src/modules/roles/dto/update-role.dto.ts`
- `src/modules/permissions/permission.entity.ts`
- `src/modules/permissions/permissions.service.ts`
- `src/modules/permissions/permissions.controller.ts`
- `src/modules/permissions/permissions.module.ts`
- `src/modules/permissions/dto/create-permission.dto.ts`
- `src/common/guards/permissions.guard.ts`
- `src/common/guards/area-access.guard.ts`
- `src/common/decorators/permissions.decorator.ts`
- `src/database/migrations/xxxxx-seed-roles-permissions.ts`

### Backend (modify)
- `src/app.module.ts` — register RolesModule, PermissionsModule
- `src/modules/auth/entities/user.entity.ts` — add roles relation
- `src/common/guards/index.ts` — export new guards
- `src/common/decorators/index.ts` — export new decorator

### Frontend (new)
- `src/app/modules/admin/roles/` — role list + detail pages
- `src/app/modules/admin/users/` — user role assignment page
- `src/app/modules/admin/admin.routes.ts`
- Update main routing to include admin section