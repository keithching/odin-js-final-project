const CommentLikeButton = (props) => {
    const { commentIsLiked, likeComment, comment } = props;


    return (
        <div 
            className="post-comment-like-button" 
            id={`commentLikeBtn-for-${comment.id}`}
            onClick={likeComment}
        >
            {commentIsLiked ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>}
        </div>
    );
};

export default CommentLikeButton;