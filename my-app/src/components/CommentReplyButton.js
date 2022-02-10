const CommentReplyButton = (props) => {

    const { comment, activateReplyToThisComment } = props;

    return (
        <div 
            className="post-comment-reply-button"
            id={comment.id}
            onClick={activateReplyToThisComment}
        >
            Reply
        </div>
    );
};

export default CommentReplyButton;