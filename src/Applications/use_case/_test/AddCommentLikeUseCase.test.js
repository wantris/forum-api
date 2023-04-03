const RegisteredCommentLike = require('../../../Domains/comment-likes/entities/RegisteredCommentLike');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikeRepository = require('../../../Domains/comment-likes/CommentLikeRepository');
const AddCommentLikeUseCase = require('../AddCommentLikeUseCase');

describe('AddCommentLikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment like action correctly', async () => {
    // Arrange
    const owner = 'user-124';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    /** creating use case instance */
    const getCommentLikeUseCase = new AddCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentLikeRepository.verifyCommentLikeExist = jest.fn()
      .mockImplementation(() => Promise.resolve(0));

    mockCommentLikeRepository.deleteCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** mocking needed function */
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve(new RegisteredCommentLike({
        id: 'comment-like-123',
        commentId: 'comment-123',
        owner: 'user-124',
      })));

    // Action
    await getCommentLikeUseCase.execute(owner, commentId, threadId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(commentId);
    expect(mockCommentLikeRepository.verifyCommentLikeExist).toBeCalledWith(owner, commentId);
    expect(mockCommentLikeRepository.deleteCommentLike).not.toBeCalled();
    expect(mockCommentLikeRepository.addLike).toBeCalledWith(owner, commentId);
  });

  it('should orchestrating the delete comment like action correctly', async () => {
    // Arrange
    const owner = 'user-124';
    const commentId = 'comment-123';
    const threadId = 'thread-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    /** creating use case instance */
    const getCommentLikeUseCase = new AddCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentLikeRepository.verifyCommentLikeExist = jest.fn()
      .mockImplementation(() => Promise.resolve(1));

    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentLikeRepository.deleteCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-like-123' }));

    /** mocking needed function */

    // Action
    await getCommentLikeUseCase.execute(owner, commentId, threadId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(commentId);
    expect(mockCommentLikeRepository.verifyCommentLikeExist).toBeCalledWith(owner, commentId);
    expect(mockCommentLikeRepository.deleteCommentLike).toBeCalledWith(owner, commentId);
  });
});
