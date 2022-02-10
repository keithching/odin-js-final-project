const PostCommentButton = () => {
    
    const handleClick = () => {
        document.getElementById('postCommentInput').focus();
    }
    
    return (
        <div 
            className="post-post-comment-button"
            onClick={handleClick}
        >
            <i className="far fa-comment"></i>
        </div>
    );
};

export default PostCommentButton;