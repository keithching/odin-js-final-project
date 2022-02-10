import { formatDistanceToNowStrict, parseISO } from 'date-fns';

const PostTimeLapsed = (props) => {
    const { time } = props;

    return (
        <div className="post-post-time-lapsed">
            {formatDistanceToNowStrict(parseISO(time))}
        </div>
    );
};

export default PostTimeLapsed;