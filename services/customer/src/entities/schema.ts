import { ObjectID } from 'mongodb'
import { Field, ObjectType, ID, Directive } from 'type-graphql'
import {
  prop as Property,
  getModelForClass,
  modelOptions,
} from '@typegoose/typegoose'

import Meta from '../external/Meta'

@Directive(`@key(fields: "_id")`)
@ObjectType({ description: 'Customer Data' })
@modelOptions({ options: { customName: 'customer' } })
export class CustomerData {
  @Field((_) => ID, { nullable: true })
  _id?: ObjectID

  @Field()
  @Property()
  name: string
}

@ObjectType({ description: 'Customer' })
export default class Customer {
  @Field(() => Meta, { description: 'Meta Data' })
  meta: Meta

  @Field(() => [CustomerData], { nullable: true, description: 'Customer Data' })
  data: CustomerData[]
}

export const CustomerModel = getModelForClass(CustomerData)
