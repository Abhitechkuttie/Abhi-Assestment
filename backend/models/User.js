const { users } = require('../inMemoryStore');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(name, email, password) {
    this.id = uuidv4();
    this.name = name;
    this.email = email;
    this.password = password; // In a real app, hash this!
  }

  static findById(id) {
    return users.find(user => user.id === id);
  }

  static findOne(query) {
    if (query.email) {
      return users.find(user => user.email === query.email);
    }
    return null;
  }

  async save() {
    users.push(this);
    return this;
  }

  async comparePassword(candidatePassword) {
    return this.password === candidatePassword;
  }
}

module.exports = User;