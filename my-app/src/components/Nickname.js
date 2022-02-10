const Nickname = (props) => {
    const { nickname } = props;

    const style = {
        fontWeight: 'bold'
    };

    return (
        <div style={style}>
            {nickname || 'default'}
        </div>
    );
}

export default Nickname;
