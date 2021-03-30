import { Query, Resolver } from 'type-graphql'

import Customer from './entities/schema'
import CustomerGet from './func/get'

@Resolver((_) => Customer)
export default class CustomerResolver {
  @Query(() => Customer)
  customer() {
    return CustomerGet()
  }
}
