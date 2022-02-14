const PostLikedBy = (props) => {

    const { likedBy, likePost } = props;

    return (
        <div>
            {likedBy.length === 0 ?
            <span>Be the first to <span onClick={likePost} style={{fontWeight: 'bold', cursor: 'pointer'}}> like this</span>
            </span> :
            likedBy.length === 1 ? 
            <span className="post-post-liked-by">{likedBy.length} like</span> :
            <span className="post-post-liked-by">{likedBy.length} likes</span>}
        </div>
    );
};

export default PostLikedBy;