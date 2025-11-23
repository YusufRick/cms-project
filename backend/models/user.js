// User model - can be adapted for MongoDB/MySQL/PostgreSQL

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.password = data.password;
    this.role = data.role; // 'consumer', 'helpdesk', 'support', 'admin'
    this.organization = data.organization; // 'bank', 'airline', 'telecom'
    this.createdAt = data.createdAt || new Date();
  }

  // Static methods for database operations
  static async findByEmail(email) {
    // TODO: Implement database query
    // Example: return await db.users.findOne({ email });
    return null;
  }

  static async findById(id) {
    // TODO: Implement database query
    return null;
  }

  static async create(userData) {
    // TODO: Implement database insert
    return new User(userData);
  }

  static async update(id, userData) {
    // TODO: Implement database update
    return null;
  }

  static async delete(id) {
    // TODO: Implement database delete
    return true;
  }

  static async findAll(filters = {}) {
    // TODO: Implement database query with filters
    return [];
  }
}

module.exports = User;
