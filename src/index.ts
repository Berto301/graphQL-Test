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
import { UserResolver } from "./resolvers/user";
import  { createClient } from 'redis'
import  session from "express-session"
import connectRedis from "connect-redis"
import { MyContext } from "./types";



const main = async ()=>{
    const corsOptions = { origin: ["https://studio.apollographql.com"], credentials: true }
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


    let RedisStore = connectRedis(session)
    let redisClient = createClient({ legacyMode: true }) as any //
    await redisClient.connect().catch(console.error)
   
    app.use(
        session({
            name:"qid",
            store: new RedisStore({client:redisClient,disableTTL:true,disableTouch:true}),
            cookie:{
                maxAge:1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly:true,
                sameSite:"lax",
                secure : __prod__ // cookies only works in https,

            },
            secret:"graph_test",
            saveUninitialized:false,
            resave:false,
        }),
    
    )
    
    const apolloServer = new ApolloServer({
        cache:"bounded",
        csrfPrevention:true,
        schema: await buildSchema({
            resolvers:[HelloResolver,PostResolver,UserResolver],
            validate:false
        }),
        context: ({req,res}): MyContext => ({em: orm.em,req, res}),
        
    })
    // app.get('/',(_,res)=>{
    //     res.send("hello")
    // })
    await apolloServer.start()
    await apolloServer.applyMiddleware({app, path:"/graphql", cors:corsOptions});
    await app.listen(4000,()=>{
        console.log('Server running on port 4000');
    })
}
main().catch(err => console.error(err));