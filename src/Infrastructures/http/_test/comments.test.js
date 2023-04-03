const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthTestHelper = require('../../../../tests/AuthTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadid}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadid}/comments', () => {
    it('should response 401 when not authorize', async () => {
      const payload = {
        content: 'lorem ipsum',
      };

      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread(thread);

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      const payload = {
        content: 'Lorem ipsum',
      };

      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: '/threads/thread-0/comments',
        method: 'POST',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        content: 'lorem ipsum',
      };
      const threadPayload = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: threadPayload.owner });
      await ThreadsTableTestHelper.addThread(threadPayload);
      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        owner: 'user-123',
      };
      const threadPayload = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: threadPayload.owner });
      await ThreadsTableTestHelper.addThread(threadPayload);
      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });
  });

  describe('when DELETE /threads/{threadid}/comments/{commentId}', () => {
    it('should response 401 when not authorize', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      const server = await createServer(container);
      const responseDelete = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
      });

      const responseJsonDelete = JSON.parse(responseDelete.payload);
      expect(responseJsonDelete.statusCode).toEqual(401);
      expect(responseJsonDelete.message).toEqual('Missing authentication');
    });

    it('should response 404 when comment not found', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: thread.owner });
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: `/threads/${thread.id}/comments/comment-0`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 403 when user delete another user comment', async () => {
      const accessToken = await AuthTestHelper.getAccessToken();
      await UsersTableTestHelper.addUser({ id: 'user-1234' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-1234',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-1234',
      });
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 200', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: thread.owner });
      await ThreadsTableTestHelper.addThread(thread.id, thread.owner);
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: thread.owner });

      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: `/threads/${thread.id}/comments/comment-123`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when POST /threads/{threadid}/comments/{commendId}/replies', () => {
    it('should response 401 when not authorize', async () => {
      const payload = {
        content: 'lorem ipsum',
      };

      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies',
        method: 'POST',
        payload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      const payload = {
        content: 'Lorem ipsum',
      };

      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: '/threads/thread-0/comments/comment-123/replies',
        method: 'POST',
        payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'lorem ipsum',
      };
      const threadPayload = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: threadPayload.owner });
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        owner: 'user-123',
      };
      const threadPayload = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: threadPayload.owner });
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });
  });

  describe('when DELETE /threads/{threadid}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when not authorize', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'fulan' });
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', parentReplyId: 'comment-123', owner: 'user-124' });

      const server = await createServer(container);
      const responseDelete = await server.inject({
        url: `/threads/${thread.id}/comments/comment-123/replies/comment-124`,
        method: 'DELETE',
      });

      const responseJsonDelete = JSON.parse(responseDelete.payload);
      expect(responseJsonDelete.statusCode).toEqual(401);
      expect(responseJsonDelete.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'fulan' });
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', parentReplyId: 'comment-123', owner: 'user-124' });

      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: '/threads/thread-124/comments/comment-0/replies/comment-124',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 403 when user delete another user comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'fulan' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', parentReplyId: 'comment-123', owner: 'user-124' });
      const server = await createServer(container);
      const accessToken = await AuthTestHelper.getAccessToken();
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123/replies/comment-124',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 200', async () => {
      // Arrange
      const thread = {
        id: 'thread-123',
        title: 'Lorem ipsum',
        body: 'Lorem ipsum',
        owner: 'user-123',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'fulan' });
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment({ id: 'comment-124' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', parentReplyId: 'comment-123', owner: 'user-124' });

      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: `/threads/${thread.id}/comments/comment-123/replies/comment-124`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
