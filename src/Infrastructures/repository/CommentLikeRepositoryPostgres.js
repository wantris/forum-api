const CommentLikeRepository = require('../../Domains/comment-likes/CommentLikeRepository');
const RegisteredCommentLike = require('../../Domains/comment-likes/entities/RegisteredCommentLike');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addLike(owner, commentId) {
    const id = `comment-like-${this._idGenerator()}`;
    const newDate = new this._dateGenerator().toISOString();
    const query = {
      text: 'INSERT INTO comment_likes VALUES($1, $2, $3, $4, $5) RETURNING id, comment_id as "commentId", owner',
      values: [id, commentId, owner, newDate, newDate],
    };

    const result = await this._pool.query(query);
    return new RegisteredCommentLike({ ...result.rows[0] });
  }

  async verifyCommentLikeExist(owner, commentId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async deleteCommentLike(owner, commentId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2 RETURNING id',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = CommentLikeRepositoryPostgres;
