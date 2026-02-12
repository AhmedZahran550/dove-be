import { validate } from 'class-validator';
import { CreateUserDto, UpdateUserDto } from './user.dto';

describe('UserDto Naming', () => {
  it('should validate CreateUserDto with camelCase properties', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.firstName = 'John';
    dto.lastName = 'Doe';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation for snake_case properties after refactor', async () => {
    // This will be used AFTER the refactor to ensure we don't allow snake_case anymore if we want to be strict,
    // though class-validator just ignores extra properties unless forbidUnknownValues is set.
  });
});
