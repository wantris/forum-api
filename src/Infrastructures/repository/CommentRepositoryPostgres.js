const RegisteredComment = require('../../Domains/comments/entities/RegisteredComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ForbiddenError = require('../../Commons/exceptions/ForbiddenError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }

  async addComment(owner, threadId, registerComment, parentReplyId = null) {
    const { content } = registerComment;

    const id = `comment-${this._idGenerator()}`;
    const isDelete = false;
    const newDate = new this._dateGenerator().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, content, owner',
      values: [id, threadId, content, owner, isDelete,
        parentReplyId, newDate, newDate],
    };

    const result = await this._pool.query(query);

    return new RegisteredComment(result.rows[0]);
  }

  async verifyCommentExist(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async deleteCommentById(id, owner) {
    const newDate = new this._dateGenerator().toISOString();

    const query = {
      text: 'UPDATE comments SET is_delete=true, updated_at = $1 WHERE id = $2 AND owner=$3 RETURNING id, content, owner',
      values: [newDate, id, owner],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new ForbiddenError('tidak bisa menghapus komentar dari user lain');
    }
    return result.rows;
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.created_at as date, comments.content, comments.is_delete, users.username, COALESCE(count(comment_likes.id), 0) as likeCount  
      FROM comments
      LEFT JOIN users ON comments.owner = users.id
      left join comment_likes on comments.id = comment_likes.comment_id
      WHERE comments.thread_id = $1 AND comments.parent_reply_id IS null group by comments.id, users.username ORDER BY comments.created_at asc`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getRepliesCommentById(id) {
    const query = {
      text: `SELECT comments.id, comments.created_at as date, comments.content, comments.is_delete, users.username 
            FROM comments
            JOIN users ON comments.owner = users.id
            WHERE comments.parent_reply_id = $1 ORDER BY created_at ASC`,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
