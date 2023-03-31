/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addLike({
    id = 'comment-like-123', commentId = 'comment-123', owner = 'user-123', createdAt = new Date().toISOString(), updatedAt = createdAt,
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, commentId, owner, createdAt, updatedAt],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async findCommentLike(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteCommentLike({ commentId, owner }) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;
