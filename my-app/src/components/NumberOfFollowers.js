const NumberOfFollowers = (props) => {
    
    const { followers } = props;

    const style = {
        fontWeight: 'bold'
    };
    
    return (
        <div>
            <span style={style}>{followers.length}</span>
            {' '} {followers.length <= 1 ? 'follower' : 'followers'}
        </div>
    );
}

export default NumberOfFollowers;
