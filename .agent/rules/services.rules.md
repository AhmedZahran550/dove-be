---
trigger: always_on
---

every service nned to extends the dbservice if needed and always manage the pagination and alwasy add the pagination config for each service and pass it to the super .

all services with crud operation have to extends the db service if there is no issue will happend ,  
always manage the pagination and add PAGINATION_CONFIG on each service based on the entity for example
export const BRANCHES_PAGINATION_CONFIG: QueryConfig<Branch> = {
sortableColumns: [...localizedQueryConfig.sortableColumns],
filterableColumns: {
...localizedQueryConfig.filterableColumns,
type: [FilterOperator.EQ],
city: [FilterOperator.EQ],
area: [FilterOperator.EQ],
'provider.id': [FilterOperator.EQ],
isActive: [FilterOperator.EQ],
},
searchableColumns: ['localizedName.en', 'localizedName.ar'],
relations: ['provider', 'city', 'city.governorate'],
};
@Injectable()
export class BranchesService extends DBService<Branch, CreateBranchDto> {
constructor(
@InjectRepository(Branch)
repository: Repository<Branch>,
private cacheService: CacheService,
private dataSource: DataSource,
) {
super(repository, BRANCHES_PAGINATION_CONFIG); // 24 hours
}
}..
