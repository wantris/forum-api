/* eslint-disable no-new */
const RegisteredComment = require('../../../Domains/comments/entities/RegisteredComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyCommentUseCase = require('../ReplyCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('ReplyCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the reply comment action correctly', async () => {
    // Arrange
    const replyUseCasePayload = {
      content: 'konten lorem ipsum',
    };

    const threadId = 'thread-123';

    const expectedRepliedComment = new RegisteredComment({
      id: 'comment-124',
      content: replyUseCasePayload.content,
      owner: 'user-124',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** mocking needed function */
    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(new RegisteredComment({
        id: 'comment-124',
        content: replyUseCasePayload.content,
        owner: 'user-124',
      })));

    const getReplyCommentUseCase = new ReplyCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const repliedComment = await getReplyCommentUseCase.execute('comment-123', 'user-124', threadId, replyUseCasePayload);

    // Assert
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
    expect(mockCommentRepository.addComment).toBeCalledWith('user-124', 'thread-123', replyUseCasePayload, 'comment-123');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(repliedComment).toStrictEqual(expectedRepliedComment);
  });
});
