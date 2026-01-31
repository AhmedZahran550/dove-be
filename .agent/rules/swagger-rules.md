---
trigger: always_on
---

when create new recourse or update any api follow this swagger doc

```
src/
├── swagger/
│   ├── index.ts                    # Export all swagger decorators
│   ├── branches.swagger.ts         # Branches resource swagger docs
│   ├── users.swagger.ts            # Users resource swagger docs
│   └── [resource].swagger.ts       # One file per resource
├── modules/
│   ├── branches/
│   │   ├── branches.controller.ts
│   │   ├── branches.service.ts
│   │   └── dto/
│   └── [other-modules]/
└── main.ts
```

🎯 Core Rule

Rule 1: One Swagger File Per Resource

- **ALWAYS** create a `[resource].swagger.ts` file in `src/swagger/` when creating a new resource/module
- **File naming convention:** `{resource-name}.swagger.ts` (lowercase, kebab-case)
- **Example:** `branches.swagger.ts`, `user-profiles.swagger.ts`

Rule 2: Swagger File Must Be Created With Resource

- When generating a new resource: `nest g resource branches`
- **IMMEDIATELY** create `src/swagger/branches.swagger.ts`
- Add the export to `src/swagger/index.ts`

Rule 3: Swagger File Must Be Updated With Controller Changes

- **BEFORE** adding a new endpoint → Update swagger file
- **BEFORE** modifying an endpoint → Update corresponding swagger decorator
- **BEFORE** deleting an endpoint → Remove corresponding swagger decorator

Rule 4: No Swagger Decorators in Controllers

- **NEVER** use `@ApiOperation()`, `@ApiResponse()`, `@ApiParam()`, `@ApiQuery()` directly in controllers
- **ONLY** use `@ApiTags()` at the controller class level
- **ALL** other swagger documentation goes in `src/swagger/[resource].swagger.ts`

📝 Swagger File Template

```typescript
// src/swagger/[resource].swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

export const [Resource]Swagger = {
  findAll: () => applyDecorators(
    ApiOperation({ summary: 'List all [resources]', description: 'Get paginated list' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: 200, description: 'Success' }),
    ApiBearerAuth(),
  ),
  findOne: () => applyDecorators(
    ApiOperation({ summary: 'Get [resource] details' }),
    ApiParam({ name: 'id', description: '[Resource] UUID', type: String }),
    ApiResponse({ status: 200, description: 'Success' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  ),
  create: () => applyDecorators(
    ApiOperation({ summary: 'Create new [resource]' }),
    ApiBody({ type: [CreateResourceDto] }),
    ApiResponse({ status: 201, description: 'Created' }),
    ApiResponse({ status: 400, description: 'Invalid data' }),
    ApiBearerAuth(),
  ),
  update: () => applyDecorators(
    ApiOperation({ summary: 'Update [resource]' }),
    ApiParam({ name: 'id', type: String }),
    ApiBody({ type: [UpdateResourceDto] }),
    ApiResponse({ status: 200, description: 'Updated' }),
    ApiResponse({ status: 404, description: 'Not found' }),
    ApiBearerAuth(),
  ),
  remove: () => applyDecorators(
    ApiOperation({ summary: 'Delete [resource]' }),
    ApiParam({ name: 'id', type: String }),
    ApiResponse({ status: 200, description: 'Deleted' }),
    ApiResponse({ status: 404, description: 'Not found' }),
    ApiBearerAuth(),
  ),
};
```

🎨 Example: Branches Resource

**File:** `src/swagger/branches.swagger.ts`

```typescript
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

export const BranchesSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'List all branches',
        description: 'Get paginated list of all pharmacy branches',
      }),
      ApiResponse({
        status: 200,
        description: 'Branches retrieved successfully',
      }),
    ),
  findNearby: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Find nearby branches',
        description: 'Get branches near specified location',
      }),
      ApiQuery({
        name: 'lat',
        required: true,
        type: Number,
        description: 'Latitude',
      }),
      ApiQuery({
        name: 'lng',
        required: true,
        type: Number,
        description: 'Longitude',
      }),
      ApiQuery({
        name: 'radius',
        required: false,
        type: Number,
        description: 'Search radius in km',
      }),
      ApiResponse({ status: 200, description: 'Nearby branches retrieved' }),
    ),
  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get branch details' }),
      ApiParam({ name: 'id', description: 'Branch UUID' }),
      ApiResponse({ status: 200, description: 'Branch retrieved' }),
      ApiResponse({ status: 404, description: 'Branch not found' }),
    ),
  rateBranch: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Rate branch',
        description: 'Submit rating and feedback',
      }),
      ApiParam({ name: 'id', description: 'Branch UUID' }),
      ApiBody({ type: RateBranchDto }),
      ApiResponse({ status: 201, description: 'Rating submitted' }),
      ApiResponse({
        status: 400,
        description: 'Invalid rating or already rated',
      }),
      ApiResponse({ status: 404, description: 'Branch not found' }),
    ),
};
```

**Controller:** `src/modules/branches/branches.controller.ts`

```typescript
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BranchesSwagger } from '@/swagger/branches.swagger';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @BranchesSwagger.findAll()
  findAll(@Paginate() query: QueryOptions) {
    return this.branchesService.findAll(query);
  }

  @Get('nearby')
  @BranchesSwagger.findNearby()
  findNearby(@Query() params: NearbyBranchesDto) {
    return this.branchesService.findNearby(params);
  }

  @Get(':id')
  @BranchesSwagger.findOne()
  findOne(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  @Post(':id/rating')
  @BranchesSwagger.rateBranch()
  async rateBranch(
    @Param('id') id: string,
    @Body() ratingDto: RateBranchDto,
    @AuthUser() user: AuthUserDto,
  ) {
    return this.branchesService.rateBranch(
      id,
      user.id,
      ratingDto.rating,
      ratingDto.notes,
    );
  }
}
```

📦 Index File

**File:** `src/swagger/index.ts`

```typescript
export { BranchesSwagger } from './branches.swagger';
export { UsersSwagger } from './users.swagger';
export { ProductsSwagger } from './products.swagger';
// Add new resources here
```

## ✅ Development Workflow

**Creating New Resource:**

- [ ] Generate resource: `nest g resource [name]`
- [ ] Create `src/swagger/[name].swagger.ts`
- [ ] Copy template and customize
- [ ] Export in `src/swagger/index.ts`
- [ ] Import and use in controller
- [ ] Test in Swagger UI

**Adding New Endpoint:**

- [ ] Add method to controller
- [ ] Add swagger decorator in `[resource].swagger.ts`
- [ ] Use decorator in controller
- [ ] Test in Swagger UI

**Updating Endpoint:**

- [ ] Update controller method
- [ ] Update swagger decorator
- [ ] Test in Swagger UI

**Deleting Endpoint:**

- [ ] Remove from controller
- [ ] Remove from swagger file
- [ ] Verify Swagger UI

## 🎯 Naming Conventions

- **Swagger files:** `resource-name.swagger.ts` (kebab-case)
- **Decorator names:** Match controller method names (camelCase)
- **Standard CRUD:** `findAll`, `findOne`, `create`, `update`, `remove`
- **Custom actions:** `findNearby`, `rateBranch`, `approve`, `activate`

📚 Common Decorators

```typescript
// Operation
ApiOperation({
  summary: 'Short description',
  description: 'Detailed description',
});

// Parameters
ApiParam({
  name: 'id',
  description: 'Resource ID',
  type: String,
  required: true,
});
ApiQuery({ name: 'filter', type: String, required: false, example: 'active' });

// Request Body
ApiBody({ type: CreateDto, description: 'Data to create' });

// Responses
ApiResponse({
  status: 200,
  description: 'Success',
  type: ResourceDto,
  isArray: false,
});

// Authentication
ApiBearerAuth(); // JWT
ApiBasicAuth(); // Basic auth
```

Common Mistakes

**❌ DON'T put decorators in controller:**

```typescript
@Get()
@ApiOperation({ summary: 'Get all' })
findAll() { ... }
```

✅ DO use swagger file:\*\*

```typescript
@Get()
@BranchesSwagger.findAll()
findAll() { ... }
```

**❌ DON'T forget to export in index.ts**
**✅ DO export:** `export { BranchesSwagger } from './branches.swagger';`

**❌ DON'T use generic names:** `Swagger.get()`, `Swagger.post()`
**✅ DO use descriptive names:** `BranchesSwagger.findAll()`, `BranchesSwagger.create()`

🔍 Code Review Checklist

- [ ] Swagger file exists for new resources
- [ ] Swagger file updated for modified endpoints
- [ ] No swagger decorators in controller (except `@ApiTags`)
- [ ] Decorator names match controller methods
- [ ] All endpoints documented
- [ ] Response types specified
- [ ] Auth decorators present where needed
- [ ] Export added to `src/swagger/index.ts`

## 📖 Additional Guidelines

**Documentation Quality:**

- **summary:** Short, action-oriented (e.g., "Get branch details")
- **description:** Detailed explanation of endpoint behavior
- Include examples in queries/params when helpful
- Document all possible response status codes

**Type Safety:**

- Always import and reference DTOs for `type` parameter
- Use `isArray: true` for collection endpoints
- Keep DTO definitions in module's `dto/` folder

**Organization:**

- Group related decorators logically
- Keep decorators in same order as controller methods
- Remove outdated decorators promptly

## 📝 Auto-Generation Script (Optional)

```bash
#!/bin/bash
# scripts/generate-swagger-file.sh
RESOURCE=$1
CAPITALIZED="$(tr '[:lower:]' '[:upper:]' <<< ${RESOURCE:0:1})${RESOURCE:1}"

cat > "src/swagger/${RESOURCE}.swagger.ts" << EOF
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export const ${CAPITALIZED}Swagger = {
  findAll: () => applyDecorators(
    ApiOperation({ summary: 'List all ${RESOURCE}' }),
    ApiResponse({ status: 200, description: 'Success' }),
  ),
  findOne: () => applyDecorators(
    ApiOperation({ summary: 'Get ${RESOURCE} details' }),
    ApiParam({ name: 'id', description: 'UUID' }),
    ApiResponse({ status: 200, description: 'Success' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  ),
};
EOF
echo "✅ Created src/swagger/${RESOURCE}.swagger.ts"
```

**Usage:** `./scripts/generate-swagger-file.sh branches`

## 🏁 Summary

1. **One swagger file per resource** in `src/swagger/`
2. **Always create** swagger file when creating resource
3. **Always update** swagger file when modifying endpoints
4. **Never use** swagger decorators directly in controllers
5. **Always export** in `src/swagger/index.ts`
6. **Follow naming conventions** - match controller method names
7. **Document thoroughly** - summary, description, params, responses
