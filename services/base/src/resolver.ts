import { Query, Resolver } from 'type-graphql'

@Resolver()
export default class SchemaResolver {
  @Query()
  base(): String {
    return 'chargeyourmind'
  }
}
