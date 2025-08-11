const { gql, AuthenticationError } = require("apollo-server-express");
const User = require("./models/User");
const Todo = require("./models/Todo");
const { generateToken } = require("./auth");

const typeDefs = gql`
  type Query {
    me: User
    getTodos: [Todo]
    getAllTodos: [Todo]
    getTodo(id: ID!): Todo
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createTodo(title: String!, description: String): Todo
    updateTodo(
      id: ID!
      title: String
      description: String
      completed: Boolean
    ): Todo
    deleteTodo(id: ID!): String
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Todo {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    createdAt: String!
    user: User!
  }
`;

const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      return User.findById(user.id);
    },
    getTodos: (_, __, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      return Todo.find({ user: user.id });
    },
    getAllTodos: (_, __, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      return Todo.find();
    },
    getTodo: (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      const todo = Todo.findById(id);
      if (!todo) throw new Error("Todo not found");
      if (todo.user !== user.id) {
        throw new AuthenticationError("Not authorized");
      }
      return todo;
    },
  },
  Mutation: {
    signup: async (parent, { name, email, password }) => {
      const existingUser = User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }
      const user = new User(name, email, password);
      await user.save();
      const token = generateToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = User.findOne({ email });
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }
      const token = generateToken(user);
      return { token, user };
    },
    createTodo: async (_, { title, description }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      const todo = new Todo(title, description, user.id);
      await todo.save();
      return todo;
    },
    updateTodo: (_, { id, title, description, completed }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      const todo = Todo.findById(id);
      if (!todo) throw new Error("Todo not found");
      if (todo.user !== user.id) {
        throw new AuthenticationError("Not authorized");
      }
      const updatedTodo = Todo.findByIdAndUpdate(
        id,
        { title, description, completed }
      );
      if (!updatedTodo) throw new Error("Todo not found");
      return updatedTodo;
    },
    deleteTodo: (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");
      const todo = Todo.findById(id);
      if (!todo) throw new Error("Todo not found");
      if (todo.user !== user.id) {
        throw new AuthenticationError("Not authorized");
      }
      Todo.findByIdAndDelete(id);
      return "Todo deleted successfully";
    },
  },
  Todo: {
    user: (todo) => {
      return User.findById(todo.user);
    },
  },
};

module.exports = { typeDefs, resolvers };

module.exports = { typeDefs, resolvers };

/*
# Signup
mutation {
  signup(name: "John", email: "john@example.com", password: "test123") {
    token
    user {
      id
      name
      email
    }
  }
}

# Login
mutation {
  login(email: "john@example.com", password: "test123") {
    token
    user {
      id
      name
      email
    }
  }
}

# Me Query
query {
  me {
    id
    name
    email
  }
}
*/
