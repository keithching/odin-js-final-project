const PostCommentButton = (props) => {

    const { handleCommentButtonClick } = props;

    const handleClick = (e) => {
        if (handleCommentButtonClick) {
            handleCommentButtonClick(e);
        } else {
            document.getElementById('postCommentInput').focus();
        }
    }

    return (
        <div>
            <div 
                className="post-post-comment-button"
                onClick={handleClick}
            >
                <i className="far fa-comment"></i>
            </div>
        </div>

    );
};

export default PostCommentButton;