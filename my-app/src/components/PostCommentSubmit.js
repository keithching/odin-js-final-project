const PostCommentSubmit = (props) => {

    const { message, handleSubmit } = props;

    return (
        <button 
            className="post-post-comment-submit"
            disabled={message === '' ? true : false}
            onClick={handleSubmit}
        >
            Post
        </button>
    );
};

export default PostCommentSubmit;