class AddCommentLikeUseCase {
  constructor({ commentLikeRepository, commentRepository, threadRepository }) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(owner, commentId, threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(commentId);
    const like = await this._commentLikeRepository.verifyCommentLikeExist(owner, commentId);
    if (like > 0) {
      await this._commentLikeRepository.deleteCommentLike(owner, commentId);
    } else {
      await this._commentLikeRepository.addLike(owner, commentId);
    }
  }
}

module.exports = AddCommentLikeUseCase;
