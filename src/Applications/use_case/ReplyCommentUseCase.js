const RegisterComment = require('../../Domains/comments/entities/RegisterComment');

class ReplyCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(id, owner, threadId, useCasePayload) {
    const registerComment = new RegisterComment(useCasePayload);
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(id);
    return this._commentRepository.addComment(owner, threadId, registerComment, id);
  }
}

module.exports = ReplyCommentUseCase;
