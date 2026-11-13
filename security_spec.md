# Security Specification — MEMORIA

## 1. Data Invariants
1. **Strict Ownership**: Every `UserProfile` document at `/users/{userId}` can only be read, created, or updated by `request.auth.uid == userId` with verified email (`request.auth.token.email_verified == true`). List queries on `/users` are completely disabled (`allow list: if false`) to prevent PII harvesting.
2. **Memory Ownership & Query Enforcement**: Every `Memory` document at `/memories/{memoryId}` must declare `userId == request.auth.uid` on creation, `userId` is immutable on update, and `allow list` strictly enforces `resource.data.userId == request.auth.uid`.
3. **Album Ownership & Query Enforcement**: Every `Album` document at `/albums/{albumId}` must declare `userId == request.auth.uid` on creation, `userId` is immutable on update, and `allow list` strictly enforces `resource.data.userId == request.auth.uid`.
4. **Temporal Integrity**: `createdAt` must equal `request.time` on create and remain unchanged on update. `updatedAt` must equal `request.time` on both create and update.
5. **Volumetric & Schema Guarding**: Every string has strict `.size()` bounds matching `firebase-blueprint.json`, IDs match `^[a-zA-Z0-9_\-]+$`, `photos` is bounded to `<= 10` items with first-element type/size checking, and `keys().hasOnly(...)` blocks shadow fields.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Read**: `get /memories/mem_1` with `auth = null`.
2. **Cross-User Read**: `get /memories/mem_1` where `resource.data.userId = "userA"` and `auth.uid = "userB"`.
3. **Blanket List Scraping**: `list /memories` without `where('userId', '==', auth.uid)`.
4. **User PII List**: `list /users` even when authenticated.
5. **Cross-User PII Read**: `get /users/userA` when `auth.uid = "userB"`.
6. **Identity Spoofing on Create**: `create /memories/mem_2` with `userId: "userA"` while `auth.uid = "userB"`.
7. **Shadow Field Injection**: `create /memories/mem_3` containing extra undocumented key `isAdmin: true`.
8. **Unverified Email Write**: `create /memories/mem_4` with `auth.token.email_verified = false`.
9. **ID Poisoning**: `create /memories/bad..id!@#` with invalid characters or length > 128.
10. **Immutable Owner Tampering**: `update /memories/mem_1` changing `userId` to another UID.
11. **Backdated Timestamp Tampering**: `create /memories/mem_5` with client-supplied past `createdAt` != `request.time`.
12. **Array Overflow / Resource Exhaustion**: `create /memories/mem_6` with 11 items in `photos` or `story` > 10,000 characters.
