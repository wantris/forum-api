const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RegisteredComment = require('../../../Domains/comments/entities/RegisteredComment');
const RegisterComment = require('../../../Domains/comments/entities/RegisterComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ForbiddenError = require('../../../Commons/exceptions/ForbiddenError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      const registThread = {
        id: 'thread-123',
        title: ' Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({ id: registThread.owner });
      await ThreadsTableTestHelper.addThread(registThread);

      // Arrange
      const registerComment = new RegisterComment({
        content: 'lorem ipsum',
      });
      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator,
        dateGenerator);

      // Action
      const owner = 'user-123';
      const threadId = 'thread-123';
      const registeredComment = await commentRepositoryPostgres.addComment(owner,
        threadId, registerComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(registeredComment).toStrictEqual(new RegisteredComment({
        id: 'comment-123',
        content: 'lorem ipsum',
        owner: 'user-123',
      }));
    });
  });

  describe('verify Comment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        {},
      );
      await expect(
        commentRepositoryPostgres.verifyCommentExist('comment-0'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exist', async () => {
      const requestedPayload = {
        id: 'comment-123',
        threadId: 'thread-123',
        userId: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: requestedPayload.userId });
      await ThreadsTableTestHelper.addThread({ id: requestedPayload.threadId });
      await CommentsTableTestHelper.addComment({
        id: requestedPayload.id,
        threadId: requestedPayload.threadId,
        owner: requestedPayload.userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        {},
      );

      await expect(
        commentRepositoryPostgres.verifyCommentExist('comment-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('deleteComment function', () => {
    it('should throw Forbidden error when different owner', async () => {
      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const payload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await UsersTableTestHelper.addUser({ id: payload.userId });
      await ThreadsTableTestHelper.addThread({
        id: payload.threadId,
        owner: payload.userId,
      });

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        owner: payload.userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        dateGenerator,
      );
      await expect(
        commentRepositoryPostgres.deleteCommentById(
          payload.commentId,
          'user-0',
        ),
      ).rejects.toThrowError(ForbiddenError);
    });

    it('should soft delete comment from database', async () => {
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const registThread = {
        id: threadId,
        title: ' Lorem ipsum',
        body: 'Lorem ipsum',
        owner,
      };
      await UsersTableTestHelper.addUser({ id: registThread.owner });
      await ThreadsTableTestHelper.addThread(registThread);

      // Arrange
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: registThread.id,
        owner: registThread.owner,
      });
      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator,
        dateGenerator);

      const deletedComment = await commentRepositoryPostgres.deleteCommentById(commentId, owner);
      expect(Object.keys(deletedComment).length).toStrictEqual(1);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should not throw when comment exist', async () => {
      const payload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        commentId2: 'comment-124',
        date: new Date(),
      };
      const expected = [
        {
          id: 'comment-124',
          content: 'konten lorem ipsum',
          is_delete: false,
          username: 'dicoding',
          date: payload.date.toISOString(),
        },
        {
          id: 'comment-123',
          content: 'lorem ipsum',
          is_delete: false,
          username: 'dicoding',
          date: new Date(payload.date.setMinutes(payload.date.getMinutes() + 30)).toISOString(),
        },
      ];
      await UsersTableTestHelper.addUser({ id: payload.userId });
      await ThreadsTableTestHelper.addThread({
        id: payload.threadId,
        owner: payload.userId,
      });

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        thread: payload.threadId,
        owner: payload.userId,
        createdAt: expected[0].date,
        updatedAt: expected[0].date,
      });
      await CommentsTableTestHelper.addComment({
        id: payload.commentId2,
        thread: payload.threadId,
        owner: payload.userId,
        content: expected[1].content,
        createdAt: expected[1].date,
        updatedAt: expected[1].date,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        {},
      );
      const commentResult = await commentRepositoryPostgres.getCommentByThreadId(payload.threadId);
      expect(commentResult.length).toEqual(2);
      expect(commentResult).toStrictEqual([{
        content: 'lorem ipsum',
        date: expected[0].date,
        id: 'comment-123',
        is_delete: false,
        likecount: '0',
        username: 'dicoding',
      }, {
        content: 'lorem ipsum', date: expected[1].date, id: 'comment-124', is_delete: false, likecount: '0', username: 'dicoding',
      }]);
    });
  });

  describe('replyComment', () => {
    it('should persist reply comment and return added comment correctly', async () => {
      const registThread = {
        id: 'thread-123',
        title: ' Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      const repliedPayload = {
        id: 'comment-124',
        thread: registThread.id,
        owner: 'user-124',
        parentReplyId: 'comment-123',
      };

      await UsersTableTestHelper.addUser({ id: registThread.owner });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread(registThread);

      // Arrange
      const registerComment = new RegisterComment({
        content: 'lorem ipsum',
      });

      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator,
        dateGenerator);

      // Action
      const owner = 'user-123';
      const threadId = 'thread-123';
      await commentRepositoryPostgres.addComment(owner,
        threadId, registerComment);

      // Assert
      await CommentsTableTestHelper.findCommentById('comment-123');
      const repliedCommentResult = await CommentsTableTestHelper.addComment(repliedPayload);
      expect(repliedCommentResult).toHaveLength(1);
    });
  });

  describe('getReplyComment function', () => {
    it('should not throw when comment exist', async () => {
      const payload = {
        userId: 'user-123',
        userId2: 'user-124',
        threadId: 'thread-123',
        commentId: 'comment-123',
        commentId2: 'comment-124',
        date: new Date().toISOString(),
      };

      await UsersTableTestHelper.addUser({ id: payload.userId });
      await UsersTableTestHelper.addUser({ id: payload.userId2, username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({
        id: payload.threadId,
        owner: payload.userId,
      });

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        thread: payload.threadId,
        owner: payload.userId,
        createdAt: payload.date,
        updatedAt: payload.date,
      });
      await CommentsTableTestHelper.addComment({
        id: payload.commentId2,
        thread: payload.threadId,
        owner: payload.userId2,
        content: 'konten lorem ipsum',
        parentReplyId: payload.commentId,
        createdAt: payload.date,
        updatedAt: payload.date,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
        {},
      );
      const replyCommentResult = await commentRepositoryPostgres.getRepliesCommentById(
        payload.commentId,
      );
      expect(replyCommentResult).toHaveLength(1);
      expect(replyCommentResult).toStrictEqual([
        {
          content: 'konten lorem ipsum',
          date: payload.date,
          id: 'comment-124',
          is_delete: false,
          username: 'dicoding2',
        },
      ]);
    });
  });
});
