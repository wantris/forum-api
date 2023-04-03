class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExist(useCasePayload);
    const thread = await this._threadRepository.getDetailThread(useCasePayload);
    thread.comments = await this._commentRepository.getCommentByThreadId(
      useCasePayload,
    );
    // thread.comments = this._checkIsCommentDeleted(thread.comments);
    thread.comments = await this._checkIsCommentDeleted(thread.comments);

    return thread;
  }

  async _checkIsCommentDeleted(comment) {
    const dataComments = [];
    await Promise.all(comment.map(async (data) => {
      let replies = await this._commentRepository.getRepliesCommentById(
        data.id,
      );
      replies = this._checkIsReplyCommentDeleted(replies);

      const dataComment = {
        id: data.id,
        date: data.date,
        content: data.is_delete
          ? '**komentar telah dihapus**'
          : data.content,
        username: data.username,
        likeCount: parseInt(data.likecount, 10) || 0,
        replies,
      };

      dataComments.push(dataComment);
    }));

    return dataComments;
  }

  _checkIsReplyCommentDeleted(replies) {
    const dataReplies = [];
    replies.forEach((object) => {
      const data = {
        id: object.id,
        date: object.date,
        content: object.is_delete
          ? '**balasan telah dihapus**'
          : object.content,
        username: object.username,
      };
      dataReplies.push(data);
    });

    return dataReplies;
  }
}

module.exports = GetDetailThreadUseCase;
