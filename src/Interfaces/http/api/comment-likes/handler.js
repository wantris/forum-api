const AddCommentLikeUseCase = require('../../../../Applications/use_case/AddCommentLikeUseCase');

class CommentLikesHandler {
  constructor(container) {
    this._container = container;

    this.postAddLikeHandler = this.postAddLikeHandler.bind(this);
  }

  async postAddLikeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const owner = request.auth.credentials.id;
    const addCommentLikeUseCase = this._container.getInstance(AddCommentLikeUseCase.name);
    await addCommentLikeUseCase.execute(owner, commentId, threadId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentLikesHandler;
