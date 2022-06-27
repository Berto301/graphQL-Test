import "reflect-metadata"
import {MikroORM} from "@mikro-orm/core"
//import { Post } from "./entities/Post";
import {__prod__} from "./helper/constants"
import mikroOrmConfig from "./mikro-orm.config";
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";

const main = async ()=>{
    const orm = await MikroORM.init(mikroOrmConfig);
     await orm.getMigrator().up();
    // const post =  orm.em.fork({}).create(Post, {
    //     title: "ez az első posztom hehe",
    //     updatedAt: new Date(),
    //     createdAt: new Date()
    // });
    // await orm.em.persistAndFlush(post)
    // console.log('---------------------------sql 2-----------------------');
    // await orm.em.nativeInsert(Post, {title: 'my first post 2',updatedAt: new Date(),
    // createdAt: new Date()});

    // const posts = await orm.em.find(Post,{})
    // console.log(posts)

    const app = express() // create a server
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers:[HelloResolver,PostResolver],
            validate:false
        }),
        context: ()=> ({em: orm.em})
    })
    // app.get('/',(_,res)=>{
    //     res.send("hello")
    // })
    await apolloServer.start()
    await apolloServer.applyMiddleware({app});
    await app.listen(4000,()=>{
        console.log('Server running on port 4000');
    })
}
main().catch(err => console.error(err));