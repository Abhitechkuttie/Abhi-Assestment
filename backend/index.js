const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');

const { typeDefs, resolvers } = require('./schema');
const { verifyToken } = require('./auth');
require('dotenv').config();

const app = express();

app.use(cors());



const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    if (token) {
      const user = verifyToken(token.replace('Bearer ', ''));
      return { user };
    }
    return {};
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startServer();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
);
