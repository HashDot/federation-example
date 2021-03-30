import { Directive, Field, ObjectType } from 'type-graphql'

@Directive(`@key(fields: "status, message")`)
@ObjectType({ description: 'Meta' })
export default class Meta {
  @Field({ description: 'Request Status' })
  public status: 'SUCCESS' | 'ERROR'

  @Field({ description: 'Request Message' })
  public message: string
}
