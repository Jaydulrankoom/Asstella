# AssetsFlow Security Specification

## Data Invariants
1. A tenant-scoped resource (asset, ticket, etc.) MUST carry a `tenantId` that matches its path segment.
2. Cross-tenant access is STRICTLY FORBIDDEN.
3. Every write operation MUST be performed by a verified user (`email_verified == true`).
4. `createdAt` and `tenantId` fields are immutable after creation.
5. Deletion is restricted to Admin roles.

## The "Dirty Dozen" Payloads (Anti-Patterns)
1. **Tenant Squatting**: Create an asset with path `/tenants/victim/assets/new` using a token with `tenantId: attacker`.
2. **Shadow Field Injection**: Update an asset adding `isSystemAdmin: true`.
3. **Identity Spoofing**: Create an asset setting `assignedUserId` to a victim's UID.
4. **Time Travel**: Manually setting `updatedAt` to a future date.
5. **Orphaned Write**: Create a maintenance ticket for a non-existent asset ID.
6. **State Skip**: Directly setting a maintenance ticket to `closed` without passing through `in_progress`.
7. **PII Leak**: Non-admin user attempting to read `/tenants/{id}/users/{uid}` of another user.
8. **Subscription Bypass**: Creating assets exceeding the plan limit (though easier to check in rules if count is stored).
9. **ID Poisoning**: Using a 1MB string as a document ID.
10. **Unverified Write**: Writing data using a token with `email_verified: false`.
11. **Negative Value**: Purchase value set to `-1000`.
12. **Role Escalation**: User attempting to update their own role document in `/tenants/{id}/users/{uid}`.

## Security Controls
- **isValidTenant(id)**: regex check and size check.
- **isOwner(tenantId)**: check `process.auth.token.tenant_id == tenantId`.
- **isVerified()**: check `request.auth.token.email_verified == true`.
