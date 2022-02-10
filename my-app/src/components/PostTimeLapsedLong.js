import { formatDistanceToNowStrict, parseISO } from 'date-fns';

const PostTimeLapsedLong = (props) => {
    const { time } = props;

    return (
        <div className="post-post-time-lapsed">
            {formatDistanceToNowStrict(parseISO(time), { addSuffix: true }).toUpperCase()}
        </div>
    );
};

export default PostTimeLapsedLong;