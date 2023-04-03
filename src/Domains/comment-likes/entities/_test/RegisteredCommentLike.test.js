const RegisteredCommentLike = require('../RegisteredCommentLike');

describe('a RegisteredCommentLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      commentId: 'comment-123',
    };
    expect(() => new RegisteredCommentLike(payload)).toThrowError(
      'REGISTERED_COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      commentId: {},
      id: true,
      owner: {},
    };
    expect(() => new RegisteredCommentLike(payload)).toThrowError(
      'REGISTERED_COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create Registered Comment Like object correctly', () => {
    const payload = {
      id: 'comment-like-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const {
      id, commentId, owner,
    } = new RegisteredCommentLike(payload);

    expect(owner).toEqual(payload.owner);
    expect(commentId).toEqual(payload.commentId);
    expect(id).toEqual(payload.id);
  });
});
