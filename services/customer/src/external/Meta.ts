import { ObjectType, Field, Directive } from 'type-graphql'

@Directive('@extends')
@ObjectType({ description: 'Meta' })
export default class Meta {
  @Directive('@external')
  @Field({ description: 'Request Status' })
  public status: 'SUCCESS' | 'ERROR'

  @Directive('@external')
  @Field({ description: 'Request Message' })
  public message: string
}
