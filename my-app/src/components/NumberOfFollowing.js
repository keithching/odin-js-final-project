const NumberOfFollowing = (props) => {

    const { following } = props;

    const style = {
        fontWeight: 'bold'
    };

    return (
        <div>
            <span style={style}>{following.length}</span>
            {' '} following
        </div>
    );
}

export default NumberOfFollowing;
