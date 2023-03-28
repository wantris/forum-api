const RegisteredThread = require('../../Domains/threads/entities/RegisteredThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addThread(owner, registerThread) {
    const { title, body } = registerThread;
    const newDate = new this._dateGenerator().toISOString();

    const id = `thread-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, title, body, owner, newDate, newDate],
    };

    const result = await this._pool.query(query);

    return new RegisteredThread({ ...result.rows[0] });
  }

  async verifyThreadExist(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getDetailThread(id) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.created_at as date, users.username 
              FROM threads
              LEFT JOIN users ON threads.owner = users.id
              WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal mendapatkan Detail Thread');
    }
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
