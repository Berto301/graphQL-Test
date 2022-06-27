import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';


@InputType()
class UsernamePasswordInput {
    @Field()
    username:string
    @Field()
    password:string
}


@ObjectType()
class FieldError{
    @Field()
    field?: string

    @Field()
    message?:string
}

@ObjectType()
class UserResponse{
    @Field(()=> [FieldError],{nullable:true})
    errors?: FieldError[]

    @Field(()=> User,{nullable:true})
    user?:User
}

@Resolver()
export class UserResolver {

 @Query(()=>User , {nullable:true})
 async me (
    @Ctx() {req, em}: MyContext
 ){
    
    console.log("get",{session:req.session})
    if(!req.session.userId){
        return null
    }
    const user =  await em.findAndCount(User , {id: req.session.userId})
    return user
 }
  
 
 @Mutation(()=> UserResponse , {nullable:true})

 async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() {em}:MyContext
  ): Promise<UserResponse|null>{
    if(options.username.length <= 3){
        return{
            errors:[{
                field:"username",
                message:"Username must greater than 3"
            }]
        } 
    }

    if(options.password.length <= 3){
        return{
            errors:[{
                field:"password",
                message:"Password must greater than 3"
            }]
        } 
    }
    const hashedPassword = await argon2.hash(options.password)
    const user = await em.create(User,{username:options.username,password:hashedPassword,createdAt:new Date(),updatedAt: new Date()});
    try {
        await em.persistAndFlush(user)
        
    } catch (error) {
       console.log(error.message) 
       if(error.code==="23505" || error.detail.includes("already exists")){
         //duplicate username error
         return{
            errors:[{
                field:"username",
                message:"username already taken"
            }]
        } 
       }
      
    }
    return {user}
  }


  @Mutation(()=> UserResponse,{nullable:true} )
  async login(
     @Arg("options") options: UsernamePasswordInput,
     @Ctx() {em,req}:MyContext //req
   ): Promise<UserResponse|null>{
     
     const user = await em.findOne(User,{username:options.username});
     if(!user){
        return{
            errors:[{
                field:"username",
                message:"User not find"
            }]
        }
     }

     const valid = await argon2.verify(user.password, options.password);

     if(!valid){
        return{
            errors:[{
                field:"password",
                message:"Incorrect password"
            }]
        }
     }
     req.session.userId = user.id
     console.log("set",{session:req.session})
     return {user}
   }
 }
