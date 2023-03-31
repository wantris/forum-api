class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(id, owner, threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(id);
    await this._commentRepository.deleteCommentById(id, owner);
  }
}

module.exports = DeleteCommentUseCase;
