const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthTestHelper = require('../../../../tests/AuthTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when not authorize', async () => {
      const payload = {
        title: 'lorem ipsum',
        body: 'lorem ipsum',
      };

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads',
        method: 'POST',
        payload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'lorem ipsum',
        body: 'lorem ipsum',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'lorem ipsum',
      };
      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: true,
      };
      const accessToken = await AuthTestHelper.getAccessToken();
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should return 404 when thread not found', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        url: '/threads/thread-123',
        method: 'GET',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should return 200 when thread exist', async () => {
      const date = new Date();
      const payload = {
        id: 'thread-123',
        title: 'lorem ipsum',
        body: 'lorem ipsum',
        owner: 'user-124',
        createdAt: date.toISOString(),
      };

      const userPayload = [
        {
          id: 'user-123',
          username: 'jhondoe',
        },
        {
          id: 'user-124',
          username: 'dicoding',
        },
      ];

      const commentPayload = [
        {
          id: 'comment-123',
          owner: 'user-123',
          content: 'lorem ipsum',
          thread: 'thread-123',
          isDelete: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'comment-124',
          owner: 'user-124',
          thread: 'thread-123',
          content: 'konten lorem ipsum',
          isDelete: true,
          createdAt: new Date(date.setMinutes(date.getMinutes() + 5)).toISOString(),
        },
      ];
      const expectedComments = [
        {
          id: commentPayload[0].id,
          username: 'jhondoe',
          content: commentPayload[0].content,
          date: commentPayload[0].createdAt,
          likeCount: 0,
          replies: [],
        },
        {
          id: commentPayload[1].id,
          username: 'dicoding',
          content: '**komentar telah dihapus**',
          date: commentPayload[1].createdAt,
          likeCount: 0,
          replies: [],
        },
      ];
      const expectedData = {
        id: payload.id,
        title: payload.title,
        body: payload.body,
        date: payload.createdAt,
      };
      const expectedDetailThread = {
        ...expectedData,
        username:
          payload.username === userPayload[0].id
            ? userPayload[0].username
            : userPayload[1].username,
        comments: expectedComments,
      };
      await UsersTableTestHelper.addUser(userPayload[0]);
      await UsersTableTestHelper.addUser(userPayload[1]);
      await ThreadsTableTestHelper.addThread(payload);
      await CommentsTableTestHelper.addComment(commentPayload[0]);
      await CommentsTableTestHelper.addComment(commentPayload[1]);

      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123',
        method: 'GET',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toEqual(expectedDetailThread);
    });
  });
});
