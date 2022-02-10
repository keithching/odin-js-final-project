const CommentContent = (props) => {
    
    const { content } = props;
    
    return (
        <div className="post-comment">
            {content}
        </div>
    );
};

export default CommentContent;