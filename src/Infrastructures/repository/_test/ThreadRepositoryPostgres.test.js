const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RegisteredThread = require('../../../Domains/threads/entities/RegisteredThread');
const RegisterThread = require('../../../Domains/threads/entities/RegisterThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const registerThread = new RegisterThread({
        title: 'lorem ipsum',
        body: 'lorem ipsum',
      });
      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator,
        dateGenerator);

      // Action
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await threadRepositoryPostgres.addThread(owner, registerThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const registerThread = new RegisterThread({
        title: 'lorem ipsum',
        body: 'lorem ipsum',
      });
      function dateGenerator() {
        this.toISOString = () => new Date().toISOString().slice(0, 10);
      }
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator,
        dateGenerator);

      // Action
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      const registeredThread = await threadRepositoryPostgres.addThread(
        owner,
        registerThread,
      );

      // Assert
      expect(registeredThread).toStrictEqual(new RegisteredThread({
        id: 'thread-123',
        title: 'lorem ipsum',
        owner: 'user-123',
      }));
    });
  });

  describe('verify Thread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {},
      );
      await expect(
        threadRepositoryPostgres.verifyThreadExist('thread-0'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exist', async () => {
      const payload = {
        id: 'thread-123',
        title: 'lorem ipsum',
        body: 'lorem ipsum',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({ id: payload.owner });
      await ThreadsTableTestHelper.addThread(payload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {},
      );

      await expect(
        threadRepositoryPostgres.verifyThreadExist('thread-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getDetailThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {},
      );
      await expect(
        threadRepositoryPostgres.getDetailThread('thread-0'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exist', async () => {
      const payload = {
        id: 'thread-123',
        title: 'lorem ipsum',
        body: 'lorem ipsum',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({ id: payload.owner });
      await ThreadsTableTestHelper.addThread(payload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {},
      );

      await expect(
        threadRepositoryPostgres.getDetailThread('thread-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      const date = new Date().toISOString();
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', createdAt: date });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {},
      );

      const thread = await threadRepositoryPostgres.getDetailThread('thread-123');
      expect(thread).toEqual({
        body: 'lorem ipsum',
        date,
        id: 'thread-123',
        title: 'lorem ipsum',
        username: 'dicoding',
      });
    });
  });
});
