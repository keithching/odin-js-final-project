const PostSaveButton = (props) => {
    const { post, isSaved, savePost } = props;

    return (
        <div 
            className="post-post-save-button"
            id={`postSaveBtn-for-${post.id}`}
            onClick={savePost}
        >
            {isSaved ? <i className="fas fa-bookmark"></i> : <i className="far fa-bookmark"></i>}
        </div>
    );
};

export default PostSaveButton;