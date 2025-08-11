const { todos } = require("../inMemoryStore");
const { v4: uuidv4 } = require("uuid");

class Todo {
  constructor(title, description, user) {
    this.id = uuidv4();
    this.title = title;
    this.description = description;
    this.completed = false;
    this.createdAt = new Date().toISOString();
    this.user = user; // user ID
  }

  static find(query) {
    if (query && query.user) {
      return todos
        .filter((todo) => todo.user === query.user)
        .filter((todo) => todo);
    }
    return todos;
  }

  static findById(id) {
    return todos.find((todo) => todo.id === id);
  }

  static findByIdAndUpdate(id, updates) {
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    if (todoIndex > -1) {
      Object.assign(todos[todoIndex], updates);
      return todos[todoIndex];
    }
    return null;
  }

  static findByIdAndDelete(id) {
    const initialLength = todos.length;
    const newTodos = todos
      .filter((todo) => todo.id !== id)
      ?.filter((task) => task);
    todos.splice(0, todos.length, ...newTodos); // Mutate original array
    return todos.length < initialLength;
  }

  async save() {
    todos.push(this);
    return this;
  }
}

module.exports = Todo;
