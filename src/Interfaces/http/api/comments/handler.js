const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const ReplyCommentUseCase = require('../../../../Applications/use_case/ReplyCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postAddCommentHandler = this.postAddCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyCommentHandler = this.postReplyCommentHandler.bind(this);
    this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
  }

  async postAddCommentHandler(request, h) {
    const { threadId } = request.params;
    const owner = request.auth.credentials.id;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(owner,
      threadId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { threadId, commentId } = request.params;
    const owner = request.auth.credentials.id;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(commentId,
      owner, threadId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async postReplyCommentHandler(request, h) {
    const { commentId, threadId } = request.params;
    const owner = request.auth.credentials.id;
    const replyCommentUseCase = this._container.getInstance(ReplyCommentUseCase.name);
    const addedReply = await replyCommentUseCase.execute(commentId, owner,
      threadId, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyCommentHandler(request, h) {
    const { threadId, replyId } = request.params;
    const owner = request.auth.credentials.id;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute(replyId,
      owner, threadId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
