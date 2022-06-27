import { MikroORM } from "@mikro-orm/core"; //Options
import { Post } from "./entities/Post";
import { __prod__ } from "./helper/constants";
import path from "path";

// const config : Options= {
//     entities:[
//         Post
//     ],
//     dbName:"test",
//     user:"berto",
//     password:"root",
//     debug:!__prod__,
//     type:"postgresql"
//   };
// export default config;
export default {
    migrations:{
      path: path.join(__dirname,'./migrations'), 
      pattern:/^[\w-]+\d+\.[tj]s$/
    },
      entities:[
        Post
    ],
    dbName:"test",
    user:"berto",
    password:"root",
    debug:!__prod__,
    type:"postgresql",
    // replicas: [
    //   { user: 'postgres', host: 'localhost', port: 5433 },
    //   //{ user: 'berto', host: 'localhost', port: 5432 }
    // ],
    allowGlobalContext: true
} as Parameters <typeof MikroORM.init> [0]