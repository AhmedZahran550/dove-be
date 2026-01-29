---
trigger: always_on
---

the defaulte of the RolesGuard is to require Role.ADMIN for all routes without explicit @Roles()

so dont forget to add @Roles()
and for public api use @Public() decorator
