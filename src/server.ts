import path from "path"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import cors from "@fastify/cors"
import swagger from "@fastify/swagger"
import fStatic from "@fastify/static"
import fJwt from '@fastify/jwt'
import { version } from "../package.json"

// Route imports
import statusRoutes from "./modules/status/status.routes"
import bookRoutes from "./modules/books/books.routes"
import catFactRoutes from "./modules/catFacts/catFacts.routes"
import jokeRoutes from "./modules/jokes/jokes.routes"
import nbaTeamRoutes from "./modules/nbaTeams/nbaTeams.routes"
import oldGameRoutes from "./modules/oldGames/oldGames.routes"

// Schema imports
import { statusSchemas } from "./modules/status/status.schema"
import { bookSchemas } from "./modules/books/books.schema"
import { catFactSchemas } from "./modules/catFacts/catFacts.schema"
import { jokeSchemas } from "./modules/jokes/jokes.schema"
import { nbaTeamSchemas } from "./modules/nbaTeams/nbaTeams.schema"
import { oldGameSchemas } from "./modules/oldGames/oldGames.schema"

const allSchemas = [
  ...statusSchemas,
  ...bookSchemas,
  ...catFactSchemas,
  ...jokeSchemas,
  ...nbaTeamSchemas,
  ...oldGameSchemas
]

// Main startup
function buildServer() {
  const server = Fastify()

  // Register CORS
  server.register(cors, {
    origin: "*"
  })

  // Register JWT
  server.register(fJwt, {
    secret: process.env.JWT_SECRET as string
  })

  // By default, JWT plugin adds We add an "authenticate" decorator so we can add jwt to routes manually
  server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.send(err)
    }
  })

  // Register schemas so they can be referenced in our routes
  for (const schema of allSchemas) {
    server.addSchema(schema)
  }

  // Register and generate swagger docs
  server.register(swagger, {
    swagger: {
      info: {
        title: "Noroff API",
        description: "Noroff API to be used in assignments",
        version
      },
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "status", description: "Health check endpoint" },
        { name: "books", description: "Books related endpoints" },
        { name: "cat-facts", description: "Cat Facts related endpoints" },
        { name: "jokes", description: "Jokes related endpoints" },
        { name: "nba-teams", description: "NBA teams related endpoints" },
        { name: "old-games", description: "Old games related endpoints" }
      ]
    },
    routePrefix: "/docs",
    exposeRoute: true,
    staticCSP: true
  })

  // Register static serving of files
  server.register(fStatic, {
    root: path.join(__dirname, "public")
  })

  // Register all routes along with their given prefix
  server.register(statusRoutes, { prefix: "status" })
  server.register(bookRoutes, { prefix: "api/v1/books" })
  server.register(catFactRoutes, { prefix: "api/v1/cat-facts" })
  server.register(jokeRoutes, { prefix: "api/v1/jokes" })
  server.register(nbaTeamRoutes, { prefix: "api/v1/nba-teams" })
  server.register(oldGameRoutes, { prefix: "api/v1/old-games" })

  return server
}

export default buildServer
