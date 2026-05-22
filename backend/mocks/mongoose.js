const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');

function readData() {
  try {
    if (!fs.existsSync(dbPath)) {
      const initial = {
        users: [], doctors: [], appointments: [],
        prescriptions: [], inventories: [], notifications: [],
        healthrecords: [], consultations: []
      };
      fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const content = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(content || '{}');
    // Ensure all collections exist
    ['users','doctors','appointments','prescriptions','inventories','notifications','healthrecords','consultations'].forEach(col => {
      if (!data[col]) data[col] = [];
    });
    return data;
  } catch (error) {
    console.error('Mock DB Read Error:', error);
    return { users: [], doctors: [], appointments: [], prescriptions: [], inventories: [], notifications: [], healthrecords: [], consultations: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Mock DB Write Error:', error);
  }
}

// Simple query matching with basic operators
function matchesQuery(item, query) {
  for (const key in query) {
    const qVal = query[key];
    if (qVal && typeof qVal === 'object') {
      if (qVal.$in) {
        if (!qVal.$in.includes(item[key])) return false;
      } else if (qVal.$regex) {
        const regex = new RegExp(qVal.$regex, qVal.$options || '');
        if (!regex.test(item[key])) return false;
      } else if (qVal.$gt !== undefined && !(item[key] > qVal.$gt)) return false;
      else if (qVal.$gte !== undefined && !(item[key] >= qVal.$gte)) return false;
      else if (qVal.$lt !== undefined && !(item[key] < qVal.$lt)) return false;
      else if (qVal.$ne !== undefined && item[key] === qVal.$ne) return false;
    } else {
      if (item[key] !== qVal) return false;
    }
  }
  return true;
}

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
  }
  plugin(fn, opts) {}
}

const modelCache = {};

function createModel(modelName, schema) {
  const collectionName = modelName.toLowerCase() + 's';

  class MockModel {
    constructor(data) {
      Object.assign(this, data);
      if (!this._id) {
        this._id = 'mock_' + Math.random().toString(36).substr(2, 9);
      }
      if (!this.createdAt) this.createdAt = new Date().toISOString();
    }

    static async find(query = {}) {
      const db = readData();
      const items = db[collectionName] || [];
      const filtered = items.filter(item => matchesQuery(item, query));
      return filtered.map(item => new MockModel(item));
    }

    static async findOne(query = {}) {
      const results = await MockModel.find(query);
      return results[0] || null;
    }

    static async findById(id) {
      const db = readData();
      const items = db[collectionName] || [];
      const match = items.find(item => item._id === id);
      return match ? new MockModel(match) : null;
    }

    static async findByIdAndUpdate(id, update, options = {}) {
      const db = readData();
      if (!db[collectionName]) db[collectionName] = [];
      const items = db[collectionName];
      const index = items.findIndex(item => item._id === id);
      if (index === -1) return null;
      // Handle $set operator
      const updateData = update.$set ? { ...items[index], ...update.$set } : { ...items[index], ...update };
      updateData._id = id;
      items[index] = updateData;
      writeData(db);
      return new MockModel(options.new ? updateData : items[index]);
    }

    static async findByIdAndDelete(id) {
      const db = readData();
      if (!db[collectionName]) return null;
      const index = db[collectionName].findIndex(item => item._id === id);
      if (index === -1) return null;
      const deleted = db[collectionName].splice(index, 1)[0];
      writeData(db);
      return new MockModel(deleted);
    }

    static async updateMany(query, update) {
      const db = readData();
      if (!db[collectionName]) return { modifiedCount: 0 };
      let modifiedCount = 0;
      db[collectionName] = db[collectionName].map(item => {
        if (matchesQuery(item, query)) {
          modifiedCount++;
          const updateData = update.$set ? { ...item, ...update.$set } : { ...item, ...update };
          return updateData;
        }
        return item;
      });
      writeData(db);
      return { modifiedCount };
    }

    static async countDocuments(query = {}) {
      const results = await MockModel.find(query);
      return results.length;
    }

    async save() {
      const db = readData();
      if (!db[collectionName]) db[collectionName] = [];
      const items = db[collectionName];
      const index = items.findIndex(item => item._id === this._id);
      const plainObj = { ...this };
      delete plainObj.save;
      delete plainObj.deleteOne;
      delete plainObj.remove;
      if (index !== -1) {
        items[index] = plainObj;
      } else {
        items.push(plainObj);
      }
      writeData(db);
      return this;
    }

    async deleteOne() {
      const db = readData();
      if (db[collectionName]) {
        db[collectionName] = db[collectionName].filter(item => item._id !== this._id);
        writeData(db);
      }
      return { deletedCount: 1 };
    }

    async remove() { return this.deleteOne(); }
  }

  MockModel.modelName = modelName;
  return MockModel;
}

const mongooseMock = {
  Schema,
  model(name, schema) {
    if (!modelCache[name]) {
      modelCache[name] = createModel(name, schema);
    }
    return modelCache[name];
  },
  connect(uri, options) {
    console.log(`[Mock Mongoose] Simulating connection to: ${uri}`);
    readData();
    return Promise.resolve(true);
  },
  connection: {
    once(event, callback) {
      if (event === 'open') setTimeout(() => callback(), 100);
      return this;
    },
    on(event, callback) { return this; }
  }
};

module.exports = mongooseMock;
