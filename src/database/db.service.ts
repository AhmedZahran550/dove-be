import {
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  DeepPartial,
  EntityManager,
  ObjectLiteral,
} from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

/**
 * Paginated result with metadata
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Base service options
 */
export interface DBServiceOptions {
  sortableColumns?: string[];
  searchableColumns?: string[];
  defaultSortColumn?: string;
  defaultSortOrder?: 'ASC' | 'DESC';
}

/**
 * Abstract base database service with common CRUD operations
 * @template E Entity type
 * @template CreateDto DTO for creating entities
 * @template UpdateDto DTO for updating entities
 */
export abstract class DBService<
  E extends ObjectLiteral,
  CreateDto = DeepPartial<E>,
  UpdateDto = DeepPartial<E>,
> {
  protected readonly options: DBServiceOptions;

  constructor(
    protected readonly repository: Repository<E>,
    options: DBServiceOptions = {},
  ) {
    this.options = {
      sortableColumns: ['created_at', 'updated_at'],
      searchableColumns: [],
      defaultSortColumn: 'created_at',
      defaultSortOrder: 'DESC',
      ...options,
    };
  }

  /**
   * Find all entities with pagination
   */
  async findAll(
    where: FindOptionsWhere<E> = {} as FindOptionsWhere<E>,
    query: PaginationQuery = {},
  ): Promise<PaginatedResult<E>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    // Build sort order
    const order = this.buildSortOrder(query.sortBy, query.sortOrder);

    const [data, totalItems] = await this.repository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Find entity by ID
   */
  async findById(id: string, relations: string[] = []): Promise<E> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<E>,
      relations,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID '${id}' not found`);
    }

    return entity;
  }

  /**
   * Find one entity by criteria
   */
  async findOne(
    where: FindOptionsWhere<E>,
    relations: string[] = [],
  ): Promise<E | null> {
    return this.repository.findOne({ where, relations });
  }

  /**
   * Create a new entity
   */
  async create(dto: CreateDto): Promise<E> {
    const entity = this.repository.create(dto as DeepPartial<E>);
    return this.repository.save(entity);
  }

  /**
   * Update an entity by ID
   */
  async update(id: string, dto: UpdateDto): Promise<E> {
    await this.findById(id); // Verify exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.repository.update(id, dto as any);
    return this.findById(id);
  }

  /**
   * Delete an entity by ID (hard delete)
   */
  async delete(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.repository.remove(entity);
  }

  /**
   * Soft delete an entity by ID
   */
  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.softDelete(id);
  }

  /**
   * Count entities matching criteria
   */
  async count(
    where: FindOptionsWhere<E> = {} as FindOptionsWhere<E>,
  ): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Check if entity exists
   */
  async exists(where: FindOptionsWhere<E>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Start a database transaction
   */
  async startTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const dataSource = this.repository.manager.connection;
    return dataSource.transaction(work);
  }

  /**
   * Build sort order from query parameters
   */
  protected buildSortOrder(
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): FindOptionsOrder<E> {
    const column = sortBy || this.options.defaultSortColumn!;
    const order = sortOrder || this.options.defaultSortOrder!;

    // Validate sortable column
    if (sortBy && !this.options.sortableColumns?.includes(sortBy)) {
      throw new BadRequestException(
        `Cannot sort by '${sortBy}'. Allowed columns: ${this.options.sortableColumns?.join(', ')}`,
      );
    }

    return { [column]: order } as FindOptionsOrder<E>;
  }

  /**
   * Validate filter parameters
   */
  protected validateFilters(
    filters: Record<string, unknown>,
    allowedFilters: string[],
  ): void {
    const invalidFilters = Object.keys(filters).filter(
      (key) => !allowedFilters.includes(key),
    );

    if (invalidFilters.length > 0) {
      throw new BadRequestException(
        `Invalid filter(s): ${invalidFilters.join(', ')}. Allowed: ${allowedFilters.join(', ')}`,
      );
    }
  }
}
