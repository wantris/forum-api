const RegisteredComment = require('../RegisteredComment');

describe('a RegisteredComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      description: 'lorem ipsum',
    };
    expect(() => new RegisteredComment(payload)).toThrowError(
      'REGISTERED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 200,
      thread_id: {},
      id: true,
      owner: {},
    };
    expect(() => new RegisteredComment(payload)).toThrowError(
      'REGISTERED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create Registered Comment object correctly', () => {
    const payload = {
      id: 'thread-123',
      thread_id: 'thread_123',
      content: 'lorem ipsum',
      owner: 'user-123',
    };

    const {
      id, content, owner,
    } = new RegisteredComment(payload);

    expect(owner).toEqual(payload.owner);
    expect(content).toEqual(payload.content);
    expect(id).toEqual(payload.id);
  });
});
