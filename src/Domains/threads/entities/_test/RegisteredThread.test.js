const RegisteredThread = require('../RegisteredThread');

describe('a RegisteredThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      description: 'abc',
      title: 'cde',
    };
    expect(() => new RegisteredThread(payload)).toThrowError(
      'REGISTERED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });
  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 200,
      body: {},
      id: true,
      owner: {},
    };
    expect(() => new RegisteredThread(payload)).toThrowError(
      'REGISTERED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create Registered Thread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'lorem ipsum',
      body: 'lorem ipsum',
      owner: 'user-123',
    };

    const {
      id, title, owner,
    } = new RegisteredThread(payload);

    expect(owner).toEqual(payload.owner);
    expect(title).toEqual(payload.title);
    expect(id).toEqual(payload.id);
  });
});
