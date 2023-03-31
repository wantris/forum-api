const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    const useCasePayload = {
      thread: 'thread-123',
    };

    const thread = {
      id: 'thread-123',
      title: 'lorem ipsum',
      body: 'lorem ipsum',
      date: new Date().toISOString(),
      username: 'fulan',
    };
    const comment = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: new Date().toISOString(),
        content: 'lorem ipsum',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding2',
        date: new Date().toISOString(),
        content: 'lorem ipsum',
        is_delete: true,
      },
    ];
    const expectedReply = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: new Date().toISOString(),
        content: 'lorem ipsum',
      },
      {
        id: 'comment-124',
        username: 'dicoding2',
        date: new Date().toISOString(),
        content: '**balasan telah dihapus**',
      },
    ];
    const expectedResult = {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: [
        {
          id: comment[0].id,
          username: comment[0].username,
          date: comment[0].date,
          content: comment[0].content,
          likeCount: 0,
          replies: expectedReply,
        },
        {
          id: comment[1].id,
          username: comment[1].username,
          date: comment[1].date,
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: expectedReply,
        },
      ],
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(useCasePayload.thread));
    mockThreadRepository.getDetailThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(thread));

    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(comment));

    mockCommentRepository.getRepliesCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(comment));

    const getThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    const useCaseResult = await getThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(
      useCasePayload,
    );
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(
      useCasePayload,
    );
    expect(useCaseResult).toEqual(expectedResult);
  });
});
