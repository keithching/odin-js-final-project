const CommentLikedBy = (props) => {

    const { likedBy } = props;

    return (
        <div className="post-comment-liked-by">
            {likedBy.length === 0 ? '' :
            likedBy.length === 1 ? `${likedBy.length} like` :
            `${likedBy.length} likes`}
        </div>
    );
}

export default CommentLikedBy;