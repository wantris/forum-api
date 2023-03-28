/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', threadId = 'thread-123', content = 'lorem ipsum', owner = 'user-123', isDelete = false, parentReplyId = null, createdAt = new Date().toISOString(), updatedAt = createdAt,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, threadId, content, owner, isDelete, parentReplyId, createdAt, updatedAt],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteCommentById({ id, owner, updatedAt = new Date().toISOString() }) {
    const query = {
      text: 'UPDATE comments SET is_delete=$1, updated_at = $2 WHERE id = $3 AND owner = $4',
      values: [true, updatedAt, id, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
