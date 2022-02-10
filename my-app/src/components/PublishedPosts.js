const PublishedPosts = (props) => {
    
    const { published } = props;

    const style = {
        fontWeight: 'bold'
    };

    return (
        <div>
            <span style={style}>{published.length}</span>
            {' '} {published.length <= 1 ? 'post' : 'posts'}
        </div>
    );
}

export default PublishedPosts;
