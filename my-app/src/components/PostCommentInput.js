const PostCommentInput = (props) => {

    const { message, handleChange } = props;

    return (
        <div className="post-post-comment-input">
            <input
                placeholder="Add a comment..."
                autoComplete="off"
                onChange={handleChange}
                value={message}
                id="postCommentInput"
            />
        </div>
    );
};

export default PostCommentInput;