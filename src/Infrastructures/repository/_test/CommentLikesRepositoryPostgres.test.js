const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const RegisteredCommentLike = require('../../../Domains/comment-likes/entities/RegisteredCommentLike');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentLike function', () => {
    it('should persist add comment like and return added comment like correctly', async () => {
      // Arrange
      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator,
        dateGenerator);

      // Action
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: ' Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await commentLikeRepositoryPostgres.addLike('user-124', 'comment-123');

      // Assert
      const like = await CommentLikesTableTestHelper.findCommentLike('comment-123', 'user-124');
      expect(like).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const fakeIdGenerator = () => '123'; // stub!
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator,
        dateGenerator);

      // Action
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await UsersTableTestHelper.addUser({ id: 'user-125', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: ' Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const reegisteredCommentLike = await commentLikeRepositoryPostgres.addLike('user-125', 'comment-123');
      const like = await CommentLikesTableTestHelper.findCommentLike('comment-123', 'user-125');

      // Assert
      expect(like).toHaveLength(1);
      expect(reegisteredCommentLike).toStrictEqual(new RegisteredCommentLike({
        id: 'comment-like-123',
        commentId: 'comment-123',
        owner: 'user-125',
      }));
    });
  });

  describe('verifyCommentLike function', () => {
    it('should return zero when comment like not found', async () => {
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {},
        {},
      );

      const like = await commentLikeRepositoryPostgres.verifyCommentLikeExist('user-124', 'comment-124');
      expect(like).toEqual(0);
    });

    it('should not throw NotFoundError when comment like exist', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'comment-like-123', owner: 'user-124' });
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {},
        {},
      );

      const like = await commentLikeRepositoryPostgres.verifyCommentLikeExist('user-124', 'comment-123');
      expect(like).toEqual(1);
    });
  });

  describe('deleteCommentLike function', () => {
    it('should persist delete comment like and return deleted comment like correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'comment-like-123', owner: 'user-124' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {},
        {},
      );

      const deletedLike = await commentLikeRepositoryPostgres.deleteCommentLike('user-124', 'comment-123');
      expect(deletedLike).toBeInstanceOf(Object);
    });

    it('should return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'comment-like-123', owner: 'user-124' });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {},
        {},
      );

      const deletedLike = await commentLikeRepositoryPostgres.deleteCommentLike('user-124', 'comment-123');
      expect(deletedLike).toEqual({
        id: 'comment-like-123',
      });
    });
  });
});
